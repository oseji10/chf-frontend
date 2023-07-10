import { CAPBackendAPI, CHFBackendAPI } from "../config/chfBackendApi";

export default class PrescriptionService{
    static createPrescription(payload){
        return CHFBackendAPI.post('/prescription/create',payload);
    }

    static createCAPPrescription(payload){
        return CAPBackendAPI.post('/transaction/chf/prescripton',payload);
    }

    static fulfillCHFPrescription(payload){
        return CHFBackendAPI.post('/prescription/fulfill',payload)
    }

    static getPatientPrescriptions(patientId){
        return CHFBackendAPI.get(`/prescription/patient/${patientId}`);
    }

    static getDoctorPrescriptions(){
        return CHFBackendAPI.get('/prescription/doctor-prescriptions');
    }
}