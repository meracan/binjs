import binaryjs,{formatToDtype} from '../src/index.js';
import fs from 'fs';
import _ from 'lodash';
import tape from 'tape';


const f1d=(t,n,format,shape)=>{
  const data=new formatToDtype[format](_.range(n));
  const odata=new formatToDtype[format](data);
  data.vname="name";
  odata.vname="name";
  if(shape)data.shape=shape;
  if(shape)odata.shape=shape;
  
  const output="test/output.s3nc";
  
  fs.writeFileSync(output, binaryjs.write(data));
  const obj=binaryjs.read(fs.readFileSync(output));
  
  if(!odata['shape'])delete obj['name']['shape'];
  t.same(obj['name'], odata);
};

const f2d=(t,n,format,shape)=>{
  const data1=new formatToDtype[format](_.range(n));
  const data2=new formatToDtype[format](_.range(n));
  const output="test/output.bin";
  
  data1.vname="name1";
  data2.vname="name2";
  
  
  fs.writeFileSync(output, binaryjs.write([data1,data2]));
  const obj=binaryjs.read(fs.readFileSync(output));
  
  if(!data1['shape'])delete obj['name1']['shape'];
  if(!data2['shape'])delete obj['name2']['shape'];
  t.same(obj['name1'], data1);
  t.same(obj['name2'], data2);
};

tape('1D Array', function (t) {
  f1d(t,300,"H");
  f1d(t,300,"I");
  f1d(t,300,"h");
  f1d(t,300,"i");
  f1d(t,300,"f");
  f1d(t,300,"d");
  f1d(t,300,"i",new Uint32Array([100,3]));
  
  t.end();
});

tape('2D Array', function (t) {
  f2d(t,300,"H");
  f2d(t,300,"I");
  f2d(t,300,"h");
  f2d(t,300,"i");
  f2d(t,300,"f");
  f2d(t,300,"d");
  f2d(t,300,"i",new Uint32Array([100,3]));
  t.end();
});



