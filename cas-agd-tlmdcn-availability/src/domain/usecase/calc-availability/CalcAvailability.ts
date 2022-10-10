import { config } from "@/domain/config";
import { MedicapBookingRepository } from "@/domain/repository/MedicapBookingRepository";
import { MedicapCalendarRepository } from "@/domain/repository/MedicapCalendarRepository";
import { MedicapExceptionRepository } from "@/domain/repository/MedicapExceptionRepository";
import { inject, injectable } from "tsyringe";
import { CalcAvailabilityRequest } from "./CalcAvailabilityRequest";
import { CalcAvailabilityResponse } from "./CalcAvailabilityResponse";
import { getTimeBlocks, TimeBlock } from "./get-time-blocks";

@injectable()
export class CalcAvailability {
  constructor(
    @inject("MedicapCalendarRepository")
    private calendarRepository: MedicapCalendarRepository,

    @inject("MedicapExceptionRepository")
    private exceptionRepository: MedicapExceptionRepository,

    @inject("MedicapBookingRepository")
    private bookingRepository: MedicapBookingRepository
  ) {}

  async execute(
    request: CalcAvailabilityRequest
  ): Promise<CalcAvailabilityResponse> {
    const calendars =
      await this.calendarRepository.findByProfessionalAndDateRange({
        companyId: config.telemedicine.companyId,
        officeId: config.telemedicine.officeId,
        serviceId: config.telemedicine.serviceId,
        professionalId: request.professionalId,
        isEnabled: true,
        startDate: request.startDate,
        endDate: request.endDate,
      });

    const exceptions =
      await this.exceptionRepository.findByProfessionalAndDateRange({
        serviceId: config.telemedicine.serviceId,
        professionalId: request.professionalId,
        isEnabled: true,
        startDate: request.startDate,
        endDate: request.endDate,
      });

    const bookings =
      await this.bookingRepository.findByProfessionalAndDateRange({
        companyId: config.telemedicine.companyId,
        officeId: config.telemedicine.officeId,
        serviceId: config.telemedicine.serviceId,
        professionalId: request.professionalId,
        isEnabled: true,
        startDate: request.startDate + "T00:00:00",
        endDate: request.endDate + "T23:59:59",
      });

    console.log({ exceptions: exceptions.length, bookings: bookings.length });

    let calendarBlocks: TimeBlock[] = [];
    for (const calendar of calendars) {
      calendarBlocks = calendarBlocks.concat(
        getTimeBlocks({
          startDate: calendar.startDate,
          endDate: calendar.endDate,
          blockDurationInMinutes: calendar.blockDurationInMinutes,
          recurrence: "weekly",
          repeatRecurrenceEvery: 1,
          days: calendar.days,
        })
      );
    }

    return {
      blocks: calendarBlocks,
    };
  }
}
