class AdvancedModules {
  constructor() {
    this.currentModule = 'stats';
    this.unitCatalog = {
      length: [
        ['m', 'Meters'], ['km', 'Kilometers'], ['cm', 'Centimeters'], ['mm', 'Millimeters'], ['in', 'Inches'], ['ft', 'Feet'], ['yd', 'Yards'], ['mi', 'Miles']
      ],
      mass: [
        ['g', 'Grams'], ['kg', 'Kilograms'], ['mg', 'Milligrams'], ['lb', 'Pounds'], ['oz', 'Ounces']
      ],
      temperature: [
        ['C', 'Celsius'], ['F', 'Fahrenheit'], ['K', 'Kelvin']
      ],
      volume: [
        ['L', 'Liters'], ['mL', 'Milliliters'], ['gal', 'Gallons'], ['cup', 'Cups']
      ],
      speed: [
        ['m/s', 'Meters per second'], ['km/h', 'Kilometers per hour'], ['mph', 'Miles per hour'], ['kn', 'Knots']
      ]
    };
    this.conversionFactors = {
      length: { m: 1, km: 1000, cm: 0.01, mm: 0.001, in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344 },
      mass: { g: 1, kg: 1000, mg: 0.001, lb: 453.59237, oz: 28.349523125 },
      temperature: { C: 1, F: 1.8, K: 1 },
      volume: { L: 1, mL: 0.001, gal: 3.785411784, cup: 0.2365882365 },
      speed: { 'm/s': 1, 'km/h': 0.2777777778, mph: 0.44704, kn: 0.5144444444 }
    };
    this.customFunctions = {};
    this.init();
  }

  init() {
    this.bindModuleTabs();
    this.bindButtons();
    this.populateUnits();
    this.renderGraph();
  }

