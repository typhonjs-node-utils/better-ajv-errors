const { expect }     = require('chai');
const betterErrors   = require('../../src/bettererrors');

/**
 * Tests all of the API options regarding invoking better errors as an external consumer.
 */
describe('betterErrors various options', () =>
{
   it(`errors 'entry' no options`, () =>
   {
      expect(betterErrors(s_ERRORS)).to.be.deep.equal(s_RESULTS_NO_OPTIONS);
   });

   it(`errors 'entry' just file (default highlightCode: true), `, () =>
   {
      const results = betterErrors(s_ERRORS, { file: s_FILE });
      console.log(`!!! results:\n${JSON.stringify(results)}`);
      expect(results).to.be.deep.equal(s_RESULTS_JUST_FILE_WITH_HIGHLIGHTCODE);
      // expect(betterErrors(s_ERRORS, { file: s_FILE })).to.be.deep.equal(s_RESULTS_JUST_FILE_WITH_HIGHLIGHTCODE);
   });

   it(`errors 'entry' just file + highlightCode: true`, () =>
   {
      const results = betterErrors(s_ERRORS, { file: s_FILE, highlightCode: true });
      console.log(`!!! results:\n${JSON.stringify(results)}`);
      expect(results).to.be.deep.equal(s_RESULTS_JUST_FILE_WITH_HIGHLIGHTCODE);
      // expect(betterErrors(s_ERRORS, { file: s_FILE })).to.be.deep.equal(s_RESULTS_JUST_FILE_WITH_HIGHLIGHTCODE);
   });

   it(`errors 'entry' file + highlightCode: false`, () =>
   {
      expect(betterErrors(s_ERRORS, { file: s_FILE, highlightCode: false })).to.be.deep.equal(
       s_RESULTS_FILE_WITH_HIGHLIGHTCODE_FALSE);
   });

   it(`errors 'entry' just wrapLength: 20`, () =>
   {
      expect(betterErrors(s_ERRORS, { wrapLength: 20 })).to.be.deep.equal(s_RESULTS_WITH_WRAPLENGTH_20);
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
      codeFrame: "\u001b[0m \u001b[90m 1 | \u001b[39m{\u001b[0m\n\u001b[0m\u001b[31m\u001b[1m>\u001b[22m\u001b[39m\u001b[90m 2 | \u001b[39m   \u001b[32m\"author\"\u001b[39m\u001b[33m:\u001b[39m \u001b[36mfalse\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m   | \u001b[39m             \u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m 3 | \u001b[39m}\u001b[0m",
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
