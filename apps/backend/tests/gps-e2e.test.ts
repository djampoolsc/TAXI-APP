import { io, Socket } from 'socket.io-client';
import http from 'http';

/**
 * E2E test for real-time GPS tracking
 * Run: npm run test:gps-realtime
 */

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

const results: TestResult[] = [];

async function runTest(
  name: string,
  test: () => Promise<void>
): Promise<void> {
  const start = Date.now();
  try {
    await test();
    results.push({ name, passed: true, duration: Date.now() - start });
    console.log(`✓ ${name}`);
  } catch (error) {
    results.push({
      name,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - start,
    });
    console.log(`✗ ${name}: ${error}`);
  }
}

// Test data
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
const DRIVER_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImRyaXZlci0xMjMiLCJ1c2VyX3R5cGUiOiJkcml2ZXIifQ.signature'; // Mock token
const PASSENGER_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InBhc3Nlbmdlci0xMjMiLCJ1c2VyX3R5cGUiOiJwYXNzZW5nZXIifQ.signature'; // Mock token
const RIDE_ID = 'ride-test-123';

// Test 1: Driver connects and authenticates
async function testDriverAuth() {
  return new Promise<void>((resolve, reject) => {
    const socket = io(BACKEND_URL, {
      auth: { token: DRIVER_TOKEN },
      transports: ['websocket'],
      reconnection: false,
    });

    const timeout = setTimeout(() => {
      socket.disconnect();
      reject(new Error('Connection timeout'));
    }, 5000);

    socket.on('connect', () => {
      clearTimeout(timeout);
      console.log(`  → Driver connected: ${socket.id}`);
      socket.disconnect();
      resolve();
    });

    socket.on('connect_error', (error) => {
      clearTimeout(timeout);
      socket.disconnect();
      reject(error);
    });
  });
}

// Test 2: Passenger connects and authenticates
async function testPassengerAuth() {
  return new Promise<void>((resolve, reject) => {
    const socket = io(BACKEND_URL, {
      auth: { token: PASSENGER_TOKEN },
      transports: ['websocket'],
      reconnection: false,
    });

    const timeout = setTimeout(() => {
      socket.disconnect();
      reject(new Error('Connection timeout'));
    }, 5000);

    socket.on('connect', () => {
      clearTimeout(timeout);
      console.log(`  → Passenger connected: ${socket.id}`);
      socket.disconnect();
      resolve();
    });

    socket.on('error', (error) => {
      clearTimeout(timeout);
      socket.disconnect();
      reject(error);
    });
  });
}

// Test 3: GPS namespace connection
async function testGPSNamespace() {
  return new Promise<void>((resolve, reject) => {
    const socket = io(`${BACKEND_URL}/gps`, {
      auth: { token: DRIVER_TOKEN },
      transports: ['websocket'],
      reconnection: false,
    });

    const timeout = setTimeout(() => {
      socket.disconnect();
      reject(new Error('GPS namespace connection timeout'));
    }, 5000);

    socket.on('connect', () => {
      clearTimeout(timeout);
      console.log(`  → GPS namespace connected: ${socket.id}`);
      socket.disconnect();
      resolve();
    });

    socket.on('connect_error', (error) => {
      clearTimeout(timeout);
      socket.disconnect();
      reject(error);
    });
  });
}

// Test 4: Driver sends GPS update
async function testGPSUpdate() {
  return new Promise<void>((resolve, reject) => {
    const socket = io(`${BACKEND_URL}/gps`, {
      auth: { token: DRIVER_TOKEN },
      transports: ['websocket'],
      reconnection: false,
    });

    const timeout = setTimeout(() => {
      socket.disconnect();
      reject(new Error('GPS update timeout'));
    }, 10000);

    socket.on('connect', () => {
      socket.emit('gps:update', {
        rideId: RIDE_ID,
        location: {
          latitude: 12.0456,
          longitude: -77.0289,
          accuracy: 5,
          heading: 45,
          speed: 12.5,
        },
      });
    });

    socket.on('gps:update_received', (data) => {
      clearTimeout(timeout);
      console.log(`  → GPS update confirmed: ${data.success}`);
      socket.disconnect();
      resolve();
    });

    socket.on('error', (error) => {
      clearTimeout(timeout);
      socket.disconnect();
      reject(error);
    });
  });
}

