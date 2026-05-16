/**
 * Google Apps Script for Wedding RSVP Backend
 * 
 * Instructions:
 * 1. Open a Google Sheet.
 * 2. Go to Extensions > Apps Script.
 * 3. Paste this code and Save.
 * 4. Click Deploy > New Deployment.
 * 5. Select type "Web App", Execute as "Me", Access "Anyone".
 * 6. Copy the Web App URL and paste it into SCRIPT_URL in src/App.jsx.
 */

function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  
  // Return all guest data so the UI can handle groups
  const guests = data.map(row => {
    let obj = {};
    headers.forEach((header, i) => obj[header] = row[i]);
    return obj;
  });
  
  return ContentService.createTextOutput(JSON.stringify(guests))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const responses = JSON.parse(e.postData.contents); // Array of responses
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const nameIdx = headers.indexOf("Name");
  const attendIdx = headers.indexOf("Attending");
  const mealIdx = headers.indexOf("Meal");
  const notesIdx = headers.indexOf("Notes");
  const emailIdx = headers.indexOf("Email");
  const phoneIdx = headers.indexOf("Phone");

  responses.forEach(res => {
    for (let i = 1; i < data.length; i++) {
      if (data[i][nameIdx].toLowerCase() === res.name.toLowerCase()) {
        if (attendIdx > -1) sheet.getRange(i + 1, attendIdx + 1).setValue(res.attending);
        if (mealIdx > -1) sheet.getRange(i + 1, mealIdx + 1).setValue(res.meal);
        if (notesIdx > -1) sheet.getRange(i + 1, notesIdx + 1).setValue(res.notes);
        if (emailIdx > -1) sheet.getRange(i + 1, emailIdx + 1).setValue(res.email);
        if (phoneIdx > -1) sheet.getRange(i + 1, phoneIdx + 1).setValue(res.phone);
      }
    }
  });

  return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
}
