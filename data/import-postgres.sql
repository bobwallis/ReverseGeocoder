/* Import data into a Postgres database
 * 1. Copy admin.csv, place.csv and ip.csv to /tmp/
 * 2. Create a new database.
 * 3. Run something like `psql -d [database] -a -f import-postgres.sql`
 * 4. Create a user and grant read access to the table.
 */

DROP TABLE IF EXISTS admin;
CREATE TABLE admin (
    id INTEGER PRIMARY KEY,
    name TEXT
);
COPY admin (id, name) FROM '/tmp/admin.csv' DELIMITERS ',' CSV HEADER;

DROP TABLE IF EXISTS place;
CREATE TABLE place (
    name TEXT,
    admin INTEGER,
    country CHAR(2),
    sort INTEGER,
    latitude DECIMAL(6,3),
    longitude DECIMAL(6,3)
);
COPY place (name, admin, country, sort, latitude, longitude) FROM '/tmp/place.csv' DELIMITERS ',' CSV HEADER;
CREATE INDEX idx_latlon ON place(latitude,longitude);
CREATE INDEX idx_country ON place(country);
CREATE INDEX idx_sort ON place(sort);

DROP TABLE IF EXISTS ip;
CREATE TABLE ip (
    network_start INTEGER,
    network_end INTEGER,
    country CHAR(2)
);
COPY ip (network_start, network_end, country) FROM '/tmp/ip.csv' DELIMITERS ',' CSV HEADER;
CREATE INDEX idx_netstart ON ip(network_start,network_end);

DROP TABLE IF EXISTS ipv6;
CREATE TABLE ipv6 (
    network_start TEXT,
    network_end TEXT,
    country CHAR(2)
);
COPY ipv6 (network_start, network_end, country) FROM '/tmp/ipv6.csv' DELIMITERS ',' CSV HEADER;
CREATE INDEX idx_netstart_ipv6 ON ipv6(network_start,network_end);
