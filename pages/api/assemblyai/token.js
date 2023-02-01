import axios from "axios"

const handler = async (req, res) => {
  try {
    const response = await axios.post(
      "https://api.assemblyai.com/v2/realtime/token",
      { expires_in: 3600 },
      { headers: { Authorization: process.env.ASSEMBLYAI_API_KEY } }
    )
    const { data } = response
    res.json(data)
  } catch (err) {
    const {
      response: { status, data },
    } = err
    res.status(status).json(data)
  }
}

export default handler
