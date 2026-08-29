import { describe, it, expect } from 'vitest';
import { parseAndNormalizeSbom } from '../normalizer';

describe('parseAndNormalizeSbom', () => {
  it('should parse valid CycloneDX JSON and calculate dependency depth', () => {
    // Arrange
    const sampleJson = JSON.stringify({
      bomFormat: 'CycloneDX',
      specVersion: '1.4',
      metadata: {
        component: { name: 'my-app', version: '1.0.0', type: 'application', 'bom-ref': 'root' },
      },
      components: [
        {
          name: 'express',
          version: '4.18.2',
          type: 'library',
          'bom-ref': 'pkg:npm/express@4.18.2',
          licenses: [{ license: { id: 'MIT' } }],
        },
        {
          name: 'qs',
          version: '6.11.0',
          type: 'library',
          'bom-ref': 'pkg:npm/qs@6.11.0',
          licenses: [{ license: { id: 'BSD-3-Clause' } }],
        },
      ],
      dependencies: [
        { ref: 'root', dependsOn: ['pkg:npm/express@4.18.2'] },
        { ref: 'pkg:npm/express@4.18.2', dependsOn: ['pkg:npm/qs@6.11.0'] },
      ],
    });

    // Act
    const model = parseAndNormalizeSbom(sampleJson, 'sbom.json');

    // Assert
    expect(model.metadata.componentName).toBe('my-app');
    expect(model.metadata.format).toBe('json');
    expect(model.summary.totalComponents).toBe(2);
    expect(model.summary.directComponentsCount).toBe(1); // express is direct
    expect(model.summary.transitiveComponentsCount).toBe(1); // qs is transitive
    expect(model.summary.maxTreeDepth).toBe(2);

    const expressNode = model.components.get('pkg:npm/express@4.18.2');
    expect(expressNode?.isDirect).toBe(true);
    expect(expressNode?.depth).toBe(1);

    const qsNode = model.components.get('pkg:npm/qs@6.11.0');
    expect(qsNode?.isDirect).toBe(false);
    expect(qsNode?.depth).toBe(2);
    expect(qsNode?.ancestorRefs).toEqual(['root', 'pkg:npm/express@4.18.2']);
  });

  it('should handle cyclic dependency graphs without infinite recursion', () => {
    // Arrange
    const cyclicJson = JSON.stringify({
      bomFormat: 'CycloneDX',
      specVersion: '1.4',
      metadata: { component: { name: 'cyclic-app', version: '1.0.0', 'bom-ref': 'root' } },
      components: [
        { name: 'lib-a', version: '1.0.0', 'bom-ref': 'node-a' },
        { name: 'lib-b', version: '1.0.0', 'bom-ref': 'node-b' },
      ],
      dependencies: [
        { ref: 'root', dependsOn: ['node-a'] },
        { ref: 'node-a', dependsOn: ['node-b'] },
        { ref: 'node-b', dependsOn: ['node-a'] }, // Cycle: node-a -> node-b -> node-a
      ],
    });

    // Act
    const model = parseAndNormalizeSbom(cyclicJson, 'cyclic.json');

    // Assert
    expect(model.summary.totalComponents).toBe(2);
    expect(model.components.get('node-a')?.depth).toBe(1);
    expect(model.components.get('node-b')?.depth).toBe(2);
  });

  it('should parse valid CycloneDX XML securely and handle attributes', () => {
    // Arrange
    const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
    <bom xmlns="http://cyclonedx.org/schema/bom/1.4" version="1">
      <metadata>
        <component bom-ref="root" type="application">
          <name>xml-app</name>
          <version>2.0.0</version>
        </component>
      </metadata>
      <components>
        <component bom-ref="pkg:npm/react@18.2.0">
          <name>react</name>
          <version>18.2.0</version>
          <licenses>
            <license>
              <id>MIT</id>
            </license>
          </licenses>
        </component>
        <component bom-ref="pkg:npm/loose-envify@1.4.0">
          <name>loose-envify</name>
          <version>1.4.0</version>
          <licenses>
            <license>
              <id>MIT</id>
            </license>
          </licenses>
        </component>
      </components>
      <dependencies>
        <dependency ref="root">
          <dependency ref="pkg:npm/react@18.2.0"/>
        </dependency>
        <dependency ref="pkg:npm/react@18.2.0">
          <dependency ref="pkg:npm/loose-envify@1.4.0"/>
        </dependency>
      </dependencies>
    </bom>`;

    // Act
    const model = parseAndNormalizeSbom(sampleXml, 'sbom.xml');

    // Assert
    expect(model.metadata.componentName).toBe('xml-app');
    expect(model.metadata.format).toBe('xml');
    expect(model.summary.totalComponents).toBe(2);

    const reactComp = model.components.get('pkg:npm/react@18.2.0');
    expect(reactComp?.isDirect).toBe(true);
    expect(reactComp?.depth).toBe(1);

    const looseEnvifyComp = model.components.get('pkg:npm/loose-envify@1.4.0');
    expect(looseEnvifyComp?.isDirect).toBe(false);
    expect(looseEnvifyComp?.depth).toBe(2);
  });

  it('should extract vulnerabilities and attach them to affected components', () => {
    // Arrange
    const jsonWithVuln = JSON.stringify({
      bomFormat: 'CycloneDX',
      specVersion: '1.4',
      metadata: { component: { name: 'vuln-app', version: '1.0.0', 'bom-ref': 'root' } },
      components: [
        { name: 'lodash', version: '4.17.15', 'bom-ref': 'pkg:npm/lodash@4.17.15' },
      ],
      dependencies: [
        { ref: 'root', dependsOn: ['pkg:npm/lodash@4.17.15'] },
      ],
      vulnerabilities: [
        {
          id: 'CVE-2020-8203',
          ratings: [{ severity: 'high', score: 7.4 }],
          description: 'Prototype pollution in lodash',
          affects: [{ ref: 'pkg:npm/lodash@4.17.15' }],
        },
      ],
    });

    // Act
    const model = parseAndNormalizeSbom(jsonWithVuln, 'vuln.json');

    // Assert
    expect(model.vulnerabilities.length).toBe(1);
    expect(model.vulnerabilities[0].id).toBe('CVE-2020-8203');
    expect(model.summary.vulnerabilityCounts.high).toBe(1);

    const lodash = model.components.get('pkg:npm/lodash@4.17.15');
    expect(lodash?.vulnerabilities.length).toBe(1);
    expect(lodash?.vulnerabilities[0].id).toBe('CVE-2020-8203');
  });

  it('should categorize licenses into copyleft, permissive, and unknown', () => {
    // Arrange
    const jsonWithLicenses = JSON.stringify({
      bomFormat: 'CycloneDX',
      specVersion: '1.4',
      metadata: { component: { name: 'license-app', version: '1.0.0', 'bom-ref': 'root' } },
      components: [
        { name: 'lib-mit', version: '1.0.0', 'bom-ref': 'mit', licenses: [{ license: { id: 'MIT' } }] },
        { name: 'lib-gpl', version: '1.0.0', 'bom-ref': 'gpl', licenses: [{ license: { id: 'GPL-3.0-only' } }] },
        { name: 'lib-custom', version: '1.0.0', 'bom-ref': 'custom', licenses: [{ license: { name: 'Proprietary' } }] },
      ],
      dependencies: [
        { ref: 'root', dependsOn: ['mit', 'gpl', 'custom'] },
      ],
    });

    // Act
    const model = parseAndNormalizeSbom(jsonWithLicenses, 'licenses.json');

    // Assert
    expect(model.summary.licenseBreakdown.permissive).toBe(1);
    expect(model.summary.licenseBreakdown.copyleft).toBe(1);
    expect(model.summary.licenseBreakdown.unknown).toBe(1);
  });
});
