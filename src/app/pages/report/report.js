import { Switch, useRouteMatch } from "react-router";
import Infographics from "./infographics/infographics";
import PatientsContainer from "./patients/patients.container";
import ProtectedRoute from "../../components/ProtectedRoute";
import PatientReport from "./patientReport";
import ServiceReport from "./serviceReport";

const Report = () => {
  const match = useRouteMatch();
  return (
    <Switch>
      <ProtectedRoute exact path="/report">
        <Infographics />
      </ProtectedRoute>

      <ProtectedRoute exact path="/report/patients">
        <PatientReport />
      </ProtectedRoute>

      <ProtectedRoute exact path="/report/services">
        <ServiceReport />
      </ProtectedRoute>

      <ProtectedRoute exact path={`${match.path}/patients`}>
        <PatientsContainer />
      </ProtectedRoute>
    </Switch>
  );
};

export default Report;
