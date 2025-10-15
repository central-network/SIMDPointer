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
            arrayView   : new TypedArray( memory.buffer, byteOffset, length )
        };
    }
}

class TypedNumber extends Pointer {
    constructor (byteOffset = new.target.malloc(new.target.BYTES_PER_ELEMENT)) {
        super(byteOffset);
    }
}

class TypedArray extends Pointer {
    static from () {

        const object        = this.adapter.from(...arguments);
        const byteLength    = object.byteLength;
        const byteOffset    = memory.malloc( object.byteLength );

        const sourceView    = new Uint8Array(object.buffer);
        const targetView    = new Uint8Array(memory.buffer, byteOffset, byteLength);

        targetView.set(sourceView);

        arguments[0].forEach( v => console.log(v) )

        return new this(byteOffset);
    }

    debug () {
        return this["{{Debugger}}"].arrayView
    }
}

const u8 = {
    BYTES_PER_ELEMENT : 1,
    adapter : Uint8Array,
    encoder : parseInt,
    NumberType : class Uint8Number extends TypedNumber {},
    TypedArray : class Uint8Array extends TypedArray {},
    labels : {
        long : "Uint8",
        short : "u8",
        array : "Uint8Array",
        wasm : "i32"
    },
    getter : DataView.prototype.getUint8,
    setter : DataView.prototype.setUint8,
    loader : "i32.load8_u",
    storer : "i32.store8",
    maximum : 255,
    minimum : 0
};

const i8 = {   
    BYTES_PER_ELEMENT : 1,
    adapter : Int8Array,
    encoder : parseInt,
    NumberType : class Int8Number extends TypedNumber {},
    TypedArray : class Int8Array extends TypedArray {},
    labels : {
        long : "Int8",
        short : "i8",
        array : "Int8Array",
        wasm : "i32"
    },
    getter : DataView.prototype.getInt8,
    setter : DataView.prototype.setInt8,
    loader : "i32.load8_s",
    storer : "i32.store8",
    maximum : 127,
    minimum : -128
};

const u16 = {
    BYTES_PER_ELEMENT : 2,
    adapter : Uint16Array,
    encoder : parseInt,
    NumberType : class Uint16Number extends TypedNumber {},
    TypedArray : class Uint16Array extends TypedArray {},
    labels : {
        long : "Uint16",
        short : "u16",
        array : "Uint16Array",
        wasm : "i32"
    },
    getter : DataView.prototype.getUint16,
    setter : DataView.prototype.setUint16,
    loader : "i32.load16_u",
    storer : "i32.store16",
    maximum : 65535,
    minimum : 0
};


const i16 = {   
    BYTES_PER_ELEMENT : 2,
    adapter : Int16Array,
    encoder : parseInt,
    NumberType : class Int16Number extends TypedNumber {},
    TypedArray : class Int16Array extends TypedArray {},
    labels : {
        long : "Int16",
        short : "i16",
        array : "Int16Array",
        wasm : "i32"
    },
    getter : DataView.prototype.getInt16,
    setter : DataView.prototype.setInt16,
    loader : "i32.load16_s",
    storer : "i32.store16",
    maximum : 32767,
    minimum : -32768
};

const u32 = {
    BYTES_PER_ELEMENT : 4,
    adapter : Uint32Array,
    encoder : parseInt,
    NumberType : class Uint32Number extends TypedNumber {},
    TypedArray : class Uint32Array extends TypedArray {},
    labels : {
        long : "Uint32",
        short : "u32",
        array : "Uint32Array",
        wasm : "i32"
    },
    getter : DataView.prototype.getUint32,
    setter : DataView.prototype.setUint32,
    loader : "i32.load",
    storer : "i32.store",   
    maximum : 4294967295,
    minimum : 0
};

