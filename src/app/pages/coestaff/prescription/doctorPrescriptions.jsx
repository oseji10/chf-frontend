import React from 'react';
import { Button, Input, Label, PageTitle, SingleActionModal, Textarea } from '../../../components';
import MUIDataTable from 'mui-datatables'
import { AiFillCheckCircle, AiOutlineComment, AiOutlineEdit, AiOutlinePlus, AiOutlineSearch, AiOutlineUser } from 'react-icons/ai';
import { errorHandler } from '../../../utils/error.utils';
import PatientService from '../../../services/patient.service';
import { errorAlert, successAlert } from '../../../utils/alert.util';
import DrugService from '../../../services/drug.service';
import Select from 'react-select'
import PrescriptionService from '../../../services/prescription.service';
import { formatName } from '../../../utils/dataFormat.util';
import { formatAsMoney } from '../../../utils/money.utils';
import { timestampToRegularDateTime } from '../../../utils/date.util';
import { connect } from 'react-redux';
import UserService from '../../../services/user.service';
import COEService from '../../../services/coe.service';

const initialState = {
    prescriptions: [],
    showSearchPatientModal: false,
    newPrescription: [],
    selectedDrug: null,
    dosage: '',
    patient: null,
    patientSearchId: '',
    showCreatePrescription: false,
    isLoading: false,
    drugs: [],
    showCompletePrescriptionModal: false,
    comment: '',
    showComments: false,
}

class DoctorPrescription extends React.Component {
    constructor(props) {
        super(props);
        this.state = initialState

        this.handleSearchPatient = this.handleSearchPatient.bind(this);
        this.handleAddProductToPrescription = this.handleAddProductToPrescription.bind(this);
        this.handleCompletePrescription = this.handleCompletePrescription.bind(this);
    }

    async componentDidMount() {
        try {
            const profileRes = await UserService.getProfile();
            const coeRes = await COEService.findSingleCOE(profileRes.data?.data?.user?.coe_id);
            const res = await DrugService.getCapAvailableProductForHospital(coeRes.data?.coe_id_cap);
            // const res = await DrugService.getAllCAPProduct();
            const presResponse = await PrescriptionService.getDoctorPrescriptions();
            this.setState({
                drugs: res.data?.data,
                prescriptions: presResponse.data?.data,
            })
        } catch (error) {
            console.log(error)
        }
    }

    async handleSearchPatient() {
        if (!this.state.patientSearchId) {
            return errorAlert("You must provide a patient ID")
        }
        try {
            this.setState({
                isLoading: true
            });

            const res = await PatientService.findPatient(this.state.patientSearchId);
            console.log(res)
            return this.setState({
                patient: res.data?.data,
                showCreatePrescription: true,
                showSearchPatientModal: false,
            });

        } catch (error) {
            errorHandler(error)
        } finally {
            this.setState({
                isLoading: false
            })
        }
    }

    handleAddProductToPrescription(e) {
        e.preventDefault();
        if (!this.state.selectedDrug) {
            return errorAlert("Please select a drug to add.");
        }

        if (!this.state.dosage) {
            return errorAlert("You must type a dosage for this drug");
        }

        const isInPrescription = this.state.newPrescription.some(prescription => prescription.productId === this.state.selectedDrug);

        if (isInPrescription) {
            return errorAlert("Drug has already been added to prescription");
        }

        return this.setState(prevState => ({
            ...prevState,
            dosage: '',
            selectedDrug: null,
            newPrescription: [
                ...prevState.newPrescription,
                {
                    productId: prevState.selectedDrug,
                    dosage: prevState.dosage,
                }
            ]
        }))
    }

    async handleCompletePrescription() {
        try {
            this.setState({
                isLoading: true,
            });

            const res = await PrescriptionService.createPrescription({
                prescriptions: this.state.newPrescription,
                patient_id: this.state.patient?.id,
                comment: this.state.comment,
            });

            this.setState(prevState => ({
                ...initialState,
                drugs: prevState.drugs,
            }));

            return successAlert("Prescription has been created");

        } catch (error) {
            return errorHandler(error);
        } finally {
            return this.setState({
                isLoading: false,
            })
        }
    }


