import { ScaSbomModel, ScaComponent, ScaLicense, ScaVulnerability } from '../models/sca';
import { parseXmlSbom } from './parsers/xmlParser';
import { parseJsonSbom } from './parsers/jsonParser';

function toArray<T>(val: T | T[] | undefined | null): T[] {
  if (val === undefined || val === null) return [];
  if (Array.isArray(val)) return val;
  return [val];
}

export function parseAndNormalizeSbom(content: string, filename: string): ScaSbomModel {
  const isXml = filename.toLowerCase().endsWith('.xml') || content.trim().startsWith('<');
  let rawData: any;

  if (isXml) {
    rawData = parseXmlSbom(content);
  } else {
    rawData = parseJsonSbom(content);
  }

  // Extract root component metadata
  const rootComp = rawData?.metadata?.component || rawData?.bom?.metadata?.component || {};
  const rootRef = rootComp['@_bom-ref'] || rootComp['bom-ref'] || rootComp.purl || 'root';
  const rootName = rootComp.name || filename.replace(/\.(json|xml)$/i, '');
  const rootVersion = rootComp.version || '1.0.0';
  const specVersion = String(rawData['@_specVersion'] || rawData.specVersion || '1.4');

  const componentsMap = new Map<string, ScaComponent>();
  const dependenciesGraph = new Map<string, string[]>();
  const vulnerabilitiesList: ScaVulnerability[] = [];

  // 1. Extract raw components
  const rawComponents = toArray(rawData?.components?.component || rawData?.components);

  for (const c of rawComponents) {
    if (!c || typeof c !== 'object') continue;

    const ref = c['@_bom-ref'] || c['bom-ref'] || c.purl || `${c.name}@${c.version || '0.0.0'}`;
    
    // Ignore root component if it's included in components list to avoid duplication
    if (ref === rootRef) continue;

    // Extract licenses
    const licenses: ScaLicense[] = [];
    const rawLicList = toArray(c.licenses?.license || c.licenses);

    for (const licItem of rawLicList) {
      if (!licItem) continue;
      const licObj = licItem?.license || licItem;
      const id = licObj?.id || licItem?.expression || licObj?.name || 'Unknown';
      const name = licObj?.name || id;
      const type = isCopyleft(id) ? 'copyleft' : isPermissive(id) ? 'permissive' : 'unknown';
      licenses.push({ id, name, type });
    }

    componentsMap.set(ref, {
      bomRef: ref,
      name: c.name || 'Unnamed Component',
      version: c.version || '0.0.0',
      purl: c.purl,
      group: c.group,
      isDirect: false,
      depth: 0,
      licenses,
      vulnerabilities: [],
      ancestorRefs: [],
    });
  }

  // 2. Extract dependencies graph
  const rawDeps = toArray(rawData?.dependencies?.dependency || rawData?.dependencies);

  for (const dep of rawDeps) {
    if (!dep || typeof dep !== 'object') continue;
    const ref = dep['@_ref'] || dep.ref || dep['bom-ref'];
    if (!ref) continue;

    const dependsOnList = toArray(dep.dependency || dep.dependsOn);
    const normalizedDependsOn = dependsOnList
      .map((d: any) => {
        if (typeof d === 'string') return d;
        return d?.['@_ref'] || d?.ref || d?.['bom-ref'] || null;
      })
      .filter((d): d is string => Boolean(d));

    dependenciesGraph.set(ref, normalizedDependsOn);
  }

  // 3. Extract vulnerabilities
  const rawVuls = toArray(rawData?.vulnerabilities?.vulnerability || rawData?.vulnerabilities);

  for (const v of rawVuls) {
    if (!v || typeof v !== 'object') continue;
    const id = v.id || v['@_id'] || 'UNKNOWN-CVE';
    
    // Ratings
    const rawRatings = toArray(v.ratings?.rating || v.ratings);
    const primaryRating = rawRatings[0] || {};
    const severityStr = String(primaryRating.severity || v.severity || 'info').toLowerCase();
    
    let severity: ScaVulnerability['severity'] = 'info';
    if (['critical', 'high', 'medium', 'low', 'info'].includes(severityStr)) {
      severity = severityStr as ScaVulnerability['severity'];
    }

    const cvssScore = typeof primaryRating.score === 'number' ? primaryRating.score : undefined;
    const description = v.description || v.detail;
    const recommendation = v.recommendation;

    // Affected target refs
    const rawAffects = toArray(v.affects?.target || v.affects);
    const affectsRefs = rawAffects
      .map((a: any) => (typeof a === 'string' ? a : a?.['@_ref'] || a?.ref || null))
      .filter((a): a is string => Boolean(a));

    const affectsBomRef = affectsRefs[0] || rootRef;

    const vuln: ScaVulnerability = {
      id,
      severity,
      cvssScore,
      description,
      affectsBomRef,
      recommendation,
    };

    vulnerabilitiesList.push(vuln);

    // Attach vulnerability to affected component
    const affectedComp = componentsMap.get(affectsBomRef);
    if (affectedComp) {
      affectedComp.vulnerabilities.push(vuln);
    }
  }

  // 4. DFS Graph Traversal with Cycle Detection & Depth Tracking
  let maxTreeDepth = 0;
  const directRefs = dependenciesGraph.get(rootRef) || [];

  function traverse(currentRef: string, depth: number, ancestors: string[], visited: Set<string>) {
    // Prevent cycles in active branch & cap depth to 32
    if (visited.has(currentRef) || depth > 32) {
      return;
    }
    visited.add(currentRef);

    const comp = componentsMap.get(currentRef);
    if (comp) {
      // Update depth if not set or if a shorter path is found
      if (comp.depth === 0 || depth < comp.depth) {
        comp.depth = depth;
        comp.isDirect = depth === 1;
        comp.ancestorRefs = ancestors;
      }
      if (comp.depth > maxTreeDepth) {
        maxTreeDepth = comp.depth;
      }
    }

    const children = dependenciesGraph.get(currentRef) || [];
    for (const childRef of children) {
      traverse(childRef, depth + 1, [...ancestors, currentRef], new Set(visited));
    }
  }

  for (const directRef of directRefs) {
    traverse(directRef, 1, [rootRef], new Set());
  }

  // Fallback for components not reached via rootRef (e.g. unlinked or missing root dependency entry)
  componentsMap.forEach((comp) => {
    if (comp.depth === 0) {
      // Check if it is listed as direct in dependencies without root entry
      comp.depth = 1;
      comp.isDirect = true;
      comp.ancestorRefs = [rootRef];
      if (maxTreeDepth === 0) maxTreeDepth = 1;
    }
  });

  // 5. Calculate summary metrics
  let directCount = 0;
  let transitiveCount = 0;
  let permissiveCount = 0;
  let copyleftCount = 0;
  let unknownLicCount = 0;

  componentsMap.forEach((comp) => {
    if (comp.isDirect) directCount++;
    else transitiveCount++;

    for (const lic of comp.licenses) {
      if (lic.type === 'permissive') permissiveCount++;
      else if (lic.type === 'copyleft') copyleftCount++;
      else unknownLicCount++;
    }
  });

  const vulnerabilityCounts = {
    critical: vulnerabilitiesList.filter((v) => v.severity === 'critical').length,
    high: vulnerabilitiesList.filter((v) => v.severity === 'high').length,
    medium: vulnerabilitiesList.filter((v) => v.severity === 'medium').length,
    low: vulnerabilitiesList.filter((v) => v.severity === 'low').length,
  };

  const licenseBreakdown = {
    permissive: permissiveCount,
    copyleft: copyleftCount,
    unknown: unknownLicCount,
  };

  // Simple initial rating calculation
  const cvePenalty = vulnerabilityCounts.critical * 25 + vulnerabilityCounts.high * 10 + vulnerabilityCounts.medium * 3;
  const licensePenalty = copyleftCount * 5;
  const healthScore = Math.max(0, 100 - cvePenalty - licensePenalty);

  let securityGrade: ScaSbomModel['summary']['securityGrade'] = 'A+';
  if (healthScore < 40) securityGrade = 'F';
  else if (healthScore < 60) securityGrade = 'D';
  else if (healthScore < 75) securityGrade = 'C';
  else if (healthScore < 85) securityGrade = 'B';
  else if (healthScore < 95) securityGrade = 'A';

  return {
    metadata: {
      componentName: rootName,
      componentVersion: rootVersion,
      specVersion,
      format: isXml ? 'xml' : 'json',
    },
    components: componentsMap,
    dependenciesGraph,
    vulnerabilities: vulnerabilitiesList,
    summary: {
      totalComponents: componentsMap.size,
      directComponentsCount: directCount,
      transitiveComponentsCount: transitiveCount,
      maxTreeDepth,
      vulnerabilityCounts,
      licenseBreakdown,
      scaHealthScore: healthScore,
      securityGrade,
    },
  };
}

function isCopyleft(licenseId: string): boolean {
  const upper = licenseId.toUpperCase();
  return (
    upper.includes('GPL') ||
    upper.includes('AGPL') ||
    upper.includes('MPL') ||
    upper.includes('EUPL') ||
    upper.includes('LGPL') ||
    upper.includes('CC-BY-SA')
  );
}

function isPermissive(licenseId: string): boolean {
  const upper = licenseId.toUpperCase();
  return (
    upper.includes('MIT') ||
    upper.includes('APACHE') ||
    upper.includes('BSD') ||
    upper.includes('ISC') ||
    upper.includes('UNLICENSE') ||
    upper.includes('WTFPL') ||
    upper.includes('CC0')
  );
}
