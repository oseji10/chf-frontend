import { Link } from "react-router-dom";
import HTable from "../table/HTable";
import { timestampToRegularTime } from "../../utils/date.util";
import Button from "../button";

const tableHeaders = [
    { value: "CHF ID" },
    { value: "NAME" },
    { value: "NHIS NO" },
    { value: "APPLICATION DATE" },
    { value: "STATUS" },
  ];
  
export default function ViewApplicationsDisplay({patientApplications=[]}){
    return (
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
                {patientApplications &&
                  patientApplications.map((data, index) => (
                    <tr key={index}>
                      <td>{++index}</td>
                      <td>{data.patient.chf_id}</td>
                      <td>{`${data.user.first_name} ${data.user.last_name}`}</td>
                      <td>{data.patient.nhis_no}</td>
                      <td>
                        {timestampToRegularTime(
                          data.applicationReview.created_at
                        )}
                      </td>
                      <td>
                        
                          <Link
                            to={`/applications/view?patient_app=${data.applicationReview.id}&patient_id=${data.applicationReview.user_id}&coe_id=${data.patient.coe_id}`}
                          >
                            <Button
                              btnClass={"btn btn-success"}
                              type={"button"}
                              value="View"
                            />
                          </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </HTable>
    );
}