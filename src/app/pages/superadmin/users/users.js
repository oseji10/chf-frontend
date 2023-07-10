/* eslint-disable eqeqeq */
/* eslint-disable no-script-url */

import React, { useState, useEffect } from "react";
import InlineSearchBox from "../../../components/form/inlinesearchbox";
import styles from "../../chfadmin/chfadmin.module.scss";
import API from "../../../config/chfBackendApi";
import Modal from "../../../components/modal/modal";
import ModalHeader from "../../../components/modal/modalHeader";
import ModalBody from "../../../components/modal/modalBody";
import TablePagination from "../../../components/tablePagination";
import AddUserForm from "../../../components/Users/addUserForm";
import {
  timestampToRegularTime,
  _calculateAge,
} from "../../../utils/date.util";
import AuthorizedOnlyComponent from "../../../components/authorizedOnlyComponent";
import { Spinner } from "react-bootstrap";
import PageTitle from "../../../components/pageTitle/pageTitle";

const initial_state = {
  tableLoading: true,
  users: [],
  roles: [],
  coes: [],
  activeUser: null,
  userSearchInputValue: "",
  userSearched: false,
  activeMenu: 1,
  showMoreModal: false,
  pagination: {
    per_page: 10,
    page: 1,
    links: null,
    pages: 1,
  },
  alert: {
    alert_type: null,
    message: "",
    alert_color: "white",
  },

  displayCoeInput: false,
  coeToAddUser: "",
};

