export interface CitySEOData {
  slug: string;
  name: string;
  state: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  heroBadge: string;
  heroHeading: string;
  heroHighlight: string;
  heroSubtitle: string;
  depositoName: string;
  zones: string[];
  localWaterProblemTitle: string;
  localWaterProblemDesc: string;
  faqs: { question: string; answer: string }[];
  geoCoordinates: { latitude: number; longitude: number };
}

export const citiesData: Record<string, CitySEOData> = {
  // 1. CDMX
  cdmx: {
    slug: "cdmx",
    name: "Ciudad de México (CDMX)",
    state: "CDMX",
    seoTitle: "Lavado de Tinacos y Cisternas en CDMX | Servicio Profesional Garantizado",
    seoDescription: "Servicio experto de lavado y desinfección de tinacos y cisternas en CDMX y zona metropolitana. Retiro de lodos, desinfección profunda y atención rápida en las 16 alcaldías.",
    keywords: [
      "lavado de tinacos cdmx",
      "lavado de cisternas cdmx",
      "limpieza de tinacos en ciudad de mexico",
      "desinfeccion de cisternas cdmx",
      "lavado de tinacos benito juarez",
      "lavado de tinacos coyoacan",
      "lavado de cisternas miguel hidalgo"
    ],
    heroBadge: "Servicio Profesional en CDMX",
    heroHeading: "Lavado de Tinacos",
    heroHighlight: "y Cisternas en CDMX",
    heroSubtitle: "Limpieza profunda, extracción de sedimentos y desinfección certificada con grado bactericida en las 16 alcaldías de la Ciudad de México.",
    depositoName: "Tinacos y Cisternas",
    zones: [
      "Benito Juárez (Del Valle, Narvarte, Nápoles)",
      "Coyoacán (Del Carmen, Campestre, Culhuacán)",
      "Miguel Hidalgo (Polanco, Anzures, Lomas)",
      "Cuauhtémoc (Roma, Condesa, Juárez, Centro)",
      "Álvaro Obregón (San Ángel, Guadalupe Inn)",
      "Tlalpan (Coapa, Toriello Guerra)",
      "Cuajimalpa (Santa Fe, Bosques)",
      "Iztapalapa y Zona Oriente",
      "Gustavo A. Madero (Lindavista)",
      "Azcapotzalco (Clavería, Refinería)"
    ],
    localWaterProblemTitle: "¿Por qué es urgente lavar tu cisterna y tinaco en la CDMX?",
    localWaterProblemDesc: "La red hidráulica de la Ciudad de México sufre constantes variaciones de presión, tandeos y agua con altos niveles de sedimentos y sarro provenientes del sistema Cutzamala y pozos profundos. Los lodos acumulados contaminan el agua de uso diario, propician bacterias y dañan regaderas y calentadores.",
    faqs: [
      {
        question: "¿Cada cuánto tiempo se debe lavar el tinaco o cisterna en CDMX?",
        answer: "La COFEPRIS recomienda realizar el lavado y desinfección cada 6 meses, especialmente en la CDMX debido a la turbiedad y sedimentos habituales de la red."
      },
      {
        question: "¿Tiran toda el agua de la cisterna o tinaco?",
        answer: "Recomendamos que unos días antes procures consumir el nivel de agua al mínimo. Al llegar, utilizamos bombas sumergibles de achique para retirar el remanente con lodos del fondo."
      }
    ],
    geoCoordinates: { latitude: 19.4326, longitude: -99.1332 },
  },

  // 2. EDOMEX (Estado de México)
  edomex: {
    slug: "edomex",
    name: "Estado de México (Edomex)",
    state: "Estado de México",
    seoTitle: "Lavado de Tinacos y Cisternas en Edomex | Zona Metropolitana y Poniente",
    seoDescription: "Servicio profesional de limpieza y desinfección de tinacos y cisternas en Naucalpan, Huixquilucan, Tlalnepantla, Atizapán y zona conurbada del Edomex.",
    keywords: [
      "lavado de tinacos edomex",
      "lavado de cisternas naucalpan",
      "lavado de tinacos satelite",
      "limpieza de cisternas huixquilucan",
      "lavado de tinacos atizapan",
      "desinfeccion de tinacos tlalnepantla"
    ],
    heroBadge: "Cobertura en Todo el Estado de México",
    heroHeading: "Lavado de Tinacos",
    heroHighlight: "y Cisternas en Edomex",
    heroSubtitle: "Atención especializada para residencias, fraccionamientos y comercios en Naucalpan, Interlomas, Satélite, Tlalnepantla, Atizapán y Cuautitlán.",
    depositoName: "Tinacos y Cisternas",
    zones: [
      "Naucalpan (Ciudad Satélite, Echegaray, Lomas Verdes)",
      "Huixquilucan (Interlomas, Bosque Real, Tecamachalco)",
      "Tlalnepantla (Valle Dorado, Viveros, Arboledas)",
      "Atizapán de Zaragoza (Zona Esmeralda, Bellavista)",
      "Cuautitlán Izcalli y Cuautitlán",
      "Coacalco y Tultitlán",
      "Ecatepec y Nezahualcóyotl"
    ],
    localWaterProblemTitle: "El impacto del desabasto y tandeo de agua en el Estado de México",
    localWaterProblemDesc: "En los municipios conurbados del Edomex, las reducciones continuas del caudal del Cutzamala provocan que el agua llegue con aire, óxido y tierra removida de las tuberías secas. Cuando las cisternas se llenan tras un corte, capturan sedimentos oscuros que forman una gruesa capa de lodo en el fondo.",
    faqs: [
      {
        question: "¿Atienden fraccionamientos cerrados con caseta de vigilancia?",
        answer: "Sí, nuestro personal se identifica debidamente y cumple con todos los protocolos de acceso de seguridad de fraccionamientos residenciales."
      },
      {
        question: "¿Ofrecen factura fiscal por el servicio?",
        answer: "Sí, emitimos factura para particulares, condominios, colegios y empresas."
      }
    ],
    geoCoordinates: { latitude: 19.5045, longitude: -99.2307 },
  },

  // 3. GUADALAJARA Y ZAPOPAN
  guadalajara: {
    slug: "guadalajara",
    name: "Guadalajara y Zapopan",
    state: "Jalisco",
    seoTitle: "Lavado de Tinacos y Aljibes en Guadalajara y Zapopan | Servicio Profesional",
    seoDescription: "Limpieza y desinfección profunda de tinacos, aljibes y cisternas en Guadalajara, Zapopan y Zona Metropolitana. Equipo a presión, desazolve y garantía de agua pura.",
    keywords: [
      "lavado de aljibes guadalajara",
      "lavado de tinacos guadalajara",
      "limpieza de aljibes zapopan",
      "desinfeccion de tinacos y aljibes jalisco",
      "lavado de cisterna zapopan"
    ],
    heroBadge: "Servicio Profesional en Guadalajara y Zapopan",
    heroHeading: "Lavado de Tinacos",
    heroHighlight: "y Aljibes en Guadalajara",
    heroSubtitle: "Especialistas en limpieza profunda y desinfección de aljibes subterráneos y tinacos en toda la Zona Metropolitana de Guadalajara y Zapopan.",
    depositoName: "Tinacos y Aljibes",
    zones: [
      "Zapopan (Puerta de Hierro, Providencia, Valle Real)",
      "Guadalajara (Americana, Moderna, Chapultepec, Centro)",
      "Zapopan Norte (Santa Margarita, La Cima, Capital Norte)",
      "Zona Sur (Bugambilias, El Palomar, Santa Anita)",
      "Tlaquepaque Centro y Residencial",
      "Tonalá y Zona Oriente",
      "Ciudad Granja y Jardines Vallarta"
    ],
    localWaterProblemTitle: "Mantenimiento de aljibes y prevención de turbiedad en Guadalajara",
    localWaterProblemDesc: "En Jalisco, los aljibes son la columna vertebral del abastecimiento. El agua suministrada suele acarrear tierra y sales minerales que se transforman en una biopelícula viscosa en paredes y piso del aljibe, dañando la bomba sumergible y generando mal olor en el agua.",
    faqs: [
      {
        question: "¿En Guadalajara se le llama aljibe o cisterna?",
        answer: "En Jalisco se le conoce popularmente como aljibe. Nuestro servicio atiende tanto aljibes de mampostería y concreto como tinacos y cisternas Rotoplas."
      }
    ],
    geoCoordinates: { latitude: 20.6597, longitude: -103.3496 },
  },

  // 4. MONTERREY
  monterrey: {
    slug: "monterrey",
    name: "Monterrey y Zona Metropolitana",
    state: "Nuevo León",
    seoTitle: "Lavado de Tinacos y Cisternas en Monterrey | Limpieza Profunda NL",
    seoDescription: "Servicio profesional de lavado de tinacos y cisternas en Monterrey, San Pedro, Cumbres y Guadalupe. Desinfección bactericida y preparación para almacenar agua segura.",
    keywords: [
      "lavado de tinacos monterrey",
      "lavado de cisternas monterrey",
      "limpieza de tinacos san pedro garza garcia",
      "lavado de tinacos cumbres",
      "desinfeccion de tinacos nuevo leon"
    ],
    heroBadge: "Servicio Profesional en Nuevo León",
    heroHeading: "Lavado de Tinacos",
    heroHighlight: "y Cisternas en Monterrey",
    heroSubtitle: "Mantén tu reserva de agua 100% limpia y potable. Servicio rápido en Monterrey, San Pedro, San Nicolás, Guadalupe y Santa Catarina.",
    depositoName: "Tinacos y Cisternas",
    zones: [
      "San Pedro Garza García (Del Valle, Valle Oriente)",
      "Monterrey Poniente (Cumbres, San Jerónimo, Mitras)",
      "Monterrey Sur (Contry, Carretera Nacional)",
      "San Nicolás de los Garza (Anáhuac, Las Puentes)",
      "Guadalupe (Linda Vista, Contry Sol)",
      "Santa Catarina y La Fama",
      "Apodaca Centro y Huinalá"
    ],
    localWaterProblemTitle: "Protege tu reserva de agua limpia en Monterrey",
    localWaterProblemDesc: "El almacenamiento prolongado de agua bajo las altas temperaturas del norte fomenta la rápida proliferación de algas microscópicas, verdín y bacterias si no se desinfecta periódicamente.",
    faqs: [
      {
        question: "¿Por qué se forma verdín en el tinaco?",
        answer: "El calor y el sol en tinacos con tapas defectuosas aceleran la fotosíntesis de algas. Nuestro servicio elimina el verdín y sella correctamente la tapa."
      }
    ],
    geoCoordinates: { latitude: 25.6866, longitude: -100.3161 },
  },

  // 5. PUEBLA
  puebla: {
    slug: "puebla",
    name: "Puebla y Cholula",
    state: "Puebla",
    seoTitle: "Lavado de Tinacos y Cisternas en Puebla y Cholula | Agua Limpia Garantizada",
    seoDescription: "Servicio profesional de limpieza y desinfección de tinacos y cisternas en Puebla, Angelópolis y Cholula. Eliminación de sarro, lodos y desinfección bactericida.",
    keywords: [
      "lavado de tinacos puebla",
      "lavado de cisternas puebla",
      "limpieza de tinacos angelopolis",
      "lavado de tinacos san andres cholula",
      "desinfeccion de cisternas puebla"
    ],
    heroBadge: "Servicio Especializado en Puebla y Cholula",
    heroHeading: "Lavado de Tinacos",
    heroHighlight: "y Cisternas en Puebla",
    heroSubtitle: "Elimina el sarro, la turbiedad y los sedimentos de tu agua en la Ciudad de Puebla, San Andrés Cholula y Angelópolis.",
    depositoName: "Tinacos y Cisternas",
    zones: [
      "Angelópolis y Lomas de Angelópolis (todas las zonas)",
      "San Andrés Cholula y San Pedro Cholula",
      "La Paz y Zavaleta",
      "Las Ánimas y El Vergel",
      "Centro Histórico y Analco",
      "Cuautlancingo y Parque Industrial FINSA"
    ],
    localWaterProblemTitle: "El problema del sarro y la cal en el agua de Puebla",
    localWaterProblemDesc: "El agua en la cuenca de Puebla contiene alta concentración de sales minerales y sarro que se adhieren a las paredes de los depósitos, provocando incrustaciones donde anidan bacterias.",
    faqs: [
      {
        question: "¿Remueven las costras de sarro?",
        answer: "Sí, aplicamos cepillado industrial y lavado a presión con hidrolavadora para retirar el sarro incrustado."
      }
    ],
    geoCoordinates: { latitude: 19.0414, longitude: -98.2063 },
  },

  // 6. TOLUCA Y METEPEC
  toluca: {
    slug: "toluca",
    name: "Toluca y Metepec",
    state: "Estado de México",
    seoTitle: "Lavado de Tinacos y Cisternas en Toluca y Metepec | Servicio Profesional",
    seoDescription: "Limpieza y desinfección de tinacos y cisternas en Toluca, Metepec, Lerma y San Mateo Atenco. Extracción de sedimentos y lodos con equipo profesional.",
    keywords: [
      "lavado de tinacos toluca",
      "lavado de cisternas metepec",
      "limpieza de tinacos lerma",
      "desinfeccion de cisternas toluca y metepec"
    ],
    heroBadge: "Servicio Profesional en Valle de Toluca",
    heroHeading: "Lavado de Tinacos",
    heroHighlight: "y Cisternas en Toluca y Metepec",
    heroSubtitle: "Agua cristalina garantizada para residencias y comercios en Toluca, Metepec, Lerma y San Mateo Atenco.",
    depositoName: "Tinacos y Cisternas",
    zones: [
      "Metepec (La Asunción, Providencia, San Carlos)",
      "Toluca Centro, Colón y Seminario",
      "Cacalomacán y Calpulli",
      "San Mateo Atenco y Lerma Residencial",
      "Zinacantepec"
    ],
    localWaterProblemTitle: "Sedimentos pesados en depósitos del Valle de Toluca",
    localWaterProblemDesc: "El agua procedente de pozos profundos en el Valle de Toluca suele arrastrar partículas finas de arena y arcilla que se asientan silenciosamente en las cisternas residenciales formando fango contaminante.",
    faqs: [
      {
        question: "¿Cuánto tiempo dura el lavado en Toluca/Metepec?",
        answer: "Aproximadamente 2 horas para una cisterna estándar y 1 hora para tinaco."
      }
    ],
    geoCoordinates: { latitude: 19.2826, longitude: -99.6557 },
  },

  // 7. CUERNAVACA
  cuernavaca: {
    slug: "cuernavaca",
    name: "Cuernavaca y Jiutepec",
    state: "Morelos",
    seoTitle: "Lavado de Tinacos y Cisternas en Cuernavaca | Casas y Residencias",
    seoDescription: "Servicio profesional de limpieza y desinfección de tinacos y cisternas en Cuernavaca, Jiutepec y Temixco. Ideal para casas de descanso y residencias.",
    keywords: [
      "lavado de tinacos cuernavaca",
      "lavado de cisternas cuernavaca",
      "limpieza de cisternas jiutepec",
      "desinfeccion de tinacos morelos"
    ],
    heroBadge: "Servicio Profesional en Morelos",
    heroHeading: "Lavado de Tinacos",
    heroHighlight: "y Cisternas en Cuernavaca",
    heroSubtitle: "Especialistas en cisternas grandes y albercas/tinacos en Cuernavaca, Jiutepec, Temixco y Emiliano Zapata.",
    depositoName: "Tinacos y Cisternas",
    zones: [
      "Cuernavaca (Vista Hermosa, Delicias, Acapantzingo)",
      "Rancho Cortés y Ahuatepec",
      "Jiutepec (Civac, Sumiya, Progreso)",
      "Temixco y Burgos",
      "Emiliano Zapata"
    ],
    localWaterProblemTitle: "Hojas, tierra y raíces en cisternas de Morelos",
    localWaterProblemDesc: "Por la exuberante vegetación y clima cálido de Cuernavaca, muchas cisternas sufren filtraciones de raíces, caída de hojas y proliferación de hongos si no cuentan con tapas selladas herméticamente.",
    faqs: [
      {
        question: "¿Lavan cisternas de gran capacidad (más de 10,000L)?",
        answer: "Sí, contamos con bombas sumergibles de alto caudal para vaciar y lavar cisternas de cualquier dimensión."
      }
    ],
    geoCoordinates: { latitude: 18.9242, longitude: -99.2216 },
  },

  // 8. LEÓN
  leon: {
    slug: "leon",
    name: "León",
    state: "Guanajuato",
    seoTitle: "Lavado de Tinacos y Cisternas en León Gto | Servicio Profesional",
    seoDescription: "Servicio certificado de limpieza y desinfección de tinacos y aljibes en León Guanajuato. Eliminación de lodos, sarro y bacterias con equipo profesional.",
    keywords: [
      "lavado de tinacos leon gto",
      "lavado de aljibes leon",
      "limpieza de cisternas leon guanajuato",
      "desinfeccion de tinacos leon"
    ],
    heroBadge: "Servicio Profesional en León Gto",
    heroHeading: "Lavado de Tinacos",
    heroHighlight: "y Aljibes en León Gto",
    heroSubtitle: "Desinfección profunda y agua pura garantizada en Gran Jardín, El Molino, Campestre y toda la ciudad de León.",
    depositoName: "Tinacos y Aljibes",
    zones: [
      "Gran Jardín y El Molino",
      "Campestre y Cerro Gordo",
      "Punta del Este y Mayorca",
      "Centro, San Juan de Dios y Andrade",
      "Zona Sur (Delta, Real Delta)"
    ],
    localWaterProblemTitle: "El agua en León y la necesidad de lavar aljibes",
    localWaterProblemDesc: "El estrés hídrico en León obliga a la extracción a gran profundidad, provocando arrastre de sales y minerales pesados que se acumulan en el fondo de aljibes y tinacos.",
    faqs: [
      {
        question: "¿Atienden fraccionamientos cerrados en León?",
        answer: "Sí, cubrimos todas las privadas y zonas residenciales de la zona norte, sur y oriente."
      }
    ],
    geoCoordinates: { latitude: 21.1221, longitude: -101.6826 },
  },

  // 9. MÉRIDA
  merida: {
    slug: "merida",
    name: "Mérida",
    state: "Yucatán",
    seoTitle: "Lavado de Tinacos y Cisternas en Mérida | Retiro de Sarro y Cal",
    seoDescription: "Servicio especializado en limpieza y desinfección de tinacos y cisternas en Mérida Yucatán. Eliminación de sarro kárstico, lama y bacterias.",
    keywords: [
      "lavado de tinacos merida",
      "lavado de cisternas merida yucatan",
      "limpieza de tinacos altabrisa",
      "desinfeccion de tinacos merida"
    ],
    heroBadge: "Servicio Especializado en Yucatán",
    heroHeading: "Lavado de Tinacos",
    heroHighlight: "y Cisternas en Mérida",
    heroSubtitle: "Eliminamos el sarro extremo y el verdín en tinacos y cisternas en Mérida, Altabrisa, Temozón Norte y Cholul.",
    depositoName: "Tinacos y Cisternas",
    zones: [
      "Norte (Altabrisa, Montebello, Montecristo)",
      "Temozón Norte y Santa Gertrudis Copó",
      "Cholul y Conkal Residencial",
      "García Ginerés e Itzimná",
      "Francisco de Montejo y Las Américas"
    ],
    localWaterProblemTitle: "El sarro kárstico extremo de la península de Yucatán",
    localWaterProblemDesc: "El suelo calcáreo de Yucatán genera una de las aguas más duras del país. Las costras de cal y sarro cubren en pocos meses el interior del tinaco y generan obstrucciones en tuberías y regaderas.",
    faqs: [
      {
        question: "¿Pueden retirar el sarro pegado en Mérida?",
        answer: "Sí, aplicamos cepillado industrial para desprender las costras de cal sin debilitar la estructura del tinaco."
      }
    ],
    geoCoordinates: { latitude: 20.9674, longitude: -89.5926 },
  },

  // 10. SAN LUIS POTOSÍ
  "san-luis-potosi": {
    slug: "san-luis-potosi",
    name: "San Luis Potosí",
    state: "San Luis Potosí",
    seoTitle: "Lavado de Tinacos y Aljibes en San Luis Potosí | Servicio Certificado",
    seoDescription: "Servicio profesional de limpieza y desinfección de aljibes y tinacos en San Luis Potosí y Soledad. Agua pura y desinfección profunda.",
    keywords: [
      "lavado de aljibes san luis potosi",
      "lavado de tinacos slp",
      "limpieza de cisternas lomas slp",
      "desinfeccion de aljibes potosinos"
    ],
    heroBadge: "Servicio Certificado en SLP",
    heroHeading: "Lavado de Tinacos",
    heroHighlight: "y Aljibes en San Luis Potosí",
    heroSubtitle: "Atención rápida en Lomas, Tangamanga, Carranza, Pozos y Zona Industrial de San Luis Potosí.",
    depositoName: "Tinacos y Aljibes",
    zones: [
      "Lomas (1ra, 2da, 3ra y 4ta Sección)",
      "Tangamanga y Jardines del Estadio",
      "Balcones del Valle y Tequisquiapan",
      "Villa de Pozos y El Manantial",
      "Soledad de Graciano Sánchez"
    ],
    localWaterProblemTitle: "Mantenimiento preventivo por desabasto de la presa El Realito",
    localWaterProblemDesc: "Las fallas en el acueducto El Realito provocan que el agua de pozos emergentes llegue con turbiedad y sedimentos que se depositan rápidamente en el fondo del aljibe.",
    faqs: [
      {
        question: "¿Lavan aljibes tradicionales?",
        answer: "Sí, trabajamos con aljibes de cualquier material y tinacos en azotea."
      }
    ],
    geoCoordinates: { latitude: 22.1565, longitude: -100.9855 },
  },

  // 11. AGUASCALIENTES
  aguascalientes: {
    slug: "aguascalientes",
    name: "Aguascalientes",
    state: "Aguascalientes",
    seoTitle: "Lavado de Tinacos y Cisternas en Aguascalientes | Servicio Profesional",
    seoDescription: "Limpieza y desinfección profunda de tinacos y cisternas en Aguascalientes y Jesús María. Desinfección bactericida garantizada.",
    keywords: [
      "lavado de tinacos aguascalientes",
      "lavado de cisternas aguascalientes",
      "limpieza de aljibes jesus maria",
      "desinfeccion de tinacos ags"
    ],
    heroBadge: "Servicio Profesional en Aguascalientes",
    heroHeading: "Lavado de Tinacos",
    heroHighlight: "y Cisternas en Aguascalientes",
    heroSubtitle: "Agua limpia y transparente en Campestre, Bosques, Pulgas Pandas y todo Aguascalientes.",
    depositoName: "Tinacos y Cisternas",
    zones: [
      "Campestre y Bosques",
      "Pulgas Pandas y Trojes",
      "Jesús María Residencial",
      "Centro y Barrio de San Marcos",
      "Zona Sur y Morelos"
    ],
    localWaterProblemTitle: "Agua de pozo profundo y sarro en Aguascalientes",
    localWaterProblemDesc: "La extracción a gran profundidad en el estado genera agua caliente con alto contenido mineral que al enfriarse en tinacos y cisternas precipita sarro y lodos densos.",
    faqs: [
      {
        question: "¿Ofrecen garantía de trabajo?",
        answer: "Sí, el cliente verifica el depósito limpio antes de realizar el pago."
      }
    ],
    geoCoordinates: { latitude: 21.8853, longitude: -102.2916 },
  },

  // 12. CANCÚN
  cancun: {
    slug: "cancun",
    name: "Cancún y Riviera Maya",
    state: "Quintana Roo",
    seoTitle: "Lavado de Tinacos y Cisternas en Cancún y Playa del Carmen",
    seoDescription: "Servicio profesional de limpieza y desinfección de tinacos y cisternas en Cancún, Puerto Morelos y Playa del Carmen. Eliminación de algas y sarro.",
    keywords: [
      "lavado de tinacos cancun",
      "lavado de cisternas cancun",
      "limpieza de tinacos playa del carmen",
      "desinfeccion de cisternas quintana roo"
    ],
    heroBadge: "Servicio Profesional en el Caribe Mexicano",
    heroHeading: "Lavado de Tinacos",
    heroHighlight: "y Cisternas en Cancún",
    heroSubtitle: "Desinfección profunda y eliminación de sarro y lama en Cancún, Puerto Cancún, Huayacán y Playa del Carmen.",
    depositoName: "Tinacos y Cisternas",
    zones: [
      "Puerto Cancún y Zona Hotelera",
      "Avenida Huayacán y Cumbres Cancún",
      "Supermanzanas residenciales",
      "Playa del Carmen y Playacar",
      "Puerto Morelos"
    ],
    localWaterProblemTitle: "Humedad, calor y algas en depósitos de Cancún",
    localWaterProblemDesc: "El calor y la humedad constante de Quintana Roo aceleran la creación de verdín y bacterias en tinacos expuestos al sol, contaminando el agua de albercas y regaderas.",
    faqs: [
      {
        question: "¿Trabajan en condominios y hoteles boutique?",
        answer: "Sí, atendemos casas particulares, condominios horizontales y negocios."
      }
    ],
    geoCoordinates: { latitude: 21.1619, longitude: -86.8515 },
  }
};
