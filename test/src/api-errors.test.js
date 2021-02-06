const { assert, expect }   = require('chai');
const BetterErrors         = require('../../src/BetterErrors');

const s_FUNCTIONS = ['asArray', 'asObject'];

const s_RESULTS = { asArray: [], asObject: {} };

for (const testFunction of s_FUNCTIONS)
{
   /**
    * Tests all of the API errors regarding invoking better errors as an external consumer.
    */
   describe(`betterErrors API errors (${testFunction})`, () =>
   {
      it(`'errors' must be an array.`, () =>
      {
         assert.throw(() => { BetterErrors[testFunction](); }, TypeError, `'errors' must be an array.`);
      });

      it(`'options.file' must be a string.`, () =>
      {
         assert.throw(() => { BetterErrors[testFunction]([], { file: false }); }, TypeError,
          `'options.file' must be a string.`);
      });

      it(`'options.highlightCode' must be a boolean.`, () =>
      {
         assert.throw(() => { BetterErrors[testFunction]([], { highlightCode: 1 }); }, TypeError,
          `'options.highlightCode' must be a boolean.`);
      });

      it(`'options.wrapLength' must be a positive integer`, () =>
      {
         assert.throw(() => { BetterErrors[testFunction]([], { wrapLength: false }); }, TypeError,
          `'options.wrapLength' must be a positive integer greater than 10.`);
      });

      it(`'options.wrapLength' must be a positive integer greater than 10.`, () =>
      {
         assert.throw(() => { BetterErrors[testFunction]([], { wrapLength: 5 }); }, TypeError,
          `'options.wrapLength' must be a positive integer greater than 10.`);
      });
   });

   describe('betterErrors errors entries malformed', () =>
   {
      it(`errors 'entry' not an object`, () =>
      {
         expect(BetterErrors[testFunction]([false])).to.be.deep.equal(s_RESULTS[testFunction]);
      });

      it(`errors 'entry' bare object`, () =>
      {
         expect(BetterErrors[testFunction]([{}])).to.be.deep.equal(s_RESULTS[testFunction]);
      });

      it(`errors 'entry' dataPath not string`, () =>
      {
         expect(BetterErrors[testFunction]([{ dataPath: false }])).to.be.deep.equal(s_RESULTS[testFunction]);
      });

      it(`errors 'entry' keyword not string`, () =>
      {
         expect(BetterErrors[testFunction]([{ dataPath: 'a string', keyword: false }])).to.be.deep.equal(
          s_RESULTS[testFunction]);
      });
   });
}

/**
 * Tests all of the API errors regarding invoking better errors as an external consumer.
 */
describe(`betterErrors API errors iterator()`, () =>
{
   it(`'betterErrors' must be an array or object.`, () =>
   {
      assert.throw(() => { BetterErrors.iterator().next(); }, TypeError, `'betterErrors' is not an array or object.`);
   });

   it(`'regex' must be a RegExp.`, () =>
   {
      assert.throw(() => { BetterErrors.iterator([], false).next(); }, TypeError, `'regex' is not a RegExp.`);
   });
});
