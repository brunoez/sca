import { XMLParser } from 'fast-xml-parser';

/**
 * Parses XML CycloneDX content securely.
 * CRITICAL SECURITY: processEntities must be false to mitigate XXE vulnerabilities.
 */
export function parseXmlSbom(content: string): any {
  const xmlParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    processEntities: false, // Security: Disable entity expansion (XXE mitigation)
  });
  const parsed = xmlParser.parse(content);
  return parsed.bom || parsed;
}
