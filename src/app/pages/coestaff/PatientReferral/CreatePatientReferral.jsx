import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { InlineSearchBox, Input, Label, PageTitle, Button, SingleActionModal, Textarea } from "../../../components";
import { togglePageSpinner } from "../../../redux/ui/page-spinner/page-spinner.action";
import COEService from "../../../services/coe.service";
import PatientService from "../../../services/patient.service";
import ServicesService from "../../../services/services.service";
import { errorAlert, successAlert } from "../../../utils/alert.util";
import Select from 'react-select';
import MUIDataTable from 'mui-datatables';
import { errorHandler } from "../../../utils/error.utils";
import PatientReferralService from "../../../services/patient-referral.service";
import numeral from "numeral";
// import Button from "../../../components/button";

class CreatePatientReferral extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            activePatient: null,
            searchValue: '',
            coes: [],
            services: [],
            activeCOEId: null,
            activeServiceId: null,
            quantity: 1,
            servicesInCart: [],
            total: 0,
            showCompleteReferralModal: false,
            isLoading: false,
            referralNote: '',
        };

        this.handleSearchPatient = this.handleSearchPatient.bind(this);
        this.handleAddService = this.handleAddService.bind(this);
        this.handleCompleteReferral = this.handleCompleteReferral.bind(this);
    }


    async handleSearchPatient(){
        const {searchValue} = this.state;
        if (!searchValue) {
            return errorAlert("You must enter patient ID");
        }
        try {
            this.props.togglePageSpinner(true);
            const res = await PatientService.findCOEPatient(1627478288, searchValue);
            console.log(res);
            this.setState({activePatient: res.data?.data});
        } catch (error) {
            return errorAlert("Patient does not exist at your facility");
        }finally{
            this.props.togglePageSpinner();
        }
    }

    async componentDidMount(){
        try {
            const coeResponse = await COEService.findAllCOE('includes[]=services');
            const serviceResponse = await ServicesService.getAllServices();
            
            this.setState({
                coes: coeResponse.data,
                services: serviceResponse.data,
            });
        } catch (error) {
            console.log(error);
        }finally{

        }
    }

    handleAddService(e){
        e.preventDefault();
        const {services, activeCOEId, activeServiceId} = this.state;
        if (!activeCOEId) {
            return errorAlert("You must select a Hospital/COE");
        }
        if (!activeServiceId) {
            return errorAlert("You must select a service");
        }

        const serviceToAdd = services.find(service => service.id === activeServiceId);
        const serviceCOE = serviceToAdd.coes.find(coe => coe.coe_id === activeCOEId);

        if (!serviceCOE) {
            return errorAlert("Service is not available for selected Hospital");
        }

        this.setState(prevState => ({
            ...prevState,
            servicesInCart: [
                ...prevState.servicesInCart,
                {
                    serviceId: prevState.activeServiceId,
                    serviceName: serviceToAdd.service_name,
                    price: serviceCOE?.pivot?.price,
                    quantity: prevState.quantity,
                }
            ],
            quantity: 1,
        }));

    }

    async handleCompleteReferral(){
        const {servicesInCart, activeCOEId, activePatient, referralNote} = this.state;
        try {
            if(!servicesInCart.length)
                return errorAlert("You must add at least one product for referral");
            
        this.props.togglePageSpinner(true);

        const res = await PatientReferralService.createPatientReferral({
            patientCHFId: activePatient?.chf_id,
            referrenceCOEId: activeCOEId,
            services: servicesInCart,
            referralNote,
        });
        successAlert("Referral has been sent");
        return this.setState({servicesInCart: [], showCompleteReferralModal: false, activeCOEId: null, activePatient: null, activeServiceId: null, searchValue: ''})
        } catch (error) {
            return errorHandler(error);
        }finally{
            this.props.togglePageSpinner();
        }
    }

    render(){
        const {activePatient, coes, services, quantity, servicesInCart, showCompleteReferralModal, referralNote} = this.state;
        return <div className="container">
            <PageTitle title="Create Patient Referral" />

            <div className="row bg-white p-2">
                {!activePatient &&  <div className="col-sm-12">
                    <InlineSearchBox 
                        inputPlaceholder="Search Patient"
                        inputValue={this.state.searchValue}
                        onInputChange={(e) => this.setState({searchValue: e.target.value})}
                        onButtonClick={this.handleSearchPatient}
                    /> 
                </div> ||
                    <>
                        <div className="col-sm-3 g-1">
                            <form onSubmit={this.handleAddService}>
                                <Label label='Select referrence hospital' />
                                <Select 
                                    options={coes.map((coe, index) => ({
                                        label: coe.coe_name,
                                        value: coe.id,
                                    }))}

                                    onChange={e => this.setState({activeCOEId: e.value, servicesInCart: []})}
                                />
                                <Label label='Select Service' />
                                <Select 
                                    options={services.map((service, index) => ({
                                        label: service.service_name,
                                        value: service.id,
                                    }))}

                                    onChange={e => this.setState({activeServiceId: e.value})}
                                />
                                <Label label='Select Quantity' />
                                <Input
                                    style={{border: '2px solid #33333311'}}
                                    placeholder="Quantity"
                                    type="number"
                                    value={quantity}
                                    min={1}
                                    onChange={e => this.setState({quantity: e.target.value})}
                                />
                                <Button 
                                    text="Add Service"
                                    onClick={this.handleAddService}
                                    variant="success"
                                    className='mt-2'
                                />
                            </form>
                        </div>
                        <div className="col-sm-8">
                            <div className="row p-2">
                                <p className="text-success py-2">{activePatient?.user?.last_name} {activePatient?.user?.first_name} - Wallet Balance: NGN{numeral(activePatient?.user?.wallet?.balance).format('0,0.00')}</p>
                            </div>
                            <MUIDataTable 
                                columns={['SN',"Service Name", "Cost", "Quantity", "Subtotal"]}
                                options={{
                                    elevation: 0,
                                    pagination: false,
                                    selectableRows: 'none',
                                }}
                                data={servicesInCart.map((service, index) => [
                                    index + 1, 
                                    service.serviceName,
                                    numeral(service.price).format('0,0.00'),
                                    service.quantity,
                                    numeral(service.quantity * service.price).format('0,0.00')
                                ])}
                            />
                            {/* <div className="row"> */}
                                <Textarea 
                                    value={referralNote}
                                    onChange={e => this.setState({referralNote: e.target.value})} 
                                    placeholder="Enter referral note here..."
                                    style={{width: '100%', display: 'block', margin: '1rem 0'}}
                                />
                            {/* </div> */}
                            <Button 
                                text="Process Referal"
                                variant='success'
                                style={{marginTop: '2rem'}}
                                onClick={() => this.setState({showCompleteReferralModal: true})}
                            />
                        </div>
                    </>}
            </div>

            <SingleActionModal
                show={showCompleteReferralModal}
                onModalClose={() => this.setState({showCompleteReferralModal: false})}
                onConfirm={() => this.handleCompleteReferral()}
                content={`You are about to make a referral. Transaction will be credited to the referrence COE. Continue?`}
                buttonText="Confirm Referral"
            />
        </div>
    }
}

const mapStateToProps = state => {
    return {
        user: state.auth?.user?.user,
    };
}

const matchDispatchToProps = dispatch => {
    return bindActionCreators({
        togglePageSpinner,
    }, dispatch)
}

export default connect(mapStateToProps, matchDispatchToProps)(CreatePatientReferral)