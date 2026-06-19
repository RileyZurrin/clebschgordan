// ============================================================
//  Clebsch-Gordan calculator
//  No external runtime deps (jQuery / jQuery UI / math.js removed).
// ============================================================

const spacing = "\\hspace{1mm}";
const TOL = 1e-9;
const MAXFAC = 170; // factorial(171) overflows a double, so reject inputs beyond this

// ---------- number helpers ----------

// Convert a finite number to an exact rational {n, d} using continued-fraction
// convergents. Replaces math.fraction; verified against textbook CG values.
function fraction(value) {
  if (!isFinite(value)) return { n: value, d: 1 };
  const sign = value < 0 ? -1 : 1;
  value = Math.abs(value);
  if (value === 0) return { n: 0, d: 1 };
  const maxDen = 1e9, eps = 1e-12;
  let h0 = 0, h1 = 1, k0 = 1, k1 = 0, x = value;
  for (let i = 0; i < 64; i++) {
    const a = Math.floor(x);
    const h2 = a * h1 + h0, k2 = a * k1 + k0;
    if (k2 > maxDen) break;
    h0 = h1; h1 = h2; k0 = k1; k1 = k2;
    if (Math.abs(value - h1 / k1) <= value * eps) break;
    const frac = x - a;
    if (frac === 0) break;
    x = 1 / frac;
    if (!isFinite(x)) break;
  }
  return { n: sign * h1, d: k1 };
}

// Parse a user entry like "1/2", "-3/2", "2" into a number (empty -> NaN).
function fractionToDecimal(value) {
  value = String(value).trim();
  if (value === "") return NaN;
  const y = value.split("/");
  if (y.length > 1) return parseFloat(y[0]) / parseFloat(y[1]);
  return parseFloat(value);
}

// Number -> display LaTeX (integer or \frac), with a small negative sign.
function decimalToFraction(_decimal) {
  if (_decimal % 1 === 0) {
    if (_decimal < 0) return "{\\footnotesize-}" + Math.abs(_decimal).toString() + " ";
    return " " + _decimal.toString() + " ";
  }
  const f = fraction(_decimal);
  const num = Math.abs(f.n), den = Math.abs(f.d);
  if (_decimal < 0) return "{\\footnotesize-}" + "\\frac{" + num + "}{" + den + "}" + " ";
  return " " + "\\frac{" + num + "}{" + den + "}" + " ";
}

// CG coefficient (rational under a square root), used in the expansion.
function Disp_Coeff(n, d) {
  return "\\sqrt{\\frac{" + n.toString() + "}{" + d.toString() + "}}";
}

// ---------- validation ----------
// Each returns an error message (LaTeX) or "" when the inputs are valid.

function isHalfInteger(x) { return x % 0.5 === 0; }

// value is a member of {-max, -max+1, ..., max}
function inLadder(value, max) {
  if (value < -max - TOL || value > max + TOL) return false;
  return Math.abs((value + max) - Math.round(value + max)) < TOL;
}

// J satisfies |j1-j2| <= J <= j1+j2 in integer steps (correct triangle rule)
function triangleOK(J, j1, j2) {
  const lo = Math.abs(j1 - j2), hi = j1 + j2;
  if (J < lo - TOL || J > hi + TOL) return false;
  return Math.abs((J - lo) - Math.round(J - lo)) < TOL;
}

function topError(J, M, j1, j2) {
  if (isNaN(J) || isNaN(M) || isNaN(j1) || isNaN(j2))
    return "\\text{All entries must be numbers}";
  if (!isHalfInteger(J) || !isHalfInteger(M) || !isHalfInteger(j1) || !isHalfInteger(j2))
    return "\\text{All entries must be integers or half-integers}";
  if (J < 0)
    return "\\text{Must have} \\hspace{2mm} J \\geq 0";
  if (!inLadder(M, J))
    return "\\text{Must have}  \\hspace{2mm} M = -J, - J + 1, ..., J - 1, J";
  if (!triangleOK(J, j1, j2))
    return "\\text{Must have}  \\hspace{2mm} J = |j_1 - j_2|, |j_1 - j_2| + 1, ..., j_1 + j_2";
  if (j1 + j2 + J + 1 > MAXFAC) // largest factorial argument the computation will hit
    return "\\text{Inputs are too large}";
  return "";
}

