export const downloadCSV = (csvData, outputFileName = null) => {

    var encodedUri = encodeURI(csvData);
    const date = new Date();
    const fileName = outputFileName ? outputFileName : date.getFullYear() + date.getTime() + date.getDay() + ".xlsx"
    // window.open(encodedUri);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", fileName);
    document.body.appendChild(link); // Required for FF

    link.click(); // This will download the data file named "my_data.csv".
}