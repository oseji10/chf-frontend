import { useState, useEffect } from "react";
import { bindActionCreators } from "redux";
import { useHistory } from "react-router";
import { connect, useDispatch } from "react-redux";
import { propagatePopup } from "../../../redux/popup/popup.action";
import { getUserApplications } from "../../../redux/application/application.action";
import PageTitle from "../../../components/pageTitle/pageTitle";
import PageNumber from "../../../components/pagenumber/pageNumber";
import API from "../../../config/chfBackendApi";
import ApplicationDisplay from "../../../components/completeEnrollment/applicationDisplay";
import Button from "../../../components/button";
import PageSpinner from "../../../components/spinner/pageSpinner";
import { formatErrors } from "../../../utils/error.utils";
import ModalMessage from "../../../components/message/ModalMessage";
import Card from "../../../components/card/card";
import Label from "../../../components/form2/label/label";


const initial_state = {
  isSubmitting: false,
  isCreate: true,
  pageLoading: true,
  showConfirmModal: false,
  states: [],
  lgas: [],
  ailments: [],
  nextOfKin: [],
  coeId: "",
  coeStaff: [],
  coeName: "",
  primaryPhysicianId: "",
  viewPrimaryPhysician: false,
};

function ApplicationReview({ user, currentApplication, getUserApplications }) {
  const [state, setState] = useState(initial_state);
  const history = useHistory();
  const dispatch = useDispatch();

  // Run this use effect to set userId
  useEffect(() => {
    setUserId();
  }, [state.pageLoading]);

  useEffect(() => {
    loadData();
    getUserApplications(state.userId);
  }, [state.userId]);

  const setUserId = () => {
    if (user) {
      setState((prevState) => ({
        ...prevState,
        userId: user.user ? user.user.id : "",
        coeId: user.user ? user.user.patient.coe_id : "",
        primaryPhysicianId: user.user
          ? user.user.patient.primary_physician
          : "",
      }));
    }
  };

  const loadData = async () => {
    try {
      const res = await Promise.all([
        API.get(`/api/states`),
        API.get(`/api/lga`),
        API.get(`/api/ailments`),
        API.get(`/api/patient/next-of-kin/${state.userId}`),
        API.get(`/api/coes/${state.coeId}/staff`),
      ]);
      setState((prevState) => ({
        ...prevState,
        states: res[0].data.data ? res[0].data.data : [],
        lgas: res[1].data.data ? res[1].data.data : [],
        ailments: res[2].data.data ? res[2].data.data : [],
        nextOfKin: res[3].data ? res[3].data : {},
        coeStaff: res[4].data.data ? res[4].data.data.staffs : [],
        coeName: res[4].data.data ? res[4].data.data.coe_name : "",
      }));
    } catch (e) {
      // console.log("Patient Application Review", e.response);
    } finally {
      setStateValue("pageLoading", false);
    }
  };

  const getState = (stateId) => {
    if (stateId) {
      const filteredState = state.states.find((state) => state.id === stateId);
      if (filteredState) return filteredState.state;
    }

    return "";
  };

  const setPrimaryPhysician = () => {
    const filteredStaff = state.coeStaff.find((staff) => staff.id === state.primaryPhysicianId);
    if (filteredStaff) {
      setStateValue("primaryPhysician", filteredStaff);
      setStateValue("viewPrimaryPhysician", !state.viewPrimaryPhysician);
    }
  };

  const getLga = (lgaId) => {
    if (lgaId) {
      const filteredLga = state.lgas.find((lga) => lga.id === lgaId);
      if (filteredLga) return filteredLga.lga;
    }

    return "";
  };

  const getAilment = (ailmentId) => {
    if (ailmentId) {
      const ailment = state.ailments.find((ailment) => ailment.id == ailmentId);
      if (ailment) return ailment.ailment_type;
    }

    return "";
  };

  const setStateValue = (key, value) => {
    return setState((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  const submitForm = async () => {
    try {
      const res = await API.put(
        `/api/application/reviews/${currentApplication.applicationReview.id}`,
        { status: "pending" }
      );

      getUserApplications(state.userId);
      return res;
    } catch (e) {
      console.log(e.response);
      throw e;
    }
  };

  const handleSubmit = async () => {
    try {
      setStateValue("isSubmitting", true);
      setStateValue("showConfirmModal", false);
      // Submit form
      const res = await submitForm();

      //Dispatch success
      dispatch(
        propagatePopup({
          content: "Application submitted successfully",
          title: "Success",
          type: "success",
          timeout: 5000,
        })
      );

      // redirect to the nextpage
      history.push("/myapplications");
    } catch (e) {
      console.log(e);
      dispatch(
        propagatePopup({
          content: formatErrors(e),
          title: "Error",
          type: "danger",
          timeout: 5000,
        })
      );
    } finally {
      setStateValue("isSubmitting", false);
    }
  };

  const handleConfirm = async () => {
    setStateValue("showConfirmModal", true);
  };

  const handleCancel = async () => {
    setStateValue("showConfirmModal", false);

    //Dispatch success
    dispatch(
      propagatePopup({
        content:
          "Kindly submit your application as soon as possible for approval.",
        title: "Important!",
        type: "info",
        timeout: 5000,
      })
    );
  };

  const handleSave = async () => {
    try {
      setStateValue("isSubmitting", true);

      //Dispatch success
      dispatch(
        propagatePopup({
          content:
            "Kindly submit your application as soon as possible for approval.",
          title: "Important!",
          type: "info",
          timeout: 5000,
        })
      );

      // Redirect to application index page
      history.push("/myapplications");
    } catch (e) {
    } finally {
      setStateValue("isSubmitting", false);
    }
  };
  return (
    <div className="container">
      {(state.isSubmitting || state.pageLoading) && <PageSpinner />}
      <div className="row">
        {currentApplication && (
          <div className="col-sm-12">
            <PageTitle title="Confirm application before submission" />

            {/* CONFIRMATION MODAL */}
            <ModalMessage
              title="Are you sure you want to submit this form?"
              show={state.showConfirmModal}
              onHide={() => setStateValue("showConfirmModal", false)}
              dismissible={false}
            >
              <div className="alert alert-warning">
                This application once submitted cannot be changed.Ensure that
                you have thoroughly reviewed your application.
              </div>
              <div className="d-flex my-4">
                <Button
                  btnClass={"mr-auto btn btn-success"}
                  type={"button"}
                  value="Confirm"
                  onClick={handleSubmit}
                />
                <Button
                  btnClass={"btn btn-success"}
                  type={"button"}
                  value="Cancel"
                  onClick={handleCancel}
                />
              </div>
            </ModalMessage>
          <ApplicationDisplay 
            currentApplication={currentApplication}
            getLga={getLga}
            getState={getState}
            coeName={state.coeName}
            primaryPhysician={state.primaryPhysician}
            primaryPhysicianId={state.primaryPhysician}
            setPrimaryPhysician={setPrimaryPhysician}
            nextOfKin={state.nextOfKin}
            getAilment={getAilment}
            viewPrimaryPhysician={state.viewPrimaryPhysician}
          />

          {/* Row 4 */}
      <Card>
        <div className="mt-4">
          <Label
            label="By submitting this application, you confirm that all
                  information provided are correct and accurate to the best of your knowledge. If any
                  information provided is found
                  falsified, you will be prosecuted."
          />
          <div className="d-flex">
            <Button
              btnClass={"mr-auto btn btn-success"}
              type={"button"}
              value="Confirm"
              onClick={handleConfirm}
            />
            <Button
              btnClass={"btn btn-success"}
              type={"button"}
              value="Save for later"
              onClick={handleSave}
            />
          </div>
        </div>
      </Card>
            {/* Has a footer */}
            <PageNumber
              pageNumber={8}
              previousPage="/myapplications/next-of-kin"
            />
          </div>
        )}
      </div>
    </div>
  );
}

const matchDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      propagatePopup,
      getUserApplications,
    },
    dispatch
  );
};
const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
    currentApplication: state.application.currentApplication,
  };
};

export default connect(
  mapStateToProps,
  matchDispatchToProps
)(ApplicationReview);
