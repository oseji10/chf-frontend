import React, { useEffect, useState } from "react";
import API, { CHFBackendAPI } from "../../../config/chfBackendApi";
import chfstyles from "../../chfadmin/chfadmin.module.scss";
import styles from "../../patient/billingHistory.module.scss";
import { timestampToRegularDateTime, timestampToRegularTime } from "../../../utils/date.util";
import { formatAsMoney } from "../../../utils/money.utils";
import HistoryHeader from "../../patient/TableTop";
import { connect } from "react-redux";
import { transactionTotal } from "../../../utils/db.utils";
import MUIDataTable from 'mui-datatables';
import { COE_ADMIN_TRANSACTION_TABLE_COLUMNS, FANDA_TRANSACTION_TABLE_COLUMNS, SUPERADMIN_TRANSACTION_TABLE_COLUMNS } from "../../../utils/table-constants/transaction-table.constant";
import { formatName } from "../../../utils/dataFormat.util";
import { ButtonLoader, PageTitle, Modal, ModalHeader, ModalBody, Button, SingleActionModal, Textarea, AuthorizedOnlyComponent, } from "../../../components";
import { errorAlert, successAlert } from "../../../utils/alert.util";
import { errorHandler } from "../../../utils/error.utils";
import DrugService from "../../../services/drug.service";
import { GENERATE_INVOICE } from "../../../utils/permissions.constant";
import numeral from "numeral";
import { Grid } from "@material-ui/core";
import InlineSearchBox from "../inlinesearchbox";
import TransactionService from "../../../services/transaction.service";
import { toast } from "react-toastify";

const initial_state = {
    transactions: [],
    activeTransaction: null,
    currentCoeDetails: null,
    showGenerateInvoiceModal: false,
    startDate: "",
    endDate: "",
    pagination: {
        per_page: 10000,
        currentPage: 1,
        totalPages: 1,
        links: null,
    },
    showDisputeModal: false,
    showTransactionDetailModal: false,
    drugs: [],
};

