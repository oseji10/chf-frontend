import { useState, useEffect } from "react";
import { bindActionCreators } from "redux";
import { useHistory } from "react-router";
import { connect,useDispatch } from "react-redux";
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
  pageLoading: true,
  geopoliticalZones: [],
  statesResidence:[],
  lgasResidence: [],
  userId: ""
};

function NextOfKin({user, currentApplication}) {
  const [state, setState] = useState(initial_state);
  const history = useHistory();
  const dispatch = useDispatch();

    // Run this use effect to set userId
    useEffect(() => {
    setUserId();
    }, [state.pageLoading]);

    useEffect(() => {
        loadData();
    }, [state.userId]);

    const setUserId= ()=>{
        if(user){
        setState((prevState) => ({
            ...prevState,
        userId: user.user? user.user.id:""
        }));
        }
    }

  const loadData = async () => {
    try {
      const res = await Promise.all([
        API.get(`/api/patient/next-of-kin/${state.userId}`),
        API.get(`/api/geopoliticalzones`),
      ]);
      console.log(res[0])
      setState((prevState) => ({
        ...prevState,
        formData: res[0].data ? res[0].data : {},
        isCreate: res[0].data ?false :true,
        geopoliticalZones: res[1].data.data,
      }));

    } catch (e) {console.log("Next of kin information", e.response);}finally{
      setStateValue('pageLoading',false);
    }
  };

  const prepareGeozoneSelectData = state.geopoliticalZones.map((zone) => ({
    label: zone.geopolitical_zone,
    value: zone.id,
  }));

  const prepareStateResData = state.statesResidence.map((state) => ({
    label: state.state,
    value: state.id,
  }));


  const prepareLgaResData = state.lgasResidence.map((lga) => ({
    label: lga.lga,
    value: lga.id,
  }));

  const handleZoneOfResidenceChange = (name,value) => {
    try {
      if (value) {
        const zoneState = state.geopoliticalZones.find(
          (zone) => parseInt(zone.id) === parseInt(value)
        );
        setState((prevState) => ({
          ...prevState,
          statesResidence: zoneState.states
        }));
      }
    } catch (e) {}
  };

  const handleStateResidenceChange = (name,value) => {
    try {
      const zoneLgas = state.statesResidence.filter(
        (item) => parseInt(item.id) === parseInt(value)
      )[0].lgas;
      setState((prevState) => ({
        ...prevState,
        lgasResidence: zoneLgas,
        formData: { ...prevState.formData, [name]:value }
      }));
    } catch (e) {}
  };

  const handleFormValidation = () => {
    const errors = [];
    if (!state.formData.city) errors.push("Please enter your city or town of residence.");
    if (!state.formData.address) errors.push("Please enter your residential address.");
    if (!state.formData.lga_of_residence)
      errors.push("LGA of residence not selected.");
    if (!state.formData.state_of_residence)
      errors.push("State of residence not selected.");
    if (!minLength(state.formData.phone_number,11))
      errors.push("Please provide a valid phone number.");
    if (!state.formData.email)
      errors.push("Provide a valid email");
    if (!minLength(state.formData.name, 6)) errors.push("Please provide a valid name");

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
            res= await API.post('/api/patient/next-of-kin',state.formData);
            dispatch(handleSetCurrentApplication({...currentApplication, NextOfKin: res.data.data})); 
            return res;
        }
        res= await API.put(`/api/patient/next-of-kin/${state.userId}`,state.formData);
        dispatch(handleSetCurrentApplication({...currentApplication, NextOfKin: res.data.data}));
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
        content: "Next of kin information submitted successfully",
        title: "Success",
        type: "success",
        timeout: 5000,
      })
    );

      // redirect to the nextpage
      history.push('/myapplications/review');
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
        content: "Patient Information saved",
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
              <PageTitle title="Next of kin information" />
              <CustomForm
                description="Provide accurate details of your next of kin"
                onSubmit={handleContinue}
              >
                <div>
                  <Label label="Full Name of next of kin" />
                  <Input
                    name="name"
                    type={"text"}
                    value={state.formData.name}
                    placeholder={"full name"}
                    onChange={(e) =>
                      handleFormDataValue(e.target.name, e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label label="Relationship with next of kin" />
                  <Input
                    name="relationship"
                    type={"text"}
                    value={state.formData.relationship}
                    placeholder={"sister"}
                    onChange={(e) =>
                      handleFormDataValue(e.target.name, e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label label="Email of next of kin" />
                  <Input
                    name="email"
                    type={"text"}
                    value={state.formData.email}
                    placeholder={"email"}
                    onChange={(e) =>
                      handleFormDataValue(e.target.name, e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label label="Phone number of next of kin" />
                  <Input
                    name="phone_number"
                    type={"text"}
                    value={state.formData.phone_number}
                    placeholder={"Phone number"}
                    onChange={(e) =>
                      handleFormDataValue(e.target.name, e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label label="Alternate Phone number of next of kin (if there is one)" />
                  <Input
                    name="alternate_phone_number"
                    type={"text"}
                    value={state.formData.alternate_phone_number}
                    placeholder={"Phone number"}
                    onChange={(e) =>
                      handleFormDataValue(e.target.name, e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label label="Address" />
                  <TextArea
                    inputName="address"
                    value={state.formData.address}
                    placeholder={"Residential Address"}
                    onChange={(e) =>
                      handleFormDataValue(e.target.name, e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label label="Geopolitical zone of residence" />
                  <Select
                    name="zone_of_residence"
                    data={prepareGeozoneSelectData}
                    searchable={true}
                    onChange={handleZoneOfResidenceChange}
                  />
                </div>
                <div>
                  <Label label="State of residnce" />
                  <Select
                    name="state_of_residence"
                    data={prepareStateResData}
                    searchable={true}
                    onChange={handleStateResidenceChange}
                  />
                </div>
                <div>
                  <Label label="LGA of residence" />
                  <Select
                    name="lga_of_residence"
                    data={prepareLgaResData}
                    searchable={true}
                    onChange={handleSelectChange}
                  />
                </div>
                <div>
                  <Label label="City" />
                  <Input
                    name="city"
                    type={"text"}
                    value={state.formData.city}
                    placeholder={"city"}
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
            pageNumber={"7 of 8"}
            previousPage= "/myapplications/support-assessment"
            nextPage={!state.isCreate && "/myapplications/review"}
          />
        </div>
      </div>
    </div>
  );
}

const matchDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      propagatePopup,
      handleSetCurrentApplication,
    },
    dispatch
  );
};
const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
    currentApplication: state.application.currentApplication,
  };
};

export default connect(mapStateToProps, matchDispatchToProps)(NextOfKin);
