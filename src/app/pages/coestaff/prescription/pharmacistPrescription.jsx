import React from 'react';
import { Button, ButtonLoader, InlineSearchBox, Input, PageTitle, SingleActionModal, Textarea } from '../../../components';
import MUIDataTable from 'mui-datatables'
import { errorHandler } from '../../../utils/error.utils';
import PrescriptionService from '../../../services/prescription.service';
import { timestampToRegularDateTime } from '../../../utils/date.util';
import { formatName } from '../../../utils/dataFormat.util';
import { PENDING } from '../../../utils/constant.util';
import DrugService from '../../../services/drug.service';
import { AiFillEdit, AiOutlineCheck, AiOutlineCheckCircle } from 'react-icons/ai';
import { errorAlert, successAlert } from '../../../utils/alert.util';
import { formatAsMoney } from '../../../utils/money.utils';

const initialState = {
    drugs: [],
    patient: null,
    patientSearchId: '',
    prescriptions: [],
    showCompleteFulfullPrescriptionModal: false,
    showAttendPrescriptionModal: false,
    showDoctorNote: false,
    isLoading: false,
    activePrescription: null,
    comment: '',
}

export default class PharmacistPrescription extends React.Component {

    constructor(props) {
        super(props);

        this.state = initialState;

        this.handleSearchPatientPrescriptions = this.handleSearchPatientPrescriptions.bind(this)
        this.handleShowAttendComponent = this.handleShowAttendComponent.bind(this);
        this.handleQuantityChange = this.handleQuantityChange.bind(this);
        this.handleFulfillPrescription = this.handleFulfillPrescription.bind(this);
    }

    async componentDidMount() {
        try {
            const res = await DrugService.getAllCAPProduct();
            return this.setState({
                drugs: res.data?.data,
            })
        } catch (e) {

        }
    }

    async handleSearchPatientPrescriptions() {
        this.setState({ isLoading: true })
        try {
            const res = await PrescriptionService.getPatientPrescriptions(this.state.patientSearchId);
            console.log(res)
            return this.setState({
                prescriptions: res.data?.data?.prescriptions,
                patient: res.data?.data?.patient,
            })
        } catch (error) {
            errorHandler(error)
        } finally {
            this.setState({ isLoading: false })
        }
    }

    handleShowAttendComponent(prescription) {
        this.setState({
            active
        })
    }

    handleQuantityChange(e) {
        return this.setState(prevState => ({
            ...prevState,
            activePrescription: {
                ...prevState.activePrescription,
                prescription_products: prevState.activePrescription?.prescription_products.map(prescriptionProduct => {
                    if (parseInt(e.target.name) === prescriptionProduct.id) {
                        return {
                            ...prescriptionProduct,
                            quantity_dispensed: e.target.value,
                        }
                        return prescriptionProduct.quantity_dispensed = e.tartget.value
                    }
                    return prescriptionProduct;
                }),
            }

        }))
    }


    async handleFulfillPrescription() {
        this.setState({ isLoading: true })
        let prescriptionTotalCost = 0;
        try {
            for (let prescriptionProduct of this.state.activePrescription.prescription_products) {
                const product = this.state.drugs.find(drug => drug.productId === prescriptionProduct.drug_id);
                if (!prescriptionProduct.quantity_dispensed) {
                    return errorAlert(`You must enter quantity for ${product.productName} (${product.description})`)
                }
                prescriptionTotalCost += product.price * prescriptionProduct?.quantity_dispensed
                prescriptionProduct.cost = product.price;
            }
            const patientWalletBalance = this.state.patient?.user?.wallet?.balance;
            if (prescriptionTotalCost > patientWalletBalance) {
                return errorAlert(`Patient wallet balance is not sufficient for this prescription. Prescription cost is ${prescriptionTotalCost}. Patient balance is ${patientWalletBalance}`)
            }
            // return console.log("Passed")

            const capRes = await PrescriptionService.createCAPPrescription({
                prescription: this.state.activePrescription,
                comment: this.state.comment,
            })

            const chfRes = await PrescriptionService.fulfillCHFPrescription(this.state.activePrescription);

            successAlert(chfRes.data?.message)

            return this.setState(prevState => ({
                ...initialState,
                drugs: prevState.drugs
            }))
        } catch (error) {
            console.log(error.response)
            errorHandler(error);
        } finally {
            this.setState({ isLoading: false })

        }
    }

