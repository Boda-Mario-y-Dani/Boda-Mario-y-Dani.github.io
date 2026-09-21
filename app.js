/**
 * app.js — Invitación digital · Daniela & Mario · 12.12.2026
 *
 * Controla:
 *   1. Animación del sobre de apertura
 *   2. Cuenta regresiva al día de la boda
 *   3. Animaciones de aparición por scroll
 */

'use strict';

// ============================================================
// CONFIGURACIÓN
// ============================================================
const BODA_FECHA = new Date('2026-12-12T17:00:00-06:00'); // 12 Dic 2026, 17:00 CST

// ============================================================
// INICIALIZACIÓN
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initSobre();
  initScrollAnimations();
  // El countdown se inicia después de abrir el sobre
});

// ============================================================
// 1. ANIMACIÓN DEL SOBRE DE APERTURA
// ============================================================
function initSobre() {
  const overlay  = document.getElementById('sobre-intro');
  const invMain  = document.getElementById('inv-main');
  if (!overlay || !invMain) return;

  let yaAbierto = false;

  function abrirSobre() {
    if (yaAbierto) return;
    yaAbierto = true;

    overlay.classList.add('sobre-abriendo');

    setTimeout(() => {
      overlay.classList.add('sobre-cerrado');

      // Mostrar la invitación
      invMain.classList.remove('inv-oculta');
      invMain.classList.add('inv-visible');

      // Iniciar countdown solo al abrir
      initCountdown();

      // Re-disparar animaciones de scroll para los elementos ya visibles
      document.querySelectorAll('.fade-in-up').forEach(el => {
        el.classList.add('visible');
      });
    }, 900); // Duración de la animación de salida del sobre
  }

  // Abrir con click o tap
  overlay.addEventListener('click', abrirSobre);

  // Abrir con teclado
  overlay.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      abrirSobre();
    }
  });

  // Auto-abrir después de 4 segundos si el usuario no toca nada
  const autoTimer = setTimeout(abrirSobre, 4000);

  // Si el usuario toca, cancelar el auto-timer (ya lo abrirá el click)
  overlay.addEventListener('click', () => clearTimeout(autoTimer), { once: true });
}

// ============================================================
// 2. CUENTA REGRESIVA
// ============================================================
function initCountdown() {
  const elDias  = document.getElementById('cd-dias');
  const elHoras = document.getElementById('cd-horas');
  const elMin   = document.getElementById('cd-min');
  const elSeg   = document.getElementById('cd-seg');

  if (!elDias) return;

  function actualizar() {
    const ahora = new Date();
    const diff  = BODA_FECHA - ahora;

    if (diff <= 0) {
      // ¡Es el día! o ya pasó
      elDias.textContent  = '0';
      elHoras.textContent = '0';
      elMin.textContent   = '0';
      elSeg.textContent   = '0';
      return;
    }

    elDias.textContent  = Math.floor(diff / 86_400_000);
    elHoras.textContent = Math.floor((diff % 86_400_000) / 3_600_000);
    elMin.textContent   = Math.floor((diff % 3_600_000) / 60_000);
    elSeg.textContent   = Math.floor((diff % 60_000) / 1_000);
  }

  actualizar();
  setInterval(actualizar, 1000);
}

// ============================================================
// 3. ANIMACIONES POR SCROLL (IntersectionObserver)
// ============================================================
function initScrollAnimations() {
  if (!('IntersectionObserver' in window)) {
    // Fallback para navegadores antiguos
    document.querySelectorAll('.fade-in-up').forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }),
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el));
}
