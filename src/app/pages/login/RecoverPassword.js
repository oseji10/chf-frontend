import { useState } from "react";
import { useHistory, Link } from "react-router-dom";
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

function RecoverPassword() {
  const [alert, setAlert] = useState({ message: "", variant: "" });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const history = useHistory();

  
  const onSubmit = (data) => {
    setAlert({message:"Sending request...", variant:"success"});
    API.post(`/api/resend_email`, data)
      .then((response) => {
        console.log(response)
        history.push(`/recover/password/${data.email}`);
      })
      .catch((err) => {
        console.log(err)
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
          <h4 className="text-center font-weight-bold mb-3" style={{color: '#7a7a7a'}}>
            Recover Password
          </h4>
          {alert.message ? (
            <MessageAlert
              alertMessage={alert.message}
              alertVariant={alert.variant}
              alertLink={{}}
            />
          ) : (
            ""
          )}
          <Form
            className="d-flex flex-column"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Form.Row >
              <Col sm={12}>
                <Form.Group className="mt-2">
                  <Form.Control
                    type="email"
                    placeholder="email"
                    id="email"
                    name="email"
                    {...register("email", {
                      required: true,
                    })}
                  />
                  <Form.Text className="text-danger mt-3">
                    {errors.email && <span>Please provide a valid email</span>}
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col sm={12} className="d-flex justify-content-center align-contents-center">
                <Button
                  value="Submit"
                  btnClass="btn btn-success mt-2 mb-5"
                  type="submit"
                />
              </Col>
            </Form.Row>
          </Form>

          <p>
          <Link to="/login" className="btn btn-sm btn-info">
              Login
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

export default RecoverPassword;
