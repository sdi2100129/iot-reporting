import React from "react";

export default function ReadingForm({ newReadings, setNewReadings, addReading }) {
  const fields = ["id", "sensorId", "readingType", "readingValue", "readingDate", "readingTime", "description"];

  const handleInputChange = (index, field, value) => {
    const updatedReadings = [...newReadings];
    updatedReadings[index] = {
      ...updatedReadings[index],
      [field]: value
    };
    setNewReadings(updatedReadings);
  };

  const readingTypes = ["Acoustic", "Humidity", "Temperature"]; // example dropdown

  return (
    <div>
      <h3 className="text-6xl md:text-7xl font-extrabold text-purple-600 mb-8 tracking-wider font-[cursive]">
        Add Reading
      </h3>

      {newReadings.map((reading, index) => (
        <div key={index} className="flex gap-2 flex-wrap">
          {fields.map((field) => (
            field === "readingType" ? (
              <select
                key={field}
                value={reading.readingType}
                onChange={(e) => handleInputChange(index, "readingType", e.target.value)}
                className="border p-2rounded "
              >
                <option value="Acoustic">Acoustic</option>
                <option value="Humidity">Humidity</option>
                <option value="Temperature">Temperature</option>
              </select>
            ) : (
              <input
                key={field}
                placeholder={field}
                value={reading[field] || ""}
                onChange={(e) => handleInputChange(index, field, e.target.value)}
                className="border p-2 rounded h-10"
              />
            )
          ))}

          <div className="flex gap-2 h-10 items-center">
            <button
              onClick={() => addReading(reading)}
              className="!bg-blue-500 !text-white rounded hover:bg-blue-700 transition"
            >
              Add
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
