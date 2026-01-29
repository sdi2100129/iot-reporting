// useState and useEffect imported to handle the endpoint fetching
import React, {useState, useEffect} from "react" 
import api from "./api.jsx"
import "./App.css"
import Home from "./components/Home.jsx"
import NavBar from "./components/NavBar.jsx"
import Sensors from "./components/Sensors.jsx"
import Readings from "./components/Readings.jsx"  
import {BrowserRouter as Router, Route, Routes, Link} from "react-router-dom"


/*const App = () => {
  const [sensors, setSensors] = useState([])
  
  useEffect(() => {
    // Fetch sensors from the backend API
    api.get("/sensors")
      .then(response => {
        setSensors(response.data)
      })
      .catch(error => {
        console.error("Error fetching sensors:", error)
      })
  }, [])

  return (
    <div>
      <h3>IoT Reporting Frontend</h3>
      <ul>
        {sensors.map(sensor => (
          <li key={sensor.id}>{sensor.name}</li>
        ))}
      </ul>
    </div>
  )
}*/

const App = () => {
  const name = "IoT Reporting Frontend"
  const description = "The frontend is set up and ready to fetch data from the backend API."

  return (
    <div className="App">
      <Router>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sensors" element={<Sensors />} />
          <Route path="/readings" element={<Readings />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
