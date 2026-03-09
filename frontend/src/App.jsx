// useState and useEffect imported to handle the endpoint fetching
import "./App.css"
import Home from "./components/Home.jsx"
import NavBar from "./components/NavBar.jsx"
import Footer from "./components/Footer.jsx"
import Sensors from "./components/Sensors/Sensors.jsx"
import Readings from "./components/Readings/Readings.jsx"  
import Metrics from "./components/Metrics"
import Charts from "./components/Charts"
import {BrowserRouter as Router, Route, Routes, Link} from "react-router-dom"
import { useEffect } from "react";
import { isLoggedIn } from "./Auth";


const App = () => {

  useEffect(() => {
      const interval = setInterval(() => {
          if (!isLoggedIn()) {  // isLoggedIn() already calls clearAuth() if expired
              window.dispatchEvent(new Event("auth:changed"));
          }
      }, 60 * 1000); // check every 60 seconds

      return () => clearInterval(interval);
  }, []);


  const name = "IoT Reporting Frontend"
  const description = "The frontend is set up and ready to fetch data from the backend API."

  return (
    <div className="App pt-14">
      <Router>
        <div className="flex flex-col min-h-screen">

          <NavBar />

          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/sensors" element={<Sensors />} />
              <Route path="/readings" element={<Readings />} />
              <Route path="/metrics" element={<Metrics />} />
              <Route path="/charts" element={<Charts />} />
            </Routes>
          </main>
          
          <Footer />
          
        </div>
      </Router>
    </div>
  )
}

export default App
