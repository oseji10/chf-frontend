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
import Button from "../../../components/button";
import PageSpinner from "../../../components/spinner/pageSpinner";
import { formatErrors } from "../../../utils/error.utils";


const initial_state = {
  formData: {},
  isSubmitting: false,
  isCreate: true,
  pageLoading: true,
};

function SupportAssessment() {
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
        API.get(`/api/patient/application/active/support-assessment`).catch(
          (e) => {
            console.log("Support assessment", e);
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
    if (!state.formData.feeding_assistance)
      errors.push("Please choose an option for feeding assistance.");
    if (!state.formData.rent_assistance)
      errors.push("Please choose an option for house rent assistance.");
    if (!state.formData.medical_assistance)
      errors.push("Please choose an option for medical bill assistance.");
    if (!state.formData.clothing_assistance)
      errors.push("Please choose an option for clothing assistance.");
    if (!state.formData.transport_assistance) errors.push("Please choose an option for transport assistance.");
    if (!state.formData.mobile_bill_assistance)
      errors.push("Please choose an option for mobile assistance.");
    
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
       res= await API.post('/api/patient/application/support-assessment',state.formData);
       dispatch(handleSetCurrentApplication({...currentApplication, supportAssessment: res.data.data})); 
       return res;
      }
       res= await API.put(`/api/patient/application/support-assessment/${state.formData.id}`,state.formData);
       dispatch(handleSetCurrentApplication({...currentApplication, supportAssessment: res.data.data}));
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
     await submitForm();

     //Dispatch success
     dispatch(
      propagatePopup({
        content: "Support Assessment Submitted successfully",
        title: "Success",
        type: "success",
        timeout: 5000,
      })
    );

      // redirect to the nextpage
      history.push('/myapplications/next-of-kin');
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
     await submitForm();

     //Dispatch success
     dispatch(
      propagatePopup({
        content: "Support assessment saved",
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
              <PageTitle title="Support Assessment" />
              <CustomForm
                description="Provide correct answers to the following questions."
                onSubmit={handleContinue}
              >
                  <div>
                  <Label label="How often do you need financial assistance from other people to feed? " />
                  <Select
                    name="feeding_assistance"
                    data={[
                      { label: "Never", value: "Never" },
                      { label: "Once in a while", value: "Once in a while" },
                      { label: "Sometimes", value: "Sometimes" },
                      { label: "Usually", value: "Usually" },
                      { label: "All the time", value: "All the time" },
                    ]}
                    defaultValue={state.formData.feeding_assistance}
                    searchable={true}
                    onChange={handleSelectChange}
                  />
                </div>
                <div>
                  <Label label="How often do you need financial assistance from other people to treat yourself when you are ill?  " />
                  <Select
                    name="medical_assistance"
                    data={[
                      { label: "Never", value: "Never" },
                      { label: "Once in a while", value: "Once in a while" },
                      { label: "Sometimes", value: "Sometimes" },
                      { label: "Usually", value: "Usually" },
                      { label: "All the time", value: "All the time" },
                    ]}
                    defaultValue={state.formData.medical_assistance}
                    searchable={true}
                    onChange={handleSelectChange}
                  />
                </div>
                <div>
                  <Label label="How often do you need financial assistance from other people to pay house rent? " />
                  <Select
                    name="rent_assistance"
                    data={[
                      { label: "Never", value: "Never" },
                      { label: "Once in a while", value: "Once in a while" },
                      { label: "Sometimes", value: "Sometimes" },
                      { label: "Usually", value: "Usually" },
                      { label: "All the time", value: "All the time" },
                    ]}
                    defaultValue={state.formData.rent_assistance}
                    searchable={true}
                    onChange={handleSelectChange}
                  />
                </div>
                <div>
                  <Label label="How often do you need financial assistance from other people to buy clothes? " />
                  <Select
                    name="clothing_assistance"
                    data={[
                      { label: "Never", value: "Never" },
                      { label: "Once in a while", value: "Once in a while" },
                      { label: "Sometimes", value: "Sometimes" },
                      { label: "Usually", value: "Usually" },
                      { label: "All the time", value: "All the time" },
                    ]}
                    defaultValue={state.formData.clothing_assistance}
                    searchable={true}
                    onChange={handleSelectChange}
                  />
                </div>
                <div>
                  <Label label="How often do you need financial assistance from other people for transportation? " />
                  <Select
                    name="transport_assistance"
                    data={[
                      { label: "Never", value: "Never" },
                      { label: "Once in a while", value: "Once in a while" },
                      { label: "Sometimes", value: "Sometimes" },
                      { label: "Usually", value: "Usually" },
                      { label: "All the time", value: "All the time" },
                    ]}
                    defaultValue={state.formData.transport_assistance}
                    searchable={true}
                    onChange={handleSelectChange}
                  />
                </div>
                <div>
                  <Label label="How often do you need financial assistance from other people to buy recharge card? " />
                  <Select
                    name="mobile_bill_assistance"
                    data={[
                      { label: "Never", value: "Never" },
                      { label: "Once in a while", value: "Once in a while" },
                      { label: "Sometimes", value: "Sometimes" },
                      { label: "Usually", value: "Usually" },
                      { label: "All the time", value: "All the time" },
                    ]}
                    defaultValue={state.formData.mobile_bill_assistance}
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
            pageNumber={"6 of 8"}
            previousPage="/myapplications/social-conditions"
            nextPage={!state.isCreate && "/myapplications/next-of-kin"}
          />
        </div>
      </div>
    </div>
  );
}



export default SupportAssessment;
