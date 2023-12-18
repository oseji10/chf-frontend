import { useState, useEffect } from "react";
import InlineSearchBox from "../../../components/form/inlinesearchbox";
import styles from "./coe.module.scss";
import API from "../../../config/chfBackendApi";
import Modal from "../../../components/modal/modal";
import ModalHeader from "../../../components/modal/modalHeader";
import ModalBody from "../../../components/modal/modalBody";
import AlertText from "../../../components/message/alertText";
import { formatAsMoney } from "../../../utils/money.utils";
import { timestampToRegularTime } from "../../../utils/date.util";
import AddCoe from "../../../components/coe/addCoe";
import { formatErrors } from "../../../utils/error.utils";
import { connect } from "react-redux";
import AuthorizedOnlyComponent from "../../../components/authorizedOnlyComponent";
import PageTitle from "../../../components/pageTitle/pageTitle";
import { Link } from "react-router-dom";
import ModalFooter from '../../../components/modal/modalFooter';

const initialState = {
  coes: [],
  activeCoe: null,
  coeSearched: false,
  coeSearchInputValue: "",
  activeMenu: "menu-1",
  showEditModal: false,
  editCOE: {
    coe_name: "",
    coe_type: "",
    coe_address: "",
    coe_id_cap: "",
    state_id: "",
  },
  alert: {
    alert_type: null,
    message: "",
    alert_color: "white",
  },
  stateField: [],
};

