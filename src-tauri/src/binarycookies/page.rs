use crate::binarycookies::Cookie;

pub const PAGE_HEADER: &[u8] = &[0x00, 0x00, 0x01, 0x00];
pub const PAGE_FOOTER: &[u8] = &[0x00, 0x00, 0x00, 0x00];

#[derive(Debug, Clone)]
pub struct Page {
    pub cookies: Vec<Cookie>,
}

impl Page {
    pub fn new(cookies: Vec<Cookie>) -> Self {
        Self { cookies }
    }

    pub fn build(&self) -> Vec<u8> {
        let mut cookies_offset_bytes = vec![];
        let mut cookies_bytes = vec![];

        let mut offset = 12 + (&self.cookies.len() * 4) as u32;
        for cookie in &self.cookies {
            let cookie_bytes = cookie.build();
            cookies_offset_bytes.push(offset);
            offset += cookie_bytes.len() as u32;
            cookies_bytes.push(cookie_bytes);
        }

        let mut bytes = vec![];
        bytes.extend_from_slice(PAGE_HEADER); // header (0x00000100)
        bytes.extend_from_slice(&(self.cookies.len() as u32).to_le_bytes()); // number of cookies
        for cookie_offset in cookies_offset_bytes {
            // repeat for n cookies
            bytes.extend_from_slice(&cookie_offset.to_le_bytes()); // cookie n offset
        }
        bytes.extend_from_slice(PAGE_FOOTER); // footer (0x00000000)
        for cookie_bytes in cookies_bytes {
            // repeat for n cookies
            bytes.extend_from_slice(&cookie_bytes); // cookie n
        }

        bytes
    }
}
