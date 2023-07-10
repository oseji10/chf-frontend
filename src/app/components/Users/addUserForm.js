import styles from "./../../pages/superadmin/coe/coe.module.scss";
import { useState, useEffect } from "react";
import { Form, Col } from "react-bootstrap";
import {Button} from "../";
import MessageAlert from "../message/messageAlert";
import API from "../../config/chfBackendApi";
import { errorHandler, formatErrors } from "../../utils/error.utils";
import { isEmail } from "../../utils/validation.uitls";
import { successAlert } from "../../utils/alert.util";

const initialState = {
  alert: { message: "", variant: "" },
  roles: [],
  submitText: "Submit",
  role_id: "",
  email: "",
  first_name: "",
  last_name: "",
  other_names: "",
  profession: "",
  phone_number: "",
  gender: "",
  date_of_birth: "",
  coe_id: null,
  errors: {},
};
function AddUserForm({
  formTitle,
  coe_id,
  handleSubmitStatus,
  handleSetNewStaff,
}) {
  const [state, setState] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    try {
      const res = await API.get(`/api/parent/roles`);
      
      setState((prevState) => ({
        ...prevState,
        roles: res.data.data,
        coe_id: coe_id !== undefined ? coe_id : null,
      }));
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    try {
      loadData();
    } catch (e) {}
  }, [state.loadedState, coe_id]);

  const findFormErrors = () => {
    const newErrors = {};
    // email
    if (!state.email || !isEmail(state.email)) newErrors.email = " Please provide a valid email";

    // // date_of_birth
    if (!state.date_of_birth)
      newErrors.date_of_birth = "Please provide a date of birth!";

    // phone_number
    if (
      state.phone_number.trim().length < 11 ||
      state.phone_number.trim().length > 11
    )
      newErrors.phone_number = "Phone number must be 11 digits";

    // first_name
    if (state.first_name.trim().length < 2)
      newErrors.first_name = "Please provide a first name for staff";

    // last_
    if (state.last_name.trim().length < 2)
      newErrors.last_name = "Please provide a last name for staff";

    // gender
    if (!state.gender) newErrors.gender = "Please choose a gender";

    // role
    if (!state.role_id) newErrors.role_id = "Please provide a user role";
    setErrors(newErrors);
    return newErrors;
  };

  const setErrors = (newErrors) => {
    setState((prev) => ({
      ...prev,
      errors: newErrors,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    handleAlert({});
    // Find errors
    const newErrors = findFormErrors();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }
    setIsLoading(true);
    const newUser = {
      role_id: state.role_id,
      email: state.email,
      first_name: state.first_name,
      last_name: state.last_name,
      other_names: state.other_names,
      profession: state.profession,
      phone_number: state.phone_number,
      gender: state.gender,
      date_of_birth: state.date_of_birth,
      coe_id: state.coe_id,
    };

    
    try {
      const res = await API.post(`/api/users`, newUser);

        if (undefined !== handleSetNewStaff) {
          handleSetNewStaff(res.data.data);
        }
      return successAlert("New user created successfully");
    } catch (error) {

      errorHandler(error);
    }finally{
      setIsLoading(false)
    }

  };

  const handleFormData = (e) => {
    e.preventDefault();
    setField(e.target.name, e.target.value);
  };

  const setField = (field, value) => {
    setState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAlert = (value) => {
    setState((prevState) => ({
      ...prevState,
      alert: value,
    }));
  };
  return (
    <div className="row">
      <div className={`col-md-2`}></div>
      <div className={`col-md-8 shadow-sm mt-5 ` + styles.selected_coehelpdesk}>
        <h4 className="mt-3">
          <strong>{formTitle !== undefined ? formTitle : `Add User`}</strong>
        </h4>
        <Form className="mt-4 py-3" onSubmit={handleSubmit}>
          <Form.Row>
            <Form.Group as={Col} md={12} sm={12}>
              <Form.Label>Select User role</Form.Label>
              <select
                className="custom-select"
                id="role_id"
                defaultValue={state.role_id}
                name="role_id"
                onChange={handleFormData}
              >
                <option value="">
                  {state.roles.length ? "Select user role" : "please wait..."}
                </option>
                {state.roles.map((role) => {
                  return (
                    <option key={`role_${role.id}`} value={role.id}>
                      {role.role}
                    </option>
                  );
                })}
              </select>

              <Form.Text className="text-danger mt-3">
                <small>{state.errors.role_id}</small>
              </Form.Text>
            </Form.Group>
          </Form.Row>
          <Form.Row>
            <Form.Group as={Col} md={6} sm={12}>
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="email"
                id="email"
                name="email"
                defaultValue={state.email}
                onBlur={handleFormData}
              />
              <Form.Text className="text-danger mt-3">
                <small>{state.errors.email}</small>
              </Form.Text>
            </Form.Group>
            <Form.Group as={Col} md={6} sm={12}>
              <Form.Label>Phone number</Form.Label>
              <input
                className="form-control"
                id="phone_number"
                name="phone_number"
                defaultValue={state.phone_number}
                onChange={handleFormData}
              />

              <Form.Text className="text-danger mt-3">
                <small>{state.errors.phone_number}</small>
              </Form.Text>
            </Form.Group>
          </Form.Row>
          <Form.Row>
            <Form.Group as={Col} md={6} sm={12}>
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="First name"
                id="first_name"
                name="first_name"
                defaultValue={state.first_name}
                onBlur={handleFormData}
              />
              <Form.Text className="text-danger mt-3">
                <small>{state.errors.first_name}</small>
              </Form.Text>
            </Form.Group>
            <Form.Group as={Col} md={6} sm={12}>
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Last name"
                id="last_name"
                name="last_name"
                defaultValue={state.last_name}
                onBlur={handleFormData}
              />
              <Form.Text className="text-danger mt-3">
                <small>{state.errors.last_name}</small>
              </Form.Text>
            </Form.Group>
          </Form.Row>
          <Form.Row>
            <Form.Group as={Col} md={6} sm={12}>
              <Form.Label>Other Names (optional)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Other names"
                id="other_names"
                name="other_names"
                defaultValue={state.other_names}
                onBlur={handleFormData}
              />
            </Form.Group>
            <Form.Group as={Col} md={6} sm={12}>
              <Form.Label>Profession (optional)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Profession"
                id="profession"
                name="profession"
                defaultValue={state.profession}
                onBlur={handleFormData}
              />
            </Form.Group>
          </Form.Row>
          <Form.Row>
            <Form.Group as={Col} md={6} sm={12}>
              <Form.Label>Date of Birth</Form.Label>
              <input
                className="form-control"
                type="date"
                placeholder="dd-mm-yyyy"
                id="date_of_birth"
                name="date_of_birth"
                defaultValue={state.date_of_birth}
                onBlur={handleFormData}
              />
              <Form.Text className="text-danger mt-3">
                <small>{state.errors.date_of_birth}</small>
              </Form.Text>
            </Form.Group>

            <Form.Group as={Col} md={6} sm={12}>
              <Form.Label>Gender</Form.Label>
              <select
                className="custom-select"
                id="gender"
                name="gender"
                value={state.gender}
                onChange={handleFormData}
              >
                <option value="">-- Select gender --</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <Form.Text className="text-danger mt-3">
                <small>{state.errors.gender}</small>
              </Form.Text>
            </Form.Group>
          </Form.Row>
          {state.alert.message && (
            <MessageAlert
              alertMessage={state.alert.message}
              alertVariant={state.alert.variant}
              alertLink={{}}
            />
          )}
          <Form.Group className="d-flex flex-row justify-content-center">
            <Button
              text="Create Staff"
              variant='success'
              className="btn btn-success py-2 px-3"
              type="submit"
              loading={isLoading}
            />
          </Form.Group>
        </Form>
      </div>
      <div className={`col-md-2`}></div>
    </div>
  );
}

export default AddUserForm;
