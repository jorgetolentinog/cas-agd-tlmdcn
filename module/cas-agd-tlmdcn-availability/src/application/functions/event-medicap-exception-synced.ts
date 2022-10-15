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
    id: detail.data.body.id,
    startDate: detail.data.body.startDate,
    endDate: detail.data.body.endDate,
    isEnabled: detail.data.body.isEnabled,
    recurrence: detail.data.body.recurrence,
    repeatRecurrenceEvery: detail.data.body.repeatRecurrenceEvery,
    professionalIds: detail.data.body.professionalIds,
    serviceIds: detail.data.body.serviceIds,
    dayOfMonth: detail.data.body.dayOfMonth,
    weekOfMonth: detail.data.body.weekOfMonth,
    dayOfWeek: detail.data.body.dayOfWeek,
    days: detail.data.body.days,
    createdAt: detail.data.body.createdAt,
    updatedAt: detail.data.body.updatedAt,
  });
};

function detailParser(detail: unknown) {
  const schema = z.object({
    body: z.object({
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
