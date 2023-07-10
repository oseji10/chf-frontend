import API, { CHFBackendAPI } from "../config/chfBackendApi";

export default class TransactionService {
    static getAllTransactions(query = "") {
        return CHFBackendAPI.get(`transactions?${query}`)
    }
    static searchTransaction(query) {
        return CHFBackendAPI.get(`transaction/search?q=${query}`)
    }
}