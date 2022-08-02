// Test helpers
type Expect<T extends true> = T;
type ExpectFalse<T extends false> = T;

// Test object
interface Object {
  name: {
    firstName: string;
    lastName: string;
  };
  favoriteColors: string[];
  children: {
    name: {
      firstName: string;
      lastName: string;
    };
  }[];
}

// Cases
type cases = [
  Expect<'name.firstName' extends PropertyStringPath<Object> ? true : false>,
  Expect<'children' extends PropertyStringPath<Object> ? true : false>,
  Expect<'children[0]' extends PropertyStringPath<Object> ? true : false>,
  Expect<'children[0].name' extends PropertyStringPath<Object> ? true : false>,
  ExpectFalse<'nope' extends PropertyStringPath<Object> ? true : false>,
  ExpectFalse<
    'children[0].nope' extends PropertyStringPath<Object> ? true : false
  >
];

// Implementation
type Primitive = string | number | boolean | null | undefined;
type ArrayType<T> = T extends Array<infer U> ? U : never;

export type PropertyStringPath<T, Prefix = ''> = T extends object
  ? // If it's an object we want to add types
    {
      // Prefix is resulting string in the previous recursion
      // For each key in the object we set the type of key and value to
      // key: prefix + key | (possible recursion value)

      [K in keyof T]-?: NonNullable<T[K]> extends Primitive // If the value of the key is a primitive we can stop the recursion
        ? `${string & Prefix}${string & K}`
        : // Otherwise if the value is an array we add the types `prefix` + . + `key`
        // and `prefix` + . + `key` + [{any string}]
        // and recurse with the **array item value** of the array as the object
        // and set the prefix to `prefix` + . + `key` + [{any string}] + .
        NonNullable<T[K]> extends Array<any>
        ?
            | `${string & Prefix}${string & K}`
            | `${string & Prefix}${string & K}[${string}]`
            | PropertyStringPath<
                NonNullable<ArrayType<T[K]>>,
                `${string & Prefix}${string & K}[${string}].`
              >
        : // Otherwise if the value is an object we add the types `prefix` + . + `key`
          // and recurse with the value as the object and set the prefix to `prefix` + . + `key` + .
          | `${string & Prefix}${string & K}`
            | PropertyStringPath<
                NonNullable<T[K]>,
                `${string & Prefix}${string & K}.`
              >;
    }[keyof T] // Aggregate the type to a single type consisting of a union of all the value types
  : never; // This is a guard to prevent arrays from being passed to the function
