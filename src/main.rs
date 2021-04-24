#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use]
extern crate rocket;
extern crate rand;
#[macro_use]
extern crate serde;

mod error;
mod poll;
mod state;

use error::Error;
use rocket::{http::Status, Response, State};
use serde_json::Value;
use state::AppState;

use std::io::Cursor;

#[get("/poll/<id>")]
fn get_poll(id: String, state: State<AppState>) -> Response {
  let mut response = Response::new();

  match state.get_poll_info(&id) {
    Some(poll) => {
      response.set_sized_body(Cursor::new(poll));
      response.set_status(Status::Ok);
    }
    None => response.set_status(Status::NotFound),
  };

  response
}

#[post("/poll", data = "<data>")]
fn create_poll(data: String, state: State<AppState>) -> Response {
  let value: Value = serde_json::from_str(&data).unwrap();

  let title = value.get("title").unwrap().as_str().unwrap();
  let desc = value.get("desc").unwrap().as_str().unwrap();

  let id = state
    .inner()
    .add_poll(String::from(title), String::from(desc));

  let mut response = Response::new();
  response.set_sized_body(Cursor::new(id));
  response.set_status(Status::Ok);

  response
}

// Vote on poll

fn main() -> Result<(), Error> {
  let state = AppState::load();

  let id = state.add_poll(String::from("Add some stuff to the thing"), String::from("The thing has a few stuff, but some more should be added. We wouldn't want to be the team with the less amount of stuff in their thing, would we?"));

  state.vote(&id, String::from("foo@bar.com"), 2.0)?;
  state.vote(&id, String::from("bar@foo.com"), 8.0)?;

  rocket::ignite()
    .mount("/", routes![get_poll, create_poll])
    .manage(state)
    .launch();

  Ok(())
}
