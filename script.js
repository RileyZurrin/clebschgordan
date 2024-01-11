const spacing = "\\hspace{1mm}";

function decimalToFraction (_decimal) {
  // Run only if input is not integer
  if (_decimal % 1 === 0) {
    // Make negative sign smaller if negative
    if (_decimal < 0) {
        _decimal = Math.abs(_decimal);
        return "{\\footnotesize-}" + _decimal.toString() + " ";
    }
    else {
        return " " + _decimal.toString() + " ";
    }
  }
  else {
    var frac = math.fraction(_decimal);

    var [num, den] = [frac.n, frac.d];

    // Return the simplified fraction as a string, handling negative numbers properly
    if (_decimal < 0) {
        num = Math.abs(num);
        den = Math.abs(den);
        return "{\\footnotesize-}" + '\\frac{' + num + '}{' + den + '}' + " ";
    } else {
        return " " + '\\frac{' + num + '}{' + den + '}' + " ";
    }
  }
};

// Example usage:
console.log(decimalToFraction(3.5));

// Same as above but adds a square root sign. Meant for CG coefficients
function Disp_Coeff (Coeff) {

  var frac = math.fraction(Coeff);

  var [num, den] = [frac.n, frac.d];

  // Return the simplified fraction as a string
  return '\\sqrt{\\frac{' + num + '}{' + den + '}}';
    //return (numerator / divisor) + '/' + (powerOf10 / divisor);
};

function fractionToDecimal (fraction) {
  var y = fraction.split('/');
    if (y.length > 1) {
        return (y[0] / y[1])
    }
    else {
        return y[0]
    }
}

function topCalculate() {
  // Get values from input fields
  var J = parseFloat(fractionToDecimal(document.getElementById('input1').value));
  var M = parseFloat(fractionToDecimal(document.getElementById('input2').value));
  var j1 = parseFloat(fractionToDecimal(document.getElementById('input3').value));
  var j2 = parseFloat(fractionToDecimal(document.getElementById('input4').value));

  console.log(J);


  // Check if the values are valid numbers
  if (topCheck(J, M, j1, j2)) {
    // Set inputs into storage for display on results page
    sessionStorage.setItem("input1", decimalToFraction(J));
    sessionStorage.setItem("input2", decimalToFraction(M));
    sessionStorage.setItem("input3", decimalToFraction(j1));
    sessionStorage.setItem("input4", decimalToFraction(j2));

      // Perform calculations
    var result = topCompute(J, M, j1, j2);
    sessionStorage.setItem("result", result);
    
    // Switch to results page
    window.location.href = "top_res.html";
  }
  // Render jquery error messages when inputs are invalid.
  else {
    $("#myDialog").dialog("open");
  }
}

function botCalculate() {
  // Get values from input fields
  var j1 = parseFloat(fractionToDecimal(document.getElementById('input1').value));
  var j2 = parseFloat(fractionToDecimal(document.getElementById('input2').value));
  var m1 = parseFloat(fractionToDecimal(document.getElementById('input3').value));
  var m2 = parseFloat(fractionToDecimal(document.getElementById('input4').value));

  // Check if the values are valid numbers
  if (botCheck(j1, j2, m1, m2)) {

       // Set inputs into storage for display on results page
    sessionStorage.setItem("input1", decimalToFraction(j1));
    sessionStorage.setItem("input2", decimalToFraction(j2));
    sessionStorage.setItem("input3", decimalToFraction(m1));
    sessionStorage.setItem("input4", decimalToFraction(m2));

      // Perform calculations
    var result = botCompute(j1, j2, m1, m2);
    sessionStorage.setItem("result", result);

     // Switch to results page
    window.location.href = "bot_res.html";
  }
  // Render jquery error messages when inputs are invalid.
  else {
    $("#myDialog").dialog("open");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  if (window.location.pathname.endsWith("top_res.html") || window.location.pathname.endsWith("bot_res.html")) {

    // Grab the inputs and result from the calculation.
    var inputs = "\\big|" + sessionStorage.getItem("input1") + spacing + sessionStorage.getItem("input2") + spacing + sessionStorage.getItem("input3") + spacing + sessionStorage.getItem("input4") + "\\big\\rangle";
    var result = sessionStorage.getItem("result");

    // Display the result
    var resultElement = document.getElementById("result");
    katex.render(result, resultElement);

    // Display inputs
    var inputsElement = document.getElementById("input");
    katex.render(inputs, inputsElement);
  }
});


