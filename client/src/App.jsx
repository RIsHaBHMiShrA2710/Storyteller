import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import SegmentControl from "./components/segcontrols/SegmentControl";
import PromptComponent from "./components/create/PromotComponent";
function App() {
  return (
    <>
      <Router>
        <SegmentControl />
            <Routes>
                <Route path="/create" element={<PromptComponent/>} />
             </Routes>
            
        </Router>
        
    </>
  );
}

export default App;
