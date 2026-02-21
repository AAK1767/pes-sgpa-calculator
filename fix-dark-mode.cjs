const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');

// Replace `${darkMode ? 'dark-class' : 'light-class'}` with `dark-class`
content = content.replace(/\$\{darkMode \? '([^']+)' : '([^']+)'\}/g, '$1');

// Replace `darkMode ? 'dark-class' : 'light-class'` with `'dark-class'`
content = content.replace(/darkMode \? '([^']+)' : '([^']+)'/g, "'$1'");

fs.writeFileSync('src/App.jsx', content);
