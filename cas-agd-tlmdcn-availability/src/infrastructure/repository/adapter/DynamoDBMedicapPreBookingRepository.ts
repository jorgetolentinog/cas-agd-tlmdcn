import { MedicapPreBookingRepository } from "@/domain/repository/MedicapPreBookingRepository";
import { MedicapPreBooking } from "@/domain/schema/MedicapPreBooking";
import { injectable } from "tsyringe";
import { DynamoDB } from "../DynamoDB";

@injectable()
export class DynamoDBMedicapPreBookingRepository
  implements MedicapPreBookingRepository
{
  private readonly _table =
    process.env.DYNAMODB_TABLE_MEDICAP_PRE_BOOKING ?? "MedicapPreBookingTable";

  constructor(private readonly dynamodb: DynamoDB) {}

  async create(preBooking: MedicapPreBooking): Promise<void> {
    await this.dynamodb.client
      .put({
        TableName: this._table,
        Item: {
          id: preBooking.id,
          date: preBooking.date,
          companyId: preBooking.companyId,
          officeId: preBooking.officeId,
          serviceId: preBooking.serviceId,
          professionalId: preBooking.professionalId,
          calendarId: preBooking.calendarId,
          blockDurationInMinutes: preBooking.blockDurationInMinutes,
          isEnabled: preBooking.isEnabled,
          createdAt: preBooking.createdAt,
          updatedAt: preBooking.updatedAt,
        },
        ConditionExpression: "attribute_not_exists(id)",
      })
      .promise();
  }

  async update(preBooking: MedicapPreBooking): Promise<void> {
    const attrs = {
      date: preBooking.date,
      companyId: preBooking.companyId,
      officeId: preBooking.officeId,
      serviceId: preBooking.serviceId,
      professionalId: preBooking.professionalId,
      calendarId: preBooking.calendarId,
      blockDurationInMinutes: preBooking.blockDurationInMinutes,
      isEnabled: preBooking.isEnabled,
      createdAt: preBooking.createdAt,
      updatedAt: preBooking.updatedAt,
    };

    let updateExpression = "set ";
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, unknown> = {};
    for (const prop in attrs) {
      updateExpression += ` #${prop} = :${prop},`;
      expressionAttributeNames[`#${prop}`] = prop;
      expressionAttributeValues[`:${prop}`] = (
        attrs as Record<string, unknown>
      )[prop];
    }
    updateExpression = updateExpression.slice(0, -1);

    await this.dynamodb.client
      .update({
        TableName: this._table,
        Key: {
          id: preBooking.id,
        },
        UpdateExpression: updateExpression,
        ConditionExpression: "attribute_exists(id) and #updatedAt < :updatedAt",
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
      })
      .promise();
  }

  async findById(preBookingId: string): Promise<MedicapPreBooking | null> {
    const result = await this.dynamodb.client
      .query({
        TableName: this._table,
        KeyConditionExpression: "#id = :id",
        ExpressionAttributeNames: { "#id": "id" },
        ExpressionAttributeValues: {
          ":id": preBookingId,
        },
      })
      .promise();

    const item = result.Items?.[0];
    if (item == null) {
      return null;
    }

    return {
      id: item.id,
      date: item.date,
      companyId: item.companyId,
      officeId: item.officeId,
      serviceId: item.serviceId,
      professionalId: item.professionalId,
      calendarId: item.calendarId,
      blockDurationInMinutes: item.blockDurationInMinutes,
      isEnabled: item.isEnabled,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}
