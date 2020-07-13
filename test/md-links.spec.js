/* eslint-disable arrow-body-style */
/* eslint-disable no-unexpected-multiline */
/* eslint-disable no-undef */
const mdLinks = require('./mock_mdlinks');

describe('testing', () => {
  it('is a object', () => {
    expect(typeof mdLinks).toBe('object');
  });
});

it('is not a function', () => {
  expect(typeof mdLinks).not.toEqual('function');
});
