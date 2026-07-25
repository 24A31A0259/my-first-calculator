/**
 * Glossy Glow Calculator - Core Calculator State & Controller Module
 * Handles display updates, history logging, memory registers, keyboard listener,
 * and theme switching.
 */

class CalculatorController {
  constructor() {
    this.expression = '';
    this.currentResult = '0';
    this.memory = 0;
    this.history = [];
    this.isEvaluated = false;
    this.isScientific = false;
    this.theme = localStorage.getItem('glow_calc_theme') || 'cyber';

    this.initDOM();
    this.loadHistory();
    this.applyTheme(this.theme);
    this.bindKeyboard();
  }

  initDOM() {
    this.exprDisplay = document.getElementById('expressionDisplay');
    this.resultDisplay = document.getElementById('mainResult');
    this.memoryBadge = document.getElementById('memoryIndicator');
    this.historyList = document.getElementById('historyList');
    this.historyDrawer = document.getElementById('historyDrawer');
    this.calcContainer = document.getElementById('calculatorContainer');
    this.angleBtn = document.getElementById('angleModeBtn');
  }

  loadHistory() {
    try {
      const saved = localStorage.getItem('glow_calc_history');
      if (saved) {
        this.history = JSON.parse(saved);
        this.renderHistory();
      }
    } catch (e) {
      this.history = [];
    }
  }

  saveHistory() {
    localStorage.setItem('glow_calc_history', JSON.stringify(this.history.slice(0, 30)));
  }

  applyTheme(themeName) {
    this.theme = themeName;
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('glow_calc_theme', themeName);
    
    // Update theme selector state UI
    document.querySelectorAll('.theme-option').forEach(el => {
      if (el.dataset.theme === themeName) {
        el.classList.add('selected');
      } else {
        el.classList.remove('selected');
      }
    });
  }

  /**
   * Handle Key Input (Click or Physical Keypress)
   * @param {string} val 
   * @param {'digit' | 'operator' | 'action' | 'equals' | 'sci'} type 
   */
  handleInput(val, type = 'digit') {
    window.audioEngine.playKeySound(type);

    if (type === 'action') {
      this.handleAction(val);
      return;
    }

    if (type === 'equals') {
      this.evaluateExpression();
      return;
    }

    if (this.isEvaluated && (type === 'digit' || val === '(')) {
      this.expression = '';
      this.isEvaluated = false;
    } else if (this.isEvaluated && (type === 'operator' || type === 'sci')) {
      this.expression = this.currentResult.toString();
      this.isEvaluated = false;
    }

    // Append value or function call to expression
    if (type === 'sci') {
      if (['sin', 'cos', 'tan', 'sqrt', 'log', 'ln'].includes(val)) {
        this.expression += `${val}(`;
      } else if (val === 'x^y') {
        this.expression += '^';
      } else if (val === 'x!') {
        this.expression += '!';
      } else {
        this.expression += val;
      }
    } else {
      this.expression += val;
    }

    this.updateDisplay();
  }

  handleAction(action) {
    switch (action) {
      case 'AC':
        this.expression = '';
        this.currentResult = '0';
        this.isEvaluated = false;
        this.resultDisplay.classList.remove('error');
        break;

      case 'DEL':
        if (this.isEvaluated) {
          this.expression = '';
          this.currentResult = '0';
          this.isEvaluated = false;
        } else {
          this.expression = this.expression.slice(0, -1);
        }
        break;

      case '+/-':
        if (this.expression) {
          if (this.expression.startsWith('-')) {
            this.expression = this.expression.slice(1);
          } else {
            this.expression = '-' + this.expression;
          }
        } else if (this.currentResult && this.currentResult !== '0') {
          this.currentResult = (Number(this.currentResult) * -1).toString();
        }
        break;

      case 'MC':
        this.memory = 0;
        this.updateMemoryBadge();
        break;

      case 'MR':
        this.expression += this.memory.toString();
        break;

      case 'M+':
        const evalPlus = window.mathEngine.evaluate(this.expression || this.currentResult);
        if (evalPlus.success) {
          this.memory += Number(evalPlus.result);
          this.updateMemoryBadge();
        }
        break;

      case 'M-':
        const evalMin = window.mathEngine.evaluate(this.expression || this.currentResult);
        if (evalMin.success) {
          this.memory -= Number(evalMin.result);
          this.updateMemoryBadge();
        }
        break;
    }

    this.updateDisplay();
  }

