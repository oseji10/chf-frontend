/* eslint-disable eqeqeq */
/* eslint-disable no-script-url */
import React, { useState, useEffect } from "react";
import styles from "../../chfadmin/chfadmin.module.scss";
import API from "../../../config/chfBackendApi";
// import TablePagination from "../../../components/tablePagination";
import { formatAsMoney } from "../../../utils/money.utils";
import {
  timestampToRegularTime,
  _calculateAge,
} from "../../../utils/date.util";
import { Button, Col, Row, Spinner } from "react-bootstrap";
// import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getAuthStorageUser } from "../../../utils/storage.util";
import { formatName, renderMaskedText } from "../../../utils/dataFormat.util";
import { propagateAlert } from "../../../redux/alertActions";
// import { downloadCSV } from "../../../utils/file.util";
import { ACTIVE, APPROVED, CMD_APPROVED, CMD_DECLINED, DECEASED, DECLINED, INACTIVE, IN_PROGRESS, PENDING, REQUEST_FUND_RETRIEVAL, REVIEWED } from "../../../utils/constant.util";
import { CareplanModal, Select, Label, Icon, PageTitle, AuthorizedOnlyComponent, ToggleSwitch, ButtonLoader } from "../../../components";
import MUIDataTable from "mui-datatables";
import { ConstantUtility, DataFormatUtility, MoneyUtility, TableUtility } from "../../../utils/";
import { CircularProgress, Dialog, DialogContent, DialogTitle, InputLabel, TextField } from "@material-ui/core";
import { Typography } from "@material-ui/core";
import { DialogActions } from "@material-ui/core";
import { Divider, Select as MUISelect } from "@material-ui/core";
import ConditionalComponent from "../../../components/utilities/ConditionalComponent";
import { FormControl } from "@material-ui/core";
import { MenuItem } from "@material-ui/core";
import { errorHandler } from "../../../utils/error.utils";
import { toast } from "react-toastify";


const initial_state = {
  tableLoading: false,
  patients: [],
  patientsRepository: [],
  activePatient: null,
  patientSearchInputValue: "",
  patientSearched: false,
  activeMenu: 1,
  showMoreModal: false,
  showSensitiveInformationModal: false,
  showSensitiveInformation: false,
  showOnlyCompletedProfile: false,
  showReviewModal: false,
  states: [],
  statusFilter: '',
  isReviewingPatient: false,
  showCareplan: false,
  retrievalComment: '',
  coe: null,
  pagination: {
    per_page: 10,
    page: 1,
    filter: "",
    filter_type: "",
    links: null,
    pages: 1,
    current_page: 1,
  },
  alert: {
    alert_type: null,
    message: "",
    alert_color: "white",
  },
};

