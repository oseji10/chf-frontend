import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import InlineSearchBox from '../../components/form/inlinesearchbox';
import Modal from '../../components/modal/modal';
import ModalBody from '../../components/modal/modalBody';
import ModalFooter from '../../components/modal/modalFooter';
import ModalHeader from '../../components/modal/modalHeader';
import PageTitle from '../../components/pageTitle/pageTitle';
import TableData from '../../components/table/tableData/tableData';
import TableRow from '../../components/table/tableRow/tableRow';
import CHFTable from '../../components/table/thead/table';
import THead from '../../components/table/thead/thead';
import API from '../../config/chfBackendApi';
import { formatName, renderMaskedText } from '../../utils/dataFormat.util';
import { _calculateAge } from '../../utils/date.util';
import Icon from '../../components/icon/icon'
import { APPROVED, DECLINED } from '../../utils/constant.util';
import { useDispatch } from 'react-redux';



const COEAdminPatients = ({}) => {
    const dispatch = useDispatch();

    const tableColumns = [
        {
            column_name: "#",
        },
        {
            column_name: "CHF ID",
        },
        {
            column_name: "Patient Name",
        },
        {
            column_name: "Patient Phone",
        },
        {
            column_name: "Age",
        },
        {
            column_name: "Cancer Type",
        },
        {
            column_name: "Cancer State",
        },
        {
            column_name: "Status",
        },
        {
            column_name: "",
        },
        {
            column_name: "",
        },
    ]

    const initailState = {
        patientsRepository: [],
        patients: [],
        isLoadingPatients: false,
        isApprovingPatient: false,
        activePatient: null,
        showSensitiveInformation: false,
        showSensitiveInformationModal: false,
        showReviewModal: false,
        patientSearchValue: '',
        pagination: {
            perPage: 20,
        },
    }

    const [state, setState] = useState(initailState);

    const setStateValue = (key, value) => {
        return setState(prevState => ({
            ...prevState,
            [key] : value
        }))
    }

    const loadInitialData = async () => {
        try {
            const res = await Promise.all([
                API.get('/api/coeadmin/patients'),
            ])

            console.log(res);

            return setState(prevState => ({
                ...prevState,
                patientsRepository: res[0].data.data,
                patients: res[0].data.data.slice(0, prevState.pagination.perPage),
            }))
        } catch (error) {
            console.log(error.response)
        }finally{

        }
    }

    const handleShowReviewModal = activePatient => {
        return setState(prevState => ({
            ...prevState,
            activePatient,
            showReviewModal: true,
        }))
    }

    const handleCloseReviewModal = () => {
        return setState(prevState => ({
            ...prevState,
            activePatient: null,
            showReviewModal: false,
        }))
    }

    const handleCompleteApproval = async status => {
        try {
            setStateValue('isApprovingPatient',true)
            const res = await API.post('/api/coestaff/patient/review',{
                patient_id: state.activePatient.id,
                status,
            });

            let updatedPatientData = state.activePatient;
            updatedPatientData.primary_physician_reviewed_on = res.data.data.primary_physician_reviewed_on;
            updatedPatientData.social_worker_reviewed_on = res.data.data.social_worker_reviewed_on;
            updatedPatientData.primary_physician_status = res.data.data.primary_physician_status;
            updatedPatientData.social_worker_status = res.data.data.social_worker_status;
            
            console.log(res)
            return setState(prevState => ({
                ...prevState,
                showReviewModal: false,
                activePatient: null,
                patients: prevState.patients.map( patient => patient.id === prevState.activePatient.id ? updatedPatientData : patient )
            }))

        } catch (error) {
            console.log(error.response)
        }finally{
            
            setStateValue('isApprovingPatient',false)
        }
    }

    const handleFilterPatients = e => {
        let value = e.target.value.toLowerCase(); //converted to lowercase for easy search

        if( value === '') return setStateValue('patients', state.patientsRepository);

        return setStateValue('patients',state.patientsRepository.filter(patient => {
            return patient.chf_id.toLowerCase().includes(value) || patient.user.email.toLowerCase().includes(value) || patient.user.phone_number.includes(value);
        }))
    } 

    const handleShowSensitiveInformation = () => {
        return setState(prevState => ({
            ...prevState,
            showSensitiveInformation: true,
            showSensitiveInformationModal: false,
        }));
    }

    const handleShowSensitiveInformationModal = () => {
        if (!state.showSensitiveInformation) {
            return setStateValue('showSensitiveInformationModal', true);
        }

        return handleShowSensitiveInformation();
    }

    useEffect(() => {
        loadInitialData();
    },[])


    const renderPatients = () => {
        if(!state.patients.length)
            return <TableRow>
                <TableData colSpan='7' data="No patients available" />
            </TableRow>

        return state.patients.map((patient, index) => <TableRow key={index}>
            <TableData data={index + 1} />
            <TableData data={patient.chf_id} />
            <TableData data={renderMaskedText(formatName(patient.user), state.showSensitiveInformation)} />
            <TableData data={renderMaskedText(patient.user.phone_number, state.showSensitiveInformation)} />
            <TableData data={_calculateAge(patient.user.date_of_birth)} />
            <TableData data={patient.ailment.ailment_type} />
            <TableData data={patient.ailment_stage} />
            <TableData data={patient.primary_physician_status} />
            <TableData >
                {patient.primary_physician_status === 'pending' && <Button 
                    onClick={() => handleShowReviewModal(patient)}
                variant='success' >Review </Button>}
            </TableData>
        </TableRow>)
    }



    return <div className='container'>
        <PageTitle icon='fa fa-users' title="My Patients" />
        <InlineSearchBox
            inputPlaceholder="Patient CHF ID, Email or Phone number"
            onInputChange={handleFilterPatients}
            
        />
        {(!state.showSensitiveInformation && <Button variant='secondary' onClick={() => setStateValue('showSensitiveInformationModal', true)}>Show Sensitive Information <Icon icon='fa fa-eye' /> </Button>) || <Button variant='success' onClick={() => setStateValue('showSensitiveInformation', false)}>Hide Sensitive Information  <Icon icon='fa fa-eye-slash' /></Button>}
        <CHFTable>
            <THead
                columns={tableColumns}
            />
            <tbody>
                {renderPatients()}
            </tbody>
            
        </CHFTable>


        {state.showReviewModal && <Modal>
            <ModalHeader modalTitle="Review Patient" onModalClose={handleCloseReviewModal} />
            <ModalBody>
                <p>You are currently reviewing for:</p>
                <p>{formatName(state.activePatient.user)}</p>
            </ModalBody>
            <ModalFooter>
                {!state.isApprovingPatient ? <> 
                <Button
                    onClick={() => handleCompleteApproval(APPROVED)}
                    disabled={state.isApprovingPatient}
                    variant="success" className='mr-3'>Approve <Icon icon='fa fa-check-circle' /> </Button>
                <Button
                    onClick={() => handleCompleteApproval(DECLINED)}
                    disabled={state.isApprovingPatient}
                    variant="danger">Decline <Icon icon='fa fa-window-close' /></Button> 
                    </> : <Button disabled={true} variant='secondary'>Please wait...</Button>}
            </ModalFooter>
        </Modal>}

        {
            state.showSensitiveInformationModal && <Modal>
                <ModalHeader modalTitle="Show Sensitive Data" onModalClose={() => setStateValue('showSensitiveInformationModal', false)} />
                <ModalBody>
                    <p>You are about to unmask sensitive data</p>
                    <p>Continue?</p>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={handleShowSensitiveInformation} variant='success'>Confirm</Button>
                </ModalFooter>
            </Modal>
        }
    </div>
}


export default COEAdminPatients;