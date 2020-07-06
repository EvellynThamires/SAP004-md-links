#!/usr/bin/env node //Interpretador do node para os sistemas operacionais.

const { join } = require('path'); /** Pega a url do arquivo */
const fs = require('fs'); /** Lê o arquivo */
const chalk = require('chalk'); /** Adiciona cor. */
const Table = require('cli-table'); /* Cria uma nova tabela */
const program = require('commander'); /** Criar um comando no console */

const pack = require('./package.json'); /** Pegar o arquivo package JSON */

const paths = join(__dirname, 'README.md'); /** Cria um caminho. */

program.version(pack.version);

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
      colWidths: [5, 50, 100, 5],
    });
    data.forEach((e, index) => {
      table.push([
        index,
        e.text,
        chalk.green(e.link),
        e.status === 200 ? chalk.green(e.status) : chalk.red(e.status),
      ]);
    });
    console.log(table.toString());
  } else {
    const table = new Table({
      head: ['id', 'texto', 'link'],
      colWidths: [5, 100, 100],
    });
    data.forEach((e, index) => {
      table.push([
        index,
        e.text,
        chalk.green(e.link),
      ]);
    });
    console.log(table.toString());
  }
};

program
  .command('add [mdlinks]')
  .description('Verify a link')
  .option('-v, --validate [verify]', 'sendo true verifica se a url é valida ou não')
  .option('-s, --status [status]', 'sendo true mostra quantos links são válidos')
  .action((mdlinks, options) => {
    const { validate, status } = options;
    console.log(validate, status);
    const data = getJson(paths);
    showTable(data, validate);
  });

program.parse(process.argv);
