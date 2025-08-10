const express = require('express');
const path = require('path');
const cors = require('cors');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, '..', 'data', 'bus_booking.sqlite');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Initialize database and tables
const db = new Database(DB_PATH);

db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS buses (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    departure_time TEXT NOT NULL,
    arrival_time TEXT NOT NULL,
    fare_cents INTEGER NOT NULL,
    total_seats INTEGER NOT NULL DEFAULT 45
  );
  CREATE TABLE IF NOT EXISTS trips (
    id INTEGER PRIMARY KEY,
    bus_id INTEGER NOT NULL,
    travel_date TEXT NOT NULL,
    UNIQUE (bus_id, travel_date),
    FOREIGN KEY (bus_id) REFERENCES buses(id)
  );
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY,
    trip_id INTEGER NOT NULL,
    seat_number INTEGER NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    booked_at TEXT NOT NULL,
    UNIQUE (trip_id, seat_number),
    FOREIGN KEY (trip_id) REFERENCES trips(id)
  );
`);

// Seed a few buses if none exist
const busCount = db.prepare('SELECT COUNT(*) AS c FROM buses').get().c;
if (busCount === 0) {
  const insertBus = db.prepare(`INSERT INTO buses (name, origin, destination, departure_time, arrival_time, fare_cents, total_seats)
    VALUES (@name, @origin, @destination, @departure_time, @arrival_time, @fare_cents, @total_seats)`);
  const buses = [
    {
      name: 'Express Line 1', origin: 'City A', destination: 'City B',
      departure_time: '08:00', arrival_time: '12:30', fare_cents: 1500_00, total_seats: 45
    },
    {
      name: 'Express Line 2', origin: 'City A', destination: 'City C',
      departure_time: '09:30', arrival_time: '14:00', fare_cents: 1800_00, total_seats: 45
    },
    {
      name: 'Express Line 3', origin: 'City B', destination: 'City D',
      departure_time: '16:15', arrival_time: '20:00', fare_cents: 2200_00, total_seats: 45
    }
  ];
  const insertMany = db.transaction((rows) => {
    for (const row of rows) insertBus.run(row);
  });
  insertMany(buses);
}

function getOrCreateTrip(busId, travelDate) {
  const existing = db.prepare('SELECT id FROM trips WHERE bus_id = ? AND travel_date = ?').get(busId, travelDate);
  if (existing) return existing.id;
  const info = db.prepare('INSERT INTO trips (bus_id, travel_date) VALUES (?, ?)').run(busId, travelDate);
  return info.lastInsertRowid;
}

// List buses
app.get('/api/buses', (req, res) => {
  const rows = db.prepare('SELECT id, name, origin, destination, departure_time, arrival_time, fare_cents, total_seats FROM buses ORDER BY id').all();
  res.json(rows);
});

// Get availability for a bus on a date
app.get('/api/availability', (req, res) => {
  const busId = Number(req.query.busId);
  const travelDate = String(req.query.date || '').trim();
  if (!busId || !travelDate) return res.status(400).json({ error: 'Missing busId or date' });

  const bus = db.prepare('SELECT total_seats FROM buses WHERE id = ?').get(busId);
  if (!bus) return res.status(404).json({ error: 'Bus not found' });

  const tripId = getOrCreateTrip(busId, travelDate);
  const booked = db.prepare('SELECT seat_number FROM bookings WHERE trip_id = ? ORDER BY seat_number').all(tripId);
  const bookedSet = new Set(booked.map(r => r.seat_number));

  const seats = [];
  for (let s = 1; s <= bus.total_seats; s += 1) {
    seats.push({ number: s, available: !bookedSet.has(s) });
  }
  res.json({ tripId, seats, totalSeats: bus.total_seats });
});

// Create a booking
app.post('/api/book', (req, res) => {
  const { busId, date, customerName, customerPhone, seatNumbers } = req.body || {};
  if (!busId || !date || !customerName || !customerPhone || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const bus = db.prepare('SELECT total_seats FROM buses WHERE id = ?').get(busId);
  if (!bus) return res.status(404).json({ error: 'Bus not found' });

  const tripId = getOrCreateTrip(busId, date);
  const nowIso = new Date().toISOString();

  try {
    db.transaction(() => {
      for (const sn of seatNumbers) {
        if (sn < 1 || sn > bus.total_seats) throw new Error(`Invalid seat number ${sn}`);
        db.prepare(`INSERT INTO bookings (trip_id, seat_number, customer_name, customer_phone, booked_at)
          VALUES (?, ?, ?, ?, ?)`)
          .run(tripId, sn, customerName, customerPhone, nowIso);
      }
    })();
  } catch (e) {
    if (String(e.message).includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'One or more seats already booked' });
    }
    return res.status(400).json({ error: e.message || 'Booking failed' });
  }

  res.json({ success: true, tripId, seatsBooked: seatNumbers });
});

// Fallback to index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});