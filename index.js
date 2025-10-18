import LocalSharedMemory from "LocalSharedMemory"
import { BigVec, BigVec128Array } from "BigVec"

export const memory     = new LocalSharedMemory();
export const pointers   = new WeakMap()

export class OffsetPointer extends Number {
    static memory = memory;

    constructor () { Object.freeze(super(...arguments)) }

    static malloc (byteLength, alignSize) {
        return new this( memory.malloc(byteLength, alignSize) );
    }
}

export const strtoint = str => {
    return `${str}`.split("").map(
        (char, i) => char.charCodeAt(0) * (i+1)
    ).reduce((v,p) => v + p, 0) >>> 0;
};

export const strtoconst = (name, prefix = "", suffix = "") => {
    const label     = `${prefix}${name}${suffix}`.split("").map((c,i,t) => {
        if (i && c === c.toUpperCase()) {            
            const p = t[i-1]; 
            if (p !== p.toUpperCase() && p !== "_" && c !== "_") {
                return "_" + c;
            }
        }
        return c;
    }).join("").toUpperCase();
    
    const prototype = Reflect.get(Number, "prototype");
    const value     = Reflect.apply(strtoint, null, [label]);
    const instance  = Reflect.construct(Number, [value]);
    const type      = Reflect.apply(Object.create, null, [prototype]);
    const kName     = Reflect.get(Symbol, "toStringTag");

    Reflect.defineProperty(type, kName, { value: label });
    Reflect.defineProperty(type, "label", { value: label });
    Reflect.defineProperty(type, "name", { value: name });
    Reflect.defineProperty(type, "value", { value: value });
    Reflect.defineProperty(type, "valueOf", { value: function valueOf () { return this.value; } });
    Reflect.defineProperty(type, "toString", { value: function toString () { return this.label; } })

    Reflect.apply(Object.create, null, [instance]);
    Reflect.setPrototypeOf(instance, type);

    Object.seal(instance);

    return instance;
}

export const strtoclass = (name, extend) => {
    const prototype = Reflect.get(extend, "prototype");
    const value     = Reflect.apply(strtoint, null, [name]);
    const instance  = Reflect.construct(Number, [value]);
    const type      = Reflect.apply(Object.create, null, [prototype]);
    const kName     = Reflect.get(Symbol, "toStringTag");

    Reflect.defineProperty(type, kName, { value: name });
    Reflect.defineProperty(type, "label", { value: name });
    Reflect.defineProperty(type, "name", { value: name });
    Reflect.defineProperty(type, "value", { value: value });
    Reflect.defineProperty(type, "valueOf", { value: function valueOf () { return this.value; } });
    Reflect.defineProperty(type, "toString", { value: function toString () { return this.label; } })
    
    Reflect.apply(Object.create, null, [instance]);
    Reflect.setPrototypeOf(instance, type);

    Reflect.defineProperty(instance.constructor, "proto", { value: type });

    return instance.constructor;
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
].map(v => [v, strtoconst(v, "typeof_")]));

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
].map(v => [v, strtoconst(v, "", "_object")]));

const encodeText = TextEncoder.prototype.encode.bind(new TextEncoder);

export const kObject            = Symbol("kObject"); 

export const prototypes         = new Array();

export const encodeEmpty        = value => {
    return Int8Array.of(value)
}

