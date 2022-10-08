## Data

The script in this folder processes GeoNames data into the format used by the
lookup code.

* Make sure you have the following installed: `bash`, `curl`, `unzip`, `cut`,
  `sed`, `sqlite3`

* Read `./generate` and check you're happy to run it.

* Run `./generate`.

* Receive the output: `./data.csv`.

* Import the data into your database of choice, using one of the
  `./import-*.sql` files if you want (instructions are inside), or manually
  if you prefer. e.g. running `sqlite3 data.sqlite < import-sqlite.sql` will
  create you a file called `./data.sqlite` that contains the database.

* Run `./cleanup` to delete all the cached files used to generate the
  database. You should do this if you want to redownload the latest data, for
  example.
