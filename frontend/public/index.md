# 🛡️ CycloneDX SCA Visualizer & Dependency Tree Platform

> **Client-Side Software Supply Chain Security Analysis and Interactive 2D Graph Visualizer**

## Overview

The **CycloneDX SCA Visualizer** is a 100% client-side privacy-first web application for analyzing CycloneDX Software Bill of Materials (SBOM) files in JSON and XML formats (v1.2 through v1.6).

All parsing, cycle detection, topological dependency graph rendering, security rating calculation, and license audits occur entirely inside the user's local browser memory (RAM). Zero data is transmitted to external servers.

## Key Capabilities & Architecture

- **Ingestion Engine**: Supports Drag & Drop or sample loading of CycloneDX JSON and XML SBOMs.
- **Topological 2D Graph (React Flow + Dagre)**: Interactive node-link dependency graph with automated LR layout, MiniMap, and ancestral Impact Path tracing.
- **Hierarchical Collapsible Tree (TreeView)**: Nested tree view displaying deep dependency hierarchies.
- **SCA Security Rating (0–100 & Grades A+ to F)**:
  - Transparent 1-to-1 linear deduction formula: `Final Score = Math.max(0, 100 - Total Penalties)`
  - Penalties: Critical CVE (-15 pts), High CVE (-6 pts), Medium CVE (-2 pts), Low CVE (-0.5 pts), Copyleft License (-5 pts, max 30), Unknown License (-0.05 pts, max 5).
  - 3-Tier Risk Classification: 🟢 Low Risk (>=85), 🟡 Moderate Risk (70–84), 🔴 High Risk (<70).
- **Remediation Quick Wins**: ROI algorithm highlighting direct dependencies responsible for transitive vulnerability cascades.

## Agent Discovery & Integration

- **Sitemap**: `https://sca.brunoizidorio.com.br/sitemap.xml`
- **API Catalog**: `https://sca.brunoizidorio.com.br/.well-known/api-catalog`
- **Agent Skills**: `https://sca.brunoizidorio.com.br/.well-known/agent-skills/index.json`
- **MCP Server Card**: `https://sca.brunoizidorio.com.br/.well-known/mcp/server-card.json`
- **WebMCP**: Native in-browser tool registration via `navigator.modelContext.provideContext()`.
