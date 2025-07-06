
interface ParsedRemedyContent {
  about: string;
  preparationMethod: string;
  dosageInstructions: string;
  precautionsAndSideEffects: string;
}

export const formatContentWithLists = (text: string): string => {
  if (!text) {return '';}

  const trimmedText = text.trim();
  // If it looks like HTML, return it as is. This is a simple heuristic.
  if (trimmedText.startsWith('<') && trimmedText.endsWith('>')) {
    return text;
  }

  const cleanedText = text.replace(/\*\*/g, '').trim();
  if (!cleanedText) {return '';}

  const lines = cleanedText.split('\n');
  let html = '';
  let inList: 'ol' | 'ul' | null = null;
  let paragraphContent: string[] = [];

  const flushParagraph = () => {
    if (paragraphContent.length > 0) {
      html += `<p>${paragraphContent.join('<br />')}</p>`;
      paragraphContent = [];
    }
  };
  
  const closeList = () => {
    if (inList) {
      html += `</${inList}>`;
      inList = null;
    }
  };

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (!trimmedLine) { // Blank line acts as a separator
      flushParagraph();
      closeList();
      continue;
    }

    const isOrderedItem = trimmedLine.match(/^\d+\.\s/);
    const isUnorderedItem = trimmedLine.match(/^([*-])\s/);

    if (isOrderedItem) {
      flushParagraph();
      if (inList !== 'ol') {
        closeList();
        html += '<ol>';
        inList = 'ol';
      }
      html += `<li>${trimmedLine.replace(/^\d+\.\s/, '')}</li>`;
    } else if (isUnorderedItem) {
      flushParagraph();
      if (inList !== 'ul') {
        closeList();
        html += '<ul>';
        inList = 'ul';
      }
      html += `<li>${trimmedLine.replace(/^([*-])\s/, '')}</li>`;
    } else { // It's a paragraph line
      closeList();
      paragraphContent.push(trimmedLine);
    }
  }
  
  // Flush any remaining content at the end of the text
  flushParagraph();
  closeList();

  return html;
};

export const parseRemedyContent = (description: string): ParsedRemedyContent => {
  if (!description) {
    return {
      about: '',
      preparationMethod: '',
      dosageInstructions: '',
      precautionsAndSideEffects: ''
    };
  }

  // Common section markers to look for
  const sectionMarkers = [
    { key: 'preparationMethod', patterns: [
      /\*\*Preparation Method:\*\*/i,
      /\*\*Preparation:\*\*/i,
      /\*\*How to Prepare:\*\*/i,
      /Preparation Method:/i,
      /Preparation:/i,
      /How to Prepare:/i
    ]},
    { key: 'dosageInstructions', patterns: [
      /\*\*Dosage Instructions:\*\*/i,
      /\*\*Dosage:\*\*/i,
      /\*\*How to Use:\*\*/i,
      /Dosage Instructions:/i,
      /Dosage:/i,
      /How to Use:/i
    ]},
    { key: 'precautionsAndSideEffects', patterns: [
      /\*\*Precautions & Side Effects:\*\*/i,
      /\*\*Precautions:\*\*/i,
      /\*\*Side Effects:\*\*/i,
      /\*\*Warnings:\*\*/i,
      /Precautions & Side Effects:/i,
      /Precautions:/i,
      /Side Effects:/i,
      /Warnings:/i
    ]}
  ];

  const result: ParsedRemedyContent = {
    about: description,
    preparationMethod: '',
    dosageInstructions: '',
    precautionsAndSideEffects: ''
  };

  // Find all section positions
  const sectionPositions: Array<{ key: string; start: number; marker: string }> = [];
  
  sectionMarkers.forEach(section => {
    section.patterns.forEach(pattern => {
      const match = description.match(pattern);
      if (match && match.index !== undefined) {
        sectionPositions.push({
          key: section.key,
          start: match.index,
          marker: match[0]
        });
      }
    });
  });

  // Sort by position
  sectionPositions.sort((a, b) => a.start - b.start);

  if (sectionPositions.length > 0) {
    // Extract about section (everything before first section marker)
    const firstSection = sectionPositions[0];
    result.about = description.substring(0, firstSection.start).trim();

    // Extract each section
    sectionPositions.forEach((section, index) => {
      const nextSection = sectionPositions[index + 1];
      const sectionStart = section.start + section.marker.length;
      const sectionEnd = nextSection ? nextSection.start : description.length;
      
      const sectionContent = description.substring(sectionStart, sectionEnd).trim();
      
      if (section.key === 'preparationMethod') {
        result.preparationMethod = sectionContent;
      } else if (section.key === 'dosageInstructions') {
        result.dosageInstructions = sectionContent;
      } else if (section.key === 'precautionsAndSideEffects') {
        result.precautionsAndSideEffects = sectionContent;
      }
    });
  }

  // Clean markdown asterisks from all sections
  result.about = result.about.replace(/\*\*/g, '').trim();
  result.preparationMethod = result.preparationMethod.replace(/\*\*/g, '').trim();
  result.dosageInstructions = result.dosageInstructions.replace(/\*\*/g, '').trim();
  result.precautionsAndSideEffects = result.precautionsAndSideEffects.replace(/\*\*/g, '').trim();

  return result;
};
