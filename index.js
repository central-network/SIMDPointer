import LocalSharedMemory from "LocalSharedMemory"
import { BigVec, BigVec128Array } from "BigVec"

export const memory = new LocalSharedMemory();

export const pointers = new WeakMap()

export class OffsetPointer extends Number {
    static memory = memory;

    static malloc (byteLength, alignSize) {
        return new this( memory.malloc(byteLength, alignSize) );
    }
}

export const strtoint = str => {
    return `${str}`.split("").map(
        (char, i) => char.charCodeAt(0) * (i+1)
    ).reduce((v,p) => v + p, 0) >>> 0;
};

export const strtotype = (name) => {
    const prototype = Reflect.get(Number, "prototype");
    const value     = Reflect.apply(strtoint, null, [name]);
    const label     = Reflect.apply(String.prototype.toUpperCase, name, self);
    const instance  = Reflect.construct(Number, [value]);
    const type      = Reflect.apply(Object.create, null, [prototype]);
    const kName     = Reflect.get(Symbol, "toStringTag");
    const toString  = Reflect.construct(Function, ["return this.label"])
    const toNumber  = Reflect.construct(Function, ["return this.value"])

    Reflect.defineProperty(type, kName, { value: label });
    Reflect.defineProperty(type, "label", { value: label })
    Reflect.defineProperty(type, "name", { value: name })
    Reflect.defineProperty(type, "value", { value: value })
    Reflect.defineProperty(type, "valueOf", { value: toNumber });
    Reflect.defineProperty(type, "toString", { value: toString })

    Reflect.apply(Object.create, null, [instance]);
    Reflect.setPrototypeOf(instance, type);

    return instance;
}

export const primitives = Object.fromEntries([
    "undefined",
    "boolean",
    "number",
    "string",
    "object",
    "bigint",
    "symbol",
    "function",
].map(v => [v, strtotype(v)]));

export const constructors = Object.fromEntries([
    "Array",
    "Object",
    "Number",
    "String",
    "Boolean",
    "BigInt",
    "Symbol",
    "Function",
    "Date",
    "RegExp",
    "Map",
    "Set",
    "WeakMap",
    "WeakSet",
    "ArrayBuffer",
    "SharedArrayBuffer",
    "DataView",
    "Promise",
    "Error",
    "GeneratorFunction",
    "AsyncFunction",
    "ArrayBufferView",
    "DataView",
    "OffsetPointer",
    "Pointer",
    "TypedArray",
    "TypedNumber",
    "TypedValues",
    "Uint8Array",
    "Uint8Number",
    "Uint8Values",
    "Int8Array",
    "Int8Number",
    "Int8Values",
    "Uint16Array",  
    "Uint16Number",
    "Uint16Values",
    "Int16Array",   
    "Int16Number",
    "Int16Values",
    "Uint32Array",
    "Uint32Number",
    "Uint32Values",    
    "Int32Array",   
    "Int32Number",
    "Int32Values",
    "Float32Array",
    "Float32Number",
    "Float32Values",
    "Float64Array",
    "Float64Number",
    "Float64Values",
    "BigUint64Array", 
    "BigUint64Number",
    "BigUint64Values",
    "BigInt64Array",
    "BigInt64Number",
    "BigInt64Values",
    "BigVec128Array",
    "BigVec128Number",
    "BigVec128Values",
    "WindowProperties",
    "Window",
    "Worker",
    "Navigator",
    "WorkerNavigator",
    "Crypto",
    "Performance",
    "CompassHeading",
    "SubtleCrypto",
    "TextDecoder",
    "TextEncoder",
    "URL",
    "URLSearchParams",
    "WebAssembly",
    "WebGLRenderingContext",
    "WebGL2RenderingContext",
    "WorkerGlobalScope",
    "XMLHttpRequest",
    "XMLDocument",
    "Document",
    "HTMLElement",
    "HTMLAnchorElement",
    "HTMLAreaElement",
    "Blob",
    "File",
    "FileList",
    "FileReader",
    "FormData",
    "IndexedDB",
    "IDBDatabase",
    "IDBObjectStore",
    "IDBRequest",
    "IDBTransaction",
    "IDBCursor",
    "IDBIndex",
    "IDBKeyRange",
    "IDBFactory",
    "IDBOpenDBRequest", 
    "MessageChannel",
    "WebSocket",
].map(v => [v, strtotype(v)]));