// Define factorial function
function factorial(n) {
  if (n < 0) {
    return 0;
  }
  if (n === 0) {
    return 1;
  }
  return n * factorial(n - 1);
}

// Define the first multiplier
function p1(J,j1,j2) {
    return ((2*J + 1)*factorial(J + j1 - j2)*factorial(J - j1 + j2)*factorial(j1 + j2 - J))/(factorial(j1 + j2 + J +1))
}

// Define the second multipliers (top and bottom)
function p2(J,M,j1,m1,j2,m2) {
    return factorial(J + M)*factorial(J - M)*factorial(j1 - m1)*factorial(j1 + m1)*factorial(j2 - m2)*factorial(j2 + m2)
}

// Lastly, define the third multiplier
function summand(k,j1,j2,J,m1,m2) {
    return ((-1)**k)/(factorial(k)*factorial(j1 + j2 - J - k)*factorial(j1 - m1 - k)*factorial(j2 + m2 - k)*factorial(J - j2 + m1 + k)*factorial(J - j1 - m2 + k))
}

// Define the computation for the top case
function topCompute(J, M, j1, j2) {
  let CG = "";

  for (let dm1 = -2 * j1; dm1 <= 2 * j1 + 1; dm1 += 2) {
    for (let dm2 = -2 * j2; dm2 <= 2 * j2 + 1; dm2 += 2) {
      if (dm1 + dm2 === 2 * M) {
        const m1 = dm1 / 2;
        const m2 = dm2 / 2;
        CG = calc(J, M, j1, j2, m1, m2, "top", CG);
      }
    }
  }
  return CG;
}

  // Define the computation for the bottom case
function botCompute(j1,j2,m1,m2) {
  let CG = "";
  const M = m1 + m2;

  for (let dJ = 2 * Math.abs(j1-j2); dJ < 2 * (j1 + j2) + 1; dJ += 2) {
    const J = dJ / 2;
    CG = calc(J, M, j1, j2, m1, m2, "bottom", CG);
  }
  return CG;
}

function fillInput(inputId, value) {
    document.getElementById(inputId).value = value;
}

function inputSign(inputId) {
  v = document.getElementById(inputId).value
  if (v != 0) {
    if (v[0] == "-") {
      document.getElementById(inputId).value = v.substring(1);
    }
    else {
      document.getElementById(inputId).value = "-" + v;
    }
  }
}

// Generate the jQuery UI Dialog
$("#myDialog").dialog({
  autoOpen: false,
  resizable: false,
  modal: true,
  width: 'auto',
  dialogClass: "noClose",
  buttons: {
    Ok: {
      text: "Ok",
      click: function() {
        $(this).dialog("close");
      },
      style: "background-color: #0073e6; border: none; padding: 1vh 15vh; font-size: 16px; border-radius: 30px; color: white;"
    }
  }
});

$(window).resize(function() {
  if ($("#myDialog").dialog("isOpen")) {
    $("#myDialog").dialog('widget').position({
      my: 'center',
      at: 'center',
      of: window
    });
  }
});

// Report input errors

// Check if the top values are valid numbers
function topCheck(J, M, j1, j2) {
  const Error = document.getElementById("myDialog");
  const renderError = (content) => katex.render(content, Error);

  const checkAndRenderError = (condition, content) => {
    if (condition) {
      renderError(content);
      return false;
    }
    return true;
  };

  return checkAndRenderError(isNaN(J) || isNaN(M) || isNaN(j1) || isNaN(j2), "\\text{All entries must be numbers.}") &&
         checkAndRenderError((J % (1/2) !== 0) || (M % (1/2) !== 0) || (j1 % (1/2) !== 0) || (j2 % (1/2) !== 0), "\\text{All entries must be integers or half-integers.}") &&
         checkAndRenderError(p2(J, M, j1, j1, j2, j2) == "Infinity" || p1(J, j1, j2) == "Infinity", '\\text{Inputs are too large.}') &&
         checkAndRenderError(( J < 0), "\\text{Must have} \\hspace{2mm} J \\geq 0") &&
         checkAndRenderError(!Array.from({ length: 2*J + 1 }, (_, index) => index - J).includes(M), '\\text{Must have}  \\hspace{2mm} M = -J, - J + 1, ..., J - 1, J.') &&
         checkAndRenderError(!Array.from({ length: Math.abs(j1 - j2) + j1 + j2 + 1 }, (_, index) => index + j1 - j2).includes(J), '\\text{Must have}  \\hspace{2mm} J = |j_1 - j_2|, |j_1 - j_2| + 1, ..., j_1 + j_2.');
}

