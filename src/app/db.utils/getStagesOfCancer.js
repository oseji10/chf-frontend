import API from "./../config/chfBackendApi";
 export default function getStagesOfCancer(){
     return API.get(`/api/ailments`).then((response) =>response.data.data[0])
      .catch(err=>{
        console.log(err);
      });
 }
 