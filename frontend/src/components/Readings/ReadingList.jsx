import { Trash2 } from "lucide-react"
import { useState } from "react"
import {ChevronLeft, ChevronRight } from "lucide-react"

export default function ReadingList({ readings, deleteReading, page, setPage, pages  }) {
  const units = {
    Temperature: "°C",
    Humidity: "%",
    Acoustic: "dB"
  }


  const [confirmId, setConfirmId] = useState(null)

  return (
    <div className="mt-12">

      {/* Confirmation Banner */}
      {confirmId && (
        <div className="bg-yellow-100 border border-yellow-500 text-yellow-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
          <span>Are you sure you want to delete reading #{confirmId}?</span>
          <div className="flex gap-2">
            <button
              onClick={() => { deleteReading(confirmId); setConfirmId(null) }}
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
        All Readings
      </h3>

      {/* PAGINATIOIN */}
      <div className="flex justify-center items-center gap-4 mt-6">

        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="flex items-center justify-center bg-transparent
                        text-gray-400 hover:text-purple-600 transition"
        >
          <ChevronLeft className="w-5 h-5"/>
        </button>

        <span className="text-gray-700 font-semibold">
          Page {page} of {pages}
        </span>

        <button
          onClick={() => setPage(p => Math.min(pages, p + 1))}
          disabled={page === pages}
          className="flex items-center justify-center bg-transparent
                        text-gray-400 hover:text-purple-600 transition"
        >
          <ChevronRight className="w-5 h-5"/>
        </button>

      </div>

      <br/>

      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full border-collapse">

          {/* Header */}
          <thead className="bg-purple-100 text-purple-700">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Sensor</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Value</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Time</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>

          {/* Rows */}
          <tbody>
            {readings.map(r => (
              <tr
                key={r.id}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="px-4 py-2 font-semibold">{r.id}</td>
                <td className="px-4 py-2">{r.sensorId}</td>
                <td className="px-4 py-2">{r.readingType}</td>
                <td className="px-4 py-2">
                  {r.readingValue} {units[r.readingType] || ""}
                </td>
                <td className="px-4 py-2">{r.readingDate}</td>
                <td className="px-4 py-2">{r.readingTime}</td>
                <td className="px-4 py-2 truncate max-w-xs">
                  {r.description}
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => setConfirmId(r.id)}
                    className="flex items-center justify-center bg-transparent
                        text-gray-400 hover:text-red-500 transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

    </div>
  )
}
