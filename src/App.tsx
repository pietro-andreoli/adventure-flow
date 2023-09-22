import React from 'react';
import logo from './logo.svg';
import './App.css';
import FlowComponent from "./FlowComponent";
import { PrimeReactProvider } from "primereact/api";
import { storyIDs, Story } from "./Story";
import './styles.css';
import { ReactFlowProvider } from "reactflow";

function App() {
  return (
    <PrimeReactProvider>
        <ReactFlowProvider>
        <div className="App">
          <FlowComponent />
        </div>
        </ReactFlowProvider>
    </PrimeReactProvider>
  );
}

export default App;
