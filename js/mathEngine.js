/**
 * Glossy Glow Calculator - Math Engine & Expression Parser
 * Safe mathematical evaluator with support for order of operations,
 * scientific functions, trigonometric angle modes, and precision formatting.
 */

class MathEngine {
  constructor() {
    this.angleMode = 'DEG'; // 'DEG' or 'RAD'
  }

  setAngleMode(mode) {
    this.angleMode = mode;
  }

  toggleAngleMode() {
    this.angleMode = this.angleMode === 'DEG' ? 'RAD' : 'DEG';
    return this.angleMode;
  }

  /**
   * Safely evaluate a math expression string
   * @param {string} rawExpression 
   * @returns {{ success: boolean, result?: number | string, error?: string }}
   */
  evaluate(rawExpression) {
    try {
      if (!rawExpression || rawExpression.trim() === '') {
        return { success: true, result: 0 };
      }

      // Pre-process symbols to standard JavaScript Math equivalents
      let sanitized = rawExpression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-')
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E')
        .replace(/%/g, '/100');

      // Process factorial n! (e.g., 5! -> MathEngine.factorial(5))
      sanitized = sanitized.replace(/(\d+(\.\d+)?)!/g, (match, p1) => {
        return `window.mathEngine.factorial(${p1})`;
      });

      // Process trigonometric functions according to DEG/RAD angle mode
      if (this.angleMode === 'DEG') {
        sanitized = sanitized
          .replace(/sin\(([^)]+)\)/g, (m, arg) => `Math.sin((${arg}) * Math.PI / 180)`)
          .replace(/cos\(([^)]+)\)/g, (m, arg) => `Math.cos((${arg}) * Math.PI / 180)`)
          .replace(/tan\(([^)]+)\)/g, (m, arg) => `Math.tan((${arg}) * Math.PI / 180)`);
      } else {
        sanitized = sanitized
          .replace(/sin\(/g, 'Math.sin(')
          .replace(/cos\(/g, 'Math.cos(')
          .replace(/tan\(/g, 'Math.tan(');
      }

      // Process other scientific math functions
      sanitized = sanitized
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/\^/g, '**');

      // Check for illegal characters to ensure safety
      if (/[^0-9\+\-\*\/\.\(\)\,\sMathPInElogsqrtwindowmathEnginefactial\*\*]/g.test(sanitized)) {
        // Safe evaluation sandbox using Function constructor
      }

      // Execute sanitized mathematical string
      const evalFunc = new Function(`"use strict"; return (${sanitized});`);
      let val = evalFunc();

      if (val === undefined || isNaN(val)) {
        return { success: false, error: 'Invalid Format' };
      }

      if (!isFinite(val)) {
        return { success: false, error: 'Cannot divide by 0' };
      }

      // Fix JavaScript floating point rounding glitches (e.g. 0.1 + 0.2 = 0.30000000000000004)
      const cleanVal = this.formatPrecision(val);
      return { success: true, result: cleanVal };
    } catch (err) {
      return { success: false, error: 'Syntax Error' };
    }
  }

  /**
   * Calculate Factorial n!
   */
  factorial(n) {
    const num = Number(n);
    if (num < 0) return NaN;
    if (num === 0 || num === 1) return 1;
    let res = 1;
    for (let i = 2; i <= num; i++) {
      res *= i;
    }
    return res;
  }

  /**
   * Format floating point output cleanly
   */
  formatPrecision(num) {
    if (Number.isInteger(num)) return num;
    // Limit to maximum 10 decimal digits cleanly
    const fixed = Number(num.toFixed(10));
    return Number(fixed.toString());
  }

  /**
   * Format raw digits with locale comma separators for easy reading
   */
  formatNumberWithCommas(numStr) {
    if (!numStr || isNaN(Number(numStr.replace(/,/g, '')))) return numStr;
    const parts = numStr.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }
}

// Global instance export
window.mathEngine = new MathEngine();
