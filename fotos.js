/**
 * fotos.js — Página de subida de fotos · Daniela & Mario
 *
 * Funcionalidades:
 *   - Selección de MÚLTIPLES fotos (click o drag & drop)
 *   - Vista previa en grid con opción de eliminar cada foto
 *   - Validación de tipo y tamaño
 *   - Envío con barra de progreso por foto
 *   - Modo demo (sin Firebase) activo por defecto
 *
 * Para activar Firebase:
 *   1. Copia firebase-config.example.js → firebase-config.js
 *   2. Llena tus credenciales en firebase-config.js
 *   3. Cambia FIREBASE_ENABLED = true abajo
 */

'use strict';

// ============================================================
// CONFIGURACIÓN
// ============================================================

/** Cambiar a true cuando Firebase esté listo */
const FIREBASE_ENABLED = false;

/** Tamaño máximo por foto en MB */
const MAX_MB = 10;

/** Tipos MIME permitidos */
const TIPOS_VALIDOS = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);

// ============================================================
// ESTADO GLOBAL
// ============================================================
let archivosSeleccionados = []; // Array<File>

// ============================================================
// INICIALIZACIÓN
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initUploadZone();
  initForm();
  initScrollAnimations();
});

// ============================================================
// ZONA DE SUBIDA (drag & drop + click + keyboard)
// ============================================================
function initUploadZone() {
  const zona    = document.getElementById('upload-zone');
  const input   = document.getElementById('campo-fotos');
  const btnMas  = document.getElementById('btn-agregar');

  if (!zona || !input) return;

  // Click en la zona principal
  zona.addEventListener('click', () => input.click());
  zona.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); }
  });

  // Click en "Agregar más fotos"
  if (btnMas) {
    btnMas.addEventListener('click', () => input.click());
  }

  // Drag & Drop
  zona.addEventListener('dragover', e => {
    e.preventDefault();
    zona.classList.add('drag-over');
  });
  ['dragleave', 'dragend'].forEach(ev =>
    zona.addEventListener(ev, () => zona.classList.remove('drag-over'))
  );
  zona.addEventListener('drop', e => {
    e.preventDefault();
    zona.classList.remove('drag-over');
    procesarArchivos([...e.dataTransfer.files]);
  });

  // Input file change
  input.addEventListener('change', () => {
    procesarArchivos([...input.files]);
    input.value = ''; // Resetear para permitir re-selección del mismo archivo
  });
}

// ============================================================
// PROCESAR ARCHIVOS NUEVOS
// ============================================================
function procesarArchivos(nuevos) {
  ocultarMensajes();
  const errores = [];

  nuevos.forEach(archivo => {
    const error = validarArchivo(archivo);
    if (error) {
      errores.push(error);
      return;
    }
    // Evitar duplicados exactos (mismo nombre + tamaño)
    const duplicado = archivosSeleccionados.some(
      a => a.name === archivo.name && a.size === archivo.size
    );
    if (!duplicado) {
      archivosSeleccionados.push(archivo);
    }
  });

  if (errores.length > 0) {
    mostrarError(errores.join('\n'));
  }

  renderPreviews();
}

// ============================================================
// VALIDACIÓN
// ============================================================
function validarArchivo(file) {
  if (!TIPOS_VALIDOS.has(file.type.toLowerCase())) {
    return `"${file.name}" no es una imagen válida (se aceptan JPG, PNG, WEBP, HEIC).`;
  }
  if (file.size > MAX_MB * 1024 * 1024) {
    return `"${file.name}" pesa más de ${MAX_MB} MB.`;
  }
  return null;
}

