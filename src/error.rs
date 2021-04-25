use std::{
  fmt::{self, Display},
  io::Cursor,
};

use rocket::{http::Status, response::Responder, response::Response};

#[derive(Debug)]
pub struct Error {
  msg: String,
  status: Option<Status>,
}

impl Error {
  pub fn new(msg: &str, status: Status) -> Self {
    Self {
      msg: msg.to_string(),
      status: Some(status),
    }
  }

  pub fn status(mut self, status: Status) -> Self {
    self.status = Some(status);
    self
  }
}

impl Display for Error {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{}", self.msg)
  }
}

impl From<String> for Error {
  fn from(from: String) -> Self {
    Self {
      msg: from,
      status: None,
    }
  }
}

impl From<&str> for Error {
  fn from(from: &str) -> Self {
    Self {
      msg: from.to_string(),
      status: None,
    }
  }
}

impl<'a, E: std::error::Error + 'a> From<E> for Box<Error> {
  fn from(e: E) -> Self {
    Box::new(Error {
      msg: e.to_string(),
      status: None,
    })
  }
}

// impl<E> From<E> for Error
// where
//   E: std::error::Error,
// {
//   fn from(e: E) -> Self {
//     Self {
//       msg: e.to_string(),
//       status: None,
//     }
//   }
// }

impl<'r> Responder<'r> for Error {
  fn respond_to(self, _: &rocket::Request) -> rocket::response::Result<'r> {
    Response::build()
      .sized_body(Cursor::new(self.msg))
      .status(self.status.unwrap_or(Status::InternalServerError))
      .ok()
  }
}
