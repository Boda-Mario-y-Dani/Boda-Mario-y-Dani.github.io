/**
 * ============================================================
 * app.js — Lógica principal del sitio de bodas
 * Dani & Mario · Boda 2026
 * ============================================================
 *
 * Flujo de Firebase:
 * 1. Autenticación anónima (Firebase Auth)
 * 2. Validación del archivo
 * 3. Subida a Firebase Storage con progreso
 * 4. Registro de metadatos en Firestore
 *
 * Para conectar Firebase:
 * 1. Copia firebase-config.example.js → firebase-config.js
 * 2. Rellena los valores reales
 * 3. Cambia FIREBASE_ENABLED = true abajo
 * ============================================================
 */

// ============================================================
// IMPORTACIONES DE FIREBASE (SDK modular v10+)
// Descomenta estas líneas cuando agregues firebase-config.js real
// ============================================================
/*
import { initializeApp }         from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Importar configuración real (no subir a GitHub)
import { firebaseConfig, STORAGE_BASE_PATH, FIRESTORE_COLLECTION } from "./firebase-config.js";
*/

// ============================================================
// MODO DEMO — Cambia a true cuando tengas Firebase configurado
// ============================================================
const FIREBASE_ENABLED = false;

// ============================================================
// CONFIGURACIÓN DEL EVENTO (editable sin Firebase)
// ============================================================
const CONFIG = {
  nombreNovia: "Dani",
  nombreNovio: "Mario",
  fechaBoda: "2026",           // ← Cambia a la fecha real: "14 de febrero de 2026"
  fraseHero: "Gracias por ser parte de este día tan especial",
  mensajeBienvenida: `Queremos ver nuestra boda a través de tus ojos. Sube tus fotos, 
    momentos divertidos y recuerdos especiales para que podamos revivir este día 
    desde cada mirada.`,
  maxSizeMB: 5,
  retos: [
    { emoji: "💑", texto: "Foto con los novios" },
    { emoji: "🤝", texto: "Foto con alguien que no conocías" },
    { emoji: "🎉", texto: "Foto de la mesa más animada" },
    { emoji: "💃", texto: "Foto bailando" },
    { emoji: "🥂", texto: "Foto brindando" },
    { emoji: "😄", texto: "Foto divertida o espontánea" },
    { emoji: "✨", texto: "Foto del mejor outfit" },
    { emoji: "💕", texto: "Foto del momento más romántico" },
    { emoji: "📸", texto: "Foto libre" }
  ]
};

// ============================================================
// ESTADO GLOBAL
// ============================================================
let firebaseApp   = null;
let firebaseAuth  = null;
let firebaseStorage = null;
let firebaseDb    = null;
let currentUser   = null;
let selectedFile  = null;

// ============================================================
// INICIALIZACIÓN
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  initCarousel();
  initForm();
  initScrollAnimations();
  // populateRetos() eliminado — los retos se dan en papel

  if (FIREBASE_ENABLED) {
    initFirebase();
  } else {
    console.info("ℹ️  Modo demo activo. Agrega firebase-config.js y cambia FIREBASE_ENABLED = true");
  }
});

// ============================================================
// FIREBASE — Inicialización
// ============================================================
async function initFirebase() {
  try {
    /* ⬇ Descomenta cuando importes firebase-config.js
    firebaseApp     = initializeApp(firebaseConfig);
    firebaseAuth    = getAuth(firebaseApp);
    firebaseStorage = getStorage(firebaseApp);
    firebaseDb      = getFirestore(firebaseApp);
    console.log("✅ Firebase inicializado correctamente");
    */
  } catch (err) {
    console.error("❌ Error al inicializar Firebase:", err);
  }
}

// Autenticar al usuario de forma anónima antes de subir
async function autenticarAnonimamente() {
  if (!FIREBASE_ENABLED) return { uid: "demo-user-" + Date.now() };
  if (currentUser) return currentUser;

  /* ⬇ Descomenta cuando Firebase esté activo
  const credential = await signInAnonymously(firebaseAuth);
  currentUser = credential.user;
  console.log("👤 Usuario anónimo autenticado:", currentUser.uid);
  return currentUser;
  */
}

