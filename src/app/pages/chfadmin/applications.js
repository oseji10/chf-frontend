/* eslint-disable eqeqeq */
/* eslint-disable no-script-url */
import React, { useState, useEffect } from 'react'
import styles from './chfadmin.module.scss';
import API from "../../config/chfBackendApi";
import AlertText from '../../components/message/alertText';
import { formatAsMoney, inWords } from '../../utils/money.utils';
import { timestampToRegularTime, _calculateAge } from '../../utils/date.util';
import { Button, Col, Row, Spinner } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom'
import { formatName } from '../../utils/dataFormat.util';
import { APPROVED, APPROVE_FUND, COMMITTEE_RECOMMEND_FUND, DANGER, DECLINED, INCOMPLETE_PROFILE, INFO, IN_PROGRESS, NOT_APPLICABLE, NOT_SELECTED, PENDING, PROFILE_COMPLETED, RECOMMENDED, SUCCESS, WARNING } from '../../utils/constant.util';
import ToggleSwitch from '../../components/toggle-switch/toggle-switch';
import CareplanModal from '../../components/careplanModal/careplanModal';
import APIResponseHelper from '../../utils/apiResponse.util';
import { getAuthStorageUser } from '../../utils/storage.util';
import MUIDataTable from 'mui-datatables';
import { DataFormatUtility, TableUtility } from '../../utils';
import { errorAlert, successAlert } from '../../utils/alert.util';
import { errorHandler } from '../../utils/error.utils';
import { Modal, ModalHeader, ModalBody, ModalFooter, Textarea, Label, Icon, Select, AuthorizedOnlyComponent, Button as Button2 } from '../../components'

const initial_state = {
    tableLoading: true,
    applicationsRepository: [],
    applications: [],
    activeApplication: null,
    patientSearchInputValue: '',
    patientSearched: false,
    activeMenu: 1,
    showApproveModal: false,
    showApplicationReviewModal: false,
    showRecommendationModal: false,
    showOverrideModal: false,
    poolFundBalance: 0,
    isApproving: false,
    showOnlyCompleteProfile: false,
    showCOEBalance: false,
    showCareplan: false,
    filter: '',
    activeCOE: '',
    coes: [],
    pagination: {
        per_page: 10,
        page: 1,
        filter: '',
        links: null,
        pages: 1,
    },
    amountToApprove: 0,
    reasonForApproval: '',
    recommendationComment: '',
    alert: {
        alert_type: null,
        message: "",
        alert_color: 'white',
    },

}

