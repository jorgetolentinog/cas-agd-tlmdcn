import { MedicapPreBookingRepository } from "@/domain/repository/MedicapPreBookingRepository";
import { MedicapPreBooking } from "@/domain/schema/MedicapPreBooking";
import { injectable } from "tsyringe";
import { DynamoDBDocument } from "@/infrastructure/aws/DynamoDBDocument";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

@injectable()
export class DynamoDBMedicapPreBookingRepository
  implements MedicapPreBookingRepository
{
  private readonly _table = process.env.DYNAMODB_TABLE ?? "DynamoDBTable";

  constructor(private readonly dynamodb: DynamoDBDocument) {}

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

          // Interno
          _pk: `medicapPreBooking#${preBooking.id}`,
          _sk: `medicapPreBooking#${preBooking.id}`,
          _gsi1pk: `medicapPreBooking#companyId${preBooking.companyId}#officeId#${preBooking.officeId}#serviceId#${preBooking.serviceId}#professionalId#${preBooking.professionalId}#isEnabled#${preBooking.isEnabled}`,
          _gsi1sk: preBooking.date,
        },
        ExpressionAttributeNames: {
          "#_pk": "_pk",
        },
        ConditionExpression: "attribute_not_exists(#_pk)",
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

      // Interno
      _gsi1pk: `medicapPreBooking#companyId${preBooking.companyId}#officeId#${preBooking.officeId}#serviceId#${preBooking.serviceId}#professionalId#${preBooking.professionalId}#isEnabled#${preBooking.isEnabled}`,
      _gsi1sk: preBooking.date,
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
          _pk: `medicapPreBooking#${preBooking.id}`,
          _sk: `medicapPreBooking#${preBooking.id}`,
        },
        UpdateExpression: updateExpression,
        ConditionExpression:
          "attribute_exists(#_pk) and attribute_exists(#_sk) and #updatedAt < :updatedAt",
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
      })
      .promise();
  }

  async findById(preBookingId: string): Promise<MedicapPreBooking | null> {
    const result = await this.dynamodb.client
      .query({
        TableName: this._table,
        KeyConditionExpression: "#_pk = :_pk and #_sk = :_sk",
        ExpressionAttributeNames: { "#_pk": "_pk", "#_sk": "_sk" },
        ExpressionAttributeValues: {
          ":_pk": `medicapPreBooking#${preBookingId}`,
          ":_sk": `medicapPreBooking#${preBookingId}`,
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

  async findByProfessionalAndDateRange(props: {
    companyId: string;
    officeId: string;
    serviceId: string;
    professionalId: string;
    isEnabled: boolean;
    startDate: string;
    endDate: string;
  }): Promise<MedicapPreBooking[]> {
    const query: DocumentClient.QueryInput = {
      TableName: this._table,
      IndexName: "gsi1",
      KeyConditionExpression:
        "#_gsi1pk = :_gsi1pk and #_gsi1sk between :_gsi1sk_startDate and :_gsi1sk_endDate",
      ExpressionAttributeNames: {
        "#_gsi1pk": "_gsi1pk",
        "#_gsi1sk": "_gsi1sk",
      },
      ExpressionAttributeValues: {
        ":_gsi1pk": `medicapPreBooking#companyId${props.companyId}#officeId#${props.officeId}#serviceId#${props.serviceId}#professionalId#${props.professionalId}#isEnabled#${props.isEnabled}`,
        ":_gsi1sk_startDate": props.startDate,
        ":_gsi1sk_endDate": props.endDate,
      },
    };

    const items: DocumentClient.AttributeMap[] = [];
    let queryResult;

    do {
      queryResult = await this.dynamodb.client.query(query).promise();
      queryResult.Items?.forEach((item) => items.push(item));
      query.ExclusiveStartKey = queryResult.LastEvaluatedKey;
    } while (query.ExclusiveStartKey != null);

    return items.map((item) => ({
      id: item.id,
      date: item.date,
      companyId: item.companyId,
      officeId: item.officeId,
      serviceId: item.serviceId,
      professionalId: item.professionalId,
      patientId: item.patientId,
      calendarId: item.calendarId,
      isEnabled: item.isEnabled,
      blockDurationInMinutes: item.blockDurationInMinutes,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
  }
}
