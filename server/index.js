const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const app = express();
const PORT = 5000;
const cors = require("cors");

app.use(cors());
app.use(express.json());

let tempDataStore = {};

app.post("/formdata", (req, res) => {
  console.log(req.body);
  tempDataStore = req.body;
  res.json({ message: "Logged in" });
});

app.get("/api/formdata", (req, res) => {
  res.json(tempDataStore);
});

app.get("/api/data", async (req, res) => {
  let id = tempDataStore.id;
  let password = tempDataStore.password;
  let email = tempDataStore.email;
  let role = tempDataStore.selectedRole;

  try {
    let today = new Date().toISOString().slice(0, 10);
    //yesterday logic
    let yesterday = new Date(); // Get today's date
    yesterday.setDate(yesterday.getDate() - 1); // Subtract one day to get yesterday's date

    //Month logic
    let month = new Date();
    let mn = String(month.getMonth() + 1).padStart(2, "0");

    // Format the date in yyyy-mm-dd format
    let yyyy = yesterday.getFullYear();
    let mm = String(yesterday.getMonth() + 1).padStart(2, "0"); // Months are zero-based, so add 1
    let dd = String(yesterday.getDate()).padStart(2, "0");
    // Yesterday full date stored
    let yesterday1 = `${yyyy}-${mm}-${dd}`;

    //Get current time
    const currentDate = new Date();

    //previous month logic
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based, so add 1
      const day = String(date.getDate()).padStart(2, "0");
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
    const formatter = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata"
    });

    // Get the formatted time string
    const localizedTime = formatter.format(currentDate);
    const urls = [
      //quote released mtd
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/SalesQuoteCollection/$count/?$filter=(CreationDateTime%20ge%20datetimeoffset%272024-${mn}-01T00:00:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T${localizedTime}Z%27)and(ExternalPriceCalculationStatusCodeText%20eq%20%27Calculated Successfully%27)`,
      //quote released today
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/SalesQuoteCollection/$count/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${today}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T23:55:00Z%27)and(ResultStatusCodeText ne 'Not Relevant')`,
      //quote released yesterday
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/SalesQuoteCollection/$count/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${yesterday1}T00:00:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${yesterday1}T23:58:00Z%27)and(ResultStatusCodeText ne 'Not Relevant')`,
      //visits last month
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/VisitCollection/$count/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${formattedFirstDay}T06:00:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${formattedLastDay}T23:00:00Z%27)and(StatusText%20eq%20%27Completed%27)and(OwnerEmailURI%20eq%20%27${email}%27)`,
      //visits current month
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/VisitCollection/$count/?$filter=(CreationDateTime%20ge%20datetimeoffset%272024-${mn}-01T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T${localizedTime}Z%27)and(StatusText%20eq%20%27Completed%27)and(OwnerEmailURI%20eq%20%27${email}%27)`,
      //visits today
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/VisitCollection/$count/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${today}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T23:55:00Z%27)and(StatusText%20eq%20%27Completed%27)and(OwnerEmailURI%20eq%20%27${email}%27)`,
      //visits yesterday
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/VisitCollection/$count/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${yesterday1}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${yesterday1}T23:55:00Z%27)and(StatusText%20eq%20%27Completed%27)and(OwnerEmailURI%20eq%20%27${email}%27)`,
      //stock transfer monthly
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/LeadCollection/$count/?$filter=(CreationDateTime%20ge%20datetimeoffset%272024-${mn}-01T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T${localizedTime}Z%27)and(UserStatusCodeText%20eq%20%27Release%20SO%27)and(Z_KUT_ProcessType_KUTText%20eq%20%27Stock%20Transfer%20Request%27)and(SalesOrganisationID%20eq%20%27RPPL%27)`,
      //stock transfer today
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/LeadCollection/$count/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${today}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T23:55:00Z%27)and(UserStatusCodeText%20eq%20%27Release%20SO%27)and(Z_KUT_ProcessType_KUTText%20eq%20%27Stock%20Transfer%20Request%27)and(SalesOrganisationID%20eq%20%27RPPL%27)`,
      //stock transfer today
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/LeadCollection/$count/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${yesterday1}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${yesterday1}T23:58:00Z%27)and(UserStatusCodeText%20eq%20%27Release%20SO%27)and(Z_KUT_ProcessType_KUTText%20eq%20%27Stock%20Transfer%20Request%27)and(SalesOrganisationID%20eq%20%27RPPL%27)`
    ];

    const alturls = [
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
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/LeadCollection/$count/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${yesterday1}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${yesterday1}T23:58:00Z%27)and(UserStatusCodeText%20eq%20%27Release%20SO%27)and(Z_KUT_ProcessType_KUTText%20eq%20%27Stock%20Transfer%20Request%27)and(SalesOrganisationID%20eq%20%27RPPL%27)`
    ];

    const urls1 = [
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
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/LeadCollection/$count/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${yesterday1}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${yesterday1}T23:58:00Z%27)and(UserStatusCodeText%20eq%20%27Release%20SO%27)and(Z_KUT_ProcessType_KUTText%20eq%20%27Stock%20Transfer%20Request%27)and(SalesOrganisationID%20eq%20%27RPPL%27)`
    ];

    let preprocessedUrls;
    if (id.startsWith("2000")) {
      preprocessedUrls = alturls;
    } else if (role === "Branch Head") {
      preprocessedUrls = urls1;
    } else {
      preprocessedUrls = urls;
    }
    const responses = await Promise.all(
      preprocessedUrls.map((url) =>
        axios.get(url, {
          auth: {
            username: id,
            password: password
          }
        })
      )
    );

    const data = responses.map((response) => response.data);
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
      data10: data[9]
    };

    res.json(combinedData);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching data from external API");
  }
});

