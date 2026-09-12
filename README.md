# Explorador de Números

Aplicación educativa y gamificada para aprender composición numérica y notación científica con un enfoque visual, táctil y motivador para niñas y niños de 12 a 13 años.

## ¿Qué incluye?

Explorador de Números combina dos módulos principales:

- Composición numérica
- Notación científica

Cada módulo cuenta con modo libre y modo desafío, para que el estudiante pueda explorar, practicar y reforzar conceptos de forma progresiva.

## Módulo 1: Composición

En la sección de composición, el usuario puede construir números usando unidades, decenas, centenas, miles, decenas de miles, centenas de miles y millones.

### Funcionalidades

- Ajuste de cantidades con botones + y -
- Visualización del número total en tiempo real
- Descomposición del valor según su posición
- Relación con potencias de 10
- Ejemplos rápidos para practicar
- Reinicio total del panel
- Modo reto con 10 preguntas aleatorias
- Retroalimentación con expresiones matemáticas visibles

### Objetivo

Ayudar a comprender cómo se forma un número y cómo se representa según el valor posicional.

## Módulo 2: Notación Científica

En la sección de notación científica, el usuario trabaja con números grandes y pequeños para convertirlos a su forma exponencial y viceversa.

### Funcionalidades

- Entrada libre de números para convertir
- Visualización paso a paso del proceso: número original, movimiento de la coma, conteo de espacios y resultado final
- Ejemplos predefinidos aleatorios
- Desafío con 10 preguntas aleatorias
- Dos tipos de preguntas:
  - convertir un número a notación científica
  - convertir una notación científica a número decimal
- Preguntas temáticas contextualizadas con escenarios infantiles y de interés, como distancias, ciudades, eventos, fútbol o anime
- Retroalimentación clara con la notación correcta en cada respuesta

### Objetivo

Desarrollar comprensión de cómo se escriben números muy grandes o muy pequeños de una manera más compacta y útil.

## Gamificación y flujo de juego

La experiencia está pensada para ser motivadora y accesible en dispositivos móviles:

- Menú principal con varios modos
- Pantallas de inicio, juego y finalización
- Sistema de puntos y progreso por pregunta
- Modales de retroalimentación visual
- Confirmación antes de salir del desafío
- Diseño responsivo para pantallas pequeñas
- Accesibilidad con botones grandes y texto claro

## Público objetivo

La app está diseñada para estudiantes de 12 a 13 años, con un enfoque amigable y simple, sin saturar la interfaz ni generar distracciones innecesarias.

## Cómo probar el proyecto localmente

Puedes abrir el archivo HTML directamente en el navegador o servir la carpeta localmente con un servidor simple:

```bash
cd /Users/pduran/numero-constructor
python3 -m http.server 8000
```

Luego abre en el navegador:

```text
http://localhost:8000
```

## Tecnologías

- HTML5
- CSS3
- JavaScript vanilla
- Diseño responsive y táctil

## Estructura de JavaScript

La aplicación usa capas sencillas sin necesidad de un bundler:

- `js/config.js`: configuración compartida, denominaciones y fábricas de estado inicial.
- `js/storage.js`: lectura y escritura del progreso en `localStorage`.
- `js/storage.js`: también conserva `errorCounts` por módulo y tipo de habilidad para orientar futuras prácticas.
- `js/composition-core.js`: generación de preguntas y respuestas de composición, sin dependencia del DOM.
- `js/notation-core.js`: conversiones y análisis de números científicos, sin dependencia del DOM.
- `js/challenge-ui.js`: efectos, HUD, rachas y persistencia visual compartida por los desafíos.
- `js/roots-core.js`: definiciones, ejercicios progresivos y evaluación de raíces sin dependencia del DOM.
- `js/roots.js`: modo libre y desafío interactivo de raíces.
- `js/math-display.js`: presentación de expresiones matemáticas con fracciones y superíndices.
- `modulos-educativos.instructions.md`: guía general para crear nuevos módulos educativos.
- `js/script.js`: coordinador actual de la interfaz, renderizado y flujo de los modos.

`index.html` carga los archivos en ese orden. Las funciones usadas por los atributos
`onclick` siguen siendo globales para conservar compatibilidad con la interfaz actual.
La siguiente extracción natural es separar los renderizadores y los dos juegos en módulos
propios, manteniendo una API pequeña para este coordinador.

## Licencia

Este proyecto se distribuye bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.
