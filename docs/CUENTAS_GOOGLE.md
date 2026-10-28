# Activar las cuentas con Google

Sin configurar nada, la web funciona en **modo local**: no pide acceso y el progreso se guarda solo
en el navegador. Para que cada persona entre con su cuenta de Google y tenga su progreso y sus
notas en cualquier dispositivo, hay que conectar un proyecto de **Supabase** (gratis).

Tiempo aproximado: 15–20 minutos, una sola vez.

## 1. Crear el proyecto de Supabase
1. Entra en <https://supabase.com>, crea una cuenta y pulsa **New project**.
2. Elige nombre (por ejemplo `quantum-codebook`), contraseña de base de datos y una región cercana (Europa).
3. Cuando termine, ve a **SQL Editor → New query**, pega el contenido de
   [`supabase/schema.sql`](../supabase/schema.sql) y pulsa **Run**.
   Crea la tabla `user_progress` con seguridad por fila: cada usuario solo puede leer y escribir su
   propio progreso.

## 2. Crear las credenciales de Google
1. Entra en <https://console.cloud.google.com>, crea un proyecto y abre **APIs y servicios**.
2. **Pantalla de consentimiento OAuth**: tipo *Externo*, nombre de la app, tu email de soporte.
   Ámbitos: `email`, `profile` y `openid`. Mientras esté en modo de prueba, añade como
   *usuarios de prueba* las cuentas que vayan a entrar (o publícala cuando quieras abrirla a todos).
3. **Credenciales → Crear credenciales → ID de cliente de OAuth → Aplicación web**:
   - *Orígenes de JavaScript autorizados*: `http://localhost:5173` y `https://nazarbk.github.io`
   - *URI de redirección autorizados*: `https://TU-PROYECTO.supabase.co/auth/v1/callback`
     (la URL exacta aparece en Supabase, en la configuración del proveedor Google).
4. Copia el **ID de cliente** y el **secreto del cliente**.

## 3. Activar Google en Supabase
1. En Supabase: **Authentication → Sign In / Providers → Google** → activar, y pega el ID de
   cliente y el secreto.
2. **Authentication → URL Configuration**:
   - *Site URL*: `https://nazarbk.github.io/quantum_codebook/`
   - *Redirect URLs*: añade `http://localhost:5173/**` y `https://nazarbk.github.io/quantum_codebook/**`

## 4. Probar en local
1. En **Project Settings → API** copia la *Project URL* y la clave **anon public**.
2. Crea un archivo `.env.local` en la raíz del proyecto (a partir de `.env.example`):
   ```
   VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-clave-anon-publica
   ```
3. `npm run dev` y abre <http://localhost:5173>: verás la pantalla **Continuar con Google**.

> La clave *anon* es pública por diseño: la seguridad la da la política por fila de la tabla.
> **Nunca** pongas en la web la clave `service_role`.

## 5. Publicarlo en GitHub Pages
En el repositorio: **Settings → Secrets and variables → Actions → New repository secret**, crea
`VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con los mismos valores. El siguiente push
publicará la web con acceso por Google. Sin esos secretos se publica en modo local.

## Qué se guarda de cada usuario
- Lecciones completadas, ejercicios resueltos, test y mini-proyecto de cada bloque.
- Notas personales de cada lección.
- El último bloque abierto (para retomar donde lo dejó).

La XP y el nivel se calculan a partir de lo completado. La primera vez que alguien entra con su
cuenta en un navegador donde ya había avanzado sin cuenta, ese progreso se añade a su cuenta.
