import CodeFrame  from '@babel/code-frame';
import jsonMap    from 'json-source-map';
import hash       from 'object-hash';

/**
 * Provides a mechanism to convert AJV validation errors output to human readable messages including optional
 * code frames given string source of the JSON object validated. There are two main methods `asArray` and `asObject`
 * which parse the AJV errors array. The array version returns an array with all entries parsed. The object version
 * returns an object with the JSON pointer as keys with an array of errors associated with the key.
 *
 * Additionally there are helper methods which provide easy ways to reduce the better errors output to a string and
 * create iterators that also have optional regex parsing capabilities to iterate over specific JSON pointer error
 * data.
 */
export default class BetterErrors
{
   /**
    * Accepts an array of `ajv` errors and returns an array of JSON data with better error messages suitable for
    * displaying to end users. If a JSON file string is provided code frames are output as well. A final option
    * is to turn off code highlighting.
    *
    * @param {object[]} ajvErrors - An array of `ajv` errors.
    *
    * @param {object}   options - An array options.
    *
    * @param {string}   [options.file] - The JSON file string of to produce a code frame for against `ajv` errors.
    *
    * @param {boolean}  [options.highlightCode=true] - A boolean enabling code highlighting.
    *
    * @param {number}   [options.wrapLength] - An integer specifying a line length to wrap the output message.
    *
    * @returns {{codeFrame: string, error: object, keyword: string, message: string, instancePath: string}[]} -
    */
   static asArray(ajvErrors, options)
   {
      return betterErrors(ajvErrors, new HandlerArray(), options);
   }

   /**
    * Accepts an array of `ajv` errors and returns an object of JSON data with better error messages suitable for
    * displaying to end users. The keys are the JSON pointers of the errors that reference an array of the better
    * error message data. If a JSON file string is provided code frames are output as well. A final option
    * is to turn off code highlighting.
    *
    * @param {object[]} ajvErrors - An array of `ajv` errors.
    *
    * @param {object}   options - An array options.
    *
    * @param {string}   [options.file] - The JSON file string of to produce a code frame for against `ajv` errors.
    *
    * @param {boolean}  [options.highlightCode=true] - A boolean enabling code highlighting.
    *
    * @param {number}   [options.wrapLength] - An integer specifying a line length to wrap the output message.
    *
    * @returns {{codeFrame: string, error: object, keyword: string, message: string, instancePath: string}[]} -
    */
   static asObject(ajvErrors, options)
   {
      return betterErrors(ajvErrors, new HandlerObject(), options);
   }

   /**
    * Returns a string representation of the AJV errors.
    *
    * @param {object[]} ajvErrors - An array of `ajv` errors.
    *
    * @param {object}   options - An array options.
    *
    * @param {RegExp}   [regex] - An optional regex to filter errors for matching JSON pointers.
    *
    * @returns {string} -
    */
   static asString(ajvErrors, options, regex)
   {
      return BetterErrors.toString(BetterErrors.asArray(ajvErrors, options), regex);
   }

   /**
    * Returns an integer length for the better errors array or object.
    *
    * @param {object}   betterErrors - Better errors array or object.
    *
    * @param {RegExp}   [regex] - An optional regex to filter errors for matching JSON pointers.
    *
    * @returns {number} -
    */
   static length(betterErrors, regex)
   {
      let cntr = 0;

      // eslint-disable-next-line no-unused-vars
      for (const error of BetterErrors.iterator(betterErrors, regex))
      {
         cntr++;
      }

      return cntr;
   }

   /**
    * Provides an iterator for the better errors array or object that returns entries; [count, error].
    *
    * @param {object}   betterErrors - Better errors array or object.
    *
    * @param {RegExp}   [regex] - An optional regex to filter errors for matching JSON pointers.
    *
    * @yields
    */
   static *entries(betterErrors, regex)
   {
      let cntr = 0;

      for (const error of BetterErrors.iterator(betterErrors, regex))
      {
         yield [cntr++, error];
      }
   }

