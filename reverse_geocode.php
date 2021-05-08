<?php
// Settings should really be in a .env file these days. But KISS...
$dsn      = 'sqlite:/home/bob/Projects/ReverseGeocoder/data/data.sqlite';
$username = null;
$password = null;
$prod     = false;

// Get lat and lon from $_GET, and validate them
if( !isset( $_GET['lat'] ) || !isset( $_GET['lon'] ) ) {
    http_response_code( 400 );
    die();
}
$lat = floatval( $_GET['lat'] );
$lon = floatval( $_GET['lon'] );
if( $lat < -90 || $lat > 90 || $lon < -180 || $lon > 180 ) {
    http_response_code( 400 );
    die();
}


// Connect to database
try {
    $pdo = !is_null($username)? new PDO( $dsn, $username, $password ) : new PDO ( $dsn );
} catch (PDOException $e) {
    http_response_code( 500 );
    if( !$prod ) {
        echo 'Connection failed: ' . $e->getMessage();
    }
    die();
}


// Get a 8km bounding box (you could move this further if you wanted)
$bbx_size_km  = 8;
$bbox_min_lat = $lat - ($bbx_size_km / 111.045);
$bbox_max_lat = $lat + ($bbx_size_km / 111.045);
$bbox_min_lon = $lon - ($bbx_size_km / (111.045 * cos(deg2rad($lat))));
$bbox_max_lon = $lon + ($bbx_size_km / (111.045 * cos(deg2rad($lat))));
// Fix overflows beyond +-180 longitude
if( $bbox_min_lon < -180 ) $bbox_min_lon = ($bbox_min_lon + 360);
if( $bbox_max_lon >  180 ) $bbox_max_lon = ($bbox_max_lon - 360);


// Get the points inside the bounding box from the database
try {
    $sql = 'SELECT
                p.name,
                p.country,
                p.latitude,
                p.longitude
            FROM place p
            WHERE
                ( p.latitude > :bbox_min_lat AND p.latitude < :bbox_max_lat )
                AND
                (p.longitude > :bbox_min_lon '.($bbox_min_lon < $bbox_max_lon? 'AND' : 'OR').' p.longitude < :bbox_max_lon);'; // If the bounding box is straddling +-180 longitude then the min longitude will be more than the max, as the max is negative and the min is positive. In that case: the box will contain most of the world, and we use OR to get what's outside it, rather than AND to get what's inside. Draw a picture if that explanation's unclear...
    $sth = $pdo->prepare( $sql );
    $sth->execute( compact( 'bbox_min_lat', 'bbox_max_lat', 'bbox_min_lon', 'bbox_max_lon' ) );
    $result = $sth->fetchAll( PDO::FETCH_ASSOC );
} catch (PDOException $e) {
    http_response_code( 500 );
    if( !$prod ) {
        echo 'Query failed: ' . $e->getMessage();
    }
    die();
}


// Iterate over the points, and pull out the one which is closest to the requsted lat/lon
$closest = array_reduce( $result, function( $carry, $item ) use ($lat, $lon) {
    // https://en.wikipedia.org/wiki/Haversine_formula
    $item['distance'] = asin(sqrt(pow(sin((deg2rad($lat) - deg2rad($item['latitude'])) / 2), 2) + cos(deg2rad($item['latitude'])) * cos(deg2rad($lat)) * pow(sin((deg2rad($lon) - deg2rad($item['longitude'])) / 2), 2)));
    return $item['distance'] < $carry['distance']? $item : $carry;
}, array( 'name' => $lat.', '.$lon, 'distance' => 999 ) ); // The default if there's nothing interesting nearby is to just show the lat/lon pair as text
// Remove fields that we won't show in the output
unset( $closest['distance'] );
unset( $closest['latitude'] );
unset( $closest['longitude'] );


// Output
header( 'Content-Type: application/javascript' );
header( 'Cache-Control: public,max-age=604800' );
http_response_code( 200 );
echo json_encode( $closest );
