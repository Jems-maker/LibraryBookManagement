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

**Target Users**:
- **Students/Members**: End-users who browse and borrow books.
- **Librarians/Admins**: Staff members who manage inventory, approve requests, and oversee library operations.

**Technology Stack**:
- **Backend**: Laravel 11.x, PHP 8.3+, Eloquent ORM
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS 4, React Router v7, React Query
- **Database**: MySQL 8.0+
- **Infrastructure**: AWS (EC2/S3) or DigitalOcean Droplets, GitHub Actions for CI/CD

---

## 2. Prerequisites

Before setting up the project, ensure your environment meets the following requirements:

- **PHP**: `^8.3`
- **Composer**: `v2.x`
- **Node.js**: `v20.x` or `v22.x`
- **NPM** or **Yarn**: `v10.x+`
- **Database**: MySQL 8.0+ 
- **Git**: For version control

---

## 3. Repository Setup

**Repository URL**: `[Insert Repository URL]`
**Branching Strategy**:
- `main`: Production-ready code.
- `develop`: Integration branch for upcoming releases.
- `feature/*`: New features (branched off `develop`).
- `hotfix/*`: Critical bug fixes (branched off `main`).

**Clone Instructions**:
```bash
git clone <repository_url>
cd LibrarySystem
```

**Folder Structure Overview**:
- `/app`: Laravel backend application logic (Controllers, Models, Middleware).
- `/database`: Migrations, Seeders, and Factories for the database.
- `/resources/react-app`: Frontend React application source code.
- `/routes`: API and Web route definitions (`api.php`, `web.php`).
- `/tests`: PHPUnit automated tests.
- `/public`: Publicly accessible files (compiled frontend assets).

---

## 4. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

**Required Environment Variables**:
| Variable | Description |
|---|---|
| `APP_NAME` | Name of the application (e.g., LibrarySystem) |
| `APP_ENV` | Environment (`local`, `staging`, `production`) |
| `APP_KEY` | Laravel application key (auto-generated) |
| `APP_DEBUG` | Enable/disable debug mode (`true` in dev, `false` in prod) |
| `APP_URL` | Base URL of the application |
| `DB_CONNECTION` | Database driver (`sqlite`, `mysql`, `pgsql`) |
| `VITE_APP_NAME` | App name exposed to Vite/React frontend |

**Secrets Management**: 
Do not commit the `.env` file to version control. In production, use your hosting platform's secrets manager (e.g., AWS Secrets Manager, GitHub Actions Secrets) to inject environment variables securely.

---

## 5. Local Development Setup

1. **Install PHP Dependencies**:
   ```bash
   composer install
   ```

2. **Generate Application Key**:
   ```bash
   php artisan key:generate
   ```

3. **Database Setup**:
   The default configuration uses SQLite. Create the database file if it doesn't exist:
   ```bash
   touch database/database.sqlite
   ```
   Run migrations and seed the database with initial data (e.g., admin user, sample books):
   ```bash
   php artisan migrate:fresh --seed
   ```

4. **Install Node Dependencies**:
   ```bash
   npm install
   ```

5. **Run the Application**:
   Start the Laravel backend, Vite development server, and queue worker simultaneously using the pre-configured npm script:
   ```bash
   npm run dev
   # Or using Laravel Artisan:
   # composer run dev
   ```
   *The application will be accessible at `http://localhost:8000` or the Vite port.*

**Common Startup Issues**:
- *Database errors*: Ensure `database.sqlite` exists and is writable if using SQLite, or verify DB credentials for MySQL.
- *Node version*: Ensure you are running Node v20+. Use NVM to switch versions if necessary.

---

## 6. Application Architecture

**Component Breakdown**:
- **Laravel Backend**: Acts purely as an API provider. Uses Sanctum for token-based API authentication.
- **React Frontend**: An SPA mounted on the root view. Communicates with Laravel via HTTP REST requests (Axios).
- **Service Layer**: Complex business logic (like borrowing rules and penalties) is handled in dedicated service classes or within customized controllers.

