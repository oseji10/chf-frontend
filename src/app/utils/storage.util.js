export const getAuthStorageUser = () => {
    try{
        const user = JSON.parse(localStorage.getItem('user'));
        return user;
    }catch(e){
        return null;
    }
}



