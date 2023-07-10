import MUIDataTable from 'mui-datatables';
import React from 'react'
import { AiFillCheckCircle } from 'react-icons/ai';
import { Button, ButtonLoader, PageTitle, SingleActionModal } from '../../../components';
import DrugService from '../../../services/drug.service';
import InvoiceService from '../../../services/invoice.service';
import { successAlert } from '../../../utils/alert.util';
import { formatName } from '../../../utils/dataFormat.util';
import { timestampToRegularTime } from '../../../utils/date.util';
import { errorHandler } from '../../../utils/error.utils';
import { formatAsMoney } from '../../../utils/money.utils';


export default class PermsecInvoice extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            invoices: [],
            isLoading: true,
            activeInvoice: null,
            showInvoiceDetail: false,
            drugs: [],
            showIntitateModal: false,
        }

        this.loadInvoices = this.loadInvoices.bind(this);
        this.handleInitiatePayment = this.handleInitiatePayment.bind(this);
        this.handleShowInitiatePaymentModal = this.handleShowInitiatePaymentModal.bind(this)
    }

    async componentDidMount(){
        try {
            this.loadInvoices();
            const drugRes = await DrugService.getAllCAPProduct();
            // console.log(invoiceRes)
            return this.setState({
                drugs: drugRes.data?.data,
                // invoices: invoiceRes.data?.data,
            })
        } catch (error) {
            
        }finally{
            this.setState({isLoading: false})
        }
    }
    
    async loadInvoices(){
        try {
            const invoiceRes = await InvoiceService.getAllInvoice();
            return this.setState({
                invoices: invoiceRes.data?.data,
            })
        } catch (error) {
            
        }finally{

        }
    }

    handleShowActiveInvoice(invoice){
        this.setState({
            showInvoiceDetail: true,
            activeInvoice: invoice,
        })
    }

    handleShowInitiatePaymentModal(invoice){
        this.setState({
            showIntitateModal: true,
            activeInvoice: invoice,
        })
    }

    async handleInitiatePayment(){
        this.setState({isLoading: true})
        try {
            const res = await InvoiceService.permsecApprovePayment({invoice_id: this.state.activeInvoice?.id});

            successAlert("Invoice has been approved for disbursal. A notification has been sent to the all stakeholders.");

            return this.setState(prevState => ({
                ...prevState,
                showIntitateModal: false,
                invoices: prevState.invoices.map(invoice => {
                    return invoice.id === res.data?.data.id ? res.data.data : invoice;
                })
            }))
        } catch (error) {
            errorHandler(error);
        }finally{
            this.setState({isLoading: false,})
        }
    }


    render(){
        return <div className='container'>
            <PageTitle title="Permanent Secretary Invoices" />

            <div className="row">
                <div className="col-sm-12">

                    {
                        this.state.showInvoiceDetail &&
                        <>
                         <MUIDataTable 
                                columns={['SN',"Transaction ID","Date","Service","Quantity","Cost",'Subtotal']}

                                options={{
                                    pagination: false,
                                }}

                                data={this.state.activeInvoice?.transactions.map((transaction, index) => {
                                    const drug = transaction.is_drug ? DrugService.findDrugInRepository(this.state.drugs, transaction.drug_id) : null;
                                    return [
                                        index + 1,
                                        transaction.transaction_id,
                                        timestampToRegularTime(transaction.created_at),
                                        transaction.is_drug ? `${drug.productName} (${drug.description})` : transaction.service.service_name,
                                        transaction.quantity,
                                        formatAsMoney(transaction.cost),
                                        formatAsMoney(transaction.cost * transaction.quantity),
                                    ]
                                })}
                            />

                            <Button text="< Back" variant='muted' className='btn btn-muted my-2' onClick={() => this.setState({showInvoiceDetail: false})} />
                        </>
                        ||
                    <MUIDataTable 
                        title={this.state.isLoading ? <ButtonLoader /> : ""}
                        columns={["SN","Hospital","CMD","Generated on","Start Date","End Date","Payable", "Status","",""]}
                        options={{
                            elevation: false,
                            selectableRows: false,
                        }}

                        data={this.state.invoices.map((invoice, index) => {
                            return [
                                index + 1,
                                invoice.transactions[0] ? invoice.transactions[0].coe.coe_name : "N/A",
                                formatName(invoice.cmd),
                                timestampToRegularTime(invoice.created_at),
                                timestampToRegularTime(invoice.start_date),
                                timestampToRegularTime(invoice.end_date),
                                formatAsMoney(invoice.computed_total),
                                invoice.status,
                                <Button onClick={() => this.handleShowActiveInvoice(invoice)} variant="success" text='Detail' />,
                                (invoice.status == 'dfa approved' && <Button onClick={() => this.handleShowInitiatePaymentModal(invoice)} variant="info" text='Approve Payment' />) ||
                                invoice.status == 'permsec approved' && <AiFillCheckCircle size={30} className='text-success' /> || null,
                            ]
                        })}
                    />
                    }
                </div>
            </div>

            <SingleActionModal 
                show={this.state.showIntitateModal}
                variant='success'
                loading={this.state.isLoading}
                modalTitle="Approve Payment"
                onModalClose={() => this.setState({showIntitateModal: false})}
                onConfirm={this.handleInitiatePayment}
                buttonText="Final Payment Approval"
                content={<>
                    <p>You are about to approve this payment for disbursal. A nofitcation will be sent to COE, DFA, DHS and other stakeholders involved</p>
                    <p>Please note that only invoice not disputed will be invoiced. </p>
                    <p>Continue?</p>
                </>}
            />
        </div>
    }
}