export type AvailabilityProfessionalResponse = {
  calendarId: string;
  startDate: string;
  endDate: string;
  durationInMinutes: number;
  medicalAreaIds: string[];
  interestAreaIds: string[];
  conditionsOfService: {
    minAge?: number;
    maxAge?: number;
    gender?: string;
  };
}[];
