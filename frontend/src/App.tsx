import React from 'react';
import './App.css';
import { Config } from './Constants';

enum Stage {
  Start,
  Join,
  Create,
  Created,
}

interface Props {};

interface State {
  stage: Stage;
  title: string;
  description: string;
  poll: string;
  valid: boolean;
}

class App extends React.Component<Props, State>  {

  constructor(props: Props) {
    super(props);
    this.state = {
      stage: Stage.Start,
      title: "",
      description: "",
      poll: "",
      valid: true,
    };
  }

  render() {
    switch (this.state.stage) {

      case Stage.Start:
        return (
          <div className="base">
            <div className="centered column">
              <div className="button green" onClick={() => this.setState({stage: Stage.Join})}>Join Poll</div>
              <div className="button orange" onClick={() => this.setState({stage: Stage.Create})}>Create Poll</div>
            </div>
          </div>
        );

      case Stage.Create:
        return (
          <div className="base">
            <div className="input-title">Title</div>
            <input id="title" type="text" value={this.state.title} onChange={(e) => this.setState({title: e.target.value})}/>
            <div className="input-title">Description</div>
            <textarea id="description" value={this.state.description} onChange={(e) => this.setState({description: e.target.value})} rows={14}/>
            <div className="button orange centered" onClick={() => this.createPoll()} >Create Poll</div>
            <a className="subtle-link centered" href="/">Back</a>
          </div>
        );

      case Stage.Join:
        return (
          <div className="base centered">
            <div className="input-title">Enter code to join the poll:</div>
            <input className="input-poll" id="poll" type="text" value={this.state.poll} onChange={(e) => this.setState({poll: e.target.value})}/>
            <div
              className="warning"
              style={{'display': this.state.valid ? 'none' : 'unset'}}>No such poll could be found.</div>
            <div className="button green" onClick={() => this.joinPoll()}>Join</div>
            <a className="subtle-link" href="/">Back</a>
          </div>
        );

      case Stage.Created:
        return (
          <div className="base centered">
            <div>Poll Created!</div>
            <a href={window.location + this.state.poll}>{window.location + this.state.poll}</a>
          </div>
        );
    }
  }

  joinPoll() {
    
    const url = Config.API_URL + 'poll/' + this.state.poll;

    const requestOptions = {
      method: 'GET',
      header: {'Content-Type': 'application/json'},
    };
    
    fetch(url, requestOptions)
      .then(response => {
        console.log(response);
        if (response.ok) {
          window.location.assign(this.state.poll);
        } else {
          this.setState({valid: false});
        }
      });
  }

  createPoll() {
  
    if (this.state.title.length !== 0) {
  
      const url = Config.API_URL + 'poll';

      const requestOptions = {
        method: 'POST',
        header: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          title: this.state.title,
          desc: this.state.description,
        }),
      };

      fetch(url, requestOptions)
        .then(response => response.text())
        .then(data => {
          console.log(data);
          this.setState({
            stage: Stage.Created,
            poll: data,
          })
        });
  
    }
  }
}

export default App;
