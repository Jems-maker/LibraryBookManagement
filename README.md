# Library Management System (LibrarySystem)

## 1. Project Overview

**Application Name**: LibrarySystem

**Purpose & Business Objective**: A comprehensive, digitalized library management platform designed to streamline book borrowing, inventory tracking, and student interactions. The system allows students to browse catalogs, manage their borrowing history, and request books, while providing administrators with a powerful dashboard to oversee operations, process requests, manage inventory, and enforce library policies.

**High-Level Architecture**: 
The application utilizes a decoupled architecture where the backend is a robust RESTful API built with Laravel, and the frontend is a responsive Single Page Application (SPA) built with React and Vite. They coexist in the same repository but operate independently in terms of logic and rendering.

**Main Features**:
- **Authentication & Authorization**: Secure login for students and administrators via Laravel Sanctum.
- **Book Management**: Full CRUD operations for books, categories, authors, and publishers.
- **Borrowing Workflow**: End-to-end borrowing process including requests, approvals, rejections, and returns.
- **QR Code Scanning**: Built-in scanner to quickly process book checkouts and returns.
- **Student Dashboard**: Profiles, borrowing history, active requests, and reward points.
- **Admin Dashboard**: Real-time statistics, notifications, and reporting capabilities.
- **Penalty & Rewards**: Automated penalty tracking for overdue books and a reward system for compliant students.
- **Automated Notifications**: Email reminders for due dates, overdue books, and status changes.
- **Reporting**: Export capabilities and comprehensive reports for library analytics.

**Target Users**:
- **Students/Members**: End-users who browse and borrow books.
- **Librarians/Admins**: Staff members who manage inventory, approve requests, and oversee library operations.

**Technology Stack**:
- **Backend**: Laravel 13.x, PHP 8.3+, Eloquent ORM, Laravel Sanctum
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS 4, React Router v7, React Query
- **Database**: MySQL 8.0+ / SQLite (local development)
- **Infrastructure**: AWS (EC2/S3) or DigitalOcean Droplets, GitHub Actions for CI/CD
- **Additional Libraries**: 
  - `barryvdh/laravel-dompdf` - PDF generation
  - `phpoffice/phpspreadsheet` - Excel/spreadsheet export
  - `simplesoftwareio/simple-qrcode` - QR code generation
  - `laravel/pail` - Log viewer

---

## 2. Prerequisites

Before setting up the project, ensure your environment meets the following requirements:

### Required Software and Versions
- **PHP**: `^8.3` with extensions: BCMath, Ctype, Fileinfo, JSON, Mbstring, OpenSSL, PDO, Tokenizer, XML, Curl, GD
- **Composer**: `v2.x`
- **Node.js**: `v20.x` or `v22.x`
- **NPM**: `v10.x+`
- **Database**: MySQL 8.0+ (or SQLite for local development)
- **Git**: For version control
- **Web Server**: Nginx or Apache (for production)

### Required Accounts and Access
- **GitHub/GitLab Access**: Repository clone permissions
- **Database Access**: MySQL credentials (production/staging) or SQLite file access (local)
- **Email Service**: SMTP credentials (for sending notifications) or use `log` driver for local testing
- **Cloud Storage**: AWS S3 or compatible service credentials (optional, for production file storage)

### Environment Requirements

**Client Operating System (End Users)**:
- **Windows**: Windows 10 or 11 (primary target for school computer labs and student devices).
- **macOS**: Any modern version.
- **Linux**: Supported but less common among end users.

**Development/Server Operating System**:
- **Linux**: Ubuntu 22.04+ (recommended for servers and development).
- **Windows**: Windows 10/11 with WSL2 or XAMPP.
- **macOS**: Any modern version.

**Hardware**:
- **Memory**: Minimum 2GB RAM (4GB+ recommended for development).
- **Disk Space**: At least 500MB free for dependencies and assets.

### Dependencies
- **PHP Dependencies**: Managed via Composer (`composer install`)
- **Node Dependencies**: Managed via NPM (`npm install`)
- **Queue Driver**: Redis (production), Database (local development fallback)

---

## 3. Repository Setup

**Repository URL**: `https://github.com/Jems-maker/LibraryBookManagement.git`

**Branching Strategy**:
- `main`: Production-ready code. Protected branch.
- `develop`: Integration branch for upcoming releases.
- `feature/*`: New features (branched off `develop`).
- `hotfix/*`: Critical bug fixes (branched off `main`).
- `release/*`: Release preparation branches.

**Clone Instructions**:
```bash
git clone https://github.com/Jems-maker/LibraryBookManagement.git
cd LibraryBookManagement
```

**Folder Structure Overview**:
```
LibraryBookManagement/
├── app/                      # Laravel application core
│   ├── Console/              # Artisan commands (scheduled tasks)
│   ├── Http/                 # Controllers, Middleware, Requests
│   │   ├── Controllers/      # Web and API controllers
│   │   ├── Middleware/        # HTTP middleware
│   │   └── Resources/        # API Resources
│   ├── Mail/                 # Email classes (Mailable)
│   ├── Models/               # Eloquent ORM models
│   ├── Providers/            # Service providers
│   └── View/                 # Blade components
├── bootstrap/                # Application bootstrap files
├── config/                   # Configuration files
├── database/                 # Database-related files
│   ├── migrations/           # Database migration files
│   ├── seeders/              # Database seeders
│   └── factories/            # Model factories (for testing)
├── docs/                     # Additional documentation
├── public/                   # Publicly accessible files
│   └── build/                # Compiled frontend assets (Vite)
├── resources/                # Raw assets and views
│   ├── react-app/            # React frontend application
│   │   ├── api/              # Axios service functions
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # React Context providers
│   │   ├── layouts/          # Layout components
│   │   ├── pages/            # Page-level components
│   │   └── types/            # TypeScript type definitions
│   └── views/                # Blade templates
├── routes/                   # Route definitions
│   ├── api.php               # API routes
│   ├── web.php               # Web routes
│   └── console.php           # Console commands
├── storage/                  # Application storage
│   ├── app/                  # Private storage
│   ├── framework/            # Framework cache
│   └── logs/                 # Application logs
├── tests/                    # Automated tests
├── .env.example              # Example environment file
├── composer.json             # PHP dependencies
├── package.json              # Node dependencies
├── vite.config.ts            # Vite configuration
└── artisan                   # Laravel CLI
```

**Important Directories**:
- `/app/Http/Controllers/Api`: All REST API controllers (student, admin, auth).
- `/resources/react-app`: Complete React frontend source code.
- `/database/migrations`: Version-controlled database schema changes.
- `/routes/api.php`: Central API route registry.
- `/config`: Application configuration (database, mail, cache, etc.).

---

## 4. Environment Configuration

