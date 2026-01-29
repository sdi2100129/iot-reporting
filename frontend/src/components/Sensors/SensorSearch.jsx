// SensorSearch.jsx
import { useState } from "react"
import api from "../../api"


export default function SensorSearch() {
  const [selectedId, setSelectedId] = useState("")

  const getSensor = async () => {
    try {
      const res = await api.get(`/sensors/${selectedId}`)
      // Show backend response in a readable format
      alert(JSON.stringify(res.data, null, 2))
    } catch (err) {
      alert(err.response?.data?.detail || "Sensor not found")
      console.error(err)
    }
  }

  return (
    <div>
      <h3>Search Sensor</h3>
      <input
        placeholder="Sensor ID"
        value={selectedId}
        onChange={e => setSelectedId(e.target.value)}
      />
      <button onClick={getSensor}>Get</button>
    </div>
  )
}
