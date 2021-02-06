const fs                   = require('fs');

const { assert, expect }   = require('chai');
const dircompare           = require('dir-compare');

const BetterErrors         = require('../../src/BetterErrors');

/**
 * Tests all of the API options regarding invoking better errors as an external consumer.
 */
describe('betterErrors compare output', () =>
{
   it(`Compare asArray to asObject JSON test fixture data`, () =>
   {
      const result = dircompare.compareSync('./test/fixture/data/asArray/json', './test/fixture/data/asObject/json',
       { compareContent: true });

      if (!result)
      {
         result.diffSet.forEach((diff) =>
         {
            console.log(`Difference - name1: ${diff.name1}, type1: ${diff.type1}, name2: ${diff.name2}, `
             + `type2: ${diff.type2}, state: ${diff.state}`);
         });
      }

      assert(result);
   });

   it(`Compare asArray to asObject log test fixture data`, () =>
   {
      const result = dircompare.compareSync('./test/fixture/data/asArray/log', './test/fixture/data/asObject/log',
       { compareContent: true });

      if (!result)
      {
         result.diffSet.forEach((diff) =>
         {
            console.log(`Difference - name1: ${diff.name1}, type1: ${diff.type1}, name2: ${diff.name2}, `
             + `type2: ${diff.type2}, state: ${diff.state}`);
         });
      }

      assert(result);
   });

   it(`Test toString() on all-errors (asArray)`, () =>
   {
      const betterErrors = JSON.parse(fs.readFileSync('./test/fixture/data/asArray/json/all-errors.json', 'utf-8'));
      const betterLog = fs.readFileSync('./test/fixture/data/asArray/log/all-errors.log', 'utf-8');

      expect(BetterErrors.toString(betterErrors)).to.be.deep.equal(betterLog);
   });

   it(`Test toString() on all-errors (asObject)`, () =>
   {
      const betterErrors = JSON.parse(fs.readFileSync('./test/fixture/data/asObject/json/all-errors.json', 'utf-8'));
      const betterLog = fs.readFileSync('./test/fixture/data/asObject/log/all-errors.log', 'utf-8');

      expect(BetterErrors.toString(betterErrors)).to.be.deep.equal(betterLog);
   });
});
