import parseJsonSse from "@beskar-labs/parse-json-sse"
import { useState } from "react"
import { Button } from "react-bootstrap"

const Playground = () => {
  const [text, setText] = useState("")
  const handleClick = async () => {
    console.log("handleClick")

    const prompt = "Sing me a lullaby"
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      if (!res.ok) {
        throw new Error(res.statusText)
      }

      const data = res.body

      if (!data) {
        return
      }

      console.log("res", res)
      console.log("data", data)

      await parseJsonSse({
        data,
        onParse: (json) => {
          if (!json.choices.length) {
            throw new Error("No choices")
          }

          setText((prev) => prev + json.choices[0].text)
        },
        onFinish: () => {
          console.log("Finished")
        },
      })
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
      <h1>Playground</h1>
      <Button onClick={handleClick}>Test</Button>
      <h2>SSE Output</h2>
      <div>{text}</div>
    </>
  )
}

export default Playground
