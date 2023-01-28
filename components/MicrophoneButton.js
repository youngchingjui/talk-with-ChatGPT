import { useEffect, useRef, useState } from "react"
import ToastContainer from "react-bootstrap/ToastContainer"

import micStatus from "../lib/models/micStatus"
import MicIcon from "../public/svg/mic.svg"
import UnsupportedBrowserToast from "./UnsupportedBrowserToast"

const MicrophoneButton = ({
  result,
  setResult,
  sendToOpenAI,
  addMessage,
  language,
}) => {
  const [micState, setMicState] = useState(micStatus.idle)
  const [showUnsupportedBrowserToast, setShowUnsupportedBrowserToast] =
    useState(false)
  const recognitionRef = useRef(null)
  const resultRef = useRef("")

  // Create new SpeechRecognition object that works across browsers, and assign it to recognitionRef
  if (typeof window !== "undefined") {
    window.SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.lang = language
    recognitionRef.current.interimResults = true
  }

  // Update ref with latest result
  useEffect(() => {
    resultRef.current = result
  }, [result])

  const handleMouseDown = () => {
    console.log("mouse down")
    setMicState(micStatus.loading)

    // Capture all events
    // Main events
    recognitionRef.current.addEventListener("start", () => {
      console.log("started")
      setMicState(micStatus.listening)
    })

    recognitionRef.current.addEventListener("result", (event) => {
      setResult(event.results[0][0].transcript)
      console.log(event.results[0][0].transcript)
    })

    recognitionRef.current.addEventListener("end", (event) => {
      console.log("ended")
      addMessage(resultRef.current)
      setResult("")
      setMicState(micStatus.idle)
    })

    recognitionRef.current.addEventListener("error", (event) => {
      console.log("Error:", event.error)
      setShowUnsupportedBrowserToast(true)
      setMicState(micStatus.idle)
    })

    // Other events
    recognitionRef.current.addEventListener("audiostart", () => {
      console.log("audiostart")
    })
    recognitionRef.current.addEventListener("audioend", () => {
      console.log("audioend")
    })
    recognitionRef.current.addEventListener("soundstart", () => {
      console.log("soundstart")
    })
    recognitionRef.current.addEventListener("soundend", () => {
      console.log("soundend")
    })
    recognitionRef.current.addEventListener("speechstart", () => {
      console.log("speechstart")
    })
    recognitionRef.current.addEventListener("speechend", () => {
      console.log("speechend")
    })
    recognitionRef.current.addEventListener("nomatch", () => {
      console.log("nomatch")
    })

    recognitionRef.current.start()
  }

  const handleMouseUp = () => {
    console.log("mouse up")
    recognitionRef.current.stop()
    setMicState(micStatus.idle)
  }

  // BUG: On Safari, speechrecognition will automatically send end event after speechend event, but audioend and soundend are not triggered. So microphone is still on, and transcription is still running, even after speech end.
  return (
    <>
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <button
          className={`microphone-button ${micState}`}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          <MicIcon height={70} width={44} />
        </button>
      </div>
      <ToastContainer position="top-end" className="mt-2 me-2">
        <UnsupportedBrowserToast
          show={showUnsupportedBrowserToast}
          onClose={() => setShowUnsupportedBrowserToast(false)}
          delay={5000}
          autohide
          bg={"danger"}
        />
      </ToastContainer>
    </>
  )
}

export default MicrophoneButton
