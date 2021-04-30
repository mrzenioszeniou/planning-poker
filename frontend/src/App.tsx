import React from 'react';
import './App.css';

enum Stage {
  Start,
  Join,
  Create
}

interface Props {};

interface State {
  stage: Stage;
  title: string;
  description: string;
}

class App extends React.Component<Props, State>  {

  constructor(props: Props) {
    super(props);
    this.state = {
      stage: Stage.Start,
      title: "Add some stuff to the thing",
      description: "The thing has a few stuff, but some more should be added. We wouldn't want to be the team with the less amount of stuff in their thing, would we?",
    };
  }

  render() {
    switch (this.state.stage) {

      case Stage.Start:
        return (
          <div className="base">
            <div className="centered column">
              <a className="button green">Join Poll</a>
              <a className="button orange" onClick={() => this.setState({stage: Stage.Create})}>Create Poll</a>
            </div>
          </div>
        );

      case Stage.Create:
        return (
          <div className="base">
            <div className="input-title">Title</div>
            <input id="title" type="text" value={this.state.title} onChange={(e) => this.setState({title: e.target.value})}/>
            <div className="input-title">Description</div>
            <textarea id="description" value={this.state.description} onChange={(e) => this.setState({description: e.target.value})} cols={64} rows={16}/>
            <div className="button orange" onClick={() => this.createPoll()} >Create Poll</div>
          </div>
        );

      case Stage.Join:
        return null;
    }
  }

  createPoll() {
  
    if (this.state.title.length !== 0) {
  
      const http = new XMLHttpRequest();
      const url = 'http://localhost:8000/poll';
      const content = {
        title: this.state.title,
        desc: this.state.description,
      };
      http.open("POST", url);
      http.send(JSON.stringify(content));
      
      console.log("Creating poll.. "+JSON.stringify(content)+"");
  
      http.onreadystatechange = function () {
        if (this.readyState === 4) {
          
          if (this.status === 200) {
            console.log(this.responseText);
            // window.location.assign("/poll/"+this.responseText);
          } else {
            console.log("Something went wrong ("+this.status+ ") "+this.responseText);
          }
        }
      }
  
    }
  }
}

export default App;
