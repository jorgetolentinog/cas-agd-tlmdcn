import { container } from "tsyringe";
import { MedicapBookingRepository } from "@/domain/repository/MedicapBookingRepository";
import { MedicapPreBookingRepository } from "@/domain/repository/MedicapPreBookingRepository";
import { DynamoDBMedicapBookingRepository } from "@/infrastructure/repository/adapter/DynamoDBMedicapBookingRepository";
import { DynamoDBMedicapPreBookingRepository } from "@/infrastructure/repository/adapter/DynamoDBMedicapPreBookingRepository";

container.register<MedicapBookingRepository>(
  "MedicapBookingRepository",
  DynamoDBMedicapBookingRepository
);

container.register<MedicapPreBookingRepository>(
  "MedicapPreBookingRepository",
  DynamoDBMedicapPreBookingRepository
);

export { container };
