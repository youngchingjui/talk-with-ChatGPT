import { useEffect, useRef, useState } from "react"

import Attempt3 from "./Attempt3"
import TestAudioTrack from "./TestAudioTrack"

const Playground = () => {
  const [message, setMessage] = useState(null)
  const [token, setToken] = useState(null)
  const [triggerNewtoken, setTriggerNewToken] = useState(null) // Need a new token everytime ws connection is closed

  const socketRef = useRef()
  const recorderRef = useRef()
  const readerRef = useRef()
  const streamRef = useRef()
  const recordRTCRef = useRef()

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

  useEffect(() => {
    // import RecordRTC and save to ref
    const loadRecordRTC = async () => {
      const RecordRTC = (await import("recordrtc")).default
      recordRTCRef.current = RecordRTC
    }
    loadRecordRTC()
  }, [])

  const handleStart = async () => {
    // establish wss with AssemblyAI (AAI) at 16000 sample rate
    socketRef.current = await new WebSocket(
      `wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${token}`
    )
    // handle incoming messages to display transcription to the DOM
    const texts = {}
    socketRef.current.onmessage = (message) => {
      let msg = ""
      const res = JSON.parse(message.data)

      // Close connection if AAI returns an error in data
      if (res.error) {
        console.error(res.error)
        socketRef.current.close()
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
    socketRef.current.onerror = (event) => {
      console.error("socket onerror", event)
      socketRef.current.close()
    }
    socketRef.current.onclose = (event) => {
      console.log("closing socket", event)
      handleStop()
    }

    socketRef.current.onopen = () => {
      // once socket is open, begin recording
      setMessage("")
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          streamRef.current = stream
          const track = streamRef.current.getAudioTracks()[0]
          track.addEventListener("ended", () => {
            console.log("track ended")
          })
          track.addEventListener("mute", () => {
            console.log("track mute")
          })
          track.addEventListener("unmute", () => {
            console.log("track unmute")
          })
          recorderRef.current = new recordRTCRef.current(stream, {
            type: "audio",
            mimeType: "audio/webm;codecs=pcm", // endpoint requires 16bit PCM audio
            recorderType: recordRTCRef.current.StereoAudioRecorder,
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
              readerRef.current = new FileReader()
              readerRef.current.onload = () => {
                const base64data = readerRef.current.result

                // ensure data is longer than 100 milliseconds
                // if (base64data.length < 100) {
                //   return
                // }
                // audio data must be sent as a base64 encoded string
                if (socketRef.current) {
                  socketRef.current.send(
                    JSON.stringify({
                      audio_data: base64data.split("base64,")[1],
                    })
                  )
                }
              }
              readerRef.current.readAsDataURL(blob)
            },
            onStateChanged: (state) => {
              console.log("state changed: ", state)
            },
          })
          recorderRef.current.startRecording()
        })
        .catch((err) => console.error(err))
    }
  }

  const handleStop = async () => {
    if (socketRef.current) {
      socketRef.current.send(JSON.stringify({ terminate_session: true }))
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
      <button onPointerDown={handleStart} onPointerOut={handleStop}>
        Hold to record
      </button>
      <button onClick={handleRequestPermission}>Request permission</button>
      <div>{message}</div>
      <TestAudioTrack />
      <Attempt3 />
    </div>
  )
}

export default Playground