const encodeText = TextEncoder.prototype.encode.bind(new TextEncoder);

export const encodeEmpty = value => {
    return Int8Array.of(value)
}

export const encodeString = value => {
    if (!value) { return encodeEmpty(-4); }

    const string = String(value);
    const length = string.length;

    const textBuffer = encodeText(string).buffer;
    const headBuffer = Uint32Array.of(textBuffer.byteLength, length).buffer;
    const byteLength = headBuffer.byteLength + textBuffer.byteLength;
    const bufferView = new Uint8Array(new ArrayBuffer(byteLength)); 

    bufferView.subarray(0, headBuffer.byteLength).set( new Uint8Array(headBuffer) )
    bufferView.subarray(headBuffer.byteLength).set( new Uint8Array(textBuffer) )

    return bufferView;
}

export const encodeNumber = value => {
    if (!value) { return encodeEmpty(-3); }

    const number        = Number(value);
    const isInteger     = Number.isInteger(number);
    const isNaN         = Number.isNaN(number);
    const isFinite      = Number.isFinite(number);
    const isSafeInteger = Number.isSafeInteger(number);

    let type, view;
    const buffer = new ArrayBuffer(8);

    if (isInteger) {
        if (value < 0) {
            while (true) {
                view = new Int8Array(buffer, 0, 1).fill(value);
                if (view[0] === value) { type = i8; break; }

                view = new Int16Array(buffer, 0, 1).fill(value);
                if (view[0] === value) { type = i16; break; }

                view = new Int32Array(buffer, 0, 1).fill(value);
                if (view[0] === value) { type = i32; break; }

                view = new BigInt64Array(buffer, 0, 1).fill(BigInt(value));
                if (view[0] === BigInt(value)) { type = i64; break; }

                throw `Encoding of number failed: ${value}`;
            }
        }
        else {
            while (true) {
                view = new Uint8Array(buffer, 0, 1).fill(value);
                if (view[0] === value) { type = u8; break; }

                view = new Uint16Array(buffer, 0, 1).fill(value);
                if (view[0] === value) { type = u16; break; }

                view = new Uint32Array(buffer, 0, 1).fill(value);
                if (view[0] === value) { type = u32; break; }

                view = new BigUint64Array(buffer, 0, 1).fill(BigInt(value));
                if (view[0] === BigInt(value)) { type = u64; break; }

                throw `Encoding of number failed: ${value}`;
            }
        }
    }
    else {
        while (true) {
            view = new Float32Array(buffer, 0, 1).fill(value);
            if (view[0] === value) { type = f32; break; }

            view = new Float64Array(buffer, 0, 1).fill(value);
            type = f64;
            break;
        }
    }

    const flags         = new Uint32Array(Uint8Array.of(isNaN, isFinite, isInteger, isSafeInteger).buffer).at(0);
    const headBuffer    = Uint32Array.of(view.BYTES_PER_ELEMENT, flags).buffer;
    const numberBuffer  = view.buffer.slice(0, view.BYTES_PER_ELEMENT);
    const byteLength    = headBuffer.byteLength + numberBuffer.byteLength;
    const bufferView    = new Uint8Array(new ArrayBuffer(byteLength)); 

    bufferView.subarray(0,headBuffer.byteLength).set( new Uint8Array(headBuffer) )
    bufferView.subarray(headBuffer.byteLength).set( new Uint8Array(numberBuffer) )

    view = undefined;

    return bufferView;
}

