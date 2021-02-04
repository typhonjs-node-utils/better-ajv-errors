const fs                = require('fs');
const path              = require('path');

const Ajv               = require("ajv").default;

const chai              = require('chai');
const stripJsonComments = require('strip-json-comments');

const betterErrors      = require('../../src/bettererrors');

// Will create any results that are missing when true.
const s_CREATE_RESULTS  = false;

const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });

// Ajv option allErrors is required
require("ajv-errors")(ajv);

const schema = JSON.parse(stripJsonComments(fs.readFileSync('./test/fixture/schema/test.json5', 'utf8')));

const validate = ajv.compile(schema);

/**
 * Provides convenience methods to setup Mocha tests based on JSON data files.
 */
class TestRunner
{
   /**
    * Handles invalid validation tests opening a source JSON file and comparing validation errors to stored error data.
    *
    * @param {string}   dirPath - The directory to open error and invalid data.
    */
   static invalid(dirPath)
   {
      const invalidPath = `${dirPath}${path.sep}invalid`;
      const resultsPath = `${dirPath}${path.sep}results`;

      if (!fs.existsSync(resultsPath) || !fs.existsSync(invalidPath)) { return; }

      const results = TestRunner.loadFiles(resultsPath, '.log');
      const invalidData = TestRunner.loadFiles(invalidPath);

      for (const key of invalidData.keys())
      {
         const invalid = invalidData.get(key);

         it(key, (done) =>
         {
            validate(invalid.data);

            if (Array.isArray(validate.errors) && validate.errors.length > 0)
            {
               const resultKey = `${invalid.baseNameNoExt}.log`;
               const betterData = betterErrors(validate.errors, { file: invalid.file, highlightCode: false });

               const result = results.get(resultKey);

               let betterOutput = '';
               for (const betterEntry of betterData)
               {
                  betterOutput += `${betterEntry.message}\n${betterEntry.codeFrame}\n\n`;
               }

               if (result === void 0)
               {
                  if (s_CREATE_RESULTS)
                  {
                     fs.writeFileSync(`${dirPath}${path.sep}results${path.sep}${resultKey}`, betterOutput);
                  }

                  const msg = s_CREATE_RESULTS ? ' - creating it' : '';

                  done(new Error(
                   `Error data for'${resultKey}' missing${msg}:\n${JSON.stringify(validate.errors, null, 3)}`));

                  // done(new Error(
                  //  `Error data for'${resultKey}' missing${msg}:\n${betterOutput}`));
               }

               chai.expect(betterOutput).to.be.deep.equal(results.get(resultKey).data);
               done();
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
    * @returns {Map<string, object>}
    */
   static loadFiles(dir = '.', extension = '.json5')
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
               file = stripJsonComments(fs.readFileSync(absPath, 'utf8'));
               data = extension === '.json' || extension === '.json5' ? JSON.parse(file) : file;
            }
            catch (err)
            {
               process.stderr.write(`Couldn't load as JSON: ${absPath}\n`);
               throw err;
            }

            results.set(baseName, {
               absPath,
               baseName,
               baseNameNoExt,
               data,
               file
            });
         }
      });

      return results;
   }

   /**
    * Runs all applicable tests depending on data defined in `test.js`
    */
   static run()
   {
      describe(`betterErrors invalid results`, () =>
      {
         TestRunner.invalid(`./test/fixture/data`);
      });
   }
}

module.exports = TestRunner;
