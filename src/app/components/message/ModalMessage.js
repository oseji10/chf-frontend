import { Modal } from "react-bootstrap";
import Button from "../button";

// A simple show and hide state in the parent component can show or hide this modal.
// onClick={props.onHide}

function ModalMessage({ title, dismissible = true, onHide, children, show, rest }) {
  return (
    <Modal show={show} aria-labelledby="contained-modal-title-vcenter" size="lg" centered>
      {/*Modal header  */}
      {dismissible ? (
        <Modal.Header>
          <Modal.Title id="contained-modal-title-vcenter">{title}</Modal.Title>
          <Button
            btnClass={"btn btn-secondary"}
            type={"button"}
            value="X"
            onClick={onHide}
          />
        </Modal.Header>
      ) : (
        <Modal.Header>
          <Modal.Title id="contained-modal-title-vcenter">{title}</Modal.Title>
        </Modal.Header>
      )}

      {/* Modal body */}
      <Modal.Body>{children}</Modal.Body>
    </Modal>
  );
}

export default ModalMessage;
