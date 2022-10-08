import { SyncMedicapRelease } from "@/domain/usecase/sync-medicap-release/SyncMedicapRelease";
import { EventBridgeEvent } from "aws-lambda";
import { container } from "tsyringe";
import { z } from "zod";

export const handler = async (event: EventBridgeEvent<string, unknown>) => {
  const detail = detailParser(event.detail);

  if (!detail.success) {
    throw new Error("Invalid event detail");
  }

  await container.resolve(SyncMedicapRelease).execute({
    id: detail.data.detail.id,
    date: detail.data.detail.date,
    blockDurationInMinutes: detail.data.detail.blockDurationInMinutes,
    professionalId: detail.data.detail.professionalId,
    serviceId: detail.data.detail.serviceId,
    isEnabled: detail.data.detail.isEnabled,
    createdAt: detail.data.detail.createdAt,
    updatedAt: detail.data.detail.updatedAt,
  });
};

function detailParser(detail: unknown) {
  const schema = z.object({
    detail: z.object({
      id: z.string(),
      date: z.string(),
      blockDurationInMinutes: z.number(),
      professionalId: z.string(),
      serviceId: z.string(),
      isEnabled: z.boolean(),
      createdAt: z.string(),
      updatedAt: z.string(),
    }),
  });

  return schema.safeParse(detail);
}
