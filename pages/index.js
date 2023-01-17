import { useEffect, useState } from "react";
import axios from "axios";
import MicrophoneButton from "../components/MicrophoneButton";
import EditableText from "../components/EditableText";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

const HomePage = () => {
  const [recognizedSpeech, setRecognizedSpeech] = useState("");
  const [chatResponse, setChatResponse] = useState(null);
  const [maxTokens, setMaxTokens] = useState(100);
  const [temperature, setTemperature] = useState(0);
  const [sending, setSending] = useState(false);

  const sendToOpenAI = async () => {
    console.log("sending to ChatGPT");
    setSending(true);
    if (!recognizedSpeech) {
      setSending(false);
      return;
    }

    const data = {
      model: "text-davinci-003",
      prompt: recognizedSpeech,
      temperature: parseFloat(temperature),
      max_tokens: parseInt(maxTokens),
    };
    try {
      const res = await axios.post("/api/openai", data);
      setSending(false);
      console.log("res", res);
      setChatResponse(res.data.choices[0].text);
    } catch (err) {
      console.error(err);
      setSending(false);
    }
  };

  return (
    <>
      <Container>
        <Row>
          <h1>Talk with OpenAI</h1>
        </Row>
        <Row>
          <div>
            Welcome to Talk with OpenAI, where you use your microphone to chat
            with OpenAI, instead of a keyboard
          </div>
        </Row>
        <h2>Ask a question</h2>
        <Row>
          <Col className="d-flex flex-column align-items-center justify-content-center">
            <MicrophoneButton
              result={recognizedSpeech}
              setResult={setRecognizedSpeech}
              sendToOpenAI={sendToOpenAI}
            />
            <div>Tap to speak, tap again to turn off</div>
          </Col>
          <Col>
            <EditableText
              currentText={recognizedSpeech}
              setCurrentText={setRecognizedSpeech}
            />
          </Col>
        </Row>
        <Row className="d-flex justify-content-center">
          <Button
            variant="primary"
            type="submit"
            onClick={sendToOpenAI}
            disabled={sending}
            className="d-flex align-items-center justify-content-center w-auto"
          >
            {sending ? (
              <>
                <Spinner as="span" role="status" aria-hidden="true" />
                Getting OpenAI's response...
              </>
            ) : (
              "Send"
            )}
          </Button>
        </Row>

        <h2>OpenAI's response</h2>
        {/* <label>Max Tokens</label>
      <input
      id="maxTokensInput"
      type="number"
      min="0"
      max="2048"
      onChange={(e) => setMaxTokens(e.target.value)}
      value={maxTokens}
      />
      <input
      id="maxTokensInput"
      type="range"
      min="0"
      max="2048"
      onChange={(e) => setMaxTokens(e.target.value)}
      value={maxTokens}
    /> */}
        {/* <label>Temperature</label>
      <input
      id="temperatureInput"
      type="number"
      min="0"
      max="1"
      step="0.01"
      onChange={(e) => setTemperature(e.target.value)}
      value={temperature}
      />
      <input
      id="temperatureInput"
      type="range"
      min="0"
      max="1"
      step="0.01"
      onChange={(e) => setTemperature(e.target.value)}
      value={temperature}
    /> */}
        {chatResponse && (
          <div className="chat-response border border-primary rounded">
            {chatResponse}
          </div>
        )}
      </Container>
    </>
  );
};

export default HomePage;
