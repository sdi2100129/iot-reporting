import { useState } from "react"
import { Search } from "lucide-react"
import api from "../../api"

export default function SensorSearch() {
  const [selectedId, setSelectedId] = useState("")
  const [loading, setLoading] = useState(false)

  const getSensor = async () => {
    if (!selectedId) return

    try {
      setLoading(true)
      const res = await api.get(`/sensors/${selectedId}`)
      alert(JSON.stringify(res.data, null, 2))
    } catch (err) {
      alert(err.response?.data?.detail || "Sensor not found")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      
      <div className="flex items-center bg-white rounded-full shadow-lg border border-gray-200 px-4 py-3 focus-within:ring-2 focus-within:ring-purple-500 transition">
        
        <input
          type="text"
          placeholder="Search sensor by ID..."
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && getSensor()}
          className="flex-1 bg-transparent outline-none text-lg px-2"
        />

        <button
          onClick={getSensor}
          tabIndex={-1}
          className="flex items-center justify-center p-0 m-0 bg-transparent 
                    text-gray-400 hover:text-purple-600 
                    focus:outline-none focus:ring-0 outline-none border-none transition"
        >
          <Search className="w-6 h-6 pointer-events-none"  />
        </button>

      </div>

    </div>
  )
}
