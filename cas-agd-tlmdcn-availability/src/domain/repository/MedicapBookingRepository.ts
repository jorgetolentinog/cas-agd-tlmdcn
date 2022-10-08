import { MedicapBooking } from "../schema/MedicapBooking";

export interface MedicapBookingRepository {
  create: (booking: MedicapBooking) => Promise<void>
  update: (booking: MedicapBooking) => Promise<void>
  findById: (bookingId: string) => Promise<MedicapBooking | null>;
}
