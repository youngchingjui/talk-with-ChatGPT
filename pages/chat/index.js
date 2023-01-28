import { useEffect, useState } from "react"
import { Container } from "react-bootstrap"

import Message from "../../components/Message"
import MicrophoneButton from "../../components/MicrophoneButton"
import NavBar from "../../components/NavBar"
import messages from "../../mocks/messages.json"

const ChatPage = () => {
  const [recognizedSpeech, setRecognizedSpeech] = useState("")
  const [recognitionLanguage, setRecognitionLanguage] = useState("en")
  const [messageList, setMessageList] = useState(messages)

  // Get the user's language from the HTML lang attribute on client side
  useEffect(() => {
    setRecognitionLanguage(document.querySelector("html").lang)
  }, [])

  const addMessage = (message) => {
    setMessageList((prev) => [...prev, { text: message, from: "user" }])
  }

  const sendToOpenAI = () => {
    console.log("sending to ChatGPT")
    if (!recognizedSpeech) {
      return
    }
  }

  return (
    <>
      <NavBar />
      <Container style={{ paddingTop: 70 }}>
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
