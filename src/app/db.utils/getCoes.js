import API from "./../config/chfBackendApi";
 export default function getCoes(){
     return API.get(`/api/coes`).then((response) => response.data.data)
      .catch(err=>{
        console.log(err);
      });
 }
 
 export const fetchCOEs = API.get(`/api/coes`);