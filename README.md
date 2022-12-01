# typesafe-property-paths

Helpful for creating typesafe paths to properties in an object with semi-support for arrays.

```typescript
interface Object {
  firstName: 'jakob';
  lastName: string;
  children?: {
    firstName: string;
  }[];
}

type Paths = PropertyStringPath<Object>;
// type is "firstName" | "lastName" | "children" | "children[${number}]" | "children[${number}].firstName"
```

## Helper functions

`ValueAtPath` Can extract the type at a given path

```typescript
interface Object {
  name: {
    firstName: 'jakob';
    lastName: string | null;
  };
  favoriteColors: string[];
  children?: {
    name: {
      firstName: string;
      lastName?: string;
    };
  }[];
}

type LastName = ValueAtPath<Object, 'name.lastName'>;
// type is string | null

type ChildFirstName = ValueAtPath<Object, 'children[0].name.firstName'>;
// type is string | undefined
```

```typescript
import { concat } from 'typesafe-property-paths';

const first = 'hello'; // type is 'hello'
const second = 'world'; //type is 'world'

const example = first + second; // type is string

const example2 = concat(first, second); // type is 'helloworld'
```
