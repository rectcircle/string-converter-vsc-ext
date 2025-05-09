import { isStringToken, StringLiteralParseResult } from "./interface";

export function parsePythonStringLiteral(originText: string, type: string): StringLiteralParseResult {
    if (!originText) {
        return { text: originText };
    }

    if (!isStringToken(type)) {
        return { text: originText };
    }
    
    // 检查是否是raw string
    const isRawString = originText.startsWith('r') || originText.startsWith('R');
    const rawStringPrefix = isRawString ? originText[0] : '';
    const textToParse = isRawString ? originText.slice(1) : originText;

    // 检查是否是Python字符串（单引号、双引号、三引号）
    const isSingleQuote = textToParse.startsWith("'") && textToParse.endsWith("'");
    const isDoubleQuote = textToParse.startsWith('"') && textToParse.endsWith('"');
    const isTripleQuote = (textToParse.startsWith("'''") && textToParse.endsWith("'''")) || 
                         (textToParse.startsWith('"""') && textToParse.endsWith('"""'));
    
    if (!isSingleQuote && !isDoubleQuote && !isTripleQuote) {
        return { text: originText };
    }

    // 确定引号类型和长度
    let quoteLength = 1;
    let quoteChar = textToParse[0];
    if (isTripleQuote) {
        quoteLength = 3;
        quoteChar = textToParse.slice(0, 3);
    }

    // 移除引号
    const content = textToParse.slice(quoteLength, -quoteLength);

    // 如果是 raw string 则不处理转义
    if (isRawString) {
        return {
            text: content,
            startMarker: rawStringPrefix + quoteChar,
            endMarker: quoteChar
        };
    }

    // 处理转义字符
    const result: string[] = [];
    let i = 0;

    while (i < content.length) {
        const char = content[i];

        if (char === '\\') {
            // 处理转义字符（如果是raw string则不处理转义）
            // https://docs.python.org/3/reference/lexical_analysis.html#escape-sequences
            if (i + 1 >= content.length) {
                result.push(char);
                break;
            }

            // 处理八进制转义序列
            if (i + 3 < content.length) {
                const octal = content.slice(i + 1, i + 4);
                if (/^[0-7]{3}$/.test(octal)) {
                    const charCode = parseInt(octal, 8);
                    if (charCode >= 0 && charCode <= 255) {
                        result.push(String.fromCharCode(charCode));
                        i += 4;
                        continue;
                    }
                }
            }

            const nextChar = content[i + 1];
            switch (nextChar) {
                case '"':
                case "'":
                case '\\':
                    result.push(nextChar);
                    i += 2;
                    break;
                case '\n':
                    // 忽略换行符
                    i += 2;
                    break;
                case 'n':
                    result.push('\n');
                    i += 2;
                    break;
                case 'r':
                    result.push('\r');
                    i += 2;
                    break;
                case 't':
                    result.push('\t');
                    i += 2;
                    break;
                case 'b':
                    result.push('\b');
                    i += 2;
                    break;
                case 'f':
                    result.push('\f');
                    i += 2;
                    break;
                case 'v':
                    result.push('\v');
                    i += 2;
                    break;
                case 'a':
                    result.push('\a');
                    i += 2;
                    break;
                case '0':
                    result.push('\0');
                    i += 2;
                    break;
                case 'x':
                    // 处理十六进制转义
                    if (i + 3 < content.length) {
                        const hex = content.slice(i + 2, i + 4);
                        if (/^[0-9a-fA-F]{2}$/.test(hex)) {
                            result.push(String.fromCharCode(parseInt(hex, 16)));
                            i += 4;
                            break;
                        }
                    }
                    // 如果不符合十六进制转义格式，则按原样处理
                    result.push(char);
                    i++;
                    break;
                case 'u':
                    // 处理16位Unicode转义
                    if (i + 5 < content.length) {
                        const hex = content.slice(i + 2, i + 6);
                        if (/^[0-9a-fA-F]{4}$/.test(hex)) {
                            result.push(String.fromCharCode(parseInt(hex, 16)));
                            i += 6;
                            break;
                        }
                    }
                    // 如果不符合Unicode转义格式，则按原样处理
                    result.push(char);
                    i++;
                    break;
                case 'U':
                    // 处理32位Unicode转义
                    if (i + 9 < content.length) {
                        const hex = content.slice(i + 2, i + 10);
                        if (/^[0-9a-fA-F]{8}$/.test(hex)) {
                            const code = parseInt(hex, 16);
                            if (code <= 0x10FFFF) {
                                result.push(String.fromCodePoint(code));
                                i += 10;
                                break;
                            }
                        }
                    }
                    // 如果不符合Unicode转义格式，则按原样处理
                    result.push(char);
                    i++;
                    break;
                case 'N':
                    // 处理Unicode名称转义
                    if (i + 2 < content.length && content[i + 2] === '{') {
                        const endBrace = content.indexOf('}', i + 3);
                        if (endBrace > 0) {
                            const name = content.slice(i + 3, endBrace);
                            let unicodeCode = unicodeNameAliasesMap[name.toUpperCase()];
                            if (unicodeCode !== undefined) {
                                result.push(String.fromCharCode(unicodeCode));
                            } else {
                                result.push(`\N{${name}}`);
                            }
                            i = endBrace + 1;
                            break;
                        }
                    }
                    // 如果不符合名称转义格式，则按原样处理
                    result.push(char);
                    i++;
                    break;
                default:
                    // 如果不是合法转义字符，按照规范，转义字符需要保留
                    result.push(char);
                    i++;
            }
        } else {
            result.push(char);
            i++;
        }
    }

    return { 
        text: result.join(''), 
        startMarker: isRawString ? rawStringPrefix + quoteChar : quoteChar,
        endMarker: quoteChar 
    };
}

