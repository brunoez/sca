# 📐 Cálculo do SCA Security Rating & Classificação de Risco

## 📌 Fórmula Linear 1-para-1 Direta

O algoritmo de pontuação de saúde em segurança (*SCA Security Rating*) adota um modelo **1-para-1 direto e 100% transparente**:

$$\text{Nota Final} = \max\left(0, 100 - (\text{Penalidade por CVEs} + \text{Penalidade por Licenças})\right)$$

Cada ponto de penalidade exibido na memória de cálculo subtrai exatamente **1 ponto da nota final**.

---

## 📊 Matriz de Penalidades

### 1. Vulnerabilidades (CVEs):
- **Crítica (Critical)**: `-15.0 pts` por CVE
- **Alta (High)**: `-6.0 pts` por CVE
- **Média (Medium)**: `-2.0 pts` por CVE
- **Baixa (Low)**: `-0.5 pts` por CVE

### 2. Conformidade de Licenças Jurídicas:
- **Copyleft Restritiva (GPL, AGPL, etc.)**: `-5.0 pts` por pacote (máximo 30 pts)
- **Desconhecida / Ausente**: `-0.05 pts` por pacote (máximo 5 pts)

---

## 🚦 Classificação em 3 Níveis de Risco

| Score | Nota Conceitual | Nível de Risco | Indicador Visual |
| :---: | :---: | :---: | :---: |
| 95 – 100 | **A+** | **Baixo Risco** | 🟢 Emerald |
| 85 – 94 | **A** | **Baixo Risco** | 🟢 Emerald |
| 75 – 84 | **B+** | **Risco Moderado** | 🟡 Amber / Cyan |
| 65 – 74 | **B** | **Risco Moderado** | 🟡 Amber / Cyan |
| 50 – 64 | **C** | **Risco Elevado** | 🔴 Rose |
| 35 – 49 | **D** | **Risco Elevado** | 🔴 Rose |
| 0 – 34 | **F** | **Risco Crítico** | 🔴 Rose |

---

## 💡 Memória de Cálculo Interativa (*ScorePopoverCard*)

Ao passar o mouse sobre a nota (ex.: `B`, `66/100`) ou sobre a badge de risco (ex.: `Risco Elevado`), um card flutuante ajustado para baixo (`top-full mt-2`) exibe a discriminação matemática exata de todos os subtotais de penalidades.
