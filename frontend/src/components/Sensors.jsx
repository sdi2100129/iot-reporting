import { useState, useEffect } from "react"
import api from "../api"

export default function Sensors() {
  const [sensors, setSensors] = useState([])
  const [selectedId, setSelectedId] = useState("")

  const [newSensor, setNewSensor] = useState({
    sensorId: "",
    type: "",
    vendorName: "",
    vendorEmail: "",
    description: "",
    location: ""
  })  


  // ---------------- FETCH ALL ----------------
  
  const fetchSensors = async () => {
    try {
      const res = await api.get("/sensors")
      setSensors(res.data.data)
    } catch (err) {
      console.error(err)
    }
  }
  
  useEffect(() => {
    fetchSensors()
  }, [])

  
  // ---------------- GET ONE ----------------
  const getSensor = async () => {
    const res = await api.get(`/sensors/${selectedId}`)
    alert(JSON.stringify(res.data, null, 2))
  }


  // ---------------- ADD ----------------
  const addSensor = async () => {
    await api.post("/sensors", {
      sensorId: Number(newSensor.sensorId),
      type: newSensor.type,
      vendorName: newSensor.vendorName,
      vendorEmail: newSensor.vendorEmail,
      description: newSensor.description,
      location: newSensor.location
    })

    fetchSensors()
  }

  // ---------------- UPDATE ----------------
  const updateSensor = async () => {
    await api.put(`/sensors/${newSensor.sensorId}`, {
      sensorId: Number(newSensor.sensorId),
      type: newSensor.type,
      vendorName: newSensor.vendorName,
      vendorEmail: newSensor.vendorEmail,
      description: newSensor.description,
      location: newSensor.location
    })


    fetchSensors()
  }

  // ---------------- DELETE ----------------
  const deleteSensor = async (id) => {
    try {
      await api.delete(`/sensors/${id}`)
      setSensors(sensors.filter(s => s.sensorId !== id))
    } catch (err) {
      alert("Delete failed")
    }
  }


  // ---------------- UI ----------------
  return (
    <div>
      <h2>Sensors</h2>

      <button onClick={fetchSensors}>Refresh</button>

      <hr />

      <h3>Add / Update Sensor</h3>

      <input placeholder="Sensor ID"
        value={newSensor.sensorId}
        onChange={e => setNewSensor({ ...newSensor, sensorId: e.target.value })}
      />
      <input placeholder="Type"
        value={newSensor.type}
        onChange={e => setNewSensor({ ...newSensor, type: e.target.value })}
      />
      <input placeholder="Vendor Name"
        value={newSensor.vendorName}
        onChange={e => setNewSensor({ ...newSensor, vendorName: e.target.value })}
      />
      <input placeholder="Vendor Email"
        value={newSensor.vendorEmail}
        onChange={e => setNewSensor({ ...newSensor, vendorEmail: e.target.value })}
      />
      <input placeholder="Description"
        value={newSensor.description}
        onChange={e => setNewSensor({ ...newSensor, description: e.target.value })}
      />
      <input placeholder="Location"
        value={newSensor.location}
        onChange={e => setNewSensor({ ...newSensor, location: e.target.value })}
      />

      <br />

      <button onClick={addSensor}>Add</button>
      <button onClick={updateSensor}>Update</button>

      <hr />

      <h3>Search / Delete</h3>

      <input
        placeholder="Sensor ID"
        value={selectedId}
        onChange={e => setSelectedId(e.target.value)}
      />

      <button onClick={getSensor}>Get</button>

      <hr />

      <h3>All Sensors</h3>

      <ul>
        {Array.isArray(sensors) && sensors.map(s => (
          <li key={s.sensorId}>
            {s.sensorId} — {s.type} — {s.location}
            <button onClick={() => deleteSensor(s.sensorId)}> X </button>
          </li>
        ))}
      </ul>

    </div>
  )
}