**Request Flow**:
1. User interacts with the React UI.
2. React components dispatch queries/mutations via React Query/Axios.
3. Requests hit Laravel `api.php` routes.
4. Middleware validates authentication (Sanctum) and authorization (Admin middleware).
5. Controllers process the request, interact with Eloquent Models, and return JSON responses.
6. React updates the UI based on the response.

**Design Decisions**:
- **Decoupled Monolith**: Frontend and Backend are in the same repo for ease of deployment, but logically separated via an API boundary.

---

## 7. Database Documentation

**Technology**: SQLite (Local), MySQL/PostgreSQL (Production).
**Key Tables & Relationships**:
- `users`: Core authentication table (Admins/Students).
- `student_profiles`: Extends user data (gender, IDs). Belongs to `users`.
- `books`: Inventory items. Belongs to `categories`, `authors`, `publishers`.
- `borrow_requests`: Tracks user requests to borrow a book. Belongs to `users` and `books`.
- `borrow_records`: Tracks the actual checkout and return dates. Belongs to `users` and `books`.
- `penalties` & `payments`: Tracks overdue fines and transactions.

**Migration & Seed Process**:
- Migrations are stored in `database/migrations/`.
- Seeders in `database/seeders/` provide baseline data (e.g., initial Admin account).
- Command to reset and seed: `php artisan migrate:fresh --seed`.

---

## 8. API Documentation

All API endpoints are prefixed with `/api`. Authentication is handled via Bearer Tokens.

### Authentication
- `POST /api/auth/login`: Authenticate and receive a token.
- `POST /api/auth/logout`: Invalidate the current token.
- `GET /api/auth/me`: Retrieve current authenticated user.

### Student Endpoints (Requires Auth)
- `GET /api/student/profile`: Get student profile.
- `GET /api/books`: Browse available books (public/student).
- `POST /api/student/borrow/{book}`: Submit a borrow request for a specific book.

### Admin Endpoints (Requires Admin Role)
- `GET /api/admin/stats`: Retrieve dashboard statistics.
- `GET /api/admin/borrow-requests`: List pending requests.
- `POST /api/admin/borrow-requests/{id}/approve`: Approve a request.
- `GET /api/admin/scanner`: Look up a book/user via QR data.

*(Refer to `routes/api.php` for the full, comprehensive list of endpoints.)*

---

## 9. Frontend Documentation

**Project Structure** (`resources/react-app`):
- `/components`: Reusable UI components (Buttons, Modals, Inputs).
- `/pages`: Route-level components (Dashboard, BookList, Login).
- `/layouts`: Application layouts (AdminSidebar, StudentNavbar).
- `/context` / `/api`: State management and Axios configurations.
- `/types`: TypeScript interfaces for models.

**State Management & Data Fetching**:
- Relies heavily on **React Query (@tanstack/react-query)** for server state synchronization and caching.
- Context API used for global auth state.

**Styling**: 
- **Tailwind CSS v4**. Custom configurations and theming are handled via utility classes to achieve a modern, responsive, and glassmorphic UI.

**Build Process**:
- Handled by Vite. `npm run build` compiles React assets into `/public/build` which Laravel serves.

---

## 10. Testing

**Unit & Feature Testing (Backend)**:
The application uses PHPUnit for backend testing.
```bash
php artisan test
# or
./vendor/bin/phpunit
```
- Tests are located in the `/tests` directory.
- `Tests\Feature`: Tests API endpoints, middleware, and request lifecycles.
- `Tests\Unit`: Tests specific functions and service classes.

**QA Checklist**:
- Ensure all tests pass before merging to `main`.
- Verify database migrations roll back cleanly (`php artisan migrate:rollback`).

---

## 11. Build Process

**Build Commands**:
- Local Development: `npm run dev`
- Production Build: `npm run build`

**Versioning Strategy**: Semantic Versioning (SemVer).
**Release Process**:
1. Feature branches merged into `develop`.
2. Cut a release branch, update version, build frontend assets.
3. Merge release into `main` and tag the version.

---

## 12. Deployment Guide

Currently, the application does not have an automated CI/CD pipeline (e.g., GitHub Actions or GitLab CI) configured. Deployment must be done manually.

### Manual Deployment Steps
To deploy to a standard web server (e.g., Ubuntu with Nginx/Apache):

