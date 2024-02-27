use aws_lambda_events::event::cloudwatch_logs::LogsEvent;
use lambda_runtime::{run, service_fn, Error, LambdaEvent};
use chrono::{NaiveDateTime};
use serde_json::{Value};

async fn function_handler(event: LambdaEvent<LogsEvent>) -> Result<(), Error> {
    //Write to the log
    for record in event.payload.aws_logs.data.log_events {
        let mut json: Value = serde_json::from_str(&record.message).unwrap();

        // Access the _aws object
        let aws_object = json.as_object_mut().unwrap().get_mut("_aws").unwrap().as_object_mut().unwrap();
        // Remove the CloudWatchMetrics key
        aws_object.remove("CloudWatchMetrics");

        println!("{} {}",
                 NaiveDateTime::from_timestamp_millis(record.timestamp).unwrap().format("%Y-%m-%dT%H:%M:%S%.3fZ").to_string()
                 , json);
    }
    Ok(())
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    run(service_fn(function_handler)).await
}
