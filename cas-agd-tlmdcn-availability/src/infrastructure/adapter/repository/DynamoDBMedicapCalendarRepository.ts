import { MedicapCalendarRepository } from "@/domain/repository/MedicapCalendarRepository";
import { MedicapCalendar } from "@/domain/schema/MedicapCalendar";
import { injectable } from "tsyringe";
import { DynamoDBDocument } from "@/infrastructure/aws/DynamoDBDocument";

@injectable()
export class DynamoDBMedicapCalendarRepository
  implements MedicapCalendarRepository
{
  private readonly _table =
    process.env.DYNAMODB_TABLE_MEDICAP_CALENDAR ?? "MedicapCalendarTable";

  constructor(private readonly dynamodb: DynamoDBDocument) {}

  async create(calendar: MedicapCalendar): Promise<void> {
    await this.dynamodb.client
      .put({
        TableName: this._table,
        Item: {
          id: calendar.id,
          startDate: calendar.startDate,
          endDate: calendar.endDate,
          isEnabled: calendar.isEnabled,
          companyId: calendar.companyId,
          officeId: calendar.officeId,
          serviceId: calendar.serviceId,
          medicalAreaIds: calendar.medicalAreaIds,
          interestAreaIds: calendar.interestAreaIds,
          professionalId: calendar.professionalId,
          blockDurationInMinutes: calendar.blockDurationInMinutes,
          conditionsOfService: calendar.conditionsOfService,
          days: calendar.days,
          createdAt: calendar.createdAt,
          updatedAt: calendar.updatedAt,

          // Interno
          _pk: calendar.id,
          _sk: calendar.id,
          _gsi1pk: `${calendar.companyId}#${calendar.officeId}#${calendar.serviceId}#${calendar.professionalId}#${calendar.isEnabled}`,
          _gsi1sk: calendar.startDate,
        },
        ExpressionAttributeNames: {
          "#_pk": "_pk",
        },
        ConditionExpression: "attribute_not_exists(#_pk)",
      })
      .promise();
  }

  async update(calendar: MedicapCalendar): Promise<void> {
    const attrs = {
      startDate: calendar.startDate,
      endDate: calendar.endDate,
      isEnabled: calendar.isEnabled,
      companyId: calendar.companyId,
      officeId: calendar.officeId,
      serviceId: calendar.serviceId,
      medicalAreaIds: calendar.medicalAreaIds,
      interestAreaIds: calendar.interestAreaIds,
      professionalId: calendar.professionalId,
      blockDurationInMinutes: calendar.blockDurationInMinutes,
      conditionsOfService: calendar.conditionsOfService,
      days: calendar.days,
      createdAt: calendar.createdAt,
      updatedAt: calendar.updatedAt,

      // Interno
      _gsi1pk: `${calendar.companyId}#${calendar.officeId}#${calendar.serviceId}#${calendar.professionalId}#${calendar.isEnabled}`,
      _gsi1sk: calendar.startDate,
    };

    let updateExpression = "set ";
    const expressionAttributeNames: Record<string, string> = { "#_pk": "_pk" };
    const expressionAttributeValues: Record<string, unknown> = {};
    for (const prop in attrs) {
      const value = (attrs as Record<string, unknown>)[prop] ?? null;
      updateExpression += ` #${prop} = :${prop},`;
      expressionAttributeNames[`#${prop}`] = prop;
      expressionAttributeValues[`:${prop}`] = value;
    }
    updateExpression = updateExpression.slice(0, -1);

    await this.dynamodb.client
      .update({
        TableName: this._table,
        Key: {
          _pk: calendar.id,
          _sk: calendar.id,
        },
        UpdateExpression: updateExpression,
        ConditionExpression:
          "attribute_exists(#_pk) and #updatedAt < :updatedAt",
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
      })
      .promise();
  }

  async findById(calendarId: string): Promise<MedicapCalendar | null> {
    const result = await this.dynamodb.client
      .query({
        TableName: this._table,
        KeyConditionExpression: "#_pk = :_pk and #_sk = :_sk",
        ExpressionAttributeNames: { "#_pk": "_pk", "#_sk": "_sk" },
        ExpressionAttributeValues: {
          ":_pk": calendarId,
          ":_sk": calendarId,
        },
      })
      .promise();

    const item = result.Items?.[0];
    if (item == null) {
      return null;
    }

    return {
      id: item.id,
      startDate: item.startDate,
      endDate: item.endDate,
      isEnabled: item.isEnabled,
      companyId: item.companyId,
      officeId: item.officeId,
      serviceId: item.serviceId,
      medicalAreaIds: item.medicalAreaIds,
      interestAreaIds: item.interestAreaIds,
      professionalId: item.professionalId,
      blockDurationInMinutes: item.blockDurationInMinutes,
      conditionsOfService: item.conditionsOfService,
      days: item.days,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}
