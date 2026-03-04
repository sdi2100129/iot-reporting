import { Trash2, Edit3, Cpu, MapPin, Mail, FileText, Check } from "lucide-react";
import { useState } from "react";
import { hasScope } from "../../Auth";
 
export default function SensorList({ sensors, deleteSensor, updateSensor }) {
  //  Keeps trach if the confirmation button was pressed 
  const [confirmId, setConfirmId] = useState(null);
  //  Keeps track of which sensor is being edited
  const [editingId, setEditingId] = useState(null);
  //  Stores the current edited field values
  const [editingValues, setEditingValues] = useState({});

  const canEdit = hasScope("sensor:write");
  const canDelete = hasScope("sensor:delete");

  const handleChange = (field, value) => {
    // Every time a field is in edit mode take the previous editingValues and replace the field with the new value
    setEditingValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (sensorId) => {
    updateSensor({ sensorId, ...editingValues });
    setEditingId(null);
    setEditingValues({});
  };

  return (
    <div className="mt-12">

      {/* Confirmation Banner */}
      {confirmId && (
        <div className="bg-yellow-100 border border-yellow-500 text-yellow-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
          <span>Are you sure you want to delete sensor #{confirmId}?</span>
          <div className="flex gap-2">
            <button
              onClick={() => { deleteSensor(confirmId); setConfirmId(null); }}
              className="!bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Yes
            </button>
            <button
              onClick={() => setConfirmId(null)}
              className="text-white px-3 py-1 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <h3 className="text-6xl md:text-7xl font-extrabold text-purple-600 mb-12 tracking-wider font-[cursive] text-center">
        All Sensors
      </h3>

      <br />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {sensors.map((s) => {
          const isEditing = editingId === s.sensorId;
          return (
            <div
              key={s.sensorId}
              className="relative bg-white rounded-2xl shadow-lg p-8 pt-12 pb-12 border border-gray-100 
                         hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 min-h-[250px] flex flex-col justify-center"
            >
              {/* ID - Centered Top */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 text-4xl font-black text-purple-600">
                #{s.sensorId}
              </div>

              {/* Action buttons */}
              <div className="absolute top-4 right-4 flex gap-2">
                {/* Edit / Save button */}
                {canEdit && (
                  isEditing ? (
                    <button
                      onClick={() => handleSave(s.sensorId)}
                      className="flex items-center justify-center bg-transparent border-none text-green-500 hover:text-green-700"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => { setEditingId(s.sensorId); setEditingValues(s); }}
                      className="flex items-center justify-center bg-transparent border-none text-gray-400 hover:text-purple-600"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                  )
                )}


                {/* Delete button */}
                {canDelete && (
                  <button
                    onClick={() => setConfirmId(s.sensorId)}
                    className="flex items-center justify-center bg-transparent border-none text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}

              </div>

              {/* Content Layout */}
              <div className="grid grid-cols-2 gap-x-6 items-start">
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-purple-400 shrink-0" />
                    {isEditing ? (
                      <select
                        value={editingValues.type}
                        onChange={e => handleChange("type", e.target.value)}
                        className="border rounded p-1"
                      >
                        <option value="">Type</option>
                        <option value="Acoustic">Acoustic</option>
                        <option value="Humidity">Humidity</option>
                        <option value="Temperature">Temperature</option>
                      </select>
                    ) : (
                      <span className="text-lg font-bold text-gray-700 truncate">{s.type}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-purple-400 shrink-0" />
                    {isEditing ? (
                      <input
                        value={editingValues.location}
                        onChange={e => handleChange("location", e.target.value)}
                        className="border rounded p-1 text-sm"
                      />
                    ) : (
                      <span className="text-sm text-gray-500">{s.location}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-6 border-l border-gray-50 pl-6">
                  <div className="flex items-start gap-2">
                    <Mail className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                    {isEditing ? (
                      <input
                        value={editingValues.vendorEmail}
                        onChange={e => handleChange("vendorEmail", e.target.value)}
                        className="border rounded p-1 text-sm w-full"
                      />
                    ) : (
                      <span className="text-sm text-purple-700 font-medium break-all line-clamp-2">{s.vendorEmail}</span>
                    )}
                  </div>

                  <div className="flex items-start gap-2">
                    <FileText className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                    {isEditing ? (
                      <textarea
                        value={editingValues.description}
                        onChange={e => handleChange("description", e.target.value)}
                        className="border rounded p-1 text-sm w-full"
                      />
                    ) : (
                      <span className="text-sm text-gray-600 leading-tight line-clamp-3">{s.description}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Vendor Name - Centered Bottom */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full text-center">
                <span className="text-xs uppercase tracking-widest text-gray-400">Vendor: </span>
                {isEditing ? (
                  <input
                    value={editingValues.vendorName}
                    onChange={e => handleChange("vendorName", e.target.value)}
                    className="border rounded p-1 text-sm w-32"
                  />
                ) : (
                  <span className="text-sm font-semibold text-gray-600">{s.vendorName}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