// ============================================================
// CARRUSEL DE GALERÍA DE NOVIOS (sesión .galeria-novios)
// ============================================================
function initCarousel() {
  const slides  = document.querySelectorAll(".galeria-slide");
  const dots    = document.querySelectorAll("#galeria-dots .carousel-dot");
  const prevBtn = document.getElementById("galeria-prev");
  const nextBtn = document.getElementById("galeria-next");
  let current   = 0;
  let autoTimer;

  function goTo(idx) {
    slides[current].classList.remove("active");
    dots[current].classList.remove("active");
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add("active");
    dots[current].classList.add("active");
  }

  function startAuto() {
    autoTimer = setInterval(() => goTo(current + 1), 5000);
  }

  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }

  if (prevBtn) prevBtn.addEventListener("click", () => { goTo(current - 1); resetAuto(); });
  if (nextBtn) nextBtn.addEventListener("click", () => { goTo(current + 1); resetAuto(); });

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => { goTo(i); resetAuto(); });
  });

  // Swipe táctil
  const carruselEl = document.getElementById("galeria-carrusel");
  if (carruselEl) {
    let touchStartX = 0;
    carruselEl.addEventListener("touchstart", e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
    carruselEl.addEventListener("touchend", e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) { goTo(current + (diff > 0 ? 1 : -1)); resetAuto(); }
    }, { passive: true });
  }

  if (slides.length > 0) startAuto();
}

// ============================================================
// RETOS — Se eliminaron del sitio (se dan en papel).
// Esta función se mantiene como stub por si se necesita reactivar.
// ============================================================
function populateRetos() {
  // No hace nada — la sección de retos fue removida del HTML.
  // Si quieres reactivarla, descomenta el código en el bloque de abajo.
}

// ============================================================
// FORMULARIO DE SUBIDA
// ============================================================
function initForm() {
  const form        = document.getElementById("upload-form");
  const fileInput   = document.getElementById("campo-foto");
  const preview     = document.getElementById("foto-preview");
  const previewWrap = document.getElementById("preview-wrapper");
  const uploadBtn   = document.getElementById("btn-enviar");

  if (!form) return;

  // Vista previa de imagen
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) { previewWrap.style.display = "none"; selectedFile = null; return; }

    const err = validarArchivo(file);
    if (err) {
      mostrarError(err);
      fileInput.value = "";
      previewWrap.style.display = "none";
      selectedFile = null;
      return;
    }

    selectedFile = file;
    const reader = new FileReader();
    reader.onload = e => {
      preview.src = e.target.result;
      previewWrap.style.display = "block";
    };
    reader.readAsDataURL(file);
    ocultarMensajes();
  });

  // Envío del formulario
  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (!selectedFile) { mostrarError("Por favor selecciona una foto antes de enviar."); return; }

    const nombre  = document.getElementById("campo-nombre").value.trim();
    const mesa    = document.getElementById("campo-mesa").value.trim();
    const mensaje = document.getElementById("campo-mensaje").value.trim();

    if (!nombre) { mostrarError("Por favor escribe tu nombre."); return; }

    const datosFormulario = { nombre, mesa, mensaje };

    uploadBtn.disabled = true;
    uploadBtn.textContent = "Enviando...";
    ocultarMensajes();

    try {
      if (FIREBASE_ENABLED) {
        await subirConFirebase(datosFormulario);
      } else {
        await simularSubida(); // Demo sin Firebase
      }
      mostrarExito();
      form.reset();
      previewWrap.style.display = "none";
      selectedFile = null;
    } catch (err) {
      console.error("Error al subir:", err);
      mostrarError("Ocurrió un error al enviar tu foto. Por favor intenta de nuevo.");
    } finally {
      uploadBtn.disabled = false;
      uploadBtn.textContent = "Enviar foto 💌";
    }
  });
}

// ============================================================
// VALIDACIÓN DE ARCHIVO
// ============================================================
function validarArchivo(file) {
  const tiposPermitidos = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic"];
  const maxBytes = CONFIG.maxSizeMB * 1024 * 1024;

  if (!tiposPermitidos.includes(file.type.toLowerCase())) {
    return `Solo se permiten imágenes (JPG, PNG, WEBP, HEIC). El archivo "${file.name}" no es válido.`;
  }
  if (file.size > maxBytes) {
    return `La imagen es demasiado grande. El tamaño máximo permitido es ${CONFIG.maxSizeMB} MB.`;
  }
  return null;
}

