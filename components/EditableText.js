import React, { useState } from "react";

const EditableText = ({ currentText, setCurrentText }) => {
  const [editing, setEditing] = useState(false);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = (e) => {
    setEditing(false);
  };

  const handleTextChange = (event) => {
    setCurrentText(event.target.value);
  };

  return (
    <div>
      {editing ? (
        <div>
          <input type="text" value={currentText} onChange={handleTextChange} />
          <button onClick={handleSave}>Save</button>
        </div>
      ) : (
        <div>
          {currentText}
          <button onClick={handleEdit}>Edit</button>
        </div>
      )}
    </div>
  );
};

export default EditableText;
