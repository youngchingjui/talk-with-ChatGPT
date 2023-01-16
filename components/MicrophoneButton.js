import React, { useRef, useState } from "react";

const MicrophoneButton = ({ result, setResult, sendToOpenAI }) => {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const handleClick = () => {
    if (!listening) {
      recognitionRef.current = new webkitSpeechRecognition();
      recognitionRef.current.onresult = (event) => {
        setResult(event.results[0][0].transcript);
        console.log(event.results[0][0].transcript);
      };
      recognitionRef.current.start();
      setListening(true);
    } else {
      recognitionRef.current.stop();
      setListening(false);
      sendToOpenAI();
    }
  };

  return (
    <div
      style={{
        border: listening ? "3px solid green" : "1px solid grey",
      }}
      className="microphone-button d-flex align-items-center justify-content-center"
      onClick={handleClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        className="bi bi-mic"
        viewBox="0 0 16 16"
      >
        <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z" />
        <path d="M10 8a2 2 0 1 1-4 0V3a2 2 0 1 1 4 0v5zM8 0a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V3a3 3 0 0 0-3-3z" />
      </svg>
    </div>
  );
};

export default MicrophoneButton;
