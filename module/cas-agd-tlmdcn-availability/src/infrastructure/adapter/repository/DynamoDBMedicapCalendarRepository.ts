import { MedicapCalendarRepository } from "@/domain/repository/MedicapCalendarRepository";
import { MedicapCalendar } from "@/domain/schema/MedicapCalendar";
import { injectable } from "tsyringe";
import { DynamoDBDocument } from "@/infrastructure/aws/dynamodb/DynamoDBDocument";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

@injectable()
export class DynamoDBMedicapCalendarRepository
  implements MedicapCalendarRepository
{
  private readonly _table = process.env.DYNAMODB_TABLE ?? "DynamoDBTable";

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
          _pk: `medicapCalendar#${calendar.id}`,
          _sk: `medicapCalendar#${calendar.id}`,
          _gsi1pk: `medicapCalendar#companyId#${calendar.companyId}#office#${calendar.officeId}#service#${calendar.serviceId}#professionalId#${calendar.professionalId}#isEnabled#${calendar.isEnabled}`,
          _gsi1sk: calendar.endDate,
        },
        ExpressionAttributeNames: {
          "#_pk": "_pk",
          "#_sk": "_sk",
        },
        ConditionExpression:
          "attribute_not_exists(#_pk) and attribute_not_exists(#_sk)",
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
      _gsi1pk: `medicapCalendar#companyId#${calendar.companyId}#office#${calendar.officeId}#service#${calendar.serviceId}#professionalId#${calendar.professionalId}#isEnabled#${calendar.isEnabled}`,
      _gsi1sk: calendar.endDate,
    };

    let updateExpression = "set ";
    const expressionAttributeNames: Record<string, string> = {
      "#_pk": "_pk",
      "#_sk": "_sk",
    };
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
          _pk: `medicapCalendar#${calendar.id}`,
          _sk: `medicapCalendar#${calendar.id}`,
        },
        UpdateExpression: updateExpression,
        ConditionExpression:
          "attribute_exists(#_pk) and attribute_exists(#_sk) and #updatedAt < :updatedAt",
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
          ":_pk": `medicapCalendar#${calendarId}`,
          ":_sk": `medicapCalendar#${calendarId}`,
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

  async findByProfessionalAndDateRange(props: {
    companyId: string;
    officeId: string;
    serviceId: string;
    professionalId: string;
    isEnabled: boolean;
    startDate: string;
    endDate: string;
  }): Promise<MedicapCalendar[]> {
    const query: DocumentClient.QueryInput = {
      TableName: this._table,
      IndexName: "gsi1",
      KeyConditionExpression: "#_gsi1pk = :_gsi1pk and #_gsi1sk >= :_gsi1sk",
      ExpressionAttributeNames: {
        "#_gsi1pk": "_gsi1pk",
        "#_gsi1sk": "_gsi1sk",
      },
      ExpressionAttributeValues: {
        ":_gsi1pk": `medicapCalendar#companyId#${props.companyId}#office#${props.officeId}#service#${props.serviceId}#professionalId#${props.professionalId}#isEnabled#${props.isEnabled}`,
        ":_gsi1sk": props.startDate,
      },
    };

    const items: DocumentClient.AttributeMap[] = [];
    let queryResult;

    do {
      queryResult = await this.dynamodb.client.query(query).promise();
      queryResult.Items?.forEach((item) => {
        if (item.startDate <= props.endDate) {
          items.push(item);
        }
      });
      query.ExclusiveStartKey = queryResult.LastEvaluatedKey;
    } while (query.ExclusiveStartKey != null);

    return items.map((item) => ({
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
    }));
  }
}
