import API from "../config/chfBackendApi";
import ServiceHelper from "./service.helper";

export default class COEService extends ServiceHelper{
    static BASE_URL = '/coes';

    static async findAllCOE(query = ''){
        return this.getRequestHandler(`${this.BASE_URL}?${query}`);
    }

    static async findSingleCOE(coe_id){
        return this.getRequestHandler(`${this.BASE_URL}/${coe_id}`)
    }

    static async findAllCOEPatients(coe_id){
        return this.getRequestHandler(`${this.BASE_URL}/${coe_id}/patients`)
    }

    static async findSingleCOEPatient(coe_id, patient_id){
        return API.get('/api/coestaff/patient/'+ patient_id)
        return this.getRequestHandler(`${this.BASE_URL}/${coe_id}/patients/${patient_id}`);
    }
}