import { MedicapBooking } from "../schema/MedicapBooking";

export interface MedicapBookingRepository {
  create: (booking: MedicapBooking) => Promise<void>;
  update: (booking: MedicapBooking) => Promise<void>;
  findById: (bookingId: string) => Promise<MedicapBooking | null>;
  findByProfessionalAndDateRange: (props: {
    companyId: string;
    officeId: string;
    serviceId: string;
    professionalId: string;
    isEnabled: boolean;
    startDate: string;
    endDate: string;
  }) => Promise<MedicapBooking[]>;
}
