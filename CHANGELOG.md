# Change Log

All notable changes to the "str-conv" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

- [ ] Add html, vue language support, and optimize the parsing of html tags in jsx and tsx.

## [1.2.1]

Added

- Enabled a new trigger method: code action.
- Flattened the display of the rename symbol style converter in code actions.
- Support configuring the trigger method for converters as hover or code action.
- Support for jsx and tsx languages.
- `package.json` vscode i10n support chinese.

Changed

- The default trigger method for base64 and symbol style converters to code action.
- Standardized string converter IDs.

Fixed

- Do not trigger if the URL string contains a newline character.


## [1.1.0]

- Added symbol style converter and supports one-click renaming of symbols to other styles.
- Fix some identifier was misidentified as base64.

## [1.0.4]

- Fix url match bug.
- Fix a selection unit test failure.
- Fix english word match to base64 bug.
- Fix hover special char `)` render bug.
- Support C/C++ string literal parsing.

## [1.0.3]

- Remove markdown footnotes extensions dependencies.

## [1.0.2]

- Fix markdown footnotes extensions dependencies.

## [1.0.1]

- Fix package json url error.

## [1.0.0]

- Initial release
- Programming language literal parsing
- JWT token parsing
- Timestamp conversion
- Base64 decoding
- URL parsing
- JSON formatting
