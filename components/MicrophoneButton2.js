import { useEffect, useState } from "react"

import MicIcon from "../public/svg/mic.svg"

const MicrophoneButton2 = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isRecordingFinished, setIsRecordingFinished] = useState(false)

  useEffect(() => {
    console.log("isRecording", isRecording)
    console.log("isLoading", isLoading)
    console.log("isRecordingFinished", isRecordingFinished)
  }, [isLoading, isRecording, isRecordingFinished])

  const startRecording = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setIsRecording(true)
    }, 200)
  }

  const stopRecording = () => {
    setIsLoading(false)
    setIsRecording(false)
    setIsRecordingFinished(true)
    setTimeout(() => {
      setIsRecordingFinished(false)
    }, 1000)
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
      }}
    >
      <button
        style={{
          borderRadius: "50%",
          width: "120px",
          height: "120px",
          backgroundColor: isLoading
            ? "white"
            : isRecording
            ? "red"
            : isRecordingFinished
            ? "blue"
            : "blue",
          border: "none",
        }}
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
      >
        <MicIcon height={70} width={44} />
      </button>
    </div>
  )
}

export default MicrophoneButton2
