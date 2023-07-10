import styles from "./../../pages/superadmin/coe/coe.module.scss";
import Button from "../button";
import MessageAlert from "../message/messageAlert";



const NewCoeStaff=({ cancel, staff }) =>{
 
  return (
    <div className="row">
      <div className={`col-md-2`}></div>
      <div className={`col-md-8 shadow-sm mt-5 ` + styles.selected_coehelpdesk}>
        
          <MessageAlert
            alertMessage="New staff created and displayed below:"
            alertVariant="success"
            alertLink={{}}
          />
        <p>
          <small>
            <strong>
              Staff name: {staff && `${staff.first_name} ${staff.last_name}`}
            </strong>
          </small>
        </p>
        <p>
          <small>
            <strong>
              New staff role:{" "}
              {staff && staff.roles.length && `${staff.roles[0].role}`}
            </strong>
          </small>
        </p>
        <Button
          value="Close"
          btnClass="btn btn-success py-2 px-3"
          type="button"
          onClick={cancel}
        />
      </div>
      <div className={`col-md-2`}></div>
    </div>
  );
}

export default NewCoeStaff;
