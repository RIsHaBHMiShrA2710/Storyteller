import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import PromptComponent from "./components/create/PromotComponent";
import Navbar from "./navbar";
function App() {
  return (
    <>
      <Router>
        <Navbar />
            <Routes>
                <Route path="/" element={<PromptComponent/>} />
             </Routes>
            
        </Router>
        
    </>
  );
}

export default App;
