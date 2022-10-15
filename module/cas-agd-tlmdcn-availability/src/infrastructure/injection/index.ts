import { container } from "tsyringe";
import { MedicapBookingRepository } from "@/domain/repository/MedicapBookingRepository";
import { MedicapPreBookingRepository } from "@/domain/repository/MedicapPreBookingRepository";
import { MedicapReleaseRepository } from "@/domain/repository/MedicapReleaseRepository";
import { MedicapCalendarRepository } from "@/domain/repository/MedicapCalendarRepository";
import { MedicapExceptionRepository } from "@/domain/repository/MedicapExceptionRepository";
import { DynamoDBMedicapBookingRepository } from "@/infrastructure/adapter/repository/DynamoDBMedicapBookingRepository";
import { DynamoDBMedicapPreBookingRepository } from "@/infrastructure/adapter/repository/DynamoDBMedicapPreBookingRepository";
import { DynamoDBMedicapReleaseRepository } from "@/infrastructure/adapter/repository/DynamoDBMedicapReleaseRepository";
import { DynamoDBMedicapCalendarRepository } from "@/infrastructure/adapter/repository/DynamoDBMedicapCalendarRepository";
import { DynamoDBMedicapExceptionRepository } from "@/infrastructure/adapter/repository/DynamoDBMedicapExceptionRepository";

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
