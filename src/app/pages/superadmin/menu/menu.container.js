import React, { useEffect, useState } from 'react'
import API from '../../../config/chfBackendApi';
import chfstyles from '../chfadmin/chfadmin.module.scss'
import PageTitle from '../../../components/pageTitle/pageTitle';
import THead from '../../../components/table/thead/thead';
import Modal from '../../../components/modal/modal'
import ModalHeader from '../../../components/modal/modalHeader'
import ModalBody from '../../../components/modal/modalBody'
import ModalFooter from '../../../components/modal/modalFooter'

export default function MenuContainer() {
    const table_columns = [
        {
            column_name: '#'
        },
        {
            column_name: 'Menu Name'
        },
        {
            column_name: 'Menu Link'
        },
        {
            column_name: 'Menu Permission'
        },
        {
            column_name: 'Menu Icon'
        },
        {
            column_name: 'Menu Category'
        },
        {
            column_name: ''
        },

    ]


    const [state, setState] = useState({
        menuList: [],
        permissions: [],
        showDeleteModal: false,
        showCreateModal: false,
        menuToDelete: '',
        newMenuName: "",
        newMenuIcon: "",
        newMenuLink: '',
        newMenuCategory: 'side_menu',
        newMenuPermission: '',
    })

    let menuLoaded = false;

    const loadUIMenus = async () => {
        try {
            const menu_promise = API.get('/api/uimenu');
            const permission_promise = API.get('/api/permissions');
            const res = await Promise.all([
                menu_promise,
                permission_promise,
            ]);


            setState(prevState => ({
                ...prevState,
                menuList: res[0].data.data,
                permissions: res[1].data.data,
                newMenPermission: res[1].data.data[0].permission
            }));

        } catch (e) {
            // console.log(e)
        }
    }

    useEffect(() => {
        loadUIMenus();
        menuLoaded = true;
    }, [menuLoaded])

    const handleStatePropertyChange = (key, value) => {
        return setState(prevState => ({
            ...prevState,
            [key]: value
        }))
    }

    const renderMenuList = () => {
        return state.menuList.map((menu, index) => {
            return <tr key={index}>
                <td>
                    {index + 1}
                </td>
                <td>{menu.menu_name}</td>
                <td>{menu.menu_link}</td>
                <td>{menu.menu_permission}</td>
                <td>{menu.menu_icon}</td>
                <td>{menu.menu_category}</td>
                <td><button onClick={() => handleShowDeleteModal(menu.id)} className='btn btn-sm btn-danger'><i className='fa fa-trash'></i> </button></td>
            </tr>
        })
    }

    const handleShowDeleteModal = menu_id => {
        setState(prevState => ({
            ...prevState,
            menuToDelete: menu_id,
            showDeleteModal: true,
        }))
    }

    const handleCreateMenu = async () => {
        try {
            const newMenuData = {
                menu_name: state.newMenuName,
                menu_permission: state.newMenuPermission,
                menu_icon: state.newMenuIcon,
                menu_link: state.newMenuLink,
                menu_category: state.newMenuCategory
            }

            const res = await API.post('/api/uimenu', newMenuData);


            return setState(prevState => ({
                ...prevState,
                menuList: [
                    res.data.data,
                    ...prevState.menuList
                ],
                newMenuName: "",
                newMenuCategory: "",
                newMenuIcon: "",
                newMenuLink: "",
                newMenuPermission: "",
                showCreateModal: false,
            }));
        } catch (e) {
            console.log(e.response)
        }
    }

    const handleDeleteMenu = async () => {
        try {
            const res = await API.delete(`/api/uimenu/${state.menuToDelete}`);

            setState(prevState => ({
                ...prevState,
                menuList: prevState.menuList.filter(menuItem => menuItem.id !== prevState.menuToDelete),
                menuToDelete: null,
            }))
        } catch (e) {
            console.log(e.response)
        }
    }


    return (
        <>
            <div className={['container', chfstyles.chfadmin_wrapper].join(' ')}>
                <PageTitle title="Menus" icon='fa fa-cog' />
                <div className={chfstyles.tabs}>
                    <a href='javascript:;' className={[chfstyles.tab_item, chfstyles.active].join(' ')} onClick={() => handleStatePropertyChange('showCreateModal', true)}>Create </a>

                </div>
                <div className={[chfstyles.chfadmin_table, chfstyles.scrollableX].join(' ')}>
                    <table className='table table-responsive-sm'>
                        <THead
                            columns={table_columns}
                        />
                        <tbody>
                            {renderMenuList()}
                        </tbody>
                    </table>
                </div>
            </div>

            {state.showCreateModal && <Modal>
                <ModalHeader modalTitle='Create Menu' onModalClose={() => handleStatePropertyChange('showCreateModal', false)}></ModalHeader>
                <ModalBody>
                    <div className='row'>
                        <div className='col-md-6'>
                            <div className='form-group'>
                                <label>Menu Name</label>
                                <input className='form-control' name='newMenuName' value={state.newMenuName} onChange={e => handleStatePropertyChange(e.target.name, e.target.value)} />
                            </div>
                        </div>
                        <div className='col-md-6'>
                            <div className='form-group'>
                                <label>Menu Link</label>
                                <input className='form-control' name='newMenuLink' value={state.newMenuLink} onChange={e => handleStatePropertyChange(e.target.name, e.target.value)} />
                            </div>
                        </div>
                        <div className='col-md-6'>
                            <div className='form-group'>
                                <label>Menu Icon</label>
                                <input className='form-control' name='newMenuIcon' value={state.newMenuIcon} onChange={e => handleStatePropertyChange(e.target.name, e.target.value)} />
                            </div>
                        </div>
                        <div className='col-md-6'>
                            <div className='form-group'>
                                <label>Menu Permission</label>
                                <select name='newMenuPermission' className="form-control" onChange={e => handleStatePropertyChange(e.target.name, e.target.value)}>

                                    {state.permissions.map(permission => <option value={permission.permission}>{permission.permission}</option>)}

                                </select>
                            </div>
                        </div>
                        <div className='col-sm-12'>
                            <div className='form-group'>
                                <label>Menu Category</label>
                                <input className='form-control' name='newMenuCategory' value={state.newMenuCategory} onChange={e => handleStatePropertyChange(e.target.name, e.target.value)} />
                            </div>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <button className='btn btn-success' onClick={handleCreateMenu}>Create Menu</button>
                </ModalFooter>
            </Modal>}

            {
                state.showDeleteModal && <Modal>
                    <ModalHeader modalTitle="Delete Menu" onModalClose={() => handleStatePropertyChange('showDeleteModal', false)}></ModalHeader>
                    <ModalFooter>
                        <button className="btn btn-danger" onClick={handleDeleteMenu}>Delete <i className='fa fa-trash'></i> </button>
                    </ModalFooter>
                </Modal>
            }

        </>
    )
}
