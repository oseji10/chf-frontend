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
import PageSpinner from "../../../components/spinner/pageSpinner";
import { formatErrors } from "../../../utils/error.utils";
import TextArea from "../../../components/form/textarea";
import { formatName } from "../../../utils/dataFormat.util";
import { DOCTOR } from "../../../utils/constant.util";

const initial_state = {
  formData: {},
  isSubmitting: false,
  pageLoading: true,
  geopoliticalZones: [],
  statesOrigin: [],
  statesResidence:[],
  lgasOrigin: [],
  ailments:[],
  patientId: "",
  patientCoeId:"",
  coeStaff:[],
};

function PatientInformation({user, currentApplication}) {
  const [state, setState] = useState(initial_state);
  const history = useHistory();
  const dispatch = useDispatch();

// Run this use effect to set patientId
useEffect(() => {
  setPatientId();
  // eslint-disable-next-line
}, [state.pageLoading]);

  useEffect(() => {
      loadData();
      // eslint-disable-next-line
  }, [state.patientId]);

  const setPatientId= ()=>{
    if(user){
      setState((prevState) => ({
        ...prevState,
       patientId: user.user.patient? user.user.patient.id:"",
       patientCoeId: user.user.patient? user.user.patient.coe_id:""
      }));
    }
  }

  const loadData = async () => {
    try {
      const res = await Promise.all([
        API.get(`/api/patients/only/${state.patientId}`),
        API.get(`/api/ailments`),
        API.get(`/api/geopoliticalzones`),
        API.get(`/api/coes/${state.patientCoeId}/staff`),
      ]);

      console.log("Pat info display ",res)

      setState((prevState) => ({
        ...prevState,
        formData: res[0].data.data ? res[0].data.data : {},
        geopoliticalZones: res[2].data.data,
        ailments:res[1].data.data,
        coeStaff: res[3].data.data?res[3].data.data.staffs:[],
      }));

    } catch (e) {console.log("Patient information", e.response);}finally{
      setStateValue('pageLoading',false);
    }
  };

  const prepareAlmentSelectData = state.ailments.map((ailment) => ({
    label: ailment.ailment_type,
    value: ailment.id,
  }));

  const prepareCoeStaffSelectData = state.coeStaff.filter(staff => {
    return staff.roles.filter(role => role.role.toUpperCase() === DOCTOR).length;
  }).map(staff => ({
    label: formatName(staff),
    value: staff.id
  }))

  // const prepareCoeStaffSelectData = state.coeStaff.map((staff) => ({
  //   label: formatName(staff),
  //   value: staff.id,
  // }));

  const prepareGeozoneSelectData = state.geopoliticalZones.map((zone) => ({
    label: zone.geopolitical_zone,
    value: zone.id,
  }));

  const prepareStateOriginData = state.statesOrigin.map((state) => ({
    label: state.state,
    value: state.id,
  }));

  const prepareStateResData = state.statesResidence.map((state) => ({
    label: state.state,
    value: state.id,
  }));

  const prepareLgaOriginData = state.lgasOrigin.map((lga) => ({
    label: lga.lga,
    value: lga.id,
  }));

  const handleZoneOfOriginChange = (name,value) => {
    try {
      if (value) {
        const zoneState = state.geopoliticalZones.find(zone => parseInt(zone.id) == parseInt(value)
        );
        setState((prevState) => ({
          ...prevState,
          statesOrigin: zoneState.states
        }));
      }
    } catch (e) {}
  };

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

  const handleStateOriginChange = (name,value) => {
    try {
      const zoneLgas = state.statesOrigin.filter(
        (item) => parseInt(item.id) === parseInt(value)
      )[0].lgas;
      setState((prevState) => ({
        ...prevState,
        lgasOrigin: zoneLgas,
        formData: { ...prevState.formData, [name]:value }
      }));
    } catch (e) {}
  };

  const handleFormValidation = () => {
    const errors = [];
    if (!state.formData.city) errors.push("Please enter your city or town of residence.");
    if (!state.formData.address) errors.push("Please enter your residential address.");
    if (!state.formData.lga_id)
      errors.push("LGA of origin not selected.");
    if (!state.formData.state_id)
      errors.push("State of origin not selected.");
    if (!state.formData.state_of_residence)
      errors.push("State of residence not selected.");
    if (!state.formData.ailment_id)
      errors.push("Type to cancer not selected");
    if (!state.formData.ailment_stage) errors.push("Stage of cancer not selected");

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
       const res= await API.put(`/api/patients/${state.patientId}`,state.formData);
       dispatch(handleSetCurrentApplication({...currentApplication, patient: res.data.data}));
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
        content: "Patient Information Submitted successfully",
        title: "Success",
        type: "success",
        timeout: 5000,
      })
    );

      // redirect to the nextpage
      history.push('/myapplications/personal-history');
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
              <PageTitle title="Patient information" />
              <CustomForm
                description="Provide accurate contact and health information in this page "
                onSubmit={handleContinue}
              >
                <div>
                  <Label label="Select your primary physician at the hospital you chose for CHF care" />
                  <Select
                    name="primary_physician"
                    data={prepareCoeStaffSelectData}
                    searchable={true}
                    onChange={handleSelectChange}
                  /> 
                </div>
                <div>
                  <Label label="What cancer type are you diagonised for" />
                  <Select
                    name="ailment_id"
                    data={prepareAlmentSelectData}
                    defaultValue={state.formData.ailment_id? prepareAlmentSelectData.find(data=>data.value===state.formData.ailment_id).label : "--select--"}
                    searchable={false}
                    onChange={handleSelectChange}
                  />
                </div>
                <div>
                  <Label label="Stage of Cancer" />
                  <Select
                    name="ailment_stage"
                    data={[
                      { label: "1", value: "1" },
                      { label: "2", value: "2" },
                      { label: "3", value: "3" },
                      { label: "4", value: "4" }
                    ]}
                    defaultValue={state.formData.ailment_stage || "--select--"}
                    searchable={false}
                    onChange={handleSelectChange}
                  /> 
                </div>
                <div>
                  <Label label="Alternate phone number (optional)" />
                  <Input
                    name="phone_no_alt"
                    type={"text"}
                    value={state.formData.phone_no_alt}
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
                  <Label label="Geopolitical zone of origin" />
                  <Select
                    name="zone_of_origin"
                    data={prepareGeozoneSelectData}
                    searchable={true}
                    onChange={handleZoneOfOriginChange}
                  />
                </div>
                <div>
                  <Label label="State of origin" />
                  <Select
                    name="state_id"
                    data={prepareStateOriginData}
                    searchable={true}
                    onChange={handleStateOriginChange}
                  />
                </div>
                <div>
                  <Label label="LGA of origin" />
                  <Select
                    name="lga_id"
                    data={prepareLgaOriginData}
                    searchable={true}
                    onChange={handleSelectChange}
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
                  <Label label="State of residence" />
                  <Select
                    name="state_of_residence"
                    data={prepareStateResData}
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
            pageNumber={"2 of 8"}
            previousPage= "/myapplications/personal-information"
            nextPage="/myapplications/personal-history"
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

export default connect(mapStateToProps, matchDispatchToProps)(PatientInformation);
