/* Import data into an SQLite database
 * 1. Run something like `sqlite3 data.sqlite < import-sqlite.sql`
 */

DROP TABLE IF EXISTS admin;
CREATE TABLE admin (
    id INTEGER PRIMARY KEY,
    name TEXT
);
.import --csv --skip 1 admin.csv admin

DROP TABLE IF EXISTS place;
CREATE TABLE place (
    name TEXT,
    admin INTEGER,
    country TEXT,
    sort INTEGER,
    latitude REAL,
    longitude REAL
);
.import --csv --skip 1 place.csv place
CREATE INDEX idx_lat ON place(latitude);
CREATE INDEX idx_lon ON place(longitude);
CREATE INDEX idx_country ON place(country);
CREATE INDEX idx_sort ON place(sort);

DROP TABLE IF EXISTS ip;
CREATE TABLE ip (
    network_start INTEGER,
    network_end INTEGER,
    country TEXT
);
.import --csv --skip 1 ip.csv ip
CREATE INDEX idx_netstart ON ip(network_start);
CREATE INDEX idx_netend ON ip(network_end);

VACUUM;
