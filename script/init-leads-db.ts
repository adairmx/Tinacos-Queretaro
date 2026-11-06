import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function init() {
  console.log('Connecting to database...');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS providers (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      coverage_areas TEXT,
      status TEXT NOT NULL DEFAULT 'prospecto',
      experience_years INTEGER DEFAULT 1,
      has_own_equipment INTEGER DEFAULT 1,
      commission_agreed_pct INTEGER DEFAULT 30,
      rating INTEGER DEFAULT 5,
      completed_services INTEGER DEFAULT 0,
      notes TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      client_name TEXT NOT NULL,
      client_phone TEXT NOT NULL,
      city TEXT NOT NULL DEFAULT 'Querétaro',
      address_colonia TEXT,
      service_type TEXT NOT NULL,
      capacity_liters INTEGER,
      estimated_price INTEGER DEFAULT 1050,
      provider_payout INTEGER,
      commission_amount INTEGER,
      preferred_date TEXT,
      source TEXT NOT NULL DEFAULT 'web_cotizador',
      status TEXT NOT NULL DEFAULT 'nuevo',
      assigned_provider_id INTEGER REFERENCES providers(id),
      notes TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
  console.log('Tables providers and leads created successfully!');
  await pool.end();
}

init().catch(err => {
  console.error('Error creating tables:', err);
  process.exit(1);
});
