// Test helpers
type Expect<T extends true> = T;
type ExpectFalse<T extends false> = T;

// Test object
interface Object {
  name: {
    firstName: "jakob";
    lastName: string;
  };
  favoriteColors: string[];
  children: {
    name: {
      firstName: string;
      lastName?: string;
    };
  }[];
}

// Cases
type cases_PropertyStringPath = [
  Expect<"name.firstName" extends PropertyStringPath<Object> ? true : false>,
  Expect<"children" extends PropertyStringPath<Object> ? true : false>,
  Expect<"children[0]" extends PropertyStringPath<Object> ? true : false>,
  ExpectFalse<
    "children[hej]" extends PropertyStringPath<Object> ? true : false
  >,
  Expect<"children[0].name" extends PropertyStringPath<Object> ? true : false>,
  ExpectFalse<"nope" extends PropertyStringPath<Object> ? true : false>,
  ExpectFalse<
    "children[0].nope" extends PropertyStringPath<Object> ? true : false
  >
];

// Implementation
type Primitive = string | number | boolean | null | undefined;
type ArrayType<T> = T extends Array<infer U> ? U : never;

export type PropertyStringPath<T, Prefix = ""> = T extends object
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
            | `${string & Prefix}${string & K}[${number}]`
            | PropertyStringPath<
                NonNullable<ArrayType<T[K]>>,
                `${string & Prefix}${string & K}[${number}].`
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

export type ValueAtPath<
  T,
  Path extends PropertyStringPath<T>
> = Path extends keyof T
  ? T[Path]
  : Path extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? Rest extends PropertyStringPath<T[K]>
      ? ValueAtPath<T[K], Rest>
      : never
    : Path extends `${infer K}[${number}].${infer Rest}`
    ? K extends keyof T
      ? T[K] extends Array<infer U>
        ? Rest extends PropertyStringPath<U>
          ? ValueAtPath<U, Rest>
          : never
        : never
      : never
    : never
  : Path extends `${infer K}[${number}]`
  ? K extends keyof T
    ? T[K] extends Array<infer U>
      ? U
      : never
    : never
  : never;

type test = ValueAtPath<Object, "children[0].name.firstName">;

type cases_ValueAtPath = [
  Expect<"jakob" extends ValueAtPath<Object, "name.firstName"> ? true : false>,
  Expect<string extends ValueAtPath<Object, "name.lastName"> ? true : false>,
  Expect<
    string extends ValueAtPath<Object, "children[0].name.firstName">
      ? true
      : false
  >,
  Expect<
    string extends ValueAtPath<Object, "children[0].name.lastName">
      ? true
      : false
  >
];

// Helper functions

// Test for concat
type first = "hello";
type second = "world";
type example = ReturnType<typeof concat<first, second>>;

type example2 = ReturnType<typeof concat<"some", "string">>;

type cases_concat = [
  Expect<example extends "helloworld" ? true : false>,
  ExpectFalse<string extends example ? true : false>,
  Expect<example2 extends "somestring" ? true : false>,
  ExpectFalse<string extends example2 ? true : false>
];

// implementation

/**
 * Normal string concatenation will result in a type of string
 * This function will return the exact type of the string
 *
 * @example
 * const first = 'hello';
 * const second = 'world';
 *
 * const result = concat(first, second); // type = 'helloworld'
 **/
export function concat<T extends string, S extends string>(
  a: T,
  b: S
): `${T}${S}` {
  return `${a}${b}`;
}
