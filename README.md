# lambda-log-bifurcator-cdk

This is a companion repo for this [blog](https://speedrun.nobackspacecrew.com/blog/2023/02/23/bifurcating-lambda-logs.html) on bifurcating lambda logs.

## Installation

1. Install [Cargo Lambda](https://www.cargo-lambda.info/guide/getting-started.html)
2. `npm install`
3. `npm run build`

## Deployment

1. npx cdk synth
2. npx cdk deploy

## Running
Hit the url that appears in the output of the deploy command above to trigger a request.  To see the logs, there are two log groups, the original logs are in:

`/aws/lambda/airline-service`

and the filtered request logs are in:

`/aws/lambda/airline-service-requestlogs`

## Cleanup
When you are done, you can delete the resources by running
1. `npx cdk destroy`

## Useful commands
* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template
