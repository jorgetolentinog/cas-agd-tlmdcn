import { CalcAvailabilityResponse } from "./CalcAvailabilityResponse";
import { getTimeBlocks } from "./get-time-blocks";

export class CalcAvailability {
  async execute(): Promise<CalcAvailabilityResponse> {
    const blocks = getTimeBlocks({
      startDate: "2022-08-03",
      endDate: "2022-08-10",
      blockDurationInMinutes: 20,
      recurrence: "weekly",
      repeatRecurrenceEvery: 1,
      days: [
        {
          dayOfWeek: 1,
          blocks: [
            {
              startTime: "09:00:00",
              endTime: "17:00:00",
            },
          ],
        },
      ],
    });

    return {
      blocks,
    };
  }
}
