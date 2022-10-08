import { inject, injectable } from "tsyringe";
import { MedicapBookingRepository } from "../../repository/MedicapBookingRepository";
import { SyncMedicapBookingRequest } from "./SyncMedicapBookingRequest";

@injectable()
export class SyncMedicapBooking {
  constructor(
    @inject("MedicapBookingRepository")
    private medicapBookingRepository: MedicapBookingRepository
  ) {}

  async execute(request: SyncMedicapBookingRequest) {
    const booking = await this.medicapBookingRepository.findById(request.id);

    console.log("sleep", request.id, request.updatedAt);
    await new Promise((resolve) => setTimeout(resolve, 10000));

    if (booking == null) {
      console.log("crear!!!!", request.id, request.updatedAt);
      await this.medicapBookingRepository.create({
        id: request.id,
        date: request.date,
        companyId: request.companyId,
        officeId: request.officeId,
        serviceId: request.serviceId,
        professionalId: request.professionalId,
        patientId: request.patientId,
        calendarId: request.calendarId,
        blockDurationInMinutes: request.blockDurationInMinutes,
        isEnabled: request.isEnabled,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
      });
    } else if (request.updatedAt > booking.updatedAt) {
      console.log("actualizar!!!!", request.id, request.updatedAt);
      await this.medicapBookingRepository.update({
        id: request.id,
        date: request.date,
        companyId: request.companyId,
        officeId: request.officeId,
        serviceId: request.serviceId,
        professionalId: request.professionalId,
        patientId: request.patientId,
        calendarId: request.calendarId,
        blockDurationInMinutes: request.blockDurationInMinutes,
        isEnabled: request.isEnabled,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
      });
    } else {
      console.log("nada!!!!", request.id, request.updatedAt);
    }
  }
}
