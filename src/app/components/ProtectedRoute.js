import { Route, Redirect } from "react-router-dom";
import { getAuthStorageUser } from "../utils/storage.util";

const ProtectedRoute = ({ children, Component = null, ...rest }) => {

  const user = getAuthStorageUser()

     return user ? <Route {...rest} >{Component && <Component /> || children}</Route> 
                : <Redirect to="/login" />

};

export default ProtectedRoute;