1. **Clone/Pull Code**:
   ```bash
   git pull origin main
   ```
2. **Install Dependencies**:
   ```bash
   composer install --optimize-autoloader --no-dev
   npm install
   ```
3. **Build Frontend Assets**:
   ```bash
   npm run build
   ```
4. **Run Migrations**:
   *(Assuming the production database is already configured in `.env`)*
   ```bash
   php artisan migrate --force
   ```
5. **Optimize**:
   ```bash
   php artisan optimize
   ```

**Rollback Procedure**:
Revert to the previous commit, run `composer/npm install`, and rebuild. Rollback migrations if necessary (`php artisan migrate:rollback --step=1`).

---

## 13. Infrastructure

The current application is designed as a traditional monolithic structure containing both backend and frontend source files.

**Current Setup**:
- **Hosting**: Designed to run on a single Virtual Private Server (VPS) or standard web hosting that supports PHP 8.3+ and Node.js.
- **Web Server**: PHP built-in server (for local dev) or Nginx/Apache (for production).
- **Database**: Uses SQLite (`database/database.sqlite`) out of the box. No external database servers (like RDS) are configured by default, though they can be enabled via `.env`.
- **Storage**: Local file storage is used via Laravel's `local` or `public` disk. No external cloud storage (like AWS S3) is currently integrated.
- **Containerization**: There are currently no Dockerfiles or `docker-compose.yml` files in the repository.

---

## 14. Monitoring & Logging

- **Logging**: The application relies entirely on Laravel's default file-based logging mechanism. Logs are written to `storage/logs/laravel.log`.
- **Error Tracking**: No third-party error tracking services (like Sentry or Flare) are currently installed or configured.
- **Performance**: No APM (Application Performance Monitoring) tools or Laravel Telescope are currently installed.

---

## 15. Security

- **Authentication**: Laravel Sanctum provides token-based security protecting against CSRF (when used as SPA) and unauthorized access.
- **Authorization**: API endpoints are strictly protected by role-based middleware (`admin` vs `student`).
- **Data Protection**: User passwords are encrypted using bcrypt. 
- **Best Practices**: Always use HTTPS in production. Keep `.env` out of version control. Validate and sanitize all incoming API requests using Laravel Form Requests.

---

## 16. Maintenance

**Regular Tasks**:
- **Log Cleanup**: Regularly archive or clear `storage/logs`.
- **Dependency Updates**: Periodically run `composer update` and `npm update` to apply security patches.
- **Cache Optimization**: Run `php artisan optimize` after every deployment or configuration change.
- **Database**: Perform regular database backups (cron job recommended).

---

## 17. Troubleshooting

- **500 Internal Server Error**: Check `storage/logs/laravel.log`. Usually caused by missing `.env` variables or incorrect database credentials.
- **Vite Manifest Not Found**: Ensure you have run `npm run build` in production, or that `npm run dev` is running locally.
- **CORS Errors**: Verify the `CORS_ALLOWED_ORIGINS` or `config/cors.php` settings if the frontend is hosted on a different domain.
- **Migrations Failing**: Ensure the database engine supports the schema (e.g., MySQL vs SQLite constraints).

---

## 18. Known Limitations & Technical Debt

- **SQLite Limitations**: The local environment uses SQLite, which does not support all advanced foreign key operations or concurrent writes efficiently. Ensure migrations are tested on MySQL/PostgreSQL before deploying to production.
- **Caching Strategy**: The application currently relies on database/file caching. For high-scale operations, implementing Redis for caching and queue management is recommended.
- **Missing E2E Tests**: While PHPUnit handles backend features, comprehensive End-to-End testing (e.g., Cypress or Playwright) for the React frontend is currently lacking and should be implemented.

---

## 19. Ownership

- **Application Owner**: [Insert Owner/Department Name]
- **Development Team**: [Insert Dev Team Name/Email]
- **Support Contacts**: Support requests should be directed to `support@example.com` or escalated via the internal ticketing system.

---

## 20. References

- [Laravel Documentation](https://laravel.com/docs)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Axios Documentation](https://axios-http.com/)
- [Project Wiki / Jira Board](#) (Link to internal project management tools)
