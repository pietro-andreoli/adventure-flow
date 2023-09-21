import React from 'react';
import logo from './logo.svg';
import './App.css';
import FlowComponent from "./FlowComponent";
import { PrimeReactProvider } from "primereact/api";
import { storyIDs, Story } from "./Story";
import './styles.css';

function App() {
  return (
    <PrimeReactProvider>
        <div className="App">
          <FlowComponent />
        </div>
    </PrimeReactProvider>
  );
}

export default App;
