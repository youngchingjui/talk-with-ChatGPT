import axios from "axios";
const handler = async (req, res) => {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/completions",
      req.body,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );
    res.status(200).json(response.data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export default handler;
