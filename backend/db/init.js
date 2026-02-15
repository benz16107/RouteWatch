import Database from 'better-sqlite3';
import { mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data');
const dbPath = join(dataDir, 'traffic.db');

export function getDb() {
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
  return new Database(dbPath);
}

export function initDatabase() {
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS collection_jobs (
      id TEXT PRIMARY KEY,
      start_location TEXT NOT NULL,
      end_location TEXT NOT NULL,
      start_time TEXT DEFAULT (datetime('now')),
      end_time TEXT,
      cycle_minutes INTEGER DEFAULT 60,
      duration_days INTEGER DEFAULT 7,
      navigation_type TEXT DEFAULT 'driving',
      avoid_highways INTEGER DEFAULT 0,
      avoid_tolls INTEGER DEFAULT 0,
      additional_routes INTEGER DEFAULT 0,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS route_snapshots (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      route_index INTEGER DEFAULT 0,
      collected_at TEXT NOT NULL,
      duration_seconds INTEGER,
      distance_meters INTEGER,
      route_details TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (job_id) REFERENCES collection_jobs(id)
    );

    CREATE INDEX IF NOT EXISTS idx_snapshots_job_collected 
      ON route_snapshots(job_id, collected_at);
    CREATE INDEX IF NOT EXISTS idx_snapshots_job_id ON route_snapshots(job_id);
  `);

  return db;
}

// Run init if executed directly
if (process.argv[1]?.endsWith('init.js')) {
  initDatabase();
  console.log('Database initialized at', dbPath);
}
