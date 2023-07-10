import { useState, useEffect } from "react";
import styles from "./coestaff.module.scss";
import API from "../../../config/chfBackendApi";
import { connect } from "react-redux";
import { timestampToRegularTime } from "../../../utils/date.util";
import PageTitle from "../../report/infographics/pageTitle";
import AuthorizedOnlyComponent from "../../../components/authorizedOnlyComponent";
import TablePagination from "../../../components/tablePagination";

const initialState = {
  staff: [],
  activeStaff: null,
  selectedCoe: "",
  activeMenu: 1,
  showEditModal: false,
  editStaff: {},
  coes: [],
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

function AdminCoeStaff() {
  const [state, setState] = useState(initialState);
  const menuList = [
    {
      name: "All Staff",
      id: 1,
      permission: "VIEW_COESTAFF",
      handleClick: (e) => handleMenuClick(e, 1),
    }
  ];

  /* FETCH STAFF FROM BACKEND SERVICE */
  const loadStaff = async (coe_id) => {
    try {
      const res = await API.get(`/api/coestaffs/${coe_id}?page=${state.pagination.page}&per_page=${state.pagination.per_page}`);
      // console.log(res.data.data);
      if (res) {
        setState((prevState) => ({
          ...prevState,
          staff: res.data.data.data,
          activeStaff: res.data.data.data[0],
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

  let loadedState = false;
  useEffect(() => {
    try {
      setTimeout(async () => {
        const res = await Promise.all([API.get(`/api/coes`)]);

        setState((prevState) => ({
          ...prevState,
          coes: res[0].data.data,
        }));
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
      loadedState = true;
    } catch (e) {}
  }, [loadedState]);

  const handleStaffSelect = (index) => {
    setState((prevState) => ({
      ...prevState,
      activeStaff: prevState.staff.find(
        (staff, currentIndex) => currentIndex === index
      ),
    }));
  };

  const handleCoeChange = (e) => {
    let value = e.target.value;
    if (value !== "") {
      loadStaff(value);
      setState((prevState) => ({
        ...prevState,
        selectedCoe: value,
      }));
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

  /* RENDER STAFF TO THE DOM FROM STATE */
  const renderStaffList = () => {
    if (!state.staff) {
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
      return <h5>No Active selected</h5>;
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
        <h5>{activeStaff.email}</h5>
        <small className="d-block">
          <b>Staff Created At</b>{" "}
        </small>
        <div className={styles.status_container}>
          <small>{timestampToRegularTime(activeStaff.created_at)}</small>
        </div>
        <div className={styles.flex_cc}>
          <small>
            <strong>Name:</strong>
          </small>
          <small>{`${activeStaff.first_name} ${activeStaff.last_name}`}</small>
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

        {/* <div className={styles.footer}>
          <span
            className="btn btn-sm btn-success"
            onClick={() => handleEditChange(true, state.activeCoe)}
          >
            Edit
          </span>
        </div> */}
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
      if (state.selectedCoe) {
        loadStaff(state.selectedCoe);
      }
    }
  };
  return (
    <div>
      <div className={`container ${styles.coestaff_wrapper}`}>
        <div className={styles.coestaff_header}>
          <PageTitle title="COE Staff" />
          <div className="row">
            <div className="col-sm-2"></div>
            <div className="col-sm-8">
              <form>
                <label className="form-label">Choose an active COE</label>
                <select
                  className="custom-select"
                  id="coe"
                  name="coe"
                  placeholder="Choose a COE to view"
                  onChange={handleCoeChange}
                >
                  <option value="">-- Select coe --</option>
                  {state.coes.map((coe) => {
                    return <option value={coe.id} key={`adminCS-${coe.id}`}>{coe.coe_name}</option>;
                  })}
                </select>
              </form>
            </div>
            <div className="col-sm-2"></div>
          </div>
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
            state.activeMenu === 1 ? `${styles.show}` : `${styles.hide}`
          }
        >
          <div className={styles.coestaff_table + " row mt-3"}>
            <div className={`col-md-9 ` + styles.scrollableX}>
              <table className="table table-responsive-sm">
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
      {state.showEditModal && <></>}
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
  };
};

export default connect(mapStateToProps)(AdminCoeStaff);
