import { Trash2, Edit3, MapPin, Cpu } from "lucide-react"
import { useState } from "react";

export default function SensorList({ sensors, deleteSensor, updateSensor }) {
  const [confirmId, setConfirmId] = useState(null);

  return (
    <div className="mt-12">

      {/* Confirmation Banner */}
      {confirmId && (
        <div className="bg-yellow-100 border border-yellow-500 text-yellow-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
          <span>Are you sure you want to delete sensor #{confirmId}?</span>
          <div className="flex gap-2">
            <button
              onClick={() => { deleteSensor(confirmId); setConfirmId(null); }}
              className="!bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Yes
            </button>
            <button
              onClick={() => setConfirmId(null)}
              className="text-white px-3 py-1 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <h3 className="text-6xl md:text-7xl font-extrabold text-purple-600 mb-12 tracking-wider font-[cursive] text-center">
        All Sensors
      </h3>

      <br />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {sensors.map((s) => (
          <div
            key={s.sensorId}
            className="relative bg-white rounded-2xl shadow-lg p-6 border border-gray-100 
                       hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >

            {/* Action buttons */}
            <div className="absolute top-4 right-4 flex gap-3">
              
              <button
                onClick={() => updateSensor(s)}
                className="flex items-center justify-center p-0 m-0 bg-transparent border-none 
                text-gray-400 hover:text-purple-600 transition
                focus:outline-none focus:ring-0 outline-none"
              >
                <Edit3 className="w-5 h-5" />
              </button>

              <button
                onClick={() => setConfirmId(s.sensorId)} // trigger confirmation
                className="flex items-center justify-center p-0 m-0 bg-transparent border-none 
                text-gray-400 hover:text-red-500 transition
                focus:outline-none focus:ring-0 outline-none"
              >
                <Trash2 className="w-5 h-5" />
              </button>

            </div>

            {/* Sensor ID */}
            <div className="text-4xl font-bold text-purple-600 mb-4">
              #{s.sensorId}
            </div>

            {/* Sensor Type */}
            <div className="flex items-center gap-2 text-lg font-medium text-gray-700 mb-2">
              <Cpu className="w-5 h-5 text-purple-400" />
              {s.type}
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-gray-500 mb-4">
              <MapPin className="w-5 h-5 text-purple-400" />
              {s.location}
            </div>

            {/* Vendor */}
            <div className="text-sm text-gray-400">
              Vendor: <span className="text-gray-600">{s.vendorName}</span>
            </div>

          </div>
        ))}
      </div>

    </div>
  )
}