export const encodeBigInt = value => {
    if (!value) { return encodeEmpty(-5); }
    if ( value < 0 ) { return new Uint8Array(BigInt64Array.of(value).buffer) }
    return new Uint8Array(BigUint64Array.of(value).buffer)
}

export const encodeArrayView = value => {
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength).slice();
}

export const encodeObject = value => {
    if (!value) { return encodeEmpty(-2) }
    if ("buffer" in value) {
        if (ArrayBuffer.isView(value)) {
            return encodeArrayView(value)
        }
    }

    if (value instanceof OffsetPointer) {
        return new Uint8Array(memory.arrayBuffer( value ));
    }

}

export const encodeUndefined = value => {
    if (!value) { return encodeEmpty(-1) }
}

export const encodeSymbol = value => {
    return encodeString(value.description)
}


export const encoders = Object({
    undefined : { Object : encodeUndefined },
    boolean : { Boolean : encodeEmpty },
    number : { Number : encodeNumber },
    string : { String : encodeString },
    bigint : { BigInt : encodeBigInt },
    symbol : { Symbol : encodeSymbol },
    function : {},
    object : {
        String  : encodeString,
        RegExp  : encodeString,
        Number  : encodeNumber,
        BigInt  : encodeBigInt,
        Date    : encodeNumber,
        Object  : encodeObject,
        Symbol  : encodeSymbol,
    },
});

console.warn(constructors)
console.warn(primitives)
console.warn(encoders)

export const typeOf = (value) => {
    const type = typeof value;
    const kind = Object(value).constructor.name;
    const func = encoders[ type ][ kind ] ?? encodeObject;
    
    return {
        type : primitives[ type ],
        kind : constructors[ kind ] || strtotype( kind ),
        data : func(value)?.buffer,
        value,
    };
}

export class Pointer extends OffsetPointer {
    get ["{{Debugger}}"] () {
        const byteOffset = this * 1;
        const byteLength = memory.sizeof(this);
        const byteFinish = byteOffset + byteLength;
        const TypedArray = this.adapter;
        const length     = byteLength / TypedArray.BYTES_PER_ELEMENT;
        const buffer     = memory.buffer.slice(byteOffset, byteFinish);

        return {
            __proto__   : null,
            length      : length,
            byteOffset  : byteOffset,
            byteLength  : byteLength,
            buffer      : buffer,
            data        : new TypedArray( memory.buffer, byteOffset, length )
        };
    }

    static encode (value) {
        const kind = typeOf(value);
        console.log(kind);
    }
}

class TypedNumber extends Pointer {
    constructor (byteOffset = new.target.malloc(new.target.BYTES_PER_ELEMENT)) {
        super(byteOffset);
    }

    static of () {
        const value         = this.encoder(arguments[0]);
        const object        = this.adapter.of(value);
        const byteLength    = this.BYTES_PER_ELEMENT;
        const byteOffset    = memory.malloc( byteLength );

        const sourceView    = new Uint8Array(object.buffer);
        const targetView    = new Uint8Array(memory.buffer, byteOffset, byteLength);

        targetView.set(sourceView);

        return new this(byteOffset);
    }

    value () {
        return this.getter( this );
    }
}

class TypedValues extends Pointer {
    static from () {

        const object        = this.adapter.from(...arguments);
        const byteLength    = object.byteLength;
        const byteOffset    = memory.malloc( object.byteLength );

        const sourceView    = new Uint8Array(object.buffer);
        const targetView    = new Uint8Array(memory.buffer, byteOffset, byteLength);

        targetView.set(sourceView);

        return new this(byteOffset);
    }

    static random () {
        const length        = arguments[0] || 1;
        const byteLength    = length * this.BYTES_PER_ELEMENT;
        const byteOffset    = memory.malloc( byteLength );

        const sourceView    = crypto.getRandomValues(new Uint8Array(byteLength));
        const targetView    = new Uint8Array(memory.buffer, byteOffset, byteLength);

        targetView.set(sourceView);

        return new this(byteOffset);
    }

