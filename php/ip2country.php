<?php
// Settings should really be in a .env file these days. But KISS...
$dsn      = 'sqlite:/home/bob/Projects/ReverseGeocoder/data/data.sqlite';
$username = null;
$password = null;
$prod     = false;

// Variable to store IP
$lookupIP  = null;
$ipFromURL = false;

// Try and get IP address from $_GET, and validate it
if( !$lookupIP && isset( $_GET['ip'] ) ) {
    if( !filter_var( $_GET['ip'], FILTER_VALIDATE_IP, FILTER_FLAG_IPV4 ) ) {
        http_response_code( 400 );
        die();
    }
    $lookupIP  = $_GET['ip'];
    $ipFromURL = true;
}

// Otherwise get from headers / PHP
function getClientIP() {
    if( array_key_exists( 'HTTP_X_FORWARDED_FOR', $_SERVER ) ) {
        return trim( array_shift( array_filter( explode( ',', $_SERVER["HTTP_X_FORWARDED_FOR"] ) ) ) );
    } else if (array_key_exists('REMOTE_ADDR', $_SERVER ) ) {
        return $_SERVER["REMOTE_ADDR"];
    } else if (array_key_exists('HTTP_CLIENT_IP', $_SERVER ) ) {
        return $_SERVER["HTTP_CLIENT_IP"];
    }
    return '';
}
if( !$lookupIP ) {
    if( !filter_var( getClientIP(), FILTER_VALIDATE_IP, FILTER_FLAG_IPV4 ) ) {
        http_response_code( 400 );
        die();
    }
    $lookupIP = getClientIP();
}

// Convert IP address to a decimal number for looking up in the database
$lookupIPDecimal = ip2long( $lookupIP );


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

// Lookup IP in database
try {
    $sql = 'SELECT i.country
            FROM ip i
            WHERE i.network_start <= :lookupIPDecimal AND i.network_end >= :lookupIPDecimal
            LIMIT 1;';
    $sth = $pdo->prepare( $sql );
    $sth->execute( compact( 'lookupIPDecimal' ) );
    $result = $sth->fetchAll( PDO::FETCH_ASSOC );
} catch (PDOException $e) {
    http_response_code( 500 );
    if( !$prod ) {
        echo 'Query failed: ' . $e->getMessage();
    }
    die();
}

$location['ip'] = $lookupIP;
$location['country'] = isset( $result[0] )? $result[0]['country'] : null;

// Output
header( 'Content-Type: application/javascript' );
if( $ipFromURL ) {
    header( 'Cache-Control: public,max-age=10540800' );
} else {
    header( 'Cache-Control: private' );
}
http_response_code( 200 );
echo json_encode( $location );
