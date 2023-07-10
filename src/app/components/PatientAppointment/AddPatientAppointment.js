import Button from "../button";
import Input from "../form2/input/input";
import TextArea from "../form/textarea";
import Select from "../form2/select/select";
import AlertText from "../message/alertText";
import Label from "../form2/label/label";
import { formatAsMoney } from "../../utils/money.utils";
import { appointmentTime } from "../../utils/appointmentTime.utils";

export function AddPatientAppointment({
  patient,
  setStateValue,
  handleSelectChange,
  searchPatientValue,
  coes,
  handleSubmit,
}) {
  const chf_id =
    patient.hasOwnProperty("patient") && patient.patient.chf_id
      ? patient.patient.chf_id
      : "";
  const handleInputChange = (e) => {
    setStateValue(e.target.name, e.target.value);
  };

  return (
    <form className="row" onSubmit={handleSubmit}>
      <div className="col-md-2"></div>
      <div className="col-md-8">
        {patient.hasOwnProperty("wallet") && patient.wallet.balance ? (
          <div>
            <h6> Appointment schedule for: {chf_id}</h6>
            <h6>
              {" "}
              Wallet balance: NGN {formatAsMoney(patient.wallet.balance)}
            </h6>
            <hr/>
            <Label label="Hospital(COE) to visit on chosen appointment date" />
            <small className="text-warning">
              Choose a different hospital if you are referring this patient
            </small>
            <Select
              name="coe_to_visit"
              data={coes}
              searchable={true}
              onChange={handleSelectChange}
            />
            <Label label="Apppointment date" />
            <Input
              name="appointment_date"
              type={"date"}
              placeholder={"Appointment date"}
              onChange={handleInputChange}
            />
            <Label label="Apppointment time" />
            <Select
              name="appointment_time"
              data={appointmentTime}
              searchable={true}
              onChange={handleSelectChange}
            />
            <Label label="Appointment note" />
            <TextArea
              inputName="coe_staff_comment"
              placeholder={"Appointment note"}
              onChange={handleInputChange}
            />
            <Button
              btnClass={"mt-4 btn btn-success"}
              type={"submit"}
              value="Add"
            />
          </div>
        ) : searchPatientValue && chf_id ? (
          <div>
            {
              <AlertText
                message={
                  "Patient with ID: " +
                  chf_id +
                  " has NGN 0 in his wallet and cannot be scheduled for appointment."
                }
                alertType="danger"
              />
            }
          </div>
        ) : (
          <div>
            {
              <AlertText
                message={"Search a valid patient to schedule appointment"}
                alertType="danger"
              />
            }
          </div>
        )}
      </div>
      <div className="col-md-2"></div>
    </form>
  );
}

export default AddPatientAppointment;
