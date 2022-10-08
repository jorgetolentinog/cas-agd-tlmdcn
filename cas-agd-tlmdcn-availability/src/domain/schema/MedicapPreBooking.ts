export interface MedicapPreBooking {
  id: string;
  date: string;
  companyId: string;
  officeId: string;
  serviceId: string;
  professionalId: string;
  calendarId: string;
  blockDurationInMinutes: number;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}
