/**
 * ============================================================
 * firebase-config.example.js
 * ============================================================
 * ARCHIVO DE EJEMPLO — NO CONTIENE CREDENCIALES REALES
 *
 * Instrucciones:
 * 1. Copia este archivo y renómbralo a: firebase-config.js
 * 2. Reemplaza cada valor con los datos reales de tu proyecto
 *    de Firebase (los encuentras en:
 *    Firebase Console → Tu proyecto → Configuración del proyecto
 *    → Tus apps → SDK de Firebase para web)
 * 3. NUNCA subas firebase-config.js a un repositorio público.
 *    Asegúrate de agregarlo a .gitignore.
 * 4. Para GitHub Pages (repositorio público), considera usar
 *    Firebase App Check y reglas de seguridad estrictas.
 *
 * ⚠️  SEGURIDAD IMPORTANTE:
 * - Activa App Check antes del evento para proteger tus endpoints.
 * - Configura reglas de Firestore y Storage para solo-escritura.
 * - Configura alertas de presupuesto en Google Cloud.
 * - Desactiva las subidas después del evento.
 * ============================================================
 */

// Exportación de la configuración pública de Firebase
// (Estas claves son públicas por diseño, la seguridad real
//  viene de las reglas de Firestore/Storage y App Check)
export const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "TU_PROJECT_ID.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_PROJECT_ID.appspot.com",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};

// ============================================================
// Nombre del evento — se usa como carpeta raíz en Storage
// Cámbialo por el identificador de tu boda
// ============================================================
export const EVENTO_ID = "boda-mario-y-dani";

// ============================================================
// Ruta base en Firebase Storage donde se guardarán las fotos
// Estructura: bodas/{EVENTO_ID}/{uid}/{timestamp-nombreArchivo}
// ============================================================
export const STORAGE_BASE_PATH = `bodas/${EVENTO_ID}`;

// ============================================================
// Colección de Firestore donde se guardarán los metadatos
// ============================================================
export const FIRESTORE_COLLECTION = "fotos_boda";
