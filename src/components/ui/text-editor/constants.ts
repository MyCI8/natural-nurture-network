
export const fontFamilies = [
  'Arial',
  'Times New Roman',
  'Courier New',
  'Georgia',
  'Verdana'
];

export const editorClasses = `
  [&_.is-editor-empty]:before:content-[attr(data-placeholder)]
  [&_.is-editor-empty]:before:text-muted-foreground
  [&_.is-editor-empty]:before:float-left
  [&_.is-editor-empty]:before:pointer-events-none
  [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:mb-6 [&_h1]:leading-tight
  [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:mb-5 [&_h2]:leading-tight [&_h2]:mt-8
  [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:mb-4 [&_h3]:leading-tight [&_h3]:mt-6
`;
