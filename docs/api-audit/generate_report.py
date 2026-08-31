#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de Geração de Relatório de Auditoria de APIs e Segurança (OWASP API Top 10)
Projeto: CycloneDX SCA Visualizer & Dependency Tree Platform
Autor: Principal API & AppSec AI Agent
Data: 2026-08-31
"""

import os
import sys
import html
import re
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image, HRFlowable
)
from reportlab.pdfgen import canvas

# Paleta oficial exigida
COLOR_CRITICA = "#B91C1C"
COLOR_ALTA = "#EA580C"
COLOR_MEDIA = "#D97706"
COLOR_BAIXA = "#2563EB"
COLOR_PONTO_FORTE = "#059669"
COLOR_INFO = "#475569"
COLOR_BG_DARK = "#0F172A"
COLOR_TEXT_DARK = "#1E293B"


class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            return

        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))

        # Cabeçalho
        self.drawString(
            2 * cm, 29.7 * cm - 1.2 * cm,
            "Relatório de Auditoria de APIs e Segurança — CycloneDX SCA Visualizer"
        )
        self.drawRightString(
            21 * cm - 2 * cm, 29.7 * cm - 1.2 * cm,
            "Confidencial / Auditoria de APIs & OWASP"
        )
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(2 * cm, 29.7 * cm - 1.35 * cm, 21 * cm - 2 * cm, 29.7 * cm - 1.35 * cm)

        # Rodapé
        self.line(2 * cm, 1.5 * cm, 21 * cm - 2 * cm, 1.5 * cm)
        self.drawString(
            2 * cm, 1.1 * cm,
            "docs/api-audit/relatorio-auditoria-api.pdf"
        )
        page_str = f"Página {self._pageNumber} de {page_count}"
        self.drawRightString(21 * cm - 2 * cm, 1.1 * cm, page_str)

        self.restoreState()


def generate_charts(output_dir):
    os.makedirs(output_dir, exist_ok=True)

    # 1. Gráfico de Rosca por Severidade
    labels = ['Alta (2)', 'Média (3)', 'Baixa (1)']
    sizes = [2, 3, 1]
    chart_colors = [COLOR_ALTA, COLOR_MEDIA, COLOR_BAIXA]

    fig, ax = plt.subplots(figsize=(4.6, 3.2), subplot_kw=dict(aspect="equal"), dpi=300)
    wedges, texts, autotexts = ax.pie(
        sizes,
        labels=labels,
        colors=chart_colors,
        autopct='%1.0f%%',
        pctdistance=0.75,
        startangle=140,
        wedgeprops=dict(width=0.45, edgecolor='white', linewidth=2),
        textprops=dict(color='#1E293B', fontsize=9, fontweight='bold')
    )
    for at in autotexts:
        at.set_color('white')
        at.set_fontsize(10)
        at.set_weight('bold')

    ax.set_title("Achados por Severidade\n(Total: 6)", fontsize=11, fontweight='bold', pad=10, color='#0F172A')
    plt.tight_layout()
    donut_path = os.path.join(output_dir, "chart_api_severity_donut.png")
    plt.savefig(donut_path, dpi=300, transparent=False, facecolor='white')
    plt.close()

    # 2. Gráfico de Barras por Categoria Auditada
    categories = [
        '1. RFC / Discovery\n(Contratos)',
        '2. WebMCP API\n(Payload DoS)',
        '3. Resiliência\n(Timeouts)',
        '4. Headers & CSP\n(Segurança)',
        '5. CI/CD & SAST\n(Gates)'
    ]

    achados_count = [1, 1, 1, 2, 1]
    pontos_fortes_count = [2, 1, 2, 3, 2]

    x = np.arange(len(categories))
    width = 0.38

    fig, ax = plt.subplots(figsize=(6.4, 3.2), dpi=300)
    rects1 = ax.bar(x - width/2, achados_count, width, label='Achados / Riscos', color=COLOR_ALTA, edgecolor='white', linewidth=1)
    rects2 = ax.bar(x + width/2, pontos_fortes_count, width, label='Controles Validados', color=COLOR_PONTO_FORTE, edgecolor='white', linewidth=1)

    ax.set_ylabel('Quantidade', fontsize=9, fontweight='bold', color='#1E293B')
    ax.set_title('Balanço por Categoria OWASP API', fontsize=11, fontweight='bold', pad=10, color='#0F172A')
    ax.set_xticks(x)
    ax.set_xticklabels(categories, fontsize=7.5, fontweight='bold', color='#334155')
    ax.legend(fontsize=8, loc='upper right')
    ax.grid(axis='y', linestyle='--', alpha=0.3)
    ax.set_ylim(0, 4)

    def autolabel(rects):
        for rect in rects:
            height = rect.get_height()
            if height > 0:
                ax.annotate(f'{int(height)}',
                            xy=(rect.get_x() + rect.get_width() / 2, height),
                            xytext=(0, 2),
                            textcoords="offset points",
                            ha='center', va='bottom', fontsize=8, fontweight='bold')

    autolabel(rects1)
    autolabel(rects2)

    plt.tight_layout()
    bar_path = os.path.join(output_dir, "chart_api_categories_bar.png")
    plt.savefig(bar_path, dpi=300, transparent=False, facecolor='white')
    plt.close()

    return donut_path, bar_path


def format_markdown_issue(md_text):
    escaped = html.escape(md_text)
    lines = []
    for line in escaped.split('\n'):
        l = line
        l = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', l)
        lines.append(l)
    return '<br/>'.join(lines)


def build_pdf_report(pdf_path, output_dir):
    donut_img, bar_img = generate_charts(output_dir)

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        leftMargin=2.0 * cm,
        rightMargin=2.0 * cm,
        topMargin=2.0 * cm,
        bottomMargin=2.0 * cm
    )

    styles = getSampleStyleSheet()

    style_cover_title = ParagraphStyle(
        'CoverTitle',
        parent=styles['Title'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=colors.HexColor("#0F172A"),
        alignment=0,
        spaceAfter=8
    )

    style_cover_subtitle = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=14.5,
        textColor=colors.HexColor("#475569"),
        alignment=0,
        spaceAfter=14
    )

    style_meta_label = ParagraphStyle(
        'MetaLabel',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor("#0F172A")
    )

    style_meta_val = ParagraphStyle(
        'MetaVal',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor("#334155")
    )

    style_h1 = ParagraphStyle(
        'SectionH1',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=colors.HexColor("#0F172A"),
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )

    style_h2 = ParagraphStyle(
        'SectionH2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=12.5,
        textColor=colors.HexColor("#1E293B"),
        spaceBefore=5,
        spaceAfter=3,
        keepWithNext=True
    )

    style_body = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.0,
        leading=11.0,
        textColor=colors.HexColor("#334155"),
        spaceAfter=3
    )

    style_body_bold = ParagraphStyle(
        'BodyDarkBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.0,
        leading=11.0,
        textColor=colors.HexColor("#0F172A"),
        spaceAfter=3
    )

    style_code = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=6.8,
        leading=8.8,
        textColor=colors.HexColor("#0F172A"),
        backColor=colors.HexColor("#F1F5F9"),
        spaceBefore=1,
        spaceAfter=2
    )

    style_issue_box = ParagraphStyle(
        'IssueBox',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=6.3,
        leading=8.2,
        textColor=colors.HexColor("#0F172A")
    )

    story = []

    # =========================================================================
    # PÁGINA 1: CAPA & NOTA METODOLÓGICA
    # =========================================================================
    story.append(Spacer(1, 0.5 * cm))

    badge_data = [[
        Paragraph("<font color='#0284C7'><b>🛡️ AUDITORIA DE APIS, OWASP API TOP 10, PERFORMANCE & RESILIÊNCIA</b></font>", style_meta_label)
    ]]
    badge_table = Table(badge_data, colWidths=[17 * cm])
    badge_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#E0F2FE")),
        ('PADDING', (0, 0), (-1, -1), 3.5),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(badge_table)
    story.append(Spacer(1, 0.25 * cm))

    story.append(Paragraph("Relatório de Auditoria de APIs e Segurança", style_cover_title))
    story.append(Paragraph("<b>Projeto:</b> CycloneDX SCA Visualizer & Dependency Tree Platform (v1.7.3)", style_cover_subtitle))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0284C7"), spaceBefore=0, spaceAfter=8))

    meta_table_data = [
        [Paragraph("<b>Data da Auditoria:</b>", style_meta_label), Paragraph("31 de Agosto de 2026", style_meta_val)],
        [Paragraph("<b>Classificação:</b>", style_meta_label), Paragraph("Auditoria Técnica de APIs, OWASP API Security Top 10, Resiliência e Contratos", style_meta_val)],
        [Paragraph("<b>Avaliador / Papel:</b>", style_meta_label), Paragraph("Engenheiro Principal de APIs & Especialista em AppSec (Security-First AI Agent)", style_meta_val)],
        [Paragraph("<b>Escopo Auditado:</b>", style_meta_label), Paragraph("Interface WebMCP in-browser API, rotas RFC / Discovery (.well-known, auth.md, index.md), Nginx Gateway, Normalizador, Handlers de Parsing e Esteira GitLab CI/CD", style_meta_val)],
        [Paragraph("<b>Resultado Geral:</b>", style_meta_label), Paragraph("<font color='#EA580C'><b>APROVADO COM RESSALVAS (6 Achados: 0 Críticos, 2 Altos, 3 Médios, 1 Baixo)</b></font>", style_meta_val)],
    ]
    meta_table = Table(meta_table_data, colWidths=[4.0 * cm, 13.0 * cm])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('PADDING', (0, 0), (-1, -1), 4.5),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 0.35 * cm))

    story.append(Paragraph("Nota Metodológica & Mapeamento de Stack para OWASP API Top 10", style_h2))
    story.append(Paragraph(
        "A arquitetura do <b>CycloneDX SCA Visualizer</b> é baseada no padrão <i>100% Client-Side Privacy-First</i>, sem persistência em banco de dados em nuvem. As categorias do <b>OWASP API Security Top 10 (2023)</b> foram mapeadas diretamente para a superfície de interfaces da aplicação:",
        style_body
    ))

    stack_data = [
        [Paragraph("<b>Categoria OWASP API</b>", style_meta_label), Paragraph("<b>Mapeamento Técnico na Stack do Projeto</b>", style_meta_label), Paragraph("<b>Resultado da Avaliação</b>", style_meta_label)],
        [
            Paragraph("API1:2023 BOLA / IDOR", style_body),
            Paragraph("Consultas a recursos por ID via URL ou APIs internas. No projeto, todo o grafo de SBOM é mantido em memória RAM do navegador sem rotas <code>/api/orders/:id</code>.", style_body),
            Paragraph("<font color='#059669'><b>Não Aplicável / Mitigado por Design</b></font>", style_body)
        ],
        [
            Paragraph("API2:2023 Broken Auth", style_body),
            Paragraph("Endpoints RFC e declarações de autenticação de agentes em <code>auth.md</code> e <code>/.well-known/</code>. Validação de ausência de bypass ou chaves falsas.", style_body),
            Paragraph("<font color='#059669'><b>Conforme (Anonymous Auth Declarado)</b></font>", style_body)
        ],
        [
            Paragraph("API3:2023 BOPM / Mass Assign.", style_body),
            Paragraph("Parsing de payloads SBOM JSON/XML e mapeamento para o modelo central via <code>normalizer.ts</code> e Zod schemas.", style_body),
            Paragraph("<font color='#059669'><b>Conforme (Normalização Controlada)</b></font>", style_body)
        ],
        [
            Paragraph("API4:2023 Unrestricted Resource", style_body),
            Paragraph("Limites de tamanho de payload em uploads (Dropzone) e na API in-browser WebMCP (<code>analyze_sbom</code>), além de Rate Limiting no Nginx.", style_body),
            Paragraph("<font color='#EA580C'><b>Achados #2 e #6 (WebMCP & Nginx)</b></font>", style_body)
        ],
        [
            Paragraph("API5:2023 Broken Function Auth", style_body),
            Paragraph("Verificação de funções administrativas no cliente ou em ferramentas expostas aos agentes.", style_body),
            Paragraph("<font color='#059669'><b>Conforme (Sem funções admin privilegiadas)</b></font>", style_body)
        ],
        [
            Paragraph("API8:2023 Security Misconfig", style_body),
            Paragraph("Cabeçalhos HTTP de segurança (CSP, CORS, HSTS), Content-Type Mismatch em endpoints RFC e CI/CD SAST gates.", style_body),
            Paragraph("<font color='#EA580C'><b>Achados #1, #4 e #5</b></font>", style_body)
        ],
    ]
    stack_table = Table(stack_data, colWidths=[4.2 * cm, 8.3 * cm, 4.5 * cm])
    stack_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#E2E8F0")),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor("#FFFFFF")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('PADDING', (0, 0), (-1, -1), 4.0),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(stack_table)

    story.append(PageBreak())

    # =========================================================================
    # PÁGINA 2: RESUMO EXECUTIVO, GRÁFICOS & PONTOS FORTES/FRACOS
    # =========================================================================
    story.append(Paragraph("1. Resumo Executivo", style_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#E2E8F0"), spaceBefore=2, spaceAfter=5))

    story.append(Paragraph(
        "A auditoria técnica de APIs, contratos e segurança da plataforma <b>CycloneDX SCA Visualizer (v1.7.3)</b> examinou a camada de roteamento Nginx, endpoints RFC de descoberta de agentes (<i>Agent Discovery</i>), ferramentas WebMCP in-browser, fluxo de sanitização de dados, chamadas HTTP de exemplos e a esteira de DevSecOps. A plataforma possui uma arquitetura robusta voltada para privacidade, porém requer ajustes de contrato MIME em rotas RFC e proteção de payload na API WebMCP.",
        style_body
    ))

    charts_table_data = [
        [
            Image(donut_img, width=7.4 * cm, height=4.8 * cm),
            Image(bar_img, width=9.2 * cm, height=4.8 * cm)
        ]
    ]
    charts_table = Table(charts_table_data, colWidths=[7.6 * cm, 9.4 * cm])
    charts_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('PADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(charts_table)
    story.append(Spacer(1, 0.15 * cm))

    # Quadro de Severidades
    kpi_data = [
        [
            Paragraph("<font color='white'><b>CRÍTICA</b></font>", style_meta_label),
            Paragraph("<font color='white'><b>ALTA</b></font>", style_meta_label),
            Paragraph("<font color='white'><b>MÉDIA</b></font>", style_meta_label),
            Paragraph("<font color='white'><b>BAIXA</b></font>", style_meta_label),
            Paragraph("<font color='white'><b>PONTOS FORTES</b></font>", style_meta_label),
        ],
        [
            Paragraph("<font color='white' size=12><b>0</b></font>", style_meta_label),
            Paragraph("<font color='white' size=12><b>2</b></font>", style_meta_label),
            Paragraph("<font color='white' size=12><b>3</b></font>", style_meta_label),
            Paragraph("<font color='white' size=12><b>1</b></font>", style_meta_label),
            Paragraph("<font color='white' size=12><b>7</b></font>", style_meta_label),
        ]
    ]
    kpi_table = Table(kpi_data, colWidths=[3.4 * cm, 3.4 * cm, 3.4 * cm, 3.4 * cm, 3.4 * cm])
    kpi_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 1), colors.HexColor(COLOR_CRITICA)),
        ('BACKGROUND', (1, 0), (1, 1), colors.HexColor(COLOR_ALTA)),
        ('BACKGROUND', (2, 0), (2, 1), colors.HexColor(COLOR_MEDIA)),
        ('BACKGROUND', (3, 0), (3, 1), colors.HexColor(COLOR_BAIXA)),
        ('BACKGROUND', (4, 0), (4, 1), colors.HexColor(COLOR_PONTO_FORTE)),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('PADDING', (0, 0), (-1, -1), 3.0),
    ]))
    story.append(kpi_table)
    story.append(Spacer(1, 0.25 * cm))

    story.append(Paragraph("2. Pontos Fortes e Riscos Centrais da API", style_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#E2E8F0"), spaceBefore=2, spaceAfter=5))
    story.append(Paragraph("<b>✅ Controles de Segurança e Resiliência Validados:</b>", style_body_bold))

    fortes_data = [
        [
            Paragraph("<b>Controle / Proteção</b>", style_meta_label),
            Paragraph("<b>Evidência Técnica no Código</b>", style_meta_label),
            Paragraph("<b>Benefício de Segurança / API</b>", style_meta_label)
        ],
        [
            Paragraph("Anti-XXE em Parsing XML", style_body),
            Paragraph("<code>services/parsers/xmlParser.ts:11</code><br/><code>processEntities: false</code>", style_code),
            Paragraph("Mitiga exfiltração SSRF/XXE e expansão de entidades durante parsing de SBOMs XML recebidos.", style_body)
        ],
        [
            Paragraph("Cycle Guard & Depth Cap", style_body),
            Paragraph("<code>services/normalizer.ts:151</code><br/><code>visited.has(ref) || depth &gt; 32</code>", style_code),
            Paragraph("Previne DoS por Stack Overflow em grafos cíclicos manipulados injetados via arquivo ou WebMCP.", style_body)
        ],
        [
            Paragraph("Limitação de Upload (50MB)", style_body),
            Paragraph("<code>components/landing/Dropzone.tsx:53</code><br/><code>file.size &gt; 50 * 1024 * 1024</code>", style_code),
            Paragraph("Bloqueia arquivos gigantes antes da leitura no FileReader, protegendo o heap do navegador.", style_body)
        ],
        [
            Paragraph("Headers HTTP Hardened", style_body),
            Paragraph("<code>nginx.conf:21-30</code> (HSTS, COOP, COEP, CORP, nosniff, DENY)", style_code),
            Paragraph("Defesa em profundidade rigorosa contra Clickjacking, MIME Sniffing e isolamento cross-origin.", style_body)
        ],
    ]
    fortes_table = Table(fortes_data, colWidths=[4.0 * cm, 5.8 * cm, 7.2 * cm])
    fortes_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#DCFCE7")),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor("#FFFFFF")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#86EFAC")),
        ('PADDING', (0, 0), (-1, -1), 3.0),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(fortes_table)
    story.append(Spacer(1, 0.15 * cm))

    story.append(Paragraph("<b>⚠️ Riscos Centrais Identificados:</b>", style_body_bold))
    story.append(Paragraph(
        "1. <b>Quebra de Contrato em Endpoints RFC / Discovery:</b> Rotas <code>/.well-known/oauth-*</code> respondem com <code>Content-Type: application/json</code> mas entregam o HTML do SPA React devido a fallback de arquivo inexistente.<br/>"
        "2. <b>Falta de Validação de Payload no WebMCP:</b> A ferramenta <code>analyze_sbom</code> não limita tamanho de string, permitindo DoS por memória.<br/>"
        "3. <b>Ausência de Timeout em Fetch:</b> Chamadas downstream em <code>SampleLoader.tsx</code> podem travar a UI sem AbortSignal.",
        style_body
    ))

    story.append(PageBreak())

    # =========================================================================
    # PÁGINA 3: TABELA DE ACHADOS DETALHADOS
    # =========================================================================
    story.append(Paragraph("3. Tabela de Achados Detalhados por Categoria", style_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#E2E8F0"), spaceBefore=2, spaceAfter=5))

    achados_data = [
        [
            Paragraph("<b>Sev.</b>", style_meta_label),
            Paragraph("<b>Categoria & Arquivo:Linha</b>", style_meta_label),
            Paragraph("<b>Descrição Técnica do Achado & Risco</b>", style_meta_label),
            Paragraph("<b>Quick Win</b>", style_meta_label),
        ],
        [
            Paragraph("<font color='#EA580C'><b>ALTA</b></font>", style_meta_label),
            Paragraph("<b>Contratos RFC & Discovery</b><br/><code>frontend/nginx.conf:92-120</code>", style_body),
            Paragraph(
                "<b>Quebra de contrato JSON em endpoints RFC (.well-known):</b><br/>"
                "As rotas <code>/.well-known/oauth-protected-resource</code> e <code>/.well-known/oauth-authorization-server</code> possuem <code>default_type application/json;</code> mas usam <code>try_files ... /index.html;</code>. Como os arquivos JSON não existem em <code>public/</code>, clientes HTTP e agentes de IA recebem status 200 com HTML no corpo mas header JSON, quebrando o parser de agentes (MIME Type Mismatch).",
                style_body
            ),
            Paragraph("<font color='#059669'><b>SIM</b><br/>(20 min)</font>", style_meta_label)
        ],
        [
            Paragraph("<font color='#EA580C'><b>ALTA</b></font>", style_meta_label),
            Paragraph("<b>WebMCP API / DoS</b><br/><code>frontend/src/utils/webMcp.ts:42-46</code>", style_body),
            Paragraph(
                "<b>Ausência de limite de payload na ferramenta analyze_sbom:</b><br/>"
                "A API WebMCP exposta a agentes via <code>navigator.modelContext.provideContext</code> recebe <code>sbomContent</code> sem validar tamanho. O envio de payloads maliciosos de centenas de MB via API trava a thread de execução do navegador.",
                style_body
            ),
            Paragraph("<font color='#059669'><b>SIM</b><br/>(15 min)</font>", style_meta_label)
        ],
        [
            Paragraph("<font color='#D97706'><b>MÉDIA</b></font>", style_meta_label),
            Paragraph("<b>Resiliência Downstream</b><br/><code>frontend/src/components/landing/SampleLoader.tsx:165-173</code>", style_body),
            Paragraph(
                "<b>Chamada HTTP downstream sem timeout (AbortSignal):</b><br/>"
                "A função <code>loadSample</code> executa <code>fetch(samplePath)</code> sem timeout configurado. Em caso de instabilidade de rede ou CDN, o estado de carregamento pode permanecer travado permanentemente.",
                style_body
            ),
            Paragraph("<font color='#059669'><b>SIM</b><br/>(15 min)</font>", style_meta_label)
        ],
        [
            Paragraph("<font color='#D97706'><b>MÉDIA</b></font>", style_meta_label),
            Paragraph("<b>Headers & CSP</b><br/><code>frontend/nginx.conf:30, 161</code>", style_body),
            Paragraph(
                "<b>Diretiva unsafe-inline no Content-Security-Policy:</b><br/>"
                "O cabeçalho CSP permite <code>style-src 'unsafe-inline'</code>. Embora o Tailwind gere classes compiladas, o uso de unsafe-inline mitiga a proteção estrita do navegador contra injeções de estilo CSS.",
                style_body
            ),
            Paragraph("<font color='#64748B'>NÃO<br/>(1 hr)</font>", style_meta_label)
        ],
        [
            Paragraph("<font color='#D97706'><b>MÉDIA</b></font>", style_meta_label),
            Paragraph("<b>DevSecOps & CI Gates</b><br/><code>.gitlab/ci/security.gitlab-ci.yml:18, 63</code>", style_body),
            Paragraph(
                "<b>Jobs de segurança com allow_failure: true na esteira:</b><br/>"
                "Os jobs <code>semgrep_sast_scan</code> e <code>trivy_container_scan</code> não bloqueiam o pipeline em caso de detecção de vulnerabilidades severas, permitindo o deploy contínuo em produção.",
                style_body
            ),
            Paragraph("<font color='#059669'><b>SIM</b><br/>(10 min)</font>", style_meta_label)
        ],
        [
            Paragraph("<font color='#2563EB'><b>BAIXA</b></font>", style_meta_label),
            Paragraph("<b>Rate Limiting</b><br/><code>frontend/nginx.conf:1-188</code>", style_body),
            Paragraph(
                "<b>Ausência de limitação de taxa de requisições no Nginx:</b><br/>"
                "O Nginx não possui diretivas <code>limit_req_zone</code> para mitigar crawling abusivo ou varreduras automatizadas nos endpoints estáticos e RFC.",
                style_body
            ),
            Paragraph("<font color='#64748B'>NÃO<br/>(45 min)</font>", style_meta_label)
        ],
    ]
    achados_table = Table(achados_data, colWidths=[1.5 * cm, 4.6 * cm, 9.1 * cm, 1.8 * cm])
    achados_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#E2E8F0")),
        ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor("#FFEDD5")),
        ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor("#FFEDD5")),
        ('BACKGROUND', (0, 3), (-1, 3), colors.HexColor("#FEF3C7")),
        ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor("#FEF3C7")),
        ('BACKGROUND', (0, 5), (-1, 5), colors.HexColor("#FEF3C7")),
        ('BACKGROUND', (0, 6), (-1, 6), colors.HexColor("#EFF6FF")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('PADDING', (0, 0), (-1, -1), 3.5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ALIGN', (3, 1), (3, -1), 'CENTER'),
    ]))
    story.append(achados_table)

    story.append(PageBreak())

    # =========================================================================
    # PÁGINA 4: RECOMENDAÇÕES PRIORIZADAS & ISSUES 1 E 2
    # =========================================================================
    story.append(Paragraph("4. Recomendações Priorizadas de Remediação", style_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#E2E8F0"), spaceBefore=2, spaceAfter=5))

    recs_data = [
        [Paragraph("<b>Prioridade</b>", style_meta_label), Paragraph("<b>Ação Recomendada</b>", style_meta_label), Paragraph("<b>Impacto e Benefício</b>", style_meta_label)],
        [
            Paragraph("<font color='#DC2626'><b>P1 (Alta)</b></font>", style_body),
            Paragraph("<b>Criar arquivos JSON reais para /.well-known/oauth-* e catalog</b><br/>Criar os arquivos JSON estáticos em <code>frontend/public/.well-known/</code> para satisfazer rigorosamente o contrato RFC e evitar fallback para o HTML do SPA.", style_body),
            Paragraph("Garante interoperabilidade perfeita com agentes e elimina erros de parsing JSON em clientes HTTP.", style_body)
        ],
        [
            Paragraph("<font color='#DC2626'><b>P1 (Alta)</b></font>", style_body),
            Paragraph("<b>Adicionar validação de payload máximo (50MB) na API WebMCP</b><br/>Validar <code>sbomContent.length &lt;= 50 * 1024 * 1024</code> no método <code>execute</code> da tool <code>analyze_sbom</code>.", style_body),
            Paragraph("Elimina risco de esgotamento de memória e travamento do navegador via interface programática de agentes.", style_body)
        ],
        [
            Paragraph("<font color='#D97706'><b>P2 (Média)</b></font>", style_body),
            Paragraph("<b>Implementar timeout resiliente com AbortSignal no fetch de exemplos</b><br/>Utilizar <code>fetch(samplePath, { signal: AbortSignal.timeout(5000) })</code> em <code>SampleLoader.tsx</code>.", style_body),
            Paragraph("Assegura que requisições lentas caiam no fallback de amostras embutidas sem travar a interface.", style_body)
        ],
        [
            Paragraph("<font color='#D97706'><b>P2 (Média)</b></font>", style_body),
            Paragraph("<b>Bloquear esteira de CI/CD para vulnerabilidades SAST e Containers</b><br/>Remover <code>allow_failure: true</code> de <code>semgrep_sast_scan</code> e <code>trivy_container_scan</code>.", style_body),
            Paragraph("Garante conformidade com os portões de qualidade de DevSecOps antes do deploy em produção.", style_body)
        ],
    ]
    recs_table = Table(recs_data, colWidths=[2.2 * cm, 8.8 * cm, 6.0 * cm])
    recs_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#E2E8F0")),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor("#FFFFFF")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('PADDING', (0, 0), (-1, -1), 3.5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(recs_table)
    story.append(Spacer(1, 0.3 * cm))

    story.append(Paragraph("5. Issues para o GitHub (Prontas para Criação)", style_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#E2E8F0"), spaceBefore=2, spaceAfter=5))
    story.append(Paragraph(
        "Abaixo estão os templates completos formatados em Markdown para criação direta das issues de remediação de APIs e segurança no repositório:",
        style_body
    ))

    def create_issue_table(issue_text):
        formatted_html = format_markdown_issue(issue_text)
        p = Paragraph(formatted_html, style_issue_box)
        t = Table([[p]], colWidths=[17.0 * cm])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
            ('BOX', (0, 0), (-1, -1), 0.75, colors.HexColor("#94A3B8")),
            ('PADDING', (0, 0), (-1, -1), 4.5),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        return t

    # ISSUE 1
    issue1_md = r"""--- ISSUE 1 ---
