import React from 'react';
import './App.css';
import { RouteComponentProps, withRouter } from "react-router";
import { Config } from './Constants';
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

enum Weight {
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
  votes: Map<String, Weight>;
}

interface State {
  poll: string;
  stage: Stage;
  email: string;
  weight: Weight;
  pollData: PollData | null;
}

class Poll extends React.Component<Props, State>  {

  constructor(props: Props) {
    super(props);
    this.state = {
      poll: props.match.params.poll,
      stage: Stage.Start,
      email: "",
      weight: Weight.One,
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
            <select id="votes" value={this.state.weight} onChange={e => this.setState({weight: Number(e.target.value)})}>
              <option value={Weight.Zero}>{Weight.Zero}</option>
              <option value={Weight.Half}>{Weight.Half}</option>
              <option value={Weight.One}>{Weight.One}</option>
              <option value={Weight.Two}>{Weight.Two}</option>
              <option value={Weight.Three}>{Weight.Three}</option>
              <option value={Weight.Five}>{Weight.Five}</option>
              <option value={Weight.Eight}>{Weight.Eight}</option>
              <option value={Weight.Thirteen}>{Weight.Thirteen}</option>
            </select>
            <div className="button orange centered" onClick={()=>this.vote()}>Submit</div>
          </div>
        );
        break;
      case Stage.Results:
        if (this.state.pollData !== null) {

          let votes: Map<Weight, number> = new Map();
          let n: number = 0;
          let sum: number = 0;
    
          Object.values(this.state.pollData.votes).forEach((v: Weight) => {

            if (votes.has(v)) {
              votes.set(v, votes.get(v) as number + 1);
            } else {
              votes.set(v, 1);
            }

            n += 1;
            sum += v;
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
                    <div className="results-value">{(sum / n).toFixed(2)}</div>
                  </div>
                </div>

                <Chart
                  width={600}
                  height={300}
                  chartType="ColumnChart"
                  loader={<div>Loading Chart</div>}
                  data={[
                    ['Weight','Votes'],
                    [Weight.Zero.toString(), votes.get(Weight.Zero)],
                    [Weight.Half.toString(), votes.get(Weight.Half)],
                    [Weight.One.toString(), votes.get(Weight.One)],
                    [Weight.Two.toString(), votes.get(Weight.Two)],
                    [Weight.Three.toString(), votes.get(Weight.Three)],
                    [Weight.Five.toString(), votes.get(Weight.Five)],
                    [Weight.Eight.toString(), votes.get(Weight.Eight)],
                    [Weight.Thirteen.toString(), votes.get(Weight.Thirteen)]
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
          content = (<div>No votes were cast.</div>);
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

    const url = Config.API_URL + 'poll/' + this.state.poll;

    const requestOptions = {
      method: 'GET',
      header: {'Content-Type': 'application/json'},
    };
    
    fetch(url, requestOptions)
    .then(response => response.ok ? response.json() : this.setState({stage: Stage.NotFound}))
    .then(body => this.setState({pollData: body}))
    .catch(e => this.setState({stage: Stage.NotFound}));
  }

  vote() {

    const re = /^\S+@\S+$/;

    if (re.test(String(this.state.email))) {

      const url = Config.API_URL + 'poll/' + this.state.poll;

      const requestOptions = {
        method: 'POST',
        header: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          email: this.state.email.toLowerCase(),
          weight: this.state.weight,
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