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
      <h3>Add / Update Readings</h3>
      {newReadings.map((reading, index) => (
        <div key={index} style={{ marginBottom: "1rem" }}>
          {fields.map((field) => (
            <input key={field} placeholder={field} value={reading[field]}
              onChange={(e) => handleInputChange(index, field, e.target.value)}
              style={{ marginRight: "0.5rem", marginBottom: "0.3rem" }}
            />
          ))}
          <br />
          <button onClick={() => addReading(reading)}>Add</button>
        </div>
      ))}
    </div>
  );
}
