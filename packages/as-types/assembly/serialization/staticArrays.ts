/**
 * Converts StaticArray<u8> to Uint8Array.
 *
 * @param arr -
 * @returns Uint8Array
 */
// @ts-ignore: decorator
@inline
export function wrapStaticArray(arr: StaticArray<u8>): Uint8Array {
  return Uint8Array.wrap(changetype<ArrayBuffer>(arr));
}

/**
 * Converts a Uint8Array to StaticArray<u8>.
 *
 * @param arr - array to convert
 * @returns converted array
 */
// @ts-ignore: decorator
@inline
export function unwrapStaticArray(arr: Uint8Array): StaticArray<u8> {
  return changetype<StaticArray<u8>>(arr.buffer);
}
