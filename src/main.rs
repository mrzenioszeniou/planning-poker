#![feature(proc_macro_hygiene, decl_macro)]

// #[macro_use]
extern crate rand;
extern crate rocket;

mod error;
mod poll;
mod state;

use error::Error;
use state::State;

// Get poll

// Create a poll

// Vote on poll

fn main() -> Result<(), Error> {
  // rocket::ignite().mount("/", routes![hello]).launch();

  let mut state = State::load();

  let id = state.add_poll(String::from("Add some stuff to the thing"), String::from("The thing has a few stuff, but some more should be added. We wouldn't want to be the team with the less amount of stuff in their thing, would we?"));

  state.vote(&id, String::from("foo@bar.com"), 2.0)?;
  state.vote(&id, String::from("bar@foo.com"), 8.0)?;

  Ok(())
}
