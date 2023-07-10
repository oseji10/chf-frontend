import { useState, useEffect } from "react";
import InlineSearchBox from "../../../components/form/inlinesearchbox";
import styles from "./chfadmin.module.scss";
import API from "../../../config/chfBackendApi";
import { connect } from "react-redux";
import { timestampToRegularTime } from "../../../utils/date.util";
import AuthorizedOnlyComponent from "../../../components/authorizedOnlyComponent";
import AddChfAdmin from "../../../components/chfadmin/addChfAdmin";
import PageTitle from "../../../components/pageTitle/pageTitle";


const initialState = {
  chfAdmins: [],
  activeChFAdmins: null,
  adminSearched: false,
  adminSearchInputValue: "",
  activeMenu: "menu-1",
  showEditModal: false,
  editAdmin: {
  },
  alert: {
    alert_type: null,
    message: "",
    alert_color: "white",
  },
};

function ChfAdmin({user}) {
  const [state, setState] = useState(initialState);
  const menuList = [
    {
      name: "All CHF Admins",
      id: "menu-1",
      permission: "VIEW_CHFADMIN",
      handleClick: (e) => handleMenuClick(e, "menu-1"),
    },
    {
      name: "Create CHF Admin",
      id: "menu-2",
      permission: "CREATE_CHFADMIN",
      handleClick: (e) => handleMenuClick(e, "menu-2"),
    },
  ];

  /* FETCH CHF ADMIN FROM BACKEND SERVICE */
  const loadChfAdmin = async () => {
    try {
      const res = await API.get(`/api/sadmin/chfstaffs`);
      // console.log(res.data.data);
      if (res) {
        setState((prevState) => ({
          ...prevState,
          chfAdmins: res.data.data,
          activeChFAdmins: res.data.data[0],
        }));
      }
    } catch (e) {
      console.log(e);
    }
  };

  let loadedStaff=false;
  useEffect(() => {
    loadChfAdmin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    loadedStaff=true;
  }, [loadedStaff]);


  /* SEARCH APPLICATION HANDLERS */
  const handleSearchApplication = async () => {
    try {
      const res = await API.get(
        `/api/sadmin/chfstaffs/search/${state.adminSearchInputValue}`
      );
      setState((prevState) => ({
        ...prevState,
        chfAdmins: res.data.data,
        adminSearched: true,
      }));
    } catch (e) {
      console.log(e.response);
    }
  };

  const handleChfAdminSelect = (index) => {
    setState((prevState) => ({
      ...prevState,
      activeChFAdmins: prevState.chfAdmins.find(
        (chfadmin, currentIndex) => currentIndex === index
      ),
    }));
  };

  const handleCloseSearch = () => {
    loadChfAdmin();
    setState((prevState) => ({
      ...prevState,
      adminSearchInputValue: "",
      adminSearched: false,
    }));
  };

  const handleSearchInputChange = (e) => {
    let value = e.target.value;
    if (value === "") {
      loadChfAdmin();
    }
    setState((prevState) => ({
      ...prevState,
      adminSearchInputValue: value,
      adminSearched: false,
    }));
  };

  /* RENDER CHF ADMIN TO THE DOM FROM BACKEND */
  const renderChfAdminList = () => {
    if (!state.chfAdmins || !state.chfAdmins.length) {
      return (
        <tr>
          <td col-span="8" className="bg-secondary">
            No Admin Record available
          </td>
        </tr>
      );
    }

    return state.chfAdmins.map((chfAdmin, index) => (
      <tr key={index} onClick={() => handleChfAdminSelect(index)}>
        <td>{index + 1}</td>
        <th colSpan="3">{`${chfAdmin.first_name} ${chfAdmin.last_name}`}</th>
        <th colSpan="3">{chfAdmin.email}</th>
        <th>{chfAdmin.phone_number}</th>
        <th >{chfAdmin.gender}</th>
      </tr>
    ));
  };

  /* RENDERS THE ACTIVE STAFF TO THE SIDEBAR */
  const renderChfAdmin = () => {
    if (!state.activeChFAdmins) {
      return <h5>No Active selected</h5>;
    }

    const activeChFAdmins = state.activeChFAdmins;

    return (
      <>
        <div className="d-flex justify-content-end">
          <small
            className={[
              styles.status,
              (activeChFAdmins.created_at===activeChFAdmins.updated_at) ? styles.danger : styles.success,
            ].join(" ")}
          >
            {(activeChFAdmins.created_at===activeChFAdmins.updated_at) ? "need to change password" : "Active"}
          </small>
        </div>
        <h5>{activeChFAdmins.email}</h5>
        <small className="d-block">
          <b>User Created At</b>{" "}
        </small>
        <div className={styles.status_container}>
          <small>{timestampToRegularTime(activeChFAdmins.created_at)}</small>
        </div>
        <div className={styles.flex_cc}>
          <small>
            <strong>Name:</strong>
          </small>
          <small>{`${activeChFAdmins.first_name} ${activeChFAdmins.last_name}`}</small>
        </div>
        <div className={styles.flex_cc}>
          <small>
            <strong>phone_number:</strong>
          </small>
          <small>{activeChFAdmins.phone_number}</small>
        </div>
        <div className={styles.flex_cc}>
          <small>
            <strong>Gender:</strong>
          </small>
          <small>{activeChFAdmins.gender}</small>
        </div>
        
        <div className={styles.footer}>
          <p></p>
          <p></p>
          {/* <span
            className="btn btn-sm btn-success"
            onClick={() => handleEditChange(true, state.activeCoe)}
          >
            Edit
          </span> */}
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

      loadChfAdmin();
    }
  };
  return (
    <div>
      <div className={`container ${styles.chfadmin_wrapper}`}>
        <div className={styles.chfadmin_header}>
          <PageTitle title="CHF ADMIN (SECRETARIAT)"/>
          <InlineSearchBox
            inputValue={state.adminSearchInputValue}
            inputPlaceholder="Search name or email"
            inputName="search"
            icon="search"
            onButtonClick={handleSearchApplication}
            onInputChange={handleSearchInputChange}
            showCloseButton={state.adminSearched}
            onClearSearch={handleCloseSearch}
          />
        </div>

        <div className={[styles.tabs, styles.active].join(" ") + " row"}>
          {menuList.map((menuItem) => (
            <AuthorizedOnlyComponent requiredPermission={menuItem.permission} key={menuItem.id}>
            <div
              className="col-md-2"
              onClick={menuItem.handleClick}
            >
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
          <div className={styles.chfadmin_table + " row mt-3"}>
            <div className={`col-md-9 ` + styles.scrollableX}>
              <table className="table table-responsive-sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th colSpan="3">NAME</th>
                    <th colSpan="3">Email</th>
                    <th>Phone number</th>
                    <th >Gender</th>
                  </tr>
                </thead>
                <tbody style={{ overflowX: "scroll" }}>
                  {renderChfAdminList()}
                </tbody>
              </table>
            </div>
            {/* CEO DETAIL */}
            <div
              className={`col-md-3 shadow-sm ` + styles.selected_coestaff}
            >
              {renderChfAdmin()}
            </div>
          </div>
        </div>
      </div>
      <div
        className={
          state.activeMenu === "menu-2" ? `${styles.show}` : `${styles.hide}`
        }
      >
        <AddChfAdmin />
      </div>
      {state.showEditModal && <></>}
    </div>
  );
}


const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
  };
};

export default connect(mapStateToProps)(ChfAdmin);
