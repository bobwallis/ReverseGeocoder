/* Create an SQLite database using data.csv
 *
 * 1. Run something like `sqlite3 data.sqlite < import-sqlite.sql`
 */

DROP TABLE IF EXISTS place;

CREATE TABLE place (
    id INTEGER PRIMARY KEY,
    name TEXT,
    country TEXT,
    latitude REAL,
    longitude REAL
);

.mode csv
.import data.csv place

CREATE INDEX idx_lat ON place(latitude);
CREATE INDEX idx_lon ON place(longitude);
