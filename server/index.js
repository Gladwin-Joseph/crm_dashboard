const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 5000;
const cors= require("cors");
const { createClient } = require('@supabase/supabase-js');

const allowedOrigins = [
  'https://crmroster.rptechindia.com',
  'http://localhost:3000',
  "https://crm-frontend-y34d.onrender.com",
  "https://crm-dashboard-y946.onrender.com",
];

const corsOptions = {
  origin: function (origin, callback) {
    console.log(`Origin: ${origin}`);  // Add this line to debug
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,POST,PUT,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization',
};
app.use(cors(corsOptions));

app.options('*', cors(corsOptions));

const supabaseUrl = 'https://xvelrpogedzmrvujrjxh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2ZWxycG9nZWR6bXJ2dWpyanhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc5MzMzNzAsImV4cCI6MjA0MzUwOTM3MH0.s24J6XeyK6vU7DYON7xULeWuctbPGzVxFHlKgE1OcFU';
const supabase = createClient(supabaseUrl, supabaseKey);


app.get('/api/emp_pics', async (req, res) => {
  try {
    // Fetch data from Supabase
    const { data, error } = await supabase
      .from('emp_pics') // Replace with your table name
      .select('*'); // Select all columns

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Send the data as a response
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




let tempDataStore = {};

app.post('/formdata', cors(corsOptions),(req,res) => {
  console.log(req.body)
  tempDataStore= req.body
  res.json({message: 'Logged in'})
})

app.get('/api/formdata', cors(corsOptions),(req,res) => {
  res.json(tempDataStore)
})


app.get('/api/data', cors(corsOptions), async (req, res) => {
  
  let id = tempDataStore.id;
  let password = tempDataStore.password;
  let role= tempDataStore.selectedRole;

  try {
    let today = new Date().toISOString().slice(0, 10)
    //yesterday logic
    let yesterday = new Date();  
    yesterday.setDate(yesterday.getDate() - 1); 
    //Month logic
    let month = new Date();
    let mn = String(month.getMonth() + 1).padStart(2, '0');
    
    // Format the date in yyyy-mm-dd format
    let yyyy = yesterday.getFullYear();
    let mm = String(yesterday.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1
    let dd = String(yesterday.getDate()).padStart(2, '0');
    // Yesterday full date stored
    let yesterday1 = `${yyyy}-${mm}-${dd}`

    //Get current time
    const currentDate = new Date();

    //previous month logic
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
  };
  
  // Get the first day of the previous month
  const firstDayOfPreviousMonth = new Date();
  firstDayOfPreviousMonth.setDate(1);
  firstDayOfPreviousMonth.setMonth(firstDayOfPreviousMonth.getMonth() - 1);
  const formattedFirstDay = formatDate(firstDayOfPreviousMonth);
  
  // Get the last day of the previous month
  const lastDayOfPreviousMonth = new Date();
  lastDayOfPreviousMonth.setDate(0); // Setting day to 0 gives the last day of the previous month
  const formattedLastDay = formatDate(lastDayOfPreviousMonth);
  
  // Create a DateTimeFormat object for Asia/Kolkata timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Kolkata'
  });

  // Get the formatted time string
  const localizedTime = formatter.format(currentDate);
    const urls= [
      //quote released mtd
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/SalesQuoteCollection/$count/?$filter=(CreationDateTime%20ge%20datetimeoffset%272024-${mn}-01T00:00:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T${localizedTime}Z%27)and(ExternalPriceCalculationStatusCodeText%20eq%20%27Calculated Successfully%27)`,
      //quote released today
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/SalesQuoteCollection/$count/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${today}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T23:55:00Z%27)and(ResultStatusCodeText ne 'Not Relevant')`,
      //quote released yesterday
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/SalesQuoteCollection/$count/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${yesterday1}T00:00:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${yesterday1}T23:58:00Z%27)and(ResultStatusCodeText ne 'Not Relevant')`,
      //visits last month
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/VisitCollection/$count/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${formattedFirstDay}T06:00:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${formattedLastDay}T23:00:00Z%27)and(StatusText%20eq%20%27Completed%27)`,
      //visits current month
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/VisitCollection/$count/?$filter=(CreationDateTime%20ge%20datetimeoffset%272024-${mn}-01T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T${localizedTime}Z%27)and(StatusText%20eq%20%27Completed%27)`,
      //visits today
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/VisitCollection/$count/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${today}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T23:55:00Z%27)and(StatusText%20eq%20%27Completed%27)a`,
      //visits yesterday
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/VisitCollection/$count/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${yesterday1}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${yesterday1}T23:55:00Z%27)and(StatusText%20eq%20%27Completed%27)`,
      //stock transfer monthly
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/LeadCollection/$count/?$filter=(CreationDateTime%20ge%20datetimeoffset%272024-${mn}-01T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T${localizedTime}Z%27)and(UserStatusCodeText%20eq%20%27Release%20SO%27)and(Z_KUT_ProcessType_KUTText%20eq%20%27Stock%20Transfer%20Request%27)and(SalesOrganisationID%20eq%20%27RPPL%27)`,
      //stock transfer today
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/LeadCollection/$count/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${today}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T23:55:00Z%27)and(UserStatusCodeText%20eq%20%27Release%20SO%27)and(Z_KUT_ProcessType_KUTText%20eq%20%27Stock%20Transfer%20Request%27)and(SalesOrganisationID%20eq%20%27RPPL%27)`,
      //stock transfer today
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/LeadCollection/$count/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${yesterday1}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${yesterday1}T23:58:00Z%27)and(UserStatusCodeText%20eq%20%27Release%20SO%27)and(Z_KUT_ProcessType_KUTText%20eq%20%27Stock%20Transfer%20Request%27)and(SalesOrganisationID%20eq%20%27RPPL%27)`,
    ]

    const alturls= [
      //quote released mtd
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/SalesQuoteCollection/$count/?$filter=(CreationDateTime%20ge%20datetimeoffset%272024-${mn}-01T00:00:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T${localizedTime}Z%27)and(ExternalPriceCalculationStatusCodeText%20eq%20%27Calculated Successfully%27)`,
      //quote released today
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/SalesQuoteCollection/$count/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${today}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T23:55:00Z%27)and(ResultStatusCodeText ne 'Not Relevant')`,
      //quote released yesterday
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/SalesQuoteCollection/$count/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${yesterday1}T00:00:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${yesterday1}T23:58:00Z%27)and(ResultStatusCodeText ne 'Not Relevant')`,
      //visits last month
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/VisitCollection/$count/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${formattedFirstDay}T06:00:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${formattedLastDay}T23:00:00Z%27)and(StatusText%20eq%20%27Completed%27)`,
      //visits current month
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/VisitCollection/$count/?$filter=(CreationDateTime%20ge%20datetimeoffset%272024-${mn}-01T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T${localizedTime}Z%27)and(StatusText%20eq%20%27Completed%27)`,
      //visits today
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/VisitCollection/$count/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${today}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T23:55:00Z%27)and(StatusText%20eq%20%27Completed%27)`,
      //visits yesterday
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/VisitCollection/$count/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${yesterday1}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${yesterday1}T23:55:00Z%27)and(StatusText%20eq%20%27Completed%27)`,
      //stock transfer monthly
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/LeadCollection/$count/?$filter=(CreationDateTime%20ge%20datetimeoffset%272024-${mn}-01T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T${localizedTime}Z%27)and(UserStatusCodeText%20eq%20%27Release%20SO%27)and(Z_KUT_ProcessType_KUTText%20eq%20%27Stock%20Transfer%20Request%27)and(SalesOrganisationID%20eq%20%27RPPL%27)`,
      //stock transfer today
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/LeadCollection/$count/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${today}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T23:55:00Z%27)and(UserStatusCodeText%20eq%20%27Release%20SO%27)and(Z_KUT_ProcessType_KUTText%20eq%20%27Stock%20Transfer%20Request%27)and(SalesOrganisationID%20eq%20%27RPPL%27)`,
      //stock transfer today
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/LeadCollection/$count/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${yesterday1}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${yesterday1}T23:58:00Z%27)and(UserStatusCodeText%20eq%20%27Release%20SO%27)and(Z_KUT_ProcessType_KUTText%20eq%20%27Stock%20Transfer%20Request%27)and(SalesOrganisationID%20eq%20%27RPPL%27)`,
    ]

    const urls1= [
      //quote released mtd
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/SalesQuoteCollection/$count/?$filter=(CreationDateTime%20ge%20datetimeoffset%272024-${mn}-01T00:00:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T${localizedTime}Z%27)and(ExternalPriceCalculationStatusCodeText%20eq%20%27Calculated Successfully%27)`,
      //quote released today
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/SalesQuoteCollection/$count/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${today}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T23:55:00Z%27)and(ResultStatusCodeText ne 'Not Relevant')`,
      //quote released yesterday
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/SalesQuoteCollection/$count/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${yesterday1}T00:00:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${yesterday1}T23:58:00Z%27)and(ResultStatusCodeText ne 'Not Relevant')`,
      //visits last month
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/VisitCollection/$count/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${formattedFirstDay}T00:00:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${formattedLastDay}T23:55:00Z%27)and(StatusText%20eq%20%27Completed%27)`,
      //visits current month
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/VisitCollection/$count/?$filter=(CreationDateTime%20ge%20datetimeoffset%272024-${mn}-01T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T${localizedTime}Z%27)and(StatusText%20eq%20%27Completed%27)`,
      //visits today
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/VisitCollection/$count/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${today}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T23:55:00Z%27)and(StatusText%20eq%20%27Completed%27)`,
      //visits yesterday
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/VisitCollection/$count/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${yesterday1}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${yesterday1}T23:55:00Z%27)and(StatusText%20eq%20%27Completed%27)`,
      //stock transfer monthly
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/LeadCollection/$count/?$filter=(CreationDateTime%20ge%20datetimeoffset%272024-${mn}-01T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T${localizedTime}Z%27)and(UserStatusCodeText%20eq%20%27Release%20SO%27)and(Z_KUT_ProcessType_KUTText%20eq%20%27Stock%20Transfer%20Request%27)and(SalesOrganisationID%20eq%20%27RPPL%27)`,
      //stock transfer today
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/LeadCollection/$count/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${today}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T23:55:00Z%27)and(UserStatusCodeText%20eq%20%27Release%20SO%27)and(Z_KUT_ProcessType_KUTText%20eq%20%27Stock%20Transfer%20Request%27)and(SalesOrganisationID%20eq%20%27RPPL%27)`,
      //stock transfer today
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/LeadCollection/$count/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${yesterday1}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${yesterday1}T23:58:00Z%27)and(UserStatusCodeText%20eq%20%27Release%20SO%27)and(Z_KUT_ProcessType_KUTText%20eq%20%27Stock%20Transfer%20Request%27)and(SalesOrganisationID%20eq%20%27RPPL%27)`,
    ]

    let preprocessedUrls;
    if(role === "Branch Head") {
      preprocessedUrls=urls1
    } 
    else {
      preprocessedUrls=urls
    }
    const responses = await Promise.all(preprocessedUrls.map(url =>
      axios.get(url,{
        auth: {
          username: id,
          password: password,
        }
      })
    ));

    const data = responses.map(response => response.data);
    const combinedData = {
      data1: data[0],
      data2: data[1],
      data3: data[2],
      data4: data[3], 
      data5: data[4], 
      data6: data[5],
      data7: data[6],
      data8: data[7],
      data9: data[8],
      data10: data[9],
    };

    res.json(combinedData);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching data from external API');
  }
});