export default function Applications() {
    const dispatch = useDispatch();
    const auth = getAuthStorageUser()

    const [state, setState] = useState(initial_state);

    const setStateValue = (key, value) => {
        return setState(prevState => ({
            ...prevState,
            [key]: value
        }))
    }

    useEffect(() => {
        try {
            loadPatients();
        } catch (e) {
            // console.log(e.response);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleCompletedProfileOnlyChange = () => {
        const showOnlyCompleteProfile = !state.showOnlyCompleteProfile;
        return setState(prevState => ({
            ...prevState,
            showOnlyCompleteProfile,
            applications: prevState.applicationsRepository.filter(application => {
                if (showOnlyCompleteProfile) {
                    return application.status.toLowerCase() !== IN_PROGRESS.toLowerCase()
                }
                return true;
            })
        }))
    }

    /* FETCH PATIENTS FROM BACKEND SERVICE */
    const loadPatients = async () => {
        try {
            toggleLoader(true)

            // const res = await Promise.all([
            //     API.get(`/api/applications?per_page=25&page=${state.pagination.page}&filter=${state.pagination.filter}&per_page=${state.pagination.per_page}`),
            //     API.get('/api/coes'),
            //     // API.get('/api/sitesettings/pool_account_balance'),
            // ]);

            const coeRes = await API.get('/api/coes');
            const applicationsRes = await API.get(`/api/applications?per_page=25&page=${state.pagination.page}&filter=${state.pagination.filter}&per_page=${state.pagination.per_page}`);

            setState(prevState => ({
                ...prevState,
                applicationsRepository: applicationsRes?.data?.data ?? [],
                applications: applicationsRes?.data?.data ?? [],
                coes: coeRes?.data?.data ?? [],
            }))

        } catch (e) {
            // console.log(e.response)
        } finally {
            toggleLoader(false)
        }
    }

    const toggleLoader = loader_state => {
        setState(prevState => ({
            ...prevState,
            tableLoading: loader_state,
        }))
    }

    /* END SEARCH APPLICATION HANDLERS */

    const loggedInUserReview = () => {
        return state.activeApplication.committee_approvals.find(approval => approval.committee_member_id === auth.user.id)
    }

    const handleApplicationSelect = index => {
        // window.scrollTo(0, 0);
        let patient = state.applications.find((application, currentIndex) => currentIndex === index)

        setState(prevState => ({
            ...prevState,
            reasonForApproval: '', //Prevent using someone else's comment
            activeApplication: prevState.applications.find((application, currentIndex) => currentIndex === index)
        }))
    }

    const renderThirdActionButton = () => {
        const { activeApplication } = state;
        if (activeApplication.status.toLowerCase() !== PENDING.toLowerCase() || !activeApplication.patient.cmd_reviewed_on) return null;
        return <>
            <AuthorizedOnlyComponent requiredPermission={APPROVE_FUND}><Button className='btn btn-sm btn-success' onClick={() => handleDirectStateChange('showApproveModal', true)}>Review</Button> </AuthorizedOnlyComponent>
            {!loggedInUserReview() && <AuthorizedOnlyComponent requiredPermission={COMMITTEE_RECOMMEND_FUND}><Button className='btn btn-sm btn-success' onClick={() => handleDirectStateChange('showRecommendationModal', true)}>Recommend</Button> </AuthorizedOnlyComponent>}
        </>
    }


    /* RENDERS THE ACTIVE PATIENT TO THE SIDEBAR */
    const renderSingleApplication = () => {
        const { activeApplication } = state;
        if (!activeApplication) {
            return (<h5>No patient selected</h5>)
        }

        return (
            <>
                <div className='d-flex justify-content-end'>
                    <small className={[styles.status, activeApplication.status.toLowerCase() === 'pending' ? styles.info : activeApplication.status == 'approved' ? styles.success : activeApplication.status.toLowerCase() === 'in progress' ? styles.warning : styles.danger].join(' ')}>{activeApplication.status}</small>
                </div>
                <h4>{formatName(activeApplication.user)}</h4>
                <hr />
                <h5>{activeApplication?.patient?.ailment ? activeApplication.patient.ailment.ailment_type : "N/A"} (Stage {activeApplication.patient?.ailment_stage})</h5>
                <small className='d-block'><b>Application Date</b> </small>
                <div className={styles.status_container}>
                    <small>{timestampToRegularTime(activeApplication.created_at)}</small>
                </div>
                <div className={styles.flex_cc}>
                    <small>
                        <strong>Age:</strong>
                    </small>
                    <small>
                        {_calculateAge(activeApplication.user?.date_of_birth)}
                    </small>
                </div>

                <div className={styles.flex_cc}>
                    <small>
                        <strong>ID Type:</strong>
                    </small>
                    <small>
                        National ID
                    </small>
                </div>
                <div className={styles.flex_cc}>
                    <small>
                        <strong>ID No:</strong>
                    </small>
                    <small>
                        {activeApplication.patient?.identification_number}
                    </small>
                </div>
                {activeApplication.recommended_fund && <div className={''}>
                    <small>
                        <strong>Recommended Fund:</strong>
                    </small>
                    <small className='d-block'>
                        <del>N</del> {formatAsMoney(activeApplication.recommended_fund)}
                    </small>
                </div>}
                <small className='d-block mt-2'>
                    <strong>
                        COE
                    </strong>
                </small>
                <small className='mb-2'>{activeApplication.patient.coe.coe_name}</small>
                <div className={[styles.footer, 'd-flex justify-content-between'].join(' ')}>
                    {(activeApplication.status.toLowerCase() !== IN_PROGRESS.toLowerCase()) && <Link to={`/chfadmins/application/${activeApplication.id}`} className='btn btn-sm btn-secondary' >Profile</Link>}
                    {
                        activeApplication.patient.primary_physician_status.toUpperCase() === APPROVED && <Button variant="warning" text="Careplan" onClick={() => handleDirectStateChange('showCareplan', true)} >Careplan</Button>
                    }

                    {renderThirdActionButton()}
                </div>
            </>
        )
    }

    /* USE TO CHANGE A VALUE THAT IS DIRECTLY IN THE STATE OBJECT */
    const handleDirectStateChange = (key, value) => {
        setState(prevState => ({
            ...prevState,
            [key]: value
        }))
    }

    /* APPROVE THE USER'S FUND */
    const handleFundApproval = async (status) => {

        if (status === DECLINED.toLowerCase() && !state.reasonForApproval) {
            return errorAlert("You must specify a reason for decline")
        }
        setStateValue('isApproving', true)
        try {
            const res = await API.post('/api/chfadmin/approve_fund', {
                user_id: state.activeApplication.user.id,
                amount_approved: status === 'approved' ? state.amountToApprove : 0,
                reason: state.reasonForApproval,
                status,
                application_id: state.activeApplication.id,
            });

            successAlert(`Patient has been ${status} successfully`)


            setState(prevState => ({
                ...prevState,
                amountToApprove: 0,
                reasonForApproval: '',
                showApproveModal: false,
                showOverrideModal: false,
                applications: prevState.applications.map(application => {
                    if (application.id === prevState.activeApplication.id) {
                        return res?.data?.data[0];
                    }
                    return application;
                }),
                activeApplication: res?.data?.data[0],
                // poolFundBalance: res.data.data[1].value
            }));

        } catch (e) {
            errorHandler(e);
        } finally {
            setStateValue('isApproving', false)

        }
    }

    const handleOverride = () => {
        setState(prevState => ({
            ...prevState,
            showApplicationReviewModal: false,
            showApproveModal: false,
            showOverrideModal: true,
        }))
    }

    const handleFilterChange = e => {
        const filter = e.target.value;
        let applications = state.applicationsRepository;

        if (state.showOnlyCompleteProfile) {
            applications = applications.filter(application => application.status.toLowerCase() !== IN_PROGRESS.toLowerCase())
        }
        if (state.activeCOE) {
            applications = applications.filter(application => application.patient.coe_id === state.activeCOE)
        }
        switch (filter) {
            case RECOMMENDED: {
                applications = applications.filter(application => application.patient.cmd_reviewed_on !== null)
                break;
            }
            case APPROVED: {
                applications = applications.filter(application => application.status.toLowerCase() === APPROVED.toLowerCase())
                break
            }
            case DECLINED: {
                applications = applications.filter(application => application.status.toLowerCase() === DECLINED.toLowerCase())
                break;
            }
            case PENDING: {
                applications = applications.filter(application => application.status.toLowerCase() === PENDING.toLowerCase())
            }
            default:
                break;
        }
        return setState(prevState => ({
            ...prevState,
            applications,
            filter,
        }))
    }

    const handleRecommendPatient = async status => {
        setStateValue('isApproving', true)
        try {
            const res = await API.post('/api/chfadmin/recommend_patient', {
                application_id: state.activeApplication.id,
                status,
                comment: state.recommendationComment,
            });

            APIResponseHelper.successHandler(res.data.message)
            return setState(prevState => ({
                ...prevState,
                recommendationComment: '',
                showRecommendationModal: false,
                activeApplication: {
                    ...prevState.activeApplication,
                    committee_approvals: res.data.data
                },
                applicationsRepository: prevState.applicationsRepository.map(application => {
                    if (application.id === prevState.activeApplication.id) {
                        return {
                            ...application,
                            committee_approvals: res.data.data,
                        }
                    }
                    return application;
                })
            }))
        } catch (error) {
            APIResponseHelper.errorHandler(error)
        } finally {
            setStateValue('isApproving', false)
        }
    }

    return (
        <>
            <div className={`container ${styles.application_wrapper}`}>
                <div className={styles.application_header}>
                    <Button onClick={() => setStateValue('showCOEBalance', true)}>View COE Balance <Icon icon='fa fa-money' /></Button>
                </div>

                <div className={styles.application_table + ' row mt-3'}>
                    <Row>
                        <Col sm={12} className='p-2'>
                            <Row className='p-2 bg-muted'>
                                <Col sm={12} md={9}>
                                    Show only complete applications <ToggleSwitch active={state.showOnlyCompleteProfile} onSwitch={handleCompletedProfileOnlyChange} />
                                </Col>
                                <Col md={3} sm={12}>
                                    Filter by status
                                    <Select
                                        onChange={handleFilterChange}
                                        value={state.filter}
                                        options={[
                                            {
                                                label: "All",
                                                value: ''
                                            },
                                            {
                                                label: `CMD RECOMMENDED`,
                                                value: RECOMMENDED
                                            },
                                            {
                                                label: "FUND APPROVED",
                                                value: APPROVED
                                            },
                                            {
                                                label: "FUND DECLINED",
                                                value: DECLINED
                                            },
                                        ]}
                                    />
                                </Col>
                                {/* <Col md={3} sm={12}>
                                    COE
                                    <Select 
                                        
                                        onChange={handleCOEChange}
                                        options={[{
                                            label: "All",
                                            value: ''
                                        },...state.coes.map(coe => ({
                                            label: coe.coe_name,
                                            value: coe.id,
                                        }))]}
                                        value={state.activeCOE} />
                                </Col> */}
                                {/* <Col md={2} sm={12}>
                                    <Button onClick={printToCSV}> Download CSV <Icon icon='fa fa-download' /></Button>
                                </Col> */}
                            </Row>
                        </Col>
                        <Col sm={12} md={9}>
                            <MUIDataTable
                                title="CHF APPLICATIONS"
                                columns={TableUtility.CHFAdminApplicationTableColumns}
                                options={{
                                    ...TableUtility.defaultTableOptions,
                                    onRowClick: (rowData, meta) => handleApplicationSelect(meta.dataIndex)
                                }}

                                data={state.applications.map((application, index) => [
                                    index + 1,
                                    application.patient.coe.coe_name,
                                    application.patient.chf_id,
                                    DataFormatUtility.formatName(application.user),
                                    application.patient.ailment ? application.patient.ailment.ailment_type : NOT_SELECTED,
                                    application.patient.ailment_stage ? application.patient.ailment_stage : NOT_SELECTED,
                                    application.patient?.cmd_reviewed_on ? timestampToRegularTime(application.patient?.cmd_reviewed_on) : "N/A",
                                    timestampToRegularTime(application.created_at),
                                    DataFormatUtility.getStatusText(application),
                                    // <Tag variant={application.status.toUpperCase() === PENDING ? WARNING : application.status.toUpperCase() == APPROVED ? SUCCESS : application.status.toUpperCase() === RECOMMENDED ? INFO : DANGER} text={application.status}></Tag>,
                                ])}
                            />

                        </Col>

                        <Col sm={12} md={3} className={`bg-white shadow-sm p-2 ${styles.selected_patient}`}>
                            {(state.tableLoading && <Spinner animation='border' variant='success' />) || renderSingleApplication()}

                        </Col>
                    </Row>

                </div>
            </div>

            <CareplanModal
                show={state.activeApplication && state.showCareplan}
                patient={state.activeApplication ? state.activeApplication.patient : null}
                user={state.activeApplication ? state.activeApplication.user : null}
                onClose={() => handleDirectStateChange('showCareplan', false)}
            />

            {state.showApproveModal && <Modal >
                <ModalHeader
                    modalTitle="Approve fund"
                    onModalClose={() => handleDirectStateChange('showApproveModal', false)} >
                </ModalHeader>
                <ModalBody>
                    <h3> {formatName(state.activeApplication.user)}</h3>
                    <hr />

                    <div className={styles.flex_cc}>
                        <small>
                            <strong>MDT Recommended Fund: {formatAsMoney(state.activeApplication.patient.mdt_recommended_amount)}</strong>
                        </small>
                        <small className='d-block'>
                            <Button
                                onClick={() => setStateValue('amountToApprove', state.activeApplication.patient.mdt_recommended_amount)}
                            >use</Button>
                        </small>
                    </div>
                    <div className={styles.flex_cc}>
                        <small>
                            <strong>Physician Recommended Fund: {formatAsMoney(state.activeApplication.patient.mdt_recommended_fund)}</strong>
                        </small>
                        <small className='d-block'>
                            <Button
                                onClick={() => setStateValue('amountToApprove', state.activeApplication.patient.mdt_recommended_fund)}
                            >use</Button>
                        </small>
                    </div>
                    <div className='form-group'>
                        <label className='text-success'><strong>Amount</strong></label>
                        <input type='string' className='form-control' name='amount' min='1' value={state.amountToApprove} onChange={e => setStateValue('amountToApprove', parseFloat(e.target.value))} />
                        <p>Amount to approve: {formatAsMoney(state.amountToApprove)}</p>
                    </div>
                    {/* <div className='form-group'>
                    {((state.activeApplication.support_assessment.points_sys_suggested + state.activeApplication.support_assessment.points_user_input )/2 < 12) && <> <label className='text-success'><strong>Select reason for decline</strong></label>
                        <select 
                            value={state.reasonForApproval}
                            className='form-control' onChange={e => handleDirectStateChange('reasonForApproval',e.target.value)}>
                            <option value=''>Select Reason</option>
                            <option value='Not Indigent'>Not Indigent</option>
                            <option value='Not Eligible'>Not Eligible</option>
                            <option value='Others'>Others</option>
                        </select>
                        </>}
                    </div> */}
                </ModalBody>
                <ModalFooter>

                    {<>
                        {/* <button disabled={state.isApproving} className='btn btn-sm btn-success mr-3' onClick={() => handleFundApproval('approved')}>
                        {state.isApproving ? "Please wait..." : 'Approve'}
                        </button> */}
                        <Button2 variant='success' onClick={() => handleFundApproval('approved')} text="Approve" loading={state.isApproving} />
                        <Button2 variant='danger' onClick={handleOverride} text="Decline" loading={state.isApproving} />
                        {/*                     
                    <button  disabled={state.isApproving} className='btn btn-sm btn-danger' onClick={() => handleFundApproval('declined')}>
                        {state.isApproving ? "Please wait..." : "Decline"}
                    </button> */}
                        {/* <button  disabled={state.isApproving} className='btn btn-sm btn-danger ml-3' onClick={handleOverride}>
                        {state.isApproving ? "Please wait..." : "Decline"}
                    </button>  */}
                    </>}

                </ModalFooter>
            </Modal>}


            {/* OVERRIDE MODAL */}
            {state.showOverrideModal && <Modal >
                <ModalHeader
                    modalTitle="Decline Patient Application"
                    onModalClose={() => handleDirectStateChange('showOverrideModal', false)} >

                    <AlertText alertType={state.alert.alert_type} color={state.alert.alert_color} message={state.alert.message} />
                </ModalHeader>
                <ModalBody>
                    <h3>{formatName(state.activeApplication.user)}</h3>
                    <hr />
                    {/* <p className='text-danger p-2'>Based on the information provided by this patient and the indigent measurement metrics, this patient is not considered an indigent patient. By clicking on <strong>Override</strong> you agree that the decision is based on a consensus by the approval committee.</p> */}

                    <div className='form-group'>
                        <label className='text-success'><strong>Comment</strong></label>
                        <textarea className='form-control' name='comment' placeholder="Reason for declining" onChange={e => handleDirectStateChange('reasonForApproval', e.target.value)} value={state.reasonForApproval}></textarea>
                    </div>
                    {/* <p>You are about to approve: {inWords(state.amountToApprove || 0)} </p> */}
                </ModalBody>
                <ModalFooter >
                    <button disabled={state.isApproving} className='btn btn-sm btn-danger mr-3' onClick={() => handleFundApproval(DECLINED.toLowerCase())}>
                        {state.isApproving ? "Please wait..." : 'Decline'}
                    </button>
                    <button disabled={state.isApproving} className='btn btn-sm btn-secondary' onClick={() => handleDirectStateChange('showOverrideModal', false)}>
                        Cancel
                    </button>
                </ModalFooter>
            </Modal>}
            {/* END OVERRIDE MODAL */}

            {
                state.showCOEBalance && state.coes.length && <Modal fullscreen>
                    <ModalHeader modalTitle="COE Balance" onModalClose={() => setStateValue('showCOEBalance', false)} />
                    <ModalBody>
                        {
                            state.coes.map(coe => <div className={styles.flex_cc}>
                                <span>
                                    <strong>{coe.coe_name}</strong>
                                    <hr />
                                </span>

                                <span>NGN{formatAsMoney(coe.fund_allocation)}</span>
                            </div>)
                        }
                    </ModalBody>
                </Modal>
            }

            {
                state.showRecommendationModal && <Modal>
                    <ModalHeader modalTitle="Patient Recommendation" onModalClose={() => setStateValue('showRecommendationModal', false)} />
                    <ModalBody>
                        <Label label="Recommendation comment" />
                        <Textarea
                            placeholder="Recommendation Comment"
                            value={state.recommendationComment}
                            onChange={e => setStateValue('recommendationComment', e.target.value)}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            onClick={() => handleRecommendPatient(APPROVED)}
                            disabled={state.isApproving}
                            variant='success'
                            className="mr-3">Approve</Button>
                        <Button
                            disabled={state.isApproving}
                            onClick={() => handleRecommendPatient(DECLINED)}
                            variant='danger'>Decline</Button>
                    </ModalFooter>
                </Modal>
            }
        </>
    )
}
