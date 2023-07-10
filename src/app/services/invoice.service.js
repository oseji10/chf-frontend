import { CHFBackendAPI } from "../config/chfBackendApi";

export default class InvoiceService{
    static getAllInvoice(query = ''){
        return CHFBackendAPI.get('/invoices');
    }

    static initiateInvoice(payload){
        return CHFBackendAPI.post('/invoices/initiate',payload);
    }

    static recommendPayment(payload){
        return CHFBackendAPI.post('/invoices/recommend',payload);
    }

    static approvePayment(payload){
        return CHFBackendAPI.post('/invoices/approve',payload);
    }

    static dfaRecommendPayment(payload){
        return CHFBackendAPI.post('/invoices/dfa_recommend',payload);
    }

    static permsecApprovePayment(payload){
        return CHFBackendAPI.post('/invoices/permsec_approve',payload);
    }
}