export default function Users() {
  const menuList = [
    {
      name: "All users",
      id: 1,
      permission: "VIEW_USERS",
      handleClick: (e) => handleMenuClick(e, 1, ""),
    },
    {
      name: "Create User",
      id: 2,
      permission: "CREATE_USERS",
      handleClick: (e) => handleMenuClick(e, 2, ""),
    },
  ];

  const [state, setState] = useState(initial_state);

  useEffect(() => {
    try {
      loadUsers();
    } catch (e) {
      console.log(e.response);
    }
  }, [state.activeMenu, state.pagination.per_page]);

  /* FETCH PATIENTS FROM BACKEND SERVICE */
  const loadUsers = async (role_id = "") => {
    try {
      toggleLoader(true);

      const res = await Promise.all([
        API.get(
          `/api/users?page=${state.pagination.page}&role=${role_id}&per_page=${state.pagination.per_page}`
        ),
        API.get("/api/roles"),
        API.get("/api/coes"),
      ]);

      setState((prevState) => ({
        ...prevState,
        users: res[0].data.data.data,
        roles: res[1].data.data,
        coes: res[2].data.data,
        activeUser: res[0].data.data.data[0],
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
    loadUsers();
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

    loadUsers();
  };
  /* SEARCH APPLICATION HANDLERS */

  const handleSearchApplication = async () => {
    toggleLoader(true);
    try {
      const res = await API.get(
        `/api/users?email=${state.userSearchInputValue}`
      );

      setState((prevState) => ({
        ...prevState,
        users: res.data.data.data,
        userSearched: true,
      }));
    } catch (e) {
      console.log(e);
    } finally {
      toggleLoader(false);
    }
  };

  const handleCloseUserSearch = () => {
    // RELOAD LIST OF PATIENTS WHEN THE SEARCH IS CLEARED
    loadUsers();
    setState((prevState) => ({
      ...prevState,
      userSearchInputValue: "",
      userSearched: false,
    }));
  };

  const handleUserSearchInputChange = (e) => {
    let value = e.target.value;
    if (value === "") {
      loadUsers();
    }
    setState((prevState) => ({
      ...prevState,
      userSearchInputValue: value,
      userSearched: false,
    }));
  };

  /* END SEARCH APPLICATION HANDLERS */

  const handleUserSelect = (index) => {
    // window.scrollTo(0, 0);
    setState((prevState) => ({
      ...prevState,
      activeUser: prevState.users.find(
        (user, currentIndex) => currentIndex === index
      ),
      showMoreModal: true,
    }));
  };

  /* RENDER PATIENTS TO THE DOM FROM STATE */
  const renderUsersList = () => {
    if (!state.users.length) {
      return (
        <tr>
          <td colSpan="8" className="bg-secondary">
            No user records available
          </td>
        </tr>
      );
    }

    return state.users.map((user, index) => (
      <tr key={index}>
        <td>{index + 1}</td>
        <td>{[user.first_name, user.last_name].join(" ")} </td>
        <td colSpan="2">{timestampToRegularTime(user.created_at)}</td>
        <td>{user.email}</td>
        <td>{user.gender}</td>
        <td>{user.phone_number}</td>
        <td>
          <span
            className="btn btn-success"
            onClick={() => handleUserSelect(index)}
          >
            &hellip;
          </span>
        </td>
      </tr>
    ));
  };

  // SET INDIVIDUAL STATE FIELDS
  const setStateValue = (key, value) => {
    return setState((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  /* RENDERS THE ACTIVE PATIENT TO THE SIDEBAR */
  const renderSingleUser = () => {
    const { activeUser } = state;

    if (!state.activeUser) {
      return <h5>No user selected</h5>;
    }

    return (
      <>
        <div className="d-flex justify-content-end">
          <small>Last login: </small>
          <small className={[styles.status].join(" ")}>
            <small>{timestampToRegularTime(activeUser.updated_at)}</small>
          </small>
        </div>
        <h4>{[activeUser.first_name, activeUser.last_name].join(" ")}</h4>
        <small className="d-block">
          <b>Date Created</b>{" "}
        </small>
        <div className={styles.status_container}>
          <small>{timestampToRegularTime(activeUser.created_at)}</small>
        </div>
        <div className={styles.flex_cc}>
          <small>
            <strong>Email:</strong>
          </small>
          <small>{activeUser.email}</small>
        </div>
        <div className={styles.flex_cc}>
          <small>
            <strong>Phone number:</strong>
          </small>
          <small>{activeUser.phone_number}</small>
        </div>
        <div className={styles.flex_cc}>
          <small>
            <strong>Age:</strong>
          </small>
          <small>{_calculateAge(activeUser.date_of_birth)}</small>
        </div>

        <div className={styles.flex_cc}>
          <small>
            <strong>Gender:</strong>
          </small>
          <small>{activeUser.gender}</small>
        </div>
        {state.activeUser.profession && (
          <div className={styles.flex_cc}>
            <small>
              <strong>Profession:</strong>
            </small>
            <small>{activeUser.profession}</small>
          </div>
        )}
        {state.activeUser.coe_id && (
          <div className={styles.flex_cc}>
            <small>
              <strong>Staff at:</strong>
            </small>
            <small>{state.coes.filter(coe => coe.id === state.activeUser.coe_id)[0].coe_name}</small>
          </div>
        )}
        <AuthorizedOnlyComponent requiredPermission={`ADD_COESTAFF`}>
          {" "}
          <div className={styles.footer}>
            <span
              className="btn btn-sm btn-success"
              onClick={() => setStateValue("displayCoeInput", true)}
            >
              Make User COE Staff
            </span>
          </div>
        </AuthorizedOnlyComponent>
      </>
    );
  };

  const handleRoleChange = (e) => {
    loadUsers(e.target.value);
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

      loadUsers();
    }
  };

  const handleAddUserToCOE = async () => {
    try {
      // eslint-disable-next-line no-unused-vars
      const res = await API.put(
        `/api/users/`, {
        user_id: state.activeUser.id,
        coe_id: state.coeToAddUser
      }
      );

      setState((prevState) => ({
        ...prevState,
        users: [
          ...prevState.users.filter(user => user.id !== prevState.activeUser.id),
          res.data.data,
        ],
        activeUser: res.data.data,
        displayCoeInput: false,
      }));
      alert("User is now added to COE");
    } catch (e) {
      console.log(e.response);
    }
  };

  return (
    <>
      <div className={`container ${styles.application_wrapper}`}>
        <div className={styles.application_header}>
          <PageTitle title="Users" />
        </div>
        <div className={[styles.tabs, styles.active].join(" ") + " row"}>
          {menuList.map((menuItem, index) => (
            <div key={index} className="col-md-2" onClick={menuItem.handleClick}>
              <AuthorizedOnlyComponent
                requiredPermission={menuItem.permission}
                key={menuItem.id}
              >
                <span
                  className={[
                    styles.tab_item,
                    state.activeMenu == menuItem.id ? styles.active : "",
                  ].join(" ")}
                >
                  {menuItem.name}
                </span>
              </AuthorizedOnlyComponent>
            </div>
          ))}
        </div>

        {/** All users tab */}
        <div
          className={
            state.activeMenu === 1 ? `${styles.show}` : `${styles.hide}`
          }
        >
          <div className={styles.application_table + " row"}>
            <div className={`col-md-4 `}>
              <div className="row">
                <div className="col-md-12">
                  <InlineSearchBox
                    inputValue={state.userSearchInputValue}
                    inputPlaceholder="Enter user email"
                    inputName="search"
                    icon="search"
                    onButtonClick={handleSearchApplication}
                    onInputChange={handleUserSearchInputChange}
                    showCloseButton={state.userSearched}
                    onClearSearch={handleCloseUserSearch}
                  />
                </div>
                <div className="col-md-12 px-3">
                  <select
                    className="custom-select"
                    id="role_id"
                    name="role_id"
                    onChange={handleRoleChange}
                  >
                    {state.roles.map((role) => {
                      return (
                        <option key={`role_${role.id}`} value={role.id}>
                          {role.role}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>
            <div className={`col-md-8 ` + styles.scrollableX}>
              <table className="table table-responsive-sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th colSpan="2">Date Created</th>
                    <th>Email</th>
                    <th>Gender</th>
                    <th>Phone number</th>
                    <th>Options</th>
                  </tr>
                </thead>
                <tbody style={{ overflowX: "scroll" }}>
                  {(state.tableLoading && (
                    <Spinner animation="border" variant="success" />
                  )) ||
                    renderUsersList()}

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
        {/* Add user tab */}
        <div
          className={
            state.activeMenu === 2 ? `${styles.show}` : `${styles.hide}`
          }
        >
          <AddUserForm />
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
                renderSingleUser()}
            </div>
            {state.displayCoeInput && (
              <div className="form-group">
                <select
                  className="custom-select"
                  id="coeToAddUser"
                  defaultValue={state.coeToAddUser}
                  name="coeToAddUser"
                  onChange={(e) => setStateValue(e.target.name, e.target.value)}
                >
                  <option value="">
                    {state.coes.length ? "Select coe for user" : "No coes yet..."}
                  </option>
                  {state.coes.map((coe) => {
                    return (
                      <option key={`coe_${coe.id}`} value={coe.id}>
                        {coe.coe_name}
                      </option>
                    );
                  })}
                </select>
                <span
                  className="btn btn-sm btn-success"
                  onClick={handleAddUserToCOE}
                >
                  Send
                </span>
              </div>
            )}
          </ModalBody>
        </Modal>
      )}
    </>
  );
}
