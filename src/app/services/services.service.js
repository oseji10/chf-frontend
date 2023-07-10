import ServiceHelper from "./service.helper";

export default class ServicesService{
    static BASE_URL = '/services';

    static getAllServices(query = ''){
        return ServiceHelper.getRequestHandler(`${this.BASE_URL}?${query}`);
    }
}