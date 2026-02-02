// Displays all readings with Delete buttons

export default function ReadingList({ readings, deleteReading }) {
  return (
    <div>
      <h3 className="text-6xl md:text-7xl font-extrabold text-purple-600 mb-8 tracking-wider font-[cursive]">
        All Readings
      </h3>
      
      <ul>
        {readings.map(r => (
          <li key={r.id}>
            {r.id} — {r.sensorId} — {r.readingType} — {r.readingValue}
            <button onClick={() => deleteReading(r.id)}> X </button>
          </li>
        ))}
      </ul>
    </div>
  )
}