import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatName } from '../../utils/dataFormat.util'
import { formatAsMoney } from '../../utils/money.utils'
import API from '../../config/chfBackendApi';
import { APPROVED, PENDING, REVIEWED } from '../../utils/constant.util';
import { PageTitle, PageSpinner, TableData, TableRow, CHFTable, THead, Button, Icon, Modal, ModalHeader, ModalBody, InlineSearchBox, TablePagination, Tag } from '../../components';
import MUIDataTables from 'mui-datatables';
import { toast } from "react-toastify";
import styles from "./billingHistory.module.scss";
import { timestampToRegularTime } from "../../utils/date.util";

import ModalFooter from '../../components/modal/modalFooter';
const initial_state = {
    patients: [],

    patientsRepository: [],
    isLoadingPatients: false,
    date: null,
    activePatient: null,
    activeHistory: null,
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
    // const loadHistory= async () => {
    //     try {
    //       setStateValue("dataLoading", true);
    //       const res = await Promise.all([
    //         API.get(
    //           `/api/wallet-topup/${state.chf_id}`
    //         ),
    //         // CAPBackendAPI.get('/product')
    //       ]);
    //       console.log(res)
    //       setState((prevState) => ({
    //         ...prevState,
    //         histories: res,
    //         // console.log(e)
            
    //         dataLoading: false,
    //       }));
    //     } catch (e) {
    //     }
    //   };

   
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
            // console.log(state.activePatient?.chf_id)
          const res = await API.post(`/api/wallet-topup`, {
            patient_chf_id: state.activePatient?.chf_id,
            
            amount_requested: state.topupAmount,
          });
          // Handle the response if necessary
          console.log(res.data);
          // Update the status of the resolved dispute in the state
    //       setState(prevState => ({
    //         ...prevState,
    //         patients: prevState.patients.map(prevDispute => {
    //           if (prevPatient.chf_id === patient.chf_id) {
    //             return { ...prevPatient, amount_requested: state.topupAmount };
    //           }
    //         //   return prevPatient;
    //     })
    // }));
    return toast.success('Wallet topup has been initiated')
        } catch (e) {
          // Handle the error if necessary
          console.error(e);
        } finally {
          setStateValue('isTopingUp', false);
        }
      };

      const handleCloseModal = () => {
        setState((prevState) => ({
          ...prevState,
          activeTransaction: null,
        }));
      };

      const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

    //   const [topupHistory, setTopupHistory] = useState(null);
      const [topupHistory, setTopupHistory] = useState([]);

      const handleHistoryClick = async (index) => {
        const clickedPatient = state.patients[index];
        // console.log(clickedPatient)
        try {
            setStateValue('dataLoading', true);
            const response = await API.get(`/api/wallet-topup/${clickedPatient.user_id}`);
            setTopupHistory(response.data.data); // Set the top-up history data
            console.log(response.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setStateValue('dataLoading', false);
        }
        setIsHistoryModalOpen(true);
        setState((prevState) => ({
            ...prevState,
            activeHistory: clickedPatient,
        }));
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
                            
                                <Button 
                                onClick={() => handleHistoryClick(index)}
                                variant='success'>
                                
                                
                                    Topup History <Icon icon='fa fa-book' />
                                </Button>
                            
                            <Button
                                onClick={() => setStateValue('activePatient', patient)}
                                // onClick={() => handleWalletTopup(patient)}
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

        {state.activeHistory && (
                <Modal  isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)}>
                    <ModalHeader
                        modalTitle={"Wallet Topup History"}
                        onModalClose={handleCloseModal}
                    />
                    <ModalBody>
                        <div className={["row", styles.billing_details].join(" ")}>
                            <div className="col-sm-12">
                                <h6 className={[styles.underlined, "text-success"].join(" ")}>
                                    List
                                </h6>
                                <table className="table table-responsive-sm">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Date Initiated</th>
                                            <th>Amount Requested</th>
                                            {/* <th>Requested By</th> */}
                                            <th>Amount Approved</th>                                            
                                            {/* <th>Approved By</th> */}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topupHistory &&
                                            topupHistory.map((historyItem, index) => (
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{timestampToRegularTime(historyItem.requested_on)}</td>
                                                    <td>{formatAsMoney(historyItem.amount_requested)}</td>
                                                    {/* <td>{historyItem.requester_id}</td> */}
                                                    <td>{formatAsMoney(historyItem?.amount_credited)}</td>
                                                    
                                                    {/* <td>{historyItem.credited_by}</td> */}
                                                </tr>
                                            ))}
                                        {/* <tr>
                                            <th>Total</th>
                                            <td colSpan="4">&nbsp;</td>
                                        </tr> */}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </ModalBody>
                </Modal>
            )}




      {state.activePatient && (
        <Modal >
          <ModalHeader
            // modalTitle="Topup"
           
            modalTitle={`Topup Wallet for - ${state.activePatient?.user.first_name + ' ' + state.activePatient?.user.last_name}`}
            onModalClose={() => setStateValue("activePatient", null)}
          />
          <ModalBody>
            <div className="form-group">
              <label className="text-secondary">Enter Amount To Topup</label>
              {/* <input
                className="form-control"
                required
                value={state.editServiceName}
                onChange={(e) => setStateValue(e.target.name, e.target.value)}
                name="topupAmount"
              /> */}

<input
                    className="form-control"
                    required
                    value={state.topupAmount} 
                    onChange={(e) => setStateValue('topupAmount', e.target.value)} 
                    name="topupAmount"
                />
            </div>
        </ModalBody>
          <ModalFooter>
            <button className="btn btn-success" onClick={handleWalletTopup}>
              Topup
            </button>
          </ModalFooter>
        </Modal>
      )}
    </div>
}

export default WalletTopup;