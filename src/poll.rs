use std::collections::HashMap;

use crate::error::Error;

#[derive(Debug, Serialize)]
pub struct Poll {
  id: String,
  title: String,
  desc: String,
  votes: HashMap<String, f32>,
}

impl Poll {
  pub fn new(id: String, title: String, desc: String) -> Self {
    Self {
      id: id.to_string(),
      title: title.to_string(),
      desc: desc.to_string(),
      votes: HashMap::new(),
    }
  }

  pub fn vote(&mut self, email: String, weight: f32) -> Result<(), Error> {
    check_weight(weight)?;
    self.votes.insert(email, weight);
    Ok(())
  }
}

fn check_weight(weight: f32) -> Result<(), Error> {
  if weight == 0.0
    || weight == 0.5
    || weight == 1.0
    || weight == 2.0
    || weight == 3.0
    || weight == 5.0
    || weight == 8.0
    || weight == 13.0
  {
    Ok(())
  } else {
    Err(Error::from(format!("{} is not a valid weight", weight)))
  }
}
