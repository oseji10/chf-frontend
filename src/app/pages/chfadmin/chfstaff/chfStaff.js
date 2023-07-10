import { useState, useEffect } from "react";
import InlineSearchBox from "../../../components/form/inlinesearchbox";
import styles from "../chfadmin.module.scss";
import API, { CHFBackendAPI } from "../../../config/chfBackendApi";
import { connect } from "react-redux";
import { timestampToRegularTime } from "../../../utils/date.util";
import AuthorizedOnlyComponent from "../../../components/authorizedOnlyComponent";
import PageTitle from "../../report/infographics/pageTitle";
import TablePagination from "../../../components/tablePagination";
import AddUserForm from "../../../components/Users/addUserForm";
import Button from "../../../components/button";
import MessageAlert from "../../../components/message/messageAlert";

const initialState = {
  staff: [],
  activeStaff: null,
  staffSearched: false,
  staffSearchInputValue: "",
  newStaff:null,
  activeMenu: "menu-1",
  alert: {
    alert_type: null,
    message: "",
    alert_color: "white",
  },
  pagination: {
    per_page: 10,
    page: 1,
    links: null,
    pages: 1,
  },
};

function ChfStaff({ user }) {
  const [state, setState] = useState(initialState);
  const menuList = [
    {
      name: "All Staff",
      id: "menu-1",
      permission: "VIEW_CHFSTAFF",
      handleClick: (e) => handleMenuClick(e, "menu-1"),
    },
    {
      name: "Create Staff",
      id: "menu-2",
      permission: "CREATE_CHFSTAFF",
      handleClick: (e) => handleMenuClick(e, "menu-2"),
    },
  ];

  /* FETCH STAFF FROM BACKEND SERVICE */
  const loadStaff = async () => {
    try {
      const res = await API.get(`/api/chfstaffs?page=${state.pagination.page}&per_page=${state.pagination.per_page}`);
      const res1 = await CHFBackendAPI.get('/chfstaff');
      console.log(res1);
      if (res) {
        setState((prevState) => ({
          ...prevState,
          staff: res.data.data.data,
          activeStaff: res.data.data.data ? res.data.data.data[0]:null,
          pagination: {
            ...prevState.pagination,
            links: res.data.data.links,
            page: res.data.data.current_page,
            pages: res.data.data.last_page
          }
        }));
      }
    } catch (e) {
      console.log(e);
    }
  };

  let loadedStaff = false;
  useEffect(() => {
    try {
      loadStaff();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      loadedStaff = true;
    } catch (e) {}
  }, [loadedStaff, user]);

  /* SEARCH APPLICATION HANDLERS */
  const handleSearchApplication = async () => {
    try {
      const res = await API.get(
        `/api/chfstaffs/search/${state.staffSearchInputValue}`
      );

      setState((prevState) => ({
        ...prevState,
        staff: res.data.data,
        staffSearched: true,
      }));
    } catch (e) {
      console.log(e);
    }
  };

  const handleStaffSelect = (index) => {
    setState((prevState) => ({
      ...prevState,
      activeStaff: prevState.staff.find(
        (staff, currentIndex) => currentIndex === index
      ),
    }));
  };

  const handleCloseSearch = () => {
    loadStaff();
    setState((prevState) => ({
      ...prevState,
      staffSearchInputValue: "",
      staffSearched: false,
    }));
  };

  const handleSearchInputChange = (e) => {
    let value = e.target.value;
    if (value === "") {
      loadStaff();
    }
    setState((prevState) => ({
      ...prevState,
      staffSearchInputValue: value,
      staffSearched: false,
    }));
  };

  /**
   * Set new staff if add user was successfull
   */
   const handleSetNewStaff = (value) => {
    setState((prev) => ({
      ...prev,
      newStaff: value,
    }));
  };


  /* RENDER STAFF TO THE DOM FROM STATE */
  const renderStaffList = () => {
    if (!state.staff || !state.staff.length) {
      return (
        <tr>
          <td col-span="8" className="bg-secondary">
            No Staff Record available
          </td>
        </tr>
      );
    }

    return state.staff.map((staff, index) => (
      <tr key={index} onClick={() => handleStaffSelect(index)}>
        <td>{index + 1}</td>
        <th colSpan="3">{`${staff.first_name} ${staff.last_name}`}</th>
        <th colSpan="3">{staff.email}</th>
        <th>{staff.phone_number}</th>
        <th>{staff.gender}</th>
      </tr>
    ));
  };

  /* RENDERS THE ACTIVE STAFF TO THE SIDEBAR */
  const renderStaff = () => {
    if (!state.activeStaff) {
      return <h5>No Active staff selected</h5>;
    }

    const activeStaff = state.activeStaff;

    return (
      <>
        <div className="d-flex justify-content-end">
          <small
            className={[
              styles.status,
              activeStaff.created_at === activeStaff.updated_at
                ? styles.danger
                : styles.success,
            ].join(" ")}
          >
            {activeStaff.created_at === activeStaff.updated_at
              ? "need to change password"
              : "Active"}
          </small>
        </div>
        <h4>{`${activeStaff.first_name} ${activeStaff.last_name}`}</h4>
        <h5>{activeStaff.email}</h5>
        <small className="d-block">
          <b>Staff Created At</b>{" "}
        </small>
        <div className={styles.status_container}>
          <small>{timestampToRegularTime(activeStaff.created_at)}</small>
        </div>
        <div className={styles.flex_cc}>
          <small>
            <strong>phone_number:</strong>
          </small>
          <small>{activeStaff.phone_number}</small>
        </div>
        <div className={styles.flex_cc}>
          <small>
            <strong>Gender:</strong>
          </small>
          <small>{activeStaff.gender}</small>
        </div>

        <div className={styles.footer}>
          <p>&nbsp;</p>
        </div>
      </>
    );
  };

  const handleMenuClick = (e, id) => {
    // console.log(id);
    if (id !== state.activeMenu) {
      setState((prevState) => ({
        ...prevState,
        activeMenu: id,
      }));

      loadStaff();
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
    loadStaff();
  };

   /**
   * 
   * Return state back to initial on cancel 
   */
    const clearNewStaff = ()=>{
      setState((prev) => ({
        ...prev,
        newStaff:null,
      }));
     }

  const renderNewStaff=()=>{
    return ( <> 
      {state.newStaff && <div className="row">
      <div className={`col-md-2`}></div>
      <div className={`col-md-8 shadow-sm mt-5 ` + styles.selected_coehelpdesk}>
      <MessageAlert
            alertMessage="New staff created and displayed below:"
            alertVariant="success"
            alertLink={{}}
          />
        <p>
          <small>
            <strong>
              Staff name: {state.newStaff && `${state.newStaff.first_name} ${state.newStaff.last_name}`}
            </strong>
          </small>
        </p>
        <p>
          <small>
            <strong>
              New staff role:{" "}
              {state.newStaff && state.newStaff.roles.length && `${state.newStaff.roles[0].role}`}
            </strong>
          </small>
        </p>
        <Button
          value="Close"
          btnClass="btn btn-success py-2 px-3"
          type="button"
          onClick={clearNewStaff}
        />
      </div>
      <div className={`col-md-2`}></div>
    </div>
      }
      </>)
  }

  const handlePerPageChange = (e) => {
    setState((prevState) => ({
      ...prevState,
      pagination: {
        ...prevState.pagination,
        per_page: e.target.value,
      },
    }));

    loadStaff();
  };
  return (
    <div>
      <div className={`container ${styles.application_wrapper}`}>
        <div className={styles.application_header}>
          <PageTitle
            title="CHF Secretariat Staff page"
          />
          <InlineSearchBox
            inputValue={state.staffSearchInputValue}
            inputPlaceholder="Search first name or last name or email"
            inputName="search"
            icon="search"
            onButtonClick={handleSearchApplication}
            onInputChange={handleSearchInputChange}
            showCloseButton={state.staffSearched}
            onClearSearch={handleCloseSearch}
          />
        </div>

        <div className={[styles.tabs, styles.active].join(" ") + " row"}>
          {menuList.map((menuItem) => (
            <AuthorizedOnlyComponent
              requiredPermission={menuItem.permission}
              key={menuItem.id}
            >
              <div className="col-md-2" onClick={menuItem.handleClick}>
                <span
                  className={[
                    styles.tab_item,
                    state.activeMenu === menuItem.id ? styles.active : "",
                  ].join(" ")}
                >
                  {menuItem.name}
                </span>
              </div>
            </AuthorizedOnlyComponent>
          ))}
        </div>

        {/* menu-1 */}
        <div
          className={
            state.activeMenu === "menu-1" ? `${styles.show}` : `${styles.hide}`
          }
        >
          <div className={styles.application_table + ' row mt-3'}>
            <div className={`col-md-9`}>
              <table className={`table table-responsive-sm ${styles.scrollableX}`}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th colSpan="3">NAME</th>
                    <th colSpan="3">Email</th>
                    <th>Phone number</th>
                    <th>Gender</th>
                  </tr>
                </thead>
                <tbody style={{ overflowX: "scroll" }}>
                  {renderStaffList()}
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
            {/* CEO DETAIL */}
            <div className={`col-md-3 shadow-sm ` + styles.selected_coestaff}>
              {renderStaff()}
            </div>
          </div>
        </div>
      </div>
      <div
        className={
          state.activeMenu === "menu-2" ? `${styles.show}` : `${styles.hide}`
        }
      >
        {!state.newStaff && <AddUserForm
            formTitle="New Staff"
            handleSetNewStaff={handleSetNewStaff}
          />}

          {state.newStaff && renderNewStaff()}
          
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
  };
};

export default connect(mapStateToProps)(ChfStaff);
