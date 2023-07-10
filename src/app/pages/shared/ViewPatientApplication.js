import { useState, useEffect } from "react";
import PageTitle from "../../components/pageTitle/pageTitle";
import API from "../../config/chfBackendApi";
import ApplicationDisplay from "../../components/completeEnrollment/applicationDisplay";
import PageSpinner from "../../components/spinner/pageSpinner";
import { useQuery } from "../../hooks/useQuery";

const initial_state = {
  pageLoading: true,
  states: [],
  lgas: [],
  ailments: [],
  nextOfKin: [],
  coeStaff: [],
  coeName: "",
  primaryPhysicianId: "",
  viewPrimaryPhysician: false,
  currentApplication: {}
};

function ViewPatientApplication() {
  const [state, setState] = useState(initial_state);
  let query = useQuery();
  const applicationId=query.get("patient_app");
  const userId=query.get("patient_id");
  const coeId=query.get("coe_id");

  useEffect(() => {
    loadData();
  }, []);

 

  const loadData = async () => {
    try {
      const res = await Promise.all([
        API.get(`/api/states`),
        API.get(`/api/lga`),
        API.get(`/api/ailments`),
        API.get(`/api/patient/next-of-kin/${userId}`),
        API.get(`/api/coes/${coeId}/staff`),
        API.get(`/api/application/review/${applicationId}`)
      ]);
      setState((prevState) => ({
        ...prevState,
        states: res[0].data.data ? res[0].data.data : [],
        lgas: res[1].data.data ? res[1].data.data : [],
        ailments: res[2].data.data ? res[2].data.data : [],
        nextOfKin: res[3].data ? res[3].data : {},
        coeStaff: res[4].data.data ? res[4].data.data.staffs : [],
        coeName: res[4].data.data ? res[4].data.data.coe_name : "",
        currentApplication: res[5].data.data,
      }));
    } catch (e) {
      // console.log("Patient Application Review", e.response);
    } finally {
      setStateValue("pageLoading", false);
    }
  };

  const getState = (stateId) => {
    if (stateId) {
      const filteredState = state.states.find((state) => state.id === stateId);
      if (filteredState) return filteredState.state;
    }

    return "";
  };

  const setPrimaryPhysician = () => {
    const filteredStaff = state.coeStaff.find((staff) => staff.id === state.primaryPhysicianId);
    if (filteredStaff) {
      setStateValue("primaryPhysician", filteredStaff);
      setStateValue("viewPrimaryPhysician", !state.viewPrimaryPhysician);
    }
  };

  const getLga = (lgaId) => {
    if (lgaId) {
      const filteredLga = state.lgas.find((lga) => lga.id === lgaId);
      if (filteredLga) return filteredLga.lga;
    }

    return "";
  };

  const getAilment = (ailmentId) => {
    if (ailmentId) {
      const ailment = state.ailments.find((ailment) => ailment.id == ailmentId);
      if (ailment) return ailment.ailment_type;
    }

    return "";
  };

  const setStateValue = (key, value) => {
    return setState((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  
  return (
    <div className="container">
      {(state.isSubmitting || state.pageLoading) && <PageSpinner />}
      <div className="row">
        {state.currentApplication && (
          <div className="col-sm-12">
            <PageTitle title="View patient application" />
            
          {state.currentApplication && <ApplicationDisplay 
            currentApplication={state.currentApplication}
            getLga={getLga}
            getState={getState}
            coeName={state.coeName}
            primaryPhysician={state.primaryPhysician}
            primaryPhysicianId={state.primaryPhysicianId}
            setPrimaryPhysician={setPrimaryPhysician}
            nextOfKin={state.nextOfKin}
            getAilment={getAilment}
            viewPrimaryPhysician={state.viewPrimaryPhysician}
          />}
           
          </div>
        )}
      </div>
    </div>
  );
}


export default ViewPatientApplication;
