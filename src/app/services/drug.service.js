import axios from "axios";
import { CAP_IMAS_BACKEND_HOST } from "../config/api-config";

export default class DrugService {
    static getAllCAPProduct() {
        return axios.get(`${CAP_IMAS_BACKEND_HOST}/product`)
    }

    static getCapAvailableProductForHospital(hospitalId) {
        return axios.get(`${CAP_IMAS_BACKEND_HOST}/stock/hospital/${hospitalId}/products-with-stock`)
    }

    static findDrugInRepository(drugs, drug_id) {
        return drugs.find(drug => drug.productId === drug_id);
    }
}