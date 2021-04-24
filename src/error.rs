use std::fmt::{self, Display};

#[derive(Debug)]
pub struct Error {
  msg: String,
}

impl Display for Error {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{}", self.msg)
  }
}

impl From<String> for Error {
  fn from(from: String) -> Self {
    Self { msg: from }
  }
}

impl From<&str> for Error {
  fn from(from: &str) -> Self {
    Self {
      msg: from.to_string(),
    }
  }
}
