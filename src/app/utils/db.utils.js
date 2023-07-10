export const transactionTotal = transactions => {
    let sum = 0;
    for (let transaction of transactions) {
      sum += transaction.cost * transaction.quantity;
    }
    return sum
}

export const consolidatedTransactionTotal = (transactions, options = {}) => {
  let total = 0;
  let has_split = false;
  let has_dispute = false;
  let has_unsplit = false;

  for (let transaction of transactions){
    if (transaction.dispute && transaction.dispute.status === 'open') {
      has_dispute = true;
    }

    if (transaction.payment_initiated_on ) {
      has_split = true;
      continue;
    }else{
      has_unsplit = true;
    }

    total += transactionTotal(transaction.transactions);
    
  }

  return {
    has_split,
    has_dispute,
    has_unsplit,
    total
  }
}

export const paymentTotal = (transaction) => {
  let total = 0;
  let has_split = false;
  let has_dispute = false;
  let has_unsplit = false;

  // for (let transaction of transactions){
    if (transaction.dispute && transaction.dispute.status === 'open') {
      has_dispute = true;
    }

    if (transaction.is_splitted === 1 ) {
      has_split = true;
      // continue;
    }else{
      has_unsplit = true;
    }

    total += transactionTotal(transaction.payment_transactions);
    
  // }

  return {
    has_split,
    has_dispute,
    has_unsplit,
    total
  }
}