function decimalToFraction (_decimal, maxDenominator) {
  // Run only if input is not integer
  if (_decimal % 1 === 0) {
    return " " + "\\(" + _decimal.toString() + "\\)" + " ";
  }
  else {

  var frac = math.fraction(_decimal);

  var [num, den] = [frac.n, frac.d];

  // Return the simplified fraction as a string
  return " " + '\\(\\frac{' + num + '}{' + den + '}\\)' + " ";
    //return (numerator / divisor) + '/' + (powerOf10 / divisor);
  }
};

// Same as above but adds a square root sign. Meant for CG coefficients
function Disp_Coeff (Coeff, maxDenominator) {

  var frac = math.fraction(Coeff);

  var [num, den] = [frac.n, frac.d];

  // Return the simplified fraction as a string
  return '\\(\\sqrt{\\frac{' + num + '}{' + den + '}}\\)';
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

  // Check if the values are valid numbers
  if (topCheck(J, M, j1, j2)) {
      // Perform calculations
    var result = topCompute(J, M, j1, j2);

      // Create a link to the results page with the result as a query parameter
    var link = document.createElement("a");
    link.href = "top_res.html?input1=" + decimalToFraction(J,10**6) + "&input2=" + decimalToFraction(M, 10**6) + "&input3=" + decimalToFraction(j1, 10**6) + "&input4=" + decimalToFraction(j2, 10**6) + "&result=" + result;
    
    // Simulate clicking the link to navigate to the results page
    document.body.appendChild(link);
    link.click();
  }
  // Render mathjax for jquery error messages.
  else {
    $("#myDialog").dialog("open");
    MathJax.typeset();
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
      // Perform calculations
    var result = botCompute(j1, j2, m1, m2);

      // Create a link to the results page with the result as a query parameter
    var link = document.createElement("a");
    link.href = "bot_res.html?input1=" + decimalToFraction(j1,10**6) + "&input2=" + decimalToFraction(j2, 10**6) + "&input3=" + decimalToFraction(m1, 10**6) + "&input4=" + decimalToFraction(m2, 10**6) + "&result=" + result;
    
    // Simulate clicking the link to navigate to the results page
    document.body.appendChild(link);
    link.click();
  }
  // Render mathjax for jquery error messages.
  else {
    $("#myDialog").dialog("open");
    MathJax.typeset();
  }
}


