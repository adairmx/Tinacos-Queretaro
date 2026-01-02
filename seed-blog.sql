INSERT INTO blog_posts (title, slug, excerpt, content, author, image, date) VALUES
('¿Cómo saber si tengo una fuga de agua en mi casa?', 
 'como-saber-si-tengo-una-fuga-de-agua-en-mi-casa',
 'Aunque parece muy evidente y creemos que si tenemos una fuga de agua en la casa nos daremos cuenta de inmediato, no es así. Hay fugas de agua que están expuestas, se miran a simple vista o bien, dejan un rastro...',
 '## Fugas de agua invisibles

Hay fugas de agua que están expuestas, se miran a simple vista o bien, dejan un rastro porque se ve humedad o sale el agua a superficie. Pero hay otro tipo de fugas que pueden estar detrás de un muro o muy debajo en el piso por lo cual nunca las veremos ni las escucharemos.

## ¿En donde puede estar la fuga de agua en mi casa?

Generalmente va a ser alguna tubería dentro de la casa. También puede ser en el tinaco o la cisterna si es que tienes.

Hay 3 tramos de la instalación hidráulica en donde puede estar la fuga:

- Entre el medidor y la válvula de llenado de la cisterna
- Entre el la alimentación a la cisterna y la alimentación al tinaco
- En la tubería dentro de la casa, empezando desde la bajada del tinaco

Y recordemos que también puede ser que el tinaco o la cisterna estén rotos.

## ¿Cómo detectar la fuga de agua en mi casa?

Para ubicar la fuga exactamente necesitamos 4 cosas:

- Tener acesso a la llave de paso general del domicilio y **tenerla abierta durante todo el proceso**.
- Tener acceso al tinaco y/o cisterna.
- No hacer uso de ningún servicio durante el tiempo que dura la inspección.
- Tomar una foto del medidor para tener la lectura de consumo.',
 'MonsterCo',
 '/attached_assets/generated_images/water_pipe_leak_detection_concept.png',
 '12 Oct 2023')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO blog_posts (title, slug, excerpt, content, author, image, date) VALUES
('¿Por qué no sube agua al tinaco?',
 'por-que-no-sube-agua-al-tinaco', 
 'Estás en la regadera a media ducha, abres la llave para enjuagarte y de pronto… No hay agua!!! Qué está pasando??? Hace unos minutos parecía que todo estaba bien...',
 '## Por qué el tinaco no se está llenando?

Estás en la regadera a media ducha, abres la llave para enjuagarte y de pronto… No hay agua!!!

La respuesta es sencilla: **la presión es muy poca**.

Esto tiene que ver con la altura. A mayor altura, menor presión. También tiene que ver con la demanda. En horas pico, la demanda será mayor.

Entonces en horas pico cuando la presión sea menor, podría salir agua del grifo que está cerca del medidor; pero esa presión podría no ser suficiente para que llegue hasta el tinaco.

El tinaco suele estar a una altura de 7m y hasta 10m en relación al piso.

### Entonces tengo un problema?

El problema que tienes es temporal y no está relacionado a la infraestructura o instalaciones en tu hogar. Cuando vuelva la presión regular (probablemente en la noche), volverá a subir agua al tinaco.',
 'MonsterCo',
 '/attached_assets/generated_images/low_water_pressure_faucet.png',
 '15 Nov 2023')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO blog_posts (title, slug, excerpt, content, author, image, date) VALUES
('Tinaco o cisterna ¿Cuál me conviene más y por qué?',
 'tinaco-o-cisterna-cual-me-conviene-mas-y-por-que',
 'Tal vez estás construyendo tu propia casa o llegó la hora de aumentar tu capacidad de almacenamiento de agua. Sea cual sea la razón, te diremos que es lo que debes considerar...',
 '## ¿Qué debemos tomar en cuenta?

En nuestra labor, a diario lavamos tinacos y cisternas de diferentes tamaños, marcas y formas. 95 de cada 100 personas que tienen tinaco y cisterna, nunca ocupan la cisterna.

### PROS y CONTRAS de una CISTERNA

**PROS**
- Mayor capacidad de almacenamiento
- No se expone a la luz solar
- Si hay baja presión, el agua si llegará

**CONTRAS**
- Mucho más costosas que un tinaco
- Tienes que excavar para instalarla
- Necesitas una bomba para disponer del agua

### PROS y CONTRAS de un TINACO

**PROS**
- Instalación mucho menos costosa
- Mantenimiento más sencillo
- Trabaja por gravedad

**CONTRAS**
- Expuesto a la intemperie y luz solar
- Si no hay presión, el agua podría no llegar',
 'MonsterCo', 
 '/attached_assets/generated_images/water_tank_vs_cistern_comparison.png',
 '05 Dec 2023')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO blog_posts (title, slug, excerpt, content, author, image, date) VALUES