**Título:** [API/Segurança] Corrigir quebra de contrato e MIME type em endpoints RFC /.well-known/
**Labels:** api, security, severity:high, bug, nginx

### 📋 Descrição do Problema
O arquivo `frontend/nginx.conf` define regras de roteamento para `/.well-known/oauth-protected-resource` e `/.well-known/oauth-authorization-server` configurando o header `Content-Type: application/json`, porém utiliza `try_files ... /index.html;`. Como os arquivos JSON correspondentes não existem em `frontend/public/.well-known/`, o Nginx responde com status HTTP 200 servindo o código HTML do SPA React. Quando agentes autônomos ou clientes HTTP realizam requisições a esses endpoints, ocorre falha de parsing JSON (Broken Contract).

### 🔍 Evidência no Código
Arquivo: `frontend/nginx.conf` (Linhas 92-106 e 107-121)
```nginx
location ~* ^\/\\.well-known/oauth-protected-resource {
    default_type application/json;
    add_header Content-Type "application/json; charset=utf-8" always;
    try_files /.well-known/oauth-protected-resource /index.html;
}
```

### 💥 Impacto
Falha de interoperabilidade com agentes de IA e clientes OAuth RFC 8414 que tentam descobrir os metadados de autenticação da aplicação e recebem HTML inesperado em requisições JSON.

