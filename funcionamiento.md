# Descripción funcional de la demo

## Componentes generales
La demo es una pagina web compuesta de un único archivo `index.html` que contiene solamente un `div` donde se bindeará `Three.js` al `DOM` y que incluye el modulo `main.js` que sera el punto de entrada a nuestra aplicación.
Todo el codigo javascript de la aplicacion se encuentra en la carpeta `js` donde viven los distintos modulos en el root de la carpeta, y una carpeta `lib` donde se encuentran las dependencias de la aplicacion: [Three.js](https://threejs.org/) y [dat.GUI](https://github.com/dataarts/dat.gui).

## Modulos
Explicaremos las funcionalidades de la aplicación, módulo por módulo.

### main.js
Este es el punto de entrada de la aplicacion, por lo que se realiza la configuracion inicial de Three.js y del resto de los modulos:

  - Inicializamos los modulos `Printer`, `Forklift` y `Shelves`, indicando la posicion en la escena de cada uno, y sus parametros de construccion.
  - Creamos y configuramos el renderer de Three.js para que utilice WebGL y se ancle al DOM en el lugar correspondiente.
  - Registramos el handler para modificar el tamaño del viewport.
  - Creamos la camara inicial y su correspondiente `Orbit Control`.
  - Creamos un `Ambient Light` general y un `Directional Light` para iluminar la escena.
  - Configuramos e inicializamos los parametros por defecto de la GUI.
  - Bindeamos los inputs del teclado a los handlers correspondientes (para `keydown` y `keyup`).
  - Por ultimo, ejecutamos la funcion render, que a partir de este momento es ejecutada en cada frame. Esta se encarga de ejecutar la funcion de actualizacion de la aplicacion (que por ahora solo actualiza al vehiculo) y ejecutar la funcion de renderizacion de escena de Three.js con la camara seleccionada previamente.

#### Camaras
La otra funcion de este modulo es la inicializacion y registracion de todas las camaras de la aplicacion, que luego son bindeadas a las teclas de los digitos del 1 al 6.

La primeras 3 camaras utilizan el addon de Three.js de `OrbitControls`, que permite rotar y acercar/alejar la camara respecto de un punto. Para estas 3 camaras la camara primitiva y el orbital control es siempre el mismo, simplemente modificando su target segun corresponda. Para la primera el target es el centro de la escena (0, 40, 0), para la segunda es el `WorldPosition` de la impresora y para la tercera es la `WorldPosition` de las estanterias.

Las otras 3 camaras son distintas instancias de `PerspectiveCamera` trasladadas a distintas posiciones y luego ancladas al vehiculo, por lo que van a mostrar distintas vistas del mismo. Mediante prueba y error se eligieron coordenadas que represetnen la vista del conductor, una vista en tercera persona superior y una vista de costado.

### input.js
Este modulo unicamente se encarga de exportar una funcion que reciba un mapa de teclas del teclado a una funcion a ejecutar cuando se presiona una tecla y otra para ejecutar cuando la tecla es soltada, y luego las bindea al evento del browser correspondiente. Cabe destacar que deduplica estos eventos, es decir que si mantenemos apretadas las teclas el evento de presionado no vuelve a ser ejecutado.

### warehouse.js
Este modulo unicamente se encarga de exponer la funcion `createWarehouse` que crea la geometria del escenario, es decir, las paredes y el piso, como un unico `Group`.

### geometries.js
Este modulo se encarga de definir la generacion de las geometrias de las piezas que deberá generar la impresora. Declara (de manera aproximada) las curvas en 2D definidas en el enunciado utlizando las primitivas de curvas que ofrece Three.js (`Path`, `CurvePath`, etc), y como a partir de estas generar las geometrias de escrucion con rotacion o revolución, según corresponda.

#### Geometrias de revolución
Todas las curvas de las piezas de revolucion son verticales (ejes X e Y), teniendo en cuenta que seran rotadas respecto el eje Y. Las mismas ademas estan parametrizadas por altura y ancho.

Para la generacion de la geometria utilizamos la primitiva `LatheGeometry`. Para poder generar solamente hasta un porcentaje de la pieza, sampleamos la curva primitiva con la cantidad de puntos que indique el parametro de resolucion y tomamos unicamente los primeros n puntos, según indique el procentaje.

#### Geometrias de extrucion con rotación
Todas las curvas de las piezas de extrucion son planas (eje X y eje Z) y cuadradas, teniendo en cuenta que seran extrutadas en el eje Y. Las mismas estan parametrizadas respecto la longitud entre el centro y cualquiera de sus lados.

Dado que la primitiva de extrucion de Three.js no posee la capacidad de rotacion, se utilizo la primitiva de `BufferGeometry`:

  1. Segun los parametros, calculamos la distancia del paso de extrucion, cuantos pasos vamos a ejecutar y el paso de rotación.
  2. Por cada paso, calculamos los rectangulos (definidos por 2 triangulos) entre la curva del paso anterior y el actual. Para simplificar este calculo (y el de las normales) utilizamos la funcionalidad de indices. Tengamos en cuenta que en cada paso se suma una distancia del paso en el eje Y, y se rota la curva segun el paso de rotacion. Tenemos cuidado de armar los triangulos de tal manera que sus normales apunten hacia afuera.
  3. Calculamos para cada punto su normal (para todos el mismo) utilizando el producto vectorial del triangulo. Como estamos armando rectangulos, la normal de ambos triangulos es la misma.
  4. Creamos finalmente la geometria, agregandole los atributos previamente calculados: `position`, `normal` y `index`.

### pieceSlot.js
Este pequeño modulo expone una clase `PieceSlot` que representa una posicion en el espacio donde se puede colocar una pieza generada por la impresora 3D. La misma es utilizada en la misma impresora, en el escensor del vehiculo y en cada estante de la estanteria. Se utiliza la primitiva de `Group` para generar un nodo estable en el arbol de Three.js, este la pieza presente o no. Ademas, la misma ayuda a calcular la distancia entre distintos `PieceSlot`

### printer.js
Este modulo expone la clase `Printer`, que se encarga de definir la geometria y logica de la impresora 3D. Para definir su geometria se utilizaron cilindros (`CylinderGeometry`) y cubos (`BoxGeometry`). La cabeza de la impresora se definio como un grupo aparte, para luego poder modificar su posicion vertical. En el centro de la base de la impresora incluimos un `PieceSlot`, para que la misma pueda contener piezas.

Para simular la creacion paulatina de la pieza, ejecuta una funcion cada 50 milisegundos (mediante la utilizacion de la funcion `setTimeout` nativa del browser) que eleva la posicion de la cabeza un pequeño paso, y genera una nueva pieza con un porcentaje cada vez mayor. Una vez que se alcanza el 100% de la pieza, la iteracion termina y queda la pieza entera sobre la impresora. Durante la impresion de la pieza, no se puede interactuar con la impresora. Este metodo no es performante, deberia encontrarse algun metodo de esconder parte de la figura a partir de un plano, para poder generar directamente la figura completa desde el inicio.

### shelves.js
Este modulo expone la clase `Shelves`, que se encarga de definir la geometria de las estanterias utilizando `BoxGeometry` tanto para las columnas, como para las estanterias. El mismo esta parametrizado en el tamaño vertical y horizontal que se desea. En cada estanteria, ubicamos un `PieceSlot`, para que se pueda depositar una pieza en las mismas.

### forklift.js
Este modulo expone la clase `Forklift`, que se encarga de definir la geometria y logica del vehiculo. Para la geometria del cuerpo principal se utilizaron simples cajas (`BoxGeometry`), para las ruedas se usaron cilindros (`CylinderGeometry`) con un punto rojo (para parcar su rotación) que luego son trasladados y rotados a cada uno de los 4 extremos del cuerpo principal, y por ultimo el ascensor que tambien son simples cajas. Este ultimo se conserva como un grupo aparte, para luego poder cambiar su posicion vertical, para poder elevarlo y bajarlo.

Todos los movimientos del vehiculo son booleanos con velocidades fijas. Los mismos son activados cuando se aprieta la tecla correspondiente y son desactivados cuando se la suelta. Para el movimiento hacia adelante y hacia atras (función `move`), se traslada el auto en el eje x según su velocidad, y se rotan las 4 ruedas hacia el mismo lado, dependiendo del signo de la velocidad. Para el movimiento de rotacion (función `rotate`), se rota el vehiculo en su eje Y según su velocidad de rotacion. Para subir y bajar el elevador (función `moveLift`), se traslada en el eje Y el mismo, segun su velocidad y si ya alcanzo las posiciones maximas. Todos estos movimientos son ejecutados en la función `update`, que es llamada una vez por frame.

Por ultimo, queda la logica para tomar y dejar piezas. De eso se encarga la función `handlePiece`, que recibe todas las posiciones de piezas (`PieceSlot`) activas de la aplicacion y luego:
  1. Si el vehiculo no tiene una pieza, descarta las posiciones que tampoco tienen, o visceversa.
  2. De las posiciones restantes, calcula cual es la de menor distancia al ascensor del vehiculo.
  3. Si la distancia supera un limite de distancia seleccionado, se corta la ejecucion y no se hace nada.
  4. Por ultimo, si el vehiculo posee una pieza se la entrega a la posicion. De caso contrario, toma la pieza de la posicion.
