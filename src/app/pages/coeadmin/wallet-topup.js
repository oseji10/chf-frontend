import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatName } from '../../utils/dataFormat.util'
import { formatAsMoney } from '../../utils/money.utils'
import API from '../../config/chfBackendApi';
import { APPROVED, PENDING, REVIEWED } from '../../utils/constant.util';
import { PageTitle, PageSpinner, TableData, TableRow, CHFTable, THead, Button, Icon, Modal, ModalHeader, ModalBody, InlineSearchBox, TablePagination, Tag } from '../../components';
import MUIDataTables from 'mui-datatables';

const initial_state = {
    patients: [],
    patientsRepository: [],
    isLoadingPatients: false,
    date: null,
    activePatient: null,
    patientSearchInputValue: '',
    pagination: {
        per_page: 10,
        page: 1,
        filter: "",
        filter_type: "",
        links: null,
        pages: 1,
        current_page: 1,
    },
}

const WalletTopup = () => {
    const [state, setState] = useState(initial_state)

    /* LOAD DATA TO INITIALIZE PAGE */
    const loadData = async () => {
        setStateValue('isLoadingPatients', true)
        try {
            const res = await API.get('/api/coe/patients/mdt');
            const patients = res.data?.data;
            // const patientsRepository = res.data.data.filter(patient => patient.social_worker_status.toUpperCase() === APPROVED && patient.primary_physician_status.toUpperCase() === APPROVED)
            return setState(prevState => ({
                ...prevState,
                patients,
                patientsRepository: patients,
            }))

        } catch (error) {
            console.log(error.response);
        } finally {
            setStateValue('isLoadingPatients', false)
        }
    }

    const setStateValue = (key, value) => {
        return setState(prevState => ({
            ...prevState,
            [key]: value
        }))
    }

    useEffect(() => {
        loadData();
    }, [])

    useEffect(() => {
        handleSearchPatient();
    }, [state.patientSearchInputValue])

    const handleSearchPatient = async () => {
        let patients = filterProfile();

        return setState(prevState => ({
            ...prevState,
            patients,
            pagination: {
                ...prevState.pagination,
            }
        }))

    };

    const filterProfile = () => {
        let value = state.patientSearchInputValue.toLowerCase(); //converted to lowercase for easy search

        let patients = state.patientsRepository;

        if (state.patientSearchInputValue !== '') {
            patients = state.patientsRepository.filter(patient => {
                return patient.chf_id.toLowerCase().includes(value) || patient.user.email.toLowerCase().includes(value) || patient.user.phone_number.includes(value);
            });
        }


        /* ALL PATIENTS WITH APPLICATION REVIEW !IN PROGRESS HAVE COMPLETED REGISTRATIONI */

        return patients;
    }

    const mdt_patients_table_columns = [
        {
            name: "#",
            options: {
                filter: false,
                sort: false,
            },
        },
        {
            name: "Patient ID",
            options: {
                filter: false,
                sort: false,
            },
        },
        {
            name: "Patient Name",
            options: {
                filter: false,
                sort: false,
            },
        },
        {
            name: "Primary COE",
            options: {
                filter: false,
                sort: false,
            },
        },
        {
            name: "Wallet Balance",
            options: {
                filter: false,
                sort: false,
            },
        },
        // {
        //     name: "Status",
        //     options: {
        //         customBodyRender: (status) => <Tag variant={status === PENDING ? 'danger' : 'primary'} text={status} />
        //     }
        // },
        {
            name: "",
            options: {
                filter: false,
                sort: false,
            },
        },
    ]


    const handleWalletTopup = async (patient) => {
        setStateValue('isTopingUp', true);
        try {
          const res = await API.post(`/api/wallet-topup`, {
            patient_chf_id: patient?.chf_id,
            amount_requested: "5000",
          });
          // Handle the response if necessary
          console.log(res.data);
          // Update the status of the resolved dispute in the state
          setState(prevState => ({
            ...prevState,
            patients: prevState.patients.map(prevDispute => {
              if (prevPatient.chf_id === patient.chf_id) {
                return { ...prevPatient, amount_requested: '5000' };
              }
              return prevPatient;
            })
          }));
        } catch (e) {
          // Handle the error if necessary
          console.error(e);
        } finally {
          setStateValue('isTopingUp', false);
        }
      };


    return <div className='container'>
        <PageTitle title='Wallet Topup Request Page' />
        <div className='row'>
            <div className='col-12'>
                <InlineSearchBox
                    inputPlaceholder="Search Patient by CHF ID/Email/Phone Number"
                    inputValue={state.patientSearchInputValue}
                    onInputChange={e => setStateValue('patientSearchInputValue', e.target.value)}
                />
            </div>
            <div className='col-12'>
                <MUIDataTables
                    columns={mdt_patients_table_columns}
                    data={state.patients.map((patient, index) => [
                        index + 1,
                        patient.chf_id,
                        (formatName(patient.user)),
                        patient.coe?.coe_name,
                 formatAsMoney(patient.wallet?.balance),
                        // patient.mdt_recommended_amount && REVIEWED || PENDING,
                        <>
                            <Link to={`/mdt/patients/${patient.chf_id}/wallet-topup-history`}>
                                <Button variant='success'>
                                    Topup History <Icon icon='fa fa-book' />
                                </Button>
                            </Link>
                            <Button
                                // onClick={() => setStateValue('activePatient', patient)}
                                onClick={() => handleWalletTopup(patient)}
                                variant='secondary ml-2'> Request for Topup <Icon icon='fa fa-plus' />
                            </Button>
                            {/* <Button
  onClick={() => handleResolveDispute(dispute)}
  variant='warning'
>
  Resolve
</Button> */}
                        </>
                    ])}
                    options={{
                        elevation: 0,
                        selectableRows: 'none'
                    }}
                />
            </div>
        </div>

        {state.activePatient && <Modal fullscreen>
            <ModalHeader modalTitle="Care Plan" onModalClose={() => setStateValue('activePatient', null)} />
            <ModalBody>
                <h3>{formatName(state.activePatient.user)}</h3>
                <p> <strong>Recommended Fund: {formatAsMoney(state.activePatient.mdt_recommended_fund ? state.activePatient.mdt_recommended_fund : 0)}</strong> </p>
                <hr />
                {state.activePatient.care_plan ? state.activePatient.care_plan : "No care plan available"}
            </ModalBody>
        </Modal>}
    </div>
}

export default WalletTopup;