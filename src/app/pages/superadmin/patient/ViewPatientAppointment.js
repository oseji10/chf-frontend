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
import Input from "../../../components/form2/input/input";
import ViewPatientAppointments from "../../../components/PatientAppointment/ViewPatientAppointments";
import Button from "../../../components/button";

const initialState = {
  patient: {},
  currentAppointment: {},
  patientAppointments: [],
  coes: [],
  searchPatientValue: "",
  patientSearched: false,
  pageLoading: false,
  filter_date: "",
};

function AppointmentSchedule() {
  const [state, setState] = useState(initialState);
  const dispatch = useDispatch();

  // Run this use effect to set patientId
  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, []);

  const loadData = async () => {
    setStateValue("pageLoading", true);
    try {
      const res = await Promise.all([
        API.get(`/api/coes`),
        API.get(
          `/api/schedule/coestaff/patient/appointment`
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

  const handlefilterByDate = async (e) => {
    setStateValue("pageLoading", true);
    e.preventDefault();
    try {
      const res = await API.get(
        `/api/schedule/coestaff/patient/appointment?appointment_date=${state.filter_date}`
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

  const prepareCoeData = state.coes.map((coe) => ({
    label: coe.coe_name,
    value: coe.id,
  }));

  const updatePatientAppointment=(value)=>{
    setState(prevState=>({
      ...prevState,
      patientAppointments: [...prevState.patientAppointments.filter(appointment=>appointment.id!==value.id), value],
    }))
  }

  return (
    <div className="container">
      {(state.pageLoading) && <PageSpinner />}
      <Tabs active="View appointment schedule">
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
  );
}


export default AppointmentSchedule;
