import { MedicapException } from "../schema/MedicapException";

export interface MedicapExceptionRepository {
  create: (exception: MedicapException) => Promise<void>;
  update: (exception: MedicapException) => Promise<void>;
  findById: (exceptionId: string) => Promise<MedicapException | null>;
}
