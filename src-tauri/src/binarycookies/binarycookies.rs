use crate::binarycookies::page::Page;

pub const FILE_HEADER: &[u8] = &[0x63, 0x6F, 0x6F, 0x6B]; // cook
pub const FILE_FOOTER: &[u8] = &[0x07, 0x17, 0x20, 0x05, 0x00, 0x00, 0x00, 0x4B];

#[derive(Debug, Clone)]
pub struct BinaryCookies {
    pub pages: Vec<Page>,
}

impl BinaryCookies {
    pub fn new(pages: Vec<Page>) -> Self {
        Self { pages }
    }

    pub fn build(&self) -> Vec<u8> {
        let mut pages_size_bytes = vec![];
        let mut pages_bytes = vec![];

        let mut checksum = 0;
        for page in &self.pages {
            let page_bytes = page.build();
            pages_size_bytes.push(page_bytes.len() as u32);

            // calculate checksum
            for i in (0..page_bytes.len()).step_by(4) {
                checksum += page_bytes[i] as u32;
            }

            pages_bytes.push(page_bytes);
        }

        let mut bytes = vec![];
        bytes.extend_from_slice(FILE_HEADER); // magic (cook)
        bytes.extend_from_slice(&(self.pages.len() as u32).to_be_bytes()); // number of pages
        for page_size in pages_size_bytes {
            // repeat for n pages
            bytes.extend_from_slice(&page_size.to_be_bytes()); // page n size
        }
        for page_bytes in pages_bytes {
            // repeat for n pages
            bytes.extend_from_slice(&page_bytes); // page n
        }
        bytes.extend_from_slice(&checksum.to_be_bytes()); // checksum
        bytes.extend_from_slice(FILE_FOOTER); // footer (0x071720050000004B)

        bytes
    }
}
