use aws_lambda_events::event::cloudwatch_logs::LogsEvent;
use chrono::NaiveDateTime;
use lambda_runtime::{run, service_fn, Error, LambdaEvent};
use serde_json::Value;

async fn function_handler(event: LambdaEvent<LogsEvent>) -> Result<(), Error> {
    //For each log event
    for record in event.payload.aws_logs.data.log_events {
        // Parse as JSON
        let mut json: Value = serde_json::from_str(&record.message).unwrap();
        // Rip out _aws.CloudWatchMetrics, we don't want to publish metrics again
        json.as_object_mut()
            .unwrap()
            .get_mut("_aws")
            .unwrap()
            .as_object_mut()
            .unwrap()
            .remove("CloudWatchMetrics");
        // Print log entry to stdout prefixed by original timestamp in ISO8601 format
        println!(
            "{} {}",
            NaiveDateTime::from_timestamp_millis(record.timestamp)
                .unwrap()
                .format("%Y-%m-%dT%H:%M:%S%.3fZ")
                .to_string(),
            json
        );
    }
    Ok(())
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    run(service_fn(function_handler)).await
}
