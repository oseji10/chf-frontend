import { Button, Modal, ModalBody, ModalHeader, ModalFooter } from "../.."

const SingleActionModal = ({onModalClose, modalTitle, show, variant='success', buttonText="Confirm", content, onConfirm, loading=false}) => {
    return show && <Modal>
        <ModalHeader
            modalTitle={modalTitle} 
            variant={variant}
            onModalClose={onModalClose} />
        <ModalBody>
            {content}
        </ModalBody>
        <ModalFooter>
            <Button
                variant={variant}
                text={buttonText}
                onClick={onConfirm}
                disabled={loading}
                loading={loading}
            />
        </ModalFooter>
    </Modal>
}

export default SingleActionModal;