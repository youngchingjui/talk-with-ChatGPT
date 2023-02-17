import { useState } from "react"
import ToastContainer from "react-bootstrap/ToastContainer"

import useAAITranscriptionRecording from "../lib/hooks/useAAITranscriptionRecording"
import MicIcon from "../public/svg/mic.svg"
import MicButtonContainer from "./MicButtonContainer"
import UnsupportedBrowserToast from "./UnsupportedBrowserToast"

const MicrophoneButton = ({
  result,
  setResult,
  sendToOpenAI,
  addMessage,
  language,
}) => {
  const [showUnsupportedBrowserToast, setShowUnsupportedBrowserToast] =
    useState(false)

  const finishedCallback = () => {
    addMessage({ text: result, from: "user" })
    sendToOpenAI(result)
    setResult("")
  }

  const { micState, startRecording, stopRecording } =
    useAAITranscriptionRecording({ setMessage: setResult, finishedCallback })

  // BUG: On Safari, speechrecognition will automatically send end event after speechend event, but audioend and soundend are not triggered. So microphone is still on, and transcription is still running, even after speech end.
  return (
    <>
      <MicButtonContainer>
        <button
          className={`microphone-button ${micState}`}
          onPointerDown={startRecording}
          onPointerUp={stopRecording}
        >
          <MicIcon height={70} width={44} />
        </button>
      </MicButtonContainer>
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
