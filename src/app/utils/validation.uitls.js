export function isEmail(email) {
  if (
    /^\w+([\.!#$%&'*+/=?^_`{|}~-]?\w+)*@\w+([\.!#$%&'*+/=?^_`{|}~-]?\w+)*(\.\w{2,3})+$/.test(
      email
    )
  ) {
    return true;
  }

  return false;
}

export function minLength(value, len) {
  try{
    if (value.length < len) return false;
    return true;
  }catch(e){
    return false;
  }
  
}

export function maxLength(value, len) {
    try{
      if (value.length > len) return false;
      return true;
    }catch(e){
      return false;
    }
  }


