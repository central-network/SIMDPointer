export const BYTES_PER_ELEMENT = 16;

export function BigVec () {
    const value = arguments[0];

    if (value instanceof BigVec) {
        return value;
    };
    
    if (typeof value === "string") {
        return BigVec.fromString(...arguments);
    }

    if (typeof value === "undefined" || !value) {
        return BigVec.fromBigInt(0n);;
    };

    if (typeof value === "bigint") {
        return BigVec.fromBigInt(...arguments);
    }

    if ("byteLength" in value) {

        if ("byteOffset" in value) {
            return BigVec.fromDataView(...arguments);
        }

        if ("length" in value) {
            return BigVec.fromArrayView(...arguments);
        }

        return BigVec.fromBuffer(...arguments);
    }

    if (Array.isArray(value)) {
        return BigVec.fromArray(...arguments);
    }

    if ("buffer" in value) {
        return BigVec.fromMemory(...arguments);
    }

    throw new TypeError(`Invalid type for BigVec(${value})`);
}

export function BigVec128Array () {

    let [buffer, byteOffset = 0, length, indices = []] = arguments, byteLength;
    
    if (isNaN(buffer) === false) {
        length      = buffer;
        byteLength  = length * BYTES_PER_ELEMENT;
        buffer      = new ArrayBuffer(byteLength);

        return new BigVec128Array(buffer, byteOffset, length);
    }

    length   ||= (buffer.byteLength - byteOffset) / BYTES_PER_ELEMENT;
    byteLength = length * BYTES_PER_ELEMENT;

    Object.defineProperties(this, {
        buffer      : { value: buffer },
        byteOffset  : { value: byteOffset },
        byteLength  : { value: byteLength },
        length      : { value: length },
    });

    if (indices !== false) {
        this.defineIndices(indices);
    }

    return this;
}

Object.defineProperties(BigVec, {
    from : {
        value : function () {
            return BigVec(...arguments);
        }
    },

    fromUUID: {
        value: function () {
            const [uuid] = arguments;
            return this.fromString(uuid);
        }
    },
    
    fromString: {
        value: function () {
            let [string = "0"] = arguments;

            if (string.startsWith("0x")) {
                return this.fromBigInt(BigInt(string));
            }

            return this.fromString(`0x${string.replaceAll("-", "")}`);
        }
    },
    
    fromBigInt: {
        value: function () {
            const [bigint = 0n] = arguments;
            const vec = Object(bigint);
            Object.create(vec);
            Object.setPrototypeOf(vec, this.prototype);
            return vec;
        }
    },
    
    random: {
        value: function () {
            return this.fromUUID(crypto.randomUUID());
        }
    },
    
    fromReducedString: {
        value: function () {
            const [value = ""] = arguments;

            let t = `${value}`
            let i = t.length - 1;
            let l = BYTES_PER_ELEMENT-1;

            let hex = "", char = "";
            const tarray = new Uint8Array(BYTES_PER_ELEMENT);

            while (i > -1) {
                if (char = t[i--]) {
                    if (char.match(/[0-9a-f]/i)) {
                        if (hex) {
                            tarray[l--] = parseInt(char + hex, BYTES_PER_ELEMENT);
                            hex = "";
                            continue;
                        }
                        hex = char;
                    }
                }
            }

            return this.fromArrayView(tarray);
        }
    },
    
    fromBuffer: {
        value: function () {
            const [buffer, offset = 0]  = arguments;
            const uInt8ByteArrayView    = new Uint8Array(buffer, offset, BYTES_PER_ELEMENT);

            return this.fromArray(Array.from(uInt8ByteArrayView));
        }
    },

    fromDataView: {
        value: function () {
            const [dataView, offset = 0] = arguments;
            return this.fromBuffer(dataView.buffer, offset + dataView.byteOffset);
        }
    },

    fromArrayView: {
        value: function () {
            const [view, offset = view.byteOffset] = arguments;
            return this.fromBuffer(view.buffer, offset);
        }
    },

    fromMemory: {
        value: function () {
            const [value, offset = 0] = arguments;
            return this.fromBuffer(value.buffer, offset);
        }
    },

    fromArray: {
        value: function () {
            const [array = []] = arguments;
            return this.fromString(`0x${array.map(v => v.toString(16).padStart(2,0)).join("")}`)
        }
    }
});

