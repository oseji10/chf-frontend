import { Input } from "reactstrap";
import {useState} from 'react';
import API from '../../config/chfBackendApi'
import { logUserIn } from "../../redux/auth.action";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";


const SuperAuth = ({}) => {
    const [email, setEmail] = useState('');
    const dispatch = useDispatch();
    const history = useHistory()
    const login = async () => {
        try {
            const res = await API.post(`/api/secure/superadmin/support/anonymous/auth`,{
                email
            });
            dispatch(logUserIn(res.data.data));
            history.replace("/dashboard");
        } catch (error) {
            console.log(error.response) 
        }
    }

    return <div>
        <Input
            onChange={e => setEmail(e.target.value)}
        />
        <button onClick={login}>Login</button>
    </div>
}

export default SuperAuth;