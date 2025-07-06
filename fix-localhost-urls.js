const fs = require('fs');
const path = require('path');

// Files that need localhost URL fixes
const filesToFix = [
  // Admin components
  'frontend/src/components/admin/settings.jsx',
  'frontend/src/components/admin/reports.jsx',
  'frontend/src/components/admin/RefundComplaintDashboard.jsx',
  'frontend/src/components/admin/notifications.jsx',
  'frontend/src/components/admin/analytics-working.jsx',
  
  // App pages
  'frontend/src/app/admin/create-shipment/page.jsx',
  'frontend/src/app/payment/page.jsx',
  'frontend/src/app/payment/success/page.jsx',
  'frontend/src/app/partner/test/page.jsx',
  'frontend/src/app/test-partner/TestPartnerContent.jsx',
  
  // Components
  'frontend/src/components/ConnectionStatus.jsx',
  'frontend/src/components/chatbot/user-complaint-bot.jsx',
  'frontend/src/components/lib/api.js',
  
  // Hooks
  'frontend/src/hooks/useSocket.js'
];

function fixFile(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`❌ File not found: ${filePath}`);
      return;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;
    
    // Check if file already imports API_URL
    const hasApiImport = content.includes('import { API_URL }') || content.includes('from \'../../services/api.config.js\'');
    
    // Add API_URL import if not present and file has localhost URLs
    if (!hasApiImport && content.includes('localhost:5000')) {
      // Find the right place to add import
      const lines = content.split('\n');
      let importIndex = -1;
      
      // Find last import statement
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('import ') && !lines[i].includes('//')) {
          importIndex = i;
        }
      }
      
      if (importIndex !== -1) {
        // Determine correct relative path based on file location
        let relativePath = '../../services/api.config.js';
        if (filePath.includes('app/')) {
          if (filePath.includes('app/admin/')) {
            relativePath = '../../../services/api.config.js';
          } else if (filePath.includes('app/payment/')) {
            relativePath = '../../../services/api.config.js';
          } else {
            relativePath = '../../services/api.config.js';
          }
        } else if (filePath.includes('components/admin/')) {
          relativePath = '../../services/api.config.js';
        } else if (filePath.includes('components/')) {
          relativePath = '../services/api.config.js';
        } else if (filePath.includes('hooks/')) {
          relativePath = '../services/api.config.js';
        }
        
        lines.splice(importIndex + 1, 0, `import { API_URL } from '${relativePath}';`);
        content = lines.join('\n');
        modified = true;
      }
    }
    
    // Replace localhost URLs
    const replacements = [
      // Direct API calls
      { from: /http:\/\/localhost:5000\/api/g, to: '${API_URL}' },
      { from: /'http:\/\/localhost:5000\/api'/g, to: 'API_URL' },
      { from: /"http:\/\/localhost:5000\/api"/g, to: 'API_URL' },
      { from: /`http:\/\/localhost:5000\/api`/g, to: 'API_URL' },
      
      // Template literals
      { from: /\$\{process\.env\.NEXT_PUBLIC_API_URL \|\| 'http:\/\/localhost:5000\/api'\}/g, to: 'API_URL' },
      
      // Socket connections
      { from: /http:\/\/localhost:5000/g, to: '${process.env.NEXT_PUBLIC_API_URL || \'https://delivery-backend100.vercel.app\'}' },
      { from: /'http:\/\/localhost:5000'/g, to: 'process.env.NEXT_PUBLIC_API_URL || \'https://delivery-backend100.vercel.app\'' },
      
      // Image URLs (special case for reports)
      { from: /http:\/\/localhost:5000\$\{image\.imageUrl\}/g, to: '${process.env.NEXT_PUBLIC_API_URL || \'https://delivery-backend100.vercel.app\'}${image.imageUrl}' }
    ];
    
    replacements.forEach(({ from, to }) => {
      const newContent = content.replace(from, to);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
    } else {
      console.log(`⏭️  No changes needed: ${filePath}`);
    }
    
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

console.log('🔧 Fixing localhost URLs in project files...\n');

filesToFix.forEach(fixFile);

console.log('\n✅ Localhost URL fix completed!');
console.log('\n📝 Manual fixes still needed:');
console.log('- Check any remaining localhost references');
console.log('- Verify API_URL imports are correct');
console.log('- Test all endpoints after deployment');