app.get('/api/userdata', async (req, res) =>{
  let id = tempDataStore.id;
  let password = tempDataStore.password;
  let role= tempDataStore.selectedRole;

  try {
    let today = new Date().toISOString().slice(0, 10)
    //yesterday logic
    let yesterday = new Date();  // Get today's date
    yesterday.setDate(yesterday.getDate() - 1); // Subtract one day to get yesterday's date

    //Month logic
    let month = new Date();
    let mn = String(month.getMonth() + 1).padStart(2, '0');
    
    // Format the date in yyyy-mm-dd format
    let yyyy = yesterday.getFullYear();
    let mm = String(yesterday.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1
    let dd = String(yesterday.getDate()).padStart(2, '0');
    // Yesterday full date stored
    let yesterday1 = `${yyyy}-${mm}-${dd}`

    //Get current time
    const currentDate = new Date();

    //previous month logic
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
  };
  
  // Get the first day of the previous month
  const firstDayOfPreviousMonth = new Date();
  firstDayOfPreviousMonth.setDate(1);
  firstDayOfPreviousMonth.setMonth(firstDayOfPreviousMonth.getMonth() - 1);
  const formattedFirstDay = formatDate(firstDayOfPreviousMonth);
  
  // Get the last day of the previous month
  const lastDayOfPreviousMonth = new Date();
  lastDayOfPreviousMonth.setDate(0); // Setting day to 0 gives the last day of the previous month
  const formattedLastDay = formatDate(lastDayOfPreviousMonth);
  
  // Create a DateTimeFormat object for Asia/Kolkata timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Kolkata'
  });

  // Get the formatted time string
  const localizedTime = formatter.format(currentDate);
    const urls= [
      //quote released mtd
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/SalesQuoteCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%272024-${mn}-01T00:00:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T${localizedTime}Z%27)and(ExternalPriceCalculationStatusCodeText%20eq%20%27Calculated Successfully%27)and(SalesOrganisationID%20eq%20%27RPPL%27)`,
      //quote released today
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/SalesQuoteCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${today}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T23:55:00Z%27)`,
      //quote released yesterday
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/SalesQuoteCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${yesterday1}T00:00:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${yesterday1}T23:58:00Z%27)and(ResultStatusCodeText ne 'Not Relevant')`,
      //visits last month
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/VisitCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${formattedFirstDay}T06:00:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${formattedLastDay}T23:00:00Z%27)and(StatusText%20eq%20%27Completed%27)`,
      //visits current month
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/VisitCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%272024-${mn}-01T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T${localizedTime}Z%27)and(StatusText%20eq%20%27Completed%27)`,
      //visits today
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/VisitCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${today}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T23:55:00Z%27)and(StatusText%20eq%20%27Completed%27)`,
      //visits yesterday
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/VisitCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${yesterday1}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${yesterday1}T23:55:00Z%27)and(StatusText%20eq%20%27Completed%27)`,
      //stock transfer monthly
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/LeadCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%272024-${mn}-01T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T${localizedTime}Z%27)and(UserStatusCodeText%20eq%20%27Release%20SO%27)and(Z_KUT_ProcessType_KUTText%20eq%20%27Stock%20Transfer%20Request%27)and(SalesOrganisationID%20eq%20%27RPPL%27)`,
      //stock transfer today
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/LeadCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${today}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T23:55:00Z%27)and(SalesOrganisationID%20eq%20%27RPPL%27)`,
      //stock transfer today
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/LeadCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${yesterday1}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${yesterday1}T23:58:00Z%27)and(UserStatusCodeText%20eq%20%27Release%20SO%27)and(Z_KUT_ProcessType_KUTText%20eq%20%27Stock%20Transfer%20Request%27)and(SalesOrganisationID%20eq%20%27RPPL%27)`,
    ]

    const alturls= [
      //quote released mtd
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/SalesQuoteCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%272024-${mn}-01T00:00:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T${localizedTime}Z%27)and(ExternalPriceCalculationStatusCodeText%20eq%20%27Calculated Successfully%27)and(SalesOrganisationID%20eq%20%27RPPL%27)`,
      //quote released today
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/SalesQuoteCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${today}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T23:55:00Z%27)`,
      //quote released yesterday
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/SalesQuoteCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${yesterday1}T00:00:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${yesterday1}T23:58:00Z%27)and(ResultStatusCodeText ne 'Not Relevant')`,
      //visits last month
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/VisitCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${formattedFirstDay}T06:00:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${formattedLastDay}T23:00:00Z%27)and(StatusText%20eq%20%27Completed%27)`,
      //visits current month
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/VisitCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%272024-${mn}-01T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T${localizedTime}Z%27)and(StatusText%20eq%20%27Completed%27)`,
      //visits today
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/VisitCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${today}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T23:55:00Z%27)`,
      //visits yesterday
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/VisitCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${yesterday1}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${yesterday1}T23:55:00Z%27)and(StatusText%20eq%20%27Completed%27)`,
      //stock transfer monthly
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/LeadCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%272024-${mn}-01T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T${localizedTime}Z%27)and(UserStatusCodeText%20eq%20%27Release%20SO%27)and(Z_KUT_ProcessType_KUTText%20eq%20%27Stock%20Transfer%20Request%27)and(SalesOrganisationID%20eq%20%27RPPL%27)`,
      //stock transfer today
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/LeadCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${today}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T23:55:00Z%27)and(SalesOrganisationID%20eq%20%27RPPL%27)`,
      //stock transfer today
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/LeadCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${yesterday1}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${yesterday1}T23:58:00Z%27)and(UserStatusCodeText%20eq%20%27Release%20SO%27)and(Z_KUT_ProcessType_KUTText%20eq%20%27Stock%20Transfer%20Request%27)and(SalesOrganisationID%20eq%20%27RPPL%27)`,
      //employee data
      "https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/EmployeeBasicDataCollection/?$filter=(JobName%20eq%20%27Champion%27)and(UserLockedIndicator%20eq%20false)",
    ]

    const urls1= [
      //quote released mtd
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/SalesQuoteCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%272024-${mn}-01T00:00:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T${localizedTime}Z%27)and(ExternalPriceCalculationStatusCodeText%20eq%20%27Calculated Successfully%27)and(SalesOrganisationID%20eq%20%27RPPL%27)`,
      //quote released today
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/SalesQuoteCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${today}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T23:55:00Z%27)and(ResultStatusCodeText ne 'Not Relevant')`,
      //quote released yesterday
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/SalesQuoteCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${yesterday1}T00:00:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${yesterday1}T23:58:00Z%27)and(ResultStatusCodeText ne 'Not Relevant')`,
      //visits last month
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/VisitCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${formattedFirstDay}T00:00:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${formattedLastDay}T23:55:00Z%27)and(StatusText%20eq%20%27Completed%27)`,
      //visits current month
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/VisitCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%272024-${mn}-01T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T${localizedTime}Z%27)and(StatusText%20eq%20%27Completed%27)`,
      //visits today
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/VisitCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${today}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T23:55:00Z%27)`,
      //visits yesterday
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/VisitCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${yesterday1}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${yesterday1}T23:55:00Z%27)and(StatusText%20eq%20%27Completed%27)`,
      //stock transfer monthly
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/LeadCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%272024-${mn}-01T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T${localizedTime}Z%27)and(UserStatusCodeText%20eq%20%27Release%20SO%27)and(Z_KUT_ProcessType_KUTText%20eq%20%27Stock%20Transfer%20Request%27)and(SalesOrganisationID%20eq%20%27RPPL%27)`,
      //stock transfer today
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/LeadCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${today}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T23:55:00Z%27)and(SalesOrganisationID%20eq%20%27RPPL%27)`,
      //stock transfer yesterday
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/LeadCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${yesterday1}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${yesterday1}T23:58:00Z%27)and(UserStatusCodeText%20eq%20%27Release%20SO%27)and(Z_KUT_ProcessType_KUTText%20eq%20%27Stock%20Transfer%20Request%27)and(SalesOrganisationID%20eq%20%27RPPL%27)`,
      //employee data
      "https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/EmployeeBasicDataCollection/?$filter=(JobName%20eq%20%27Champion%27)and(UserLockedIndicator%20eq%20false)",
    ]

    let preprocessedUrls;
    if(role === "Branch Head") {
      preprocessedUrls=urls1
    } 
    else {
      preprocessedUrls=urls
    }
    const responses = await Promise.all(preprocessedUrls.map(url =>
      axios.get(url,{
        auth: {
          username: id,
          password: password,
        }
      })
    ));

    const data = responses.map(response => response.data);
    const userData= {
      //quote monthly
      result1: data[0].d.results,
      //quote today
      result2: data[1].d.results,
      //quote yesterday
      result3: data[2].d.results,
      //stock monthly
      result4: data[7].d.results,
      
      //stock today
      result5: data[8].d.results,
      //stock yesterday
      result6: data[9].d.results,
      //visits last month
      result7: data[3].d.results,
      //visits monthly
      result8: data[4].d.results,
      //visits today
      result9: data[5].d.results,
      //visits yesterday
      result10: data[6].d.results,
      //employee data
      result11: data[10].d.results,
    }

    res.json(userData);

  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching data from external API');
  }
})

