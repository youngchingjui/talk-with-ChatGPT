import { useEffect, useRef, useState } from "react"

import micStatus from "../models/micStatus"
import getTempToken from "../utils/getTempToken"

const useAAITranscriptionRecording = ({ setMessage, finishedCallback }) => {
  const [isSocketReady, setIsSocketReady] = useState(false)
  const [isPushed, setIsPushed] = useState(false) // true if `startRecording` is being called, usually if button is held down
  const [token, setToken] = useState()
  const [micState, setMicState] = useState(micStatus.idle)

  const socketRef = useRef()
  const recorderRef = useRef()
  const readerRef = useRef()
  const streamRef = useRef()

  // Get temp token on initialization
  useEffect(() => {
    getTempToken()
      .then((tkn) => setToken(tkn))
      .catch((err) => console.error(err))
  }, [])

  // This will update the micState based on the state of the socket and isPushed
  useEffect(() => {
    if (isSocketReady && isPushed) {
      setMicState(micStatus.listening)
    } else if (!isSocketReady && isPushed) {
      // If button is pushed, but socket is not ready yet
      setMicState(micStatus.loading)
    } else {
      setMicState(micStatus.idle)
    }
  }, [isSocketReady, isPushed])

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
      streamRef.current = null
    }

    if (readerRef.current) {
      readerRef.current.abort()
      readerRef.current = null
    }
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
    setIsPushed(true)
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
    setIsPushed(false)
    cleanup()
    getTempToken()
      .then((tkn) => setToken(tkn))
      .catch((err) => console.error(err))
    finishedCallback()
  }

  return {
    micState,
    startRecording,
    stopRecording,
  }
}

export default useAAITranscriptionRecording
