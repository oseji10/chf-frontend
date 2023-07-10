import { useState } from "react";
import { AiOutlineHome, AiOutlineLock } from "react-icons/ai";
import { Link, useHistory } from "react-router-dom";
import API, { CHFBackendAPI } from "../../config/chfBackendApi";
import { successAlert } from "../../utils/alert.util";
import { errorHandler } from "../../utils/error.utils";
import { isEmail } from '../../utils/validation.uitls';


import { Input, Button } from '../../components';


function ResendEmailVerification() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailError, setEmailError] = useState('');

    const history = useHistory()

    const handleEmailChange = e => {
        const value = e.target.value;
        setEmailError('');

        if (!isEmail(value)) {
            setEmailError("Invalid email address")
        }
        setEmail(value);
    }

    const sendVerificationEmail = async (e) => {
        e.preventDefault();
        if (emailError) {
            return;
        }
        try {
            setIsLoading(true)
            const res = await CHFBackendAPI.post('/auth/resend-verification-email', {
                email
            });
            successAlert("A verification code has been sent to your email.");
            return setTimeout(() => {
                return history.push(`/auth/verify-email/${email}`)
            }, 3000)

        } catch (error) {
            console.log(error)
            errorHandler(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="auth_container">
            <div className="auth_content">
                <div className="auth_header_image">
                    <img src="./../../images/formCoverLogo.png" />
                </div>
                <form method="post" onSubmit={sendVerificationEmail}>
                    <span className="text-sm text-danger d-block">{emailError}</span>
                    <Input
                        name="Email"
                        type='email'
                        value={email}
                        onChange={handleEmailChange}
                        placeholder="Enter email address" />
                    <Button
                        type='submit'
                        loading={isLoading}
                        text="Send verification code"
                        disabled={emailError}
                        variant='success' />
                    <div className="d-block py-2">
                        <Link to='/' className="btn btn-info mx-1 float-right" ><AiOutlineHome /> Home  </Link>
                        <Link to='/login' className="btn btn-info mx-1 float-right" ><AiOutlineLock /> Login </Link>
                    </div>
                </form>

            </div>
        </div>
    )
}

export default ResendEmailVerification;