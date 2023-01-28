import axios from "axios"
import { useEffect, useState } from "react"
import Button from "react-bootstrap/Button"
import Col from "react-bootstrap/Col"
import Container from "react-bootstrap/Container"
import Form from "react-bootstrap/Form"
import Row from "react-bootstrap/Row"
import Spinner from "react-bootstrap/Spinner"
import Stack from "react-bootstrap/Stack"
import ToggleButton from "react-bootstrap/ToggleButton"

import DebugPanel from "../components/DebugPanel"
import EditableText from "../components/EditableText"
import MicrophoneButton from "../components/MicrophoneButton"
import { isDevEnv } from "../functions/helper"

const MAX_TOKENS = 4000

const langTags = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "zh-hans", label: "Chinese" },
  { value: "kr", label: "Korean" },
  { value: "ja", label: "Japanese" },
  { value: "ru", label: "Russian" },
  { value: "ar", label: "Arabic" },
  { value: "hi", label: "Hindi" },
]

const HomePage = () => {
  const [recognizedSpeech, setRecognizedSpeech] = useState("")
  const [chatResponse, setChatResponse] = useState("")
  const [maxTokens, setMaxTokens] = useState(MAX_TOKENS)
  const [temperature, setTemperature] = useState(0)
  const [sending, setSending] = useState(false)
  const [recognitionLanguage, setRecognitionLanguage] = useState("en")
  const [autoplay, setAutoplay] = useState(false)

  useEffect(() => {
    // Get the user's language from the HTML lang attribute on client side
    setRecognitionLanguage(document.querySelector("html").lang)
  }, [])

  const sendToOpenAI = async () => {
    console.log("sending to ChatGPT")
    setSending(true)
    if (!recognizedSpeech) {
      setSending(false)
      return
    }

    const data = {
      model: "text-davinci-003",
      prompt: recognizedSpeech,
      temperature: parseFloat(temperature),
      max_tokens: parseInt(maxTokens),
    }
    try {
      const res = await axios.post("/api/openai", data)
      const text = res.data.choices[0].text
      setSending(false)
      console.log("res", res)
      setChatResponse(text)
      if (autoplay) {
        playResponse(text)
      }
    } catch (err) {
      console.error(err)
      setSending(false)
    }
  }

  const playResponse = (text) => {
    if (typeof window == "undefined") {
      console.log("window is undefined, likely in SSR")
      return
    }

    console.log("playing response")
    const synth = window.speechSynthesis
    const utterance = new SpeechSynthesisUtterance(text)
    synth.speak(utterance)
  }

  return (
    <Container>
      <Row>
        <h1>Talking Terry</h1>
      </Row>
      <Row>
        <div>
          Welcome to Talking Terry, where you use your microphone to chat with
          OpenAI, instead of a keyboard
        </div>
      </Row>
      <h2>Ask a question</h2>
      <Row>
        <Col className="d-flex flex-column align-items-center justify-content-center">
          <MicrophoneButton
            result={recognizedSpeech}
            setResult={setRecognizedSpeech}
            sendToOpenAI={sendToOpenAI}
            language={recognitionLanguage}
          />
          <Form.Select
            value={recognitionLanguage}
            onChange={(e) => setRecognitionLanguage(e.target.value)}
          >
            {langTags.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </Form.Select>
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
              Getting OpenAI&apos;s response...
            </>
          ) : (
            "Send"
          )}
        </Button>
      </Row>

      <h2>OpenAI&apos;s response</h2>
      {isDevEnv() && (
        <>
          <label>Max Tokens</label>
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
          />
          <label>Temperature</label>
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
          />
        </>
      )}
      <div className="border border-secondary rounded fs-5 p-2">
        {chatResponse}
      </div>
      <Stack direction="horizontal" gap={2} className="mt-2">
        <Button
          onClick={() => playResponse(chatResponse)}
          variant="outline-primary"
        >
          Play response
        </Button>
        <ToggleButton
          as="button"
          id="toggle-check"
          type="checkbox"
          variant="outline-primary"
          checked={autoplay}
          value="1"
          onChange={(e) => setAutoplay(e.currentTarget.checked)}
        >
          Autoplay is {autoplay ? "on" : "off"}
        </ToggleButton>
      </Stack>
      {isDevEnv() && <DebugPanel />}
    </Container>
  )
}

export default HomePage