    render() {
        return (
            <div className='container'>
                <PageTitle title="Pharmacist Prescription" />
                <InlineSearchBox
                    inputPlaceholder="Enter Patient ID to search"
                    inputValue={this.state.patientSearchId}
                    inputName="patientSearchId"
                    onInputChange={e => this.setState({ patientSearchId: e.target.value })}
                    onButtonClick={this.handleSearchPatientPrescriptions}
                />
                <div className="row my-2">
                    <div className="col-sm-12">

                        {
                            this.state.showAttendPrescriptionModal && <>

                                <MUIDataTable
                                    columns={['SN', "Drug", "Prescription", "Cost", "Quantity"]}
                                    options={{
                                        filter: false,
                                        sort: false,
                                        download: false,
                                        viewColumns: false,
                                        elevation: 0,
                                        // customToolbarSelect: <>
                                        //     <Button>Dispense<AiOutlineCheckCircle /></Button>,
                                        // </>

                                        selectableRows: 'none'
                                    }}
                                    data={this.state.activePrescription.prescription_products.map((prescriptionProduct, index) => {
                                        const product = this.state.drugs.find(prod => prod.productId === prescriptionProduct.drug_id);
                                        return [
                                            index + 1,
                                            `${product.productName} (${product.description}) - ${product.manufacturer?.manufacturerName}`,
                                            prescriptionProduct.dosage,
                                            formatAsMoney(product.price * (prescriptionProduct.quantity_dispensed ?? 0)),
                                            <Input
                                                type="number"
                                                min={1}
                                                placeholder="Enter Quantity"
                                                inputName={prescriptionProduct.id}
                                                value={prescriptionProduct.quantity_dispensed ?? 0}
                                                onChange={this.handleQuantityChange}
                                            />
                                        ]
                                    })}
                                />

                                <Button text="Complete" variant='success' className='my-2' onClick={() => this.setState({ showCompleteFulfullPrescriptionModal: true })} />

                                <Button text="Back" variant='secondary' className='mx-2' onClick={() => this.setState({ showAttendPrescriptionModal: false, activePrescription: null })} />

                            </>
                            ||
                            <MUIDataTable
                                columns={['SN', "Prescription Date", "Doctor", "Patient ID", "Patient Name", "status", "", ""]}
                                data={this.state.prescriptions.map((prescription, index) => {

                                    return [
                                        index + 1,
                                        timestampToRegularDateTime(prescription.created_at),
                                        formatName(prescription.doctor),
                                        prescription.user?.patient?.chf_id,
                                        formatName(prescription.user),
                                        prescription.status,
                                        prescription.status === PENDING.toLowerCase() ? <Button
                                            text="Attend"
                                            variant='success'
                                            onClick={() => this.setState({ showAttendPrescriptionModal: true, activePrescription: prescription })}
                                        /> : null,
                                        <Button onClick={() => this.setState({ showDoctorNote: true, activePrescription: prescription })} className='btn btn-sm btn-info'>Note <AiFillEdit /></Button>
                                    ]
                                })}
                                title={this.state.isLoading ? <ButtonLoader /> : ""}
                                options={{
                                    elevation: 0,
                                    selectableRows: 'none',

                                }}
                            />

                        }

                        <SingleActionModal
                            modalTitle="Confirm complete prescription?"
                            show={this.state.showCompleteFulfullPrescriptionModal}
                            onConfirm={this.handleFulfillPrescription}
                            onModalClose={() => this.setState({ showCompleteFulfullPrescriptionModal: false })}
                            loading={this.state.isLoading}
                            content={<>
                                <p className='text-muted'>You are about to complete this prescription. Leave note</p>
                                <Textarea
                                    name="note"
                                    placeholder="Pharmacist note"
                                    value={this.state.comment}
                                    onChange={e => this.setState({ comment: e.target.value })}
                                />
                            </>}
                        />

                        <SingleActionModal
                            modalTitle="Doctor's Note"
                            show={this.state.showDoctorNote}
                            onConfirm={() => this.setState({ showDoctorNote: false })}
                            onModalClose={() => this.setState({ showDoctorNote: false })}
                            // loading={this.state.isLoading}
                            buttonText="Close"
                            content={this.state.activePrescription?.creator_comment ?? "No comment available"}
                        />
                    </div>
                </div>
            </div>
        )
    }
}