### Required Environment Variables

| Variable | Description | Default Value | Required |
|----------|-------------|---------------|----------|
| `APP_NAME` | Application name | `LibrarySystem` | Yes |
| `APP_ENV` | Environment (`local`, `staging`, `production`) | `local` | Yes |
| `APP_KEY` | Laravel application key (auto-generated) | - | Yes |
| `APP_DEBUG` | Enable/disable debug mode | `true` (dev), `false` (prod) | Yes |
| `APP_URL` | Base URL of the application | `http://localhost` | Yes |
| `APP_LOCALE` | Application locale | `en` | No |
| `APP_MAINTENANCE_DRIVER` | Maintenance mode driver | `file` | No |
| `BCRYPT_ROUNDS` | Bcrypt hashing rounds | `12` | No |
| `LOG_CHANNEL` | Default log channel | `stack` | No |
| `LOG_LEVEL` | Log level (`debug`, `info`, `warning`, `error`) | `debug` | No |
| `DB_CONNECTION` | Database driver (`sqlite`, `mysql`) | `sqlite` | Yes |
| `DB_HOST` | MySQL host | `127.0.0.1` | Conditional |
| `DB_PORT` | MySQL port | `3306` | Conditional |
| `DB_DATABASE` | Database name | `laravel` | Conditional |
| `DB_USERNAME` | Database username | `root` | Conditional |
| `DB_PASSWORD` | Database password | - | Conditional |
| `SESSION_DRIVER` | Session storage driver | `database` | No |
| `SESSION_LIFETIME` | Session lifetime in minutes | `120` | No |
| `BROADCAST_CONNECTION` | Broadcasting driver | `log` | No |
| `FILESYSTEM_DISK` | Default filesystem disk | `local` | No |
| `QUEUE_CONNECTION` | Queue driver (`database`, `redis`, `sync`) | `database` | No |
| `CACHE_STORE` | Cache driver | `database` | No |
| `CACHE_PREFIX` | Cache key prefix | - | No |
| `REDIS_CLIENT` | Redis client | `phpredis` | No |
| `REDIS_HOST` | Redis host | `127.0.0.1` | Conditional |
| `REDIS_PASSWORD` | Redis password | `null` | Conditional |
| `REDIS_PORT` | Redis port | `6379` | Conditional |
| `MAIL_MAILER` | Mail driver (`log`, `smtp`, `mailgun`, etc.) | `log` | Yes |
| `MAIL_HOST` | SMTP host | `127.0.0.1` | Conditional |
| `MAIL_PORT` | SMTP port | `2525` | Conditional |
| `MAIL_USERNAME` | SMTP username | `null` | Conditional |
| `MAIL_PASSWORD` | SMTP password | `null` | Conditional |
| `MAIL_FROM_ADDRESS` | Sender email address | `hello@example.com` | Yes |
| `MAIL_FROM_NAME` | Sender name | `${APP_NAME}` | Yes |
| `AWS_ACCESS_KEY_ID` | AWS access key | - | No |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | - | No |
| `AWS_DEFAULT_REGION` | AWS region | `us-east-1` | No |
| `AWS_BUCKET` | S3 bucket name | - | No |
| `AWS_USE_PATH_STYLE_ENDPOINT` | Use path-style S3 URLs | `false` | No |
| `VITE_APP_NAME` | Frontend app name | `${APP_NAME}` | Yes |

### Sample .env.example
See the `.env.example` file in the repository root for a complete template.

### Secrets Management Process

- **Local Development**: Use `.env` file (excluded from git).
- **Production/Staging**:
  - **Option 1 (Hosting Platform)**: Use environment variable injection via hosting control panel (e.g., cPanel, Plesk, Forge, Ploi).
  - **Option 2 (CI/CD)**: Store secrets in GitHub Actions Secrets or GitLab CI Variables and inject during deployment.
  - **Option 3 (Docker)**: Pass environment variables via Docker Compose or orchestration secrets.
- **Rotation**: Rotate `APP_KEY`, database credentials, and API keys periodically.
- **Access Control**: Limit `.env` access to authorized personnel only. Never commit secrets to version control.

---

## 5. Local Development Setup

### Installation Steps

1. **Clone the repository** (see Section 3 for instructions).
2. **Install PHP Dependencies**:
   ```bash
   composer install
   ```
3. **Generate Application Key**:
   ```bash
   php artisan key:generate
   ```
4. **Configure Environment**:
   ```bash
   cp .env.example .env
   php artisan config:clear
   ```
   Edit `.env` to set database credentials and app URL.

5. **Database Setup**:
   - **SQLite (default)**:
     ```bash
     touch database/database.sqlite
     ```
   - **MySQL**:
     Create a database and update `.env` with credentials.

6. **Install Node Dependencies**:
   ```bash
   npm install
   ```

7. **Run Migrations and Seeders**:
   ```bash
   php artisan migrate:fresh --seed
   ```
   This creates all tables and seeds initial data (admin user, sample student, settings).

8. **Create Storage Link** (for public file access):
   ```bash
   php artisan storage:link
   ```
   *Note: This is typically not needed for local development but may be required for profile pictures or uploaded files.*

### Running the Application

Start the full development stack with one command:
```bash
composer run dev
# or
npm run dev
```

This starts:
- Laravel backend server on `http://localhost:8000`
- Vite dev server (frontend) on `http://localhost:5173`
- Queue worker (`php artisan queue:listen`)
- Pail log viewer (`php artisan pail`)

**Alternative: Start services individually**:
```bash
# Terminal 1: Laravel server
php artisan serve

# Terminal 2: Queue worker
php artisan queue:listen --tries=1 --timeout=0

# Terminal 3: Vite dev server
npm run dev
```

### Running Background Services

- **Queue Worker**: `php artisan queue:work --daemon` or `php artisan queue:listen`
- **Scheduled Commands**: `php artisan schedule:work` (runs every minute to execute scheduled tasks)
- **Log Viewer**: `php artisan pail` (real-time log monitoring)

### Running Scheduled Jobs/Workers

The application includes three scheduled Artisan commands (defined in `routes/console.php`):

| Command | Frequency | Description |
|---------|-----------|-------------|
| `library:send-reminders` | Every minute | Sends email reminders for due/overdue books. |
| `app:auto-expire-claims` | Every minute | Auto-expires unclaimed borrow requests after deadline. |
| `app:sync-book-copies` | Hourly | Synchronizes book copy counts with borrow records. |

**To execute a command manually**:
```bash
php artisan library:send-reminders
php artisan app:auto-expire-claims
php artisan app:sync-book-copies
```

### Common Startup Issues

