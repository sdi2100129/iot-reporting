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

  return (
    <div>
      <h3 className="text-6xl md:text-7xl font-extrabold text-purple-600 mb-8 tracking-wider font-[cursive]">
        Add Reading
      </h3>

      {newReadings.map((reading, index) => (
        <div key={index} className="flex gap-2 flex-wrap items-center">

          {fields.map((field) => {
            // Dropdown
            if (field === "readingType") {
              return (
                <select
                  key={field}
                  value={reading.readingType || ""}
                  onChange={(e) => handleInputChange(index, "readingType", e.target.value)}
                  className="border h-10 px-2 rounded"
                >
                  <option value="">Type</option>
                  <option value="Acoustic">Acoustic</option>
                  <option value="Humidity">Humidity</option>
                  <option value="Temperature">Temperature</option>
                </select>
              );
            }

            // Calendar picker
            if (field === "readingDate") {
              return (
                <input
                  key={field}
                  type="date"
                  value={reading.readingDate || ""}
                  onChange={(e) => handleInputChange(index, field, e.target.value)}
                  className="border h-10 px-2 rounded"
                />
              );
            }

            // Time picker
            if (field === "readingTime") {
              return (
                <input
                  key={field}
                  type="time"
                  value={reading.readingTime || ""}
                  onChange={(e) => handleInputChange(index, field, e.target.value)}
                  className="border h-10 px-2 rounded focus:ring-2 focus:ring-purple-600"
                />
              );
            }

            // Normal inputs
            return (
              <input
                key={field}
                placeholder={field}
                value={reading[field] || ""}
                onChange={(e) => handleInputChange(index, field, e.target.value)}
                className="border h-10 px-2 rounded"
              />
            );
          })}

          <button
            onClick={() => addReading(reading)}
            className="!bg-blue-500 !text-white item-center h-10 px-4 rounded hover:bg-blue-700 transition"
          >
            Add
          </button>

        </div>
      ))}
    </div>
  );
}
