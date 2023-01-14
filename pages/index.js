import { useEffect, useState } from "react";
import axios from "axios";

const HomePage = () => {
  const [recognizedSpeech, setRecognizedSpeech] = useState(null);
  const [chatResponse, setChatResponse] = useState(null);

  const playground = () => {
    console.log("playground");

    const recognition = new webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();
    recognition.onstart = function () {
      console.log("Speech recognition started");
    };
    recognition.onresult = function (e) {
      const transcript = e.results[0][0].transcript;
      console.log(`Recognized speech: ${transcript}`);
      setRecognizedSpeech(transcript);
    };
    recognition.onend = function () {
      console.log("Speech recognition ended");
      recognition.stop();
    };
  };

  const sendToChatGPT = async () => {
    console.log("sending to ChatGPT");

    const data = {
      model: "text-davinci-003",
      prompt: recognizedSpeech,
      temperature: 0,
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
      <h1>Chat with ChatGPT</h1>
      <div>
        Welcome to Chat with ChatGPT, where you use your microphone to chat with
        ChatGPT, instead of a keyboard
      </div>
      <button onClick={playground}>Click to turn on mic</button>
      <button onClick={sendToChatGPT}>Send my prompt to ChatGPT</button>
      <div>(Mic will automatically turn off after you finish speaking)</div>
      <h2> My speech</h2>
      {recognizedSpeech && <div>{recognizedSpeech}</div>}
      <h2>ChatGPT response</h2>
      {chatResponse && <div>{chatResponse}</div>}
    </>
  );
};

export default HomePage;
