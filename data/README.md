## Data

The script in this folder processes GeoNames data into the format used by the
lookup code.

* Make sure you have the following installed: `bash`, `curl`, `unzip`, `cut`,
  `sed`, `sqlite3`

* Read `./generate` and check you're happy to run it.

* Run `./generate`.

* Receive `./data.csv`.

* Import the data into your database of choice, using one of the
  `./import-*.sql` files if you want (instructions are inside), or manually
  if you prefer.
