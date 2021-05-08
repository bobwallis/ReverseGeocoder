# Reverse Geocoder

Reverse geocoding is the process of coding of a point location (latitude,
longitude) to a readable address or place name.

This is a simple one designed for self-hosting. It maps locations to
village-level detail. If you are nowhere near a named settlement it will
take the name of geographical features (mountains, islands, etc).

You could use this to replace your use of the Google Maps API geocoder
with a simple GET request to your own server. This will have the advantage
of not stinging you with a massive credit card bill for not very many uses.

I use it to convert the location data provided by the [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
into a human-readable location on isitgoingtorain.com.

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
scripts that help with creating such a table using cc-by licenced data from
[GeoNames](http://www.geonames.org/export/).


## Using

Open `./reverse_geocode.php` and edit the Data Source Name (and user/password if
needed for the relevant for the PDO driver you are using) at the top so the
script can connect to the data you just created.

Upload to your PHP server of choice, and access like this:
`https://example.com/reverse_geocode.php?lat=51.7546&lon=-1.2588`

Porting to other languages, or your favourite serverless architecture, is an
exercise for the reader.
