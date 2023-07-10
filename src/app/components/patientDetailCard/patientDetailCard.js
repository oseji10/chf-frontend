import { ConstantUtility, DataFormatUtility, DateUtility } from '../../utils';
import styles from './patientDetailCard.module.scss'
const PatientDetailCard = ({patient}) => {
    return  <>
        <div className="d-flex justify-content-end">
          <small
            className={[
              styles.status,
              !patient.application_review
                ? styles.warning
                : patient.application_review.status === "approved"
                ? styles.success
                : styles.danger,
            ].join(" ")}
          >
            {!patient.application_review
              ? "pending"
              : patient.application_review.status}
          </small>
        </div>
        <h6>
            {DataFormatUtility.printDataKeyOrAlternateString(patient.ailment,'ailment_type',"No Ailment")} (Stage: {DataFormatUtility.stringOrAlternateString(patient.ailment_stage,ConstantUtility.NOT_COMPLETED)})
        </h6>
        <small className="d-block">
          <b>Application Date</b>{" "}
        </small>
        <div className={styles.status_container}>
          <small>{DateUtility.timestampToRegularTime(patient.created_at)}</small>
        </div>
        <div className={styles.flex_cc}>
          <small>
            <strong>CHF ID:</strong>
          </small>
          <small>{patient.chf_id}</small>
        </div>
        <div className={styles.flex_cc}>
          <small>
            <strong>Age:</strong>
          </small>
          <small>{DateUtility._calculateAge(patient.user.date_of_birth)}</small>
        </div>

        <div className={styles.flex_cc}>
          <small>
            <strong>ID Type:</strong>
          </small>
          <small>National ID</small>
        </div>
        {patient.state && (
          <div className={styles.flex_cc}>
            <small>
              <strong>State of origin:</strong>
            </small>
            <small>{state.patient.state.state}</small>
          </div>
        )}
        {patient.state_of_residence && (
          <div className={styles.flex_cc}>
            <small>
              <strong>State of residence:</strong>
            </small>
            <small>{patient.state_of_residence.state}</small>
          </div>
        )}
        {patient.city && (
          <div className={styles.flex_cc}>
            <small>
              <strong>City:</strong>
            </small>
            <small>{patient.city}</small>
          </div>
        )}
        {patient.address && (
          <div className={styles.flex_cc}>
            <small>
              <strong>Address:</strong>
            </small>
            <small>{patient.address}</small>
          </div>
        )}

        <small className="d-block mt-2">
          <strong>COE</strong>
        </small>
        <small className="mb-2">{patient.coe.coe_name}</small>
        <div className={styles.footer}>
          <div>&nbsp;</div>
        </div>
      </>
}

export default PatientDetailCard;