import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const initialProviders = [
  // Querétaro
  {
    name: "Plomería y Servicios Integrales Sr. Efrén Álvarez",
    phone: "4423445586",
    city: "Querétaro",
    state: "Querétaro",
    coverageAreas: "Juriquilla, Zibatá, El Pueblito, Corregidora, Milenio, Centro",
    status: "prospecto",
    experienceYears: 10,
    hasOwnEquipment: 1,
    commissionAgreedPct: 30,
    notes: "Especialista en lavado de tinacos, cisternas, bombas e hidroneumáticos. Tel alterno: 4423445886",
  },
  {
    name: "Plomeros Querétaro Urgencias",
    phone: "4426712493",
    city: "Querétaro",
    state: "Querétaro",
    coverageAreas: "Toda la zona metropolitana de Querétaro",
    status: "prospecto",
    experienceYears: 8,
    hasOwnEquipment: 1,
    commissionAgreedPct: 30,
    notes: "Lavado de tinacos, detección de fugas y desazolve. Tel alterno: 4426885767",
  },
  {
    name: "Plomería y Electricidad al Instante Qro",
    phone: "4421211771",
    city: "Querétaro",
    state: "Querétaro",
    coverageAreas: "Querétaro, Corregidora, El Marqués",
    status: "prospecto",
    experienceYears: 6,
    hasOwnEquipment: 1,
    commissionAgreedPct: 30,
    notes: "Limpieza de tinacos y cisternas, desazolve y mantenimiento general 24/7.",
  },
  {
    name: "El Mirador Servicios de Plomería",
    phone: "4422211889",
    city: "Querétaro",
    state: "Querétaro",
    coverageAreas: "El Mirador, Milenio, Centro, Cimatario",
    status: "prospecto",
    experienceYears: 5,
    hasOwnEquipment: 1,
    commissionAgreedPct: 30,
    notes: "Instalación de bombas y lavado de tinacos y cisternas.",
  },

  // Ciudad de México (CDMX)
  {
    name: "LavadeTic Cisternas y Tinacos CDMX",
    phone: "5521630370",
    city: "Ciudad de México",
    state: "CDMX",
    coverageAreas: "Benito Juárez, Cuauhtémoc, Coyoacán, Miguel Hidalgo, Álvaro Obregón",
    status: "prospecto",
    experienceYears: 8,
    hasOwnEquipment: 1,
    commissionAgreedPct: 30,
    notes: "Especialistas en limpieza profunda y desinfección. WhatsApp: 5580365724",
  },
  {
    name: "MiLgar Limpieza Profesional CDMX",
    phone: "5581043782",
    city: "Ciudad de México",
    state: "CDMX",
    coverageAreas: "Toda la CDMX y zona conurbada Edomex",
    status: "prospecto",
    experienceYears: 7,
    hasOwnEquipment: 1,
    commissionAgreedPct: 30,
    notes: "Vaciado, lavado y desinfección de tanques y cisternas residenciales y comerciales.",
  },
  {
    name: "RAESA Servicios Hidráulicos CDMX",
    phone: "5515297622",
    city: "Ciudad de México",
    state: "CDMX",
    coverageAreas: "CDMX Norte y Poniente, Naucalpan, Tlalnepantla",
    status: "prospecto",
    experienceYears: 12,
    hasOwnEquipment: 1,
    commissionAgreedPct: 30,
    notes: "Desazolves y lavado de cisternas. WhatsApp: 5561858451. Tel: 5558949697",
  },

  // Guadalajara y Zapopan (Jalisco)
  {
    name: "MS Soluciones Limpieza y Aljibes GDL",
    phone: "3326352879",
    city: "Guadalajara",
    state: "Jalisco",
    coverageAreas: "Guadalajara, Zapopan, Tlaquepaque, Tonalá",
    status: "prospecto",
    experienceYears: 5,
    hasOwnEquipment: 1,
    commissionAgreedPct: 30,
    notes: "Lavado y desinfección de tinacos y aljibes. Tel alterno: 3320368796",
  },
  {
    name: "Servicios Ecoclean Zapopan",
    phone: "3343489762",
    city: "Guadalajara",
    state: "Jalisco",
    coverageAreas: "Zapopan, Puerta de Hierro, Providencia, Bugambilias",
    status: "prospecto",
    experienceYears: 9,
    hasOwnEquipment: 1,
    commissionAgreedPct: 30,
    notes: "Mantenimiento, lavado y desinfección de cisternas, tinacos y aljibes con hidrolavadora.",
  },
  {
    name: "Fontanería y Drenajes Zapopan 24h",
    phone: "3338333188",
    city: "Guadalajara",
    state: "Jalisco",
    coverageAreas: "Zona Metropolitana de Guadalajara y Zapopan",
    status: "prospecto",
    experienceYears: 11,
    hasOwnEquipment: 1,
    commissionAgreedPct: 30,
    notes: "Limpieza y desinfección de aljibes y tinacos. Tel alterno: 3316223539",
  },
  {
    name: "Hidro Elect Servicios Hidráulicos",
    phone: "3333597236",
    city: "Guadalajara",
    state: "Jalisco",
    coverageAreas: "Col. Mariano Otero, La Calma, Las Águilas, Zapopan Sur",
    status: "prospecto",
    experienceYears: 6,
    hasOwnEquipment: 1,
    commissionAgreedPct: 30,
    notes: "Limpieza profunda de aljibes y tinacos, bombas y filtros.",
  },
  {
    name: "Fumigación y Limpieza Eficaz GDL",
    phone: "3338140050",
    city: "Guadalajara",
    state: "Jalisco",
    coverageAreas: "Guadalajara y Tlajomulco",
    status: "prospecto",
    experienceYears: 8,
    hasOwnEquipment: 1,
    commissionAgreedPct: 30,
    notes: "Lavado, desazolve y desinfección profunda de cisternas de 5,000L a 10,000L.",
  }
];

async function seed() {
  console.log("Insertando proveedores iniciales en la base de datos...");
  for (const prov of initialProviders) {
    await pool.query(`
      INSERT INTO providers (name, phone, city, state, coverage_areas, status, experience_years, has_own_equipment, commission_agreed_pct, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT DO NOTHING;
    `, [
      prov.name,
      prov.phone,
      prov.city,
      prov.state,
      prov.coverageAreas,
      prov.status,
      prov.experienceYears,
      prov.hasOwnEquipment,
      prov.commissionAgreedPct,
      prov.notes
    ]);
  }
  console.log(`Se insertaron exitosamente ${initialProviders.length} proveedores para prospección.`);
  await pool.end();
}

seed().catch(err => {
  console.error("Error sembrando proveedores:", err);
  process.exit(1);
});

