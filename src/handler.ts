import {Metrics, MetricUnits} from '@aws-lambda-powertools/metrics';
import {Logger} from '@aws-lambda-powertools/logger';
import {LambdaInterface} from '@aws-lambda-powertools/commons';
import {APIGatewayProxyResultV2, Context, LambdaFunctionURLEvent} from "aws-lambda";

const metrics = new Metrics({
    namespace: 'serverlessAirline',
    serviceName: 'bookings',
});

const logger = new Logger({serviceName: 'bookings'});

class Lambda implements LambdaInterface {
    @metrics.logMetrics()
    @logger.injectLambdaContext()
    public async handler(_event: LambdaFunctionURLEvent, _context: Context): Promise<APIGatewayProxyResultV2> {
        logger.info('Starting booking');
        const success = Math.random() <= .98 ? 1 : 0;
        metrics.addMetadata('path', _event.requestContext.http.path);
        metrics.addMetadata('ip', _event.requestContext.http.sourceIp);
        metrics.addMetadata('userAgent', _event.requestContext.http.userAgent);
        metrics.addMetadata('codeVersion', process.env.AWS_LAMBDA_FUNCTION_VERSION || "1");
        metrics.addMetric('fault', MetricUnits.Count, success ? 0 : 1);
        success ? logger.info('Booking successful') : logger.error('Booking failed');
        return success ?
            {
                statusCode: 200,
                body: JSON.stringify({status: 'Successful'})
            } :
            {
                statusCode: 500,
                body: JSON.stringify({status: 'Failed'})
            }
    }
}

const handlerClass = new Lambda();
export const handler = handlerClass.handler.bind(handlerClass);