/**
 * Parses JSON CycloneDX content.
 */
export function parseJsonSbom(content: string): any {
  return JSON.parse(content);
}