- **Database errors**: Ensure `database/database.sqlite` exists and is writable if using SQLite, or verify DB credentials for MySQL.
- **Node version**: Ensure you are running Node v20+. Use NVM to switch versions if necessary.
- **Port already in use**: Stop processes using ports 8000 (Laravel) or 5173 (Vite).
- **Permission denied**: Ensure `storage/` and `bootstrap/cache/` are writable:
  ```bash
  chmod -R 775 storage bootstrap/cache
  ```
- **APP_KEY missing**: Run `php artisan key:generate`.
- **Composer memory limit**: Increase PHP memory limit or run `COMPOSER_MEMORY_LIMIT=-1 composer install`.

---

## 6. Application Architecture

### System Architecture Diagram

```
┌─────────────────┐    HTTP/REST API     ┌──────────────────┐
│  React Frontend │ ────────────────────▶ │  Laravel Backend │
│   (SPA)         │ ◀──────────────────── │   (API Server)   │
└─────────────────┘   JSON Responses     └──────────────────┘
        │                                       │
        │                                       │
        ▼                                       ▼
┌─────────────────┐                    ┌─────────────────┐
│  Browser        │                    │  Database       │
│  (Vite Build)   │                    │  (MySQL/SQLite) │
└─────────────────┘                    └─────────────────┘
```

### Component/Module Breakdown

#### Backend (Laravel)
- **Controllers (`app/Http/Controllers`)**:
  - `Api/`: API controllers for student and admin operations.
  - `Admin/`: Traditional web controllers for admin panel (if used).
  - `Student/`: Student-specific controllers.
- **Models (`app/Models`)**: Eloquent ORM models representing database tables.
- **Middleware (`app/Http/Middleware`)**: Authentication (`auth:sanctum`), admin role check (`admin`).
- **Mail (`app/Mail`)**: Mailable classes for notifications.
- **Console (`app/Console/Commands`)**: Scheduled artisan commands.
- **Providers (`app/Providers`)**: Service providers for bootstrapping.

#### Frontend (React)
- **Components (`resources/react-app/components`)**: Reusable UI elements (modals, buttons, inputs).
- **Pages (`resources/react-app/pages`)**: Route-level components organized by role (`admin`, `student`, `auth`).
- **Layouts (`resources/react-app/layouts`)**: Admin and student layout wrappers.
- **API Services (`resources/react-app/api`)**: Axios instances and endpoint functions (`auth.ts`, `books.ts`, `admin.ts`, `student.ts`).
- **Context (`resources/react-app/context`)**: AuthContext for global auth state.
- **Types (`resources/react-app/types`)**: TypeScript interfaces.

### Request Flow

1. User interacts with the React UI.
2. React components dispatch queries/mutations via React Query or Axios.
3. Requests hit Laravel `api.php` routes (RESTful endpoints).
4. Middleware validates authentication (Sanctum) and authorization (admin middleware).
5. Controllers process the request, interact with Eloquent Models, and return JSON responses.
6. React updates the UI based on the response or React Query cache.

### Authentication Flow

1. **Student Login**: `POST /api/auth/login` (email/username + password).
2. **Admin Login**: `POST /api/auth/admin-login` (email + password).
3. Laravel Sanctum generates a personal access token.
4. Token is stored in React (Context/AuthContext) and sent as `Bearer` token in subsequent requests.
5. Protected routes use `auth:sanctum` middleware.
6. Admin routes additionally use `admin` middleware to verify role.

### Authorization Model

- **Roles**: `student` (default), `admin`.
- **Middleware**: `IsAdmin` checks `user->role === 'admin'`.
- **Route Protection**:
  - `auth:sanctum`: Requires valid token.
  - `admin`: Requires admin role.
- **Model-Level**: Gates/Policies can be defined if needed (currently using middleware).

### Service Integrations

- **Email**: Laravel Mail (SMTP, Mailgun, Log driver).
- **Queue**: Database queue (default) or Redis.
- **PDF Generation**: Dompdf for certificates/receipts.
- **Spreadsheets**: PhpSpreadsheet for reporting exports.
- **QR Codes**: `simplesoftwareio/simple-qrcode` for book labels and scanner data.

### Third-Party APIs

- **Axios**: HTTP client for frontend.
- **React Query**: Server state management and caching.
- **Laravel Sanctum**: Token-based authentication.
- **Tailwind CSS**: Utility-first CSS framework.

### Design Decisions

- **Decoupled Monolith**: Frontend and backend in same repo for ease of deployment, logically separated via REST API.
- **SQLite for Local**: Simplified local development; production uses MySQL.
- **Database Queue**: Avoids external dependencies like Redis for development.
- **SPA Architecture**: React mounted on a single Blade view (`resources/views/spa.blade.php`).
- **Service Container**: Laravel's IoC container for dependency injection.

---

## 7. Database Documentation

### Database Technology

- **Local Development**: SQLite (`database/database.sqlite`).
- **Production**: MySQL 8.0+ (or PostgreSQL).
- **Migrations**: Version-controlled schema changes in `database/migrations/`.
- **Seeders**: Initial data population in `database/seeders/`.

### ERD (Entity Relationship Diagram)

**Key Tables and Relationships**:

```
users (id, name, email, username, role, password)
    ├── student_profiles (user_id FK) - One-to-One
    ├── borrow_requests (user_id FK) - One-to-Many
    ├── borrow_records (user_id FK) - One-to-Many
    ├── penalties (user_id FK) - One-to-Many
    ├── reward_points (user_id FK) - One-to-Many
    └── settings (key/value pairs - global)

books (id, title, isbn, quantity, ...)
    ├── categories (category_id FK) - Many-to-One
    ├── authors (author_id FK) - Many-to-One
    ├── publishers (publisher_id FK) - Many-to-One
    ├── borrow_requests (book_id FK) - One-to-Many
    └── borrow_records (book_id FK) - One-to-Many

courses (id, name, code, ...)
    └── student_profiles (course_id FK) - One-to-Many

borrow_requests (id, user_id FK, book_id FK, status, ...)
    └── borrow_records (borrow_request_id FK) - One-to-One

borrow_records (id, user_id FK, book_id FK, borrow_request_id FK, status, due_date, return_date, ...)
```

**Core Tables**:
- `users`: Admins and students.
- `student_profiles`: Extended student data (gender, course, year).
- `books`: Book inventory.
- `categories`, `authors`, `publishers`: Reference data.
- `courses`: Academic courses.
- `borrow_requests`: Borrow requests (pending, approved, rejected).
- `borrow_records`: Active borrows and history.
- `penalties`: Fine tracking for overdue books.
- `reward_points`: Student reward system.
- `settings`: Key-value configuration.

### Migration Process

- **Run all pending migrations**:
  ```bash
  php artisan migrate
  ```
- **Fresh migration with seeding** (development only):
  ```bash
  php artisan migrate:fresh --seed
  ```
