import ServiceHelper from "./service.helper"

export default class PatientTransferService {
    static BASE_URL = '/patient-transfer';

    static async requestPatientTransfer(payload){
        return ServiceHelper.postRequestHandler(this.BASE_URL, payload)
    }

    static async getAllHospitalTransferRequest(){
        return ServiceHelper.getRequestHandler()
    }
}