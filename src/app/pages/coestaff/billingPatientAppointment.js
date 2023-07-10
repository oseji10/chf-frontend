import { useState, useEffect } from "react";
import Card from "../../components/card/card";
import Tabs from "../../components/tabs2/Tabs";
import { useDispatch } from "react-redux";
import PageSpinner from "../../components/spinner/pageSpinner";
import { propagatePopup } from "../../redux/popup/popup.action";
import API from "../../config/chfBackendApi";
import Input from "../../components/form2/input/input";
import ViewPatientAppointments from "../../components/PatientAppointment/ViewPatientAppointments";
import Button from "../../components/button";

const initialState = {
  patientAppointments: [],
  coes: [],
  pageLoading: false,
  filter_date: new Date(),
};

function BillingPatientAppointment({patient_id}) {
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
            `/api/schedule/coestaff/patient/${patient_id}/appointment?appointment_date=${state.filter_date}`
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
        `/api/schedule/coestaff/patient/${patient_id}/appointment?appointment_date=${state.filter_date}`
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
        <div label="View appointment schedule">
          <Card>
            <div className="row">
              <div className="col-md-10 d-flex">
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
            </div>
            <ViewPatientAppointments
              patientAppointments={state.patientAppointments}
              coes={prepareCoeData}
              updatePatientAppointment={updatePatientAppointment}
            />
          </Card>
        </div>
    </div>
  );
}


export default BillingPatientAppointment;
