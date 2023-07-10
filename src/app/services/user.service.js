import API from "../config/chfBackendApi";
import ServiceHelper from "./service.helper";

export default class UserService{
    static BASE_URL = '/users';

    static async findUser(id){
        return await ServiceHelper.getRequestHandler(`${this.BASE_URL}/${id}`);
    }

    static async findUserWithQueryParams(id, query = ''){
        return await ServiceHelper.getRequestHandler(`${this.BASE_URL}/${id}?${query}`);
    }

    static async updateUser(id, payload, options = {}){
        return await ServiceHelper.putRequestHandler(`${this.BASE_URL}/${id}`, payload, options);
    }

    static getProfile(){
        return API.get('/api/users/profile')
    }

    // static me(){
    //     return CHF
    // }

    static isAuthorized(user_permissions, required_permission){
        return user_permissions.includes(required_permission);
    }
}