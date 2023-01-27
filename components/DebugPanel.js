import React, { useEffect, useState } from "react"

const DebugPanel = () => {
  const [logs, setLogs] = useState([])
  const [userAgent, setUserAgent] = useState("")
  const [language, setLanguage] = useState("")
  const [languages, setLanguages] = useState("")

  useEffect(() => {
    setUserAgent(navigator.userAgent)
    setLanguage(navigator.language)
    setLanguages(navigator.languages)
    // Override the console.log function to capture logs
    const originalConsoleLog = console.log
    console.log = (...args) => {
      setLogs((prevLogs) => [...prevLogs, args])
      originalConsoleLog(...args)
    }
  }, [])

  return (
    <div>
      <h2>Debug Panel</h2>
      <div>
        <h3>User Details</h3>
        <p>{`User Agent: ${userAgent}`}</p>
        <p>{`Language: ${language}`}</p>
        <p>{`Languages: ${languages}`}</p>
      </div>
      <div>
        <h3>Console Logs</h3>
        {logs.map((log, index) => (
          <div key={index}>
            {log.map((l, i) => (
              <p key={i}>{typeof l === "object" ? JSON.stringify(l) : l}</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default DebugPanel
