import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { Context } from "aws-lambda";
import { MovieTableSchema } from "./types";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export async function handler(event: MovieTableSchema, context: Context) {
    try {
        const command = new GetCommand({
            ConsistentRead: true,
            TableName: "movies",
            Key: {
                title: event.title,
            },
        });

        const response = await docClient.send(command);
        console.log(response);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Item retrieved ${event.title}`,
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
