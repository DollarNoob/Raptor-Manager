use std::time::{Duration, SystemTime};
use crate::binarycookies::utils::to_cocoa_timestamp;

#[derive(Debug, Clone)]
pub struct Cookie {
    pub domain: String,
    pub name: String,
    pub path: Option<String>,
    pub value: String,
    pub secure: Option<bool>,
    pub http_only: Option<bool>,
    pub expiration: Option<SystemTime>,
    pub creation: Option<SystemTime>
}

impl Cookie {
    pub fn new(
        domain: String,
        name: String,
        path: Option<String>,
        value: String,
        secure: Option<bool>,
        http_only: Option<bool>,
        expiration: Option<SystemTime>,
        creation: Option<SystemTime>
    ) -> Self {
        Self {
            domain,
            name,
            path,
            value,
            secure,
            http_only,
            expiration,
            creation
        }
    }

    pub fn build(&self) -> Vec<u8> {
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

        let domain_offset: u32 = 56;
        let name_offset: u32 = domain_offset + domain_bytes.len() as u32;
        let path_offset: u32 = name_offset + name_bytes.len() as u32;
        let value_offset: u32 = path_offset + path_bytes.len() as u32;
        let size: u32 = value_offset + value_bytes.len() as u32;
        let mut flags: u32 = 0;
        if let Some(secure) = self.secure {
            if secure {
                flags |= 1;
            }
        }
        if let Some(http_only) = self.http_only {
            if http_only {
                flags |= 1 << 2;
            }
        }

        // default: 1 month
        let expiration = self.expiration
            .map(to_cocoa_timestamp)
            .unwrap_or_else(|| to_cocoa_timestamp(SystemTime::now() + Duration::from_secs(60 * 60 * 24 * 30)));
        let creation = self.creation
            .map(to_cocoa_timestamp)
            .unwrap_or_else(|| to_cocoa_timestamp(SystemTime::now()));

        let mut bytes = Vec::with_capacity(size as usize);
        bytes.extend_from_slice(&size.to_le_bytes());          // size
        bytes.extend_from_slice(&(1 as u32).to_le_bytes());    // version
        bytes.extend_from_slice(&flags.to_le_bytes());         // flags
        bytes.extend_from_slice(&(0 as u32).to_le_bytes());    // has port
        bytes.extend_from_slice(&domain_offset.to_le_bytes()); // domain offset
        bytes.extend_from_slice(&name_offset.to_le_bytes());   // name offset
        bytes.extend_from_slice(&path_offset.to_le_bytes());   // path offset
        bytes.extend_from_slice(&value_offset.to_le_bytes());  // value offset
        bytes.extend_from_slice(&(0 as u32).to_le_bytes());    // comment offset
        bytes.extend_from_slice(&(0 as u32).to_le_bytes());    // comment url offset
        bytes.extend_from_slice(&expiration.to_le_bytes());    // expiration cocoa timestamp (in seconds)
        bytes.extend_from_slice(&creation.to_le_bytes());      // creation cocoa timestamp (in seconds)
        bytes.extend_from_slice(&domain_bytes);                // domain
        bytes.extend_from_slice(&name_bytes);                  // name
        bytes.extend_from_slice(&path_bytes);                  // path
        bytes.extend_from_slice(&value_bytes);                 // value

        bytes
    }
}
