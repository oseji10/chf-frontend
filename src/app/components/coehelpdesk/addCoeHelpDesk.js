import styles from "./../../pages/superadmin/coe/coe.module.scss";
import { useState, useEffect } from "react";
import { Form, Col } from "react-bootstrap";
import Button from "../button";
import MessageAlert from "../message/messageAlert";
import API from "../../config/chfBackendApi";
import { formatErrors } from "../../utils/error.utils";

const initialState = {
  alert: { message: "", variant: "" },
  geoPoliticalZones: [],
  states: [],
  coes: [],
  loadedState: false,
  formData: {
    email: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    gender: "",
    date_of_birth: "",
    coe_id:"",
  }
};
function AddCOEHelpDesk({ setParentCOES, coeId }) {
  const [state, setState] = useState(initialState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    try {
      setTimeout(async () => {
        const res = await API.get(`/api/coes`);
        
        if(setParentCOES!==undefined){
          setParentCOES(res.data.data);
        }  
        setState((prevState) => ({
          ...prevState,
          coes: res.data.data,
          loadedState: true,
          formData:{
            ...prevState.formData,
            coe_id:coeId!==undefined?coeId:""
          }
        })); 
      });
    } catch (e) {}
  }, [state.loadedState]);

  const findFormErrors = () => {
    const {
      email,
      first_name,
      last_name,
      phone_number,
      gender,
      coe_id,
      date_of_birth,
    } = state.formData;
    const newErrors = {};
    // email
    if (!email) newErrors.email = " Please provide a valid email";

    // // date_of_birth
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

    // coe_id
    if (!coeId && !coe_id) newErrors.coe_id = "Please choose a coe name";

    // gender
    if (!gender) newErrors.gender = "Please choose a gender";

    setErrors(newErrors);
    return newErrors;
  };


  const handleSubmit = (e) => {
    window.scrollTo(150, 0);
    e.preventDefault();

    // Get errors
    const newErrors = findFormErrors();

    // Conditional logic:
    if (Object.keys(newErrors).length > 0) {
      // We got errors!
      setErrors(newErrors);
      return false;
    }
    handleAlert({ message: "sending request", variant: "info" });
    console.log(state.formData);
    API.post(`/api/sadmin/coehelpdeskstaffs`, state.formData)
      .then(async (response) => {
        handleAlert({
          message: "COE help desk staff Created",
          variant: "success",
        });

        setTimeout(() => {
          handleAlert({ message: "", variant: "" });
          state.loadedState = false;
        }, 3000);
      })
      .catch((err) => {
        handleAlert({ message: formatErrors(err), variant: "danger" });
      });
  };

  const handleFormData = (e) => {
    e.preventDefault();
    setField(e.target.name, e.target.value);
  };

  const setField = (field, value) => {
    setState(prev=>({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: value,
      }   
    }));
  };

  const handleAlert = (msg) => {
    setState((prevState) => ({
      ...prevState,
      alert: msg,
    }));
  };
  return (
    <div className="row">
      <div className={`col-md-2`}></div>
      <div className={`col-md-8 shadow-sm mt-5 ` + styles.selected_coehelpdesk}>
        <h4 className="mt-3">
          <strong>New COE Help Desk Staff</strong>
        </h4>
        {state.alert.message ? (
          <MessageAlert
            alertMessage={state.alert.message}
            alertVariant={state.alert.variant}
            alertLink={{}}
          />
        ) : (
          ``
        )}
        <Form className="mt-4" onSubmit={handleSubmit}>
          <Form.Row>
            <Form.Group as={Col} md={12} sm={12}>
              <Form.Label>COE</Form.Label>
              {coeId?
              <select
                className="custom-select"
                id="coe_id"
                value={coeId}
                name="coe_id"
                disabled
              >
                {state.coes.map((coe, index) => {
                  return (
                    <option
                      key={`coe_${coe.id}`}
                      value={`${coe.id}`}
                    >
                      {coe.coe_name}
                    </option>
                  );
                })}
              </select>
              :<select
                className="custom-select"
                id="coe_id"
                name="coe_id"
                onChange={handleFormData}
              >
                <option value="">-- Select COE of help desk staff --</option>
                {state.coes.map((coe, index) => {
                  return (
                    <option
                      key={`coe_${coe.id}`}
                      value={`${coe.id}`}
                    >
                      {coe.coe_name}
                    </option>
                  );
                })}
              </select>}
              <Form.Text className="text-danger mt-3">
                <small>{errors.coe_id}</small>
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
                defaultValue={state.formData.email}
                onBlur={handleFormData}
              />
              <Form.Text className="text-danger mt-3">
                <small>{errors.email}</small>
              </Form.Text>
            </Form.Group>
            <Form.Group as={Col} md={6} sm={12}>
              <Form.Label>Phone number</Form.Label>
              <input
                className="form-control"
                id="phone_number"
                name="phone_number"
                defaultValue={state.formData.phone_number}
                onChange={handleFormData}
              />

              <Form.Text className="text-danger mt-3">
                <small>{errors.phone_number}</small>
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
                defaultValue={state.formData.first_name}
                onBlur={handleFormData}
              />
              <Form.Text className="text-danger mt-3">
                <small>{errors.first_name}</small>
              </Form.Text>
            </Form.Group>
            <Form.Group as={Col} md={6} sm={12}>
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Last name"
                id="last_name"
                name="last_name"
                defaultValue={state.formData.last_name}
                onBlur={handleFormData}
              />
              <Form.Text className="text-danger mt-3">
                <small>{errors.last_name}</small>
              </Form.Text>
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
                defaultValue={state.formData.date_of_birth}
                onBlur={handleFormData}
              />
              <Form.Text className="text-danger mt-3">
                <small>{errors.date_of_birth}</small>
              </Form.Text>
            </Form.Group>

            <Form.Group as={Col} md={6} sm={12}>
              <Form.Label>Gender</Form.Label>
              <select
                className="custom-select"
                id="gender"
                name="gender"
                onChange={handleFormData}
              >
                <option value="">-- Select gender --</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                </select>
            <Form.Text className="text-danger mt-3">
                <small>{errors.gender}</small>
              </Form.Text>
            </Form.Group>
          </Form.Row>
          <Form.Group className="d-flex flex-row justify-content-center">
            <Button
              value="Send"
              btnClass="btn btn-success py-2 px-3"
              type="submit"
            />
          </Form.Group>
        </Form>
      </div>
      <div className={`col-md-2`}></div>
    </div>
  );
}

export default AddCOEHelpDesk;
