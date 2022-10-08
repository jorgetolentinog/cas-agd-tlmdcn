import { MedicapBookingRepository } from "@/domain/repository/MedicapBookingRepository";
import { MedicapBooking } from "@/domain/schema/MedicapBooking";
import { injectable } from "tsyringe";
import { DynamoDB } from "../DynamoDB";

@injectable()
export class DynamoDBMedicapBookingRepository
  implements MedicapBookingRepository
{
  private readonly _table =
    process.env.DYNAMODB_TABLE_MEDICAP_BOOKING ?? "MedicapBookingTable";

  constructor(private readonly dynamodb: DynamoDB) {}

  async save(booking: MedicapBooking): Promise<void> {
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
        },
      })
      .promise();
  }

  async findById(bookingId: string): Promise<MedicapBooking | null> {
    const result = await this.dynamodb.client
      .query({
        TableName: this._table,
        KeyConditionExpression: "#id = :id",
        ExpressionAttributeNames: { "#id": "id" },
        ExpressionAttributeValues: {
          ":id": bookingId,
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
}
