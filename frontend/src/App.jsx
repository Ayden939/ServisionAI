import "./App.css";
import { Routes, Route } from "react-router-dom";

import Analytics from "./components/Analytics.jsx";
import Video from "./routes/Video.jsx";
import Login from "./components/Login.jsx";
import Monitor from "./routes/Monitor.jsx";



function App() {

  return (
    <div id="app" className="primary-font">
      
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/video" element={<Video />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/monitor" element={<Monitor />} />
      </Routes>


      </div>
  );
}

export default App;
