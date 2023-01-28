import axios from "axios"
import { useEffect, useState } from "react"
import Container from "react-bootstrap/Container"

import Message from "../components/Message"
import MicrophoneButton from "../components/MicrophoneButton"
import NavBar from "../components/NavBar"
import messages from "../mocks/messages.json"

const MAX_TOKENS = 4000

const ChatPage = () => {
  const [recognizedSpeech, setRecognizedSpeech] = useState("")
  const [recognitionLanguage, setRecognitionLanguage] = useState("en")
  const [messageList, setMessageList] = useState(messages)
  const [maxTokens, setMaxTokens] = useState(MAX_TOKENS)
  const [temperature, setTemperature] = useState(0)

  // Get the user's language from the HTML lang attribute on client side
  useEffect(() => {
    setRecognitionLanguage(document.querySelector("html").lang)
  }, [])

  const addMessage = (message) => {
    // `message` should be in the format { text: "message", from: "user" }
    setMessageList((prev) => [...prev, message])
  }

  const sendToOpenAI = async (prompt) => {
    console.log("sending to OpenAI")
    if (!prompt) {
      console.log("no prompt", prompt)
      return
    }

    const data = {
      model: "text-davinci-003",
      prompt,
      temperature: parseFloat(temperature),
      max_tokens: parseInt(maxTokens),
    }
    try {
      const res = await axios.post("/api/openai", data)
      const text = res.data.choices[0].text
      console.log("res", res)
      addMessage({ text, from: "bot" })
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
      <NavBar />
      <Container style={{ paddingTop: 70, paddingBottom: 170 }}>
        {messageList.map((message, index) => {
          return (
            <Message message={message.text} sender={message.from} key={index} />
          )
        })}
        {recognizedSpeech.length > 0 && (
          <Message message={recognizedSpeech} sender="user" />
        )}
        <MicrophoneButton
          result={recognizedSpeech}
          setResult={setRecognizedSpeech}
          sendToOpenAI={sendToOpenAI}
          language={recognitionLanguage}
          addMessage={addMessage}
        />
      </Container>
    </>
  )
}

export default ChatPage
