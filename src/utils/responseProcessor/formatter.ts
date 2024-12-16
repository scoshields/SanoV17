import { SESSION_SECTIONS, ASSESSMENT_SECTIONS } from './constants';

function standardizeLineBreaks(content: string): string {
  return content
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{2,}/g, '\n\n')
    .trim();
}

function formatSection(section: string): string {
  return section
    .replace(/^\s+|\s+$/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\[\s*|\s*\]/g, '')
    .replace(/\n{2,}/g, '\n\n')
    .trim();
}

export function formatResponse(content: string, isAssessment: boolean): string {
  let formattedContent = standardizeLineBreaks(content);
  const sections = isAssessment ? ASSESSMENT_SECTIONS : SESSION_SECTIONS;
  const result: string[] = [];

  // Format each section with proper spacing
  sections.forEach(sectionHeader => {
    const sectionRegex = new RegExp(
      `${sectionHeader}:([^]*?)(?=${sections.map(s => `${s}:`).join('|')}|$)`,
      'i'
    );

    const match = formattedContent.match(sectionRegex);
    if (match) {
      const sectionContent = formatSection(match[1]);
      result.push(`${sectionHeader}:\n${sectionContent}`);
    }
  });

  // Join sections with consistent spacing
  return result.join('\n\n\n');
}