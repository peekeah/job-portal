/**
 * Server side object deep clone util using JSON serialization.
 * Not efficient for large objects but good enough for most use cases.
 *
 * Client side can simply use structuredClone.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const deepClone = <T extends { [key: string]: any }>(object: T) =>
  JSON.parse(JSON.stringify(object)) as T;