('¿Hacia donde cierra una llave de agua que no deja de girar?',
 'hacia-donde-cierra-una-llave-de-agua-que-no-deja-de-girar',
 'Explicamos el sentido en el que tienes que girar una llave convencional para saber si la estás abriendo o cerrando.',
 '## Llaves de apertura rápida (1/4 de vuelta)

Las llaves de apertura rápida tienen un tope integrado en la manilla. Con el desgaste se puede barrer o romper y entonces ya no deja de dar vuelta.

### ¿Cómo saber si está abierta o cerrada?

Afortunadamente es fácil:

- **Si la manilla está en el mismo sentido del tubo**, la llave está **abierta**
- **Si el maneral está perpendicular a la tubería** (a 90 grados), la llave está **cerrada**',
 'MonsterCo',
 '/attached_assets/generated_images/water_valve_quarter_turn_open_vs_closed.png',
 '10 Jan 2024')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO blog_posts (title, slug, excerpt, content, author, image, date) VALUES
('Dispositivo anti sarro | Tipo ionizador ¿Funciona?',
 'dispositivo-antisarro-tipo-ionizador-funciona',
 'Los dispositivos de este tipo que dicen evitar y combatir el sarro existente, lo hacen mediante imanes...',
 '## ¿Funcionan los ionizadores anti-sarro?

Los dispositivos ionizadores pretenden invertir la polaridad de elementos en el agua como magnesio, potasio, sodio y calcio mediante imanes de neodimio.

### Nuestra experiencia

**Realmente sirven?** En nuestra experiencia **no**...

Todos los días nos encontramos depósitos de agua llenos de incrustaciones de sarro. Muchos de esos tinacos los encontramos con estos dispositivos.

**En ninguno de estos casos hemos visto un depósito que teniendo uno de estos dispositivos, no tenga sarro incrustado.**

Por nuestra experiencia, **NO recomendamos** invertir en este tipo de dispositivos.',
 'MonsterCo',
 '/attached_assets/generated_images/anti_scale_device_ionizer.png',
 '22 Jan 2024')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO blog_posts (title, slug, excerpt, content, author, image, date) VALUES
('CPVC, Tuboplus o cobre | ¿Cuál es la mejor tubería?',
 'cpvc-tuboplus-o-cobre-cual-es-la-mejor-tuberia',
 'A menudo me preguntan cual es la mejor tubería que puede uno instalar en su casa...',
 '## La mejor tubería

La respuesta es fácil: **La mejor de todas es la TUBERÍA DE COBRE**.

No se oxida, es más resistente, tiene cualidades antibacterianas y te va a durar toda la vida.

### Tuberías de CPVC
*Ventajas:* Durabilidad, fácil instalación, bajo costo
*Desventajas:* No apto para agua muy caliente, no resistente a luz UV

### Tuberías de PPR (Tuboplus)
*Ventajas:* Alta resistencia térmica, bajo costo, fácil instalación
*Desventajas:* No apto para agua hirviendo, menor resistencia a presión

### Tuberías de cobre
*Ventajas:* Durabilidad extrema, resistencia a la corrosión, antibacteriano
*Desventajas:* Costo elevado, instalación más compleja',
 'MonsterCo',
 '/attached_assets/generated_images/copper_vs_cpvc_pipe_comparison.png',
 '05 Feb 2024')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO blog_posts (title, slug, excerpt, content, author, image, date) VALUES
('Alto | Antes de comprar una tapa para tu tinaco, lee esto',
 'tu-tinaco-se-quedo-sin-tapa',
 'Descubrir que tu tinaco perdió su tapa es algo muy habitual. Si te quedaste sin tapa, tienes un gran problema...',
 '## El problema de quedarse sin tapa

Si tu tinaco perdió su tapa, el agua quedará expuesta a la intemperie y los rayos del sol, generando que se ponga verde y se reproduzcan larvas de mosquito, arañas y cucarachas.

## NO HAY tal cosa como una TAPA UNIVERSAL

Cada fabricante usa sus propias medidas y sistemas de cierre:

- **Rotoplas**: Sistema de "clic" con pestañas
- **Aquaplas**: Sistema de rosca

Un sistema no es compatible con el otro.

### En el caso de Rotoplas

No es posible adaptar una tapa genérica. El arillo de sujeción viene termo-fusionado al cuello del tinaco. La solución: **comprar la tapa original Rotoplas**.

Si tienes dudas, contáctanos y te decimos que hacer.',
 'MonsterCo',
 '/attached_assets/generated_images/water_tank_missing_lid_problem.png',
 '18 Feb 2024')
ON CONFLICT (slug) DO NOTHING;
