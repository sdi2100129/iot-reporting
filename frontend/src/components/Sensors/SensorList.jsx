// Displays all sensors with Delete buttons

export default function SensorList({ sensors, deleteSensor, updateSensor}) {

  return (
    <div>
      <h3 className="text-6xl md:text-7xl font-extrabold text-purple-600 mb-8 tracking-wider font-[cursive]">
        All Sensors
      </h3>
      
      <ul>
        {sensors.map(s => (
          <li key={s.sensorId}>
            {s.sensorId} — {s.type} — {s.location}
            <></>
            <button onClick={() => updateSensor(s)}>Update</button>
            <button onClick={() => deleteSensor(s.sensorId)}> X </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
