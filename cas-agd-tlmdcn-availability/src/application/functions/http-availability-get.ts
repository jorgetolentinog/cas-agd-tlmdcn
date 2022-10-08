import { httpHandler } from "@/application/shared/http-handler";

export const handler = httpHandler(async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "OK" }),
  };
});
