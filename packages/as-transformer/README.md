# `as-transformer`

An [AssemblyScript transformer](https://www.assemblyscript.org/compiler.html#transforms) helper module.

- [`as-transformer documentation`](https://as-transformer.docs.massa.net)

## Installation

To install this module, run the following command at your project root directory :

```shell
npm install -D @massalabs/as-transformer
```

## Usage

Tell your editor where to find the transformer types in a typing file. For example `assembly/types.d.ts`.

```typescript
/// <reference types="@massalabs/as-transformer" />
```

You can use this transformer by adding `--transform @massalabs/as-transformer` to your asc command.

For instance, to compile `assembly/my_sc.ts` with this transformer you will execute:

```shell
npx asc --transform @massalabs/as-transformer assembly/my_sc.ts --target release --exportRuntime -o build/my_sc.wasm
```

### Transform ts files

#### file2ByteArray

##### Transformations

This transformer loads the given file, encodes it to `StaticArray<u8>` and then replace the call to `file2ByteArray` by the encoded content.

Example:

```typescript
export function main(_args: string): i32 {
    const bytes = fileToByteArray('./build/sc.wasm'); // will read `build/sc.wasm`, will encode it in array and then put the result in a string used to initialize `bytes`.
    const sc_addr = create_sc(bytes);
    call(sc_addr, "advance", "", 0);
    generate_event("SC deployed at addr: " + sc_addr);
    return 0;
}
```

#### Create a transformer

Transformers are located in `src/transformers` folder.
To create a new "call expression" transformer, the created class must implements:

- a constant member `strPattern` which define the expression to be matched by the transformer
- a `transform` method which implement the transformer itself
