import MUIDataTable from "mui-datatables";
import { useState } from "react";
import { useEffect } from "react";
import { AiOutlineUserSwitch } from "react-icons/ai";
import { Container, InlineSearchBox, SingleActionModal, Title, PageTitle } from "../../../components";
import { COEService, PatientTransferService, UserService } from "../../../services";
import {AlertUtility, DataFormatUtility, DateUtility, TableUtility} from '../../../utils';
import { getAuthStorageUser } from "../../../utils/storage.util";

const PatientTransferRequest = () => {

    const initial_state = {
        patient: null,
        patientId: '',
        patientTransferRequests: [],
        isSearching: false,
        isRequesting: false,
    }
    const user = getAuthStorageUser().user;

    const [state, setState] = useState(initial_state);

    useEffect(() => {
        loadInitialData()
    },[])

    const loadInitialData = async ( ) => {
        try {
            const res = await UserService.findUserWithQueryParams(user.id,'include[]=patientTransferRequests')

            return setState(prevState => ({
                ...prevState,
                patientTransferRequests: res.data.patient_transfer_requests,
            }))
        } catch (error) {
            
        }
    }

    const setStateValue = (key, value) => {
        return setState(prevState => ({
        ...prevState,
        [key]: value,
        }))
    }

    const handleSearchPatient = async () => {
        try {
            const res = await COEService.findSingleCOEPatient(user.coe_id,state.patientId);
            return setStateValue('patient',res.data.data)
        } catch (error) {
            return AlertUtility.errorAlert("Patient not found");
        }
    }

    const handleRequestPatientTransfer = async () => {
        try {
            setStateValue('isRequesting', true)
            const res = await PatientTransferService.requestPatientTransfer({patient_chf_id: state.patient.patient.chf_id, current_physician_id: state.patient.patient.primary_physician});
            AlertUtility.successAlert("Patient transfer request sent.");
            return setState(prevState => ({
                ...prevState,
                patient: null,
                patientTransferRequests: [
                    res.data,
                    ...prevState.patientTransferRequests
                ]
            }))
        } catch (error) {
            AlertUtility.errorAlert("Cannot transfer this patient. Please contact CHF Support.");
        }finally{
            setStateValue('isRequesting', false)
        }
    }


    return <div>
        <Container>
            <PageTitle icon='fa fa-exchange-alt'  title="Patient Transfer" />
            <InlineSearchBox
                inputValue={state.patientId}
                inputPlaceholder="Search Patient with CHF ID"
                inputName="patientId"
                // loading={true}
                onInputChange = {(e) => setStateValue('patientId',e.target.value)}
                onButtonClick={handleSearchPatient}
            />

            <MUIDataTable
                columns={TableUtility.COEStaffPatientTransferTableColumns}
                options={{
                    elevation: 0,
                    selectableRows: 'none',
                }}
                data={state.patientTransferRequests.map((patientTransfer, index) => [
                    index + 1,
                    patientTransfer.patient_chf_id,
                    DateUtility.timestampToRegularTime(patientTransfer.created_at),
                    patientTransfer.approved_on ? DateUtility.timestampToRegularTime(patientTransfer.approved_on) : "N/A",
                    patientTransfer.status,
                ])}
            />
        </Container>

        {state.patient && <SingleActionModal
            show={state.patient}
            modalTitle="Request Patient Transfer"
            onModalClose={() => setStateValue('patient',null)}
            // onConfirm={() => null}
            buttonText="Request Transfer"
            content={<>
                <h4>{DataFormatUtility.formatName(state.patient)}</h4>
            </>}
            loading={state.isRequesting}
            onConfirm={handleRequestPatientTransfer}
            
        />}
    </div>
}

export default PatientTransferRequest;