   /**
    * Provides an iterator for the better errors array or object.
    *
    * @param {object}   betterErrors - Better errors array or object.
    *
    * @param {RegExp}   [regex] - An optional regex to filter errors for matching JSON pointers.
    *
    * @yields
    */
   static *iterator(betterErrors, regex)
   {
      if (!Array.isArray(betterErrors) && typeof betterErrors !== 'object')
      {
         throw new TypeError(`'betterErrors' is not an array or object.`);
      }

      if (regex !== void 0 && regex !== null && !(regex instanceof RegExp))
      {
         throw new TypeError(`'regex' is not a RegExp.`);
      }

      if (Array.isArray(betterErrors))
      {
         for (const error of betterErrors)
         {
            if (regex)
            {
               if (regex.test(error.instancePath))
               {
                  yield error;
               }
            }
            else
            {
               yield error;
            }
         }
      }
      else if (typeof betterErrors === 'object')
      {
         for (const instancePath in betterErrors)
         {
            // eslint-disable-next-line no-prototype-builtins
            if (betterErrors.hasOwnProperty(instancePath))
            {
               for (const error of betterErrors[instancePath])
               {
                  if (regex)
                  {
                     if (regex.test(error.instancePath))
                     {
                        yield error;
                     }
                  }
                  else
                  {
                     yield error;
                  }
               }
            }
         }
      }
   }

   /**
    * Return a string for the better errors array or object.
    *
    * @param {object}   betterErrors - Better errors array or object.
    *
    * @param {RegExp}   [regex] - An optional regex to filter errors for matching JSON pointers.
    *
    * @returns {string} -
    */
   static toString(betterErrors, regex)
   {
      let result = '';

      const length = BetterErrors.length(betterErrors, regex);

      for (const [cntr, error] of BetterErrors.entries(betterErrors, regex))
      {
         result += error.codeFrame !== '' ? `${error.message}\n${error.codeFrame}` : `${error.message}`;
         result += cntr < length - 1 ? '\n\n' : '';
      }

      return result;
   }

   /**
    * Wires up ValidateManifest on the plugin eventbus.
    *
    * @param {object} ev - PluginEvent - The plugin event.
    *
    * @see https://www.npmjs.com/package/typhonjs-plugin-manager
    *
    * @ignore
    */
   static onPluginLoad(ev)
   {
      const eventbus = ev.eventbus;

      const options = ev.pluginOptions;

      let guard = true;

      // Apply any plugin options.
      if (typeof options === 'object')
      {
         if (typeof options.guard === 'boolean') { guard = options.guard; }
      }

      eventbus.on(`typhonjs:utils:better:ajv:errors:as:array`, BetterErrors.asArray, BetterErrors, { guard });
      eventbus.on(`typhonjs:utils:better:ajv:errors:as:object`, BetterErrors.asObject, BetterErrors, { guard });
      eventbus.on(`typhonjs:utils:better:ajv:errors:as:string`, BetterErrors.asString, BetterErrors, { guard });
      eventbus.on(`typhonjs:utils:better:ajv:errors:to:string`, BetterErrors.toString, BetterErrors, { guard });
   }
}

/**
 * Stores converted AJV errors in an array.
 */
class HandlerArray
{
   constructor() { this._results = []; }

   /**
    * Returns the data gathered.
    *
    * @returns {object[]} -
    */
   get data() { return this._results; }

   /**
    * Pushes the converted AJV error to the results array.
    *
    * @param {object}   data - better error data for a single AJV error.
    */
   push(data) { this._results.push(data); }
}

/**
 * Stores converted AJV errors by JSON pointer to an array of errors for that pointer in an object.
 */
class HandlerObject
{
   /**
    */
   constructor()
   {
      this._results = {};
   }

   /**
    * Returns the data gathered.
    *
    * @returns {object} -
    */
   get data()
   {
      return this._results;
   }

   /**
    * Pushes the converted AJV error to the results object.
    *
    * @param {object}   data - better error data for a single AJV error.
    */
   push(data)
   {
      if (this._results[data.instancePath] === void 0)
      {
         this._results[data.instancePath] = [data];
      }
      else
      {
         this._results[data.instancePath].push(data);
      }
   }
}


/**
 * Accepts an array of `ajv` errors and returns an array of JSON data with better error messages suitable for
 * displaying to end users. If a JSON file string is provided code frames are output as well. A final option
 * is to turn off code highlighting.
 *
 * @param {object[]} errors - An array of `ajv` errors.
 *
 * @param {object}   handler - The internal handler class that formats the data returned.
 *
 * @param {object}   options - An array options.
 *
 * @param {string}   [options.file] - The JSON file string of to produce a code frame for against `ajv` errors.
 *
 * @param {boolean}  [options.highlightCode=true] - A boolean enabling code highlighting.
 *
 * @param {number}   [options.wrapLength] - An integer specifying a line length to wrap the output message.
 *
 * @returns {{codeFrame: string, error: object, keyword: string, message: string, instancePath: string}[]} -
 */
