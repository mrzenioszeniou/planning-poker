# Planning Poker

This is a simple _Planning Poker_ web app that can be used to collaboratively estimate the 
complexity of a task. The app was put together using the [Rocket](https://rocket.rs/) web
framework which is built with Rust. The frontend part is a simple React app bootstrapped with 
[Create React App](https://github.com/facebook/create-react-app).

## Requirements

To deploy the app server you will need:

* A nightly Rust toolchain.
* Node.js & npm.

### Rust

The de facto way of installing a Rust toolchain is with [rustup](https://rustup.rs/).
Follow the instructions on the page and verify the installation with:
```
rustup show
```
This should show your installed and active toolchain. The installer also includes the Rust package
manager `cargo`:
```
cargo --version
```


### Node.js

You can grab a Node.js installer from the [downloads page](https://nodejs.org/en/download/) or you
can install it through a package manager. Instructions for the latter can be found on the same page.


## Running

To run the web app you will need to build the frontend. First, set `frontend` as your working
directory:
```
cd frontend
```
Install node packages:
```
npm install
```
And build:
```
npm run build
```
This should build the app in `frontend/build` where our Rocket server will go snooping for static files.

Now all you have to do is run the server from the root directory:
```
cd ..
```
You should now be at the root of the project, where all you need to do is:
```
cargo run
```
This will download, compile, and link all Rust dependencies. Do not be alarmed by the torrent of
information on your terminal, nothing particularly interesting is going on. Once the project is
built cargo will launch the binary. 

Rocket will let you know where the server was mounted:
```
🚀 Rocket has launched from http://localhost:8000
```

### Troubleshooting

Rocket needs a nightly version of Rust to compile due to some of the advanced features it uses.
Normally you shouldn't have to install it explicitly because this project includes a
`rust-toolchain` file which lets `cargo ` know that nightly Rust is required. If you're experiencing issues with building or running however, try the good ol' manual way of doing things. 

Get rid of `rust-toolchain`:
```
rm rust-toolchain
```

Manually install the latest nightly toolchain and set it as default:
```
rustup default nightly
```


## Architecture

The overall architecture revolves around polls. A poll has a unique alphanumeric identifier, a 
title, a description, and a set of votes associated with it. Each vote consists of an email and a
weight (0, 0.5, 1, 2, 3, 5, 8, 13). The server offers three endpoints to manipulate the data:
* `POST` @ `/poll` creates a new poll. The request's body is expected to look like this:
  ```json
  {
    "title": "Lorem Ipsum",
    "desc": "Lorem ipsum dolor sit amet, consectetur adipiscing elit..."
  }
  ```
  The response contains the new poll's unique ID.
* `GET` @ `/poll/<id>` gets the data for the poll with ID `<id>`. The response's body looks like 
  this:
  ```json
  {
    "title": "Lorem Ipsum",
    "desc": "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    "votes": {
      "mrzenioszeniou@gmail.com": 4,
      "ricksanchez@c137.com": 0,
      "mortysmith@c137.com": 13,
    }
  }
  ```
* `POST` @ `/poll/<id>` casts a vote on the poll with ID `<id>`. The request's body is expected to 
  look like this:
  ```json
  {
    "email": "terry@scary.com",
    "weight": 0.5
  }
  ```

Note that there is no persistence between sessions or any database to speak of. All polls and votes
are scrapped when the process exits.

The server also handles the static files generated from the React frontend. There are two React
components, `App` and `Poll`. The `Poll` component is essentially in charge of all that a voter
should see under `/<poll_id>`. Everything else, including the creation a new poll is handled by
the `App` component. A simple React router makes sure we render `App` on `/` and `Poll` on 
`/<poll_id>`. On the Rust side of things, all `GET` requests on `/` are answered with the frontend's
`index.html`. The same is true of all requests on `/<something>` if a poll with ID `<something>`
exists. If no such poll exists however, we assume that the request refers to a static file, which
we attempt to load from `frontend/build`.
