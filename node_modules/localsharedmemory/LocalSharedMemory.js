export default class LocalSharedMemory extends WebAssembly.Memory {
    
    static devicePageSize = 1000

    constructor (initial = new.target.devicePageSize, maximum = initial, shared = true) {
        super({ initial, maximum, shared });

        Reflect.defineProperty(this, "ai32", {
            value: new Uint32Array(this.buffer, 0, 2)
        })

        this.ai32.set([8])
    }

    get length () { return this.ai32.at(0) }

    allocs () {
        const allocs = new Array();
        let offset = 16, length;
        while (length = this.lengthof(offset)) {
            const size = this.sizeof(offset);

            allocs.push({
                byteOffset: offset, 
                bufferSize: length,
                byteLength: size,
                buffer: this.sharedArrayBuffer(offset, size)
            });
            
            offset += length
        }

        return allocs;
    }

    sizeof (offset) {
        return this.getUint32(offset ? offset - 8 : 0)
    }

    lengthof (offset) {
        return this.getUint32(offset ? offset - 4 : 0)
    }

    malloc (byteLength, alignBytes = 16) {
        if (!byteLength) { throw `malloc needs size: ${byteLength}` }

        let remain , length = 8 + byteLength;
        if (remain = length % alignBytes) {
            length += alignBytes - remain;
        }

        const offset = 8 + Atomics.add(this.ai32, 0, length);
        Atomics.add(this.ai32, 1, 1)

        this.setUint32(offset-4, length);
        this.setUint32(offset-8, byteLength);

        return offset;
    }

    arrayBuffer (offset, length) {
        if (!offset) { throw `offset required: ${offset}` }
        return this.arrayView(Uint8Array, offset, length).slice().buffer
    }
    
    sharedArrayBuffer (offset, length) {
        if (!offset) { throw `offset required: ${offset}` }
        return this.buffer.slice(offset, offset+length)
    }
    
    dataView (offset, length = this.sizeof(offset)) {
        if (!offset) { throw `offset required: ${offset}` }
        return Reflect.construct(DataView, [this.buffer, offset, length])
    }

    arrayView (TypedArray, offset, length = this.sizeof(offset) / TypedArray.BYTES_PER_ELEMENT) {
        if (!offset) { throw `offset required for arrayView: ${offset}` }
        if (!length) { throw `length required for arrayView: ${length}` }
        return Reflect.construct(TypedArray, [this.buffer, offset, length])
    }

    setUint8 (offset, value = 0) {
        if (!offset) { throw `offset required: ${offset}` }
        this.dataView(offset, Uint8Array.BYTES_PER_ELEMENT).setUint8(0, value)
    }

    getUint8 (offset) {
        return this.dataView(offset, Uint8Array.BYTES_PER_ELEMENT).getUint8(0)
    }

    setUint16 (offset, value = 0) {
        if (!offset) { throw `offset required: ${offset}` }
        this.dataView(offset, Uint16Array.BYTES_PER_ELEMENT).setUint16(0, value, true)
    }

    getUint16 (offset) {
        return this.dataView(offset, Uint16Array.BYTES_PER_ELEMENT).getUint16(0, true)
    }

    setUint32 (offset, value = 0) {
        if (!offset) { throw `offset required: ${offset}` }
        this.dataView(offset, Uint32Array.BYTES_PER_ELEMENT).setUint32(0, value, true)
    }

    getUint32 (offset) {
        return this.dataView(offset, Uint32Array.BYTES_PER_ELEMENT).getUint32(0, true)
    }

    setBigUint64 (offset, value = 0) {
        if (!offset) { throw `offset required: ${offset}` }
        this.dataView(offset, BigUint64Array.BYTES_PER_ELEMENT).setBigUint64(0, value, true)
    }

    getBigUint64 (offset) {
        return this.dataView(offset, BigUint64Array.BYTES_PER_ELEMENT).getBigUint64(0, true)
    }

    setUint8 (offset, value = 0) {
        if (!offset) { throw `offset required: ${offset}` }
        this.dataView(offset, Uint8Array.BYTES_PER_ELEMENT).setUint8(0, value)
    }

    getInt8 (offset) {
        return this.dataView(offset, Int8Array.BYTES_PER_ELEMENT).getInt8(0)
    }

    setInt16 (offset, value = 0) {
        if (!offset) { throw `offset required: ${offset}` }
        this.dataView(offset, Int16Array.BYTES_PER_ELEMENT).setInt16(0, value, true)
    }

    getInt16 (offset) {
        return this.dataView(offset, Int16Array.BYTES_PER_ELEMENT).getInt16(0, true)
    }

    setInt32 (offset, value = 0) {
        if (!offset) { throw `offset required: ${offset}` }
        this.dataView(offset, Int32Array.BYTES_PER_ELEMENT).setInt32(0, value, true)
    }

    getInt32 (offset) {
        return this.dataView(offset, Int32Array.BYTES_PER_ELEMENT).getInt32(0, true)
    }

    setBigInt64 (offset, value = 0) {
        if (!offset) { throw `offset required: ${offset}` }
        this.dataView(offset, BigInt64Array.BYTES_PER_ELEMENT).setBigInt64(0, value, true)
    }

    getBigInt64 (offset) {
        return this.dataView(offset, BigInt64Array.BYTES_PER_ELEMENT).getBigInt64(0, true)
    }

    setFloat32 (offset, value = 0) {
        if (!offset) { throw `offset required: ${offset}` }
        this.dataView(offset, Float32Array.BYTES_PER_ELEMENT).setFloat32(0, value, true)
    }

    getFloat32 (offset) {
        return this.dataView(offset, Float32Array.BYTES_PER_ELEMENT).getFloat32(0, true)
    }

    setFloat64 (offset, value = 0) {
        if (!offset) { throw `offset required: ${offset}` }
        this.dataView(offset, Float64Array.BYTES_PER_ELEMENT).setFloat64(0, value, true)
    }

    getFloat64 (offset) {
        return this.dataView(offset, Float64Array.BYTES_PER_ELEMENT).getFloat64(0, true)
    }

    add (TypedArray, index, value) {
        if (!index) { throw `index required: ${index}` }
        return Atomics.add(this.arrayView(TypedArray), index, value)
    }

    at (TypedArray, index) {
        if (!index) { throw `index required: ${index}` }
        return this.arrayView(TypedArray).at(index)
    }

    fill (TypedArray, value, start, end) {
        if (!start) { throw `start required: ${start}` }
        return this.arrayView(TypedArray).fill(value, start, end)
    }

    copyWithin (TypedArray, target, start, end) {
        if (!target) { throw `target required: ${target}` }
        return this.arrayView(TypedArray).copyWithin(target, start, end)
    }

    subarray (TypedArray, start, end) {
        if (!start) { throw `start required: ${start}` }
        return this.arrayView(TypedArray).subarray(start, end)
    }

    set (TypedArray, arrayLike = [], index) {
        if (!index) { throw `index required: ${index}` }
        this.arrayView(TypedArray).set(arrayLike, index)
    }
}