// https://www.unicode.org/Public/15.1.0/ucd/NameAliases.txt
export const unicodeNameAliasesMap: Record<string, number|undefined> = {
    "NULL": 0x0000,
    "NUL": 0x0000,
    "START OF HEADING": 0x0001,
    "SOH": 0x0001,
    "START OF TEXT": 0x0002,
    "STX": 0x0002,
    "END OF TEXT": 0x0003,
    "ETX": 0x0003,
    "END OF TRANSMISSION": 0x0004,
    "EOT": 0x0004,
    "ENQUIRY": 0x0005,
    "ENQ": 0x0005,
    "ACKNOWLEDGE": 0x0006,
    "ACK": 0x0006,
    "ALERT": 0x0007,
    "BEL": 0x0007,
    "BACKSPACE": 0x0008,
    "BS": 0x0008,
    "CHARACTER TABULATION": 0x0009,
    "HORIZONTAL TABULATION": 0x0009,
    "HT": 0x0009,
    "TAB": 0x0009,
    "LINE FEED": 0x000A,
    "NEW LINE": 0x000A,
    "END OF LINE": 0x000A,
    "LF": 0x000A,
    "NL": 0x000A,
    "EOL": 0x000A,
    "LINE TABULATION": 0x000B,
    "VERTICAL TABULATION": 0x000B,
    "VT": 0x000B,
    "FORM FEED": 0x000C,
    "FF": 0x000C,
    "CARRIAGE RETURN": 0x000D,
    "CR": 0x000D,
    "SHIFT OUT": 0x000E,
    "LOCKING-SHIFT ONE": 0x000E,
    "SO": 0x000E,
    "SHIFT IN": 0x000F,
    "LOCKING-SHIFT ZERO": 0x000F,
    "SI": 0x000F,
    "DATA LINK ESCAPE": 0x0010,
    "DLE": 0x0010,
    "DEVICE CONTROL ONE": 0x0011,
    "DC1": 0x0011,
    "DEVICE CONTROL TWO": 0x0012,
    "DC2": 0x0012,
    "DEVICE CONTROL THREE": 0x0013,
    "DC3": 0x0013,
    "DEVICE CONTROL FOUR": 0x0014,
    "DC4": 0x0014,
    "NEGATIVE ACKNOWLEDGE": 0x0015,
    "NAK": 0x0015,
    "SYNCHRONOUS IDLE": 0x0016,
    "SYN": 0x0016,
    "END OF TRANSMISSION BLOCK": 0x0017,
    "ETB": 0x0017,
    "CANCEL": 0x0018,
    "CAN": 0x0018,
    "END OF MEDIUM": 0x0019,
    "EOM": 0x0019,
    "EM": 0x0019,
    "SUBSTITUTE": 0x001A,
    "SUB": 0x001A,
    "ESCAPE": 0x001B,
    "ESC": 0x001B,
    "INFORMATION SEPARATOR FOUR": 0x001C,
    "FILE SEPARATOR": 0x001C,
    "FS": 0x001C,
    "INFORMATION SEPARATOR THREE": 0x001D,
    "GROUP SEPARATOR": 0x001D,
    "GS": 0x001D,
    "INFORMATION SEPARATOR TWO": 0x001E,
    "RECORD SEPARATOR": 0x001E,
    "RS": 0x001E,
    "INFORMATION SEPARATOR ONE": 0x001F,
    "UNIT SEPARATOR": 0x001F,
    "US": 0x001F,
    "SP": 0x0020,
    "DELETE": 0x007F,
    "DEL": 0x007F,
    "PADDING CHARACTER": 0x0080,
    "PAD": 0x0080,
    "HIGH OCTET PRESET": 0x0081,
    "HOP": 0x0081,
    "BREAK PERMITTED HERE": 0x0082,
    "BPH": 0x0082,
    "NO BREAK HERE": 0x0083,
    "NBH": 0x0083,
    "INDEX": 0x0084,
    "IND": 0x0084,
    "NEXT LINE": 0x0085,
    "NEL": 0x0085,
    "START OF SELECTED AREA": 0x0086,
    "SSA": 0x0086,
    "END OF SELECTED AREA": 0x0087,
    "ESA": 0x0087,
    "CHARACTER TABULATION SET": 0x0088,
    "HORIZONTAL TABULATION SET": 0x0088,
    "HTS": 0x0088,
    "CHARACTER TABULATION WITH JUSTIFICATION": 0x0089,
    "HORIZONTAL TABULATION WITH JUSTIFICATION": 0x0089,
    "HTJ": 0x0089,
    "LINE TABULATION SET": 0x008A,
    "VERTICAL TABULATION SET": 0x008A,
    "VTS": 0x008A,
    "PARTIAL LINE FORWARD": 0x008B,
    "PARTIAL LINE DOWN": 0x008B,
    "PLD": 0x008B,
    "PARTIAL LINE BACKWARD": 0x008C,
    "PARTIAL LINE UP": 0x008C,
    "PLU": 0x008C,
    "REVERSE LINE FEED": 0x008D,
    "REVERSE INDEX": 0x008D,
    "RI": 0x008D,
    "SINGLE SHIFT TWO": 0x008E,
    "SINGLE-SHIFT-2": 0x008E,
    "SS2": 0x008E,
    "SINGLE SHIFT THREE": 0x008F,
    "SINGLE-SHIFT-3": 0x008F,
    "SS3": 0x008F,
    "DEVICE CONTROL STRING": 0x0090,
    "DCS": 0x0090,
    "PRIVATE USE ONE": 0x0091,
    "PRIVATE USE-1": 0x0091,
    "PU1": 0x0091,
    "PRIVATE USE TWO": 0x0092,
    "PRIVATE USE-2": 0x0092,
    "PU2": 0x0092,
    "SET TRANSMIT STATE": 0x0093,
    "STS": 0x0093,
    "CANCEL CHARACTER": 0x0094,
    "CCH": 0x0094,
    "MESSAGE WAITING": 0x0095,
    "MW": 0x0095,
    "START OF GUARDED AREA": 0x0096,
    "START OF PROTECTED AREA": 0x0096,
    "SPA": 0x0096,
    "END OF GUARDED AREA": 0x0097,
    "END OF PROTECTED AREA": 0x0097,
    "EPA": 0x0097,
    "START OF STRING": 0x0098,
    "SOS": 0x0098,
    "SINGLE GRAPHIC CHARACTER INTRODUCER": 0x0099,
    "SGC": 0x0099,
    "SINGLE CHARACTER INTRODUCER": 0x009A,
    "SCI": 0x009A,
    "CONTROL SEQUENCE INTRODUCER": 0x009B,
    "CSI": 0x009B,
    "STRING TERMINATOR": 0x009C,
    "ST": 0x009C,
    "OPERATING SYSTEM COMMAND": 0x009D,
    "OSC": 0x009D,
    "PRIVACY MESSAGE": 0x009E,
    "PM": 0x009E,
    "APPLICATION PROGRAM COMMAND": 0x009F,
    "APC": 0x009F,
    "NBSP": 0x00A0,
    "SHY": 0x00AD,
    "LATIN CAPITAL LETTER GHA": 0x01A2,
    "LATIN SMALL LETTER GHA": 0x01A3,
    "CGJ": 0x034F,
    "ARABIC SMALL HIGH LIGATURE ALEF WITH YEH BARREE": 0x0616,
    "ALM": 0x061C,
    "SYRIAC SUBLINEAR COLON SKEWED LEFT": 0x0709,
    "KANNADA LETTER LLLA": 0x0CDE,
    "LAO LETTER FO FON": 0x0E9D,
    "LAO LETTER FO FAY": 0x0E9F,
    "LAO LETTER RO": 0x0EA3,
    "LAO LETTER LO": 0x0EA5,
    "TIBETAN MARK BKA- SHOG GI MGO RGYAN": 0x0FD0,
    "HANGUL JONGSEONG YESIEUNG-KIYEOK": 0x11EC,
    "HANGUL JONGSEONG YESIEUNG-SSANGKIYEOK": 0x11ED,
    "HANGUL JONGSEONG SSANGYESIEUNG": 0x11EE,
    "HANGUL JONGSEONG YESIEUNG-KHIEUKH": 0x11EF,
    "FVS1": 0x180B,
    "FVS2": 0x180C,
    "FVS3": 0x180D,
    "MVS": 0x180E,
    "FVS4": 0x180F,
    "SUNDANESE LETTER ARCHAIC I": 0x1BBD,
    "ZWSP": 0x200B,
    "ZWNJ": 0x200C,
    "ZWJ": 0x200D,
    "LRM": 0x200E,
    "RLM": 0x200F,
    "LRE": 0x202A,
    "RLE": 0x202B,
    "PDF": 0x202C,
    "LRO": 0x202D,
    "RLO": 0x202E,
    "NNBSP": 0x202F,
    "MMSP": 0x205F,
    "WJ": 0x2060,
    "LRI": 0x2066,
    "RLI": 0x2067,
    "FSI": 0x2068,
    "PDI": 0x2069,
    "WEIERSTRASS ELLIPTIC FUNCTION": 0x2118,
    "MICR ON US SYMBOL": 0x2448,
    "MICR DASH SYMBOL": 0x2449,
    "LEFTWARDS TRIANGLE-HEADED ARROW WITH DOUBLE VERTICAL STROKE": 0x2B7A,
    "RIGHTWARDS TRIANGLE-HEADED ARROW WITH DOUBLE VERTICAL STROKE": 0x2B7C,
    "YI SYLLABLE ITERATION MARK": 0xA015,
    "MYANMAR LETTER KHAMTI LLA": 0xAA6E,
    "VS1": 0xFE00,
    "VS2": 0xFE01,
    "VS3": 0xFE02,
    "VS4": 0xFE03,
    "VS5": 0xFE04,
    "VS6": 0xFE05,
    "VS7": 0xFE06,
    "VS8": 0xFE07,
    "VS9": 0xFE08,
    "VS10": 0xFE09,
    "VS11": 0xFE0A,
    "VS12": 0xFE0B,
    "VS13": 0xFE0C,
    "VS14": 0xFE0D,
    "VS15": 0xFE0E,
    "VS16": 0xFE0F,
    "PRESENTATION FORM FOR VERTICAL RIGHT WHITE LENTICULAR BRACKET": 0xFE18,
    "BYTE ORDER MARK": 0xFEFF,
    "BOM": 0xFEFF,
    "ZWNBSP": 0xFEFF,
    "CUNEIFORM SIGN NU11 TENU": 0x122D4,
    "CUNEIFORM SIGN NU11 OVER NU11 BUR OVER BUR": 0x122D5,
    "MEDEFAIDRIN CAPITAL LETTER H": 0x16E56,
    "MEDEFAIDRIN CAPITAL LETTER NG": 0x16E57,
    "MEDEFAIDRIN SMALL LETTER H": 0x16E76,
    "MEDEFAIDRIN SMALL LETTER NG": 0x16E77,
    "HENTAIGANA LETTER E-1": 0x1B001,
    "BYZANTINE MUSICAL SYMBOL FTHORA SKLIRON CHROMA VASIS": 0x1D0C5,
    "VS17": 0xE0100,
    "VS18": 0xE0101,
    "VS19": 0xE0102,
    "VS20": 0xE0103,
    "VS21": 0xE0104,
    "VS22": 0xE0105,
    "VS23": 0xE0106,
    "VS24": 0xE0107,
    "VS25": 0xE0108,
    "VS26": 0xE0109,
    "VS27": 0xE010A,
    "VS28": 0xE010B,
    "VS29": 0xE010C,
    "VS30": 0xE010D,
    "VS31": 0xE010E,
    "VS32": 0xE010F,
    "VS33": 0xE0110,
    "VS34": 0xE0111,
    "VS35": 0xE0112,
    "VS36": 0xE0113,
    "VS37": 0xE0114,
    "VS38": 0xE0115,
    "VS39": 0xE0116,
    "VS40": 0xE0117,
    "VS41": 0xE0118,
    "VS42": 0xE0119,
    "VS43": 0xE011A,
    "VS44": 0xE011B,
    "VS45": 0xE011C,
    "VS46": 0xE011D,
    "VS47": 0xE011E,
    "VS48": 0xE011F,
    "VS49": 0xE0120,
    "VS50": 0xE0121,
    "VS51": 0xE0122,
    "VS52": 0xE0123,
    "VS53": 0xE0124,
    "VS54": 0xE0125,
    "VS55": 0xE0126,
    "VS56": 0xE0127,
    "VS57": 0xE0128,
    "VS58": 0xE0129,
    "VS59": 0xE012A,
    "VS60": 0xE012B,
    "VS61": 0xE012C,
    "VS62": 0xE012D,
    "VS63": 0xE012E,
    "VS64": 0xE012F,
    "VS65": 0xE0130,
    "VS66": 0xE0131,
    "VS67": 0xE0132,
    "VS68": 0xE0133,
    "VS69": 0xE0134,
    "VS70": 0xE0135,
    "VS71": 0xE0136,
    "VS72": 0xE0137,
    "VS73": 0xE0138,
    "VS74": 0xE0139,
    "VS75": 0xE013A,
    "VS76": 0xE013B,
    "VS77": 0xE013C,
    "VS78": 0xE013D,
    "VS79": 0xE013E,
    "VS80": 0xE013F,
    "VS81": 0xE0140,
    "VS82": 0xE0141,
    "VS83": 0xE0142,
    "VS84": 0xE0143,
    "VS85": 0xE0144,
    "VS86": 0xE0145,
    "VS87": 0xE0146,
    "VS88": 0xE0147,
    "VS89": 0xE0148,
    "VS90": 0xE0149,
    "VS91": 0xE014A,
    "VS92": 0xE014B,
    "VS93": 0xE014C,
    "VS94": 0xE014D,
    "VS95": 0xE014E,
    "VS96": 0xE014F,
    "VS97": 0xE0150,
    "VS98": 0xE0151,
    "VS99": 0xE0152,
    "VS100": 0xE0153,
    "VS101": 0xE0154,
    "VS102": 0xE0155,
    "VS103": 0xE0156,
    "VS104": 0xE0157,
    "VS105": 0xE0158,
    "VS106": 0xE0159,
    "VS107": 0xE015A,
    "VS108": 0xE015B,
    "VS109": 0xE015C,
    "VS110": 0xE015D,
    "VS111": 0xE015E,
    "VS112": 0xE015F,
    "VS113": 0xE0160,
    "VS114": 0xE0161,
    "VS115": 0xE0162,
    "VS116": 0xE0163,
    "VS117": 0xE0164,
    "VS118": 0xE0165,
    "VS119": 0xE0166,
    "VS120": 0xE0167,
    "VS121": 0xE0168,
    "VS122": 0xE0169,
    "VS123": 0xE016A,
    "VS124": 0xE016B,
    "VS125": 0xE016C,
    "VS126": 0xE016D,
    "VS127": 0xE016E,
    "VS128": 0xE016F,
    "VS129": 0xE0170,
    "VS130": 0xE0171,
    "VS131": 0xE0172,
    "VS132": 0xE0173,
    "VS133": 0xE0174,
    "VS134": 0xE0175,
    "VS135": 0xE0176,
    "VS136": 0xE0177,
    "VS137": 0xE0178,
    "VS138": 0xE0179,
    "VS139": 0xE017A,
    "VS140": 0xE017B,
    "VS141": 0xE017C,
    "VS142": 0xE017D,
    "VS143": 0xE017E,
    "VS144": 0xE017F,
    "VS145": 0xE0180,
    "VS146": 0xE0181,
    "VS147": 0xE0182,
    "VS148": 0xE0183,
    "VS149": 0xE0184,
    "VS150": 0xE0185,
    "VS151": 0xE0186,
    "VS152": 0xE0187,
    "VS153": 0xE0188,
    "VS154": 0xE0189,
    "VS155": 0xE018A,
    "VS156": 0xE018B,
    "VS157": 0xE018C,
    "VS158": 0xE018D,
    "VS159": 0xE018E,
    "VS160": 0xE018F,
    "VS161": 0xE0190,
    "VS162": 0xE0191,
    "VS163": 0xE0192,
    "VS164": 0xE0193,
    "VS165": 0xE0194,
    "VS166": 0xE0195,
    "VS167": 0xE0196,
    "VS168": 0xE0197,
    "VS169": 0xE0198,
    "VS170": 0xE0199,
    "VS171": 0xE019A,
    "VS172": 0xE019B,
    "VS173": 0xE019C,
    "VS174": 0xE019D,
    "VS175": 0xE019E,
    "VS176": 0xE019F,
    "VS177": 0xE01A0,
    "VS178": 0xE01A1,
    "VS179": 0xE01A2,
    "VS180": 0xE01A3,
    "VS181": 0xE01A4,
    "VS182": 0xE01A5,
    "VS183": 0xE01A6,
    "VS184": 0xE01A7,
    "VS185": 0xE01A8,
    "VS186": 0xE01A9,
    "VS187": 0xE01AA,
    "VS188": 0xE01AB,
    "VS189": 0xE01AC,
    "VS190": 0xE01AD,
    "VS191": 0xE01AE,
    "VS192": 0xE01AF,
    "VS193": 0xE01B0,
    "VS194": 0xE01B1,
    "VS195": 0xE01B2,
    "VS196": 0xE01B3,
    "VS197": 0xE01B4,
    "VS198": 0xE01B5,
    "VS199": 0xE01B6,
    "VS200": 0xE01B7,
    "VS201": 0xE01B8,
    "VS202": 0xE01B9,
    "VS203": 0xE01BA,
    "VS204": 0xE01BB,
    "VS205": 0xE01BC,
    "VS206": 0xE01BD,
    "VS207": 0xE01BE,
    "VS208": 0xE01BF,
    "VS209": 0xE01C0,
    "VS210": 0xE01C1,
    "VS211": 0xE01C2,
    "VS212": 0xE01C3,
    "VS213": 0xE01C4,
    "VS214": 0xE01C5,
    "VS215": 0xE01C6,
    "VS216": 0xE01C7,
    "VS217": 0xE01C8,
    "VS218": 0xE01C9,
    "VS219": 0xE01CA,
    "VS220": 0xE01CB,
    "VS221": 0xE01CC,
    "VS222": 0xE01CD,
    "VS223": 0xE01CE,
    "VS224": 0xE01CF,
    "VS225": 0xE01D0,
    "VS226": 0xE01D1,
    "VS227": 0xE01D2,
    "VS228": 0xE01D3,
    "VS229": 0xE01D4,
    "VS230": 0xE01D5,
    "VS231": 0xE01D6,
    "VS232": 0xE01D7,
    "VS233": 0xE01D8,
    "VS234": 0xE01D9,
    "VS235": 0xE01DA,
    "VS236": 0xE01DB,
    "VS237": 0xE01DC,
    "VS238": 0xE01DD,
    "VS239": 0xE01DE,
    "VS240": 0xE01DF,
    "VS241": 0xE01E0,
    "VS242": 0xE01E1,
    "VS243": 0xE01E2,
    "VS244": 0xE01E3,
    "VS245": 0xE01E4,
    "VS246": 0xE01E5,
    "VS247": 0xE01E6,
    "VS248": 0xE01E7,
    "VS249": 0xE01E8,
    "VS250": 0xE01E9,
    "VS251": 0xE01EA,
    "VS252": 0xE01EB,
    "VS253": 0xE01EC,
    "VS254": 0xE01ED,
    "VS255": 0xE01EE,
    "VS256": 0xE01EF,
};
