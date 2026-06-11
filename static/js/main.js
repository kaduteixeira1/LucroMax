let chartInstance = null;

function preencherExemplo() {
  document.getElementById("px").value = "120";
  document.getElementById("py").value = "90";
  document.getElementById("a").value  = "2";
  document.getElementById("b").value  = "1";
  document.getElementById("c").value  = "3";
}

async function calcular() {
  const ids = ["px", "py", "a", "b", "c"];
  const dados = {};
  for (const id of ids) {
    const v = parseFloat(document.getElementById(id).value);
    if (isNaN(v)) {
      mostrarErro("Preencha todos os campos antes de calcular.");
      return;
    }
    dados[id] = v;
  }

  setLoading(true);
  esconderErro();
  document.getElementById("resultado").classList.add("hidden");

  try {
    const res = await fetch("/calcular", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    });
    const json = await res.json();

    if (!res.ok || json.erro) {
      mostrarErro(json.erro || "Erro ao calcular.");
      setLoading(false);
      return;
    }

    renderizar(json, dados);
  } catch (e) {
    mostrarErro("Não foi possível conectar ao servidor. Verifique se ele está rodando.");
  }

  setLoading(false);
}

function renderizar(d, params) {
  document.getElementById("resX").textContent = fmt(d.x_opt);
  document.getElementById("resY").textContent = fmt(d.y_opt);
  document.getElementById("resL").textContent = fmtR(d.lucro_max);

  document.getElementById("resFuncao").textContent = d.funcao;
  document.getElementById("resDx").textContent = d.dL_dx;
  document.getElementById("resDy").textContent = d.dL_dy;
  document.getElementById("resGradiente").textContent = `∇L(x*, y*) = (${fmt(d.grad_x)}, ${fmt(d.grad_y)})`;
  document.getElementById("resPx").textContent = fmt(d.x_opt);
  document.getElementById("resPy").textContent = fmt(d.y_opt);

  document.getElementById("hess11").textContent = d.H11;
  document.getElementById("hess12").textContent = d.H12;
  document.getElementById("hess21").textContent = d.H12;
  document.getElementById("hess22").textContent = d.H22;
  document.getElementById("detH").textContent = d.det_H;

  const badge = document.getElementById("classificacao");
  badge.textContent = d.classificacao;
  badge.style.background = d.classificacao === "Máximo" ? "var(--green-bg)" : "var(--red-bg)";
  badge.style.color       = d.classificacao === "Máximo" ? "var(--green)" : "var(--red)";
  document.getElementById("interpretacao").innerHTML = d.interpretacao;

  const tbody = document.getElementById("sensBody");
  tbody.innerHTML = "";
  const labels = { "-10%": "▼ −10%", "0%": "Base (0%)", "+10%": "▲ +10%" };
  for (const [key, row] of Object.entries(d.sensibilidade)) {
    const tr = document.createElement("tr");
    if (key === "0%") tr.classList.add("base");
    tr.innerHTML = `
      <td>${labels[key]}</td>
      <td>${fmt(row.x)}</td>
      <td>${fmt(row.y)}</td>
      <td>R$ ${fmtR(row.lucro)}</td>
    `;
    tbody.appendChild(tr);
  }

  const lucros = Object.values(d.sensibilidade).map(r => r.lucro);
  const rotulos = ["Preços −10%", "Preços base", "Preços +10%"];
  const cores = ["#f87171", "#1a56db", "#34d399"];
  renderChart(rotulos, lucros, cores);

  document.getElementById("recTexto").innerHTML = gerarRecomendacao(d, params);
  document.getElementById("resultado").classList.remove("hidden");
  document.getElementById("resultado").scrollIntoView({ behavior: "smooth", block: "start" });
}

function gerarRecomendacao(d, p) {
  const xr = fmt(d.x_opt), yr = fmt(d.y_opt), lr = fmtR(d.lucro_max);
  const sentFuncao = d.classificacao === "Máximo"
    ? `A combinação ótima encontrada garante o <strong>maior lucro possível</strong> dados os seus parâmetros.`
    : `Atenção: o ponto crítico encontrado é um <strong>${d.classificacao.toLowerCase()}</strong> — reveja os parâmetros.`;

  return `
    Com base nos parâmetros informados — preço de <strong>R$ ${p.px}</strong> para o Produto A e
    <strong>R$ ${p.py}</strong> para o Produto B — o modelo matemático recomenda produzir
    <strong>${xr} unidades do Produto A</strong> e <strong>${yr} unidades do Produto B</strong>.
    Essa combinação gera um lucro máximo de <strong>R$ ${lr}</strong>.<br/><br/>
    ${sentFuncao}<br/><br/>
    A análise de sensibilidade mostra que variações de ±10% nos preços alteram o lucro de
    <strong>R$ ${fmtR(d.sensibilidade["-10%"].lucro)}</strong> a
    <strong>R$ ${fmtR(d.sensibilidade["+10%"].lucro)}</strong>,
    indicando ${Math.abs(d.sensibilidade["+10%"].lucro - d.sensibilidade["-10%"].lucro) / d.lucro_max < 0.3
      ? "robustez moderada"
      : "sensibilidade considerável"} à oscilação de mercado.
  `;
}

function renderChart(labels, valores, cores) {
  const ctx = document.getElementById("chartSens").getContext("2d");
  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Lucro (R$)",
        data: valores,
        backgroundColor: cores,
        borderRadius: 6,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` R$ ${fmtR(ctx.parsed.y)}`
          }
        }
      },
      scales: {
        y: {
          grid: { color: "#e2e5ef" },
          ticks: {
            callback: v => "R$ " + fmtR(v),
            font: { family: "'Fira Mono'" }
          }
        },
        x: { grid: { display: false } }
      }
    }
  });
}

function fmt(n) { return Number(n).toFixed(2).replace(".", ","); }
function fmtR(n) { return Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

function mostrarErro(msg) {
  const b = document.getElementById("erroBox");
  b.textContent = msg;
  b.classList.remove("hidden");
}
function esconderErro() { document.getElementById("erroBox").classList.add("hidden"); }
function setLoading(on) {
  document.getElementById("btnText").classList.toggle("hidden", on);
  document.getElementById("btnSpinner").classList.toggle("hidden", !on);
  document.getElementById("btnCalc").disabled = on;
}
