from flask import Flask, request, jsonify, render_template
import numpy as np
from sympy import symbols, diff, solve, hessian

app = Flask(__name__,
            template_folder='templates',
            static_folder='static')

# ─────────────────────────────────────────────
#  MODELO MATEMÁTICO
#
#  Uma empresa produz dois produtos: A e B.
#  Receita total (modelagem quadrática):
#    R(x,y) = px·x + py·y
#  Custo total (inclui interação / concorrência):
#    C(x,y) = ax² + bxy + cy²
#  Lucro: L(x,y) = R - C
#    L(x,y) = px·x - ax² + (py - b/2)·y - b/2·xy - c·y²
#  
#  Forma geral usada:
#    L(x,y) = px·x + py·y - ax² - b·xy - cy²
#
#  Onde:
#   x = unidades produzidas do Produto A
#   y = unidades produzidas do Produto B
#   px, py = preço de venda unitário (R$)
#   a, c   = coeficiente de custo marginal crescente (competição interna)
#   b      = coeficiente de interação entre os produtos
# ─────────────────────────────────────────────

def otimizar_lucro(px, py, a, b, c):
    """
    Recebe os parâmetros e retorna o ponto ótimo,
    o lucro máximo, as derivadas parciais, a Hessiana
    e a classificação do ponto crítico.
    """
    x, y = symbols('x y', real=True)

    # Função objetivo
    L = px*x + py*y - a*x**2 - b*x*y - c*y**2

    # Derivadas parciais
    dL_dx = diff(L, x)
    dL_dy = diff(L, y)

    # Sistema ∇L = 0
    solucao = solve([dL_dx, dL_dy], [x, y])
    x_opt = float(solucao[x])
    y_opt = float(solucao[y])
    L_opt = float(L.subs([(x, x_opt), (y, y_opt)]))

    # Gradiente no ponto ótimo
    grad_x = float(dL_dx.subs([(x, x_opt), (y, y_opt)]))
    grad_y = float(dL_dy.subs([(x, x_opt), (y, y_opt)]))

    # Hessiana
    H = hessian(L, [x, y])
    H11 = float(H[0, 0])
    H12 = float(H[0, 1])
    H22 = float(H[1, 1])
    det_H = H11 * H22 - H12**2
    traco_H = H11 + H22

    # Classificação
    if det_H > 0 and traco_H < 0:
        classificacao = "Máximo"
        interpretacao = "O ponto crítico é um <strong>máximo global</strong>. O lucro é maximizado nesse ponto."
    elif det_H > 0 and traco_H > 0:
        classificacao = "Mínimo"
        interpretacao = "O ponto crítico é um <strong>mínimo</strong>."
    elif det_H < 0:
        classificacao = "Ponto de Sela"
        interpretacao = "O ponto crítico é um <strong>ponto de sela</strong> — não é máximo nem mínimo."
    else:
        classificacao = "Inconclusivo"
        interpretacao = "O teste da Hessiana é <strong>inconclusivo</strong>."

    # Análise de sensibilidade: variação de ±10% em px e py
    sens = {}
    for delta, label in [(-0.1, "-10%"), (0.0, "0%"), (0.1, "+10%")]:
        px2, py2 = px*(1+delta), py*(1+delta)
        L2 = px2*x + py2*y - a*x**2 - b*x*y - c*y**2
        sol2 = solve([diff(L2,x), diff(L2,y)], [x, y])
        x2, y2 = float(sol2[x]), float(sol2[y])
        l2 = float(L2.subs([(x, x2), (y, y2)]))
        sens[label] = {"x": round(x2,2), "y": round(y2,2), "lucro": round(l2,2)}

    return {
        "x_opt": round(x_opt, 4),
        "y_opt": round(y_opt, 4),
        "lucro_max": round(L_opt, 4),
        "dL_dx": str(dL_dx),
        "dL_dy": str(dL_dy),
        "grad_x": round(grad_x, 4),
        "grad_y": round(grad_y, 4),
        "gradiente": f"∇L(x*, y*) = ({round(grad_x, 4)}, {round(grad_y, 4)})",
        "H11": round(H11, 4),
        "H12": round(H12, 4),
        "H22": round(H22, 4),
        "det_H": round(det_H, 4),
        "traco_H": round(traco_H, 4),
        "classificacao": classificacao,
        "interpretacao": interpretacao,
        "sensibilidade": sens,
        "funcao": f"L(x,y) = {px}x + {py}y - {a}x² - {b}xy - {c}y²"
    }


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/calcular", methods=["POST"])
def calcular():
    dados = request.get_json()
    try:
        px = float(dados["px"])
        py = float(dados["py"])
        a  = float(dados["a"])
        b  = float(dados["b"])
        c  = float(dados["c"])

        # Validação básica: coeficientes devem garantir concavidade
        if a <= 0 or c <= 0:
            return jsonify({"erro": "Os coeficientes de custo (a e c) devem ser positivos para garantir um máximo."}), 400
        if 4*a*c - b**2 <= 0:
            return jsonify({"erro": "Os parâmetros não garantem um máximo (det(H) ≤ 0). Ajuste os coeficientes."}), 400

        resultado = otimizar_lucro(px, py, a, b, c)
        return jsonify(resultado)

    except KeyError as e:
        return jsonify({"erro": f"Parâmetro ausente: {e}"}), 400
    except Exception as e:
        return jsonify({"erro": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
