import { MedicapCalendar } from "../schema/MedicapCalendar";

export interface MedicapCalendarRepository {
  create: (calendar: MedicapCalendar) => Promise<void>;
  update: (calendar: MedicapCalendar) => Promise<void>;
  findById: (calendarId: string) => Promise<MedicapCalendar | null>;
  findByProfessionalAndDateRange: (props: {
    companyId: string;
    officeId: string;
    serviceId: string;
    professionalId: string;
    isEnabled: boolean;
    startDate: string;
    endDate: string;
  }) => Promise<MedicapCalendar[]>;
}
