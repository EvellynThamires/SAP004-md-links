#!/usr/bin/env node

const { join } = require('path'); /** Pega a url do arquivo */
const fs = require('fs'); /** Lê o arquivo */
const chalk = require('chalk'); /** Adiciona cor. */
const Table = require('cli-table'); /* Cria uma nova tabela */
const axios = require('axios'); /** Faz requisições HTTP */
const program = require('commander'); /** Criar um comando no console */

const pack = require('./package.json'); /** Pegar o arquivo package JSON */

program.version(pack.version); /** Verifica a versão do package JSON */

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
      head: ['id', 'texto', 'link', 'status'],
      colWidths: [5, 50, 120, 20],
    });
    data.forEach((e, index) => {
      table.push([
        index,
        e.text,
        chalk.cyan(e.link),
        e.stats === 200 ? chalk.green(e.stats) : chalk.red(e.stats),
      ]);
    });
    console.log(table.toString());
  } else {
    const table = new Table({
      head: ['id', 'texto', 'link'],
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
          status: response.status,
          link: response.config.url,
        });
      })
      .catch(() => {
        resolve({
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
    const paths = join(__dirname, mdlinks); /** Cria um caminho. */
    console.log(paths);
    const { validate, stats } = options; /** Pega validate e stats dentro de options */
    const data = getJson(paths); /** Pega os links do arquivo selecionado. */
    if (validate === true) {
      checkedLink(data)
        .then((response) => {
          console.log(response);
          const unique = response.filter((e) => e.status === 200);
          console.log('Unique', unique.length);
          const broken = response.filter((element) => element.status === 404);
          console.log('Broke', broken.length);
          console.log('Total', response.length);
        });
    } else {
      showTable(data, validate);
      console.log(`${chalk.green('Fim do processo')}`);
    }
  });

program.parse(process.argv); /** Interpretador do Node.js */
