# Database Migration Guide

## Issue: "Username or email already exists" Error

If you're getting "Username or email already exists" errors when trying to register, but your database is empty or doesn't have that user, follow these steps:

### Root Cause

The application requires an `email_hash` column in the `users` table for login functionality. If this column is missing, the application will fail. Additionally, the registration logic was recently fixed to properly check for existing users.

### Solution

#### Option 1: Fresh Database Setup (Recommended)

If you're starting fresh and don't have any important data in your database:

1. **Drop the existing users table** (if it exists):
   ```sql
   DROP TABLE IF EXISTS users CASCADE;
   ```

2. **Run the full initialization script** (`server/db/init_db.sql`):
   ```bash
   # Connect to your AWS RDS database
   psql -h mtg-brewer-db.cz4omm2icfob.us-east-2.rds.amazonaws.com -U postgres -d mtg_brewer -f server/db/init_db.sql
   ```
   
   Or run it directly in pgAdmin:
   - Open pgAdmin
   - Connect to your database
   - Open Query Tool
   - Copy and paste the contents of `server/db/init_db.sql`
   - Execute

#### Option 2: Add Missing Column to Existing Table

If you have an existing users table without the `email_hash` column:

1. **Run the migration script**:
   ```bash
   psql -h mtg-brewer-db.cz4omm2icfob.us-east-2.rds.amazonaws.com -U postgres -d mtg_brewer -f server/db/migrations/001_add_email_hash_column.sql
   ```
   
   Or run it in pgAdmin:
   - Open pgAdmin
   - Connect to your database
   - Open Query Tool
   - Copy and paste the contents of `server/db/migrations/001_add_email_hash_column.sql`
   - Execute

2. **Restart your server**:
   ```bash
   cd server
   npm start
   ```

### Verification

After running the migration, verify the column exists:

```sql
-- Check if email_hash column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'email_hash';
```

You should see:
```
 column_name |          data_type          | is_nullable
-------------+-----------------------------+-------------
 email_hash  | character varying(64)       | NO
```

### Testing Registration

After the migration, try registering a new user:

1. Start your server: `cd server && npm start`
2. Start your client: `cd client && npm run dev`
3. Go to the registration page
4. Fill in the form with:
   - Username: testuser
   - Email: test@example.com
   - Password: Test1234 (must meet password requirements)
5. Click "Register"

If successful, you should be redirected to the decks page.

### Common Issues

#### Issue: "column 'email_hash' does not exist"

**Solution**: Run the migration script as described above.

#### Issue: "Username or email already exists" (when database is empty)

**Possible causes**:
1. The `email_hash` column is missing (run migration)
2. There's actually existing data in the database you didn't see
3. The database connection is pointing to a different database

**Debug steps**:
```sql
-- Check if there are any users in the database
SELECT id, username, created_at FROM users;

-- Check if the email_hash column exists
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'email_hash';
```

#### Issue: Database connection errors

**Solution**: Verify your `.env` file has the correct database credentials:
```
PGUSER=postgres
PGPASSWORD=your_password
PGHOST=mtg-brewer-db.cz4omm2icfob.us-east-2.rds.amazonaws.com
PGPORT=5432
PGDATABASE=mtg_brewer
```

### AWS RDS Connection

To connect to your AWS RDS instance from your local machine:

1. **Using psql**:
   ```bash
   psql -h mtg-brewer-db.cz4omm2icfob.us-east-2.rds.amazonaws.com -U postgres -d mtg_brewer
   ```

2. **Using pgAdmin**:
   - Create a new server connection
   - Host: `mtg-brewer-db.cz4omm2icfob.us-east-2.rds.amazonaws.com`
   - Port: `5432`
   - Username: `postgres`
   - Password: (from your .env file)

3. **Security Group**: Make sure your AWS RDS security group allows inbound connections from your IP address on port 5432.

### Need Help?

If you're still having issues:

1. Check the server logs: `server/logs/combined.log` and `server/logs/error.log`
2. Verify your database connection
3. Ensure the migration was successful
4. Restart the server after any database changes