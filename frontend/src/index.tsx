import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Poll from './Poll';
import { Route, BrowserRouter as Router } from 'react-router-dom';

ReactDOM.render(
  <Router>
      <Route exact path="/" component={App} />
      <Route exact path="/:poll" component={Poll} />
  </Router>,
  document.getElementById('root')
);