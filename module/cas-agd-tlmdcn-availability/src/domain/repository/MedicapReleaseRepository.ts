import { MedicapRelease } from "../schema/MedicapRelease";

export interface MedicapReleaseRepository {
  create: (release: MedicapRelease) => Promise<void>;
  update: (release: MedicapRelease) => Promise<void>;
  findById: (releaseId: string) => Promise<MedicapRelease | null>;
}
