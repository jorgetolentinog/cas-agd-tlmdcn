import { SyncMedicapPreBooking } from "@/domain/usecase/sync-medicap-pre-booking/SyncMedicapPreBooking";
import { EventBridgeEvent } from "aws-lambda";
import { container } from "tsyringe";
import { z } from "zod";

export const handler = async (event: EventBridgeEvent<string, unknown>) => {
  const detail = detailParser(event.detail);

  if (!detail.success) {
    throw new Error("Invalid event detail");
  }

  await container.resolve(SyncMedicapPreBooking).execute({
    id: detail.data.detail.id,
    date: detail.data.detail.date,
    companyId: detail.data.detail.companyId,
    officeId: detail.data.detail.officeId,
    serviceId: detail.data.detail.serviceId,
    professionalId: detail.data.detail.professionalId,
    calendarId: detail.data.detail.calendarId,
    blockDurationInMinutes: detail.data.detail.blockDurationInMinutes,
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
      companyId: z.string(),
      officeId: z.string(),
      serviceId: z.string(),
      professionalId: z.string(),
      calendarId: z.string(),
      blockDurationInMinutes: z.number(),
      isEnabled: z.boolean(),
      createdAt: z.string(),
      updatedAt: z.string(),
    }),
  });

  return schema.safeParse(detail);
}
