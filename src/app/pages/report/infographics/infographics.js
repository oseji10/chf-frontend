/* eslint-disable no-unused-vars */
import { Jumbotron } from "reactstrap"
import PageHeader from "./pageTitle"
import styles from './infographics.module.scss'
import Progressbar from "./progressbar"
import SmallCard from "./.smallcard"
import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import API from '../../../config/chfBackendApi'
import {formatAsMoney} from '../../../utils/money.utils'
import Collapse from "../../../components/collapse/collapse"
import PageTitle from "../../../components/pageTitle/pageTitle"
import Modal from '../../../components/modal/modal'
import ModalBody from '../../../components/modal/modalBody'
import ModalFooter from '../../../components/modal/modalFooter'
import ModalHeader from '../../../components/modal/modalHeader'
import AuthorizedOnlyComponent from '../../../components/authorizedOnlyComponent'
import showToastifyAlert from "../../../utils/alert.util"


const initial_state = {
    ailments: [],
    geopolitical_zones: [],
    coes: [],
    states: [],
    patients_count: 0,
    pool_account_balance: 0,
    activeCoe: null,
    total_approved_fund: 0,
    utilized_funds: 0,
    showAddFundToPoolModal: false,
    amountToFundPool: 1,
    benefactor: "",
    alert: {
        message: 'Some Toast',
        variant: ''
    }

}


