import { useState, useEffect } from "react";
import styles from "./coestaff.module.scss";
import API from "../../../config/chfBackendApi";
import { connect, useDispatch } from "react-redux";
import { timestampToRegularTime } from "../../../utils/date.util";
import AddUserForm from "../../../components/Users/addUserForm";
import NewCoeStaff from "../../../components/Users/newCoeStaff";
import { propagateAlert } from "../../../redux/alertActions";
import { formatErrors, formatErrorsToString } from "../../../utils/error.utils";
import { Modal, ModalBody, ModalHeader, ModalFooter, Input, Button, Label, PageTitle, AuthorizedOnlyComponent, Tag } from '../../../components';
import MUIDataTable from 'mui-datatables';
import { formatName } from "../../../utils/dataFormat.util";
import { COE_ADMIN_USERS_TABLE_COLUMNS } from "../../../utils/table-constants/user-table.constant";
import { BsKey } from "react-icons/bs";
import { DANGER, SUCCESS } from "../../../utils/constant.util";
import { toast } from "react-toastify";

const initialState = {
  staff: [],
  activeStaff: null,
  currentCoeDetails: null,
  staffSearched: false,
  staffSearchInputValue: "",
  activeMenu: "menu-1",
  showEditModal: false,
  showTokenModal: false,
  showRolesModal: false,
  editStaff: {},
  addStaffForm: 1,
  newStaff: {},
  assignableRole: [],
  verificationCode: '',
  showStaffRoleModal: false,
  alert: {
    alert_type: null,
    message: "",
    alert_color: "white",
  },
  pagination: {
    per_page: 1000,
    page: 1,
    links: null,
    pages: 1,
  },
  isUpdatingStaff: false,
};


