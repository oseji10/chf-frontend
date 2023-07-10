export function parseQueryParams(queryString){
    
    //query string must start with ?
    if(queryString[0]==='?'){
        queryString=queryString.substring(1);
        const queryParams={};
        const params=queryString.split('&');
        for(let param of params){
            const fieldValue=param.split('=');
            queryParams[fieldValue[0]]=fieldValue[1];
        }
        return queryParams;
    }

    return null;

}