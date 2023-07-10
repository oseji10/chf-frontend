import numeral from 'numeral';
import React from 'react';
import { AiFillAccountBook } from 'react-icons/ai';
import HospitalService from '../../../services/hospital.service';

class COEAnalytics extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            analytics: {
                last_month_outward_referral_volume: 0,
                current_month_outward_referral_volume: 0,
                last_month_inward_referral_volume: 0,
                current_month_inward_referral_volume: 0,
                last_month_volume: 0,
                current_month_volume: 0,
            },
        }
    }

    async componentDidMount(){
        try{
            const res = await HospitalService.getHospitalAnalytics();
            this.setState({analytics: res.data});
        }catch(error){
            console.log(error)
        }finally{

        }
    }

    render(){
        const {analytics} = this.state;
        return <div className='container'>
            <div className='flexParent'>
                <div className='dashboardCard dashboardCardSM dashboardCardSuccess bg-white danger '>
                    <div className="icon">
                        <AiFillAccountBook 
                        size={30} />
                    </div>
                    <div className='cardDetail'>
                        <h3 className="subtitle">Total Allocation</h3>
                        <h1 className="title">NGN 100,000,000.00 </h1>
                        <hr />
                        <h3 className="subtitle">Available Allocation: NGN {numeral(analytics.allocation_balance).format('0,0.00')}</h3>
                    </div>
                </div>
                <div className='dashboardCard dashboardCardSM dashboardCardSuccess bg-white success '>
                    <div className="icon">
                        <AiFillAccountBook size={30} />
                    </div>
                    <div className='cardDetail'>
                        <h3 className="subtitle">Hospital Billing</h3>
                        <h1 className="title">NGN {numeral(analytics.hospital_billing_volume).format('0,0.00')} {/* <span className="tag tagDanger">-10%</span> */} </h1>
                        <hr />
                        <h3 className="subtitle">This month volume: {numeral(analytics.current_month_volume).format('0,0.00')} </h3>
                    </div>
                </div>
                <div className='dashboardCard dashboardCardSM dashboardCardSuccess bg-white info '>
                    <div className="icon">
                        <AiFillAccountBook size={30} />
                    </div>
                    <div className='cardDetail'>
                        <h3 className="subtitle">COE Inward Referrals</h3>
                        <h1 className="title">NGN {numeral(analytics.inward_referral_volume).format('0,0.00')} {/* <span className="tag tagSuccess">+10%</span> */} </h1>
                        <hr />
                        <h3 className="subtitle">This month: NGN {numeral(analytics.current_month_inward_referral_volume).format('0,0.00')}</h3>
                    </div>
                </div>
                <div className='dashboardCard dashboardCardSM dashboardCardSuccess bg-white danger '>
                    <div className="icon">
                        <AiFillAccountBook size={30} />
                    </div>
                    <div className='cardDetail'>
                        <h3 className="subtitle">COE Outward Referrals</h3>
                        <h1 className="title">NGN {numeral(analytics.outward_referral_volume).format('0,0.00')}{/*  <span className="tag tagMuted">0%</span> */} </h1>
                        <hr />
                        <h3 className="subtitle">This month: NGN {numeral(analytics.current_month_outward_referral_volume).format('0,0.00')}</h3>
                    </div>
                </div>
                <div style={{maxWidth: '600px'}} className='dashboardCard dashboardCardSM dashboardCardSuccess bg-white danger d-flex p-3 '>
                    <div className="smallCard danger">
                        <h1 className='title'>{analytics.patients_count}</h1>
                        <h2 className="subtitle">Patients</h2>
                    </div>
                    <div className="smallCard success">
                        <h1 className='title'>{analytics.transactions_count}</h1>
                        <h2 className="subtitle">Transactions</h2>
                    </div>
                    <div className="smallCard info">
                        <h1 className='title'>{analytics.staff_count}</h1>
                        <h2 className="subtitle">Staff</h2>
                    </div>
                </div>
            </div>
        </div>
    }
}

export default COEAnalytics;