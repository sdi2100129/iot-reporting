// useState and useEffect imported to handle the endpoint fetching
import "./App.css"
import Home from "./components/Home.jsx"
import NavBar from "./components/NavBar.jsx"
import Footer from "./components/Footer.jsx"
import Sensors from "./components/Sensors/Sensors.jsx"
import Readings from "./components/Readings/Readings.jsx"  
import {BrowserRouter as Router, Route, Routes, Link} from "react-router-dom"

const App = () => {
  const name = "IoT Reporting Frontend"
  const description = "The frontend is set up and ready to fetch data from the backend API."

  return (
    <div className="App pt-14">
      <Router>
        <div className="flex flex-col min-h-screen">

          <NavBar />

          <main className="flex-grow min-h-[calc(100vh-5rem)]">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/sensors" element={<Sensors />} />
              <Route path="/readings" element={<Readings />} />
            </Routes>
          </main>
          
          <Footer />
          
        </div>
      </Router>
    </div>
  )
}

export default App
