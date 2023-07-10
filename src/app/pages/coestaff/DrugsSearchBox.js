import { useState, useEffect } from "react";
import MessageAlert from "../../components/message/messageAlert";
import Select from "react-select";
import axios from "axios";
import styles from "./coestaff.module.scss";
import { CAPBackendAPI } from "../../config/chfBackendApi";

const customStyles = {
  container: (provided, state) => ({
    ...provided,
    width: "100%",
    padding: 0,
    fontSize: "9pt",
  }),
};

const initial_state = {
  drugs: [],
  drugSelectOption: [],
};

function DrugsSearchBox(props) {
  const [state, setState] = useState(initial_state);
  const {
    patient,
    addCurrentDrug,
  } = props;

  const getDrugs = async () => {
    try {
      const res = await CAPBackendAPI.get('/product')
      //   console.log(res[0]);
      setState((prev) => ({
        ...prev,
        drugs: res.data.data,
        drugSelectOption: prepareDrugSelectOption(res.data.data),
      }));
    } catch (e) {
      console.log(e);
    }
  };

  let pageLoaded = false;
  useEffect(() => {
    try {
      getDrugs();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      pageLoaded = true;
    } catch (e) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageLoaded]);

  const prepareDrugSelectOption = (drugs) => {
    const options = [];
    for (let drug of drugs) {
      options.push({
        label: `${drug.productName} ${drug.description} (${drug.manufacturer?.manufacturerName})`,
        value: `${drug.productId}`,
      });
    }
    return options;
  };

  const handleDrugChange = (e) => {
    const selectedDrug = state.drugs.find((drug) => drug.productId === e.value);
    // console.log(selectedDrug);
    addCurrentDrug(selectedDrug);
  };

  return (
    <div>
      <div className={`row ` + styles.service_table}>
        <div className="col-sm-12 mt-2">
          {props.hasAlert && (
            <MessageAlert
              alertMessage={alert.alertMessage}
              alertVariant={alert.alertVariant}
            />
          )}
          {patient && (
            <Select
              styles={customStyles}
              name="coe_id"
              id="coe_id"
              placeholder="Select Drug"
              options={state.drugSelectOption}
              onChange={handleDrugChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default DrugsSearchBox;
