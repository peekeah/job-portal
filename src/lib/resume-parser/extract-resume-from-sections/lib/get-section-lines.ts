import { ResumeSectionToLines } from '../../types';

/**
 * Return section lines that contain any of the keywords.
 */
export const getSectionLinesByKeywords = (
  sections: ResumeSectionToLines,
  keywords: string[],
) => {
  for (const sectionName in sections) {
    const normalizedName = sectionName.replace(/\s/g, '').toLowerCase();
    const hasKeyWord = keywords.some((keyword) =>
      normalizedName.includes(keyword.toLowerCase()),
    );
    if (hasKeyWord) {
      return sections[sectionName];
    }
  }
  return [];
};
