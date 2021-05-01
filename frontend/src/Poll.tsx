import React from 'react';
import './App.css';
import { RouteComponentProps, withRouter } from "react-router";

interface RouteInterface {
  poll: string;
}

interface Props extends RouteComponentProps<RouteInterface> {}

interface State {
  poll: string;
}

class Poll extends React.Component<Props, State>  {

  constructor(props: Props) {
    super(props);
    this.state = {
      poll: props.match.params.poll,
    };
  }
  
  render() {
    return (
      <div className="base centered">
        Poll ({this.state.poll}) shit goes here..
      </div>
    );
  }
}

export default withRouter(Poll);