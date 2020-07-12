#!/usr/bin/env node

const fs = require('fs'); /** Lê o arquivo */
const figlet = require('figlet');
const chalk = require('chalk'); /** Adiciona cor. */
const Table = require('cli-table'); /* Cria uma nova tabela */
const axios = require('axios'); /** Faz requisições HTTP */
const program = require('commander'); /** Criar um comando no console */

const pack = require('./package.json'); /** Pegar o arquivo package JSON */

program.version(pack.version); /** Verifica a versão do package JSON */

console.log(chalk.cyan(figlet.textSync('VrLinks')));

const getJson = (path) => {
  const data = fs.existsSync(path) ? fs.readFileSync(path, 'utf8') : [];
  try {
    const result = data.match(/[^!]\[(.[^\]]*)\]\(([^#]\S+)\)/gm);
    if (result !== null) {
      const links = result.map((element) => {
        const all = element.split('](');
        const text = all[0].split('[')[1].replace(/\r?\n?/g, '');
        const link = all[1].split(')')[0];
        return {
          text,
          link,
        };
      });
      return links;
    }
    return result;
  } catch (e) {
    return e;
  }
};

const showTable = (data, validate) => {
  if (validate === true) {
    const table = new Table({
      head: ['ID', 'TEXT', 'LINK', 'STATUS'],
      colWidths: [5, 50, 120, 20],
    });
    data.forEach((e, index) => {
      table.push([
        index,
        e.text,
        chalk.cyan(e.link),
        e.status === 200 ? chalk.green(e.status) : chalk.red(e.status),
      ]);
    });
    console.log(table.toString());
  } else {
    const table = new Table({
      head: ['ID', 'TEXT', 'LINK'],
      colWidths: [5, 50, 120],
    });
    data.forEach((e, index) => {
      table.push([
        index,
        e.text,
        chalk.cyan(e.link),
      ]);
    });
    console.log(table.toString());
  }
};

const checkedLink = (data) => new Promise((resolve, reject) => {
  const promiseCreate = data.map((e) => new Promise((resolve, reject) => {
    axios.get(e.link)
      .then((response) => {
        resolve({
          text: e.text,
          status: response.status,
          link: response.config.url,
        });
      })
      .catch(() => {
        resolve({
          text: e.text,
          status: 404,
          link: e.link,
        });
      });
  }));

  Promise.all(promiseCreate)
    .then((values) => {
      resolve(values);
    });
});

program
  .command('add [mdlinks]')
  .description('Verify a link')
  .option('-v, --validate [verify]', 'sendo true verifica se a url é valida ou não')
  .option('-s, --stats [stats]', 'sendo true mostra quantos links são válidos')
  .action((mdlinks, options) => {
    const { validate, stats } = options; /** Pega validate e stats dentro de options */
    const data = getJson(mdlinks); /** Pega os links do arquivo selecionado. */
    if (validate === true) {
      checkedLink(data)
        .then((response) => {
          showTable(response, validate);
        });
    } else {
      showTable(data, validate);
    }
    if (stats === true) {
      checkedLink(data)
        .then((response) => {
          const unique = response.filter((e) => e.status === 200);
          console.log(`Unique ${chalk.green(unique.length)}`);
          const broken = response.filter((element) => element.status === 404);
          console.log(`Broken ${chalk.red(broken.length)}`);
          console.log('Total', response.length);
        });
    }
  });

program.parse(process.argv); /** Interpretador do Node.js */
