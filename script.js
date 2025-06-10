let calculateBtn = document.getElementById("calculateBtn")
let moneyInput = document.getElementById("moneyInput")
let fromYearInput = document.getElementById("fromYearInput")
let toYearInput = document.getElementById("toYearInput")
let result = document.getElementById("result")
let funFact = document.getElementById("funFact")

let cpiData = {
  1975: 53.8, 1985: 107.6, 1995: 152.4,
  2005: 195.3, 2015: 237.0, 2025: 280.0
}

let facts = [
  "A loaf of bread cost around $0.28 in 1975.",
  "Gas was about $1.15/gal in 1995.",
  "Your money halves in value every ~25 years."
]
//
function estimateCPI(year) {
  let ys = Object.keys(cpiData).map(Number).sort((a,b)=>a-b)
  if (year < ys[0] || year > ys[ys.length-1]) return null
  if (cpiData[year]) return cpiData[year]
  for (let i = 0; i < ys.length-1; i++) {
    let y1=ys[i], y2=ys[i+1]
    if (year > y1 && year < y2) {
      let c1=cpiData[y1], c2=cpiData[y2]
      let r=(year-y1)/(y2-y1)
      return c1 + r*(c2-c1)
    }
  }
  return null
}
// ^ chat gpt
let chartThing = null

function animateResultDisplay(startAmount, endAmount, y1, y2) {
  let current = 0
  let duration = 600
  let steps = 30
  let stepTime = duration / steps
  let step = endAmount / steps

  let counter = setInterval(() => {
    current += step
    if (current >= endAmount) {
      clearInterval(counter)
      current = endAmount
    }
    result.textContent = `$${startAmount} in ${y1} ≈ $${current.toFixed(2)} in ${y2}`
  }, stepTime)
}

calculateBtn.addEventListener("click", function () {
  let amt = parseFloat(moneyInput.value)
  let y1 = parseInt(fromYearInput.value)
  localStorage.setItem("fromYear", y1)
  let y2 = parseInt(toYearInput.value)

  if (isNaN(amt) || isNaN(y1) || isNaN(y2)) {
    result.textContent = "Please enter a valid amount and years."
    return
  }

  let c1 = estimateCPI(y1), c2 = estimateCPI(y2)
  if (c1 === null || c2 === null) {
    result.textContent = "Years must be between 1975 and 2025."
    return
  }

  let adj = (c2 / c1) * amt
//
  animateResultDisplay(amt, adj, y1, y2)

  funFact.textContent = "Fun Fact: " + facts[Math.floor(Math.random() * facts.length)]
// chat gpt ^
  // build graph for y1-5 to y1+5
  let labels = []
  let dataPoints = []
  for (let yr = y1 - 5; yr <= y1 + 5; yr++) {
    let cpiY = estimateCPI(yr)
    if (cpiY !== null) {
      labels.push(yr)
      dataPoints.push((c2 / cpiY) * amt)
    }
  }

  // draw/update chart -- chat got
  let ctx = document.getElementById("inflationChart").getContext("2d")
  if (chartThing) chartThing.destroy()
  chartThing = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Value over time',
        data: dataPoints,
        borderColor: '#a1887f',
        tension: 0.3,
        fill: false,
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      animation: { duration: 600 },
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              return "≈ $" + context.parsed.y.toFixed(2)
            }
          }
        }
      },
      scales: {
        x: { title: { display: true, text: 'Year' } },
        y: { title: { display: true, text: 'Value in ' + y2 } }
      }
    }
  })
})
//
