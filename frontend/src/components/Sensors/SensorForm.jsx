// Handles Add / Update form UI

export default function SensorForm({newSensors, setNewSensors, addSensor, updateSensor}) {
  const fields = ["sensorId", "type", "vendorName", "vendorEmail", "description", "location"]

  const handleInputChange = (index, field, value) => {
    const updatedSensors = [...newSensors]
    updatedSensors[index][field] = value
    setNewSensors(updatedSensors)
  }

  return (
    <div>
      <h3 className="text-6xl md:text-7xl font-extrabold text-purple-600 mb-8 tracking-wider font-[cursive]">
        Add Sensor
      </h3>

      {newSensors.map((sensor, index) => (
        <div key={index} >
          {fields.map(field => (
            <input
              key={field}
              placeholder={field}
              value={sensor[field]}
              onChange={e => handleInputChange(index, field, e.target.value)}
            />
          ))}



          
          <br />
          <button onClick={() => addSensor(sensor)}>Add</button>
          <button onClick={() => updateSensor(sensor)}>Update</button>
          
        </div>
      ))}
    </div>
  )
}