    debug () {
        return this["{{Debugger}}"].data
    }
}

const u8 = {
    BYTES_PER_ELEMENT : 1,
    adapter : Uint8Array,
    encoder : parseInt,
    TypedNumber : class Uint8Number extends TypedNumber {},
    TypedValues : class Uint8Values extends TypedValues {},
    labels : {
        long : "Uint8",
        short : "u8",
        array : "Uint8Array",
        wasm : "i32"
    },
    getter : "getUint8",
    setter : "setUint8",
    loader : "i32.load8_u",
    storer : "i32.store8",
    maximum : 255,
    minimum : 0
};

const i8 = {   
    BYTES_PER_ELEMENT : 1,
    adapter : Int8Array,
    encoder : parseInt,
    TypedNumber : class Int8Number extends TypedNumber {},
    TypedValues : class Int8Values extends TypedValues {},
    labels : {
        long : "Int8",
        short : "i8",
        array : "Int8Array",
        wasm : "i32"
    },
    getter : "getInt8",
    setter : "setInt8",
    loader : "i32.load8_s",
    storer : "i32.store8",
    maximum : 127,
    minimum : -128
};

const u16 = {
    BYTES_PER_ELEMENT : 2,
    adapter : Uint16Array,
    encoder : parseInt,
    TypedNumber : class Uint16Number extends TypedNumber {},
    TypedValues : class Uint16Values extends TypedValues {},
    labels : {
        long : "Uint16",
        short : "u16",
        array : "Uint16Array",
        wasm : "i32"
    },
    getter : "getUint16",
    setter : "setUint16",
    loader : "i32.load16_u",
    storer : "i32.store16",
    maximum : 65535,
    minimum : 0
};


const i16 = {   
    BYTES_PER_ELEMENT : 2,
    adapter : Int16Array,
    encoder : parseInt,
    TypedNumber : class Int16Number extends TypedNumber {},
    TypedValues : class Int16Values extends TypedValues {},
    labels : {
        long : "Int16",
        short : "i16",
        array : "Int16Array",
        wasm : "i32"
    },
    getter : "getInt16",
    setter : "setInt16",
    loader : "i32.load16_s",
    storer : "i32.store16",
    maximum : 32767,
    minimum : -32768
};

const u32 = {
    BYTES_PER_ELEMENT : 4,
    adapter : Uint32Array,
    encoder : parseInt,
    TypedNumber : class Uint32Number extends TypedNumber {},
    TypedValues : class Uint32Values extends TypedValues {},
    labels : {
        long : "Uint32",
        short : "u32",
        array : "Uint32Array",
        wasm : "i32"
    },
    getter : "getUint32",
    setter : "setUint32",
    loader : "i32.load",
    storer : "i32.store",   
    maximum : 4294967295,
    minimum : 0
};

const i32 = {
    BYTES_PER_ELEMENT : 4,
    adapter : Int32Array,
    encoder : parseInt,
    TypedNumber : class Int32Number extends TypedNumber {},
    TypedValues : class Int32Values extends TypedValues {},
    labels : {
        long : "Int32",
        short : "i32",
        array : "Int32Array",
        wasm : "i32"
    },
    getter : "getInt32",
    setter : "setInt32",
    loader : "i32.load",
    storer : "i32.store",
    maximum : 2147483647,
    minimum : -2147483648   
};

const u64 = {
    BYTES_PER_ELEMENT : 8,
    adapter : BigUint64Array, 
    encoder : BigInt,  
    TypedNumber : class BigUint64Number extends TypedNumber {},
    TypedValues : class BigUint64Values extends TypedValues {},
    labels : {
        long : "BigUint64",
        short : "u64",
        array : "BigUint64Array",
        wasm : "i64"
    },
    getter : "getBigUint64",
    setter : "setBigUint64",
    loader : "i64.load",
    storer : "i64.store",
    maximum : 18446744073709551615n,
    minimum : 0n    
};

