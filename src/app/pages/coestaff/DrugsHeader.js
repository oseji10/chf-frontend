import { useState } from "react";
import Button from "../../components/button";
import { formatAsMoney } from "../../utils/money.utils";
import styles from "./coestaff.module.scss";
// import { formatAsMoney } from "../../utils/money.utils";

export default function DrugsHeader({ currentDrug, addDrug }) {
//   const qtyRef = useRef(null);
  const [currentQty, setCurrentQty] = useState(1);
  const handleAddDrug = () => {
    const drug = currentDrug;
    if (currentQty) {
      drug.quantity = currentQty;
      addDrug(drug);
    }
  };
  const handleQtyChange=(e)=>{
    setCurrentQty(e.target.value);
  }
  return (
    <div className={`row ` + styles.service_table}>
      <div className="col-md-6 mt-2">
        {currentDrug && currentDrug.drug && (
          <span>
            
            {currentDrug.drug?.productName}{" "}
            {currentDrug.drug?.description} ({currentDrug.drug?.manufacturer?.manufacturerName}) | <del>N</del>{formatAsMoney(currentDrug.drug?.price ?? 0)}
          </span>
        )}
      </div>
      {currentDrug && currentDrug.drug && (
        <div className="col-md-3 mt-2">
          <input
            type="number"
            id="quantity"
            name="quantity"
            defaultValue={currentQty}
            placeholder="Quantity"
            onChange={handleQtyChange}
          />
        </div>
      )}
      <div className="col-md-3 mt-2">
        {currentDrug && currentDrug.drug && (
          <Button
            value="Add"
            onClick={handleAddDrug}
            btnClass="btn btn-success"
            type="text"
          />
        )}
      </div>
    </div>
  );
}
