import { CHFBackendAPI } from "../config/chfBackendApi";

export default class ServiceHelper{
    static async getRequestHandler(url, options = {}){
        try {
            const res = await CHFBackendAPI.get(url,options)
            return res.data;
        } catch (error) {
            throw error;
        }
    }

    static async patchRequestHandler(url,payload, options){
        try {
            const res = await CHFBackendAPI.patch(url,payload,options);
            return res.data;
        } catch (error) {
            throw error;
        }
    }

    static async putRequestHandler(url,payload, options){
        try {
            const res = await CHFBackendAPI.put(url,payload,options);
            return res.data;
        } catch (error) {
            throw error;
        }
    }
    static async postRequestHandler(url,payload, options){
        try {
            const res = await CHFBackendAPI.post(url,payload,options);
            return res.data;
        } catch (error) {
            throw error;
        }
    }
}