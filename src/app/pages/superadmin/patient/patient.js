/* eslint-disable eqeqeq */
/* eslint-disable no-script-url */

import React, { useState, useEffect } from "react";
import styles from "../../chfadmin/chfadmin.module.scss";
import API from "../../../config/chfBackendApi";
import { formatAsMoney } from "../../../utils/money.utils";
import {
  timestampToRegularTime,
  _calculateAge,
} from "../../../utils/date.util";
import { Spinner } from "react-bootstrap";
import ViewApplicationsDisplay from "../../../components/completeEnrollment/viewApplicationsDisplay";
import { PageTitle, Modal, ModalHeader, ModalBody, AuthorizedOnlyComponent, Button } from "../../../components";
import MUIDataTable from "mui-datatables";
import { ConstantUtility, DataFormatUtility, MoneyUtility, TableUtility } from "../../../utils";
import { Link } from "react-router-dom";

const initial_state = {
  tableLoading: true,
  patients: [],
  activePatient: null,
  patientSearchInputValue: "",
  patientSearched: false,
  activeMenu: 1,
  showMoreModal: false,
  pagination: {
    per_page: 10,
    page: 1,
    filter: "",
    links: null,
    pages: 1,
  },
  alert: {
    alert_type: null,
    message: "",
    alert_color: "white",
  },
  showApplcationsModal: false,
  patientApplications: [],
};