export default function COEAdminPatients() {
  const dispatch = useDispatch()
  const auth = getAuthStorageUser()

  const [state, setState] = useState(initial_state);
  const [isLoading, setIsLoading] = useState(false);
  const [showRetrieveModal, setShowRetrievalModal] = useState(false)
  const [reasonForRetrieval, setReasonForRetrieval] = useState('');
  const [retrievalComment, setRetrievalComment] = useState('')

  const setStateValue = (key, value) => {
    return setState(prevState => ({
      ...prevState,
      [key]: value
    }))
  }

  const handleShowSensitiveInformation = () => {
    return setState(prevState => ({
      ...prevState,
      showSensitiveInformation: true,
      showSensitiveInformationModal: false,
    }));
  }

  // const printToCSV = () => {
  //   var csvContent = "data:text/csv;charset=utf-8,";

  //   csvContent += "PATIENT CHF ID,AILMENT TYPE,AILMENT STAGE,PRIMARY PHYSICIAN,WALLET BALANCE,PROFILE COMPLETION STATUS";
  //   csvContent += "\r\n";

  //   let patients = filterProfile()

  //   patients.map(patient => {
  //     let row = `${patient.chf_id},${patient.ailment ? patient.ailment.ailment_type : ""},${patient.ailment_stage ? patient.ailment_stage : ""},${patient.primary_physician ? formatName(patient.primary_physician) : ""},${formatAsMoney(patient.user.wallet.balance)},${patient.application_review.length && patient.application_review[0].status.toUpperCase() !== IN_PROGRESS ? "Profile Completed" : "Incomplete Profile"}`;
  //     csvContent += row + "\r\n";

  //   });

  //   downloadCSV(csvContent)
  // }



  useEffect(() => {
    try {
      loadPatients();
    } catch (e) {
      console.log(e)
    }
  }, [state.activeMenu]);

  useEffect(() => {
    handleSearchPatient()
  }, [state.showOnlyCompletedProfile, state.statusFilter])

  /* FETCH PATIENTS FROM BACKEND SERVICE */
  const loadPatients = async () => {
    try {
      setIsLoading(true);

      // const res = await API.get(`/api/coeadmin/patient`)
      // const res = await Promise.all([
      //   API.get(`/api/coeadmin/patient`),
      //   API.get(`/api/coes/${auth.user.coe_id}`)
      // ]);

      const patientsRequest = await API.get(`/api/coeadmin/patient`);
      const coeRequest = await API.get(`/api/coes/${auth.user.coe_id}`);


      setState((prevState) => ({
        ...prevState,
        patientsRepository: patientsRequest.data?.data,
        patients: patientsRequest.data?.data,
        activePatient: patientsRequest.data?.data[0],
        coe: coeRequest.data.data,
      }));

      // handleSearchPatient()
    } catch (e) {
      console.log(e)
    } finally {
      setIsLoading(false);
    }
  };

  // const handlePageChange = (current_page) => {

  //   setState((prevState) => ({
  //     ...prevState,
  //     pagination: {
  //       ...prevState.pagination,
  //       current_page,
  //     },
  //   }));
  //   // handleSearchPatient();
  // };

  // const toggleLoader = (loader_state) => {
  //   setState((prevState) => ({
  //     ...prevState,
  //     tableLoading: loader_state,
  //   }));
  // };

  const filterProfile = () => {
    let value = state.patientSearchInputValue.toLowerCase(); //converted to lowercase for easy search

    let patients = state.patientsRepository;

    if (state.patientSearchInputValue !== '') {
      patients = state.patientsRepository.filter(patient => {
        return patient.chf_id.toLowerCase().includes(value) || patient.user.email.toLowerCase().includes(value) || patient.user.phone_number.includes(value);
      });
    }


    /* ALL PATIENTS WITH APPLICATION REVIEW !IN PROGRESS HAVE COMPLETED REGISTRATIONI */
    if (state.showOnlyCompletedProfile) {
      patients = patients.filter(patient => {
        return patient.application_review.length && patient.application_review[0].status.toUpperCase() !== IN_PROGRESS
      })
      // patients = filterCompletedProfile(patients)
    }

    if (state.statusFilter && state.statusFilter !== '') {
      if (state.statusFilter.toUpperCase() === PENDING) {
        patients = patients.filter(patient => patient.application_review.length && patient.application_review[0].status.toUpperCase() === PENDING)
      } else if (state.statusFilter.toUpperCase() === APPROVED) {
        patients = patients.filter(patient => patient.application_review.length && patient.application_review[0].status.toUpperCase() === APPROVED);
      } else if (state.statusFilter.toUpperCase() === IN_PROGRESS) {
        patients = patients.filter(patient => patient.application_review.length && patient.application_review[0].status.toUpperCase() === IN_PROGRESS);
      } else if (state.statusFilter.toUpperCase() === REVIEWED) {
        patients = patients.filter(patient => patient.primary_physician_reviewed_on !== null && patient.mdt_recommended_amount !== 0 && patient.social_worker_reviewed_on !== null);
      }
    }

    return patients;
  }
  /* SEARCH APPLICATION HANDLERS */

  const handleSearchPatient = async () => {
    let patients = filterProfile();

    let pages = Math.ceil(patients.length / state.pagination.per_page);

    // patients = patients.slice((state.pagination.current_page - 1) * state.pagination.per_page, state.pagination.per_page * state.pagination.current_page);

    return setState(prevState => ({
      ...prevState,
      // patients: patients.filter(patient => {
      //     return patient.chf_id.toLowerCase().includes(value) || patient.user.email.toLowerCase().includes(value) || patient.user.phone_number.includes(value);
      // }),
      patients,
      pagination: {
        ...prevState.pagination,
        pages,
      }
    }))

  };


  /* END SEARCH APPLICATION HANDLERS */
  const handlePatientSelect = (index) => {
    // window.scrollTo(0, 0);
    setState((prevState) => ({
      ...prevState,
      activePatient: prevState.patients.find(
        (patient, currentIndex) => currentIndex === index
      ),
      showMoreModal: true,
    }));
  };

  const handleShowReviewModal = activePatient => {
    return setState(prevState => ({
      ...prevState,
      activePatient,
      showReviewModal: true,
    }))
  }


  /* RENDERS THE ACTIVE PATIENT TO THE SIDEBAR */
  const renderSinglePatient = () => {
    const { activePatient } = state;

    if (!state.activePatient) {
      return <h5>No patient selected</h5>;
    }

    return (
      <>
        <div className="d-flex justify-content-end">
          <small
            className={[
              styles.status,
              !activePatient.application_review || !activePatient.application_review.status
                ? styles.danger
                : activePatient.application_review.status.toUpperCase() === PENDING
                  ? styles.warning
                  : activePatient.application_review.status.toUpperCase() === APPROVED ? styles.success : styles.danger,
            ].join(" ")}
          >
            {activePatient.application_review ? activePatient.application_review.status : "N/A"}
          </small>
        </div>
        <h4>
          {[activePatient.user.first_name, activePatient.user.last_name].join(
            " "
          )}
        </h4>
        <h5>
          {activePatient.ailment && activePatient.ailment.ailment_type ? `${activePatient.ailment.ailment_type} Stage ${activePatient.ailment.ailment_stage}` : "No cancer stage"} (Stage{" "}
          )
        </h5>
        <small className="d-block">
          <b>Application Date</b>{" "}
        </small>
        <div className={styles.status_container}>
          <small>{timestampToRegularTime(activePatient.created_at)}</small>
        </div>
        <div className={styles.flex_cc}>
          <small>
            <strong>CHF ID:</strong>
          </small>
          <small>{activePatient.chf_id}</small>
        </div>
        <div className={styles.flex_cc}>
          <small>
            <strong>Email:</strong>
          </small>
          <small>{renderMaskedText(activePatient.user.email, state.showSensitiveInformation)}</small>
        </div>
        <div className={styles.flex_cc}>
          <small>
            <strong>Phone number:</strong>
          </small>
          <small>{renderMaskedText(activePatient.user.phone_number, state.showSensitiveInformation)}</small>
        </div>
        <div className={styles.flex_cc}>
          <small>
            <strong>Age:</strong>
          </small>
          <small>{_calculateAge(activePatient.user.date_of_birth)}</small>
        </div>

        <div className={styles.flex_cc}>
          <small>
            <strong>ID Type:</strong>
          </small>
          <small>National ID</small>
        </div>
        <div className={styles.flex_cc}>
          <small>
            <strong>ID No:</strong>
          </small>
          <small>{activePatient.identification_number}</small>
        </div>
        {state.activePatient.state &&
          <div className={styles.flex_cc}>
            <small>
              <strong>State of origin:</strong>
            </small>
            <small>{state.activePatient.state.state}
            </small>
          </div>
        }
        {state.activePatient.state_of_residence &&
          <div className={styles.flex_cc}>
            <small>
              <strong>State of residence:</strong>
            </small>
            <small>{state.activePatient.state_of_residence.state}
            </small>
          </div>
        }
        {state.activePatient.city &&
          <div className={styles.flex_cc}>
            <small>
              <strong>City:</strong>
            </small>
            <small>{state.activePatient.city}
            </small>
          </div>
        }
        {state.activePatient.address &&
          <div className={styles.flex_cc}>
            <small>
              <strong>Address:</strong>
            </small>
            <small>{state.activePatient.address}
            </small>
          </div>
        }
        <div className={styles.flex_cc}>
          <small>
            <strong>Wallet:</strong>
          </small>
          <small>
            {activePatient.user.wallet ? <small><del>N</del> {formatAsMoney(activePatient.user.wallet.balance)}</small> : <small><del>N</del> 0.00</small>}
          </small>
        </div>
        <small className="d-block mt-2">
          <strong>Primay Physician</strong>
        </small>
        <small className="mb-2">{activePatient.primary_physician ? formatName(activePatient.primary_physician) : ""}</small>
        {state.activePatient.primary_physician_reviewed_on && <small className="d-block mt-2">
          <Button onClick={handleShowCareplan}>View Careplan</Button>
        </small>}
        <div className={styles.footer}>
          <AuthorizedOnlyComponent requiredPermission="EDIT_PATIENT">
            <a
              href="javascript:;"
              className="btn btn-sm btn-success"
              onClick={() => handleDirectStateChange("showEditModal", true)}
            >
              Edit
            </a>
          </AuthorizedOnlyComponent>
        </div>
      </>
    );
  };

  /* USE TO CHANGE A VALUE THAT IS DIRECTLY IN THE STATE OBJECT */
  const handleDirectStateChange = (modal, value) => {
    setState((prevState) => ({
      ...prevState,
      [modal]: value,
    }));
  };


  const handleCompleteReview = async status => {
    try {
      setStateValue('isReviewingPatient', true)
      const res = await API.post('/api/coeadmin/patient/review', {
        patient_id: state.activePatient.id,
        status,
      });

      let updatedPatientData = state.activePatient;
      updatedPatientData.cmd_reviewed_on = res.data.data.cmd_reviewed_on;
      updatedPatientData.cmd_review_status = res.data.data.cmd_review_status;

      dispatch(propagateAlert({
        variant: "success",
        alert: "Patient review successful"
      }))

      return setState(prevState => ({
        ...prevState,
        showReviewModal: false,
        activePatient: null,
        patients: prevState.patients.map(patient => patient.id === prevState.activePatient.id ? updatedPatientData : patient)
      }))

    } catch (error) {
      console.log(error.response)
    } finally {

      setStateValue('isReviewingPatient', false)
    }
  }

  const handleHideCareplan = () => {
    return setState(prevState => ({
      ...prevState,
      showCareplan: false,
      showMoreModal: true,
    }))
  }


  const handleShowCareplan = () => {
    return setState(prevState => ({
      ...prevState,
      showMoreModal: false,
      showCareplan: true,
    }))
  }

  const handleShowRetrievalModal = (patient) => {
    setStateValue('activePatient', patient)
    setShowRetrievalModal(true);
  }

  const handleCloseRetrievalModal = () => {
    setShowRetrievalModal(false);
  }

  const handleRetrievalReasonChange = e => {
    return setReasonForRetrieval(e.target.value)
  }

  const handleFlagPatient = async () => {
    try {
      setIsLoading(true)
      await API.post('/api/coeadmin/fund-retrieval', {
        comment: retrievalComment,
        patient_user_id: state.activePatient?.user?.id,
        reason_for_retrieval: reasonForRetrieval,
      });

      setState(prev => ({
        ...prev,
        patients: prev.patients.map(patient => {
          if (patient.user_id === prev.activePatient?.user_id) {
            patient.user.status = reasonForRetrieval;
            return patient;
          }
          return patient;
        })
      }))
      setShowRetrievalModal(false)
      return toast.success("Retrieval Request has been sent");
    } catch (error) {
      console.log(errorHandler(error))
      // return toast.error(error)
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <>
      <div className={`container ${styles.application_wrapper}`} style={{ maxWidth: '1300px' }}>
        {state.coe && <p className="float-right"> <strong> Allocation Balance:</strong> NGN{formatAsMoney(state.coe.fund_allocation)} </p>}
        <div className={styles.application_header}>
          <PageTitle icon='fa fa-users' title={"Hospital Patients"} />
        </div>
        <div>
          {/* <InlineSearchBox
            inputValue={state.patientSearchInputValue}
            inputPlaceholder="Search Patient"
            inputName="search"
            icon="search"
            onButtonClick={() => null}
            onInputChange={handlePatientSearchInputChange}
            showCloseButton={state.patientSearched}
            onClearSearch={handleClosePatientSearch}
          />

         */}
          <Row>
            <Col md={3} sm={12}>
              {(!state.showSensitiveInformation && <Button variant='secondary' onClick={() => setStateValue('showSensitiveInformationModal', true)}>Show Sensitive Information <Icon icon='fa fa-eye' /> </Button>) || <Button variant='success' onClick={() => setStateValue('showSensitiveInformation', false)}>Hide Sensitive Information  <Icon icon='fa fa-eye-slash' /></Button>}

            </Col>
            <Col md={6} sm={12}>

              <Label label='Show only completed Profiles' />
              <ToggleSwitch
                onSwitch={() => setStateValue('showOnlyCompletedProfile', !state.showOnlyCompletedProfile)}
                active={state.showOnlyCompletedProfile} />
            </Col>
            <Col md={3} sm={12}>
              <Select
                value={state.statusFilter}
                onChange={e => setStateValue('statusFilter', e.target.value)}
                options={[
                  {
                    label: "All",
                    value: ""
                  },
                  {
                    label: REVIEWED,
                    value: REVIEWED
                  },
                  {
                    label: APPROVED,
                    value: APPROVED
                  },
                ]}
              />
            </Col>
          </Row>

          <div className={styles.application_table + " row"}>
            <MUIDataTable
              title={isLoading ? <ButtonLoader /> : ''}
              columns={TableUtility.COEAdminPatientsTableColumns}
              options={{ ...TableUtility.defaultTableOptions }}
              data={state.patients.map((patient, index) => [
                index + 1,
                DataFormatUtility.renderMaskedText(DataFormatUtility.formatName(patient.user), state.showSensitiveInformation),
                DataFormatUtility.renderMaskedText(patient.user?.phone_number, state.showSensitiveInformation),
                patient.chf_id,
                DataFormatUtility.printDataKeyOrAlternateString(patient.ailment, ConstantUtility.AILMENT_TYPE, ConstantUtility.NOT_COMPLETED),
                DataFormatUtility.stringOrAlternateString(patient.ailment_stage, ConstantUtility.NOT_COMPLETED),
                patient.primary_physician ? DataFormatUtility.formatName(patient.primary_physician) : "",
                MoneyUtility.formatAsMoney(DataFormatUtility.printDataKeyOrAlternateString(patient.user?.wallet, 'balance', 0)),
                patient.cmd_reviewed_on === null ? "NO" : "YES",
                <Link key={index} to={`/report/patient/${patient.chf_id}/billings`}>Billings</Link>,
                <Button variant="success" key={index} icon='fa fa-eye' onClick={() => handlePatientSelect(index)} >Profile</Button>,
                <ConditionalComponent key={index} condition={(patient?.user?.wallet?.balance > 0) && patient.user?.status?.toUpperCase() == ACTIVE}>
                  <AuthorizedOnlyComponent requiredPermission={REQUEST_FUND_RETRIEVAL}>
                    <Button variant="warning" key={index} icon='fa fa-eye' onClick={() => handleShowRetrievalModal(patient)} >Retrieve fund </Button>
                  </AuthorizedOnlyComponent>
                </ConditionalComponent>,
                (patient.mdt_recommended_amount > 0 && !patient.cmd_reviewed_on) && <AuthorizedOnlyComponent requiredPermission="CMD_APPROVAL"><Button onClick={() => handleShowReviewModal(patient)}
                  variant="success">Review</Button>  </AuthorizedOnlyComponent>,

              ])}

            />
          </div>
        </div>
      </div>
      <Dialog open={state.showMoreModal} onClose={() => handleDirectStateChange('showMoreModal', false)} fullWidth>
        <DialogTitle>
          <Typography variant='h5'>Patient Profile</Typography>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <div className={`col-sm-12 shadow-sm ` + styles.selected_patient}>
            {(state.isLoading && (
              <Spinner animation="border" variant="success" />
            )) ||
              renderSinglePatient()}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog fullWidth open={state.showSensitiveInformationModal} onClose={() => setStateValue('showSensitiveInformationModal', false)}>
        <DialogTitle>
          <Typography variant='h5'>Show Sensitive Data</Typography>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Typography variant='subtitle2'>You are about to unmask sensitive data</Typography>
          <Typography variant='subtitle2'>Continue?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleShowSensitiveInformation} variant='success'>Confirm <Icon icon='fa fa-check' /> </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={state.showReviewModal} onClose={() => setStateValue('showReviewModal', false)} fullWidth>
        <DialogTitle>
          <Typography variant="h5">Review Modal</Typography>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Typography variant='h6' color='textSecondary'>{formatName(state.activePatient?.user)}</Typography>

          <hr />
          <p><strong>Primary Physician Recommendation: </strong></p>
          <div className='block'>

            <p className='bg-secondary  p-2 text-white'>
              {state.activePatient?.primary_physician_reviewed_on ? `${state.activePatient?.primary_physician_status} - ${timestampToRegularTime(state.activePatient?.primary_physician_reviewed_on)}` : "Not Reviewed"}</p>
          </div>
          <p><strong>Social Worker Recommendation: </strong></p>
          <p className='bg-secondary  p-2 text-white'>
            {state.activePatient?.social_worker_reviewed_on ? `${state.activePatient?.social_worker_status} - ${timestampToRegularTime(state.activePatient?.social_worker_reviewed_on)}` : "Not Reviewed"}</p>
          {/* <strong> Recommendation: </strong> */}

          {state.activePatient?.application_review.length && <Link to={`/chfadmins/application/${state.activePatient?.application_review[0].id}`} className='btn btn-sm btn-muted' >View patient bio <Icon icon='fa fa-user' /> </Link>}
        </DialogContent>
        <Divider />
        <DialogActions>
          {!state.isReviewingPatient && <>
            <Button onClick={() => handleCompleteReview(CMD_APPROVED)} variant='success' className="mr-3">Confirm <Icon icon='fa fa-check' /></Button>
            <Button onClick={() => handleCompleteReview(CMD_DECLINED)} variant='danger'>Decline <Icon icon='fa fa-window-close' /></Button>
          </> || <Button disabled={true} variant='secondary'>Please wait...</Button>}
        </DialogActions>
      </Dialog>
      <CareplanModal
        show={state.showCareplan}
        onClose={handleHideCareplan}
        patient={state.activePatient}
        user={state.activePatient ? state.activePatient.user : null} />

      <Dialog open={showRetrieveModal} onClose={handleCloseRetrievalModal} fullWidth>
        <DialogTitle>
          <Typography variant="h5">Fund retrieval</Typography>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Typography>Please select reason for retireval</Typography>
          <FormControl fullWidth margin="1rem 0">
            <InputLabel id="demo-simple-select-label">Retrieval Reason</InputLabel>
            <MUISelect
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={reasonForRetrieval}
              label="Retrieval Option"
              onChange={handleRetrievalReasonChange}
            >
              <MenuItem>-- Select reason -- </MenuItem>
              <MenuItem value={DECEASED}>Deceased</MenuItem>
              <MenuItem value={INACTIVE}>Inactive</MenuItem>
            </MUISelect>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Comment</InputLabel>
            <TextField multiline
              name='retrievalComment'
              defaultValue={retrievalComment}
              onBlur={e => setRetrievalComment(e.target.value)}
              placeholder="Leave a comment."
            />
          </FormControl>
          <DialogActions>
            <Button
              onClick={handleFlagPatient}
              variant='success'
              disabled={isLoading}
              my={3}
            > <Typography variant='subtitle2'>Request Retrieve</Typography> {isLoading && <CircularProgress size='20px' />} </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </>
  );
}
