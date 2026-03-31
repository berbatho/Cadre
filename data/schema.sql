CREATE TABLE films (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  original_title TEXT,
  release_year INTEGER,
  country_codes TEXT,
  duration_minutes INTEGER,
  synopsis TEXT,
  animation_techniques TEXT,
  languages TEXT,
  subtitles TEXT,
  genres TEXT,
  age_rating TEXT,
  status TEXT DEFAULT 'completed',
  website_url TEXT,
  poster_url TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE people (
  id INTEGER PRIMARY KEY,
  full_name TEXT NOT NULL,
  country_code TEXT,
  birth_year INTEGER,
  website_url TEXT,
  imdb_url TEXT,
  social_url TEXT
);

CREATE TABLE film_people_roles (
  id INTEGER PRIMARY KEY,
  film_id INTEGER NOT NULL,
  person_id INTEGER NOT NULL,
  role TEXT NOT NULL,
  credit_order INTEGER,
  FOREIGN KEY (film_id) REFERENCES films(id),
  FOREIGN KEY (person_id) REFERENCES people(id)
);

CREATE TABLE festivals (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  country_code TEXT,
  city TEXT,
  website_url TEXT,
  tier TEXT
);

CREATE TABLE festival_editions (
  id INTEGER PRIMARY KEY,
  festival_id INTEGER NOT NULL,
  year INTEGER NOT NULL,
  edition_label TEXT,
  start_date TEXT,
  end_date TEXT,
  theme TEXT,
  FOREIGN KEY (festival_id) REFERENCES festivals(id)
);

CREATE TABLE screenings (
  id INTEGER PRIMARY KEY,
  film_id INTEGER NOT NULL,
  festival_edition_id INTEGER NOT NULL,
  section_name TEXT,
  screening_date TEXT,
  premiere_status TEXT,
  award_outcome TEXT,
  award_name TEXT,
  FOREIGN KEY (film_id) REFERENCES films(id),
  FOREIGN KEY (festival_edition_id) REFERENCES festival_editions(id)
);

CREATE TABLE media_assets (
  id INTEGER PRIMARY KEY,
  film_id INTEGER NOT NULL,
  asset_type TEXT NOT NULL,
  url TEXT NOT NULL,
  platform TEXT,
  is_public INTEGER DEFAULT 1,
  language TEXT,
  geo_restriction TEXT,
  expires_at TEXT,
  FOREIGN KEY (film_id) REFERENCES films(id)
);

CREATE TABLE film_external_ids (
  id INTEGER PRIMARY KEY,
  film_id INTEGER NOT NULL,
  provider TEXT NOT NULL,
  external_id TEXT NOT NULL,
  FOREIGN KEY (film_id) REFERENCES films(id)
);

CREATE TABLE sources (
  id INTEGER PRIMARY KEY,
  film_id INTEGER,
  screening_id INTEGER,
  source_type TEXT NOT NULL,
  source_name TEXT,
  source_url TEXT,
  confidence_score REAL,
  last_checked_at TEXT,
  notes TEXT,
  FOREIGN KEY (film_id) REFERENCES films(id),
  FOREIGN KEY (screening_id) REFERENCES screenings(id)
);
