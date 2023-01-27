import React from "react"
import Form from "react-bootstrap/Form"

const EditableText = ({ currentText, setCurrentText }) => {
  const handleTextChange = (event) => {
    setCurrentText(event.target.value)
  }

  return (
    <Form>
      <Form.Group>
        <Form.Control
          as="textarea"
          value={currentText}
          onChange={handleTextChange}
          rows={3}
        />
      </Form.Group>
    </Form>
  )
}

export default EditableText
