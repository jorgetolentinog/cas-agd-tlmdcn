export type AvailabilityByProfessionalResponse = {
  blocks: {
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
  }[];
};
