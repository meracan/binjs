
import b from './bufferpack.js';

const dtypeToFormat = {
  "Uint8Array":"H",
  "Uint16Array":"I",
  "BigUint64Array":"Q",
  "Int8Array":"h",
  "Int16Array":"i",
  "BigInt64Array":"q",
  "Float32Array":"f",
  "Float64Array":"d",
}

const formatToDtype = {
  "H":Uint8Array,
  "I":Uint16Array,
  "Q":BigUint64Array,
  "h":Int8Array,
  "i":Int16Array,
  "q":BigInt64Array,
  "f":Float32Array,
  "d":Float64Array,
}
const formatBytes = {
  "h":2,
  "i":4,
  "q":8,
  "H":2,
  "I":4,
  "Q":8,
  "f":4,
  "d":8,
}


const isTypedArray=(obj)=>{
    return !!obj && obj.byteLength !== undefined;
}


class IO {
  constructor(buffer){
    
    if(buffer)buffer=new Uint8Array(buffer);
    this.buffer=buffer || new Uint8Array(2 ** 31)
    this.pos=0
    this.len=0
  }
  read(bytes){
    const end=this.pos+bytes;
    const array=this.buffer.slice(this.pos, end);
    this.pos=end;
    return array;
  }
  tell(){
    return this.pos;
  }
  seek(pos,opt=0){
    if(opt==0)this.pos=pos
    if(opt==1)this.pos=this.pos+pos
  }
  write(buffer){
    this.buffer.set(buffer, this.pos);
    this.pos=this.pos+buffer.byteLength
    this.len=Math.max(this.pos,this.len);
  }
  close(){
    return this.buffer.subarray(0, this.len)
  }
  
   
}

const getStr=(str)=>{
  return str.replace(/[^A-Za-z 0-9 \.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g, '');
}

export const read=(buffer,return_header=false)=>{
    const obj={}
    
    const f =new IO(buffer) 
    
    let endian = ">";
    const placeholder=f.read(2)
    let [one]=b.unpack(endian+'H',placeholder);
    
    if (one!=1){
      endian="<"
      one=b.unpack(endian+'H',placeholder);
      if (one!=1)throw Error("Not a binary file from binarypy or binaryjs")
    }
    
    // Header 
    let [title,nvar]=b.unpack(endian+'16sH',f.read(16+2))
    title=getStr(title);
    obj["title"]=title
    
    const variables={}
    for(let i=0;i<nvar;i++){
      let [position,name,format,ndim]=b.unpack(endian+'I16s1sH',f.read(4+16+1+2))
      name=getStr(name);
      const shape=[]
      for(let j=0;j<ndim;j++){
        let [dim]=b.unpack(endian+'I',f.read(4))
        shape.push(dim)
      }
      const size =shape.reduce((a, b) => a + b, 0)
      variables[name]={"shape":shape,"size":size,"format":format,"position":position}
    }
    
    obj['variables']=variables
    if(return_header)return obj;
    
    // # Read Data
    for(let name in variables){
      const variable=variables[name]
      f.seek(variable['position'],0)
      const format=variable['format']
      const bytes=formatBytes[format]
      const size = variable['size']
      const a=f.read(size*bytes)
      const data=new formatToDtype[format](a.buffer)
      variable['data']=data
    }
    return obj;
}

export const write=(obj)=>{
    const endian = ">"
    const f = new IO();
    // Header 
    const title=obj["title"] || ""
    const variables =obj["variables"] 
    const nvar = Object.keys(variables).length
    
    f.write(b.pack(endian+'H16sH',[1,title,nvar]))
    
    for(let name in variables){
      const variable=variables[name]
      name =name.substring(0, 16)
      const data=variable['data']
      if(!isTypedArray(data)) throw Error("Needs to be a TypedArray")
      
      const ndim=1; 
      const shape=[data.length];
      
      const format=dtypeToFormat[data.constructor.name]
      variable['headerposition']=f.tell()
      f.write(b.pack(endian+'I16s1sH',[0,name,format,ndim]))
      for(let i=0;i<ndim;i++)f.write(b.pack(endian+'I',[shape[i]]));
    }

    // Write Data
    for(let name in variables){
      const variable=variables[name]
      const data=variable['data']
      const size=variable['size']
      const format=variable['format']
      variable['position']=f.tell()
      f.write(new Uint8Array(data.buffer));
    }

    
    // Save variable position in the header
    for(let name in variables){
      const variable=variables[name]
      f.seek(variable['headerposition'],0)
      f.write(b.pack(endian+'I',[variable['position']]))
    }
    
    const _buffer=f.close();  

    return _buffer
  
}
export default {
  read,
  write
}