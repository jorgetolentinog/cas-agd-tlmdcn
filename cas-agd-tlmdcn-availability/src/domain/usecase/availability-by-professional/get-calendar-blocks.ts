import { config } from "@/domain/config";
import { dayjs } from "@/domain/service/date";

export function getCaledarBlocks(options: Options): CalendarBlock[] {
  const blocks: CalendarBlock[] = [];

  let localStartDate = dayjs.utc(options.startDate);
  const localEndDate = dayjs.utc(options.endDate);

  while (localStartDate <= localEndDate) {
    for (const day of options.days) {
      if (day.dayOfWeek !== localStartDate.isoWeekday()) {
        continue;
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

          const localStartDateOffsetIsValid =
            isoLocalStartDateTime ===
            localStartDateTimeFromISO.format("YYYY-MM-DDTHH:mm:ss");

          if (localStartDateOffsetIsValid) {
            const block: CalendarBlock = {
              durationInMinutes: options.blockDurationInMinutes,
              offset: localStartDateTimeFromISO.format("Z"),
              startDate: {
                local: localStartDateTimeFromISO.format("YYYY-MM-DDTHH:mm:ss"),
                utc: localStartDateTimeFromISO.utc().toISOString(),
              },
              endDate: {
                local: localBlockEndDateTimeFromISO.format(
                  "YYYY-MM-DDTHH:mm:ss"
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

    localStartDate = localStartDate.add(1, "day");
  }

  return blocks;
}

export interface Options {
  startDate: string;
  endDate: string;
  blockDurationInMinutes: number;
  days: {
    dayOfWeek: number;
    blocks: { startTime: string; endTime: string }[];
  }[];
  shouldDisableBlock?: (block: CalendarBlock) => boolean;
}

export interface CalendarBlock {
  durationInMinutes: number;
  offset: string;
  startDate: {
    local: string;
    utc: string;
  };
  endDate: {
    local: string;
    utc: string;
  };
}
