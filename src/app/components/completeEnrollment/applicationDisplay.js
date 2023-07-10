import Text from "../form2/text/text";
import Card from "../card/card";
import { formatAsMoney } from "../../utils/money.utils";
import Label from "../form2/label/label";
import Button from "../button";
import AuthorizedOnlyComponent from "../authorizedOnlyComponent";

export default function ApplicationDisplay({
  currentApplication,
  getLga,
  getState,
  coeName,
  primaryPhysician,
  primaryPhysicianId,
  setPrimaryPhysician,
  nextOfKin,
  getAilment,
  viewPrimaryPhysician,
}) {
  return (
    <div className="row">
      <div className="col-md-6">
        <Card>
        {currentApplication.personalInformation && <>
          <h5>
            <strong>Personal Information</strong>
          </h5>
          <div>
            <Label label="Patient’s NHIS no" />
            <Text value={currentApplication.personalInformation.nhis_no} />
          </div>
          <div>
            <Label label="Gender" />
            <Text value={currentApplication.personalInformation.gender} />
          </div>
          <div>
            <Label label="Ethnicity" />
            <Text value={currentApplication.personalInformation.ethnicity} />
          </div>
          <div>
            <Label label="Marital Status" />
            <Text
              value={currentApplication.personalInformation.marital_status}
            />
          </div>
          <div>
            <Label label="Number of children" />
            <Text
              value={currentApplication.personalInformation.no_of_children}
            />
          </div>
          <div>
            <Label label="Level of education" />
            <Text
              value={currentApplication.personalInformation.level_of_education}
            />
          </div>
          <div>
            <Label label="Religion" />
            <Text value={currentApplication.personalInformation.religion} />
          </div>
          <div>
            <Label label="Occupation" />
            <Text value={currentApplication.personalInformation.occupation} />
          </div></>}
          {currentApplication.personalHistory && <>
          <h5>
            <strong>Personal History</strong>
          </h5>
          <div>
            <Label label="Average income earned per month" />
            <Text
              value={`NGN ${formatAsMoney(
                currentApplication.personalHistory.average_income_per_month
              )}`}
            />
          </div>
          <div>
            <Label label="How many times do you eat on the average in a day? " />
            <Text
              value={currentApplication.personalHistory.average_eat_daily}
            />
          </div>
          <div>
            <Label label="Who provides the feeding?" />
            <Text
              value={currentApplication.personalHistory.who_provides_feeding}
            />
          </div>
          <div>
            <Label label="Do you have an accommodation?" />
            <Text
              value={currentApplication.personalHistory.have_accomodation}
            />
          </div>
          <div>
            <Label label="If yes, what type of accommodation? If no, choose others and enter NA" />
            <Text
              value={currentApplication.personalHistory.type_of_accomodation}
            />
          </div>
          <div>
            <Label label="How many good set of clothes do you have" />
            <Text
              value={
                currentApplication.personalHistory.no_of_good_set_of_cloths
              }
            />
          </div>
          <div>
            <Label label="How do you get them?" />
            <Text value={currentApplication.personalHistory.how_you_get_them} />
          </div>
          <div>
            <Label label="When you are ill, where do you receive care?" />
            <Text
              value={currentApplication.personalHistory.where_you_receive_care}
            />
          </div>
          <div>
            <Label label="Why do you choose the above mentioned care centre?" />
            <Text
              value={currentApplication.personalHistory.why_choose_center_above}
            />
          </div>
          <div>
            <Label label="Level of spousal/children support: " />
            <Text
              value={
                currentApplication.personalHistory.level_of_spousal_support
              }
            />
          </div>
          <div>
            <Label label=". Other significant source(s) of support? " />
            <Text value={currentApplication.personalHistory.other_support} />
          </div></>}
          {currentApplication.socialCondition && <>
          <h5>
            <strong>Social condition</strong>
          </h5>
          <div>
            <Label label="Do you have running water in your house?" />
            <Text
              value={currentApplication.socialCondition.have_running_water}
            />
          </div>
          <div>
            <Label label="Type of toilet facility " />
            <Text
              value={currentApplication.socialCondition.type_of_toilet_facility}
            />
          </div>
          <div>
            <Label label="Do you have generator to power light in your house?" />
            <Text
              value={currentApplication.socialCondition.have_generator_solar}
            />
          </div>
          <div>
            <Label label="Means of transportation? " />
            <Text
              value={currentApplication.socialCondition.means_of_transportation}
            />
          </div>
          <div>
            <Label label="Do you have a handset? " />
            <Text
              value={currentApplication.socialCondition.have_mobile_phone}
            />
          </div>
          <div>
            <Label label="Do you have a handset? " />
            <Text
              value={currentApplication.socialCondition.how_maintain_phone_use}
            />
          </div>
          </>}
          {currentApplication.socialWorkerAssessment &&
            <AuthorizedOnlyComponent requiredPermission="VIEW_PATIENT_APPLICATION">
              <h5>Social Worker Assessment </h5>
              <div>
                <Label label="Appearance: " />
                <Text
                  value={currentApplication.socialWorkerAssessment.appearance}
                />
              </div>
              <div>
                <Label label="BMI (wt/ht2)" />
                <Text value={currentApplication.socialWorkerAssessment.bmi} />
              </div>
              <div>
                <Label label="Home visit report. Comments on the followings:  " />
              </div>
              <div>
                <Label label="Home facilities: " />
                <Text
                  value={
                    currentApplication.socialWorkerAssessment.comment_on_home
                  }
                />
              </div>
              <div>
                <Label label="Environment/facilities: " />
                <Text
                  value={
                    currentApplication.socialWorkerAssessment
                      .comment_on_environment
                  }
                />
              </div>
              <div>
                <Label label="Family relationship: " />
                <Text
                  value={
                    currentApplication.socialWorkerAssessment.comment_on_fammily
                  }
                />
              </div>
              <div>
                <Label label="Other comments: " />
                <Text
                  value={
                    currentApplication.socialWorkerAssessment.general_comment
                  }
                />
              </div>
            </AuthorizedOnlyComponent>
          }
        </Card>
      </div>
      <div className="col-md-6">
        <Card>
        {currentApplication.patientInformation && <><h5>
            <strong>Patient Information</strong>
          </h5>
          <div>
            <Label label="Chosen hospital(COE)" />
            <Text value={coeName} />
            <Button
              btnClass={"mr-auto btn btn-success"}
              type={"button"}
              value="Primary Physician"
              onClick={setPrimaryPhysician}
            />
          </div>
          {viewPrimaryPhysician && (
            <div>
              <Label label="Primary physician" />
              <Text
                value={
                  primaryPhysician.first_name + " " + primaryPhysician.last_name
                }
              />
            </div>
          )}
          <div>
            <Label label="What cancer type are you diagonised for" />
            <Text
              value={`${getAilment(currentApplication.patient.ailment_id)}`}
            />
          </div>
          <div>
            <Label label="Stage of Cancer" />
            <Text value={currentApplication.patient.ailment_stage} />
          </div>
          <div>
            <Label label="Alternate phone number (optional)" />
            <Text value={currentApplication.patient.phone_no_alt} />
          </div>
          <div>
            <Label label="State of origin" />
            <Text value={`${getState(currentApplication.patient.state_id)}`} />
          </div>
          <div>
            <Label label="LGA of origin" />
            <Text value={`${getLga(currentApplication.patient.lga_id)}`} />
          </div>
          <div>
            <Label label="State of residence" />
            <Text
              value={`${getState(
                currentApplication.patient.state_of_residence
              )}`}
            />
          </div>
          <div>
            <Label label="City" />
            <Text value={currentApplication.patient.city} />
          </div>
          <div>
            <Label label="Address" />
            <Text value={currentApplication.patient.address} />
          </div>
            </>}
            {currentApplication.familyHistory && <>
          <h5>
            <strong>Family History</strong>
          </h5>
          <div>
            <Label label="Family Setup" />
            <Text value={currentApplication.familyHistory.family_set_up} />
          </div>
          <div>
            <Label label="Family size (how many are you in the family?)" />
            <Text value={currentApplication.familyHistory.family_size} />
          </div>
          <div>
            <Label label="Birth order (position in the family)" />
            <Text value={currentApplication.familyHistory.birth_order} />
          </div>
          <div>
            <Label label="Fathers’ educational status: " />
            <Text
              value={currentApplication.familyHistory.father_education_status}
            />
          </div>
          <div>
            <Label label="Mothers’ educational status: " />
            <Text
              value={currentApplication.familyHistory.mother_education_status}
            />
          </div>
          <div>
            <Label label="Father’s occupation" />
            <Text value={currentApplication.familyHistory.fathers_occupation} />
          </div>
          <div>
            <Label label="Mother’s occupation" />
            <Text value={currentApplication.familyHistory.mothers_occupation} />
          </div>

          <div>
            <Label label="Family total income per month" />
            <Text
              value={`${formatAsMoney(
                currentApplication.familyHistory.family_total_income_month
              )}`}
            />
          </div>
          <div>
            <Label label="Level of Family care/support: " />
            <Text
              value={currentApplication.familyHistory.level_of_family_care}
            />
          </div></>}
          {currentApplication.supportAssessment && <>
          <AuthorizedOnlyComponent requiredPermission="VIEW_PATIENT_APPLICATION">
            <h5>
              <strong>Support Assessment</strong>
            </h5>
            <div>
              <Label label="How often do you need financial assistance from other people to feed? " />
              <Text
                value={currentApplication.supportAssessment.feeding_assistance}
              />
            </div>
            <div>
              <Label label="How often do you need financial assistance from other people to treat yourself when you are ill?  " />
              <Text
                value={currentApplication.supportAssessment.medical_assistance}
              />
            </div>
            <div>
              <Label label="How often do you need financial assistance from other people to pay house rent? " />
              <Text
                value={currentApplication.supportAssessment.rent_assistance}
              />
            </div>
            <div>
              <Label label="How often do you need financial assistance from other people to buy clothes? " />
              <Text
                value={currentApplication.supportAssessment.clothing_assistance}
              />
            </div>
            <div>
              <Label label="How often do you need financial assistance from other people for transportation? " />
              <Text
                value={
                  currentApplication.supportAssessment.transport_assistance
                }
              />
            </div>
            <div>
              <Label label="How often do you need financial assistance from other people to buy recharge card? " />
              <Text
                value={
                  currentApplication.supportAssessment.mobile_bill_assistance
                }
              />
            </div>
          </AuthorizedOnlyComponent></>}
          {nextOfKin && <><h5>
            <strong>Next of Kin</strong>
          </h5>
          <div>
            <Label label="Full Name of next of kin" />
            <Text value={nextOfKin.name} />
          </div>
          <div>
            <Label label="Relationship with next of kin" />
            <Text value={nextOfKin.relationship} />
          </div>
          <div>
            <Label label="Email of next of kin" />
            <Text value={nextOfKin.email} />
          </div>
          <div>
            <Label label="Phone number of next of kin" />
            <Text value={nextOfKin.phone_number} />
          </div>
          <div>
            <Label label="Alternate Phone number of next of kin (if there is one)" />
            <Text value={nextOfKin.alternate_phone_number} />
          </div>
          <div>
            <Label label="State of residence" />
            <Text value={`${getState(nextOfKin.state_of_residence)}`} />
          </div>
          <div>
            <Label label="LGA of residence" />
            <Text value={`${getLga(nextOfKin.lga_of_residence)}`} />
          </div>
          <div>
            <Label label="City" />
            <Text value={nextOfKin.city} />
          </div>
          <div>
            <Label label="Address" />
            <Text value={nextOfKin.address} />
          </div></>}
        </Card>
      </div>
    </div>
  );
}
