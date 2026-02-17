// Handles Add / Update form UI

export default function SensorForm({ newSensors, setNewSensors, addSensor, updateSensor }) {
  const fields = ["sensorId", "type", "vendorName", "vendorEmail", "description", "location"]

  const handleInputChange = (index, field, value) => {
    const updatedSensors = [...newSensors]
    updatedSensors[index] = {
      ...updatedSensors[index],
      [field]: value
    }
    setNewSensors(updatedSensors)
  }

  return (
    <div>
      <h3 className="text-6xl md:text-7xl font-extrabold text-purple-600 mb-8 tracking-wider font-[cursive]">
        Add Sensor
      </h3>

      <br />

      {newSensors.map((sensor, index) => (
        <div key={index} className="flex flex-wrap gap-2"> 

          {fields.map(field => (
            field === "type" ? (
              <select
                key={field}
                value={sensor.type}
                onChange={e => handleInputChange(index, "type", e.target.value)}
                className="border p-2 rounded "
              >
                <option value="Type">Type</option>
                <option value="Acoustic">Acoustic</option>
                <option value="Humidity">Humidity</option>
                <option value="Temperature">Temperature</option>
              </select>
            ) : (
              <input
                key={field}
                placeholder={field}
                value={sensor[field] || ""}
                onChange={e => handleInputChange(index, field, e.target.value)}
                className="border p-2 rounded"
              />
            )
          ))}

          <div className="w-full flex justify-center items-center gap-4 mt-4">
            <button onClick={() => addSensor(sensor)} className="!bg-blue-500 !text-white px-4 py-2 rounded hover:bg-blue-700 transition">
              Add
            </button>
            {/* UPDATE */}
          </div>

        </div>
      ))}
    </div>
  )
}


//#            <button onClick={() => updateSensor(sensor)} className="!bg-green-500 !text-white px-4 py-2 rounded hover:bg-green-700 transition">
//#               Update
//#             </button>
