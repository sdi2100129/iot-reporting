import { Trash2, Edit3, MapPin, Cpu, Mail, FileText  } from "lucide-react"
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
            className="relative bg-white rounded-2xl shadow-lg p-8 pt-12 pb-12 border border-gray-100 
                       hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 min-h-[250px] flex flex-col justify-center"
          >
            {/* ID - Centered Top */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-4xl font-black text-purple-600">
              #{s.sensorId}
            </div>

            {/* Action buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button onClick={() => updateSensor(s)} className="flex items-center justify-center bg-transparent border-none
                        text-gray-400 hover:text-purple-600 transition">
                <Edit3 className="w-5 h-5" />
              </button>
              <button onClick={() => setConfirmId(s.sensorId)} className="flex items-center justify-center bg-transparent border-none
                        text-gray-400 hover:text-red-500 transition">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {/* Content Layout - Two Columns aligned */}
            <div className="grid grid-cols-2 gap-x-6 items-start">
              
              {/* LEFT COLUMN */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-purple-400 shrink-0" />
                  <span className="text-lg font-bold text-gray-700 truncate">{s.type}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-400 shrink-0" />
                  <span className="text-sm text-gray-500">{s.location}</span>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-6 border-l border-gray-50 pl-6">
                <div className="flex items-start gap-2">
                  <Mail className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-purple-700 font-medium break-all line-clamp-2">{s.vendorEmail}</span>
                </div>

                <div className="flex items-start gap-2">
                  <FileText className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600 leading-tight line-clamp-3">{s.description}</span>
                </div>
              </div>
            </div>

            {/* Vendor Name - Centered Bottom */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full text-center">
              <span className="text-xs uppercase tracking-widest text-gray-400">Vendor: </span>
              <span className="text-sm font-semibold text-gray-600">{s.vendorName}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