- **Rollback last batch**:
  ```bash
  php artisan migrate:rollback --step=1
  ```
- **Check migration status**:
  ```bash
  php artisan migrate:status
  ```

### Seed Process

- **Run all seeders**:
  ```bash
  php artisan db:seed
  ```
- **Fresh migration + seed** (resets DB):
  ```bash
  php artisan migrate:fresh --seed
  ```

**Seeders**:
- `DatabaseSeeder`: Seeds admin user, sample student, and default settings.
- Custom seeders can be added for bulk book data or test scenarios.

### Backup and Restore Procedures

**MySQL Backup**:
```bash
# Using mysqldump
mysqldump -u [username] -p [database_name] > backup.sql

# Using Laravel
php artisan db:dump
```

**Restore**:
```bash
mysql -u [username] -p [database_name] < backup.sql
```

**SQLite Backup**:
```bash
cp database/database.sqlite database/database.sqlite.backup
```

**Automated Backups**: Set up cron jobs for regular backups (see Maintenance section).

### Important Tables and Relationships

- **users ↔ student_profiles**: 1:1 relationship (student details).
- **books ↔ categories**: N:1 (each book belongs to one category).
- **books ↔ authors**: N:1.
- **books ↔ publishers**: N:1.
- **users ↔ borrow_requests**: 1:N (a user can have many requests).
- **books ↔ borrow_requests**: 1:N.
- **borrow_requests ↔ borrow_records**: 1:1 (when approved, a record is created).
- **users ↔ borrow_records**: 1:N.
- **users ↔ penalties**: 1:N.

---

## 8. API Documentation

Base URL: `/api` (e.g., `http://localhost/api/...`)

Authentication: Bearer Token (Laravel Sanctum). Include `Authorization: Bearer {token}` header.

### Authentication Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | No | Student login (email/username + password). Returns token. |
| POST | `/auth/admin-login` | No | Admin login (email + password). Returns token. |
| POST | `/auth/register` | No | Student registration. |
| POST | `/auth/forgot-password` | No | Request password reset link. |
| GET | `/auth/me` | Yes (Sanctum) | Get current authenticated user. |
| POST | `/auth/logout` | Yes (Sanctum) | Invalidate current token. |

### Student Endpoints (Authenticated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/student/profile` | Get student profile. |
| PATCH | `/student/profile` | Update student profile. |
| PATCH | `/student/profile/gender` | Update gender preference. |
| POST | `/student/borrow/{bookId}` | Submit borrow request for a book. |
| GET | `/student/borrowed-books` | List active borrowed books. |
| GET | `/student/history` | Borrowing history. |
| GET | `/student/requests` | List borrow requests (pending, approved, rejected). |

### Books (Public/Student)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/books` | Browse books (paginated, searchable). |
| GET | `/books/categories` | Get all categories. |
| GET | `/books/suggestions` | Get book suggestions/trending. |
| GET | `/books/{bookId}` | Get book details. |

### Admin Endpoints (Authenticated + Admin Role)

#### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/stats` | Dashboard statistics (total books, requests, etc.). |
| GET | `/admin/notifications` | Admin notifications list. |

#### Books CRUD
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/books` | List all books (paginated). |
| POST | `/admin/books` | Create a new book. |
| GET | `/admin/books/{book}` | Get book details. |
| PUT/PATCH | `/admin/books/{book}` | Update book. |
| DELETE | `/admin/books/{book}` | Delete book. |

#### Categories, Authors, Publishers CRUD
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/admin/categories` | List/Create categories. |
| GET/PUT/PATCH/DELETE | `/admin/categories/{id}` | Category operations. |
| (Similar for `/admin/authors` and `/admin/publishers`) | | |

#### Students & Courses CRUD
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/admin/students` | List/Create students. |
| GET/PUT/PATCH/DELETE | `/admin/students/{id}` | Student operations. |
| GET/POST | `/admin/courses` | List/Create courses. |
| GET/PUT/PATCH/DELETE | `/admin/courses/{id}` | Course operations. |

#### Borrow Requests
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/borrow-requests` | List pending/all requests. |
| POST | `/admin/borrow-requests/{id}/approve` | Approve a request. |
| POST | `/admin/borrow-requests/{id}/reject` | Reject a request. |

#### Borrow Records
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/borrow-records` | List borrow records (with filters). |

#### Scanner
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/scanner` | Look up book/user by QR code data. |
| POST | `/admin/scanner/process` | Process checkout/return via scanner. |

#### Awards
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/awards` | List awards/certificates. |
| GET | `/admin/awards/{student}/certificate/download` | Download certificate PDF. |

#### Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/settings` | Get all settings. |
| POST | `/admin/settings` | Update settings (key-value pairs). |

#### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/reports` | Generate reports (borrowing stats, penalties, etc.). Possibly returns Excel/PDF. |

### Request/Response Examples

**Student Login Request**:
```json
POST /api/auth/login
{
  "student_id": "STU-2026-001",
  "password": "password"
}
```

*Note: The API request field is named `email`, but it intelligently accepts either the student's Student ID (primary) or email address as the value.*

**Admin Login Request**:
```json
POST /api/auth/admin-login
{
  "username": "admin",
  "password": "adminpass123"
}
```

**Login Response**:
```json
{
  "user": { ... },
  "token": "1|xxxxxxxxxxxx",
  "token_type": "Bearer"
}
```

**Error Response**:
```json
{
  "message": "Invalid credentials",
  "errors": {
    "email": ["The provided credentials are incorrect."]
  }
}
```

### Postman Collection / OpenAPI

- **Postman Collection**: Not currently included in the repository.
- **Swagger/OpenAPI**: Not currently configured.
- *Recommendation*: Generate OpenAPI spec using tools like `scribante/laravel-openapi` or `darkaonline/l5-swagger` for future documentation.

---

## 9. Frontend Documentation

### Project Structure

