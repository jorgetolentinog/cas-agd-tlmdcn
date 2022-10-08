import { SyncMedicapException } from "@/domain/usecase/sync-medicap-exception/SyncMedicapException";
import { EventBridgeEvent } from "aws-lambda";
import { container } from "tsyringe";
import { z } from "zod";

export const handler = async (event: EventBridgeEvent<string, unknown>) => {
  const detail = detailParser(event.detail);

  if (!detail.success) {
    throw new Error("Invalid event detail");
  }

  await container.resolve(SyncMedicapException).execute({
    id: detail.data.detail.id,
    startDate: detail.data.detail.startDate,
    endDate: detail.data.detail.endDate,
    isEnabled: detail.data.detail.isEnabled,
    recurrence: detail.data.detail.recurrence,
    repeatRecurrenceEvery: detail.data.detail.repeatRecurrenceEvery,
    professionalIds: detail.data.detail.professionalIds,
    serviceIds: detail.data.detail.serviceIds,
    dayOfMonth: detail.data.detail.dayOfMonth,
    weekOfMonth: detail.data.detail.weekOfMonth,
    dayOfWeek: detail.data.detail.dayOfWeek,
    days: detail.data.detail.days,
    createdAt: detail.data.detail.createdAt,
    updatedAt: detail.data.detail.updatedAt,
  });
};

function detailParser(detail: unknown) {
  const schema = z.object({
    detail: z.object({
      id: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      isEnabled: z.boolean(),
      recurrence: z.enum(["weekly", "monthly"]),
      repeatRecurrenceEvery: z.number(),
      professionalIds: z.array(z.string()),
      serviceIds: z.array(z.string()),
      dayOfMonth: z.number().optional(),
      weekOfMonth: z.number().optional(),
      dayOfWeek: z.number().optional(),
      days: z.array(
        z.object({
          dayOfWeek: z.number(),
          blocks: z.array(
            z.object({
              startTime: z.string(),
              endTime: z.string(),
            })
          ),
        })
      ),
      createdAt: z.string(),
      updatedAt: z.string(),
    }),
  });

  return schema.safeParse(detail);
}
