import { store } from "../..";
import { propagateAlert } from "../redux/alertActions";
import { formatErrors } from "./error.utils";

const APIResponseHelper = {};

APIResponseHelper.errorHandler = error => {
    const errors = formatErrors(error);

    if (typeof errors === 'string') {
        return store.dispatch(propagateAlert({
            variant: 'danger',
            alert: errors
        }))
    }

    return errors.map(alert => {
        store.dispatch(propagateAlert({
            variant: 'danger',
            alert
        }))
    })
}

APIResponseHelper.successHandler = alert => {
    store.dispatch(propagateAlert({
        variant: 'success',
        alert
    }))
}



export default APIResponseHelper;