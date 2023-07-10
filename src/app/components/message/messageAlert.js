import {Alert} from 'react-bootstrap';

function MessageAlert({alertMessage, alertVariant, alertLink}) {
  return (
    <Alert variant={alertVariant}>
      {alertMessage}
      {(alertLink)?<div><Alert.Link href={alertLink.link}>{alertLink.message}</Alert.Link></div>:""}
      
    </Alert>
  );
}

export default MessageAlert; 
