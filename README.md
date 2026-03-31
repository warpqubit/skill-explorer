# Skills Explorer

Explorador de repositorios con Skills de Claude usando la **GitHub API v3** oficial. Sin scraping, sin bloqueos.

---

## Instalación

Cualquier usuario con Node.js instalado puede traer el proyecto al Escritorio con un solo comando:

```bash
npx github:warpqubit/skill-explorer
```

Esto descarga el proyecto desde GitHub y copia los archivos en:

```
C:\Users\<tu-usuario>\Desktop\skill-explorer\
```

---

## Ejecución

Una vez instalado, entrá a la carpeta en el Escritorio y ejecutá el `.bat`:

```bash
cd Desktop\skill-explorer
launch.bat
```

O simplemente hacé **doble clic** en `launch.bat` desde el Explorador de Windows.

Se abre automáticamente la app en tu navegador por defecto.

---

## Qué hace la app

Skills Explorer te permite buscar y explorar repositorios públicos de GitHub que contienen archivos de Skills para Claude Code (`SKILL.md`).

### Funcionalidades

| Función | Descripción |
|---|---|
| **Buscar repositorios** | Busca repos por palabra clave usando la GitHub Search API |
| **Buscar archivos SKILL.md** | Encuentra archivos `SKILL.md` en todos los repos públicos |
| **Escanear repo** | Recorre el árbol completo de un repo buscando skills anidados |
| **Ver contenido** | Lee y muestra el contenido de cualquier `SKILL.md` encontrado |
| **Rate limit monitor** | Muestra en tiempo real tu cuota de requests disponibles |
| **Copiar endpoints** | Copia los endpoints de la API con un clic para usarlos en tus propios proyectos |

### Endpoints utilizados

```
GET /search/repositories?q=claude+skills&sort=stars
GET /search/code?q=SKILL.md+in:path
GET /repos/{owner}/{repo}/git/trees/HEAD?recursive=1
GET /repos/{owner}/{repo}/contents/{path}
GET /rate_limit
```

---

## Token de GitHub (recomendado)

Sin token tenés **60 requests/hora**. Con un token gratuito llegás a **5.000 requests/hora**.

1. Ir a [github.com/settings/tokens/new](https://github.com/settings/tokens/new)
2. Scope mínimo requerido: `public_repo`
3. Pegar el token en el campo correspondiente de la app

> El token solo se usa en el navegador para hacer requests a la API de GitHub. No se guarda ni se envía a ningún servidor externo.

---

## Requisitos

- [Node.js](https://nodejs.org) v14 o superior (para el comando `npx`)
- Navegador moderno (Chrome, Firefox, Edge)
- Conexión a internet

---

## Estructura del proyecto

```
skill-explorer/
├── index.html          # HTML de la app
├── css/
│   └── styles.css      # Estilos
├── js/
│   └── app.js          # Lógica JavaScript
├── bin/
│   └── setup.js        # Script ejecutado por npx
├── package.json
└── launch.bat          # Abre la app en el navegador
```

---

## Repositorio

[github.com/warpqubit/skill-explorer](https://github.com/warpqubit/skill-explorer)
