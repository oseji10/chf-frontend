import React from "react";
import { AuthorizedOnlyComponent, Button, ButtonLoader, Input, Label, PageTitle, SingleActionModal, Textarea } from "../../../components";

import MUIDataTables from 'mui-datatables';
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { togglePageSpinner } from "../../../redux/ui/page-spinner/page-spinner.action";
import PatientReferralService from "../../../services/patient-referral.service";
import { timestampToRegularTime } from "../../../utils/date.util";
import { formatName } from "../../../utils/dataFormat.util";
import { COE_PATIENT_REFERRAL_DETAIL_TABLE_COLUMNS, COE_PATIENT_REFERRAL_TABLE_COLUMNS } from "../../../utils/table-constants/patient-referral-table.constants";
import HospitalService from "../../../services/hospital.service";
import Select from 'react-select';
import { errorHandler } from "../../../utils/error.utils";
import { successAlert } from "../../../utils/alert.util";
import { APPROVED, ASSIGNED, PENDING } from "../../../utils/constant.util";
import numeral from "numeral";
import { APPROVE_PATIENT_REFERRAL, SCHEDULE_REFERRAL_APPOINTMENT } from "../../../utils/permissions.constant";
import { AiOutlineFileText } from "react-icons/ai";

class COEPatientReferral extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            referrals : [],
            staff: [],
            isLoading: true,
            activeReferral: null,
            showReferralDetail: false,
            showAssignModal: false,
            showAttendModal: false,
            showApproveModal: false,
            staffToAssign: null,
            appointmentDate: '',
            appointmentNote: '',
        }
        this.handleCompleteAssignReferral = this.handleCompleteAssignReferral.bind(this);
        this.handleAttendToReferral = this.handleAttendToReferral.bind(this);
        this.renderActionButton = this.renderActionButton.bind(this);
        this.handleApproveReferral = this.handleApproveReferral.bind(this);
    }
    
    async componentDidMount(){
        const {togglePageSpinner, user} = this.props;
        try {
            togglePageSpinner(true);
            const res = await PatientReferralService.getCOEReferrals();
            const staffRes = await HospitalService.getHospitalStaff(user?.coe_id);
            this.setState({referrals: res.data, staff: staffRes.data});
        } catch (error) {
            console.log(error);
        }finally{
            this.setState({isLoading: false})
            togglePageSpinner(false);
        }
    }
    
    async handleCompleteAssignReferral(){
        const {activeReferral, appointmentDate, appointmentNote, staffToAssign} = this.state;
        try {
            this.props.togglePageSpinner(true);
            this.setState({isLoading: true})
            const res = await PatientReferralService.assignToStaff({
                referralId: activeReferral?.id,
                appointmentDate,
                appointmentNote,
                staffId: staffToAssign,
            });
            
            successAlert("Referral has been assigned to staff");
            return this.setState(prevState => ({
                ...prevState,
                showAssignModal: false,
                activeReferral: null,
                staffToAssign: null,
                appointmentDate: '',
                appointmentNote: '',
                referrals: prevState.referrals.map(referral => {
                    return referral.id === prevState.activeReferral?.id ? res.data : referral
                })
            }));
        } catch (error) {
            return errorHandler(error);
        }finally{
            this.setState({isLoading: false})
            this.props.togglePageSpinner()
        }
    }

    async handleApproveReferral(){
        try {
            this.props.togglePageSpinner(true);
            const {activeReferral} = this.state;
            const res = await PatientReferralService.approveReferral({referralId: activeReferral?.id});

            successAlert("Referral has been approved");
            return this.setState(prevState => ({
                ...prevState,
                showApproveModal: false,
                activeReferral: null,
                referrals: prevState.referrals.map(referral => {
                    return referral.id === prevState.activeReferral?.id ? res.data : referral
                })
            }));

        } catch (error) {
            return errorHandler(error);
        }finally{
            this.props.togglePageSpinner();
        }
    }

    renderActionButton(referral){
        // if(referral.referring_coe_id !== this.props.user?.coe_id) return null;

        if(
            referral.status.toUpperCase() === PENDING && 
            referral.referring_coe_id === this.props.user?.coe_id
        ){
            return <AuthorizedOnlyComponent requiredPermission={APPROVE_PATIENT_REFERRAL}>
                <Button 
                    text='Approve' 
                    onClick={() => this.setState({showApproveModal: true, activeReferral: referral})}
                    variant='success' />
            </AuthorizedOnlyComponent>
                    
        }
        if(
            referral.status.toUpperCase() === APPROVED &&
            referral.reference_coe_id === this.props.user?.coe_id
        ){
            return <AuthorizedOnlyComponent requiredPermission={SCHEDULE_REFERRAL_APPOINTMENT}>
                <Button 
                    text='Assign' 
                    onClick={() => this.setState({showAssignModal: true, activeReferral: referral})}
                    variant='success' />
            </AuthorizedOnlyComponent>
        }

        return null;
    }
    
    async handleAttendToReferral(){
        const {activeReferral, appointmentNote} = this.state;
        this.props.togglePageSpinner(true);
        try {
            const res = await PatientReferralService.attendToReferal({
                appointmentNote,
                referralId: activeReferral?.id,
            });
            successAlert("Referral services have been attended to. Transactions have also been registered.");
            return this.setState(prevState => ({
                ...prevState,
                showAttendModal: false,
                appointmentNote: '',
                activeReferral: null,
                referrals: prevState.referrals.map((referral) => {
                    return prevState.activeReferral?.id === referral.id ? res.data : referral;
                })
            }))
        } catch (error) {
            return errorHandler(error);
        }finally{
            this.props.togglePageSpinner(false);
            
        }
    }
    
    render(){
        const {isLoading, referrals, activeReferral, showReferralDetail, showAttendModal,showAssignModal, showApproveModal, staff, appointmentDate, appointmentNote} = this.state;
        return <div className="container">
        <PageTitle title='Patient Referrals' />
        {!showReferralDetail ? <>
            <MUIDataTables 
            columns={COE_PATIENT_REFERRAL_TABLE_COLUMNS}
            title={isLoading ? <ButtonLoader /> : null}
            
            data={referrals.map((referral, index) => {
                return [
                index + 1,
                timestampToRegularTime(referral.created_at),
                referral.referring_c_o_e.coe_name,
                referral.reference_c_o_e.coe_name,
                referral.patient_chf_id,
                referral.attendant_staff ? formatName(referral.attendant_staff) : "N/A",
                numeral(referral.total).format('0,0.00'),
                referral.referring_coe_id === this.props.user?.coe_id ? "Outward" : "Inward",
                referral.status,
                <Button 
                onClick={() => this.setState({activeReferral: referral, showReferralDetail: true})}
                text='Details' variant='info' />,
                this.renderActionButton(referral),
            ]}
            )}
            options={{
                elevation: false,
                selectableRows: 'none'
            }}
            />
            </>
            :
            <>
            <div className="row">
                <div className="col-sm-12">
                    <MUIDataTables 
                    columns={COE_PATIENT_REFERRAL_DETAIL_TABLE_COLUMNS}
                    title={isLoading ? <ButtonLoader /> : ''}
                    
                    data={activeReferral?.services.map((service, index) => [
                        index + 1,
                        service.service_name,
                        service.quantity,
                        numeral(service.cost).format('0,0.00'),
                        numeral(service.cost * service.quantity).format('0,0.00'),
                    ])}
                    options={{
                        elevation: false,
                        selectableRows: 'none',
                        filter: false,
                        pagination: false,
                        viewColumns: false,
                        download: false,
                        search: false,
                        
                    }}
                    />  
                </div>
                <div className="col-sm-12">
                    <div className="row mt-3">
                        <div className="col-sm-4 p-2">
                            <p className="text-muted"><AiOutlineFileText /> Referral Note</p>
                            <small>{activeReferral?.referral_note ?? "No referral note"}</small>
                        </div>
                        <div className="col-sm-4 p-2">
                            <p className="text-muted"><AiOutlineFileText /> Appointment Note</p>
                            <small>{activeReferral?.appointment_note ?? "No Appointment note"}</small>
                        </div>
                        <div className="col-sm-4 p-2">
                            <p className="text-muted"><AiOutlineFileText /> Billing Note</p>
                            <small>{activeReferral?.fulfill_note ?? "No billing note"}</small>
                        </div>
                    </div>
                </div>
                <div className="col-sm-12">
                    <Button
                    text="< Back"
                    variant='muted'
                    onClick={() => this.setState({activeReferral: null, showReferralDetail: false})}
                    />
                </div>
            </div>
            </>}
            
            <SingleActionModal 
            show={showAssignModal}
            modalTitle="Assign referral to staff"
            onConfirm={this.handleCompleteAssignReferral}
            loading={isLoading}
            onModalClose={
                () => this.setState({
                    showAssignModal: false, 
                    activeReferral: null,
                    staffToAssign: null,
                    appointmentNote: '',
                })}
                content={
                    <>
                    <Label label="Select Staff" />
                    <Select 
                    options={staff.map(staffDetail => ({
                        label: formatName(staffDetail),
                        value: staffDetail.id
                    }))}
                    onChange={(e) => this.setState({staffToAssign: e.value}) }
                    />
                    <Label label="Appointment Date" />
                    <Input
                    onChange={(e) => this.setState({appointmentDate: e.target.value})} 
                    value={appointmentDate} 
                    type="datetime-local" />
                    <Label label="Appointment Note" />
                    <Textarea 
                    value={appointmentNote}
                    placeholder="Enter appointment note"
                    onChange={(e) => this.setState({appointmentNote: e.target.value})}
                    />
                    </>
                }
                />
                
                <SingleActionModal 
                show={showAttendModal}
                modalTitle="Attend to Referral"
                onConfirm={this.handleAttendToReferral}
                loading={isLoading}
                buttonText="Fulfill"
                onModalClose={
                    () => this.setState({
                        showAttendModal: false, 
                        activeReferral: null,
                        appointmentNote: '',
                    })}
                    content={
                        <>
                        <p className="text-muted">You are about to mark this appointment as fulfilled.  </p>
                        <p className="text-muted">Bill will be credited in favour of your hospital and all stakeholder will be notified. Continue? </p>
                        <Label label="Appointment Note" />
                        <Textarea 
                        value={appointmentNote}
                        placeholder="Enter appointment note"
                        onChange={(e) => this.setState({appointmentNote: e.target.value})}
                        />
                        </>
                    }
                    />

                <SingleActionModal 
                show={showApproveModal}
                modalTitle="Approve Referral"
                onConfirm={this.handleApproveReferral}
                loading={isLoading}
                buttonText="Approve"
                onModalClose={
                    () => this.setState({
                        showApproveModal: false, 
                        activeReferral: null,
                        appointmentNote: '',
                    })}
                    content={
                        <>
                        <p className="text-muted">You are about to approve this referral. Continue? </p>
                        </>
                    }
                    />
                    </div>
                }
            }
            
            const matchStateToProps = state => {
                return {
                    user: state.auth?.user?.user,
                }
            }
            
            
            const matchDispatchToProps = dispatch => {
                return bindActionCreators({
                    togglePageSpinner,
                }, dispatch);
            }
            
            export default connect(matchStateToProps, matchDispatchToProps)(COEPatientReferral);