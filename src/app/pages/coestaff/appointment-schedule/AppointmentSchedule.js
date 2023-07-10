import { useState, useEffect } from "react";
import Card from "../../../components/card/card";
import Label from "../../../components/form2/label/label";
import InlineSearchBox from "../../../components/form/inlinesearchbox";
import Tabs from "../../../components/tabs2/Tabs";
import { connect, useDispatch } from "react-redux";
import PageSpinner from "../../../components/spinner/pageSpinner";
import { propagatePopup } from "../../../redux/popup/popup.action";
import API from "../../../config/chfBackendApi";
import { formatErrors } from "../../../utils/error.utils";
import AddPatientAppointment from "../../../components/PatientAppointment/AddPatientAppointment";
import Input from "../../../components/form2/input/input";
import ViewPatientAppointments from "../../../components/PatientAppointment/ViewPatientAppointments";
import Button from "../../../components/button";

const initialState = {
  patient: {},
  currentAppointment: {},
  patientAppointments: [],
  staff_coe_id: "",
  coes: [],
  searchPatientValue: "",
  appointment_date: "",
  appointment_time: "",
  coe_to_visit: "",
  coe_staff_comment: "",
  patientSearched: false,
  isSubmitting: false,
  pageLoading: false,
  filter_date: "",
};

