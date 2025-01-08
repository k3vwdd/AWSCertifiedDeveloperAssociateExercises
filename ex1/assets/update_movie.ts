import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { UpdateCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { Context, APIGatewayProxyEvent } from "aws-lambda";
//import { MovieTableSchema } from "./types";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

//export async function handler(event: MovieTableSchema, context: Context) {
export async function handler(event: APIGatewayProxyEvent, context: Context) {
    try {
        //const year = event.year;
        //const title = event.title || "";
        //const rating = event.rating || "0.0";
        //const plot = event.plot || "";

        const body = JSON.parse(event.body || "{}");
        // @ts-expect-error
        const year = body.year;
        const title = body.title || "";
        const rating = body.rating || "0.0";
        const plot = body.plot || "";

        const command = new UpdateCommand({
            TableName: "movies",
            Key: {
                title: title,
            },
            UpdateExpression: "set info.rating=:r, info.plot=:p",
            ExpressionAttributeValues: {
                ":r": rating,
                ":p": plot,
            },
            ReturnValues: "UPDATED_NEW",
        });

        const response = await docClient.send(command);
        console.log(response);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "updated the item",
                body: response,
                event: event,
                logStreamName: context.logStreamName,
            }),
        };
    } catch (err) {
        console.error("Error:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Internal server error",
            }),
        };
    }
}
