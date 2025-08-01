import { TokenInfo } from "../codeParser";
import { isStringToken, isNumberToken, isUnknownToken } from "../literalParser/interface";
import { StringConverter, StringConverterConvertResult, StringConverterMatchResult, StringConverterMeta, StringConverterMatchOptions } from "./interface";
import moment from "moment";

type TimestampUnit = "s" | "ms";

interface TimestampMatchResult {
    timestamp: number;
    unit: TimestampUnit;
}

export class TimestampParser implements StringConverter<TimestampMatchResult> {
    meta: StringConverterMeta = {
        id: "timestamp-parser",
        name: "Parse Timestamp",
        resultLanguageId: "plaintext",
        specInfo: {
            name: "Timestamp",
            url: "https://en.wikipedia.org/wiki/Unix_time",
            description: "Usually timestamp refers to Unix Timestamp. Unix time is a date and time representation widely used in computing. It measures time by the number of seconds that have elapsed since 00:00:00 UTC on 1 January 1970, the Unix epoch.\n\nNote that in some programming languages and environments (like JavaScript), timestamps are commonly represented in milliseconds rather than seconds. The converter automatically detects and handles both formats.",
            referenceLinks: [
                {
                    title: "Wikipedia - Unix time",
                    url: "https://en.wikipedia.org/wiki/Unix_time"
                },
                {
                    title: "百度百科 - unix时间戳",
                    url: "https://baike.baidu.com/item/unix%E6%97%B6%E9%97%B4%E6%88%B3"
                }
                // TODO: 增加更多的参考链接。
            ]
        }
    };

    match(tokenInfo: TokenInfo, options?: StringConverterMatchOptions): StringConverterMatchResult<TimestampMatchResult> {
        if (!isStringToken(tokenInfo.type) && !isNumberToken(tokenInfo.type) && !isUnknownToken(tokenInfo.type)) {
            return { matched: false };
        }
        
        try {
            const timestamp = parseInt(tokenInfo.text, 10);

            if (isNaN(timestamp)) {
                return { matched: false };
            }

            const now = moment();
            const twentyYearsAgo = now.clone().subtract(20, 'years');
            const twentyYearsLater = now.clone().add(20, 'years');
 
            if (timestamp >= twentyYearsAgo.unix() && timestamp <= twentyYearsLater.unix()) {
                return {
                    matched: true,
                    byProduct: {
                        timestamp,
                        unit: "s"
                    }
                };
            }
            if (timestamp >= twentyYearsAgo.unix() * 1000 && timestamp <= twentyYearsLater.unix() * 1000) {
                return {
                    matched: true,
                    byProduct: {
                        timestamp: timestamp,
                        unit: "ms"
                    }
                };
            }
            return { matched: false };
        } catch (error) {
            return { matched: false };
        }
    }

    convert(tokenInfo: TokenInfo, byproductOfMatch?: TimestampMatchResult, options?: StringConverterMatchOptions): StringConverterConvertResult {

        byproductOfMatch = byproductOfMatch || this.match(tokenInfo).byProduct;

        if (!byproductOfMatch) {
            return {
                error: "Invalid timestamp format",
                result: tokenInfo.text,
            };
        }

        const momentTime = byproductOfMatch.unit === 'ms' ? moment(byproductOfMatch.timestamp) : moment.unix(byproductOfMatch.timestamp);
        
        const result = momentTime.format('YYYY-MM-DDTHH:mm:ssZ');

        let explainList = [];
        
        explainList.push(`- Unit: \`${byproductOfMatch.unit === 'ms' ? 'millisecond' : 'second'}\`.`);
        explainList.push(`- Local time: \`${result}\`.`);
        explainList.push(`- UTC time: \`${momentTime.utc().format('YYYY-MM-DDTHH:mm:ss')}Z\`.`);

        return {
            result: result,
            explain: explainList.join("\n"),
        };
    }
}