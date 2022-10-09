export type CalcAvailabilityResponse = {
  blocks: {
    durationInMinutes: number;
    start: {
      local: string;
      utc: string;
    };
    end: {
      local: string;
      utc: string;
    };
  }[];
};
