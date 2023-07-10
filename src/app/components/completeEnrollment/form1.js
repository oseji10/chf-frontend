import { useEffect, useState } from "react";
import { Form, Col } from "react-bootstrap";
import Button from "../../components/button";
// import Select from "react-select";
function Form1({ 
  first_name,
  last_name, 
  date_of_birth,
  gender,
  handleEnrollment, 
  parentState, 
  handleZoneChange,
  handleZoneResidenceChange,    

  handleStatesChange }) {

  const [formData, setFormData] = useState({
    date_of_birth: "",
    yearly_income: "",
    gender: "",
    ailment_id: "",
    address: "",
    city: "",
    state_of_residence: "",
    state_id: "",
    lga_id: "",
  });

  useEffect(() => {
    setFormData(prevState => ({
      ...prevState,
      date_of_birth: date_of_birth ? date_of_birth : "",
      gender: gender ? gender : ""
    }))
  },[])

  const [errors, setErrors] = useState({});

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

  const findFormErrors = () => {
    const {
      date_of_birth,
      gender,
      address,
      city,
      ailment_id,
      yearly_income,
      state_of_residence,
      state_id,
      lga_id,
    } = formData;
    const newErrors = {};
    // email
    if (!date_of_birth)
      newErrors.date_of_birth = " Please provide your date of birth";

    // gender
    if (!gender) newErrors.gender = "Please choose your gender!";

    // stage_of_cancer
    if (!ailment_id)
      newErrors.ailment_id = "Please choose a stage of cancer!";

    // Address
    if (address.trim().length < 10)
      newErrors.address = "Address must be more than 10 characters!";

    // city
    if (city.trim().length < 2) newErrors.city = "Please provide a valid city";

    // yearly_income
    if (!yearly_income)
      newErrors.yearly_income = "Please provide your yearly income";

    // state_id
    if (!state_id) newErrors.state_id = "Please choose a state of origin";

    // state_id
    if (!lga_id) newErrors.lga_id = "Please choose a LGA of origin";

    // state_of_residence
    if (!state_of_residence)
      newErrors.state_of_residence = "Please choose your state of residence";

    setErrors(newErrors);
    return newErrors;
  };

  const handleStateOfOriginChange=(e)=>{
    handleStatesChange(e);
    setFormData(prev=>({
        ...formData,
        state_id: e.target.value
    }))
  }
  const handleSubmit = (e) => {
    e.preventDefault();

    // Get errors
    const newErrors = findFormErrors();

    // Conditional logic:
    if (Object.keys(newErrors).length > 0) {
      // We got errors!
      setErrors(newErrors);
      return false;
    }

    console.log(formData);
    handleEnrollment(formData);

  };

  return (
    <Form className="mt-5" onSubmit={handleSubmit}>
      <Form.Row>
        <Form.Group as={Col} md={6} sm={12}>
          <Form.Label>First Name</Form.Label>
          <p>{first_name}</p>
        </Form.Group>
        <Form.Group as={Col} md={6} sm={12}>
          <Form.Label>Last Name</Form.Label>
          <p>{last_name}</p>
        </Form.Group>
      </Form.Row>

      <Form.Row>
        <Form.Group as={Col} md={6} sm={12}>
          <Form.Label>Other names</Form.Label>
          <Form.Control
            type="text"
            placeholder="other names"
            id="other_names"
            name="other_names"
            defaultValue={formData.other_names}
            onBlur={handleFormData}
          />
        </Form.Group>
        <Form.Group as={Col} md={6} sm={12}>
          <Form.Label>Date of birth</Form.Label>
          {(!date_of_birth && <Form.Control
            type="date"
            placeholder="dd/mm/yyyy"
            id="date_of_birth"
            name="date_of_birth"
            defaultValue={formData.date_of_birth}
            onBlur={handleFormData}
          />) 
          || 
            <p>{date_of_birth}</p>}
          <Form.Text className="text-danger mt-3">
            <small>{errors.date_of_birth}</small>
          </Form.Text>
        </Form.Group>
      </Form.Row>
      <Form.Row>
        <Form.Group as={Col} md={6} sm={12}>
          <Form.Label>Alternate Phone number</Form.Label>
          <Form.Control
            type="text"
            placeholder="phonenumber"
            id="phone_no_alt"
            name="phone_no_alt"
            defaultValue={formData.phone_no_alt}
            onBlur={handleFormData}
          />
        </Form.Group>
        <Form.Group as={Col} md={6} sm={12}>
          <Form.Label>Yearly income</Form.Label>
          <Form.Control
            type="number"
            placeholder="Yearly Income"
            id="yearly_income"
            name="yearly_income"
            defaultValue={formData.yearly_income}
            onBlur={handleFormData}
          />
          <Form.Text className="text-danger mt-3">
            <small>{errors.yearly_income}</small>
          </Form.Text>
        </Form.Group>
      </Form.Row>
      <Form.Row>
        <Form.Group as={Col} md={6} sm={12}>
          <Form.Label>Gender</Form.Label>
          {(!gender && <select
            className="custom-select"
            id="gender"
            name="gender"
            defaultValue={formData.gender}
            onChange={handleFormData}
          >
            <option value="">-- Choose gender --</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>) 
          || <p>{gender}</p>}
          <Form.Text className="text-danger mt-3">
            <small>{errors.gender}</small>
          </Form.Text>
        </Form.Group>
        <Form.Group as={Col} md={6} sm={12}>
          <Form.Label>Stage of Cancer</Form.Label>
          <select
            className="custom-select"
            id="ailment_id"
            name="ailment_id"
            defaultValue={formData.ailment_id}
            onChange={handleFormData}
          >
            <option value="">-- Select stage --</option>
            {parentState.stagesOfCancer &&
              parentState.stagesOfCancer.map((stage, index) => {
                return (
                  <option key={`${stage.id}/${index}`} value={`${stage.id}`}>
                    {stage.ailment_type} (stage-
                    {stage.ailment_stage})
                  </option>
                );
              })}
          </select>
          <Form.Text className="text-danger mt-3">
            <small>{errors.stage_of_cancer}</small>
          </Form.Text>
        </Form.Group>
      </Form.Row>
      <Form.Row>
        <Form.Group as={Col} md={4} sm={12}>
          <Form.Label>Geo Political Zone</Form.Label>
          <select
            className="custom-select"
            id="zone"
            name="zone_id"
            onChange={handleZoneChange}
          >
            <option value="">-- Select zone --</option>
            {parentState.geoPoliticalZones.map((zone, index) => {
              return (
                <option
                  key={`${zone.id}/${zone.geopolitical_zone}`}
                  value={`${zone.id}`}
                >
                  {zone.geopolitical_zone}
                </option>
              );
            })}
          </select>
          <Form.Text className="text-danger mt-3"></Form.Text>
        </Form.Group>

        <Form.Group as={Col} md={4} sm={12}>
          <Form.Label>State of Origin</Form.Label>
          <select
            className="custom-select"
            id="state_id"
            name="state_id"
            onChange={handleStateOfOriginChange}
          >
            <option value="">-- Select state --</option>
            {parentState.states.map((state, index) => {
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
        <Form.Group as={Col} md={4} sm={12}>
          <Form.Label>LGA of origin</Form.Label>
          <select
            className="custom-select"
            id="lga_id"
            name="lga_id"
            onChange={handleFormData}
          >
            <option value="">-- Select lga --</option>
            {parentState.lgas.map((lga, index) => {
              return (
                <option
                  key={`${lga.id}/${lga.lga}`}
                  value={`${lga.id}`}
                >
                  {lga.lga}
                </option>
              );
            })}
          </select>
          <Form.Text className="text-danger mt-3">
          <small>{errors.lga_id}</small>
          </Form.Text>
        </Form.Group>
      </Form.Row>
      <Form.Row>
      <Form.Group as={Col} md={6} sm={12}>
          <Form.Label>Address</Form.Label>
          <Form.Control
            as="textarea"
            placeholder="Your residential address"
            id="address"
            name="address"
            defaultValue={formData.address}
            onBlur={handleFormData}
          />
          <Form.Text className="text-danger mt-3">
            <small>{errors.address}</small>
          </Form.Text>
        </Form.Group>
        <Form.Group as={Col} md={6} sm={12}>
          <Form.Label>City</Form.Label>
          <Form.Control
            type="text"
            placeholder="city"
            id="city"
            name="city"
            defaultValue={formData.city}
            onBlur={handleFormData}
          />
          <Form.Text className="text-danger mt-3">
          <small>{errors.city}</small>
          </Form.Text>
        </Form.Group>
      </Form.Row>
      <Form.Row>
        <Form.Group as={Col} md={6} sm={12}>
          <Form.Label>Pick a zone to view state of residence</Form.Label>
          <select
            className="custom-select"
            id="zone"
            name="zone_id"
            onChange={handleZoneResidenceChange}
          >
            <option value="">-- Select zone --</option>
            {parentState.geoPoliticalZones.map((zone, index) => {
              return (
                <option
                  key={`${zone.id}/${zone.geopolitical_zone}`}
                  value={`${zone.id}`}
                >
                  {zone.geopolitical_zone}
                </option>
              );
            })}
          </select>
        </Form.Group>

        <Form.Group as={Col} md={6} sm={12}>
          <Form.Label>State of Residence</Form.Label>
          <select
            className="custom-select"
            id="state"
            name="state_of_residence"
            onChange={handleFormData}
          >
            <option value="">-- Select state --</option>
            {parentState.stateOfResidence.map((state, index) => {
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
          <Form.Text className="text-danger mt-3"> <small>{errors.state_of_residence}</small></Form.Text>
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
  );
}

export default Form1;
