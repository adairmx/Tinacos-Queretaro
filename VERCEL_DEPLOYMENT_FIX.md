# Vercel Deployment Fix

## El Problema (The Problem)

El sitio no se estaba desplegando en Vercel después del merge del PR #2 porque los endpoints de la API estaban escritos en formato de Next.js en lugar del formato de funciones serverless de Vercel.

The site wasn't deploying to Vercel after merging PR #2 because the API endpoints were written in Next.js format instead of Vercel serverless function format.

## La Causa (Root Cause)

Los archivos en `/api/blog/` usaban:
- `NextResponse` de Next.js (no disponible en Vite)
- Librería `postgres` y `drizzle-orm/serverless` (incompatible)
- Exports de funciones `GET`/`POST` estilo Next.js (no reconocido por Vercel)

The files in `/api/blog/` were using:
- `NextResponse` from Next.js (not available in Vite)
- `postgres` library and `drizzle-orm/serverless` (incompatible)
- Next.js style `GET`/`POST` function exports (not recognized by Vercel)

## La Solución (The Solution)

### Cambios realizados:

1. **api/blog/index.ts**:
   - ✅ Convertido a formato de handler de Vercel usando `VercelRequest`/`VercelResponse`
   - ✅ Agregada validación de entrada con Zod schema
   - ✅ Agregado soporte de paginación (límite por defecto de 100 posts)
   - ✅ Manejo correcto de JSON parsing del request body
   - ✅ Manejo de CORS headers

2. **api/blog/[slug].ts**:
   - ✅ Limpiado para usar schema y db compartidos desde `lib/db.js`
   - ✅ Eliminada duplicación de código
   - ✅ Ya estaba en formato correcto de Vercel

### Verificaciones completadas:

- ✅ TypeScript compila sin errores (`npm run check`)
- ✅ Build de Vite exitoso (`npm run build`)
- ✅ Estructura de directorios correcta (`dist/public/`)
- ✅ Configuración de `vercel.json` correcta
- ✅ `.vercelignore` excluye correctamente el directorio `server/`

## Próximos Pasos (Next Steps)

### 1. Merge este PR

Merge este Pull Request a la rama `main`:

```bash
# En GitHub, merges este PR #3 a main
```

### 2. Verificar la conexión con Vercel

Asegúrate de que tu proyecto esté conectado a Vercel:

1. Ve a [vercel.com/dashboard](https://vercel.com/dashboard)
2. Encuentra tu proyecto "Tinacos-Queretaro"
3. Verifica que esté conectado al repositorio de GitHub
4. Verifica que el branch de producción esté configurado como `main`

### 3. Configurar variables de entorno

En Vercel Dashboard → Settings → Environment Variables, asegúrate de tener:

```
DATABASE_URL=postgresql://...
```

(Tu connection string de Neon Database)

### 4. Activar el deployment

Después del merge:
- Vercel detectará el push a `main` automáticamente
- El deployment se iniciará
- Puedes ver el progreso en Vercel Dashboard

### 5. Verificar el deployment

Una vez desplegado, prueba:
- `https://tu-sitio.vercel.app/` - debe cargar tu sitio
- `https://tu-sitio.vercel.app/api/blog` - debe retornar los posts del blog
- `https://tu-sitio.vercel.app/blog` - debe mostrar la lista de artículos

## Solución de Problemas (Troubleshooting)

### Si el deployment falla:

1. **Verifica los logs en Vercel**:
   - Ve a Vercel Dashboard → Deployments
   - Click en el deployment fallido
   - Revisa los logs de build

2. **Verifica DATABASE_URL**:
   - Debe estar configurada en Environment Variables
   - Debe ser válida y accesible desde Vercel

3. **Verifica el branch**:
   - El branch `main` debe tener estos cambios
   - Vercel debe estar configurado para desplegar desde `main`

### Si la API no funciona:

1. **Verifica las funciones serverless**:
   - Ve a Vercel Dashboard → Functions
   - Deberías ver `api/blog/index` y `api/blog/[slug]`

2. **Verifica los logs de runtime**:
   - Ve a Vercel Dashboard → Logs
   - Busca errores en las llamadas a `/api/blog`

## Estructura del Proyecto

```
/
├── api/                    # Funciones serverless de Vercel
│   ├── blog/
│   │   ├── index.ts       # GET /api/blog, POST /api/blog
│   │   └── [slug].ts      # GET/PATCH/DELETE /api/blog/[slug]
│   └── lib/
│       └── db.ts          # Conexión a base de datos
├── client/                 # Código del frontend React
├── server/                 # Express server (solo local, ignorado por Vercel)
├── shared/                 # Schemas y tipos compartidos
│   └── schema.ts
├── dist/public/           # Build output (generado por Vite)
├── vercel.json            # Configuración de Vercel
└── .vercelignore          # Archivos ignorados por Vercel
```

## Tecnologías Usadas

- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Vercel Serverless Functions + TypeScript
- **Database**: Neon (PostgreSQL serverless)
- **ORM**: Drizzle ORM con cliente HTTP de Neon
- **Hosting**: Vercel

## Soporte

Si tienes problemas después del deployment, verifica:
1. Logs de Vercel
2. Variables de entorno
3. Conexión a base de datos
4. Estado de Neon Database

---

**¡El código está listo para deploy! Solo falta hacer el merge y Vercel se encargará del resto.**

**The code is ready to deploy! Just merge and Vercel will handle the rest.**
