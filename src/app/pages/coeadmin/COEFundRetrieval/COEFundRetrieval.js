import { CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Typography, Button, styled, Chip } from '@material-ui/core'
import MUIDataTable from 'mui-datatables'
import React, { useEffect, useState } from 'react'
import { AuthorizedOnlyComponent, PageTitle } from '../../../components';
import API from '../../../config/chfBackendApi';
import { formatName } from '../../../utils/dataFormat.util';
import { timestampToRegularDateTime, timestampToRegularTime } from '../../../utils/date.util';
import { formatAsMoney } from '../../../utils/money.utils';
import { getAuthStorageUser } from '../../../utils/storage.util';
import { errorHandler } from '../../../utils/error.utils'
import { APPROVED, APPROVE_FUND_RETRIEVAL, PENDING } from '../../../utils/constant.util';
import { toast } from 'react-toastify';


const COE_FUND_RETRIEVAL_TABLE_COLUMNS = [
    {
        name: "#",
        options: {
            filter: false,
        }
    },
    {
        name: "CHF ID",
        options: {
            filter: false,
        }
    },
    {
        name: "Date requested",
        options: {
            filter: false,
        }
    },
    {
        name: "Requested By",
    },
    {
        name: "Wallet Balance",
        options: {
            filter: false,
        }
    },
    {
        name: "Approved",
        options: {
            filter: false,
        }
    },
    {
        name: "Amount Retrieved",
        options: {
            filter: false,
        }
    },
    {
        name: "Status",
        options: {
            customBodyRender: (status) => <Chip color={status === PENDING.toLowerCase() ? 'secondary' : 'primary'} label={status} />
        }
    },
    {
        name: "",
        options: {
            filter: false,
            sort: false,
        }
    },
];

const SuccessButton = styled(Button)(({ theme }) => ({
    backgroundColor: theme.palette.success.main,
    fontSize: '8pt',

}))

const COEFundRetrieval = () => {

    const [retrievalRequests, setRetrievalRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(false)
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [activeRetrieval, setActiveRetrieval] = useState(null);

    const auth = getAuthStorageUser()

    useEffect(() => {
        const init = async () => {
            try {
                setIsLoading(true);
                const res = await API.get(`/api/coe/${auth?.user?.coe_id}/fund-retrieval`);
                setRetrievalRequests(res.data?.data);
                console.log(res)
            } catch (error) {
                console.log(error)
            } finally {
                setIsLoading(false)
            }
        }
        init();
    }, [])

    const handleShowApproveDialog = (retrieval) => {
        setActiveRetrieval(retrieval);
        setShowApproveDialog(true);
    }


    const handleCloseApproveDialog = (retrieval) => {
        setActiveRetrieval(null);
        setShowApproveDialog(false);
    }

    const handleApproveRetrieval = async () => {
        try {
            setIsLoading(true)
            const res = await API.post(`/api/fund-retrieval/${activeRetrieval?.id}/approve`, {
                retrieval: activeRetrieval
            });
            setRetrievalRequests(prev => prev.map(retrieval => {
                if (retrieval.id === activeRetrieval?.id) return res.data?.data;
                return retrieval;
            }))
            handleCloseApproveDialog()
            toast.success("Fund has been successfully credited back to COE allocation.")
        } catch (error) {
            errorHandler(error)
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Container>
            <PageTitle title="COE Fund Retrievals" />
            <MUIDataTable
                title={isLoading && <CircularProgress />}
                columns={COE_FUND_RETRIEVAL_TABLE_COLUMNS}
                options={{
                    elevation: 0,
                    customToolbar: () => <Button>Hello</Button>,
                    selectableRows: 'none'
                }}
                data={retrievalRequests.map((retrieval, index) => [
                    index + 1,
                    retrieval.user?.patient?.chf_id,
                    timestampToRegularTime(retrieval.created_at),
                    formatName(retrieval.requester),
                    formatAsMoney(retrieval.wallet_balance),
                    retrieval.approver ? formatName(retrieval.approver) : "N/A",
                    retrieval.amount_retrieved ? formatAsMoney(retrieval.amount_retrieved) : "N/A",
                    retrieval.status,
                    <AuthorizedOnlyComponent requiredPermission={APPROVE_FUND_RETRIEVAL}>
                        {retrieval.status == PENDING.toLowerCase() && <SuccessButton size='small' color='#34fa45' onClick={() => handleShowApproveDialog(retrieval)} variant='success'>Approve</SuccessButton>}
                    </AuthorizedOnlyComponent>
                ])}
            />

            <Dialog open={showApproveDialog} fullWidth onClose={handleCloseApproveDialog}>
                <DialogTitle>
                    <Typography variant='h5' >Approve Fund Retrieval</Typography>
                </DialogTitle>
                <Divider />
                <DialogContent>
                    <Typography variant='body' color='textSecondary'>
                        You are about to approve this fund retrieval. Fund will be cleared from {`patient's`} e-wallet and credited
                        to {`COE's`} allocation for disbursal.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <SuccessButton size='small' variant='success' onClick={handleApproveRetrieval} disabled={isLoading}>Confirm {isLoading && <CircularProgress />} </SuccessButton>
                </DialogActions>
            </Dialog>
        </Container>
    )
}

export default COEFundRetrieval