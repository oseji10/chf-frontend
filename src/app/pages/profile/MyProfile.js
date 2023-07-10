/* eslint-disable react-hooks/exhaustive-deps */
import userIcon from "./../../../assets/images/user-icon.png";
import styles from "./profile.module.scss";
import { connect } from "react-redux";
import { useEffect, useState } from "react";
import Button from "../../components/button";
import API from "../../config/chfBackendApi";
import { Form, Col } from "react-bootstrap";
import Modal from "../../components/modal/modal";
import ModalFooter from "../../components/modal/modalFooter";
import { formatErrors } from "../../utils/error.utils";
import MessageAlert from "../../components/message/messageAlert";
import { bindActionCreators } from "redux";
import { setLoggedInUserProfile } from "../../redux/auth.action";
import ProfileChangePassword from "./ChangePassword";

function MyProfile({ user, setLoggedInUserProfile }) {
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({
    mode: "view",
    coe: null,
    coe_id: "",
    isPatient: false,
    formData: {
      first_name: "",
      last_name: "",
      other_names: "",
      date_of_birth: "",
      gender: "",
      phone_number: "",
    },
    msg: null,
    msgVariant: "info",
    showModal: false,
  });

  const getUserCoe = (isPatient) => {
    const coe_id = isPatient ? user.user.patient.coe_id : user.user.coe_id;
    API.get(`/api/coes/${coe_id}`)
      .then((res) => {
        setState((prev) => ({
          ...prev,
          coe: res.data.data,
          isPatient: isPatient,
          coe_id: user.user.coe_id,
        }));
      })
      .catch((e) => {});
  };

  let loadedState = false;
  useEffect(() => {
    try {
      state.formData.first_name = user.user.first_name;
      state.formData.last_name = user.user.last_name;
      state.formData.other_names = user.user.other_names;
      state.formData.gender = user.user.gender;
      state.formData.phone_number = user.user.phone_number;
      state.formData.date_of_birth = user.user.date_of_birth;

      if (user.user.patient) {
        getUserCoe(true);
      } else if (user.user.coe_id) {
        getUserCoe(false);
      }
      return (loadedState = true);
    } catch (e) {
      // console.log(e.response);
    }
  }, [loadedState]);

  const toggleMode = (mode) => {
    setState((prev) => ({
      ...prev,
      msg: null,
      msgVariant: "",
      mode: mode,
    }));
  };

  const setShowModal = (value) => {
    setState((prev) => ({
      ...prev,
      showModal: value,
    }));
  };

  const findFormErrors = () => {
    const { first_name, last_name, phone_number, gender, date_of_birth } =
      state.formData;

    const newErrors = {};

    // date_of_birth
    if (!date_of_birth)
      newErrors.date_of_birth = "Please choose a date of birth!";

    // phone_number
    if (phone_number.trim().length < 11 || phone_number.trim().length > 11)
      newErrors.phone_number = "Phone number must be 11 digits";

    // first_name
    if (first_name.trim().length < 2)
      newErrors.first_name = "Please provide a first name of coe admin";

    // last_
    if (last_name.trim().length < 2)
      newErrors.last_name = "Please provide a last name of coe admin";

    // gender
    if (!gender) newErrors.gender = "Please choose a gender";

    setErrors(newErrors);
    return newErrors;
  };

  const handleFormData = (e) => {
    e.preventDefault();
    setField(e.target.name, e.target.value);
  };

  const setField = (field, value) => {
    setState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: value,
      },
    }));
  };
  const handleEditProfile = (e) => {
    e.preventDefault();

    // Get errors
    const newErrors = findFormErrors();

    // Conditional logic:
    if (Object.keys(newErrors).length > 0) {
      // We got errors!
      setErrors(newErrors);
      return false;
    }

    API.put(`/api/profile`, state.formData)
      .then((response) => {
        setLoggedInUserProfile(response.data.data);
        setState((prev) => ({
          ...prev,
          msg: "Profile updated.",
          msgVariant: "success",
        }));
      })
      .catch((err) => {
        setState((prev) => ({
          ...prev,
          msg: formatErrors(err)[0],
          msgVariant: "danger",
        }));
      });
  };
  return (
    <div>
      {user && (
        <div className={`container`}>
          <div className="row">
            <div className="col-sm-12 mt-5"></div>
            {/* Column left */}
            <div className="col-md-2"></div>

            <div className={[styles.side_options, `col-md-3`].join(" ")}>
              <img
                src={userIcon}
                className="img-fluid rounded"
                alt="user-icon"
                width="70"
              />
              <p className={styles.option}>
                <strong>{user.user.email}</strong>
              </p>
              {state.isPatient && user.user.patient.application_review && (
                <p>
                  <strong>
                      CHF id:{" "}
                      {user.user.patient.hasOwnProperty("chf_id") &&
                        `${user.user.patient.chf_id}`}
                  </strong>
                </p>
              )}

              <p>
                <strong>
                  Phone no: {`${user.user.phone_number}`}
                </strong>
              </p>
              <hr />
              {user.user.patient && user.user.patient.ailment_id && (
                <p className={styles.option}>
                  <small className={styles.side_option_item}>
                    <span
                      onClick={() => {
                        toggleMode("edit");
                      }}
                    >
                      Edit Profile
                    </span>{" "}
                    <i className="fa fa-edit"></i>
                  </small>
                </p>
              )}
              {!user.user.patient && (
                <p className={styles.option}>
                  <small className={styles.side_option_item}>
                    <span
                      onClick={() => {
                        toggleMode("edit");
                      }}
                    >
                      Edit Profile
                    </span>{" "}
                    <i className="fa fa-edit"></i>
                  </small>
                </p>
              )}

              <p className={styles.option}>
                <small className={styles.side_option_item}>
                  <span
                    onClick={() => {
                      toggleMode("password");
                    }}
                  >
                    Change Password
                  </span>{" "}
                  <i className="fa fa-edit"></i>
                </small>
              </p>
            </div>

            {/* Column center */}
            <div className={`col-md-6 bg-light shadow-sm p-3`}>
              <div
                className={
                  state.mode === "view"
                    ? `${styles.option}  ${styles.show}`
                    : `${styles.option}  ${styles.hide}`
                }
                id="view"
              >
                <div>
                  <span>First name: {user.user.first_name} </span>
                </div>

                <div>
                  <span>Last name: {user.user.last_name} </span>
                </div>

                {user.user.gender && (
                  <div>
                    <span>Gender: {user.user.gender}</span>
                  </div>
                )}

                {user.user.date_of_birth && (
                  <div>
                    <span>Date of birth: {user.user.date_of_birth}</span>
                  </div>
                )}

                {user.user.address && (
                  <div>
                    <span>Address: {user.user.address}</span>
                  </div>
                )}
                <hr />
                <p>
                  <span className="text-info">
                    Date Signup:{" "}
                    {new Date(user.user.created_at).toLocaleDateString()}
                  </span>
                </p>
                <p>
                  <span className="text-info">
                    Account status:{" "}
                    {user.user.email_verified_at && <span>Verified</span>}
                  </span>
                </p>
                <div className={state.coe ? styles.show : styles.hide}>
                  <p className={styles.option}>
                    <strong>
                      {state.isPatient
                        ? `Primary Center of Excellence (COE)`
                        : `Center of Excellentce (COE)`}
                    </strong>
                    <br />
                    {state.coe && (
                      <strong className="text-info">
                        {state.coe.coe_name}
                      </strong>
                    )}
                    <br />
                    {state.coe && (
                      <strong>
                        <small>{state.coe.coe_address}</small>
                      </strong>
                    )}
                  </p>
                </div>
              </div>
              <form
                id="edit"
                onSubmit={handleEditProfile}
                className={
                  state.mode === "edit"
                    ? `px-4 ${styles.option} ${styles.show}`
                    : `px-5 ${styles.option}  ${styles.hide}`
                }
              >
                <h4>
                  <strong>Edit Profile</strong>
                </h4>
                <Form.Row>
                  <Form.Group as={Col} md={6} sm={12}>
                    <Form.Label>First name</Form.Label>
                    <Form.Control
                      type="text"
                      id="first_name"
                      name="first_name"
                      defaultValue={user.user.first_name}
                      onBlur={handleFormData}
                    />
                    <Form.Text className="text-danger mt-3">
                      {errors.first_name && (
                        <span>Please enter a valid name</span>
                      )}
                    </Form.Text>
                  </Form.Group>

                  <Form.Group as={Col} md={6} sm={12}>
                    <Form.Label>Last name</Form.Label>
                    <Form.Control
                      type="text"
                      id="last_name"
                      name="last_name"
                      defaultValue={user.user.last_name}
                      onBlur={handleFormData}
                    />
                    <Form.Text className="text-danger mt-3">
                      {errors.last_name && (
                        <span>Please enter a valid name</span>
                      )}
                    </Form.Text>
                  </Form.Group>
                </Form.Row>
                <Form.Row>
                  <Form.Group as={Col} md={6} sm={12}>
                    <Form.Label>Other names</Form.Label>
                    <Form.Control
                      type="text"
                      id="other_names"
                      name="other_names"
                      defaultValue={user.user.other_names}
                      onBlur={handleFormData}
                    />
                    <Form.Text className="text-danger mt-3">
                      {errors.other_names && <span>Please enter a name</span>}
                    </Form.Text>
                  </Form.Group>
                  <Form.Group as={Col} md={6} sm={12}>
                    <Form.Label>Date of birth</Form.Label>
                    <Form.Control
                      type="date"
                      id="date_of_birth"
                      name="date_of_birth"
                      defaultValue={user.user.date_of_birth}
                      onBlur={handleFormData}
                    />
                    <Form.Text className="text-danger mt-3">
                      {errors.date_of_birth && <span>Please pick a date</span>}
                    </Form.Text>
                  </Form.Group>
                </Form.Row>
                <Form.Row>
                  <Form.Group as={Col} md={6} sm={12}>
                    <Form.Label>Gender</Form.Label>
                    <select
                      className="custom-select"
                      id="gender"
                      name="gender"
                      defaultValue={user.user.gender}
                      onBlur={handleFormData}
                    >
                      <option value="">-- gender --</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                    </select>
                    <Form.Text className="text-danger mt-3">
                      {errors.gender && <span>Choose a gender</span>}
                    </Form.Text>
                  </Form.Group>
                  <Form.Group as={Col} md={6} sm={12}>
                    <Form.Label>Phone number</Form.Label>
                    <Form.Control
                      type="number"
                      id="phone_number"
                      name="phone_number"
                      defaultValue={user.user.phone_number}
                      onBlur={handleFormData}
                    />
                    <Form.Text className="text-danger mt-3">
                      {errors.phone_number && (
                        <span>Please enter a valid number</span>
                      )}
                    </Form.Text>
                  </Form.Group>
                </Form.Row>
                {state.msg && (
                  <MessageAlert
                    alertMessage={state.msg}
                    alertVariant={state.msgVariant}
                    alertLink={{}}
                  />
                )}
                <div className="form-group">
                  <Button
                    type="submit"
                    value="Edit"
                    btnClass="btn btn-success btn-sm mr-3"
                    onClick={handleEditProfile}
                  />
                  <Button
                    type="button"
                    value="Close"
                    btnClass="btn btn-success btn-sm"
                    onClick={() => {
                      toggleMode("view");
                    }}
                  />
                </div>
              </form>
              <div
                id="password"
                onSubmit={handleEditProfile}
                className={
                  state.mode === "password"
                    ? `px-4 ${styles.option} ${styles.show}`
                    : `px-5 ${styles.option}  ${styles.hide}`
                }
              >
                <ProfileChangePassword
                  email={user.user.email}
                  setParentMode={toggleMode}
                />
              </div>
            </div>

            {/* Right column */}
            <div className={`col-md-1 bg`}></div>
            {state.showModal && (
              <Modal>
                <ModalFooter>
                  <p></p>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                </ModalFooter>
              </Modal>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
  };
};

const matchDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      setLoggedInUserProfile,
    },
    dispatch
  );
};

export default connect(mapStateToProps, matchDispatchToProps)(MyProfile);
