import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import KeyValueText from '../../components/form2/text/keyValueText';
import Text from '../../components/form2/text/text';
import Icon from '../../components/icon/icon';
import API from '../../config/chfBackendApi';
import { _calculateAge } from '../../utils/date.util';
import { formatAsMoney } from '../../utils/money.utils';
import PageTitle from '../report/infographics/pageTitle';

const CHFAdminApplicationDetail = ({}) => {

    const {id} = useParams();
    const [application, setApplication] = useState(null);
    
    const loadApplication = async () => {
        try{
            const res = await API.get(`/api/application/review/${id}`);
            console.log(res);
            setApplication(res.data.data)
        }catch(error){
            console.log(error.response)
        }
    }

    useEffect(() => {
        loadApplication();
    },[]);

    return <div className='container'>
        <PageTitle title="Application Detail" />
            {application && <div className='row'>
            <div className='col-md-6'>
                <Text value='Personal Detail' />
                <hr />
                <KeyValueText
                    label="CHF ID"
                    value={application.patient.chf_id}
                />
                <KeyValueText
                    label="Full name"
                    value={`${application.user.last_name} ${application.user.other_names || ''} ${application.user.first_name}`}
                />
                <KeyValueText
                    label="Age"
                    value={_calculateAge(application.user.date_of_birth)}
                />
                <KeyValueText
                    label="Gender"
                    value={application.user.gender}
                />
                <KeyValueText
                    label="Hospital"
                    value={application.coe.coe_name}
                />
                <KeyValueText
                    label="State of Origin"
                    value={application.state.state}
                />
                <KeyValueText
                    label="State of Residence"
                    value={application.state_of_residence.state}
                />
                <KeyValueText
                    label="Marital Status"
                    value={application.personalInformation.marital_status}
                />
                <KeyValueText
                    label="Number of Children"
                    value={application.personalInformation.no_of_children}
                />
                <KeyValueText
                    label="Level of Education"
                    value={application.personalInformation.level_of_education}
                />
                <KeyValueText
                    label="Religious View"
                    value={application.personalInformation.religion}
                />
                <KeyValueText
                    label="Occupation"
                    value={application.personalInformation.occupation}
                />
                <KeyValueText
                    label="NHIS Number"
                    value={application.personalInformation.nhis_no || "N/A"}
                />

                {/* <p><strong>CHF ID: </strong>{ application.patient.chf_id}</p>
                <p><strong>Age: </strong>{ _calculateAge(application.user.date_of_birth)}</p>
                <p><strong>Gender: </strong>{ application.user.gender}</p>
                <p><strong>Current Hospital: </strong>{ application.coe.coe_name}</p> */}
            </div>
            <div className='col-md-6'>
                <Text value='Personal History' />
                <hr />
                <KeyValueText
                    label="Who Provides Feeding"
                    value={application.personalHistory.who_provides_feeding}
                />
                <KeyValueText
                    label="Have Accommodation"
                    value={application.personalHistory.have_accomodation}
                />
                <KeyValueText
                    label="Type of Accommodation"
                    value={application.personalHistory.type_of_accomodation}
                />
                <KeyValueText
                    label="Good set of cloth"
                    value={application.personalHistory.no_of_good_set_of_cloths}
                />
                <KeyValueText
                    label="How you get the cloth"
                    value={application.personalHistory.how_you_get_them}
                />
                <KeyValueText
                    label="Where you receive care"
                    value={application.personalHistory.where_you_receive_care}
                />
                <KeyValueText
                    label="Why choose care center"
                    value={application.personalHistory.why_choose_center_above}
                />
                <KeyValueText
                    label="Level of Spousal Support"
                    value={application.personalHistory.level_of_spousal_support}
                />
                <KeyValueText
                    label="Other Support"
                    value={application.personalHistory.other_support}
                />
                <KeyValueText
                    label="Average Income Per Month"
                    value={formatAsMoney(application.personalHistory.average_income_per_month) || "N/A"}
                />
                <KeyValueText
                    label="Average Times Candidate Eat Daily"
                    value={application.personalHistory.average_eat_daily}
                />
            </div>
            <div className='col-md-6'>
                <Text value='Family History' />
                <hr />
                <KeyValueText
                    label="Family Setup"
                    value={application.familyHistory.family_set_up}
                />
                <KeyValueText
                    label="Family Size"
                    value={application.familyHistory.family_size}
                />
                <KeyValueText
                    label="Order in Family"
                    value={application.familyHistory.birth_order}
                />
                <KeyValueText
                    label="Father's Education Level"
                    value={application.familyHistory.father_education_status}
                />
                <KeyValueText
                    label="Mother's Education Level"
                    value={application.familyHistory.mother_education_status}
                />
                <KeyValueText
                    label="Father's Occupation"
                    value={application.familyHistory.fathers_occupation}
                />
                <KeyValueText
                    label="Mother's Occupation"
                    value={application.familyHistory.mothers_occupation}
                />
                <KeyValueText
                    label="Level of Family Support"
                    value={application.familyHistory.level_of_family_care}
                />
                <KeyValueText
                    label="Total Family Monthly Income"
                    value={formatAsMoney(application.familyHistory.family_total_income_month)}
                />
            </div>
            <div className='col-md-6'>
                <Text value='Social Condition' />
                <hr />
                <KeyValueText
                    label="Have Running Water"
                    value={application.socialCondition.have_running_water}
                />
                <KeyValueText
                    label="Type of Toilet Facility"
                    value={application.socialCondition.type_of_toilet_facility}
                />
                <KeyValueText
                    label="Have Alternate Power Source"
                    value={application.socialCondition.have_generator_solar}
                />
                <KeyValueText
                    label="Means of Transportation"
                    value={application.socialCondition.means_of_transportation}
                />
                <KeyValueText
                    label="Have Mobile Phone"
                    value={application.socialCondition.have_mobile_phone}
                />
                <KeyValueText
                    label="How They Maintain Phone"
                    value={application.socialCondition.how_maintain_phone_use}
                />
            </div>
            <div className='col-md-6'>
                <Text value='Support Assessment' />
                <KeyValueText
                    label="Feeding Assistance"
                    value={application.supportAssessment.feeding_assistance}
                />
                <KeyValueText
                    label="Medical Assistance"
                    value={application.supportAssessment.medical_assistance}
                />
                <KeyValueText
                    label="Rent Assistance"
                    value={application.supportAssessment.rent_assistance}
                />
                <KeyValueText
                    label="Clothing Assistance"
                    value={application.supportAssessment.clothing_assistance}
                />
                <KeyValueText
                    label="Transport Assistance"
                    value={application.supportAssessment.transport_assistance}
                />
                <KeyValueText
                    label="Mobile Bill Assistance"
                    value={application.supportAssessment.mobile_bill_assistance}
                />
            </div>
            <div className='col-md-6'>
                <Text value='Next of Kin' />
                <KeyValueText
                    label="Kin Name"
                    value={application.nextOfKin.name}
                />
                <KeyValueText
                    label="Relationship"
                    value={application.nextOfKin.relationship}
                />
            </div>
            <div className='col-md-6'>
                <Text value='Social Worker Assessments' />
                {application.socialWorkerAssessment && <>
                    <KeyValueText
                        label="Appearance"
                        value={application.socialWorkerAssessment.appearance}
                    />
                    <KeyValueText
                        label="Comment of Home"
                        value={application.socialWorkerAssessment.comment_on_home}
                    />
                    <KeyValueText
                        label="Comment of Family"
                        value={application.socialWorkerAssessment.comment_on_fammily}
                    />
                    <KeyValueText
                        label="General Comment"
                        value={application.socialWorkerAssessment.gereral_comment}
                    />
                    <KeyValueText
                        label="BMI"
                        value={application.socialWorkerAssessment.bmi}
                    />
                </> || <Text value="No social worker assessment yet" />}
            </div>
            <div className='col-md-6'>
                <Text value='Committee Approvals' />
                {application.approvals && <>
                    {
                        application.approvals.map(approval => <Icon icon={`fa fa-star text-${approval.status === 'approved' ? 'success' : approval.status === 'override' ? 'warning' : 'danger'}`} />)
                    }
                </> || <Text value="No social worker assessment yet" />}
            </div>
        </div>}
    </div>
}

export default CHFAdminApplicationDetail;