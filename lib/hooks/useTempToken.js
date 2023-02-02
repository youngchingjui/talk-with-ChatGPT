import { useEffect, useState } from "react"

const useTempToken = ({ trigger }) => {
  // `trigger` should be a state variable that triggers getting a new token
  // usually after a WebSocket connection is closed

  const [token, setToken] = useState(null)

  // Get temp session token from server
  const getToken = async () => {
    const response = await fetch("/api/assemblyai/token")
    const data = await response.json()
    if (data.error) {
      console.error(data.error)
    }
    setToken(data.token)
  }

  useEffect(() => {
    getToken()
  }, [trigger])

  return { token }
}

export default useTempToken
