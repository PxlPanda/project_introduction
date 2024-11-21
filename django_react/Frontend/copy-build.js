const fs = require('fs-extra');
const path = require('path');

const source = path.join(__dirname, 'build'); // Папка сборки React
const destination = path.join(__dirname, '../django_react/build'); // Django build

fs.copy(source, destination, (err) => {
  if (err) {
    console.error('Ошибка при копировании файлов:', err);
  } else {
    console.log('Сборка успешно скопирована в Django.');
  }
});
