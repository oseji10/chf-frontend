import ServiceHelper from "./service.helper";

export default class HospitalService{
    static BASE_URL = '/coes';

    static async findAllHospitals(){
        return ServiceHelper.getRequestHandler(this.BASE_URL);
    }

    static async findOneHospital(coe_id){
        return ServiceHelper.getRequestHandler(`${this.BASE_URL}/${coe_id}`);
    }

    static async findAllHospitalPatientTransferRequest(coe_id,query=''){
        return ServiceHelper.getRequestHandler(`${this.BASE_URL}/${coe_id}/patient-transfers?${query}`)
    }

    static async approvePatientTransferRequest(coe_id, payload){
        return ServiceHelper.putRequestHandler(`${this.BASE_URL}/${coe_id}/patient-transfers`,payload);
    }

    static getHospitalInvoice(hospitalId){
        return ServiceHelper.getRequestHandler(`${this.BASE_URL}/${hospitalId}/invoice`)
    }

    static getHospitalStaff(hospitalId){
        return ServiceHelper.getRequestHandler(`${this.BASE_URL}/${hospitalId}/staff`);
    }

    static getHospitalAnalytics(){
        return ServiceHelper.getRequestHandler(`${this.BASE_URL}/analytics`);
    }

}