import React, { useEffect, useState } from "react";
import styles from "./coestaff.module.scss";
import InlineSearchBox from "./inlinesearchbox";
import API, { CAPBackendAPI } from "../../config/chfBackendApi";
import ServiceTable from "./servicetable";
import ServiceHeader from "./serviceheader";
import BillingFooter from "./billingfooter";
import Invoice from "./invoice";
import DrugsHeader from "./DrugsHeader";
import DrugsSearchBox from "./DrugsSearchBox";
import DrugsTable from "./DrugsTable";
import DrugInvoice from "./drugsInvoice";
import { ModalFooter } from "react-bootstrap";
import { connect } from "react-redux";
import BillingPatientAppointment from "./billingPatientAppointment";
import {PageTitle, AuthorizedOnlyComponent,Modal, ModalHeader, ModalBody, Textarea as TextArea, Button } from '../../components'
import { Link } from "react-router-dom";
import {AiOutlineHeatMap} from 'react-icons/ai'
import { errorHandler } from "../../utils/error.utils";
import { successAlert } from "../../utils/alert.util";
 
const initial_state = {
  pageLoading: true,
  patientSelected: false,
  patient: null,
  selectedServices: [],
  searchID: "",
  alert: null,
  services: [],
  drugs: [],
  currentService: null,
  categories: [],
  currentCategory: null,
  currentQuantity: 1,
  currentServiceName: "",
  isPreviewing: false,
  showFinalPrompt: false,
  currentPrice: null,
  comment: "",
  activeMenu: "menu-1",
  selectedDrugs: [],
  currentDrug: {
    drug: null,
    quantity: 1,
  },
  isCompletingBilling: false,

  showFileUploadModal: false,
  files: [],
  newFileName: "",
  fileToUpload: null,
  isUploadingFile: false,
  fileUploadError: null,
  showPatientAppointmentModal: false,
};

