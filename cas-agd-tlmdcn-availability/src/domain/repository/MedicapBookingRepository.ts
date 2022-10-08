import { MedicapBooking } from "../schema/MedicapBooking";

export interface MedicapBookingRepository {
  save: (booking: MedicapBooking) => Promise<void>;
  findById: (bookingId: string) => Promise<MedicapBooking | null>;
}