const Infographics = () => {

    const [state, setState] = useState(initial_state);


    let pageLoaded = false;
    
    const loadInfoGraphics = async () => {
        try{
            const res = await API.get('/api/analytics');
            const {geopolitical_zones, total_approved_fund, ailments, patients_count, patients_approved, patients_pending, patients_declined, pool_account_balance, coes, states, utilized_funds} = res.data.data;
            console.log(res)
            setState(prevState => ({
                ...prevState,
                ailments,
                geopolitical_zones,
                patients_count,
                pool_account_balance,
                states, 
                coes,
                total_approved_fund,
                utilized_funds,
                patients_approved,
                patients_declined,
                patients_pending
            }))
        }catch(e){
            // console.log(e.response)
        }
    }

    const renderGeopoliticalZoneBars = (type = 'patients_count') => {
        const category = type === 'patients_count' ? 'geozone' : 'geozone-residence'
        const progressbar_colors  = ['success','danger', 'warning','info','pink','purple']

        return state.geopolitical_zones.map((geozone, index) => <Link to={`/report/${category}/${geozone.id}/${geozone.geopolitical_zone}/patients`}><Progressbar 
        key={index}
        progressType={progressbar_colors[index]} 
        width={state.patients_count ? ((geozone[type] / state.patients_count) * 100).toFixed(2) : 0} 
        title={geozone.geopolitical_zone}
        tipText={geozone[type] + ` patients`} /></Link> )
    }
    
    const renderAilmentTypesBoxes = () => {
        return state.ailments.map( (ailment, index) => <Link to={`/report/ailment/${ailment.id}/${ailment.ailment_type}-${ailment.ailment_stage}/patients`}  key={index}> <SmallCard>
        <h5>{ailment.ailment_type}</h5>
        <small className='d-block'>(Stage {ailment.ailment_stage})</small>
        <small>{ailment.patients_count}</small>
    </SmallCard></Link>)
    }
    

    const renderCOEs = () => {
        return state.coes.map( (coe, index) => <div key={index}>
            <h6 onClick={() => handleCOEClick(index)} className='border-bottom p-1 clickable'>{coe.coe_name} <span className='float-right badge badge-success'>{coe.patients_count} patients</span> </h6>
                <Collapse isOpen={state.activeCoe === index}>
                    <div className='row'>
                        <div className='col-md-4'>
                            <small className="text-success d-block"><strong>Patients</strong></small>
                            <small className='d-block'>{coe.patients_count}</small>
                            <Link to={`/report/coe/${coe.id}/${coe.coe_name}/patients`} className='btn btn-sm btn-danger'>View Patients</Link>
                        </div>
                        <div className='col-md-4'>
                            <small className="text-success d-block"><strong>Transactions</strong></small>
                            <small className='d-block'>COE has made {coe.billings_count} billings</small>
                            <AuthorizedOnlyComponent requiredPermission="VIEW_ALL_BILLING">
                                <Link to={`/superadmin/billings/${coe.id}`} className='btn btn-sm btn-danger'>View Transactions</Link>
                            </AuthorizedOnlyComponent>
                        </div>
                        <div className='col-md-4'>
                            <small className="text-success d-block"><strong>Fund Allocation Quota</strong></small>
                            <small className='d-block'>{`NGN${formatAsMoney(parseFloat(coe.fund_allocation))}`}</small>
                            <small className="text-success d-block"><strong>Fund Utilization Quota</strong></small>
                            <small className='d-block'>{coe.wallet && `NGN${formatAsMoney(parseFloat(coe.wallet.balance))}`}</small>
                        </div>
                    </div>
                </Collapse>
        </div>)
    }

    const handleCOEClick = coe_id => {
        setState(prevState => ({
            ...prevState,
            activeCoe: prevState.activeCoe === coe_id ? null : coe_id, //Set to null if same coe clicked twice to collapse
        }))
    }

    const setStateValue = (key, value) => {
        setState(prevState => ({
            ...prevState,
            [key] : value,
        }))
    }

    const handleCreditPool = async () => {
        try{
            const res = await API.post('/api/pool/credit',{
                benefactor: state.benefactor,
                credit: state.amountToFundPool,
            });
            //onsole.log(res)
        }catch(e){
            //console.log(e.response)
        }
    }

    useEffect(() => {
        loadInfoGraphics();
        // eslint-disable-next-line react-hooks/exhaustive-deps
        pageLoaded = true;
    },[pageLoaded])
    
    return (<>
        <div className='container'>
            <PageTitle title="Reports" icon='fa fa-paper-plane' />
            <Jumbotron className={['row shadow-lg bg-light', styles.bb_primary].join(' ')}>
                <div className='col-md-6'>
                    {/* <small className='text-success text-uppercase d-block'>Pool Balance</small> */}
                    {/* <small>{state.patients_approved}</small> */}
                    {/* <small><del>N</del> {formatAsMoney(state.pool_account_balance)}</small> */}
                    <small className='text-success text-uppercase d-block'>Approved Funds</small>
                    {/* <small>{state.patients_pending}</small> */}
                    <small> <del>N</del> {formatAsMoney(state.total_approved_fund)}</small>
                    <small className='text-success text-uppercase d-block'>Utilized Funds</small>
                    {/* <small>{state.patients_declined}</small> */}
                    <small> <del>N</del> {formatAsMoney(state.utilized_funds)}</small>
                    <AuthorizedOnlyComponent requiredPermission="CREDIT_POOL" >

                        <button className='btn btn-sm btn-block mt-2 btn-outline-success' onClick={() => setStateValue('showAddFundToPoolModal',true)}>Add fund to pool</button>
                    </AuthorizedOnlyComponent>

                </div>
                <div className='col-md-6'>
                    <h6 className='text-success'>Total Number Enrolled Patients</h6>
                    <h4>{state.patients_count}</h4>
                </div>
            </Jumbotron>

            <div className='row'>
                <div className='col-md-6'>
                    <h5 className='text-secondary'>Region of Origin</h5>
                    {renderGeopoliticalZoneBars()}

                    <div className='d-block mt-5 mb-4'>
                        <h5 className='text-secondary'>Region of Residence</h5>
                        {renderGeopoliticalZoneBars('residence_patients_count')}

                    </div>
                    
                </div>
                <div className={['col-md-6 p-3'].join(' ')}>
                <h5 className='text-secondary ml-2'>Cancer Types</h5>
                    <div className={styles.card_wrapper}>

                    {renderAilmentTypesBoxes()}
                    </div>

                </div>
                {/* COE LIST */}
                <div className='col-sm-12'>
                    <h5 className='text-secondary'>Centre of Excellence</h5>
                    <div className='card p-4'>
                       {renderCOEs()}
                    </div>
                    
                </div>

                {/* END COE LIST */}
            </div>
        </div>

        {
            state.showAddFundToPoolModal && <Modal>
                <ModalHeader modalTitle="Add Fund to pool" onModalClose={() => setStateValue('showAddFundToPoolModal',false)} />
                <ModalBody> 
                    <div className='form-group'>
                        <label className='text-secondary'>Amount to Credit</label>
                        <input type='number' min='1' name='amountToCredit' className='form-control'  value={state.amountToFundPool} onChange={e => setStateValue('amountToFundPool',e.target.value)} />
                    </div>
                    <div className='form-group'>
                        <label className='text-secondary'>Benefactor</label>
                        <input type='text' name='benefactor' className='form-control' value={state.benefactor} onChange={e => setStateValue('benefactor',e.target.value)} />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <button className='btn btn-success' onClick={handleCreditPool}>Credit Pool</button>
                </ModalFooter>
            </Modal>
        }
    </>)
}

export default Infographics;