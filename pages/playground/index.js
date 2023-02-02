import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Button } from "react-bootstrap"

const Playground = () => {
  const [message, setMessage] = useState(null)
  const [token, setToken] = useState(null)
  const [triggerNewtoken, setTriggerNewToken] = useState(null) // Need a new token everytime ws connection is closed

  const socketRef = useRef()
  const recorderRef = useRef()
  const readerRef = useRef()
  const streamRef = useRef()

  useEffect(() => {
    // Get temp session token from server
    const getToken = async () => {
      const response = await fetch("/api/assemblyai/token")
      const data = await response.json()
      if (data.error) {
        console.error(data.error)
      }
      setToken(data.token)
    }
    getToken()
  }, [triggerNewtoken])

  // Make sure no memory leaks on unmount
  useEffect(() => {
    return () => {
      console.log("unmounting")
      cleanup()
    }
  }, [])

  const cleanup = () => {
    // Clean up all references
    console.log("cleaning up")
    if (socketRef.current) {
      if (socketRef.current.readyState == 1) {
        socketRef.current.send(JSON.stringify({ terminate_session: true }))
      }
      socketRef.current.close()
      socketRef.current = null
    }

    if (recorderRef.current) {
      recorderRef.current.pauseRecording()
      recorderRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }

    if (readerRef.current) {
      readerRef.current.abort()
      readerRef.current = null
    }
  }
  const addSocketEventListeners = (socket) => {
    socket.onerror = (event) => {
      console.error("socket onerror", event)
    }
    socket.onclose = (event) => {
      console.log("closing socket", event)
    }
  }

  const addTrackEventListeners = (stream) => {
    const track = stream.getAudioTracks()[0]
    track.addEventListener("ended", () => {
      console.log("track ended")
    })
    track.addEventListener("mute", () => {
      console.log("track mute")
    })
    track.addEventListener("unmute", () => {
      console.log("track unmute")
    })
  }

  const startRecording = async () => {
    // Load RecordRTC
    const RecordRTC = (await import("recordrtc")).default

    // Simultaneously 1. open websocket and 2. begin recording audio

    // 1. Open new websocket connection
    const socket = new WebSocket(
      `wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${token}`
    )

    // handle incoming messages to display transcription to the DOM
    const texts = {}
    socket.onmessage = (message) => {
      let msg = ""
      const res = JSON.parse(message.data)

      if (res.error) {
        console.error(res.error)
        return
      }

      texts[res.audio_start] = res.text
      const keys = Object.keys(texts)
      keys.sort((a, b) => a - b)
      for (const key of keys) {
        if (texts[key]) {
          msg += ` ${texts[key]}`
        }
      }
      setMessage(msg)
    }

    // Add other websocket event listeners
    addSocketEventListeners(socket)

    // 2. Simultaneously begin recording audio
    let stream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (err) {
      console.error(err)
    }

    // Add other track event listeners
    addTrackEventListeners(stream)

    // Start recording incoming audio stream
    const recorder = new RecordRTC(stream, {
      type: "audio",
      mimeType: "audio/webm;codecs=pcm", // endpoint requires 16bit PCM audio
      recorderType: RecordRTC.StereoAudioRecorder,
      timeSlice: 250, // set 250 ms intervals of data that sends to AAI
      desiredSampRate: 16000,
      numberOfAudioChannels: 1, // real-time requires only one channel
      bufferSize: 4096,
      audioBitsPerSecond: 128000,
      ondataavailable: (blob) => {
        console.log("blob", blob)

        // Reject if blob is too small, otherwise AAI will return error "Audio duration is too short"
        // This is a workaround for a bug in RecordRTC
        // On Safari and Firefox, on 2nd attempt to record audio, the blob size is around 2774, which causes the error
        // Bug: I think maybe some streams are still open and not closed properly
        if (blob.size < 4000) {
          return
        }

        // convert blob to base64 string
        const reader = new FileReader()
        reader.onload = () => {
          const base64data = reader.result

          // audio data must be sent as a base64 encoded string
          if (socket && socket.readyState == 1) {
            socket.send(
              JSON.stringify({
                audio_data: base64data.split("base64,")[1],
              })
            )
          } else if (socket.readyState !== 1) {
            console.log("socket not ready", socket.readyState)
          }
        }
        reader.readAsDataURL(blob)
        readerRef.current = reader
      },
      onStateChanged: (state) => {
        console.log("state changed: ", state)
      },
    })
    recorder.startRecording()

    // Save references for cleanup
    streamRef.current = stream
    recorderRef.current = recorder
    socketRef.current = socket
  }

  const stopRecording = async () => {
    console.log("stopRecording")
    cleanup()

    // Create a new token to ensure a new session
    setTriggerNewToken(Date.now())
  }

  const handleRequestPermission = () => {
    console.log("requesting permission")
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        console.log("got permission")
        stream.getTracks().forEach((track) => track.stop())
      })
      .catch((err) => {
        console.error(err)
      })
  }

  return (
    <div>
      <Link href="/">Home</Link>
      <Button onPointerDown={startRecording} onPointerOut={stopRecording}>
        Hold to record
      </Button>
      <Button onClick={handleRequestPermission}>Request permission</Button>
      <div>{message}</div>
    </div>
  )
}

export default Playground
