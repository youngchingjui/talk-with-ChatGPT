const MicButtonContainer = ({ children, ...props }) => {
  return (
    <div className="mic-button-container" {...props}>
      {children}
    </div>
  )
}

export default MicButtonContainer
