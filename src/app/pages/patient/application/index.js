import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { useState, useEffect } from "react";
import { Jumbotron } from "reactstrap";
import { Link } from "react-router-dom";
import PageTitle from "../../../components/pageTitle/pageTitle";
import styles from "../../report/infographics/infographics.module.scss";
import { getUserApplications } from "../../../redux/application/application.action";
import { diffWithNowMins } from "../../../utils/date.util";
import { formatAsMoney } from "../../../utils/money.utils";
import Table from "../../../components/table/table";
import { timestampToRegularTime } from "../../../utils/date.util";
import Button from "../../../components/button";

const initial_state = {
  isLoading: true,
};

const tableHeaders = [
  { value: "APPLICATION DATE" },
  { value: "STATUS" },
];

function MyApplications(props) {
  const { user, patientApplications, is_first_time_application } = props;
  const [state, setState] = useState(initial_state);

  const setStateValue = (name, value) => {
    setState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (user) {
      props.getUserApplications(user.user.id);
      setStateValue("isLoading", false);
    }
  }, [user]);

  const renderAppInProgress = () => {
    if (is_first_time_application)
      return (
        <Jumbotron
          className={["row shadow-lg bg-light", styles.bb_primary].join(" ")}
        >
          <div className="alert text-danger">
            <PageTitle title="Important!" />
            <p>
              Welcome to the CHF portal!. You are required to provide the
              following information before your application can be reviewed for
              approval.
            </p>
            <Link to="/myapplications/personal-information">
              <Button
                btnClass={"btn btn-danger"}
                type={"button"}
                value="Complete your application here"
              />
            </Link>
          </div>
        </Jumbotron>
      );
    else if (props.currentApplication) {
      return (
        <Jumbotron
          className={["row shadow-lg bg-light", styles.bb_primary].join(" ")}
        >
          <div className="alert alert-info">
            <p>
              Welcome back!. Continue your application by clicking the button
              below.{" "}
            </p>
            <Link to="/myapplications/personal-information">
              <Button
                btnClass={"btn btn-info"}
                type={"button"}
                value="Continue your application"
              />
            </Link>
          </div>
        </Jumbotron>
      );
    }
  };

  const renderPendingApplication = () => {
    const pending = patientApplications.find(
      (patientApplication) =>
        patientApplication.applicationReview.status === "pending"
    );
    if (pending)
      return (
        <Jumbotron
          className={["row shadow-lg bg-light", styles.bb_primary].join(" ")}
        >
          <div className="alert text-success">
            Your application was submitted successfully and pending approval.
            You will get an approval or decline notification within 2 to 7
            working days.
          </div>
          <br />
        </Jumbotron>
      );
  };

  const recentApprovedApplication = () => {
    const decisionMade = patientApplications.find(
      (patientApplication) =>
        patientApplication.applicationReview.status === "approved"
    );
    if (decisionMade && undefined !== decisionMade)
      if (diffWithNowMins(decisionMade.applicationReview.created_at) < 2880) {
        return (
          <Jumbotron
            className={["row shadow-lg bg-light", styles.bb_primary].join(" ")}
          >
            <h4>Congratulations!!</h4>
            <p>
              Your application has been approved and the sum of <del>N</del>
              {formatAsMoney(
                decisionMade.applicationReview.created_at.amount_approved
              )}
            </p>
          </Jumbotron>
        );
      }
  };

  const renderApplications = () => {
    const tableData = [];
    if (patientApplications.length) {
      patientApplications.forEach((data) => {
        tableData.push({
          created_at: timestampToRegularTime(data.applicationReview.created_at),
          status: data.applicationReview.status,
        });
      });

      return <Table headers={tableHeaders} tableData={tableData} />;
    }
  };

  return (
    user &&
    patientApplications && (
      <div className="container">
        <div className="row">
          <div className="col-sm-12">
            <PageTitle title="My Applications" />
            {/* SHOW THE MOST RECENT APPLICATION THAT IS IN PROGRESS */}
            {renderAppInProgress()}

            {/*IF IT EXIST ELSE SHOW APPLICATION COMPLETED AND PENDING.*/}
            {renderPendingApplication()}

            {/* IF APPLICATION DECISION MADE SHOW SUCCESS MESSAGE FOR SOME 48HRS */}
            {recentApprovedApplication()}

            {/* SHOW PRAVIOUS APPLICATIONS IF THEY EXIST*/}
            {renderApplications()}
          </div>
        </div>
      </div>
    )
  );
}

const matchDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      getUserApplications,
    },
    dispatch
  );
};
const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
    is_first_time_application: state.application.is_first_patient_application,
    patientApplications: state.application.patientApplications,
    currentApplication: state.application.currentApplication,
  };
};

export default connect(mapStateToProps, matchDispatchToProps)(MyApplications);
