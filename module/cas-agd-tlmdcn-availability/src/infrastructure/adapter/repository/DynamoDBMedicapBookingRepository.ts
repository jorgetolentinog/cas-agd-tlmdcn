import { MedicapBookingRepository } from "@/domain/repository/MedicapBookingRepository";
import { MedicapBooking } from "@/domain/schema/MedicapBooking";
import { injectable } from "tsyringe";
import { DynamoDBDocument } from "@/infrastructure/aws/DynamoDBDocument";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

@injectable()
export class DynamoDBMedicapBookingRepository
  implements MedicapBookingRepository
{
  private readonly _table = process.env.DYNAMODB_TABLE ?? "DynamoDBTable";

  constructor(private readonly dynamodb: DynamoDBDocument) {}

  async create(booking: MedicapBooking): Promise<void> {
    await this.dynamodb.client
      .put({
        TableName: this._table,
        Item: {
          id: booking.id,
          date: booking.date,
          companyId: booking.companyId,
          officeId: booking.officeId,
          serviceId: booking.serviceId,
          professionalId: booking.professionalId,
          patientId: booking.patientId,
          calendarId: booking.calendarId,
          blockDurationInMinutes: booking.blockDurationInMinutes,
          isEnabled: booking.isEnabled,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt,

          // Interno
          _pk: `medicap-booking#${booking.id}`,
          _sk: `medicap-booking#${booking.id}`,
          _gsi1pk: `medicap-booking#companyId#${booking.companyId}#officeId#${booking.officeId}#serviceId#${booking.serviceId}#professionalId#${booking.professionalId}#isEnabled#${booking.isEnabled}`,
          _gsi1sk: booking.date,
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

  async update(booking: MedicapBooking): Promise<void> {
    const attrs = {
      date: booking.date,
      companyId: booking.companyId,
      officeId: booking.officeId,
      serviceId: booking.serviceId,
      professionalId: booking.professionalId,
      patientId: booking.patientId,
      calendarId: booking.calendarId,
      blockDurationInMinutes: booking.blockDurationInMinutes,
      isEnabled: booking.isEnabled,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,

      // Interno
      _gsi1pk: `medicap-booking#companyId#${booking.companyId}#officeId#${booking.officeId}#serviceId#${booking.serviceId}#professionalId#${booking.professionalId}#isEnabled#${booking.isEnabled}`,
      _gsi1sk: booking.date,
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
          _pk: `medicap-booking#${booking.id}`,
          _sk: `medicap-booking#${booking.id}`,
        },
        UpdateExpression: updateExpression,
        ConditionExpression:
          "attribute_exists(#_pk) and attribute_exists(#_sk) and #updatedAt < :updatedAt",
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
      })
      .promise();
  }

  async findById(bookingId: string): Promise<MedicapBooking | null> {
    const result = await this.dynamodb.client
      .query({
        TableName: this._table,
        KeyConditionExpression: "#_pk = :_pk and #_sk = :_sk",
        ExpressionAttributeNames: { "#_pk": "_pk", "#_sk": "_sk" },
        ExpressionAttributeValues: {
          ":_pk": `medicap-booking#${bookingId}`,
          ":_sk": `medicap-booking#${bookingId}`,
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
      patientId: item.patientId,
      calendarId: item.calendarId,
      isEnabled: item.isEnabled,
      blockDurationInMinutes: item.blockDurationInMinutes,
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
  }): Promise<MedicapBooking[]> {
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
        ":_gsi1pk": `medicap-booking#companyId#${props.companyId}#officeId#${props.officeId}#serviceId#${props.serviceId}#professionalId#${props.professionalId}#isEnabled#${props.isEnabled}`,
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
