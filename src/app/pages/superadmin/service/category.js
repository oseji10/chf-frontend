import chfstyles from "../chfadmin/chfadmin.module.scss";
import PageTitle from "../../../components/pageTitle/pageTitle";
import Inlinesearchbox from "../../chfadmin/inlinesearchbox";
import THead from "../../../components/table/thead/thead";
import Icon from "../../../components/icon/icon";
import API from "../../../config/chfBackendApi";
import { useEffect } from "react";
import { useState } from "react";
import { timestampToRegularTime } from "../../../utils/date.util";
import { Spinner } from "react-bootstrap";
import Modal from "../../../components/modal/modal";
import ModalHeader from "../../../components/modal/modalHeader";
import ModalBody from "../../../components/modal/modalBody";
import ModalFooter from "../../../components/modal/modalFooter";
// import Input from '../../../components/form/input'
import AuthorizedOnlyComponent from "../../../components/authorizedOnlyComponent";
import { formatErrors } from "../../../utils/error.utils";

const Category = () => {
  const initial_state = {
    categories: [],
    roles: [],
    loadingCategories: true,
    loadingRoles: true,
    showEditCategoryModal: false,
    showAddCategoryModal: false,
    showDeleteCategoryModal: false,
    categoryToDeleteID: null,
    newCategoryName: "",
    newCategoryCode: "",
    message: "",
    searchServiceInputValue: "",
    editCategoryCode: "",
    editCategoryName: "",
    deleteCategoryName: "",
    editServiceCategory: 1,
    categoryToUpdateID: null,
    showAttachRoleModal: false,
    attachCategoryName: "",
    categoryToAttachID: null,
    attachCategoryRoleId: "",
  };

  const [state, setState] = useState(initial_state);

  const table_columns = [
    {
      column_name: "#",
    },
    {
      column_name: "Category Name",
    },
    {
      column_name: "Category Code",
    },
    {
      column_name: "Created_At",
    },
    {
      column_name: "",
    },
  ];

  const setStateValue = (key, value) => {
    return setState((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  /* THE PASSED IN CALLBACK IS OPTIONAL, CALLBACK CAN BE USED TO SEARCH FOR ITEM OR FILTER */
  const loadCategories = async (callback = () => null) => {
    setStateValue("loadingCategories", true);

    try {
      const categoriesRequest = API.get("/api/service_categories");
      const rolesRequest = API.get("/api/roles");
      const res = await Promise.all([categoriesRequest, rolesRequest]);
      setState((prevState) => ({
        ...prevState,
        categories: Object.values(res[0].data.data),
        roles: res[1].data.data,
      }));

      //    PASS RES TO CALLBACK FOR SEARCH TO WORK WELL
      callback(Object.values(res[0].data.data));
    } catch (e) {
      console.log(e.response);
    } finally {
      setStateValue("loadingCategories", false);
      setStateValue("loadingRoles", false);
    }
  };

  const renderCategories = () => {
    return state.categories.map((category, index) => (
      <tr key={index}>
        <td>{index + 1}</td>
        <td>{category.category_name}</td>
        <td>{category.category_code}</td>
        <td>{timestampToRegularTime(category.created_at)}</td>
        <td>
          <AuthorizedOnlyComponent requiredPermission="ATTACH_ROLE_CATEGORY">
            <button
              className="btn text-info"
              onClick={() => handleAttachRoleButtonClick(category.id)}
            >
              Role
              <Icon icon="fa fa-plus text-info" />
            </button>
          </AuthorizedOnlyComponent>
        </td>
        <td>
          <AuthorizedOnlyComponent requiredPermission="DELETE_CATEGORY">
            <button
              className="btn"
              onClick={() => handleDeleteButtonClick(category.id)}
            >
              <Icon icon="fa fa-trash text-danger" />
            </button>
          </AuthorizedOnlyComponent>
        </td>
        <td>
          <AuthorizedOnlyComponent requiredPermission="EDIT_CATEGORY">
            <button
              className="btn"
              onClick={() => handleEditButtonClick(category.id)}
            >
              <Icon icon="fa fa-edit text-secondary" />
            </button>
          </AuthorizedOnlyComponent>
        </td>
      </tr>
    ));
  };

  const renderRoles = () => {
    return state.roles.map((role, index) => (
      <li
        className="list-group-item clickable"
        key={index}
        onClick={() => handleRoleClick(role.id)}
      >
        {role.role}
      </li>
    ));
  };

  const renderCategoryRoles = (category_id) => {
    if (category_id) {
      const selectedCategory = state.categories.filter(
        (category) => category.id === category_id
      )[0];
      return selectedCategory.roles.map((role, index) => (
        <span key={index} className={`${chfstyles.badge}`}>
          {role.role}{" "}
          <span
            onClick={() => {
              handleDetachCategoryRole(role.id);
            }}
          >
            x
          </span>
        </span>
      ));
    }
    return <span>No roles for this category</span>;
  };

  const handleAddCategory = async () => {
    try {
      const newFormData = {
        category_name: state.newCategoryName,
        category_code: state.newCategoryCode,
      };
      //   console.log(newFormData);

      const res = await API.post("/api/service_categories", newFormData);
      setState((prevState) => ({
        ...prevState,
        categories: [res.data.data, ...prevState.categories],
        newCategoryName: "",
        newCategoryCode: "",
      }));
      setStateValue("showAddCategoryModal", false);
    } catch (e) {
      console.log(e.response);
    }
  };

  const handleDeleteCategory = async () => {
    try {
      // eslint-disable-next-line no-unused-vars
      const res = await API.delete(
        `/api/service_categories/${state.categoryToDeleteID}`
      );
      loadCategories();
      setStateValue("showDeleteCategoryModal", false);
    } catch (e) {
      //   console.log(e.response);
      setState((prevState) => ({
        ...prevState,
        message: formatErrors(e),
      }));
    }
  };

  const handleAttachCategoryRole = async () => {
    try {
      // eslint-disable-next-line no-unused-vars
      const res = await API.post(
        `/api/service_categories/${state.categoryToAttachID}/roles/${state.attachCategoryRoleId}`
      );
    //   loadCategories();
      setState((prevState) => ({
        ...prevState,
        categories: [
          ...prevState.categories.filter(
            (category) => category.id !== state.categoryToAttachID
          ),
          res.data.data,
        ]
      }));
    } catch (e) {
      //   console.log(e.response);
      setState((prevState) => ({
        ...prevState,
        message: formatErrors(e),
      }));
    }
  };

  const handleDetachCategoryRole = async (role_id) => {
    try {
      setStateValue("message", "");
      // eslint-disable-next-line no-unused-vars
      const res = await API.delete(
        `/api/service_categories/${state.categoryToAttachID}/roles/${role_id}`
      );
      setState((prevState) => ({
        ...prevState,
        categories: [
          ...prevState.categories.filter(
            (category) => category.id !== state.categoryToAttachID
          ),
          res.data.data,
        ],
      }));
    } catch (e) {
      //   console.log(e.response);
      setState((prevState) => ({
        ...prevState,
        message: formatErrors(e),
      }));
    }
  };

  const handleDeleteButtonClick = (service_category_id) => {
    setStateValue("message", "");
    const category = state.categories.filter(
      (category) => category.id === service_category_id
    )[0];
    setState((prevState) => ({
      ...prevState,
      showDeleteCategoryModal: true,
      deleteCategoryName: category.category_name,
      categoryToDeleteID: category.id,
    }));
  };

  const handleAttachRoleButtonClick = (service_category_id) => {
    const category = state.categories.filter(
      (category) => category.id === service_category_id
    )[0];
    setState((prevState) => ({
      ...prevState,
      showAttachRoleModal: true,
      attachCategoryName: category.category_name,
      categoryToAttachID: category.id,
    }));
  };

  const handleEditButtonClick = (category_id) => {
    const category = state.categories.filter(
      (category) => category.id === category_id
    )[0];
    setState((prevState) => ({
      ...prevState,
      showEditCategoryModal: true,
      editCategoryName: category.category_name,
      editCategoryCode: category.category_code,
      categoryToUpdateID: category.id,
    }));
  };

  const handleUpdateCategory = async () => {
    try {
      const updateFormData = {
        category_name: state.editCategoryName,
        category_code: state.editCategoryCode,
      };

      const res = await API.put(
        `/api/service_categories/${state.categoryToUpdateID}`,
        updateFormData
      );

      setState((prevState) => ({
        ...prevState,
        categories: prevState.categories.map((category) =>
          category.id === prevState.categoryToUpdateID
            ? res.data.data
            : category
        ),
      }));
      setStateValue("showEditCategoryModal", false);
    } catch (e) {
      console.log(e.response);
    }
  };

  const handleRoleClick = (role_id) => {
    /* CALLBACK IS PASSED INTO LOADCATEGORY FUNCTION TO FILTER THE ROLES AFTER FETCHING FROM SERVER */
    loadCategories((res) => {
      const categories = [];
      for (let category of res) {
        if (category.roles.filter((role) => role.id === role_id).length) {
          categories.push(category);
        }
      }
      setState((prevState) => ({
        ...prevState,
        categories: categories,
      }));
    });
  };

  const handleSearchCategory = () => {
    loadCategories((categories) => {
      setState((prevState) => ({
        ...prevState,
        categories: categories.filter((category) =>
          new RegExp(
            `(${state.searchServiceInputValue.toLowerCase()})`,
            "g"
          ).test(category.category_name.toLowerCase())
        ),
      }));
    });
  };

  let pageLoaded = false;
  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    pageLoaded = true;
  }, [pageLoaded]);

  return (
    <>
      <div className={["container", chfstyles.chfadmin_wrapper].join(" ")}>
        <PageTitle title="Categories" />
        <Inlinesearchbox
          inputValue={state.searchServiceInputValue}
          inputPlaceholder="Search Categories"
          onInputChange={(e) =>
            setStateValue("searchServiceInputValue", e.target.value)
          }
          onButtonClick={handleSearchCategory}
          icon="fa fa-search"
        />
        <div className={["row"].join(" ")}>
          <div className="col-md-3 shadow-sm p-2">
            <h6 className="text-secondary text-center p-2">Roles </h6>
            <ul className="list-group">
              <li
                className="list-group-item clickable"
                onClick={() => loadCategories()}
              >
                All Categories
              </li>
              {(state.loadingRoles && (
                <Spinner animation="border" variant="success" />
              )) ||
                renderRoles()}
            </ul>
          </div>
          <div className={["col-md-9 p-4", chfstyles.chfadmin_table].join(" ")}>
            <h6 className="text-secondary p-2">
              Categories
              <AuthorizedOnlyComponent requiredPermission="CREATE_CATEGORY">
                <button
                  className="float-right btn btn-sm btn-success"
                  onClick={() => setStateValue("showAddCategoryModal", true)}
                >
                  Add Category <Icon icon="fa fa-plus" />{" "}
                </button>
              </AuthorizedOnlyComponent>
            </h6>
            <div className={chfstyles.scrollableX}>
              <table className="table table-responsive-sm">
                <THead columns={table_columns} />
                <tbody>
                  {(state.loadingCategories && (
                    <Spinner animation="border" variant="success" />
                  )) ||
                    renderCategories()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {state.showAddCategoryModal && (
        <Modal>
          <ModalHeader
            modalTitle="Add Category"
            onModalClose={() => setStateValue("showAddCategoryModal", false)}
          />
          <ModalBody>
            <div className="form-group">
              <label className="text-secondary">Category Name</label>
              <input
                className="form-control"
                required
                value={state.newCategoryName}
                onChange={(e) => setStateValue(e.target.name, e.target.value)}
                name="newCategoryName"
              />
            </div>
            <div className="form-group">
              <label className="text-secondary">Category Code</label>
              <input
                className="form-control"
                required
                value={state.newCategoryCode}
                onChange={(e) => setStateValue(e.target.name, e.target.value)}
                name="newCategoryCode"
                placeholder="Category Code"
                maxLength="5"
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <button
              className="btn btn-success btn-sm mr-3"
              onClick={handleAddCategory}
            >
              Create
            </button>
            <button
              className="btn btn-secondary btn-sm mr-3"
              onClick={() => setStateValue("showAddCategoryModal", false)}
            >
              Cancel
            </button>
          </ModalFooter>
        </Modal>
      )}

      {state.showDeleteCategoryModal && (
        <Modal>
          <ModalHeader
            modalTitle="Delete Category"
            onModalClose={() => setStateValue("showDeleteCategoryModal", false)}
          />
          <ModalBody>
            <p>
              <strong>
                Are you sure you want to delete{" "}
                <em>{state.deleteCategoryName}</em> service category?
              </strong>
            </p>
          </ModalBody>
          <ModalFooter>
            <p className="text-danger">{state.message}</p>
            <button
              className="btn btn-sm btn-danger mr-3"
              onClick={handleDeleteCategory}
            >
              Delete
            </button>
            <button
              className="btn btn-secondary btn-sm mr-3"
              onClick={() => setStateValue("showDeleteCategoryModal", false)}
            >
              Cancel
            </button>
          </ModalFooter>
        </Modal>
      )}

      {state.showEditCategoryModal && (
        <Modal>
          <ModalHeader
            modalTitle="Edit Category"
            onModalClose={() => setStateValue("showEditCategoryModal", false)}
          />
          <ModalBody>
            <div className="form-group">
              <label className="text-secondary">Category Name</label>
              <input
                className="form-control"
                required
                value={state.editCategoryName}
                onChange={(e) => setStateValue(e.target.name, e.target.value)}
                name="editCategoryName"
              />
            </div>
            <div className="form-group">
              <label className="text-secondary">Category Code</label>
              <input
                className="form-control"
                required
                value={state.editCategoryCode}
                onChange={(e) => setStateValue(e.target.name, e.target.value)}
                name="editCategoryCode"
                placeholder="Category Code"
                maxLength="5"
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <button className="btn btn-success" onClick={handleUpdateCategory}>
              Update
            </button>
          </ModalFooter>
        </Modal>
      )}
      {state.showAttachRoleModal && (
        <Modal>
          <ModalHeader
            modalTitle={`Attach role to ${state.attachCategoryName}`}
            onModalClose={() => setStateValue("showAttachRoleModal", false)}
          />
          <ModalBody>
            <div className="form-group">
              <label className="text-secondary">Select role to attach</label>
              <select
                className="custom-select"
                required
                defaultValue={state.attachCategoryRoleId}
                onChange={(e) => setStateValue(e.target.name, e.target.value)}
                name="attachCategoryRoleId"
              >
                <option value="">...select...</option>
                {state.roles.map((role, idx) => (
                  <option key={`${role.name}${idx}`} value={role.id}>
                    {role.role}
                  </option>
                ))}
              </select>
            </div>
            <button className="btn btn-success" onClick={handleAttachCategoryRole}>
              Attach
            </button>
          </ModalBody>
          <ModalFooter>
            <h6>{`Attached Roles`}</h6>
            {renderCategoryRoles(state.categoryToAttachID)}
          </ModalFooter>
        </Modal>
      )}
    </>
  );
};

export default Category;
