import MUIDataTable from "mui-datatables";
import { useEffect } from "react";
import { Container, Icon, SingleActionModal, Title } from "../../../components";
import { PatientTransferService } from "../../../services";
import HospitalService from "../../../services/hospital.service";
import { getAuthStorageUser } from "../../../utils/storage.util";
import {AlertUtility, DataFormatUtility, DateUtility, TableUtility} from '../../../utils'
import { useState } from "react";

const COEAdminPatientTransfer = () =>{
    const initial_state = {
        transferRequests: [],
        isApproving: false,
        rowsSelected: [],
        showConfirmModal: false,
    }
    const [state, setState] = useState(initial_state)
    useEffect(() => {
        loadInitialData();
    },[])
    const user = getAuthStorageUser().user;

    const loadInitialData = async () => {
        try {
            const res = await HospitalService.findAllHospitalPatientTransferRequest(user.coe_id, "include[]=requestingPhysician&include[]=currentPhysician")
            return setState(prevState => ({
                ...prevState,
                transferRequests: res.data,
            }))
        } catch (error) {
            console.log(error)
        }
    }

    const setStateValue = (key, value) => {
        return setState(prevState => ({
        ...prevState,
        [key]: value,
        }))
    }

    const handleConfirmTransfer = async () => {
        try {
            setStateValue('isApproving',true)
            const transferIds = state.rowsSelected.map(row => state.transferRequests[row].id)
            const res = await HospitalService.approvePatientTransferRequest(user.coe_id,{transferIds})
            AlertUtility.successAlert("Patients transfer approved")
            return setState(prevState => ({
                ...prevState,
                showConfirmModal: false,
                transferRequests: prevState.transferRequests.map(transfer => {
                    for(let updatedTransfer of res.data){
                        if(updatedTransfer.id === transfer.id){
                            return updatedTransfer
                        }
                    }
                    return transfer;
                })
            }))
        } catch (error) {
            console.log(error.response)
        }finally{
            setStateValue('isApproving',false)
            
        }
    }

    
    return <div>
        <Container>
            <Title text="Patient Transfer to Doctor" />
            <MUIDataTable 
                columns={TableUtility.COEAdminPatientsTransferTableColumns}
                options={{
                    rowsSelected: state.rowsSelected,
                    onRowSelectionChange: (currentSelectedRow, data, selectedRowIndex) => {

                        return setStateValue('rowsSelected',selectedRowIndex)
                    },
                    elevation: 0,
                    customToolbarSelect: () => <Icon onClick={() => setStateValue('showConfirmModal', true) } style={{marginRight: '1rem', fontSize: '2rem', color: "#393",cursor: 'pointer'}} icon='fa fa-check-circle' />
                }}
                
                data={state.transferRequests.map((req, index) => [
                    index + 1,
                    req.patient_chf_id,
                    req.current_physician ? DataFormatUtility.formatName(req.current_physician) : "",
                    DataFormatUtility.formatName(req.requesting_physician),
                    DateUtility.timestampToRegularTime(req.created_at),
                    req.approved_on ? DateUtility.timestampToRegularTime(req.approved_on): "N/A",
                    req.status,

                ])}
            />

            <SingleActionModal
                show={state.showConfirmModal}
                modalTitle="Confirm patients transfer"
                content="You are about to confirm these patient transfer. Continue?"
                onConfirm={handleConfirmTransfer}
                onModalClose={() => setStateValue('showConfirmModal',false)} 
                loading={state.isApproving}
            />
        </Container>
    </div>
}

export default COEAdminPatientTransfer;