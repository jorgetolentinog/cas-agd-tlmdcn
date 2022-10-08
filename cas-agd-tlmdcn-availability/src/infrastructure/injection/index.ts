import { container } from "tsyringe";
import { MedicapBookingRepository } from "@/domain/repository/MedicapBookingRepository";
import { MedicapPreBookingRepository } from "@/domain/repository/MedicapPreBookingRepository";
import { MedicapReleaseRepository } from "@/domain/repository/MedicapReleaseRepository";
import { MedicapCalendarRepository } from "@/domain/repository/MedicapCalendarRepository";
import { MedicapExceptionRepository } from "@/domain/repository/MedicapExceptionRepository";
import { DynamoDBMedicapBookingRepository } from "@/infrastructure/repository/adapter/DynamoDBMedicapBookingRepository";
import { DynamoDBMedicapPreBookingRepository } from "@/infrastructure/repository/adapter/DynamoDBMedicapPreBookingRepository";
import { DynamoDBMedicapReleaseRepository } from "@/infrastructure/repository/adapter/DynamoDBMedicapReleaseRepository";
import { DynamoDBMedicapCalendarRepository } from "@/infrastructure/repository/adapter/DynamoDBMedicapCalendarRepository";
import { DynamoDBMedicapExceptionRepository } from "@/infrastructure/repository/adapter/DynamoDBMedicapExceptionRepository";

container.register<MedicapBookingRepository>(
  "MedicapBookingRepository",
  DynamoDBMedicapBookingRepository
);

container.register<MedicapPreBookingRepository>(
  "MedicapPreBookingRepository",
  DynamoDBMedicapPreBookingRepository
);

container.register<MedicapReleaseRepository>(
  "MedicapReleaseRepository",
  DynamoDBMedicapReleaseRepository
);

container.register<MedicapCalendarRepository>(
  "MedicapCalendarRepository",
  DynamoDBMedicapCalendarRepository
);

container.register<MedicapExceptionRepository>(
  "MedicapExceptionRepository",
  DynamoDBMedicapExceptionRepository
);

export { container };
