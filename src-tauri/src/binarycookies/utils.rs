use std::convert::TryInto;
use std::time::{Duration, SystemTime};

pub fn read_u32_be(buf: &[u8], offset: usize) -> Option<u32> {
    buf.get(offset..offset + 4)
        .map(|b| u32::from_be_bytes(b.try_into().unwrap()))
}

pub fn read_u32_le(buf: &[u8], offset: usize) -> Option<u32> {
    buf.get(offset..offset + 4)
        .map(|b| u32::from_le_bytes(b.try_into().unwrap()))
}

pub fn read_i32_le(buf: &[u8], offset: usize) -> Option<i32> {
    buf.get(offset..offset + 4)
        .map(|b| i32::from_le_bytes(b.try_into().unwrap()))
}

pub fn read_u64_le(buf: &[u8], offset: usize) -> Option<u64> {
    buf.get(offset..offset + 8)
        .map(|b| u64::from_le_bytes(b.try_into().unwrap()))
}

pub fn read_f64_le(buf: &[u8], offset: usize) -> Option<f64> {
    buf.get(offset..offset + 8)
        .map(|b| f64::from_le_bytes(b.try_into().unwrap()))
}

/// Read a zero-terminated UTF-8 C string from buffer starting at `offset`.
/// Returns `None` if offset out-of-bounds or there's no termination.
pub fn read_cstring(buf: &[u8], offset: usize) -> Option<String> {
    if offset >= buf.len() {
        return None;
    }
    let mut end = offset;
    while end < buf.len() && buf[end] != 0 {
        end += 1;
    }
    if end == buf.len() {
        return None;
    }
    match std::str::from_utf8(&buf[offset..end]) {
        Ok(s) => Some(s.to_string()),
        Err(_) => None,
    }
}

/// macOS epoch used by WebKit cookie file: seconds since 2001-01-01 00:00:00 UTC
pub fn mac_epoch_to_system_time(secs: f64) -> SystemTime {
    // secs may be fractional; we drop fractional seconds for simplicity
    // 2001-01-01T00:00:00Z in UNIX epoch seconds:
    const MAC_EPOCH_UNIX_SECONDS: i64 = 978307200; // 2001-01-01 00:00:00 UTC in unix secs
    if secs.is_nan() {
        SystemTime::UNIX_EPOCH + Duration::from_secs(MAC_EPOCH_UNIX_SECONDS as u64)
    } else {
        if secs >= 0.0 {
            let total_unix = (MAC_EPOCH_UNIX_SECONDS as f64) + secs;
            let secs_usize = total_unix as u64;
            SystemTime::UNIX_EPOCH + Duration::from_secs(secs_usize)
        } else {
            // negative: before 2001 epoch; clamp to epoch
            SystemTime::UNIX_EPOCH + Duration::from_secs(MAC_EPOCH_UNIX_SECONDS as u64)
        }
    }
}

pub fn write_u32_le(buf: &mut [u8], offset: usize, val: u32) {
    if offset + 4 <= buf.len() {
        buf[offset..offset + 4].copy_from_slice(&val.to_le_bytes());
    }
}

pub fn write_f64_le(buf: &mut [u8], offset: usize, val: f64) {
    if offset + 8 <= buf.len() {
        buf[offset..offset + 8].copy_from_slice(&val.to_le_bytes());
    }
}

pub fn system_time_to_mac_epoch(time: SystemTime) -> f64 {
    use std::time::UNIX_EPOCH;
    const MAC_EPOCH_UNIX_SECONDS: i64 = 978307200;
    match time.duration_since(UNIX_EPOCH) {
        Ok(dur) => (dur.as_secs() as f64) - (MAC_EPOCH_UNIX_SECONDS as f64),
        Err(_) => 0.0,
    }
}