// ============================================================
// RENDER DEL GRID DE PREVIEWS
// ============================================================
function renderPreviews() {
  const grid     = document.getElementById('preview-grid');
  const contador = document.getElementById('fotos-contador');
  const btnMas   = document.getElementById('btn-agregar');
  if (!grid) return;

  const n = archivosSeleccionados.length;

  // Actualizar contador
  if (contador) {
    contador.textContent = n === 0
      ? ''
      : `${n} foto${n !== 1 ? 's' : ''} seleccionada${n !== 1 ? 's' : ''}`;
  }

  // Mostrar/ocultar el botón de agregar más
  if (btnMas) {
    btnMas.style.display = n > 0 ? 'block' : 'none';
  }

  if (n === 0) {
    grid.style.display = 'none';
    grid.innerHTML = '';
    return;
  }

  grid.style.display = 'grid';
  grid.innerHTML = '';

  archivosSeleccionados.forEach((archivo, idx) => {
    const item = document.createElement('div');
    item.className  = 'preview-item';
    item.dataset.idx = idx;

    // Leer y mostrar imagen
    const reader = new FileReader();
    reader.onload = evt => {
      item.innerHTML = `
        <img src="${evt.target.result}" alt="Vista previa foto ${idx + 1}" />
        <button
          type="button"
          class="preview-remove"
          data-idx="${idx}"
          aria-label="Eliminar foto ${idx + 1}"
        >✕</button>
        <span class="preview-nombre">${cortarNombre(archivo.name)}</span>
      `;
      // Evento de eliminar
      item.querySelector('.preview-remove').addEventListener('click', e => {
        e.stopPropagation();
        eliminarFoto(idx);
      });
    };
    reader.readAsDataURL(archivo);

    grid.appendChild(item);
  });
}

function cortarNombre(nombre, max = 15) {
  return nombre.length > max ? `${nombre.slice(0, max - 1)}…` : nombre;
}

function eliminarFoto(idx) {
  archivosSeleccionados.splice(idx, 1);
  renderPreviews();
}

// ============================================================
// FORMULARIO — ENVÍO
// ============================================================
function initForm() {
  const form = document.getElementById('fotos-form');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    ocultarMensajes();

    // Validar que haya al menos una foto
    if (archivosSeleccionados.length === 0) {
      mostrarError('Por favor selecciona al menos una foto antes de enviar.');
      return;
    }

    // Validar nombre
    const nombre  = document.getElementById('campo-nombre').value.trim();
    const mesa    = document.getElementById('campo-mesa').value.trim();
    const mensaje = document.getElementById('campo-mensaje').value.trim();

    if (!nombre) {
      mostrarError('Por favor escribe tu nombre para que los novios sepan quién mandó la foto. 😊');
      return;
    }

    // Deshabilitar botón durante la subida
    const btnEnviar = document.getElementById('btn-enviar');
    btnEnviar.disabled     = true;
    btnEnviar.textContent  = 'Enviando…';

    try {
      if (FIREBASE_ENABLED) {
        await subirConFirebase({ nombre, mesa, mensaje });
      } else {
        await simularSubida();
      }
      mostrarExito();
    } catch (err) {
      console.error('Error al subir fotos:', err);
      mostrarError('Ocurrió un error al enviar las fotos. Por favor intenta de nuevo.');
      btnEnviar.disabled    = false;
      btnEnviar.textContent = 'Enviar fotos 💌';
    }
  });
}

// ============================================================
// SIMULACIÓN DE SUBIDA (Modo Demo — sin Firebase)
// ============================================================
async function simularSubida() {
  const progressWrap = document.getElementById('progress-wrapper');
  const progressBar  = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  const total        = archivosSeleccionados.length;

  if (progressWrap) progressWrap.style.display = 'block';

  for (let i = 0; i < total; i++) {
    if (progressText) {
      progressText.textContent = `Subiendo foto ${i + 1} de ${total}…`;
    }

    // Simular progreso suave
    await new Promise(resolve => {
      let pct = 0;
      const iv = setInterval(() => {
        pct += Math.random() * 20 + 8;
        if (pct >= 100) {
          pct = 100;
          clearInterval(iv);
          resolve();
        }
        if (progressBar) progressBar.style.width = `${Math.min(pct, 100)}%`;
      }, 120);
    });

    // Breve pausa entre fotos
    await new Promise(r => setTimeout(r, 300));
  }

  if (progressText) progressText.textContent = '¡Todo listo!';
  await new Promise(r => setTimeout(r, 500));
  if (progressWrap) progressWrap.style.display = 'none';
  if (progressBar)  progressBar.style.width = '0%';
}

