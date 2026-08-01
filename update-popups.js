const fs = require('fs');
const path = require('path');
const dirs = ['master', 'orders'];
dirs.forEach(d => {
  const dirPath = path.join('src', 'components', d);
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).filter(f => f.endsWith('.jsx')).forEach(f => {
      const p = path.join(dirPath, f);
      let content = fs.readFileSync(p, 'utf8');
      
      // Prevent duplicate additions
      if (content.includes('animate-overlay')) return;

      // Replace overlay
      content = content.replace(/className="fixed inset-0 ([^"]+)"/g, 'className="fixed inset-0 $1 animate-overlay"');
      
      // Replace popup box (usually next line, starts with bg-white p-6...)
      content = content.replace(/(<div className="fixed inset-0 [^"]+">\s*<div className="bg-white[^"]+)"/g, '$1 animate-popup"');
      
      fs.writeFileSync(p, content);
    });
  }
});
console.log('Done popups');
