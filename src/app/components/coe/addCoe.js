import styles from "./../../pages/superadmin/coe/coe.module.scss";
import { useState, useEffect } from "react";
import { Form, Col } from "react-bootstrap";
import Button from "../../components/button";
import MessageAlert from "../../components/message/messageAlert";
import API from "../../config/chfBackendApi";
import { formatErrors } from "../../utils/error.utils";

const initialState = {
  alert: { message: "", variant: "" },
  geoPoliticalZones: [],
  states: [],
  statesSelectedOption: "",
  loadedState: false,
};
function AddCoe({setParentState}) {
  const [state, setState] = useState(initialState);
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    coe_name: "",
    coe_type: "",
    coe_address: "",
    state_id: "",
    coe_id_cap:""
  });
  const [errors, setErrors] = useState({});

  let loadedState = false;
  useEffect(() => {
    try {
      let allStates = [];
      setTimeout(async () => {
        const res = await API.get(`/api/geopoliticalzones`);
        if (res) {
          const zones = res.data.data;

          for (let zone of zones) {
            allStates= [...allStates, ...zone.states];
          }

          setParentState(allStates);

          setState((prevState) => ({
            ...prevState,
            states: allStates,
          }));

        }
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
      loadedState = true;
    } catch (e) {}
  }, [loadedState]);

  const findFormErrors = () => {
    const {
      email,
      first_name,
      last_name,
      phone_number,
      coe_name,
      coe_type,
      coe_address,
      state_id,
      coe_id_cap
    } = formData;
    const newErrors = {};
    // email
    if (!email) newErrors.email = " Please provide a valid email";

    // Address
    if (coe_address.trim().length < 10)
      newErrors.coe_address = "Address must be more than 10 characters!";

    // phone_number
    if (phone_number.trim().length < 11 || phone_number.trim().length > 11)
      newErrors.phone_number = "Phone number must be 11 digits";

    // first_name
    if (first_name.trim().length < 2)
      newErrors.first_name = "Please provide a first name of coe admin";

    // coe_id_cap
    if (coe_id_cap.trim().length < 3)
      newErrors.coe_id_cap = "Please provide the COE's id on CAP";  

    // last_
    if (last_name.trim().length < 2)
      newErrors.last_name = "Please provide a last name of coe admin";

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
  const setStateSelected = (e) => {
    setState((prev) => ({
      ...prev,
      statesSelectedOption: e.target.value,
    }));
  };

  const handleStateChange = (e) => {
    setStateSelected(e);
    setFormData((prev) => ({
      ...formData,
      state_id: e.target.value,
    }));
  };
  const handleSubmit = (e) => {
    window.scrollTo(150,0);
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
    console.log(formData);
    API.post(`/api/coes`, formData)
    .then(async (response) => {
      handleAlert({
        message:
          "COE Created successfully",
        variant: "success",
      });

      setTimeout(()=>{
        handleAlert({message:"",variant:""});
        loadedState = false;
      },2000);

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
    setFormData({
      ...formData,
      [field]: value,
    });
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
      <div className={`col-md-8 shadow-sm mt-5` + styles.selected_coe}>
        <h4 className="mt-3">
          <strong>New COE</strong>
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
              <Form.Label>COE Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="COE name"
                id="coe_name"
                name="coe_name"
                defaultValue={formData.coe_name}
                onBlur={handleFormData}
              />
              <Form.Text className="text-danger mt-3">
                <small>{errors.coe_name}</small>
              </Form.Text>
            </Form.Group>
            <Form.Group as={Col} md={6} sm={12}>
              <Form.Label>COE Id ON CAP:- Optional</Form.Label>
              <Form.Control
                type="text"
                placeholder="COE id on CAP"
                id="coe_id_cap"
                name="coe_id_cap"
                onBlur={handleFormData}
              />
              <Form.Text className="text-danger mt-3">
                <small>{errors.coe_id_cap}</small>
              </Form.Text>
            </Form.Group>
            <Form.Group as={Col} md={6} sm={12}>
              <Form.Label>COE Type</Form.Label>
              <select
                className="custom-select"
                id="coe_type"
                name="coe_type"
                defaultValue={formData.coe_type}
                onBlur={handleFormData}
              >
                <option value="">-- Choose coe type --</option>
                <option value="Federal">Federal</option>
                <option value="State">State</option>
              </select>
              <Form.Text className="text-danger mt-3">
                <small>{errors.coe_type}</small>
              </Form.Text>
            </Form.Group>
          </Form.Row>
          <Form.Row>
            <Form.Group as={Col} md={6} sm={12}>
              <Form.Label>COE Admin First Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="First name"
                id="first_name"
                name="first_name"
                defaultValue={formData.first_name}
                onBlur={handleFormData}
              />
              <Form.Text className="text-danger mt-3">
                <small>{errors.first_name}</small>
              </Form.Text>
            </Form.Group>
            <Form.Group as={Col} md={6} sm={12}>
              <Form.Label>COE Admin Last Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Last name"
                id="last_name"
                name="last_name"
                defaultValue={formData.last_name}
                onBlur={handleFormData}
              />
              <Form.Text className="text-danger mt-3">
                <small>{errors.last_name}</small>
              </Form.Text>
            </Form.Group>
          </Form.Row>
          <Form.Row>
            <Form.Group as={Col} md={6} sm={12}>
              <Form.Label>COE Admin Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="email"
                id="email"
                name="email"
                required
                defaultValue={formData.email}
                onBlur={handleFormData}
              />
              <Form.Text className="text-danger mt-3">
                <small>{errors.email}</small>
              </Form.Text>
            </Form.Group>
            <Form.Group as={Col} md={6} sm={12}>
              <Form.Label>COE Admin Phone number</Form.Label>
              <Form.Control
                type="number"
                placeholder="phone number"
                id="phone_number"
                name="phone_number"
                required
                defaultValue={formData.phone_number}
                onBlur={handleFormData}
              />
              <Form.Text className="text-danger mt-3">
                <small>{errors.phone_number}</small>
              </Form.Text>
            </Form.Group>
          </Form.Row>
          <Form.Row>
            <Form.Group as={Col} md={6} sm={12}>
              <Form.Label>COE State</Form.Label>
              <select
                className="custom-select"
                id="state_id"
                name="state_id"
                onBlur={handleStateChange}
              >
                <option value="">-- Select state --</option>
                {state.states.map((state, index) => {
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
              <Form.Text className="text-danger mt-3">
                <small>{errors.state_id}</small>
              </Form.Text>
            </Form.Group>
            <Form.Group as={Col} md={6} sm={12}>
              <Form.Label>COE Address</Form.Label>
              <Form.Control
                as="textarea"
                placeholder="COE address"
                id="coe_address"
                name="coe_address"
                defaultValue={formData.coe_address}
                onBlur={handleFormData}
              />
              <Form.Text className="text-danger mt-3">
                <small>{errors.coe_address}</small>
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

export default AddCoe;
