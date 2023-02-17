import { useEffect } from "react"

import MicButtonContainer from "./MicButtonContainer"

const MicPermissionButton = ({ setMicrophonePermission }) => {
  // Check if user has given permission to access device microphone
  useEffect(() => {
    navigator.permissions.query({ name: "microphone" }).then(({ state }) => {
      setMicrophonePermission(state) // State can be 'granted', 'prompt', or 'denied'
    })
  }, [setMicrophonePermission])

  const requestMicPermission = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        console.log("got permission")
        stream.getTracks().forEach((track) => track.stop())
        setMicrophonePermission("granted")
      })
      .catch((err) => {
        console.error(err)
        setMicrophonePermission("denied")
      })
  }

  return (
    <MicButtonContainer onClick={requestMicPermission}>
      <button className="microphone-button allow-access">
        Allow Mic Access
      </button>
    </MicButtonContainer>
  )
}

export default MicPermissionButton
