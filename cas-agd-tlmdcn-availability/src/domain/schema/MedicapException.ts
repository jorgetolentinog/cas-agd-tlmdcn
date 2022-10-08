export interface MedicapException {
  id: string;
  startDate: string;
  endDate: string;
  isEnabled: boolean;
  recurrence: "weekly" | "monthly";
  repeatRecurrenceEvery: number;
  professionalIds: string[];
  serviceIds: string[];
  dayOfMonth?: number;
  weekOfMonth?: number;
  dayOfWeek?: number;
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
