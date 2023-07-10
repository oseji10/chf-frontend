import React, { useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import TableData from '../../components/table/tableData/tableData';
import TableRow from '../../components/table/tableRow/tableRow';
import API from '../../config/chfBackendApi';
import { formatName, renderMaskedText } from '../../utils/dataFormat.util';
import { _calculateAge } from '../../utils/date.util';
import Icon from '../../components/icon/icon'
import { APPROVED, DECLINED } from '../../utils/constant.util';
import { useDispatch } from 'react-redux';
import { formatAsMoney } from '../../utils/money.utils';
import { Link } from 'react-router-dom';
import { errorAlert, successAlert } from '../../utils/alert.util';
import { errorHandler } from '../../utils/error.utils';
import {Modal, ModalHeader, ModalFooter, ModalBody, PageTitle, InlineSearchBox,Input, Label, Textarea as TextArea, Button} from '../../components'
import MUIDataTable from 'mui-datatables';
import { AiOutlineComment } from 'react-icons/ai';



const COEStaffPatients = ({}) => {

    const tableColumns = [
        {
            name: "#",
            options: {filter: false},
        },
        {
            name: "CHF ID",
            options: {filter: false},
        },
        {
            name: "Patient Name",
            options: {filter: false},
        },
        {
            name: "Patient Phone",
            options: {filter: false},
        },
        {
            name: "Age",
            options: {filter: false},
        },
        {
            name: "Cancer Type",
        },
        {
            name: "Cancer State",
        },
        {
            name: "Status",
        },
        {
            name: "",
            options: {filter: false, sort: false},
        },
        {
            name: "",
            options: {filter: false, sort: false},
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
        carePlan: '',
        recommendedFund: 0,
        pageLoading: true,
        pagination: {
            perPage: 20,
            currentPage: 1,
            pagesCount: 1,
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
                API.get('/api/coestaff/patients'),
            ])

            return setState(prevState => ({
                ...prevState,
                pageLoading: false,
                patientsRepository: res[0].data.data,
                patients: res[0].data.data,
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
            carePlan: '',
            recommendedFund: 0,
        }))
    }

    const handleCompleteApproval = async status => {
        try {
            setStateValue('isApprovingPatient',true)

            if (!state.carePlan || state.carePlan.length < 50) {
                return errorAlert("Careplan must be at least 50 characters.")
            }

            if (!state.recommendedFund || state.recommendedFund < 1000000) {
                return errorAlert("Recommended fund must be at least 1,000,000 Naira.");
            }

            const res = await API.post('/api/coestaff/patient/review',{
                patient_id: state.activePatient.id,
                status,
                recommendedFund: state.recommendedFund,
                carePlan: state.carePlan
            });

            let updatedPatientData = state.activePatient;
            updatedPatientData.primary_physician_reviewed_on = res.data?.data?.primary_physician_reviewed_on;
            updatedPatientData.social_worker_reviewed_on = res.data?.data?.social_worker_reviewed_on;
            updatedPatientData.primary_physician_status = res.data?.data?.primary_physician_status;
            updatedPatientData.social_worker_status = res.data?.data?.social_worker_status;
            
            successAlert("Patient has been reviewed successfully");

            return setState(prevState => ({
                ...prevState,
                showReviewModal: false,
                activePatient: null,
                patients: prevState.patients.map( patient => patient.id === prevState.activePatient.id ? updatedPatientData : patient )
            }))

        } catch (error) {
            errorHandler(error)
        }finally{
            
            setStateValue('isApprovingPatient',false)
        }
    }

    // const filterPatients = () => {
    //     let value = state.patientSearchValue.toLowerCase();
    //     let patients = state.patientsRepository;

    //     if (state.patientSearchValue !== '') {
    //         patients = state.patientsRepository.filter(patient => {
    //         return patient.chf_id.toLowerCase().includes(value) || patient.user.email.toLowerCase().includes(value) || patient.user.phone_number.includes(value);
    //         });
    //     }
    //     let pagesCount = Math.ceil(patients.length / state.pagination.perPage);
        
    //     patients = patients.slice((state.pagination.currentPage - 1) * state.pagination.perPage, state.pagination.perPage * state.pagination.currentPage);

    //     return setState(prevState => ({
    //         ...prevState,
    //         patients,
    //         pagination: {
    //             ...prevState.pagination,
    //             pagesCount
    //         }
    //     }))

    //   return patients;
    // }

    const handleFilterPatients = e => {
        return setStateValue('patientSearchValue',e.target.value.toLowerCase())
 
    } 

    const handleShowSensitiveInformation = () => {
        return setState(prevState => ({
            ...prevState,
            showSensitiveInformation: true,
            showSensitiveInformationModal: false,
        }));
    }

    useEffect(() => {
        loadInitialData();
    },[])

    // useEffect(() => {
    //     filterPatients()
    // },[state.pageLoading,state.pagination.perPage,state.patientSearchValue,state.pagination.currentPage])


    return <div className='container'>
        <PageTitle icon='fa fa-users' title="My Patients" />
        <InlineSearchBox
            inputPlaceholder="Patient CHF ID, Email or Phone number"
            onInputChange={handleFilterPatients}
            
        />
        {(!state.showSensitiveInformation && <Button style={{marginBottom: '1rem'}} variant='secondary' onClick={() => setStateValue('showSensitiveInformationModal', true)}>Show Sensitive Information <Icon icon='fa fa-eye' /> </Button>) || <Button style={{marginBottom: '1rem'}} variant='success' onClick={() => setStateValue('showSensitiveInformation', false)}>Hide Sensitive Information  <Icon icon='fa fa-eye-slash' /></Button>}
        <MUIDataTable 
            columns={tableColumns}
            data={state.patients.map((patient, index) => [
                index + 1,
                patient.chf_id,
                renderMaskedText(formatName(patient.user), state.showSensitiveInformation),
                renderMaskedText(patient.user.phone_number, state.showSensitiveInformation),
                _calculateAge(patient.user.date_of_birth),
                patient.ailment?.ailment_type,
                patient.ailment_stage,
                patient.primary_physician_status,
                patient.primary_physician_status === 'pending' && <Button 
                    onClick={() => handleShowReviewModal(patient)}
                variant='success' >Review </Button>,
                <Link to={`/mdt/patients/${patient.chf_id}/careplan`}>
                    <Button variant='success'>
                        MDT Comments <AiOutlineComment />
                    </Button>
                </Link>
            ])}

            options={{
                selectableRows: false,
                // filter: false,
                elevation: 0,
                
            }}
        />


        {state.showReviewModal && <Modal fullscreen>
            <ModalHeader modalTitle="Review Patient" onModalClose={handleCloseReviewModal} />
            <ModalBody>
                <p>You are currently reviewing for:</p>
                <hr />
                <h3><strong>{formatName(state.activePatient.user)}</strong></h3>
                <Label label="Care Plan" />
                <TextArea onChange={(e) => setStateValue('carePlan', e.target.value)} value={state.carePlan} />
                <Label label='Recommended Fund' />
                <Input inputPlaceholder="Recommended funding" value={state.recommendedFund} onChange={e => setStateValue('recommendedFund', parseFloat(e.target.value ? e.target.value : 0))}  />
                <Label label={`Recommended Fund: ${formatAsMoney(state.recommendedFund)}`} />
            </ModalBody>
            <ModalFooter>
                {!state.isApprovingPatient ? <> 
                <Button
                    onClick={() => handleCompleteApproval(APPROVED)}
                    disabled={state.isApprovingPatient}
                    variant="success" className='mr-3'>Confirmed <Icon icon='fa fa-check-circle' /> </Button>
                {/* <Button
                    onClick={() => handleCompleteApproval(DECLINED)}
                    disabled={state.isApprovingPatient}
                    variant="danger">Decline <Icon icon='fa fa-window-close' /></Button>  */}
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


export default COEStaffPatients;