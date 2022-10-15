import { apiGatewayHandler } from "@/application/shared/api-gateway-handler";
import { AvailabilityByProfessional } from "@/domain/usecase/availability-by-professional/AvailabilityByProfessional";
import { container } from "tsyringe";
import { z } from "zod";

export const handler = apiGatewayHandler(async (event) => {
  const query = queryParser(event.queryStringParameters);

  if (!query.success) {
    throw new Error("Invalid path parameters");
  }

  const response = await container.resolve(AvailabilityByProfessional).execute({
    professionalId: query.data.professionalId,
    startDate: query.data.startDate,
    endDate: query.data.endDate,
  });

  return {
    statusCode: 200,
    body: JSON.stringify(response),
  };
});

function queryParser(pathParameters: unknown) {
  const schema = z.object({
    professionalId: z.string(),
    startDate: z.string(),
    endDate: z.string(),
  });

  return schema.safeParse(pathParameters);
}
