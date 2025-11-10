// The whole thing is ported from JavaScript by ChatGPT.
// I know it's very messy but IT WORKS SO IM NOT TOUCHING IT C:

// Comments aren't accurate because I didn't touch them while fixing the code
// so check this repo instead if you need help understanding.

// Reference for Binary Cookies:
// https://github.com/interstateone/BinaryCookies
// https://github.com/cixtor/binarycookies

pub mod binarycookies;
pub mod cookie;
pub mod page;
pub mod utils;

pub use binarycookies::BinaryCookies;
pub use cookie::{Cookie, CookieFlags};
pub use page::Page;
