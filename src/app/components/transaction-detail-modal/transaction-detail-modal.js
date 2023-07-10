import React, { useEffect, useState } from 'react';

import Modal from '../modal/modal'
import ModalHeader from '../modal/modalHeader'
import ModalBody from '../modal/modalBody'
import ModalFooter from '../modal/modalFooter'
import { timestampToRegularTime } from '../../utils/date.util';
import { formatAsMoney } from '../../utils/money.utils';
import { transactionTotal } from '../../utils/db.utils';

const TransactionDetailModal = ({transaction, handleCloseModal, drugs=[], show}) => {

          const renderTransactionServices = () => {
            return transaction.transactions.map((trx, index) => {
             return <tr key={index}>
                <td>{index + 1}</td>
                <td>{trx.service.service_name}</td>
                <td>{trx.service.category.category_name}</td>
                <td> <del>N</del>{formatAsMoney(trx.service.coes[0].pivot.price)}</td>
                <td>{trx.quantity}</td>
              </tr>
            } )
          }

          const findDrug = drug_id => {
            // console.log(drug_id)
            // console.log( drugs.find(drug => drug.prod_id === drug_id).retail_cost)
            return drugs.find(drug => drug.productId === drug_id);
          }

          const renderTransactionDrugs = () => {
            return transaction.transactions.map((trx, index) => {
              return <tr key={index}>
                 <td>{index + 1}</td>
                 <td>{findDrug(trx.drug_id).productName} ({findDrug(trx.drug_id).description})</td>
                 <td>Drug</td>
                 <td> <del>N</del>{formatAsMoney(parseFloat(findDrug(trx.drug_id).price))}</td>
                 <td>{trx.quantity}</td>
               </tr>
             } )
          }

        return transaction && show && <Modal fullscreen={true}>
          <ModalHeader
            modalTitle={"Transaction Detail"}
            onModalClose={handleCloseModal}
          ></ModalHeader>
          <ModalBody>
            <div className={["row", /* chfstyles.billing_details */].join(" ")}>
              <div className="col-md-6">
                <h5>
                  <strong>Transaction Reference</strong>
                </h5>
                <span>{transaction.transaction_id}</span>
              </div>
              <div className="col-md-6">
                <h5>
                  <strong>COE VISITED</strong>
                </h5>
                <span>{transaction.coe.coe_name}</span>
              </div>
              <div className="col-md-12">&nbsp;</div>
              <div className="col-md-6">
                <h6>
                  <i className="fas fa-user"></i> Patient:{" "}
                </h6>
                <small>
                  {transaction.user.patient.chf_id}
                </small>
              </div>
              <div className="col-md-6">
                <h6>
                  <i className="fas fa-calendar"></i> Date Visited:{" "}
                </h6>
                <small>
                  {timestampToRegularTime(transaction.created_at)}
                </small>
              </div>
              <div className="col-sm-12">
                <br />
                <h6
                  className={[/* chfstyles.underlined, */ "text-success"].join(" ")}
                >
                  Services Rendered
                </h6>
                <table className="table table-responsive-sm">
                  <thead>
                      <tr>
                        <th>#</th>
                        <th>Service Name</th>
                        <th>Service Category</th>
                        <th>Unit Price</th>
                        <th>Quantity</th>
                      </tr>
                  </thead>
                  <tbody>
                    {transaction.transactions &&
                    !transaction.is_drug
                      ? renderTransactionServices()
                      : transaction.transactions &&
                        transaction.is_drug
                      ? renderTransactionDrugs()
                      : ""}
                    <tr>
                      <th>Total</th>
                      <td colSpan="3">&nbsp;</td>
                      <td>
                        <strong>
                          NGN
                          {transaction.transactions && formatAsMoney(transactionTotal(transaction.transactions))}
                        </strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="col-sm-12 mb-2">
                <h6>Documents</h6>
                {/* {transaction.documents.length ? (
                  transaction.documents.map((document, index) => (
                    <a
                      key={index}
                      className="mr-2 text-muted text-10"
                      target="_blank"
                      rel="noreferrer"
                      href={document.document_url}
                    >
                      {index + 1} - {document.document_name}
                    </a>
                  ))
                ) : (
                  <p className="text-muted">No attached document</p>
                )} */}
              </div>

              <div className="col-sm-12 ">
                <h6>Physician Comment:</h6>
                {(transaction.comment && (
                  <p> {transaction.comment.comment}</p>
                )) || <p className="text-muted">No Comment available</p>}
              </div>
            </div>
          </ModalBody>
        </Modal> || <></>
}

export default TransactionDetailModal;