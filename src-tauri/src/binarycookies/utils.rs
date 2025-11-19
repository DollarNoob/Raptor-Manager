use std::time::{Duration, SystemTime};

pub fn to_unix_timestamp(timestamp: f64) -> SystemTime {
    SystemTime::UNIX_EPOCH + Duration::from_secs((timestamp as u64) + 978307200)
}

pub fn to_cocoa_timestamp(time: SystemTime) -> f64 {
    match time.duration_since(SystemTime::UNIX_EPOCH) {
        Ok(duration) => (duration.as_secs() - 978307200) as f64,
        Err(_) => 0.0,
    }
}
