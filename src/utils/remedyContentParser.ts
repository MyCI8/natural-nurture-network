interface ParsedRemedyContent {
  about: string;
  preparationMethod: string;
  dosageInstructions: string;
  precautionsAndSideEffects: string;
}

const formatContentWithLists = (text: string): string => {
  if (!text) return '';

  const cleanedText = text.replace(/\*\*/g, '').trim();
  if (!cleanedText) return '';
  
  const blocks = cleanedText.split(/\n\s*\n/); // Split by blank lines

  return blocks.map(block => {
    const trimmedBlock = block.trim();
    if (!trimmedBlock) return '';

    const lines = trimmedBlock.split('\n');
    
    // Check if all lines in the block are list items
    const isUnordered = lines.every(line => line.trim().match(/^([*-])\s/));
    const isOrdered = lines.every(line => line.trim().match(/^\d+\.\s/));

    if (isUnordered) {
      return `<ul>${lines.map(line => `<li>${line.trim().replace(/^([*-])\s/, '')}</li>`).join('')}</ul>`;
    }
    if (isOrdered) {
      return `<ol>${lines.map(line => `<li>${line.trim().replace(/^\d+\.\s/, '')}</li>`).join('')}</ol>`;
    }

    // Otherwise, it's a paragraph. Replace newlines with <br> for line breaks within a paragraph.
    return `<p>${trimmedBlock.replace(/\n/g, '<br />')}</p>`;
  }).join('');
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
  result.dosageInstructions = result.dosageInstructions.replace(/\*\*/g, '').trim();
  result.precautionsAndSideEffects = result.precautionsAndSideEffects.replace(/\*\*/g, '').trim();

  // Format preparation method with lists and remove asterisks
  result.preparationMethod = formatContentWithLists(result.preparationMethod);

  return result;
};
