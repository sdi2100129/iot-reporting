// add/ search reading

import React from "react";

export default function ReadingForm({ newReadings, setNewReadings, addReading }) {
  const fields = ["id", "sensorId", "readingType", "readingValue", "readingDate", "readingTime", "description"];

  const handleInputChange = (index, field, value) => {
    const updatedReadings = [...newReadings];
    updatedReadings[index][field] = value;
    setNewReadings(updatedReadings);
  };

  return (
    <div>
      <h3 className="text-6xl md:text-7xl font-extrabold text-purple-600 mb-8 tracking-wider font-[cursive]">
        Add Reading
      </h3>
      {newReadings.map((reading, index) => (
        <div key={index}>
          {fields.map((field) => (
            <input key={field} placeholder={field} value={reading[field]}
              onChange={(e) => handleInputChange(index, field, e.target.value)}
            />
          ))}
          <br />
          <button onClick={() => addReading(reading)}>Add</button>
        </div>
      ))}
    </div>
  );
}
