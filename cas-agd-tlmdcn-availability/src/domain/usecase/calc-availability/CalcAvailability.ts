import { MedicapCalendarRepository } from "@/domain/repository/MedicapCalendarRepository";
import { inject, injectable } from "tsyringe";
import { CalcAvailabilityResponse } from "./CalcAvailabilityResponse";
import { getTimeBlocks, TimeBlock } from "./get-time-blocks";

@injectable()
export class CalcAvailability {
  constructor(
    @inject("MedicapCalendarRepository")
    private calendarRepository: MedicapCalendarRepository
  ) {}

  async execute(): Promise<CalcAvailabilityResponse> {
    const calendars =
      await this.calendarRepository.findByProfessionalAndDateRange({
        companyId: "2",
        officeId: "11",
        serviceId: "265",
        professionalId: "2048",
        isEnabled: true,
        startDate: "2022-10-06",
        endDate: "2022-11-10",
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
