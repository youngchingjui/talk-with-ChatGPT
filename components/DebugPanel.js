import React, { useState, useEffect } from "react";

const DebugPanel = () => {
  const [logs, setLogs] = useState([]);
  const [userAgent, setUserAgent] = useState("");

  useEffect(() => {
    setUserAgent(navigator.userAgent);

    // Override the console.log function to capture logs
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      setLogs((prevLogs) => [...prevLogs, args]);
      originalConsoleLog(...args);
    };
  }, []);

  return (
    <div>
      <h2>Debug Panel</h2>
      <div>
        <h3>User Agent</h3>
        <p>{userAgent}</p>
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
  );
};

export default DebugPanel;
