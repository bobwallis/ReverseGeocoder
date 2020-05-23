# Reverse Geocoder

Reverse geocoding is the process of coding of a point location (latitude, 
longitude) to a readable address or place name. This is a simple one designed 
for self-hosting.

## Data

The reverse geocoder uses a database table with the following columns:

| Column    | Data Type    | Description                          |
|-----------|--------------|--------------------------------------|
| id        | integer      | ID column                            |
| country   | char(2)      | ISO-3166 2-letter country code       |
| name      | text         | Name of geographical point           |
| latitude  | decimal(8,3) | Latitude in decimal degrees (WGS84)  |
| longitude | decimal(8,3) | Longitude in decimal degrees (WGS84) |

You can get this from any source you like. In the `./data` folder there is a
script that help with generating such a table using cc-by licenced data from
[GeoNames](http://www.geonames.org/export/).


## Using

Open `./reverse_geocode.php` and edit the Data Source Name at the top so the 
script can connect to the data you just created.

Upload to your PHP server of choice, and access like this:
`https://example.com/reverse_geocode.php?lat=51.7546&lon=-1.2588`

Porting to other languages is an exercise for the reader.
