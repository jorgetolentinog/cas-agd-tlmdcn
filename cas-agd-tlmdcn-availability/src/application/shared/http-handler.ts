import { APIGatewayEvent } from "aws-lambda";

export const httpHandler = (handler: Handler) => {
  return async (event: APIGatewayEvent) => {
    let response: Response;

    try {
      response = await handler(event);
    } catch (error) {
      response = {
        statusCode: 500,
        body: JSON.stringify({
          message: (error as Error).message,
          timestamp: new Date().toISOString(),
        }),
      };
    }

    return {
      statusCode: response.statusCode,
      body: response.body,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
    };
  };
};

type Handler = (event: APIGatewayEvent) => Promise<Response>;

interface Response {
  statusCode: number;
  body: string;
}
