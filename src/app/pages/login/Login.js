import { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Card, Col } from "react-bootstrap";
import { Button } from "../../components";
import MessageAlert from "../../components/message/messageAlert";
import API from "../../config/chfBackendApi";
import { formatErrors } from "../../utils/error.utils";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { logoutUser, logUserIn } from "../../redux/auth.action";
import { getUserApplications } from "../../redux/application/application.action";


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
    maxWidth: "550px",
    width: "100%",
  },
  formHeader: {
    color: "#3e4954",
  },
};

function Login(props) {
  const [alert, setAlert] = useState({ message: "", variant: "" });
  const [loginButtonText, setLoginButtonText] = useState("Login")
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const history = useHistory();

  const login = (data) => {
    setLoginButtonText('Please wait...')
    API.post(`/api/login`, data)
      .then((response) => {
        const loggedInUser = response.data.data;
        props.logUserIn(loggedInUser);

        // THIS METHOD ALSO SETS FIRST TIME APPLICATION
        props.getUserApplications(loggedInUser.user.id);

        setTimeout(() => {
          history.replace("/dashboard");
        }, 500);
      })
      .catch((err) => {
        setAlert({ message: formatErrors(err), variant: "danger" });
        props.logoutUser();
      }).finally(() => {
        setLoginButtonText('Login')
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
        <Card.Img variant="top" src="./images/formCoverLogo.png" />
        <Card.Body>
          <h4 className="text-center font-weight-bold mb-3 text-success">Sign in</h4>
          {alert.message ? (
            <MessageAlert
              alertMessage={alert.message}
              alertVariant={alert.variant}
              alertLink={{}}
            />
          ) : (
            ""
          )}
          <form
            className="d-flex flex-column"
            onSubmit={handleSubmit(login)}
            autoComplete="off"
          >
            <div className="row">
              {/* Email input */}
              <div className="form-group col-sm-12">
                <label className="form-label">Email</label>
                <input
                  className="form-control"
                  autoComplete="off"
                  type="email"
                  placeholder="email"
                  id="email"
                  name="email"
                  {...register("email", {
                    required: true,
                  })}
                />
                <p className="text-danger mt-3">
                  {errors.email && <small>Please provide your email</small>}
                </p>
              </div>
            </div>

            <div className="row">
              <div className="form-group col-sm-12" as={Col}>
                <label className="form-label">Password</label>
                <input
                  autoComplete="new-password"
                  className="form-control"
                  type="password"
                  placeholder="password"
                  id="password"
                  name="password"
                  {...register("password", {
                    required: true,
                  })}
                />
                <p className="text-danger mt-3">
                  {errors.password && (
                    <small>
                      Must contain at least one number and one uppercase and
                      lowercase letter, and at least 8 or more characters
                    </small>
                  )}
                </p>
              </div>
            </div>
            <div className="d-flex flex-row justify-content-between">
              <Button
                text={loginButtonText}
                variant='success'
                className="btn btn-success py-2 px-3 btn-block  my-3"
                type="submit"
              />
            </div>
          </form>
          <p className="text-muted">
            {"Forgotten your password?"}&nbsp;
            <Link to="/recover/password" className="btn btn-sm btn-info">
              Click here
            </Link>{" "}
            &nbsp;
            <Link to="/home" className="btn btn-sm btn-info">
              {" "}
              <i className="fa fa-home"></i>
            </Link>
          </p>
          <p className="mt-2 text-muted text-sm"> <Link to="/auth/email-verification/resend-email" className="text-info">Email verification</Link> </p>
        </Card.Body>
      </Card>
    </div>
  );
}

const matchDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      logUserIn,
      logoutUser,
      getUserApplications,
    },
    dispatch
  );
};

export default connect(null, matchDispatchToProps)(Login);
