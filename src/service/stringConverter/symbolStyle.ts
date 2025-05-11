import { TokenInfo } from "../codeParser";
import { isSymbolToken } from "../literalParser/interface";
import { StringConverter, StringConverterConvertResult, StringConverterMatchResult, StringConverterMeta, StringConverterOptions } from "./interface";

// Abc => abc
// AbcDef => abc, def
// GetIDName => get id name
// Str123 => str123
// Abc123Def => abc123, def
// abc_def => undefined
// abcDef => undefined
function tryParsePascalCase(str: string): undefined | string[] {
  if (!str || typeof str[0] !== 'string' || str[0] < 'A' || str[0] > 'Z') {
    return undefined;
  }

  for (let k = 0; k < str.length; k++) {
    const charK = str[k];
    const isLetter = (charK >= 'a' && charK <= 'z') || (charK >= 'A' && charK <= 'Z');
    const isDigit = charK >= '0' && charK <= '9';
    if (!isLetter && !isDigit) { // Checks for '_' or other symbols
      return undefined;
    }
  }

  const words: string[] = [];
  let currentWordStartIndex = 0;

  for (let i = 1; i <= str.length; i++) {
    if (i === str.length) {
      words.push(str.substring(currentWordStartIndex, i).toLowerCase());
      break;
    }

    const currentChar = str[i];
    const prevChar = str[i-1];

    const isCurrentCharUpper = currentChar >= 'A' && currentChar <= 'Z';
    
    const isPrevCharLower = prevChar >= 'a' && prevChar <= 'z';
    const isPrevCharUpper = prevChar >= 'A' && prevChar <= 'Z';
    const isPrevCharDigit = prevChar >= '0' && prevChar <= '9';

    // Rule 1: Uppercase follows lowercase (e.g., "c" then "D" in "AbcDef")
    if (isCurrentCharUpper && isPrevCharLower) {
      words.push(str.substring(currentWordStartIndex, i).toLowerCase());
      currentWordStartIndex = i;
      continue;
    }

    // Rule 2: Uppercase follows a digit (e.g., "3" then "D" in "Abc123Def")
    if (isCurrentCharUpper && isPrevCharDigit) {
      words.push(str.substring(currentWordStartIndex, i).toLowerCase());
      currentWordStartIndex = i;
      continue;
    }
    
    // Rule 3: Handling sequences of uppercase letters like "ID" in "GetIDName"
    if (isCurrentCharUpper && isPrevCharUpper) {
      if (i + 1 < str.length) {
        const nextChar = str[i+1];
        const isNextCharLower = nextChar >= 'a' && nextChar <= 'z';
        if (isNextCharLower) {
          words.push(str.substring(currentWordStartIndex, i).toLowerCase());
          currentWordStartIndex = i;
          continue;
        }
      }
    }
  }
  
  return words.length > 0 ? words : undefined;
}

function tryParseCamelCase(str: string): undefined | string[] {
  if (str.length === 0) {
    return undefined;
  }
  if (str[0] < 'a' || str[0] > 'z') {
    return undefined;
  }
  return tryParsePascalCase(str[0].toUpperCase() + str.slice(1)); 
}

function tryParseSnakeCase(str: string, upper: boolean = false): undefined | string[] {
  const pattern = upper ? /^[A-Z0-9]+(_[A-Z0-9]+)*$/ : /^[a-z0-9]+(_[a-z0-9]+)*$/;
  if (!pattern.test(str)) {
    return undefined;
  }
  
  return str.split('_');
}

function toPascalCase(words: string[]): string {
  return words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

function toCamelCase(words: string[]): string {
  const pascal = toPascalCase(words);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function toSnakeCase(words: string[], upper: boolean = false): string {
  return words.join('_')
    [upper ? 'toUpperCase' : 'toLowerCase']();
}

export class SymbolStyleConverter implements StringConverter<string[]> {

  meta: StringConverterMeta = {
    id: 'symbolStyle',
    name: 'Symbol Style Converter',
    resultLanguageId: 'plaintext',
  };
  
  match(tokenInfo: TokenInfo, options?: StringConverterOptions): StringConverterMatchResult<string[]> {
    if (!isSymbolToken(tokenInfo.type)) {
      return { matched: false };
    }
    
    let text = tokenInfo.text;

    // rust 宏
    if (text.endsWith('!')) {
        text = text.slice(0, -1);
    }

    let words: string[] | undefined;
    let style: 'pascal' | 'camel' |'snake_lower' |'snake_upper' | undefined;

    // 先尝试解析为 pascal case
    words = tryParsePascalCase(text);
    if (words) {
      style = 'pascal';
    }
    // 如果不是 pascal case，尝试解析为 camel case
    if (!words) {
      words = tryParseCamelCase(text);
      style = 'camel';
    }
    // 如果不是 camel case，尝试解析为 snake case
    if (!words) {
      words = tryParseSnakeCase(text, false);
      style = 'snake_lower';
    }
    // 如果不是 snake case，尝试解析为 snake case
    if (!words) {
      words = tryParseSnakeCase(text, true);
      style ='snake_upper';
    }
    if (!words || words.length === 0) {
      return { matched: false };
    }
    // 直接转换
    let results = [];
    if (style !== 'pascal') {
        const result = toPascalCase(words);
        if (result !== text) {
          results.push(result);
        }
    }
    if (style!== 'camel') {
        const result = toCamelCase(words);
        if (result!== text) {
          results.push(result);
        }
    }
    if (style!== 'snake_lower') {
        const result = toSnakeCase(words, false);
        if (result!== text) {
          results.push(result);
        }
    }
    if (style!=='snake_upper') {
        const result = toSnakeCase(words, true);
        if (result!== text) {
          results.push(result);
        }
    }
    // rust 宏
    if (tokenInfo.text.endsWith('!')) {
      results = results.map(r => r + '!');
    }
    return { matched: true, byProduct: results };
  }
  
  convert(tokenInfo: TokenInfo, byproductOfMatch?: string[], options?: StringConverterOptions): StringConverterConvertResult {
    const result = byproductOfMatch || this.match(tokenInfo).byProduct;
    if (!result) {
      throw new Error(`\`${tokenInfo.text}\` is not a valid symbol`);
    }

    

    return {
      result: result.map(r => {
            return {
                result: r,
                actions: ['copy', 'rename'],
            };
        }),
    };
  }
}