  evaluateExpression() {
    if (!this.expression && !this.currentResult) return;

    const targetExpr = this.expression || this.currentResult;
    const res = window.mathEngine.evaluate(targetExpr);

    if (res.success) {
      const formattedRes = res.result;
      
      // Save to History
      this.history.unshift({
        expression: targetExpr,
        result: formattedRes,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      this.saveHistory();
      this.renderHistory();

      this.currentResult = formattedRes.toString();
      this.isEvaluated = true;
      this.resultDisplay.classList.remove('error');
    } else {
      this.currentResult = res.error || 'Error';
      this.resultDisplay.classList.add('error');
    }

    this.updateDisplay();
  }

  updateDisplay() {
    this.exprDisplay.textContent = this.expression || '';
    
    if (!this.isEvaluated && this.expression) {
      // Live calculation preview
      const preview = window.mathEngine.evaluate(this.expression);
      if (preview.success) {
        this.resultDisplay.textContent = preview.result.toString();
        this.resultDisplay.classList.remove('error');
      } else {
        this.resultDisplay.textContent = this.currentResult;
      }
    } else {
      this.resultDisplay.textContent = this.currentResult;
    }

    // Dynamic Font Scaling for large numbers
    const len = this.resultDisplay.textContent.length;
    if (len > 12) {
      this.resultDisplay.style.fontSize = '1.8rem';
    } else if (len > 8) {
      this.resultDisplay.style.fontSize = '2.2rem';
    } else {
      this.resultDisplay.style.fontSize = '';
    }
  }

  updateMemoryBadge() {
    if (this.memory !== 0) {
      this.memoryBadge.classList.add('active');
    } else {
      this.memoryBadge.classList.remove('active');
    }
  }

  renderHistory() {
    if (!this.historyList) return;
    if (this.history.length === 0) {
      this.historyList.innerHTML = `
        <div class="empty-history">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span>No past calculations</span>
        </div>`;
      return;
    }

    this.historyList.innerHTML = this.history.map((item, idx) => `
      <div class="history-item" data-index="${idx}">
        <span class="history-expr">${item.expression} =</span>
        <span class="history-res">${item.result}</span>
      </div>
    `).join('');

    // Click history item to recall result
    this.historyList.querySelectorAll('.history-item').forEach(el => {
      el.addEventListener('click', () => {
        const item = this.history[el.dataset.index];
        if (item) {
          this.expression = item.result.toString();
          this.currentResult = item.result.toString();
          this.updateDisplay();
          this.toggleHistory(false);
        }
      });
    });
  }

  toggleHistory(show) {
    if (show === undefined) {
      this.historyDrawer.classList.toggle('open');
    } else if (show) {
      this.historyDrawer.classList.add('open');
    } else {
      this.historyDrawer.classList.remove('open');
    }
  }

  toggleScientific() {
    this.isScientific = !this.isScientific;
    if (this.isScientific) {
      this.calcContainer.classList.add('scientific-active');
    } else {
      this.calcContainer.classList.remove('scientific-active');
    }
    return this.isScientific;
  }

  bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      // Avoid interference with input fields if any
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      const key = e.key;

      if (key >= '0' && key <= '9') {
        this.handleInput(key, 'digit');
        this.highlightKey(key);
      } else if (key === '.') {
        this.handleInput('.', 'digit');
        this.highlightKey('.');
      } else if (['+', '-', '*', '/'].includes(key)) {
        const symbolMap = { '+': '+', '-': '−', '*': '×', '/': '÷' };
        this.handleInput(symbolMap[key], 'operator');
        this.highlightKey(symbolMap[key]);
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        this.handleInput('=', 'equals');
        this.highlightKey('=');
      } else if (key === 'Backspace') {
        this.handleInput('DEL', 'action');
        this.highlightKey('DEL');
      } else if (key === 'Escape') {
        this.handleInput('AC', 'action');
        this.highlightKey('AC');
      } else if (key === '(' || key === ')') {
        this.handleInput(key, 'digit');
      } else if (key === '%') {
        this.handleInput('%', 'operator');
      }
    });
  }

  highlightKey(value) {
    const btn = Array.from(document.querySelectorAll('.btn-glass')).find(
      b => b.dataset.value === value || b.textContent.trim() === value
    );
    if (btn) {
      btn.classList.add('pressed');
      setTimeout(() => btn.classList.remove('pressed'), 150);
    }
  }
}

// Global instance export
window.calculatorController = new CalculatorController();