// Check if the bottom values are valid numbers
function botCheck(j1, j2, m1, m2) {
  const Error = document.getElementById("myDialog");
  const setErrorContent = (content) => katex.render(content, Error);

  const checkAndSetError = (condition, content) => {
    if (condition) {
      setErrorContent(content);
      return false;
    }
    return true;
  };

  return checkAndSetError(isNaN(j1) || isNaN(j2) || isNaN(m1) || isNaN(m2), '\\text{Each entry must be a number.}') &&
          checkAndSetError((j1 % (1/2) !== 0) || (j2 % (1/2) !== 0) || (m1 % (1/2) !== 0) || (m2 % (1/2) !== 0), '\\text{Each entry must be an integer or a half-integer.}') &&
          checkAndSetError((j1 <= 0) || (j2 <= 0), 'j_1 \\hspace{1mm} \\text{and} \\hspace{1mm} j_2 \\hspace{1mm} \\text{must be positive.}') &&
          checkAndSetError(p2(j1 + j2, m1 + m2, j1, m1, j2, m2) == "Infinity" || p1(j1 + j2, j1, j2) == "Infinity" || p1(0, j1, j2) == "Infinity", '\\text{Inputs are too large.}') &&
          checkAndSetError(!Array.from({ length: 2 * j1 + 1 }, (_, index) => index - j1).includes(m1), '\\text{Must have}  \\hspace{2mm} m_1 = -j_1, - j_1 + 1, ..., j_1 - 1, j_1.') &&
          checkAndSetError(!Array.from({ length: 2 * j2 + 1 }, (_, index) => index - j2).includes(m2), '\\text{Must have}  \\hspace{2mm} m_2 = -j_2, - j_2 + 1, ..., j_2 - 1, j_2.');
}

// Core of CG-Coeff computations
function calc(J, M, j1, j2, m1, m2, topOrBottom, CG) {
  let S = 0;
  const denominator = 500000 * (j1 + j2) ** 3;

  // Calculate K limits
  const kmin = Math.max(j2 - J - m1, j1 + m2 - J, 0);
  const kmax = Math.min(j1 + j2 - J, j1 - m1, j2 + m2);

  // Find summand
  for (let k = kmin; k <= kmax; k++) {
    S += summand(k, j1, j2, J, m1, m2);
  }
  
  // Calculate Coeff
  const sign = Math.sign(S);
  const Coeff = p1(J, j1, j2) * p2(J, M, j1, m1, j2, m2) * S ** 2;

  // Print term dependent on direction of calculation
  if (topOrBottom === "top") {
    term = "\\big|" + decimalToFraction(j1) + spacing + decimalToFraction(j2) + spacing + decimalToFraction(m1) + spacing + decimalToFraction(m2) + "\\big\\rangle"
  } else if (topOrBottom == "bottom") {
    term = "\\big|" + decimalToFraction(J) + spacing + decimalToFraction(M) + spacing + decimalToFraction(j1) + spacing + decimalToFraction(j2) + "\\big\\rangle"
  } 
  
  // Append term appropriate to the current output.
  if (math.fraction(Coeff).n != 0){
    if (Math.abs(1 - Math.abs(Coeff)) > 1 / denominator) {
      if (sign === 1) {
        if (CG === "") {
          CG += Disp_Coeff(Coeff) + term;
        } else {
          CG +=  " " + "+ " + Disp_Coeff(Coeff) + term;
        }
      } else if (sign === -1) {
        if (CG === "") {
          CG += "- " + Disp_Coeff(Coeff) + term;
        } else {
          CG += " - " + Disp_Coeff(Coeff) + term;
        }
      }
    } else {
      CG += term;
    }
  }
  return CG;
}

