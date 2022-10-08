import { httpHandler } from "@/application/shared/http-handler";
import { CalcAvailability } from "@/domain/usecase/calc-availability/CalcAvailability";
import { container } from "tsyringe";

export const handler = httpHandler(async (event) => {
  const response = await container.resolve(CalcAvailability).execute();

  return {
    statusCode: 200,
    body: JSON.stringify(response),
  };
});
