import { useEffect, useState } from "react";
import axios from "axios";
import MicrophoneButton from "../components/MicrophoneButton";
import EditableText from "../components/EditableText";

const HomePage = () => {
  const [recognizedSpeech, setRecognizedSpeech] = useState(null);
  const [chatResponse, setChatResponse] = useState(null);
  const [maxTokens, setMaxTokens] = useState(100);
  const [temperature, setTemperature] = useState(0);

  useEffect(() => {
    sendToChatGPT();
  }, [recognizedSpeech]);

  const sendToChatGPT = async () => {
    console.log("sending to ChatGPT");

    if (!recognizedSpeech) {
      return;
    }

    const data = {
      model: "text-davinci-003",
      prompt: recognizedSpeech,
      temperature: parseFloat(temperature),
      max_tokens: parseInt(maxTokens),
    };
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
      },
    };
    try {
      const res = await axios.post(
        "https://api.openai.com/v1/completions",
        data,
        config
      );

      console.log("res", res);
      setChatResponse(res.data.choices[0].text);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <h1>Talk with OpenAI</h1>
      <div>
        Welcome to Talk with OpenAI, where you use your microphone to chat with
        OpenAI, instead of a keyboard
      </div>
      <h2> My question</h2>
      <MicrophoneButton
        result={recognizedSpeech}
        setResult={setRecognizedSpeech}
      />
      <div>Tap to record your question, tap again to turn off microphone</div>
      <EditableText
        currentText={recognizedSpeech}
        setCurrentText={setRecognizedSpeech}
      />
      <h2>ChatGPT response</h2>
      <label>Max Tokens</label>
      <input
        id="maxTokensInput"
        type="number"
        min="0"
        max="2048"
        onChange={(e) => setMaxTokens(e.target.value)}
        value={maxTokens}
      />
      <input
        id="maxTokensInput"
        type="range"
        min="0"
        max="2048"
        onChange={(e) => setMaxTokens(e.target.value)}
        value={maxTokens}
      />
      <label>Temperature</label>
      <input
        id="temperatureInput"
        type="number"
        min="0"
        max="1"
        step="0.01"
        onChange={(e) => setTemperature(e.target.value)}
        value={temperature}
      />
      <input
        id="temperatureInput"
        type="range"
        min="0"
        max="1"
        step="0.01"
        onChange={(e) => setTemperature(e.target.value)}
        value={temperature}
      />
      {chatResponse && <div>{chatResponse}</div>}
    </>
  );
};

export default HomePage;
