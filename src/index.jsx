import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import {createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import SprintGameMenu from './components/SprintGameMenu/SprintGameMenu'

import rootReducer from "./utils/rootReducer";
import sprintReducer from './utils/reducerSprint'
import './index.scss'

export default function App() {
  const store = createStore(
    sprintReducer,
    composeWithDevTools());

  return (
    <Provider store={store}>
      <Router>
        <Switch>
          <Route path="/sprint" component={SprintGameMenu} />
          {/* <Route path="/" component={} /> */}
        </Switch>
      </Router>
    </Provider>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