const i64 = {
    BYTES_PER_ELEMENT : 8,
    adapter : BigInt64Array,
    encoder : BigInt,
    TypedNumber : class BigInt64Number extends TypedNumber {},
    TypedValues : class BigInt64Values extends TypedValues {},
    labels : {
        long : "BigInt64",
        short : "i64",
        array : "BigInt64Array",
        wasm : "i64"
    },
    getter : "getBigInt64",
    setter : "setBigInt64",
    loader : "i64.load",
    storer : "i64.store",
    maximum : 9223372036854775807n, 
    minimum : -9223372036854775808n
};

const f32 = {
    BYTES_PER_ELEMENT : 4,
    adapter : Float32Array,
    encoder : parseFloat,
    TypedNumber : class Float32Number extends TypedNumber {},
    TypedValues : class Float32Values extends TypedValues {},
    labels : {
        long : "Float32",
        short : "f32",
        array : "Float32Array",
        wasm : "f32"
    },
    getter : "getFloat32",
    setter : "setFloat32",
    loader : "f32.load",
    storer : "f32.store",
    maximum : 3.4028234663852886e+38,   
    minimum : -3.4028234663852886e+38
};

const f64 = {
    BYTES_PER_ELEMENT : 8,
    adapter : Float64Array, 
    encoder : parseFloat,
    TypedNumber : class Float64Number extends TypedNumber {},
    TypedValues : class Float64Values extends TypedValues {},
    labels : {
        long : "Float64",
        short : "f64",
        array : "Float64Array",
        wasm : "f64"
    },
    getter : "getFloat64",
    setter : "setFloat64",
    loader : "f64.load",
    storer : "f64.store",
    maximum : 1.7976931348623157e+308,
    minimum : -1.7976931348623157e+308
};

const v128 = {
    BYTES_PER_ELEMENT : 16,
    adapter : BigVec128Array,
    encoder : BigVec,
    TypedNumber : class BigVec128Number extends TypedNumber {},
    TypedValues : class BigVec128Values extends TypedValues {},
    labels : {
        long : "BigVec128",
        short : "v128",
        array : "BigVec128Array",
        wasm : "v128"
    },
    getter : "getBigVec128",
    setter : "setBigVec128",
    loader : "v128.load",
    storer : "v128.store",
    maximum : "",
    minimum : ""
};

const exports = { __proto__: null,
      u8,  i8, 
     u16, i16, 
     u32, i32, f32,
     u64, i64, f64,      
    v128
};

for (const type in exports) {

    Object.defineProperties( exports[type].TypedValues, {
        adapter : { value: exports[type].adapter },
        encoder : { value: exports[type].encoder },
        BYTES_PER_ELEMENT : { value: exports[type].BYTES_PER_ELEMENT },
    });

    Object.defineProperties( exports[type].TypedValues.prototype, {
        adapter : { value: exports[type].adapter },
        encoder : { value: exports[type].encoder },
        BYTES_PER_ELEMENT : { value: exports[type].BYTES_PER_ELEMENT },
    });

    Object.defineProperties( exports[type].TypedNumber, {
        adapter : { value: exports[type].adapter },
        encoder : { value: exports[type].encoder },
        BYTES_PER_ELEMENT : { value: exports[type].BYTES_PER_ELEMENT },
    });

    Object.defineProperties( exports[type].TypedNumber.prototype, {
        adapter : { value: exports[type].adapter },
        encoder : { value: exports[type].encoder },
        getter  : { value: memory[ exports[type].getter ].bind(memory) },
        setter  : { value: memory[ exports[type].setter ].bind(memory) },
        BYTES_PER_ELEMENT : { value: exports[type].BYTES_PER_ELEMENT },
    });

    exports[ exports[type].TypedValues.name ] = exports[type].TypedValues;
    exports[ exports[type].TypedNumber.name ] = exports[type].TypedNumber;
}

export default Object.defineProperties( Pointer, Object.getOwnPropertyDescriptors(exports) );
