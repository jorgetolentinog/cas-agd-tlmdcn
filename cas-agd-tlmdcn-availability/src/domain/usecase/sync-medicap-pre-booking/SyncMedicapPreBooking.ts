import { MedicapPreBookingRepository } from "@/domain/repository/MedicapPreBookingRepository";
import { inject, injectable } from "tsyringe";
import { SyncMedicapPreBookingRequest } from "./SyncMedicapPreBookingRequest";

@injectable()
export class SyncMedicapPreBooking {
  constructor(
    @inject("MedicapPreBookingRepository")
    private medicapPreBookingRepository: MedicapPreBookingRepository
  ) {}

  async execute(request: SyncMedicapPreBookingRequest) {
    const booking = await this.medicapPreBookingRepository.findById(request.id);

    if (booking == null) {
      await this.medicapPreBookingRepository.create({
        id: request.id,
        date: request.date,
        companyId: request.companyId,
        officeId: request.officeId,
        serviceId: request.serviceId,
        professionalId: request.professionalId,
        calendarId: request.calendarId,
        blockDurationInMinutes: request.blockDurationInMinutes,
        isEnabled: request.isEnabled,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
      });
    } else if (request.updatedAt > booking.updatedAt) {
      await this.medicapPreBookingRepository.update({
        id: request.id,
        date: request.date,
        companyId: request.companyId,
        officeId: request.officeId,
        serviceId: request.serviceId,
        professionalId: request.professionalId,
        calendarId: request.calendarId,
        blockDurationInMinutes: request.blockDurationInMinutes,
        isEnabled: request.isEnabled,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
      });
    }
  }
}
