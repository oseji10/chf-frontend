import { useState, useEffect } from "react";
import { useHistory } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { propagatePopup } from "../../../redux/popup/popup.action";
import {handleSetCurrentApplication} from "../../../redux/application/application.action";
import PageTitle from "../../../components/pageTitle/pageTitle";
import CustomForm from "../../../components/form/form";
import ModalMessage from "../../../components/message/ModalMessage";
import PageNumber from "../../../components/pagenumber/pageNumber";
import TermsAndConditions from "../../../components/terms-conditions/termsAndConditions";
import API from "../../../config/chfBackendApi";
import Label from "../../../components/form2/label/label";
import Select from "../../../components/form2/select/select";
import Input from "../../../components/form2/input/input";
import Button from "../../../components/button";
import { minLength } from "../../../utils/validation.uitls";
import PageSpinner from "../../../components/spinner/pageSpinner";
import { formatErrors } from "../../../utils/error.utils";

const initial_state = {
  termsAndConditions: null,
  formData: {},
  isSubmitting: false,
  isCreate: true,
  pageLoading: true,
  showTermsModal: false,
};

function PersonalInformation() {
  const [state, setState] = useState(initial_state);
  const { currentApplication } = useSelector(state => state).application;
  const history = useHistory();
  const dispatch = useDispatch();

  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, []);

  const loadData = async () => {
    try {
      const res = await Promise.all([
        API.get(`/api/sitesettings/application_terms_condition`).catch((e) => {
          console.log("Site settings in personal information", e);
        }),
        API.get(`/api/patient/application/active/personal-information`).catch(
          (e) => {
            console.log("Personal information", e);
          }
        ),
      ]);

      setState((prevState) => ({
        ...prevState,
        termsAndConditions: res[0].data.data,
        formData: res[1].data.data ? res[1].data.data : {},
        isCreate: res[1].data.data ? false : true,
        showTermsModal:  res[1].data.data ? false : true,
      }));

    } catch (e) {}finally{
      setStateValue('pageLoading',false);
    }
  };

  const handleFormValidation = () => {
    const errors = [];
    if (!state.formData.gender) errors.push("Gender not selected.");
    if (!state.formData.ethnicity) errors.push("Ethnicity not selected.");
    if (!state.formData.marital_status)
      errors.push("Marital status not selected.");
    if (!state.formData.marital_status)
      errors.push("Marital status not selected.");
    if (isNaN(parseInt(state.formData.no_of_children)))
      errors.push("A value is required for number of children.");
    if (!state.formData.level_of_education)
      errors.push("Level of education not selected");
    if (!state.formData.religion) errors.push("Religion not selected");
    if (!minLength(state.formData.occupation, 3))
      errors.push("A valid occupation is required");

    return errors.join(" ");
  };

  const handleAcceptTerms = () => {
    setStateValue("showTermsModal", false);
  };

  const handleDeclineTerms = () => {
    history.replace("/myapplications");
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
       res= await API.post('/api/patient/application/personal-information',state.formData);
       dispatch(handleSetCurrentApplication({...currentApplication, personalInformation:res.data.data})); 
       return res;
      }
       res= await API.put(`/api/patient/application/personal-information/${state.formData.id}`,state.formData);
       dispatch(handleSetCurrentApplication({...currentApplication, personalInformation: res.data.data}));
       return res;  
    }catch(e){
      console.log(e.response);
      throw e;
    }
  };

  const handleContinue = async () => {
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
        content: "Personal Information Submitted successfully",
        title: "Success",
        type: "success",
        timeout: 5000,
      })
    );

      // redirect to the nextpage
      history.push('/myapplications/patient-information');
    } catch (e) {
      console.log(e);
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
        content: "Personal Information saved",
        title: "Success",
        type: "success",
        timeout: 5000,
      })
    );

      // redirect to application index page
      history.push('/myapplications');
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
  return (
    <div className="container">
      <div className="row">
        <div className="col-sm-12">
          {(state.isSubmitting || state.pageLoading) && <PageSpinner />}
          {/* TERMS AND CONDITION BEFORE STARTING */}
          <ModalMessage
            title="Terms and Conditions"
            show={state.showTermsModal}
            onHide={() => setStateValue("showTermsModal", false)}
            dismissible={false}
          >
            <TermsAndConditions
              termsAndConditions={
                state.termsAndConditions && state.termsAndConditions.value
              }
              onAccept={handleAcceptTerms}
              onDecline={handleDeclineTerms}
            />
          </ModalMessage>

          {/* Form to fill */}
          <div className="row">
            <div className="col-md-2"></div>
            <div className="col-md-8">
              <PageTitle title="Personal information" />
              <CustomForm
                description="Provide accurate information about yourself below"
                onSubmit={handleContinue}
              >
                <div>
                  <Label label="Patient’s NHIS no (optional)" />
                  <Input
                    type={"text"}
                    value={state.formData.nhis_no}
                    placeholder={"NHIS number"}
                    onChange={(e) =>
                      handleFormDataValue(e.target.name, e.target.value)
                    }
                    name={"nhis_no"}
                  />
                </div>
                <div>
                  <Label label="Gender" />
                  <Select
                    name="gender"
                    data={[
                      { label: "Female", value: "Female" },
                      { label: "Male", value: "Male" },
                    ]}
                    defaultValue={state.formData.gender}
                    searchable={true}
                    onChange={handleSelectChange}
                  />
                </div>
                <div>
                  <Label label="Ethnicity" />
                  <Input
                    name="ethnicity"
                    type={"text"}
                    value={state.formData.ethnicity}
                    placeholder={"e.g Hausa"}
                    onChange={(e) =>
                      handleFormDataValue(e.target.name, e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label label="Marital Status" />
                  <Select
                    name="marital_status"
                    data={[
                      { label: "Single", value: "Single" },
                      { label: "Married", value: "Married" },
                      { label: "Seperated", value: "Seperated" },
                      { label: "Divorced", value: "Divorced" },
                      { label: "Widowed", value: "Widowed" },
                    ]}
                    defaultValue={state.formData.marital_status}
                    searchable={true}
                    onChange={handleSelectChange}
                  />
                </div>
                <div>
                  <Label label="Number of children (enter 0 if not applicable)" />
                  <Input
                    name="no_of_children"
                    type={"number"}
                    value={state.formData.no_of_children}
                    placeholder={"1"}
                    onChange={(e) =>
                      handleFormDataValue(e.target.name, e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label label="Level of education" />
                  <Select
                    name="level_of_education"
                    data={[
                      { label: "None", value: "None" },
                      { label: "Primary", value: "Primary" },
                      { label: "Secondary", value: "Secondary" },
                      { label: "Tertiary", value: "Tertiary" },
                      { label: "Post tertiary", value: "Post tertiary" },
                    ]}
                    searchable={true}
                    defaultValue={state.formData.level_of_education}
                    onChange={handleSelectChange}
                  />
                </div>
                <div>
                  <Label label="Religion" />
                  <Select
                    name="religion"
                    data={[
                      { label: "Christianity", value: "Christianity" },
                      { label: "Islam", value: "Islam" },
                      { label: "Traditional", value: "Traditional" },
                      { label: "Others", value: "Others" },
                    ]}
                    defaultValue={state.formData.religion}
                    searchable={true}
                    onChange={handleSelectChange}
                  />
                </div>
                <div>
                  <Label label="Occupation" />
                  <Input
                    name="occupation"
                    type={"text"}
                    value={state.formData.occupation}
                    placeholder={"e.g Public service"}
                    onChange={(e) =>
                      handleFormDataValue(e.target.name, e.target.value)
                    }
                  />
                </div>

                <div className="d-flex my-4">
                  <Button
                    btnClass={"mr-auto btn btn-success"}
                    type={"button"}
                    value="Save and continue"
                    onClick={handleContinue}
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

          {/* Has a footer */}
           <PageNumber
            pageNumber={"1 of 8"}
            nextPage={!state.isCreate && "/myapplications/patient-information"}
          />
        </div>
      </div>
    </div>
  );
}



export default PersonalInformation;
