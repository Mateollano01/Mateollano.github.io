/**
 * CV PRO SUITE - CONTROLADOR INTERACTIVO
 * Maneja el cambio de formatos (ATS / Visual), edición en vivo,
 * modal de consejos y generación de PDF en alta definición.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Estado actual de la aplicación
  let currentMode = 'ats'; // 'ats' o 'visual'
  let isEditing = false;

  // Elementos DOM
  const btnModeAts = document.getElementById('btn-mode-ats');
  const btnModeVisual = document.getElementById('btn-mode-visual');
  const resumeAts = document.getElementById('resume-ats');
  const resumeVisual = document.getElementById('resume-visual');
  const bannerText = document.getElementById('banner-text');

  const btnToggleEdit = document.getElementById('btn-toggle-edit');
  const editBtnText = document.getElementById('edit-btn-text');

  const btnDownloadPdf = document.getElementById('btn-download-pdf');
  const btnPrint = document.getElementById('btn-print');

  const btnShowTips = document.getElementById('btn-show-tips');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnModalUnderstand = document.getElementById('btn-modal-understand');
  const tipsModal = document.getElementById('tips-modal');

  const toast = document.getElementById('toast-msg');
  const toastText = document.getElementById('toast-text');

  // ========================================================
  // 1. SISTEMA DE NOTIFICACIONES TOAST
  // ========================================================
  let toastTimeout = null;
  function showToast(message, isError = false) {
    if (toastTimeout) clearTimeout(toastTimeout);
    
    toastText.textContent = message;
    const icon = toast.querySelector('i');
    if (isError) {
      icon.className = 'fa-solid fa-circle-exclamation';
      icon.style.color = '#ef4444';
    } else {
      icon.className = 'fa-solid fa-circle-check';
      icon.style.color = '#10b981';
    }

    toast.classList.add('show');
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3800);
  }

  // ========================================================
  // 2. CAMBIO DE FORMATO (ATS vs VISUAL)
  // ========================================================
  function setViewMode(mode) {
    currentMode = mode;

    if (mode === 'ats') {
      // Activar ATS
      btnModeAts.classList.add('active');
      btnModeAts.setAttribute('aria-selected', 'true');
      btnModeVisual.classList.remove('active');
      btnModeVisual.setAttribute('aria-selected', 'false');

      resumeAts.classList.remove('hidden-view');
      resumeVisual.classList.add('hidden-view');

      bannerText.innerHTML = '<strong>Modo ATS activo:</strong> Estructura lineal y semántica estándar optimizada para superar filtros automáticos de RRHH.';
      showToast('Cambiado a Formato ATS (Optimizado para portales de empleo)');
    } else {
      // Activar Visual
      btnModeVisual.classList.add('active');
      btnModeVisual.setAttribute('aria-selected', 'true');
      btnModeAts.classList.remove('active');
      btnModeAts.setAttribute('aria-selected', 'false');

      resumeVisual.classList.remove('hidden-view');
      resumeAts.classList.add('hidden-view');

      bannerText.innerHTML = '<strong>Modo Visual activo:</strong> Diseño moderno de 2 columnas con tarjetas y badges, ideal para entrevistas presenciales y envíos directos.';
      showToast('Cambiado a Formato Visual Moderno (Diseño ejecutivo)');
    }
  }

  btnModeAts.addEventListener('click', () => setViewMode('ats'));
  btnModeVisual.addEventListener('click', () => setViewMode('visual'));

  // ========================================================
  // 3. MODO EDICIÓN EN VIVO
  // ========================================================
  function toggleEditing() {
    isEditing = !isEditing;
    const editableElements = document.querySelectorAll('.resume-page [contenteditable]');

    if (isEditing) {
      document.body.classList.add('is-editing');
      btnToggleEdit.classList.add('editing-active');
      editBtnText.textContent = 'Guardar Edición';
      btnToggleEdit.querySelector('i').className = 'fa-solid fa-floppy-disk';

      editableElements.forEach(el => {
        el.setAttribute('contenteditable', 'true');
      });

      showToast('Modo edición activado. Haz clic sobre cualquier texto para editarlo.');
    } else {
      document.body.classList.remove('is-editing');
      btnToggleEdit.classList.remove('editing-active');
      editBtnText.textContent = 'Modo Edición';
      btnToggleEdit.querySelector('i').className = 'fa-solid fa-pen-to-square';

      editableElements.forEach(el => {
        el.setAttribute('contenteditable', 'false');
      });

      showToast('Cambios guardados con éxito en la vista.');
    }
  }

  btnToggleEdit.addEventListener('click', toggleEditing);

  // ========================================================
  // 4. DESCARGA EN PDF (html2pdf.js)
  // ========================================================
  async function downloadPDF() {
    // Si está editando, desactivamos momentáneamente para que no salgan los contornos en el PDF
    const wasEditing = isEditing;
    if (wasEditing) {
      toggleEditing();
    }

    const activeElement = currentMode === 'ats' ? resumeAts : resumeVisual;
    const filenamePrefix = currentMode === 'ats' ? 'Curriculum_ATS_Mateo_Llano' : 'Curriculum_Visual_Mateo_Llano';
    
    // Indicador visual en el botón
    const originalBtnHtml = btnDownloadPdf.innerHTML;
    btnDownloadPdf.disabled = true;
    btnDownloadPdf.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Generando PDF...</span>';

    try {
      // Opciones precisas para A4 en alta resolución
      const opt = {
        margin: currentMode === 'ats' ? [8, 8, 8, 8] : [0, 0, 0, 0],
        filename: `${filenamePrefix}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          logging: false,
          scrollY: 0
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        },
        pagebreak: {
          mode: ['avoid-all', 'css', 'legacy']
        }
      };

      await html2pdf().set(opt).from(activeElement).save();
      showToast(`¡PDF generado exitosamente en formato ${currentMode.toUpperCase()}!`);
    } catch (error) {
      console.error('Error generando PDF con html2pdf:', error);
      showToast('Error al generar el PDF. Abriendo ventana de impresión alternativa...', true);
      // Fallback a impresión nativa
      setTimeout(() => window.print(), 800);
    } finally {
      btnDownloadPdf.disabled = false;
      btnDownloadPdf.innerHTML = originalBtnHtml;

      // Si estaba editando antes de descargar, reactivamos
      if (wasEditing) {
        toggleEditing();
      }
    }
  }

  btnDownloadPdf.addEventListener('click', downloadPDF);

  // ========================================================
  // 5. IMPRESIÓN NATIVA / GUARDAR COMO PDF DEL NAVEGADOR
  // ========================================================
  btnPrint.addEventListener('click', () => {
    // Aseguramos que los contornos de edición no aparezcan
    if (isEditing) {
      toggleEditing();
    }
    showToast('Abriendo cuadro de diálogo de impresión...');
    setTimeout(() => {
      window.print();
    }, 300);
  });

  // ========================================================
  // 6. MODAL DE CONSEJOS DEL RECLUTADOR
  // ========================================================
  function openTipsModal() {
    tipsModal.classList.add('show');
    tipsModal.setAttribute('aria-hidden', 'false');
  }

  function closeTipsModal() {
    tipsModal.classList.remove('show');
    tipsModal.setAttribute('aria-hidden', 'true');
  }

  btnShowTips.addEventListener('click', openTipsModal);
  btnCloseModal.addEventListener('click', closeTipsModal);
  btnModalUnderstand.addEventListener('click', closeTipsModal);

  // Cerrar al presionar fuera de la tarjeta
  tipsModal.addEventListener('click', (e) => {
    if (e.target === tipsModal) {
      closeTipsModal();
    }
  });

  // Cerrar con tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && tipsModal.classList.contains('show')) {
      closeTipsModal();
    }
  });
});

