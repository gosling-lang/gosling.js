import React from 'react';
import logo from './logo.svg';
import './App.css';

import { validateHG } from './lib/higlass-lite';
import HGSingleView from "./lib/test/higlass/single-view.json";

function App() {

  // Test
  validateHG(HGSingleView);
  // 

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
