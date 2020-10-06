import {formatToDtype,dtypeToFormat,formatBytes,array2typed as a2t,flipArrayEndianness} from './utils.js';

import isTypedArray from 'lodash.istypedarray';
import isString from 'lodash.isstring';
// import encoding from 'text-encoding';
// const decoder = new encoding.TextDecoder();
// const encoder = new encoding.TextEncoder();
const decoder =new TextDecoder()
const encoder =new TextEncoder()

export default class IO {
  constructor(value,options={}){
    const newBuffer=typeof value==="number"?true:false;
    this._uint8=new Uint8Array(value);
    this.pos=0;
    this.len=0;
    this.fmtPattern=/\d+[AxcbBhHsSfdiIlL]|[AxcbBhHsSfdiIlL]/g;
    this.quantityPattern=/\d+|\w/g;
    this.flipEndianness=options.flipEndianness||false;
    this.verbose=options.verbose || false;
    
    if(newBuffer)this.write(a2t(1,"H"));
    else{
      const [checkEndian]=this.read('H');
      
      if(checkEndian!=1){
        this.flipEndianness=true;
        this.seek(0);
        const [checkEndian]=this.read('H');
        if(checkEndian!=1)throw Error("Unknown format");
      }
    } 
  }
  read(fmt){
    const groups=fmt.match(this.fmtPattern);
    return groups.map(group=>{
      const sub=group.match(this.quantityPattern);
      if(sub.length==1)sub.splice(0, 0, 1); // Change I to 1I
      const [n,type]=sub;
      const bytes=formatBytes[type];
      const uint8=this._read(n*bytes);
      if(type.toLowerCase()=="s")return decoder.decode(uint8);
      const data=new formatToDtype[type](uint8.buffer);
      return this.flipEndianness?flipArrayEndianness(data):data;
    });
  }
  _read(bytes){
    const end=this.pos+bytes;
    const array=this._uint8.slice(this.pos, end);
    this.pos=end;
    return array;
  }
  tell(){
    return this.pos;
  }
  seek(pos,opt=0){
    if(opt==0)this.pos=pos;
    if(opt==1)this.pos=this.pos+pos;
  }
  write(values){
    if(!Array.isArray(values))values=[values];
    values.forEach(data=>{
      if(!isTypedArray(data) && !isString(data)) throw Error("Data needs to be a TypedArray or string");
      const type=dtypeToFormat[data.constructor.name];
      if(type.toLowerCase()=="s")return this._write(encoder.encode(data));
      const _data=this.flipEndianness?flipArrayEndianness(data):data;
      return this._write(new Uint8Array(_data.buffer));
    });
  }  
  _write(uint8){
    if(this.verbose)console.log(uint8);
    this._uint8.set(uint8, this.pos);
    this.pos=this.pos+uint8.byteLength;
    this.len=Math.max(this.pos,this.len);
  }
  close(){
    return this._uint8.slice(0, this.len);
  }
  
   
}