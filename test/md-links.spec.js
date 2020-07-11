/* eslint-disable arrow-body-style */
/* eslint-disable no-unexpected-multiline */
/* eslint-disable no-undef */
const mdLinks = require('./mock_mdLinks');

describe('testing', () => {
  it('is a object', () => {
    expect(typeof mdLinks).toBe('object');
  });
});

it('return a empty array when there are no links', () => {
  expect(('empty.md')).resolves.toBe('[]');
});
