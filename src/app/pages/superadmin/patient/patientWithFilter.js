/* eslint-disable eqeqeq */
/* eslint-disable no-script-url */

import React, { useState, useEffect } from "react";
import InlineSearchBox from "../../../components/form/inlinesearchbox";
import styles from "../../chfadmin/chfadmin.module.scss";
import API from "../../../config/chfBackendApi";
import Modal from "../../../components/modal/modal";
import ModalHeader from '../../../components/modal/modalHeader';
import ModalBody from '../../../components/modal/modalBody';
import TablePagination from "../../../components/tablePagination";
import { formatAsMoney } from "../../../utils/money.utils";
import {
  timestampToRegularTime,
  _calculateAge,
} from "../../../utils/date.util";
import AuthorizedOnlyComponent from "../../../components/authorizedOnlyComponent";
import { Spinner } from "react-bootstrap";
import PageTitle from "../../../components/pageTitle/pageTitle";
import { useParams } from "react-router";
import { Link } from "react-router-dom";

const initial_state = {
  tableLoading: true,
  patients: [],
  activePatient: null,
  patientSearchInputValue: "",
  patientSearched: false,
  activeMenu: 1,
  showMoreModal: false,
  states: [],
  pagination: {
    per_page: 10,
    page: 1,
    filter: "",
    filter_type: "",
    links: null,
    pages: 1,
  },
  alert: {
    alert_type: null,
    message: "",
    alert_color: "white",
  },
};

export default function PatientsWithFilter() {

  const filter = useParams().filter
  const filter_type = useParams().filter_type

  console.log("Filter type ", filter_type)
  console.log("Filter ", filter)
  const menuList = [
    // {
    //   name: "All patients",
    //   id: 1,
    //   permission: "VIEW_PATIENT",
    //   handleClick: (e) => handleMenuClick(e, 1, ""),
    // },
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
          `/api/patients/filter?page=${state.pagination.page}&filter_type=${filter_type}&filter=${filter}&per_page=${state.pagination.per_page}`
        ),
        API.get("/api/states"),
      ]);
      console.log(res);
      setState((prevState) => ({
        ...prevState,
        patients: res[0].data.data.data,
        activePatient: res[0].data.data.data[0],
        states: res[1].data.data,
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

  /* RENDER PATIENTS TO THE DOM FROM STATE */
  const renderPatientsList = () => {
    // console.log('state ', state)
    if (!state.patients) {
      return (
        <tr>
          <td col-span="8" className="bg-secondary">
            No patient records available
          </td>
        </tr>
      );
    }

    return state.patients.map((patient, index) => (
      <tr key={index} onClick={() => handlePatientSelect(index)}>
        <td>{index + 1}</td>
        <td>{[patient.user.last_name, patient.user.first_name].join(" ")} </td>
        <td>{patient.user.email}</td>
        <td>{patient.chf_id}</td>
        <td>{patient.coe.coe_name}</td>
        <td>{patient.ailment && patient.ailment.ailment_type ? patient.ailment.ailment_type : ''}</td>
        <td
          className={[
            styles.status_indicator,
            !patient.application_review
              ? styles.warning
              : patient.application_review.status == "approved"
                ? styles.success
                : styles.danger,
          ].join(" ")}
        >
          {!patient.application_review
            ? "pending"
            : patient.application_review.status}
        </td>

        <td>
          {patient.user.wallet ? <small><del>N</del> {formatAsMoney(patient.user.wallet.balance)}</small> : <small><del>N</del> 0.00</small>}
        </td>
        <td>
          <span className={patient.ailment ? "badge badge-success" : 'badge badge-danger'}>
            {patient.ailment_id ? "YES" : "NO"}
          </span>
        </td>
        <td>
          <Link to={`/report/patient/${patient.chf_id}/billings`}>Billings</Link>
        </td>
      </tr>
    ));
  };

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
          <strong>COE</strong>
        </small>
        <small className="mb-2">{activePatient.coe.coe_name}</small>
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

  /* HANDLE CLICK ON THE MENU CARDS */
  // const handleMenuClick = (e, id, filter = "") => {
  //   if (id !== state.activeMenu.id) {
  //     setState((prevState) => ({
  //       ...prevState,
  //       activeMenu: id,
  //       pagination: {
  //         ...prevState.pagination,
  //         filter,
  //         page: 1,
  //       },
  //     }));

  //     loadPatients();
  //   }
  // };



  return (
    <>
      <div className={`container ${styles.application_wrapper}`}>
        <div className={styles.application_header}>
          <PageTitle title={"Patients by " + filter_type} />
        </div>
        <div className={[styles.tabs, styles.active].join(" ") + " row"}>
          {menuList.map((menuItem) => (
            <div className="col-md-2" onClick={menuItem.handleClick}>
              <AuthorizedOnlyComponent
                requiredPermission={menuItem.permission}
                key={menuItem.id}
              >
                <a
                  href="javascript:;"
                  className={[
                    styles.tab_item,
                    state.activeMenu == menuItem.id ? styles.active : "",
                  ].join(" ")}
                >
                  {menuItem.name}
                </a>
              </AuthorizedOnlyComponent>
            </div>
          ))}
        </div>
        <div
          className={
            state.activeMenu === "1" ? `${styles.show}` : `${styles.hide}`
          }
        >
          <InlineSearchBox
            inputValue={state.patientSearchInputValue}
            inputPlaceholder="Search Patient"
            inputName="search"
            icon="search"
            onButtonClick={handleSearchApplication}
            onInputChange={handlePatientSearchInputChange}
            showCloseButton={state.patientSearched}
            onClearSearch={handleClosePatientSearch}
          />
          <div className={styles.application_table + " row"}>
            <div className={`col-md-12 ` + styles.scrollableX}>
              <table className="table table-responsive-sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>CHF ID</th>
                    <th>COE</th>
                    <th>Cancer Type</th>
                    <th>Application Status</th>
                    <th>Wallet</th>
                    <th>Profile Completed</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody style={{ overflowX: "scroll" }}>
                  {(state.tableLoading && (
                    <Spinner animation="border" variant="success" />
                  )) ||
                    renderPatientsList()}

                  <TablePagination
                    links={state.pagination.links}
                    currentPage={state.pagination.page}
                    onPageChange={handlePageChange}
                    pagesCount={state.pagination.pages}
                    onPerPageChange={handlePerPageChange}
                  />
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {state.showMoreModal && (
        <Modal>
          <ModalHeader
            modalTitle="Patient Profile"
            onModalClose={() => handleDirectStateChange('showMoreModal', false)} >
          </ModalHeader>
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
    </>
  );
}
