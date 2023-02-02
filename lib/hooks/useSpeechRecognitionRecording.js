import { useEffect, useRef, useState } from "react"

import micStatus from "../models/micStatus"

const useSpeechRecognitionRecording = ({
  result,
  setResult,
  language,
  addMessage,
  sendToOpenAI,
}) => {
  const [micState, setMicState] = useState(micStatus.idle)
  const [showUnsupportedBrowserToast, setShowUnsupportedBrowserToast] =
    useState(false)

  const recognitionRef = useRef(null)
  const resultRef = useRef("")

  // Update ref with latest result
  useEffect(() => {
    resultRef.current = result
  }, [result])

  // Create new SpeechRecognition object that works across browsers, and assign it to recognitionRef
  if (typeof window !== "undefined") {
    window.SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.lang = language
    recognitionRef.current.interimResults = true
  }

  const startRecording = () => {
    console.log("pointer down")
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
      addMessage({ text: resultRef.current, from: "user" })
      sendToOpenAI(resultRef.current)
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

  const stopRecording = () => {
    console.log("pointer up")
    recognitionRef.current.stop()
    setMicState(micStatus.idle)
  }

  return { micState, startRecording, stopRecording }
}

export default useSpeechRecognitionRecording
