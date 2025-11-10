use crate::binarycookies::page::Page;
use crate::binarycookies::utils::*;
use std::io::{Error, ErrorKind};
use std::num::Wrapping;

pub const FILE_HEADER: &[u8] = b"cook";

#[derive(Debug, Clone)]
pub struct BinaryCookies {
    pub pages: Vec<Page>,
}

impl BinaryCookies {
    pub fn new(pages: Vec<Page>) -> Self {
        Self { pages }
    }

    pub fn build(pages: &[Page]) -> Vec<u8> {
        let mut buf = Vec::new();
        buf.extend_from_slice(b"cook");

        let num_pages = pages.len() as u32;
        buf.extend_from_slice(&num_pages.to_be_bytes());

        // reserve room for page sizes
        let mut page_sizes = Vec::new();
        for page in pages {
            let page_bytes = page.build();
            let size = page_bytes.len() as u32;
            page_sizes.push((size, page_bytes));
        }

        // write page sizes
        for (size, _) in &page_sizes {
            buf.extend_from_slice(&size.to_be_bytes());
        }

        // write pages
        for (_, bytes) in &page_sizes {
            buf.extend_from_slice(&bytes);
        }

        let mut checksum = Wrapping(0u32);
        for (_, page_bytes) in page_sizes {
            for i in (0..page_bytes.len()).step_by(4) {
                checksum += Wrapping(page_bytes[i] as u32);
            }
        }

        // Append checksum as big-endian u32
        buf.extend_from_slice(&checksum.0.to_be_bytes());

        buf.extend_from_slice(&[0x07, 0x17, 0x20, 0x05, 0x00, 0x00, 0x00, 0x4B]);
        // footer: 8 zero bytes
        // buf.extend_from_slice(&[0u8; 8]);
        buf
    }

    /// Parse the whole .binarycookies file bytes into pages and cookies.
    pub fn parse(buf: &[u8]) -> Result<BinaryCookies, Error> {
        // Check header
        if buf.len() < 8 {
            return Err(Error::new(ErrorKind::InvalidData, "file too small"));
        }
        if &buf[0..4] != FILE_HEADER {
            return Err(Error::new(
                ErrorKind::InvalidData,
                "invalid header, not a binarycookies file",
            ));
        }

        // number of pages at offset 4..8
        let num_pages = read_u32_be(buf, 4)
            .ok_or_else(|| Error::new(ErrorKind::InvalidData, "couldn't read page count"))?
            as usize;

        // next num_pages*4 bytes are page sizes (or page offsets)
        let mut page_sizes = Vec::with_capacity(num_pages);
        let offset = 8usize;
        for i in 0..num_pages {
            let page_size = read_u32_be(buf, offset + i * 4)
                .ok_or_else(|| Error::new(ErrorKind::InvalidData, "invalid page size"))?
                as usize;
            page_sizes.push(page_size);
        }

        // following that, pages start after 8 + 4*num_pages bytes.
        let pages_start = 8 + num_pages * 4;
        let mut pages = Vec::with_capacity(num_pages);
        let mut cur = pages_start;
        for &psize in &page_sizes {
            if psize == 0 {
                continue;
            }
            if cur + psize > buf.len() {
                // protect bounds
                break;
            }
            let page_buf = &buf[cur..cur + psize];
            match Page::parse(page_buf) {
                Ok(p) => pages.push(p),
                Err(e) => {
                    // skip malformed pages
                    eprintln!("warning: skipping page parse error: {}", e);
                }
            }
            cur += psize;
        }

        Ok(BinaryCookies::new(pages))
    }
}
