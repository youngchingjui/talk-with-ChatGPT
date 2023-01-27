import Container from "react-bootstrap/Container"
import Form from "react-bootstrap/Form"
import Navbar from "react-bootstrap/Navbar"
import Offcanvas from "react-bootstrap/Offcanvas"

const NavBar = () => {
  return (
    <Navbar bg="primary" expand={false} variant="dark">
      <Container>
        <Navbar.Brand href="#home">Talking Terry</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Offcanvas placement="start">
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Offcanvas</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Form>
              <Form.Check type="switch" id="autoplay-switch" label="Autoplay" />
              <Form.Select>
                <option value="English">English</option>
                <option value="Greek">Greek</option>
                <option value="Spanish">Spanish</option>
                <option value="Chinese">Chinese</option>
              </Form.Select>
            </Form>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  )
}

export default NavBar
