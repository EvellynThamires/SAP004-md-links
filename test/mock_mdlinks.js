const fs = require('fs');

const getJson = (path) => {
  const data = fs.existsSync(path) ? fs.readFileSync(path, 'utf8') : [];
  try {
    const result = data.match(/[^!]\[(.[^\]]*)\]\(([^#]\S+)\)/gm);
    if (result !== null) {
      const links = result.map((element) => {
        const all = element.split('](');
        const text = all[0].split('[')[1].replace(/\r?\n?/g, '');
        const link = all[1].split(')')[0];
        return { text, link };
      });
      return links;
    }
    return result;
  } catch (e) {
    return e;
  }
};

getJson();
