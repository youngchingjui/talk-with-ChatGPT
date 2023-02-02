import { useEffect, useRef, useState } from "react"

import useTempToken from "./useTempToken"

const useAAITranscriptionRecording = ({ setMessage }) => {
  const [isSocketReady, setIsSocketReady] = useState(false)
  const [triggerTokenRefresh, setTriggerTokenRefresh] = useState(Date.now()) // Need a new token everytime ws connection is closed

  const { token } = useTempToken({ trigger: triggerTokenRefresh })

  const socketRef = useRef()
  const recorderRef = useRef()
  const readerRef = useRef()
  const streamRef = useRef()

  // Make sure no memory leaks on unmount
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [])

  const cleanup = () => {
    // Clean up all references
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

    setIsSocketReady(false)
    setTriggerTokenRefresh(Date.now())
  }

  const addSocketEventListeners = (socket) => {
    socket.onerror = (event) => {
      console.error("socket onerror", event)
      setIsSocketReady(false)
    }
    socket.onclose = (event) => {
      setIsSocketReady(false)
    }
    socket.onopen = (event) => {
      setIsSocketReady(true)
    }
  }

  const addTrackEventListeners = (stream) => {
    const track = stream.getAudioTracks()[0]
    track.addEventListener("ended", () => {})
    track.addEventListener("mute", () => {})
    track.addEventListener("unmute", () => {})
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
          }
        }
        reader.readAsDataURL(blob)
        readerRef.current = reader
      },
      onStateChanged: (state) => {},
    })
    recorder.startRecording()

    // Save references for cleanup
    streamRef.current = stream
    recorderRef.current = recorder
    socketRef.current = socket
  }

  const stopRecording = async () => {
    cleanup()
  }

  return {
    isSocketReady,
    startRecording,
    stopRecording,
  }
}

export default useAAITranscriptionRecording
