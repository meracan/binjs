# binjs
Read and write binary files to transfer data over http protocol.


## Installation
```bash
npm i -s @meracan/binjs
# or
git clone 
```

## Test
Using node, only works with >12
```bash
npm start
```

## Bundler and transcompiler
Webpack is used to bundle the code. 
Babel can be used to transcompile the code but commented out at the moment.

```bash
npm run build
```

## File format
```
1H - Should be 1 (This is to check the endiness of the file)
1B - Number of variables

For each variable:
16s       - Variable name
1s        - Type (e.g. B,H,I,b,h,i)
1I        - Size of array
1B        - Number of dimension (e.g. 1D, 2D)
ndim*I    - Shape of array
size*Type - data
```

## Type reminder
```
"B":Uint8Array,
"H":Uint16Array,
"I":Uint32Array,
"Q":BigUint64Array,
"b":Int8Array,
"h":Int16Array,
"i":Int32Array,
"q":BigInt64Array,
"f":Float32Array,
"d":Float64Array,
```