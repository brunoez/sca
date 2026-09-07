import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const PORT = 9222;
const URL = 'https://sca.brunoizidorio.com.br';
const OUTPUT_DIR = path.resolve('docs/screenshots');

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class CdpClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();

    this.ready = new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && this.callbacks.has(data.id)) {
        const { resolve, reject } = this.callbacks.get(data.id);
        this.callbacks.delete(data.id);
        if (data.error) reject(data.error);
        else resolve(data.result);
      }
    };
  }

  send(method, params = {}) {
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    return res.result?.value;
  }

  async click(selector) {
    const res = await this.eval(`(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return false;
      el.scrollIntoView({ block: 'center' });
      el.click();
      return true;
    })()`);
    return res;
  }

  async screenshot(outputPath) {
    const res = await this.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
    });
    const buffer = Buffer.from(res.data, 'base64');
    fs.writeFileSync(outputPath, buffer);
    console.log(`Saved screenshot: ${outputPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
  }

  close() {
    this.ws.close();
  }
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log('Launching headless Chrome...');
  const chrome = spawn('google-chrome', [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--no-sandbox',
    '--disable-gpu',
    '--window-size=1600,1050',
    '--hide-scrollbars',
    '--force-device-scale-factor=1.25',
    'about:blank'
  ], { stdio: 'ignore' });

  try {
    await wait(2000);

    console.log(`Navigating to ${URL}...`);
    const newTabRes = await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(URL)}`, { method: 'PUT' });
    const tabInfo = await newTabRes.json();
    console.log('Connected to tab:', tabInfo.title, tabInfo.webSocketDebuggerUrl);

    const client = new CdpClient(tabInfo.webSocketDebuggerUrl);
    await client.ready;

    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('DOM.enable');

    console.log('Waiting for landing page to render...');
    await wait(3500);

    // 1. Landing page
    await client.screenshot(path.join(OUTPUT_DIR, '01-landing-page.png'));

    // 2. Load OWASP Juice Shop sample
    console.log('Loading OWASP Juice Shop sample...');
    await client.click('[data-testid="sample-juiceshop-button"]');
    await wait(4000); // Allow calculations and Recharts transitions

    // 2. Executive Dashboard (Top: Health Rating & Scorecard)
    await client.screenshot(path.join(OUTPUT_DIR, '02-executive-dashboard.png'));

    // Scroll to Analytics & Quick Wins
    await client.eval(`window.scrollTo({ top: 900, behavior: 'instant' })`);
    await wait(1500);
    await client.screenshot(path.join(OUTPUT_DIR, '03-analytics-remediation.png'));
    await client.eval(`window.scrollTo({ top: 0, behavior: 'instant' })`);
    await wait(500);

    // 3. Tab: 2D Dependency Graph
    console.log('Switching to 2D Graph tab...');
    await client.click('[data-testid="tab-graph"]');
    await wait(3500);
    await client.screenshot(path.join(OUTPUT_DIR, '04-dependency-graph.png'));

    // Open Package Details / Vulnerability modal
    console.log('Opening package detail modal on a vulnerable node...');
    await client.eval(`(() => {
      const nodes = Array.from(document.querySelectorAll('.react-flow__node'));
      const target = nodes.find(n => n.textContent.includes('body-parser')) || nodes[nodes.length - 1];
      if (target) target.click();
    })()`);
    await wait(2000);
    await client.screenshot(path.join(OUTPUT_DIR, '05-package-modal.png'));

    // Close modal
    console.log('Closing modal...');
    await client.eval(`(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const closeBtn = buttons.find(b => b.textContent.includes('Fechar') || b.textContent.includes('Close'));
      if (closeBtn) closeBtn.click();
    })()`);
    await wait(1000);

    // 4. Tab: Tree View
    console.log('Switching to Tree View tab...');
    await client.click('[data-testid="tab-tree"]');
    await wait(2000);
    // Click "Expandir Todos"
    await client.eval(`(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const expandBtn = buttons.find(b => b.textContent.includes('Expandir Todos') || b.textContent.includes('Expand All'));
      if (expandBtn) expandBtn.click();
    })()`);
    await wait(2000);
    await client.screenshot(path.join(OUTPUT_DIR, '06-tree-view.png'));

    // 5. Tab: Component Explorer
    console.log('Switching to Component Explorer tab...');
    await client.click('[data-testid="tab-explorer"]');
    await wait(2000);
    await client.screenshot(path.join(OUTPUT_DIR, '07-package-explorer.png'));

    client.close();
    console.log('All screenshots captured successfully!');
  } finally {
    chrome.kill('SIGKILL');
  }
}

main().catch((err) => {
  console.error('Error taking screenshots:', err);
  process.exit(1);
});