```
resources/react-app/
├── api/                 # Axios instances and API methods
│   ├── auth.ts          # Auth endpoints (login, register, logout)
│   ├── admin.ts         # Admin API methods
│   ├── student.ts       # Student API methods
│   ├── books.ts         # Book-related API calls
│   └── client.ts        # Axios instance with interceptors
├── components/          # Reusable components
│   ├── ConfirmModal.tsx
│   ├── BookDetailModal.tsx
│   ├── Navbar.tsx
│   ├── ProtectedRoute.tsx
│   └── SearchableSelect.tsx
├── context/             # React Context
│   └── AuthContext.tsx  # Auth state provider
├── layouts/             # Layout components
│   ├── AdminLayout.tsx
│   └── (StudentLayout implied)
├── pages/               # Route components
│   ├── admin/           # Admin pages
│   │   ├── Dashboard.tsx
│   │   ├── Books.tsx
│   │   ├── Students.tsx
│   │   ├── BorrowRequests.tsx (Requests.tsx)
│   │   ├── Categories.tsx
│   │   ├── Authors.tsx
│   │   ├── Publishers.tsx
│   │   ├── Scanner.tsx
│   │   ├── Reports.tsx
│   │   ├── Settings.tsx
│   │   ├── Awards.tsx
│   │   └── ...
│   ├── student/         # Student pages
│   │   ├── Dashboard.tsx
│   │   ├── BorrowedBooks.tsx
│   │   ├── Requests.tsx
│   │   └── ...
│   └── auth/
│       └── Login.tsx
├── utils/               # Utility functions
│   └── format.ts
├── types/               # TypeScript definitions
│   └── index.ts
├── App.tsx              # Main app component with routing
├── main.tsx             # Entry point
└── vite-env.d.ts
```

### Routing

- **Student Routes**:
  - `/login` - Login page.
  - `/dashboard` - Student dashboard.
  - `/books` - Browse books.
  - `/borrowed-books` - Active borrows.
  - `/requests` - Borrow request history.
- **Admin Routes**:
  - `/admin/dashboard` - Admin dashboard.
  - `/admin/books` - Book management.
  - `/admin/students` - Student management.
  - `/admin/borrow-requests` - Request approvals.
  - `/admin/scanner` - QR scanner.
  - `/admin/settings` - Settings.
- **Protected Routes**: `ProtectedRoute` component checks auth and role before rendering.

### State Management

- **Server State**: React Query (`@tanstack/react-query`) handles API data fetching, caching, and background updates.
- **Client State**: React Context (`AuthContext`) for authentication state (user, token).
- **Local State**: Component-level `useState` for forms, modals, UI toggles.

### UI Libraries & Styling

- **Styling**: Tailwind CSS v4 with custom config in `tailwind.config.js`.
- **UI Components**: Custom components; no external UI library (e.g., Material UI).
- **Icons**: Heroicons (SVG), used via inline SVGs.
- **Theme**: Modern, responsive, glassmorphic design.

### Build Process

- **Dev**: `npm run dev` — Vite dev server with HMR.
- **Build**: `npm run build` — Compiles React to `/public/build`.
- **Preview**: `npm run preview` — Preview production build locally.

---

## 10. Testing

### Test Commands

- **Run all tests**:
  ```bash
  php artisan test
  # or
  ./vendor/bin/phpunit
  ```
- **Run specific test**:
  ```bash
  php artisan test --filter=UserTest
  ```
- **With coverage** (requires Xdebug or PCOV):
  ```bash
  php artisan test --coverage
  ```

### Test Structure

- `tests/Feature`: API endpoint tests, authentication, request lifecycle.
- `tests/Unit`: Individual classes, service logic, model behavior.

### Coverage Requirements

- Minimum 80% code coverage for critical paths (auth, borrow workflow).
- CI should enforce coverage thresholds (recommended: add to `phpunit.xml`).

### Mock Data

- **Factories**: Located in `database/factories/`.
- **Seeders**: `DatabaseSeeder` provides baseline data.
- **Faker**: Used for generating test data.

### QA Checklist

- [ ] All PHPUnit tests pass locally and in CI.
- [ ] Database migrations roll back cleanly: `php artisan migrate:rollback`.
- [ ] API endpoints return correct HTTP status codes.
- [ ] Frontend passes TypeScript type checking (`npm run build` with `tsc`).
- [ ] Manual testing of critical user flows:
  - Student registration and login.
  - Book browsing and borrow request.
  - Admin approval/rejection flow.
  - QR scanner functionality.
  - Email notifications received.

---

## 11. Build Process

### Build Commands

- **Frontend Development**: `npm run dev` (Vite HMR).
- **Frontend Production Build**: `npm run build`.
  - Compiles TypeScript, bundles assets, generates manifest.
  - Outputs to `/public/build`.
- **Full Project Setup**: `composer run setup` (installs deps, builds assets).

### Environment-Specific Builds

- **Local**: `npm run dev` with Vite dev server; `APP_DEBUG=true`.
- **Staging**: `npm run build` with `APP_ENV=staging`.
- **Production**: `npm run build` with `APP_ENV=production`, `APP_DEBUG=false`, optimized autoloader.

### Versioning Strategy

- **Semantic Versioning**: `MAJOR.MINOR.PATCH` (e.g., `1.2.3`).
  - MAJOR: Breaking changes.
  - MINOR: New features, backward compatible.
  - PATCH: Bug fixes.
- **Git Tags**: Tag releases in `main` branch (e.g., `v1.2.3`).
- **Changelog**: Maintain `CHANGELOG.md` or use GitHub Releases.

### Release Process

1. **Feature Development**:
   - Branch from `develop`.
   - Implement feature with tests.
   - Open PR to `develop`. CI runs tests.
2. **Release Prep**:
   - Create `release/x.y.z` branch from `develop`.
   - Update version numbers (`composer.json`, `package.json`, `CHANGELOG.md`).
   - Final testing and bug fixes.
3. **Merge & Tag**:
   - Merge `release` into `main`.
   - Tag commit: `git tag -a v1.2.3 -m "Release 1.2.3"`.
   - Push tags: `git push origin main --tags`.
4. **Deploy**: Trigger deployment (see Section 12).

---

## 12. Deployment Guide

### Environments

- **Development**: Local machine (SQLite, debug on).
- **Staging**: Mirror of production (MySQL, external services). Used for QA.
- **Production**: Live environment serving end users.

### Prerequisites

