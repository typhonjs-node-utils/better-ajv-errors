const { expect }     = require('chai');
const betterErrors   = require('../../src/bettererrors');

/**
 * Tests to cover keywords which are ignored presently.
 */
describe('betterErrors errors entries ignored keywords', () =>
{
   it(`errors 'entry' ignored keyword - not`, () =>
   {
      expect(betterErrors([{ dataPath: 'a string', keyword: 'not' }])).to.be.deep.equal([]);
   });

   it(`errors 'entry' ignored keyword - oneOf`, () =>
   {
      expect(betterErrors([{ dataPath: 'a string', keyword: 'oneOf' }])).to.be.deep.equal([]);
   });

   it(`errors 'entry' ignored keyword - anyOf`, () =>
   {
      expect(betterErrors([{ dataPath: 'a string', keyword: 'anyOf' }])).to.be.deep.equal([]);
   });

   it(`errors 'entry' ignored keyword - allOf`, () =>
   {
      expect(betterErrors([{ dataPath: 'a string', keyword: 'allOf' }])).to.be.deep.equal([]);
   });

   it(`errors 'entry' ignored keyword - if`, () =>
   {
      expect(betterErrors([{ dataPath: 'a string', keyword: 'if' }])).to.be.deep.equal([]);
   });
});