function COE() {
  const [state, setState] = useState(initialState);
  const [errors, setErrors] = useState({});
  const menuList = [
    {
      name: "All COES",
      id: "menu-1",
      permission: "VIEW_COE",
      handleClick: (e) => handleMenuClick(e, "menu-1"),
    },
    {
      name: "ADD COE",
      id: "menu-2",
      permission: "CREATE_COE",
      handleClick: (e) => handleMenuClick(e, "menu-2"),
    },
  ];

  const findFormErrors = () => {
    let { coe_name, coe_type, coe_address, state_id } = state.editCOE;

    const newErrors = {};

    // Address
    if (coe_address.trim().length < 10)
      newErrors.coe_address = "Address must be more than 10 characters!";

    // coe name
    if (coe_name.trim().length < 2)
      newErrors.coe_name = "Please provide a coe name";

    // state_id
    if (!state_id) newErrors.state_id = "Please choose a state";

    // coe_type
    if (!coe_type) newErrors.coe_type = "Please choose a valid coe_type";
    setErrors(newErrors);
    return newErrors;
  };

  const handleAlert = (msg) => {
    setState((prev) => ({
      ...prev,
      alert: msg,
    }));
  };

  /* FETCH COES FROM BACKEND SERVICE */
  const loadCOES = async () => {
    try {
      const res = await API.get(`/api/coes`);
      //   console.log(res.data)
      if (res) {
        setState((prevState) => ({
          ...prevState,
          coes: res.data.data,
          activeCoe: res.data.data[0],
        }));
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    try {
      loadCOES();
    } catch (e) {
      console.log(e.response);
    }
  }, []);

  const setStateField = (states) => {
    setState((prev) => ({
      ...prev,
      stateField: states,
    }));
  };

  const handleFormData = (e) => {
    e.preventDefault();
    setField(e.target.name, e.target.value);
  };

  const setField = (field, value) => {
    setState(prev=>({
      ...prev,
      editCOE:{
          ...prev.editCOE,
          [field]: value,
      }  
    }));
  };

  /* SEARCH APPLICATION HANDLERS */
  const handleSearchApplication = async () => {
    try {
      const res = await API.get(
        `/api/coes/search/${state.coeSearchInputValue}`
      );

      setState((prevState) => ({
        ...prevState,
        coes: res.data.data.data,
        coeSearched: true,
      }));
    } catch (e) {
      console.log(e);
    }
  };

  const handleCOESelect = (index) => {
    setState((prevState) => ({
      ...prevState,
      activeCoe: prevState.coes.find(
        (coe, currentIndex) => currentIndex === index
      ),
    }));
  };

  const handleEditChange = (displayModal, coe) => {
    //
    setState((prevState) => ({
      ...prevState,
      showEditModal: displayModal,
      editCOE: {
        ...prevState.editCOE,  
        ...coe
    },
    }));
  };

  const handleCloseCOESearch = () => {
    loadCOES();
    setState((prevState) => ({
      ...prevState,
      coeSearchInputValue: "",
      coeSearched: false,
    }));
  };

  const handleCOESearchInputChange = (e) => {
    let value = e.target.value;
    if (value === "") {
      loadCOES();
    }
    setState((prevState) => ({
      ...prevState,
      coeSearchInputValue: value,
      coeSearched: false,
    }));
  };

  const handleEdit = (e) => {
    window.scrollTo(150, 0);
    e.preventDefault();

    // Check to make sure the fields were changed. If true update activeCOE with editCOE
    setState((prev) => ({
      ...prev,
      editCOE: {
        ...prev.editCOE,
        state_id:
          !state.editCOE.state_id
            ? state.editCOE.state.id
            : "",
      },
    }));

    // Get errors
    const newErrors = findFormErrors();

    // Conditional logic:
    if (Object.keys(newErrors).length > 0) {
      // We got errors!
      setErrors(newErrors);
      return false;
    }

    handleAlert({
      alert_type: null,
      message: "Sending request",
      alert_color: "#333",
    });
    // console.log(state.editCOE);
    API.put(`/api/coes/${state.editCOE.id}`, state.editCOE)
      .then(async (response) => {
        handleAlert({
          alert_type: "success",
          message: "COE updated",
          alert_color: "#fff",
        });
        loadCOES();
        handleEditChange(false,state.editCOE);
      })
      .catch((err) => {
          console.log(err);
        handleAlert({
          alert_type: "danger",
          message: formatErrors(err),
          alert_color: "#fff",
        });
      });
  };

  /* RENDER COES TO THE DOM FROM STATE */
  const renderCOEList = () => {
    if (!state.coes) {
      return (
        <tr>
          <td col-span="8" className="bg-secondary">
            No COE records available
          </td>
        </tr>
      );
    }

    return state.coes.map((coe, index) => (
      <tr key={index} onClick={() => handleCOESelect(index)}>
        <td>{index + 1}</td>
        <td colSpan="3">{coe.coe_name}</td>
        <td>{coe.coe_type} </td>
        <td>{coe.state.state}</td>
        <td className="2">{coe.coe_address}</td>
        <td>
          {coe.wallet ? <> <del>N</del>{formatAsMoney(coe.wallet.balance)} </>: `0.00`}
        </td>
      </tr>
    ));
  };

  /* RENDERS THE ACTIVE PATIENT TO THE SIDEBAR */
  const renderSingleCOE = () => {
    if (!state.activeCoe) {
      return <h5>No Active selected</h5>;
    }

    const activeCOE = state.activeCoe;

    return (
      <>
        <div className="d-flex justify-content-end">
          <small
            className={[
              styles.status,
              !activeCOE.wallet ? styles.danger : styles.success,
            ].join(" ")}
          >
            {!activeCOE.wallet ? "No wallet" : "Active Wallet"}
          </small>
        </div>
        <h4>{activeCOE.coe_name}</h4>
        <h5>{activeCOE.coe_type}</h5>
        <small className="d-block">
          <b>Application Date</b>{" "}
        </small>
        <div className={styles.status_container}>
          <small>{timestampToRegularTime(activeCOE.created_at)}</small>
        </div>
        <div className={styles.flex_cc}>
          <small>
            <strong>Address:</strong>
          </small>
          <small>{activeCOE.coe_address}</small>
        </div>

        <div className={styles.flex_cc}>
          <small>
            <strong>State:</strong>
          </small>
          <small>{activeCOE.state.state}</small>
        </div>
        <div className={styles.flex_cc}>
          <small>
            <strong>Wallet Utilization:</strong>
          </small>
          <small>
            {activeCOE.wallet ? (
              <><del>N</del> {formatAsMoney(activeCOE.wallet.balance)}</>
            ):`0.00`}
          </small>
        </div>

        {/* <div className={styles.flex_cc}>
          <small>
            <strong>Wallet Balance:</strong>
          </small>
          <small>
            {activeCOE.wallet ? (
              <><del>N</del> {formatAsMoney(activeCOE.wallet.balance)}</>
            ):`0.00`}
          </small>
        </div> */}

        <AuthorizedOnlyComponent requiredPermission={`VIEW_CHF_REPORT`}>
        <div className={styles.footer}>
          <Link to={`/superadmin/billings/${state.activeCoe.id}?`}>
          <span
            className="btn btn-sm btn-success"
            onClick={() => handleEditChange(true, state.activeCoe)}
          >
            View billing history
          </span>
          </Link>

&nbsp;
          {/* <Link to={`/superadmin/billings/${state.activeCoe.id}?`}> */}
          <span
            className="btn btn-sm btn-warning"
            // onClick={() => handleEditChange(true, state.activeCoe)}
            onClick={() => setStateValue('activePatient', patient)}
          >
            Topup Wallet
          </span>
          {/* </Link> */}
        </div>

        
        </AuthorizedOnlyComponent>
      </>
    );
  };

  const handleMenuClick = (e, id) => {
    console.log(id);
    if (id !== state.activeMenu) {
      setState((prevState) => ({
        ...prevState,
        activeMenu: id,
      }));

      loadCOES();
    }
  };

 
    <Modal >
      <ModalHeader
        // modalTitle="Topup"
       
        modalTitle={`Approve Wallet Topup for - ${state.activePatient?.user.first_name + ' ' + state.activePatient?.user.last_name}`}
        onModalClose={() => setStateValue("activePatient", null)}
      />
      <ModalBody>
        <div className="form-group">
        <h4 className="text-primary">Requested Amount: {formatAsMoney(state.activePatient?.amount_requested)}</h4><br/>
          <label className="text-secondary">Enter Amount To Approve</label>
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
                value={state.approvedAmount} 
                onChange={(e) => setStateValue('approvedAmount', e.target.value)} 
                name="approvedAmount"
            />
        </div>
    </ModalBody>
      <ModalFooter>
        <button className="btn btn-success" onClick={handleWalletTopup}>
          Topup
        </button>
      </ModalFooter>
    </Modal>
  

  return (
    <div>
      <div className={`container ${styles.coe_wrapper}`}>
        <div className={styles.coe_header}>
          <PageTitle title="COES"/>
          <InlineSearchBox
            inputValue={state.coeSearchInputValue}
            inputPlaceholder="Search COE by name or type"
            inputName="search"
            icon="search"
            onButtonClick={handleSearchApplication}
            onInputChange={handleCOESearchInputChange}
            showCloseButton={state.coeSearched}
            onClearSearch={handleCloseCOESearch}
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
          <div className={styles.coe_table + " row mt-3"}>
            <div className={`col-md-9 ` + styles.scrollableX}>
              <table className="table table-responsive-sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th colSpan="3">COE NAME</th>
                    <th>Type</th>
                    <th>COE State</th>
                    <th colSpan="1">COE Address</th>
                    <th>Wallet Utilization</th>
                    
                  </tr>
                </thead>
                <tbody style={{ overflowX: "scroll" }}>{renderCOEList()}</tbody>
              </table>
            </div>
            {/* CEO DETAIL */}
            <div className={`col-md-3 shadow-sm ` + styles.selected_coe}>
              {renderSingleCOE()}
            </div>
          </div>
        </div>
      </div>
      <div
        className={
          state.activeMenu === "menu-2" ? `${styles.show}` : `${styles.hide}`
        }
      >
        <AddCoe setParentState={setStateField} />
      </div>
      {state.showEditModal && (
        <Modal>
          <ModalHeader
            modalTitle="Edit COE"
            onModalClose={() => {
              handleEditChange(false, state.editCOE);
            }}
          >
            <AlertText
              alertType={state.alert.alert_type}
              color={state.alert.alert_color}
              message={state.alert.message}
            />
          </ModalHeader>
          <ModalBody>
            <form onSubmit={handleEdit}>
              <div className="form-group">
                <label className="text-success">
                  <strong>COE Name</strong>
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="coe_name"
                  required
                  id="coe_name"
                  defaultValue={state.editCOE && state.editCOE.coe_name}
                  onBlur={handleFormData}
                />
                <small>{errors.coe_name}</small>
              </div>
              <div className="form-group">
                <label className="text-success">
                  <strong>COE CAP ID (coe id on CAP:- optional for use with CAP)</strong>
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="coe_id_cap"
                  required
                  id="coe_id_cap"
                  defaultValue={state.editCOE && state.editCOE.coe_id_cap}
                  onBlur={handleFormData}
                />
                <small>{errors.coe_id_cap}</small>
              </div>
              <div className="form-group">
                <label className="text-success">
                  <strong>COE Type</strong>
                </label>
                <select
                  className="custom-select"
                  id="coe_type"
                  name="coe_type"
                  defaultValue={state.editCOE && state.editCOE.coe_type}
                  onChange={handleFormData}
                >
                  <option value="">-- Choose coe type --</option>
                  <option value="Federal">Federal</option>
                  <option value="State">State</option>
                </select>
                <small>{errors.coe_type}</small>
              </div>
              <div className="form-group">
                <label className="text-success">
                  <strong>State</strong>
                </label>
                <select
                  className="custom-select"
                  id="state_id"
                  name="state_id"
                  onChange={handleFormData}
                >
                  <option value="">-- Select state --</option>
                  {state.stateField.map((state, index) => {
                    return (
                      <option
                        key={`${state.id}/${state.state}`}
                        value={`${state.id}`}
                      >
                        {state.state}
                      </option>
                    );
                  })}
                </select>
                <small>{errors.state_id}</small>
              </div>
              <div className="form-group">
                <label className="text-success">
                  <strong>COE Address</strong>
                </label>
                <textarea
                  className="form-control"
                  name="coe_address"
                  placeholder="COE Address"
                  defaultValue={state.editCOE && state.editCOE.coe_address}
                  onBlur={handleFormData}
                ></textarea>
                <small>{errors.coe_address}</small>
              </div>
              <button
                className="btn btn-sm btn-success mr-3"
                onClick={handleEdit}
              >
                Submit
              </button>
            </form>
          </ModalBody>
        </Modal>
      )}
    </div>
  );
}

const mapPropsToState=(state)=>{
  return {
    user: state.auth.user,
  } 
}

export default connect(mapPropsToState)(COE);
