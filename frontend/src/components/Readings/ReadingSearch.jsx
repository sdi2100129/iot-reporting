export default function ReadingSearch({ filters, setFilters, onSearch, onClear }) {
  return (
    <div>

      <select
        value={filters.sensor_type}
        onChange={e => setFilters({ ...filters, sensor_type: e.target.value })}
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
      />

      <input
        type="time"
        value={filters.time}
        onChange={e => setFilters({ ...filters, time: e.target.value })}
      />

      <button onClick={onSearch}>Search</button>
      <button onClick={onClear}>Clear</button>
    </div>
  );
}
