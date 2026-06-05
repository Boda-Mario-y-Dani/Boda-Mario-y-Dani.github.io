# 💒 Dani & Mario · Sitio web de boda

Sitio web estático para la boda de **Dani y Mario**, diseñado para que los invitados suban fotos mediante retos fotográficos. Publicado en **GitHub Pages** y conectado con **Firebase** (Auth anónimo, Storage y Firestore).

---

## 📁 Estructura del proyecto

```
Boda-Mario-y-Dani.github.io/
├── index.html                   # Página principal
├── styles.css                   # Estilos (sistema de diseño romántico)
├── app.js                       # Lógica principal + integración Firebase
├── firebase-config.example.js   # Plantilla de configuración (sin credenciales)
├── README.md                    # Este archivo
└── assets/
    ├── Arrodillado.jpeg
    ├── Beso_frente.jpeg
    ├── Beso_mano.jpeg
    ├── Flores_y_anillo.jpeg
    ├── Mirada_anillo.jpeg
    ├── Mirada_sonrisa.jpeg
    ├── Anillo_blanco_negro.jpeg
    └── beso.jpeg
```

---

## ✏️ Paso 1 — Personalizar el contenido

### Cambiar nombres, fecha y frase

Edita el archivo `index.html`. Busca los comentarios `<!-- EDITABLE: ... -->`:

```html
<!-- EDITABLE: Fecha de la boda -->
<p class="subtitulo-dorado">14 de febrero de 2026</p>

<!-- EDITABLE: Nombre de la novia -->
<span class="script">Dani</span>

<!-- EDITABLE: Nombre del novio -->
<span class="script">Mario</span>
```

### Cambiar las fotos del carrusel

1. Copia tus fotos a la carpeta `assets/`.
2. En `index.html`, edita los bloques `<div class="carousel-slide">`:

```html
<div class="carousel-slide active">
  <img src="assets/TU_FOTO.jpeg" alt="Descripción de la foto" />
</div>
```

3. Agrega/elimina bloques según el número de fotos.
4. Asegúrate de actualizar también los puntos de navegación (`.carousel-dot`).

### Cambiar los retos fotográficos

En `app.js`, edita el array `CONFIG.retos`:

```js
retos: [
  { emoji: "💑", texto: "Foto con los novios" },
  { emoji: "🤝", texto: "Foto con alguien que no conocías" },
  // ... agrega o modifica los que necesites
]
```

---

## 💻 Paso 2 — Probar localmente

> ⚠️ El sitio usa módulos ES (`type="module"`), por lo que **no puede abrirse directamente** como archivo. Necesitas un servidor local.

### Opción A: VS Code con Live Server
1. Instala la extensión [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer).
2. Click derecho en `index.html` → **Open with Live Server**.

### Opción B: Python (sin instalaciones adicionales)
```bash
# Python 3
python -m http.server 8080
# Abre: http://localhost:8080
```

### Opción C: Node.js
```bash
npx serve .
```

---

## 🚀 Paso 3 — Publicar en GitHub Pages

1. Sube todos los archivos al repositorio (sin `firebase-config.js`).
2. Ve a **Settings → Pages** en GitHub.
3. En **Source**, selecciona `Deploy from a branch`.
4. Selecciona la rama `main` y la carpeta `/ (root)`.
5. Guarda. En unos minutos el sitio estará en:
   `https://TU_USUARIO.github.io/TU_REPOSITORIO/`

> ⚠️ **Importante**: Agrega `firebase-config.js` a `.gitignore` antes de subir.
> ```
> # .gitignore
> firebase-config.js
> ```

---

## 🔥 Paso 4 — Configurar Firebase

### 4.1 Crear proyecto