### 🛠️ Sugestão de Correção
1. Criar o arquivo `frontend/public/.well-known/oauth-protected-resource` com payload JSON válido declarando `resource: "https://sca.brunoizidorio.com.br"`, `authorization_servers: []` e `scopes_supported: ["read:sbom", "analyze:sbom"]`.
2. Criar `frontend/public/.well-known/oauth-authorization-server` com metadata JSON correspondente.
3. Garantir que `try_files $uri =404;` seja aplicado a essas rotas.

### ✅ Critérios de Aceite
- [ ] Requisição `curl -s -H "Accept: application/json" http://localhost:8080/.well-known/oauth-protected-resource` retorna JSON válido.
- [ ] Header `Content-Type` é `application/json; charset=utf-8`.
- [ ] Nenhum HTML do React é retornado em rotas `.well-known`.
--- FIM ISSUE 1 ---"""

    story.append(Spacer(1, 0.15 * cm))
    story.append(create_issue_table(issue1_md))

    story.append(PageBreak())

    # =========================================================================
    # PÁGINA 5: ISSUES 2, 3 E 4
    # =========================================================================
    # ISSUE 2
    issue2_md = r"""--- ISSUE 2 ---
**Título:** [API/Segurança] Implementar validação de tamanho máximo de payload na API WebMCP
**Labels:** api, security, severity:high, performance, webmcp

