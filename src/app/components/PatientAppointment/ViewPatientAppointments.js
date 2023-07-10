import { useState } from "react";
import AlertText from "../message/alertText";
import HTable from "../table/HTable";
import Button from "../button";
import ModalMessage from "../message/ModalMessage";
import { timestampToRegularTime } from "../../utils/date.util";
import API from "../../config/chfBackendApi";
import { formatErrors } from "../../utils/error.utils";
import { useDispatch } from "react-redux";
import PageSpinner from "../spinner/pageSpinner";
import { propagatePopup } from "../../redux/popup/popup.action";
import Input from "../form2/input/input";
import TextArea from "../form/textarea";
import Select from "../form2/select/select";
import Label from "../form2/label/label";
import { appointmentTime } from "../../utils/appointmentTime.utils";
import AuthorizedOnlyComponent from "../authorizedOnlyComponent";

const tableHeaders = [
  { value: "CHF ID" },
  { value: "APPOINTMENT DATE" },
  { value: "APPOINTMENT TIME" },
  { value: "APPOINTMENT NOTE" },
  { value: "CREATED BY" },
  { value: "AVAILABILITY STATUS" },
  { value: "STATUS" },
];

const initialState = {
  id: "",
  appointment_date: "",
  appointment_time: "",
  coe_to_visit: "",
  coe_staff_comment: "",
  is_confirmed: "0",
  status: "pending",
  confirmAction: "",
  showConfirmModal: false,
  showEditModal: false,
};

