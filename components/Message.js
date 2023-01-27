import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"

const Message = ({ message, sender, ...props }) => {
  const messageStyle = {
    backgroundColor:
      sender === "user" ? "rgba(0, 119, 182, 0.1)" : "rgba(202, 240, 248, 0.2)",
    borderRadius: sender === "user" ? "10px 10px 10px 0" : "10px 10px 0 10px",
    margin: sender === "user" ? "0 0 0 10px" : "0 10px 0 0",
    padding: "10px",
  }

  return (
    <Row {...props} className="justify-content-center mb-3">
      <Col xs={12} sm={10} md={8} lg={6}>
        <div style={messageStyle}>
          <p className="mb-0">{message}</p>
        </div>
      </Col>
    </Row>
  )
}

export default Message
