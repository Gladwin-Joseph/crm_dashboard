const axios= require("axios")
axios.get('https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/SalesQuoteCollection/$count/?$filter=(CreationDateTime%20ge%20datetimeoffset%272024-06-03T07:15:00Z%27)',{
  auth: {
    username: "20000031",
    password: "Rashi12345"
}}).then(function(response) {
  console.log('Authenticated');
  console.log(response);
}).catch(function(error) {
  console.log('Error on Authentication');
});