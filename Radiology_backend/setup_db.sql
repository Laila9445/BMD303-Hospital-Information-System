DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE rolname = 'radiology_user') THEN

      CREATE ROLE radiology_user WITH LOGIN PASSWORD 'strongpassword';
   END IF;
END
$do$;

CREATE DATABASE radiology_db OWNER radiology_user;

\c radiology_db

GRANT ALL PRIVILEGES ON SCHEMA public TO radiology_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO radiology_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO radiology_user;

-- Make it default for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO radiology_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO radiology_user;

-- Verify setup
SELECT 'Database setup completed successfully!' as status;
