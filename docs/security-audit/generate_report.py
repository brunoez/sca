#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de Geração de Relatório de Auditoria de Segurança
Projeto: CycloneDX SCA Visualizer & Dependency Tree Platform
Autor: Security-First AI Agent
Data: 2026-08-29
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
from reportlab.lib.units import cm, mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

# Palette definition
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
            "Relatório de Auditoria de Segurança — CycloneDX SCA Visualizer"
        )
        self.drawRightString(
            21 * cm - 2 * cm, 29.7 * cm - 1.2 * cm,
            "Confidencial / Auditoria de Código"
        )
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(2 * cm, 29.7 * cm - 1.35 * cm, 21 * cm - 2 * cm, 29.7 * cm - 1.35 * cm)

        # Rodapé
        self.line(2 * cm, 1.5 * cm, 21 * cm - 2 * cm, 1.5 * cm)
        self.drawString(
            2 * cm, 1.1 * cm,
            "docs/security-audit/relatorio-auditoria-seguranca.pdf"
        )
        page_str = f"Página {self._pageNumber} de {page_count}"
        self.drawRightString(21 * cm - 2 * cm, 1.1 * cm, page_str)

        self.restoreState()


def generate_charts(output_dir):
    os.makedirs(output_dir, exist_ok=True)
    
    # 1. Gráfico de Rosca por Severidade
    active_labels = ['Média (2)', 'Baixa / Info (2)']
    active_sizes = [2, 2]
    active_colors = [COLOR_MEDIA, COLOR_BAIXA]

    fig, ax = plt.subplots(figsize=(4.5, 3.2), subplot_kw=dict(aspect="equal"), dpi=300)
    wedges, texts, autotexts = ax.pie(
        active_sizes,
        labels=active_labels,
        colors=active_colors,
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

    ax.set_title("Achados por Severidade\n(Total: 4)", fontsize=11, fontweight='bold', pad=10, color='#0F172A')
    plt.tight_layout()
    donut_path = os.path.join(output_dir, "chart_severity_donut.png")
    plt.savefig(donut_path, dpi=300, transparent=False, facecolor='white')
    plt.close()

    # 2. Gráfico de Barras por Categoria
    categories = [
        '1. Banco/Tenant\n(Isolamento)',
        '2. Permissões\n(Client-Gate)',
        '3. IDOR\n(Ref. Direta)',
        '4. Chaves / CI\n(Exposição)',
        '5. Inputs / XSS\n(Sanitização)'
    ]
    
    achados_count = [0, 0, 0, 1, 3]
    pontos_fortes_count = [1, 1, 1, 1, 2]

    x = np.arange(len(categories))
    width = 0.38

    fig, ax = plt.subplots(figsize=(6.2, 3.2), dpi=300)
    rects1 = ax.bar(x - width/2, achados_count, width, label='Achados / Riscos', color=COLOR_MEDIA, edgecolor='white', linewidth=1)
    rects2 = ax.bar(x + width/2, pontos_fortes_count, width, label='Pontos Fortes Validados', color=COLOR_PONTO_FORTE, edgecolor='white', linewidth=1)

    ax.set_ylabel('Quantidade', fontsize=9, fontweight='bold', color='#1E293B')
    ax.set_title('Balanço por Categoria Auditada', fontsize=11, fontweight='bold', pad=10, color='#0F172A')
    ax.set_xticks(x)
    ax.set_xticklabels(categories, fontsize=7.5, fontweight='bold', color='#334155')
    ax.legend(fontsize=8, loc='upper left')
    ax.grid(axis='y', linestyle='--', alpha=0.3)
    ax.set_ylim(0, 3.5)

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
    bar_path = os.path.join(output_dir, "chart_categories_bar.png")
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
        fontSize=23,
        leading=27,
        textColor=colors.HexColor("#0F172A"),
        alignment=0,
        spaceAfter=10
    )

    style_cover_subtitle = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11.5,
        leading=15,
        textColor=colors.HexColor("#475569"),
        alignment=0,
        spaceAfter=18
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
        fontSize=12.5,
        leading=16,
        textColor=colors.HexColor("#0F172A"),
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True
    )

    style_h2 = ParagraphStyle(
        'SectionH2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor("#1E293B"),
        spaceBefore=6,
        spaceAfter=3,
        keepWithNext=True
    )

    style_body = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.2,
        leading=11.5,
        textColor=colors.HexColor("#334155"),
        spaceAfter=4
    )

    style_body_bold = ParagraphStyle(
        'BodyDarkBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.2,
        leading=11.5,
        textColor=colors.HexColor("#0F172A"),
        spaceAfter=4
    )

    style_code = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.0,
        leading=9.2,
        textColor=colors.HexColor("#0F172A"),
        backColor=colors.HexColor("#F1F5F9"),
        spaceBefore=2,
        spaceAfter=3
    )

    style_issue_box = ParagraphStyle(
        'IssueBox',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=6.5,
        leading=8.6,
        textColor=colors.HexColor("#0F172A")
    )

    story = []

    # =========================================================================
    # PÁGINA 1: CAPA & NOTA METODOLÓGICA
    # =========================================================================
    story.append(Spacer(1, 1.0 * cm))
    
    badge_data = [[
        Paragraph("<font color='#0284C7'><b>🔒 AUDITORIA DE CÓDIGO-FONTE & DEVSECOPS</b></font>", style_meta_label)
    ]]
    badge_table = Table(badge_data, colWidths=[17 * cm])
    badge_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#E0F2FE")),
        ('PADDING', (0, 0), (-1, -1), 3.5),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(badge_table)
    story.append(Spacer(1, 0.3 * cm))

    story.append(Paragraph("Relatório de Auditoria de Segurança", style_cover_title))
    story.append(Paragraph("<b>Projeto:</b> CycloneDX SCA Visualizer & Dependency Tree Platform (v1.7.1)", style_cover_subtitle))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0284C7"), spaceBefore=0, spaceAfter=10))

    meta_table_data = [
        [Paragraph("<b>Data da Auditoria:</b>", style_meta_label), Paragraph("29 de Agosto de 2026", style_meta_val)],
        [Paragraph("<b>Classificação:</b>", style_meta_label), Paragraph("Defensivo / Revisão Estática de Segurança (SAST & Arquitetura)", style_meta_val)],
        [Paragraph("<b>Avaliador:</b>", style_meta_label), Paragraph("Security-First AI Agent (Antigravity Guardian v2.0)", style_meta_val)],
        [Paragraph("<b>Escopo Auditado:</b>", style_meta_label), Paragraph("Frontend React/TypeScript, Nginx Config, Dockerfile, CI/CD GitLab Pipelines e Documentação", style_meta_val)],
        [Paragraph("<b>Resultado Geral:</b>", style_meta_label), Paragraph("<font color='#059669'><b>APROVADO COM RESSALVAS (4 Recomendações Acionáveis / 0 Falhas Críticas)</b></font>", style_meta_val)],
    ]
    meta_table = Table(meta_table_data, colWidths=[4.0 * cm, 13.0 * cm])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 0.5 * cm))

    story.append(Paragraph("Nota Metodológica & Mapeamento de Stack", style_h2))
    story.append(Paragraph(
        "Antes do início da varredura, a pilha tecnológica completa do projeto foi identificada para adequar rigorosamente cada categoria aos mecanismos técnicos reais do ecossistema:",
        style_body
    ))

    stack_data = [
        [Paragraph("<b>Camada</b>", style_meta_label), Paragraph("<b>Tecnologia Detectada</b>", style_meta_label), Paragraph("<b>Adaptação Metodológica</b>", style_meta_label)],
        [
            Paragraph("Frontend / SPA", style_body),
            Paragraph("React 18.3, TypeScript 5.7, Vite 6.1, Zustand 5.0, TailwindCSS", style_body),
            Paragraph("Auditoria de XSS, DOMPurify, injeções em grafo e parsing client-side.", style_body)
        ],
        [
            Paragraph("Banco / Persistência", style_body),
            Paragraph("Nenhum (100% Client-Side RAM Processing)", style_body),
            Paragraph("Mapeado para isolamento de dados em memória local e ausência de vazamento.", style_body)
        ],
        [
            Paragraph("Autenticação / RBAC", style_body),
            Paragraph("Nula / Anônima por Design (WebMCP Agent RFC Mocks)", style_body),
            Paragraph("Verificação de ausência de credenciais expostas e de gates falsos.", style_body)
        ],
        [
            Paragraph("Deploy & Infra", style_body),
            Paragraph("Docker (Nginx Alpine Slim Hardened), GitLab CI/CD", style_body),
            Paragraph("Auditoria de headers HTTP OWASP, usuário não-root e pipelines de CI/CD.", style_body)
        ],
    ]
    stack_table = Table(stack_data, colWidths=[3.2 * cm, 5.8 * cm, 8.0 * cm])
    stack_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#E2E8F0")),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor("#FFFFFF")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('PADDING', (0, 0), (-1, -1), 4.5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(stack_table)

    story.append(PageBreak())

    # =========================================================================
    # PÁGINA 2: RESUMO EXECUTIVO, GRÁFICOS & PONTOS FORTES
    # =========================================================================
    story.append(Paragraph("1. Resumo Executivo", style_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#E2E8F0"), spaceBefore=2, spaceAfter=6))
    
    story.append(Paragraph(
        "A auditoria de segurança da plataforma <b>CycloneDX SCA Visualizer (v1.7.1)</b> avaliou o código-fonte, configurações de deploy em Nginx/Docker, esteiras de DevSecOps e o fluxo de dados em memória RAM. O projeto adota uma arquitetura focada em privacidade (<i>Privacy-First</i>), realizando todo o parsing de SBOMs e cálculo de métricas localmente no navegador, sem transmissão para servidores de nuvem.",
        style_body
    ))

    charts_table_data = [
        [
            Image(donut_img, width=7.4 * cm, height=5.0 * cm),
            Image(bar_img, width=9.2 * cm, height=5.0 * cm)
        ]
    ]
    charts_table = Table(charts_table_data, colWidths=[7.6 * cm, 9.4 * cm])
    charts_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('PADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(charts_table)
    story.append(Spacer(1, 0.2 * cm))

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
            Paragraph("<font color='white' size=13><b>0</b></font>", style_meta_label),
            Paragraph("<font color='white' size=13><b>0</b></font>", style_meta_label),
            Paragraph("<font color='white' size=13><b>2</b></font>", style_meta_label),
            Paragraph("<font color='white' size=13><b>2</b></font>", style_meta_label),
            Paragraph("<font color='white' size=13><b>6</b></font>", style_meta_label),
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
        ('PADDING', (0, 0), (-1, -1), 3.5),
    ]))
    story.append(kpi_table)
    story.append(Spacer(1, 0.3 * cm))

    story.append(Paragraph("2. Pontos Fortes e Riscos Centrais", style_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#E2E8F0"), spaceBefore=2, spaceAfter=6))
    story.append(Paragraph("<b>✅ Pontos Fortes Comprovados no Código:</b>", style_body_bold))
    
    fortes_data = [
        [
            Paragraph("<b>Controle / Proteção</b>", style_meta_label),
            Paragraph("<b>Evidência Técnica no Código</b>", style_meta_label),
            Paragraph("<b>Benefício de Segurança</b>", style_meta_label)
        ],
        [
            Paragraph("Proteção Anti-XXE em XML", style_body),
            Paragraph("<code>frontend/src/services/parsers/xmlParser.ts:11</code><br/><code>processEntities: false</code>", style_code),
            Paragraph("Elimina vetores de injeção de entidades externas e exfiltração de arquivos locais durante parsing de SBOMs XML.", style_body)
        ],
        [
            Paragraph("Detecção de Ciclos & Anti-DoS", style_body),
            Paragraph("<code>frontend/src/services/normalizer.ts:149-154</code><br/><code>visited: Set&lt;string&gt;</code> e <code>depth &gt; 32</code>", style_code),
            Paragraph("Impede travamento do navegador (Stack Overflow / DoS) em grafos de dependências maliciosos com ciclos infinitos.", style_body)
        ],
        [
            Paragraph("Proteção Prototype Pollution", style_body),
            Paragraph("<code>frontend/src/context/LanguageContext.tsx:48-56, 85-93</code>", style_code),
            Paragraph("Validação explícita de chaves <code>__proto__</code>, <code>constructor</code> e <code>prototype</code> no motor i18n.", style_body)
        ],
        [
            Paragraph("Privacidade Client-Side RAM", style_body),
            Paragraph("<code>frontend/src/store/useScaStore.ts:24-78</code>", style_code),
            Paragraph("Zero persistência de dados em nuvem. Os arquivos SBOM nunca saem da memória RAM do navegador do usuário.", style_body)
        ],
        [
            Paragraph("Hardening Container & Nginx", style_body),
            Paragraph("<code>frontend/Dockerfile:31</code> (<code>USER nginx</code>)<br/><code>frontend/nginx.conf:21-30</code>", style_code),
            Paragraph("Execução não-root e aplicação rigorosa de cabeçalhos HSTS, X-Frame-Options DENY, COOP, COEP e CORP.", style_body)
        ],
    ]
    fortes_table = Table(fortes_data, colWidths=[4.0 * cm, 6.0 * cm, 7.0 * cm])
    fortes_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#DCFCE7")),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor("#FFFFFF")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#86EFAC")),
        ('PADDING', (0, 0), (-1, -1), 3.5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(fortes_table)
    story.append(Spacer(1, 0.2 * cm))

    story.append(Paragraph("<b>⚠️ Riscos Centrais Identificados:</b>", style_body_bold))
    story.append(Paragraph(
        "1. <b>Uso desnecessário de <code>dangerouslySetInnerHTML</code>:</b> Renderização de metadados de pacotes e sanitização aberta de links no modal.<br/>"
        "2. <b>Jobs de CI/CD não bloqueantes (<code>allow_failure: true</code>):</b> Gitleaks não interrompe a esteira em caso de segredos commitados.<br/>"
        "3. <b>Diretiva <code>unsafe-inline</code> no CSP:</b> Relaxamento da proteção contra injeções de estilo CSS inline no Nginx.",
        style_body
    ))

    story.append(PageBreak())

    # =========================================================================
    # PÁGINA 3: TABELA DE ACHADOS DETALHADOS
    # =========================================================================
    story.append(Paragraph("3. Tabela de Achados Detalhados por Categoria", style_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#E2E8F0"), spaceBefore=2, spaceAfter=6))

    achados_data = [
        [
            Paragraph("<b>Sev.</b>", style_meta_label),
            Paragraph("<b>Categoria & Arquivo:Linha</b>", style_meta_label),
            Paragraph("<b>Descrição Técnica do Achado & Risco</b>", style_meta_label)
        ],
        [
            Paragraph("<font color='#D97706'><b>MÉDIA</b></font>", style_meta_label),
            Paragraph("<b>Cat 5: Inputs sem Tratamento (XSS)</b><br/><code>frontend/src/components/explorer/PackageDetailModal.tsx:167, 295, 309</code>", style_body),
            Paragraph(
                "<b>Uso indevido de dangerouslySetInnerHTML em dados textuais de pacotes:</b><br/>"
                "A linha 167 renderiza o grupo de pacotes via <code>dangerouslySetInnerHTML</code> interpolando a string com <code>t('details.group')</code>. Como o grupo é um identificador textual puro, não há justificativa técnica para renderização HTML.<br/>"
                "Além disso, a função <code>sanitizeText</code> (linhas 109-112) permite a tag <code>&lt;a&gt;</code> sem definir <code>ALLOWED_ATTR</code> explícito para <code>rel='noopener noreferrer'</code> e sem restringir esquemas de URI em links presentes em relatórios de CVE.",
                style_body
            )
        ],
        [
            Paragraph("<font color='#D97706'><b>MÉDIA</b></font>", style_meta_label),
            Paragraph("<b>Cat 4: Chaves Expostas / CI</b><br/><code>.gitlab/ci/security.gitlab-ci.yml:23, 34</code>", style_body),
            Paragraph(
                "<b>Esteira de CI/CD não-bloqueante para detecção de segredos e SAST:</b><br/>"
                "Os jobs <code>semgrep_sast_scan</code> e <code>gitleaks_secret_scan</code> estão configurados com <code>allow_failure: true</code>. Caso um desenvolvedor acidentalmente comite uma chave de API privada, token de acesso ou credencial em arquivos de configuração, o pipeline continuará a execução e realizará o deploy automatizado em produção sem interromper a esteira.",
                style_body
            )
        ],
        [
            Paragraph("<font color='#2563EB'><b>BAIXA</b></font>", style_meta_label),
            Paragraph("<b>Cat 5: Content Security Policy</b><br/><code>frontend/nginx.conf:30, 161</code>", style_body),
            Paragraph(
                "<b>CSP com diretiva style-src 'unsafe-inline':</b><br/>"
                "O cabeçalho <code>Content-Security-Policy</code> aplicado nas respostas HTTP do Nginx inclui <code>style-src 'self' 'unsafe-inline' https://fonts.googleapis.com</code>. O uso de <code>'unsafe-inline'</code> mitiga parcialmente o isolamento estrito contra injeções de atributos de estilo e exfiltração de dados via CSS em navegadores modernos.",
                style_body
            )
        ],
        [
            Paragraph("<font color='#475569'><b>INFO</b></font>", style_meta_label),
            Paragraph("<b>Cat 5: Resiliência de Parser</b><br/><code>frontend/src/services/parsers/jsonParser.ts:5</code>", style_body),
            Paragraph(
                "<b>Ausência de validação de tamanho de payload pré-parse JSON:</b><br/>"
                "O método <code>parseJsonSbom</code> executa diretamente <code>JSON.parse(content)</code>. Embora seguro contra injeção de código, arquivos JSON artificiais com dezenas de megabytes enviados ao Dropzone podem levar a alto consumo de heap e congelamento temporário da UI (Client-Side DoS).",
                style_body
            )
        ],
    ]
    achados_table = Table(achados_data, colWidths=[1.8 * cm, 5.6 * cm, 9.6 * cm])
    achados_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#E2E8F0")),
        ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor("#FEF3C7")),
        ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor("#FEF3C7")),
        ('BACKGROUND', (0, 3), (-1, 3), colors.HexColor("#EFF6FF")),
        ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor("#F8FAFC")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('PADDING', (0, 0), (-1, -1), 4.5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(achados_table)

    story.append(PageBreak())

    # =========================================================================
    # PÁGINA 4: RECOMENDAÇÕES PRIORIZADAS & ISSUES 1
    # =========================================================================
    story.append(Paragraph("4. Recomendações Priorizadas de Remediação", style_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#E2E8F0"), spaceBefore=2, spaceAfter=6))

    recs_data = [
        [Paragraph("<b>Prioridade</b>", style_meta_label), Paragraph("<b>Ação Recomendada</b>", style_meta_label), Paragraph("<b>Impacto e Justificativa</b>", style_meta_label)],
        [
            Paragraph("<font color='#DC2626'><b>P1 (Alta)</b></font>", style_body),
            Paragraph("<b>Eliminar dangerouslySetInnerHTML em metadados de grupo e endurecer DOMPurify</b><br/>Substituir a linha 167 de <code>PackageDetailModal.tsx</code> por renderização JSX pura <code>{t('details.group')}: {component.group}</code> e configurar <code>ALLOWED_ATTR: ['href', 'target', 'rel']</code> com hook forçando <code>rel='noopener noreferrer'</code>.", style_body),
            Paragraph("Elimina qualquer risco de parsing inconsistente no DOM e bloqueia abertura insegura de links de CVEs em novas abas.", style_body)
        ],
        [
            Paragraph("<font color='#DC2626'><b>P1 (Alta)</b></font>", style_body),
            Paragraph("<b>Bloquear esteira de CI/CD na detecção de segredos (Gitleaks)</b><br/>Remover <code>allow_failure: true</code> do job <code>gitleaks_secret_scan</code> em <code>.gitlab/ci/security.gitlab-ci.yml</code>.", style_body),
            Paragraph("Garante que nenhum token de acesso ou segredo commitado acidentalmente seja publicado no ambiente de produção.", style_body)
        ],
        [
            Paragraph("<font color='#D97706'><b>P2 (Média)</b></font>", style_body),
            Paragraph("<b>Refinamento de CSP no Nginx</b><br/>Remover <code>'unsafe-inline'</code> da diretiva <code>style-src</code> em <code>nginx.conf</code> ou migrar estilos inline para classes Tailwind utilitárias compiladas no build.", style_body),
            Paragraph("Fortalece a proteção contra injeções de estilo e CSS exfiltration.", style_body)
        ],
        [
            Paragraph("<font color='#2563EB'><b>P3 (Baixa)</b></font>", style_body),
            Paragraph("<b>Limite de tamanho de arquivo no Dropzone</b><br/>Adicionar validação em <code>Dropzone.tsx</code> limitando arquivos a 50MB antes da leitura pelo FileReader.", style_body),
            Paragraph("Previne exaustão de memória da aba do navegador em arquivos anômalos.", style_body)
        ],
    ]
    recs_table = Table(recs_data, colWidths=[2.2 * cm, 8.8 * cm, 6.0 * cm])
    recs_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#E2E8F0")),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor("#FFFFFF")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('PADDING', (0, 0), (-1, -1), 4.5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(recs_table)
    story.append(Spacer(1, 0.4 * cm))

    story.append(Paragraph("5. Issues para o GitHub (Prontas para Criação)", style_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#E2E8F0"), spaceBefore=2, spaceAfter=6))
    story.append(Paragraph(
        "Abaixo estão os textos completos formatados em Markdown para abertura direta das issues de remediação de segurança no repositório. As issues estão prontas para cópia e cola:",
        style_body
    ))

    def create_issue_table(issue_text):
        formatted_html = format_markdown_issue(issue_text)
        p = Paragraph(formatted_html, style_issue_box)
        t = Table([[p]], colWidths=[17.0 * cm])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
            ('BOX', (0, 0), (-1, -1), 0.75, colors.HexColor("#94A3B8")),
            ('PADDING', (0, 0), (-1, -1), 5.5),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        return t

    # ISSUE 1
    issue1_md = """--- ISSUE 1 ---
**Título:** [Segurança] Remover dangerouslySetInnerHTML em metadados de pacotes e restringir atributos no DOMPurify
**Labels:** security, severity:medium, bug, frontend

### 📋 Descrição do Problema
Em `frontend/src/components/explorer/PackageDetailModal.tsx`, a propriedade `component.group` é renderizada utilizando `dangerouslySetInnerHTML`. Como o grupo é uma sequência alfanumérica de identificação (ex: `org.apache.commons`), não há necessidade de renderização via HTML. Além disso, a configuração do `DOMPurify.sanitize` permite a tag `<a>` sem restringir explicitamente atributos permitidos e sem forçar `rel="noopener noreferrer"`.

### 🔍 Evidência no Código
Arquivo: `frontend/src/components/explorer/PackageDetailModal.tsx`
- Linha 167:
  `<p className="text-xs text-slate-400 font-mono" dangerouslySetInnerHTML={{ __html: `${t('details.group')}: ${sanitizeText(component.group)}` }} />`
- Linhas 109-112:
  `const sanitizeText = (text?: string): string => {`
  `  if (!text) return '';`
  `  return DOMPurify.sanitize(text, { ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'code', 'p', 'br', 'a'] });`
  `};`

### 💥 Impacto
Possibilidade de renderização de links manipulados em descrições de vulnerabilidades e risco de anomalias no parsing de strings do DOM.

### 🛠️ Sugestão de Correção
1. Substituir a linha 167 por:
   `{component.group && <p className="text-xs text-slate-400 font-mono">{t('details.group')}: {component.group}</p>}`
2. Ajustar `sanitizeText` para:
   `DOMPurify.sanitize(text, { ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'code', 'p', 'br'], ALLOWED_ATTR: [] });`

### ✅ Critérios de Aceite
- [ ] O campo `component.group` é renderizado via JSX sem `dangerouslySetInnerHTML`.
- [ ] A sanitização de CVEs não permite injeção de links não autorizados sem atributos de segurança.
- [ ] Todos os testes unitários (`npm test`) continuam passando (74/74).
--- FIM ISSUE 1 ---"""

    story.append(Spacer(1, 0.2 * cm))
    story.append(create_issue_table(issue1_md))

    story.append(PageBreak())

    # =========================================================================
    # PÁGINA 5: ISSUES 2, 3 e 4
    # =========================================================================
    # ISSUE 2
    issue2_md = """--- ISSUE 2 ---
**Título:** [Segurança] Bloquear pipeline de CI/CD na detecção de segredos (Gitleaks)
**Labels:** security, severity:medium, devsecops, ci/cd

### 📋 Descrição do Problema
O job `gitleaks_secret_scan` em `.gitlab/ci/security.gitlab-ci.yml` está configurado com `allow_failure: true`. Caso credenciais reais sejam acidentalmente commitadas no repositório, o pipeline do GitLab CI não é bloqueado, permitindo que a imagem Docker seja gerada e o deploy em produção seja executado.

### 🔍 Evidência no Código
Arquivo: `.gitlab/ci/security.gitlab-ci.yml` (Linhas 24-35)
```yaml
gitleaks_secret_scan:
  stage: security-scan
  image:
    name: zricethezav/gitleaks:latest
    entrypoint: [""]
  script:
    - gitleaks detect --source . --verbose --report-path gitleaks-report.json
  artifacts:
    name: gitleaks-report
    paths:
      - gitleaks-report.json
    expire_in: 1 week
    when: always
  allow_failure: true
```

### 💥 Impacto
Publicação inadvertida de segredos em produção ou vazamento contínuo de credenciais no repositório sem alerta bloqueante.

### 🛠️ Sugestão de Correção
Remover `allow_failure: true` do job `gitleaks_secret_scan` e configurar arquivo `.gitleaksignore` para exceções pontuais documentadas caso necessário.

### ✅ Critérios de Aceite
- [ ] `allow_failure: true` removido do job `gitleaks_secret_scan`.
- [ ] Commit com segredo de teste falha no pipeline de CI/CD e aborta estágios subsequentes.
- [ ] Pipeline passa com sucesso em código limpo sem segredos.
--- FIM ISSUE 2 ---"""

    story.append(create_issue_table(issue2_md))
    story.append(Spacer(1, 0.3 * cm))

    # ISSUE 3 & 4
    issue3_4_md = """--- ISSUE 3 ---
**Título:** [Segurança] Endurecimento do Content-Security-Policy (CSP) no Nginx
**Labels:** security, severity:low, infrastructure, nginx

### 📋 Descrição do Problema
O arquivo `frontend/nginx.conf` possui a diretiva `'unsafe-inline'` na propriedade `style-src` do cabeçalho `Content-Security-Policy`.

### 🔍 Evidência no Código
Arquivo: `frontend/nginx.conf` (Linhas 30 e 161)
`add_header Content-Security-Policy "default-src 'self'; ... style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; ..." always;`

### 💥 Impacto
Permite a injeção e execução de estilos CSS inline caso ocorra alguma vulnerabilidade secundária de injeção de HTML.

### 🛠️ Sugestão de Correção
Remover a necessidade de `'unsafe-inline'` migrando estilos dinâmicos para classes utilitárias ou configurando hash sha256 específico para folhas de estilo inline essenciais.

### ✅ Critérios de Aceite
- [ ] Diretiva `style-src` endurecida no `nginx.conf`.
- [ ] Nginx recarregado com configuração válida e sem erros no console do navegador.
--- FIM ISSUE 3 ---

--- ISSUE 4 ---
**Título:** [Segurança] Limitação de tamanho de payload no Dropzone para prevenção de DoS client-side
**Labels:** security, severity:low, frontend, performance

### 📋 Descrição do Problema
Em `frontend/src/components/landing/Dropzone.tsx`, não há verificação do tamanho do arquivo antes de executar a leitura em memória com `FileReader` e o parsing JSON/XML.

### 🔍 Evidência no Código
Arquivo: `frontend/src/components/landing/Dropzone.tsx` (Linhas 47-74)

### 💥 Impacto
Arquivos excessivamente volumosos (>100MB) podem exaurir a memória da aba do navegador, causando travamento da interface.

### 🛠️ Sugestão de Correção
Adicionar validação `if (file.size > 50 * 1024 * 1024) { setError('Arquivo excede o tamanho máximo de 50MB.'); return; }` no método `handleFileSelect`.

### ✅ Critérios de Aceite
- [ ] Arquivos maiores que 50MB são rejeitados com mensagem clara antes do FileReader.
- [ ] Arquivos válidos normais continuam sendo processados sem impacto.
--- FIM ISSUE 4 ---"""

    story.append(create_issue_table(issue3_4_md))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Relatório gerado com sucesso em: {pdf_path}")


if __name__ == '__main__':
    base_dir = os.path.dirname(os.path.abspath(__file__))
    output_pdf = os.path.join(base_dir, "relatorio-auditoria-seguranca.pdf")
    build_pdf_report(output_pdf, base_dir)
