import { createWriteStream } from 'node:fs';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import Database from 'better-sqlite3';

// Download database from S3
const client = new S3Client();
let item     = await client.send( new GetObjectCommand( { Bucket: process.env.BUCKET_NAME, Key: 'data.sqlite' } ) );
let stream   = item.Body.pipe( createWriteStream( '/tmp/data.sqlite' ) );
await new Promise( ( resolve, reject ) => { stream.on( 'finish', () => { resolve(); } ).on( 'error', err => { console.log(err); reject( err ); } ); } );
const db = new Database( '/tmp/data.sqlite', { readonly: true } );

// Reverse geocode function
const reverse_geocode = async ( event ) => {
  // Read and validate parameters
  const params = event.queryStringParameters || { lat: 51.7546, lon: -1.2588  };
  const lat = parseFloat( params.lat );
  const lon = parseFloat( params.lon );
  if( lat < -90 || lat > 90 || lon < -180 || lon > 180 ) {
    return { statusCode: 400 };
  }

  // Get a 8km bounding box (you could move this further if you wanted)
  const bbox_size_km  = 8;
  let bbox_min_lat = lat - (bbox_size_km / 111.045);
  let bbox_max_lat = lat + (bbox_size_km / 111.045);
  let bbox_min_lon = lon - (bbox_size_km / (111.045 * Math.cos(lat*Math.PI/180)));
  let bbox_max_lon = lon + (bbox_size_km / (111.045 * Math.cos(lat*Math.PI/180)));

  // Fix overflows beyond +-180 longitude
  if( bbox_min_lon < -180 ) { bbox_min_lon = (bbox_min_lon + 360); }
  if( bbox_max_lon >  180 ) { bbox_max_lon = (bbox_max_lon - 360); }

  // Get the points inside the bounding box from the database
  let sql = db.prepare(
    `SELECT
      p.name AS name,
      a.name AS admin,
      p.country AS country,
      p.latitude AS latitude,
      p.longitude AS longitude
    FROM place p LEFT JOIN admin a ON a.id = p.admin
    WHERE
      ( p.latitude > :bbox_min_lat AND p.latitude < :bbox_max_lat )
      AND
      (p.longitude > :bbox_min_lon ${(bbox_min_lon < bbox_max_lon? 'AND' : 'OR')} p.longitude < :bbox_max_lon);`
  );
  let result = sql.all( { bbox_min_lat, bbox_max_lat, bbox_min_lon, bbox_max_lon } );

  // Iterate over the points, and pull out the one which is closest to the requsted lat/lon
  let closest = result.reduce( ( carry, item ) => {
      // https://en.wikipedia.org/wiki/Haversine_formula
      item.distance = Math.asin(Math.sqrt(Math.pow(Math.sin(((lat*Math.PI/180) - (item.latitude*Math.PI/180)) / 2), 2) + Math.cos(item.latitude*Math.PI/180) * Math.cos(lat*Math.PI/180) * Math.pow(Math.sin((lon*Math.PI/180 - (item.longitude*Math.PI/180)) / 2), 2)));
      return (item.distance < carry.distance)? item : carry;
  }, { name: lat+', '+lon, distance: 999 } ); // The default if there's nothing interesting nearby is to just show the lat/lon pair as text

  // Remove fields that we won't show in the output
  delete closest.distance;

  // Output
  return {
    statusCode: 200,
    headers: { 'content-type': 'application/javascript', 'cache-control': 'public,max-age=10540800' },
    body: JSON.stringify( closest )
  };
};

// Geocode function
const geocode = async ( event ) => {
  // TODO
};


// Reverse geocode function
const ip2country = async ( event ) => {
  // TODO
};

export  { reverse_geocode, geocode, ip2country };
