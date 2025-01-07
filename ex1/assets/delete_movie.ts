import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { Context } from "aws-lambda";
import { MovieTableSchema } from "./types";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export async function handler(event: MovieTableSchema, context: Context) {
    try {
        // @ts-expect-error
        const year = event.year;
        const title = event.title;

        const command = new DeleteCommand({
            TableName: "movies",
            Key: {
                title: title,
            },
            ConditionExpression: "attribute_exists(#info.#actors)",
            ExpressionAttributeNames: {
                "#info": "info",
                "#actors": "actors",
            },
            ReturnValues: "ALL_OLD",
        });

        const response = await docClient.send(command);
        console.log(response);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Deleted ${title}`,
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
