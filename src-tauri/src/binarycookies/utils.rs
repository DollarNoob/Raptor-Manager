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

pub fn to_unix_timestamp(timestamp: f64) -> SystemTime {
    SystemTime::UNIX_EPOCH + Duration::from_secs((timestamp as u64) + 978307200)
}

pub fn to_cocoa_timestamp(time: SystemTime) -> f64 {
    match time.duration_since(SystemTime::UNIX_EPOCH) {
        Ok(duration) => (duration.as_secs() - 978307200) as f64,
        Err(_) => 0.0
    }
}