export const encodeString       = value => {
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

export const encodeNumber       = value => {
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

export const encodeBigInt       = value => {
    if (!value) { return encodeEmpty(-5); }
    if ( value < 0 ) { return new Uint8Array(BigInt64Array.of(value).buffer) }
    return new Uint8Array(BigUint64Array.of(value).buffer)
}

export const encodeArrayView    = value => {
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength).slice();
}

export const encodeDescriptors  = value => {
    
    if (prototypes.includes(value) === true) {
        return
    }

    prototypes.push(value);
    
    const descriptors = Object.getOwnPropertyDescriptors(value);
    console.warn("encoding descriptors...", descriptors)

    for(const property in descriptors) {

        const descriptor = descriptors[property];

        if (property === "constructor") {
            encodeConstructor( descriptor.value );
            continue;
        }

        if (property === "prototype") {
            encodePrototype( descriptor.value );
            continue;
        }

        const {
            enumerable,
            writable,
            configurable,
            value: val,
            get, 
            set
        } = descriptor;

        console.log(`${value.name || ' '}`, property.padEnd(20, " "), { value: val, get, set }, {enumerable, writable, configurable}) 

        if (typeof val !== "undefined") encode(val);
        if (typeof get !== "undefined") encode(get);
        if (typeof set !== "undefined") encode(set);
    }
}

export const encodeClassExtends = value => {
    console.warn("\tencoding class...:", value, String(value), )
    encodeDescriptors(value)
}

export const encodeNativeCode   = value => {
    console.warn("\tencoding native...:", value )
    encodeDescriptors(value)
}

export const encodePrototype    = value => {
    console.warn("\tencoding prototype...:", value )
    encodeDescriptors(value)
}

export const encodeConstructor  = value => {

    if (Reflect.has(value, kObject) === false) {
        const name = value.name || value.prototype[Symbol.toStringTag] || `UNKNOWN`;
        Reflect.defineProperty(value, kObject, {value: strtoconst(name, "", "_object")});
    }

    if (Object.isPrototypeOf(value, Function)) {
        return encodeClassExtends(value);
    }

    return encodeNativeCode(value);
}


export const encodeObject       = value => {
    if (!value) { return encodeEmpty(-2) }

    if ("buffer" in value) {
        if (ArrayBuffer.isView(value)) {
            return encodeArrayView(value)
        }
    }

    if (value instanceof OffsetPointer) {
        return new Uint8Array(memory.arrayBuffer( value ));
    }

    console.group("encoding object...", value)
    
    const protoChain = Array.of(value);
    
    while (value = Object.getPrototypeOf(value)) 
        protoChain.push( value );
    
    protoChain
        .reverse()
        .forEach(encodeDescriptors);
    
    console.error("prototype chain:", protoChain)
    console.groupEnd()

}

export const encodeUndefined    = value => {
    if (!value) { return encodeEmpty(-1) }
}

export const encodeSymbol       = value => {
    return encodeString(value.description)
}

export const encodeFunction     = value => {
    const HEADERS_BYTE_LENGTH = 12;

    const descriptors       = Object.getOwnPropertyDescriptors(value);
    const code              = String(value).trim();
    const hasName           = Object.hasOwn(descriptors, "name");
    const fullName          = hasName && Reflect.get(value, "name");
    const isNative          = code.endsWith(`{ [native code] }`);
    const isAsync           = /^async\s/.test(code);
    const isConstructor     = Object.hasOwn(descriptors, "prototype");
    const prototype         = isConstructor && Reflect.get(value, "prototype");
    const protoConst        = isConstructor && prototype.constructor;
    const protoConstName    = isConstructor && protoConst?.name;
    const isGenerator       = isConstructor && /Generator/.test(protoConstName);
    const isSymbolHandler   = /\[Symbol\.(.*)\]/.test(fullName);
    const isGetter          = hasName && /^get\s/.test(fullName);
    const isSetter          = hasName && /^set\s/.test(fullName);
    const name              = fullName.substring((isGetter || isSetter) * 4); 
    const isWASM            = isNaN(fullName) === false;
    const argCount          = value.length;
    
    const nameBuffer        = encodeText(name).buffer;
    const nameByteLength    = nameBuffer.byteLength;
    const dataByteOffset    = HEADERS_BYTE_LENGTH + nameByteLength;

    const dataBuffer        = encodeText(code).buffer;
    const dataByteLength    = dataBuffer.byteLength;

    const byteLength        = HEADERS_BYTE_LENGTH + nameByteLength + dataByteLength;
    const buffer            = new ArrayBuffer(byteLength);

    const headersView       = new Uint8Array(buffer, 0, HEADERS_BYTE_LENGTH);
    const nameView          = new Uint8Array(buffer, HEADERS_BYTE_LENGTH, nameByteLength);
    const dataView          = new Uint8Array(buffer, dataByteOffset, dataByteLength);

    headersView.set([
        isNative, isAsync,  isConstructor, isGenerator,  
        isGetter, isSetter, isSymbolHandler, isWASM, 
        argCount, hasName,  dataByteOffset, dataByteLength
    ]);

    nameView.set(new Uint8Array(nameBuffer));
    dataView.set(new Uint8Array(dataBuffer));

    return new Uint8Array(buffer);
}

export const extern     = new WebAssembly.Table({ initial: 1, maximum: 65536, element: 'anyref' });

const pointerPrototype          = new Map();

const createPointerProto        = proto => {
    if (!proto) { return Externref; }

    if (pointerPrototype.has(proto)) {
        return pointerPrototype.get(proto);
    }

    const __proto__ = Object.getPrototypeOf(proto);
    const ptr = createPointerProto(__proto__);
    const __name__  = proto[Symbol.toStringTag] || proto.name || proto.constructor.name;
    const __class__ = class extends ptr {};

    Object.defineProperty( __class__, name, { value: __name__  } )
    Object.defineProperty( __class__, Symbol.toStringTag, { value: __name__  } )
    Object.defineProperty( __class__.prototype, Symbol.toStringTag, { value: __name__  } )

    pointerPrototype.set(proto, __class__);
    
    return __class__;
}

const pointerReferences         = new Map();

export const encodeExternref    = value => {
    if (pointerReferences.has(value)) {
        return pointerReferences.get(value);
    }

    console.warn("Virtualizing externref... :", value);

    const protoChain = new Array();
    
    let prototype = value;
    while (prototype = Object.getPrototypeOf(prototype)) {
        protoChain.push(prototype);
    }
    protoChain.reverse();

    const pointerProtoChain = protoChain.map(createPointerProto);
    const constructor       = pointerProtoChain.at(-1);
    const ptri              = Pointer.malloc(16);
    const pointer           = Reflect.construct(constructor, [ptri]);

    pointerReferences.set(value, pointer);

    return pointer;
}

export const encodeBoolean      = value => {
    return encodeEmpty(value);
}

export const encode = (value) => {

    const type = primitives[ typeof value ];
    const name = Object(value).constructor.name;
    const kind = constructors[ name ] ??= strtoconst(name, "", "_object");
    
    let ptri; 
    if (Object(value) === value) {
        ptri = encodeExternref(value);
        new Uint32Array(memory.buffer, +ptri, 4)
            .set([type, kind, extern.grow(1, value)])
    }
    else {
        switch (typeof value) {            
            case "undefined"    : ptri = encodeUndefined(value); break;
            case "boolean"      : ptri = encodeBoolean(value); break;
            case "number"       : ptri = encodeNumber(value); break;
            case "string"       : ptri = encodeString(value); break;
            case "bigint"       : ptri = encodeBigInt(value); break;
            case "symbol"       : ptri = encodeSymbol(value); break;
            default : throw `Type of value is undefined: ${typeof value}`;
        }
    }

    return ptri;
}

export class Pointer extends OffsetPointer {

    get ["{{Debugger}}"] () { return Pointer.debug(this); }

    static encode = encode

    static debug (ptri) {
        const byteOffset = ptri;
        const byteLength = memory.sizeof(ptri);
        const byteFinish = byteOffset + byteLength;
        const TypedArray = ptri.adapter;
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
        return Pointer.debug(this).data;
    }
}

function values () {
    const BYTES_PER_ELEMENT = this.BYTES_PER_ELEMENT;
    const getter            = this.constructor.getter;
    const byteLength        = memory.sizeof(this);

    const done = { __proto__ : null, done: !0, value: null };
    const data = { __proto__ : null, done: !1, value: null };

    let byteOffset = (this - BYTES_PER_ELEMENT), 
        index = byteLength / BYTES_PER_ELEMENT;

    return Iterator.from({
        next : () => {
            if (!index--) return done; 

            byteOffset += BYTES_PER_ELEMENT;
            data.value = getter( byteOffset ); 
            
            return data;
        }
    });
}


function dispose () { console.debug(new Error(`Symbol.dispose not implemented: *ptr(${+this})`), this) }
function unscopables () { console.error(new Error(`Symbol.unscopables not implemented: *ptr(${+this})`), this) }
function species () { console.error(new Error(`Symbol.species not implemented: *ptr(${+this})`), this) }

function at () {
    const [index = 0]   = arguments;
    
    const dataOffset    = index * this.BYTES_PER_ELEMENT;
    const byteOffset    = this + dataOffset;

    return this.getter( byteOffset );
}

Object.defineProperties( OffsetPointer, {
    [ Symbol.species ]              : { get : species },
});

Object.defineProperties( Pointer.prototype, {
    [ Symbol.toStringTag ]          : { value : "Pointer" },
    [ Symbol.dispose ]              : { value : dispose },
    [ Symbol.unscopables ]          : { value : unscopables },
});

Object.defineProperties( TypedValues.prototype, {
    [ Symbol.toStringTag ]          : { value : "TypedValues" },
    [ Symbol.iterator ]             : { value : values },
});

Object.defineProperties( TypedValues.prototype, {
    values : { value : values },
    at : { value: at }
});

const   u8 = {
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

const   i8 = {   
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

const  u16 = {
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

const  i16 = {   
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

const  u32 = {
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

class Externref extends u32.TypedValues {

    refindex () {  return this.at(2);}
    type () { return memory.getUint32(+this) }
    kind () { return memory.getUint32(this+4) }
    deref () { return extern.get(this.refindex()) }

    get [ "{{Debugger}}" ] () {
        return {
            ...Externref.debug(this),
            ["{{Pointer}}"] : Pointer.debug(this)
        }
    }

    static debug (pointer) {
        const type = pointer.type();
        const kind = pointer.kind();

        const primitiveValues = Object.values(primitives)
        const primitiveKeys = Object.keys(primitives)

        const constructorValues = Object.values(constructors)
        const constructorKeys = Object.keys(constructors)

        return {
            typeof : primitives[ primitiveKeys.at( primitiveValues.indexOf(type) ) ],
            objectof : constructors[ constructorKeys.at( constructorValues.indexOf(kind) ) ], 
            refindex : pointer.refindex(),
            deref : pointer.deref()
        }
    }
}

const  i32 = {
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

const  u64 = {
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

const  i64 = {
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

const  f32 = {
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

const  f64 = {
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

    const properties = {
        adapter : { value: exports[type].adapter },
        encoder : { value: exports[type].encoder },
        getter  : { value: memory[ exports[type].getter ].bind(memory) },
        setter  : { value: memory[ exports[type].setter ].bind(memory) },
        BYTES_PER_ELEMENT : { value: exports[type].BYTES_PER_ELEMENT },
    };

    Object.defineProperties( exports[type].TypedValues, properties);
    Object.defineProperties( exports[type].TypedNumber, properties);

    Object.defineProperties( exports[type].TypedNumber.prototype, properties);
    Object.defineProperties( exports[type].TypedValues.prototype, properties);

    exports[ exports[type].TypedValues.name ] = exports[type].TypedValues;
    exports[ exports[type].TypedNumber.name ] = exports[type].TypedNumber;
}

export default Object.defineProperties( Pointer, Object.getOwnPropertyDescriptors(exports) );