function betterErrors(errors, handler, { file, highlightCode = true, wrapLength } = {})
{
   if (!Array.isArray(errors)) { throw new TypeError(`'errors' must be an array.`); }

   if (file !== void 0 && typeof file !== 'string')
   {
      throw new TypeError(`'options.file' must be a string.`);
   }

   if (typeof highlightCode !== 'boolean') { throw new TypeError(`'options.highlightCode' must be a boolean.`); }

   if (wrapLength !== void 0 && (!Number.isInteger(wrapLength) || wrapLength < 10))
   {
      throw new TypeError(`'options.wrapLength' must be a positive integer greater than 10.`);
   }

   let jsonData = null;

   if (typeof file === 'string')
   {
      jsonData = jsonMap.parse(file);
   }

   const duplicateSet = new Set();

   for (const error of errors)
   {
      if (typeof error !== 'object') { continue; }
      if (typeof error.instancePath !== 'string') { continue; }
      if (typeof error.keyword !== 'string') { continue; }

      // Create a hash of the error and test against the duplicate set to avoid handling duplicate errors.
      {
         // Store the schema path temporarily to create the error hash.
         const tempSchemaPath = error.schemaPath;
         delete error.schemaPath;

         // Create the error hash and check against the duplicate set.
         const errorHash = hash(error);
         if (duplicateSet.has(errorHash)) { continue; }

         duplicateSet.add(errorHash);

         // Return the schema path to the error.
         error.schemaPath = tempSchemaPath;
      }

      const instancePath = error.instancePath;
      const keyword = error.keyword;

      // Provide a space between instancePath and message only if instancePath is defined.
      const space = instancePath !== '' ? ' ' : '';

      let codeFrame = '';
      let message = '';
      let jsonPointerLocs = null;
      let jsonPointerIndex = 'value';
      let codeFrameNoColumn = false;
      let jsonPointerLines = 0;

      if (jsonData !== null)
      {
         jsonPointerLocs = JSON.parse(JSON.stringify(jsonData.pointers[instancePath]));
         jsonPointerLines = jsonPointerLocs.valueEnd.line - jsonPointerLocs.value.line;
      }

      switch (keyword)
      {
         // Presently compound keywords are simply ignored. Use `ajv-errors` and create specific error messages for your
         // compound JSON schema machinations. However, I'd gladly welcome PRs that adequately implement compound
         // keywords.
         case 'oneOf':
         case 'anyOf':
         case 'allOf':
         case 'if':
            continue;

         // All of the following keywords have a default message, but highlight the key in the code frame.
         case 'additionalItems':
         case 'contains':
         case 'maxItems':
         case 'minItems':
         case 'maxProperties':
         case 'minProperties':
         case 'propertyNames':
         case 'required':
         case 'uniqueItems':
            message = `${instancePath}${space}${error.message}`;

            // If there is an associated key switch to the key otherwise stay on the 'value' as the pointer index.
            if (jsonPointerLocs !== null)
            {
               if (jsonPointerLocs.key !== void 0)
               {
                  jsonPointerIndex = 'key';
               }
               else
               {
                  // Limit total lines and turn off columns for code frames if lines greater than 2.
                  if (jsonPointerLines > 2)
                  {
                     codeFrameNoColumn = true;
                     jsonPointerLocs.valueEnd.line = Math.min(jsonPointerLocs.valueEnd.line,
                      jsonPointerLocs.value.line + 2);
                  }
               }
            }
            break;

         // Use the `additionalProperty` param value to highlight the specific key.
         case 'additionalProperties':
            message = `${instancePath}${space}${error.message}: '${error.params.additionalProperty}'`;

            if (jsonData !== null)
            {
               jsonPointerLocs = JSON.parse(JSON.stringify(
                jsonData.pointers[`${instancePath}/${error.params.additionalProperty}`]));

               // If there is an associated key switch to the key otherwise stay on the 'value' as the pointer index.
               if (jsonPointerLocs !== null && jsonPointerLocs.key !== void 0)
               {
                  jsonPointerIndex = 'key';
               }
            }
            break;

         // Use the `allowedValue` param to include the actual const value in the message.
         case 'const':
            message = `${instancePath}${space}${error.message}: '${error.params.allowedValue}'`;
            break;

         // Use the `allowedValues` param to include the actual enum values in the message.
         case 'enum':
            message = `${instancePath}${space}${error.message}: ${formatItemArray(error.params.allowedValues, 
             { quote: true })}`;
            break;

         // Use the `type` param to include the actual type values when more than one apply.
         case 'type':
            message = Array.isArray(error.params.type) ?
             `${instancePath}${space}should be ${formatItemArray(error.params.type)}` :
              `${instancePath}${space}${error.message}`;
            break;

         default:
            message = `${instancePath}${space}${error.message}`;
            break;
      }

      // Potentially wrap the message length if `wrapLength` is defined.
      if (Number.isInteger(wrapLength))
      {
         message = wrap(message, wrapLength);
      }

      if (jsonData !== null && jsonPointerLocs !== null && codeFrame === '')
      {
         codeFrame = generateCodeFrame(file, jsonPointerLocs, jsonPointerIndex, { codeFrameNoColumn, highlightCode });
      }

      handler.push({ codeFrame, instancePath, error, keyword, message });
   }

   return handler.data;
}

