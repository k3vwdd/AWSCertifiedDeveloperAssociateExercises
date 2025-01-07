import { Context, DynamoDBStreamEvent } from 'aws-lambda';
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

export async function handler(event: DynamoDBStreamEvent, context: Context) {
    try {
        console.log('Received event:', JSON.stringify(event, null, 2));

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Hello from Lambda!',
                event: event,
                logStreamName: context.logStreamName
            })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal server error'
            })
        };
    }
}
