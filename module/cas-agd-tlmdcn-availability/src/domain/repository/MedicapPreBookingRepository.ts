import { MedicapPreBooking } from "../schema/MedicapPreBooking";

export interface MedicapPreBookingRepository {
  create: (preBooking: MedicapPreBooking) => Promise<void>;
  update: (preBooking: MedicapPreBooking) => Promise<void>;
  findById: (preBookingId: string) => Promise<MedicapPreBooking | null>;
}
