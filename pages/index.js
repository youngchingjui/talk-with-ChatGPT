import parseJsonSse from "@beskar-labs/parse-json-sse"
import { useEffect, useState } from "react"
import Container from "react-bootstrap/Container"

import Message from "../components/Message"
import MicrophoneButton from "../components/MicrophoneButton"
import NavBar from "../components/NavBar"
import messages from "../mocks/messages.json"

const ChatPage = () => {
  const [recognizedSpeech, setRecognizedSpeech] = useState("")
  const [recognitionLanguage, setRecognitionLanguage] = useState("en")
  const [messageList, setMessageList] = useState(messages)
  const [tempResponse, setTempResponse] = useState("")

  // Get the user's language from the HTML lang attribute on client side
  useEffect(() => {
    setRecognitionLanguage(document.querySelector("html").lang)
  }, [])

  // Listens for when the SSE stream is finished and adds the response to the message list
  useEffect(() => {
    const moveToMessageList = () => {
      console.log("tempResponse", tempResponse)
      addMessage({ text: tempResponse, from: "bot" })
      setTempResponse("")
    }

    document.addEventListener("finishedStreaming", moveToMessageList)
    return () => {
      document.removeEventListener("finishedStreaming", moveToMessageList)
    }
  }, [tempResponse])

  // Adds a message to the message list
  const addMessage = (message) => {
    // `message` should be in the format { text: "message", from: "user" }
    setMessageList((prev) => [...prev, message])
  }

  // Sends the user's speech to OpenAI and parses the Server-Sent Events response
  const sendToOpenAI = async (prompt) => {
    console.log("sending to OpenAI")
    if (!prompt) {
      console.log("no prompt", prompt)
      return
    }

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      if (!res.ok) {
        throw new Error(res.statusText)
      }

      const data = res.body

      if (!data) {
        console.error("no data")
        return
      }

      await parseJsonSse({
        data,
        // Add the response to the tempResponse state
        onParse: (json) => {
          if (!json.choices.length) {
            throw new Error("No choices")
          }
          setTempResponse((prev) => prev + json.choices[0].text)
        },
        // We need to dispatch an event here because the state data is stale within the closure
        onFinish: () => {
          console.log("Finished")
          const event = new Event("finishedStreaming")
          document.dispatchEvent(event)
        },
      })
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
        {tempResponse.length > 0 && (
          <Message message={tempResponse} sender="bot" />
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
