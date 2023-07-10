import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, Form, Col } from "react-bootstrap";
import Button from "../../components/button";
import MessageAlert from "../../components/message/messageAlert";
import API from "../../config/chfBackendApi";
import { formatErrors } from "../../utils/error.utils";
import { validatePassword } from "../../utils/form.utils";

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

function ProfileChangePassword({email,setParentMode}) {
  const [alert, setAlert] = useState({ message: "", variant: "" });
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    reset,
  } = useForm();

  // Custom validation for confirm password field
  const confirmPassword = () => {
    if (getValues("password") !== getValues("confirm_password")) return false;
    return true;
  };


  const onSubmit = (data) => {
    setAlert({ message: "Sending request...", variant: "success" });
    const credentials = {
      email: email,
      password: data.password,
    };
    API.put(`/api/reset_password`, credentials)
      .then(async (response) => {
        reset({});
        setAlert({
          message: "Password Change successful",
          variant: "success"
        });
        setTimeout(() => {
          setParentMode("view")
        }, 5000);
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
        <Card.Body>
          <h4 className="text-center font-weight-bold mb-3">Change Password</h4>
          {alert.message ? (
            <MessageAlert
              alertMessage={alert.message}
              alertVariant={alert.variant}
              alertLink={alert.link}
            />
          ) : (
            ""
          )}
          <Form
            className="d-flex flex-column"
            onSubmit={handleSubmit(onSubmit)}
            autoComplete="off"
          >
            <Form.Row>
              <Form.Group as={Col} md={12} sm={12}>
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  autoComplete="new-password"
                  placeholder="Password"
                  id="password"
                  name="password"
                  {...register("password", {
                    validate: validatePassword
                  })}
                />
                <Form.Text className="text-danger mt-3">
                  {errors.password && (
                    <span>
                      Must be at least 8 or more characters
                    </span>
                  )}
                </Form.Text>
              </Form.Group>
              <Form.Group as={Col} md={12} sm={12}>
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                autoComplete="new_password"
                  type="password"
                  placeholder="Password"
                  id="confirm_password"
                  name="confirm_password"
                  {...register("confirm_password", {
                    validate: confirmPassword,
                  })}
                />
                <Form.Text className="text-danger mt-3">
                  {errors.confirm_password && <span>Do not Match</span>}
                </Form.Text>
              </Form.Group>
            </Form.Row>
            <Form.Group className="d-flex flex-row justify-content-between">
              <Button
                value="Change"
                btnClass="btn btn-success py-2 px-3 mr-2"
                type="submit"
              />
              <Button
                value="Close"
                btnClass="btn btn-success py-2 px-3"
                type="Button"
                onClick={()=>{setParentMode("view")}}
              />
            </Form.Group>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default ProfileChangePassword;
