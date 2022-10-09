# Reverse Geocoder

Reverse geocoding is the process of coding of a point location (latitude,
longitude) to a readable address or place name.

This is a simple one designed for self-hosting. It maps locations to
village-level detail. If you are nowhere near a named settlement it will
take the name of geographical features (mountains, islands, etc).

You could use this to replace your use of the Google Maps API geocoder
with a simple GET request to your own server. This will have the advantage
of not stinging you with a massive credit card bill for not very many uses.

I use it to convert the location data provided by the [Geolocation API][1]
into a human-readable location on [isitgoingtorain.com][2].

## Data

The reverse geocoder uses a database table with the following columns:

| Column    | Data Type    | Description                          |
|-----------|--------------|--------------------------------------|
| id        | integer      | ID column                            |
| country   | char(2)      | ISO-3166 2-letter country code       |
| name      | text         | Name of geographical point           |
| latitude  | decimal(8,3) | Latitude in decimal degrees (WGS84)  |
| longitude | decimal(8,3) | Longitude in decimal degrees (WGS84) |

You can get this from any source you like. In the `./data` folder there are
scripts that help with creating such a table using [cc-by licenced][3] data
from [GeoNames][4].


## How to Use

### Create database
Look in the `./data` folder follow the instructions there, or create your own
database of locations. Upload to your database server, or copy out and upload
the SQLite file.

### PHP
The folder `./php` contains `./php/reverse_geocode.php`. Open it up and edit
the Data Source Name (and user/password if needed for the relevant for the
PDO driver you are using) at the top so the script can connect to the data
you just created.

Upload to your PHP server of choice, and access like this:
`https://example.com/reverse_geocode.php?lat=51.7546&lon=-1.2588`

### Serverless / Amazon Web Services
The folder `./aws` contains configuration and code to use with Serverless
to run the project on AWS as a Lambda function. Since Lambdas have a size
limit of 256MB, the database is stored on S3 and read in on first launch.

Create an SQLite database using the data and copy it to `./aws/data/data.sqlite`.

[Set up Serverless][5], `cd` into `./aws`, and then run `serverless deploy`.
You should get some output in your terminal that includes an endpoint URL.
Once you have tested, use `serverless deploy --stage prod`.

The first call to the endpoint will take around 7.5 seconds due to the cold
start. Subsequent requests will be well sub 100ms, until the Lambda is left
idle long enough that AWS times it out.

### Other
Porting to other languages is an exercise for the reader.

[1]: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
[2]: https://isitgoingtorain.com
[3]: https://creativecommons.org/licenses/by/4.0/
[4]: http://www.geonames.org/export/
[5]: https://www.serverless.com/framework/docs/getting-started
