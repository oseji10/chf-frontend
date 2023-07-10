import API from "./../config/chfBackendApi";
 export default function getAllGeoPoliticalZones(){
     return API.get(`/api/geopoliticalzones`).then((response) =>response.data.data)
      .catch(err=>{
        console.log(err);
      });
 }