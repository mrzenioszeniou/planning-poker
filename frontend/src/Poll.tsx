import React from 'react';
import './App.css';
import { RouteComponentProps, withRouter } from "react-router";

interface RouteInterface {
  poll: string;
}

interface Props extends RouteComponentProps<RouteInterface> {}

enum Stage {
  Start,
  Vote,
  Results,
}

enum Vote {
  Zero = 0.0,
  Half = 0.5,
  One = 1.0,
  Two = 2.0,
  Three = 3.0,
  Five = 5.0,
  Eight = 8.0,
  Thirteen = 13.0,
}

interface PollData {
  title: string;
  desc: string;
  votes: Map<string, Vote>;
}

interface State {
  poll: string;
  stage: Stage;
  email: string;
  vote: Vote;
  pollData: PollData | null;
}

class Poll extends React.Component<Props, State>  {

  constructor(props: Props) {
    super(props);
    this.state = {
      poll: props.match.params.poll,
      stage: Stage.Start,
      email: "",
      vote: Vote.Zero,
      pollData: null,
    };
  }

  componentDidMount() {
    const url = 'http://localhost:8000/poll/' + this.state.poll;
    const requestOptions = {
      method: 'GET',
      header: {'Content-Type': 'application/json'},
    };
    
    fetch(url, requestOptions)
      .then(response => response.json())
      .then(body => this.setState({pollData: body}));
  }
  
  render() {
    return (
      <div className="base centered" style={{justifyContent: "normal"}}>


        <div className="poll-details">
          <div className="poll-title">{ this.state.pollData === null ?  null : this.state.pollData.title }</div>
          <div className="poll-desc">{ this.state.pollData === null ?  null : this.state.pollData.desc }</div>
        </div>



        Poll ({this.state.poll}) shit goes here..



      </div>
    );
  }
}

export default withRouter(Poll);