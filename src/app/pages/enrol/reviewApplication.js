/* eslint-disable eqeqeq */
import { useState } from "react";
import MessageAlert from "../../components/message/messageAlert";
import { Card, Form, Col, Button } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import API from "./../../config/chfBackendApi";
import { formatErrors } from "./../../utils/error.utils";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { loadUserFullApplicationToState } from "../../redux/enrol.action";

const stylingObject = {
  div: {
    padding: "20px",
    marginTop: "3rem",
  },
  label: {
    display: "block",
    fontSize: "1.2rem",
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

function ReviewApplication({
  newUser,
  loadUserFullApplicationToState,
  identification_documents,
  coes,
}) {
  const [alert, setAlert] = useState(null);
  const history = useHistory();

  if (!newUser) {
    history.push("/enrol");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    window.scrollTo(150, 0);
    setAlert({
      message: `Submitting request...`,
      variant: "info",
    });

    // identification_id in  0:id, 1:identification_type
    const identification_id = newUser.identification_id.split("/");

    // Creating the data from cookies
    const newuser = {
      email: newUser.email,
      password: newUser.password,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      phone_number: newUser.phone_number,
      date_of_birth: newUser.date_of_birth,
      identification_id: identification_id[0],
      identification_number: newUser.identification_number,
      coe_id: newUser.coe_id,
      cap_id: newUser.cap_id,
    };
    API.post("/api/register", newuser)
      .then((response) => {
        
        history.replace("/enrol/applicationCompleted");
      })
      .catch((err) => {
        
        setAlert({
          message: formatErrors(err),
          variant: "danger",
        });
      });
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
        <Card.Body>
          <Card.Img variant="top" src="./../../images/formCoverLogo.png" />
          <h4
            className="text-center font-weight-bold mb-3"
            style={stylingObject.formHeader}
          >
            Review Registration Details
          </h4>
          <Form className="d-flex flex-column" onSubmit={handleSubmit}>
            {alert ? (
              <MessageAlert
                alertMessage={alert.message}
                alertVariant={alert.variant}
                alertLink={{}}
                id="messageAlert"
              />
            ) : (
              ""
            )}
            <Form.Row>
              {/* Email input */}
              <Form.Group as={Col} lg={6} md={12} sm={12}>
                <Form.Label className="font-weight-bold">Email</Form.Label>
                <Form.Text>
                  {newUser && newUser.hasOwnProperty("email")
                    ? newUser.email
                    : undefined}
                </Form.Text>
              </Form.Group>

              {/* Phone number input */}
              <Form.Group as={Col} lg={6} md={12} sm={12}>
                <Form.Label className="font-weight-bold">
                  Phone number
                </Form.Label>
                <Form.Text>
                  {newUser && newUser.hasOwnProperty("phone_number")
                    ? newUser.phone_number
                    : undefined}
                </Form.Text>
              </Form.Group>
            </Form.Row>
            <Form.Row>
              {/* First name input */}
              <Form.Group as={Col} lg={6} md={12} sm={12}>
                <Form.Label className="font-weight-bold">First name</Form.Label>
                <Form.Text>
                  {" "}
                  {newUser && newUser.hasOwnProperty("first_name")
                    ? newUser.first_name
                    : undefined}
                </Form.Text>
              </Form.Group>
              {/* Last name input */}
              <Form.Group as={Col} lg={6} md={12} sm={12}>
                <Form.Label className="font-weight-bold">Last name</Form.Label>
                <Form.Text>
                  {newUser && newUser.hasOwnProperty("last_name")
                    ? newUser.last_name
                    : undefined}
                </Form.Text>
              </Form.Group>
            </Form.Row>
            <Form.Row>
            <Form.Group as={Col} lg={6} md={12} sm={12}>
                <Form.Label className="font-weight-bold">Date of birth</Form.Label>
                <Form.Text>
                  {newUser && newUser.hasOwnProperty("date_of_birth")
                    ? newUser.date_of_birth
                    : undefined}
                </Form.Text>
              </Form.Group>
              {/* Id type input */}
              <Form.Group as={Col} lg={6} md={12} sm={12}>
                <Form.Label className="font-weight-bold">
                  Identification ID
                </Form.Label>
                <Form.Text>
                  {newUser && newUser.hasOwnProperty("identification_id")
                    ? identification_documents.filter(
                        (id) => id.id == newUser.identification_id
                      )[0].identification_type
                    : undefined}
                </Form.Text>
              </Form.Group>
              </Form.Row>
            <Form.Row>
              {/* Id number input */}
              <Form.Group as={Col} lg={6} md={12} sm={12}>
                <Form.Label className="font-weight-bold">
                  Identification Number
                </Form.Label>
                <Form.Text>
                  {newUser && newUser.hasOwnProperty("identification_number")
                    ? newUser.identification_number
                    : undefined}
                </Form.Text>
              </Form.Group>
            
              {/* Hospital input */}
              <Form.Group as={Col} lg={6} md={12} sm={12}>
                <Form.Label className="font-weight-bold">
                  Current Hospital of treatment
                </Form.Label>
                <Form.Text>
                  {newUser && newUser.hasOwnProperty("coe_id")
                    ? coes.filter((coe) => coe.id == newUser.coe_id)[0].coe_name
                    : undefined}
                </Form.Text>
              </Form.Group>
            </Form.Row>
            <Form.Row></Form.Row>
            <Form.Group
              controlId="reviewCoeID"
              className="d-flex flex-row justify-content-between mt-3"
            >
              <Link to="/enrol/application">
                <Button className="btn btn-success py-2 px-3" type="button">
                  <i className="fa fa-arrow-left"></i>
                </Button>
              </Link>

              <Button className="btn btn-success py-2 px-3" type="submit">
                Confirm
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
    identification_documents: state.enroll.identification_documents,
    coes: state.enroll.coes,
  };
};

const matchDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      loadUserFullApplicationToState,
    },
    dispatch
  );
};

export default connect(
  mapStateToProps,
  matchDispatchToProps
)(ReviewApplication);
