## Data

The script in this folder processes GeoNames and GEOLite2 data into the formats
used by the lookup code.

* Make sure you have the following installed: `bash`, `curl`, `unzip`, `cut`,
  `sed`, `sqlite3`, `gawk`.

* Copy `./.env.dist` to `./.env` and add in a key to download GeoLite2.

* Read `./generate` and check you're happy to run it.

* Run `./generate`.

* Receive the outputs: `admin.csv`, `./place.csv` and `./ip.csv`

* Import the data into your database of choice, using one of the
  `./import-*.sql` files if you want (instructions are inside), or manually
  if you prefer. e.g. running `sqlite3 data.sqlite < import-sqlite.sql` will
  create you a file called `./data.sqlite` that contains the database.

* Run `./cleanup` to delete all the cached files used to generate the database.
You should do this if you want to redownload the latest data, for example.
