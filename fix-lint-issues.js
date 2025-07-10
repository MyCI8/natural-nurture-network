import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to recursively find all TypeScript/JavaScript files
function findFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      results = results.concat(findFiles(filePath, extensions));
    } else if (extensions.some(ext => file.endsWith(ext))) {
      results.push(filePath);
    }
  });
  
  return results;
}

// Function to remove unused imports and variables
function fixUnusedVariables(content) {
  let lines = content.split('\n');
  let modified = false;
  
  // Track which lines to remove
  const linesToRemove = new Set();
  
  // Pattern to match unused variable declarations
  const unusedPatterns = [
    // Unused destructured variables
    /^\s*const\s*{\s*([^}]+)\s*}\s*=\s*[^;]+;?\s*$/,
    // Unused variable declarations
    /^\s*(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*[^;]+;?\s*$/,
    // Unused function parameters
    /^\s*function\s*\([^)]*\)\s*{/,
    /^\s*\([^)]*\)\s*=>\s*{/,
    // Unused imports
    /^\s*import\s*{[^}]*}\s*from\s*['"][^'"]+['"];?\s*$/,
    /^\s*import\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s+from\s*['"][^'"]+['"];?\s*$/
  ];
  
  // Check each line for unused variables
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip comments and empty lines
    if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim() === '') {
      continue;
    }
    
    // Check for unused destructured variables
    if (line.includes('const {') || line.includes('let {') || line.includes('var {')) {
      const match = line.match(/{\s*([^}]+)\s*}/);
      if (match) {
        const variables = match[1].split(',').map(v => v.trim().split(':')[0].trim());
        const isUnused = variables.every(v => {
          // Check if variable is used in subsequent lines
          const remainingContent = lines.slice(i + 1).join('\n');
          return !remainingContent.includes(v) || remainingContent.includes(`// eslint-disable-next-line`);
        });
        
        if (isUnused) {
          linesToRemove.add(i);
          modified = true;
        }
      }
    }
    
    // Check for unused variable declarations
    const varMatch = line.match(/^\s*(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/);
    if (varMatch) {
      const varName = varMatch[1];
      const remainingContent = lines.slice(i + 1).join('\n');
      
      // Skip if it's a React hook or commonly used variable
      if (['useState', 'useEffect', 'useCallback', 'useMemo', 'useRef', 'useContext'].includes(varName)) {
        continue;
      }
      
      if (!remainingContent.includes(varName) && !line.includes('// eslint-disable-next-line')) {
        linesToRemove.add(i);
        modified = true;
      }
    }
  }
  
  // Remove marked lines
  if (linesToRemove.size > 0) {
    lines = lines.filter((_, index) => !linesToRemove.has(index));
    modified = true;
  }
  
  return { content: lines.join('\n'), modified };
}

