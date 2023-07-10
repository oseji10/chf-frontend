import { useState, useEffect } from "react";
import { useHistory } from "react-router";
import { useDispatch } from "react-redux";
import { propagatePopup } from "../../../redux/popup/popup.action";
import PageTitle from "../../../components/pageTitle/pageTitle";
import CustomForm from "../../../components/form/form";
import API from "../../../config/chfBackendApi";
import Label from "../../../components/form2/label/label";
import Select from "../../../components/form2/select/select";
import Input from "../../../components/form2/input/input";
import TextArea from "../../../components/form/textarea";
import Button from "../../../components/button";
import PageSpinner from "../../../components/spinner/pageSpinner";
import { formatErrors } from "../../../utils/error.utils";
import {useQuery}  from "../../../hooks/useQuery";
import ModalMessage from "../../../components/message/ModalMessage";


const initial_state = {
  formData: {
    status:'active',
  },
  isSubmitting: false,
  showConfirmModal:false,
  isCreate: true,
  pageLoading: true,
  application: {},
};

function AddSocialAssessment() {
  const [state, setState] = useState(initial_state);
  const history = useHistory();
  const dispatch = useDispatch();
  let query = useQuery();
  const applicationId=query.get("patient_app");

useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await Promise.all([
        API.get(`/api/application/review/${applicationId}`).catch(
          (e) => {
            console.log("Support assessment", e);
          }
        ),
      ]);
      const socialAssessment=res[0].data.data.socialWorkerAssessment ?res[0].data.data.socialWorkerAssessment:{};
      setState((prevState) => ({
        ...prevState,
        formData: {...prevState.formData, ...socialAssessment},
        isCreate: res[0].data.data.socialWorkerAssessment ? false : true,
        application: res[0].data.data? res[0].data.data : {}
      }));

    } catch (e) {}finally{
      setStateValue('pageLoading',false);
    }
  };

  const handleFormValidation = async () => {
    const errors = [];
    if (!state.formData.appearance)
      errors.push("Select how the patient appeared.");
    if (!parseFloat(state.formData.bmi))
      errors.push("Enter patient bmi value");
    if (!state.formData.comment_on_home)
      errors.push("Please provide comment on patient's home.");
    if (!state.formData.comment_on_environment) errors.push("Please provide comment on patient's environment");
    if (!state.formData.comment_on_fammily)
      errors.push("Please provide comment on patient's family relationship.");
    
    return errors.join(" ");
  };

  const handleFormDataValue = (key, value) => {
    return setState((prevState) => ({
      ...prevState,
      formData: {
        ...prevState.formData,
        [key]: value,
      },
    }));
  };

  const setStateValue = (key, value) => {
    return setState((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  const handleSelectChange = (field, value) => {
    handleFormDataValue(field, value);
  };

  const submitForm = async () => {
    try{
      let res = null;
      if(state.isCreate){
       res= await API.post('/api/patient/application/social-worker-assessment',{...state.formData, application_review_id:applicationId});
       return res;
      }
       res= await API.put(`/api/patient/application/social-worker-assessment/${state.formData.id}`,state.formData);
       return res;  
    }catch(e){
      console.log(e.response);
      throw e;
    }
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
    try {
      setStateValue("isSubmitting", true);

      //Validate form
      const error =await handleFormValidation();
      if (error){
         return dispatch(
          propagatePopup({
            content: error,
            title: "Error",
            type: "danger",
            timeout: 5000,
          })
        );
      }

      // Submit form
     const res = await submitForm();

     //Dispatch success
     dispatch(
      propagatePopup({
        content: "Social worker assessment Submitted successfully for this application",
        title: "Success",
        type: "success",
        timeout: 5000,
      })
    );

      // redirect to the nextpage
      history.push('/social-worker/applications');
    } catch (e) {
      dispatch(
        propagatePopup({
          content: formatErrors(e),
          title: "Error",
          type: "danger",
          timeout: 5000,
        }));
    } finally {
      setStateValue("isSubmitting", false);
    }
  };

  const handleConfirm = async () => {
    handleFormDataValue("status", 'inactive');
      setStateValue("showConfirmModal", true);

  };

  const handleSave = async () => {
    try {
      setStateValue("isSubmitting", true);

      //Validate form
      const error = handleFormValidation();
      if (error){
         return dispatch(
          propagatePopup({
            content: error,
            title: "Error",
            type: "danger",
            timeout: 5000,
          })
        );
      }

      // Submit form
     const res = await submitForm();

     //Dispatch success
     dispatch(
      propagatePopup({
        content: "Social worker assessment saved for this application",
        title: "Success",
        type: "success",
        timeout: 5000,
      })
    );

      // redirect to application index page
      history.push('/social-worker/applications');
    } catch (e) {
      dispatch(
        propagatePopup({
          content: formatErrors(e),
          title: "Error",
          type: "danger",
          timeout: 5000,
        }));
    } finally {
      setStateValue("isSubmitting", false);
    }
  };

  const handleCancel = async () => {
      handleFormDataValue("status", 'inactive');
      setStateValue("showConfirmModal", false);

      //Dispatch success
      dispatch(
        propagatePopup({
          content:
            "Kindly submit your assessment of this patient as soon as possible. This information is needed by the approval committee for application decision.",
          title: "Important!",
          type: "info",
          timeout: 5000,
        })
      );
  };
  return (
    <div className="container">
      <div className="row">
        <div className="col-sm-12">
          {(state.isSubmitting || state.pageLoading) && <PageSpinner />}
          {/* Form to fill */}
          <div className="row">
            <div className="col-md-2"></div>
            <div className="col-md-8">
              <PageTitle title="Add Social Assessment for patient application" />

               {/* CONFIRMATION MODAL */}
            <ModalMessage
              title="Are you sure you want to submit this form?"
              show={state.showConfirmModal}
              onHide={() => setStateValue("showConfirmModal", false)}
              dismissible={false}
            >
              <div className="alert alert-warning">
                By submitting this application, you agree that all information provided are correct.
                This form once submitted cannot be changed. Ensure that you have thoroughly reviewed your answers because any wrong informaton is liable for prosecution. 
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
              <CustomForm
                description={`Provide correct answers to the following questions.`}
                onSubmit={handleConfirm}
              >
                  <div>
                  <Label label="Appearance: " />
                  <Select
                    name="appearance"
                    data={[
                      { label: "Clean", value: "Clean" },
                      { label: "Unkempt", value: "Unkempt" }
                    ]}
                    defaultValue={state.formData.appearance}
                    searchable={true}
                    onChange={handleSelectChange}
                  />
                </div>
                <div>
                  <Label label="BMI (wt/ht2)" />
                  <Input
                    name="bmi"
                    type={"text"}
                    value={state.formData.bmi}
                    placeholder={"bmi"}
                    onChange={(e) =>
                      handleFormDataValue(e.target.name, e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label label="Home visit report. Comments on the followings:  " />
                </div>
                <div>
                  <Label label="Home facilities: " />
                  <TextArea
                    inputName="comment_on_home"
                    value={state.formData.comment_on_home}
                    placeholder={""}
                    onChange={(e) =>
                      handleFormDataValue(e.target.name, e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label label="Environment/facilities: " />
                  <TextArea
                    inputName="comment_on_environment"
                    value={state.formData.comment_on_environment}
                    placeholder={""}
                    onChange={(e) =>
                      handleFormDataValue(e.target.name, e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label label="Family relationship: " />
                  <TextArea
                    inputName="comment_on_fammily"
                    value={state.formData.comment_on_fammily}
                    placeholder={""}
                    onChange={(e) =>
                      handleFormDataValue(e.target.name, e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label label="Other comments: " />
                  <TextArea
                    inputName="general_comment"
                    value={state.formData.general_comment}
                    placeholder={""}
                    onChange={(e) =>
                      handleFormDataValue(e.target.name, e.target.value)
                    }
                  />
                </div>
                <div className="d-flex my-4">
                  <Button
                    btnClass={"mr-auto btn btn-success"}
                    type={"button"}
                    value="Submit Assessment"
                    onClick={handleConfirm}
                  />
                  <Button
                    btnClass={"btn btn-success"}
                    type={"button"}
                    value="Save for later"
                    onClick={handleSave}
                  />
                </div>
              </CustomForm>
            </div>
            <div className="col-md-2"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default AddSocialAssessment;
