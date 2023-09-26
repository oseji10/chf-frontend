import React from "react";
import "./config/config";
import { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./../assets/css/index.css";
import "react-toastify/dist/ReactToastify.css";
import "../assets/App.scss"
// import useContextGetter from './hooks/useContextGetter';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
// import StateProvider from "./components/StateProvider";
import Layout from "./components/layout/layout";
// import Preloader from "./components/preloader";
import ProtectedRoute from "./components/ProtectedRoute";
import { connect, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { logoutUser, logUserIn } from "./redux/auth.action";
import { loadUserFullApplicationToState } from "./redux/enrol.action";
import { loadSideMenu } from "./redux/sidemenulist.action";
import AlertList from './components/alert/alertList'

import {
  Home, About, FourOhFour, StartForm, ApplicationForm, PatientInformation, ReviewApplication, ApplicationCompleted, Login, RecoverPassword, PasswordRecoverCode, ChangePassword, Dashboard, Billing, MyProfile, Applications, Role, Report, BillingHistoryContainer, Coe, CoeHelpDesk, CoeStaffIndex, ChfAdmin, Service, Category, CoeService, COEStaffBillingHistory, CoeAdminBillingHistory, MenuContainer, Patients, SuperAdminBillingHistory, PatientsWithFilter, PatientBillingHistory, ChfStaff, Comment, BillingSummaryReport, DrugBillingHistory, ConsolidatedReport, CommentList, Users, SiteSettings, Transactions, Dispute, DisputeChat, MyApplications, PersonalInformation, PersonalHistory, FamilyHistory, SocialConditions, SupportAssessment, NextOfKin, ApplicationReview, SocialWorkerApplications, AddSocialAssessment, ViewPatientApplication, AppointmentSchedule, ViewPatientAppointment, EmailVerification, VerifyEmail, SuperAuth, CHFAdminApplicationDetail, FandAPayments, MDTPatients, CarePlan, COEAdminPatients, COEStaffPatients, PatientApprovalReport, UserEmailVerification, PatientTransferRequest, COEAdminPatientTransfer

} from './pages';

import MenuContext from "./contexts/menu.context";
import { useState } from "react";
import { ToastContainer } from "react-toastify";
import ResendEmailVerification from "./pages/login/ResendEmailVerification";
import DoctorPrescription from "./pages/coestaff/prescription/doctorPrescriptions";
import PharmacistPrescription from "./pages/coestaff/prescription/pharmacistPrescription";
import COEFundRetrieval from "./pages/coeadmin/COEFundRetrieval/COEFundRetrieval";
import CMDInvoice from "./pages/coeadmin/invoice/CMDInvoice";
import InitiatorInvoice from "./pages/chfadmin/invoice/InitiatorInvoice";
import NCCPInvoice from "./pages/chfadmin/invoice/NCCPInvoice";
import DHSInvoice from "./pages/chfadmin/invoice/DHSInvoice";
import DFAInvoice from "./pages/chfadmin/invoice/DFAInvoice";
import PermsecInvoice from "./pages/chfadmin/invoice/PermsecInvoice";
import CreatePatientReferral from "./pages/coestaff/PatientReferral/CreatePatientReferral";
import PatientReferral from "./pages/coestaff/PatientReferral/PatientReferral";
import COEPatientReferral from "./pages/coeadmin/COEPatientReferral/COEPatientReferral";
import COEAnalytics from "./pages/coeadmin/COEAnalytics/COEAnalytics";
import CHFAdminBilling from "./pages/chfadmin/billing/CHFAdminBilling";
import AdminDispute from "./pages/dispute/AdminDispute";
import HospitalDispute from "./pages/dispute/coeAdmin";
import WalletTopup from "./pages/coeadmin/wallet-topup";
import WalletTopupApprove from "./pages/chfadmin/wallet-topup";


function App(props) {
  // eslint-disable-next-line no-unused-vars
  const [menu, setMenu] = useState(null);
  let userLoaded = false;

  const alerts = useSelector(state => state.alerts);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        props.logUserIn(user);
      }
      userLoaded = true;
    } catch (e) {
      props.logoutUser();
    }
  }, [userLoaded]);

  return (
    // <StateProvider>
    <MenuContext.Provider value={menu}>
      <AlertList alerts={alerts} />
      <ToastContainer />
      <Router>
        <ScrollToTop />
        {/* <Suspense fallback={<Preloader />}> */}
        <Switch>
          <Redirect exact from="/home" to="/" />
          <Route exact path="/" component={Home} />
          <Route exact path="/about" component={About} />
          <Route exact path="/superadmin/anonymous/auth" component={SuperAuth} />

          <Route exact path="/enrol" component={StartForm} />
          <Route exact path="/enrol/application" component={ApplicationForm} />
          <Route
            exact
            path="/enrol/reviewApplication"
            component={ReviewApplication}
          />

          <Route
            exact
            path="/enrol/applicationCompleted"
            component={ApplicationCompleted}
          />
          <Route exact path="/login" component={Login} />
          <Route exact path="/auth/email-verification/resend-email" component={ResendEmailVerification} />
          <Route exact path="/recover/password" component={RecoverPassword} />
          <Route path="/recover/password/:id" component={PasswordRecoverCode} />
          <Route exact path="/password/change/:id" component={ChangePassword} />
          <Route exact path="/auth/email-verification" component={EmailVerification} />
          <Route exact path="/auth/verify-email/:id" component={VerifyEmail} />

          <Layout>
            <ProtectedRoute exact path="/dashboard" Component={Dashboard} />
            <ProtectedRoute exact path="/users/profile" Component={MyProfile} />
            <ProtectedRoute exact path="/users" Component={Users} />
            <ProtectedRoute exact path="/mdt/patients" Component={MDTPatients} />
            
            <ProtectedRoute exact path="/mdt/patients/:chf_id/careplan" Component={CarePlan} />
            <ProtectedRoute exact path="/myapplications" Component={MyApplications} />
            <ProtectedRoute exact path="/myapplications/personal-information" Component={PersonalInformation} />
            <ProtectedRoute exact path="/myapplications/patient-information" Component={PatientInformation} />
            <ProtectedRoute exact path="/myapplications/personal-history" Component={PersonalHistory} />
            <ProtectedRoute exact path="/myapplications/family-history" Component={FamilyHistory} />
            <ProtectedRoute exact path="/myapplications/social-conditions" Component={SocialConditions} />
            <ProtectedRoute exact path="/myapplications/next-of-kin" Component={NextOfKin} />
            <ProtectedRoute exact path="/myapplications/support-assessment" Component={SupportAssessment} />
            <ProtectedRoute exact path="/social-worker/add/applications" Component={AddSocialAssessment} />
            <ProtectedRoute exact path="/myapplications/review" Component={ApplicationReview} />
            <ProtectedRoute exact path="/social-worker/applications" Component={SocialWorkerApplications} />
            <ProtectedRoute exact path="/applications/view" Component={ViewPatientApplication} />
            <ProtectedRoute exact path={`/patients/:patient_id/comments`} Component={CommentList} />
            <ProtectedRoute
              exact
              path={`/patients/:patient_id/comments/:comment_id`}
              Component={Comment}
            />
            <ProtectedRoute
              exact
              path="/services"
              requiredPermission="VIEW_SERVICE"
              Component={Service}
            />

            <ProtectedRoute exact path="/initiator/invoice" Component={InitiatorInvoice} />
            <ProtectedRoute exact path="/nccp/invoice" Component={NCCPInvoice} />
            <ProtectedRoute exact path="/dhs/invoice" Component={DHSInvoice} />
            <ProtectedRoute exact path="/dfa/invoice" Component={DFAInvoice} />
            <ProtectedRoute exact path="/permsec/invoice" Component={PermsecInvoice} />
            <ProtectedRoute exact path="/cmd/invoice" Component={CMDInvoice} />

            <ProtectedRoute exact path="/services/coe" Component={CoeService} />
            <ProtectedRoute exact path="/category" Component={Category} />
            <ProtectedRoute exact path="/users/billing_history" Component={BillingHistoryContainer} />
            <ProtectedRoute exact path="/coeadmin/billings" Component={CoeAdminBillingHistory} />
            <ProtectedRoute exact path="/coeadmin/patients" Component={COEAdminPatients} />
            <ProtectedRoute exact path="/coeadmin/fund-retrieval" Component={COEFundRetrieval} />
            <ProtectedRoute exact path="/coeadmin/analytics" Component={COEAnalytics} />
            <ProtectedRoute exact path="/coeadmin/patient-transfer" Component={COEAdminPatientTransfer} />
            <ProtectedRoute exact path="/coeadmin/dispute" Component={HospitalDispute} />
            <ProtectedRoute exact path="/coeadmin/wallet-topup" Component={WalletTopup} />
            <ProtectedRoute exact path="/chfadmin/wallet-topup" Component={WalletTopupApprove} />
            <ProtectedRoute exact path="/superadmin/billings/:coe_id?" Component={SuperAdminBillingHistory} />
            <ProtectedRoute exact path='/superadmin/transactions/dispute' Component={AdminDispute} />
            <ProtectedRoute exact path="/superadmin/transactions" Component={CHFAdminBilling} />
            <ProtectedRoute exact path="/superadmin/drug/billings/:coe_id?" Component={DrugBillingHistory} />
            <ProtectedRoute exact path="/patients" Component={Patients} />
            <ProtectedRoute exact path="/coehelpdesks/:coe_id?" Component={CoeHelpDesk} />
            <ProtectedRoute exact path="/coes" Component={Coe} />
            <ProtectedRoute exact path="/chfadmins" Component={ChfAdmin} />
            <ProtectedRoute exact path="/chfadmins/application/:id" Component={CHFAdminApplicationDetail} />
            <ProtectedRoute exact path="/chfstaffs" Component={ChfStaff} />
            <ProtectedRoute exact path='/coestaff/patient-transfer' Component={PatientTransferRequest} />
            <ProtectedRoute path="/coestaffs/:coe_id?" Component={CoeStaffIndex} />
            <ProtectedRoute exact path="/coestaff/patients" Component={COEStaffPatients} />
            <ProtectedRoute exact path="/coestaff/patients/referral/create" Component={CreatePatientReferral} />
            <ProtectedRoute exact path="/coestaff/patients/referral" Component={PatientReferral} />
            <ProtectedRoute exact path="/coeadmin/patients/referral" Component={COEPatientReferral} />
            <ProtectedRoute exact path="/coestaff/billings" Component={COEStaffBillingHistory} />
            <ProtectedRoute exact path="/coestaff/prescription" Component={DoctorPrescription} />
            <ProtectedRoute exact path="/pharmacist/prescription" Component={PharmacistPrescription} />

            <ProtectedRoute path="/report/coe/patient_approvals" Component={PatientApprovalReport} />
            <ProtectedRoute path="/report/:filter?/:filter_value?/:filter_offset?/:patients?" Component={Report} />
            <ProtectedRoute exact path="/fmoh/finance-and-accounting" Component={Report} />
            <ProtectedRoute
              exact
              path="/fmoh/finance-and-accounting/billing-summary"
              Component={BillingSummaryReport}
            />
            <ProtectedRoute exact path='/fmoh/finance-and-accounting/payments' Component={FandAPayments} />
            <ProtectedRoute
              exact
              path="/fmoh/finance-and-accounting/consolidated_report"
              Component={ConsolidatedReport}
            />
            <ProtectedRoute exact path="/report/:filter_type/:filter/patients" Component={PatientsWithFilter} />
            <ProtectedRoute exact path="/report/patient/:patient_id/billings" Component={PatientBillingHistory} />
            <ProtectedRoute exact path="/uimenu" Component={MenuContainer} />
            <ProtectedRoute exact path="/coestaff/billing" Component={Billing} />
            <ProtectedRoute exact path="/chfadmin/application" Component={Applications} />
            <ProtectedRoute exact path="/roles" Component={Role} />
            <ProtectedRoute exact path="/superadmin/site-settings" Component={SiteSettings} />
            {/* APPONTMENT SCHEDULE */}
            <ProtectedRoute exact path="/coestaff/appointment-schedule" Component={AppointmentSchedule} />
            <ProtectedRoute exact path="/superadmin/appointment-schedule" Component={ViewPatientAppointment} />
            <ProtectedRoute exact path='/transactions/dispute' Component={Dispute} />
            <ProtectedRoute exact path='/transactions/:transaction_id/dispute/chat' Component={DisputeChat} />
            {/* SUPPORT */}
            <ProtectedRoute exact path='/support/transactions' Component={Transactions} />
            <ProtectedRoute exact path="/support/users/email-verification" Component={UserEmailVerification} />
            {/* END SUPPORT */}
            <ProtectedRoute exact path="/superadmin/site-settings" Component={SiteSettings} />
            <ProtectedRoute exact path="/appointment-schedule" Component={AppointmentSchedule} />
            {/* <Route path='*'>
            <FourOhFour />
          </Route> */}
          </Layout>
          <Route path="*" component={FourOhFour} />
        </Switch>
        {/* </Suspense> */}
      </Router>
    </MenuContext.Provider>
    // </StateProvider>
  );
}

const matchDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      logUserIn,
      logoutUser,
      loadSideMenu,
      loadUserFullApplicationToState,
    },
    dispatch
  );
};

const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
    newUser: state.enrol.newUser,
  };
};

export default connect(mapStateToProps, matchDispatchToProps)(App);
