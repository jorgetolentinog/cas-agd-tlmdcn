import { MedicapExceptionRepository } from "@/domain/repository/MedicapExceptionRepository";
import { MedicapException } from "@/domain/schema/MedicapException";
import { injectable } from "tsyringe";
import { DynamoDB } from "../DynamoDB";

@injectable()
export class DynamoDBMedicapExceptionRepository
  implements MedicapExceptionRepository
{
  private readonly _table =
    process.env.DYNAMODB_TABLE_MEDICAP_EXCEPTION ?? "MedicapExceptionTable";

  constructor(private readonly dynamodb: DynamoDB) {}

  async create(exception: MedicapException): Promise<void> {
    await this.dynamodb.client
      .put({
        TableName: this._table,
        Item: {
          id: exception.id,
          startDate: exception.startDate,
          endDate: exception.endDate,
          isEnabled: exception.isEnabled,
          recurrence: exception.recurrence,
          repeatRecurrenceEvery: exception.repeatRecurrenceEvery,
          professionalIds: exception.professionalIds,
          serviceIds: exception.serviceIds,
          dayOfMonth: exception.dayOfMonth,
          weekOfMonth: exception.weekOfMonth,
          dayOfWeek: exception.dayOfWeek,
          days: exception.days,
          createdAt: exception.createdAt,
          updatedAt: exception.updatedAt,
        },
        ConditionExpression: "attribute_not_exists(id)",
      })
      .promise();
  }

  async update(exception: MedicapException): Promise<void> {
    const attrs = {
      startDate: exception.startDate,
      endDate: exception.endDate,
      isEnabled: exception.isEnabled,
      recurrence: exception.recurrence,
      repeatRecurrenceEvery: exception.repeatRecurrenceEvery,
      professionalIds: exception.professionalIds,
      serviceIds: exception.serviceIds,
      dayOfMonth: exception.dayOfMonth,
      weekOfMonth: exception.weekOfMonth,
      dayOfWeek: exception.dayOfWeek,
      days: exception.days,
      createdAt: exception.createdAt,
      updatedAt: exception.updatedAt,
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
          id: exception.id,
        },
        UpdateExpression: updateExpression,
        ConditionExpression: "attribute_exists(id) and #updatedAt < :updatedAt",
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
      })
      .promise();
  }

  async findById(exceptionId: string): Promise<MedicapException | null> {
    const result = await this.dynamodb.client
      .query({
        TableName: this._table,
        KeyConditionExpression: "#id = :id",
        ExpressionAttributeNames: { "#id": "id" },
        ExpressionAttributeValues: {
          ":id": exceptionId,
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
      recurrence: item.recurrence,
      repeatRecurrenceEvery: item.repeatRecurrenceEvery,
      professionalIds: item.professionalIds,
      serviceIds: item.serviceIds,
      dayOfMonth: item.dayOfMonth,
      weekOfMonth: item.weekOfMonth,
      dayOfWeek: item.dayOfWeek,
      days: item.days,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}
