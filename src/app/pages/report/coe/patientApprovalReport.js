import React,{useEffect, useState} from "react"
import PageTitle from "../../../components/pageTitle/pageTitle";
import CHFTable from "../../../components/table/thead/table";
import TableRow from '../../../components/table/tableRow/tableRow';
import TableData from '../../../components/table/tableData/tableData';
import THead from "../../../components/table/thead/thead";
import Container from '../../../components/utilities/container/container'
import PageSpinner from '../../../components/spinner/pageSpinner'
import API from "../../../config/chfBackendApi";
import APIResponseHelper from "../../../utils/apiResponse.util";
import { APPROVED, DECLINED } from "../../../utils/constant.util";
import {Button} from 'react-bootstrap'
import Icon from "../../../components/icon/icon";
import {downloadCSV} from '../../../utils/file.util' 

const PatientApprovalReport = () => {

    const initial_state = {
        coes: [],
        isLoading: true,
    }

    const [state, setState] = useState(initial_state)

    const columns = [
        {
            column_name: "#"
        },
        {
            column_name: "COE Name"
        },
        {
            column_name: "Physician Reviewed"
        },
        {
            column_name: "Social Worker Reviewed"
        },
        {
            column_name: "MDT Reviewed"
        },
        {
            column_name: "CMD Reviewed"
        },
        {
            column_name: "Secretariat Approved"
        },
        {
            column_name: "Secretariat Declined"
        },
    ]

    useEffect(() => {
        loadInitialData()
    },[])

    const loadInitialData = async () => {
        try{
            const res = await API.get('/api/report/coes/patient_approvals');
            
            return setState(prevState => ({
                ...prevState,
                coes: res.data.data
            }));

        }catch(error){
            APIResponseHelper.errorHandler(error)
        }finally{
            setState(prevState => ({
                ...prevState,
                isLoading: false
            }))
        }
    } 

    const printToCSV = () => {
        var csvContent = "data:text/csv;charset=utf-8,";

        csvContent += "SN,Hospital Name,Primary Physician Reviewed,Social Worker Reviewed,MDT Reviewed,CMD Reviewed, Secretatiat Approved, Secretariat Declined";
        csvContent += "\r\n";

        state.coes.map((coe, index) => {
            let report = patientsFilter(coe);

            let row = `${index + 1},${coe.coe_name.replace(',',' ')},${report.physician_reviewed},${report.social_worker_reviewed},${report.mdt_reviewed},${report.cmd_reviewed},${report.secretariat_approved},${report.secretariat_declined}`;
            csvContent += row + "\r\n";
        })

        return downloadCSV(csvContent)

        // var encodedUri = encodeURI(csvContent);
        // window.open(encodedUri);
    }


    const patientsFilter = coe => {
        /*  BEFORE PATIENTS WILL EVEN GET TO SOCIAL WORKER OR CMD, 
        *   THEY MUST HAVE PASSED THROUGH PRIMARY PHYSICIAN */
        let patients = coe.patients.filter(patient => patient.primary_physician_reviewer_id !== null);
        return {
            physician_reviewed: patients.filter(patient => patient.primary_physician_reviewer_id !== null).length,
            social_worker_reviewed: patients.filter(patient => patient.social_worker_reviewer_id !== null).length,
            cmd_reviewed: patients.filter(patient => patient.cmd_reviewed_on !== null).length,
            mdt_reviewed: patients.filter(patient => patient.mdt_recommended_amount !== 0).length,
            secretariat_approved: patients.filter(patient => patient.application_review[0].status.toUpperCase() === APPROVED).length,
            secretariat_declined: patients.filter(patient => patient.application_review[0].status.toUpperCase() === DECLINED).length,
        }
    }

    const renderReport = () => {
        if (!state.coes.length) {
            return <TableRow>
                <TableData colSpan={7}>No data available</TableData>
            </TableRow>
        }

        return <tbody>
            {state.coes.map((coe, index) => {
                let coePatientData = patientsFilter(coe);
                return <TableRow key={index}> 
                    <TableData data={index + 1} />
                    <TableData data={coe.coe_name} />
                    <TableData data={coePatientData.physician_reviewed} />
                    <TableData data={coePatientData.social_worker_reviewed} />
                    <TableData data={coePatientData.mdt_reviewed} />
                    <TableData data={coePatientData.cmd_reviewed} />
                    <TableData data={coePatientData.secretariat_approved} />
                    <TableData data={coePatientData.secretariat_declined} />
                </TableRow>
            })}
        </tbody>
    }

   return  <Container>
       <PageTitle title="Patients Approval Report" icon='fa fa-check-circle' />
        <Button onClick={printToCSV} >Download CSV <Icon icon='fa fa-download' /></Button>
       <CHFTable>
           <THead columns={columns} />
           {state.isLoading && <PageSpinner /> || renderReport()}
       </CHFTable>
    </Container>
}

export default PatientApprovalReport;