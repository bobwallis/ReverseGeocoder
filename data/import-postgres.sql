/* Import data.csv into a Postgres database
 * 1. Copy data.csv to /tmp/data.csv
 * 2. Create a new database.
 * 3. Run something like `psql -d [database] -a -f import-postgres.sql`
 * 4. Create a user and grant read access to the table.
 */

DROP TABLE IF EXISTS place;

CREATE TABLE place (
    id INTEGER PRIMARY KEY,
    name TEXT,
    country CHAR(2),
    latitude DECIMAL(8,3),
    longitude DECIMAL(8,3)
);

COPY place (id, name, country, latitude, longitude) FROM '/tmp/data.csv' CSV HEADER;

CREATE INDEX idx_lat ON place(latitude);
CREATE INDEX idx_lon ON place(longitude);