1. Ve a [console.firebase.google.com](https://console.firebase.google.com).
2. Haz clic en **Agregar proyecto**.
3. Ponle un nombre: `boda-mario-y-dani`.
4. Desactiva Google Analytics (opcional para este uso).
5. Haz clic en **Crear proyecto**.

---

### 4.2 Activar Authentication anónimo

1. En Firebase Console → **Authentication → Sign-in method**.
2. Habilita **Anónimo**.
3. Guarda.

---

### 4.3 Activar Firestore

1. Firebase Console → **Firestore Database → Crear base de datos**.
2. Empieza en **modo de producción** (no de prueba).
3. Selecciona la región más cercana (ej: `us-central1`).

**Reglas de seguridad recomendadas para Firestore:**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Solo usuarios autenticados (incluso anónimos) pueden crear documentos.
    // Nadie puede leer, actualizar ni eliminar desde el cliente.
    match /fotos_boda/{docId} {
      allow create: if request.auth != null
                    && request.resource.data.userId == request.auth.uid
                    && request.resource.data.nombreInvitado is string
                    && request.resource.data.nombreInvitado.size() > 0
                    && request.resource.data.nombreInvitado.size() <= 80;
      allow read, update, delete: if false;
    }

    // Denegar todo lo demás
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

### 4.4 Activar Cloud Storage

1. Firebase Console → **Storage → Comenzar**.
2. Acepta en **modo de producción**.
3. Selecciona la misma región que Firestore.

**Reglas de seguridad recomendadas para Storage:**

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Solo el usuario autenticado puede subir a su propia carpeta.
    // Nadie puede leer ni eliminar archivos desde el cliente.
    match /bodas/boda-mario-y-dani/{uid}/{fileName} {
      allow write: if request.auth != null
                   && request.auth.uid == uid
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
      allow read, delete: if false;
    }

    // Denegar todo lo demás
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

---

### 4.5 Agregar la configuración real de Firebase

1. En Firebase Console → **Configuración del proyecto** (ícono ⚙️) → **Tus apps**.
2. Haz clic en **Agregar app → Web** (`</>`).
3. Registra la app con el nombre que quieras.
4. Copia el objeto `firebaseConfig` que aparece.

5. Crea el archivo `firebase-config.js` (basado en `firebase-config.example.js`):

```js
// firebase-config.js — NO subir a GitHub
export const firebaseConfig = {
  apiKey:            "tu-api-key-real",
  authDomain:        "tu-proyecto.firebaseapp.com",
  projectId:         "tu-proyecto",
  storageBucket:     "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123:web:abc123"
};

export const EVENTO_ID           = "boda-mario-y-dani";
export const STORAGE_BASE_PATH   = `bodas/${EVENTO_ID}`;
export const FIRESTORE_COLLECTION = "fotos_boda";
```

6. En `app.js`, activa Firebase:
   - Descomenta las líneas de `import` al inicio del archivo.
   - Cambia `const FIREBASE_ENABLED = false;` → `true`.
   - Descomenta el bloque `initFirebase()` y el bloque `subirConFirebase()`.

---

## 🛡️ Paso 5 — Activar App Check (¡Muy recomendado!)

App Check protege tus servicios de Firebase contra uso no autorizado.

1. Firebase Console → **App Check**.
2. Selecciona tu app web.
3. Elige el proveedor **reCAPTCHA v3**.
4. Sigue las instrucciones para obtener la clave de reCAPTCHA.
5. Registra la clave en la consola.
6. **Actívalo en modo de aplicación** (enforce) antes del evento.

> 💡 En modo debug local, App Check puede omitirse con tokens de debug.

---

## 💰 Paso 6 — Configurar presupuesto y alertas (Plan Blaze)

El plan Blaze es de pago por uso. Configura alertas para evitar sorpresas.

1. Ve a [console.cloud.google.com](https://console.cloud.google.com).
2. Selecciona tu proyecto de Firebase.
3. Menú → **Facturación → Presupuestos y alertas**.
4. Crea un presupuesto:
   - Nombre: `Boda Mario y Dani`
   - Importe: el máximo que estés dispuesto a gastar (ej: $5 USD)
   - Alertas: al 50%, 90% y 100%
5. Activa notificaciones por correo.

> 🔔 También puedes configurar alertas desde Firebase Console → **Uso y facturación**.

---

## 🔐 Paso 7 — Cerrar las subidas después del evento

Una vez terminada la boda, tienes dos opciones:

### Opción A: Actualizar las reglas de Storage y Firestore
Cambia `allow write` a `allow write: if false;` en ambas reglas.

### Opción B: Deshabilitar Authentication anónimo
Firebase Console → Authentication → Sign-in method → Deshabilitar **Anónimo**.

### Opción C: Eliminar la app web de Firebase
Esto desactiva todas las operaciones del cliente.

---

## ✅ Lista de verificación antes del evento

- [ ] Nombres, fecha y fotos actualizados en `index.html`
- [ ] Retos fotográficos personalizados en `app.js`
- [ ] `firebase-config.js` creado y configurado
- [ ] `FIREBASE_ENABLED = true` en `app.js`
- [ ] Authentication anónimo activado en Firebase
- [ ] Firestore creado con reglas de solo escritura
- [ ] Storage creado con reglas de solo escritura
- [ ] App Check activado en modo producción
- [ ] Presupuesto y alertas configurados en Google Cloud
- [ ] `firebase-config.js` en `.gitignore`
- [ ] Sitio probado en celular (iOS y Android)
- [ ] QR generado apuntando a la URL de GitHub Pages

---

## 🛠️ Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| HTML5 + CSS3 | Estructura y diseño |
| JavaScript ES Modules | Lógica del cliente |
| Google Fonts | Tipografías (Cormorant Garamond, Great Vibes, Montserrat) |
| Firebase Auth | Autenticación anónima |
| Firebase Storage | Almacenamiento de fotos |
| Firestore | Base de datos de metadatos |
| GitHub Pages | Hosting estático |

---

## 📞 Soporte

Si tienes dudas sobre la configuración de Firebase, consulta la documentación oficial:
- [Firebase Web Docs](https://firebase.google.com/docs/web/setup)
- [Firebase Storage Rules](https://firebase.google.com/docs/storage/security)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

---

*Hecho con ♥ para Dani y Mario · 2026*