// Function to fix specific patterns
function fixSpecificPatterns(content) {
  let modified = false;
  
  // Remove unused React imports
  content = content.replace(/import\s+React\s+from\s+['"]react['"];?\s*\n?/g, '');
  
  // Remove unused useState imports
  content = content.replace(/import\s+{\s*useState\s*}\s+from\s+['"]react['"];?\s*\n?/g, '');
  
  // Remove unused useEffect imports
  content = content.replace(/import\s+{\s*useEffect\s*}\s+from\s+['"]react['"];?\s*\n?/g, '');
  
  // Remove unused useCallback imports
  content = content.replace(/import\s+{\s*useCallback\s*}\s+from\s+['"]react['"];?\s*\n?/g, '');
  
  // Remove unused useRef imports
  content = content.replace(/import\s+{\s*useRef\s*}\s+from\s+['"]react['"];?\s*\n?/g, '');
  
  // Remove unused useNavigate imports
  content = content.replace(/import\s+{\s*useNavigate\s*}\s+from\s+['"]react-router-dom['"];?\s*\n?/g, '');
  
  // Remove unused useLocation imports
  content = content.replace(/import\s+{\s*useLocation\s*}\s+from\s+['"]react-router-dom['"];?\s*\n?/g, '');
  
  // Remove unused Button imports
  content = content.replace(/import\s+{\s*Button\s*}\s+from\s+['"]@\/components\/ui\/button['"];?\s*\n?/g, '');
  
  // Remove unused Input imports
  content = content.replace(/import\s+{\s*Input\s*}\s+from\s+['"]@\/components\/ui\/input['"];?\s*\n?/g, '');
  
  // Remove unused Badge imports
  content = content.replace(/import\s+{\s*Badge\s*}\s+from\s+['"]@\/components\/ui\/badge['"];?\s*\n?/g, '');
  
  // Remove unused CardFooter imports
  content = content.replace(/import\s+{\s*CardFooter\s*}\s+from\s+['"]@\/components\/ui\/card['"];?\s*\n?/g, '');
  
  // Remove unused Search imports
  content = content.replace(/import\s+{\s*Search\s*}\s+from\s+['"]lucide-react['"];?\s*\n?/g, '');
  
  // Remove unused ArrowLeft imports
  content = content.replace(/import\s+{\s*ArrowLeft\s*}\s+from\s+['"]lucide-react['"];?\s*\n?/g, '');
  
  // Remove unused Clock imports
  content = content.replace(/import\s+{\s*Clock\s*}\s+from\s+['"]lucide-react['"];?\s*\n?/g, '');
  
  // Remove unused ChefHat imports
  content = content.replace(/import\s+{\s*ChefHat\s*}\s+from\s+['"]lucide-react['"];?\s*\n?/g, '');
  
  // Remove unused Pill imports
  content = content.replace(/import\s+{\s*Pill\s*}\s+from\s+['"]lucide-react['"];?\s*\n?/g, '');
  
  // Remove unused AlertTriangle imports
  content = content.replace(/import\s+{\s*AlertTriangle\s*}\s+from\s+['"]lucide-react['"];?\s*\n?/g, '');
  
  // Remove unused Star imports
  content = content.replace(/import\s+{\s*Star\s*}\s+from\s+['"]lucide-react['"];?\s*\n?/g, '');
  
  // Remove unused Send imports
  content = content.replace(/import\s+{\s*Send\s*}\s+from\s+['"]lucide-react['"];?\s*\n?/g, '');
  
  // Remove unused Heart imports
  content = content.replace(/import\s+{\s*Heart\s*}\s+from\s+['"]lucide-react['"];?\s*\n?/g, '');
  
  // Remove unused ShoppingCart imports
  content = content.replace(/import\s+{\s*ShoppingCart\s*}\s+from\s+['"]lucide-react['"];?\s*\n?/g, '');
  
  // Remove unused ChevronDown imports
  content = content.replace(/import\s+{\s*ChevronDown\s*}\s+from\s+['"]lucide-react['"];?\s*\n?/g, '');
  
  // Remove unused ExternalLink imports
  content = content.replace(/import\s+{\s*ExternalLink\s*}\s+from\s+['"]lucide-react['"];?\s*\n?/g, '');
  
  // Remove unused Filter imports
  content = content.replace(/import\s+{\s*Filter\s*}\s+from\s+['"]lucide-react['"];?\s*\n?/g, '');
  
  // Remove unused MapPin imports
  content = content.replace(/import\s+{\s*MapPin\s*}\s+from\s+['"]lucide-react['"];?\s*\n?/g, '');
  
  // Remove unused Separator imports
  content = content.replace(/import\s+{\s*Separator\s*}\s+from\s+['"]@\/components\/ui\/separator['"];?\s*\n?/g, '');
  
  // Remove unused AspectRatio imports
  content = content.replace(/import\s+{\s*AspectRatio\s*}\s+from\s+['"]@\/components\/ui\/aspect-ratio['"];?\s*\n?/g, '');
  
  // Remove unused AvatarImage imports
  content = content.replace(/import\s+{\s*AvatarImage\s*}\s+from\s+['"]@\/components\/ui\/avatar['"];?\s*\n?/g, '');
  
  // Remove unused Move imports
  content = content.replace(/import\s+{\s*Move\s*}\s+from\s+['"]lucide-react['"];?\s*\n?/g, '');
  
  // Remove unused RotateCw imports
  content = content.replace(/import\s+{\s*RotateCw\s*}\s+from\s+['"]lucide-react['"];?\s*\n?/g, '');
  
  // Remove unused ZoomIn imports
  content = content.replace(/import\s+{\s*ZoomIn\s*}\s+from\s+['"]lucide-react['"];?\s*\n?/g, '');
  
  // Remove unused VideoElement imports
  content = content.replace(/import\s+{\s*VideoElement\s*}\s+from\s+['"]@\/components\/video['"];?\s*\n?/g, '');
  
  // Remove unused ProductLinkCard imports
  content = content.replace(/import\s+{\s*ProductLinkCard\s*}\s+from\s+['"]@\/components\/video['"];?\s*\n?/g, '');
  
  // Remove unused UserVideoGrid imports
  content = content.replace(/import\s+{\s*UserVideoGrid\s*}\s+from\s+['"]@\/components\/profile['"];?\s*\n?/g, '');
  
  // Remove unused SavedVideos imports
  content = content.replace(/import\s+{\s*SavedVideos\s*}\s+from\s+['"]@\/components\/profile['"];?\s*\n?/g, '');
  
  // Remove unused SavedRemedies imports
  content = content.replace(/import\s+{\s*SavedRemedies\s*}\s+from\s+['"]@\/components\/profile['"];?\s*\n?/g, '');
  
  // Remove unused UserRemedies imports
  content = content.replace(/import\s+{\s*UserRemedies\s*}\s+from\s+['"]@\/components\/profile['"];?\s*\n?/g, '');
  
  // Remove unused ErrorBoundary imports
  content = content.replace(/import\s+{\s*ErrorBoundary\s*}\s+from\s+['"]@\/components\/ErrorBoundary['"];?\s*\n?/g, '');
  
  // Remove unused DebugData imports
  content = content.replace(/import\s+{\s*DebugData\s*}\s+from\s+['"]@\/components\/ui\/debug-data['"];?\s*\n?/g, '');
  
  // Remove unused Ingredient imports
  content = content.replace(/import\s+{\s*Ingredient\s*}\s+from\s+['"]@\/types['"];?\s*\n?/g, '');
  
  // Remove unused SymptomType imports
  content = content.replace(/import\s+{\s*SymptomType\s*}\s+from\s+['"]@\/types['"];?\s*\n?/g, '');
  
  // Remove unused Video imports
  content = content.replace(/import\s+{\s*Video\s*}\s+from\s+['"]@\/types['"];?\s*\n?/g, '');
  
  // Remove unused Json imports
  content = content.replace(/import\s+{\s*Json\s*}\s+from\s+['"]@\/integrations\/supabase\/types['"];?\s*\n?/g, '');
  
  // Remove unused SearchResult imports
  content = content.replace(/import\s+{\s*SearchResult\s*}\s+from\s+['"]@\/types['"];?\s*\n?/g, '');
  
  // Remove unused FormHookReturn imports
  content = content.replace(/import\s+{\s*FormHookReturn\s*}\s+from\s+['"]@\/types\/form['"];?\s*\n?/g, '');
  
  // Remove unused SwipeState imports
  content = content.replace(/import\s+{\s*SwipeState\s*}\s+from\s+['"]@\/types['"];?\s*\n?/g, '');
  
  // Remove unused Tables imports
  content = content.replace(/import\s+{\s*Tables\s*}\s+from\s+['"]@\/integrations\/supabase\/types['"];?\s*\n?/g, '');
  
  // Remove unused supabase imports
  content = content.replace(/import\s+{\s*supabase\s*}\s+from\s+['"]@\/integrations\/supabase\/client['"];?\s*\n?/g, '');
  
  // Clean up empty import statements
  content = content.replace(/import\s*{\s*}\s*from\s*['"][^'"]+['"];?\s*\n?/g, '');
  
  // Clean up multiple consecutive empty lines
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  return { content, modified: content !== content };
}

// Main function to process files
function processFiles() {
  const srcDir = path.join(__dirname, 'src');
  const supabaseDir = path.join(__dirname, 'supabase');
  
  let allFiles = [];
  
  if (fs.existsSync(srcDir)) {
    allFiles = allFiles.concat(findFiles(srcDir));
  }
  
  if (fs.existsSync(supabaseDir)) {
    allFiles = allFiles.concat(findFiles(supabaseDir));
  }
  
  console.log(`Found ${allFiles.length} files to process`);
  
  let totalModified = 0;
  
  allFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      // Apply fixes
      const { content: fixedContent, modified: patternModified } = fixSpecificPatterns(content);
      const { content: finalContent, modified: varModified } = fixUnusedVariables(fixedContent);
      
      if (patternModified || varModified) {
        fs.writeFileSync(file, finalContent, 'utf8');
        console.log(`Fixed: ${file}`);
        totalModified++;
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  });
  
  console.log(`\nTotal files modified: ${totalModified}`);
}

// Run the script
processFiles(); 