Object.defineProperties(BigVec.prototype, {

    toBuffer: {
        value: function () {
            return Uint8Array.from(this.toArray()).buffer;
        }
    },

    toArray: {
        value: function () {
            return this.toString().match(/[0-9a-f]{2}/gi).map(v => parseInt(v, 16));
        }
    },

    toString: {
        value: function () {
            return BigInt.prototype.toString.call(this, 16).padStart(32, 0);
        }
    },

    toJSON: {
        value: function () {
            return this.toString();
        }
    },

    toHEX: {
        value: function () {
            return `0x${this.toString()}`;
        }
    },

    toUUID: {
        value: function () {
            return this.toString().replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5");;
        }
    },

    toArrayView: {
        value: function () {
            const [TypedArray = Uint8Array] = arguments;
            return new TypedArray(this.toBuffer());
        }
    },
    
    valueOf: {
        value: function () {
            return this.toBigInt();
        }
    },

    toBigInt: {
        value: function () {
            return BigInt(this.toHEX());
        }
    },

    [ Symbol.toPrimitive ] : {
        value : function () {
            return this.toBigInt();
        }
    },

    [ "{{Debugger}}" ] : {
        get : function () {
            const [v0, v1, v2, v3] = this.toArrayView(Float32Array);
            return {
                __proto__   : null,
                hex         : this.toHEX(),
                uuid        : this.toUUID(),
                string      : this.toString(),
                buffer      : this.toBuffer(),
                array       : this.toArray(),
                position    : { x : v0, y : v1, z : v2, w : v3, __proto__ : null },
                color       : { r : v0, g : v1, b : v2, a : v3, __proto__ : null },
                view        : {
                    __proto__ : null,
                    v128  : this.toArrayView(BigVec128Array),
                    f64x2 : this.toArrayView(Float64Array),
                    f32x4 : this.toArrayView(Float32Array),
                    u64x2 : this.toArrayView(BigUint64Array),
                    u32x4 : this.toArrayView(Uint32Array),
                    u16x8 : this.toArrayView(Uint16Array),
                    u8x16 : this.toArrayView(Uint8Array),
                    i64x2 : this.toArrayView(BigInt64Array),
                    i32x4 : this.toArrayView(Int32Array),
                    i16x8 : this.toArrayView(Int16Array),
                    i8x16 : this.toArrayView(Int8Array),
                }
            };
        }
    }
})

Object.defineProperties(BigVec128Array, {

    BYTES_PER_ELEMENT : { 
        value: BYTES_PER_ELEMENT 
    },

    from : {
        value : function ( elements, mapFn = v => v, thisArg = null ) {
            const values = Object.values(elements);
            const vec128 = new this(values.length);
            
            vec128.set(values.map(mapFn.bind(thisArg)));
            return vec128;
        }
    },

    of : {
        value : function ( ...elements ) {
            return this.from(elements);
        }
    },

    random : {
        value : function () {
            const [length = 1] = arguments;
            return new this(length).random();
        }
    },
});