  bindModuleTabs() {
    document.querySelectorAll('.module-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.module-tab').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.module-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const module = btn.dataset.module;
        this.currentModule = module;
        document.getElementById(`${module}Module`).classList.add('active');
      });
    });
  }

  bindButtons() {
    document.getElementById('statsComputeBtn').addEventListener('click', () => this.computeStats());
    document.getElementById('statsUseExprBtn').addEventListener('click', () => this.useCurrentExpression('stats'));
    document.getElementById('matrixComputeBtn').addEventListener('click', () => this.computeMatrix());
    document.getElementById('matrixUseExprBtn').addEventListener('click', () => this.useCurrentExpression('matrix'));
    document.getElementById('complexComputeBtn').addEventListener('click', () => this.computeComplex());
    document.getElementById('complexUseExprBtn').addEventListener('click', () => this.useCurrentExpression('complex'));
    document.getElementById('graphPlotBtn').addEventListener('click', () => this.renderGraph());
    document.getElementById('graphUseExprBtn').addEventListener('click', () => this.useCurrentExpression('graph'));
    document.getElementById('unitConvertBtn').addEventListener('click', () => this.convertUnits());
    document.getElementById('programConvertBtn').addEventListener('click', () => this.convertProgramming());
    document.getElementById('programBitBtn').addEventListener('click', () => this.bitwiseDemo());
    document.getElementById('calcRunBtn').addEventListener('click', () => this.runCalculus());
    document.getElementById('customSaveBtn').addEventListener('click', () => this.saveCustom());
    document.getElementById('customUseExprBtn').addEventListener('click', () => this.useCurrentExpression('custom'));

    const categorySelect = document.getElementById('unitCategory');
    categorySelect.addEventListener('change', () => this.populateUnits());
    document.getElementById('unitValue').addEventListener('input', () => this.convertUnits());
    document.getElementById('unitFrom').addEventListener('change', () => this.convertUnits());
    document.getElementById('unitTo').addEventListener('change', () => this.convertUnits());
  }

  useCurrentExpression(target) {
    const expr = document.getElementById('expressionDisplay').textContent || document.getElementById('mainResult').textContent;
    if (!expr) return;
    if (target === 'stats') {
      document.getElementById('statsInput').value = expr;
    } else if (target === 'matrix') {
      document.getElementById('matrixInput').value = expr;
    } else if (target === 'complex') {
      document.getElementById('complexInput').value = expr;
    } else if (target === 'graph') {
      document.getElementById('graphInput').value = expr;
    } else if (target === 'custom') {
      document.getElementById('customInput').value = expr;
    }
  }

  computeStats() {
    const value = document.getElementById('statsInput').value;
    const numbers = value.split(/[,\s]+/).map(n => Number(n)).filter(n => !Number.isNaN(n));
    if (numbers.length === 0) {
      document.getElementById('statsOutput').innerHTML = '<div class="result-card">Enter numeric values.</div>';
      return;
    }
    const sum = numbers.reduce((a, b) => a + b, 0);
    const mean = sum / numbers.length;
    const sorted = [...numbers].sort((a, b) => a - b);
    const median = sorted.length % 2 === 0 ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2 : sorted[Math.floor(sorted.length / 2)];
    const variance = numbers.reduce((a, b) => a + (b - mean) ** 2, 0) / numbers.length;
    const std = Math.sqrt(variance);
    document.getElementById('statsOutput').innerHTML = `
      <strong>Count:</strong> ${numbers.length}<br>
      <strong>Sum:</strong> ${sum.toFixed(3)}<br>
      <strong>Mean:</strong> ${mean.toFixed(3)}<br>
      <strong>Median:</strong> ${median.toFixed(3)}<br>
      <strong>Range:</strong> ${Math.max(...numbers) - Math.min(...numbers)}<br>
      <strong>Variance:</strong> ${variance.toFixed(3)}<br>
      <strong>Std Dev:</strong> ${std.toFixed(3)}
    `;
  }

  computeMatrix() {
    const value = document.getElementById('matrixInput').value;
    const parsed = value.split(';').map(row => row.split(',').map(n => Number(n.trim())));
    const matrix = parsed.filter(r => r.length > 0);
    if (!matrix.length || matrix.some(r => r.some(n => Number.isNaN(n)))) {
      document.getElementById('matrixOutput').innerHTML = 'Enter a matrix like 1,2;3,4';
      return;
    }
    const determinant = matrix.length === 2 && matrix[0].length === 2 && matrix[1].length === 2
      ? (matrix[0][0] * matrix[1][1]) - (matrix[0][1] * matrix[1][0])
      : 'n/a';
    document.getElementById('matrixOutput').innerHTML = `
      <strong>Shape:</strong> ${matrix.length}×${matrix[0].length}<br>
      <strong>Determinant:</strong> ${determinant}
    `;
  }

  computeComplex() {
    const value = document.getElementById('complexInput').value.trim();
    const match = value.match(/([+-]?\d*\.?\d+)\s*([+-])\s*(\d*\.?\d*)i/);
    if (!match) {
      document.getElementById('complexOutput').innerHTML = 'Use format like 3+4i';
      return;
    }
    const a = Number(match[1]);
    const sign = match[2] === '-' ? -1 : 1;
    const b = sign * Number(match[3] || '1');
    const modulus = Math.sqrt(a * a + b * b);
    const argument = Math.atan2(b, a) * (180 / Math.PI);
    document.getElementById('complexOutput').innerHTML = `
      <strong>Modulus:</strong> ${modulus.toFixed(3)}<br>
      <strong>Argument:</strong> ${argument.toFixed(3)}°
    `;
  }

  renderGraph() {
    const canvas = document.getElementById('graphCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const expr = document.getElementById('graphInput').value || 'sin(x)';
    ctx.strokeStyle = '#00f3ff';
    ctx.beginPath();
    for (let x = 0; x < canvas.width; x++) {
      const px = (x / canvas.width) * 20 - 10;
      let y = 0;
      try {
        const safeExpr = expr.replace(/x/g, `(${px})`).replace(/sin\(/g, 'Math.sin(').replace(/cos\(/g, 'Math.cos(').replace(/tan\(/g, 'Math.tan(').replace(/sqrt\(/g, 'Math.sqrt(');
        y = Function(`"use strict"; return (${safeExpr});`)();
      } catch (e) {
        y = 0;
      }
      const py = canvas.height / 2 - (y * 20);
      if (x === 0) ctx.moveTo(x, py); else ctx.lineTo(x, py);
    }
    ctx.stroke();
    document.getElementById('graphModule').querySelector('.result-card').innerHTML = `Plot preview for: ${expr}`;
  }

  populateUnits() {
    const category = document.getElementById('unitCategory').value;
    const from = document.getElementById('unitFrom');
    const to = document.getElementById('unitTo');
    from.innerHTML = this.unitCatalog[category].map(([code, label]) => `<option value="${code}">${label}</option>`).join('');
    to.innerHTML = this.unitCatalog[category].map(([code, label]) => `<option value="${code}">${label}</option>`).join('');
    from.value = this.unitCatalog[category][0][0];
    to.value = this.unitCatalog[category][1][0];
    this.convertUnits();
  }

  convertUnits() {
    const category = document.getElementById('unitCategory').value;
    const value = Number(document.getElementById('unitValue').value);
    const from = document.getElementById('unitFrom').value;
    const to = document.getElementById('unitTo').value;
    if (category === 'temperature') {
      let celsius;
      if (from === 'C') celsius = value;
      if (from === 'F') celsius = (value - 32) * 5 / 9;
      if (from === 'K') celsius = value - 273.15;
      let result;
      if (to === 'C') result = celsius;
      if (to === 'F') result = (celsius * 9 / 5) + 32;
      if (to === 'K') result = celsius + 273.15;
      document.getElementById('unitOutput').innerHTML = `${value} ${from} = ${result.toFixed(2)} ${to}`;
      return;
    }
    const base = value * this.conversionFactors[category][from];
    const result = base / this.conversionFactors[category][to];
    document.getElementById('unitOutput').innerHTML = `${value} ${from} = ${result.toFixed(3)} ${to}`;
  }

  convertProgramming() {
    const value = Number(document.getElementById('programInput').value);
    const binary = value.toString(2);
    const hex = '0x' + value.toString(16).toUpperCase();
    const octal = '0o' + value.toString(8);
    document.getElementById('programOutput').innerHTML = `<strong>DEC:</strong> ${value}<br><strong>BIN:</strong> ${binary}<br><strong>HEX:</strong> ${hex}<br><strong>OCT:</strong> ${octal}`;
  }

  bitwiseDemo() {
    const value = Number(document.getElementById('programInput').value);
    const result = value & 0x0F;
    document.getElementById('programOutput').innerHTML = `AND 0x0F = ${result}`;
  }

  runCalculus() {
    const expr = document.getElementById('calcFunction').value;
    const point = Number(document.getElementById('calcPoint').value);
    const mode = document.getElementById('calcMode').value;
    if (mode === 'derivative') {
      const derivative = this.numericDerivative(expr, point);
      document.getElementById('calcOutput').innerHTML = `f'(${point}) ≈ ${derivative.toFixed(4)}`;
    } else if (mode === 'integral') {
      const integral = this.numericIntegral(expr, point);
      document.getElementById('calcOutput').innerHTML = `∫₀^${point} f(x)dx ≈ ${integral.toFixed(4)}`;
    } else {
      document.getElementById('calcOutput').innerHTML = `Limit near ${point} is estimated from the input.`;
    }
  }

  numericDerivative(expr, x) {
    const h = 0.0001;
    const fx = this.evaluateExpression(expr, x);
    const fxh = this.evaluateExpression(expr, x + h);
    const fxmh = this.evaluateExpression(expr, x - h);
    return (fxh - fxmh) / (2 * h);
  }

  numericIntegral(expr, x) {
    const h = 0.1;
    let sum = 0;
    for (let i = 0; i < x / h; i++) {
      sum += this.evaluateExpression(expr, i * h) * h;
    }
    return sum;
  }

  evaluateExpression(expr, xValue) {
    const safeExpr = expr.replace(/x/g, `(${xValue})`).replace(/\^/g, '**').replace(/sin\(/g, 'Math.sin(').replace(/cos\(/g, 'Math.cos(').replace(/tan\(/g, 'Math.tan(').replace(/sqrt\(/g, 'Math.sqrt(');
    return Function(`"use strict"; return (${safeExpr});`)();
  }

  saveCustom() {
    const value = document.getElementById('customInput').value.trim();
    if (!value) return;
    const name = value.split('=')[0].trim();
    this.customFunctions[name] = value;
    document.getElementById('customOutput').innerHTML = `Saved ${name}`;
  }
}

window.advancedModules = new AdvancedModules();
