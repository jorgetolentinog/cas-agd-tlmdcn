import { MedicapCalendarRepository } from "@/domain/repository/MedicapCalendarRepository";
import { inject, injectable } from "tsyringe";
import { SyncMedicapCalendarRequest } from "./SyncMedicapCalendarRequest";

@injectable()
export class SyncMedicapCalendar {
  constructor(
    @inject("MedicapCalendarRepository")
    private medicapCalendarRepository: MedicapCalendarRepository
  ) {}

  async execute(request: SyncMedicapCalendarRequest) {
    const calendar = await this.medicapCalendarRepository.findById(request.id);

    if (calendar == null) {
      await this.medicapCalendarRepository.create({
        id: request.id,
        startDate: request.startDate,
        endDate: request.endDate,
        isEnabled: request.isEnabled,
        companyId: request.companyId,
        officeId: request.officeId,
        serviceId: request.serviceId,
        medicalAreaIds: request.medicalAreaIds,
        interestAreaIds: request.interestAreaIds,
        professionalId: request.professionalId,
        blockDurationInMinutes: request.blockDurationInMinutes,
        conditionOfService: request.conditionOfService,
        days: request.days,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
      });
    } else if (request.updatedAt > calendar.updatedAt) {
      await this.medicapCalendarRepository.update({
        id: request.id,
        startDate: request.startDate,
        endDate: request.endDate,
        isEnabled: request.isEnabled,
        companyId: request.companyId,
        officeId: request.officeId,
        serviceId: request.serviceId,
        medicalAreaIds: request.medicalAreaIds,
        interestAreaIds: request.interestAreaIds,
        professionalId: request.professionalId,
        blockDurationInMinutes: request.blockDurationInMinutes,
        conditionOfService: request.conditionOfService,
        days: request.days,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
      });
    }
  }
}
