
import { SudokuLogic } from './assets/js/modules/sudoku-logic.js';

console.log('--- Logic Function Check ---');
console.log(SudokuLogic.removeNumbers.toString().slice(0, 300));
console.log('...time check start...');

const start = Date.now();
// Try a small number first to verify basics
// const res = SudokuLogic.generate(10); 
const res = SudokuLogic.generate(55);
const end = Date.now();

console.log(`Generated in ${end - start}ms`);
process.exit(0);
