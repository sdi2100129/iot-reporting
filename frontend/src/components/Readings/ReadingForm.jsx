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
      <h3>Add Readings</h3>
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
