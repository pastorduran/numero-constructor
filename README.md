# Publicar "Constructor de Números" en GitHub Pages

He separado el HTML, CSS y JS en `docs/` para que puedas publicar fácilmente con GitHub Pages.

Estructura creada en `/Downloads/docs/`:
- `index.html`
- `css/style.css`
- `js/script.js`

Pasos mínimos para publicar (desde una terminal en la carpeta donde quieres inicializar el repo):

```bash
git init
git add docs index.html README.md docs/css/style.css docs/js/script.js
git commit -m "Add numero constructor site"
git branch -M main
git remote add origin https://github.com/pastorduran/numero-constructor.git
git push -u origin main
```

Luego en GitHub (repo `numero-constructor`) ve a Settings → Pages y selecciona la rama `main` y la carpeta `/docs` como source. Tras unos minutos el sitio estará disponible en:

`https://pastorduran.github.io/numero-constructor/`

Notas:
- Si prefieres publicar desde la raíz en vez de `docs/`, mueve los archivos al root del repo y selecciona `main / root` en Pages.
- Para desactivar/activar sonido en el sitio, puedo añadir un interruptor UI que guarde la preferencia en `localStorage`.

Descripción del proyecto
------------------------

"Constructor de Números" es una aplicación educativa interactiva diseñada para ayudar a niños y niñas a comprender el valor posicional y la descomposición de números usando billetes y monedas. La interfaz permite apilar dinero por columnas (millones, cien-miles, diez-miles, miles, centenas, decenas y unidades), ajustar cantidades con controles +/−, y ver el número resultante en formato total, descomposición y notación con potencias de 10.

Objetivos educativos
--------------------

- Reforzar el concepto de valor posicional: cómo cada columna (millones, centenas, decenas, unidades) contribuye al total.
- Practicar la descomposición de números en sumas de múltiplos de potencias de 10 (por ejemplo, 6×10⁶ + 2×10³ + ...).
- Visualizar ceros y lugares vacíos para comprender su importancia en la notación posicional.

Características principales
-------------------------

- Interfaz táctil con botones +/− y feedback visual (pulso y resalte de columna).
- Animaciones de "caída" de monedas y tonos cortos usando WebAudio para añadir refuerzo sensorial.
- Diseño responsivo pensado para tabletas y móviles; ajustes específicos para evitar solapamientos en pantallas pequeñas.
- Ejemplos rápidos y botón de limpiar para iniciar prácticas.

Cómo contribuir y publicar
-------------------------

Edita los archivos en `docs/` (o en la raíz si prefieres publicar desde `main / root`), luego haz:

```bash
cd /Users/pduran/numero-constructor
git add .
git commit -m "Update README and mobile layout fixes"
git push
```

Después, en GitHub -> Settings -> Pages selecciona la rama `main` y la carpeta `docs` (o `root` si moviste los archivos). Espera unos minutos para que el sitio se publique.

Licencia y notas
-----------------
Este proyecto es de uso personal/educativo. Si quieres, añado un archivo `LICENSE` y una política de contribución.
