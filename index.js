#!/usr/bin/env node //Interpretador de node para outros sistemas operacionais.

const program = require('commander'); /** Cria comandos na CLI */
const pack = require('./package.json'); /** Arquivo package json */

program.version(pack.version); /** Verifica a versão do package Json */

program
  .command('init [mdlinks]')
  .description('Verifica links da web')
  .action((mdlinks) => {
    console.log(mdlinks);
  });

program.parse(process.argv); /** Interpreta comandos do Node.js */
