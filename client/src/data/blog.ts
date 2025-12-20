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
  }
];
