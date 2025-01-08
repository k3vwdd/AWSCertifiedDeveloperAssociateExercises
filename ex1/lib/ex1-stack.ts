import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as path from "path";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as api from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";

export class Ex1Stack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const movieTable = new dynamodb.TableV2(this, "tb:movies", {
            tableName: "movies",
            partitionKey: {
                name: "title",
                type: dynamodb.AttributeType.STRING,
            },
            dynamoStream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        const createMovie = new lambda.Function(this, "CreateMovieFunction", {
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

        const getMovie = new lambda.Function(this, "GetMovieFunction", {
            functionName: "get_movie",
            runtime: lambda.Runtime.NODEJS_20_X,
            timeout: cdk.Duration.seconds(30),
            memorySize: 128,
            handler: "get_movie.handler",
            code: lambda.Code.fromAsset(path.join(__dirname, "../assets/dist")),
            environment: {
                TABLE_NAME: movieTable.tableName,
            },
        });

        const updateMovie = new lambda.Function(this, "UpdateMovieFunction", {
            functionName: "update_movie",
            runtime: lambda.Runtime.NODEJS_20_X,
            timeout: cdk.Duration.seconds(30),
            memorySize: 128,
            handler: "update_movie.handler",
            code: lambda.Code.fromAsset(path.join(__dirname, "../assets/dist")),
            environment: {
                TABLE_NAME: movieTable.tableName,
            },
        });

        const deleteMovie = new lambda.Function(this, "DeleteMovieFunction", {
            functionName: "delete_movie",
            runtime: lambda.Runtime.NODEJS_20_X,
            timeout: cdk.Duration.seconds(30),
            memorySize: 128,
            handler: "delete_movie.handler",
            code: lambda.Code.fromAsset(path.join(__dirname, "../assets/dist")),
            environment: {
                TABLE_NAME: movieTable.tableName,
            },
        });

        const moviesApi = new api.RestApi(this, "moviesApi", {
            restApiName: "Movies API",
            description:
                "Movies API that connects a web endpoint to several Lambda functions",
            defaultCorsPreflightOptions: {
                allowOrigins: api.Cors.ALL_ORIGINS,
                allowMethods: api.Cors.ALL_METHODS,
            },
        });

        const movieResource = moviesApi.root.addResource("Movies");
        const titleResource = movieResource.addResource("{title}");

        const createMovieIntegration = new api.LambdaIntegration(createMovie);
        const updateMovieIntegration = new api.LambdaIntegration(updateMovie);
        const deleteMovieIntegration = new api.LambdaIntegration(deleteMovie);
        const getMovieIntegration = new api.LambdaIntegration(getMovie, {
            requestTemplates: {
                "application/json": JSON.stringify({
                    title: "$input.params('title')",
                }),
            },
        });

        movieResource.addMethod("POST", createMovieIntegration);
        movieResource.addMethod("PUT", updateMovieIntegration);
        movieResource.addMethod("DELETE", deleteMovieIntegration);
        titleResource.addMethod("GET", getMovieIntegration);

        //createMovie.role?.addManagedPolicy(
        //    iam.ManagedPolicy.fromAwsManagedPolicyName(
        //        "service-role/AWSLambdaBasicExecutionRole",
        //    ),
        //);

        //getMovie.role?.addManagedPolicy(
        //    iam.ManagedPolicy.fromAwsManagedPolicyName(
        //        "service-role/AWSLambdaBasicExecutionRole",
        //    ),
        //);

        //updateMovie.role?.addManagedPolicy(
        //    iam.ManagedPolicy.fromAwsManagedPolicyName(
        //        "service-role/AWSLambdaBasicExecutionRole",
        //    ),
        //);

        const servicePolicy = new iam.Policy(this, "LabDynamoDBPolicy", {
            policyName: "LabLambdaExecutionRole",
            statements: [
                //new iam.PolicyStatement({
                //    effect: iam.Effect.ALLOW,
                //    actions: ["dynamodb:List*", "dynamodb:Describe*"],
                //    resources: [movieTable.tableArn],
                //    sid: "ListAndDescribe",
                //}),
                new iam.PolicyStatement({
                    effect: iam.Effect.ALLOW,
                    actions: [
                        "logs:CreateLogGroup",
                        "logs:CreateLogStream",
                        "logs:PutLogEvents",
                    ],
                    resources: ["*"],
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
                    sid: "FullTable",
                }),
            ],
        });

        createMovie.role?.attachInlinePolicy(servicePolicy);
        getMovie.role?.attachInlinePolicy(servicePolicy);
        updateMovie.role?.attachInlinePolicy(servicePolicy);
        deleteMovie.role?.attachInlinePolicy(servicePolicy);

        new cdk.CfnOutput(this, "TableName", {
            value: movieTable.tableName,
            description: "Name of the DynamoDB table",
        });
    }
}
