import { config } from "@/domain/config";
import { dayjs } from "@/domain/service/date";

export function getTimeBlocks(options: Options): TimeBlock[] {
  if (options.recurrence === "monthly") {
    if (
      options.dayOfMonth == null &&
      options.weekOfMonth == null &&
      options.dayOfWeek == null
    ) {
      throw new Error(
        "Monthly recurrence requires specifying day of month or week of month or day of week"
      );
    }
  }

  if (options.recurrence === "weekly") {
    if (
      options.dayOfMonth != null ||
      options.weekOfMonth != null ||
      options.dayOfWeek != null
    ) {
      throw new Error(
        "Week recurrence does not require specifying day of month or week of month or day of week"
      );
    }
  }

  const blocks: TimeBlock[] = [];

  let localStartDate = dayjs.utc(options.startDate);
  const localEndDate = dayjs.utc(options.endDate);

  while (localStartDate <= localEndDate) {
    for (const day of options.days) {
      if (options.recurrence === "weekly") {
        if (day.dayOfWeek == null) {
          throw new Error(
            "Day of week of the block is required when recurrence is weekly"
          );
        }

        if (day.dayOfWeek !== localStartDate.isoWeekday()) {
          continue;
        }
      } else if (options.recurrence === "monthly") {
        if (day.dayOfWeek != null) {
          throw new Error(
            "Day of week of the block should be null when the recurrence is monthly"
          );
        }

        if (options.dayOfMonth != null) {
          if (localStartDate.date() !== options.dayOfMonth) {
            continue;
          }
        }

        if (options.dayOfWeek != null) {
          if (localStartDate.isoWeekday() !== options.dayOfWeek) {
            continue;
          }
        }

        if (options.weekOfMonth != null) {
          const weekOfMonth =
            localStartDate.isoWeek() -
            localStartDate.startOf("month").isoWeek();

          if (weekOfMonth !== options.weekOfMonth - 1) {
            continue;
          }
        }
      }

      for (const block of day.blocks) {
        const startTime = dayjs.tz(
          block.startTime,
          "HH:mm:ss",
          config.timezone
        );
        const endTime = dayjs.tz(block.endTime, "HH:mm:ss", config.timezone);

        let localStartDateTime = localStartDate.add(
          startTime.diff(startTime.startOf("day"))
        );
        const localEndDateTime = localStartDate.add(
          endTime.diff(endTime.startOf("day"))
        );

        while (localStartDateTime <= localEndDateTime) {
          const localBlockEndDateTime = localStartDateTime
            .add(options.blockDurationInMinutes, "minute")
            .add(-1, "second");

          const isBlockInRange = localEndDateTime >= localBlockEndDateTime;
          if (!isBlockInRange) {
            break;
          }

          const isoLocalStartDateTime = localStartDateTime.format(
            "YYYY-MM-DDTHH:mm:ss"
          );
          const isoLocalBlockEndDateTime = localBlockEndDateTime.format(
            "YYYY-MM-DDTHH:mm:ss"
          );

          const localStartDateTimeFromISO = dayjs.tz(
            isoLocalStartDateTime,
            config.timezone
          );

          const localBlockEndDateTimeFromISO = dayjs.tz(
            isoLocalBlockEndDateTime,
            config.timezone
          );

          const localStartDateTimeIsValid =
            isoLocalStartDateTime ===
            localStartDateTimeFromISO.format("YYYY-MM-DDTHH:mm:ss");

          if (localStartDateTimeIsValid) {
            const block = {
              durationInMinutes: options.blockDurationInMinutes,
              start: {
                local: localStartDateTimeFromISO.format("YYYY-MM-DDTHH:mm:ssZ"),
                utc: localStartDateTimeFromISO.utc().toISOString(),
              },
              end: {
                local: localBlockEndDateTimeFromISO.format(
                  "YYYY-MM-DDTHH:mm:ssZ"
                ),
                utc: localBlockEndDateTimeFromISO.utc().toISOString(),
              },
            };

            let blockDisabled = false;
            if (options.shouldDisableBlock) {
              blockDisabled = options.shouldDisableBlock(block);
            }

            if (!blockDisabled) {
              blocks.push(block);
            }
          }

          localStartDateTime = localStartDateTime.add(
            options.blockDurationInMinutes,
            "minute"
          );
        }
      }
    }

    if (options.recurrence === "weekly") {
      if (localStartDate.isoWeekday() === 7) {
        localStartDate = localStartDate.add(
          options.repeatRecurrenceEvery - 1,
          "week"
        );
      }
    } else if (options.recurrence === "monthly") {
      if (localStartDate.date() === localStartDate.daysInMonth()) {
        localStartDate = localStartDate.add(
          options.repeatRecurrenceEvery - 1,
          "month"
        );
      }
    }

    localStartDate = localStartDate.add(1, "day");
  }

  return blocks;
}

export interface Options {
  startDate: string;
  endDate: string;
  blockDurationInMinutes: number;
  recurrence: "weekly" | "monthly";
  repeatRecurrenceEvery: number;
  dayOfMonth?: number;
  weekOfMonth?: number;
  dayOfWeek?: number;
  days: {
    dayOfWeek?: number;
    blocks: { startTime: string; endTime: string }[];
  }[];
  shouldDisableBlock?: (block: TimeBlock) => boolean;
}

export interface TimeBlock {
  durationInMinutes: number;
  start: {
    local: string;
    utc: string;
  };
  end: {
    local: string;
    utc: string;
  };
}
