import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import PromptComponent from "./components/create/PromotComponent";
import RankingComponent from "./components/rankings/rankings";
import Navbar from "./navbar";
function App() {
  return (
    <>
      <Router>
        <Navbar />
            <Routes>
                <Route path="/" element={<PromptComponent/>} />
                <Route path="/global-ranking" element={<RankingComponent/>} />
             </Routes>
            
        </Router>
        
    </>
  );
}

export default App;