const i32 = {
    BYTES_PER_ELEMENT : 4,
    adapter : Int32Array,
    encoder : parseInt,
    NumberType : class Int32Number extends TypedNumber {},
    TypedArray : class Int32Array extends TypedArray {},
    labels : {
        long : "Int32",
        short : "i32",
        array : "Int32Array",
        wasm : "i32"
    },
    getter : DataView.prototype.getInt32,
    setter : DataView.prototype.setInt32,
    loader : "i32.load",
    storer : "i32.store",
    maximum : 2147483647,
    minimum : -2147483648   
};

const u64 = {
    BYTES_PER_ELEMENT : 8,
    adapter : BigUint64Array, 
    encoder : BigInt,  
    NumberType : class BigUint64Number extends TypedNumber {},
    TypedArray : class BigUint64Array extends TypedArray {},
    labels : {
        long : "BigUint64",
        short : "u64",
        array : "BigUint64Array",
        wasm : "i64"
    },
    getter : DataView.prototype.getBigUint64,
    setter : DataView.prototype.setBigUint64,
    loader : "i64.load",
    storer : "i64.store",
    maximum : 18446744073709551615n,
    minimum : 0n    
};

const i64 = {
    BYTES_PER_ELEMENT : 8,
    adapter : BigInt64Array,
    encoder : BigInt,
    NumberType : class BigInt64Number extends TypedNumber {},
    TypedArray : class BigInt64Array extends TypedArray {},
    labels : {
        long : "BigInt64",
        short : "i64",
        array : "BigInt64Array",
        wasm : "i64"
    },
    getter : DataView.prototype.getBigInt64,
    setter : DataView.prototype.setBigInt64,
    loader : "i64.load",
    storer : "i64.store",
    maximum : 9223372036854775807n, 
    minimum : -9223372036854775808n
};

const f32 = {
    BYTES_PER_ELEMENT : 4,
    adapter : Float32Array,
    encoder : parseFloat,
    NumberType : class Float32Number extends TypedNumber {},
    TypedArray : class Float32Array extends TypedArray {},
    labels : {
        long : "Float32",
        short : "f32",
        array : "Float32Array",
        wasm : "f32"
    },
    getter : DataView.prototype.getFloat32,
    setter : DataView.prototype.setFloat32,
    loader : "f32.load",
    storer : "f32.store",
    maximum : 3.4028234663852886e+38,   
    minimum : -3.4028234663852886e+38
};

const f64 = {
    BYTES_PER_ELEMENT : 8,
    adapter : Float64Array, 
    encoder : parseFloat,
    NumberType : class Float64Number extends TypedNumber {},
    TypedArray : class Float64Array extends TypedArray {},
    labels : {
        long : "Float64",
        short : "f64",
        array : "Float64Array",
        wasm : "f64"
    },
    getter : DataView.prototype.getFloat64,
    setter : DataView.prototype.setFloat64,
    loader : "f64.load",
    storer : "f64.store",
    maximum : 1.7976931348623157e+308,
    minimum : -1.7976931348623157e+308
};

const v128 = {
    BYTES_PER_ELEMENT : 16,
    adapter : BigVec128Array,
    encoder : BigVec,
    NumberType : class BigVec128Number extends TypedNumber {},
    TypedArray : class BigVec128Array extends TypedArray {},
    labels : {
        long : "BigVec128",
        short : "v128",
        array : "BigVec128Array",
        wasm : "v128"
    },
    getter : DataView.prototype.getBigVec128,
    setter : DataView.prototype.setBigVec128,
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
    v128,
};

for (const type in exports) {
    Object.defineProperties( exports[type].TypedArray, {
        adapter : { value: exports[type].adapter },
        encoder : { value: exports[type].encoder },
        BYTES_PER_ELEMENT : { value: exports[type].BYTES_PER_ELEMENT },
    });

    Object.defineProperties( exports[type].TypedArray.prototype, {
        adapter : { value: exports[type].adapter },
        encoder : { value: exports[type].encoder },
        BYTES_PER_ELEMENT : { value: exports[type].BYTES_PER_ELEMENT },
    })
}

export default Object.defineProperties( Pointer, Object.getOwnPropertyDescriptors(exports) );
