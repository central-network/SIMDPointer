# LocalSharedMemory

<p align="center">
  <br />
  <strong><code>LocalSharedMemory</code></strong>
  <br />
  A micro-library that brings C-style <code>malloc</code> and intuitive memory management to JavaScript's <code>SharedArrayBuffer</code> and <code>WebAssembly.Memory</code>.
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License"></a>
</p>

---

## Why LocalSharedMemory?

Working directly with `SharedArrayBuffer` can be complex. It requires manual tracking of byte offsets, ensuring data is aligned correctly, and carefully managing memory segments, especially in multi-threaded applications using Web Workers.

`LocalSharedMemory` abstracts away these complexities. It provides a simple, robust, and developer-friendly API to allocate, manage, and access shared memory blocks, letting you focus on your application logic instead of low-level memory gymnastics.

## Key Features

-   🚀 **Zero Dependencies:** A single, lightweight JavaScript module.
-   🧠 **Familiar C-Style API:** Easy and powerful `malloc()` for dynamic memory allocation.
-   🔩 **Automatic Memory Alignment:** Ensures allocated blocks meet alignment requirements for optimal performance across all platforms.
-   📊 **Easy Allocation Tracking:** Inspect all allocated memory blocks at any time with the `allocs()` method.
-   ✍️ **Rich Data Accessors:** A comprehensive set of `get/set` methods for all standard numeric types (e.g., `getUint32`, `setFloat64`).
-   👀 **Versatile Memory Views:** Effortlessly create `TypedArray` views (`Uint8Array`, `Float32Array`, etc.), `DataView`s, or even copies as standard `ArrayBuffer`s.
-   ⚛️ **Built-in Atomics:** Wrapper methods for safe, concurrent data manipulation in multi-threaded environments.
-   🧩 **Seamless Integration:** Extends `WebAssembly.Memory`, so it can be used wherever a standard memory object is expected.

## Quick Start

### 1. Installation

Since it's a single module, just import it into your project.

```javascript
import LocalSharedMemory from "./node_modules/LocalSharedMemory/index.js";
```

### 2. Usage Example

```javascript
// Create a new shared memory instance.
// Manages a block of memory that can be shared between threads.
const memory = new LocalSharedMemory();

// Allocate memory using malloc().
// Returns a "pointer" (byte offset) to the start of the block.
const ptr1 = memory.malloc(32); // Allocate 32 bytes
const ptr2 = memory.malloc(100); // Allocate another 100 bytes

// Write and read data using familiar getter/setter methods.
memory.setFloat64(ptr1, Math.PI);
memory.setInt32(ptr1 + 8, 9999); // Write at an offset from the pointer

const pi = memory.getFloat64(ptr1); // Returns ~3.14159
const myInt = memory.getInt32(ptr1 + 8); // Returns 9999

// Create a TypedArray view to work with a memory block more easily.
const uint8View = memory.arrayView(Uint8Array, ptr2);

// Fill the view with data
uint8View.fill(255, 0, 50); // Set the first 50 bytes to 255
uint8View[51] = 128;

// Inspect all current allocations in a clean table format.
console.table(memory.allocs());
```

## API Reference

### `new LocalSharedMemory(initial, maximum, shared)`

Creates a new memory instance. It accepts the same parameters as the `WebAssembly.Memory` constructor.

-   `initial` (Number): The initial size of the memory, in WebAssembly pages (64KB each). **Default:** `1000`.
-   `maximum` (Number): The maximum size the memory is allowed to grow to. **Default:** `initial`.
-   `shared` (Boolean): Whether the memory is shared. **Default:** `true`.

---

### `malloc(byteLength, alignBytes = 16)`

Allocates a block of memory.

-   `byteLength` (Number): The required size of the allocation in bytes.
-   `alignBytes` (Number): The byte boundary to align the allocation to. **Default:** `16`.
-   **Returns** (Number): The byte offset (pointer) to the start of the allocated block.

*Each allocation includes an 8-byte header just before the returned offset, which stores metadata.*

---

### `allocs()`

Retrieves a list of all memory blocks allocated by `malloc()`.

-   **Returns** (Array): An array of objects, where each object contains:
    -   `byteOffset`: The starting offset of the writable data area.
    -   `byteLength`: The user-requested size of the allocation.
    -   `bufferSize`: The total space used by the allocation (including headers and padding).
    -   `buffer`: A `SharedArrayBuffer` slice for debugging.

---

### `sizeof(offset)` & `lengthof(offset)`

-   `sizeof(offset)`: Returns the user-requested `byteLength` of an allocation.
-   `lengthof(offset)`: Returns the internal `bufferSize` of an allocation (its total footprint).

---

### Data Accessors & Views

#### View Methods

-   `arrayBuffer(offset, length)`: Returns a sliced `ArrayBuffer` copy (not shared).
-   `sharedArrayBuffer(offset, length)`: Returns a sliced `SharedArrayBuffer` view.
-   `dataView(offset, length)`: Returns a `DataView` of a memory segment.
-   `arrayView(TypedArray, offset, length)`: Returns a `TypedArray` (e.g., `Uint8Array`) view.

#### Getter/Setter Methods

A full suite of getter and setter methods are available for all standard numeric types.

| Type          | Setter Method         | Getter Method         |
| ------------- | --------------------- | --------------------- |
| `Int8`        | `setInt8(off, val)`   | `getInt8(off)`        |
| `Uint8`       | `setUint8(off, val)`  | `getUint8(off)`       |
| `Int16`       | `setInt16(off, val)`  | `getInt16(off)`       |
| `Uint16`      | `setUint16(off, val)` | `getUint16(off)`      |
| `Int32`       | `setInt32(off, val)`  | `getInt32(off)`       |
| `Uint32`      | `setUint32(off, val)` | `getUint32(off)`      |
| `Float32`     | `setFloat32(off, val)`| `getFloat32(off)`     |
| `Float64`     | `setFloat64(off, val)`| `getFloat64(off)`     |
| `BigInt64`    | `setBigInt64(off, val)`| `getBigInt64(off)`    |
| `BigUint64`   | `setBigUint64(off, val)`| `getBigUint64(off)`   |

---

### Atomic Operations

For safe concurrent operations, you can use the built-in atomic methods, which wrap the global `Atomics` object (e.g., `add`, `sub`, `and`, `or`, `xor`, `exchange`, `compareExchange`, `load`, `store`).

```javascript
// Atomically add 10 to a value at a specific index in a Uint32Array view
memory.add(Uint32Array, index, 10);
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
