# Multi-Tenancy Testing Guide

## Test Organizations

Three organizations have been created for testing:

1. **Acme Farm**
   - Email: `admin@acmefarm.com`
   - Password: `Admin@123!`

2. **Green Valley Farms**
   - Email: `admin@greenvalley.com`
   - Password: `Admin@123!`

3. **Sunrise Ranch**
   - Email: `admin@sunriseranch.com`
   - Password: `Admin@123!`

## Testing Data Isolation

### Step 1: Login as Acme Farm Admin

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@acmefarm.com","password":"Admin@123!"}'
```

Copy the `accessToken` from the response.

### Step 2: Create a Person for Acme Farm

```bash
curl -X POST http://localhost:3000/api/persons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACME_TOKEN" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@acmefarm.com",
    "roles": [{
      "type": "CLIENT",
      "data": {}
    }]
  }'
```

### Step 3: Get All Persons for Acme Farm

```bash
curl -X GET http://localhost:3000/api/persons \
  -H "Authorization: Bearer YOUR_ACME_TOKEN"
```

You should see John Doe.

### Step 4: Login as Green Valley Admin

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@greenvalley.com","password":"Admin@123!"}'
```

Copy the `accessToken` for Green Valley.

### Step 5: Get All Persons for Green Valley

```bash
curl -X GET http://localhost:3000/api/persons \
  -H "Authorization: Bearer YOUR_GREEN_VALLEY_TOKEN"
```

You should see **NO persons** - proving data isolation works!

### Step 6: Create a Person for Green Valley

```bash
curl -X POST http://localhost:3000/api/persons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_GREEN_VALLEY_TOKEN" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@greenvalley.com",
    "roles": [{
      "type": "SUPPLIER",
      "data": {
        "companyName": "Smith Supplies",
        "taxId": "12345678"
      }
    }]
  }'
```

### Step 7: Verify Cross-Tenant Access Is Blocked

Try to access John Doe's person ID (from Acme Farm) using Green Valley's token:

```bash
curl -X GET http://localhost:3000/api/persons/JOHN_DOE_ID \
  -H "Authorization: Bearer YOUR_GREEN_VALLEY_TOKEN"
```

You should get: **"Person not found"** - proving users cannot access other tenants' data!

## Database Verification

Connect to the database and verify tenant isolation:

```bash
docker exec -it protos-farm-db psql -U postgres -d protos-farm
```

```sql
-- View all organizations
SELECT id, name, slug FROM organizations;

-- View users and their tenants
SELECT u.email, o.name as organization 
FROM users u 
JOIN organizations o ON u.tenant_id = o.id;

-- View persons and their tenants
SELECT p.first_name, p.last_name, o.name as organization 
FROM persons p 
JOIN organizations o ON p.tenant_id = o.id;
```

## Security Verification Checklist

- [ ] Users from Org A cannot see persons from Org B
- [ ] Users from Org A cannot update persons from Org B
- [ ] Users from Org A cannot delete persons from Org B
- [ ] All queries include tenant_id in WHERE clauses
- [ ] JWT tokens contain correct tenantId
- [ ] Tenant context middleware extracts tenantId correctly
- [ ] All indexes on tenant_id columns are created

## Resetting Test Data

To start fresh:

```bash
cd server
docker-compose down -v
docker-compose up -d
sleep 15
docker-compose exec app npx tsx src/scripts/seedOrganizations.ts
```
