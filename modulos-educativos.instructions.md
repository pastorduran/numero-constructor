# Guía para módulos educativos

Esta aplicación es una experiencia educativa y gamificada para estudiantes de 12 a 13
años. Cada módulo debe permitir explorar un concepto matemático, practicarlo y recibir
retroalimentación clara sin depender de un documento externo en tiempo de ejecución.

## Estructura esperada

Cada módulo nuevo debe ofrecer, cuando el contenido lo permita:

- Un modo libre para explorar valores, propiedades o procedimientos.
- Un desafío de preguntas con diez ejercicios por partida.
- Feedback inmediato para respuestas correctas e incorrectas.
- Una explicación breve de la respuesta, no solo una marca de acierto.
- Progreso, racha, combo y nivel integrados con el sistema compartido.
- Acceso desde el menú principal y una forma clara de volver al menú.

## Diseño de ejercicios

Los ejercicios deben generarse a partir de reglas matemáticas explícitas y comprobables.
No deben depender de valores escritos manualmente en el HTML ni de un PDF cargado por el
navegador.

Cada pregunta debería definir al menos:

- `type`: tipo de procedimiento o habilidad.
- `prompt`: consigna para el estudiante.
- `answer`: respuesta esperada o criterio de validación.
- `options`: alternativas, si es una pregunta de selección.
- `explanation`: explicación pedagógica para el feedback.

Las alternativas incorrectas deben representar errores plausibles del estudiante, no valores
aleatorios. El generador debe evitar preguntas ambiguas, respuestas duplicadas y resultados
que no puedan expresarse claramente en la interfaz.

## Progresión de dificultad

Los módulos deben comenzar con reconocimiento, definiciones y procedimientos directos.
Después pueden combinar propiedades, aumentar la cantidad de pasos, introducir distractores
más cercanos y plantear problemas aplicados.

Como regla general:

- Nivel 1: conceptos básicos y ejercicios de un paso.
- Nivel 2: aplicación de una propiedad o procedimiento con más de un paso.
- Nivel 3: combinación de habilidades, errores frecuentes y problemas contextualizados.

El nivel debe cambiar la clase de razonamiento requerido, no únicamente aumentar el tamaño
de los números. La aplicación actualmente usa niveles del 1 al 3; un módulo puede comenzar
con esa escala y ampliar el límite solo si existe una progresión pedagógica clara.

## Público y experiencia

- Usar lenguaje claro, breve y apropiado para estudiantes de 12 a 13 años.
- Mostrar pasos y explicaciones que ayuden a corregir el procedimiento.
- Mantener controles grandes y legibles para pantallas táctiles.
- Evitar penalizar una entrada vacía como respuesta incorrecta.
- Permitir continuar después de cada respuesta mediante el feedback.
- Mantener el tono visual y la navegación de los módulos existentes.

## Arquitectura técnica

Separar cada módulo en capas pequeñas:

- `*-core.js`: reglas matemáticas, generación de preguntas y validación, sin DOM.
- `*.js`: estado del módulo, eventos, renderizado y navegación específica.
- `challenge-ui.js`: efectos, HUD, rachas, combos y feedback compartidos.
- `storage.js`: progreso persistente mediante `AppStorage`.
- `config.js`: configuración y fábricas de estado compartidas.

El HTML actual utiliza atributos `onclick`, por lo que las funciones públicas necesarias
deben seguir disponibles en el ámbito global mientras se migra gradualmente a módulos ES.
Los scripts deben cargarse en orden: configuración, persistencia, núcleos, UI compartida,
coordinador y controladores de módulos.

## Persistencia

Cada módulo debe usar una clave propia para nivel y mejor puntuación, por ejemplo:
`moduleLevel` y `bestModule`. No debe modificar ni borrar el progreso de otros módulos.
La persistencia debe seguir funcionando si `localStorage` no está disponible.

## Validación obligatoria

Antes de considerar terminado un módulo:

1. Ejecutar `node --check` sobre todos sus archivos JavaScript.
2. Probar el núcleo sin DOM con casos correctos, incorrectos y límites.
3. Abrir `index.html` mediante un servidor local.
4. Comprobar modo libre, inicio del desafío y una respuesta correcta e incorrecta.
5. Confirmar que el feedback, la racha, la puntuación y el guardado funcionan.
6. Revisar que no haya errores de consola ni cambios en módulos existentes.

## Documentación del contenido

Las instrucciones generales describen cómo construir módulos. Las definiciones, propiedades,
ejemplos y errores frecuentes de cada tema deben vivir en la documentación específica del
módulo o en su archivo de contenido, no en esta guía general.