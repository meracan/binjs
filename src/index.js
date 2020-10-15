import IO from './io.js';
import {formatToDtype,dtypeToFormat,array2typed as a2t,string2char as s2c} from './utils.js';

export const write=(array)=>{
    if(!Array.isArray(array))array=[array];
    const _size=array.reduce((a,b)=>a+b.byteLength+64+1+4+1+4*10,0)+1; //TODO, assumes ndim=10
    
    const f = new IO(_size);
   
    f.write(a2t(array.length,"B"));
    array.forEach(data=>{
      
      const {vname,shape}=data;
      if(!vname)throw Error("Data needs vname");
      const size=shape?shape.reduce((a, b) => a * b, 1):data.length;
      const ndim=shape?shape.length:1;
      const _shape=shape?shape:size;
      if(size!=data.length)throw Error("Data shape does not match data length");
      const format=dtypeToFormat[data.constructor.name];
      f.write([
        s2c(vname,64),
        s2c(format,1),
        a2t(size,"I"),
        a2t(ndim,"B"),
        a2t(_shape,"I"),
        data
        ]);
    });
    return f.close();
};

export const read= (buffer)=>{
    
    const obj={};
   
    const f =new IO(buffer);
    const [nvar]=f.read('B');
   
    for(let i=0;i<nvar;i++){
      const [_vname,format,size,ndim]=f.read('64ssIB');
      const [shape]=f.read(`${parseFloat(ndim)}I`);
      const [data]=f.read(`${parseFloat(size)}${format}`);
      const vname=_vname.replace(/\0/g, '').trim();
      data.vname=vname;
      data.shape=shape;
      obj[vname]=data;
    }
    
    return obj;
};

export {
  formatToDtype
};

export default {
  read,
  write
};