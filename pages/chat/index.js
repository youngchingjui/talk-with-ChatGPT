import { useEffect, useState } from "react"
import { Container } from "react-bootstrap"

import Message from "../../components/Message"
import MicrophoneButton from "../../components/MicrophoneButton"
import NavBar from "../../components/NavBar"

const messages = [
  {
    text: "Explain to me how you work like I'm a 5-year-old.",
    from: "user",
  },
  {
    text: "I am a computer program that is designed to assist people with questions they have. I can understand what people ask me and provide answers based on my training and the information I have been given. I don't have a physical body like you do, so I can't see or touch things in the real world. I exist only in the computer and can only interact with people through a screen.",
    from: "bot",
  },
  {
    text: "Don't explain anything to me. just give me greek letter kappa",
    from: "user",
  },
  {
    text: "κ",
    from: "bot",
  },
]

const ChatPage = () => {
  const [recognizedSpeech, setRecognizedSpeech] = useState("")
  const [recognitionLanguage, setRecognitionLanguage] = useState("en")

  // Get the user's language from the HTML lang attribute on client side
  useEffect(() => {
    setRecognitionLanguage(document.querySelector("html").lang)
  }, [])

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
        {messages.map((message, index) => {
          return (
            <Message message={message.text} sender={message.from} key={index} />
          )
        })}
        <MicrophoneButton
          result={recognizedSpeech}
          setResult={setRecognizedSpeech}
          sendToOpenAI={sendToOpenAI}
          language={recognitionLanguage}
        />
      </Container>
    </>
  )
}

export default ChatPage