// ============================================================
// SUBIDA REAL CON FIREBASE (activar con FIREBASE_ENABLED = true)
// ============================================================
async function subirConFirebase(datos) {
  /**
   * TODO: Descomentar y completar cuando Firebase esté configurado.
   *
   * import { initializeApp }         from 'https://www.gstatic.com/firebasejs/.../firebase-app.js';
   * import { getAuth, signInAnonymously } from '...';
   * import { getStorage, ref, uploadBytesResumable, getDownloadURL } from '...';
   * import { getFirestore, collection, addDoc, serverTimestamp }     from '...';
   * import FIREBASE_CONFIG from './firebase-config.js';
   *
   * const app  = initializeApp(FIREBASE_CONFIG);
   * const auth = getAuth(app);
   * const { user } = await signInAnonymously(auth);
   * const storage = getStorage(app);
   * const db      = getFirestore(app);
   *
   * for (const archivo of archivosSeleccionados) {
   *   const ts   = Date.now();
   *   const safe = archivo.name.replace(/[^a-zA-Z0-9._-]/g, '_');
   *   const ruta = `bodas/boda-mario-y-dani/${user.uid}/${ts}-${safe}`;
   *   const storageRef = ref(storage, ruta);
   *
   *   await new Promise((resolve, reject) => {
   *     const task = uploadBytesResumable(storageRef, archivo, { contentType: archivo.type });
   *     task.on('state_changed', null, reject, resolve);
   *   });
   *
   *   const url = await getDownloadURL(storageRef);
   *   await addDoc(collection(db, 'fotos_boda'), {
   *     userId:         user.uid,
   *     nombreInvitado: datos.nombre,
   *     mesa:           datos.mesa    || null,
   *     mensaje:        datos.mensaje || null,
   *     storagePath:    ruta,
   *     downloadUrl:    url,
   *     fileName:       archivo.name,
   *     fileSize:       archivo.size,
   *     uploadedAt:     serverTimestamp(),
   *   });
   * }
   */
  throw new Error('Firebase no está configurado todavía. Activa FIREBASE_ENABLED = false para usar el modo demo.');
}

// ============================================================
// MENSAJES — ÉXITO / ERROR
// ============================================================
function mostrarExito() {
  const el = document.getElementById('mensaje-exito');
  const form = document.getElementById('fotos-form');
  if (el) {
    // Ocultar el formulario, mostrar el mensaje
    if (form) {
      // Ocultar todos los campos excepto el mensaje
      [...form.children].forEach(child => {
        if (child.id !== 'mensaje-exito') child.style.display = 'none';
      });
    }
    el.style.display = 'block';
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function mostrarError(msg) {
  const el = document.getElementById('mensaje-error');
  if (el) {
    el.textContent   = msg;
    el.style.display = 'block';
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function ocultarMensajes() {
  const ex = document.getElementById('mensaje-exito');
  const er = document.getElementById('mensaje-error');
  if (ex) ex.style.display = 'none';
  if (er) er.style.display = 'none';
}

// ============================================================
// REINICIAR FORMULARIO (después del éxito)
// ============================================================
window.reiniciarFormulario = function () {
  archivosSeleccionados = [];
  renderPreviews();
  ocultarMensajes();

  // Restaurar visibilidad del formulario
  const form = document.getElementById('fotos-form');
  if (form) {
    [...form.children].forEach(child => { child.style.display = ''; });
    const exito = document.getElementById('mensaje-exito');
    if (exito) exito.style.display = 'none';
  }

  // Resetear campos
  const fForm = document.getElementById('fotos-form');
  if (fForm) fForm.reset();

  const btnEnviar = document.getElementById('btn-enviar');
  if (btnEnviar) {
    btnEnviar.disabled    = false;
    btnEnviar.textContent = 'Enviar fotos 💌';
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ============================================================
// SCROLL ANIMATIONS
// ============================================================
function initScrollAnimations() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.fade-in-up').forEach(el => el.classList.add('visible'));
    return;
  }
  const obs = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    }),
    { threshold: 0.1 }
  );
  document.querySelectorAll('.fade-in-up').forEach(el => obs.observe(el));
}
