import { apiGatewayHandler } from "@/application/shared/api-gateway-handler";
import { AvailabilityProfessional } from "@/domain/usecase/availability-professional/AvailabilityProfessional";
import { container } from "tsyringe";
import { z } from "zod";

export const handler = apiGatewayHandler(async (event) => {
  const params = paramsParser({
    professionalId: event.pathParameters?.professionalId,
    startDate: event.queryStringParameters?.startDate,
    endDate: event.queryStringParameters?.endDate,
  });

  if (!params.success) {
    throw new Error("Invalid path parameters");
  }

  const response = await container.resolve(AvailabilityProfessional).execute({
    professionalId: params.data.professionalId,
    startDate: params.data.startDate,
    endDate: params.data.endDate,
  });

  return {
    statusCode: 200,
    body: JSON.stringify(response),
  };
});

function paramsParser(params: object) {
  return z
    .object({
      professionalId: z.string(),
      startDate: z.string(),
      endDate: z.string(),
    })
    .safeParse(params);
}
