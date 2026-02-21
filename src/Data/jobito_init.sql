CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

CREATE SCHEMA IF NOT EXISTS ptj;
SET search_path = ptj, public;


CREATE TABLE users (
  user_id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name     VARCHAR(255) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  phone         VARCHAR(50),
  role          VARCHAR(50) DEFAULT 'student',
  skills        JSONB,
  experience    INT DEFAULT 0,
  latitude      NUMERIC(10,7),
  longitude     NUMERIC(10,7),
  location      geography(Point,4326),
  service_radius_km INT DEFAULT 10,
  is_phone_verified BOOLEAN DEFAULT FALSE,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_skills_gin ON users USING GIN (skills);
CREATE INDEX idx_users_location_gist ON users USING GIST(location);

CREATE OR REPLACE FUNCTION ptj.users_location_trigger()
RETURNS trigger AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_location
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION ptj.users_location_trigger();

CREATE TABLE companies (
  company_id      BIGSERIAL PRIMARY KEY,
  name            VARCHAR(255) NOT NULL,
  description     TEXT,
  address         TEXT,
  contact_email   VARCHAR(255),
  phone           VARCHAR(50),
  cr_document_url TEXT,
  verification_status VARCHAR(50) DEFAULT 'PENDING',
  rejection_reason TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE categories (
  category_id  BIGSERIAL PRIMARY KEY,
  name         VARCHAR(150) UNIQUE NOT NULL,
  description  TEXT
);

CREATE TYPE ptj_job_type AS ENUM ('part-time','one-time','event','freelance','internship');

CREATE TABLE jobs (
  job_id        BIGSERIAL PRIMARY KEY,
  company_id    BIGINT REFERENCES companies(company_id) ON DELETE CASCADE,
  category_id   BIGINT REFERENCES categories(category_id) ON DELETE SET NULL,
  title         VARCHAR(255) NOT NULL,
  description   TEXT,
  salary        NUMERIC(10,2),
  address       TEXT,
  latitude      NUMERIC(10,7),
  longitude     NUMERIC(10,7),
  location      geography(Point,4326),
  job_type      ptj_job_type DEFAULT 'part-time',
  slots_available INT DEFAULT 1,
  price_type    VARCHAR(50) DEFAULT 'fixed',
  is_negotiable BOOLEAN DEFAULT FALSE,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  tsv           tsvector
);

CREATE FUNCTION ptj.jobs_location_trigger() RETURNS trigger AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_jobs_location
BEFORE INSERT OR UPDATE ON jobs
FOR EACH ROW EXECUTE FUNCTION ptj.jobs_location_trigger();

-- Full-text search trigger
CREATE OR REPLACE FUNCTION ptj.jobs_tsv_trigger()
RETURNS trigger AS $$
BEGIN
  NEW.tsv :=
    setweight(
      to_tsvector('english', unaccent(coalesce(NEW.title, ''))) ||
      to_tsvector('arabic', unaccent(coalesce(NEW.title, ''))),
    'A')
    ||
    setweight(
      to_tsvector('english', unaccent(coalesce(NEW.description, ''))) ||
      to_tsvector('arabic', unaccent(coalesce(NEW.description, ''))),
    'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_jobs_tsv
BEFORE INSERT OR UPDATE ON jobs
FOR EACH ROW EXECUTE FUNCTION ptj.jobs_tsv_trigger();

CREATE INDEX idx_jobs_location_gist ON jobs USING GIST(location);
CREATE INDEX idx_jobs_tsv_gin ON jobs USING GIN (tsv);
CREATE INDEX idx_jobs_title_trgm ON jobs USING GIN (title gin_trgm_ops);


CREATE TABLE applications (
  application_id BIGSERIAL PRIMARY KEY,
  job_id         BIGINT REFERENCES jobs(job_id) ON DELETE CASCADE,
  user_id        UUID REFERENCES users(user_id) ON DELETE CASCADE,
  status         VARCHAR(50) DEFAULT 'applied',
  applied_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE (job_id, user_id)
);


CREATE TABLE ratings (
  rating_id    BIGSERIAL PRIMARY KEY,
  user_id      UUID REFERENCES users(user_id) ON DELETE CASCADE,
  company_id   BIGINT REFERENCES companies(company_id) ON DELETE CASCADE,
  rating_value SMALLINT CHECK (rating_value BETWEEN 1 AND 5),
  comment      TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);


CREATE TABLE work_groups (
  group_id     BIGSERIAL PRIMARY KEY,
  name         VARCHAR(255) NOT NULL,
  description  TEXT,
  created_by   UUID REFERENCES users(user_id),
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE group_members (
  member_id    BIGSERIAL PRIMARY KEY,
  group_id     BIGINT REFERENCES work_groups(group_id) ON DELETE CASCADE,
  user_id      UUID REFERENCES users(user_id) ON DELETE CASCADE,
  joined_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE (group_id, user_id)
);

CREATE TABLE notifications (
  notification_id BIGSERIAL PRIMARY KEY,
  user_id      UUID REFERENCES users(user_id) ON DELETE CASCADE,
  message      TEXT,
  is_read      BOOLEAN DEFAULT FALSE,
  payload      JSONB,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE files (
  file_id   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id   UUID REFERENCES users(user_id) ON DELETE CASCADE,
  file_url  TEXT NOT NULL,
  file_type VARCHAR(50),
  file_size INT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CHECK (LEFT(file_url, 8) = 'https://')
);


CREATE TABLE job_embeddings (
  job_id     BIGINT PRIMARY KEY REFERENCES jobs(job_id) ON DELETE CASCADE,
  embedding  vector(768),
  model_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_job_embeddings_vector ON job_embeddings USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);


CREATE TABLE availability (
    availability_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    day_of_week VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);


CREATE TABLE otp_codes (
    otp_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    attempts INT DEFAULT 0
);


CREATE TABLE reports (
    report_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES users(user_id),
    reported_user_id UUID REFERENCES users(user_id),
    reported_job_id BIGINT REFERENCES jobs(job_id),
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    status VARCHAR(50) DEFAULT 'PENDING'
);


CREATE TYPE ptj_image_entity AS ENUM (
  'user',
  'company',
  'job',
  'group'
);

CREATE TYPE ptj_image_type AS ENUM (
  'profile',     
  'logo',       
  'cover',        
  'gallery',      
  'portfolio'    
);

CREATE TABLE images (
  image_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  entity_type ptj_image_entity NOT NULL,
  entity_id TEXT NOT NULL, 

  image_type ptj_image_type DEFAULT 'gallery',

  image_url TEXT NOT NULL,
  file_size INT,
  alt_text TEXT,

  is_primary BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_images_entity 
ON images(entity_type, entity_id);

CREATE INDEX idx_images_primary 
ON images(is_primary);

CREATE UNIQUE INDEX unique_primary_image
ON images(entity_type, entity_id)
WHERE is_primary = TRUE;


CREATE TABLE testimonials (
  testimonial_id BIGSERIAL PRIMARY KEY,
  user_id        UUID REFERENCES users(user_id) ON DELETE CASCADE,
  body           TEXT NOT NULL,
  is_featured    BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_testimonials_featured ON testimonials(is_featured);