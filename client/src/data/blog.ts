export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  image: string;
  slug: string;
}

export const initialPosts: BlogPost[] = [
  {
    id: "1",
    title: "¿Cómo saber si tengo una fuga de agua en mi casa?",
    slug: "como-saber-si-tengo-una-fuga-de-agua-en-mi-casa",
    excerpt: "Aunque parece muy evidente y creemos que si tenemos una fuga de agua en la casa nos daremos cuenta de inmediato, no es así. Hay fugas de agua que están expuestas, se miran a simple vista o bien, dejan un rastro...",
    date: "12 Oct 2023",
    author: "MonsterCo",
    image: "/attached_assets/generated_images/water_pipe_leak_detection_concept.png",
    content: `
## Fugas de agua invisibles

Hay fugas de agua que están expuestas, se miran a simple vista o bien, dejan un rastro porque se ve humedad o sale el agua a superficie. Pero hay otro tipo de fugas que pueden estar detrás de un muro o muy debajo en el piso por lo cual nunca las veremos ni las escucharemos.

## ¿En donde puede estar la fuga de agua en mi casa?

Generalmente va a ser alguna tubería dentro de la casa. También puede ser en el tinaco o la cisterna si es que tienes.

Hay 3 tramos de la instalación hidráulica en donde puede estar la fuga:

- Entre el medidor y la válvula de llenado de la cisterna
- Entre el la alimentación a la cisterna y la alimentación al tinaco
- En la tubería dentro de la casa, empezando desde la bajada del tinaco

Y recordemos que también puede ser que el tinaco o la cisterna estén rotos.

Prueba a hacer lo que se pide en cada uno de estos pasos y descubrirás en que parte de la casa puede estar la fuga. Esto es muy importante porque si no tenemos una idea clara del lugar donde puede estar la fuga, estaremos a ciegas y será muy difícil atinarle.

## ¿Cómo detectar la fuga de agua en mi casa?

Para ubicar la fuga exactamente necesitamos 4 cosas:

- Tener acesso a la llave de paso general del domicilio y **tenerla abierta durante todo el proceso**.
- Tener acceso al tinaco y/o cisterna.
- No hacer uso de ningún servicio durante el tiempo que dura la inspección. No abrir ninguna llave de agua ni jalarle a ningún baño.
- Tomar una foto del medidor para tener la lectura de consumo que teníamos cuando comenzamos.

### Detección de fuga en cisterna

Desconecta la bomba primero. La llave de paso general debe estar abierta.

Necesitamos destapar la cisterna y mirar si está llena. **Si la cisterna está llena, quiere decir que la cisterna no tiene fuga así que puedes asegurarte que aquí no hay problema**, continua en el siguiente punto para seguir la inspección. Aquí te recomiendo tomar otra foto al medidor.

- **Si se está llenando** y antes de esto no habías activado la bomba para subir agua al tinaco, regresa en un tiempo prudente. Si pasado este tiempo la cisterna se sigue llenado, es decir que nunca se detiene, **entonces la fuga de agua está en la cisterna**. Habrá que buscar quien la repare o reemplazarla.

### Detección de fuga de agua en tinaco

Esta es la más sencilla aunque a veces la más inaccesible a falta de una escalera o acceso a la azotea.

En cuanto puedas llegar al tinaco, verás si hay alguna fisura o tubo roto porque el agua lo hará evidente. Aquí te recomiendo tomar otra foto al medidor.

Si la fuga está en el cuerpo del tinaco, entonces habrá que buscar quien lo repare (en caso de ser una fisura pequeña) o también recomendamos reemplazarlo pues incluso después de reparado podría volver a dar problemas.

Si la fuga es en alguna tubería o en la válvula de llenado o flotador, llama a un plomero o reemplaza tu mismo si sabes hacerlo. Si el tinaco también se encuentra bien y no detectamos ninguna fuga, sigue leyendo.
    `
  },
  {
    id: "2",
    title: "¿Por qué no sube agua al tinaco?",
    slug: "por-que-no-sube-agua-al-tinaco",
    excerpt: "Estás en la regadera a media ducha, abres la llave para enjuagarte y de pronto… No hay agua!!! Qué está pasando??? Hace unos minutos parecía que todo estaba bien...",
    date: "15 Nov 2023",
    author: "MonsterCo",
    image: "/attached_assets/generated_images/low_water_pressure_faucet.png",
    content: `
Estás en la regadera a media ducha, abres la llave para enjuagarte y de pronto… No hay agua!!!

Qué está pasando??? Hace unos minutos parecía que todo estaba bien. Como sea logras salir del baño, te vistes y vas en busca de agua en las demás llaves de la casa. No hay ni gota de agua.

Lo primero que te viene a la mente es ir a la entrada, donde se encuentra el medidor y ver si está girando.

Y así lo haces. Te acercas y el medidor está inmóvil, señal de que el tinaco no se está llenando.

Bueno, te dices a ti mismo “oye pues no hay agua, ni modo”; estás por darte media vuelta resignado pero tus ojos se fijan en el pequeño grifo que está justo ahí a un lado del medidor.

Recuerdas que esa llave de agua viene directamente de la red de agua potable pero si no hay agua entonces por ahí tampoco va a salir no?

Qué más da? Lo abres y oh sorpresa!!! Sale agua!

Entonces que está pasando? Porque en las llaves al interior de la casa no hay agua, el tinaco parece estar vacío y no se está llenado pero de ese grifo si sale el tan preciado líquido.

La respuesta es sencilla, aunque esto parezca todo un acertijo.

### Por qué el tinaco no se está llenando? Porque la presión es muy poca.

Esto tiene que ver con la altura. A mayor altura, menor presión.

Tiene que ver también con la demanda. En horas pico, la demanda será mayor.

Entonces en horas pico cuando la presión sea menor, podría salir agua del grifo que está cerca del medidor; pero esa presión podría no ser suficiente para que llegue hasta el tinaco.

Esto es debido a que ese grifo está a una altura de 50cms en promedio.

El tinaco suele estar a una altura de 7m y hasta 10m en relación al piso.

### Entonces tengo un problema?

El problema que tienes es temporal y no está relacionado a la infraestructura o instalaciones en tu hogar. Cuando vuelva la presión regular (probablemente en la noche), volverá a subir agua al tinaco.
    `
  },
  {
    id: "3",
    title: "Tinaco o cisterna ¿Cuál me conviene más y por qué?",
    slug: "tinaco-o-cisterna-cual-me-conviene-mas-y-por-que",
    excerpt: "Tal vez estás construyendo tu propia casa o llegó la hora de aumentar tu capacidad de almacenamiento de agua. Sea cual sea la razón, te diremos que es lo que debes considerar...",
    date: "05 Dec 2023",
    author: "MonsterCo",
    image: "/attached_assets/generated_images/water_tank_vs_cistern_comparison.png",
    content: `
¿Qué debemos tomar en cuenta al tomar esta importante decisión?

Talvez estás construyendo tu propia casa o llegó la hora de aumentar tu capacidad de almacenamiento de agua. Sea cual sea la razón, te diremos que es lo que debes considerar y te ayudaremos a tomar la mejor opción.

En nuestra labor, a diario lavamos tinacos y cisternas de diferentes tamaños, marcas y formas. A diario escuchamos historias de clientes y sus vivencias.

Algunos tienen tinaco. Algunos tienen cisterna. Algunos tienen cisterna y tinaco.

Y de todos esos que tienen cisterna y tinaco, la gran mayoría NUNCA ocupan la cisterna.

Si, suena increíble pero 95 de cada 100 personas que tienen tinaco y cisterna, nunca ocupan la cisterna.

Y para todo esto existe una explicación muy sencilla: La cisterna se convirtió en un respaldo del tinaco.

Los tinacos se alimentan directamente de la red de agua potable que viene de la calle, desde tu proveedor… Entonces, salvo que corten el suministro por un periodo prolongado de tiempo, nunca siquiera te percatarás de ello.

### Pero, son tan malas entonces las cisternas?

Pues realmente si se hace una instalación correcta, se podría decir que es una buena opción.

Entonces, si vas a instalar una cisterna recuerda pedir que el tubo de alimentación de la red termine en la cisterna, que no continúe hacia el tinaco.

Teniendo todo esto en cuenta, una cisterna puede ser una buena opción para almacenar agua.

### PROS y CONTRAS de una CISTERNA

**PROS**
- Mayor capacidad de almacenamiento.
- No se expone a la luz solar.
- Si hay baja presión, el agua si llegará (contrario a un tinaco, donde posiblemente no llegaría por la altura.
- El sarro se les incrusta menos que a un tinaco de azotea.

**CONTRAS**
- Mucho más costosas que un tinaco.
- Tienes que excavar para poder instalarla.
- Necesitas una bomba, hidroneumático y/o presurizador para poder disponer del agua.

### PROS y CONTRAS de un TINACO

**PROS**
- Su instalación es mucho menos costosa que la de una cisterna.
- Hay tinacos de hasta 2500L
- Su mantenimiento es más sencillo y cómodo de realizar en comparación a una cisterna.
- Trabaja por gravedad.

**CONTRAS**
- Siempre está expuesto a la intemperie y la luz solar
- Si no hay presión en la zona, el agua podría no alcanzar a llegar hasta donde está colocado debido a la altura.

### CONCLUSIONES

En fin, no todo es bueno y no todo es malo.

Basados en nuestra experiencia lavando tinacos y cisternas durante más de 10 años y escuchando las historias de muchos clientes, nuestra opinión al respecto parece tener algunos fundamentos y argumentos muy válidos.

Creemos que una cisterna aunque tiene factores a favor, en el largo plazo puede traer más dolores de cabeza que soluciones.
    `
  },
  {
    id: "4",
    title: "¿Hacia donde cierra una llave de agua que no deja de girar?",
    slug: "hacia-donde-cierra-una-llave-de-agua-que-no-deja-de-girar",
    excerpt: "Explicamos el sentido en el que tienes que girar una llave convencional para saber si la estás abriendo o cerrando. Sin embargo hay un tipo de llaves que aunque siguen este principio...",
    date: "10 Jan 2024",
    author: "MonsterCo",
    image: "/attached_assets/generated_images/water_valve_quarter_turn_open_vs_closed.png",
    content: `
En nuestro artículo anterior que puedes encontrar aquí, explicamos el sentido en el que tienes que girar una llave convencional para saber si la estás abriendo o cerrando.

Explicamos que dicho método será útil para todas las llaves de rosca sin excepción y debería ser útil para todas las demás llaves, sin embargo hay un tipo de llaves que aunque siguen este principio y estándar, en ocasiones nos dan problemas porque nunca dejan de girar.

## ¿Qué tipo de llaves nunca dejan de girar?

Las llaves de apertura rápida, también conocidas como llaves de 1/4 de vuelta.

En principio funcionan igual que las demás lo que sucede es que suelen tener un tope que está integrado en la manilla y a veces con el desgaste se barre o se rompe y entonces ya no deja de dar vuelta cuando la giramos. En ese momento ya no sabemos si está abierta o cerrada.

### ¿Entonces como saber si está abierta o cerrada?

Afortunadamente es fácil. Este tipo de llaves también se rigen bajo otro estándar. Basta con mirar hacia donde está la manilla.

Si la manilla está en el mismo sentido del tubo, entonces la llave está abierta.

Si el maneral está perpendicular a la tubería ( a 90 grados) entonces la llave o válvula está cerrada.

Y eso es todo. Pero puede ser que te estés enfrentando a otro problema y la llave de agua que intentas cerrar no sea de este tipo sino de rosca.
    `
  },
  {
    id: "5",
    title: "Dispositivo anti sarro | Tipo ionizador ¿Funciona?",
    slug: "dispositivo-antisarro-tipo-ionizador-funciona",
    excerpt: "Los dispositivos de este tipo que dicen evitar y combatir el sarro existente, lo hacen mediante imanes, los cuales pretenden invertir la polaridad de elementos en el agua...",
    date: "22 Jan 2024",
    author: "MonsterCo",
    image: "/attached_assets/generated_images/anti_scale_device_ionizer.png",
    content: `
Los dispositivos de este tipo que dicen evitar y combatir el sarro existente, lo hacen mediante imanes, los cuales pretenden invertir la polaridad de elementos en el agua tales como magnesio, potasio, sodio y calcio.

Al cambiar la polaridad se evita que se formen cristales. Son dispositivos que no necesitan instalación ni baterías, simplemente los arrojas al tinaco y/o cisterna y ya está.

Este tipo de dispositivos comúnmente son un tubo plástico sellado que en su interior contiene imanes de neodimio.

A diferencia de los dispositivos anti sarro de tipo ablandador, estos no liberan ninguna sustancia. Los fabricantes de este tipo de dispositivos dicen que puede durar hasta 30 años.

Ahora bien, yendo directamente al punto y de acuerdo a nuestra experiencia diaria donde nos hemos encontrado este tipo de dispositivos en los tinacos que lavamos en repetidas ocasiones:

**Realmente sirven?** Bueno, en nuestra experiencia no…

**Todos los días nos encontramos depósitos de agua que debido a falta de mantenimiento están llenos de incrustaciones de sarro.**

Muchos de esos tinacos y cisternas los encontramos con estos dispositivos tipo ionizador que trabajan cambiando la polaridad de las sustancias en el agua.

**En ninguno de estos casos hemos visto un depósito que teniendo uno de estos dispositivos ionizadores, no tenga sarro incrustado.**

En otras palabras, aún habiendo tenido este dispositivo, los tinacos y/o cisternas que lavamos, los hemos encontrado con sarro.

Nuestra teoría es que aunque pueda ser cierto el principio por el que se rigen, el dispositivo es muy pequeño y el tinaco o cisterna en si, en proporción es demasiado grande como para que este dispositivo pueda actuar.

Por nuestra experiencia, NO recomendamos invertir en este tipo de dispositivos, ya que no cumplen lo que prometen.
    `
  },
  {
    id: "6",
    title: "CPVC, Tuboplus o cobre | Cuál es la mejor tubería?",
    slug: "cpvc-tuboplus-o-cobre-cual-es-la-mejor-tuberia",
    excerpt: "A menudo me preguntan cual es la mejor tubería que puede uno instalar en su casa y aunque podemos considerar muchos factores, la respuesta es en mi opinión muy fácil...",
    date: "05 Feb 2024",
    author: "MonsterCo",
    image: "/attached_assets/generated_images/copper_vs_cpvc_pipe_comparison.png",
    content: `
A menudo me preguntan cual es la mejor tubería que puede uno instalar en su casa y aunque podemos considerar muchos factores, la respuesta es en mi opinión muy fácil.

Vamos a ser claros y evitémonos leer todo este artículo si lo que estás buscando es la tubería que menos problemas te va a dar: La mejor de todas (y por mucho) es la TUBERÍA DE COBRE.

No se oxida, es más resistente, tiene cualidades antibacterianas y te va a durar toda la vida. Eso si, vas a gastar entre 3 y 7 veces más pero querías una respuesta rápida y sin enredos no? En serio, siempre recomendaré tubería de cobre por sobre todas las demás opciones.

Ahora, si consideramos otros factores incluyendo costos, puede que quieras usar CPVC o PPR (Tuboplus). A continuación hablaremos de las ventajas y desventajas de cada uno de los materiales mencionados en este artículo.

**Tuberías de CPVC:**

El CPVC (policloruro de vinilo clorado) es un plástico termoplástico utilizado para la fabricación de tuberías. Es una alternativa popular al PVC (policloruro de vinilo) ya que es más resistente al calor y al fuego.

*Ventajas:* Durabilidad, fácil instalación, resistencia a químicos y bajo costo.
*Desventajas:* No apto para agua muy caliente, no resistente a luz UV.

**Tuberías de PPR (Tuboplus):**

El PPR (polipropileno random) es un tipo de plástico utilizado para la fabricación de tuberías. Es una opción popular para sistemas de plomería de agua fría y caliente.

*Ventajas:* Alta resistencia térmica, bajo costo, fácil instalación (termofusión), durabilidad.
*Desventajas:* No apto para agua hirviendo, menor resistencia a presión que el cobre.

**Tuberías de cobre:**

El cobre es uno de los materiales más antiguos utilizados en la fabricación de tuberías.

*Ventajas:* Durabilidad extrema, resistencia a la corrosión, excelente conductor térmico, antibacteriano.
*Desventajas:* Costo elevado, instalación más compleja (soldadura), vulnerable a congelación extrema.

En resumen, cada material de tubería tiene sus ventajas y desventajas. La elección del material de tubería adecuado dependerá de varios factores, como la aplicación, el presupuesto y las preferencias personales.
    `
  },
  {
    id: "7",
    title: "Alto | Antes de comprar una tapa para tu tinaco, lee esto",
    slug: "tu-tinaco-se-quedo-sin-tapa",
    excerpt: "Descubrir que tu tinaco perdió su tapa es algo muy habitual. Ya sea por que lo cerraron mal o porque se la robaron, el punto es que si te quedaste sin tapa, tienes un gran problema...",
    date: "18 Feb 2024",
    author: "MonsterCo",
    image: "/attached_assets/generated_images/water_tank_missing_lid_problem.png",
    content: `
**Descubrir que tu tinaco perdió su tapa es algo muy habitual.**

Ya sea por que lo cerraron mal o porque se la robaron (aunque esto último parece más un mito urbano pues nunca hemos podido confirmar que exista gente que se las robe), el punto es que si te quedaste sin tapa, tienes un gran problema pues el agua que contiene el depósito se quedará expuesta a la intemperie y peor aún a los rayos directos del sol, lo cual generará que el agua y las paredes internas del tinaco se pongan verdes y se comiencen a reproducir diversos animales como larvas de mosquito, arañas y en ocasiones hasta cucarachas.

En nuestra amplia experiencia hemos visto muchos tinacos destapados y nos ha tocado conseguir tapas para diversas marcas y modelos, por lo cual podemos hablarte con autoridad:

**NO HAY tal cosa como una TAPA UNIVERSAL.**

Que significa esto: Que las tapas que venden en las ferreterías o en sitios como mercadolibre.com, no siempre le van a quedar a tu tinaco (como te hacen creer) y si bien la gran mayoría son adaptables, algunas veces tampoco se van a poder adaptar.

**Por qué no hay tapas universales?**

Sencillo, porque cada fabricante usa sus propias medidas y sistemas de cierre.

**Hay sistemas de cierre como el de Rotoplas que están basados en “clic”**, pues la tapa tiene unas pequeñas pestañas que embonan perfectamente en el arillo base del tinaco.

**Hay sistemas como el de Aquaplas que tienen rosca**, si; como si fuera una taparrosca de refresco solo que mucho más grande.

Entonces, por lógica un sistema no es compatible con el otro, dicho de otra forma no le podemos poner una tapa Rotoplas a un tinaco Aquaplas.

**Por qué no todas las tapas son adaptables?**

Bueno, aunque es cierto que la gran mayoría de tapas genéricas son adaptables, lo cierto es que tienes que saber que en algunos casos no es así y si la compras, vas a perder tu dinero.

**En el caso de Rotoplas, no es posible adaptar una tapa genérica**

Aunque en alguna ocasión tuvimos que hacerlo, no lo volveríamos a hacer. Adaptar una tapa suele ser sencillo porque en muchos casos vienen atornilladas con pijas, Rotoplas no lo hace así si no que por el contrario el arillo de sujeción de sus tinacos, viene termo-fusionado al cuello del tinaco y al tratar de retirarlo, puedes dañar la estructura del tinaco en si causando un daño irreparable.

La solución: Comprar la tapa original Rotoplas.

**En resumen: Esto de comprar y cambiar una tapa, puede ser un dolor de cabeza si se hace sin saber.**

Si tienes dudas, contáctanos y te decimos que hacer para obtener la tapa adecuada y como instalarla sin complicaciones.
    `
  }
];
