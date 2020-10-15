import binaryjs,{formatToDtype} from '../src/index.js';
import fs from 'fs';
import _ from 'lodash';
import tape from 'tape';



tape('1D Array', function (t) {
  const filename="../s3/u2.bin";
  const n=100;
  const data=new formatToDtype["H"](_.range(n));
  data.vname="variableA";
  data.shape=new Uint32Array([100]);
  
  const obj=binaryjs.read(fs.readFileSync(filename));
  t.same(obj['variableA'], data);
  
  t.end();
});