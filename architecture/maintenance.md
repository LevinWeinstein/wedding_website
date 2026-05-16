# Maintenance & Modification Guide

This guide explains how to manage the Google Sheet backend and update the website configuration.

## Managing the Guest List
To add or remove guests, simply edit your Google Sheet directly.
- **Adding Guests**: Add a new row. Ensure the `Name` and `GroupID` are filled.
- **Grouping Families**: Give every member of the household the same `GroupID` (number or string).
- **Correcting Names**: If a guest can't find themselves, check that their name in the sheet matches exactly how they are typing it.

## Adding More Columns
If you want to track more data (e.g., "Shuttle Needed" or "Song Request"):

1.  **In Google Sheets**: Add a new column header (e.g., `Shuttle`).
2.  **In Apps Script**:
    - Update the `doPost` function to include the new index:
      ```javascript
      const shuttleIdx = headers.indexOf("Shuttle");
      // ... later in the loop:
      if (shuttleIdx > -1) sheet.getRange(i + 1, shuttleIdx + 1).setValue(res.shuttle);
      ```
    - Re-deploy the script as a **New Version**.
3.  **In React (`App.jsx`)**:
    - Update the `groupResponses` state initialization to include the new field.
    - Add a new input field to the form in the `selectedGroup.map` section.
    - Update the `updateResponse` call for that new field.

## Switching to a New Sheet
If you create a brand new spreadsheet:
1.  Open the new sheet and go to **Extensions > Apps Script**.
2.  Paste the RSVP script and **Deploy as Web App**.
3.  Copy the new **Web App URL**.
4.  In `src/App.jsx`, update the `SCRIPT_URL` constant:
    ```javascript
    const SCRIPT_URL = 'YOUR_NEW_URL_HERE';
    ```

## Local Development
Run the following to see changes locally:
```bash
npm run dev
```
The site will be available at `http://localhost:5174`.
