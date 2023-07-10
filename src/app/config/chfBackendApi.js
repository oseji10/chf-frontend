import { CHF_BACKEND_HOST, CAP_IMAS_BACKEND_HOST } from "./api-config";
import axios from "axios";

/* THIS ACCESSES CHF API VERSION 1.0 */
const API = axios.create({
  baseURL: `${CHF_BACKEND_HOST}`,
  headers: {
    "content-type": "application/json"
  },
});

API.interceptors.request.use((request) => {
  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  if (loggedInUser && loggedInUser.hasOwnProperty("access_token")) {
    request.headers.Authorization = `Bearer ${loggedInUser.access_token}`;
    request.headers['Access-Control-Allow-Origin']=true;
  }

  // console.log(request);
  return request;
});

API.interceptors.response.use((response) => {
  // if(response instanceof Object){
  //   console.log(true,JSON.stringify(response));
  // }
  // console.log(response.data);
  return response;
});


export const CAPBackendAPI = axios.create({
  baseURL: `${CAP_IMAS_BACKEND_HOST}`,
  headers: {
    'content-type': "application/json"
  }
})

/* THIS ACCESSES CHF API VERSION 2.0 */
export const CHFBackendAPI = axios.create({
  baseURL: `${CHF_BACKEND_HOST}/api/v2`,
  headers: {
    'content-type': "application/json"
  }
})

CHFBackendAPI.interceptors.request.use((request) => {
  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  if (loggedInUser && loggedInUser.hasOwnProperty("access_token")) {
    request.headers.Authorization = `Bearer ${loggedInUser.access_token}`;
    request.headers['Access-Control-Allow-Origin']=true;
  }

  // console.log(request);
  return request;
});

export default API;
