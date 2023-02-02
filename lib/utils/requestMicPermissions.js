const requestMicPermissions = () => {
  console.log("requesting permission")
  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then((stream) => {
      console.log("got permission")
      stream.getTracks().forEach((track) => track.stop())
    })
    .catch((err) => {
      console.error(err)
    })
}

export default requestMicPermissions
