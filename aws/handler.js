import { createWriteStream } from 'node:fs';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import Database from 'better-sqlite3';

let db = null;

// Initialize database connection
const initializeDb = async () => {
  if (db) return db;

  try {
    const client = new S3Client();
    const item = await client.send(new GetObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: 'data.sqlite'
    }));

    const stream = item.Body.pipe(createWriteStream('/tmp/data.sqlite'));
    await new Promise((resolve, reject) => {
      stream
        .on('finish', resolve)
        .on('error', reject);
    });

    db = new Database('/tmp/data.sqlite', { readonly: true });
    return db;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

const isValidIpAddress = (ip) => {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipv4Regex.test(ip)) return false;
  const parts = ip.split('.');
  return parts.every(part => parseInt(part) >= 0 && parseInt(part) <= 255);
};

const isValidCountryCode = (country) => {
  return /^[A-Z]{2}$/.test(country);
};

// Handler function
const geocode = async (event) => {
  try {
    const db = await initializeDb();

    switch (event.rawPath) {
      case '/reverse_geocode': {
        // Read and validate parameters
        const { lat, lon } = event.queryStringParameters || {};
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);

        if (isNaN(latitude) || isNaN(longitude) ||
            latitude < -90 || latitude > 90 ||
            longitude < -180 || longitude > 180) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid coordinates' })
          };
        }

        // Get a 8km bounding box
        const bbox_size_km = 8;
        let bbox_min_lat = latitude - (bbox_size_km / 111.045);
        let bbox_max_lat = latitude + (bbox_size_km / 111.045);
        let bbox_min_lon = longitude - (bbox_size_km / (111.045 * Math.cos(latitude*Math.PI/180)));
        let bbox_max_lon = longitude + (bbox_size_km / (111.045 * Math.cos(latitude*Math.PI/180)));

        // Fix overflows beyond +-180 longitude
        if (bbox_min_lon < -180) bbox_min_lon = (bbox_min_lon + 360);
        if (bbox_max_lon > 180) bbox_max_lon = (bbox_max_lon - 360);

        try {
          const sql = db.prepare(`
            SELECT
              p.name AS name,
              a.name AS admin,
              p.country AS country,
              p.latitude AS latitude,
              p.longitude AS longitude
            FROM place p
            LEFT JOIN admin a ON a.id = p.admin
            WHERE
              (p.latitude > :bbox_min_lat AND p.latitude < :bbox_max_lat)
              AND
              (p.longitude > :bbox_min_lon ${(bbox_min_lon < bbox_max_lon? 'AND' : 'OR')} p.longitude < :bbox_max_lon)
          `);

          const result = sql.all({
            bbox_min_lat,
            bbox_max_lat,
            bbox_min_lon,
            bbox_max_lon
          });

          const closest = result.reduce((carry, item) => {
            // https://en.wikipedia.org/wiki/Haversine_formula
            const distance = Math.asin(
              Math.sqrt(
                Math.pow(Math.sin(((latitude*Math.PI/180) - (item.latitude*Math.PI/180)) / 2), 2) +
                Math.cos(item.latitude*Math.PI/180) *
                Math.cos(latitude*Math.PI/180) *
                Math.pow(Math.sin((longitude*Math.PI/180 - (item.longitude*Math.PI/180)) / 2), 2)
              )
            );
            return (distance < carry.distance) ? { ...item, distance } : carry;
          }, { name: `${latitude}, ${longitude}`, distance: 999 });

          delete closest.distance;

          return {
            statusCode: 200,
            headers: {
              'content-type': 'application/json',
              'cache-control': 'public,max-age=10540800'
            },
            body: JSON.stringify(closest)
          };
        } catch (error) {
          console.error('Database query failed:', error);
          return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
          };
        }
      }

      case '/geocode': {
        const { q = '', prefer_country = null } = event.queryStringParameters || {};

        if (!q) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Query parameter required' })
          };
        }

        if (prefer_country && !isValidCountryCode(prefer_country)) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid country code' })
          };
        }

        try {
          // Optimized query to combine all searches in one
          const sql = db.prepare(`
            SELECT DISTINCT
              p.name AS name,
              a.name AS admin,
              p.country AS country,
              p.latitude AS latitude,
              p.longitude AS longitude
            FROM place p
            LEFT JOIN admin a ON a.id = p.admin
            WHERE
              (p.name LIKE :exactMatch
              OR p.name LIKE :partialMatch)
              ${prefer_country ? 'AND p.country = :prefer_country' : ''}
            ORDER BY
              CASE
                WHEN p.name LIKE :exactMatch THEN 1
                WHEN p.name LIKE :partialMatch THEN 2
                ELSE 3
              END,
              p.sort DESC
            LIMIT 10
          `);

          const params = {
            exactMatch: q + '%',
            partialMatch: '%' + q + '%',
            ...(prefer_country && { prefer_country })
          };

          const result = sql.all(params);

          return {
            statusCode: 200,
            headers: {
              'content-type': 'application/json',
              'cache-control': 'public,max-age=10540800'
            },
            body: JSON.stringify(result)
          };
        } catch (error) {
          console.error('Database query failed:', error);
          return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
          };
        }
      }

      case '/ip2country': {
        const { ip: queryIp } = event.queryStringParameters || {};
        const ip = queryIp || event.requestContext.http.sourceIp;
        const ipFromURL = !!queryIp;

        if (!isValidIpAddress(ip)) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid IP address' })
          };
        }

        try {
          const lookupIPDecimal = ip.split('.').reduce((ipInt, octet) =>
            (ipInt << 8) + parseInt(octet, 10) >>> 0, 0);

          const sql = db.prepare(`
            SELECT i.country
            FROM ip i
            WHERE i.network_start <= :lookupIPDecimal
            AND i.network_end >= :lookupIPDecimal
            LIMIT 1
          `);

          const result = sql.all({ lookupIPDecimal });

          return {
            statusCode: 200,
            headers: {
              'content-type': 'application/json',
              'cache-control': ipFromURL ? 'public,max-age=10540800' : 'private'
            },
            body: JSON.stringify({
              ip,
              country: result[0]?.country || null
            })
          };
        } catch (error) {
          console.error('Database query failed:', error);
          return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
          };
        }
      }

      default:
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'Not found' })
        };
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

export { geocode };
