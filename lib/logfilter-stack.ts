import * as cdk from 'aws-cdk-lib';
import { RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { RustFunction } from 'cargo-lambda-cdk'
import { FilterPattern, LogGroup, LogGroupClass, RetentionDays, SubscriptionFilter } from "aws-cdk-lib/aws-logs";
import { LambdaDestination } from "aws-cdk-lib/aws-logs-destinations";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Alias, Architecture, FunctionUrlAuthType, LogFormat, Runtime, SystemLogLevel } from "aws-cdk-lib/aws-lambda";

export class LogFilterCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const serviceName = "airline-service";

    const logGroup = new LogGroup(this, 'serviceLogGroup', {
      logGroupName: `/aws/lambda/${serviceName}`,
      logGroupClass: LogGroupClass.STANDARD,
      retention: RetentionDays.THREE_DAYS,
      removalPolicy: RemovalPolicy.DESTROY
    });

    const requestLogGroup = new LogGroup(this, 'serviceFilteredLogGroup', {
      logGroupName: `/aws/lambda/${serviceName}-requestlogs`,
      logGroupClass: LogGroupClass.STANDARD,
      retention: RetentionDays.INFINITE,
      removalPolicy: RemovalPolicy.DESTROY
    });

    const logLambda = new NodejsFunction(this, "service", {
      entry: 'src/handler.ts',
      functionName: serviceName,
      logGroup,
      memorySize: 128,
      architecture: Architecture.ARM_64,
      runtime: Runtime.NODEJS_20_X
    });

    // add an alias to the lambda function
    const alias = new Alias(this, 'alias', {
      aliasName: 'prod',
      version: logLambda.currentVersion,
    });

    const filterLambda = new RustFunction(this, "serviceLogFilter", {
      functionName: `${serviceName}-requestlogs`,
      logGroup: requestLogGroup,
      memorySize: 128,
      architecture: Architecture.ARM_64,
      logFormat: LogFormat.JSON,
      systemLogLevel: SystemLogLevel.WARN
    });

    new SubscriptionFilter(
      this,
      'SubscriptionFilter',
      {
        logGroup,
        filterName: 'requestLogsFilter',
        destination: new LambdaDestination(filterLambda),
        // wanted to use this filter pattern but it doesn't work
        // filterPattern: FilterPattern.exists('$._aws'),
        filterPattern: FilterPattern.literal('"_aws"'),
      }
    );

    const fnUrl = alias.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
    });

    new cdk.CfnOutput(this, 'functionUrl', {
      value: fnUrl.url,
    });
  }
}
