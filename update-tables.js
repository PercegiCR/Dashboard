const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/components/master/CustomerData.jsx',
  'src/components/master/VendorData.jsx',
  'src/components/master/InventoryData.jsx',
  'src/components/master/ProductData.jsx',
  'src/components/Finance.jsx'
];

filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if already has overflow-x-auto wrapper around table
    if (!content.includes('<div className="overflow-x-auto">')) {
      content = content.replace(
        /<table className="w-full text-left border-collapse">/g,
        '<div className="overflow-x-auto">\n          <table className="w-full text-left border-collapse whitespace-nowrap">'
      );
      
      content = content.replace(
        /<\/table>\n      <\/div>/g,
        '</table>\n        </div>\n      </div>'
      );
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${file}`);
    }
  } else {
    console.log(`File not found: ${file}`);
  }
});
