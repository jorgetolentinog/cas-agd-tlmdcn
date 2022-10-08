export interface SyncMedicapBookingRequest {
  id: string;
  date: string;
  companyId: string;
  officeId: string;
  serviceId: string;
  professionalId: string;
  patientId: string;
  calendarId: string;
  blockDurationInMinutes: number;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}
