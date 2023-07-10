/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Card, Form, Col, Button } from "react-bootstrap";
import { useHistory, Link } from "react-router-dom";
import Select from "react-select";
import { fetchCOEs } from "../../db.utils/getCoes";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { loadUserFullApplicationToState } from "../../redux/enrol.action";
import API from "../../config/chfBackendApi";
import {
  handleLoadRegistrationFormData,
  loadNewUserToReduxState,
} from "../../redux/enroll/enroll.action";
import { AiOutlineHeatMap } from "react-icons/ai";

const stylingObject = {
  div: {
    padding: "20px",
    marginTop: "3rem",
  },
  card: {
    maxWidth: "650px",
    width: "100%",
  },
  formHeader: {
    color: "#3e4954",
  },
};

const customStyles = {
  container: (provided, state) => ({
    ...provided,
    width: "100%",
    padding: 0,
    fontSize: "9pt",
  }),
};

function ApplicationForm({
  loadUserFullApplicationToState,
  newUser,
  handleLoadRegistrationFormData,
  loadNewUserToReduxState,
  coes,
  identification_documents,
}) {
  // console.log(newUser)
  const [coeSelected, setCoeSelected] = useState("");
  const history = useHistory();
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  let pageLoaded = false;
  useEffect(() => {
    try {
      setFormData({
        email:
          newUser && newUser.hasOwnProperty("email_address")
            ? newUser.email_address
            : "",
        phone_number:
          newUser && newUser.hasOwnProperty("phone_number")
            ? newUser.phone_number
            : "",
        first_name:
          newUser && newUser.hasOwnProperty("first_name")
            ? newUser.first_name
            : "",
        date_of_birth:
          newUser && newUser.hasOwnProperty("date_of_birth")
            ? newUser.date_of_birth
            : "",
        last_name:
          newUser && newUser.hasOwnProperty("last_name")
            ? newUser.last_name
            : "",
        identification_id:
          newUser && newUser.hasOwnProperty("identification_id")
            ? newUser.dentification_id
            : "",
        identification_number:
          newUser && newUser.hasOwnProperty("identification_number")
            ? newUser.identification_number
            : "",
        coe_id:
          newUser && newUser.hasOwnProperty("coe_id") ? newUser.coe_id : "",
        password: "",
        confirmPassword: "",
        cap_id:
          newUser && newUser.hasOwnProperty("cap_id") ? newUser.cap_id : null,
      });

      prepareForm();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      pageLoaded = true;
    } catch (e) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageLoaded]);

  const prepareForm = async () => {
    try {
      const res = await Promise.all([
        fetchCOEs,
        API.get("/api/identification_documents"),
      ]);
      return handleLoadRegistrationFormData({
        //WHEN COE IS PROVIDED BY CAP IMAS, FILTER TO ONLY SHOW THAT CENTRE
        coes: res[0].data.data,
        identification_documents: res[1].data.data,
      });
    } catch (e) {
      // console.log(e)
    }
  };

  function coeSelectOption() {
    // if (newUser && newUser.cap_id && newUser.coe_name) {
    //   coes = coes.filter((coe) => {
    //     return coe.coe_name
    //       .toLowerCase()
    //       .includes(
    //         newUser.coe_name.toLowerCase().substring(0, 50).split(",")[0]
    //       );
    //   });
    // }
    const options = [];
    for (let coe of coes) {
      options.push({ label: `${coe.coe_name}`, value: `${coe.id}` });
    }
    return options;
  }

  const handleCOEChange = (e) => {
    setCoeSelected(e);
    setField("coe_id", e.value);
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

  const findFormErrors = () => {
    const {
      email,
      phone_number,
      first_name,
      last_name,
      identification_id,
      identification_number,
      coe_id,
      password,
      confirmPassword,
      date_of_birth,
    } = formData;
    const newErrors = {};
    // email
    if (!email) newErrors.email = "Email must not be blank";

    // Phone_number
    if (phone_number.trim().length !== 11)
      newErrors.phone_number = "Phone number must be 11 characters!";

    // First_name
    if (first_name.trim().length < 2)
      newErrors.first_name = "First name must be more than 2 characters!";

    // Last_name
    if (last_name.trim().length < 2)
      newErrors.last_name = "Last name must be more than 2 characters";

    // Date_of_birth
    if (!date_of_birth) newErrors.date_of_birth = "Select your date of birth";

    // identification_id
    if (!identification_id)
      newErrors.identification_id = "Please choose an ID type";

    // identification_number
    if (!identification_number || identification_number.trim().length < 5)
      newErrors.identification_number = "Please enter a valid ID card number";

    // coe_id
    if (!coe_id) newErrors.coe_id = "Please choose a coe";

    // password errors
    if (!password.trim() || password.trim().length < 8)
      newErrors.password = "Password must be 8 characters or more!";

    // Confirm password errors
    if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match!";

    setErrors(newErrors);
    return newErrors;
  };

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

    const newuser = {
      ...formData,
      email_address: formData.email,
    };

    loadNewUserToReduxState(newuser);
    history.push("/enrol/reviewApplication");
  };

  return (
    <div
      className="d-flex flex-column align-items-center"
      style={stylingObject.div}
    >
      <Card
        className="align-items-center justify-content-md-center"
        style={stylingObject.card}
      >
        <Card.Img variant="top" src="./../../images/formCoverLogo.png" />
        <Card.Body style={{paddingTop: '0'}}>
          <h3 className="text-center"><AiOutlineHeatMap className="text-danger" /></h3>
          <p className="d-block text-danger text-center"> Please note that only patients currently receiving care at any of the pilot hospitals can complete the application process.</p>
          <h4
            className="text-center font-weight-bold mb-3"
            style={stylingObject.formHeader}
          >
            Pre-enrollment Form
          </h4>

          <Form
            autoComplete="off"
            className="d-flex flex-column"
            onSubmit={handleSubmit}
          >
            <Form.Row>
              {/* Email input */}
              <Form.Group as={Col} lg={6} md={12} sm={12}>
                <Form.Label>Email</Form.Label>
                <Form.Control
                  autoComplete="new-email"
                  type="email"
                  placeholder="Email"
                  id="email"
                  name="email"
                  defaultValue={formData.email}
                  onBlur={handleFormData}
                />
                <Form.Text className="text-danger mt-3">
                  <small>{errors.email}</small>
                </Form.Text>
              </Form.Group>

              {/* Phone number input */}
              <Form.Group as={Col} lg={6} md={12} sm={12}>
                <Form.Label>Phone number</Form.Label>
                <Form.Control
                  autoComplete="new-phone-number"
                  type="text"
                  placeholder="Phone number"
                  id="phone_number"
                  name="phone_number"
                  defaultValue={formData.phone_number}
                  onBlur={handleFormData}
                />
                <Form.Text className="text-danger mt-3">
                  <small>{errors.phone_number}</small>
                </Form.Text>
              </Form.Group>
            </Form.Row>
            <Form.Row>
              {/* First name input */}
              <Form.Group as={Col} lg={6} md={12} sm={12}>
                <Form.Label>First name</Form.Label>
                <Form.Control
                  autoComplete="new-first-name"
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
              {/* Last name input */}
              <Form.Group as={Col} lg={6} md={12} sm={12}>
                <Form.Label>Last name</Form.Label>
                <Form.Control
                  type="text"
                  autoComplete="new-last-name"
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
              <Form.Group as={Col} lg={6} md={12} sm={12}>
                <Form.Label>Date of birth</Form.Label>
                <Form.Control
                  type="date"
                  autoComplete="new-date-of-birth"
                  placeholder="dd/mm/yyyy"
                  id="date_of_birth"
                  name="date_of_birth"
                  defaultValue={formData.date_of_birth}
                  onBlur={handleFormData}
                />
                <Form.Text className="text-danger mt-3">
                  <small>{errors.date_of_birth}</small>
                </Form.Text>
              </Form.Group>
              {/* Id type input */}
              <Form.Group as={Col} lg={6} md={12} sm={12}>
                <Form.Label>Identification ID</Form.Label>
                <select
                  className="custom-select"
                  id="identification_id"
                  name="identification_id"
                  defaultValue={formData.identification_id}
                  onChange={handleFormData}
                >
                  <option value="">-- Choose ID Type --</option>
                  {identification_documents
                    ? identification_documents.map((id, index) => {
                        return (
                          <option key={index} value={id.id}>
                            {id.identification_type}
                          </option>
                        );
                      })
                    : ""}
                </select>
                <Form.Text className="text-danger mt-3">
                  <small>{errors.identification_id}</small>
                </Form.Text>
              </Form.Group>
            </Form.Row>
            <Form.Row>
              {/* Id number input */}
              <Form.Group as={Col} lg={6} md={12} sm={12}>
                <Form.Label>Identification Number</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Id number"
                  id="identification_number"
                  name="identification_number"
                  defaultValue={formData.identification_number}
                  onBlur={handleFormData}
                />
                <Form.Text className="text-danger mt-3">
                  <small>{errors.identification_number}</small>
                </Form.Text>
              </Form.Group>

              {/* Hospital input */}
              <Form.Group as={Col} lg={6} md={12} sm={12}>
                <Form.Label>Current Hospital of treatment</Form.Label>

                <Select
                  styles={customStyles}
                  name="coe_id"
                  id="coe_id"
                  placeholder="Select Hospital"
                  options={coeSelectOption()}
                  onChange={handleCOEChange}
                />
                <Form.Text className="text-danger mt-3">
                  {/* (!coeSelected && <small>select a primary hospital</small>) */}
                </Form.Text>
              </Form.Group>
            </Form.Row>
            <Form.Row>
              <Form.Group as={Col} lg={6} md={12} sm={12}>
                <Form.Label>Password</Form.Label>
                <Form.Control
                  autoComplete="new-password"
                  type="password"
                  placeholder="Password"
                  id="password"
                  name="password"
                  onBlur={handleFormData}
                  // {...register("password", {
                  //   pattern: /(?=.*\d)(?=.*[A-Z]).{8,}/i,
                  // })}
                />
                <Form.Text className="text-danger mt-3">
                  <small>{errors.password}</small>
                </Form.Text>
              </Form.Group>
              <Form.Group as={Col} lg={6} md={12} sm={12}>
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Password"
                  id="confirmPassword"
                  name="confirmPassword"
                  onBlur={handleFormData}
                />
                <Form.Text className="text-danger mt-3">
                  <small>{errors.confirm_password}</small>
                </Form.Text>
              </Form.Group>
            </Form.Row>
            <Form.Group className="d-flex flex-row justify-content-between mt-3 mb-5">
              <Link to="/enrol">
                <Button className="btn btn-success py-2 px-3" type="button">
                  <i className="fa fa-arrow-left"></i>
                </Button>
              </Link>

              <Button className="btn btn-success py-2 px-3" type="submit">
                <i className="fa fa-arrow-right"></i> Continue
              </Button>
            </Form.Group>
          </Form>
          <p>
            {"Already pre-enrolled?"}&nbsp;
            <Link to="/login" className="btn btn-sm btn-info">
              Complete my application
            </Link>
            &nbsp;
            <Link to="/home" className="btn btn-sm btn-info">
              <i className="fa fa-home"></i>
            </Link>
          </p>
        </Card.Body>
      </Card>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    newUser: state.enroll.cap_user,
    coes: state.enroll.coes,
    identification_documents: state.enroll.identification_documents,
    msg: state.enrol.msg,
  };
};
const matchDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      loadUserFullApplicationToState,
      handleLoadRegistrationFormData,
      loadNewUserToReduxState,
    },
    dispatch
  );
};

export default connect(mapStateToProps, matchDispatchToProps)(ApplicationForm);
