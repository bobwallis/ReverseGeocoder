## Data

The script in this folder processes GeoNames data into the format used by the 
lookup code.

* Make sure you have the following installed: `bash`, `curl`, `unzip`, `cut`, 
  `sed`, `sqlite3`

* Read `./generate` and check you're happy to run it.

* Run `./generate`.

* Receive `./schema.sql` and `./data.csv`.

* Create the table in your database of choice, using `./schema.sql` if you want.
  If you are using Postgres then you'll need to edit `./schema.sql` by removing 
  "INTEGER AUTO_INCREMENT" and replacing it with "SERIAL".

* Import `./data.csv` using your database's CSV import mode.

* Create indexes on the longitude and latitude columns to improve performance
  significantly.