function CoeStaff({ user }) {
  const dispatch = useDispatch();

  const setStateValue = (key, value) => {
    return setState(prevState => ({
      ...prevState,
      [key]: value
    }))
  }

  const setActiveStaffValue = (key, value) => {
    return setState(prevState => ({
      ...prevState,
      activeStaff: {
        ...prevState.activeStaff,
        [key]: value
      }
    }))
  }

  const [state, setState] = useState(initialState);
  const [selectedRoles, setSelectedRoles] = useState([])
  const [isLoading, setIsLoading] = useState(false);
  const menuList = [
    {
      name: "All Staff",
      id: "menu-1",
      permission: "VIEW_OWN_COESTAFF",
      handleClick: (e) => handleMenuClick(e, "menu-1"),
    },
    {
      name: "Create Hospital Staff",
      id: "menu-2",
      permission: "CREATE_COESTAFF",
      handleClick: (e) => handleMenuClick(e, "menu-2"),
    },
  ];

  /* FETCH STAFF FROM BACKEND SERVICE */
  const loadStaff = async () => {
    try {

      const staffResponse = await API.get(
        `/api/coestaffs/${user.user.coe_id}?page=${state.pagination.page}&per_page=${state.pagination.per_page}`
      );

      const roleParentResponse = await API.get('/api/parent/roles')

      if (staffResponse.data?.data) {
        const { data } = staffResponse;
        setState((prevState) => ({
          ...prevState,
          staff: data.data.data,
          activeStaff: data?.data?.data ? data?.data?.data[0] : null,
          coe_id: user.user.coe_id,
          assignableRole: roleParentResponse.data?.data,
        }));
      }
    } catch (e) {
      console.log(e);
    }
  };

  let loadedStaff = false;
  useEffect(() => {
    try {
      API.get(`/api/coes/${user.user.coe_id}`).then((res) => {
        // console.log(res.data.data);
        setState((prevState) => ({
          ...prevState,
          currentCoeDetails: res.data.data,
        }));
      });
      loadStaff();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      loadedStaff = true;
    } catch (e) { }
  }, [loadedStaff, user]);

  /**
   * Handle current form status. If successful or not
   */
  const handleSubmitStatus = (value) => {
    if (value === "success" && state.addStaffForm === 1) {
      setState((prev) => ({
        ...prev,
        addStaffForm: 2,
      }));
    } else if (value === "success" && state.addStaffForm === 2) {
      setState((prev) => ({
        ...prev,
        addStaffForm: 1,
      }));
    }
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

  /**
   * 
   * Return state back to initial on cancel 
   */
  const cancelCreateStaff = () => {
    setState((prev) => ({
      ...prev,
      addStaffForm: 1,
      newStaff: {},
    }));
  }

  const handleStaffSelect = (index) => {
    setState((prevState) => ({
      ...prevState,
      activeStaff: prevState.staff[index],
    }));
  };

  const handleShowStaffRoleModal = (staff) => {
    let currentIndex = 0;
    let userRoles = staff.roles.map(role => role.id);
    let activeRoles = [];
    for (let role of state.assignableRole) {
      if (userRoles.includes(role.id)) activeRoles.push(currentIndex);
      currentIndex++;
    }

    // let activeRoles = state.assignableRole.filter(role => usersRoles.includes(role.id)).map((''))
    setSelectedRoles(activeRoles);
    return setState(prev => ({
      ...prev,
      showStaffRoleModal: true,
      activeStaff: staff,
    }))
  }


  const handleUpdateUserRoles = async () => {
    if (!selectedRoles.length) return toast.error("You must select at least one role.")

    try {
      setIsLoading(true);
      const updatedRoles = state.assignableRole.filter((role, index) => selectedRoles.includes(index)).map(role => role.id);

      const res = await API.patch(`/api/users/${state.activeStaff?.id}/roles`, {
        roles: updatedRoles,
        user_id: state.activeStaff?.id
      });

      const { data } = res.data;
      setSelectedRoles([]);

      setState(prev => ({
        ...prev,
        staff: prev.staff.map(staff => staff.id === data?.id ? data : staff),
        showStaffRoleModal: false,

      }));

      return toast.success("User roles updated successfully");
    } catch (error) {
      toast.error(formatErrorsToString(error));
    } finally {
      setIsLoading(false);
    }
  }


  /* RENDERS THE ACTIVE STAFF TO THE SIDEBAR */
  const renderStaff = () => {
    if (!state.activeStaff) {
      return <h5>No Active selected</h5>;
    }

    const activeStaff = state.activeStaff;
    const statusText = activeStaff.created_at === activeStaff.updated_at
      ? "Need to change password"
      : "Password changed"
    const statusColor = activeStaff.created_at === activeStaff.updated_at
      ? DANGER
      : SUCCESS;

    return (
      <>
        <div className="mb-4">
          <Tag
            text={statusText}
            variant={statusColor}
          />
        </div>
        <h4>{formatName(activeStaff)}</h4>
        <h5>{activeStaff.email}</h5>
        <small className="d-block">
          <b>Staff Created At</b>{" "}
        </small>
        <div className={styles.status_container}>
          <small>{timestampToRegularTime(activeStaff.created_at)}</small>
        </div>
        <div>
          <small className="d-block">
            <strong>COE: </strong>
          </small>
          <small>
            {state.currentCoeDetails && `${state.currentCoeDetails.coe_name}`}
          </small>
        </div>
        <div >
          <small className="d-block">
            <strong>Phone Number:</strong>
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
          <Button text='Edit Staff' variant='success' onClick={() => setStateValue('showEditModal', true)} />
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

      loadStaff();
    }
  };


  const handleRequestToken = async () => {

    setStateValue('isUpdatingStaff', true)
    try {
      const res = await API.post('/api/token/create');
      setState(prevState => ({
        ...prevState,
        showEditModal: false,
        showRolesModal: false,
        showTokenModal: true,
      }))
      console.log(res)
      return dispatch(propagateAlert({
        variant: 'success',
        alert: res.data.message,
      }))
    } catch (e) {

      return dispatch(propagateAlert({
        variant: "danger",
        alert: formatErrors(e)
      }))
    } finally {
      setStateValue('isUpdatingStaff', false)
    }
  }

  const handleUpdateStaff = async () => {
    try {
      await API.post('/api/token/verify', {
        email: user.user.email,
        hash: state.verificationCode,
      })

      const res = await API.put(`/api/coeadmin/staff/${state.activeStaff.id}`, state.activeStaff);

      setStateValue('showTokenModal', false)
      return dispatch(propagateAlert({
        variant: 'success',
        alert: res.data.message
      }))
    } catch (e) {
      console.log(e.response)
      return dispatch(propagateAlert({
        variant: "danger",
        alert: formatErrors(e)
      }))
    }
  }

  return (
    <div>
      <div className={`container ${styles.coestaff_wrapper}`}>
        <div className={styles.coestaff_header}>
          <PageTitle
            title={
              state.currentCoeDetails &&
              `${state.currentCoeDetails.coe_name} Staff page`
            }
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
          <div className={styles.coestaff_table + " row mt-3"}>
            <div className={`col-md-9 `}>
              <MUIDataTable
                columns={COE_ADMIN_USERS_TABLE_COLUMNS}
                data={state.staff.map((staffData, index) => [
                  index + 1,
                  formatName(staffData),
                  staffData.email,
                  staffData.phone_number,
                  timestampToRegularTime(staffData.created_at),
                  staffData.status,
                  <Button
                    variant='success'
                    size='small'
                    onClick={() => handleShowStaffRoleModal(staffData)}
                  ><BsKey /> Roles</Button>,
                  <Button
                    variant='secondary'
                    onClick={() => handleStaffSelect(index)}
                    size='small'> Details</Button>,

                ])}
                options={{
                  elevation: 0,
                  selectableRows: 'none',
                  filter: 'false',
                }}
              />

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
        {state.addStaffForm === 1 ? (
          <AddUserForm
            formTitle="New Staff"
            coe_id={state.coe_id}
            handleSubmitStatus={handleSubmitStatus}
            handleSetNewStaff={handleSetNewStaff}
          />
        ) : state.addStaffForm === 2 ? (
          <NewCoeStaff
            staff={state.newStaff}
            cancel={cancelCreateStaff}
          />
        ) : (
          ""
        )}

        <p className="text-center mt-3">
          <small>New Staff Page: {state.addStaffForm}</small>
        </p>
      </div>

      {state.showEditModal && <Modal>
        <ModalHeader modalTitle="Edit Staff" onModalClose={() => setStateValue('showEditModal', false)} />
        <ModalBody>
          <Label label='Email' className='text-secondary' />
          <Input
            inputName="email"
            value={state.activeStaff.email}
            onChange={e => setActiveStaffValue(e.target.name, e.target.value)}
          />
          <Label label='First Name' className='text-secondary' />
          <Input
            inputName="first_name"
            value={state.activeStaff.first_name}
            onChange={e => setActiveStaffValue(e.target.name, e.target.value)}
          />
          <Label label='Last Name' className='text-secondary' />
          <Input
            inputName="last_name"
            value={state.activeStaff.last_name}
            onChange={e => setActiveStaffValue(e.target.name, e.target.value)}
          />
          <Label label='Phone Number' className='text-secondary' />
          <Input
            inputName="phone_number"
            value={state.activeStaff.phone_number}
            onChange={e => setActiveStaffValue(e.target.name, e.target.value)}
          />
          <Label label='Gender' className='text-secondary' />
          <Input
            inputName="gender"
            value={state.activeStaff.gender}
            onChange={e => setActiveStaffValue(e.target.name, e.target.value)}
          />
        </ModalBody>
        <ModalFooter style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            text={state.isUpdatingStaff ? "Please wait..." : "Update"}
            variant='success'
            disabled={state.isUpdatingStaff}
            className='mr-3'
            onClick={handleRequestToken} />

          <Button
            text='cancel'
            variant='secondary'
            disabled={state.isUpdatingStaff}
            onClick={() => setStateValue('showEditModal', false)} />
        </ModalFooter>
      </Modal>}

      {state.showTokenModal && <Modal>
        <ModalHeader modalTitle="Verification token" onModalClose={() => setStateValue('showTokenModal', false)} />
        <ModalBody>
          <Label label='You need to verify your email to update staff information. A verification code has been sent to you email address. ' className='mb-3' />
          <Label label='Verification Code' className='text-secondary' />
          <Input
            inputName="verificationCode"
            value={state.verificationCode}
            onChange={(e) => setStateValue(e.target.name, e.target.value)}
          />
        </ModalBody>
        <ModalFooter style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            text={state.isUpdatingStaff ? "please wait..." : "Update"}
            variant='success'
            onClick={handleUpdateStaff}
            disabled={state.isUpdatingStaff}
            className='mr-3' />
          <Button
            text='cancel'
            variant='secondary'
            disabled={state.isUpdatingStaff}
            onClick={() => setStateValue('showTokenModal', false)} />
        </ModalFooter>
      </Modal>}

      {state.showStaffRoleModal && <Modal>
        <ModalHeader modalTitle={`Edit Role for ${state.activeStaff?.last_name} ${state.activeStaff?.first_name} `} onModalClose={() => setStateValue('showStaffRoleModal', false)} />
        <ModalBody>
          <MUIDataTable
            columns={['role']}
            options={{
              filter: false,
              elevation: 0,
              download: false,
              search: false,
              print: false,
              viewColumns: false,
              pagination: false,
              rowsSelected: selectedRoles,
              onRowSelectionChange: (crs, ars, rs) => {
                return setSelectedRoles(rs);
              }
            }}
            data={state.assignableRole.map((role) => [
              role.role,
            ])}
          />
        </ModalBody>
        <ModalFooter style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            text={isLoading ? "please wait..." : "Update"}
            variant='success'
            onClick={handleUpdateUserRoles}
            disabled={isLoading}
            loading={isLoading}
            className='mr-3' />
          <Button
            text='cancel'
            variant='secondary'
            disabled={isLoading}
            onClick={() => setStateValue('showStaffRoleModal', false)} />
        </ModalFooter>
      </Modal>}
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
  };
};

export default connect(mapStateToProps)(CoeStaff);
