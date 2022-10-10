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
    id: detail.data.body.id,
    date: detail.data.body.date,
    blockDurationInMinutes: detail.data.body.blockDurationInMinutes,
    professionalId: detail.data.body.professionalId,
    serviceId: detail.data.body.serviceId,
    isEnabled: detail.data.body.isEnabled,
    createdAt: detail.data.body.createdAt,
    updatedAt: detail.data.body.updatedAt,
  });
};

function detailParser(detail: unknown) {
  const schema = z.object({
    body: z.object({
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