app.get("/api/userdata", async (req, res) => {
  let id = tempDataStore.id;
  let password = tempDataStore.password;
  let email = tempDataStore.email;
  let role = tempDataStore.selectedRole;

  try {
    let today = new Date().toISOString().slice(0, 10);
    //yesterday logic
    let yesterday = new Date(); // Get today's date
    yesterday.setDate(yesterday.getDate() - 1); // Subtract one day to get yesterday's date

    //Month logic
    let month = new Date();
    let mn = String(month.getMonth() + 1).padStart(2, "0");

    // Format the date in yyyy-mm-dd format
    let yyyy = yesterday.getFullYear();
    let mm = String(yesterday.getMonth() + 1).padStart(2, "0"); // Months are zero-based, so add 1
    let dd = String(yesterday.getDate()).padStart(2, "0");
    // Yesterday full date stored
    let yesterday1 = `${yyyy}-${mm}-${dd}`;

    //Get current time
    const currentDate = new Date();

    //previous month logic
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based, so add 1
      const day = String(date.getDate()).padStart(2, "0");
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
    const formatter = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata"
    });

    // Get the formatted time string
    const localizedTime = formatter.format(currentDate);
    const urls = [
      //quote released mtd
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/SalesQuoteCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%272024-${mn}-01T00:00:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T${localizedTime}Z%27)and(ExternalPriceCalculationStatusCodeText%20eq%20%27Calculated Successfully%27)`,
      //quote released today
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/SalesQuoteCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${today}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T23:55:00Z%27)and(ResultStatusCodeText ne 'Not Relevant')`,
      //quote released yesterday
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/SalesQuoteCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${yesterday1}T00:00:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${yesterday1}T23:58:00Z%27)and(ResultStatusCodeText ne 'Not Relevant')`,
      //visits last month
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/VisitCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${formattedFirstDay}T06:00:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${formattedLastDay}T23:00:00Z%27)and(StatusText%20eq%20%27Completed%27)and(OwnerEmailURI%20eq%20%27${email}%27)`,
      //visits current month
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/VisitCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%272024-${mn}-01T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T${localizedTime}Z%27)and(StatusText%20eq%20%27Completed%27)and(OwnerEmailURI%20eq%20%27${email}%27)`,
      //visits today
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/VisitCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${today}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T23:55:00Z%27)and(StatusText%20eq%20%27Completed%27)and(OwnerEmailURI%20eq%20%27${email}%27)`,
      //visits yesterday
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/VisitCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${yesterday1}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${yesterday1}T23:55:00Z%27)and(StatusText%20eq%20%27Completed%27)and(OwnerEmailURI%20eq%20%27${email}%27)`,
      //stock transfer monthly
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/LeadCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%272024-${mn}-01T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T${localizedTime}Z%27)and(UserStatusCodeText%20eq%20%27Release%20SO%27)and(Z_KUT_ProcessType_KUTText%20eq%20%27Stock%20Transfer%20Request%27)and(SalesOrganisationID%20eq%20%27RPPL%27)`,
      //stock transfer today
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/LeadCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${today}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T23:55:00Z%27)and(UserStatusCodeText%20eq%20%27Release%20SO%27)and(Z_KUT_ProcessType_KUTText%20eq%20%27Stock%20Transfer%20Request%27)and(SalesOrganisationID%20eq%20%27RPPL%27)`,
      //stock transfer today
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/LeadCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${yesterday1}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${yesterday1}T23:58:00Z%27)and(UserStatusCodeText%20eq%20%27Release%20SO%27)and(Z_KUT_ProcessType_KUTText%20eq%20%27Stock%20Transfer%20Request%27)and(SalesOrganisationID%20eq%20%27RPPL%27)`
    ];

    const alturls = [
      //quote released mtd
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/SalesQuoteCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%272024-${mn}-01T00:00:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T${localizedTime}Z%27)and(ExternalPriceCalculationStatusCodeText%20eq%20%27Calculated Successfully%27)`,
      //quote released today
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/SalesQuoteCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${today}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T23:55:00Z%27)and(ResultStatusCodeText ne 'Not Relevant')`,
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
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/LeadCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${today}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T23:55:00Z%27)and(UserStatusCodeText%20eq%20%27Release%20SO%27)and(Z_KUT_ProcessType_KUTText%20eq%20%27Stock%20Transfer%20Request%27)and(SalesOrganisationID%20eq%20%27RPPL%27)`,
      //stock transfer today
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/LeadCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${yesterday1}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${yesterday1}T23:58:00Z%27)and(UserStatusCodeText%20eq%20%27Release%20SO%27)and(Z_KUT_ProcessType_KUTText%20eq%20%27Stock%20Transfer%20Request%27)and(SalesOrganisationID%20eq%20%27RPPL%27)`
    ];

    const urls1 = [
      //quote released mtd
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/SalesQuoteCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%272024-${mn}-01T00:00:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T${localizedTime}Z%27)and(ExternalPriceCalculationStatusCodeText%20eq%20%27Calculated Successfully%27)`,
      //quote released today
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/SalesQuoteCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${today}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T23:55:00Z%27)and(ResultStatusCodeText ne 'Not Relevant')`,
      //quote released yesterday
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/SalesQuoteCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${yesterday1}T00:00:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${yesterday1}T23:58:00Z%27)and(ResultStatusCodeText ne 'Not Relevant')`,
      //visits last month
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/VisitCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${formattedFirstDay}T00:00:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${formattedLastDay}T23:55:00Z%27)and(StatusText%20eq%20%27Completed%27)`,
      //visits current month
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/VisitCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%272024-${mn}-01T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T${localizedTime}Z%27)and(StatusText%20eq%20%27Completed%27)`,
      //visits today
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/VisitCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${today}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T23:55:00Z%27)and(StatusText%20eq%20%27Completed%27)`,
      //visits yesterday
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/VisitCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${yesterday1}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${yesterday1}T23:55:00Z%27)and(StatusText%20eq%20%27Completed%27)`,
      //stock transfer monthly
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/LeadCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%272024-${mn}-01T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T${localizedTime}Z%27)and(UserStatusCodeText%20eq%20%27Release%20SO%27)and(Z_KUT_ProcessType_KUTText%20eq%20%27Stock%20Transfer%20Request%27)and(SalesOrganisationID%20eq%20%27RPPL%27)`,
      //stock transfer today
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/LeadCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${today}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${today}T23:55:00Z%27)and(UserStatusCodeText%20eq%20%27Release%20SO%27)and(Z_KUT_ProcessType_KUTText%20eq%20%27Stock%20Transfer%20Request%27)and(SalesOrganisationID%20eq%20%27RPPL%27)`,
      //stock transfer today
      `https://my362233.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/LeadCollection/?$filter=(CreationDateTime%20ge%20datetimeoffset%27${yesterday1}T00:05:00Z%27)and(CreationDateTime%20le%20datetimeoffset%27${yesterday1}T23:58:00Z%27)and(UserStatusCodeText%20eq%20%27Release%20SO%27)and(Z_KUT_ProcessType_KUTText%20eq%20%27Stock%20Transfer%20Request%27)and(SalesOrganisationID%20eq%20%27RPPL%27)`
    ];

    let preprocessedUrls;
    if (id.startsWith("2000")) {
      preprocessedUrls = alturls;
    } else if (role === "Branch Head") {
      preprocessedUrls = urls1;
    } else {
      preprocessedUrls = urls;
    }
    const responses = await Promise.all(
      preprocessedUrls.map((url) =>
        axios.get(url, {
          auth: {
            username: id,
            password: password
          }
        })
      )
    );

    const data = responses.map((response) => response.data);
    const userData = {
      result1: data[0].d.results,
      result2: data[1].d.results,
      result3: data[2].d.results,
      //stock monthly
      result4: data[7].d.results,
      //stock today
      result5: data[8].d.results,
      //stock yesterday
      result6: data[9].d.results
    };

    res.json(userData);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching data from external API");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
