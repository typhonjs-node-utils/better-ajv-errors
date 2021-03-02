import { expect }    from 'chai';
import BetterErrors  from '../../src/BetterErrors.js';

/**
 * Tests all of the API options regarding invoking better errors as an external consumer.
 */
describe('betterErrors various options (asArray)', () =>
{
   it(`errors 'entry' no options`, () =>
   {
      expect(BetterErrors.asArray(s_ERRORS)).to.be.deep.equal(s_RESULTS_NO_OPTIONS);
   });

   // Skip color tests on GH actions as terminal is redirected and @babel/codeframe defaults to no color.
   if (process.env.CI !== 'true')
   {
      it(`errors 'entry' just file (default highlightCode: true), `, () =>
      {
         expect(BetterErrors.asArray(s_ERRORS, { file: s_FILE })).to.be.deep.equal(
          s_RESULTS_JUST_FILE_WITH_HIGHLIGHTCODE);
      });

      it(`errors 'entry' just file + highlightCode: true`, () =>
      {
         expect(BetterErrors.asArray(s_ERRORS, { file: s_FILE })).to.be.deep.equal(
          s_RESULTS_JUST_FILE_WITH_HIGHLIGHTCODE);
      });
   }

   it(`errors 'entry' file + highlightCode: false`, () =>
   {
      expect(BetterErrors.asArray(s_ERRORS, { file: s_FILE, highlightCode: false })).to.be.deep.equal(
       s_RESULTS_FILE_WITH_HIGHLIGHTCODE_FALSE);
   });

   it(`errors 'entry' just wrapLength: 20`, () =>
   {
      expect(BetterErrors.asArray(s_ERRORS, { wrapLength: 20 })).to.be.deep.equal(s_RESULTS_WITH_WRAPLENGTH_20);
   });

   it(`errors 'entry' toString() no code frame equals wrapLength: 20`, () =>
   {
      const betterErrors = BetterErrors.asArray(s_ERRORS, { wrapLength: 20 });

      expect(BetterErrors.toString(betterErrors)).to.be.deep.equal(s_RESULTS_WITH_WRAPLENGTH_20[0].message);
   });
});

const s_ERRORS =
[
   {
      keyword: 'type',
      dataPath: '/author',
      schemaPath: '#/definitions/author/type',
      params: {
         type: 'string'
      },
      message:
       `A really long error message string that needs to be wrapped, so let's check that indeed it's wrapped or not.`
   }
];

const s_FILE =
`{
   "author": false
}`;

const s_RESULTS_NO_OPTIONS =
[
   {
      codeFrame: "",
      dataPath: "/author",
      error: {
         keyword: "type",
         dataPath: "/author",
         schemaPath: "#/definitions/author/type",
         params: {
            type: "string"
         },
         message: "A really long error message string that needs to be wrapped, so let's check that indeed it's wrapped or not."
      },
      keyword: "type",
      message: "/author A really long error message string that needs to be wrapped, so let's check that indeed it's wrapped or not."
   }
];

const s_RESULTS_JUST_FILE_WITH_HIGHLIGHTCODE =
[
   {
      codeFrame: "\u001b[0m \u001b[90m 1 |\u001b[39m {\u001b[0m\n\u001b[0m\u001b[31m\u001b[1m>\u001b[22m\u001b[39m\u001b[90m 2 |\u001b[39m    \u001b[32m\"author\"\u001b[39m\u001b[33m:\u001b[39m \u001b[36mfalse\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m   |\u001b[39m              \u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m 3 |\u001b[39m }\u001b[0m",
      dataPath: "/author",
      error: {
         keyword: "type",
         dataPath: "/author",
         schemaPath: "#/definitions/author/type",
         params: {
            type: "string"
         },
         message: "A really long error message string that needs to be wrapped, so let's check that indeed it's wrapped or not."
      },
      keyword: "type",
      message: "/author A really long error message string that needs to be wrapped, so let's check that indeed it's wrapped or not."
   }
];

const s_RESULTS_FILE_WITH_HIGHLIGHTCODE_FALSE =
[
   {
      codeFrame: "  1 | {\n> 2 |    \"author\": false\n    |              ^^^^^\n  3 | }",
      dataPath: "/author",
      error: {
         keyword: "type",
         dataPath: "/author",
         schemaPath: "#/definitions/author/type",
         params: {
            type: "string"
         },
         message: "A really long error message string that needs to be wrapped, so let's check that indeed it's wrapped or not."
      },
      keyword: "type",
      message: "/author A really long error message string that needs to be wrapped, so let's check that indeed it's wrapped or not."
   }
];

const s_RESULTS_WITH_WRAPLENGTH_20 =
[
   {
      codeFrame: "",
      dataPath: "/author",
      error: {
         keyword: "type",
         dataPath: "/author",
         schemaPath: "#/definitions/author/type",
         params: {
            type: "string"
         },
         message: "A really long error message string that needs to be wrapped, so let's check that indeed it's wrapped or not."
      },
      keyword: "type",
      message: "/author A really\nlong error message\nstring that needs to\nbe wrapped, so let's\ncheck that indeed\nit's wrapped or not."
   }
];
