import { formatName } from "../../utils/dataFormat.util"
import { formatAsMoney } from "../../utils/money.utils"
import Modal from "../modal/modal";
import ModalBody from "../modal/modalBody";
import ModalHeader from "../modal/modalHeader";

const CareplanModal = ({show = false, patient, user, onClose}) => {
    return show ? <Modal fullscreen>
            <ModalHeader modalTitle="Patient Careplan" onModalClose={onClose} />
            <ModalBody>
                <h3> <strong>{formatName(user)}</strong> </h3>
                <p>Physician Recommended Fund: <del>N</del>{formatAsMoney(patient.mdt_recommended_fund)}</p>
                <p>MDT Recommended Fund: <del>N</del>{formatAsMoney(patient.mdt_recommended_amount ? patient.mdt_recommended_amount : 0)}</p>
                <hr />
                <p>Careplan:</p>
                <p>
                  {patient.care_plan}
                </p>
            </ModalBody> 
        </Modal>: null
}

export default CareplanModal;