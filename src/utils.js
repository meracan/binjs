import isTypedArray from 'lodash.istypedarray';
export const dtypeToFormat = {
  "String":"s",
  "Uint8Array":"B",
  "Uint16Array":"H",
  "Uint32Array":"I",
  "BigUint64Array":"Q",
  "Int8Array":"b",
  "Int16Array":"h",
  "Int32Array":"i",
  "BigInt64Array":"q",
  "Float32Array":"f",
  "Float64Array":"d",
}

export const formatToDtype = {
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
}
export const formatBytes = {
  "s":1,
  "b":1,
  "h":2,
  "i":4,
  "q":8,
  "S":1,
  "B":1,
  "H":2,
  "I":4,
  "Q":8,
  "f":4,
  "d":8,
};


export const array2typed=(value,type)=>{
  if(isTypedArray(value))return new formatToDtype[type](value.buffer);
  if(!Array.isArray(value))value=[value];
  return new formatToDtype[type](value);
};
export const string2char=(str,nchar)=>{
  return str.padEnd(nchar).substring(0,nchar);
};
export const flipArrayEndianness = (array)=>{
  var u8 = new Uint8Array(array.buffer, array.byteOffset, array.byteLength);
  for (var i=0; i<array.byteLength; i+=array.BYTES_PER_ELEMENT) {
    for (var j=i+array.BYTES_PER_ELEMENT-1, k=i; j>k; j--, k++) {
      var tmp = u8[k];
      u8[k] = u8[j];
      u8[j] = tmp;
    }
  }
  return array;
};


export default {
  dtypeToFormat,
  formatToDtype,
  formatBytes,
  array2typed,
  string2char,
  flipArrayEndianness
};