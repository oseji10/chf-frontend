import moment from "moment/moment";

export function _calculateAge(birthday) {
  // birthday is a date
  var ageDifMs = Date.now() - new Date(birthday).getTime();
  var ageDate = new Date(ageDifMs); // miliseconds from epoch
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

export function diffWithNowMins(dateValue) {
  // birthday is a date
  var diff = Date.now() - new Date(dateValue).getTime();
  return diff / (1000 * 60);
}

export function timestampToRegularTime(timestamp) {
  let date = new Date(timestamp);

  return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
}


export function timestampToRegularDateTime(timestamp) {
  return moment(timestamp).format('DD/MM/YYYY hh:mm:ss')
  let date = new Date(timestamp);

  return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()} ${date.getHours()}:${String(date.getUTCMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, 0)}`;
}

export function todayDate() {
  const today = new Date();
  return (
    String(today.getDate()).padStart(2, "0") +
    "/" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "/" +
    today.getFullYear()
  );
}