//individual count logic

app.get('/individual-counts', async(req,res) => {
  let id = tempDataStore.id;
  let password = tempDataStore.password;

// Function to get quote counts for the last 30 days, including today
const getQuoteCountsForLast30Days = async () => {
  const today = new Date();
  const counts = [];

  // Loop through the last 30 days, including today
  for (let i = 0; i < 30; i++) {
      const pastDate = new Date(today);
      pastDate.setDate(today.getDate() - i);  // Decrease date by i days
      const dateStr = pastDate.toISOString().split('T')[0];  // Format as YYYY-MM-DD
      const countData = await getQuoteCountForDay(dateStr);
      console.log(dateStr)
      counts.push(countData);
  }

  return counts.reverse();  // Reverse to get the earliest date first
};
// Function to get the quote count for a specific day
const getQuoteCountForDay = async (date) => {
  const startDate = `${date}T00:00:00Z`;
  const endDate = `${date}T23:59:59Z`;
  const url = `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/SalesQuoteCollection/$count/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${startDate}%27)and(CreationDateTime%20le%20datetimeoffset%27${endDate}%27)`;

 try {
  const response= await axios.get(url,{
    auth: {
      username:id,
      password:password
    }
  });

  const count= response.data;
  
  //Parsing diferent formats of date for ui uses
  const humanReadableData= new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
  return {
    date,
    formattedDate: humanReadableData,
    count:parseInt(count,10)
  };
 } catch (error) {
  console.error(`Error fetching data for ${date}:`, error.message);
  return {date,
    formatedDate: new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
    count:0
  } ;  
 }
 }

  try {
    const data= await getQuoteCountsForLast30Days();
    res.json(data);
  } catch (error) {
    res.status(500).json({error: 'Error fetching data'});
  }
})


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});