import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const newArticles = [
  {
    title: "¿Por qué sale agua amarilla o con mal olor en la regadera y grifos?",
    slug: "por-que-sale-agua-amarilla-o-mal-olor-en-la-regadera",
    excerpt: "Si abres la llave del baño o la regadera y el agua sale turbia, amarillenta o con olor desagradable, tu salud está en riesgo. Te explicamos las causas y cómo solucionarlo de inmediato.",
    category: "Salud y Calidad de Agua",
    readingTime: 6,
    date: "10 Ene 2026",
    author: "Equipo Técnico",
    image: "/attached_assets/generated_images/water_pipe_leak_detection_concept.png",
    content: `
El agua potable que entra a tu hogar debería ser inodora, incolora e insípida. Si al abrir las llaves del lavabo o meterte a bañar notas una tonalidad amarillenta, pardusca o detectas un olor desagradable (similar a drenaje, huevo podrido o tierra húmeda), no lo tomes a la ligera: **es una alerta roja de contaminación en tus depósitos de almacenamiento**.

## 1. La causa #1: Acumulación de lodos en el fondo de la cisterna o tinaco

El agua de la red pública arrastra permanentemente partículas diminutas de óxido, arcilla, tierra y sedimentos minerales. Aunque parezca limpia a simple vista, al entrar a la cisterna o tinaco estos sólidos se precipitan por gravedad y se asientan en el fondo.

Con el paso de los meses, se forma una gruesa capa de lodo que puede superar los 10 a 20 centímetros de espesor. Cuando el nivel de agua baja o la bomba arranca con fuerza, **el lodo se remueve y entra directamente a la tubería de tu casa**, tiñendo el agua de amarillo o café.

## 2. Bacterias anaeróbicas y azufre (el olor a caño o huevo podrido)

En el fondo de una cisterna o tinaco donde hay sedimentos orgánicos y poco oxígeno, proliferan colonias de bacterias que producen sulfuro de hidrógeno. Este gas es el responsable del característico olor a "huevo podrido" o humedad fétida que se intensifica al abrir el agua caliente, ya que la temperatura del calentador acelera la evaporación del gas.

## 3. Riesgos reales para la salud de tu familia

Utilizar agua contaminada para la higiene diaria no es solo desagradable, puede provocar:
* **Infecciones gastrointestinales:** Por ingestión accidental al lavarte los dientes o enjuagarte la boca (bacterias como *Escherichia Coli*, *Giardia* y *Salmonella*).
* **Dermatitis y comezón:** Irritación en la piel, sarpullido y foliculitis al bañarte con agua cargada de hongos o sedimentos.
* **Conjuntivitis e infecciones oculares:** Especialmente en niños pequeños y personas de la tercera edad.
* **Daño a tus electrodomésticos:** El sarro y lodo destruyen los diafragmas de las válvulas de llenado de inodoros, manchan la ropa en la lavadora y tapan los conductos del calentador o boiler.

## ¿Hervir el agua o usar pastillas de cloro es suficiente?

**No.** El cloro combate las bacterias superficiales, pero **no desaparece el lodo ni los metales pesados asentados en el fondo**. Echar pastillas de cloro a un tinaco sucio es como echar desinfectante a un piso lleno de fango: el sedimento seguirá contaminando el agua cada vez que se mueva.

## La solución definitiva

La única forma segura y duradera de resolver el agua amarilla o con mal olor es realizar un **lavado y desinfección profunda**:
1. Vaciado del depósito extrayendo los lodos del fondo con bomba sumergible de achique.
2. Lavado y tallado mecánico con agua a presión (hidrolavadora) y cepillado de paredes, losa y piso.
3. Desinfección bactericida con productos de grado sanitario aprobados por la Secretaría de Salud.
4. Enjuague y verificación del correcto funcionamiento de válvulas y sellado hermético de la tapa.
    `
  },
  {
    title: "¿Cada cuánto tiempo se debe lavar el tinaco y la cisterna según la Secretaría de Salud y COFEPRIS?",
    slug: "cada-cuanto-tiempo-lavar-tinaco-y-cisterna-cofepris",
    excerpt: "Conoce la norma oficial y las recomendaciones de las autoridades de salud en México sobre el mantenimiento preventivo de tinacos y cisternas residenciales y comerciales.",
    category: "Mantenimiento Preventivo",
    readingTime: 5,
    date: "18 Ene 2026",
    author: "Equipo Técnico",
    image: "/attached_assets/generated_images/water_tank_on_roof-BI6lztFO.png",
    content: `
Muchos propietarios en México esperan a que el agua salga con tierra o que el tinaco huela mal para acordarse de su existencia. Sin embargo, para cuando el agua presenta síntomas visibles, el contenedor ya lleva semanas o meses funcionando como un caldo de cultivo bacteriano.

## La recomendación oficial: Cada 6 meses

Tanto la **Comisión Federal para la Protección contra Riesgos Sanitarios (COFEPRIS)** como las Secretarías de Salud estatales y organismos operadores de agua (como CEA en Querétaro, SACMEX en CDMX y SIAPA en Guadalajara) establecen que los depósitos de almacenamiento de agua potable deben lavarse y desinfectarse **como mínimo cada 6 meses (2 veces al año)**.

En el caso de comercios, restaurantes, clínicas, escuelas o edificios departamentales, la normativa puede exigir revisiones trimestrales o certificados de lavado vigentes.

## ¿Por qué cada 6 meses si 'el agua se ve limpia'?

El depósito de agua de tu casa no es un sistema 100% sellado al vacío:
1. **La biopelícula invisible:** En menos de 90 días, las paredes interiores de plástico o concreto desarrollan una capa microscópica resbaladiza llamada *biofilm*, donde se adhieren bacterias y hongos.
2. **Entrada de polvo y partículas aéreas:** A través del respiradero del tinaco (jarro de aire) o imperfecciones en la tapa entran polvaredas, hollín de automóviles y esporas ambientales.
3. **Pinchazos de red:** Cada vez que tu colonia sufre un corte de agua o fuga en la calle, al restablecerse el servicio la presión remueve tierra y óxido de las tuberías públicas que van directo a tu cisterna.

## El calendario ideal de mantenimiento para tu hogar

Para no olvidar esta tarea preventiva, te sugerimos agendar tu servicio en dos momentos clave del año:
* **Primer lavado (Marzo - Abril):** Justo antes de que comience la temporada de calor y estiaje, cuando las altas temperaturas aceleran la reproducción de microorganismos en el tinaco.
* **Segundo lavado (Septiembre - Octubre):** Al finalizar la temporada de lluvias, para retirar los sedimentos extraordinarios que suelen entrar a las redes de distribución durante tormentas.

Llevar este control no solo protege la salud estomacal y de la piel de quienes viven en tu casa, sino que duplica la vida útil de tu hidroneumático, bomba de agua y tuberías.
    `
  },
  {
    title: "¿Cómo eliminar la lama verde (verdín) de tu tinaco para siempre?",
    slug: "como-eliminar-lama-verde-verdin-del-tinaco",
    excerpt: "El verdín o algas verdes en el interior del tinaco son más comunes de lo que crees. Descubre qué lo origina, cómo erradicarlo y el truco para que no vuelva a aparecer.",
    category: "Guías Prácticas",
    readingTime: 7,
    date: "24 Ene 2026",
    author: "Equipo Técnico",
    image: "/attached_assets/generated_images/clean_underground_cistern_interior-CiMablVl.png",
    content: `
Destapas tu tinaco en la azotea y te encuentras con un panorama desagradable: las paredes internas tienen una capa verdosa, babosa y en el agua flotan hebras de lama verde. ¿Por qué ocurre esto y qué consecuencias tiene?

## ¿Qué es exactamente el verdín?

El verdín no es suciedad común: son **colonias de algas fotosintéticas y cianobacterias**. Para vivir y reproducirse, estas algas necesitan únicamente dos cosas:
1. **Agua con nutrientes** (sales minerales y polvo ambiental).
2. **Luz solar.**

Si un tinaco estuviera en completa oscuridad, las algas jamás podrían crecer porque no pueden realizar la fotosíntesis.

## La razón por la que tienes lama en el tinaco

El 95% de los casos de verdín en azoteas se debe a uno de estos dos errores:
* **Tapa suelta, rota o ausente:** La tapa original se voló con el viento o se cuarteó por el sol, y fue reemplazada con una tabla, un pedazo de lámina o una lona amarrada que deja pasar rayos de sol.
* **Tinacos antiguos o de una sola capa:** Los tinacos transparentes o de polietileno blanco económico sin protección UV dejan pasar la radiación solar al interior, convirtiendo el depósito en un auténtico invernadero de algas.

## Cómo eliminarlo paso a paso

1. **Vaciado y raspado:** Es necesario vaciar el tinaco y tallar enérgicamente las paredes con un cepillo de cerdas duras para despegar todas las colonias de algas adheridas.
2. **Desinfección oxidante:** Se aplica una solución concentrada de hipoclorito de sodio sobre las paredes y fondo, dejándola actuar durante 20 a 30 minutos para destruir las esporas celulares que quedan invisibles en los poros del plástico.
3. **Enjuague profuso:** Se enjuaga con abundante agua a presión y se aspira todo el líquido verde residual hacia afuera (nunca por la tubería de la casa, para no tapar los grifos).
4. **La clave para que NO vuelva a salir:** Reemplazar de inmediato la tapa por una **tapa hermética roscada original** con protección contra rayos ultravioleta. Si no entra un solo haz de luz, las algas morirán por completo y nunca volverán a proliferar.
    `
  },
  {
    title: "¿Cuánto cuesta el lavado de tinacos y cisternas en México? Guía de precios 2026",
    slug: "cuanto-cuesta-lavado-de-tinacos-y-cisternas-precios-mexico",
    excerpt: "Analizamos las tarifas reales en el mercado mexicano para el lavado de depósitos de agua: desde servicios básicos hasta limpiezas profundas con hidrolavadora.",
    category: "Precios y Consejos",
    readingTime: 6,
    date: "02 Feb 2026",
    author: "Equipo Técnico",
    image: "/attached_assets/generated_images/water_tank_vs_cistern_comparison.png",
    content: `
Contratar el servicio de limpieza de tinaco o cisterna es una de las inversiones con mayor retorno para el mantenimiento del hogar. Sin embargo, en internet y en la calle existe una gran disparidad de presupuestos: personas que cobran $300 pesos y empresas que cotizan más de $2,500.

¿Cuánto es lo justo y qué deberías esperar por tu dinero? Aquí te lo detallamos con transparencia.

## Rangos de precios promedio en México

Para casas y residencias particulares, los precios de mercado se dividen según la capacidad y tipo de depósito:

### 1. Lavado de Tinaco (de 450 a 1,100 litros)
* **Precio promedio justo:** **$1,000 a $1,150 MXN**
* **Qué debe incluir:** Acceso a azotea, vaciado del remanente con lodo, tallado a presión interior de paredes y piso, desinfección bactericida de grado alimenticio, revisión de la válvula de flotador y sellado de tapa.
* **Tiempo estimado:** 1 a 1.5 horas.

### 2. Lavado de Cisterna o Aljibe (hasta 5,000 litros)
* **Precio promedio justo:** **$1,350 a $1,500 MXN**
* **Qué debe incluir:** Introducción de bomba sumergible eléctrica de achique para extraer agua estancada y lodos pesados del fondo, descenso seguro del técnico, lavado a presión con hidrolavadora en muros, losa y piso, desinfección total y revisión de pichancha/válvula de retención.
* **Tiempo estimado:** 2 a 3 horas.

### 3. Paquete Dúo (Tinaco + Cisterna en la misma visita)
* **Precio promedio en paquete:** **$2,100 a $2,300 MXN** (habitualmente representa un ahorro de $200 a $400 pesos respecto a contratarlos por separado).

## ¿Por qué desconfiar de servicios 'demasiado baratos' ($300 - $400)?

En muchos oficios informales, servicios con precios sospechosamente bajos suelen implicar malas prácticas que pueden salirte muy caras:
* **Solo enjuagan con escoba:** En lugar de retirar los lodos con bomba hacia el drenaje exterior, abren la válvula de tu casa y empujan todo el lodo hacia tus tuberías, provocando que se tapen los monomandos, regaderas y el serpentín del calentador.
* **Uso de detergentes con aroma o químicos tóxicos:** Usar detergente en polvo para ropa o cloro industrial sin dosificar deja residuos jabonosos que tardan semanas en enjuagarse y contaminan el agua que consumes.
* **Riesgo en azotea:** Si no cuentan con herramientas adecuadas o experiencia, pueden fracturar las tuberías de PVC o las conexiones de salida del tinaco.

Exige siempre un servicio formal, con equipo a presión, bombas de achique y productos desinfectantes especializados.
    `
  },
  {
    title: "Sarro en el tinaco y calentador de agua: ¿Cómo evitar que tape tus tuberías?",
    slug: "sarro-en-tinaco-y-calentador-como-evitar-que-tape-tuberias",
    excerpt: "El sarro y la cal son el enemigo silencioso de las instalaciones hidráulicas. Te explicamos cómo se forma y el método efectivo para combatirlo.",
    category: "Mantenimiento Preventivo",
    readingTime: 6,
    date: "12 Feb 2026",
    author: "Equipo Técnico",
    image: "/attached_assets/generated_images/low_water_pressure_faucet.png",
    content: `
¿Has notado que la presión de tu regadera disminuye poco a poco, que el agua caliente sale con menos fuerza que la fría, o que en el fondo de las ollas queda una costra blanquecina al hervir agua?

El culpable es el **sarro (carbonato de calcio y magnesio)** presente en el agua de la mayoría de las ciudades mexicanas (como Querétaro, Puebla, Aguascalientes, Guadalajara y Monterrey).

## El ciclo destructivo del sarro en tu hogar

1. **Sedimentación en el tinaco:** El agua fría entra al tinaco con sales disueltas. Con el calor de la azotea, las sales se cristalizan y forman piedritas duras en el fondo.
2. **Bajada por la tubería:** Al abrir las llaves, estas arenillas calcáreas bajan por la tubería hacia el calentador (boiler) o presurizador.
3. **Calentamiento e incrustación:** Cuando el agua se calienta en el boiler, el sarro se solidifica aceleradamente, creando un bloque de cal alrededor de las resistencias o en el fondo del tanque que actúa como aislante térmico (haciendo que gastes hasta un 30% más de gas o electricidad para calentar el agua).
4. **Obstrucción de regaderas y cartuchos cerámicos:** Los pedazos de sarro terminan atrapados en los difusores de las regaderas y en los empaques de llaves monomando, reduciendo la presión a un simple chorrito.

## Cómo combatir el sarro eficientemente

* **Lavado periódico de tinaco y cisterna:** Retirar las costras de sarro y sedimentos del fondo antes de que sean succionados hacia la tubería interna.
* **Drenado anual del calentador:** Vaciar y purgar el boiler al menos una vez al año para desalojar los minerales asentados.
* **Instalación de filtros antisarro / polifosfatos:** Colocar un cartucho antisarro en la línea de llenado del tinaco para impedir que las sales precipiten.
    `
  }
];

async function seedRichBlog() {
  console.log("Iniciando carga de artículos de alto impacto SEO en el blog...");
  
  for (const post of newArticles) {
    await pool.query(`
      INSERT INTO blog_posts (title, slug, excerpt, content, author, image, date, category, reading_time)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        excerpt = EXCLUDED.excerpt,
        content = EXCLUDED.content,
        category = EXCLUDED.category,
        reading_time = EXCLUDED.reading_time;
    `, [
      post.title,
      post.slug,
      post.excerpt,
      post.content,
      post.author,
      post.image,
      post.date,
      post.category,
      post.readingTime
    ]);
  }

  console.log(`¡Se publicaron exitosamente ${newArticles.length} artículos nuevos en el blog!`);
  await pool.end();
}

seedRichBlog().catch(err => {
  console.error("Error al sembrar artículos:", err);
  process.exit(1);
});

