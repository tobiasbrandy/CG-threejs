# CG-threejs

## Demo para curso de Computer Graphics en Three.js
Actualmente desplegado en [https://cg.tobiasbrandy.com]

### Objetivo
El objetivo de la demo es poder controlar un vehiculo con el teclado, generar ciertas piezas especificadas simulando una impresora 3D utilizando una interfaz grafica, y luego poder agarrar y dejar las mismas con el vehiculo en una estanteria o nuevamente en la impresora.

### Interfaz grafica de la impresora 3D
La interfaz grafica para controlar la impresora 3D se encuentra en la esquina superior derecha del viewport. La misma cuenta con distintos parametros para especificar la pieza a generar, y luego un boton de render que inicia el proceso de generacion de la pieza en la impresora. Los parametros de la pieza soportados son:
  - `Code`: La geometria de la pieza a generar. Todos los codigos que empiezan con `A` son peizas de revolucion, mientras que las que comienzan con `B` son de extrucion.
  - `Angle`: Parametro solo utilizado en las piezas de extrucion. Indica cuanto girar la pieza durante le proceso de extrucion.
  - `Height`: Altura de la pieza a generar.
  - `Resolution`: El tamaño del "paso" a tomar durante el proceso de extrucion. Cuanto mayor, las piezas pareceran mas suaves, cuanto mas bajo pareceran mas cuadradas. Tambien aplica para piezas de revolucion.
  - `Material`: Tipo de material de la pieza. Las opciones son:
    - `wireframe`: Muestra todos los bordes de los triangulos de la pieza.
    - `flat`: Material Phong con flat shading de color blanco.
    - `smooth`: Material Lambert de color blanco.
    - `glossy`: Material Phong de color rojo.

### Controles del vehiculo
Distintos botones del teclado tienen distintos efectos en el vehiculo:
  - `W`: Avanzar el vehiculo.
  - `S`: Retroceder el vehiculo.
  - `A`: Rotar el vehiculo hacia la izquierda.
  - `D`: Rotar el vehiculo hacia la derecha.
  - `Q`: Mover el elevador del vehiculo hacia arriba.
  - `E`: Mover el elevador del vehiculo hacia abajo.
  - `G`: Tomar una pieza del escenario (estanteria o impresora) y colocarla en el elevador, o dejar la pieza del elevador en el escenario (estanteria o impresora), segun corresponda.

### Controles de camara
Existen dos tipos de camara en la demo, cada uno con 3 variantes: fija y orbital. Las camaras orbitales pueden ser rotadas haciendo click en el escenario y moviendo el mouse, y pueden ser acercadas y alejadas mediante la rueda del mouse o con las teclas `O` y `P`, respectivamente. Cada una de las 6 camaras puede ser seleccionada mediante las siguientes teclas numerales:
  - `1`: Camara orbital centrada en el centro del escenario. Es la camara inicial.
  - `2`: Camara orbital centrada en la impresora 3D.
  - `3`: Camara orbital centrada en la estanteria.
  - `4`: Camara fija en primera persona del conductor del vehiculo.
  - `5`: Camara fija en tercera persona (hacia atras) del vehiculo.
  - `6`: Camara fija mirando hacia el vehiculo desde el costado derecho.
