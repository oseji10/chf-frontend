import { useState } from "react";
import { Card, Form, Button } from "react-bootstrap";
import MessageAlert from "../../components/message/messageAlert";
import { Link, useHistory } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { CAP_IMAS_BACKEND_HOST } from "../../config/api-config";
import {
  loadEnrolMsgToState,
  loadUserOnCapInfo,
  clearNewUser,
} from "../../redux/enrol.action";
import {
  changeIsOnCapOption,
  handleCapIDChange,
  handleLoadCapUserToState,
} from "../../redux/enroll/enroll.action";
import axios from "axios";
import PatientService from "../../services/patient.service";
import { errorAlert } from "../../utils/alert.util";
import { AiOutlineHeatMap } from "react-icons/ai";

const stylingObject = {
  div: {
    padding: "20px",
    marginTop: "3rem",
  },
  label: {
    display: "block",
    fontSize: "10px",
    fontWeight: "500",
    marginBottom: ".2rem",
  },
  card: {
    maxWidth: "650px",
    width: "100%",
  },
  formHeader: {
    color: "#3e4954",
  },
};

function StartForm({
  enroll,
  changeIsOnCapOption,
  handleCapIDChange,
  handleLoadCapUserToState,
}) {
  const [error, setError] = useState(null);
  const [isFetchingData, setIsFetchingData] = useState(false)

  const history = useHistory();

  const fetchUserDataFromCAP = async () => {
    setIsFetchingData(true);
    try {
      // const res = await axios.get(
      //   `${CAP_IMAS_BACKEND_HOST}users.php?pat_id=${enroll.cap_id}`
      // );
      const res = await PatientService.getPatientRecordFromCAP(enroll.cap_id);
      const patientData = res?.data;
      console.log('patient data',patientData)
      if (patientData) {
        const {email, phoneNumber, gender, patientId, hospitalId, firstName, lastName, dateOfBirth} = patientData;
        handleLoadCapUserToState({
          email_address: email,
          phone_number: phoneNumber,
          gender: gender,
          cap_id: patientId,
          coe_name: hospitalId,
          date_of_birth: dateOfBirth,
          first_name: firstName,
          last_name: lastName,

        });
        return history.push("/enrol/application");
      }

      return errorAlert("Invalid CAP Patient ID/Phone Number/Email provided")
      return setError("Invalid CAP Patient ID/Phone Number/Email provided");
    } catch (e) {
      return errorAlert("An unknown error occured. Please contact CHF Support is this persist")
      return setError(
        "An unknown error occured. Please contact CHF Support is this persist"
      );
    }finally{
      setIsFetchingData(false);
    }
  };

  const handleIsOnCapChange = (value) => {
    setError("");
    return changeIsOnCapOption(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Fetching cap record")
    try {
      if (enroll.is_on_cap) {
        return fetchUserDataFromCAP();
      }

      return history.push("/enrol/application");
    } catch (e) {}
  };

  return (
    <div
      className="d-flex flex-column align-items-center"
      style={stylingObject.div}
    >
      <Card
        className="px-4 mx-4 align-items-center justify-content-md-center"
        style={stylingObject.card}
      >
        <Card.Img variant="top" src="./../../images/formCoverLogo.png" />
        <Card.Body>
          <h4
            className="text-center font-weight-bold"
            style={stylingObject.formHeader}
          >
            Welcome to the CHF portal
          </h4>
          <h4 className="text-center"><AiOutlineHeatMap className="text-danger"/> </h4>
          <p className="d-block text-center text-danger">Please note that you will not be able to complete this registration if you are not currently receiving care at any of the following hospitals. ABUTH, FTHG, NHA, UBTH, UCH, UNTH.  </p>
          <p className="text-center">
            We would like to know if you are already enrolled in the Cancer
            Access Partnership (CAP) Program. Are you on the CAP Program?
          </p>
          {error && (
            <MessageAlert
              alertMessage={error}
              alertVariant={"danger"}
              alertLink={{}}
              id="messageAlert"
            />
          )}
          <Form className="d-flex flex-column" onSubmit={handleSubmit}>
            <Form.Group>
              <div className="d-flex justify-content-center my-4">
                <Form.Check
                  inline
                  label="Yes"
                  value="Yes"
                  type="radio"
                  name="isCap"
                  checked={enroll.is_on_cap}
                  onChange={() => handleIsOnCapChange(true)}
                  id={`inline-radio-yes`}
                />
                <Form.Check
                  inline
                  label="No"
                  value="No"
                  type="radio"
                  checked={enroll.is_on_cap === false}
                  name="isCap"
                  onChange={() => handleIsOnCapChange(false)}
                  id={`inline-radio-no`}
                />
              </div>
            </Form.Group>
            {enroll.is_on_cap && (
              <Form.Group id="formGroupCAPID">
                <Form.Label style={stylingObject.label}>
                  CAP Patient ID/Phone Number/Email
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="CAP Patient ID/Phone Number/Email"
                  name="CAPID"
                  autoComplete="off"
                  list="autoCompleteOff"
                  value={enroll.cap_id}
                  onChange={handleCapIDChange}
                />
              </Form.Group>
            )}
            {enroll.is_on_cap !== null && (
              <Button
                className="btn btn-success py-2 px-3 mb-4"
                type="submit"
                id="startBtn"
                disabled={isFetchingData}
              >
                <i className="fa fa-arrow-right"></i> {isFetchingData ? "Please wait..." : "Continue"}
              </Button>
            )}
            <p className="text-center">
              {"Already pre-enrolled?"}&nbsp;
              <Link to="/login" className="btn btn-sm btn-info">
                Complete my application
              </Link>
              &nbsp;
              <Link to="/home" className="btn btn-sm btn-info">
                <i className="fa fa-home"></i>
              </Link>
            </p>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    msg: state.enrol.msg,
    enroll: state.enroll,
  };
};

const matchDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      loadEnrolMsgToState,
      loadUserOnCapInfo,
      clearNewUser,
      // HOTFIX CODES
      changeIsOnCapOption,
      handleCapIDChange,
      handleLoadCapUserToState,
    },
    dispatch
  );
};

export default connect(mapStateToProps, matchDispatchToProps)(StartForm);
