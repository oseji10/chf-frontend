import { Chip, CircularProgress, Dialog, DialogContent, DialogTitle, Divider, Grid, styled, Typography } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import MUIDataTable from 'mui-datatables';
import numeral from 'numeral';
import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AuthorizedOnlyComponent, Title } from '../../components';
import Chat from '../../components/chat/chat';
import TextArea from '../../components/form/textarea';
import PageTitle from '../../components/pageTitle/pageTitle'
import THead from '../../components/table/thead/thead';
import API, { CAPBackendAPI } from '../../config/chfBackendApi';
import DrugService from '../../services/drug.service';
import { VIEW_DISPUTE_CHAT } from '../../utils/constant.util';
import { formatName } from '../../utils/dataFormat.util';
import { timestampToRegularDateTime, timestampToRegularTime } from '../../utils/date.util';
import chfStyles from '../chfadmin/chfadmin.module.scss'

const ChatWrapper = styled(Grid)(({ theme }) => ({
    maxHeight: '50vh',
    overflowY: 'scroll',
    margin: "1rem 0",
    [theme.breakpoints.down('sm')]: {
        maxHeight: '20vh',
    }
}))

const ChatBubble = styled(Grid)(({ theme }) => ({
    backgroundColor: theme.palette.common.white,
    borderRadius: '10px',
    boxShadow: theme.shadows[1],
    padding: '1rem',
    margin: '.3rem 0'
}))

const ChatTIme = styled(Typography)(({ theme }) => ({
    fontSize: '8pt',
    textAlign: 'right',
    margin: '.2rem 0'
}))

const ChatSender = styled(Typography)(({ theme }) => ({
    fontSize: '10pt',
    fontWeight: 'bolder',
    margin: '.2rem 0'
}))

