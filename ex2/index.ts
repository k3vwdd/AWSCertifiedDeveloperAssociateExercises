import { Handler, Context } from "aws-lambda";

export async function handler(event: Handler, context: Context) {
    console.log('EVENT: \n' + JSON.stringify(event, null, 2));
    return context.logStreamName;

}
