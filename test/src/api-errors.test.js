const { assert, expect }   = require('chai');
const betterErrors         = require('../../src/bettererrors');

/**
 * Tests all of the API errors regarding invoking better errors as an external consumer.
 */
describe('betterErrors API errors', () =>
{
   it(`'errors' must be an array.`, () =>
   {
      assert.throw(() => { betterErrors(); }, TypeError, `'errors' must be an array.`);
   });

   it(`'options.file' must be a string.`, () =>
   {
      assert.throw(() => { betterErrors([], { file: false }); }, TypeError,
       `'options.file' must be a string.`);
   });

   it(`'options.highlightCode' must be a boolean.`, () =>
   {
      assert.throw(() => { betterErrors([], { highlightCode: 1 }); }, TypeError,
       `'options.highlightCode' must be a boolean.`);
   });

   it(`'options.wrapLength' must be a positive integer`, () =>
   {
      assert.throw(() => { betterErrors([], { wrapLength: false }); }, TypeError,
       `'options.wrapLength' must be a positive integer greater than 10.`);
   });

   it(`'options.wrapLength' must be a positive integer greater than 10.`, () =>
   {
      assert.throw(() => { betterErrors([], { wrapLength: 5 }); }, TypeError,
       `'options.wrapLength' must be a positive integer greater than 10.`);
   });
});

describe('betterErrors errors entries malformed', () =>
{
   it(`errors 'entry' not an object`, () =>
   {
      expect(betterErrors([false])).to.be.deep.equal([]);
   });

   it(`errors 'entry' bare object`, () =>
   {
      expect(betterErrors([{}])).to.be.deep.equal([]);
   });

   it(`errors 'entry' dataPath not string`, () =>
   {
      expect(betterErrors([{ dataPath: false }])).to.be.deep.equal([]);
   });

   it(`errors 'entry' keyword not string`, () =>
   {
      expect(betterErrors([{ dataPath: 'a string', keyword: false }])).to.be.deep.equal([]);
   });
});