// ============================================================
// SUBIDA REAL CON FIREBASE
// ============================================================
async function subirConFirebase(datos) {
  /* ⬇ Descomenta cuando Firebase esté activo
  
  // 1. Autenticar al usuario de forma anónima
  const user = await autenticarAnonimamente();

  // 2. Crear ruta única en Storage
  const timestamp = Date.now();
  const nombreLimpio = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const rutaArchivo = `${STORAGE_BASE_PATH}/${user.uid}/${timestamp}-${nombreLimpio}`;
  const archivoRef = storageRef(firebaseStorage, rutaArchivo);

  // 3. Subir con progreso
  await new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(archivoRef, selectedFile, {
      contentType: selectedFile.type
    });

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        actualizarProgreso(pct);
      },
      reject,
      resolve
    );
  });

  // 4. Guardar metadatos en Firestore
  const colRef = collection(firebaseDb, FIRESTORE_COLLECTION);
  await addDoc(colRef, {
    userId:         user.uid,
    nombreInvitado: datos.nombre,
    mesa:           datos.mesa    || null,
    mensaje:        datos.mensaje || null,
    storagePath:    rutaArchivo,
    fileName:       selectedFile.name,
    contentType:    selectedFile.type,
    size:           selectedFile.size,
    createdAt:      serverTimestamp()
  });

  console.log("✅ Foto subida y registrada correctamente");
  */
}

// ============================================================
// SIMULACIÓN DE SUBIDA (modo demo)
// ============================================================
function simularSubida() {
  return new Promise(resolve => {
    let progreso = 0;
    const progressBar  = document.getElementById("progress-bar");
    const progressWrap = document.getElementById("progress-wrapper");
    const progressText = document.getElementById("progress-text");

    if (progressWrap) progressWrap.style.display = "block";

    const interval = setInterval(() => {
      progreso += Math.random() * 15 + 5;
      if (progreso >= 100) {
        progreso = 100;
        clearInterval(interval);
        setTimeout(resolve, 400);
      }
      if (progressBar)  progressBar.style.width = progreso + "%";
      if (progressText) progressText.textContent = `Subiendo... ${Math.round(progreso)}%`;
    }, 200);
  });
}

// ============================================================
// ACTUALIZAR BARRA DE PROGRESO
// ============================================================
function actualizarProgreso(pct) {
  const progressBar  = document.getElementById("progress-bar");
  const progressWrap = document.getElementById("progress-wrapper");
  const progressText = document.getElementById("progress-text");
  if (progressWrap) progressWrap.style.display = "block";
  if (progressBar)  progressBar.style.width = pct + "%";
  if (progressText) progressText.textContent = `Subiendo... ${pct}%`;
}

// ============================================================
// MENSAJES DE UI
// ============================================================
function mostrarExito() {
  const el = document.getElementById("mensaje-exito");
  const progressWrap = document.getElementById("progress-wrapper");
  if (progressWrap) progressWrap.style.display = "none";
  if (el) {
    el.style.display = "block";
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

function mostrarError(msg) {
  const el = document.getElementById("mensaje-error");
  if (el) {
    el.textContent = msg;
    el.style.display = "block";
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

function ocultarMensajes() {
  const exito = document.getElementById("mensaje-exito");
  const error = document.getElementById("mensaje-error");
  const progressWrap = document.getElementById("progress-wrapper");
  if (exito) exito.style.display = "none";
  if (error) error.style.display = "none";
  if (progressWrap) progressWrap.style.display = "none";
  const progressBar = document.getElementById("progress-bar");
  if (progressBar) progressBar.style.width = "0%";
}

// ============================================================
// ANIMACIONES DE SCROLL (Intersection Observer)
// ============================================================
function initScrollAnimations() {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll(".fade-in-up").forEach(el => observer.observe(el));
}

// ============================================================
// SCROLL SUAVE AL FORMULARIO
// ============================================================
function scrollAlFormulario() {
  const target = document.getElementById("seccion-subida");
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// Exponer globalmente para el onclick del botón hero
window.scrollAlFormulario = scrollAlFormulario;