function Billing(props) {
  const [state, setState] = useState(initial_state);
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // console.log(state)
    loadInitialData();
  },[]);

  const loadInitialData = async () => {
    try {
      const drugRequest = await CAPBackendAPI.get('/product');
      const res2 = await API.get(
        `/api/service_categories?roles=${joinUserRoles().join(",")}&coe=${
          props.user.user.coe_id
        }`
      );
      
      return setState(prevState => ({
        ...prevState,
        drugs: drugRequest.data?.data ?? [],
        categories: res2.data.data
      }))
    } catch (error) {
      console.log(error)
    }finally{

    }
  }

  // When COE Staff clicks the search button
  const handlePatientSearch = async () => {
    try {
      const res = await API.get(`/api/coestaff/patient/${state.searchID}`);

      setState((prevState) => ({
        ...prevState,
        alert: null,
        patient: res.data.data,
      }));
    } catch (e) {
      setState((prevState) => ({
        ...prevState,
        patientSelected: false,
        patient: null,
      }));
      return errorHandler(e)
    }
  };

  const handleChangeStateValue = (key, value) => {
    return setState((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  // HANDLE PATIENT INPUT
  const handleInputChange = (e) => {
    setState((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  // HANDLES SELECTION OF SERVICE FROM LIST OF SERVICES
  const handleSelectService = (e) => {
    if (!e.target.value) {
      return;
    }
    setState((prevState) => ({
      ...prevState,
      currentService: prevState.services.find(
        (service) => service.id === parseInt(e.target.value)
      ),
      currentServiceName: state.services.find(
        (service) => service.id === parseInt(e.target.value)
      )?.service_name,
      currentQuantity: 1,
    }));
  };

  const handleCategoryChange = (e) => {
    if (!e.target.value) {
      return;
    }
    setState((prevState) => ({
      ...prevState,
      currentCategory: prevState.categories.find(
        (category) => category.id === parseInt(e.target.value)
      ),
      services: prevState.categories.find(
        (category) => category.id === parseInt(e.target.value)
      ).services,
      currentService: prevState.categories.find(
        (category) => category.id === parseInt(e.target.value)
      ).services[0],
    }));
  };

  /* ADD NEW SERVICE TO SERVICES TO RENDER */
  function handleAddService() {
    const newService = {
      service: state.currentService,
      quantity: state.currentQuantity,
      service_name: state.currentServiceName,
      category_name: state.currentCategory.category_name,
    };

    return setState((prevState) => ({
      ...prevState,
      selectedServices: [...prevState.selectedServices, newService],
    }));
  }

  /* REMOVE SERVICE FROM BILLING LIST */
  const handleRemoveService = (service_id) => {
    setState((prevState) => ({
      ...prevState,
      selectedServices: prevState.selectedServices.filter(
        (service) => service.service.id !== service_id
      ),
    }));
  };

  const handleQuantityChange = (e) => {
    // return console.log(e);
    setState((prevState) => ({
      ...prevState,
      currentQuantity: e.target.value,
    }));
  };

  //GET LOGGED USER ROLES
  const joinUserRoles = () => {
    let roles = [];
    for (let role of props.user.user.roles) {
      roles.push(role.id);
    }
    return roles;
  };

  const handlePatientSelect = async (e) => {
    e.preventDefault();
    // FETCH ALL SERVICES
    try {
      // const res2 = await API.get(
      //   `/api/service_categories?roles=${joinUserRoles().join(",")}&coe=${
      //     props.user.user.coe_id
      //   }`
      // );
      setState((prevState) => ({
        ...prevState,
        patientSelected: true,
        alert: null,
        // categories: res2.data.data,
      }));
    } catch (e) {}
  };

  const handlePreviewBilling = (value = true) => {
    setState((prevState) => ({
      ...prevState,
      isPreviewing: value,
    }));
  };

  const handleCompleteBilling = async () => {
    setState((prevState) => ({
      ...prevState,
      isCompletingBilling: true,
    }));


    try {
      // eslint-disable-next-line no-unused-vars
      const res = await API.post("/api/coestaff/billings", {
        patient_id: state.patient?.id,
        comment: state.comment,
        documents: state.files,
        services: state.selectedServices.map((service) => ({
          ...service.service,
          quantity: service.quantity,
        })),
      });

      successAlert(res.data.message)

      setState((prevState) => ({
        ...initial_state,
        // alert: {
        //   alertVariant: "success",
        //   alertMessage: res.data.message,
        // },
      }));
      window.scrollTo(0, 0);
    } catch (e) {
      errorHandler(e);
      // alert(e.response.data.message)
    } finally {
      setState((prevState) => ({
        ...prevState,
        isCompletingBilling: false,
      }));
    }
  };

  const handleCancelBilling = () => {
    setState({ ...initial_state });
  };

  const handleMenuClick = (menu) => {
    setState((prevState) => ({
      ...prevState,
      activeMenu: menu,
    }));
  };

  const addCurrentDrug = (currentDrug) => {
    setState((prev) => ({
      ...prev,
      currentDrug: {
        ...prev.currentDrug,
        drug: currentDrug,
      },
    }));
  };

  const addDrug = (drug) => {
    setState((prev) => ({
      ...prev,
      selectedDrugs: [...prev.selectedDrugs, drug],
      currentDrug: {
        drug: drug.drug,
        quantity: drug.quantity,
      },
    }));
  };

  const handleRemoveDrug = (index, drug_id) => {
    let drugs = state.selectedDrugs;
    if (drugs.length < 2) {
      drugs = [];
    } else {
      drugs = state.selectedDrugs.slice(index, index + 1);
    }
    setState((prevState) => ({
      ...prevState,
      selectedDrugs: drugs,
    }));
  };

  const resetState = () => {
    window.scrollTo(0, 0);
    setState(initial_state);
  };

  const handleFileChange = (e) => {
    const fileToUpload = e.target.files[0];
    setState((prevState) => ({
      ...prevState,
      fileToUpload,
    }));
  };

  /* REMOVED A FILE ATTACHED TO THE BILLING */
  const handleDetatchFile = async (file_url) => {
    try {
      /* CALL API TO REMOVE THE DETACHED FILE FROM SERVER */
      setState((prevState) => ({
        ...prevState,
        files: prevState.files.filter((file) => file.file_url !== file_url),
      }));
    } catch (e) {}
  };

  /* ATTACH A FILE TO THE BILLING, THIS MAY INCLUDE TEST RESULT, IMAGE SCANS, ETC. */
  const handleAttachFile = async () => {
    try {
      setState((prevState) => ({
        ...prevState,
        isUploadingFile: true,
        fileUploadError: "",
      }));

      if (!state.newFileName) {
        return setState((prevState) => ({
          ...prevState,
          fileUploadError: "You must provide the document name",
        }));
      }
      const formData = new FormData();
      formData.append("upload", state.fileToUpload);

      const res = await API.post("/api/documents", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });

      setState((prevState) => ({
        ...prevState,
        fileToUpload: null,
        fileUploadError: null,
        newFileName: "",
        showFileUploadModal: false,
        files: [
          ...prevState.files,
          {
            file_name: prevState.newFileName,
            file_url: res.data.data,
          },
        ],
      }));
    } catch (e) {
      errorHandler(e)
    } finally {
      return handleChangeStateValue('isUploadingFile',false)
      setState((prevState) => ({
        ...prevState,
        isUploadingFile: false,
      }));
    }
  };

  return !state.isPreviewing ? (
    <div className={styles.billing_container}>
      {/* <SearchBox /> */}
      <InlineSearchBox
        inputValue={state.searchID}
        onInputChange={handleInputChange}
        onButtonClick={handlePatientSearch}
        onPatientSelect={handlePatientSelect}
        patient={state.patient}
        services={state.selectedServices}
        hasAlert={state.alert}
        alert={state.alert}
        showDropdown={!state.patientSelected}
      />
      {state.patientSelected && (
        <div className="row">
          <div className={`col-md-2 ${styles.coe_billing_sidenav}`}>
            <ul>
              <li
                onClick={() => {
                  handleMenuClick("menu-1");
                }}
                className={
                  state.activeMenu === "menu-1"
                    ? `${styles.active}`
                    : `clickable`
                }
              >
                Service Billing
              </li>
              <AuthorizedOnlyComponent requiredPermission="BILL_DRUGS">
                <li
                  onClick={() => {
                    handleMenuClick("menu-2");
                  }}
                  className={
                    state.activeMenu === "menu-2"
                      ? `${styles.active}`
                      : `clickable`
                  }
                >
                  Drugs Billing
                </li>
              </AuthorizedOnlyComponent>
            </ul>
          </div>
          <div className="col-md-8">
            <div
              className={
                state.activeMenu === "menu-1"
                  ? `${styles.show}`
                  : `${styles.hide}`
              }
            >
              <ServiceHeader
                services={state.services}
                quantity={state.currentQuantity}
                currentService={state.currentService}
                onInputChange={handleInputChange}
                onQuantityChange={handleQuantityChange}
                onSelectChange={handleSelectService}
                onAddService={handleAddService}
                categories={state.categories}
                onCategoryChange={handleCategoryChange}
              />

              <ServiceTable
                selectedServices={state.selectedServices}
                services={state.services}
                patient={state.patient}
                onRemoveService={handleRemoveService}
              />

              {state.patientSelected && state.selectedServices && (
                <BillingFooter
                  selectedServices={state.selectedServices}
                  patient={state.patient}
                  onPreviewBilling={handlePreviewBilling}
                  onCancelBilling={handleCancelBilling}
                  onChangeStateValue={handleChangeStateValue}
                />
              )}
            </div>
            <div
              className={
                state.activeMenu === "menu-2"
                  ? `${styles.show}`
                  : `${styles.hide}`
              }
            >
              <DrugsSearchBox
                patient={state.patient}
                addCurrentDrug={addCurrentDrug}
              />
              <DrugsHeader
                patient={state.patient}
                alert={state.alert}
                currentDrug={state.currentDrug}
                addDrug={addDrug}
              />
              <DrugsTable
                selectedDrugs={state.selectedDrugs}
                onRemoveDrug={handleRemoveDrug}
              />
              {state.patientSelected && state.selectedDrugs && (
                <BillingFooter
                  selectedDrugs={state.selectedDrugs}
                  patient={state.patient}
                  onPreviewBilling={handlePreviewBilling}
                  onCancelBilling={handleCancelBilling}
                  onChangeStateValue={handleChangeStateValue}
                />
              )}
            </div>
          </div>
          <div className="col-md-2 mt-3">
            <PageTitle title="Important" />
            <button
              className="mt-3 btn btn-lg btn-outline-warning"
              onClick={() =>
                handleChangeStateValue("showPatientAppointmentModal", true)
              }
            >
              Confirm Patient Appointment
            </button>

            <Link to="/coestaff/appointment-schedule">
              <button className="mt-3 btn btn-lg btn-outline-info">
                Schedule Patient Appointment
              </button>
            </Link>

            <p className="mt-3 p-3 bg-light font-weight-600">Documents</p>
            {(state.files.length && (
              <ul className="list-group py-3">
                {state.files.map((file) => {
                  return (
                    <li className="list-group-item">
                      <small>
                        {file.file_name}{" "}
                        <i
                          className="fa fa-trash float-right text-danger clickable"
                          onClick={() => handleDetatchFile(file.file_url)}
                        ></i>{" "}
                      </small>
                    </li>
                  );
                })}
              </ul>
            )) || <small>No Files attached </small>}
          </div>
        </div>
      )}
      {state.patientSelected && (
        <TextArea
          placeholder="Leave a comment"
          wrapperClasses="mt-3"
          value={state.comment}
          inputName="comment"
          onChange={handleInputChange}
        />
      )}

      {
        // Modal
        state.showFileUploadModal && (
          <Modal>
            <ModalHeader
              modalTitle="Add Document"
              onModalClose={() =>
                handleChangeStateValue("showFileUploadModal", false)
              }
            />
            <ModalBody>
              {state.fileUploadError && (
                <p className="text-danger">{state.fileUploadError}</p>
              )}
              <small>Document Name</small>
              <input
                value={state.newFileName}
                onChange={handleInputChange}
                name="newFileName"
                className="form-control mb-2"
              />
              <input
                type="file"
                name="fileToUpload"
                onChange={handleFileChange}
              />
            </ModalBody>
            <ModalFooter>
              <button
                disabled={state.isUploadingFile}
                className="btn btn-sm btn-success"
                onClick={handleAttachFile}
              >
                {state.isUploadingFile ? "please wait..." : "Attach"}
              </button>
            </ModalFooter>
          </Modal>
        )
      }

      {
        // Modal
        state.showPatientAppointmentModal && (
          <Modal>
            <ModalHeader
              modalTitle="Confirm patient appointment for today"
              onModalClose={() =>
                handleChangeStateValue("showPatientAppointmentModal", false)
              }
            />
            <ModalBody>
              <BillingPatientAppointment patient_id={state.patient.id} />
            </ModalBody>
          </Modal>
        )
      }
    </div>
  ) : (
    <div>
      {state.activeMenu === "menu-1" && (
        <Invoice
          selectedServices={state.selectedServices}
          selectedDrugs={state.selectedDrugs}
          patient={state.patient}
          inputName="comment"
          comment={state.comment}
          onPreviewBilling={handlePreviewBilling}
          onCompleteBilling={handleCompleteBilling}
          isCompletingBilling={state.isCompletingBilling}
          onChangeStateValue={handleChangeStateValue}
        />
      )}

      {state.activeMenu === "menu-2" && (
        <DrugInvoice
          selectedDrugs={state.selectedDrugs}
          patient={state.patient}
          comment={state.comment}
          onPreviewBilling={handlePreviewBilling}
          files={state.files}
          parentState={resetState}
          successCallback={resetState}
        />
      )}

      {
        // Modal
        state.showFinalPrompt && (
          <Modal>
            <ModalHeader
              modalTitle="Finish Billing"
              style="background-color: green"
              onModalClose={() =>
                handleChangeStateValue("showFinalPrompt", false)
              }
            />
            <ModalBody>
              <AiOutlineHeatMap className='text-warning d-block' size={40}   />
              <small>
                By clicking on <strong>FINISH</strong> below you agree that all
                drugs and services have been verified and should be registered
                on the system{" "}
              </small>
            </ModalBody>
            <ModalFooter>
              <Button 
                text="Complete"
                variant="success"
                loading={state.isCompletingBilling}
                onClick={handleCompleteBilling}
              />
              {/* <button
                disabled={state.isCompletingBilling}
                className="btn btn-sm btn-success"
                onClick={handleCompleteBilling}
              >
                {state.isCompletingBilling ? "please wait..." : "Complete"}
              </button> */}
            </ModalFooter>
          </Modal>
        )
      }
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
  };
};

export default connect(mapStateToProps)(Billing);
