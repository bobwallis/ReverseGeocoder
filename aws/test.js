import { geocode } from './handler.js';

// Test reverse geocode
const testReverseGeocode = async () => {
  console.log('Testing reverse geocode...');
  const event = {
    rawPath: '/reverse_geocode',
    queryStringParameters: {
      lat: '51.505',
      lon: '-0.09'
    }
  };
  const result = await geocode(event);
  console.log('Result:', JSON.parse(result.body));
};

// Test geocode
const testGeocode = async () => {
  console.log('Testing geocode...');
  const event = {
    rawPath: '/geocode',
    queryStringParameters: {
      q: 'London'
    }
  };
  const result = await geocode(event);
  console.log('Result:', JSON.parse(result.body));
};

// Test ip2country
const testIp2Country = async () => {
  console.log('Testing ip2country IPv4...');
  const event = {
    rawPath: '/ip2country',
    queryStringParameters: {
      ip: '8.8.8.8'
    }
  };
  const result = await geocode(event);
  console.log('Result:', JSON.parse(result.body));
};

// Test ip2country IPv6
const testIp2CountryIPv6 = async () => {
  console.log('Testing ip2country IPv6...');
  const event = {
    rawPath: '/ip2country',
    queryStringParameters: {
      ip: '2001:4860:4860::8888'
    }
  };
  const result = await geocode(event);
  console.log('Result:', JSON.parse(result.body));
};

// Run tests
const runTests = async () => {
  try {
    await testReverseGeocode();
    await testGeocode();
    await testIp2Country();
    await testIp2CountryIPv6();
    console.log('All tests passed!');
  } catch (error) {
    console.error('Test failed:', error);
  }
};

runTests();
