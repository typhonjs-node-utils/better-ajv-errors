import fs            from 'fs';
import path          from 'path';

import Ajv           from 'ajv';
import ajvErrors     from 'ajv-errors';
import ajvFormats    from 'ajv-formats';
import chai          from 'chai';

import BetterErrors  from '../../src/BetterErrors.js';

// Will create any results that are missing when true.
const s_CREATE_RESULTS  = false;

const ajv = new Ajv.default({ allErrors: true, allowUnionTypes: true });

// Ajv options allErrors & all-formats are required
ajvErrors(ajv);
ajvFormats(ajv);

const schema = JSON.parse(fs.readFileSync('./test/fixture/schema/test.json', 'utf8'));

const validate = ajv.compile(schema);

/**
 * Provides convenience methods to setup Mocha tests based on JSON data files.
 */
export default class TestRunner
{
   /**
    * Handles invalid validation tests opening a source JSON file and comparing validation errors to stored error data.
    *
    * @param {string}   dirPath - The directory to open error and invalid data.
    * @param {string}   testFunction - The test function to test and directory for results.
    */
   static invalid(dirPath, testFunction)
   {
      const invalidPath = `${dirPath}${path.sep}invalid`;
      const resultsLogPath = `${dirPath}${path.sep}${testFunction}${path.sep}log`;
      const resultsJSONPath = `${dirPath}${path.sep}${testFunction}${path.sep}json`;

      if (!fs.existsSync(resultsLogPath) || !fs.existsSync(invalidPath)) { return; }

      const resultsLog = TestRunner.loadFiles(resultsLogPath, '.log');
      const resultsJSON = TestRunner.loadFiles(resultsJSONPath);
      const invalidData = TestRunner.loadFiles(invalidPath);

      for (const key of invalidData.keys())
      {
         const invalid = invalidData.get(key);

         it(key, (done) =>
         {
            validate(invalid.data);

            if (Array.isArray(validate.errors) && validate.errors.length > 0)
            {
               const resultLog = resultsLog.get(key);
               const resultJSON = resultsJSON.get(key);

               const betterData = BetterErrors[testFunction](validate.errors,
                { file: invalid.file, highlightCode: false });

               if (resultLog === void 0)
               {
                  if (s_CREATE_RESULTS)
                  {
                     fs.writeFileSync(`${resultsLog.$$path}${path.sep}${key}.log`,
                      BetterErrors.toString(betterData));
                  }
               }

               if (resultJSON === void 0)
               {
                  const resultJSONData = JSON.stringify(betterData, null, 3);

                  if (s_CREATE_RESULTS)
                  {
                     fs.writeFileSync(`${resultsJSON.$$path}${path.sep}${key}.json`, resultJSONData);
                  }

                  const msg = s_CREATE_RESULTS ? ' - creating it' : '';

                  done(new Error(`Error data for '${key}' missing${msg}:\n${resultJSONData}`));
               }
               else
               {
                  chai.expect(betterData).to.be.deep.equal(resultJSON.data);
                  done();
               }
            }
            else
            {
               done(new Error(`Data should have been invalid:\n${JSON.stringify(invalid.data, null, 3)}`));
            }
         });
      }
   }

   /**
    * Returns a Map of all files found in the directory provided.
    *
    * @param {string} dir - Directory to read.
    * @param {string} extension - File extension to read.
    *
    * @returns {Map<string, object>} -
    */
   static loadFiles(dir = '.', extension = '.json')
   {
      const results = new Map();

      fs.readdirSync(dir).forEach((filename) =>
      {
         const absPath = path.resolve(dir, filename);
         const stat = fs.statSync(absPath);
         const isFile = stat.isFile() && path.extname(filename) === extension;

         if (isFile)
         {
            const baseName = path.basename(absPath);
            const baseNameNoExt = path.basename(absPath, extension);

            let data, file;

            try
            {
               file = fs.readFileSync(absPath, 'utf8');
               data = extension === '.json' ? JSON.parse(file) : file;
            }
            catch (err)
            {
               process.stderr.write(`Couldn't load as JSON: ${absPath}\n`);
               throw err;
            }

            results.set(baseNameNoExt, {
               absPath,
               baseName,
               baseNameNoExt,
               data,
               file
            });
         }
      });

      results.$$path = dir;

      return results;
   }

   /**
    * Runs all applicable tests depending on data defined in `test.js`
    */
   static run()
   {
      describe(`betterErrors invalid results`, () =>
      {
         TestRunner.invalid(`./test/fixture/data`, 'asArray');
         TestRunner.invalid(`./test/fixture/data`, 'asObject');
      });
   }
}
