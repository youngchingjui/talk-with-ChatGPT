import { Toast } from "react-bootstrap";

const UnsupportedBrowserToast = (props) => {
  return (
    <Toast {...props}>
      <Toast.Header className="fw-bold">Browser not supported</Toast.Header>
      <Toast.Body>
        <p>
          Sorry, your browser currently doesn't support audio transcription.
        </p>
        <p>{`Browser details: ${navigator.userAgent}`}</p>
      </Toast.Body>
    </Toast>
  );
};

export default UnsupportedBrowserToast;