### 📋 Descrição do Problema
Em `frontend/src/utils/webMcp.ts`, a ferramenta in-browser `analyze_sbom` exposta a agentes via `navigator.modelContext.provideContext` processa o parâmetro `sbomContent` sem qualquer verificação de limite de tamanho de string (ao contrário do `Dropzone.tsx` que limita a 50MB). Um agente ou script chamando a API com strings gigantescas causa consumo excessivo de heap e travamento do navegador (Client-Side DoS).

### 🔍 Evidência no Código
Arquivo: `frontend/src/utils/webMcp.ts` (Linhas 42-46)
```typescript
execute: async ({ sbomContent, fileName = 'agent_input.json' }) => {
  const content = String(sbomContent);
  const name = String(fileName);
  const model = parseAndNormalizeSbom(content, name);
```

### 💥 Impacto
Exaustão de memória da aba e negação de serviço client-side caso um agente envie um arquivo SBOM desproporcional.

### 🛠️ Sugestão de Correção
Adicionar validação no início do handler `execute`:
```typescript
const MAX_WEBMCP_PAYLOAD = 50 * 1024 * 1024;
if (content.length > MAX_WEBMCP_PAYLOAD) {
  return { error: 'Payload excede o limite máximo permitido de 50MB.' };
}
```

### ✅ Critérios de Aceite
- [ ] Chamada `analyze_sbom` com conteúdo >50MB retorna objeto de erro estruturado `{ error: ... }` sem travar a thread.
- [ ] Testes unitários para WebMCP cobrem rejeição de payload excessivo.
--- FIM ISSUE 2 ---"""

    story.append(create_issue_table(issue2_md))
    story.append(Spacer(1, 0.25 * cm))

    # ISSUE 3 & 4
    issue3_4_md = r"""--- ISSUE 3 ---
