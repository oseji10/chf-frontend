import {CAP_IMAS_BACKEND_HOST} from '../config/api-config';
import axios from 'axios';
import API, { CHFBackendAPI } from '../config/chfBackendApi';
export default class PatientService{
    
    static async getPatientRecordFromCAP(patientId){
        try {
            const url = `${CAP_IMAS_BACKEND_HOST}/patient/${patientId}`;
            
            const res = await axios.get(url);
            return res.data;
        } catch (error) {
            console.log(error)
        }
    }

    static findPatient(patientId){
        return API.get(`api/coestaff/patient/${patientId}`);
    }

    static findCOEPatient(coeId, patientId){
        return CHFBackendAPI.get(`/coes/${coeId}/patients/${patientId}?include[]=user&include[]=user.wallet`);
    }
}