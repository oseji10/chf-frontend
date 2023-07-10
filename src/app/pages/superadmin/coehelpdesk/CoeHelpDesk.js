import { useState, useEffect } from "react";
import InlineSearchBox from "../../../components/form/inlinesearchbox";
import styles from "./../../chfadmin/chfadmin.module.scss";
import API from "../../../config/chfBackendApi";
// import Modal from "../../../components/modal/modal";
// import ModalHeader from "../../../components/modal/modalHeader";
// import ModalBody from "../../../components/modal/modalBody";
import { timestampToRegularTime } from "../../../utils/date.util";
import AddCOEHelpDesk from "../../../components/coehelpdesk/addCoeHelpDesk";
import AuthorizedOnlyComponent from "../../../components/authorizedOnlyComponent";
import PageTitle from "../../report/infographics/pageTitle";
import { Spinner } from "react-bootstrap";
import { useParams } from "react-router";
// import { formatErrors } from "../../../utils/error.utils";

const initialState = {
  staff: [],
  activeStaff: null,
  staffSearched: false,
  staffSearchInputValue: "",
  activeMenu: "menu-1",
  showEditModal: false,
  coes:[],
  editStaff: {
  },
  alert: {
    alert_type: null,
    message: "",
    alert_color: "white",
  },
  tableLoading: true
};

function CoeHelpDesk() {
  const [state, setState] = useState(initialState);
  const params = useParams();
  const coe_id= params.coe_id!==undefined?params.coe_id:"";
  const menuList = [
    {
      name: "All COE Help Desk Staff",
      id: "menu-1",
      permission: "VIEW_COEHELPDESK",
      handleClick: (e) => handleMenuClick(e, "menu-1"),
    },
    {
      name: "ADD COE Help Desk Staff",
      id: "menu-2",
      permission: "CREATE_COEHELPDESK",
      handleClick: (e) => handleMenuClick(e, "menu-2"),
    },
  ];

  /* FETCH STAFF FROM BACKEND SERVICE */
  const loadStaff = async () => {
    try {
      const res = await API.get(`/api/sadmin/coehelpdeskstaffs?coe_id=${coe_id}`);
      if (res) {
        setState((prevState) => ({
          ...prevState,
          staff: res.data.data,
          activeStaff: res.data.data[0],
          tableLoading: false
        }));
      }
    } catch (e) {
      console.log(e);
      toggleLoader(false);
    }
  };

  useEffect(() => {
    try {
      loadStaff();
    } catch (e) {
      console.log(e.response);
    }
  }, []);

  const setCOES = (coes) => {
    setState((prev) => ({
      ...prev,
      coes: coes,
    }));
  };


//Get coe name from list of COES
  const getCOEName=(coe_id)=>{
    const coe= state.coes.filter((item)=>item.id===coe_id)[0];
    return (coe)? coe.coe_name:"nil";
  }


  /* SEARCH HANDLERS */
  const handleSearchStaff = async () => {
    try {
      const res = await API.get(
        `/api/sadmin/coehelpdeskstaffs/search/${state.staffSearchInputValue}?coe_id=${coe_id}`
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

//   const handleEditChange = (displayModal, coe) => {
//     //
//     setState((prevState) => ({
//       ...prevState,
//       showEditModal: displayModal,
//       editCOE: {
//         ...prevState.editCOE,
//         ...coe,
//       },
//     }));
//   };

const toggleLoader = loader_state => {
  setState(prevState => ({
      ...prevState,
      tableLoading: loader_state,
  }))
} 

  const handleCloseSearch = () => {
    loadStaff();
    setState((prevState) => ({
      ...prevState,
      staffSearchInputValue: "",
      staffSearched: false,
    }));
  };

  const handleSearchInputChange = async (e) => {
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

  /* RENDER STAFF TO THE DOM FROM STATE */
  const renderCOEHelpDeskList = () => {
    if (!state.staff || !state.staff.length) {
      return (
        <tr>
          <td col-span="8" className="bg-secondary">
            No COE Staff Record available
          </td>
        </tr>
      );
    }

    return state.staff.map((staff, index) => (
      <tr key={index} onClick={() => handleStaffSelect(index)}>
        <td>{index + 1}</td>
        <th colSpan="2">{`${staff.first_name} ${staff.last_name}`}</th>
        <th>{staff.email}</th>
        <th>{staff.phone_number}</th>
        <th colSpan="3">{getCOEName(staff.coe_id)}</th>
      </tr>
    ));
  };

  /* RENDERS THE ACTIVE PATIENT TO THE SIDEBAR */
  const renderSingleCOEHelpDesk = () => {
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
              (activeStaff.created_at===activeStaff.updated_at) ? styles.danger : styles.success,
            ].join(" ")}
          >
            {(activeStaff.created_at===activeStaff.updated_at) ? "need to change password" : "Active"}
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
        <div className={styles.flex_cc}>
          <small>
            <strong>COE Located:</strong>
          </small>
          <small>{getCOEName(activeStaff.coe_id)}</small>
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
    if (id !== state.activeMenu) {
      setState((prevState) => ({
        ...prevState,
        activeMenu: id,
      }));

      loadStaff();
    }
  };
  return (
    <div>
      <div className={`container ${styles.application_wrapper}`}>
        <div className={styles.application_header}>
          <PageTitle title="COE HELP DESK STAFF"/>
          <InlineSearchBox
            inputValue={state.staffSearchInputValue}
            inputPlaceholder="Search by name or email"
            inputName="search"
            icon="search"
            onButtonClick={handleSearchStaff}
            onInputChange={handleSearchInputChange}
            showCloseButton={state.staffSearched}
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
          <div className={styles.application_table + ' row mt-3'}>
            <div className={`col-md-9 ` + styles.scrollableX}>
              <table className="table table-responsive-sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th colSpan="2">NAME</th>
                    <th>Email</th>
                    <th>Phone number</th>
                    <th colSpan="3">COE</th>
                  </tr>
                </thead>
                <tbody style={{ overflowX: "scroll" }}>
                {(state.tableLoading && <Spinner animation='border' variant='success' />) || renderCOEHelpDeskList()}
                </tbody>
              </table>
            </div>
            {/* CEO DETAIL */}
            <div
              className={`col-md-3 shadow-sm ` + styles.selected_coehelpdesk}
            >
              {renderSingleCOEHelpDesk()}
            </div>
          </div>
        </div>
      </div>
      <div
        className={
          state.activeMenu === "menu-2" ? `${styles.show}` : `${styles.hide}`
        }
      >
        <AddCOEHelpDesk setParentCOES={setCOES} coeId={coe_id!==undefined && coe_id}/>
      </div>
      {state.showEditModal && <></>}
    </div>
  );
}

export default CoeHelpDesk;
