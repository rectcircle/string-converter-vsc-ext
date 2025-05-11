

export interface PositionEvent {

    /**
     * The zero-based line value.
     */
    readonly line: number;

    /**
     * The zero-based character value.
     *
     * Character offsets are expressed using UTF-16 [code units](https://developer.mozilla.org/en-US/docs/Glossary/Code_unit).
     */
    readonly character: number;

    /**
     * URI of the document.
     */
    readonly uri: string;
}

export interface RangeOffset {

    readonly startOffset: number;
    readonly endOffset: number;
}