import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Card, Form, } from "react-bootstrap";
import Button from "../../components/button";
import MessageAlert from "../../components/message/messageAlert";
import API from "../../config/chfBackendApi";
import { formatErrors } from "../../utils/error.utils";
import { diffWithNowMins } from "../../utils/date.util";

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

function VerifyEmail() {
  const [alert, setAlert] = useState({
    message:
      "An OTP code has been sent to your email. Please enter the code to continue.",
    variant: "success",
  });
  const [timeCount, setTimeCount] = useState(180000);
  let currentDate = new Date();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const history = useHistory();

  useEffect(() => {
    if (timeCount > 0) {
      setTimeout(() => {
        if (diffWithNowMins(currentDate) > 3) return setTimeCount(0);
        setTimeCount((prevTimeCount) => prevTimeCount - 5000);
      }, 5000);
    }
  }, [timeCount, currentDate]);

  // This is the email param from the url
  let { id } = useParams();

  const onSubmit = (data) => {
    API.post(`api/verify_email?email=${id}&hash=${data.hash}`)
      .then(() => {

        history.replace(`/login`);
      })
      .catch((err) => {
        console.log(err.response);
        setAlert({ message: formatErrors(err), variant: "danger" });
      });
  };

  const resendCode = () => {
    setAlert({ message: "Sending request...", variant: "success" });
    const email = { email: id };
    API.post(`/api/resend_email`, email)
      .then(() => {
        currentDate = new Date();
        setTimeCount(180);
        setAlert({
          message:
            "A new OTP code has been sent to your email. Wait for 3 minutes before trying resend button again",
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
        className="px-4 mx-4 d-flex flex-column align-items-center justify-content-md-center"
        style={stylingObject.card}
      >
        <Card.Img variant="top" src="./../../images/formCoverLogo.png" className="img-responsive" />
        <Card.Body>
          <h4 className="text-center font-weight-bold mb-3">Verify Email</h4>
          <MessageAlert
            alertMessage={alert.message}
            alertVariant={alert.variant}
            alertLink={{}}
          />
          <Form
            className="d-flex flex-column align-items-center justify-content-md-center"
            onSubmit={handleSubmit(onSubmit)}
          >
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
            <Button
              value="Submit"
              btnClass="btn btn-success mb-4"
              type="submit"
            />
          </Form>
        </Card.Body>
        {timeCount > 1 && <p className="disabled"><em>Wait: {Math.round(timeCount / (1000 * 60), 2)} Mins for resend button</em></p>}
        {timeCount < 1 && (
          <p>
            <span>Did not receive code?</span>&nbsp;
            <button className="btn btn-sm btn-info" onClick={resendCode}>
              Resend code
            </button>
          </p>
        )}
      </Card>
    </div>
  );
}

export default VerifyEmail;
