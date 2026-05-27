CREATE SCHEMA IF NOT EXISTS iryou_map;

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS iryou_map.import_runs (
  id bigserial PRIMARY KEY,
  source_file text NOT NULL,
  source_count integer NOT NULL DEFAULT 0,
  imported_count integer NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  note text
);

CREATE TABLE IF NOT EXISTS iryou_map.facilities (
  id text PRIMARY KEY,
  source_url text,
  page_type text,
  name text NOT NULL,
  status text,
  status_class text,
  until_text text,
  departments_text text,
  address text,
  phone text,
  official_url text,
  hours_text text,
  holiday_text text,
  verified_text text,
  quality text,
  review_reason text,
  quality_score integer NOT NULL DEFAULT 0,
  distance_label text,
  distance_meters integer,
  raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  search_blob text NOT NULL DEFAULT '',
  imported_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS iryou_map.facility_departments (
  facility_id text NOT NULL REFERENCES iryou_map.facilities(id) ON DELETE CASCADE,
  department text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  PRIMARY KEY (facility_id, department)
);

CREATE TABLE IF NOT EXISTS iryou_map.facility_hours (
  facility_id text PRIMARY KEY REFERENCES iryou_map.facilities(id) ON DELETE CASCADE,
  hours_text text,
  holiday_text text,
  time_image_only text
);

CREATE TABLE IF NOT EXISTS iryou_map.facility_urls (
  facility_id text PRIMARY KEY REFERENCES iryou_map.facilities(id) ON DELETE CASCADE,
  iryou_map_url text,
  official_url text
);

CREATE TABLE IF NOT EXISTS iryou_map.facility_flags (
  facility_id text PRIMARY KEY REFERENCES iryou_map.facilities(id) ON DELETE CASCADE,
  emergency_care text,
  night_care text,
  holiday_care text
);

CREATE TABLE IF NOT EXISTS iryou_map.facility_geo (
  facility_id text PRIMARY KEY REFERENCES iryou_map.facilities(id) ON DELETE CASCADE,
  address text,
  prefecture text,
  municipality text,
  area_tokens text[] NOT NULL DEFAULT '{}',
  lat double precision,
  lng double precision,
  geocoded_at timestamptz
);

CREATE INDEX IF NOT EXISTS facilities_name_trgm_idx
  ON iryou_map.facilities USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS facilities_address_trgm_idx
  ON iryou_map.facilities USING gin (address gin_trgm_ops);

CREATE INDEX IF NOT EXISTS facilities_departments_trgm_idx
  ON iryou_map.facilities USING gin (departments_text gin_trgm_ops);

CREATE INDEX IF NOT EXISTS facilities_search_blob_trgm_idx
  ON iryou_map.facilities USING gin (search_blob gin_trgm_ops);

CREATE INDEX IF NOT EXISTS facility_departments_department_idx
  ON iryou_map.facility_departments (department);

CREATE INDEX IF NOT EXISTS facility_geo_area_tokens_idx
  ON iryou_map.facility_geo USING gin (area_tokens);
