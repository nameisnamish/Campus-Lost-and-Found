# Campus Lost & Found Management System

Phase 1 implementation for the full-stack development assignment. The application uses Node.js, Express, EJS, MongoDB, Mongoose, and dotenv.

## Setup

1. Install Node.js and MongoDB.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env`.
4. Set the MongoDB connection string in `.env`:

   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/campus_lost_found
   PORT=3000
   ```

5. Start the application:

   ```bash
   npm start
   ```

   Open `http://localhost:3000`.

## Phase 1 routes

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/` | Home page |
| GET | `/students/new` | Student profile form |
| POST | `/students` | Create a student profile |
| GET | `/students/:id` | Display one student profile |
| GET | `/lost-items/new` | Lost-item report form |
| POST | `/lost-items` | Create a lost-item report |
| GET | `/lost-items` | List lost items, with optional `?search=` filtering |
| GET | `/lost-items/:id` | Display one lost-item report |
| GET | `/found-items/new` | Found-item report form |
| POST | `/found-items` | Create a found-item report |
| GET | `/found-items` | List found items |
| GET | `/found-items/:id` | Display one found-item report |

## Database relationships

- A `Student` can report many `LostItem` documents through `LostItem.reportedBy`.
- A `Student` can report many `FoundItem` documents through `FoundItem.reportedBy`.
- MongoDB ObjectIds are used for relationships and dynamic routes. Student names are never used as identifiers.
- Found items start with `Available` status. Claim and return workflow will be implemented in Phase 2.

## Validation and error handling

- Required text fields reject empty and whitespace-only values.
- Student emails are normalized to lowercase, checked against an email pattern, and uniquely indexed by MongoDB.
- Contact numbers are validated.
- ObjectIds are checked before database queries.
- Missing records return an error page with an appropriate 404 response.
- Invalid form data returns the form with an error message.
- Database startup and query failures are reported rather than silently ignored.

## Phase 1 demonstration

1. Create a student profile and copy its generated Student ID.
2. Create a lost-item report using that student.
3. Open the dynamic lost-item list and detail page.
4. Search lost items by name, category, or location.
5. Create a found-item report using the same or another student.
6. Open the dynamic found-item list and detail page.
7. Test an invalid ID such as `/students/not-an-id` and a missing but valid-looking ID.

Phase 2 will add the `Claim` model, claim submission, ownership checks, approval/rejection, and returned-item rules.
