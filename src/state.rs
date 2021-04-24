use crate::{error::Error, poll::Poll};

use rand::{distributions::Alphanumeric, prelude::ThreadRng, Rng};
use std::collections::BTreeMap;

pub struct State {
  pub polls: BTreeMap<String, Poll>,
  rng: ThreadRng,
}

impl State {
  pub fn load() -> Self {
    Self {
      polls: BTreeMap::new(),
      rng: rand::thread_rng(),
    }
  }

  fn generate_poll_id(&mut self) -> String {
    loop {
      let id = (&mut self.rng)
        .sample_iter(Alphanumeric)
        .take(16)
        .map(|n| char::from(n).to_ascii_lowercase())
        .collect::<String>();

      if !self.polls.contains_key(&id) {
        return id;
      }
    }
  }

  pub fn add_poll(&mut self, title: String, desc: String) -> String {
    let poll_id = self.generate_poll_id();

    self
      .polls
      .insert(poll_id.clone(), Poll::new(poll_id.clone(), title, desc));

    poll_id
  }

  pub fn vote(&mut self, poll_id: &str, email: String, weight: f32) -> Result<(), Error> {
    self
      .polls
      .get_mut(poll_id)
      .ok_or(Error::from(format!("Couldn't find poll '{}'", poll_id)))?
      .vote(email, weight)?;

    Ok(())
  }
}
