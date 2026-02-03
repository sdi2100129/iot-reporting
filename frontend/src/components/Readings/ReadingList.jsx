import { Trash2, Thermometer, Cpu, Hash } from "lucide-react"

export default function ReadingList({ readings, deleteReading }) {
  return (
    <div className="mt-12">

      <h3 className="text-6xl md:text-7xl font-extrabold text-purple-600 mb-12 tracking-wider font-[cursive] text-center">
        All Readings
      </h3>

      <br/>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {readings.map((r) => (
          <div
            key={r.id}
            className="relative bg-white rounded-2xl shadow-lg p-6 border border-gray-100 
                       hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >

            {/* Delete button */}
            <button
              onClick={() => deleteReading(r.id)}
              className="absolute top-4 right-4 flex items-center justify-center p-0 m-0 bg-transparent border-none
             text-gray-400 hover:text-red-500 transition
             focus:outline-none focus:ring-0 outline-none"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            {/* Reading ID */}
            <div className="flex justify-center items-center gap-2 text-purple-600 text-3xl font-bold mb-4">
              <Hash className="w-6 h-6" />
              {r.id}
            </div>

            {/* Sensor */}
            <div className="flex items-center gap-2 text-gray-700 mb-2">
              <Cpu className="w-5 h-5 text-purple-400" />
              Sensor #{r.sensorId}
            </div>

            {/* Type */}
            <div className="flex items-center gap-2 text-gray-700 mb-4">
              <Thermometer className="w-5 h-5 text-purple-400" />
              {r.readingType}
            </div>

            {/* Value */}
            <div className="text-4xl font-extrabold text-gray-800">
              {r.readingValue}
            </div>

          </div>
        ))}
      </div>

    </div>
  )
}
