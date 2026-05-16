# RSVP System Architecture

The RSVP system is a "Serverless" integration that uses Google Sheets as a database. This allows for easy administration without needing a backend server.

## Data Flow

### 1. Fetching Guests (GET)
- **Trigger**: When a user visits the RSVP tab.
- **Action**: The React frontend sends a `GET` request to the Google Apps Script Web App URL.
- **Backend**: The Apps Script reads all rows from the "Sheet1" tab, converts them to a JSON array of objects, and returns them to the browser.
- **Result**: The guest list is loaded into the `guests` state in `App.jsx`.

### 2. Searching & Grouping
- **Search**: As the user types (minimum 2 characters), the frontend filters the `guests` array.
- **Grouping**: When a guest is selected, the code looks for other guests with the same `GroupID`. 
- **Form Generation**: The UI dynamically creates an RSVP form for every member found in that group.

### 3. Submitting RSVPs (POST)
- **Action**: When the user clicks "Submit All RSVPs", the frontend sends a `POST` request to the same Apps Script URL.
- **Payload**: A JSON array containing the updated fields (`Name`, `Attending`, `Meal`, `Notes`, `Email`, `Phone`) for each group member.
- **Backend**: The Apps Script loops through the spreadsheet, finds the matching rows by Name, and updates the specific columns for those rows.
- **Result**: The spreadsheet is updated in real-time.

## Security Note
The system is configured as a "Strict RSVP" system. The script only updates rows where the name matches exactly. This prevents unauthorized users from adding themselves to the guest list.
