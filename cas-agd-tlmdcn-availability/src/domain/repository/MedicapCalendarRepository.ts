import { MedicapCalendar } from "../schema/MedicapCalendar";

export interface MedicapCalendarRepository {
  create: (calendar: MedicapCalendar) => Promise<void>;
  update: (calendar: MedicapCalendar) => Promise<void>;
  findById: (calendarId: string) => Promise<MedicapCalendar | null>;
}