export default function Patients() {
  const menuList = [
    {
      name: "All patients",
      id: 1,
      permission: "VIEW_CHF_PATIENT",
      handleClick: (e) => handleMenuClick(e, 1, ""),
    },
  ];

  const [state, setState] = useState(initial_state);

  useEffect(() => {
    try {
      loadPatients();
    } catch (e) {
      console.log(e.response);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.activeMenu, state.pagination.per_page]);

  /* FETCH PATIENTS FROM BACKEND SERVICE */
  const loadPatients = async () => {
    try {
      toggleLoader(true);

      const res = await Promise.all([
        API.get(
          `/api/patients?page=${state.pagination.page}&filter=${state.pagination.filter}&per_page=${state.pagination.per_page}`
        ),
        API.get("/api/sitesettings/pool_account_balance"),
      ]);
      setState((prevState) => ({
        ...prevState,
        patients: res[0].data.data,
        activePatient: res[0].data.data[0],
        poolFundBalance: res[1].data.data.value,
        pagination: {
          ...prevState.pagination,
          links: res[0].data.data.links,
          pages: res[0].data.data.last_page,
        },
      }));
    } catch (e) {
      // console.log(e)
    } finally {
      toggleLoader(false);
    }
  };

  const handlePageChange = (page) => {
    setState((prevState) => ({
      ...prevState,
      pagination: {
        ...prevState.pagination,
        page,
      },
    }));
    loadPatients();
  };

  const toggleLoader = (loader_state) => {
    setState((prevState) => ({
      ...prevState,
      tableLoading: loader_state,
    }));
  };

  const handlePerPageChange = (e) => {
    setState((prevState) => ({
      ...prevState,
      pagination: {
        ...prevState.pagination,
        per_page: e.target.value,
      },
    }));

    loadPatients();
  };
  /* SEARCH APPLICATION HANDLERS */

  const handleSearchApplication = async () => {
    toggleLoader(true);
    try {
      const res = await API.get(
        `/api/patients/search/${state.patientSearchInputValue}`
      );

      setState((prevState) => ({
        ...prevState,
        patients: res.data.data.data,
        patientSearched: true,
      }));
    } catch (e) {
      console.log(e);
    } finally {
      toggleLoader(false);
    }
  };

  const handleClosePatientSearch = () => {
    // RELOAD LIST OF PATIENTS WHEN THE SEARCH IS CLEARED
    loadPatients();
    setState((prevState) => ({
      ...prevState,
      patientSearchInputValue: "",
      patientSearched: false,
    }));
  };

  const handlePatientSearchInputChange = (e) => {
    let value = e.target.value;
    if (value === "") {
      loadPatients();
    }
    setState((prevState) => ({
      ...prevState,
      patientSearchInputValue: value,
      patientSearched: false,
    }));
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

  const renderPatientApplications = async () => {
    try {
      const res = await API.get(
        `/api/application/reviews/${state.activePatient.coe_id}/${state.activePatient.id}`
      );
      if (!res.data.data.length) {
        return "";
      }
      handleDirectStateChange("patientApplications", res.data.data);

    } catch (e) {
      // console.log(e)
    } finally {
    }
  };

  const handleViewPatientApplications = () => {
    renderPatientApplications();
    handleDirectStateChange("showApplcationsModal", true);
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
              !activePatient.application_review
                ? styles.warning
                : activePatient.application_review.status == "approved"
                  ? styles.success
                  : styles.danger,
            ].join(" ")}
          >
            {!activePatient.application_review
              ? "pending"
              : activePatient.application_review.status}
          </small>
        </div>
        <h4>
          {[activePatient.user.first_name, activePatient.user.last_name].join(
            " "
          )}
        </h4>
        <h5>
          {activePatient.ailment.ailment_type} (Stage{" "}
          {activePatient.ailment.ailment_stage})
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
          <small>{activePatient.user.email}</small>
        </div>
        <div className={styles.flex_cc}>
          <small>
            <strong>Phone number:</strong>
          </small>
          <small>{activePatient.user.phone_number}</small>
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
        {state.activePatient.state_id && (
          <div className={styles.flex_cc}>
            <small>
              <strong>State of origin:</strong>
            </small>
            <small>{state.activePatient?.state.state}</small>
          </div>
        )}
        {state.activePatient.state_of_residence && (
          <div className={styles.flex_cc}>
            <small>
              <strong>State of residence:</strong>
            </small>
            <small>{state.activePatient.state_of_residence?.state}</small>
          </div>
        )}
        {state.activePatient.city && (
          <div className={styles.flex_cc}>
            <small>
              <strong>City:</strong>
            </small>
            <small>{state.activePatient.city}</small>
          </div>
        )}
        {state.activePatient.address && (
          <div className={styles.flex_cc}>
            <small>
              <strong>Address:</strong>
            </small>
            <small>{state.activePatient.address}</small>
          </div>
        )}
        <div className={styles.flex_cc}>
          <small>
            <strong>Wallet:</strong>
          </small>
          <small>
            {activePatient.user?.wallet ? (
              <small>
                <del>N</del> {formatAsMoney(activePatient.user?.wallet?.balance ?? 0)}
              </small>
            ) : (
              <small>
                <del>N</del> 0.00
              </small>
            )}
          </small>
        </div>
        <small className="d-block mt-2">
          <strong>COE</strong>
        </small>
        <small className="mb-2">{activePatient.coe?.coe_name}</small>
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
          <AuthorizedOnlyComponent requiredPermission="VIEW_PATIENT_APPLICATION">
            <a
              href="javascript:;"
              className="ml-2 btn btn-sm btn-success"
              onClick={handleViewPatientApplications}>
              VIEW PATIENT APPLICATIONS
            </a>
          </AuthorizedOnlyComponent>
          <AuthorizedOnlyComponent requiredPermission="VIEW_PATIENT_CAREPLAN">
            <Link to={`/report/patient/${activePatient.chf_id}/billings`}><Button className='btn btn-success btn-sm'> Treatments </Button></Link>
          </AuthorizedOnlyComponent>
          {/* <AuthorizedOnlyComponent requiredPermission="VIEW_PATIENT_CAREPLAN">
            {activePatient?.careplan && <Button className='btn btn-primary btn-sm'> View Careplan </Button>}
          </AuthorizedOnlyComponent> */}
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

  /* HANDLE CLICK ON THE MENU CARDS */
  const handleMenuClick = (e, id, filter = "") => {
    if (id !== state.activeMenu.id) {
      setState((prevState) => ({
        ...prevState,
        activeMenu: id,
        pagination: {
          ...prevState.pagination,
          filter,
          page: 1,
        },
      }));

      loadPatients();
    }
  };

  return (
    <>
      <div className={`container ${styles.application_wrapper}`}>
        <div className={styles.application_header}>
          <PageTitle title="Patients" />
        </div>
        <div
        // className={
        //   state.activeMenu === 1 ? `${styles.show}` : `${styles.hide}`
        // }
        >

          <div className={styles.application_table + " row"}>
            <MUIDataTable
              options={{
                ...TableUtility.defaultTableOptions,
                onRowClick: (rowData, meta) => handlePatientSelect(meta.dataIndex),
                textLabels: {
                  body: {
                    noMatch: state.tableLoading ? <Spinner animation="border" variant="success" /> : "No data matched the crieria"
                  }
                }
              }}
              columns={TableUtility.SuperAdminPatientsTableColumns}
              data={state.patients.map((patient, index) => [
                index + 1,
                DataFormatUtility.formatName(patient.user),
                patient.user?.email,
                patient.chf_id,
                DataFormatUtility.printDataKeyOrAlternateString(patient.coe, 'coe_name', ConstantUtility.NOT_COMPLETED),
                DataFormatUtility.printDataKeyOrAlternateString(patient.ailment, 'ailment_type', ConstantUtility.NOT_COMPLETED),
                DataFormatUtility.stringOrAlternateString(patient.ailment_stage, ConstantUtility.NOT_COMPLETED),
                MoneyUtility.formatAsMoney(DataFormatUtility.printDataKeyOrAlternateString(patient.user?.wallet, 'balance', 0)),

              ])}
            />
          </div>
        </div>
      </div>

      {state.showMoreModal && (
        <Modal>
          <ModalHeader
            modalTitle="Patient Profile"
            onModalClose={() => handleDirectStateChange("showMoreModal", false)}
          ></ModalHeader>
          <ModalBody>
            {/* PATIENT DETAIL */}
            <div className={`col-sm-12 shadow-sm ` + styles.selected_patient}>
              {(state.tableLoading && (
                <Spinner animation="border" variant="success" />
              )) ||
                renderSinglePatient()}
            </div>
          </ModalBody>
        </Modal>
      )}

      {state.showApplcationsModal && (
        <Modal>
          <ModalHeader
            modalTitle="Patient Applications"
            onModalClose={() =>
              handleDirectStateChange("showApplcationsModal", false)
            }
          ></ModalHeader>
          <ModalBody>
            {(!state.patientApplications.length && (
              <Spinner animation="border" variant="success" />
            )) ||
              <ViewApplicationsDisplay patientApplications={state.patientApplications} />}
          </ModalBody>
        </Modal>
      )}
    </>
  );
}
