
import binaryjs from '../src/index.js';
import fs from 'fs'
import _ from 'lodash';
import tape from 'tape';

const dtype = {
  u2:Uint8Array,
  u4:Uint16Array,
  u8:BigUint64Array,
  i2:Int8Array,
  i4:Int16Array,
  i8:BigInt64Array,
  f4:Float32Array,
  f8:Float64Array,
}


const f1d=(t,format)=>{
  const data=new dtype[format](_.range(100000))
  const output="test/output.bin";
  fs.writeFileSync(output, binaryjs.write({"title":"tilename","variables":{"variableA":{data}}}))
  const b=fs.readFileSync(output)
  const obj=binaryjs.read(new Uint8Array(b).buffer)
  t.same(obj.variables['variableA'].data, data);
  
}


tape('array', function (t) {
  f1d(t,"u2")
  f1d(t,"u4")
  // f1d(t,"u8")
  f1d(t,"i2")
  f1d(t,"i4")
  // f1d(t,"i8")
  f1d(t,"f4")
  f1d(t,"f8")
  
  t.end()

});


