# ▲ LucroMax — Otimizador de Lucro com Dois Produtos

> Projeto PBL — Disciplina: Resolução de Problemas Multivariáveis  
> Centro Universitário do Pará — Curso de Ciência da Computação  
> Professor: Pedro Girotto

---

## 📌 Descrição do Projeto

O **LucroMax** é uma aplicação web full stack que resolve um problema clássico de otimização financeira: **dada a função de lucro de uma empresa com dois produtos, quais quantidades maximizam o lucro?**

O sistema recebe parâmetros de receita e custo, calcula analiticamente o ponto ótimo via gradiente e critério da Hessiana, e apresenta o resultado de forma acessível a um gestor sem formação matemática avançada.

---

## 🧮 Problema e Modelagem Matemática

### Variáveis de decisão
| Variável | Descrição |
|----------|-----------|
| `x` | Quantidade produzida do **Produto A** (unidades) |
| `y` | Quantidade produzida do **Produto B** (unidades) |

### Função objetivo

A função de lucro tem forma quadrática (com custos marginais crescentes e interação entre produtos):

```
L(x, y) = px·x + py·y − a·x² − b·x·y − c·y²
```

Onde:
- `px`, `py` — preço de venda unitário dos produtos A e B (R$)
- `a`, `c`   — coeficientes de custo marginal crescente (ex: horas-extra, desgaste)
- `b`         — coeficiente de interação entre os produtos (concorrência interna de recursos)

### Domínio e restrições
- `x ≥ 0`, `y ≥ 0` (quantidades não-negativas)
- `a > 0`, `c > 0` (custos crescentes)
- `4ac − b² > 0` (condição necessária para existência de máximo)

### Derivadas parciais

```
∂L/∂x = px − 2a·x − b·y = 0
∂L/∂y = py − b·x − 2c·y = 0
```

### Gradiente e ponto crítico

Resolvendo o sistema `∇L = 0`:

```
x* = (2c·px − b·py) / (4ac − b²)
y* = (2a·py − b·px) / (4ac − b²)
```

### Classificação via Hessiana

```
H = | −2a   −b  |
    | −b    −2c |

det(H) = 4ac − b²
tr(H)  = −2a − 2c
```

Se `det(H) > 0` e `tr(H) < 0` → **máximo** (ponto ótimo de lucro).

---

## 👤 Persona

**Ana Paula Ferreira**, 38 anos, proprietária de uma pequena confecção em Belém/PA com dois produtos principais (camisetas e vestidos). Ana não tem formação em matemática ou estatística e hoje define as quantidades de produção por intuição, frequentemente deixando margem de lucro na mesa. O LucroMax permite que ela informe preços e estimativas de custo e receba imediatamente a combinação ótima de produção.

**Métricas de sucesso:**
- Aumento do lucro mensal em ≥ 15% na primeira semana de uso
- Tempo de decisão de produção reduzido de ~2h (planilhas manuais) para < 2 min

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Back end | Python 3.11 + Flask + SymPy (cálculo simbólico) |
| Front end | HTML5 + CSS3 + JavaScript (vanilla) + Chart.js |
| Matemática | SymPy (`symbols`, `diff`, `solve`, `hessian`) |

---

## ⚙️ Requisitos

- Python 3.10 ou superior
- pip

---

## 🚀 Instalação e Execução

### 1. Clone o repositório

```bash
git clone https://github.com/SEU_USUARIO/lucromax.git
cd lucromax
```

### 2. Crie e ative um ambiente virtual

```bash
python -m venv venv
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate
```

### 3. Instale as dependências

```bash
pip install -r requirements.txt
```

### 4. Execute o servidor

```bash
python app.py
```

### 5. Acesse no navegador

```
http://localhost:5000
```

---

## 📖 Exemplo de Uso

Clique em **"Usar exemplo"** na interface ou insira manualmente:

| Parâmetro | Valor | Significado |
|-----------|-------|-------------|
| px | 120 | Preço de venda de A: R$ 120/unidade |
| py | 90  | Preço de venda de B: R$ 90/unidade  |
| a  | 2   | Custo marginal crescente de A |
| b  | 1   | Interação A·B |
| c  | 3   | Custo marginal crescente de B |

**Resultado esperado:** `x* ≈ 27,27`, `y* ≈ 10,45`, `L* ≈ R$ 1.818,18`

---

## 📁 Estrutura do Repositório

```
lucromax/
├── app.py                 # Flask + lógica de otimização (SymPy)
├── frontend/
│   └── static/
│       ├── css/style.css  # Estilo da interface
│       └── js/main.js     # Lógica do front end
├── templates/
│   └── index.html         # Template HTML
├── requirements.txt
└── README.md
```

---

## 🤖 Uso de IA

Este projeto utilizou o assistente Claude (Anthropic) como suporte para: geração de estrutura inicial de código, revisão de expressões matemáticas em SymPy e formatação do README. Todo o conteúdo foi revisado, adaptado e validado pela equipe. O modelo matemático e as interpretações são de autoria própria.

---

## 👥 Equipe

| Nome | Matrícula |
|------|-----------|
| [Nome 1] | [Matrícula] |
| [Nome 2] | [Matrícula] |
| [Nome 3] | [Matrícula] |

---

## 📄 Licença

MIT License — livre para uso educacional.
