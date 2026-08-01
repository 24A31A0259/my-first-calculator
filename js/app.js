/**
 * Glossy Glow Calculator - Main Application Entry & UI Animation Controller
 * Handles radial cursor lighting, button ripple waves, theme menu toggles, and UI wiring.
 */

document.addEventListener('DOMContentLoaded', () => {
  const calc = window.calculatorController;
  const audio = window.audioEngine;

  // 1. Mouse Movement Listener for Dynamic Radial Glow on Buttons
  document.querySelectorAll('.btn-glass').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      btn.style.setProperty('--mouse-x', `${x}px`);
      btn.style.setProperty('--mouse-y', `${y}px`);
    });

    // 2. Click Handler with Ripple Animation Wave
    btn.addEventListener('click', (e) => {
      const val = btn.dataset.value;
      const type = btn.dataset.type || 'digit';

      // Create visual ripple element
      const ripple = document.createElement('span');
      ripple.classList.add('ripple-wave');
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 500);

      if (type === 'digit' && /^[0-9]$/.test(val)) {
        audio.playDigitSound(val);
      } else {
        audio.playKeySound(type);
      }

      // Delegate input to calculator controller
      calc.handleInput(val, type);
    });
  });

  // 3. Audio Toggle Controller
  const audioToggleBtn = document.getElementById('audioToggleBtn');
  audioToggleBtn.addEventListener('click', () => {
    const isEnabled = audio.toggle();
    if (isEnabled) {
      audioToggleBtn.classList.add('active');
    } else {
      audioToggleBtn.classList.remove('active');
    }
  });

  // 4. Mode Toggle Controller
  const sciToggleBtn = document.getElementById('sciToggleBtn');
  const body = document.getElementById('calculatorBody');
  const container = document.getElementById('calculatorContainer');

  const setMode = (mode) => {
    body.classList.remove('mode-basic', 'mode-scientific', 'mode-advanced');
    body.classList.add(`mode-${mode}`);
    container.classList.toggle('scientific-active', mode === 'scientific' || mode === 'advanced');

    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === mode);
    });

    sciToggleBtn.classList.toggle('active', mode === 'scientific' || mode === 'advanced');
  };

  setMode('basic');

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setMode(btn.dataset.tab);
    });
  });

  sciToggleBtn.addEventListener('click', () => {
    const nextMode = body.classList.contains('mode-scientific') ? 'basic' : 'scientific';
    setMode(nextMode);
  });

  document.getElementById('copyResultBtn').addEventListener('click', async () => {
    const text = document.getElementById('mainResult').textContent;
    if (text) {
      await navigator.clipboard.writeText(text);
    }
  });

  // 5. Angle Mode (DEG / RAD) Toggle Controller
  const angleBtn = document.getElementById('angleModeBtn');
  if (angleBtn) {
    angleBtn.addEventListener('click', () => {
      const newMode = window.mathEngine.toggleAngleMode();
      angleBtn.textContent = newMode;
    });
  }

  // 6. History Drawer Toggles
  const historyToggleBtn = document.getElementById('historyToggleBtn');
  const closeHistoryBtn = document.getElementById('closeHistoryBtn');

  historyToggleBtn.addEventListener('click', () => {
    calc.toggleHistory();
  });

  closeHistoryBtn.addEventListener('click', () => {
    calc.toggleHistory(false);
  });

  // 7. Theme Selector Dropdown Controller
  const themeMenuBtn = document.getElementById('themeMenuBtn');
  const themeMenu = document.getElementById('themeMenu');

  themeMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    themeMenu.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!themeMenu.contains(e.target) && e.target !== themeMenuBtn) {
      themeMenu.classList.remove('open');
    }
  });

  document.querySelectorAll('.theme-option').forEach(option => {
    option.addEventListener('click', () => {
      const theme = option.dataset.theme;
      calc.applyTheme(theme);
      themeMenu.classList.remove('open');
    });
  });

  console.log('✨ Glossy Glow Calculator initialized successfully!');
});
