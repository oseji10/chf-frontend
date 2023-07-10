import React, { useState } from "react";
import { useHistory, Link, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Card, Form, Col } from "react-bootstrap";
import Button from "../../components/button";
import MessageAlert from "../../components/message/messageAlert";
import API from "../../config/chfBackendApi";
import { formatErrors } from "../../utils/error.utils";

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

function RecoverPasswordCode() {
  const [alert, setAlert] = useState({
    message:
      "An OTP code has been sent to your email. Please enter the code to continue.",
    variant: "success",
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const history = useHistory();

  // This is the email param from the url
  let { id } = useParams();

  const onSubmit = (data) => {
    API.post(
      `api/password/recovery/verify_code`, {
      email: id,
      hash: data.hash
    }
    )
      .then(() => {
        // console.log(response.data);
        setAlert((prev) => {
          return {
            ...prev,
            message: "Verification successful",
          };
        });
        history.replace(`/password/change/${id}`);
      })
      .catch((err) => {
        // console.log(err.response);
        setAlert({ message: formatErrors(err), variant: "danger" });
      });
  };

  const resendCode = () => {
    setAlert({ message: "Sending request...", variant: "success" });
    const email = { email: id };
    API.post(`/api/resend_email`, email)
      .then(() => {
        setAlert({
          message:
            "An OTP code has been sent to your email. Please enter the code to continue.",
          variant: "success",
        });
      })
      .catch((err) => {
        setAlert({ message: formatErrors(err), variant: "danger" });
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
        <Card.Img variant="top" src="./../../images/formCoverLogo.png" />
        <Card.Body>
          <h4 className="text-center font-weight-bold mb-3">
            Recover Password
          </h4>
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
              <Col md={6} sm={12}>
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
              <Col md={6} sm={12}>
                <Button
                  value="Submit"
                  btnClass="btn btn-success mt-2 mb-4"
                  type="submit"
                />
              </Col>
            </Form.Row>
          </Form>

          <p>
            <span>Did not receive code?</span>&nbsp;
            <button className="btn btn-sm btn-info" onClick={resendCode}>
              Resend code
            </button>
            &nbsp;&nbsp;
            <Link to="/login" className="btn btn-sm btn-info">Login</Link>
          </p>
        </Card.Body>
      </Card>
    </div>
  );
}

export default RecoverPasswordCode;
