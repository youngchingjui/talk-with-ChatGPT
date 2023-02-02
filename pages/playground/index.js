import Link from "next/link"
import { Button } from "react-bootstrap"

import useAAITranscriptionRecording from "../../lib/hooks/useAAITranscriptionRecording"
import requestMicPermissions from "../../lib/utils/requestMicPermissions"

const Playground = () => {
  const { message, isSocketReady, startRecording, stopRecording } =
    useAAITranscriptionRecording()

  return (
    <div>
      <Link href="/">Home</Link>
      <Button onPointerDown={startRecording} onPointerOut={stopRecording}>
        Hold to record
      </Button>
      <Button onClick={requestMicPermissions}>Request permission</Button>
      <div>{message}</div>
    </div>
  )
}

export default Playground
