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
import TextArea from "../../../components/form/textarea";

const initial_state = {
  formData: {},
  isSubmitting: false,
  isCreate: true,
  pageLoading: true
};

function PersonalHistory() {
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
        API.get(`/api/patient/application/active/personal-history`).catch(
          (e) => {
            console.log("Personal history", e);
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
    if (!state.formData.average_income_per_month)
      errors.push("Provide an avarage income.");
    if (!state.formData.average_eat_daily) errors.push("Provide how many times you eat daily.");
    if (!state.formData.who_provides_feeding) errors.push("Enter who provides feeding.");
    if (!state.formData.have_accomodation)
      errors.push("Select accomodation.");
    if (!state.formData.type_of_accomodation)
      errors.push("Select type of accomodation.");
    if (!state.formData.no_of_good_set_of_cloths)
      errors.push("Enter number of good clothes.");
    if (!state.formData.how_you_get_them)
      errors.push("Enter a description of how you get clothes.");
    if (!state.formData.where_you_receive_care) errors.push("Specify where you receive care.");
    if (!state.formData.why_choose_center_above)
      errors.push("Give reasons for your current place of care.");
    if (!state.formData.level_of_spousal_support)
      errors.push("Select level of your spouse support");
    if (!state.formData.other_support) errors.push("SPecify other support");

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
       res= await API.post('/api/patient/application/personal-history',state.formData);
       dispatch(handleSetCurrentApplication({...currentApplication, personalHistory: res.data.data})); 
       return res;
      }
       res= await API.put(`/api/patient/application/personal-history/${state.formData.id}`,state.formData);
       dispatch(handleSetCurrentApplication({...currentApplication, personalHistory: res.data.data}));
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
        content: "Personal History Submitted successfully",
        title: "Success",
        type: "success",
        timeout: 5000,
      })
    );

      // redirect to the nextpage
      history.push('/myapplications/family-history');
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
        content: "Personal history saved",
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
              <PageTitle title="Personal history" />
              <CustomForm
                description="Provide accurate information about your cost of living here."
                onSubmit={handleContinue}
              >
                <div>
                  <Label label="Average income earned per month" />
                  <Input
                    type={"text"}
                    value={state.formData.average_income_per_month}
                    placeholder={"e.g 100000"}
                    onChange={(e) =>
                      handleFormDataValue(e.target.name, e.target.value)
                    }
                    name={"average_income_per_month"}
                  />
                </div>
                <div>
                  <Label label="How many times do you eat on the average in a day? " />
                  <Input
                    name="average_eat_daily"
                    type={"text"}
                    value={state.formData.average_eat_daily}
                    placeholder={"e.g 1"}
                    onChange={(e) =>
                      handleFormDataValue(e.target.name, e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label label="Who provides the feeding?" />
                  <Input
                    name="who_provides_feeding"
                    type={"text"}
                    value={state.formData.who_provides_feeding}
                    placeholder={"e.g Self"}
                    onChange={(e) =>
                      handleFormDataValue(e.target.name, e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label label="Do you have an accommodation?" />
                  <Select
                    name="have_accomodation"
                    data={[
                      { label: "Yes", value: "Yes" },
                      { label: "No", value: "No" },
                    ]}
                    defaultValue={state.formData.have_accomodation}
                    searchable={true}
                    onChange={handleSelectChange}
                  />
                </div>
                <div>
                  <Label label="If yes, what type of accommodation? If no, choose others and enter NA" />
                  <Select
                    name="type_of_accomodation"
                    data={[
                      { label: "Personal house", value: "Personal house" },
                      { label: "Family house", value: "Family house" },
                      { label: "Rented flat", value: "Rented flat" },
                      { label: "Rented room", value: "Rented room" },
                      { label: "Co-habiting with friends/relations", value: "Co-habiting with friends/relations" },
                      { label: "Others", value: "Others" },
                    ]}
                    searchable={true}
                    onChange={handleSelectChange}
                  />
                  {state.type_of_accomodation1==="Others" && <Input
                    name="type_of_accomodation"
                    type={"text"}
                    value={state.formData.type_of_accomodation}
                    onChange={(e) =>handleFormDataValue(e.target.name, e.target.value)}
                  />}
                </div>
                <div>
                  <Label label="How many good set of clothes do you have" />
                  <Input
                    name="no_of_good_set_of_cloths"
                    type={"number"}
                    value={state.formData.no_of_good_set_of_cloths}
                    placeholder={"10"}
                    onChange={(e) =>
                      handleFormDataValue(e.target.name, e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label label="How do you get them?" />
                  <TextArea
                    inputName="how_you_get_them"
                    value={state.formData.how_you_get_them}
                    placeholder={"I buy them myself"}
                    onChange={(e) =>
                      handleFormDataValue(e.target.name, e.target.value)
                    }
                  />
                  </div>
                <div>
                  <Label label="When you are ill, where do you receive care?" />
                  <Select
                    name="where_you_receive_care"
                    data={[
                      { label: "Traditional homes", value: "Traditional homes" },
                      { label: "Religious homes", value: "Religious homes" },
                      { label: "Chemist shop", value: "Chemist shop" },
                      { label: "Hospital", value: "Hospital" },
                      { label: "Others", value: "Others" },
                    ]}
                    searchable={true}
                    onChange={handleSelectChange}
                  />
                  {state.where_you_receive_care1==="Others" && <Input
                    name="where_you_receive_care"
                    type={"text"}
                    value={state.formData.where_you_receive_care}
                    onChange={(e) =>handleFormDataValue(e.target.name, e.target.value)}
                  />}
                </div>
                <div>
                  <Label label="Why do you choose the above mentioned care centre?" />
                  <TextArea
                    inputName="why_choose_center_above"
                    value={state.formData.why_choose_center_above}
                    placeholder={"I chose them because ...."}
                    onChange={(e) =>
                      handleFormDataValue(e.target.name, e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label label="Level of spousal/children support: " />
                  <Select
                    name="level_of_spousal_support"
                    data={[
                      { label: "Poor", value: "Poor" },
                      { label: "Fair", value: "Fair" },
                      { label: "Good", value: "Good" },
                      { label: "Excellent", value: "Excellent" }
                    ]}
                    defaultValue={state.formData.level_of_spousal_support}
                    searchable={true}
                    onChange={handleSelectChange}
                  />
                </div>
                <div>
                  <Label label=". Other significant source(s) of support? " />
                  <Select
                    name="other_support"
                    data={[
                      { label: "Friends", value: "Friends" },
                      { label: "Work colleagues", value: "Work colleagues" },
                      { label: "Religious members", value: "Religious members" },
                      { label: "Others", value: "Others" },
                    ]}
                    searchable={true}
                    onChange={handleSelectChange}
                  />
                  {state.other_support1==="Others" && <Input
                    name="other_support"
                    type={"text"}
                    value={state.formData.other_support}
                    onChange={(e) =>handleFormDataValue(e.target.name, e.target.value)}
                  />}
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
            pageNumber={"3 of 8"}
            previousPage="/myapplications/patient-information"
            nextPage={!state.isCreate && "/myapplications/family-history"}
          />
        </div>
      </div>
    </div>
  );
}



export default PersonalHistory;
