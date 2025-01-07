import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { Context } from "aws-lambda";
import { MovieTableSchema } from "./types";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client); // automatically does my types

export async function handler(event: MovieTableSchema, context: Context) {
    try {
        console.log("Received event:", JSON.stringify(event, null, 2));
        // Since I"m sending my own test event data is custom to my sent data.. It's not from dynamodb
        //if (!event.Records || event.Records.length === 0) {
        //    throw new Error("No records found in the event");
        //}

        //const year = event.Records[0]?.dynamodb?.NewImage?.year?.S || "0";
        //const title = event.Records[0]?.dynamodb?.NewImage?.title?.S || "";
        //const actors = event.Records[0]?.dynamodb?.NewImage?.actors?.S || "";
        const year = event.year || "0";
        const title = event.title || "";
        const actors = event.actors || "";

        const command = new PutCommand({
            TableName: "movies",
            Item: {
                year: year,
                title: title,
                info: {
                    actors: actors,
                },
            },
        });
        const response = await docClient.send(command);
        console.log(response);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Added new items",
                body: response,
                event: event,
                logStreamName: context.logStreamName,
            }),
        };
    } catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Internal server error",
            }),
        };
    }
}