Object.defineProperties(BigVec128Array.prototype, {

    BYTES_PER_ELEMENT : { value: BYTES_PER_ELEMENT },

    setValue : {
        value : function () {
            const [value, index = 0] = arguments;
            const vector             = BigVec(value);
            
            this.toArrayView(
                Uint8Array,
                index * BYTES_PER_ELEMENT,
                BYTES_PER_ELEMENT
            ).set(vector.toArrayView());
            
            this.defineIndex(index, vector);
        }
    },

    set : {
        value : function () {
            const [arrayLike, index = 0] = arguments;

            arrayLike.forEach((element, i) => {
                this.setValue(element, i + index); 
            });
        }
    },

    at : {
        value : function () {
            let [index = 0] = arguments;
            if  (index < 0) { index += this.length };

            const view = new Uint8Array(
                this.buffer, 
                this.byteOffset + index * BYTES_PER_ELEMENT, 
                BYTES_PER_ELEMENT
            );

            return BigVec.fromArrayView(view);
        }
    },

    fill : {
        value : function () {
            let [element, start=0, end=this.length] = arguments;
            return this.set(new Array(end-start).fill(element), start), this;
        }
    },

    random : {
        value : function () {
            this.set(new Array(this.length).fill().map(BigVec.random.bind(BigVec)));
            return this;
        }
    },

    defineIndex : {
        value : function () {
            let [index=0, vector] = arguments;

            Object.defineProperty(this, index, {
                value : vector || this.at(index),
                enumerable: true,
                configurable: true,
                writable: false
            })
        } 
    },

    defineIndices : {
        value : function () {
            let [indices = []] = arguments;
            for (let i=0; i<this.length; i++) {
                this.defineIndex(i, indices[i])
            }
        } 
    },

    forEach : {
        value : function () {
            let [mapFn = v => v, thisArg = null] = arguments;
            for (let i=0; i<this.length; i++) {
                mapFn.call(thisArg, this.at(i), i, this);
            }
        } 
    },

    map : {
        value : function () {
            let [mapFn = v => v, thisArg = null] = arguments;

            const length      = this.length;
            const vectorArray = new BigVec128Array(length);
            const vectorView  = vectorArray.toArrayView();

            for (let i=0; i<length; i++) {

                const item       = this.at(i);
                const element    = mapFn.call(thisArg, item, i, this);
                const view       = BigVec(element).toArrayView(); 
                const byteOffset = i * BYTES_PER_ELEMENT;

                vectorView.set(view, byteOffset);
            }

            return vectorArray;
        } 
    },

    subarray : {
        value : function () {
            let [begin = 0, end = this.length] = arguments;
            const length        = end - begin;
            const byteOffset    = begin * BYTES_PER_ELEMENT;
            const indices       = new Array(length).fill().map((v,i) => this.at(begin + i));

            return new BigVec128Array(this.buffer, byteOffset, length, indices);
        }
    },

    slice : {
        value : function () {
            let [begin = 0, end = this.length] = arguments;

            const length        = end - begin;
            const byteOffset    = begin * BYTES_PER_ELEMENT;
            const byteLength    = length * BYTES_PER_ELEMENT;

            const vectorArray   = new BigVec128Array(length);

            new Uint8Array(vectorArray.buffer).set(
                new Uint8Array(this.buffer, byteOffset, byteLength)
            ) 

            vectorArray.defineIndices();

            return vectorArray;
        }
    },

    toArrayView : {
        value : function () {
            let [
                TypedArray = Uint8Array, 
                byteOffset = 0, 
                length     = (this.byteLength - byteOffset) / TypedArray.BYTES_PER_ELEMENT
            ] = arguments;
            
            return new TypedArray( this.buffer, byteOffset, length )
        }
    },

    toArray : {
        value : function () {
            const [begin=0, end=this.length] = arguments;
            return new Array(end-begin).fill().map((v,i) => this.at(begin+i));
        }
    },

    toJSON : {
        value : function () {
            return this.toHEXArray().join(",");
        }
    },

    toUUIDArray : {
        value : function () {
            return this.toArray(...arguments).map(v => v.toUUID());
        }
    },

    toHEXArray : {
        value : function () {
            return this.toArray(...arguments).map(v => v.toHEX());
        }
    },

    toBufferArray : {
        value : function () {
            return this.toArray(...arguments).map(v => v.toBuffer());
        }
    },

    toViewArray : {
        value : function () {
            const [TypedArray = Uint8Array, ...args] = arguments
            return this.toArray(...args).map(v => v.toArrayView(TypedArray));
        }
    },

    toStringArray : {
        value : function () {
            return this.toArray(...arguments).map(v => v.toString());
        }
    },

    toText : {
        value : function () {
            return this.toString("");
        }
    },

    toString : {
        value : function () {
            const [separator = ","] = arguments;
            return this.toStringArray().join(separator);
        }
    },

    includes : {
        value : function () {
            const [element, fromIndex = 0] = arguments;
            return this.toArray().includes(element, fromIndex);
        }
    },

    indexOf : {
        value : function () {
            const [element, fromIndex = 0] = arguments;
            return this.toArray().indexOf(element, fromIndex);
        }
    },

    lastIndexOf : {
        value : function () {
            const [element, fromIndex = this.length - 1] = arguments;
            return this.toArray().lastIndexOf(element, fromIndex);
        }
    },

    keys : {
        value : function () {
            return new Array(this.length).fill().map((v,i) => i); 
        }
    },

    entries : {
        value : function () {
            return new Array(this.length).fill().map((v,i) => [i, this.at(i)]);
        }
    },

    values : {
        value : function () {
            return this.toArray();  
        }
    },

    join : {
        value : function () {
            return this.toString(...arguments)
        }
    },

    filter : {
        value : function () {
            return this.toArray().filter(...arguments);
        }
    },

    find : {
        value : function () {
            return this.toArray().find(...arguments);
        }
    },

    findIndex : {
        value : function () {
            return this.toArray().findIndex(...arguments);
        }
    },

    reduce : {
        value : function () {
            return this.toArray().reduce(...arguments);
        }
    },

    reduceRight : {
        value : function () {
            return this.toArray().reduceRight(...arguments);
        }
    },
    
    findLast : {
        value : function () {
            return this.toArray().findLast(...arguments);
        }
    },
    
    findLastIndex : {
        value : function () {
            return this.toArray().findLastIndex(...arguments);
        }
    },
    
    every : {
        value : function () {
            return this.toArray().every(...arguments);
        }
    },
    
    some : {
        value : function () {
            return this.toArray().some(...arguments);
        }
    },
    
    sort : {
        value : function () {
            return this.set(this.toArray().sort(...arguments));
        }
    },

    reverse : {
        value : function () {
            return this.set(this.toArray().reverse(...arguments));
        }
    },

    copyWithin : {
        value : function () {
            const [target, start = 0, end = this.length] = arguments;

            const arrayView = this.toArrayView(Uint8Array);
            
            arrayView.copyWithin(
                target * BYTES_PER_ELEMENT, 
                start * BYTES_PER_ELEMENT, 
                end * BYTES_PER_ELEMENT 
            );

            const finish = target + (end - start);

            for (let i=target; i<finish; i++) {
                this.defineIndex(i);
            }

            return this;
        }
    },
});

Reflect.defineProperty(self, "BigVec", { value: BigVec, enumerable: true, configurable: true, writable: true });

Reflect.defineProperty(self, "BigVec128Array", { value: BigVec128Array, enumerable: true, configurable: true, writable: true });

Reflect.defineProperty(DataView.prototype, "getBigVec128", {
    value : function getBigVec128 () {
        const [offset = 0] = arguments;
        return BigVec.fromDataView(this, offset);
    }
});

Reflect.defineProperty(DataView.prototype, "setBigVec128", {
    value : function setBigVec128 () {
        const [offset = 0, value] = arguments;

        new Uint8Array(
            this.buffer, 
            this.byteOffset + offset, 
            BYTES_PER_ELEMENT
        ).set( BigVec(value).toArrayView() );
    }
});