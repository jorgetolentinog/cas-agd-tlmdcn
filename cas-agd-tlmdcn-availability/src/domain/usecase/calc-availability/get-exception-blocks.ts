import { dayjs } from "@/domain/service/date";

export function getExcepcionBlocks(options: Options): ExceptionBlock[] {
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

  const blocks: ExceptionBlock[] = [];

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
        const blockDate = localStartDate.format("YYYY-MM-DD");
        blocks.push({
          localStartDate: blockDate + "T" + block.startTime,
          localEndDate: blockDate + "T" + block.endTime,
        });
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

interface Options {
  startDate: string;
  endDate: string;
  recurrence: "weekly" | "monthly";
  repeatRecurrenceEvery: number;
  dayOfMonth?: number;
  weekOfMonth?: number;
  dayOfWeek?: number;
  days: {
    dayOfWeek?: number;
    blocks: { startTime: string; endTime: string }[];
  }[];
}

export interface ExceptionBlock {
  localStartDate: string;
  localEndDate: string;
}
