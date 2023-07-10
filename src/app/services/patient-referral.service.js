import ServiceHelper from "./service.helper";

export default class PatientReferralService{
    static createPatientReferral(payload){
        return ServiceHelper.postRequestHandler(`/patient-referral`,payload)
    }

    static getCOEStaffReferrals(query = ''){
        return ServiceHelper.getRequestHandler(`/patient-referral/coe-staff?${query}`);
    }

    static getCOEReferrals(query = ''){
        return ServiceHelper.getRequestHandler(`/patient-referral/coe`);
    }

    static assignToStaff(payload){
        return ServiceHelper.patchRequestHandler(`/patient-referral/assign-to-staff`, payload);
    }

    static attendToReferal(payload){
        return ServiceHelper.patchRequestHandler(`/patient-referral/attend-to-referral`, payload);
    }

    static approveReferral(payload){
        return ServiceHelper.patchRequestHandler(`/patient-referral/approve`,payload);
    }
}