function CoeAdminBillingHistory({ user }) {
    const [state, setState] = useState(initial_state);
    const [isLoading, setIsLoading] = useState(false);
    const [transactionSearchValue, setTransactionSearchValue] = useState("");

    const loadTransactions = async () => {
        // return console.log(state.startDate, state.endDate)
        if (!state.startDate || !state.endDate) {
            return errorAlert("You must select a start date and end date range.")
        }
        try {
            setIsLoading(true);
            const res = await API.get(
                `/api/v2/transactions?startDate=${state.startDate}&endDate=${state.endDate}`
            );

            setState((prevState) => ({
                ...prevState,
                transactions: res?.data?.data ?? [],
            }));
        } catch (e) {
            errorHandler(e);
        } finally {
            setIsLoading(false)
        }
    };

    const getDrugs = async () => {
        try {
            const res = await DrugService.getAllCAPProduct();
            setState((prev) => ({
                ...prev,
                drugs: res.data.data,
            }));
        } catch (e) {
            console.log(e);
        }
    };

    useEffect(() => {
        getDrugs();
    }, []);

    /* The actual price of a service should be the COE price */
    const renderTransactionServices = () => {
        return state.activeTransaction.transactions.map((transaction, index) => {
            return (
                <tr>
                    <td>{index + 1}</td>
                    <td>{transaction.service.service_name}</td>
                    <td>{transaction.service.category.category_name}</td>
                    <td>NGN {formatAsMoney(transaction.cost)}</td>
                    <td>{transaction.quantity}</td>
                </tr>
            );
        });
    };

    const handleCloseModal = () => {
        setState((prevState) => ({
            ...prevState,
            activeTransaction: null,
            showTransactionDetailModal: false,
        }));
    };

    const handleInputChange = (e) => {
        setState((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const getDrug = (drug_id) => {
        return state.drugs.find((drug) => drug.productId === drug_id);
    };

    const renderTransactionDrugs = () => {
        return state.activeTransaction.transactions.map((transaction, index) => {
            const drug = getDrug(transaction.drug_id);
            return (
                <tr>
                    <td>{index + 1}</td>
                    <td>{drug.productName}</td>
                    <td>{drug.description}</td>
                    <td>{drug.manufacturerId}</td>
                    <td>NGN {formatAsMoney(parseFloat(drug.price))}</td>
                    <td>{transaction.quantity}</td>
                </tr>
            );
        });
    };

    const setStateValue = (field, value) => {
        setState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    }

    const handleGenerateInvoice = async () => {
        setStateValue('isLoading', true)
        try {
            const res = await CHFBackendAPI.post('/coes/invoice', {
                startDate: state.startDate,
                endDate: state.endDate
            });

            setState(prevState => ({
                ...prevState,
                showGenerateInvoiceModal: false,
            }));

            successAlert("Invoice generated successfully")
            return loadTransactions();

        } catch (error) {
            errorHandler(error)
        } finally {
            setStateValue('isLoading', false)
        }
    }

    const handleSearchTransaction = async () => {
        if (!transactionSearchValue) return toast("You must enter a transaction ID to search", {
            variant: 'error',
        })
        try {
            setIsLoading(true)
            const res = await TransactionService.searchTransaction(transactionSearchValue);
            setState((prevState) => ({
                ...prevState,
                transactions: res?.data?.data ?? [],
            }));
        } catch (error) {
            errorHandler(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <div className={["container", chfstyles.application_wrapper].join(" ")}>

                <PageTitle
                    title="CHF Transactions"
                />
                <Grid container xs={12}>
                    <InlineSearchBox
                        inputName="query"
                        inputValue={transactionSearchValue}
                        showCloseIcon={false}
                        inputPlaceholder='Search With Transaction ID or patient CHF ID'
                        icon='search'
                        onInputChange={(e) => setTransactionSearchValue(e.target.value)}
                        onButtonClick={handleSearchTransaction}
                    />
                </Grid>
                <div className={chfstyles.application_table}>
                    <HistoryHeader>
                        <div className="col-md-3 mt-2">
                            <label className="text-secondary">Start Date</label>
                            <input
                                type="date"
                                onChange={handleInputChange}
                                value={state.startDate}
                                name="startDate"
                            />
                        </div>

                        <div className="col-md-3 mt-2">
                            <label className="text-secondary">End Date</label>
                            <input
                                type="date"
                                name="endDate"
                                onChange={handleInputChange}
                                value={state.endDate}
                            />
                        </div>
                        <div className="col-md-3 mt-2">
                            <span className="d-block">-</span>
                            <Button
                                onClick={loadTransactions}
                                loading={isLoading}
                                text="Pull Record"
                                variant='success' />
                        </div>
                    </HistoryHeader>
                    <MUIDataTable
                        columns={SUPERADMIN_TRANSACTION_TABLE_COLUMNS}
                        data={state.transactions.map((transaction, index) => {
                            const { transaction_id, patient, is_drug, drug_id, quantity, service, total, coe, created_at, biller } = transaction
                            const drug = is_drug ? getDrug(drug_id) : null;
                            return [
                                index + 1,
                                transaction_id,
                                patient?.chf_id,
                                !is_drug ? service?.service_name : `${drug.productName} (${drug?.description})`,
                                quantity,
                                numeral(total).format('0,0.00'),
                                coe?.coe_name,
                                timestampToRegularDateTime(created_at),
                                formatName(biller),
                                is_drug ? "Drug" : 'Hospital Service',
                                is_drug ? drug?.distributor?.distributorName : 'N/A',
                                is_drug ? drug?.manufacturer?.manufacturerName : 'N/A',

                                // transaction.user?.patient?.chf_id,
                                // transaction.transactions.length,
                                // formatAsMoney(transactionTotal(transaction.transactions)),
                                // (!transaction.status && !transaction.is_disputed && <Button variant='danger' onClick={() => setStateValue('showDisputeModal', true)} > Dispute </Button>) || null
                            ]
                        })}
                        title={isLoading ? <ButtonLoader /> : null}
                        options={{
                            elevation: 0,
                            selectableRows: false,
                            // onRowClick: handleTransactionClick
                        }}
                    />

                </div>
            </div>

            {state.showTransactionDetailModal && (
                <Modal fullscreen={true}>
                    <ModalHeader
                        modalTitle={"Transaction Detail"}
                        onModalClose={handleCloseModal}
                    ></ModalHeader>
                    <ModalBody>
                        <div className={["row", styles.billing_details].join(" ")}>
                            <div className="col-md-6">
                                <h5>
                                    <strong>Transaction Reference</strong>
                                </h5>
                                <span>{state.activeTransaction?.transaction_id}</span>
                            </div>
                            <div className="col-md-6">
                                <h5>
                                    <strong>COE VISITED</strong>
                                </h5>
                                <span>{state.activeTransaction?.coe?.coe_name}</span>
                            </div>
                            <div className="col-md-6">
                                <h5>
                                    <strong>Patient</strong>
                                </h5>
                                {/* <span>{`${state.activeTransaction.user.first_name} ${state.activeTransaction.user.last_name}`}</span>
                <br /> */}
                                <span>
                                    CHF ID: {state.activeTransaction?.user?.patient?.chf_id}
                                </span>
                            </div>
                            <div className="col-md-6">
                                <h6>
                                    <i className="fas fa-calendar"></i> Date Visited:{" "}
                                </h6>
                                <small>
                                    {timestampToRegularTime(state.activeTransaction?.created_at)}
                                </small>
                            </div>
                            <div className="col-md-12">
                                <h6>
                                    <i className="fas fa-user"></i> Attendant Physician:{" "}
                                </h6>
                                <small>
                                    {formatName(state.activeTransaction?.biller)}
                                    {/*{state.activeTransaction.biller.first_name}{" "}*/}
                                    {/*{state.activeTransaction.biller.last_name}{" "}*/}
                                </small>
                            </div>
                            <div className="col-sm-12">
                                <h6 className={[styles.underlined, "text-success"].join(" ")}>
                                    Services Rendered
                                </h6>
                                <table className="table table-responsive-sm">
                                    <thead>
                                        {state.activeTransaction &&
                                            !state.activeTransaction?.is_drug ? (
                                            <tr>
                                                <th>#</th>
                                                <th>Service Name</th>
                                                <th>Service Category</th>
                                                <th>Service Unit Cost</th>
                                                <th>Quantity</th>
                                                {/* <th>#</th> */}
                                            </tr>
                                        ) : (
                                            <tr>
                                                <th>#</th>
                                                <th>Drug Name</th>
                                                <th>Drug Description</th>
                                                <th>Manufacturer</th>
                                                <th>Cost</th>
                                                <th>Quantity</th>
                                            </tr>
                                        )}
                                    </thead>
                                    <tbody>
                                        {(state.activeTransaction?.transactions &&
                                            !state.activeTransaction?.is_drug) ?
                                            renderTransactionServices() : (
                                                state.activeTransaction?.transactions &&
                                                state.activeTransaction?.is_drug) ?
                                                renderTransactionDrugs() : ""}
                                        <tr>
                                            <th>Total</th>
                                            {(state.activeTransaction?.transactions && !state.activeTransaction?.is_drug) ?
                                                <td colSpan="3">&nbsp;</td>
                                                : <td colSpan="4">&nbsp;</td>}
                                            <td>
                                                <strong>
                                                    NGN{" "}
                                                    {state.activeTransaction?.transactions &&
                                                        formatAsMoney(parseFloat(state.activeTransaction?.totalCost))}
                                                </strong>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="col-sm-12">
                                <h6>Physician Comment:</h6>
                                {(state.activeTransaction?.comment && (
                                    <p> {state.activeTransaction?.comment?.comment}</p>
                                )) || <p>No Comment available</p>}
                            </div>
                        </div>
                    </ModalBody>
                </Modal>
            )}

            <SingleActionModal
                show={state.showDisputeModal}
                variant='danger'
                modalTitle="Dispute Transaction"
                content={<>
                    <p>Reason for dispute</p>
                    <Textarea placeholder="Reason for dispute" />

                </>}
                onConfirm={() => null}
                onModalClose={() => setStateValue('showDisputeModal', false)}

            />
            <SingleActionModal
                show={state.showGenerateInvoiceModal}
                variant='success'
                modalTitle="Generate invoice"
                content={<>
                    <p>You are about to generate an invoice for {state.startDate} and {state.endDate}</p>
                    <p>Please note that billings between this range that are disputed or have already been invoiced will not be a part of this invoice</p>
                    {/* <Textarea placeholder="Reason for dispute" /> */}

                </>}
                loading={state.isLoading}
                onConfirm={handleGenerateInvoice}
                onModalClose={() => setStateValue('showGenerateInvoiceModal', false)}

            />

        </>
    );
}

const mapStateToProps = (state) => {
    return {
        user: state.auth.user,
    };
};

export default connect(mapStateToProps)(CoeAdminBillingHistory);