- **Server**: Ubuntu 22.04+ with Nginx/Apache.
- **PHP**: 8.3+ with required extensions.
- **Composer**: v2.x.
- **Node.js**: v20+ (for building assets).
- **Database**: MySQL 8.0+.
- **SSL**: Valid TLS certificate (Let's Encrypt or purchased).
- **Domain**: DNS pointing to server IP.

### Infrastructure Overview

- **Compute**: VPS (DigitalOcean, AWS EC2, Linode) or shared hosting with SSH.
- **Web Server**: Nginx recommended (config in `deploy/nginx.conf`).
- **Database**: MySQL on same server or managed (RDS, Cloud SQL).
- **File Storage**: Local disk (ensure sufficient space) or S3.

### CI/CD Pipeline

- **GitHub Actions** (configured at `.github/workflows/ci.yml`):
  - **On push to `main` or `develop`**:
    1. Run PHPUnit tests with Xdebug coverage (minimum 80% required for critical paths).
    2. Run Composer security audit.
    3. Run Laravel Pint (code style check).
    4. Run TypeScript type check (`tsc --noEmit`).
    5. Build frontend assets.
    6. Upload coverage reports to Codecov.
  - **On PR**: Same checks as above (tests, linting, types).
  - **On tag push (v*)**: Same checks + automatic deployment to production.
  - **Deploy job**: Runs only on `main` branch push after tests pass.
    - Deploys to AWS Lightsail via SSH.
    - Runs migrations, caches config/routes/views.
    - Restarts Supervisor services.
    - Requires secrets: `LIGHTSAIL_HOST`, `LIGHTSAIL_USERNAME`, `LIGHTSAIL_SSH_KEY`, `LIGHTSAIL_PORT`.

**Coverage Requirements**:
- Minimum 80% code coverage for critical paths (auth, borrow workflow).
- Enforced via CI; coverage reports uploaded to Codecov.

**Setup GitHub Secrets**:
1. Go to repository Settings → Secrets and variables → Actions.
2. Add secrets:
   - `LIGHTSAIL_HOST` - IP address or domain of Lightsail instance
   - `LIGHTSAIL_USERNAME` - SSH username (e.g., `ubuntu`, `ec2-user`)
   - `LIGHTSAIL_SSH_KEY` - Private SSH key for deployment
   - `LIGHTSAIL_PORT` - SSH port (default 22)

### Manual Deployment Steps

1. **Pull Latest Code**:
   ```bash
   cd /var/www/librarysystem
   git pull origin main
   ```
2. **Install PHP Dependencies**:
   ```bash
   composer install --optimize-autoloader --no-dev
   ```
3. **Install Node Dependencies & Build**:
   ```bash
   npm install
   npm run build
   ```
4. **Run Migrations**:
   ```bash
   php artisan migrate --force
   ```
5. **Clear and Optimize Caches**:
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   php artisan optimize
   ```
6. **Set Permissions**:
   ```bash
   sudo chown -R www-data:www-data storage bootstrap/cache
   ```
7. **Restart Queue Workers** (if using Supervisor):
   ```bash
   sudo supervisorctl restart all
   ```

### Automated Deployment Process

- **Laravel Envoy**: Define deployment script for zero-downtime deployment.
- **GitHub Actions**: Automate steps above via workflow.
- **Forge**: One-click deployments with queue workers and cron.

### Deployment Validation

After deployment, verify:
- [ ] Application loads at production URL.
- [ ] HTTPS works correctly (no mixed content).
- [ ] Login works (student and admin).
- [ ] API endpoints return valid responses.
- [ ] Emails are sent (check logs or mailbox).
- [ ] Scheduled commands are running (check `storage/logs/laravel.log` for reminders).
- [ ] Assets are loaded (Vite manifest present).

### Rollback Procedure

1. **Git Revert**:
   ```bash
   git revert HEAD
   git push origin main
   # or checkout previous tag
   git checkout v1.2.2
   ```
2. **Reinstall Dependencies**:
   ```bash
   composer install --optimize-autoloader --no-dev
   npm install && npm run build
   ```
3. **Rollback Migrations** (if needed):
   ```bash
   php artisan migrate:rollback --step=1
   ```
4. **Clear Caches**:
   ```bash
   php artisan optimize:clear
   ```

### Smoke Testing Checklist

After each deployment:
- [ ] Homepage loads.
- [ ] Can log in as student and admin.
- [ ] Can browse books.
- [ ] Admin can see dashboard stats.
- [ ] Can create a borrow request (student).
- [ ] Can approve request (admin).
- [ ] Email notifications triggered.
- [ ] No errors in `storage/logs/laravel.log`.

---

## 13. Infrastructure

### Hosting Platform

- **Development**: Local machine (Windows/macOS/Linux).
- **Production**: AWS Lightsail (managed VPS with simplified deployment).
- **Managed**: Laravel Forge, Ploi, or Cloudways for easier management.

### Cloud Resources

- **AWS S3**: For storing book cover images, receipts, and QR codes.
- **AWS RDS**: Managed MySQL database (primary production database).
- **AWS ElastiCache/Redis**: For caching, queue, and sessions (required for production).

### Docker Setup

Docker is configured for local development and production consistency.

**Services**:
- `app` - PHP-FPM 8.3 application container
- `nginx` - Nginx web server (ports 80/443)
- `mysql` - MySQL 8.0 database (port 3306)
- `redis` - Redis 7 for cache, queue, sessions (port 6379)

**Quick Start**:
```bash
# Start all services
docker-compose up -d

# Install dependencies and setup
docker-compose exec app composer install
docker-compose exec app php artisan key:generate
docker-compose exec app php artisan migrate --seed

# Access application
http://localhost
```

**Docker Files**:
- `Dockerfile` - Multi-stage build (Node.js for assets, PHP-FPM for app)
- `docker-compose.yml` - Service orchestration
- `docker/nginx.conf` - Nginx configuration
- `docker/supervisord.conf` - Process manager (nginx, php-fpm, queue worker, scheduler)
- `docker/php.ini` - PHP settings (Redis sessions, OPcache)
- `.dockerignore` - Excludes unnecessary files

**Environment Configuration**:
Copy `docker/.env.example` to `.env` and update credentials.
Default Docker network: `library-network` (bridge).

**Production Deployment**:
Build production image:
```bash
docker-compose build --no-cache
docker-compose up -d --scale app=2  # Scale app containers
```

**Volumes**:
- `mysql_data` - Persistent MySQL storage
- `redis_data` - Persistent Redis storage
- `./` - Application code mounted to `/var/www/html`

**Management**:
```bash
docker-compose ps              # List running services
docker-compose logs -f app     # View application logs
docker-compose exec app bash   # Shell into app container
docker-compose restart nginx   # Restart specific service
docker-compose down             # Stop all services
```

### Kubernetes

- **Not currently used**. For large-scale deployments with auto-scaling, Kubernetes could be adopted.

### Load Balancer

- **Single server**: Nginx reverse proxy or application server.
- **Multi-server**: AWS ALB, Nginx load balancer with multiple app servers.

### CDN

**AWS CloudFront + S3** (recommended for production):
1. Create S3 bucket for static assets (e.g., `librarysystem-assets`)
2. Upload `/public/build` contents to S3
3. Create CloudFront distribution with S3 origin
4. Set TTL to 1 week for static assets
5. Update `.env`: `FILESYSTEM_DISK=s3` and `AWS_*` credentials

**Cloudflare** (alternative):
1. Point domain nameservers to Cloudflare
2. Enable CDN for static assets
3. Enable caching rules for `/build/*` assets
4. Enable HTTP/3 and Brotli compression

**Configuration in Laravel**:
```php
// config/filesystems.php
's3' => [
    'driver' => 's3',
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION'),
    'bucket' => env('AWS_BUCKET'),
    'url' => env('AWS_URL'),
    'endpoint' => env('AWS_ENDPOINT'),
],
```

**Build Asset Deployment**:
```bash
# Sync build assets to S3
aws s3 sync public/build s3://librarysystem-assets/build --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/build/*"
```

### Storage

- **Local**: `storage/app/public` for user-uploaded files.
- **Cloud**: Configure `FILESYSTEM_DISK=s3` and set AWS credentials in `.env`.

### Networking Overview

- **Local**: `localhost:8000` (Laravel), `localhost:5173` (Vite).
- **Public**: Port 80/443 via Nginx.
- **Firewall**: SSH (22), HTTP (80), HTTPS (443).

---

## 14. Monitoring & Logging

### Logging Solution

- **Laravel Default**: File-based logging in `storage/logs/laravel.log`.
- **Log Levels**: `debug`, `info`, `warning`, `error`, `critical`.
- **Configuration**: `config/logging.php`.
- **Pail**: `php artisan pail` for real-time log tailing with color highlighting.

### Monitoring Dashboards

- **No built-in dashboards**.
- *Recommendation*: Implement Laravel Telescope for development monitoring (not recommended for production due to performance).

### Error Tracking

- **Sentry**: Integrated for production error tracking and performance monitoring.
  - Configure DSN in `.env`: `SENTRY_DSN=your_dsn_here`
  - Enable/disable with `SENTRY_ENABLED=true/false`
  - Tracks exceptions, performance traces, and profiling data
  - Configuration file: `config/sentry.php`
- **Alternative**: Bugsnag can be integrated similarly if preferred.

### Health Checks

- **Manual**: Visit `/up` endpoint (Laravel health check) if configured.
- **Database**: Monitor connection pool and slow queries.
- **Queue**: Monitor queue worker status and job failures.

### Alerts

- **Not configured**. Set up alerts for:
  - High error rates.
  - Queue backlog.
  - Disk space usage.
  - Database downtime.

### Performance Monitoring

- **Laravel Pulse**: Installed for application performance monitoring (requires Laravel 11+).
  - Enable with `PULSE_ENABLED=true` in `.env`
  - Access Pulse dashboard at `/pulse` (admin only)
  - Monitors: slow jobs, long-running requests, memory usage, database queries, cache hits/misses
  - Configuration: `config/pulse.php`
  - Storage: Redis (production), Database (fallback)
  - *Note*: Pulse is installed via Composer in the `require` section.
- **Alternative**: New Relic, Datadog for enterprise APM needs.

---

## 15. Security

### Authentication

- **Laravel Sanctum**: Token-based authentication.
- **Password Hashing**: Bcrypt (default rounds: 12).
- **Session**: Encrypted cookies for web guard (if used).
- **SPA Mode**: Sanctum's SPA authentication uses encrypted cookies with CSRF protection.

### Authorization

- **Role-Based Access Control**: `admin` middleware restricts admin routes.
- **Model Policies**: Not currently implemented; authorization is route/role-based.
- **Middleware Chain**: `auth:sanctum` → `admin` for admin routes.

### Secret Management

- **`.env` File**: Never commit. Rotate keys regularly.
- **APP_KEY**: Used for encryption (cookies, sessions). Keep secure.
- **Sanctum Tokens**: Personal access tokens stored hashed. Can be revoked.

### Security Best Practices

- **HTTPS**: Always use HTTPS in production.
- **Input Validation**: Laravel Form Requests validate all incoming data.
- **CSRF Protection**: Enabled for web routes; Sanctum handles SPA CSRF.
- **XSS Protection**: Blade escaping, React auto-escapes JSX.
- **SQL Injection**: Eloquent ORM uses PDO parameter binding.
- **Rate Limiting**: Apply via middleware if needed (not currently configured).
- **CORS**: Configure in `config/cors.php` if frontend on different domain.

### SSL/TLS Configuration

**Let's Encrypt with Certbot (AWS Lightsail)**:
```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d library.yourschool.edu

# Auto-renewal (certbot sets up cron job automatically)
sudo certbot renew --dry-run
```

**Nginx SSL Configuration**:
```nginx
server {
    listen 443 ssl http2;
    server_name library.yourschool.edu;

    ssl_certificate /etc/letsencrypt/live/library.yourschool.edu/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/library.yourschool.edu/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Rest of config...
}
```

**Forge/Envoyer**: Auto-configure SSL.

**HSTS**: Enable for strict HTTPS (included above).

### Data Protection Considerations

- **Passwords**: Bcrypt hashing, never logged.
- **PII**: Student data (emails, IDs) stored securely.
- **Backups**: Encrypted at rest (if using managed DBs, they often provide encryption).
- **GDPR/Privacy**: Data retention policies (implement if required).

---

## 16. Maintenance

### Regular Maintenance Tasks

| Task | Frequency | Command/Action |
|------|-----------|----------------|
| **Cache Clear** | After deployment/config change | `php artisan optimize:clear` |
| **Config Cache** | After deployment | `php artisan config:cache` |
| **Route Cache** | After deployment | `php artisan route:cache` |
| **View Cache** | After deployment | `php artisan view:cache` |
| **Log Rotation** | Daily/Weekly | `logrotate` or manual cleanup of `storage/logs` |
| **Database Backup** | Daily | Cron job (mysqldump or `php artisan db:dump`) |
| **Dependency Updates** | Monthly/Quarterly | `composer update --no-dev`, `npm update` |
| **Security Patches** | As needed | Keep Laravel, PHP, Node updated |

### Dependency Updates

- **Composer**:
  ```bash
  composer update --no-dev
  composer update laravel/framework --with-dependencies
  ```
- **NPM**:
  ```bash
  npm update
  npm audit fix
  ```
- **Test Updates**: Run `php artisan test` after updates.

### Database Maintenance

- **Optimize Tables**:
  ```sql
  OPTIMIZE TABLE borrow_records, borrow_requests, books;
  ```
- **Purge Old Logs**: Archive and delete logs older than 30 days.
- **Clean Soft Deletes** (if used): `php artisan model:prune`.

### Scheduled Jobs

Ensure cron is running on the server:
```bash
* * * * * cd /path/to/project && php artisan schedule:run >> /dev/null 2>&1
```

Monitor scheduled command logs for failures.

### Cleanup Procedures

- **Old Borrow Records**: Archive completed records older than X years.
- **Expired Tokens**: Laravel Sanctum auto-expires tokens; prune if needed.
- **Temporary Files**: Clean up PDF/Excel exports older than 7 days.

---

## 17. Troubleshooting

### Startup Failures

- **500 Internal Server Error**: Check `storage/logs/laravel.log`. Usually `.env` missing or DB credentials wrong.
- **Class Not Found**: Run `composer dump-autoload`.
- **Permission Denied**: Ensure `storage/` and `bootstrap/cache/` are writable.
- **SQLite Database Locked**: Close all connections; ensure only one process writing.

### Build Failures

- **Vite Manifest Not Found**: Run `npm run build` or ensure `npm run dev` is running.
- **Node Sass/PostCSS Errors**: Delete `node_modules` and `package-lock.json`, then `npm install`.
- **TypeScript Errors**: Fix type issues or update types.

### Deployment Issues

- **Storage Permissions**: `sudo chown -R www-data:www-data storage`.
- **Cron Not Running**: Verify cron entry and user permissions.
- **Queue Workers Not Processing**: Restart Supervisor, check `.env` queue connection.

### Database Connection Problems

- **SQLite**: Ensure `database/database.sqlite` exists and is writable.
- **MySQL**: Verify credentials in `.env`, ensure user has privileges.
- **Too Many Connections**: Increase `max_connections` or use persistent connections wisely.

### Authentication Issues

- **Token Expired**: Re-login; tokens are long-lived but can be revoked.
- **CORS Errors**: Check `config/cors.php` if frontend hosted separately.
- **CSRF Token Mismatch**: Ensure `X-XSRF-TOKEN` header is sent (Laravel Sanctum handles this).

### API Failures

- **401 Unauthorized**: Token missing or invalid.
- **403 Forbidden**: User lacks admin role.
- **404 Not Found**: Check endpoint URL and route existence.
- **422 Validation Error**: Request data failed validation; check `errors` field.
- **429 Too Many Requests**: Rate limiting applied; wait or adjust limits.
- **500 Server Error**: Check Laravel logs for exceptions.

### Recommended Solutions

- Always check logs first: `storage/logs/laravel.log` or `php artisan pail`.
- Enable debug mode temporarily (`APP_DEBUG=true`) to get detailed errors.
- Use Postman/Insomnia to test API endpoints in isolation.
- Clear all caches if behavior is stale: `php artisan optimize:clear`.

---

## 18. Known Limitations & Technical Debt

### Existing Technical Debt

- **Missing E2E Tests**: No end-to-end tests for frontend (e.g., Cypress, Playwright).
- **No OpenAPI Spec**: API documentation is manual, not auto-generated.
- **Hardcoded Settings**: Some settings (like penalty amounts) are in seeder, not admin UI (though `SettingApiController` exists).
- **No Docker**: Containerization not implemented; local environment setup can be inconsistent.
- **SQLite in Production Not Tested**: Migrations are tested on SQLite locally; ensure MySQL compatibility.

### Known Bugs

- **QR Scanner Edge Cases**: Might fail if QR data format is unexpected (handled in `ScannerApiController`).
- **Concurrent Borrow Requests**: SQLite may have locking issues under concurrent writes (use MySQL in production).

### Pending Improvements

- **Redis Integration**: Replace database cache/queue with Redis for performance.
- **Full-Text Search**: Implement search for books (Algolia, Meilisearch, or MySQL fulltext).
- **Two-Factor Authentication**: Add 2FA for admin accounts.
- **PDF Receipts**: Enhance receipt generation (already have Dompdf).
- **Mobile App**: React Native companion app.
- **Advanced Reporting**: More granular reports (charts, trends).

### Future Enhancements

- **Reservation System**: Allow students to reserve books that are currently borrowed.
- **Barcode/ISBN Scanning**: Use device camera to scan ISBN barcodes.
- **Multi-Branch Support**: Support multiple library branches.
- **Integration with Library Standards**: Support MARC, Z39.50.
- **AI Recommendations**: Suggest books based on borrowing history.
- **Waitlist Notifications**: Notify students when reserved books become available.

---

## 19. Ownership

- **Application Owner**: [Insert Department/Institution Name]
- **Development Team**: [Insert Team Name/Email]
- **Support Contacts**: `support@librarysystem.com` or internal ticketing system.
- **Escalation Process**:
  1. Tier 1: Frontline support handles login and UI issues.
  2. Tier 2: Development team investigates bugs.
  3. Tier 3: System administrator or DevOps for infrastructure.

---

## 20. References

### Design Documents
- [Project Requirements Document](#) (link to internal document)
- [UI/UX Mockups](#) (Figma/Sketch link)
- [Database ER Diagram](#) (Lucidchart/draw.io)

### API References
- [Laravel Sanctum Documentation](https://laravel.com/docs/sanctum)
- [Laravel Eloquent](https://laravel.com/docs/eloquent)
- [React Query Documentation](https://tanstack.com/query/latest)

### Architecture Diagrams
- [System Architecture](#) (diagram image or Mermaid)
- [Database ERD](#) (diagram image)

### External Documentation

- [Laravel 13 Documentation](https://laravel.com/docs/13.x)
- [React 19 Documentation](https://react.dev/)
- [Vite 6 Documentation](https://vitejs.dev/)
- [Tailwind CSS 4 Documentation](https://tailwindcss.com/)
- [Axios Documentation](https://axios-http.com/)
- [Laravel Pint](https://laravel.com/docs/pint) - Code style fixer.
- [Laravel Pail](https://github.com/laravel/pail) - Log viewer.

### Related Repositories
- [LibrarySystem Frontend](#) (if separated in future)
- [Mobile App](#) (if applicable)

---

## Quick Reference Card

### Key Routes

| Environment | URL | Login (Student) | Login (Admin) |
|-------------|-----|-----------------|---------------|
| Local | `http://localhost:8000` | admin@library.com / password | admin@library.com / adminpass123 |
| Production | `https://library.yourschool.edu` | Student credentials | Admin credentials |

### Composer Scripts

```bash
composer install          # Install dependencies
composer run dev          # Start full dev environment
composer run setup        # Complete setup (install, key, migrate, build)
composer run test         # Run PHPUnit tests
```

### NPM Scripts

```bash
npm install               # Install Node dependencies
npm run dev               # Start Vite dev server
npm run build             # Production build
npm run preview           # Preview production build
```

### Artisan Commands

```bash
php artisan serve                         # Start server
php artisan migrate                       # Run migrations
php artisan migrate:fresh --seed         # Reset DB
php artisan optimize                      # Cache configs/routes
php artisan queue:work                    # Process queue
php artisan schedule:work                 # Run scheduled tasks
php artisan pail                          # Tail logs
php artisan library:send-reminders        # Manual reminder cron
php artisan app:auto-expire-claims        # Manual claim expiry
```

### Database Credentials (Local Dev)

- **SQLite**: `database/database.sqlite`
- **MySQL** (if configured in `.env`)
- **Seed Users**:
  - Admin: `admin@library.com` / `adminpass123`
  - Student: `student@library.com` / `password`

---

*Document Version: 1.0. Last Updated: 2026-07-18*