function AppointmentSchedule({ user }) {
  const [state, setState] = useState(initialState);
  const dispatch = useDispatch();

  // Run this use effect to set patientId
  useEffect(() => {
    setStaffCoeId();
    // eslint-disable-next-line
  }, [state.pageLoading]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, [state.staff_coe_id]);

  const setStaffCoeId = () => {
    if (user) {
      setState((prevState) => ({
        ...prevState,
        staff_coe_id: user.user.coe_id,
      }));
    }
  };

  const loadData = async () => {
    setStateValue("pageLoading", true);
    try {
      const res = await Promise.all([
        API.get(`/api/coes`),
        API.get(
          `/api/schedule/coestaff/${user.user.coe_id}/patient/appointment`
        ),
      ]);

      setState((prevState) => ({
        ...prevState,
        coes: res[0].data.data,
        patientAppointments: res[1].data.data,
      }));
    } catch (e) {
    } finally {
      setStateValue("pageLoading", false);
    }
  };

  const setStateValue = (key, value) => {
    setState((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  const handleSelectChange = (field, value) => {
    setStateValue(field, value);
  };

  const handlefilterByDate = async (e) => {
    setStateValue("pageLoading", true);
    e.preventDefault();
    try {
      const res = await API.get(
        `/api/schedule/coestaff/${user.user.coe_id}/patient/appointment?appointment_date=${state.filter_date}`
      );
      setState((prevState) => ({
        ...prevState,
        pageLoading: false,
        patientAppointments: res.data.data,
      }));
    } catch (e) {
      setState((prevState) => ({
        ...prevState,
        patientAppointments: [],
      }));
      dispatch(
        propagatePopup({
          content: "Patient not found",
          title: "Not found",
          type: "danger",
          timeout: 5000,
        })
      );
    } finally {
      setStateValue("pageLoading", false);
    }
  };

  const handleViewByPatient = async (e) => {
    e.preventDefault();
    setStateValue("pageLoading", true);
    try {
      const res = await API.get(
        `/api/coestaff/patient/${state.searchPatientValue}`
      );

      if (res.data.data) {
        const appointmentRes = await API.get(
          `/api/schedule/coestaff/patient/${res.data.data.patient.id}/appointment?appointment_date=${state.filter_date}`
        );
        setState((prevState) => ({
          ...prevState,
          patientAppointments: appointmentRes.data.data,
        }));
      }
    } catch (e) {
      setState((prevState) => ({
        ...prevState,
        patientAppointments: [],
      }));
      dispatch(
        propagatePopup({
          content: formatErrors(e),
          title: "Not found",
          type: "danger",
          timeout: 5000,
        })
      );
    } finally {
      setStateValue("pageLoading", false);
    }
  };

  const handlePatientSearch = async (e) => {
    setStateValue("pageLoading", true);
    try {
      e.preventDefault();
      const res = await API.get(
        `/api/coestaff/patient/${state.searchPatientValue}`
      );

      setState((prevState) => ({
        ...prevState,
        patient: res.data.data,
      }));
    } catch (e) {
      setState((prevState) => ({
        ...prevState,
        patient: {},
      }));
      dispatch(
        propagatePopup({
          content: "Patient not found",
          title: "Not found",
          type: "danger",
          timeout: 5000,
        })
      );
    } finally {
      setStateValue("pageLoading", false);
    }
  };

  const prepareCoeData = state.coes.map((coe) => ({
    label: coe.coe_name,
    value: coe.id,
  }));

  const handleFormValidation = () => {
    const errors = [];
    if (!state.appointment_date)
      errors.push("Please select an appointment date");
    if (!state.appointment_time)
      errors.push("Please select an appointment date");
    if (!state.coe_staff_comment)
      errors.push("Kindly provide an appointment note for this visit");

    return errors.join(" ");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setStateValue("isSubmitting", true);

      //Validate form
      const error = handleFormValidation();
      if (!error) {
        const formData = {
          user_id: state.patient.id,
          appointment_date: state.appointment_date,
          appointment_time: state.appointment_time,
          coe_to_visit: state.coe_to_visit?state.coe_to_visit:user.user.coe_id,
          coe_staff_comment: state.coe_staff_comment,
          staff_id: user.user.id,
        };

        console.log(formData)
        // Submit form
        const res = await API.post(
          `/api/schedule/coestaff/patient/appointment`,
          formData
        );
        if (res) {
          //Add to state
          setState((prevState) => ({
            ...prevState,
            patientAppointments: [
              ...prevState.patientAppointments,
              res.data.data,
            ],
          }));

          //Dispatch success
          return dispatch(
            propagatePopup({
              content:
                "Patient appointment added successfully. The patient will receive an email notification to this effect.",
              title: "Success",
              type: "success",
              timeout: 5000,
            })
          );
        }
      }
      dispatch(
        propagatePopup({
          content: error,
          title: "Error",
          type: "danger",
          timeout: 5000,
        })
      );
    } catch (e) {
      // console.log(e);
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

  const updatePatientAppointment = (value) => {
    setState((prevState) => ({
      ...prevState,
      patientAppointments: [
        ...prevState.patientAppointments.filter(
          (appointment) => appointment.id !== value.id
        ),
        value,
      ],
    }));
  };

  return (
    <>
      {user && (
        <div className="container">
          {(state.isSubmitting || state.pageLoading) && <PageSpinner />}
          <Tabs active="Add Patient Schedule">
            <div label="Add Patient Schedule">
              <Card>
                <h3 className="mt-4 text-center">Add patient schedule</h3>
                <div className="row">
                  <div className="col-md-2"></div>
                  <div className="col-md-8">
                    <Label label="Patient (Enter patient's email or CHF ID to search)" />
                    <InlineSearchBox
                      inputValue={state.searchPatientValue}
                      inputPlaceholder="Search Patient"
                      inputName="searchPatientValue"
                      icon="search"
                      align="left"
                      onButtonClick={handlePatientSearch}
                      onInputChange={(e) => {
                        setStateValue(e.target.name, e.target.value);
                      }}
                      showCloseButton={state.patientSearched}
                    />
                  </div>
                  <div className="col-md-2"></div>
                </div>
                <AddPatientAppointment
                  patient={state.patient}
                  setStateValue={setStateValue}
                  handleSelectChange={handleSelectChange}
                  coes={prepareCoeData}
                  searchPatientValue={state.searchPatientValue}
                  handleSubmit={handleSubmit}
                />
              </Card>
            </div>
            <div label="View appointment schedule">
              <Card>
                <div className="row">
                  <div className="col-md-2"></div>
                  <div className="col-md-8 d-flex">
                    <Input
                      name="filter_date"
                      type={"date"}
                      placeholder={"Date of appointment"}
                      onChange={(e) => {
                        setStateValue(e.target.name, e.target.value);
                      }}
                    />
                    <Button
                      btnClass={"btn btn-success h-100"}
                      type={"button"}
                      value={<i className="fa fa-search"></i>}
                      onClick={handlefilterByDate}
                    />
                  </div>
                  <div className="col-md-2"></div>
                </div>
                <ViewPatientAppointments
                  patientAppointments={state.patientAppointments}
                  coes={prepareCoeData}
                  updatePatientAppointment={updatePatientAppointment}
                />
              </Card>
            </div>
            <div label="View appointment schedule by patient">
              <Card>
                <div className="row">
                  <div className="col-md-2"></div>
                  <div className="col-md-8">
                    <Label label="Patient (Enter patient's email or CHF ID to search)" />
                    <InlineSearchBox
                      inputValue={state.searchPatientValue}
                      inputPlaceholder="Search Patient"
                      inputName="searchPatientValue"
                      icon="search"
                      align="left"
                      onButtonClick={handleViewByPatient}
                      onInputChange={(e) => {
                        setStateValue(e.target.name, e.target.value);
                      }}
                      showCloseButton={state.patientSearched}
                    />
                  </div>
                  <div className="col-md-2"></div>
                </div>
                <ViewPatientAppointments
                  patientAppointments={state.patientAppointments}
                  coes={prepareCoeData}
                  updatePatientAppointment={updatePatientAppointment}
                />
              </Card>
            </div>
          </Tabs>
        </div>
      )}
    </>
  );
}
const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
  };
};

export default connect(mapStateToProps, null)(AppointmentSchedule);
