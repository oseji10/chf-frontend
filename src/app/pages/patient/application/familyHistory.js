import { useState, useEffect } from "react";
import { useHistory } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { propagatePopup } from "../../../redux/popup/popup.action";
import {handleSetCurrentApplication} from "../../../redux/application/application.action";
import PageTitle from "../../../components/pageTitle/pageTitle";
import CustomForm from "../../../components/form/form";
import PageNumber from "../../../components/pagenumber/pageNumber";
import API from "../../../config/chfBackendApi";
import Label from "../../../components/form2/label/label";
import Select from "../../../components/form2/select/select";
import Input from "../../../components/form2/input/input";
import Button from "../../../components/button";
import { minLength } from "../../../utils/validation.uitls";
import PageSpinner from "../../../components/spinner/pageSpinner";
import { formatErrors } from "../../../utils/error.utils";


const initial_state = {
  formData: {},
  isSubmitting: false,
  isCreate: true,
  pageLoading: true,
};

function FamilyHistory() {
  const [state, setState] = useState(initial_state);
  const { currentApplication } = useSelector(state => state).application;
  const history = useHistory();
  const dispatch = useDispatch();

useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await Promise.all([
        API.get(`/api/patient/application/active/family-history`).catch(
          (e) => {
            console.log("Family history", e);
          }
        ),
      ]);

      setState((prevState) => ({
        ...prevState,
        formData: res[0].data ? res[0].data : {},
        isCreate: res[0].data ? false : true,
      }));

    } catch (e) {}finally{
      setStateValue('pageLoading',false);
    }
  };

  const handleFormValidation = () => {
    const errors = [];
    if (!state.formData.family_set_up)
      errors.push("Please provide your family setup information.");
    if (!state.formData.family_size) errors.push("Family size not provided.");
    if (!state.formData.birth_order) errors.push("Birth order not provided.");
    if (!state.formData.father_education_status)
      errors.push("Father's education not provided.");
    if (!state.formData.mother_education_status)
      errors.push("Mother's education not provided.");
    if (!state.formData.fathers_occupation)
      errors.push("Father's occupation not provided.");
    if (!state.formData.mothers_occupation)
      errors.push("Mother's occupation not provided.");
    if (!state.formData.level_of_family_care) errors.push("Select the level of family care you receive.");
    if (!state.formData.family_total_income_month)
      errors.push("Family total income per month not provided.");
    
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
       res= await API.post('/api/patient/application/family-history',state.formData);
       dispatch(handleSetCurrentApplication({...currentApplication, familyHistory: res.data.data})); 
       return res;
      }
       res= await API.put(`/api/patient/application/family-history/${state.formData.id}`,state.formData);
       dispatch(handleSetCurrentApplication({...currentApplication, familyHistory: res.data.data}));
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
        content: "Family History Submitted successfully",
        title: "Success",
        type: "success",
        timeout: 5000,
      })
    );

      // redirect to the nextpage
      history.push('/myapplications/social-conditions');
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
        content: "Family history saved",
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
          {/* Form to fill */}
          <div className="row">
            <div className="col-md-2"></div>
            <div className="col-md-8">
              <PageTitle title="Family history" />
              <CustomForm
                description="Provide accurate information about your family here."
                onSubmit={handleContinue}
              >
                <div>
                  <Label label="Family Setup" />
                  <Select
                    name="family_set_up"
                    data={[
                      { label: "Monogamous", value: "Monogamous" },
                      { label: "Polygamous", value: "Polygamous" },
                    ]}
                    defaultValue={state.formData.family_set_up}
                    searchable={true}
                    onChange={handleSelectChange}
                  />
                </div>
                <div>
                  <Label label="Family size (how many are you in the family?)" />
                  <Input
                    type={"number"}
                    value={state.formData.family_size}
                    placeholder={"e.g 4"}
                    onChange={(e) =>
                      handleFormDataValue(e.target.name, e.target.value)
                    }
                    name={"family_size"}
                  />
                </div>
                <div>
                  <Label label="Birth order (position in the family)" />
                  <Input
                    type={"number"}
                    value={state.formData.birth_order}
                    placeholder={"e.g 1"}
                    onChange={(e) =>
                      handleFormDataValue(e.target.name, e.target.value)
                    }
                    name={"birth_order"}
                  />
                </div>
                <div>
                  <Label label="Fathers’ educational status: " />
                  <Select
                    name="father_education_status"
                    data={[
                      { label: "None", value: "None" },
                      { label: "Primary", value: "Primary" },
                      { label: "Secondary", value: "Secondary" },
                      { label: "Tertiary", value: "Tertiary" },
                    ]}
                    searchable={true}
                    defaultValue={state.formData.father_education_status}
                    onChange={handleSelectChange}
                  />
                </div>
                <div>
                  <Label label="Mothers’ educational status: " />
                  <Select
                    name="mother_education_status"
                    data={[
                      { label: "None", value: "None" },
                      { label: "Primary", value: "Primary" },
                      { label: "Secondary", value: "Secondary" },
                      { label: "Tertiary", value: "Tertiary" },
                    ]}
                    searchable={true}
                    defaultValue={state.formData.mother_education_status}
                    onChange={handleSelectChange}
                  />
                </div>
                <div>
                  <Label label="Father’s occupation" />
                  <Input
                    name="fathers_occupation"
                    type={"text"}
                    value={state.formData.fathers_occupation}
                    placeholder={"farmer"}
                    onChange={(e) =>
                      handleFormDataValue(e.target.name, e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label label="Mother’s occupation" />
                  <Input
                    name="mothers_occupation"
                    type={"text"}
                    value={state.formData.mothers_occupation}
                    placeholder={"farmer"}
                    onChange={(e) =>
                      handleFormDataValue(e.target.name, e.target.value)
                    }
                  />
                </div>
               
                <div>
                  <Label label="Family total income per month " />
                  <Input
                    name="family_total_income_month"
                    type={"text"}
                    value={state.formData.family_total_income_month}
                    placeholder={"400000"}
                    onChange={(e) =>
                      handleFormDataValue(e.target.name, e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label label="Level of Family care/support: " />
                  <Select
                    name="level_of_family_care"
                    data={[
                      { label: "Poor", value: "Poor" },
                      { label: "Fair", value: "Fair" },
                      { label: "Good", value: "Good" },
                      { label: "Excellent", value: "Excellent" }
                    ]}
                    defaultValue={state.formData.level_of_family_care}
                    searchable={true}
                    onChange={handleSelectChange}
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
            pageNumber={"4 of 8"}
            previousPage="/myapplications/personal-history"
            nextPage={!state.isCreate && "/myapplications/social-conditions"}
          />
        </div>
      </div>
    </div>
  );
}



export default FamilyHistory;
