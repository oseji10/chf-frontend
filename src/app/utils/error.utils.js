import { errorAlert } from "./alert.util";


export const formatErrorsToString = (error) => {
  try {
    if (error?.response?.status === 422) {
      let errorMessage = "";
      const errors = error.response.data.errors;
      for (let field in errors) {
        errorMessage += errors[field].toString() + " | ";
      }
      return errorMessage;
    }
    return error?.response?.data?.message || "A possible network error occured. Make sure you are connected to the internet";
  } catch (err) {
    console.log(err);
    return "Unable to send request. Ensure you have strong internet connection.";
  }
}

export const formatErrors = (error) => {

  try {
    if (error?.response?.status === 422) {
      const errorMessage = [];
      const errors = error.response.data.errors;
      for (let field in errors) {
        errorMessage.push(errors[field].toString());
      }
      return errorMessage;
    }
    return error?.response?.data?.message || "A possible network error occured. Make sure you are connected to the internet";
  } catch (err) {
    console.log(err);
    return "Unable to send request. Ensure you have strong internet connection.";
  }

};


export const errorHandler = error => {
  let message = '';
  if (error?.response?.status === 422) {
    const errorMessage = [];
    const errors = error.response.data.errors;
    for (let field in errors) {
      message += errors[field].toString() + ""
      errorAlert(errors[field].toString())
      errorMessage.push(errors[field].toString());
    }
    return errorMessage;
  }
  if (error?.statusCode === 400 && typeof error?.message === 'object') {
    error.message.map(message => errorAlert(message));
  }

  message = error?.response?.data?.message || "A possible network error occured. Make sure you are connected to the internet";

  return errorAlert(message);
}