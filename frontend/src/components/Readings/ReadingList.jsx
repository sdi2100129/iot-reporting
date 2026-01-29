// Displays all readings with Delete buttons

export default function ReadingList({ readings, deleteReading }) {
  return (
    <div>
      <h3>All Readings</h3>
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