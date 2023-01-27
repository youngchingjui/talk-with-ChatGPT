import React, { useRef, useState } from "react"
import ToastContainer from "react-bootstrap/ToastContainer"

import UnsupportedBrowserToast from "./UnsupportedBrowserToast"

const MicrophoneButton = ({ setResult, sendToOpenAI, language }) => {
  const [listening, setListening] = useState(false)
  const [showUnsupportedBrowserToast, setShowUnsupportedBrowserToast] =
    useState(false)
  const recognitionRef = useRef(null)

  // Retrieve user's HTML lang attribute

  const handleClick = () => {
    if (!listening) {
      // Create new SpeechRecognition object that works across browsers, and assign it to recognitionRef
      window.SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition

      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.lang = language
      recognitionRef.current.interimResults = true
      recognitionRef.current.onresult = (event) => {
        setResult(event.results[0][0].transcript)
        console.log(event.results[0][0].transcript)
      }

      // add event listeners for each event on the speechrecognition object
      recognitionRef.current.addEventListener("error", (event) => {
        console.log("Error:", event.error)
        setShowUnsupportedBrowserToast(true)
      })

      recognitionRef.current.addEventListener("start", () => {
        console.log("started")
      })
      recognitionRef.current.addEventListener("end", () => {
        console.log("ended")
        setListening(false)
      })
      recognitionRef.current.addEventListener("nomatch", () => {
        console.log("nomatch")
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
      recognitionRef.current.addEventListener("audiostart", () => {
        console.log("audiostart")
      })
      recognitionRef.current.addEventListener("audioend", () => {
        console.log("audioend")
      })

      recognitionRef.current.start()
      setListening(true)
    } else {
      recognitionRef.current.stop()
      setListening(false)
      sendToOpenAI()
    }
  }

  // BUG: On Safari, speechrecognition will automatically send end event after speechend event, but audioend and soundend are not triggered. So microphone is still on, and transcription is still running, even after speech end.
  return (
    <>
      <div
        style={{
          border: listening ? "3px solid green" : "1px solid grey",
        }}
        className="microphone-button d-flex align-items-center justify-content-center"
        onClick={handleClick}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          className="bi bi-mic"
          viewBox="0 0 16 16"
        >
          <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z" />
          <path d="M10 8a2 2 0 1 1-4 0V3a2 2 0 1 1 4 0v5zM8 0a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V3a3 3 0 0 0-3-3z" />
        </svg>
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
