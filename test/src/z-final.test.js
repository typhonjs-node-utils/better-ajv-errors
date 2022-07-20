import fs                  from 'fs';

import { assert, expect }  from 'chai';
import dircompare          from 'dir-compare';

import BetterErrors        from '../../src/BetterErrors.js';

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
            console.log(`Difference - name1: ${diff.name1}, type1: ${diff.type1}, name2: ${diff.name2}, ` +
             `type2: ${diff.type2}, state: ${diff.state}`);
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
            console.log(`Difference - name1: ${diff.name1}, type1: ${diff.type1}, name2: ${diff.name2}, ` +
             `type2: ${diff.type2}, state: ${diff.state}`);
         });
      }

      assert(result);
   });

   it(`Test toString() on all-errors (asArray)`, () =>
   {
      let betterErrors = JSON.parse(fs.readFileSync('./test/fixture/data/asArray/json/all-errors.json', 'utf-8'));
      let betterLog = fs.readFileSync('./test/fixture/data/asArray/log/all-errors.log', 'utf-8');

      // Must strip line terminators for correct tests across OSes.
      betterErrors = BetterErrors.toString(betterErrors).replace(/[\r\n]/gm, '');
      betterLog = betterLog.replace(/[\r\n]/gm, '');

      expect(betterErrors).to.be.deep.equal(betterLog);
   });

   it(`Test toString() on all-errors (asObject)`, () =>
   {
      let betterErrors = JSON.parse(fs.readFileSync('./test/fixture/data/asObject/json/all-errors.json', 'utf-8'));
      let betterLog = fs.readFileSync('./test/fixture/data/asObject/log/all-errors.log', 'utf-8');

      // Must strip line terminators for correct tests across OSes.
      betterErrors = BetterErrors.toString(betterErrors).replace(/[\r\n]/gm, '');
      betterLog = betterLog.replace(/[\r\n]/gm, '');

      expect(betterErrors).to.be.deep.equal(betterLog);
   });

   it(`Test toString() regex against first two entries of type-array-contains log (asArray)`, () =>
   {
      const betterErrors = JSON.parse(fs.readFileSync(
       './test/fixture/data/asArray/json/type-array-contains.json', 'utf-8'));

      expect(BetterErrors.toString(betterErrors, /^\/type-array-contains\/[0-1]/)).to.be.deep.equal(s_RESULT_REGEX);
   });

   it(`Test toString() regex against first two entries of type-array-contains json (asObject)`, () =>
   {
      const betterErrors = JSON.parse(fs.readFileSync(
       './test/fixture/data/asObject/json/type-array-contains.json', 'utf-8'));

      expect(BetterErrors.toString(betterErrors, /^\/type-array-contains\/[0-1]/)).to.be.deep.equal(s_RESULT_REGEX);
   });
});

const s_RESULT_REGEX =
`/type-array-contains/0 must be boolean
  1 | {
  2 |   "type-array-contains": [
> 3 |     "not boolean",
    |     ^^^^^^^^^^^^^
  4 |     "not boolean",
  5 |     "not boolean",
  6 |     "not boolean"

/type-array-contains/1 must be boolean
  2 |   "type-array-contains": [
  3 |     "not boolean",
> 4 |     "not boolean",
    |     ^^^^^^^^^^^^^
  5 |     "not boolean",
  6 |     "not boolean"
  7 |   ]`;
