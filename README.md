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
