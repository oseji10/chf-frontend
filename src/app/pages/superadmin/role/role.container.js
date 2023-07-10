/* eslint-disable no-unused-vars */
/* eslint-disable no-script-url */

import React, { useEffect, useState } from "react";
import Button from "../../../components/button";
import API from "../../../config/chfBackendApi";
import styles from "./role.module.scss";
import Input from "../../../components/form/input";
import TextArea from "../../../components/form/textarea";
import Modal from "../../../components/modal/modal";
import ModalFooter from "../../../components/modal/modalFooter";
import ModalBody from "../../../components/modal/modalBody";
import ModalHeader from "../../../components/modal/modalHeader";
import PageTitle from "../../../components/pageTitle/pageTitle";
import { useDispatch, useSelector } from "react-redux";
import { propagateAlert } from "../../../redux/alertActions";
import { formatErrors } from "../../../utils/error.utils";

const initial_state = {
  activeRole: 1,
  roles: [],
  permissions: [],
  newRoleTitle: "",
  newRoleDescription: "",
  newPermission: "",
  newRoleParent: "",
  deleteRole: null,
  isAddPermission: false,
  isAttachRoleParent: false,
  roleParentToAttach: "",
  roleToAttachParent: null,
  roleParentAttachMessage: "",
};

function RoleContainer() {
  const dispatch = useDispatch();

  const [state, setState] = useState(initial_state);

  const loadRoles = async () => {
    try {
      // const res = await API.get('/api/roles');
      const res = await Promise.all([
        API.get("/api/roles"),
        API.get("/api/permissions"),
      ]);
      // console.log(res.data);
      setState((prevState) => ({
        ...prevState,
        roles: res[0].data.data,
        permissions: res[1].data.data,
      }));
    } catch (e) {
      console.log(e.response);
    }
  };

  let pageLoaded = false;
  useEffect(() => {
    loadRoles();
    // console.log(state)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    pageLoaded = true;
  }, [pageLoaded]);

  /* SET THE ACTIVE ROLE TO SELECTED ROLE TO ACTIVATE DROPDOWN */
  const handleRoleClick = (role_id) => {
    setState((prevState) => ({
      ...prevState,
      activeRole: role_id,
    }));
  };

  /* DETACH A PERMISSION FROM A ROLE */
  const handleDetachPermission = async (permission_id) => {
    try {
      const res = await API.delete(
        `/api/roles/${state.activeRole}/permissions/${permission_id}`
      );
      setState((prevState) => ({
        ...prevState,
        roles: prevState.roles.map((role) =>
          role.id === prevState.activeRole ? res.data.data : role
        ),
      }));

      return dispatch(propagateAlert({
        variant: 'success',
        alert: "Permission has been detached from the role.",
      }));

    } catch (e) {
      console.log(e.response);
    }
  };

  const handleAttachPermission = async (permission_id) => {
    try {
      const res = await API.post(
        `/api/roles/${state.activeRole}/permissions/${permission_id}`
      );
      setState((prevState) => ({
        ...prevState,
        roles: prevState.roles.map((role) =>
          role.id === prevState.activeRole ? res.data.data : role
        ),
      }));

      return dispatch(propagateAlert({
        variant: 'success',
        alert: "Permission has been attached to role.",
      }));

    } catch (e) {
      return dispatch(propagateAlert({
        variant: "danger",
        alert: formatErrors(e)
      }))
      console.log(e.response);
    }
  };

  const handleInputChange = (e) => {
    setState((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/api/roles", {
        role: state.newRoleTitle,
        description: state.newRoleDescription,
        parentRole: state.newRoleParent,
      });
      console.log("Added role ", res.data);
      setState((prevState) => ({
        ...prevState,
        newRoleTitle: "",
        newRoleDescription: "",
        roles: [res.data.data, ...prevState.roles],
      }));
    } catch (e) { }
  };

  const handleDeleteRole = (role_id) => {
    setState((prevState) => ({
      ...prevState,
      deleteRole: role_id,
    }));
  };

  const handleCompleteDeleteRole = () => {
    try {
      const res = API.delete(`/api/roles/${state.deleteRole}`);
      setState((prevState) => ({
        ...prevState,
        roles: prevState.roles.filter(
          (role) => role.id !== prevState.deleteRole
        ),
        deleteRole: null,
      }));
    } catch (e) {
      console.log(e.response);
    }
  };

  const handleCancelDeleteRole = () => {
    setState((prevState) => ({
      ...prevState,
      deleteRole: null,
    }));
  };

  const handleAddPermissionModel = (value) => {
    setState((prevState) => ({
      ...prevState,
      isAddPermission: value,
    }));
  };

  const handleAddPermission = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/api/permissions", {
        permission: state.newPermission,
      });
      setState((prevState) => ({
        ...prevState,
        newPermission: "",
        permissions: [res.data.data, ...prevState.permissions],
        isAddPermission: false,
      }));
    } catch (e) {
      console.log(e);
    }
  };
  const handleAttachRoleParentModal = (role = null, value) => {
    setState((prevState) => ({
      ...prevState,
      isAttachRoleParent: value,
      roleToAttachParent: role ? role : null,
      roleParentAttachMessage: "",
    }));
  };

  const handleAttachParentToRole = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/api/roles/parent", {
        role_id: state.roleToAttachParent.id,
        parent_role_id: state.roleParentToAttach,
      });
      setState((prevState) => ({
        ...prevState,
        roleParentAttachMessage: "Parent attached to role",
        roleToAttachParent: res.data.data,
      }));
    } catch (e) {
      console.log(e);
    }
  };

  const handleDetachRoleParent = async (parentId, roleId) => {
    try {
      const res = await API.delete(`/api/parent/roles/${parentId}/${roleId}`);
      setState((prevState) => ({
        ...prevState,
        roleParentAttachMessage: "Parent dettached from role",
        roleToAttachParent: res.data.data,
      }));
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <>
      <div className={`container`}>
        <div className="row">
          <div className="col-12">
            <PageTitle title="Roles" icon="fa fa-cogs" />
          </div>
          <div className={[styles.side_permissions, `col-md-3`].join(" ")}>
            <p className={styles.role}>
              <strong>Available Permissions</strong>{" "}
              <span
                className="right btn btn-success"
                onClick={() => {
                  handleAddPermissionModel(true);
                }}
              >
                <i className="fa fa-plus"></i>
              </span>
            </p>
            {state.permissions &&
              state.permissions.map((permission) => (
                <span
                  key={permission.id}
                  className={styles.side_permission_item}
                >
                  {permission.permission.replace("_", " ")}
                  <span
                    onClick={() => handleAttachPermission(permission.id)}
                  >
                    Assign
                  </span>
                </span>
              ))}
          </div>
          <div className={`col-md-6 bg-light shadow-sm p-3`}>
            {state.roles &&
              state.roles.map((role, index) => (
                <div
                  key={index}
                  className={[
                    styles.role,
                    state.activeRole === role.id ? styles.active : null,
                  ].join(" ")}
                >
                  <div>
                    <a
                      onClick={() => handleRoleClick(role.id)}
                      href="javascript:;"
                    >
                      {role.role}
                    </a>
                  </div>
                  <div>
                    <span
                      className={[styles.badge, styles.badge_success].join(" ")}
                    >
                      {role.permissions.length}
                    </span>
                    <span
                      className={[styles.badge, styles.badge_success].join(" ")}
                      onClick={() => {
                        handleAttachRoleParentModal(role, true);
                      }}
                    >
                      <i className="fa fa-cog"></i>
                    </span>
                    <a
                      href="javascript:;"
                      onClick={() => handleDeleteRole(role.id)}
                      className={[styles.badge, styles.badge_danger].join(" ")}
                    >
                      x{" "}
                    </a>
                  </div>
                  <div className={styles.permissions}>
                    {role.permissions &&
                      role.permissions.map((permission, index) => (
                        <span key={index} className={styles.permission_item}>
                          {" "}
                          {permission.permission}{" "}
                          <a
                            href="javascript:;"
                            onClick={() =>
                              handleDetachPermission(permission.id)
                            }
                          >
                            x
                          </a>{" "}
                        </span>
                      ))}
                  </div>
                </div>
              ))}
          </div>
          <div className={`col-md-3 bg`}>
            <h5>Create Role</h5>
            <form onSubmit={handleCreateRole}>
              <div className="form-group">
                <Input
                  value={state.newRoleTitle}
                  placeholder={"Role title"}
                  classes={"form-control"}
                  label="Role title"
                  inputName={`newRoleTitle`}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <TextArea
                  value={state.newRoleDescription}
                  classes={""}
                  label={"Role Description"}
                  placeholder={`Role Description`}
                  onChange={handleInputChange}
                  inputName={`newRoleDescription`}
                />
              </div>
              <div className="form-group">
                <select
                  className={"form-control"}
                  onChange={handleInputChange}
                  name="newRoleParent"
                  id="newRoleParent"
                >
                  <option value="">Select parent role</option>
                  {state.roles.map((role) => {
                    return (
                      <option key={`role_${role.id}`} value={role.id}>
                        {role.role}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="form-group">
                <Button
                  onClick={handleCreateRole}
                  value="Create"
                  btnClass="btn btn-success btn-sm"
                />
              </div>
            </form>
          </div>
        </div>
      </div>

      {state.deleteRole && (
        <Modal>
          <ModalFooter>
            <p>Are you sure you want to delete this role?</p>
            <button
              className="btn btn-sm btn-danger mr-4"
              onClick={handleCompleteDeleteRole}
            >
              Delete
            </button>
            <button
              className="btn btn-sm btn-secondary"
              onClick={handleCancelDeleteRole}
            >
              Cancel
            </button>
          </ModalFooter>
        </Modal>
      )}

      {state.isAddPermission && (
        <Modal>
          <ModalHeader
            modalTitle="New Permission"
            onModalClose={() => {
              handleAddPermissionModel(false);
            }}
          ></ModalHeader>
          <ModalBody>
            <form>
              <div className="form-group">
                <Input
                  value={state.newPermission}
                  placeholder={"Permission"}
                  classes={"form-control"}
                  label="Permission"
                  inputName={`newPermission`}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <Button
                  onClick={handleAddPermission}
                  value="Add"
                  btnClass="btn btn-success btn-sm"
                />
              </div>
            </form>
          </ModalBody>
        </Modal>
      )}
      {state.isAttachRoleParent && (
        <Modal>
          <ModalHeader
            modalTitle="Attach parent to role"
            onModalClose={() => {
              handleAttachRoleParentModal(false);
            }}
          ></ModalHeader>
          <ModalBody>
            <form onSubmit={handleCreateRole}>
              <div className="form-group">
                <select
                  className={"form-control"}
                  onChange={handleInputChange}
                  name="roleParentToAttach"
                  id="roleParentToAttach"
                >
                  <option value="">Select parent role</option>
                  {state.roles.map((role) => {
                    return (
                      <option key={`role_${role.id}`} value={role.id}>
                        {role.role}
                      </option>
                    );
                  })}
                </select>
              </div>
              <p className="text-success">{state.roleParentAttachMessage}</p>
              <div className="form-group">
                <Button
                  onClick={handleAttachParentToRole}
                  value="Attach"
                  btnClass="btn btn-success btn-sm"
                />
              </div>
            </form>
          </ModalBody>
          <ModalFooter>
            <div className={[styles.role, styles.active].join(" ")}>
              <div className={styles.permissions}>
                <p><em>Role Parents</em></p>
                {state.roleToAttachParent &&
                  state.roleToAttachParent.role_parents &&
                  state.roleToAttachParent.role_parents.map((parent) => {
                    return (
                      <span
                        key={parent.id}
                        className={styles.permission_item}
                      >
                        {" "}
                        {
                          state.roles.filter(
                            (role) => role.id === parent.parent_role_id
                          )[0].role
                        }{" "}
                        <span

                          onClick={() =>
                            handleDetachRoleParent(parent.id, parent.role_id)
                          }
                        >
                          x
                        </span>
                      </span>
                    );
                  })}
              </div>
            </div>
          </ModalFooter>
        </Modal>
      )}
    </>
  );
}

export default RoleContainer;