const AdminDispute = ({ }) => {

    const DISPUTE_TABLE_COLUMNS = [
        {
            name: '#',
            options: {
                filter: false
            }
        }, {
            name: 'Transaction ID',
            options: {
                filter: false
            }
        },
        {
            name: 'Patient ID',
        },
        {
            name: 'COE Name',
        },
        {
            name: 'Date Raised',
            options: {
                filter: false
            }
        },
        {
            name: 'Raised By',
            options: {
                filter: false
            }
        }, {
            name: 'Billing Staff',
            options: {
                filter: false
            }
        },
        {
            name: 'Status',
            options: {
                filter: false
            }
        },
        {
            name: '',
            options: {
                filter: false,
                sort: false
            }
        },
        {
            name: '',
            options: {
                filter: false,
                sort: false
            }
        },
    ]

    const initial_state = {
        disputes: [],
        isSendingChat: false,
        newComment: '',
        comments: [],
        isSendingComment: false,
    }

    const [activeDispute, setActiveDispute] = useState(null);
    const [showDisputeServices, setShowDisputeServices] = useState(false);

    const setStateValue = (key, value) => {
        return setState(prevState => ({
            ...prevState,
            [key]: value
        }))
    }

    const [state, setState] = useState(initial_state);
    const [isLoading, setIsLoading] = useState(false)
    const [showChat, setShowChat] = useState(false)
    const [drugs, setDrugs] = useState([]);

    const loadDisputes = async () => {
        try {
            setIsLoading(true)
            const res = await API.get(`/api/disputes`);
            const drugRes = await DrugService.getAllCAPProduct();
            setDrugs(drugRes.data?.data)
            return setState(prevState => ({
                ...prevState,
                disputes: res.data.data,
            }))
        } catch (e) {
            console.log(e.response)
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadDisputes();
    }, []);

    const handleSetActiveDispute = async (dispute) => {
        try {
            setIsLoading(true)
            const res = await API.get(`/api/transactions/${dispute?.transaction_id}/dispute/comments`);
            setActiveDispute(dispute);
            setShowChat(true)
            window.scrollTo(0, 0)
            return setStateValue('comments', res.data?.data);
        } catch (e) {
            console.log(e.response);
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddChat = async () => {
        setStateValue('isSendingComment', true)
        try {
            const res = await API.post(`/api/transactions/${activeDispute?.transaction_id}/dispute/comments`, {
                transaction_id: activeDispute?.transaction_id,
                comment: state.newComment,
            });
            return setState(prevState => ({
                ...prevState,
                newComment: '',
                comments: [
                    res.data?.data,
                    ...prevState.comments,
                ]
            }))
        } catch (e) {
            console.log(e);
        } finally {
            setStateValue('isSendingComment', false);
        }
    }

    const handleCloseDispute = () => {
        setActiveDispute(null);
        setShowChat(false)
        return setState(prev => ({
            ...prev,
            newComment: '',
            comments: [],
        }))
    }

    const handleShowDisputeServices = dispute => {
        setActiveDispute(dispute);
        setShowChat(false)
        setShowDisputeServices(true);
    }

    const handleHideDisputeServices = () => {
        setShowDisputeServices(false)
        setActiveDispute(null)
    }

    let total = 0;

    return <div className='container' style={{ maxWidth: '1400px' }}>
        <PageTitle title="Transaction Disputes" />
        <Grid container spacing={5}>
            <Grid item xs={12} md={showChat ? 3 : 0} orderM style={{ display: showChat ? 'block' : 'none' }}>
                <Button variant='default'><Close color='secondary' onClick={handleCloseDispute} /></Button>
                <Title text={activeDispute?.transaction_id} />
                <Typography variant='subtitle2' color='textSecondary' >Reason for dispute</Typography>
                <Typography variant='body' color='textSecondary' >{activeDispute?.reason_for_dispute}</Typography>
                <ChatWrapper container>
                    {
                        state.comments.map((comment, index) => {
                            return <ChatBubble key={index} item>
                                <ChatSender variant='body'>{formatName(comment.user)}</ChatSender>
                                <Typography variant='body2' color='textPrimary'>{comment.comment}</Typography>
                                <ChatTIme variant='body2'>{timestampToRegularDateTime(comment.created_at)}</ChatTIme>
                            </ChatBubble>
                        })
                    }
                </ChatWrapper>
                <TextArea
                    placeholder="Chat"
                    value={state.newComment}
                    inputName='newComment'
                    onChange={e => setStateValue(e.target.name, e.target.value)}
                />
                <Button
                    disabled={state.isSendingComment}
                    onClick={handleAddChat} variant='success' >
                    Send
                    <i className='fa fa-comment' style={{ marginLeft: '5px' }}> </i>
                    {state.isSendingChat && <CircularProgress variant='primary' />}
                </Button>
            </Grid>
            <Grid item xs={12} md={showChat ? 9 : 12}>
                <MUIDataTable
                    title={isLoading ? <CircularProgress color='primary' /> : ''}
                    columns={DISPUTE_TABLE_COLUMNS}
                    options={{
                        elevation: 0,
                    }}
                    data={state.disputes.map((dispute, index) => [
                        index + 1,
                        dispute.transaction_id,
                        dispute.patient?.patient?.chf_id,
                        dispute.coe?.coe_name,
                        timestampToRegularTime(dispute.created_at),
                        formatName(dispute.raiser),
                        formatName(dispute?.coe_staff),
                        <Chip color={dispute.status == 'open' ? 'secondary' : 'primary'} label={dispute.status} />,
                        <AuthorizedOnlyComponent requiredPermission={VIEW_DISPUTE_CHAT}>
                            <Button
                                className='text-success'
                                onClick={() => handleSetActiveDispute(dispute)}
                                variant='default'>Chat <i className='fa fa-comment'></i></Button>
                        </AuthorizedOnlyComponent>,
                        <Button
                            // className='text-success'
                            onClick={() => handleShowDisputeServices(dispute)}
                            variant='success'>View Services</Button>
                        // <td><Link className='text-success' to={`/transactions/${dispute.transaction_id}/dispute/chat`}>Chat <i className='fa fa-comment'></i>  </Link> </td>
                    ])}

                />
            </Grid>
        </Grid>
        <Dialog open={showDisputeServices} onClose={handleHideDisputeServices} fullWidth>
            <DialogTitle color='success'>Dispute Services</DialogTitle>
            <Divider />
            <DialogContent>
                <table className='table table-responsive' style={{ width: '100%' }}>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Service/Drug</th>
                            <th>Unit Price</th>
                            <th>Quantity</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            activeDispute?.transactions.map((transaction, index) => {
                                const service = transaction.is_drug ? DrugService.findDrugInRepository(drugs, transaction.drug_id) : transaction.service;
                                return <tr>
                                    <td>{index + 1}</td>
                                    <td>{!transaction.is_drug ? service.service_name : `${service.productName} (${service.description})`}</td>
                                    <td>{numeral(transaction.cost).format('0,0.00')}</td>
                                    <td>{transaction.quantity}</td>
                                    <td>{numeral(transaction.total).format('0,0.00')}</td>
                                </tr>
                            })
                        }
                    </tbody>
                </table>
            </DialogContent>
        </Dialog>
    </div>
}

export default AdminDispute;