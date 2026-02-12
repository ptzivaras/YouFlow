# YouFlow
A Business Reservation & Scheduling Platform. The platform is designed to be easily adapted to different business domains (hospitality, services, operations), focusing on clean architecture and reusable logic.

Summary:
The application is a business-oriented booking and availability management platform, designed for small and medium-sized businesses that provide services with time slots (e.g. services, spaces, resources, groups).
Businesses can set availability, while customers can make reservations, manage them and see their status in real time.
The platform follows a production-style architecture, with a clean frontend / backend separation and REST API.

Technology:
(Full-Stack Web / Mobile Application)
architecture, APIs, DB access/design, validation, auth/security, error handling,integrations.
BackEnd: Node.js (Express ή NestJS), oxi Next eianai backend kai frotnend mazi.
1.Node.js was selected for the backend in order to implement a clean, standalone REST API, fully decoupled from the frontend. This approach allows better separation of concerns, easier testing, and clearer architecture compared to using framework-specific API routes. React was used exclusively for the frontend, consuming the API through HTTP requests.
Node.js is the run time so we can run js/ts but for the apis we need to add either Express or NestJS so which will we choose?
ExpressJS is flexible and lets you do things your way. NestJS, on the other hand, uses TypeScript and has a structured approach, making it easy to read and scale.
Lets try expressjs which is minimal web framework on top of node that lets us have easy routing/middleware/request-response handling.
Dialegw Node->Express->TS =Simple Clean RESTAPI
An thelw NestJS -> Boilerplate code enterprise.
The backend was implemented using Node.js with TypeScript and Express. TypeScript was chosen to improve code safety, maintainability, and clarity through static typing, while Express provided a lightweight and flexible framework to build a clean REST API.
package manager: NPM(experience, official default, compatibility)
ESLint + Prettier
Docker
Jest + Supertest
ESLint and Prettier were included to enforce consistent coding standards and improve maintainability. Docker was used to ensure a reproducible and deployment-ready environment. Basic automated tests were added where appropriate to validate core business logic.
ESM (ES Modules):The modern JavaScript standard

Users Roles:
1. Business Admin
- Δημιουργεί και διαχειρίζεται το business profile
- Ορίζει availability schedules
- Διαχειρίζεται κρατήσεις
- Ενημερώνει την κατάσταση κρατήσεων
- Έχει πλήρη πρόσβαση στο σύστημα

2. Customer (User)
- Δημιουργεί λογαριασμό
- Βλέπει διαθέσιμα slots
- Κάνει κράτηση
- Ακυρώνει ή τροποποιεί κράτηση
- Βλέπει το ιστορικό του
- Τροποποιεί κράτηση (reschedule σε νέο διαθέσιμο slot)


Entities:
- User
- Business
- Service / Resource
- Availability Slot
- Reservation
- Reservation Status:(pending, confirmed, cancelled, completed)

Frontend (Responsive):
- Login / Register
- Available Slots
- Reservation Details
- My Reservations
- Admin Management Page
- Dashboard
- Reservations Table (filters, pagination)
- Availability Management
- Clean component architecture(Component Based)
- State management (Context / Redux)
- API integration
- Reusable components
- Proper folder structure
- Clean UI logic separation

Backend:
- REST API
- Authentication (JWT)
- Role-based authorization
- CRUD operations για:
- Businesses
- Services / Resources
- Availability Slots
- Reservations
- Validation & error handling
- Clean architecture (controllers / services / repositories)
- Database (PostgreSQL/MongoDB)
- Docker

API Endpoints:
- POST /auth/register
- POST /auth/login
- GET /businesses
- POST /businesses
- POST /availability
- GET /availability
- POST /reservations
- PATCH /reservations/{id}/status
- DELETE /reservations/{id}
- GET /reservations?userId={id}&status=past
- PATCH /reservations/{id}
- PATCH /reservations/{id}/reschedule

Database Design:
-Unique constraint σε (slot_id) για αποφυγη διπλων bookings
-Transaction handling στο booking endpoint
-Clear status fields: AVAILABLE | BOOKED | CANCELLED | COMPLETED


Todo:
Server Side Rendering (SSR) with only Node.
loading & error states
Controlled forms με client-side validation
Separation:Calendar View, Booking Form,  Admin View
HTTP status codes
Disabled UI actions when needed (π.χ. booked slot)

Security
In production, we usually store the access token in memory and the refresh token in an HttpOnly cookie, to protect against XSS. For smaller or demo projects, localStorage can be acceptable with proper security notes.

## Layers
Business (YouFlow Spa)
  └── Service (Massage 60min)
       └── Availability Slot (Tomorrow 10:00-11:00)
            └── Reservation (Customer booking)


## Commands

### URLs
- Backend API: http://localhost:3000
- Frontend: http://localhost:5173

### How to Run Both Servers?

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### Important Notes
- Backend endpoints are prefixed with `/auth`, `/businesses`, etc.
  - Example: `POST http://localhost:3000/auth/register` (not `/register`)
  - Example: `POST http://localhost:3000/auth/login`
- Frontend automatically connects to backend via `VITE_API_URL` in `.env`
- Make sure PostgreSQL is running (`youflow_dev` database)


