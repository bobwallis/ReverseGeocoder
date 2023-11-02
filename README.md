# Geocoding Tools

This contains a few simple geolocation-related tools designed for self-
hosting that operate at village-level detail. (i.e. not suitable for
identifying specific addresses / buildings).

There is:
* A Reverse Geocoder, which codes a point location (latitude, longitude)
  to a human-readable place name.

* An IP Address to Country mapper.

* A location search that returns a list of places that match a search
  string, with optional prioritisation of specific countries.

You could use these to replace your use of the Google Maps API with simple
GET requests to your own server. This will have the advantage of not
stinging you with a massive credit card bill for not very many API calls.
So long as your use-case can work at village-level detail.

I use it to convert the location data provided by the [Geolocation API][1]
into a human-readable location on [isitgoingtorain.com][2], and to do the
location search on the same site.

## Data

The reverse geocoder and location search use database tables with the
following columns:

### `place` table
| Column    | Data Type    | Description                                |
|-----------|--------------|--------------------------------------------|
| country   | char(2)      | ISO-3166 2-letter country code             |
| name      | text         | Name of the point                          |
| admin     | integer      | ID of the administrative area of the point |
| sort      | integer      | Bigger = higher priority when searching    |
| latitude  | decimal(6,3) | Latitude in decimal degrees (WGS84)        |
| longitude | decimal(6,3) | Longitude in decimal degrees (WGS84)       |

### `admin` table
| Column    | Data Type    | Description                                |
|-----------|--------------|--------------------------------------------|
| id        | integer      | ID column                                  |
| name      | text         | Name of the administrative area            |

You can get these from any source you like. In the `./data` folder there are
scripts that help with creating such tables using [cc-by licenced][3] data
from [GeoNames][4].

The IP address to country mapper uses a database table with the
following columns:

### `ip` table
| Column        | Data Type | Description                                 |
|---------------|-----------|---------------------------------------------|
| network_start | integer   | Decimal IP address starting a range         |
| network_end   | integer   | Decimal IP address ending a range           |
| country       | char(2)   | ISO-3166 2-letter country code of the range |

You can get this from any source you like. In the `./data` folder there are
scripts that help with creating such a table using [GeoLite2 by Maxmind][6].


## How to Use

### Create database
Look in the `./data` folder and follow the instructions there, or create your
own database of locations. Upload to your database server, or copy out and
upload an SQLite file.

### PHP
The folder `./php` contains 3 scripts. Open them up and edit the Data Source
Name (and user/password if needed for the relevant for the PDO driver you
are using) at the top so the script can connect to the data you just created.

Upload to your PHP server of choice, and access like this:
`https://example.com/ip2country.php?ip=1.0.0.1`
`https://example.com/reverse_geocode.php?lat=51.7546&lon=-1.2588`
`https://example.com/geocode.php?q=oxfo&prefer_country=GB`

### Serverless / Amazon Web Services
The folder `./aws` contains configuration and code to use with Serverless to
run the project on AWS as a Lambda function. Since Lambdas have a size limit
of 256MB, the database is stored on S3 and copied in the first time the function
is executed.

Create an SQLite database using `./data` and copy it to `./aws/data/data.sqlite`.

[Set up Serverless][5], `cd` into `./aws`, and then run `serverless deploy`.
You should get some output in your terminal that includes an endpoint URL.
Once you have tested, use `serverless deploy --stage prod`.

The first call to the endpoint will take around 5 seconds due to the cold
start. Subsequent requests will be well sub 100ms, until the Lambda is left
idle long enough that AWS times it out. You will want to use a warmer to
prevent cold starts for end-users.

### Other
Porting to other languages is an exercise for the reader.

[1]: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
[2]: https://isitgoingtorain.com
[3]: https://creativecommons.org/licenses/by/4.0/
[4]: http://www.geonames.org/export/
[5]: https://www.serverless.com/framework/docs/getting-started
[6]: https://dev.maxmind.com/geoip/geolite2-free-geolocation-data
