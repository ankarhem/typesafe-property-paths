// Test helpers
type Expect<T extends true> = T;
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y
  ? 1
  : 2
  ? true
  : false;
type NotEqual<X, Y> = true extends Equal<X, Y> ? false : true;
type ExpectExtends<VALUE, EXPECTED> = EXPECTED extends VALUE ? true : false;

// Test objects
interface Object {
  firstName: 'jakob';
  lastName: string;
  nullish: string | null;
}

interface Nested {
  name?: {
    firstName: 'jakob';
    lastName: string;
  };
}

interface WithArray {
  children: {
    name: string;
  }[];
}

interface HasNullishParent {
  parent: {
    name: string;
  } | null;
}

interface ObjectWithAnyKey {
  [key: string]: {
    id: string;
  };
}

// Cases
type cases_PropertyStringPath = [
  Expect<Equal<PropertyStringPath<Object>, "firstName" | "lastName" | "nullish">>,
  Expect<Equal<PropertyStringPath<Required<Nested>>, "name" | "name.firstName" | "name.lastName">>,
  Expect<Equal<PropertyStringPath<Nested>, "name" | "name.firstName" | "name.lastName">>,
  Expect<Equal<PropertyStringPath<WithArray>, "children" | `children[${number}]` | `children[${number}].name`>>,
  Expect<Equal<PropertyStringPath<HasNullishParent>, "parent" | "parent.name">>,
  Expect<Equal<PropertyStringPath<ObjectWithAnyKey>, `${string}` | `${string}.id`>>,
  // @ts-expect-error
  Expect<ExpectExtends<PropertyStringPath<Object>, "nope">>,
  // @ts-expect-error
  Expect<ExpectExtends<PropertyStringPath<WithArray>, `children[${number}].nope`>>
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

type cases_ValueAtPath = [
  Expect<Equal<ValueAtPath<Object, 'firstName'>, 'jakob'>>,
  Expect<Equal<ValueAtPath<Nested, 'name'>, Nested['name']>>,
  Expect<Equal<ValueAtPath<Nested, 'name.firstName'>, 'jakob' | undefined>>,
  Expect<Equal<ValueAtPath<WithArray, 'children'>, WithArray['children']>>,
  Expect<Equal<ValueAtPath<Object, 'nullish'>, string | null>>,
  Expect<Equal<ValueAtPath<HasNullishParent, 'parent'>, HasNullishParent['parent']>>,
  Expect<Equal<ValueAtPath<HasNullishParent, 'parent.name'>, string | null>>,
  Expect<Equal<ValueAtPath<ObjectWithAnyKey, 'anyKey.id'>, string | undefined>>,
  // @ts-expect-error
  ValueAtPath<Object, 'nope'>,
  Expect<NotEqual<ValueAtPath<Object, 'firstName'>, string>>,
  // @ts-expect-error
  ValueAtPath<Nested, 'name?.firstName'>,
];

export type ValueAtPath<
  T,
  Path extends PropertyStringPath<T>
> = string extends keyof T
    ? Path extends `${string}.${infer Rest}` // | `${string}?.${infer Rest}`
      ? Rest extends PropertyStringPath<NonNullable<T[string]>>
        ? ValueAtPath<NonNullable<T[string]>, Rest> | undefined
        : never
      : never
  : Path extends keyof T
  ? // if path is immediate property of T
    T[Path]
  : // else we infer the rest of the path
  Path extends `${infer K}.${infer Rest}`
  ? // make sure K is a property of T
    K extends keyof T
    ? // and that the rest is a path in the value of K
      Rest extends PropertyStringPath<NonNullable<T[K]>>
      ? // infer possible nullish value
        T[K] extends NonNullable<T[K]> | infer Nullish
        ? // Recurse and add the nullish value to the result if it exists
          | ValueAtPath<NonNullable<T[K]>, Rest>
            | (Nullish extends undefined | null ? Nullish : never)
        : never
      : never
    : // if path has an array infer the rest
    Path extends `${infer K}[${number}].${infer Rest}`
    ? // make sure initial part is a property of T
      K extends keyof T
      ? // and that the value of K is supposed to be an array
        T[K] extends Array<infer U> | infer Nullish
        ? // and that the rest is a path in the value of K
          Rest extends PropertyStringPath<NonNullable<U>>
          ? // recurse and add the nullish value to the result if it exists
            | ValueAtPath<NonNullable<U>, Rest>
              | (Nullish extends undefined | null ? Nullish : never)
          : never
        : never
      : never
    : never
  : // if the path is to an array item but not a nested object inside that array
  Path extends `${infer K}[${number}]`
  ? // make sure K is a property of T
    K extends keyof T
    ? // and that the value of K is supposed to be an array
      T[K] extends Array<infer U> | infer Nullish
      ? // Add the nullish value to the result if it exists
        U | (Nullish extends undefined | null ? Nullish : never)
      : never
    : never
  : never;

// Test for concat
type first = 'hello';
type second = 'world';
type example = ReturnType<typeof concat<first, second>>;

type example2 = ReturnType<typeof concat<'some', 'string'>>;

type cases_concat = [
  Expect<Equal<example, 'helloworld'>>,
  Expect<Equal<example2, 'somestring'>>,
  Expect<NotEqual<example, string>>,
  Expect<NotEqual<example2, string>>
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