// Test 5: Passenger requests GPS tracking
async function testGPSTracking() {
  return new Promise<void>((resolve, reject) => {
    const driverSocket = io(`${BACKEND_URL}/gps`, {
      auth: { token: DRIVER_TOKEN },
      transports: ['websocket'],
      reconnection: false,
    });

    const passengerSocket = io(`${BACKEND_URL}/gps`, {
      auth: { token: PASSENGER_TOKEN },
      transports: ['websocket'],
      reconnection: false,
    });

    const timeout = setTimeout(() => {
      driverSocket.disconnect();
      passengerSocket.disconnect();
      reject(new Error('GPS tracking test timeout'));
    }, 10000);

    driverSocket.on('connect', () => {
      console.log(`  → Driver ready`);
      passengerSocket.emit('gps:track_request', { rideId: RIDE_ID });
    });

    passengerSocket.on('connect', () => {
      console.log(`  → Passenger ready`);
    });

    passengerSocket.on('gps:track_receive', (data) => {
      console.log(`  → Tracking started: ${data.trackingStarted}`);
      clearTimeout(timeout);
      driverSocket.disconnect();
      passengerSocket.disconnect();
      resolve();
    });

    passengerSocket.on('error', (error) => {
      clearTimeout(timeout);
      driverSocket.disconnect();
      passengerSocket.disconnect();
      reject(error);
    });
  });
}

// Test 6: Invalid token rejection
async function testInvalidToken() {
  return new Promise<void>((resolve, reject) => {
    const socket = io(BACKEND_URL, {
      auth: { token: 'invalid-token-xyz' },
      transports: ['websocket'],
      reconnection: false,
    });

    const timeout = setTimeout(() => {
      socket.disconnect();
      reject(new Error('Expected connection error, but connection succeeded'));
    }, 5000);

    socket.on('connect', () => {
      clearTimeout(timeout);
      socket.disconnect();
      reject(new Error('Should not connect with invalid token'));
    });

    socket.on('connect_error', (error) => {
      clearTimeout(timeout);
      console.log(`  → Invalid token rejected: ${error.message}`);
      socket.disconnect();
      resolve();
    });
  });
}

// Run all tests
async function runAllTests() {
  console.log(`
╔════════════════════════════════════╗
║  Socket.io GPS E2E Tests           ║
║  Backend: ${BACKEND_URL.padEnd(28)}║
╚════════════════════════════════════╝
  `);

  await runTest('1. Driver authentication', testDriverAuth);
  await runTest('2. Passenger authentication', testPassengerAuth);
  await runTest('3. GPS namespace connection', testGPSNamespace);
  await runTest('4. GPS update broadcast', testGPSUpdate);
  await runTest('5. GPS tracking request', testGPSTracking);
  await runTest('6. Invalid token rejection', testInvalidToken);

  // Print summary
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  const duration = results.reduce((sum, r) => sum + r.duration, 0);

  console.log(`
╔════════════════════════════════════╗
║  Test Results                      ║
╠════════════════════════════════════╣
║  Passed: ${passed}/${total}                        ║
║  Duration: ${duration}ms                      ║
║  Status: ${passed === total ? '✓ ALL PASSED' : '✗ FAILED'.padEnd(27)}║
╚════════════════════════════════════╝
  `);

  if (passed !== total) {
    console.log('\nFailures:');
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`  ✗ ${r.name}: ${r.error}`);
      });
    process.exit(1);
  }
}

// Run tests
runAllTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
