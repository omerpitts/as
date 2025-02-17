import { Result } from '../result';
import { Serializable } from '../serializable';

// Serialize array

/**
 * Convert an array of type parameter to StaticArray<u8>
 *
 * @remarks
 * This will perform a deep copy only for native types.
 * inspired by https://github.com/AssemblyScript/assemblyscript/blob/main/std/assembly/array.ts#L69-L81
 *
 * @see {@link Serializable}
 *
 * @param source - the array to convert
 */
export function nativeTypeArrayToBytes<T>(source: T[]): StaticArray<u8> {
  const sourceLength = source.length;

  // ensures that the new array has the proper length.
  // u16 are encoded using 4 bytes, u64 uses 8
  // hence we need to multiple by 2 (swap bit) the right number of time (alignof<T>)
  let targetLength = (<usize>sourceLength) << alignof<T>();

  // allocates a new StaticArray<u8> in the memory
  let target = changetype<StaticArray<u8>>(
    // @ts-ignore: Cannot find name '__new'
    __new(targetLength, idof<StaticArray<u8>>()),
  );

  // copies the content of the source buffer to the newly allocated array.
  // Note: the pointer to the data buffer for Typed Array is in dataStart.
  // There is no such things for StaticArray.
  memory.copy(changetype<usize>(target), source.dataStart, targetLength);

  return target;
}

/**
 * Convert an array of type parameter to StaticArray<u8>
 *
 * @remarks
 * This will perform a deep copy
 * inspired by https://github.com/AssemblyScript/assemblyscript/blob/main/std/assembly/array.ts#L69-L81
 *
 * @see {@link Serializable}
 *
 * @param source - the array to convert
 */
export function serializableObjectsArrayToBytes<T extends Serializable>(
  source: T[],
): StaticArray<u8> {
  const nbElements = source.length;
  const pointers = new Array<usize>(nbElements);
  const sizes = new Array<usize>(nbElements);
  let totalLength = 0;

  for (let i = 0; i < nbElements; i++) {
    const bytes: StaticArray<u8> = source[i].serialize();

    pointers[i] = changetype<usize>(bytes);
    sizes[i] = bytes.length;
    totalLength += bytes.length;
  }

  // allocates a new StaticArray<u8> in the memory
  const target = changetype<StaticArray<u8>>(
    // @ts-ignore: Cannot find name '__new'
    __new(totalLength, idof<StaticArray<u8>>()),
  );

  let offset: usize = 0;
  for (let i = 0; i < nbElements; i++) {
    // copies the content of the source buffer to the newly allocated array.
    memory.copy(changetype<usize>(target) + offset, pointers[i], sizes[i]);
    offset += sizes[i];
  }

  return target;
}

// De-serialize array

/**
 * Converts a StaticArray<u8> into a Array of type parameter.
 *
 * @remarks
 * inspired by https://github.com/AssemblyScript/assemblyscript/blob/main/std/assembly/array.ts#L69-L81
 *
 * @param source - the array to convert
 */
export function bytesToNativeTypeArray<T>(source: StaticArray<u8>): T[] {
  let bufferSize = source.length;
  const array = instantiate<T[]>(bufferSize >> alignof<T>());
  memory.copy(array.dataStart, changetype<usize>(source), bufferSize);

  return array;
}

/**
 * Converts a StaticArray<u8> into a Array of type parameter.
 *
 * @param source - the array to convert
 */
export function bytesToSerializableObjectArray<T extends Serializable>(
  source: StaticArray<u8>,
): Result<T[]> {
  const array = instantiate<T[]>(0);

  let offset = 0;

  while (offset < source.length) {
    const object = instantiate<T>();
    const result = object.deserialize(source, offset);
    if (result.isErr()) {
      return new Result(
        [],
        `Can't deserialize array of object ${typeof object}`,
      );
    }
    offset = result.unwrap();
    array.push(object);
  }

  return new Result(array);
}
