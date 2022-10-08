import { SyncMedicapCalendar } from "@/domain/usecase/sync-medicap-calendar/SyncMedicapCalendar";
import { EventBridgeEvent } from "aws-lambda";
import { container } from "tsyringe";
import { z } from "zod";

export const handler = async (event: EventBridgeEvent<string, unknown>) => {
  const detail = detailParser(event.detail);

  if (!detail.success) {
    throw new Error("Invalid event detail");
  }

  await container.resolve(SyncMedicapCalendar).execute({
    id: detail.data.detail.id,
    startDate: detail.data.detail.startDate,
    endDate: detail.data.detail.endDate,
    isEnabled: detail.data.detail.isEnabled,
    companyId: detail.data.detail.companyId,
    officeId: detail.data.detail.officeId,
    serviceId: detail.data.detail.serviceId,
    medicalAreaIds: detail.data.detail.medicalAreaIds,
    interestAreaIds: detail.data.detail.interestAreaIds,
    professionalId: detail.data.detail.professionalId,
    blockDurationInMinutes: detail.data.detail.blockDurationInMinutes,
    conditionsOfService: detail.data.detail.conditionsOfService,
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
      companyId: z.string(),
      officeId: z.string(),
      serviceId: z.string(),
      medicalAreaIds: z.array(z.string()),
      interestAreaIds: z.array(z.string()),
      professionalId: z.string(),
      blockDurationInMinutes: z.number(),
      conditionsOfService: z.object({
        minAge: z.number().optional(),
        maxAge: z.number().optional(),
        gender: z.enum(["F", "M"]).optional(),
      }),
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
