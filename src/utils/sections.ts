import { SESSION_SECTIONS, ASSESSMENT_SECTIONS } from './responseProcessor/constants';
import type { NoteSection } from '../types';

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function parseSections(content: string, isAssessment: boolean): NoteSection[] {
  const sections = isAssessment ? ASSESSMENT_SECTIONS : SESSION_SECTIONS;
  const result: NoteSection[] = [];

  sections.forEach((heading, index) => {
    const escapedHeading = escapeRegExp(heading);
    const nextHeading = sections[index + 1] ? escapeRegExp(sections[index + 1]) : null;
    
    const startRegex = new RegExp(`${escapedHeading}:\\s*`);
    const endRegex = nextHeading
      ? new RegExp(`\\s*${nextHeading}:`)
      : new RegExp('\\s*$');

    const startMatch = content.match(startRegex);
    if (startMatch) {
      const startIndex = startMatch.index! + startMatch[0].length;
      const remainingContent = content.slice(startIndex);
      const endMatch = remainingContent.match(endRegex);
      const endIndex = endMatch
        ? startIndex + endMatch.index!
        : content.length;

      const sectionContent = content
        .slice(startIndex, endIndex)
        .trim()
        .replace(/\n{3,}/g, '\n\n');

      if (sectionContent) {
        result.push({
          id: heading.toLowerCase().replace(/\s+/g, '-'),
          heading,
          content: sectionContent,
          isProcessing: false
        });
      }
    }
  });

  return result;
}