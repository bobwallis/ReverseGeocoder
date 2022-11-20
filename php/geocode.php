<?php
// Settings should really be in a .env file these days. But KISS...
$dsn      = 'sqlite:/home/bob/Projects/ReverseGeocoder/data/data.sqlite';
$username = null;
$password = null;
$prod     = false;

// Get q from $_GET, and prefer_country if set
if( !isset( $_GET['q'] ) ) {
    http_response_code( 400 );
    die();
}
$q = urldecode( $_GET['q'] );
$qLike = '%'.$q.'%';
if( isset( $_GET['prefer_country'] ) ) {
    if( preg_match( '/[a-zA-Z]{2}/', $_GET['prefer_country'] ) !== 1 ) {
        http_response_code( 400 );
        die();
    }
    $prefer_country = strtoupper( $_GET['prefer_country'] );
} else {
    $prefer_country = false;
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

// Search for points
try {
    $sql = 'SELECT
                p.name AS name,
                a.name AS admin,
                p.country AS country,
                p.latitude AS latitude,
                p.longitude AS longitude
            FROM place p LEFT JOIN admin a ON a.id = p.admin
            WHERE
                p.name LIKE :qLike
                '.(($prefer_country === false)? '' : 'AND p.country = :prefer_country' ).'
            ORDER BY p.sort DESC
            LIMIT 10;';
    $sth = $pdo->prepare( $sql );
    ($prefer_country === false)? $sth->execute( compact( 'qLike' ) ) : $sth->execute( compact( 'qLike', 'prefer_country' ) );
    $result = $sth->fetchAll( PDO::FETCH_ASSOC );
} catch (PDOException $e) {
    http_response_code( 500 );
    if( !$prod ) {
        echo 'Query failed: ' . $e->getMessage();
    }
    die();
}


// Output
header( 'Content-Type: application/javascript' );
header( 'Cache-Control: public,max-age=10540800' );
http_response_code( 200 );
echo json_encode( $result );
