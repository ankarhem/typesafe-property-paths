# typesafe-property-paths

Helpful for creating typesafe paths to properties in an object with semi-support for arrays.

<img width="1235" alt="image" src="https://user-images.githubusercontent.com/14110063/182397130-516bb90c-8ea0-40af-831b-61300b22af71.png">

## Helper functions

```typescript
import { concat } from "typesafe-property-paths";

const first = "hello"; // type is 'hello'
const second = "world"; //type is 'world'

const example = first + second; // type is string

const example2 = concat(first, second); // type is 'helloworld'
```
