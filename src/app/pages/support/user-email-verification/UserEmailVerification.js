import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import {Button, InlineSearchBox, Label, SingleActionModal} from '../../../components';
import { AlertUtility, DataFormatUtility, DateUtility } from '../../../utils';
import {UserService} from '../../../services'
import styles from './UserEmailVerification.module.scss';

function UserEmailVerification() {
    const [activeUser, setActiveUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchInputValue, setSearchInputValue] = useState('');
    const [showVerifyModal, setShowVerifyModal] = useState(false);

    const handleSearchUser = async () => {
        setActiveUser(null);
        setIsLoading(true)
        try {
            const res = await UserService.findUserWithQueryParams(searchInputValue,"include[]=userVerifications");
            if (!res.data) {
                return AlertUtility.errorAlert("No user found with that credential");
            }
            return setActiveUser(res.data);
        } catch (error) {
            console.log(error)
        }finally{
            setIsLoading(false)
        }
    }

    const handleVerifyUserEmail = async () => {
        const user = activeUser;
        user.email_verified_at = new Date();

        try {
            const res = await UserService.updateUser(activeUser.id,user);
            setActiveUser(user);
            setShowVerifyModal(false)
            setIsLoading(false)
            return AlertUtility.successAlert("User email has been verified");
        } catch (error) {
            console.log(error)
            AlertUtility.errorAlert("Could not verify user's email. Try again")
        }
    }

    const UserProfile = ({user}) => {
        return <div className={styles.profileContainer}>
            <div className={styles.profile}>
                <h3>User Profile</h3>
                <hr />
                <Label label='Full Name' />
                <p>{DataFormatUtility.formatName(user)}</p>
                <Label label='Email' />
                <p>{user.email}</p>
                <Label label='Phone Number' />
                <p>{user.phone_number}</p>
                <Label label='Email verification' />
                {user.email_verified_at ? 
                    <p>{DateUtility.timestampToRegularTime(user.email_verified_at)}</p> : 
                    <p><Button variant='success' text="Verify" onClick={() => setShowVerifyModal(true)} /></p>}

            </div>
            <div className={styles.tokens}>
                <h3>Tokens</h3>
                <hr />
                {activeUser && <ul className={['list-group', styles.listGroup].join(' ')}>
                    {
                        activeUser.user_verifications.map((verification, index) => {
                           return <li className='list-group-item'>{verification.hash}{index}</li>
                        })
                    }
                </ul>}
            </div>
        </div>
    }

  return <div>
      <InlineSearchBox 
        inputPlaceholder="Enter User Email, Phone Number or CHF ID"
        inputValue={searchInputValue}
        onInputChange={e => setSearchInputValue(e.target.value)}
        onButtonClick={handleSearchUser}
        loading={isLoading}
      />
        {/* <ToastContainer /> */}
    {
        activeUser && <UserProfile user={activeUser} tokens />
    }
    <SingleActionModal
        show={showVerifyModal}
        content={`You are about to verify this user's email. Please be sure to confirm the code`}
        onConfirm={handleVerifyUserEmail}
        modalTitle="User Email Verification"
        onModalClose={() => setShowVerifyModal(false)}
        loading={isLoading}
    />
  </div>;
}



export default UserEmailVerification;
