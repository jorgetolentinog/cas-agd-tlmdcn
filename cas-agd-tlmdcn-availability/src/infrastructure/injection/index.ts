import { container } from "tsyringe";
import { MedicapBookingRepository } from "@/domain/repository/MedicapBookingRepository";
import { DynamoDBMedicapBookingRepository } from "@/infrastructure/repository/adapter/DynamoDBMedicapBookingRepository";

container.register<MedicapBookingRepository>(
  "MedicapBookingRepository",
  DynamoDBMedicapBookingRepository
);

export { container };
