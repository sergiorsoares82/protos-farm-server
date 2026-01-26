# Authentication System - DDD Implementation

## Overview

This is a production-ready authentication system built using **Domain-Driven Design (DDD)** and **Clean Architecture** principles with TypeScript, Express, PostgreSQL, and TypeORM.

## Architecture

The system follows Clean Architecture with four distinct layers:

### 1. Domain Layer (`src/domain/`)
**Pure business logic with zero external dependencies**

- **Entities**: `User` - Aggregate root with business rules
- **Value Objects**: 
  - `Email` - Validates email format
  - `Password` - Handles hashing and password strength validation
- **Repository Interface**: `IUserRepository` - Data access contract

### 2. Application Layer (`src/application/`)
**Use cases and application services**

- **Use Cases**:
  - `LoginUseCase` - Handles authentication flow
  - `RefreshTokenUseCase` - Refreshes access tokens
- **Services**: `JWTService` - Token generation and validation
- **DTOs**: Request/Response contracts

### 3. Infrastructure Layer (`src/infrastructure/`)
**External concerns and implementations**

- **TypeORM Configuration**: Database connection management
- **Entities**: `UserEntity` - Database schema
- **Repositories**: `UserRepository` - IUserRepository implementation

### 4. Presentation Layer (`src/presentation/`)
**HTTP interface**

- **Controllers**: `AuthController` - Request/response handling
- **Routes**: Auth route definitions
- **Middleware**:
  - Validation (Zod schemas)
  - Rate limiting (brute-force protection)

## Features

✅ **JWT Authentication** (Access + Refresh tokens)  
✅ **Password Hashing** (bcrypt)  
✅ **Input Validation** (Zod schemas)  
✅ **Rate Limiting** (5 login attempts per 15 min)  
✅ **Domain-Driven Design** (Entities, Value Objects, Repositories)  
✅ **Clean Architecture** (Layer separation, dependency inversion)  
✅ **TypeScript** (Full type safety)  
✅ **PostgreSQL** (Relational database)  
✅ **TypeORM** (ORM with auto-migrations)

## API Endpoints

### POST `/api/auth/login`
Authenticate user and receive JWT tokens.

**Request:**
```json
{
  "email": "test@example.com",
  "password": "Test1234!"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "test@example.com"
  }
}
```

**Error (401):**
```json
{
  "error": "Unauthorized",
  "message": "Invalid email or password",
  "statusCode": 401
}
```

### POST `/api/auth/refresh`
Refresh access token using refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

## Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (!@#$%^&*(),.?":{}|<>)

## Running the Server

### Development
```bash
npm run dev
```

The server runs on `http://localhost:3000`

### Production
```bash
npm run build
npm start
```

## Environment Variables

Required in `.env/.env`:

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=protos-farm
DB_HOST=localhost
DB_PORT=5430

# JWT Secrets (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
JWT_ACCESS_SECRET=your-secret-here
JWT_REFRESH_SECRET=your-secret-here
```

## Testing

### Create Test User
```bash
npx tsx scripts/create-test-user.ts
```

### Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Test1234!"}'
```

### Test Refresh
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "YOUR_REFRESH_TOKEN"}'
```

## Security Features

1. **Password Hashing**: bcrypt with 10 salt rounds
2. **JWT Tokens**: 
   - Access Token: 15 minutes expiry
   - Refresh Token: 7 days expiry
3. **Rate Limiting**: 
   - Login: 5 attempts per 15 minutes
   - Refresh: 20 attempts per 15 minutes
4. **Input Validation**: Zod schemas validate all inputs
5. **Email Uniqueness**: Database constraint prevents duplicates

## DDD Principles Applied

### 1. Ubiquitous Language
- Consistent terminology across all layers
- Domain concepts (User, Email, Password) map to business language

### 2. Entities vs Value Objects
- **Entity**: `User` (has identity, mutable)
- **Value Objects**: `Email`, `Password` (immutable, validated)

### 3. Aggregates
- `User` is the aggregate root
- Enforces invariants and business rules

### 4. Repository Pattern
- `IUserRepository` interface in domain
- `UserRepository` implementation in infrastructure
- Domain depends on abstraction, not implementation

### 5. Dependency Inversion
- Use cases depend on interfaces
- Infrastructure implements interfaces
- Domain has zero dependencies

### 6. Separation of Concerns
- Each layer has a single responsibility
- Clear boundaries between layers
- One-way dependencies (domain ← application ← infrastructure/presentation)

## Database Schema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## Project Structure

```
src/
├── domain/                       # Business logic (no dependencies)
│   ├── entities/
│   │   └── User.ts              # User aggregate
│   ├── value-objects/
│   │   ├── Email.ts             # Email validation
│   │   └── Password.ts          # Password hashing
│   └── repositories/
│       └── IUserRepository.ts    # Repository contract
├── application/                  # Use cases
│   ├── use-cases/
│   │   ├── LoginUseCase.ts
│   │   └── RefreshTokenUseCase.ts
│   ├── services/
│   │   └── JWTService.ts
│   └── dtos/
│       └── AuthDTOs.ts
├── infrastructure/               # External implementations
│   ├── database/
│   │   ├── typeorm.config.ts
│   │   └── entities/
│   │       └── UserEntity.ts
│   └── repositories/
│       └── UserRepository.ts
├── presentation/                 # HTTP layer
│   ├── controllers/
│   │   └── AuthController.ts
│   ├── middleware/
│   │   ├── validation.ts
│   │   └── rateLimiter.ts
│   └── routes/
│       └── auth.routes.ts
└── server.ts                     # Application entry
```

## Benefits of This Architecture

### Testability
Each layer can be tested independently with mocks/stubs.

### Maintainability
Clear responsibilities make changes easier and safer.

### Scalability
Easy to add new features (use cases) without affecting existing code.

### Framework Independence
Core business logic (domain) doesn't depend on Express, TypeORM, or any framework.

### Type Safety
Full TypeScript coverage with strict mode enabled.

## Next Steps

Potential extensions:
- Email verification
- Password reset flow
- OAuth2 integration
- Role-based access control (RBAC)
- Two-factor authentication (2FA)
- Account lockout after failed attempts
- Audit logging
