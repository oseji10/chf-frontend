import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { useState, useEffect } from "react";
import PageTitle from "../../../components/pageTitle/pageTitle";
import HTable from "../../../components/table/HTable";
import { timestampToRegularTime } from "../../../utils/date.util";
import Button from "../../../components/button";
import Label from "../../../components/form2/label/label";
import Input from "../../../components/form/input";
import Card from "../../../components/card/card";
import PageSpinner from "../../../components/spinner/pageSpinner";
import { formatErrors } from "../../../utils/error.utils";
import { propagatePopup } from "../../../redux/popup/popup.action";
import API from "../../../config/chfBackendApi";
import ModalMessage from "../../../components/message/ModalMessage";
import TextArea from "../../../components/form/textarea";

const initial_state = {
  isLoading: true,
  siteSettings: [],
  isSubmitting: false,
  showEditModal: false,
  key: "",
  value: "",
  editKey: "",
  editValue: "",
  editId:""
};

const tableHeaders = [
  { value: "KEY" },
  { value: "VALUE" },
  { value: "CREATED AT" },
  { value: "UPDATED AT" },
];

function SiteSettings(props) {
  const { propagatePopup } = props;
  const [state, setState] = useState(initial_state);

  const setStateValue = (name, value) => {
    setState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, []);

  const loadData = async () => {
    try {
      setStateValue("isLoading", true);
      const res = await API.get("/api/sitesettings");

      setStateValue("siteSettings", res.data.data);
    } catch (e) {
    } finally {
      setStateValue("isLoading", false);
    }
  };

  const resetAddForm = () => {
    setState((prevState) => ({
      ...prevState,
      key: "",
      value: "",
      editId:""
    }));
  };

  const resetEditForm = () => {
    setState((prevState) => ({
      ...prevState,
      editKey: "",
      editValue: "",
    }));
  };

  const handleEditSetting = async (e) => {
    try {
      e.preventDefault();
      setStateValue("isSubmitting", true);

      // Submit form
      if (!state.editValue || !state.editKey) {
        return propagatePopup({
          content: "Provide a key and value to edit this site setting",
          title: "Empty value",
          type: "danger",
          timeout: 5000,
        });
      }

      //submit
      const id=state.editId;
      const res = await API.put(`/api/sitesettings/${id}`, {
        key: state.editKey,
        value: state.editValue,
      });

      if (res.data.data) {
        setState((prevState) => ({
          ...prevState,
          siteSettings: [res.data.data, ...prevState.siteSettings.filter(setting=>setting.id!==id)]
        }));

        resetEditForm();
        return propagatePopup({
          content: "Site setting updated",
          title: "Suceess",
          type: "success",
          timeout: 5000,
        });
      }
    } catch (e) {
      propagatePopup({
        content: formatErrors(e),
        title: "Error",
        type: "danger",
        timeout: 5000,
      });
    } finally {
      setStateValue("isSubmitting", false);
      setStateValue("showEditModal", false);
    }
  };

  const handleAddSetting = async (e) => {
    try {
      e.preventDefault();
      setStateValue("isSubmitting", true);

      // Submit form
      if (!state.value || !state.key) {
        return propagatePopup({
          content: "Provide a key and value for this site setting",
          title: "Empty value",
          type: "danger",
          timeout: 5000,
        });
      }

      //submit
      const res = await API.post(`/api/sitesettings`, {
        key: state.key,
        value: state.value,
      });

      if (res.data.data) {
        setState((prevState) => ({
          ...prevState,
          siteSettings: [res.data.data, ...prevState.siteSettings],
        }));
        resetAddForm();
        return propagatePopup({
          content: "Site setting added",
          title: "Suceess",
          type: "success",
          timeout: 5000,
        });
      }
    } catch (e) {
      propagatePopup({
        content: formatErrors(e),
        title: "Error",
        type: "danger",
        timeout: 5000,
      });
    } finally {
      setStateValue("isSubmitting", false);
    }
  };

  const showEditSetting = (setting) => {
    setState(prevState=>({
        ...prevState,
        showEditModal:true,
        editId: setting.id,
        editKey: setting.key,
        editValue: setting.value
    }));
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-sm-12">
          {(state.isSubmitting || state.isLoading) && <PageSpinner />}
          <PageTitle title="Site settings" />

          <ModalMessage
            title={`Edit Site settings`}
            show={state.showEditModal}
            onHide={() => setStateValue("showEditModal", false)}
            dismissible={true}
          >
            <Label label="Settings key" />
            <Input
              inputName="editKey"
              type={"text"}
              value={state.editKey}
              placeholder={"key"}
              onChange={(e) => setStateValue(e.target.name, e.target.value)}
            />
            <Label label="Settings value" />
            <TextArea
              value={state.editValue}
              onChange={(e) => setStateValue(e.target.name, e.target.value)}
              placeholder="Value"
              inputName="editValue"
            />
            <div className="d-flex my-4">
              <Button
                btnClass={"btn btn-success"}
                type={"button"}
                value="Edit"
                onClick={handleEditSetting}
              />
              <Button
                btnClass={"btn btn-success"}
                type={"button"}
                value="CLose"
                onClick={() => setStateValue("showEditModal", false)}
              />
            </div>
          </ModalMessage>
          {/* SHOW JUMBOTROM TO SEARCH PATIENT */}
          <Card>
            <form onSubmit={handleAddSetting}>
              <div className="col-md-10">
                <Label label="Settings key" />
                <Input
                  inputName="key"
                  classes={"w-100"}
                  type={"text"}
                  value={state.key}
                  placeholder={"key"}
                  onChange={(e) => setStateValue(e.target.name, e.target.value)}
                />
                <Label label="Settings value" />
                <TextArea
                  value={state.value}
                  onChange={(e) => setStateValue(e.target.name, e.target.value)}
                  placeholder="Value"
                  inputName="value"
                />

                <Button
                  btnClass={"btn btn-success"}
                  type={"submit"}
                  value="Add"
                />
              </div>
            </form>
          </Card>

          {/* RENDER TABLE OF APPLICATION */}
          {state.siteSettings.length ? (
            <HTable>
              <thead>
                <tr>
                  <th>SN</th>
                  {tableHeaders &&
                    tableHeaders.map((header, index) => (
                      <th key={`h-${index}`}>{header.value}</th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {state.siteSettings &&
                  state.siteSettings.map((data, index) => (
                    <tr key={index}>
                      <td>{++index}</td>
                      <td>{data.key}</td>
                      <td>{data.value}</td>
                      <td>{timestampToRegularTime(data.created_at)}</td>
                      <td>{timestampToRegularTime(data.updated_at)}</td>
                      <td>
                        <Button
                          btnClass={"btn btn-success"}
                          type={"button"}
                          value="Edit"
                          onClick={() => {
                            showEditSetting(data);
                          }}
                        />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </HTable>
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
}

const matchDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      propagatePopup,
    },
    dispatch
  );
};
const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
  };
};

export default connect(mapStateToProps, matchDispatchToProps)(SiteSettings);
