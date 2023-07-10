import { useState } from "react";
import styles from "./coestaff.module.scss";
import logo from "./../../../assets/images/logo.png";
import { formatAsMoney } from "../../utils/money.utils";
import API, { CAPBackendAPI } from "../../config/chfBackendApi";
import axios from "axios";
import MessageAlert from "../../components/message/messageAlert";
import { errorHandler } from "../../utils/error.utils";
import { errorAlert, successAlert } from "../../utils/alert.util";

export default function DrugInvoice(props) {
  const [state, setState] = useState({
    alert: "",
    alertVariant: "",
    submitText: "Complete",
    isSubmitted: false,
  });

  let total = 0;
  let product = [];
  let discount_percentage = 0;

  const handleAlert = (submitText, alert = "", alertVariant = "") => {
    setState((prev) => ({
      ...prev,
      alert: alert,
      alertVariant: alertVariant,
      submitText: submitText,
    }));
  };

  const completeDrugBilling = async () => {
    handleAlert("please wait while billing is processed");
    try {
      const coe = await API.get(`api/coes/${props.patient.patient.coe_id}`);
      if (total > props.patient?.wallet?.balance) {
        return errorAlert(
          "Patient does not have enough funds",
          );
        } else if (coe) {
        const newPurchase = {
          hospitalId: coe.data?.data?.coe_id_cap,
          is_cap: 1,
          patientId: props.patient?.patient?.user_id,
          chfId: props.patient?.patient?.chf_id,
          phoneNumber: props.patient?.phone_number,
          dateOfBirth: props.patient?.date_of_birth,
          email: props.patient?.email,
          address: props.patient?.patient?.address,
          stateOfOrigin: props.patient?.patient?.state?.state,
          stateOfResidence: props.patient?.patient?.state_of_residence?.state,
          ailmentType: props.patient?.patient?.ailment?.ailment_type,
          ailmentStage: props.patient?.patient?.ailment_stage,
          gender: props.patient?.gender,
          firstName: props.patient?.first_name,
          lastName: props.patient?.last_name,
          otherNames: props.patient?.middle_name,
          products: product,
        };
        const resCAP = await CAPBackendAPI.post('/transaction/chf', newPurchase);
        await submitBill(resCAP.data?.data.transactionId);
        // return console.log(resCAP);
          // console.log(resCAP);
        // ERROR IS "0" WHEN CAP TRANSACTION IS SUCCESSFULL. TO CATCH CAP ERROR, THIS GUARD IS USED.
        // if (resCAP.data.error!=="0") {
        //   console.log( resCAP.data)
        //   return handleAlert("Complete", resCAP.data.message, "danger");
        // } else {
        //   // console.log("In here. There is error");
        
        // }
      }
    } catch (e) {
      console.log(e)
      return errorHandler(e);
      console.log(e);
      handleAlert(
        "Complete",
        "Unable to process billing. Check your internet and try again",
        "danger"
      );
    }
  };

  const submitBill = async (order_id) => {
    try {
      if (!state.isSubmitted) {
        const res = await API.post("/api/coestaff/drugbillings", {
          patient_id: props.patient?.patient?.user_id,
          order_id: order_id,
          comment: props.comment,
          documents: props.files,
          drugs: props.selectedDrugs.map((drug) => ({
            service_category_id: "4",
            ...drug,
          })),
        });
        // console.log(res);
        setState((prevState) => ({
          isSubmitted: true,
        }));
        successAlert( res.data?.message);
        if (props.successCallback && typeof props.successCallback === 'function') {
          props.successCallback();
        }
      } else {
        errorAlert(
          "This drug billing has been completed. Billing is submitted only once.",
        );
      }
    } catch (e) {
      return errorHandler(e)
      handleAlert("Complete", e.response.data.message, "danger");
    }
  };

  return (
    <div className={styles.invoice_container}>
      <div className={`row ${styles.invoice_header}`}>
        <img src={logo} alt="" />
        <div>
          <span>Drug Billing Invoice</span>
          <span>Reference generated after transaction is completed</span>
        </div>
      </div>
      <div className={`row ${styles.row}`}>
        <div className="col-md-6">
          <h4>To</h4>
          <p>
            {props.patient.first_name} {props.patient.middle_name}{" "}
            {props.patient.last_name}
          </p>
          <p>{props.patient.address}</p>
          <p>{props.patient.phone_number}</p>
        </div>
        <div className="col-md-6">
          <h4>From</h4>
          <p>New Federal Secretariat Complex,</p>
          <p>Ahmadu Bello Way, Phase III</p>
          <p>FCT, Abuja.</p>
        </div>
      </div>
      <div className={`table table-responsive-sm row  ${styles.row}`}>
        <div className="col-12">
          <div className="row">
            <div className="col-md-3">
              <h4>Drug name</h4>
            </div>
            <div className="col-md-3">
              <h4>Description</h4>
            </div>
            <div className="col-md-2">
              <h4>Manufacturer</h4>
            </div>
            <div className="col-md-2">
              <h4>Price</h4>
            </div>
            <div className="col-md-2">
              <h4>Quantity</h4>
            </div>
          </div>
        </div>

        {props.selectedDrugs.map((drug, index) => {
          const cost = parseFloat(drug.drug?.price ?? 0);
          total += cost * parseFloat(drug.quantity);
          product.push({
            ...drug.drug,
            qty: drug.quantity,
          });
          return (
            <div className="col-12" key={`${index}${drug.drug.prod_id}`}>
              <div className="row">
                <div className="col-md-3">
                  <p>{drug.drug?.productName}</p>
                </div>
                <div className="col-md-3">
                  <p>{drug.drug?.description}</p>
                </div>
                <div className="col-md-2">
                  <p>{drug.drug?.manufacturer?.manufacturerName}</p>
                </div>
                <div className="col-md-2">
                  <p>
                    <del>N</del> {formatAsMoney(cost)}
                  </p>
                </div>
                <div className="col-md-2">
                  <p>{drug.quantity}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className={`row  ${styles.row} ${styles.scrollable_x}`}>
        <div className="col-md-2">
          <h4>Total Payable</h4>
        </div>
        <div className="col-md-8"></div>
        <div className="col-md-2">
          <h4>
            <del>N</del> {formatAsMoney(total)}
          </h4>
        </div>
      </div>
      <div className={`row  ${styles.row}`}>
        <div className="col-12">
          <small>
            <strong>
              <em className="text-danger">
                Note: By clicking on the complete button, patient will receive email and SMS notification for this transaction.
              </em>
            </strong>
          </small>
        </div>
      </div>
      <div className={`row  ${styles.row}`}>
        <div className="col-12">
          <small>
            <strong>
              <em>Comment: {props.comment ? props.comment : "No comment"}</em>
            </strong>
          </small>
        </div>
      </div>
      {state.alert && (
        <MessageAlert
          alertMessage={state.alert}
          alertVariant={state.alertVariant}
        />
      )}
      <div className={`row  ${styles.invoice_footer}`}>
        <button
          className="btn btn-sm btn-success"
          onClick={completeDrugBilling}
        >
          {state.submitText}
        </button>
        {state.alertVariant === "success" ? (
          <button
            className="btn btn-sm btn-secondary"
            onClick={props.parentState}
          >
            Back to billing
          </button>
        ) : (
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => props.onPreviewBilling(false)}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
