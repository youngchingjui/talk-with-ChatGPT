import { useEffect, useState } from "react"
import { Toast } from "react-bootstrap"

const UnsupportedBrowserToast = (props) => {
  const [userAgent, setUserAgent] = useState("")

  useEffect(() => {
    setUserAgent(navigator.userAgent)
  }, [])
  return (
    <Toast {...props}>
      <Toast.Header className="fw-bold">Browser not supported</Toast.Header>
      <Toast.Body>
        <p>
          Sorry, your browser currently doesn&apos;t support audio
          transcription.
        </p>
        <p>{`Browser details: ${userAgent}`}</p>
      </Toast.Body>
    </Toast>
  )
}

export default UnsupportedBrowserToast
