import { Search,Trash2 } from "lucide-react"

export default function ReadingSearch({ filters, setFilters, onSearch, onClear }) {
  return (
    <div className="flex flex-wrap w-full justify-center items-center gap-4 mb-6">

      <select
        value={filters.sensor_type}
        onChange={e => setFilters({ ...filters, sensor_type: e.target.value })}
        className="border h-10 px-2 rounded"
      >
        <option value="">All Types</option>
        <option value="Temperature">Temperature</option>
        <option value="Humidity">Humidity</option>
        <option value="Acoustic">Acoustic</option>
      </select>

      <input
        placeholder="Location"
        value={filters.location}
        onChange={e => setFilters({ ...filters, location: e.target.value })}
        className="border h-10 px-2 rounded"
      />
      
      <input
        type="date"
        value={filters.date}
        onChange={e => setFilters({ ...filters, date: e.target.value })}
        className="border h-10 px-2 rounded"
      />

      <input
        type="time"
        value={filters.time}
        onChange={e => setFilters({ ...filters, time: e.target.value })}
        className="border h-10 px-2 rounded"
      />

      <button onClick={onSearch}
      className="flex items-center justify-center p-0 m-0 bg-transparent 
                    text-gray-400 hover:text-purple-600 
                    focus:outline-none focus:ring-0 outline-none border-none transition">
        <Search className="w-6 h-6 pointer-events-none"  />
      </button>
      
      <button onClick={onClear}
      className="flex items-center justify-center p-0 m-0 bg-transparent border-none 
                text-gray-400 hover:text-red-500 transition
                focus:outline-none focus:ring-0 outline-none">
        <Trash2 className="w-5 h-5" />
      </button>

    </div>
  );
}
