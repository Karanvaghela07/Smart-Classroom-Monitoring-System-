const fs = require('fs');
const path = require('path');

module.exports = {
  readJSON(filePath) {
    if (!fs.existsSync(filePath)) return [];
    return JSON.parse(fs.readFileSync(filePath));
  },

  writeJSON(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  },

  ensureFile(filePath, defaultData = '') {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, defaultData);
    }
  }
};