document.addEventListener("DOMContentLoaded", function () {
  // Get the result and inputs from the URL query parameters
  var urlParams = new URLSearchParams(window.location.search);
  var result = urlParams.get("result");
  var inputs = urlParams.get("input1") + "\\(\\hspace{2mm} \\)" + urlParams.get("input2") + "\\(\\hspace{2mm} \\)" + urlParams.get("input3") + "\\(\\hspace{2mm} \\)" + urlParams.get("input4");

  // Display the result
  var resultElement = document.getElementById("result");
  resultElement.textContent = result;

  // Display inputs
  var inputsElement = document.getElementById("input");
  inputsElement.innerHTML = "\\(|\\)" + inputs + "\\(\\rangle\\)";

  MathJax.typeset();

  resultElement.style.display="inline";
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
    const denominator = 500000 * J ** 3;
  
    for (let dm1 = -2 * j1; dm1 <= 2 * j1 + 1; dm1 += 2) {
      for (let dm2 = -2 * j2; dm2 <= 2 * j2 + 1; dm2 += 2) {
        if (dm1 + dm2 === 2 * M) {
          let S = 0;
          const m1 = dm1 / 2;
          const m2 = dm2 / 2;
          console.log("m1=" + m1);
          console.log("m2=" + m2);
          const kmax1 = j1 + j2 - J;
          const kmax2 = j1 - m1;
          const kmax3 = j2 + m2;
          const kmin1 = j2 - J - m1;
          const kmin2 = j1 + m2 - J;
  
          for (let k = Math.max(kmin1, kmin2, 0); k <= Math.min(kmax1, kmax2, kmax3); k++) {
            S += summand(k, j1, j2, J, m1, m2);
          }
          
          console.log("m1 = " + m1, "m2 = " + m2, "S=" + S, "p1=" + p1(J, j1, j2), "p2=" + p2(J, M, j1, m1, j2, m2));

          const sign = Math.sign(S);
          const Coeff = p1(J, j1, j2) * p2(J, M, j1, m1, j2, m2) * S ** 2;
          
          term = "\\(|\\)" + decimalToFraction(j1, denominator) + decimalToFraction(j2, denominator) + decimalToFraction(m1, denominator) + decimalToFraction(m2, denominator) + "\\(\\rangle \\)"

          if (Math.abs(1 - Math.abs(Coeff)) > 1 / denominator) {
            if (sign === 1) {
              if (CG === "") {
                CG += Disp_Coeff(Coeff, denominator) + term;
              } else {
                CG +=  " " + "\\(%2b\\) " + Disp_Coeff(Coeff, denominator) + term;
              }
            } else if (sign === -1) {
              if (CG === "") {
                CG += "\\(-\\) " + Disp_Coeff(Coeff, denominator) + term;
              } else {
                CG += " \\(-\\) " + Disp_Coeff(Coeff, denominator) + term;
              }
            }
          } else {
            if (Math.sign(Coeff) === 1) {
              CG += term;
            }
            else {
              CG += "\\(-|\\)" + term;
            }
          }
        }
      }
    }
    return CG;
  }

  // Define the computation for the top case
function botCompute(j1,j2,m1,m2) {
  let CG = "";
  const denominator = 500000 * j1 ** 3;
  const M = m1 + m2;

  for (let dJ = 2 * Math.abs(j1-j2); dJ < 2 * (j1 + j2) + 1; dJ += 2) {
    const J = dJ / 2;
    let S = 0;
    const kmax1 = j1 + j2 - J;
    const kmax2 = j1 - m1;
    const kmax3 = j2 + m2;
    const kmin1 = j2 - J - m1;
    const kmin2 = j1 + m2 - J;

    for (let k = Math.max(kmin1, kmin2, 0); k <= Math.min(kmax1, kmax2, kmax3); k++) {
      S += summand(k, j1, j2, J, m1, m2);
    }
    
    console.log("m1 = " + m1, "m2 = " + m2, "S=" + S, "p1=" + p1(J, j1, j2), "p2=" + p2(J, M, j1, m1, j2, m2));

    const sign = Math.sign(S);
    const Coeff = p1(J, j1, j2) * p2(J, M, j1, m1, j2, m2) * S ** 2;
    
    term = "\\(|\\)" + decimalToFraction(J, denominator) + decimalToFraction(M, denominator) + decimalToFraction(j1, denominator) + decimalToFraction(j2, denominator) + "\\(\\rangle \\)"

    if (Math.abs(1 - Math.abs(Coeff)) > 1 / denominator) {
      if (sign === 1) {
        if (CG === "") {
          CG += Disp_Coeff(Coeff, denominator) + term;
        } else {
          CG +=  " " + "\\(%2b\\) " + Disp_Coeff(Coeff, denominator) + term;
        }
      } else if (sign === -1) {
        if (CG === "") {
          CG += "\\(-\\) " + Disp_Coeff(Coeff, denominator) + term;
        } else {
          CG += " \\(-\\) " + Disp_Coeff(Coeff, denominator) + term;
        }
      }
    } else {
      if (Math.sign(Coeff) === 1) {
        CG += term;
      }
      else {
        CG += "\\(-|\\)" + term;
      }
    }
  }
  return CG;
}

function fillInput(inputId, value) {
    document.getElementById(inputId).value = value;
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

// Check if the top values are valid numbers
function topCheck(J, M, j1, j2) {

  var Error = document.getElementById("myDialog");

  if (isNaN(J) || isNaN(M) || isNaN(j1) || isNaN(j2)) {
    Error.textContent = "Each entry must be a number.";
    return false;
  }
  if ((J % (1/2) != 0) || (M % (1/2) != 0) || (j1 % (1/2) != 0) || (j2 % (1/2) != 0)) {
    Error.textContent = "Each entry must be an integer or a half-integer.";
    return false;
  } 
  var Jarray = Array.from({length: 2*J + 1 }, (_, index) => index - J);
  if (!Jarray.includes(M)) {
    Error.textContent = 'Must have ' + ' \\( \\hspace{2mm} M = -J, - J + 1, ..., J - 1, J\\).';
    return false;
  }
  var j1j2 = Array.from({ length: Math.abs(j1 - j2) + j1 + j2 + 1 }, (_, index) => index + j1 - j2);
  if (!j1j2.includes(J)) {
    Error.textContent = 'Must have ' + ' \\( \\hspace{2mm} J = |j_1 - j_2|, |j_1 - j_2| + 1, ..., j_1 + j_2\\).';
    return false;
  }
  return true;
}

  // Check if the bottom values are valid numbers
  function botCheck(j1, j2, m1, m2) {

    var Error = document.getElementById("myDialog");
    
    if (isNaN(j1) || isNaN(j2) || isNaN(m1) || isNaN(m2)) {
      Error.textContent = 'Each entry must be number.';
      return false;
    }
    if ((j1 % (1/2) != 0) || (j2 % (1/2) != 0) || (m1 % (1/2) != 0) || (m2 % (1/2) != 0)) {
      Error.textContent = 'Each entry must be an integer or a half-integer.';
      return false;
    } 

    if ((j1 <= 0) || (j2 <= 0)) {
      Error.textContent = '\\(j_1\\) and \\(j_2\\) must be positive.';
      return false;
    } 

    var j1array = Array.from({length: 2*j1 + 1 }, (_, index) => index - j1);
    if (!j1array.includes(m1)) {
      Error.textContent = 'Must have \\( \\hspace{2mm} m_1 = -j_1, - j_1 + 1, ..., j_1 - 1, j_1\\).';
      return false;
    }

    var j2array = Array.from({length: 2*j2 + 1 }, (_, index) => index - j2);
    if (!j2array.includes(m2)) {
      Error.textContent = 'Must have \\( \\hspace{2mm} m_2 = -j_2, - j_2 + 1, ..., j_2 - 1, j_2\\).';
      return false;
    }

    return true;
}