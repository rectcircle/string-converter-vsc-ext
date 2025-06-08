# Change Log

All notable changes to the "str-conv" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

- [x] 启用区全新的触发方式 code action。
- [x] 将 base64 和 符号样式转换期默认触发方式改成 code action。
- [x] 标准化 string converter id。
- [x] 在 code action 展平符号样式转换器 rename 的展示方式。 
- [] 支持配置转换器的触发方式为 hover 或 code action。
- [] URL 误触严重问题。
- [] 添加 jsx 和 tsx 语言支持。

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
