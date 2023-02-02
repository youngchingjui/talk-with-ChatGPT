const getTempToken = async () => {
  const response = await fetch("/api/assemblyai/token")
  const data = await response.json()
  if (data.error) {
    return new Error(data.error)
  }
  return data.token
}

export default getTempToken
