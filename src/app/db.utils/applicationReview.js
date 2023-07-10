import API from "./../config/chfBackendApi";
 export default function getUserApplicationReview(user_id){
     return API.get(`/api/application/reviews/${user_id}`).then((response) =>response.data.data)
      .catch(err=>{
        console.log(err);
      });
 }