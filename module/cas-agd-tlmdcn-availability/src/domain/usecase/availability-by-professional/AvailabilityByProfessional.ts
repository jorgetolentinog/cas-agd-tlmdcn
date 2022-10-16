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
import { MedicapException } from "@/domain/schema/MedicapException";
import { MedicapBooking } from "@/domain/schema/MedicapBooking";
import { MedicapPreBookingRepository } from "@/domain/repository/MedicapPreBookingRepository";
import { MedicapPreBooking } from "@/domain/schema/MedicapPreBooking";

@injectable()
export class AvailabilityByProfessional {
  constructor(
    @inject("MedicapCalendarRepository")
    private calendarRepository: MedicapCalendarRepository,

    @inject("MedicapExceptionRepository")
    private exceptionRepository: MedicapExceptionRepository,

    @inject("MedicapBookingRepository")
    private bookingRepository: MedicapBookingRepository,

    @inject("MedicapPreBookingRepository")
    private preBookingRepository: MedicapPreBookingRepository
  ) {}

  async execute(
    request: AvailabilityByProfessionalRequest
  ): Promise<AvailabilityByProfessionalResponse> {
    const maxEndDateLocal = "2022-11-05";

    const calendars = await this.getCalendars(
      request.professionalId,
      request.startDate,
      request.endDate
    );

    const exceptions = await this.getExceptions(
      request.professionalId,
      request.startDate,
      request.endDate
    );

    const bookings = await this.getBookings(
      request.professionalId,
      request.startDate,
      request.endDate
    );

    const preBookings = await this.getPreBookings(
      request.professionalId,
      request.startDate,
      request.endDate
    );

    const exceptionBlocks = this.getExceptionBlocks(exceptions);

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
          isShouldDisableBlock: (block) => {
            if (this.isBlockDisabledByException(block, exceptionBlocks)) {
              return true;
            }

            if (this.isBlockDisabledByBooking(block, bookings)) {
              return true;
            }

            if (this.isBlockDisabledByPreBooking(block, preBookings)) {
              return true;
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

  async getCalendars(
    professionalId: string,
    startDate: string,
    endDate: string
  ) {
    return await this.calendarRepository.findByProfessionalAndDateRange({
      companyId: config.telemedicine.companyId,
      officeId: config.telemedicine.officeId,
      serviceId: config.telemedicine.serviceId,
      professionalId: professionalId,
      isEnabled: true,
      startDate: startDate,
      endDate: endDate,
    });
  }

  async getExceptions(
    professionalId: string,
    startDate: string,
    endDate: string
  ) {
    return await this.exceptionRepository.findByProfessionalAndDateRange({
      serviceId: config.telemedicine.serviceId,
      professionalId: professionalId,
      isEnabled: true,
      startDate: startDate,
      endDate: endDate,
    });
  }

  async getBookings(
    professionalId: string,
    startDate: string,
    endDate: string
  ) {
    return await this.bookingRepository.findByProfessionalAndDateRange({
      companyId: config.telemedicine.companyId,
      officeId: config.telemedicine.officeId,
      serviceId: config.telemedicine.serviceId,
      professionalId: professionalId,
      isEnabled: true,
      startDate: startDate + "T00:00:00",
      endDate: endDate + "T23:59:59",
    });
  }

  async getPreBookings(
    professionalId: string,
    startDate: string,
    endDate: string
  ) {
    return await this.preBookingRepository.findByProfessionalAndDateRange({
      companyId: config.telemedicine.companyId,
      officeId: config.telemedicine.officeId,
      serviceId: config.telemedicine.serviceId,
      professionalId: professionalId,
      isEnabled: true,
      startDate: startDate + "T00:00:00",
      endDate: endDate + "T23:59:59",
    });
  }

  getExceptionBlocks(exceptions: MedicapException[]) {
    let blocks: ExceptionBlock[] = [];
    for (const exception of exceptions) {
      blocks = blocks.concat(
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
    return blocks;
  }

  isBlockDisabledByException(
    block: CalendarBlock,
    exceptionBlocks: ExceptionBlock[]
  ) {
    for (const exceptionBlock of exceptionBlocks) {
      if (
        this.isCollidedBlock({
          freeBlock: {
            startDate: block.startDate,
            endDate: block.endDate,
          },
          colissionBlock: {
            startDate: exceptionBlock.startDate,
            endDate: exceptionBlock.endDate,
          },
        })
      ) {
        return true;
      }
    }
  }

  isBlockDisabledByBooking(block: CalendarBlock, bookings: MedicapBooking[]) {
    for (const booking of bookings) {
      const bookignStartDate = booking.date;
      const bookingEndDate = dayjs
        .utc(booking.date)
        .add(booking.blockDurationInMinutes, "minutes")
        .format("YYYY-MM-DDTHH:mm:ss");

      if (
        this.isCollidedBlock({
          freeBlock: {
            startDate: block.startDate,
            endDate: block.endDate,
          },
          colissionBlock: {
            startDate: bookignStartDate,
            endDate: bookingEndDate,
          },
        })
      ) {
        return true;
      }
    }
  }

  isBlockDisabledByPreBooking(
    block: CalendarBlock,
    preBookings: MedicapPreBooking[]
  ) {
    for (const preBooking of preBookings) {
      const bookignStartDate = preBooking.date;
      const bookingEndDate = dayjs
        .utc(preBooking.date)
        .add(preBooking.blockDurationInMinutes, "minutes")
        .format("YYYY-MM-DDTHH:mm:ss");

      if (
        this.isCollidedBlock({
          freeBlock: {
            startDate: block.startDate,
            endDate: block.endDate,
          },
          colissionBlock: {
            startDate: bookignStartDate,
            endDate: bookingEndDate,
          },
        })
      ) {
        return true;
      }
    }
  }

  isCollidedBlock(props: {
    freeBlock: { startDate: string; endDate: string };
    colissionBlock: {
      startDate: string;
      endDate: string;
    };
  }) {
    const isBlockInside =
      props.freeBlock.startDate <= props.colissionBlock.startDate &&
      props.freeBlock.endDate >= props.colissionBlock.endDate;

    const isStartBlockInside =
      props.freeBlock.startDate >= props.colissionBlock.startDate &&
      props.freeBlock.startDate < props.colissionBlock.endDate;

    const isEndBlockInside =
      props.freeBlock.endDate > props.colissionBlock.startDate &&
      props.freeBlock.endDate < props.colissionBlock.endDate;

    return isBlockInside || isStartBlockInside || isEndBlockInside;
  }
}
