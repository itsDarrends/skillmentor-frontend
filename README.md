# SkillMentor - Online Mentoring Platform

SkillMentor is a full-stack online mentoring platform that connects students with expert mentors for specialised subjects including AWS certifications, Microsoft Azure, DevOps, and more. Students can browse mentors, book one-on-one sessions, make payments, and track their learning progress through a personalised dashboard.

---

## Repositories

- **Frontend:** https://github.com/itsDarrends/skillmentor-frontend
- **Backend:** https://github.com/itsDarrends/skillmentor-backend

---

## Features

### Student Features
- Browse available mentors and their subjects
- View detailed mentor profiles with ratings and reviews
- Book one-on-one sessions with preferred date and time
- Upload bank transfer slip as payment proof
- View enrolled sessions in personal dashboard
- Track session status (pending, accepted, completed)
- Write reviews for completed sessions
- Double booking prevention

### Admin Features
- View platform statistics (mentors, students, subjects, sessions)
- Manage all bookings — confirm payments, mark sessions complete, add meeting links
- Create and manage mentors with full profile information
- Create and assign subjects to mentors
- Manage students
- Role-based access control via Clerk metadata

---

## Tech Stack

### Frontend
- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- shadcn/ui components
- React Router v7
- React Hook Form + Zod validation
- Clerk (authentication)

### Backend
- Spring Boot 3
- Spring Security
- Spring Data JPA / Hibernate
- PostgreSQL
- JWT validation via Clerk JWKS

### Infrastructure
- Frontend: Vercel
- Backend: Render
- Database: Supabase (PostgreSQL)
- Authentication: Clerk

---

## Getting Started (Local Development)

### Prerequisites
- Node.js 18+
- Java 17+
- Maven
- PostgreSQL

### Frontend Setup
```bash
# Clone the repository
git clone https://github.com/itsDarrends/skillmentor-frontend.git
cd skillmentor-frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Fill in the required environment variables (see below)

# Start development server
npm run dev
```

### Backend Setup
```bash
# Clone the repository
git clone https://github.com/itsDarrends/skillmentor-backend.git
cd skillmentor-backend

# Update application.properties with your local DB credentials

# Run the application
./mvnw spring-boot:run
```

---

## Environment Variables

### Frontend (.env)
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
VITE_API_BASE_URL=http://localhost:8081
```

### Backend (application.properties)
```
spring.datasource.url=jdbc:postgresql://localhost:5432/skill_mentor_v2
spring.datasource.username=postgres
spring.datasource.password=your_password
clerk.jwks.url=https://your-clerk-instance.clerk.accounts.dev
cors.allowed-origins=http://localhost:3001
```

---

## API Documentation

### Public Endpoints (No Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/mentors` | List all mentors with subjects |
| GET | `/api/v1/mentors/{id}` | Get mentor profile with reviews and enrollment counts |
| GET | `/api/public/health` | Health check |

### Student Endpoints (Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/sessions/enroll` | Create a new session booking |
| GET | `/api/v1/sessions/my-sessions` | Get student's enrolled sessions |
| PATCH | `/api/v1/sessions/{id}/review` | Submit a review for a completed session |
| POST | `/api/v1/students` | Create student profile |
| POST | `/api/v1/subjects` | Create a subject |

### Admin Endpoints (Admin Role Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/stats` | Get platform statistics |
| GET | `/api/v1/admin/sessions` | Get all sessions |
| PATCH | `/api/v1/admin/sessions/{id}/status` | Update session payment/status |
| PATCH | `/api/v1/admin/sessions/{id}/meeting-link` | Add meeting link to session |
| DELETE | `/api/v1/admin/sessions/{id}` | Delete a session |
| GET | `/api/v1/admin/mentors` | Get all mentors |
| PUT | `/api/v1/admin/mentors/{id}` | Update mentor |
| DELETE | `/api/v1/admin/mentors/{id}` | Delete mentor |
| GET | `/api/v1/admin/subjects` | Get all subjects |
| PUT | `/api/v1/admin/subjects/{id}` | Update subject |
| DELETE | `/api/v1/admin/subjects/{id}` | Delete subject |
| GET | `/api/v1/admin/students` | Get all students |
| DELETE | `/api/v1/admin/students/{id}` | Delete student |

---

## Deployed Links

- **Frontend:** https://skillmentor-frontend-alpha.vercel.app
- **Backend Swagger:** https://skillmentor-backend-enr2.onrender.com/swagger-ui/index.html

---

## Project Structure
```
skillmentor-frontend/
├── src/
│   ├── assets/              # Images and static files
│   ├── components/          # Reusable components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── Layout.tsx
│   │   ├── Navigation.tsx
│   │   ├── Footer.tsx
│   │   ├── MentorCard.tsx
│   │   ├── SchedulingModel.tsx
│   │   ├── SignUpDialog.tsx
│   │   └── StatusPill.tsx
│   ├── lib/
│   │   ├── api.ts           # API calls
│   │   └── utils.ts
│   ├── pages/
│   │   ├── admin/           # Admin pages
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── StatsPage.tsx
│   │   │   ├── ManageBookingsPage.tsx
│   │   │   ├── ManageMentorsPage.tsx
│   │   │   ├── ManageSubjectsPage.tsx
│   │   │   ├── ManageStudentsPage.tsx
│   │   │   ├── CreateMentorPage.tsx
│   │   │   └── CreateSubjectPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── MentorProfilePage.tsx
│   │   ├── PaymentPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── AboutPage.tsx
│   │   └── ResourcesPage.tsx
│   ├── types.ts             # TypeScript interfaces
│   ├── App.tsx              # Routes
│   └── main.tsx

skillmentor-backend/
├── src/main/java/com/stemlink/skillmentor/
│   ├── configs/             # Spring configurations
│   ├── constants/           # Enums and constants
│   ├── controllers/         # REST controllers
│   ├── dto/                 # Data transfer objects
│   ├── entities/            # JPA entities
│   ├── exceptions/          # Custom exceptions
│   ├── repositories/        # JPA repositories
│   ├── security/            # Auth filters and validators
│   ├── services/            # Business logic
│   └── utils/               # Utility classes
```

---

## Authentication Setup (Clerk)

1. Create a Clerk application at [clerk.com](https://clerk.com)
2. Create a JWT template named `skillmentor-auth` with these claims:
```json
{
  "email": "{{user.primary_email_address}}",
  "roles": "{{user.public_metadata.roles}}",
  "last_name": "{{user.last_name}}",
  "first_name": "{{user.first_name}}"
}
```
3. To create an admin user, set public metadata in Clerk dashboard:
```json
{
  "roles": ["ADMIN"]
}
```

---

## License

This project was built as part of a full-stack development assignment.