/**
 * Formats an array of values with commas and an ending coordinating conjunction.
 *
 * @param {string[]} array - Array to format.
 *
 * @param {object} [options] - Options
 *
 * @param {string} [options.conjunction='or'] - Optional conjunction.
 *
 * @param {boolean} [options.quote=false] - Optional quoting of items.
 *
 * @returns {string} Formatted string.
 */
function formatItemArray(array, { conjunction = 'or', quote = false } = {})
{
   let result = '';

   switch (array.length)
   {
      /* c8 ignore start */
      case 0:
         break;
      /* c8 ignore stop */

      case 1:
         result = quote ? `'${array[0]}'` : `${array[0]}`;
         break;

      case 2:
         result = quote ? `'${array[0]}' ${conjunction} '${array[1]}'` : `${array[0]} ${conjunction} ${array[1]}`;
         break;

      default:
         for (let cntr = 0; cntr < array.length; cntr++)
         {
            if (quote)
            {
               result += cntr === array.length - 1 ? `${conjunction} '${array[cntr]}'` : `'${array[cntr]}', `;
            }
            else
            {
               result += cntr === array.length - 1 ? `${conjunction} ${array[cntr]}` : `${array[cntr]}, `;
            }
         }
         break;
   }

   return result;
}

/**
 * Generates a code frame from the provided file string and jsonPointerLocs instance. Optional parameters available
 * to control @babel/code-frame output.
 *
 * @param {string}   file - A string representation of the code to generate a code frame.
 *
 * @param {object}   jsonPointerLocs - A JSON pointer location from `json-source-map`
 *
 * @param {string}   jsonPointerIndex - A string indicating 'key' or 'value' determining the attribute type to
 *                                      highlight.
 *
 * @param {object}  options - Options
 *
 * @param {boolean}  options.codeFrameNoColumn - A boolean indicating if columns should be highlighted
 *
 * @param {boolean}  options.highlightCode - Highlight code w/ escape colors.
 *
 * @param {number}   [options.linesAbove=2] - Lines to include above location indicated in `jsonPointerLocs`
 *
 * @param {number}   [options.linesBelow=3] - Lines to include below location indicated in `jsonPointerLocs`
 *
 * @returns {string} - The code frame captured.
 */
function generateCodeFrame(file, jsonPointerLocs, jsonPointerIndex,
 { codeFrameNoColumn, highlightCode, linesAbove = 2, linesBelow = 3 } = {})
{
   let location;

   const index = jsonPointerIndex;
   const indexEnd = `${jsonPointerIndex}End`;

   if (codeFrameNoColumn)
   {

      /* istanbul ignore next */  // Add 1 to line for @babel/code-frame; presently not used.
      location = {
         start: { line: jsonPointerLocs[index].line + 1 },
         end: { line: jsonPointerLocs[indexEnd].line + 1 }
      };
   }
   else
   {
      // Add 1 to line and column for @babel/code-frame
      location = {
         start: { line: jsonPointerLocs[index].line + 1, column: jsonPointerLocs[index].column + 1 },
         end: { line: jsonPointerLocs[indexEnd].line + 1, column: jsonPointerLocs[indexEnd].column + 1 }
      };
   }

   return CodeFrame.codeFrameColumns(file, location, { highlightCode, linesAbove, linesBelow });
}

/**
 * Wraps a string to the given line length.
 *
 * @param {string}   string - String to wrap.
 *
 * @param {number}   [length=80] - Integer line length.
 *
 * @returns {string} Wrapped string.
 */
function wrap(string, length)
{
   return string.replace(new RegExp(`(?![^\\n]{1,${length}}$)([^\\n]{1,${length}})\\s`, 'g'), '$1\n');
}
