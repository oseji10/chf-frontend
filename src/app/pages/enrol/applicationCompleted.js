import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Card, Form, Col } from "react-bootstrap";
import Button from "../../components/button";
import MessageAlert from "../../components/message/messageAlert";
import API from "./../../config/chfBackendApi";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { errorHandler, formatErrors } from "./../../utils/error.utils";
import { clearNewUser } from "../../redux/enrol.action";
import { successAlert } from "../../utils/alert.util";


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

function ApplicationCompleted({ newUser, clearNewUser }) {

  const [isResendingCode, setIsResendingCode] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);

  const [alert, setAlert] = useState({
    message: `You have registered successfully. Please verify your email address to continue`,
    variant: "success",
  });


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const history = useHistory();

  const onSubmit = async ({ hash }) => {
    setIsVerifyingEmail(true)

    try {
      const res = await API.post('/api/verify_email', {
        email: newUser.email,
        hash: hash,
      });
      successAlert(`Your email is now verified. Redirecting to login in 3 seconds`)
      return setTimeout(() => {
        clearNewUser();
        history.replace("/login");
      }, 3000);
    } catch (e) {
      console.log(e.response);
      return errorHandler(e)
    }
    API.post(
      `api/verify_email?email=${newUser.email}&hash=${hash}`,
    )
      .then((response) => {
        setAlert({
          message:
            `Your email is now verified. Redirecting to login in 3 seconds`,
          variant: "success",
        });

        setTimeout(() => {
          clearNewUser();
          history.replace("/login");
        }, 3000);
      })
      .catch((err) => {
        setAlert({ message: formatErrors(err), variant: "danger" });
      }).finally(() => {
        setIsVerifyingEmail(false)
      })
  };

  const resendCode = () => {
    setIsResendingCode(true);
    const data = { email: newUser.email };
    API.post(`/api/resend_email`, data)
      .then((response) => {

        setAlert({
          message:
            `A new code has been sent to your email. Check to verify your account.`,
          variant: "success",
        });

      })
      .catch((err) => {
        console.log(err)
        setAlert({ message: formatErrors(err), variant: "danger" });
      }).finally(() => {
        setIsResendingCode(false)
      })
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
          <MessageAlert
            alertMessage={alert.message}
            alertVariant={alert.variant}
            alertLink={{}}
          />
          <Form
            className="d-flex flex-column"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Form.Row>
              <Col sm={12}>
                <Form.Group className="mt-2">
                  <Form.Control
                    type="text"
                    placeholder="code"
                    id="hash"
                    name="hash"
                    {...register("hash", {
                      required: true,
                      minLength: 6,
                      maxLength: 6,
                    })}
                  />
                  <Form.Text className="text-danger mt-3">
                    {errors.hash && <span>Please provide a valid code</span>}
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col sm={12}>
                <Button
                  disabled={isVerifyingEmail}
                  value={isVerifyingEmail ? "Please wait..." : "Confirm Email"}
                  btnClass="btn btn-success mt-2 mb-4"
                  type="submit"
                />
              </Col>
            </Form.Row>
          </Form>

          <p>
            <span>Did not receive code?</span>&nbsp;
            <button className="btn btn-sm btn-info" disabled={isResendingCode} onClick={resendCode}>
              {isResendingCode ? "Please wait..." : 'Resend code'}
            </button>
            {/* &nbsp;&nbsp;
            <Link to="/home">Back to Home</Link> */}
          </p>
        </Card.Body>
      </Card>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    newUser: state.enroll.cap_user,
  };
};

const matchDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      clearNewUser
    },
    dispatch
  );
};

export default connect(mapStateToProps, matchDispatchToProps)(ApplicationCompleted);
