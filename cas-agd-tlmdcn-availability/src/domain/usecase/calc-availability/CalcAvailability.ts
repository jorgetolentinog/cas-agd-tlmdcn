import { MedicapCalendarRepository } from "@/domain/repository/MedicapCalendarRepository";
import { inject, injectable } from "tsyringe";
import { CalcAvailabilityRequest } from "./CalcAvailabilityRequest";
import { CalcAvailabilityResponse } from "./CalcAvailabilityResponse";
import { getTimeBlocks, TimeBlock } from "./get-time-blocks";

@injectable()
export class CalcAvailability {
  constructor(
    @inject("MedicapCalendarRepository")
    private calendarRepository: MedicapCalendarRepository
  ) {}

  async execute(
    request: CalcAvailabilityRequest
  ): Promise<CalcAvailabilityResponse> {
    const calendars =
      await this.calendarRepository.findByProfessionalAndDateRange({
        companyId: "2",
        officeId: "11",
        serviceId: "265",
        professionalId: request.professionalId,
        isEnabled: true,
        startDate: request.startDate,
        endDate: request.endDate,
      });

    let blocks: TimeBlock[] = [];
    for (const calendar of calendars) {
      blocks = blocks.concat(
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
      blocks,
    };
  }
}
