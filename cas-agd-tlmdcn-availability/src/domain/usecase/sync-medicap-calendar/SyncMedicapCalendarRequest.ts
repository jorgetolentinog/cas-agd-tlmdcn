export interface SyncMedicapCalendarRequest {
  id: string;
  startDate: string;
  endDate: string;
  isEnabled: boolean;
  companyId: string;
  officeId: string;
  serviceId: string;
  medicalAreaIds: string[];
  interestAreaIds: string[];
  professionalId: string;
  blockDurationInMinutes: number;
  conditionsOfService: {
    minAge?: number;
    maxAge?: number;
    gender?: "F" | "M";
  };
  days: Array<{
    dayOfWeek: number;
    blocks: Array<{
      startTime: string;
      endTime: string;
    }>;
  }>;
  createdAt: string;
  updatedAt: string;
}
