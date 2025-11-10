use crate::binarycookies::utils::*;
use crate::binarycookies::{Cookie, CookieFlags};
use std::io::{Error, ErrorKind};

#[derive(Debug, Clone)]
pub struct Page {
    pub cookies: Vec<Cookie>,
}

impl Page {
    pub fn new(cookies: Vec<Cookie>) -> Self {
        Self { cookies }
    }

    pub fn build(&self) -> Vec<u8> {
        let mut buf = Vec::new();
        let num_cookies = self.cookies.len() as u32;

        // page header + num cookies
        buf.extend_from_slice(&[0x00, 0x00, 0x01, 0x00]);
        buf.extend_from_slice(&num_cookies.to_be_bytes());

        // reserve space for cookie offsets
        let mut offsets = Vec::new();
        let offsets_base = buf.len();
        buf.extend_from_slice(&vec![0u8; num_cookies as usize * 4]);

        // page footer
        buf.extend_from_slice(&[0u8; 4]);

        // build cookies and append
        for cookie in &self.cookies {
            let cookie_bytes = cookie.build();
            let offset = buf.len() as u32;
            offsets.push(offset);
            buf.extend_from_slice(&cookie_bytes);
        }

        // fill header fields
        write_u32_le(&mut buf, 4, num_cookies);
        for (i, off) in offsets.iter().enumerate() {
            write_u32_le(&mut buf, offsets_base + i * 4, *off);
        }

        buf
    }

    /// Parse a page buffer. This expects the page layout used in .binarycookies:
    /// - first 4 bytes: page header (0x00000100)
    /// - 4 bytes: number of cookies (n)
    /// - n*4 bytes: cookie offsets (relative to page start)
    /// - ... cookie blobs
    pub fn parse(page_buf: &[u8]) -> Result<Page, Error> {
        // number of cookies at offset 4 (4..8)
        let num_cookies = read_u32_le(page_buf, 4)
            .ok_or_else(|| Error::new(ErrorKind::InvalidData, "couldn't read num cookies"))?
            as usize;

        let mut cookie_offsets = Vec::with_capacity(num_cookies);
        let offsets_base = 8;
        for i in 0..num_cookies {
            let off = read_u32_le(page_buf, offsets_base + i * 4)
                .ok_or_else(|| Error::new(ErrorKind::InvalidData, "invalid cookie offset"))?
                as usize;
            cookie_offsets.push(off);
        }

        let mut cookies = Vec::with_capacity(num_cookies);
        for &c_off in &cookie_offsets {
            if c_off + 4 > page_buf.len() {
                continue;
            }
            // cookie size is first 4 bytes at cookie offset (LE)
            let cookie_size = read_i32_le(page_buf, c_off)
                .ok_or_else(|| Error::new(ErrorKind::InvalidData, "invalid cookie size"))?
                as usize;
            if cookie_size == 0 || c_off + cookie_size > page_buf.len() {
                // skip malformed
                continue;
            }
            let cookie_blob = &page_buf[c_off..c_off + cookie_size];

            // cookie fields based on known layout:
            // 0..4: cookie size (already read)
            // 4..8: unknown
            // 8..12: flags
            // 12..16: unknown
            // 16..20: ??? (we'll shift to common attributes indices)
            // Known offsets (from reference):
            // name_offset: cookie_blob.readUInt32LE(4); but different libs differ. We'll use common mapping:
            // After some canonical references, the offsets are:
            // at bytes 4,8,12,16,... there are offsets for name/value/domain/path
            //
            // We'll try one widely used layout:
            if cookie_blob.len() < 36 {
                continue;
            }

            // Many implementations use offsets at positions:
            // name_offset @ 4, value_offset @ 8, domain_offset @ 12, path_offset @ 16
            // however some have extra fields; we'll try to use that mapping but check bounds.
            let domain_off_rel = read_u32_le(cookie_blob, 16).unwrap_or(0) as usize;
            let name_off_rel = read_u32_le(cookie_blob, 20).unwrap_or(0) as usize;
            let path_off_rel = read_u32_le(cookie_blob, 24).unwrap_or(0) as usize;
            let value_off_rel = read_u32_le(cookie_blob, 28).unwrap_or(0) as usize;

            let domain =
                read_cstring(cookie_blob, domain_off_rel).unwrap_or_else(|| "".to_string());
            let name = read_cstring(cookie_blob, name_off_rel).unwrap_or_else(|| "".to_string());
            let path = read_cstring(cookie_blob, path_off_rel);
            let value = read_cstring(cookie_blob, value_off_rel).unwrap_or_else(|| "".to_string());

            // Flags: many implementations store flags in a u32 at offset 20 or 36.
            // We'll try at offset 20.
            let flags_raw = read_u32_le(cookie_blob, 8).unwrap_or(0);
            let flags = CookieFlags {
                secure: (flags_raw & 0x01) != 0,
                http_only: (flags_raw & 0x04) != 0,
            };

            // Creation and expiration times often stored as doubles at offsets 24 and 32:
            let creation = read_f64_le(cookie_blob, 24).map(mac_epoch_to_system_time);
            let expiration = read_f64_le(cookie_blob, 32).map(mac_epoch_to_system_time);

            let cookie = Cookie::new(domain, name, value, path, flags, expiration, creation);
            cookies.push(cookie);
        }

        Ok(Page::new(cookies))
    }
}
