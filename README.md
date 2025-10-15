# 🚀 SIMDPointer 🚀

<p align="center">
  <br />
  <strong><code>SIMDPointer</code></strong>
  <br />
   A revolutionary library that brings <code>low-level</code> memory management and powerful <code>128-bit primitives</code> to the JavaScript world. We provide a novel way to work with native JavaScript values, managed by pointers over a local <code>shared memory</code> buffer. This is not just another library; it's a new paradigm for high-performance computing in JS.
</p>

<p align="center">
  <a href="NPM"><img src="https://img.shields.io/npm/v/simdpointer.svg" alt="NPM Package"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License"></a>
</p>

---

## ✨ The Art of Intelligence ✨

We believe in the "Art of Intelligence," and `SIMDPointer.js` is a testament to that philosophy. It's designed to be elegant, powerful, and a joy to use.

## 💡 Core Concepts

### 🧠 Local Shared Memory

At the heart of `SIMDPointer.js` is a `LocalSharedMemory` instance. This provides a contiguous block of memory that we can read from and write to, just like in C or Rust.

### 👉 Pointers

We introduce a `Pointer` class that behaves like a memory address. These pointers are just numbers, but they give us a powerful way to reference and manage data within our shared memory.

### 📦 Typed Arrays and Numbers

We provide a full suite of `TypedArray` and `TypedNumber` classes that mirror the standard JavaScript `TypedArray`s, but with a key difference: they operate on our shared memory. This includes:

-   `Uint8Array`, `Int8Array`
-   `Uint16Array`, `Int16Array`
-   `Uint32Array`, `Int32Array`
-   `Float32Array`, `Float64Array`
-   `BigUint64Array`, `BigInt64Array`
-   And our very own `BigVec128Array`!

## Introducing `BigVec` - The 128-bit Primitive 🌌

The star of the show is `BigVec`, our novel 128-bit primitive type. While JavaScript doesn't have a native 128-bit integer, we've created a `BigInt`-prototyped object that can hold 128-bit values.

This opens up a world of possibilities, including native UUID generation!

###  UUIDs from `BigVec`

A `BigVec` instance can be effortlessly converted to a 32-character hex string, which is the standard format for a UUID v4.

```javascript
import SIMD from 'simdpointer';

// Create a random BigVec128Array with 4 elements
const myVectors = SIMD.BigVec128Array.random(4);

// Get the first vector from the array
const aVector = myVectors.debug().at(0);

// Convert it to a UUID!
const myUUID = aVector.toUUID(); 

console.log(myUUID); // e.g., 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6'
```

## 🎮 Example Usage

Let's see the magic in action!

```javascript
import SIMD from 'simdpointer';

// Let's create a random BigVec128Array with 4 vectors
const vecArray = SIMD.BigVec128Array.random(4);

// You can get a debug-friendly view of the array
const debugVectors = vecArray.debug();

// Access a single vector and its UUID representation
const firstVec = debugVectors.at(0);
console.log('My first vector:', firstVec);
console.log('As a UUID:', firstVec.toUUID());
console.log('As a hex string:', firstVec.toString());

// It works with other types too!
const u32Array = SIMD.Uint32Array.random(4);
console.log('A random Uint32Array:', u32Array.debug());

// You can also create single numbers
const aRandomUUID = crypto.randomUUID();
const bigVecNumber = SIMD.BigVec128Number.of(aRandomUUID);

console.log('Original UUID:', aRandomUUID);
console.log('BigVec Number:', bigVecNumber.value());
console.log('Back to string:', bigVecNumber.value().toString());

const aFloat = 3.14159265359;
const float64Number = SIMD.Float64Number.of(aFloat);
console.log('Original float:', aFloat);
console.log('Float64 Number:', float64Number.value());

```

## 🛠️ API

### `SIMD.Pointer`

The base class for all our memory-managed types.

### `SIMD.TypedNumber` classes

-   `SIMD.Uint8Number`
-   `SIMD.Int8Number`
-   ...and so on for all types.

### `SIMD.TypedArray` classes

-   `SIMD.Uint8Array`
-   `SIMD.Int8Array`
-   `SIMD.BigVec128Array`
-   ...and so on for all types.

## 📦 Installation

```bash
npm install simdpointer
```

---

Made with ❤️ and a touch of genius.