function botError(j1, j2, m1, m2) {
  if (isNaN(j1) || isNaN(j2) || isNaN(m1) || isNaN(m2))
    return "\\text{Each entry must be a number}";
  if (!isHalfInteger(j1) || !isHalfInteger(j2) || !isHalfInteger(m1) || !isHalfInteger(m2))
    return "\\text{Each entry must be an integer or a half-integer}";
  if (j1 <= 0 || j2 <= 0)
    return "j_1 \\hspace{1mm} \\text{and} \\hspace{1mm} j_2 \\hspace{1mm} \\text{must be positive}";
  if (!inLadder(m1, j1))
    return "\\text{Must have}  \\hspace{2mm} m_1 = -j_1, - j_1 + 1, ..., j_1 - 1, j_1";
  if (!inLadder(m2, j2))
    return "\\text{Must have}  \\hspace{2mm} m_2 = -j_2, - j_2 + 1, ..., j_2 - 1, j_2";
  if (2 * (j1 + j2) + 1 > MAXFAC) // largest factorial argument over the J sum
    return "\\text{Inputs are too large}";
  return "";
}

// ---------- core CG computation ----------

// ---------- exact rational arithmetic (BigInt) ----------
// CG^2 is always rational; computing it with BigInt keeps every coefficient exact
// for any input (floating-point factorials lose exactness above ~18!).

function gcdBig(a, b) { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) { [a, b] = [b, a % b]; } return a; }

function makeRat(n, d) {
  if (d < 0n) { n = -n; d = -d; }
  if (d === 0n) return { n: 0n, d: 1n }; // defensive; not reached for valid inputs
  const g = gcdBig(n, d) || 1n;
  return { n: n / g, d: d / g };
}

function ratAdd(a, b) { return makeRat(a.n * b.d + b.n * a.d, a.d * b.d); }
function ratMul(a, b) { return makeRat(a.n * b.n, a.d * b.d); }

// factorial of a (rounded) integer; 0 for negative args, matching the CG convention
// that out-of-range terms vanish.
function factBig(x) {
  const n = Math.round(x);
  if (n < 0) return 0n;
  let r = 1n;
  for (let i = 2; i <= n; i++) r *= BigInt(i);
  return r;
}

// Exact |CG|^2 (rational) and the sign of the coefficient, via the Racah formula.
function cgSquared(J, M, j1, j2, m1, m2) {
  const p1 = makeRat(
    BigInt(Math.round(2 * J + 1)) * factBig(J + j1 - j2) * factBig(J - j1 + j2) * factBig(j1 + j2 - J),
    factBig(j1 + j2 + J + 1));
  const p2 = makeRat(
    factBig(J + M) * factBig(J - M) * factBig(j1 - m1) * factBig(j1 + m1) * factBig(j2 - m2) * factBig(j2 + m2),
    1n);

  const kmin = Math.round(Math.max(j2 - J - m1, j1 + m2 - J, 0));
  const kmax = Math.round(Math.min(j1 + j2 - J, j1 - m1, j2 + m2));
  let S = { n: 0n, d: 1n };
  for (let k = kmin; k <= kmax; k++) {
    const denom = factBig(k) * factBig(j1 + j2 - J - k) * factBig(j1 - m1 - k) * factBig(j2 + m2 - k) * factBig(J - j2 + m1 + k) * factBig(J - j1 - m2 + k);
    S = ratAdd(S, makeRat(k % 2 === 0 ? 1n : -1n, denom));
  }

  const sign = S.n > 0n ? 1 : (S.n < 0n ? -1 : 0);
  const cg2 = ratMul(ratMul(p1, p2), ratMul(S, S)); // CG^2 = p1 * p2 * S^2
  return { sign, n: cg2.n, d: cg2.d };
}

// coupled -> uncoupled: sum over m1, m2 (with m1 + m2 = M). Returns an array of term LaTeX.
function topCompute(J, M, j1, j2) {
  const terms = [];
  for (let dm1 = -2 * j1; dm1 <= 2 * j1 + 1; dm1 += 2) {
    for (let dm2 = -2 * j2; dm2 <= 2 * j2 + 1; dm2 += 2) {
      if (dm1 + dm2 === 2 * M) {
        calc(J, M, j1, j2, dm1 / 2, dm2 / 2, "top", terms);
      }
    }
  }
  return terms;
}

// uncoupled -> coupled: sum over J (with M = m1 + m2). Returns an array of term LaTeX.
function botCompute(j1, j2, m1, m2) {
  const terms = [];
  const M = m1 + m2;
  for (let dJ = 2 * Math.abs(j1 - j2); dJ < 2 * (j1 + j2) + 1; dJ += 2) {
    calc(dJ / 2, M, j1, j2, m1, m2, "bottom", terms);
  }
  return terms;
}

