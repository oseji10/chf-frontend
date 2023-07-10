import CoeStaff from "./coestaff/coeStaff";
import { useRouteMatch, Switch, Route } from "react-router-dom";
import AdminCoeStaff from "./coestaff/adminCoeStaff";

function CoeStaffIndex() {
  let match = useRouteMatch();
  //Get route and check
  return (
    <Switch>
      <Route exact path={`${match.path}/create`}>
        <CoeStaff />
      </Route>
      <Route exact path={match.path}>
        <AdminCoeStaff />
      </Route>
    </Switch>
  );
}

export default CoeStaffIndex;
