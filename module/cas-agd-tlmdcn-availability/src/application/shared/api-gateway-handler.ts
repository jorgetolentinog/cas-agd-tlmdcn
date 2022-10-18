import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";

export const apiGatewayHandler = (handler: Handler): Handler => {
  return async (event, context) => {
    let result: APIGatewayProxyResult;

    try {
      result = await handler(event, context);
    } catch (error) {
      result = {
        statusCode: 400,
        body: JSON.stringify({
          message: (error as Error).message,
          timestamp: new Date().toISOString(),
        }),
      };
    }

    return {
      ...result,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        ...result.headers,
      },
    };
  };
};

interface Handler {
  (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult>;
}
