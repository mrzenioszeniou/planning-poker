import React from 'react';
import './App.css';
import { RouteComponentProps, withRouter } from "react-router";
import { config } from './Constants';
import { Chart } from 'react-google-charts';

interface RouteInterface {
  poll: string;
}

interface Props extends RouteComponentProps<RouteInterface> {}

enum Stage {
  NotFound,
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
  votes: Map<String, Vote>;
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
      email: "mrzenioszeniou@gmail.com",
      vote: Vote.Zero,
      pollData: null,
    };
  }

  componentDidMount() {
    this.fetchPollData();
  }
  
  render() {

    let content = null;
    switch (this.state.stage) {

      case Stage.NotFound:
        return (
          <div className="base column centered">
            <div className="input-title">Poll <b>{this.state.poll}</b> Not Found</div>
            <a className="subtle-link" href="/">Back</a>
          </div>
        );
      case Stage.Start:
        content = (
          <div className="row">
            <div className="button green" onClick={() => this.setState({stage: Stage.Results})}>See Results</div>
            <div className="button orange"  onClick={() => this.setState({stage: Stage.Vote})}>Vote</div>
          </div>
        );
        break;
      case Stage.Vote:
        content = (
          <div className="column">
            <div className="input-title">Email:</div>
            <input style={{width: "20em"}} type="email" value={this.state.email} onChange={e => this.setState({email: e.target.value})}/>
            <div className="input-title">Weight:</div>
            <select id="votes" onChange={e => this.setState({vote: Number(e.target.value)})}>
              <option value={Vote.Zero}>{Vote.Zero}</option>
              <option value={Vote.Half}>{Vote.Half}</option>
              <option value={Vote.One}>{Vote.One}</option>
              <option value={Vote.Two}>{Vote.Two}</option>
              <option value={Vote.Three}>{Vote.Three}</option>
              <option value={Vote.Five}>{Vote.Five}</option>
              <option value={Vote.Eight}>{Vote.Eight}</option>
              <option value={Vote.Thirteen}>{Vote.Thirteen}</option>
            </select>
            <div className="button orange centered" onClick={()=>this.vote()}>Submit</div>
          </div>
        );
        break;
      case Stage.Results:
        if (this.state.pollData !== null) {

          let votes: Map<Vote, number> = new Map();
          let n: number = 0;
          let sum: number = 0;
    
          Object.values(this.state.pollData.votes).forEach((e: Vote) => {

            if (votes.has(e)) {
              votes.set(e, votes.get(e) as number + 1);
            } else {
              votes.set(e, 1);
            }
            n += 1;
            sum += e;
          });

          if (n > 0) {
            content = (
              <div className="column centered">
                <div className="row">
                  <div className="column">
                    <div className="results-title">Total # of Votes:</div>
                    <div className="results-title">Mean Weight:</div>
                  </div>
                  <div className="column">
                    <div className="results-value">{n}</div>
                    <div className="results-value">{sum / n}</div>
                  </div>
                </div>
                <Chart
                  width={600}
                  height={300}
                  chartType="ColumnChart"
                  loader={<div>Loading Chart</div>}
                  data={[
                    ['Weight','Votes'],
                    [Vote.Zero.toString(), votes.get(Vote.Zero)],
                    [Vote.Half.toString(), votes.get(Vote.Half)],
                    [Vote.One.toString(), votes.get(Vote.One)],
                    [Vote.Two.toString(), votes.get(Vote.Two)],
                    [Vote.Three.toString(), votes.get(Vote.Three)],
                    [Vote.Five.toString(), votes.get(Vote.Five)],
                    [Vote.Eight.toString(), votes.get(Vote.Eight)],
                    [Vote.Thirteen.toString(), votes.get(Vote.Thirteen)]
                  ]}
                  options={{
                    backgroundColor: '#fff9e9',
                    chartArea:{
                      left:50,
                      top:10,
                      width:"80%",
                      height:"80%",
                    },
                    hAxis: {
                      title: 'Weight',
                    },
                    vAxis: {
                      title: '# of votes',
                      format: '#',
                    },
                    legend: 'none',
                  }}
                  />
              </div>
            );
        } else {
          content = (<div>No votes were casted.</div>);
        }
        break;
      }
    }

    return (
      <div className="base centered" style={{justifyContent: "normal"}}>

        <div className="poll-details">
          <div className="poll-title">{ this.state.pollData === null ?  null : this.state.pollData.title }</div>
          <div className="poll-desc">{ this.state.pollData === null ?  null : this.state.pollData.desc }</div>
        </div>

        {content}

      </div>
    );
  }

  fetchPollData() {
    const url = config.API_URL + 'poll/' + this.state.poll;
    const requestOptions = {
      method: 'GET',
      header: {'Content-Type': 'application/json'},
    };
    
    fetch(url, requestOptions)
      .then(response => response.ok ? response.json() : this.setState({stage: Stage.NotFound}))
      .then(body => this.setState({pollData: body}));
  }

  vote() {

    const re = /^\S+@\S+$/;
    if (re.test(String(this.state.email).toLowerCase())) {

      const url = config.API_URL + 'poll/' + this.state.poll;

      const requestOptions = {
        method: 'POST',
        header: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          email: this.state.email,
          weight: this.state.vote,
        }),
      };

      fetch(url, requestOptions)
        .then(response => {
          if (response.ok) {
            this.fetchPollData();
            this.setState({stage: Stage.Results});
          }
        });
          
    }
  }
}

export default withRouter(Poll);