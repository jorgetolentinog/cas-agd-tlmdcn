import dayjs from "dayjs";
import dayjsUtc from "dayjs/plugin/utc";
import dayjsTimezone from "dayjs/plugin/timezone";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isoWeek from "dayjs/plugin/isoWeek";
import weekOfYear from "dayjs/plugin/weekOfYear";

dayjs.extend(dayjsUtc);
dayjs.extend(dayjsTimezone);
dayjs.extend(customParseFormat);
dayjs.extend(isoWeek);
dayjs.extend(weekOfYear);

export { dayjs };