**Título:** [API/Performance] Configurar AbortSignal.timeout em requisições downstream de exemplos
**Labels:** api, performance, severity:medium, frontend

### 📋 Descrição do Problema
Em `frontend/src/components/landing/SampleLoader.tsx`, a função `loadSample` executa chamadas `fetch(samplePath)` sem controle de timeout. Se a rede sofrer lentidão severa, a requisição fica pendente por tempo indeterminado com spinner de loading ativo.

### 🔍 Evidência no Código
Arquivo: `frontend/src/components/landing/SampleLoader.tsx` (Linhas 165-173)

### 💥 Impacto
Experiência do usuário degradada e bloqueio de UI em conexões instáveis.

### 🛠️ Sugestão de Correção
Adicionar `AbortSignal.timeout(5000)` ao `fetch`:
`const response = await fetch(samplePath, { signal: AbortSignal.timeout(5000) });`

### ✅ Critérios de Aceite
- [ ] Requisições fetch em `SampleLoader` abortam automaticamente após 5 segundos e ativam o fallback embutido.
--- FIM ISSUE 3 ---

--- ISSUE 4 ---
**Título:** [API/Segurança] Bloquear esteira de CI/CD para falhas em scans de SAST e Container
**Labels:** api, security, severity:medium, devsecops, ci/cd

### 📋 Descrição do Problema
Os jobs `semgrep_sast_scan` e `trivy_container_scan` em `.gitlab/ci/security.gitlab-ci.yml` estão com `allow_failure: true`, permitindo que código vulnerável seja promovido para produção.

### 🛠️ Sugestão de Correção
Remover `allow_failure: true` de `semgrep_sast_scan` e `trivy_container_scan`.
--- FIM ISSUE 4 ---"""

    story.append(create_issue_table(issue3_4_md))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Relatório gerado com sucesso em: {pdf_path}")


if __name__ == '__main__':
    base_dir = os.path.dirname(os.path.abspath(__file__))
    output_pdf = os.path.join(base_dir, "relatorio-auditoria-api.pdf")
    build_pdf_report(output_pdf, base_dir)
