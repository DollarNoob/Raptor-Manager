use crate::binarycookies::utils::{system_time_to_mac_epoch, write_f64_le, write_u32_le};
use std::time::SystemTime;

#[derive(Debug, Clone)]
pub struct Cookie {
    pub domain: String,
    pub name: String,
    pub path: Option<String>,
    pub value: String,
    pub secure: bool,
    pub http_only: bool,
    pub expiration: Option<SystemTime>,
    pub creation: Option<SystemTime>,
}

#[derive(Debug, Clone, Copy)]
pub struct CookieFlags {
    pub secure: bool,
    pub http_only: bool,
}

impl Cookie {
    pub fn new(
        domain: String,
        name: String,
        value: String,
        path: Option<String>,
        flags: CookieFlags,
        expiration: Option<SystemTime>,
        creation: Option<SystemTime>,
    ) -> Self {
        Self {
            domain,
            name,
            path,
            value,
            secure: flags.secure,
            http_only: flags.http_only,
            expiration,
            creation,
        }
    }

    pub fn build(&self) -> Vec<u8> {
        // Convert text fields to null-terminated UTF-8 byte arrays
        let domain_bytes = {
            let mut v = self.domain.clone().into_bytes();
            v.push(0);
            v
        };
        let name_bytes = {
            let mut v = self.name.clone().into_bytes();
            v.push(0);
            v
        };
        let path_bytes = {
            let mut v = self.path.clone().unwrap_or_else(|| "/".into()).into_bytes();
            v.push(0);
            v
        };
        let value_bytes = {
            let mut v = self.value.clone().into_bytes();
            v.push(0);
            v
        };

        // --- Layout offsets (exactly like the TS version) ---
        let domain_offset = 56u32;
        let name_offset = domain_offset + domain_bytes.len() as u32;
        let path_offset = name_offset + name_bytes.len() as u32;
        let value_offset = path_offset + path_bytes.len() as u32;
        let size = value_offset + value_bytes.len() as u32;

        // --- Flags ---
        let mut flags: u32 = 0;
        if self.secure {
            flags |= 1;
        }
        if self.http_only {
            flags |= 1 << 2;
        }

        // --- Dates (convert to Cocoa epoch seconds) ---
        let expiration_secs = self
            .expiration
            .map(system_time_to_mac_epoch)
            .unwrap_or_else(|| system_time_to_mac_epoch(std::time::SystemTime::now()));
        let creation_secs = self
            .creation
            .map(system_time_to_mac_epoch)
            .unwrap_or_else(|| system_time_to_mac_epoch(std::time::SystemTime::now()));

        // --- Allocate full buffer ---
        let mut buf = Vec::with_capacity(size as usize);

        // Header = 12 Int32 (4 bytes each) + 2 Double (8 bytes each) = 56 bytes
        buf.resize(56, 0);

        // Fill header fields (LE like TypeScript’s toInt32LE)
        write_u32_le(&mut buf, 0, size); // size
        write_u32_le(&mut buf, 4, 1); // version
        write_u32_le(&mut buf, 8, flags); // flags
        write_u32_le(&mut buf, 12, 0); // has port
        write_u32_le(&mut buf, 16, domain_offset);
        write_u32_le(&mut buf, 20, name_offset);
        write_u32_le(&mut buf, 24, path_offset);
        write_u32_le(&mut buf, 28, value_offset);
        write_u32_le(&mut buf, 32, 0); // comment offset
        write_u32_le(&mut buf, 36, 0); // comment URL offset
        write_f64_le(&mut buf, 40, expiration_secs);
        write_f64_le(&mut buf, 48, creation_secs);

        // Append string data
        buf.extend_from_slice(&domain_bytes);
        buf.extend_from_slice(&name_bytes);
        buf.extend_from_slice(&path_bytes);
        buf.extend_from_slice(&value_bytes);

        buf
    }
}
