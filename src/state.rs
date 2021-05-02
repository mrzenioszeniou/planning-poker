use crate::{error::Error, poll::Poll};

use rand::{distributions::Alphanumeric, Rng};
use std::collections::BTreeMap;

use std::sync::Mutex;

pub struct AppState {
  polls: Mutex<BTreeMap<String, Poll>>,
}

impl AppState {
  pub fn load() -> Self {
    Self {
      polls: Mutex::from(BTreeMap::new()),
    }
  }

  fn generate_poll_id(&self) -> String {
    let mut rng = rand::thread_rng();

    loop {
      let id = (&mut rng)
        .sample_iter(Alphanumeric)
        .take(8)
        .map(|n| char::from(n).to_ascii_lowercase())
        .collect::<String>();

      match self.polls.lock() {
        Ok(polls) => {
          if !polls.contains_key(&id) {
            return id;
          }
        }
        _ => panic!("Mutex poisoned"),
      }
    }
  }

  pub fn add_poll(&self, title: String, desc: String) -> String {
    let poll_id = self.generate_poll_id();

    match self.polls.lock() {
      Ok(mut polls) => {
        polls.insert(poll_id.clone(), Poll::new(poll_id.clone(), title, desc));
      }
      _ => panic!("Mutex poisoned"),
    }

    println!("Poll '{}' created", poll_id);

    poll_id
  }

  pub fn vote(&self, poll_id: &str, email: String, weight: f64) -> Result<(), Error> {
    match self.polls.lock() {
      Ok(mut polls) => {
        polls
          .get_mut(poll_id)
          .ok_or(Error::from(format!("Couldn't find poll '{}'", poll_id)))?
          .vote(email, weight)?;
      }
      _ => panic!("Mutex poisoned"),
    }

    Ok(())
  }

  pub fn get_poll_info(&self, poll_id: &str) -> Option<Poll> {
    match self.polls.lock() {
      Ok(polls) => polls.get(poll_id).cloned(),
      _ => panic!("Mutex poisoned"),
    }
  }
}
