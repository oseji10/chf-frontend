import { Toast } from "react-bootstrap";
import { useState } from "react";

function PopUp({ content, title = "", type, dismissible = true }) {
  const [show, setShow] = useState(true);
  const toggleShow = () => setShow(!show);
  const getBackground = () => {
    if (type === "success") return "#DFF2BF";
    else if (type === "danger") return "#FFD2D2";
    else if (type === "info") return "#BDE5F8";
    else {
      return "#f5f5f5";
    }
  };

  const getColor = () => {
    if (type === "success") return "#4F8A10";
    else if (type === "danger") return "#D8000C";
    else if (type === "info") return "#00529B";
    else {
      return "#666";
    }
  };

  const getIcon = () => {
    if (type === "success") return "fa fa-check";
    else if (type === "danger") return "fa fa-times-circle";
    else if (type === "info") return "fa fa-info-circle";
    else {
      return "fa fa-info-circle";
    }
  };

  return (
    <Toast
      show={show}
      style={{
        marginBottom: "10px",
        display: "block",
        width: "auto",
        maxWidth: "400px",
        fontSize: "10pt",
        fontWeight: "400",
        color: getColor(),
        background: getBackground(),
      }}
    >
      {title && (
        <div className="d-flex pt-2 mx-2">
          <strong className="mr-auto">
            <i className={getIcon()}></i> {title}
          </strong>
          {dismissible && (
            <span className="btn btn-sm" onClick={toggleShow}>
              <strong style={{ color: getColor() }}>X</strong>
            </span>
          )}
        </div>
      )}
      <Toast.Body>{content}</Toast.Body>
    </Toast>
  );
}

export default PopUp;