    render() {
        return (
            <>
                <div className='container'>
                    <PageTitle title="Prescriptions " />
                    <div className='my-3'>
                        <Button
                            text={
                                <>Create Prescription
                                    <AiOutlinePlus />
                                </>
                            }
                            variant='success'
                            onClick={() => this.setState({ showSearchPatientModal: true })}
                        />
                    </div>
                    {this.state.showCreatePrescription &&
                        <>
                            <div>
                                <div className='row'>
                                    <div className='col-md-3'>
                                        <h6 className='text-success my-1'> CAP Products</h6>

                                        <form onSubmit={this.handleAddProductToPrescription}>
                                            <Label label="Select Drug" />
                                            <Select
                                                options={this.state.drugs.map(drug => ({
                                                    label: `${drug.productName} (${drug.description}) - ${drug.manufacturer?.manufacturerName}`,
                                                    value: drug.productId,
                                                }))}
                                                onChange={e => this.setState({ selectedDrug: e.value })}
                                            />
                                            {
                                                this.state.selectedDrug && <>
                                                    <Input
                                                        classes='my-2'
                                                        placeholder="Enter dosage"
                                                        value={this.state.dosage} onChange={e => this.setState({ dosage: e.target.value })} />

                                                    <Button
                                                        text="Add"
                                                        variant="success"
                                                    />
                                                </>
                                            }
                                        </form>
                                    </div>
                                    <div className='col-md-8 col-offset-1'>
                                        {this.state.patient && <h5 className='text-success'> <AiOutlineUser /> {formatName(this.state.patient)} - Wallet: NGN{formatAsMoney(this.state.patient?.wallet?.balance ?? 0)}</h5> || null}
                                        {this.state.newPrescription?.length && <>
                                            <MUIDataTable
                                                columns={["SN", "Drug", "Dosage"]}
                                                data={this.state.newPrescription.map((prescription, index) => {
                                                    const product = this.state.drugs.find(product => product.productId === prescription.productId)
                                                    return [
                                                        index + 1,
                                                        `${product.productName} (${product.description}) - ${product.manufacturer?.manufacturerName}`,
                                                        prescription.dosage,
                                                    ]
                                                })}
                                                options={{
                                                    elevation: 0,
                                                    filter: false,
                                                    sort: false,
                                                    viewColumns: false,
                                                    search: false,
                                                    download: false,
                                                    selectableRows: 'none',
                                                    pagination: false,
                                                }}
                                            />

                                            <Button
                                                text="Post prescription"
                                                variant="success"
                                                className='my-2'
                                                onClick={() => this.setState({ showCompletePrescriptionModal: true })}
                                            />
                                        </> || null}
                                    </div>
                                </div>
                            </div>
                        </>
                        || <MUIDataTable
                            columns={['SN', "Patient ID", "Hospital", "Doctor", "Pharmacist", "Status", "Date Created", "", ""]}
                            data={this.state.prescriptions.map((prescription, index) => {

                                return [
                                    index + 1,
                                    prescription.user?.patient?.chf_id,
                                    prescription.hospital?.coe_name,
                                    formatName(prescription.doctor),
                                    prescription.pharmacist ? formatName(prescription.pharmacist) : "N/A",
                                    prescription.status,
                                    timestampToRegularDateTime(prescription.created_at),
                                    <Button className='btn btn-sm btn-success'>Detail </Button>,
                                    <Button onClick={() => this.setState({ showComments: true, activePrescription: prescription })} className='btn btn-sm btn-info'>Notes <AiOutlineEdit /> </Button>,
                                ]
                            })}
                            options={{
                                elevation: 0,
                                selectableRows: 'none',
                            }}
                        />}
                </div>

                <SingleActionModal
                    show={this.state.showSearchPatientModal}
                    modalTitle="Search Patient"
                    variant='success'
                    loading={this.state.isLoading}
                    content={<>
                        <p className='text-muted'>Enter Patient CHF ID, phone number or email to search</p>
                        <Input placeholder="Patient ID" value={this.state.patientSearchId} onChange={e => this.setState({ patientSearchId: e.target.value })} />
                    </>}

                    onConfirm={this.handleSearchPatient}
                    onModalClose={() => this.setState({ showSearchPatientModal: false, patientSearchId: '' })}
                    buttonText={
                        <>
                            Search <AiOutlineSearch />
                        </>
                    }
                />

                <SingleActionModal
                    show={this.state.showCompletePrescriptionModal}
                    modalTitle="Complete Prescription ?"
                    variant='success'
                    loading={this.state.isLoading}
                    content={
                        <>
                            <p className='text-muted my-1'>Leave prescription comment</p>
                            <Textarea
                                placeholder="Doctor's comment"
                                onChange={(e) => this.setState({ comment: e.target.value })}
                                value={this.state.comment}
                            />
                        </>
                    }
                    onConfirm={this.handleCompletePrescription}
                    onModalClose={() => this.setState({ showCompletePrescriptionModal: false })}
                    buttonText={<>
                        Complete Prescription <AiFillCheckCircle />
                    </>}
                />

                <SingleActionModal
                    show={this.state.showComments}
                    modalTitle="Prescription Comments"
                    variant='success'
                    loading={this.state.isLoading}
                    content={
                        <>
                            <p className='text-success my-1'><AiOutlineComment /> Doctor Comment</p>
                            <p>{this.state.activePrescription?.creator_comment ?? "No Comment"}</p>
                            <hr />
                            <p className='text-success my-1'><AiOutlineComment /> Pharmacist Comment</p>
                            <p>{this.state.activePrescription?.fulfiller_comment ?? "No comment"}</p>
                        </>
                    }
                    onConfirm={() => this.setState({ showComments: false, activePrescription: null })}
                    onModalClose={() => this.setState({ showComments: false, activePrescription: null })}
                    buttonText='Close'
                />
            </>
        )
    }
}

const mapStateToProps = state => {
    return { auth: state.auth };
}

export default connect(mapStateToProps)(DoctorPrescription);