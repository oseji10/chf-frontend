import Modal from "../modal/modal"
import ModalBody from "../modal/modalBody"
import ModalHeader from "../modal/modalHeader"

const TransactionDocumentsModal = props => {
    return props.showDocumentsModal && <Modal>
        <ModalHeader modalTitle="Transaction Documents" onModalClose={props.onModalClose} />
        <ModalBody>
            {props.documents.map((document, index) => <a key={index} className='text-success' href={document.document_url} target='_blank' rel='noreferrer'>{index +  1} - {document.document_name} </a>)}
        </ModalBody>
    </Modal>
}

export default TransactionDocumentsModal;