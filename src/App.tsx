import React from 'react';
import logo from './logo.svg';
import './App.css';
import FlowComponent from "./FlowComponent";
import { PrimeReactProvider } from "primereact/api";
import { stories, Story } from "./Story";
import './styles.css';

function App() {
  return (
    <PrimeReactProvider>
        <div className="App">
          <FlowComponent story={new Story(stories[0])} />
        </div>
    </PrimeReactProvider>
  );
}

export default App;