// Compute one term; if non-zero, push its LaTeX (with a leading +/- operator) to `terms`.
// Each term is rendered as its own unit so the result can word-wrap at term boundaries.
function calc(J, M, j1, j2, m1, m2, topOrBottom, terms) {
  const { sign, n, d } = cgSquared(J, M, j1, j2, m1, m2);
  if (n === 0n) return; // zero coefficient -> no term

  let ket;
  if (topOrBottom === "top") {
    ket = "\\big|" + decimalToFraction(j1) + spacing + decimalToFraction(j2) + spacing + decimalToFraction(m1) + spacing + decimalToFraction(m2) + "\\big\\rangle";
  } else {
    ket = "\\big|" + decimalToFraction(J) + spacing + decimalToFraction(M) + spacing + decimalToFraction(j1) + spacing + decimalToFraction(j2) + "\\big\\rangle";
  }

  const first = terms.length === 0;
  const coeff = n === d ? "" : Disp_Coeff(n, d); // |CG| = 1 -> show the ket alone
  const op = sign === -1 ? "-" : (first ? "" : "+");
  terms.push(op + coeff + ket);
}

// ---------- page wiring (input form + inline results + shareable URL) ----------

const MODES = {
  top: { names: ["J", "M", "j1", "j2"], compute: topCompute, error: topError },
  bot: { names: ["j1", "j2", "m1", "m2"], compute: botCompute, error: botError },
};

function rawValues() {
  return [1, 2, 3, 4].map(i => document.getElementById("input" + i).value.trim());
}

function showError(latex) {
  const el = document.getElementById("error");
  if (!el) return;
  if (latex) {
    katex.render(latex, el, { throwOnError: false });
    el.style.display = "block";
  } else {
    el.textContent = "";
    el.style.display = "none";
  }
}

// Render the decomposition as  |input> = sum of terms, with each term its own unit
// so the sum wraps at term boundaries (vertical growth, no horizontal scroll).
function renderOutput(mode, nums) {
  const terms = MODES[mode].compute(nums[0], nums[1], nums[2], nums[3]);
  const inputKet = "\\big|" + nums.map(decimalToFraction).join(spacing) + "\\big\\rangle";
  katex.render(inputKet, document.getElementById("input"), { throwOnError: false });

  const resultEl = document.getElementById("result");
  resultEl.innerHTML = "";
  (terms.length ? terms : ["0"]).forEach(t => {
    const span = document.createElement("span");
    span.className = "term-piece";
    katex.render(t, span, { maxExpand: Infinity, throwOnError: false });
    resultEl.appendChild(span);
  });
}

function inputPage(mode) { return mode === "top" ? "top.html" : "bot.html"; }
function resultPage(mode) { return mode === "top" ? "top_res.html" : "bot_res.html"; }

function queryString(cfg, raw) {
  return cfg.names.map((n, i) => encodeURIComponent(n) + "=" + encodeURIComponent(raw[i])).join("&");
}

// Validate the form; on success go to the results page with the inputs in the URL.
function submitInputs(mode) {
  const cfg = MODES[mode];
  const raw = rawValues();
  const nums = raw.map(fractionToDecimal);
  const err = cfg.error(nums[0], nums[1], nums[2], nums[3]);
  if (err) { showError(err); return; }
  showError("");
  const qs = queryString(cfg, raw);
  // Stamp this page's history entry so the browser Back button restores the inputs.
  history.replaceState(null, "", "?" + qs);
  location.href = resultPage(mode) + "?" + qs;
}

function fillInput(inputId, value) {
  document.getElementById(inputId).value = value;
}

function inputSign(inputId) {
  let v = document.getElementById(inputId).value;
  if (v != 0) {
    if (v[0] === "-") document.getElementById(inputId).value = v.substring(1);
    else document.getElementById(inputId).value = "-" + v;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("cg-form");
  if (form) return initInputPage(form);
  const result = document.getElementById("cg-result");
  if (result) return initResultPage(result);
});

// Input page: restore any inputs from the URL, and submit to the results page.
function initInputPage(form) {
  const mode = form.dataset.mode;
  const cfg = MODES[mode];
  const params = new URLSearchParams(location.search);
  cfg.names.forEach((n, i) => {
    if (params.has(n)) document.getElementById("input" + (i + 1)).value = params.get(n);
  });
  form.addEventListener("submit", function (e) { e.preventDefault(); submitInputs(mode); });
}

// Results page: read inputs from the URL, render the decomposition, wire up Back.
function initResultPage(result) {
  const mode = result.dataset.mode;
  const cfg = MODES[mode];
  const params = new URLSearchParams(location.search);
  const nums = cfg.names.map(n => fractionToDecimal(params.get(n)));

  // Visited directly, or with bad inputs: bounce back to the form (carrying the values).
  if (!cfg.names.every(n => params.has(n)) || cfg.error(nums[0], nums[1], nums[2], nums[3])) {
    location.replace(inputPage(mode) + location.search);
    return;
  }

  const back = document.getElementById("back-link");
  if (back) back.href = inputPage(mode) + location.search; // Back keeps the numbers
  renderOutput(mode, nums);
}
