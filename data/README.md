## Data

The script in this folder processes GeoNames data into the format used by the 
lookup code.

* Make sure you have the following installed: `bash`, `curl`, `unzip`, `cut`, 
  `sed`, `sqlite3`

* Read `./generate` and check you're happy to run it.

* Run `./generate`.

* Receive `./schema.sql` and `./data.sql`.

* Import into your database of choice. If you are using Postgres then you'll need
  to edit `./schema.sql` by removing "INTEGER AUTO_INCREMENT" and replacing it
  with "SERIAL". `./data.sql` does nothing complex and so should work in any DB.
