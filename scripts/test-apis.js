#!/usr/bin/env node
/**
 * Test Google Maps API connectivity
 * Run: node scripts/test-apis.js
 * Requires: .env with GOOGLE_MAPS_API_KEY (and optionally VITE_GOOGLE_MAPS_API_KEY)
 */
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

// Load .env from project root (where npm run is executed)
const envPath = join(process.cwd(), '.env')

function loadEnv() {
  if (!existsSync(envPath)) {
    console.error('❌ .env not found at', envPath)
    process.exit(1)
  }
  const content = readFileSync(envPath, 'utf8')
  const env = {}
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    env[key] = val
  }
  return env
}

// API key: env var first (for scripting), then .env file
const env = loadEnv()
const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY
  || env.GOOGLE_MAPS_API_KEY || env.VITE_GOOGLE_MAPS_API_KEY

if (!apiKey || apiKey === 'your_api_key_here') {
  console.error('❌ No valid API key. Set GOOGLE_MAPS_API_KEY or VITE_GOOGLE_MAPS_API_KEY in .env')
  console.error('   Or run: GOOGLE_MAPS_API_KEY=your_key node scripts/test-apis.js')
  process.exit(1)
}

console.log('Using API key:', apiKey.substring(0, 10) + '...\n')

console.log('Testing Google Maps APIs...\n')

// Test 1: Directions API
async function testDirections() {
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=San+Francisco,CA&destination=Oakland,CA&key=${apiKey}`
  const res = await fetch(url)
  const data = await res.json()
  if (data.status === 'OK') {
    const leg = data.routes[0]?.legs[0]
    console.log('✅ Directions API: OK')
    console.log(`   Route: ${leg?.start_address} → ${leg?.end_address}`)
    console.log(`   Duration: ${leg?.duration?.text}, Distance: ${leg?.distance?.text}`)
    return true
  } else {
    console.log('❌ Directions API:', data.status, data.error_message || '')
    return false
  }
}

// Test 2: Places API (Autocomplete)
async function testPlaces() {
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=San+Fran&key=${apiKey}`
  const res = await fetch(url)
  const data = await res.json()
  if (data.status === 'OK' || data.status === 'ZERO_RESULTS') {
    console.log('✅ Places API (Autocomplete): OK')
    if (data.predictions?.length) {
      console.log(`   Sample: "${data.predictions[0].description}"`)
    }
    return true
  } else {
    console.log('❌ Places API:', data.status, data.error_message || '')
    console.log('   → Enable "Places API" at https://console.cloud.google.com/apis/library/places-backend.googleapis.com')
    return false
  }
}

// Test 3: Geocoding (used by Maps JS API)
async function testGeocoding() {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=San+Francisco&key=${apiKey}`
  const res = await fetch(url)
  const data = await res.json()
  if (data.status === 'OK') {
    console.log('✅ Geocoding API: OK')
    return true
  } else {
    console.log('❌ Geocoding API:', data.status, data.error_message || '')
    console.log('   → Enable "Geocoding API" at https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com')
    return false
  }
}

(async () => {
  const r1 = await testDirections()
  const r2 = await testPlaces()
  const r3 = await testGeocoding()

  console.log('\n' + (r1 && r2 && r3 ? '✅ All APIs working!' : '⚠️  Some APIs failed. Check console above.'))
  process.exit(r1 && r2 && r3 ? 0 : 1)
})().catch((err) => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
