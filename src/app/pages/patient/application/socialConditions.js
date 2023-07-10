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
import PageSpinner from "../../../components/spinner/pageSpinner";
import { formatErrors } from "../../../utils/error.utils";
import TextArea from "../../../components/form/textarea";

const initial_state = {
  formData: {},
  isSubmitting: false,
  isCreate: true,
  pageLoading: true,
};

function SocialConditions() {
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
        API.get(`/api/patient/application/active/social-condition`).catch(
          (e) => {
            console.log("Social condition", e);
          }
        ),
      ]);

      setState((prevState) => ({
        ...prevState,
        formData: res[0].data ? res[0].data : {},
        isCreate: res[0].data ? false : true
      }));

    } catch (e) {}finally{
      setStateValue('pageLoading',false);
    }
  };

  const handleFormValidation = () => {
    const errors = [];
    if (!state.formData.have_running_water)
      errors.push("Please pick home water availability type.");
    if (!state.formData.type_of_toilet_facility) errors.push("Provide your toilet facility.");
    if (!state.formData.have_generator_solar) errors.push("Select have generator option.");
    if (!state.formData.have_mobile_phone)
      errors.push("Select have mobile phone option.");
    if (!state.formData.how_maintain_phone_use)
      errors.push("Describe how you maintian your phone use.");
    if (!state.formData.means_of_transportation)
      errors.push("Select your means of transportation.");

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
    if(value==="Others"){
      return setStateValue(`${field}1`, value);
    }
    handleFormDataValue(field, value);
  };

  const submitForm = async () => {
    try{
      let res = null;
      if(state.isCreate){
       res= await API.post('/api/patient/application/social-condition',state.formData);
       dispatch(handleSetCurrentApplication({...currentApplication, socialCondition: res.data.data})); 
       return res;
      }
       res= await API.put(`/api/patient/application/social-condition/${state.formData.id}`,state.formData);
       dispatch(handleSetCurrentApplication({...currentApplication, socialCondition: res.data.data}));
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
        content: "Social Condition Submitted successfully",
        title: "Success",
        type: "success",
        timeout: 5000,
      })
    );

      // redirect to the nextpage
      history.push('/myapplications/support-assessment');
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
        content: "Social condition saved",
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
              <PageTitle title="Social condition" />
              <CustomForm
                description="Provide accurate information about your social condition here."
                onSubmit={handleContinue}
              >
                <div>
                  <Label label="Do you have running water in your house?" />
                  <Select
                    name="have_running_water"
                    data={[
                      { label: "Yes", value: "Yes" },
                      { label: "No", value: "No" },
                    ]}
                    defaultValue={state.formData.have_running_water}
                    searchable={true}
                    onChange={handleSelectChange}
                  />
                </div>
                <div>
                  <Label label="Type of toilet facility " />
                  <Select
                    name="type_of_toilet_facility"
                    data={[
                      { label: "Water cistern ", value: "Water cistern " },
                      { label: "Pit toilet", value: "Pit toilet" },
                      { label: "Others", value: "Others" },
                    ]}
                    searchable={true}
                    onChange={handleSelectChange}
                  />
                  {state.type_of_toilet_facility1==="Others" && <Input
                    name="type_of_toilet_facility"
                    type={"text"}
                    value={state.formData.type_of_toilet_facility}
                    onChange={(e) =>handleFormDataValue(e.target.name, e.target.value)}
                  />}
                </div>
                <div>
                  <Label label="Do you have generator to power light in your house?" />
                  <Select
                    name="have_generator_solar"
                    data={[
                      { label: "Yes", value: "Yes" },
                      { label: "No", value: "No" },
                    ]}
                    defaultValue={state.formData.have_generator_solar}
                    searchable={true}
                    onChange={handleSelectChange}
                  />
                </div>
                <div>
                  <Label label="Means of transportation? " />
                  <Select
                    name="means_of_transportation"
                    data={[
                      { label: "Personal vehicle", value: "Personal vehicle" },
                      { label: "Public transport", value: "Public transport" },
                      { label: "Trekking", value: "Trekking" },
                      { label: "Others", value: "Others" },
                    ]}
                    searchable={true}
                    onChange={handleSelectChange}
                  />
                  {state.means_of_transportation1==="Others" && <Input
                    name="means_of_transportation"
                    type={"text"}
                    value={state.formData.means_of_transportation}
                    onChange={(e) =>handleFormDataValue(e.target.name, e.target.value)}
                  />}
                </div>
                <div>
                  <Label label="Do you have a handset? " />
                  <Select
                    name="have_mobile_phone"
                    data={[
                      { label: "Yes", value: "Yes" },
                      { label: "No", value: "No" },
                    ]}
                    defaultValue={state.formData.have_mobile_phone}
                    searchable={true}
                    onChange={handleSelectChange}
                  />
                </div>
                <div>
                <Label label="How do you maintain your phone use? " />
                <TextArea
                    inputName="how_maintain_phone_use"
                    value={state.formData.how_maintain_phone_use}
                    placeholder={"Describe"}
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
            pageNumber={"5 of 8"}
            previousPage="/myapplications/family-history"
            nextPage={!state.isCreate && "/myapplications/support-assessment"}
          />
        </div>
      </div>
    </div>
  );
}



export default SocialConditions;
