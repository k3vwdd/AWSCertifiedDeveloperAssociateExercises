import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as path from "path";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export class Ex1Stack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const movieTable = new dynamodb.TableV2(this, "tb:movies", {
            tableName: "movies",
            partitionKey: {
                name: "title",
                type: dynamodb.AttributeType.STRING,
            },
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        const createMovie = new lambda.Function(this, "consumer", {
            functionName: "create_movie",
            runtime: lambda.Runtime.NODEJS_20_X,
            timeout: cdk.Duration.seconds(30),
            memorySize: 128,
            handler: "create_movie.handler",
            code: lambda.Code.fromAsset(path.join(__dirname, "../assets/dist")),
            environment: {
                TABLE_NAME: movieTable.tableName,
            },
        });

        createMovie.role?.addManagedPolicy(
            iam.ManagedPolicy.fromAwsManagedPolicyName(
                "service-role/AWSLambdaBasicExecutionRole",
            ),
        );

        const servicePolicy = new iam.Policy(this, "LabDynamoDBPolicy", {
            policyName: "LabLambdaExecutionRole",
            statements: [
                new iam.PolicyStatement({
                    effect: iam.Effect.ALLOW,
                    actions: ["dynamodb:List*", "dynamodb:Describe*"],
                    resources: [movieTable.tableArn],
                    sid: "ListAndDescribe",
                }),
                new iam.PolicyStatement({
                    effect: iam.Effect.ALLOW,
                    actions: [
                        "dynamodb:BatchGetItem",
                        "dynamodb:BatchWriteItem",
                        "dynamodb:DeleteItem",
                        "dynamodb:GetItem",
                        "dynamodb:ListStreams",
                        "dynamodb:PutItem",
                        "dynamodb:Query",
                        "dynamodb:Scan",
                        "dynamodb:UpdateItem",
                    ],
                    resources: [
                        movieTable.tableArn,
                        `${movieTable.tableArn}/index/*`,
                    ],
                    sid: "SpecificTable",
                }),
            ],
        });

        createMovie.role?.attachInlinePolicy(servicePolicy);

        new cdk.CfnOutput(this, "TableName", {
            value: movieTable.tableName,
            description: "Name of the DynamoDB table",
        });
    }
}
