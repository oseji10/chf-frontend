import React from "react"
import { timestampToRegularTime } from "../../utils/date.util"
import { transactionTotal } from "../../utils/db.utils"
import { formatAsMoney } from "../../utils/money.utils"
import TableData from "../table/tableData/tableData"
import TableRow from "../table/tableRow/tableRow"
import CHFTable from "../table/thead/table"
import THead from "../table/thead/thead"
import Badge from '../utilities/badge/badge';
import Button from '../../components/form/button'
import Icon from "../icon/icon"
import AuthorizedOnlyComponent from '../../components/authorizedOnlyComponent'

const TransactionsTable = ({ transactions, onRowClick, onInitiate = () => null, onApprove = () => null, onRecommend = () => null, onDFAApproval, onPermsecApproval }) => {
    const columns = [
        {
            column_name: "#",
        },
        {
            column_name: "Transaction ID",
        },
        {
            column_name: "Transaction Date",
        },
        {
            column_name: "Patient ID",
        },
        {
            column_name: "Services Count",
        },
        {
            column_name: "Total Cost",
        },
        {
            column_name: "Hospital",
        },
        {
            column_name: "",
        },
    ]

    const renderPaymentButton = transaction => {
        /* CHECK IF TRANSACTION IS BEING DISPUTED */

        if (!transaction.dispute || transaction.dispute.status === 'resolved') {

            if (transaction.is_splitted || transaction.permsec_approved_on) {
                return <Icon icon='fa fa-check' style={{ color: '#438743', width: '100%', textAlign: 'center', lineHeight: '40px' }} />
            }


            if (transaction.dfa_approved_on) {
                return <AuthorizedOnlyComponent requiredPermission='PERMSEC_APPROVAL'>
                    <Button
                        variant="success"
                        onClick={() => onPermsecApproval(transaction)}
                        text='Approve (PS)'
                    />
                </AuthorizedOnlyComponent>
            }

            if (transaction.payment_approved_on) {
                return <AuthorizedOnlyComponent requiredPermission='DFA_APPROVAL'>
                    <Button
                        variant="success"
                        onClick={() => onDFAApproval(transaction)}
                        text='Approve (DFA)'
                    />
                </AuthorizedOnlyComponent>
            }

            if (transaction.payment_recommended_on) {
                return <AuthorizedOnlyComponent requiredPermission='APPROVE_PAYMENT'>
                    <Button
                        variant="success"
                        onClick={() => onApprove(transaction)}
                        text='Approve'
                    />
                </AuthorizedOnlyComponent>
            }

            if (transaction.payment_initiated_on) {
                return <AuthorizedOnlyComponent requiredPermission='RECOMMEND_PAYMENT'>
                    <Button
                        variant="success"
                        onClick={() => onRecommend(transaction)}
                        text='Recommend'
                    />
                </AuthorizedOnlyComponent>
            }

            return <AuthorizedOnlyComponent requiredPermission="INITIATE_PAYMENT">
                <TableData>
                    <Button
                        variant='success'
                        onClick={() => onInitiate(transaction)}
                        text="Initiate"
                    />
                </TableData>
            </AuthorizedOnlyComponent>
        }
        return <></>
    }

    return <CHFTable>
        <THead columns={columns} />
        <tbody>
            {transactions.length && transactions.map((transaction, index) => <TableRow

                variant={transaction.dispute && transaction.dispute.status == 'open' ? 'danger' : transaction.dispute && transaction.dispute.status == 'resolved' ? 'success' : ''}
                key={index}>
                <TableData>{index + 1}</TableData>
                <TableData>{transaction.transaction_id}</TableData>
                <TableData><Badge variant='primary' text={timestampToRegularTime(transaction.created_at)} /></TableData>
                <TableData data={transaction.user.patient.chf_id} />
                <TableData data={transaction.transactions.length} />
                <TableData > <del>N</del> {formatAsMoney(transactionTotal(transaction.transactions))} </TableData>
                <TableData data={transaction.coe.coe_name} />
                <TableData> <Button variant='success' onClick={() => onRowClick(index)}> View Services<Icon icon='fa fa-eye text-muted' /></Button> </TableData>
                {/* { transaction.is_splitted && <TableData>
                            <Icon variant='success' icon='fa fa-check' />
                        </TableData>} */}
                {renderPaymentButton(transaction)}
            </TableRow>) || <TableRow><TableData data="No record match the search criteria" colSpan='7' /></TableRow>}
        </tbody>
    </CHFTable>
}

export default TransactionsTable;