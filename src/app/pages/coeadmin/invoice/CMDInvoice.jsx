import React from 'react'
import {CAPBackendAPI} from '../../../config/chfBackendApi'
import UserService from '../../../services/user.service';
import {Button, PageTitle} from '../../../components'
import MUIDataTable from 'mui-datatables';
import HospitalService from '../../../services/hospital.service';
import { formatName } from '../../../utils/dataFormat.util';
import { timestampToRegularTime } from '../../../utils/date.util';
import { AiOutlinePaperClip } from 'react-icons/ai';
import { formatAsMoney } from '../../../utils/money.utils';
import DrugService from '../../../services/drug.service';

export default class CMDInvoice extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            invoices: [],
            activeInvoice: null,
            showInvoiceDetail: false,
            isLoading: false,
            drugs: [],
        }

        this.handleShowInvoiceDetail = this.handleShowInvoiceDetail.bind(this);
    }

    async componentDidMount(){
        try {
            const profileRes = await UserService.getProfile();
            const invoiceRes = await HospitalService.getHospitalInvoice(profileRes.data?.data?.user?.coe_id);
            const drugRes = await DrugService.getAllCAPProduct();
            this.setState({
                invoices: invoiceRes.data,
                drugs: drugRes.data?.data,
            })
        } catch (error) {
            
        }
    }

    handleShowInvoiceDetail(invoice){
        this.setState({
            activeInvoice: invoice,
            showInvoiceDetail: true,
        })
    }


    render(){
        return <div className="container">
            <PageTitle title='Hospital Invoice' />
            <div className="row">
                <div className="col-sm-12 my-2 py-2">
                    <div className="row">
                        <div className="col-sm-6">
                            <label htmlFor="">Start Date</label>
                            <input type="date" className='form-control' placeholder='Start Date' name='startDate' />
                        </div>
                        <div className="col-sm-6">
                            <label htmlFor="">End Date</label>
                            <input type="date" className='form-control' placeholder='Start Date' name='endDate' />
                        </div>
                        <div className="col-sm-12">

                        </div>
                    </div>
                </div>
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
                            columns={['SN',"Hospital","Invoice Start Date","Invoice End Date", "CMD","Date Generated","Status",""]}
                            options={{
                                elevation: 0,
                                selectableRows: 'none'
                            }}
                            data={this.state.invoices.map((invoice, index) => {
                                return [
                                    index + 1,
                                    invoice.transactions[0]?.coe?.coe_name,
                                    timestampToRegularTime(invoice.start_date),
                                    timestampToRegularTime(invoice.end_date),
                                    invoice.cmd ? formatName(invoice.cmd) : "N/A",
                                    timestampToRegularTime(invoice.created_at),
                                    invoice.status,
                                    <Button className='btn btn-success' onClick={() => this.handleShowInvoiceDetail(invoice)} >Detail <AiOutlinePaperClip /></Button>
                                ]
                            })}
                        />
                    }
                </div>
            </div>
        </div>
    }
}