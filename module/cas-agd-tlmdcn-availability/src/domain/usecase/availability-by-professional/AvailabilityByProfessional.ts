import { config } from "@/domain/config";
import { MedicapBookingRepository } from "@/domain/repository/MedicapBookingRepository";
import { MedicapCalendarRepository } from "@/domain/repository/MedicapCalendarRepository";
import { MedicapExceptionRepository } from "@/domain/repository/MedicapExceptionRepository";
import { inject, injectable } from "tsyringe";
import { AvailabilityByProfessionalRequest } from "./AvailabilityByProfessionalRequest";
import { AvailabilityByProfessionalResponse } from "./AvailabilityByProfessionalResponse";
import { ExceptionBlock, getExcepcionBlocks } from "./get-exception-blocks";
import { CalendarBlock, getCaledarBlocks } from "./get-calendar-blocks";
import { dayjs } from "@/domain/service/date";

@injectable()
export class AvailabilityByProfessional {
  constructor(
    @inject("MedicapCalendarRepository")
    private calendarRepository: MedicapCalendarRepository,

    @inject("MedicapExceptionRepository")
    private exceptionRepository: MedicapExceptionRepository,

    @inject("MedicapBookingRepository")
    private bookingRepository: MedicapBookingRepository
  ) {}

  async execute(
    request: AvailabilityByProfessionalRequest
  ): Promise<AvailabilityByProfessionalResponse> {
    const maxEndDateLocal = "2022-11-05";

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

    console.log("bookings length", bookings.length);

    let exceptionBlocks: ExceptionBlock[] = [];
    for (const exception of exceptions) {
      exceptionBlocks = exceptionBlocks.concat(
        getExcepcionBlocks({
          startDate: exception.startDate,
          endDate: exception.endDate,
          recurrence: exception.recurrence,
          repeatRecurrenceEvery: exception.repeatRecurrenceEvery,
          dayOfMonth: exception.dayOfMonth,
          weekOfMonth: exception.weekOfMonth,
          dayOfWeek: exception.dayOfWeek,
          days: exception.days,
        })
      );
    }

    let calendarBlocks: CalendarBlock[] = [];
    for (const calendar of calendars) {
      const calendarEndDate =
        calendar.endDate > maxEndDateLocal ? maxEndDateLocal : calendar.endDate;

      calendarBlocks = calendarBlocks.concat(
        getCaledarBlocks({
          startDate: calendar.startDate,
          endDate: calendarEndDate,
          blockDurationInMinutes: calendar.blockDurationInMinutes,
          days: calendar.days,
          shouldDisableBlock: (block) => {
            for (const exceptionBlock of exceptionBlocks) {
              const isStartDateInRange =
                block.startDate.local >= exceptionBlock.localStartDate &&
                block.startDate.local < exceptionBlock.localEndDate;

              const isEndDateInRange =
                block.endDate.local >= exceptionBlock.localStartDate &&
                block.endDate.local < exceptionBlock.localEndDate;

              if (isStartDateInRange || isEndDateInRange) {
                return true;
              }
            }

            for (const booking of bookings) {
              const bookignStartDate = booking.date;
              const bookingEndDate = dayjs
                .utc(booking.date)
                .add(booking.blockDurationInMinutes, "minutes")
                .format("YYYY-MM-DDTHH:mm:ss");

              const isStartDateInRange =
                block.startDate.local >= bookignStartDate &&
                block.startDate.local < bookingEndDate;

              const isEndDateInRange =
                block.endDate.local >= bookignStartDate &&
                block.endDate.local < bookingEndDate;

              if (isStartDateInRange || isEndDateInRange) {
                return true;
              }
            }

            return false;
          },
        })
      );
    }

    return {
      blocks: calendarBlocks,
    };
  }
}
