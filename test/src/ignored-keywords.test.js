const { expect }     = require('chai');
const BetterErrors   = require('../../src/BetterErrors');

const s_FUNCTIONS = ['asArray', 'asObject'];
const s_RESULTS = { asArray: [], asObject: {} };

for (const testFunction of s_FUNCTIONS)
{
   /**
    * Tests to cover keywords which are ignored presently.
    */
   describe(`betterErrors errors entries ignored keywords (${testFunction})`, () =>
   {
      it(`errors 'entry' ignored keyword - oneOf`, () =>
      {
         expect(BetterErrors[testFunction]([{ dataPath: 'a string', keyword: 'oneOf' }])).to.be.deep.equal(
          s_RESULTS[testFunction]);
      });

      it(`errors 'entry' ignored keyword - anyOf`, () =>
      {
         expect(BetterErrors[testFunction]([{ dataPath: 'a string', keyword: 'anyOf' }])).to.be.deep.equal(
          s_RESULTS[testFunction]);
      });

      it(`errors 'entry' ignored keyword - allOf`, () =>
      {
         expect(BetterErrors[testFunction]([{ dataPath: 'a string', keyword: 'allOf' }])).to.be.deep.equal(
          s_RESULTS[testFunction]);
      });

      it(`errors 'entry' ignored keyword - if`, () =>
      {
         expect(BetterErrors[testFunction]([{ dataPath: 'a string', keyword: 'if' }])).to.be.deep.equal(
          s_RESULTS[testFunction]);
      });
   });
}
