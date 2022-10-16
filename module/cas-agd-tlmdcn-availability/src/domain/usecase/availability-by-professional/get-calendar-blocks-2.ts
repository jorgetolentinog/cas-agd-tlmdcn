import { config } from "@/domain/config";
import { dayjs } from "@/domain/service/date";

export function getCaledarBlocks(options: CalendarOption): CalendarBlock[] {
  const blocks: CalendarBlock[] = [];
  const localDateTimeFormat = "YYYY-MM-DDTHH:mm:ss";

  let localStartDate = dayjs.utc(options.startDate);
  let localEndDate = dayjs.utc(options.endDate);

  while (localStartDate <= localEndDate) {
    const currentDate = localStartDate.clone();

    for (const day of options.days) {
      if (day.dayOfWeek !== currentDate.isoWeekday()) {
        continue;
      }

      for (const block of day.blocks) {
        let localStartDateTime = dayjs.utc(
          currentDate.format("YYYY-MM-DD") + " " + block.startTime
        );
        let localEndDateTime = dayjs.utc(
          currentDate.format("YYYY-MM-DD") + " " + block.endTime
        );

        while (localStartDateTime <= localEndDateTime) {
          const localBlockStartDateTime = localStartDateTime.clone();
          const localBlockEndDateTime = localStartDateTime.add(
            options.blockDurationInMinutes,
            "minute"
          );

          const isBlockInRange =
            localEndDateTime >= localBlockEndDateTime.add(-1, "second");
          if (!isBlockInRange) {
            break;
          }

          const isStartZoneValid =
            localBlockStartDateTime.format(localDateTimeFormat) ===
            dayjs
              .tz(
                localBlockStartDateTime.format(localDateTimeFormat),
                config.timezone
              )
              .utc()
              .tz(config.timezone)
              .format(localDateTimeFormat);

          if (isStartZoneValid) {
            const block: CalendarBlock = {
              durationInMinutes: options.blockDurationInMinutes,
              startDate: localBlockStartDateTime.format(localDateTimeFormat),
              endDate: localBlockEndDateTime.format(localDateTimeFormat),
            };

            let isBlockEnabled = true;
            if (options.shouldDisableBlock) {
              isBlockEnabled = !options.shouldDisableBlock(block);
            }

            if (isBlockEnabled) {
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

export interface CalendarOption {
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
  startDate: string;
  endDate: string;
}
