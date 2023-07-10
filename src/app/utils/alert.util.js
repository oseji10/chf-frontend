import {toast} from 'react-toastify';
import { Icon } from '../components';

// const showToastifyAlert = (variant = 'success', message = '') => {
//     switch (variant) {
//         case 'success': return toast('success custom Toast',{
//             className: 'custom-toast',
//             draggable: false,
//             position: toast.POSITION.BOTTOM_RIGHT
//         })
//         case 'info': return toast.info(message)
//         case 'canger': return toast.danger(message)
//         case 'warning': return toast.warn(message)
//         default:
//             toast.dark(message);
//     }
// }

export const errorAlert = (message, options = {}) => {
    return toast.error(message, {
        icon: <Icon icon='fa fa-exclamation' />,
        ...options
    });
} 

export const successAlert = (message, options = {}) => {
    return toast.success(message, {
        icon: <Icon icon='fa fa-check-o' />,
        ...options
    });
} 


// export default showToastifyAlert;