const ViewPatientAppointments = ({
  patientAppointments,
  coes,
  updatePatientAppointment,
}) => {
  const [state, setState] = useState(initialState);
  const dispatch = useDispatch();

  const handleMarkFulfilled = (data) => {
    if (data.is_confirmed === "0") {
      return dispatch(
        propagatePopup({
          content:
            "The availibility of patient for this appointment has not been confirmed. Kindly advise patient to call EMGE resources and confirm availibility",
          title: "Error notice",
          type: "danger",
          timeout: 5000,
        })
      );
    }
   
    setEditForm({...data,status : "fulfilled",confirmAction : "fulfiled",showConfirmModal : true});
  };

  const handleConfirmAvailability = (data) => {
   
    setEditForm({...data,is_confirmed : "1",confirmAction : "confirm",showConfirmModal : true});
  };

  const setEditForm = (appointment) => {
    if (appointment.confirmAction!=="confirm" && appointment.confirmAction!=="fulfiled") setStateValue("showEditModal", true);
    setState((prevState) => ({
      ...prevState,
      ...appointment,
    }));
  };

  const resetEditForm = () => {
    setState(initialState);
  };

  const handleEditAppointment = async () => {
    try {
      //Check before sending
      if (
        state.appointment_date &&
        state.appointment_time &&
        state.coe_staff_comment
      ) {
        //It is ok to send data now
        const data = {
          id: state.id,
          appointment_date: state.appointment_date,
          appointment_time: state.appointment_time,
          coe_to_visit: state.coe_to_visit,
          coe_staff_comment: state.coe_staff_comment,
          is_confirmed: state.is_confirmed,
          status: state.status,
        };

        const res = await API.put(
          `/api/schedule/coestaff/patient/appointment/${state.id}`,
          data
        );

        updatePatientAppointment(res.data.data);

        return dispatch(
          propagatePopup({
            content: "Appointment changed",
            title: "Success",
            type: "success",
            timeout: 5000,
          })
        );
      }
      dispatch(
        propagatePopup({
          content: "Please fill all fields",
          title: "Error",
          type: "danger",
          timeout: 5000,
        })
      );
    } catch (e) {
      dispatch(
        propagatePopup({
          content: formatErrors(e),
          title: "Error",
          type: "danger",
          timeout: 5000,
        })
      );
    } finally {
      resetEditForm();
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

  return (
    <>
      {patientAppointments.length ? (
        <HTable>
          <thead>
            <tr>
              <th>SN</th>
              {tableHeaders &&
                tableHeaders.map((header, index) => (
                  <th key={`h-${index}`}>{header.value}</th>
                ))}
            </tr>
          </thead>
          <tbody>
            {patientAppointments &&
              patientAppointments.map((data, index) => (
                <tr key={index}>
                  <td>{++index}</td>
                  <td>{data.patient.chf_id}</td>
                  <td>{timestampToRegularTime(data.appointment_date)}</td>
                  <td>{data.appointment_time}</td>
                  <td>{data.coe_staff_comment}</td>
                  <td>
                    {data.staff
                      ? `${data.staff.first_name} ${data.staff.last_name}`
                      : ""}
                  </td>
                  <td>
                    {data.is_confirmed === "0" ? (
                      <>
                        <span className="text-danger"><strong>Not confirmed</strong></span>
                        <AuthorizedOnlyComponent requiredPermission="SET_AVAILABILITIY_PATIENT_APPOINTMENT">
                            <Button
                          btnClass={"m-1 btn btn-warning"}
                          type={"button"}
                          value={
                            <i className="fa fa-check">Mark as confirmed</i>
                          }
                          onClick={() => {
                            handleConfirmAvailability(data);
                          }}
                        /></AuthorizedOnlyComponent>
                      </>
                    ) : (
                      <span className="text-success"><strong>Confirmed</strong></span>
                    )}
                  </td>
                  <td>
                    {data.status === "pending" ? (
                      <div>
                          <span className="text-warning text-bold"><strong>pending</strong></span>
                         <AuthorizedOnlyComponent requiredPermission="EDIT_PATIENT_APPOINTMENT"><Button
                          btnClass={"btn btn-info m-1 "}
                          type={"button"}
                          value={<i className="fa fa-edit"></i>}
                          onClick={() => {
                            setEditForm(data);
                          }}
                        /></AuthorizedOnlyComponent>
                         <AuthorizedOnlyComponent requiredPermission="FULFIL_PATIENT_APPOINTMENT"><Button
                          btnClass={"btn btn-warning"}
                          type={"button"}
                          value={
                            <i className="fa fa-check">Mark as Fulfiled</i>
                          }
                          onClick={() => {
                            handleMarkFulfilled(data);
                          }}
                        /></AuthorizedOnlyComponent>
                      </div>
                    ) : (
                      <span className="text-success">Fulfiled</span>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </HTable>
      ) : (
          <div className="mt-3">
        <AlertText message="No appointment schedule found" alertType="danger" /></div>
      )}
      <ModalMessage
        title="Edit Appointment"
        show={state.showEditModal}
        onHide={() => setStateValue("showEditModal", false)}
        dismissible={false}
      >
        {state.isSubmitting && <PageSpinner />}
        {state.coe_to_visit && (
          <Label
            label={`Hospital(COE) to visit on chosen appointment date: ${
              coes.find((coe) => coe.value === state.coe_to_visit).label
            }`}
          />
        )}
        <small className="text-warning">
          Choose a different hospital if you are referring this patient
        </small>
        <Select
          name="coe_to_visit"
          data={coes}
          searchable={true}
          onChange={handleSelectChange}
        />
        <Label
          label={`Apppointment date: ${timestampToRegularTime(
            state.appointment_date
          )}`}
        />
        <Input
          name="appointment_date"
          type={"date"}
          placeholder={"Appointment date"}
          onChange={(e) => setStateValue(e.target.name, e.target.value)}
        />
        <Label label={`Apppointment time: ${state.appointment_time}`} />
        <Select
          name="appointment_time"
          data={appointmentTime}
          defaultValue={state.appointment_time}
          searchable={true}
          onChange={handleSelectChange}
        />
        <Label label="Appointment note" />
        <TextArea
          inputName="coe_staff_comment"
          placeholder={"Appointment note"}
          value={state.coe_staff_comment}
          onChange={(e) => setStateValue(e.target.name, e.target.value)}
        />
        <div className="d-flex my-4">
          <Button
            btnClass={"mr-auto btn btn-success"}
            type={"button"}
            value="Submit Changes"
            onClick={handleEditAppointment}
          />
          <Button
            btnClass={"btn btn-success"}
            type={"button"}
            value="Cancel"
            onClick={resetEditForm}
          />
        </div>
      </ModalMessage>
      <ModalMessage
        title="Are you sure you want to submit this form?"
        show={state.showConfirmModal}
        onHide={() => setStateValue("showConfirmModal", false)}
        dismissible={true}
      >
        <p>
          <small>
            Are you sure you want to{" "}
            {state.confirmAction === "confirm"
              ? "mark appointment as confirmed"
              : "mark appointment as fulfilled"}
            ?
          </small>
        </p>
        <div className="d-flex my-4">
          <Button
            btnClass={"mr-auto btn btn-success"}
            type={"button"}
            value="Confirm"
            onClick={handleEditAppointment}
          />
          <Button
            btnClass={"btn btn-success"}
            type={"button"}
            value="Cancel"
            onClick={resetEditForm}
          />
        </div>
      </ModalMessage>
    </>
  );
};

export default ViewPatientAppointments;
