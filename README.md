# Campus Lost & Found Management System

Phase 1 and Phase 2 implementation for the full-stack development assignment. The application uses Node.js, Express, EJS, MongoDB, Mongoose, dotenv, and method-override.

## Setup

1. Install Node.js and MongoDB.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and configure `MONGODB_URI` and `PORT`.
4. Start the application:

   ```bash
   npm start
   ```

   Open `http://localhost:3000`.

## Routes

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/` | Home page |
| GET | `/students/new` | Student profile form |
| POST | `/students` | Create a student profile |
| GET | `/students/:id` | Display one student profile |
| GET | `/lost-items/new` | Lost-item report form |
| POST | `/lost-items` | Create a lost-item report |
| GET | `/lost-items` | List lost items with optional `?search=` filtering |
| GET | `/lost-items/:id` | Display one lost-item report |
| GET | `/found-items/new` | Found-item report form |
| POST | `/found-items` | Create a found-item report |
| GET | `/found-items` | List found items |
| GET | `/found-items/:id` | Display one found-item report and claims |
| POST | `/found-items/:id/claims` | Submit a claim |
| PATCH | `/claims/:id/status` | Approve or reject a pending claim |

HTML forms use POST with `_method=PATCH`; `method-override` converts these to the required PATCH route.

## Database relationships

- A `Student` can report many `LostItem` documents through `LostItem.reportedBy`.
- A `Student` can report many `FoundItem` documents through `FoundItem.reportedBy`.
- A `Claim` references one `FoundItem` through `foundItemId` and one `Student` through `claimedBy`.
- MongoDB ObjectIds are used for relationships and dynamic routes.

## Claim and return rules

- New claims always start as `Pending`.
- A claim requires an existing found item and an existing student.
- The same student cannot claim the same found item more than once. This is enforced by a backend check and a compound unique index.
- Returned items cannot receive new claims.
- Only the student in `FoundItem.reportedBy` can approve or reject that item's claims. This ownership check is performed on the server.
- Approval changes only the claim status and found-item status. The item becomes `Returned`, and remaining pending claims are rejected.
- Only `Approved` and `Rejected` are accepted status transitions, and only pending claims can be reviewed.
- The forms use a selected student ID as the demo identity mechanism because authentication is outside this assignment's scope. The backend still checks that the reviewer is the actual item reporter. A production version should replace this with session-based authentication.

## Validation and error handling

- Required text fields reject empty and whitespace-only values.
- Phone numbers accept exactly 10 digits.
- Names, departments, emails, item fields, descriptions, locations, and claim reasons have format and length limits.
- Lost and found dates cannot be in the future.
- ObjectIds are checked before database queries.
- Missing records return suitable 404 responses.
- Invalid, duplicate, unauthorized, and conflicting operations return suitable 400, 403, or 409 responses.
- Database failures are reported rather than silently ignored.

## Phase 1 demonstration

1. Create a student profile and copy its generated Student ID.
2. Create a lost-item report using that student.
3. Open the dynamic lost-item list and detail page.
4. Search lost items by name, category, or location.
5. Create a found-item report using the same or another student.
6. Open the dynamic found-item list and detail page.
7. Test invalid and missing IDs.

## Phase 2 demonstration

1. Create Student A and Student B.
2. Have Student A report a found item.
3. Open the item detail page and submit a claim as Student B.
4. Confirm the claim appears as `Pending`.
5. Approve the claim as the reporting student.
6. Confirm the claim is `Approved` and the item is `Returned`.
7. Try to submit another claim and confirm it is rejected.
8. Test an unauthorized reviewer by changing `reviewerId` in a request; the server must return `403`.

## Phase 2 test cases

- Valid claim creation creates a `Pending` claim.
- Invalid found-item ID is rejected.
- Missing found item is rejected.
- Invalid or missing student is rejected.
- Empty, short, or overlong claim reason is rejected.
- Duplicate claim is rejected with `409 Conflict`.
- Claim against a returned item is rejected with `409 Conflict`.
- Non-reporter approval/rejection is rejected with `403 Forbidden`.
- Missing claim is rejected with `404 Not Found`.
- Invalid claim status is rejected with `400 Bad Request`.
- Approval changes the item to `Returned` and rejects remaining pending claims.
