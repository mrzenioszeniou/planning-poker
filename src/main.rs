#![feature(proc_macro_hygiene, decl_macro)]

extern crate rand;
#[macro_use]
extern crate rocket;
#[macro_use]
extern crate serde;

use rocket::{http::ContentType, http::Status, response::NamedFile, Response, State};
use serde_json::Value;
use state::AppState;
use std::io::Cursor;
use std::path::PathBuf;
use std::str::FromStr;

mod error;
mod poll;
mod state;

use crate::error::Error;

// #[get("/res/<path..>")]
// fn get_resource(path: PathBuf) -> Result<NamedFile, Error> {
//   let mut final_path = PathBuf::from_str("res").map_err(|e| Error::from(e.to_string()))?;
//   final_path.push(path);
//   NamedFile::open(final_path).map_err(|e| Error::new(&format!("{}", e), Status::NotFound))
// }

// #[get("/")]
// fn index() -> Result<NamedFile, Error> {
//   let path = PathBuf::from_str("res/html/index.html").map_err(|e| Error::from(e.to_string()))?;
//   NamedFile::open(path).map_err(|e| Error::new(&format!("{}", e), Status::NotFound))
// }

// #[get("/poll")]
// fn poll_page() -> Result<NamedFile, Error> {
//   let path = PathBuf::from_str("res/html/create.html").map_err(|e| Error::from(e.to_string()))?;
//   NamedFile::open(path).map_err(|e| Error::new(&format!("{}", e), Status::NotFound))
// }

/// Gets info on a specific poll
#[get("/poll/<id>", format = "application/json")]
fn get_poll(id: String, state: State<AppState>) -> Result<Response, Error> {
  let mut response = Response::new();

  match state.get_poll_info(&id) {
    Some(poll) => {
      response.set_sized_body(Cursor::new(
        serde_json::to_vec(&poll).map_err(|_| Error::from("Shiet"))?,
      ));
      response.set_status(Status::Ok);
    }
    None => response.set_status(Status::NotFound),
  };

  Ok(response)
}

/// Creates new poll
#[post("/poll", data = "<data>")]
fn create_poll(data: String, state: State<AppState>) -> Result<Response, Error> {
  let body: Value = serde_json::from_str(&data).unwrap();

  let title = body
    .get("title")
    .map(|v| v.as_str())
    .flatten()
    .ok_or(Error::new(
      "'title' field could not be found in body",
      Status::BadRequest,
    ))?;

  let desc = body
    .get("desc")
    .map(|v| v.as_str())
    .flatten()
    .ok_or(Error::new(
      "'desc' field could not be found in body",
      Status::BadRequest,
    ))?;

  let id = state
    .inner()
    .add_poll(String::from(title), String::from(desc));

  let mut response = Response::new();
  response.set_sized_body(Cursor::new(id));
  response.set_status(Status::Ok);
  response.set_header(ContentType::Plain);

  Ok(response)
}

/// Votes on a specific poll
#[post("/poll/<id>", data = "<data>")]
fn vote(id: String, data: String, state: State<AppState>) -> Result<Response, Error> {
  let body: Value = serde_json::from_str(&data).unwrap();

  let email = body
    .get("email")
    .map(|v| v.as_str())
    .flatten()
    .ok_or(Error::new(
      "'email' field could not be found in body",
      Status::BadRequest,
    ))?;

  let weight = body
    .get("weight")
    .map(|v| v.as_f64())
    .flatten()
    .ok_or(Error::new(
      "'weight' field could not be found in body",
      Status::BadRequest,
    ))?;

  match state.vote(&id, email.to_lowercase(), weight) {
    Ok(()) => Response::build().status(Status::Ok).ok(),
    Err(e) => Err(e.status(Status::NotFound)),
  }
}

fn main() -> Result<(), Error> {
  let state = AppState::load();

  rocket::ignite()
    .mount("/", routes![get_poll, create_poll, vote])
    .manage(state)
    .launch();

  Ok(())
}
