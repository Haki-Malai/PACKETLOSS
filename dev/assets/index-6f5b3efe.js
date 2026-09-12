(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function t(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(s){if(s.ep)return;s.ep=!0;const r=t(s);fetch(s.href,r)}})();/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const ua="186",Wh=0,Qa=1,Xh=2,$s=1,Yh=2,Yi=3,qn=0,Nt=1,vn=2,Sn=0,$i=1,ja=2,el=3,tl=4,qh=5,xi=100,Kh=101,Jh=102,$h=103,Zh=104,Qh=200,jh=201,eu=202,tu=203,Dc=204,Nc=205,nu=206,iu=207,su=208,ru=209,ou=210,au=211,lu=212,cu=213,hu=214,mo=0,go=1,_o=2,ts=3,xo=4,vo=5,Mo=6,So=7,Uc=0,uu=1,du=2,an=0,Fc=1,Oc=2,Bc=3,da=4,kc=5,zc=6,Gc=7,Hc=300,Kn=301,Ti=302,wr=303,Tr=304,gr=306,yo=1e3,Mn=1001,Eo=1002,Tt=1003,fu=1004,fs=1005,Et=1006,br=1007,Wn=1008,Bt=1009,Vc=1010,Wc=1011,ns=1012,fa=1013,ln=1014,Kt=1015,cn=1016,pa=1017,ma=1018,is=1020,Xc=35902,Yc=35899,qc=1021,Kc=1022,Jt=1023,En=1026,Xn=1027,ga=1028,_a=1029,Jn=1030,xa=1031,va=1033,Zs=33776,Qs=33777,js=33778,er=33779,wo=35840,To=35841,bo=35842,Ao=35843,Ro=36196,Co=37492,Po=37496,Lo=37488,Io=37489,sr=37490,Do=37491,No=37808,Uo=37809,Fo=37810,Oo=37811,Bo=37812,ko=37813,zo=37814,Go=37815,Ho=37816,Vo=37817,Wo=37818,Xo=37819,Yo=37820,qo=37821,Ko=36492,Jo=36494,$o=36495,Zo=36283,Qo=36284,rr=36285,jo=36286,pu=3200,ea=0,mu=1,Nn="",Ot="srgb",or="srgb-linear",ar="linear",ot="srgb",Ar=7680,gu=519,_u=512,xu=513,vu=514,Ma=515,Mu=516,Su=517,Sa=518,yu=519,Eu=35044,nl="300 es",on=2e3,ss=2001;function wu(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function lr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Tu(){const i=lr("canvas");return i.style.display="block",i}const il={};function sl(...i){const e="THREE."+i.shift();console.log(e,...i)}function Jc(i){const e=i[0];if(typeof e=="string"&&e.startsWith("TSL:")){const t=i[1];t&&t.isStackTrace?i[0]+=" "+t.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function Be(...i){i=Jc(i);const e="THREE."+i.shift();{const t=i[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...i)}}function je(...i){i=Jc(i);const e="THREE."+i.shift();{const t=i[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...i)}}function Ei(...i){const e=i.join(" ");e in il||(il[e]=!0,Be(...i))}function bu(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}const Au={[mo]:go,[_o]:Mo,[xo]:So,[ts]:vo,[go]:mo,[Mo]:_o,[So]:xo,[vo]:ts};class Qn{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){const n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){const n=this._listeners;if(n===void 0)return;const s=n[e];if(s!==void 0){const r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const n=t[e.type];if(n!==void 0){e.target=this;const s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,e);e.target=null}}}const At=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],tr=Math.PI/180,ta=180/Math.PI;function Ri(){const i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(At[i&255]+At[i>>8&255]+At[i>>16&255]+At[i>>24&255]+"-"+At[e&255]+At[e>>8&255]+"-"+At[e>>16&15|64]+At[e>>24&255]+"-"+At[t&63|128]+At[t>>8&255]+"-"+At[t>>16&255]+At[t>>24&255]+At[n&255]+At[n>>8&255]+At[n>>16&255]+At[n>>24&255]).toLowerCase()}function $e(i,e,t){return Math.max(e,Math.min(t,i))}function Ru(i,e){return(i%e+e)%e}function Rr(i,e,t){return(1-t)*i+t*e}function Ui(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:case Uint8ClampedArray:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function It(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}const Oa=class Oa{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=$e(this.x,e.x,t.x),this.y=$e(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=$e(this.x,e,t),this.y=$e(this.y,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar($e(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos($e(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*n-o*s+e.x,this.y=r*s+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};Oa.prototype.isVector2=!0;let me=Oa;class Ci{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,o,a){let l=n[s+0],c=n[s+1],h=n[s+2],d=n[s+3],u=r[o+0],f=r[o+1],g=r[o+2],v=r[o+3];if(d!==v||l!==u||c!==f||h!==g){let m=l*u+c*f+h*g+d*v;m<0&&(u=-u,f=-f,g=-g,v=-v,m=-m);let p=1-a;if(m<.9995){const y=Math.acos(m),A=Math.sin(y);p=Math.sin(p*y)/A,a=Math.sin(a*y)/A,l=l*p+u*a,c=c*p+f*a,h=h*p+g*a,d=d*p+v*a}else{l=l*p+u*a,c=c*p+f*a,h=h*p+g*a,d=d*p+v*a;const y=1/Math.sqrt(l*l+c*c+h*h+d*d);l*=y,c*=y,h*=y,d*=y}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=d}static multiplyQuaternionsFlat(e,t,n,s,r,o){const a=n[s],l=n[s+1],c=n[s+2],h=n[s+3],d=r[o],u=r[o+1],f=r[o+2],g=r[o+3];return e[t]=a*g+h*d+l*f-c*u,e[t+1]=l*g+h*u+c*d-a*f,e[t+2]=c*g+h*f+a*u-l*d,e[t+3]=h*g-a*d-l*u-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,s=e._y,r=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(n/2),h=a(s/2),d=a(r/2),u=l(n/2),f=l(s/2),g=l(r/2);switch(o){case"XYZ":this._x=u*h*d+c*f*g,this._y=c*f*d-u*h*g,this._z=c*h*g+u*f*d,this._w=c*h*d-u*f*g;break;case"YXZ":this._x=u*h*d+c*f*g,this._y=c*f*d-u*h*g,this._z=c*h*g-u*f*d,this._w=c*h*d+u*f*g;break;case"ZXY":this._x=u*h*d-c*f*g,this._y=c*f*d+u*h*g,this._z=c*h*g+u*f*d,this._w=c*h*d-u*f*g;break;case"ZYX":this._x=u*h*d-c*f*g,this._y=c*f*d+u*h*g,this._z=c*h*g-u*f*d,this._w=c*h*d+u*f*g;break;case"YZX":this._x=u*h*d+c*f*g,this._y=c*f*d+u*h*g,this._z=c*h*g-u*f*d,this._w=c*h*d-u*f*g;break;case"XZY":this._x=u*h*d-c*f*g,this._y=c*f*d-u*h*g,this._z=c*h*g+u*f*d,this._w=c*h*d+u*f*g;break;default:Be("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],s=t[4],r=t[8],o=t[1],a=t[5],l=t[9],c=t[2],h=t[6],d=t[10],u=n+a+d;if(u>0){const f=.5/Math.sqrt(u+1);this._w=.25/f,this._x=(h-l)*f,this._y=(r-c)*f,this._z=(o-s)*f}else if(n>a&&n>d){const f=2*Math.sqrt(1+n-a-d);this._w=(h-l)/f,this._x=.25*f,this._y=(s+o)/f,this._z=(r+c)/f}else if(a>d){const f=2*Math.sqrt(1+a-n-d);this._w=(r-c)/f,this._x=(s+o)/f,this._y=.25*f,this._z=(l+h)/f}else{const f=2*Math.sqrt(1+d-n-a);this._w=(o-s)/f,this._x=(r+c)/f,this._y=(l+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs($e(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,s=e._y,r=e._z,o=e._w,a=t._x,l=t._y,c=t._z,h=t._w;return this._x=n*h+o*a+s*c-r*l,this._y=s*h+o*l+r*a-n*c,this._z=r*h+o*c+n*l-s*a,this._w=o*h-n*a-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,s=e._y,r=e._z,o=e._w,a=this.dot(e);a<0&&(n=-n,s=-s,r=-r,o=-o,a=-a);let l=1-t;if(a<.9995){const c=Math.acos(a),h=Math.sin(c);l=Math.sin(l*c)/h,t=Math.sin(t*c)/h,this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+o*t,this._onChangeCallback()}else this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+o*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}const Ba=class Ba{constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(rl.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(rl.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=e.elements,o=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(e){const t=this.x,n=this.y,s=this.z,r=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*s-a*n),h=2*(a*t-r*s),d=2*(r*n-o*t);return this.x=t+l*c+o*d-a*h,this.y=n+l*h+a*c-r*d,this.z=s+l*d+r*h-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=$e(this.x,e.x,t.x),this.y=$e(this.y,e.y,t.y),this.z=$e(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=$e(this.x,e,t),this.y=$e(this.y,e,t),this.z=$e(this.z,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar($e(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,s=e.y,r=e.z,o=t.x,a=t.y,l=t.z;return this.x=s*l-r*a,this.y=r*o-n*l,this.z=n*a-s*o,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Cr.copy(this).projectOnVector(e),this.sub(Cr)}reflect(e){return this.sub(Cr.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos($e(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};Ba.prototype.isVector3=!0;let D=Ba;const Cr=new D,rl=new Ci,ka=class ka{constructor(e,t,n,s,r,o,a,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,l,c)}set(e,t,n,s,r,o,a,l,c){const h=this.elements;return h[0]=e,h[1]=s,h[2]=a,h[3]=t,h[4]=r,h[5]=l,h[6]=n,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],h=n[4],d=n[7],u=n[2],f=n[5],g=n[8],v=s[0],m=s[3],p=s[6],y=s[1],A=s[4],S=s[7],T=s[2],w=s[5],R=s[8];return r[0]=o*v+a*y+l*T,r[3]=o*m+a*A+l*w,r[6]=o*p+a*S+l*R,r[1]=c*v+h*y+d*T,r[4]=c*m+h*A+d*w,r[7]=c*p+h*S+d*R,r[2]=u*v+f*y+g*T,r[5]=u*m+f*A+g*w,r[8]=u*p+f*S+g*R,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8];return t*o*h-t*a*c-n*r*h+n*a*l+s*r*c-s*o*l}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],d=h*o-a*c,u=a*l-h*r,f=c*r-o*l,g=t*d+n*u+s*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const v=1/g;return e[0]=d*v,e[1]=(s*c-h*n)*v,e[2]=(a*n-s*o)*v,e[3]=u*v,e[4]=(h*t-s*l)*v,e[5]=(s*r-a*t)*v,e[6]=f*v,e[7]=(n*l-c*t)*v,e[8]=(o*t-n*r)*v,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,o,a){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*o+c*a)+o+e,-s*c,s*l,-s*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return Ei("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Pr.makeScale(e,t)),this}rotate(e){return Ei("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Pr.makeRotation(-e)),this}translate(e,t){return Ei("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Pr.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}};ka.prototype.isMatrix3=!0;let Ge=ka;const Pr=new Ge,ol=new Ge().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),al=new Ge().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Cu(){const i={enabled:!0,workingColorSpace:or,spaces:{},convert:function(s,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===ot&&(s.r=yn(s.r),s.g=yn(s.g),s.b=yn(s.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===ot&&(s.r=wi(s.r),s.g=wi(s.g),s.b=wi(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Nn?ar:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,o){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return Ei("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return Ei("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[or]:{primaries:e,whitePoint:n,transfer:ar,toXYZ:ol,fromXYZ:al,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Ot},outputColorSpaceConfig:{drawingBufferColorSpace:Ot}},[Ot]:{primaries:e,whitePoint:n,transfer:ot,toXYZ:ol,fromXYZ:al,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Ot}}}),i}const Qe=Cu();function yn(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function wi(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let ii;class Pu{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{ii===void 0&&(ii=lr("canvas")),ii.width=e.width,ii.height=e.height;const s=ii.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=ii}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=lr("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=yn(r[o]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(yn(t[n]/255)*255):t[n]=yn(t[n]);return{data:t,width:e.width,height:e.height}}else return Be("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let Lu=0;class ya{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Lu++}),this.uuid=Ri(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(Lr(s[o].image)):r.push(Lr(s[o]))}else r=Lr(s);n.url=r}return t||(e.images[this.uuid]=n),n}}function Lr(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Pu.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(Be("Texture: Unable to serialize Texture."),{})}let Iu=0;const Ir=new D;class Lt extends Qn{constructor(e=Lt.DEFAULT_IMAGE,t=Lt.DEFAULT_MAPPING,n=Mn,s=Mn,r=Et,o=Wn,a=Jt,l=Bt,c=Lt.DEFAULT_ANISOTROPY,h=Nn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Iu++}),this.uuid=Ri(),this.name="",this.source=new ya(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new me(0,0),this.repeat=new me(1,1),this.center=new me(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ge,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Ir).x}get height(){return this.source.getSize(Ir).y}get depth(){return this.source.getSize(Ir).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const n=e[t];if(n===void 0){Be(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){Be(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Hc)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case yo:e.x=e.x-Math.floor(e.x);break;case Mn:e.x=e.x<0?0:1;break;case Eo:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case yo:e.y=e.y-Math.floor(e.y);break;case Mn:e.y=e.y<0?0:1;break;case Eo:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Lt.DEFAULT_IMAGE=null;Lt.DEFAULT_MAPPING=Hc;Lt.DEFAULT_ANISOTROPY=1;const za=class za{constructor(e=0,t=0,n=0,s=1){this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*t+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*t+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*t+o[7]*n+o[11]*s+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r;const l=e.elements,c=l[0],h=l[4],d=l[8],u=l[1],f=l[5],g=l[9],v=l[2],m=l[6],p=l[10];if(Math.abs(h-u)<.01&&Math.abs(d-v)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+u)<.1&&Math.abs(d+v)<.1&&Math.abs(g+m)<.1&&Math.abs(c+f+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const A=(c+1)/2,S=(f+1)/2,T=(p+1)/2,w=(h+u)/4,R=(d+v)/4,x=(g+m)/4;return A>S&&A>T?A<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(A),s=w/n,r=R/n):S>T?S<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(S),n=w/s,r=x/s):T<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(T),n=R/r,s=x/r),this.set(n,s,r,t),this}let y=Math.sqrt((m-g)*(m-g)+(d-v)*(d-v)+(u-h)*(u-h));return Math.abs(y)<.001&&(y=1),this.x=(m-g)/y,this.y=(d-v)/y,this.z=(u-h)/y,this.w=Math.acos((c+f+p-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=$e(this.x,e.x,t.x),this.y=$e(this.y,e.y,t.y),this.z=$e(this.z,e.z,t.z),this.w=$e(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=$e(this.x,e,t),this.y=$e(this.y,e,t),this.z=$e(this.z,e,t),this.w=$e(this.w,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar($e(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};za.prototype.isVector4=!0;let ft=za;class Du extends Qn{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Et,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new ft(0,0,e,t),this.scissorTest=!1,this.viewport=new ft(0,0,e,t),this.textures=[];const s={width:e,height:t,depth:n.depth},r=new Lt(s),o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){const t={minFilter:Et,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const s=Object.assign({},e.textures[t].image);this.textures[t].source=new ya(s)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){const t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Zt extends Du{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class $c extends Lt{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Tt,this.minFilter=Tt,this.wrapR=Mn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class Nu extends Lt{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Tt,this.minFilter=Tt,this.wrapR=Mn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}}const mr=class mr{constructor(e,t,n,s,r,o,a,l,c,h,d,u,f,g,v,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,l,c,h,d,u,f,g,v,m)}set(e,t,n,s,r,o,a,l,c,h,d,u,f,g,v,m){const p=this.elements;return p[0]=e,p[4]=t,p[8]=n,p[12]=s,p[1]=r,p[5]=o,p[9]=a,p[13]=l,p[2]=c,p[6]=h,p[10]=d,p[14]=u,p[3]=f,p[7]=g,p[11]=v,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new mr().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();const t=this.elements,n=e.elements,s=1/si.setFromMatrixColumn(e,0).length(),r=1/si.setFromMatrixColumn(e,1).length(),o=1/si.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,s=e.y,r=e.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),d=Math.sin(r);if(e.order==="XYZ"){const u=o*h,f=o*d,g=a*h,v=a*d;t[0]=l*h,t[4]=-l*d,t[8]=c,t[1]=f+g*c,t[5]=u-v*c,t[9]=-a*l,t[2]=v-u*c,t[6]=g+f*c,t[10]=o*l}else if(e.order==="YXZ"){const u=l*h,f=l*d,g=c*h,v=c*d;t[0]=u+v*a,t[4]=g*a-f,t[8]=o*c,t[1]=o*d,t[5]=o*h,t[9]=-a,t[2]=f*a-g,t[6]=v+u*a,t[10]=o*l}else if(e.order==="ZXY"){const u=l*h,f=l*d,g=c*h,v=c*d;t[0]=u-v*a,t[4]=-o*d,t[8]=g+f*a,t[1]=f+g*a,t[5]=o*h,t[9]=v-u*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){const u=o*h,f=o*d,g=a*h,v=a*d;t[0]=l*h,t[4]=g*c-f,t[8]=u*c+v,t[1]=l*d,t[5]=v*c+u,t[9]=f*c-g,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){const u=o*l,f=o*c,g=a*l,v=a*c;t[0]=l*h,t[4]=v-u*d,t[8]=g*d+f,t[1]=d,t[5]=o*h,t[9]=-a*h,t[2]=-c*h,t[6]=f*d+g,t[10]=u-v*d}else if(e.order==="XZY"){const u=o*l,f=o*c,g=a*l,v=a*c;t[0]=l*h,t[4]=-d,t[8]=c*h,t[1]=u*d+v,t[5]=o*h,t[9]=f*d-g,t[2]=g*d-f,t[6]=a*h,t[10]=v*d+u}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Uu,e,Fu)}lookAt(e,t,n){const s=this.elements;return Ut.subVectors(e,t),Ut.lengthSq()===0&&(Ut.z=1),Ut.normalize(),An.crossVectors(n,Ut),An.lengthSq()===0&&(Math.abs(n.z)===1?Ut.x+=1e-4:Ut.z+=1e-4,Ut.normalize(),An.crossVectors(n,Ut)),An.normalize(),ps.crossVectors(Ut,An),s[0]=An.x,s[4]=ps.x,s[8]=Ut.x,s[1]=An.y,s[5]=ps.y,s[9]=Ut.y,s[2]=An.z,s[6]=ps.z,s[10]=Ut.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],h=n[1],d=n[5],u=n[9],f=n[13],g=n[2],v=n[6],m=n[10],p=n[14],y=n[3],A=n[7],S=n[11],T=n[15],w=s[0],R=s[4],x=s[8],b=s[12],P=s[1],N=s[5],z=s[9],V=s[13],U=s[2],O=s[6],J=s[10],H=s[14],se=s[3],X=s[7],j=s[11],te=s[15];return r[0]=o*w+a*P+l*U+c*se,r[4]=o*R+a*N+l*O+c*X,r[8]=o*x+a*z+l*J+c*j,r[12]=o*b+a*V+l*H+c*te,r[1]=h*w+d*P+u*U+f*se,r[5]=h*R+d*N+u*O+f*X,r[9]=h*x+d*z+u*J+f*j,r[13]=h*b+d*V+u*H+f*te,r[2]=g*w+v*P+m*U+p*se,r[6]=g*R+v*N+m*O+p*X,r[10]=g*x+v*z+m*J+p*j,r[14]=g*b+v*V+m*H+p*te,r[3]=y*w+A*P+S*U+T*se,r[7]=y*R+A*N+S*O+T*X,r[11]=y*x+A*z+S*J+T*j,r[15]=y*b+A*V+S*H+T*te,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],o=e[1],a=e[5],l=e[9],c=e[13],h=e[2],d=e[6],u=e[10],f=e[14],g=e[3],v=e[7],m=e[11],p=e[15],y=l*f-c*u,A=a*f-c*d,S=a*u-l*d,T=o*f-c*h,w=o*u-l*h,R=o*d-a*h;return t*(v*y-m*A+p*S)-n*(g*y-m*T+p*w)+s*(g*A-v*T+p*R)-r*(g*S-v*w+m*R)}determinantAffine(){const e=this.elements,t=e[0],n=e[4],s=e[8],r=e[1],o=e[5],a=e[9],l=e[2],c=e[6],h=e[10];return t*(o*h-a*c)-n*(r*h-a*l)+s*(r*c-o*l)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],d=e[9],u=e[10],f=e[11],g=e[12],v=e[13],m=e[14],p=e[15],y=t*a-n*o,A=t*l-s*o,S=t*c-r*o,T=n*l-s*a,w=n*c-r*a,R=s*c-r*l,x=h*v-d*g,b=h*m-u*g,P=h*p-f*g,N=d*m-u*v,z=d*p-f*v,V=u*p-f*m,U=y*V-A*z+S*N+T*P-w*b+R*x;if(U===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const O=1/U;return e[0]=(a*V-l*z+c*N)*O,e[1]=(s*z-n*V-r*N)*O,e[2]=(v*R-m*w+p*T)*O,e[3]=(u*w-d*R-f*T)*O,e[4]=(l*P-o*V-c*b)*O,e[5]=(t*V-s*P+r*b)*O,e[6]=(m*S-g*R-p*A)*O,e[7]=(h*R-u*S+f*A)*O,e[8]=(o*z-a*P+c*x)*O,e[9]=(n*P-t*z-r*x)*O,e[10]=(g*w-v*S+p*y)*O,e[11]=(d*S-h*w-f*y)*O,e[12]=(a*b-o*N-l*x)*O,e[13]=(t*N-n*b+s*x)*O,e[14]=(v*A-g*T-m*y)*O,e[15]=(h*T-d*A+u*y)*O,this}scale(e){const t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),s=Math.sin(t),r=1-n,o=e.x,a=e.y,l=e.z,c=r*o,h=r*a;return this.set(c*o+n,c*a-s*l,c*l+s*a,0,c*a+s*l,h*a+n,h*l-s*o,0,c*l-s*a,h*l+s*o,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,o){return this.set(1,n,r,0,e,1,o,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){const s=this.elements,r=t._x,o=t._y,a=t._z,l=t._w,c=r+r,h=o+o,d=a+a,u=r*c,f=r*h,g=r*d,v=o*h,m=o*d,p=a*d,y=l*c,A=l*h,S=l*d,T=n.x,w=n.y,R=n.z;return s[0]=(1-(v+p))*T,s[1]=(f+S)*T,s[2]=(g-A)*T,s[3]=0,s[4]=(f-S)*w,s[5]=(1-(u+p))*w,s[6]=(m+y)*w,s[7]=0,s[8]=(g+A)*R,s[9]=(m-y)*R,s[10]=(1-(u+v))*R,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){const s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];const r=this.determinantAffine();if(r===0)return n.set(1,1,1),t.identity(),this;let o=si.set(s[0],s[1],s[2]).length();const a=si.set(s[4],s[5],s[6]).length(),l=si.set(s[8],s[9],s[10]).length();r<0&&(o=-o),Wt.copy(this);const c=1/o,h=1/a,d=1/l;return Wt.elements[0]*=c,Wt.elements[1]*=c,Wt.elements[2]*=c,Wt.elements[4]*=h,Wt.elements[5]*=h,Wt.elements[6]*=h,Wt.elements[8]*=d,Wt.elements[9]*=d,Wt.elements[10]*=d,t.setFromRotationMatrix(Wt),n.x=o,n.y=a,n.z=l,this}makePerspective(e,t,n,s,r,o,a=on,l=!1){const c=this.elements,h=2*r/(t-e),d=2*r/(n-s),u=(t+e)/(t-e),f=(n+s)/(n-s);let g,v;if(l)g=r/(o-r),v=o*r/(o-r);else if(a===on)g=-(o+r)/(o-r),v=-2*o*r/(o-r);else if(a===ss)g=-o/(o-r),v=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=u,c[12]=0,c[1]=0,c[5]=d,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=v,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,s,r,o,a=on,l=!1){const c=this.elements,h=2/(t-e),d=2/(n-s),u=-(t+e)/(t-e),f=-(n+s)/(n-s);let g,v;if(l)g=1/(o-r),v=o/(o-r);else if(a===on)g=-2/(o-r),v=-(o+r)/(o-r);else if(a===ss)g=-1/(o-r),v=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=0,c[12]=u,c[1]=0,c[5]=d,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=g,c[14]=v,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}};mr.prototype.isMatrix4=!0;let nt=mr;const si=new D,Wt=new nt,Uu=new D(0,0,0),Fu=new D(1,1,1),An=new D,ps=new D,Ut=new D,ll=new nt,cl=new Ci;class On{constructor(e=0,t=0,n=0,s=On.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const s=e.elements,r=s[0],o=s[4],a=s[8],l=s[1],c=s[5],h=s[9],d=s[2],u=s[6],f=s[10];switch(t){case"XYZ":this._y=Math.asin($e(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(u,c),this._z=0);break;case"YXZ":this._x=Math.asin(-$e(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-d,r),this._z=0);break;case"ZXY":this._x=Math.asin($e(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-d,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-$e(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(u,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin($e(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-d,r)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-$e(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(u,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,f),this._y=0);break;default:Be("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return ll.makeRotationFromQuaternion(e),this.setFromRotationMatrix(ll,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return cl.setFromEuler(this),this.setFromQuaternion(cl,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}On.DEFAULT_ORDER="XYZ";class Ea{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let Ou=0;const hl=new D,ri=new Ci,dn=new nt,ms=new D,Fi=new D,Bu=new D,ku=new Ci,ul=new D(1,0,0),dl=new D(0,1,0),fl=new D(0,0,1),pl={type:"added"},zu={type:"removed"},oi={type:"childadded",child:null},Dr={type:"childremoved",child:null};class vt extends Qn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Ou++}),this.uuid=Ri(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=vt.DEFAULT_UP.clone();const e=new D,t=new On,n=new Ci,s=new D(1,1,1);function r(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new nt},normalMatrix:{value:new Ge}}),this.matrix=new nt,this.matrixWorld=new nt,this.matrixAutoUpdate=vt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=vt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Ea,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return ri.setFromAxisAngle(e,t),this.quaternion.multiply(ri),this}rotateOnWorldAxis(e,t){return ri.setFromAxisAngle(e,t),this.quaternion.premultiply(ri),this}rotateX(e){return this.rotateOnAxis(ul,e)}rotateY(e){return this.rotateOnAxis(dl,e)}rotateZ(e){return this.rotateOnAxis(fl,e)}translateOnAxis(e,t){return hl.copy(e).applyQuaternion(this.quaternion),this.position.add(hl.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(ul,e)}translateY(e){return this.translateOnAxis(dl,e)}translateZ(e){return this.translateOnAxis(fl,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(dn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?ms.copy(e):ms.set(e,t,n);const s=this.parent;this.updateWorldMatrix(!0,!1),Fi.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?dn.lookAt(Fi,ms,this.up):dn.lookAt(ms,Fi,this.up),this.quaternion.setFromRotationMatrix(dn),s&&(dn.extractRotation(s.matrixWorld),ri.setFromRotationMatrix(dn),this.quaternion.premultiply(ri.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(je("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(pl),oi.child=e,this.dispatchEvent(oi),oi.child=null):je("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(zu),Dr.child=e,this.dispatchEvent(Dr),Dr.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),dn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),dn.multiply(e.parent.matrixWorld)),e.applyMatrix4(dn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(pl),oi.child=e,this.dispatchEvent(oi),oi.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){const o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Fi,e,Bu),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Fi,ku,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(e){e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);const e=this.pivot;if(e!==null){const t=e.x,n=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*n-r[8]*s,r[13]+=n-r[1]*t-r[5]*n-r[9]*s,r[14]+=s-r[2]*t-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){const s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){const r=this.children;for(let o=0,a=r.length;o<a;o++)r[o].updateWorldMatrix(!1,!0,n)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(a=>({...a})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const d=l[c];r(e.shapes,d)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(e.materials,this.material[l]));s.material=a}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];s.animations.push(r(e.animations,l))}}if(t){const a=o(e.geometries),l=o(e.materials),c=o(e.textures),h=o(e.images),d=o(e.shapes),u=o(e.skeletons),f=o(e.animations),g=o(e.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),d.length>0&&(n.shapes=d),u.length>0&&(n.skeletons=u),f.length>0&&(n.animations=f),g.length>0&&(n.nodes=g)}return n.object=s,n;function o(a){const l=[];for(const c in a){const h=a[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const s=e.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}}vt.DEFAULT_UP=new D(0,1,0);vt.DEFAULT_MATRIX_AUTO_UPDATE=!0;vt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class $t extends vt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Gu={type:"move"};class Nr{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new $t,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new $t,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new D,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new D),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new $t,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new D,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new D,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,o=null;const a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(const v of e.hand.values()){const m=t.getJointPose(v,n),p=this._getHandJoint(c,v);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}const h=c.joints["index-finger-tip"],d=c.joints["thumb-tip"],u=h.position.distanceTo(d.position),f=.02,g=.005;c.inputState.pinching&&u>f+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&u<=f-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));a!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Gu)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new $t;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}const Zc={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Rn={h:0,s:0,l:0},gs={h:0,s:0,l:0};function Ur(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}class Ve{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Ot){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Qe.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=Qe.workingColorSpace){return this.r=e,this.g=t,this.b=n,Qe.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=Qe.workingColorSpace){if(e=Ru(e,1),t=$e(t,0,1),n=$e(n,0,1),t===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+t):n+t-n*t,o=2*n-r;this.r=Ur(o,r,e+1/3),this.g=Ur(o,r,e),this.b=Ur(o,r,e-1/3)}return Qe.colorSpaceToWorking(this,s),this}setStyle(e,t=Ot){function n(r){r!==void 0&&parseFloat(r)<1&&Be("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Be("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);Be("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Ot){const n=Zc[e.toLowerCase()];return n!==void 0?this.setHex(n,t):Be("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=yn(e.r),this.g=yn(e.g),this.b=yn(e.b),this}copyLinearToSRGB(e){return this.r=wi(e.r),this.g=wi(e.g),this.b=wi(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Ot){return Qe.workingToColorSpace(Rt.copy(this),e),Math.round($e(Rt.r*255,0,255))*65536+Math.round($e(Rt.g*255,0,255))*256+Math.round($e(Rt.b*255,0,255))}getHexString(e=Ot){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Qe.workingColorSpace){Qe.workingToColorSpace(Rt.copy(this),t);const n=Rt.r,s=Rt.g,r=Rt.b,o=Math.max(n,s,r),a=Math.min(n,s,r);let l,c;const h=(a+o)/2;if(a===o)l=0,c=0;else{const d=o-a;switch(c=h<=.5?d/(o+a):d/(2-o-a),o){case n:l=(s-r)/d+(s<r?6:0);break;case s:l=(r-n)/d+2;break;case r:l=(n-s)/d+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=Qe.workingColorSpace){return Qe.workingToColorSpace(Rt.copy(this),t),e.r=Rt.r,e.g=Rt.g,e.b=Rt.b,e}getStyle(e=Ot){Qe.workingToColorSpace(Rt.copy(this),e);const t=Rt.r,n=Rt.g,s=Rt.b;return e!==Ot?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(Rn),this.setHSL(Rn.h+e,Rn.s+t,Rn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Rn),e.getHSL(gs);const n=Rr(Rn.h,gs.h,t),s=Rr(Rn.s,gs.s,t),r=Rr(Rn.l,gs.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Rt=new Ve;Ve.NAMES=Zc;class Hu extends vt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new On,this.environmentIntensity=1,this.environmentRotation=new On,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}}const Xt=new D,fn=new D,Fr=new D,pn=new D,ai=new D,li=new D,ml=new D,Or=new D,Br=new D,kr=new D,zr=new ft,Gr=new ft,Hr=new ft;class Gt{constructor(e=new D,t=new D,n=new D){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),Xt.subVectors(e,t),s.cross(Xt);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){Xt.subVectors(s,t),fn.subVectors(n,t),Fr.subVectors(e,t);const o=Xt.dot(Xt),a=Xt.dot(fn),l=Xt.dot(Fr),c=fn.dot(fn),h=fn.dot(Fr),d=o*c-a*a;if(d===0)return r.set(0,0,0),null;const u=1/d,f=(c*l-a*h)*u,g=(o*h-a*l)*u;return r.set(1-f-g,g,f)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,pn)===null?!1:pn.x>=0&&pn.y>=0&&pn.x+pn.y<=1}static getInterpolation(e,t,n,s,r,o,a,l){return this.getBarycoord(e,t,n,s,pn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,pn.x),l.addScaledVector(o,pn.y),l.addScaledVector(a,pn.z),l)}static getInterpolatedAttribute(e,t,n,s,r,o){return zr.setScalar(0),Gr.setScalar(0),Hr.setScalar(0),zr.fromBufferAttribute(e,t),Gr.fromBufferAttribute(e,n),Hr.fromBufferAttribute(e,s),o.setScalar(0),o.addScaledVector(zr,r.x),o.addScaledVector(Gr,r.y),o.addScaledVector(Hr,r.z),o}static isFrontFacing(e,t,n,s){return Xt.subVectors(n,t),fn.subVectors(e,t),Xt.cross(fn).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Xt.subVectors(this.c,this.b),fn.subVectors(this.a,this.b),Xt.cross(fn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return Gt.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return Gt.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return Gt.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return Gt.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return Gt.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,s=this.b,r=this.c;let o,a;ai.subVectors(s,n),li.subVectors(r,n),Or.subVectors(e,n);const l=ai.dot(Or),c=li.dot(Or);if(l<=0&&c<=0)return t.copy(n);Br.subVectors(e,s);const h=ai.dot(Br),d=li.dot(Br);if(h>=0&&d<=h)return t.copy(s);const u=l*d-h*c;if(u<=0&&l>=0&&h<=0)return o=l/(l-h),t.copy(n).addScaledVector(ai,o);kr.subVectors(e,r);const f=ai.dot(kr),g=li.dot(kr);if(g>=0&&f<=g)return t.copy(r);const v=f*c-l*g;if(v<=0&&c>=0&&g<=0)return a=c/(c-g),t.copy(n).addScaledVector(li,a);const m=h*g-f*d;if(m<=0&&d-h>=0&&f-g>=0)return ml.subVectors(r,s),a=(d-h)/(d-h+(f-g)),t.copy(s).addScaledVector(ml,a);const p=1/(m+v+u);return o=v*p,a=u*p,t.copy(n).addScaledVector(ai,o).addScaledVector(li,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}class jn{constructor(e=new D(1/0,1/0,1/0),t=new D(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Yt.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Yt.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=Yt.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,Yt):Yt.fromBufferAttribute(r,o),Yt.applyMatrix4(e.matrixWorld),this.expandByPoint(Yt);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),_s.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),_s.copy(n.boundingBox)),_s.applyMatrix4(e.matrixWorld),this.union(_s)}const s=e.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Yt),Yt.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Oi),xs.subVectors(this.max,Oi),ci.subVectors(e.a,Oi),hi.subVectors(e.b,Oi),ui.subVectors(e.c,Oi),Cn.subVectors(hi,ci),Pn.subVectors(ui,hi),kn.subVectors(ci,ui);let t=[0,-Cn.z,Cn.y,0,-Pn.z,Pn.y,0,-kn.z,kn.y,Cn.z,0,-Cn.x,Pn.z,0,-Pn.x,kn.z,0,-kn.x,-Cn.y,Cn.x,0,-Pn.y,Pn.x,0,-kn.y,kn.x,0];return!Vr(t,ci,hi,ui,xs)||(t=[1,0,0,0,1,0,0,0,1],!Vr(t,ci,hi,ui,xs))?!1:(vs.crossVectors(Cn,Pn),t=[vs.x,vs.y,vs.z],Vr(t,ci,hi,ui,xs))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Yt).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Yt).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(mn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),mn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),mn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),mn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),mn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),mn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),mn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),mn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(mn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const mn=[new D,new D,new D,new D,new D,new D,new D,new D],Yt=new D,_s=new jn,ci=new D,hi=new D,ui=new D,Cn=new D,Pn=new D,kn=new D,Oi=new D,xs=new D,vs=new D,zn=new D;function Vr(i,e,t,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){zn.fromArray(i,r);const a=s.x*Math.abs(zn.x)+s.y*Math.abs(zn.y)+s.z*Math.abs(zn.z),l=e.dot(zn),c=t.dot(zn),h=n.dot(zn);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}const xt=new D,Ms=new me;let Vu=0;class Dt extends Qn{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Vu++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Eu,this.updateRanges=[],this.gpuType=Kt,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Ms.fromBufferAttribute(this,t),Ms.applyMatrix3(e),this.setXY(t,Ms.x,Ms.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)xt.fromBufferAttribute(this,t),xt.applyMatrix3(e),this.setXYZ(t,xt.x,xt.y,xt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)xt.fromBufferAttribute(this,t),xt.applyMatrix4(e),this.setXYZ(t,xt.x,xt.y,xt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)xt.fromBufferAttribute(this,t),xt.applyNormalMatrix(e),this.setXYZ(t,xt.x,xt.y,xt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)xt.fromBufferAttribute(this,t),xt.transformDirection(e),this.setXYZ(t,xt.x,xt.y,xt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Ui(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=It(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Ui(t,this.array)),t}setX(e,t){return this.normalized&&(t=It(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Ui(t,this.array)),t}setY(e,t){return this.normalized&&(t=It(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Ui(t,this.array)),t}setZ(e,t){return this.normalized&&(t=It(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Ui(t,this.array)),t}setW(e,t){return this.normalized&&(t=It(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=It(t,this.array),n=It(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=It(t,this.array),n=It(n,this.array),s=It(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=It(t,this.array),n=It(n,this.array),s=It(s,this.array),r=It(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}}class Qc extends Dt{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class jc extends Dt{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class dt extends Dt{constructor(e,t,n){super(new Float32Array(e),t,n)}}const Wu=new jn,Bi=new D,Wr=new D;class Pi{constructor(e=new D,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):Wu.setFromPoints(e).getCenter(n);let s=0;for(let r=0,o=e.length;r<o;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Bi.subVectors(e,this.center);const t=Bi.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(Bi,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Wr.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Bi.copy(e.center).add(Wr)),this.expandByPoint(Bi.copy(e.center).sub(Wr))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}let Xu=0;const zt=new nt,Xr=new vt,di=new D,Ft=new jn,ki=new jn,yt=new D;class wt extends Qn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Xu++}),this.uuid=Ri(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(wu(e)?jc:Qc)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new Ge().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return zt.makeRotationFromQuaternion(e),this.applyMatrix4(zt),this}rotateX(e){return zt.makeRotationX(e),this.applyMatrix4(zt),this}rotateY(e){return zt.makeRotationY(e),this.applyMatrix4(zt),this}rotateZ(e){return zt.makeRotationZ(e),this.applyMatrix4(zt),this}translate(e,t,n){return zt.makeTranslation(e,t,n),this.applyMatrix4(zt),this}scale(e,t,n){return zt.makeScale(e,t,n),this.applyMatrix4(zt),this}lookAt(e){return Xr.lookAt(e),Xr.updateMatrix(),this.applyMatrix4(Xr.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(di).negate(),this.translate(di.x,di.y,di.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let s=0,r=e.length;s<r;s++){const o=e[s];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new dt(n,3))}else{const n=Math.min(e.length,t.count);for(let s=0;s<n;s++){const r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&Be("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new jn);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){je("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new D(-1/0,-1/0,-1/0),new D(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){const r=t[n];Ft.setFromBufferAttribute(r),this.morphTargetsRelative?(yt.addVectors(this.boundingBox.min,Ft.min),this.boundingBox.expandByPoint(yt),yt.addVectors(this.boundingBox.max,Ft.max),this.boundingBox.expandByPoint(yt)):(this.boundingBox.expandByPoint(Ft.min),this.boundingBox.expandByPoint(Ft.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&je('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Pi);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){je("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new D,1/0);return}if(e){const n=this.boundingSphere.center;if(Ft.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){const a=t[r];ki.setFromBufferAttribute(a),this.morphTargetsRelative?(yt.addVectors(Ft.min,ki.min),Ft.expandByPoint(yt),yt.addVectors(Ft.max,ki.max),Ft.expandByPoint(yt)):(Ft.expandByPoint(ki.min),Ft.expandByPoint(ki.max))}Ft.getCenter(n);let s=0;for(let r=0,o=e.count;r<o;r++)yt.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(yt));if(t)for(let r=0,o=t.length;r<o;r++){const a=t[r],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)yt.fromBufferAttribute(a,c),l&&(di.fromBufferAttribute(e,c),yt.add(di)),s=Math.max(s,n.distanceToSquared(yt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&je('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){je("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,s=t.normal,r=t.uv;let o=this.getAttribute("tangent");(o===void 0||o.count!==n.count)&&(o=new Dt(new Float32Array(4*n.count),4),this.setAttribute("tangent",o));const a=[],l=[];for(let x=0;x<n.count;x++)a[x]=new D,l[x]=new D;const c=new D,h=new D,d=new D,u=new me,f=new me,g=new me,v=new D,m=new D;function p(x,b,P){c.fromBufferAttribute(n,x),h.fromBufferAttribute(n,b),d.fromBufferAttribute(n,P),u.fromBufferAttribute(r,x),f.fromBufferAttribute(r,b),g.fromBufferAttribute(r,P),h.sub(c),d.sub(c),f.sub(u),g.sub(u);const N=1/(f.x*g.y-g.x*f.y);isFinite(N)&&(v.copy(h).multiplyScalar(g.y).addScaledVector(d,-f.y).multiplyScalar(N),m.copy(d).multiplyScalar(f.x).addScaledVector(h,-g.x).multiplyScalar(N),a[x].add(v),a[b].add(v),a[P].add(v),l[x].add(m),l[b].add(m),l[P].add(m))}let y=this.groups;y.length===0&&(y=[{start:0,count:e.count}]);for(let x=0,b=y.length;x<b;++x){const P=y[x],N=P.start,z=P.count;for(let V=N,U=N+z;V<U;V+=3)p(e.getX(V+0),e.getX(V+1),e.getX(V+2))}const A=new D,S=new D,T=new D,w=new D;function R(x){T.fromBufferAttribute(s,x),w.copy(T);const b=a[x];A.copy(b),A.sub(T.multiplyScalar(T.dot(b))).normalize(),S.crossVectors(w,b);const N=S.dot(l[x])<0?-1:1;o.setXYZW(x,A.x,A.y,A.z,N)}for(let x=0,b=y.length;x<b;++x){const P=y[x],N=P.start,z=P.count;for(let V=N,U=N+z;V<U;V+=3)R(e.getX(V+0)),R(e.getX(V+1)),R(e.getX(V+2))}this._transformed=!0}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new Dt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let u=0,f=n.count;u<f;u++)n.setXYZ(u,0,0,0);const s=new D,r=new D,o=new D,a=new D,l=new D,c=new D,h=new D,d=new D;if(e)for(let u=0,f=e.count;u<f;u+=3){const g=e.getX(u+0),v=e.getX(u+1),m=e.getX(u+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,v),o.fromBufferAttribute(t,m),h.subVectors(o,r),d.subVectors(s,r),h.cross(d),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,v),c.fromBufferAttribute(n,m),a.add(h),l.add(h),c.add(h),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(v,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let u=0,f=t.count;u<f;u+=3)s.fromBufferAttribute(t,u+0),r.fromBufferAttribute(t,u+1),o.fromBufferAttribute(t,u+2),h.subVectors(o,r),d.subVectors(s,r),h.cross(d),n.setXYZ(u+0,h.x,h.y,h.z),n.setXYZ(u+1,h.x,h.y,h.z),n.setXYZ(u+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)yt.fromBufferAttribute(e,t),yt.normalize(),e.setXYZ(t,yt.x,yt.y,yt.z)}toNonIndexed(){function e(a,l){const c=a.array,h=a.itemSize,d=a.normalized,u=new c.constructor(l.length*h);let f=0,g=0;for(let v=0,m=l.length;v<m;v++){a.isInterleavedBufferAttribute?f=l[v]*a.data.stride+a.offset:f=l[v]*h;for(let p=0;p<h;p++)u[g++]=c[f++]}return new Dt(u,h,d)}if(this.index===null)return Be("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new wt,n=this.index.array,s=this.attributes;for(const a in s){const l=s[a],c=e(l,n);t.setAttribute(a,c)}const r=this.morphAttributes;for(const a in r){const l=[],c=r[a];for(let h=0,d=c.length;h<d;h++){const u=c[h],f=e(u,n);l.push(f)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const l in n){const c=n[l];e.data.attributes[l]=c.toJSON(e.data)}const s={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let d=0,u=c.length;d<u;d++){const f=c[d];h.push(f.toJSON(e.data))}h.length>0&&(s[l]=h,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone());const s=e.attributes;for(const c in s){const h=s[c];this.setAttribute(c,h.clone(t))}const r=e.morphAttributes;for(const c in r){const h=[],d=r[c];for(let u=0,f=d.length;u<f;u++)h.push(d[u].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let c=0,h=o.length;c<h;c++){const d=o[c];this.addGroup(d.start,d.count,d.materialIndex)}const a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Yr=new D,Yu=new D,qu=new Ge;class xn{constructor(e=new D(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const s=Yr.subVectors(n,t).cross(Yu.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){const s=e.delta(Yr),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const o=-(e.start.dot(this.normal)+this.constant)/r;return n===!0&&(o<0||o>1)?null:t.copy(e.start).addScaledVector(s,o)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||qu.getNormalMatrix(e),s=this.coplanarPoint(Yr).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}}let Ku=0;class Li extends Qn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Ku++}),this.uuid=Ri(),this.name="",this.type="Material",this.blending=$i,this.side=qn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Dc,this.blendDst=Nc,this.blendEquation=xi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ve(0,0,0),this.blendAlpha=0,this.depthFunc=ts,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=gu,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ar,this.stencilZFail=Ar,this.stencilZPass=Ar,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){Be(`Material: parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){Be(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){const o=[];for(const a in r){const l=r[a];delete l.metadata,o.push(l)}return o}if(t){const r=s(e.textures),o=s(e.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Ve().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(n=>new xn().fromJSON(n))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new me().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new me().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}const gn=new D,qr=new D,Ss=new D,ys=new D;class wa{constructor(e=new D,t=new D(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,gn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=gn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(gn.copy(this.origin).addScaledVector(this.direction,t),gn.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){qr.copy(e).add(t).multiplyScalar(.5),Ss.copy(t).sub(e).normalize(),ys.copy(this.origin).sub(qr);const r=e.distanceTo(t)*.5,o=-this.direction.dot(Ss),a=ys.dot(this.direction),l=-ys.dot(Ss),c=ys.lengthSq(),h=Math.abs(1-o*o);let d,u,f,g;if(h>0)if(d=o*l-a,u=o*a-l,g=r*h,d>=0)if(u>=-g)if(u<=g){const v=1/h;d*=v,u*=v,f=d*(d+o*u+2*a)+u*(o*d+u+2*l)+c}else u=r,d=Math.max(0,-(o*u+a)),f=-d*d+u*(u+2*l)+c;else u=-r,d=Math.max(0,-(o*u+a)),f=-d*d+u*(u+2*l)+c;else u<=-g?(d=Math.max(0,-(-o*r+a)),u=d>0?-r:Math.min(Math.max(-r,-l),r),f=-d*d+u*(u+2*l)+c):u<=g?(d=0,u=Math.min(Math.max(-r,-l),r),f=u*(u+2*l)+c):(d=Math.max(0,-(o*r+a)),u=d>0?r:Math.min(Math.max(-r,-l),r),f=-d*d+u*(u+2*l)+c);else u=o>0?-r:r,d=Math.max(0,-(o*u+a)),f=-d*d+u*(u+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,d),s&&s.copy(qr).addScaledVector(Ss,u),f}intersectSphere(e,t){if(e.radius<0)return null;gn.subVectors(e.center,this.origin);const n=gn.dot(this.direction),s=gn.dot(gn)-n*n,r=e.radius*e.radius;if(s>r)return null;const o=Math.sqrt(r-s),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,o,a,l;const c=1/this.direction.x,h=1/this.direction.y,d=1/this.direction.z,u=this.origin;return c>=0?(n=(e.min.x-u.x)*c,s=(e.max.x-u.x)*c):(n=(e.max.x-u.x)*c,s=(e.min.x-u.x)*c),h>=0?(r=(e.min.y-u.y)*h,o=(e.max.y-u.y)*h):(r=(e.max.y-u.y)*h,o=(e.min.y-u.y)*h),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),d>=0?(a=(e.min.z-u.z)*d,l=(e.max.z-u.z)*d):(a=(e.max.z-u.z)*d,l=(e.min.z-u.z)*d),n>l||a>s)||((a>n||n!==n)&&(n=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,gn)!==null}intersectTriangle(e,t,n,s,r){const o=this.origin,a=this.direction,l=a.x,c=a.y,h=a.z,d=e.x-o.x,u=e.y-o.y,f=e.z-o.z,g=t.x-o.x,v=t.y-o.y,m=t.z-o.z,p=n.x-o.x,y=n.y-o.y,A=n.z-o.z,S=Math.abs(l),T=Math.abs(c),w=Math.abs(h);let R,x,b,P,N,z,V,U,O,J,H,se;if(S>=T&&S>=w?(b=l,z=d,O=g,se=p,l>=0?(R=c,x=h,P=u,N=f,V=v,U=m,J=y,H=A):(R=h,x=c,P=f,N=u,V=m,U=v,J=A,H=y)):T>=w?(b=c,z=u,O=v,se=y,c>=0?(R=h,x=l,P=f,N=d,V=m,U=g,J=A,H=p):(R=l,x=h,P=d,N=f,V=g,U=m,J=p,H=A)):(b=h,z=f,O=m,se=A,h>=0?(R=l,x=c,P=d,N=u,V=g,U=v,J=p,H=y):(R=c,x=l,P=u,N=d,V=v,U=g,J=y,H=p)),b===0)return null;const X=R/b,j=x/b,te=1/b,Ae=P-X*z,Ee=N-j*z,et=V-X*O,We=U-j*O,Ze=J-X*se,q=H-j*se,Q=Ze*We-q*et,he=Ae*q-Ee*Ze,Ue=et*Ee-We*Ae;if(s){if(Q<0||he<0||Ue<0)return null}else if((Q<0||he<0||Ue<0)&&(Q>0||he>0||Ue>0))return null;const Se=Q+he+Ue;if(Se===0)return null;const Re=te*(Q*z+he*O+Ue*se);return(Se>0?Re<0:Re>0)?null:this.at(Re/Se,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Ii extends Li{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ve(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new On,this.combine=Uc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const gl=new nt,Gn=new wa,Es=new Pi,_l=new D,ws=new D,Ts=new D,bs=new D,Kr=new D,As=new D,xl=new D,Rs=new D;class gt extends vt{constructor(e=new wt,t=new Ii){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){const n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(s,e);const a=this.morphTargetInfluences;if(r&&a){As.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const h=a[l],d=r[l];h!==0&&(Kr.fromBufferAttribute(d,e),o?As.addScaledVector(Kr,h):As.addScaledVector(Kr.sub(t),h))}t.add(As)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){const n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Es.copy(n.boundingSphere),Es.applyMatrix4(r),Gn.copy(e.ray).recast(e.near),!(Es.containsPoint(Gn.origin)===!1&&(Gn.intersectSphere(Es,_l)===null||Gn.origin.distanceToSquared(_l)>(e.far-e.near)**2))&&(gl.copy(r).invert(),Gn.copy(e.ray).applyMatrix4(gl),!(n.boundingBox!==null&&Gn.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Gn)))}_computeIntersections(e,t,n){let s;const r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,d=r.attributes.normal,u=r.groups,f=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,v=u.length;g<v;g++){const m=u[g],p=o[m.materialIndex],y=Math.max(m.start,f.start),A=Math.min(a.count,Math.min(m.start+m.count,f.start+f.count));for(let S=y,T=A;S<T;S+=3){const w=a.getX(S),R=a.getX(S+1),x=a.getX(S+2);s=Cs(this,p,e,n,c,h,d,w,R,x),s&&(s.faceIndex=Math.floor(S/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const g=Math.max(0,f.start),v=Math.min(a.count,f.start+f.count);for(let m=g,p=v;m<p;m+=3){const y=a.getX(m),A=a.getX(m+1),S=a.getX(m+2);s=Cs(this,o,e,n,c,h,d,y,A,S),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,v=u.length;g<v;g++){const m=u[g],p=o[m.materialIndex],y=Math.max(m.start,f.start),A=Math.min(l.count,Math.min(m.start+m.count,f.start+f.count));for(let S=y,T=A;S<T;S+=3){const w=S,R=S+1,x=S+2;s=Cs(this,p,e,n,c,h,d,w,R,x),s&&(s.faceIndex=Math.floor(S/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const g=Math.max(0,f.start),v=Math.min(l.count,f.start+f.count);for(let m=g,p=v;m<p;m+=3){const y=m,A=m+1,S=m+2;s=Cs(this,o,e,n,c,h,d,y,A,S),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}}function Ju(i,e,t,n,s,r,o,a){let l;if(e.side===Nt?l=n.intersectTriangle(o,r,s,!0,a):l=n.intersectTriangle(s,r,o,e.side===qn,a),l===null)return null;Rs.copy(a),Rs.applyMatrix4(i.matrixWorld);const c=t.ray.origin.distanceTo(Rs);return c<t.near||c>t.far?null:{distance:c,point:Rs.clone(),object:i}}function Cs(i,e,t,n,s,r,o,a,l,c){i.getVertexPosition(a,ws),i.getVertexPosition(l,Ts),i.getVertexPosition(c,bs);const h=Ju(i,e,t,n,ws,Ts,bs,xl);if(h){const d=new D;Gt.getBarycoord(xl,ws,Ts,bs,d),s&&(h.uv=Gt.getInterpolatedAttribute(s,a,l,c,d,new me)),r&&(h.uv1=Gt.getInterpolatedAttribute(r,a,l,c,d,new me)),o&&(h.normal=Gt.getInterpolatedAttribute(o,a,l,c,d,new D),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));const u={a,b:l,c,normal:new D,materialIndex:0};Gt.getNormal(ws,Ts,bs,u.normal),h.face=u,h.barycoord=d}return h}class Ta extends Lt{constructor(e=null,t=1,n=1,s,r,o,a,l,c=Tt,h=Tt,d,u){super(null,o,a,l,c,h,s,r,d,u),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class vl extends Dt{constructor(e,t,n,s=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const fi=new nt,Ml=new nt,Ps=[],Sl=new jn,$u=new nt,zi=new gt,Gi=new Pi;class cr extends gt{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new vl(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,$u)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new jn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,fi),Sl.copy(e.boundingBox).applyMatrix4(fi),this.boundingBox.union(Sl)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Pi),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,fi),Gi.copy(e.boundingSphere).applyMatrix4(fi),this.boundingSphere.union(Gi)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const n=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,o=e*r+1;for(let a=0;a<n.length;a++)n[a]=s[o+a]}raycast(e,t){const n=this.matrixWorld,s=this.count;if(zi.geometry=this.geometry,zi.material=this.material,zi.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Gi.copy(this.boundingSphere),Gi.applyMatrix4(n),e.ray.intersectsSphere(Gi)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,fi),Ml.multiplyMatrices(n,fi),zi.matrixWorld=Ml,zi.raycast(e,Ps);for(let o=0,a=Ps.length;o<a;o++){const l=Ps[o];l.instanceId=r,l.object=this,t.push(l)}Ps.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new vl(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){const n=t.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new Ta(new Float32Array(s*this.count),s,this.count,ga,Kt));const r=this.morphTexture.source.data.data;let o=0;for(let c=0;c<n.length;c++)o+=n[c];const a=this.geometry.morphTargetsRelative?1:1-o,l=s*e;return r[l]=a,r.set(n,l+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}}const Hn=new Pi,Zu=new me(.5,.5),Ls=new D;class ba{constructor(e=new xn,t=new xn,n=new xn,s=new xn,r=new xn,o=new xn){this.planes=[e,t,n,s,r,o]}set(e,t,n,s,r,o){const a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=on,n=!1){const s=this.planes,r=e.elements,o=r[0],a=r[1],l=r[2],c=r[3],h=r[4],d=r[5],u=r[6],f=r[7],g=r[8],v=r[9],m=r[10],p=r[11],y=r[12],A=r[13],S=r[14],T=r[15];if(s[0].setComponents(c-o,f-h,p-g,T-y).normalize(),s[1].setComponents(c+o,f+h,p+g,T+y).normalize(),s[2].setComponents(c+a,f+d,p+v,T+A).normalize(),s[3].setComponents(c-a,f-d,p-v,T-A).normalize(),n)s[4].setComponents(l,u,m,S).normalize(),s[5].setComponents(c-l,f-u,p-m,T-S).normalize();else if(s[4].setComponents(c-l,f-u,p-m,T-S).normalize(),t===on)s[5].setComponents(c+l,f+u,p+m,T+S).normalize();else if(t===ss)s[5].setComponents(l,u,m,S).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Hn.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Hn.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Hn)}intersectsSprite(e){Hn.center.set(0,0,0);const t=Zu.distanceTo(e.center);return Hn.radius=.7071067811865476+t,Hn.applyMatrix4(e.matrixWorld),this.intersectsSphere(Hn)}intersectsSphere(e){const t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const s=t[n];if(Ls.x=s.normal.x>0?e.max.x:e.min.x,Ls.y=s.normal.y>0?e.max.y:e.min.y,Ls.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Ls)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class eh extends Li{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ve(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const hr=new D,ur=new D,yl=new nt,Hi=new wa,Is=new Pi,Jr=new D,El=new D;class Qu extends vt{constructor(e=new wt,t=new eh){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let s=1,r=t.count;s<r;s++)hr.fromBufferAttribute(t,s-1),ur.fromBufferAttribute(t,s),n[s]=n[s-1],n[s]+=hr.distanceTo(ur);e.setAttribute("lineDistance",new dt(n,1))}else Be("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){const n=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Is.copy(n.boundingSphere),Is.applyMatrix4(s),Is.radius+=r,e.ray.intersectsSphere(Is)===!1)return;yl.copy(s).invert(),Hi.copy(e.ray).applyMatrix4(yl);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=this.isLineSegments?2:1,h=n.index,u=n.attributes.position;if(h!==null){const f=Math.max(0,o.start),g=Math.min(h.count,o.start+o.count);for(let v=f,m=g-1;v<m;v+=c){const p=h.getX(v),y=h.getX(v+1),A=Ds(this,e,Hi,l,p,y,v);A&&t.push(A)}if(this.isLineLoop){const v=h.getX(g-1),m=h.getX(f),p=Ds(this,e,Hi,l,v,m,g-1);p&&t.push(p)}}else{const f=Math.max(0,o.start),g=Math.min(u.count,o.start+o.count);for(let v=f,m=g-1;v<m;v+=c){const p=Ds(this,e,Hi,l,v,v+1,v);p&&t.push(p)}if(this.isLineLoop){const v=Ds(this,e,Hi,l,g-1,f,g-1);v&&t.push(v)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function Ds(i,e,t,n,s,r,o){const a=i.geometry.attributes.position;if(hr.fromBufferAttribute(a,s),ur.fromBufferAttribute(a,r),t.distanceSqToSegment(hr,ur,Jr,El)>n)return;Jr.applyMatrix4(i.matrixWorld);const c=e.ray.origin.distanceTo(Jr);if(!(c<e.near||c>e.far))return{distance:c,point:El.clone().applyMatrix4(i.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:i}}const wl=new D,Tl=new D;class bl extends Qu{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[];for(let s=0,r=t.count;s<r;s+=2)wl.fromBufferAttribute(t,s),Tl.fromBufferAttribute(t,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+wl.distanceTo(Tl);e.setAttribute("lineDistance",new dt(n,1))}else Be("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class th extends Lt{constructor(e=[],t=Kn,n,s,r,o,a,l,c,h){super(e,t,n,s,r,o,a,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class rs extends Lt{constructor(e,t,n=ln,s,r,o,a=Tt,l=Tt,c,h=En,d=1){if(h!==En&&h!==Xn)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const u={width:e,height:t,depth:d};super(u,s,r,o,a,l,h,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new ya(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}}class ju extends rs{constructor(e,t=ln,n=Kn,s,r,o=Tt,a=Tt,l,c=En){const h={width:e,height:e,depth:1},d=[h,h,h,h,h,h];super(e,e,t,n,s,r,o,a,l,c),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}}class nh extends Lt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class Di extends wt{constructor(e=1,t=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};const a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);const l=[],c=[],h=[],d=[];let u=0,f=0;g("z","y","x",-1,-1,n,t,e,o,r,0),g("z","y","x",1,-1,n,t,-e,o,r,1),g("x","z","y",1,1,e,n,t,s,o,2),g("x","z","y",1,-1,e,n,-t,s,o,3),g("x","y","z",1,-1,e,t,n,s,r,4),g("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new dt(c,3)),this.setAttribute("normal",new dt(h,3)),this.setAttribute("uv",new dt(d,2));function g(v,m,p,y,A,S,T,w,R,x,b){const P=S/R,N=T/x,z=S/2,V=T/2,U=w/2,O=R+1,J=x+1;let H=0,se=0;const X=new D;for(let j=0;j<J;j++){const te=j*N-V;for(let Ae=0;Ae<O;Ae++){const Ee=Ae*P-z;X[v]=Ee*y,X[m]=te*A,X[p]=U,c.push(X.x,X.y,X.z),X[v]=0,X[m]=0,X[p]=w>0?1:-1,h.push(X.x,X.y,X.z),d.push(Ae/R),d.push(1-j/x),H+=1}}for(let j=0;j<x;j++)for(let te=0;te<R;te++){const Ae=u+te+O*j,Ee=u+te+O*(j+1),et=u+(te+1)+O*(j+1),We=u+(te+1)+O*j;l.push(Ae,Ee,We),l.push(Ee,et,We),se+=6}a.addGroup(f,se,b),f+=se,u+=H}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Di(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}const Ns=new D,Us=new D,$r=new D,Fs=new Gt;class ed extends wt{constructor(e=null,t=1){if(super(),this.type="EdgesGeometry",this.parameters={geometry:e,thresholdAngle:t},e!==null){const s=Math.pow(10,4),r=Math.cos(tr*t),o=e.getIndex(),a=e.getAttribute("position"),l=o?o.count:a.count,c=[0,0,0],h=["a","b","c"],d=new Array(3),u={},f=[];for(let g=0;g<l;g+=3){o?(c[0]=o.getX(g),c[1]=o.getX(g+1),c[2]=o.getX(g+2)):(c[0]=g,c[1]=g+1,c[2]=g+2);const{a:v,b:m,c:p}=Fs;if(v.fromBufferAttribute(a,c[0]),m.fromBufferAttribute(a,c[1]),p.fromBufferAttribute(a,c[2]),Fs.getNormal($r),d[0]=`${Math.round(v.x*s)},${Math.round(v.y*s)},${Math.round(v.z*s)}`,d[1]=`${Math.round(m.x*s)},${Math.round(m.y*s)},${Math.round(m.z*s)}`,d[2]=`${Math.round(p.x*s)},${Math.round(p.y*s)},${Math.round(p.z*s)}`,!(d[0]===d[1]||d[1]===d[2]||d[2]===d[0]))for(let y=0;y<3;y++){const A=(y+1)%3,S=d[y],T=d[A],w=Fs[h[y]],R=Fs[h[A]],x=`${S}_${T}`,b=`${T}_${S}`;b in u&&u[b]?($r.dot(u[b].normal)<=r&&(f.push(w.x,w.y,w.z),f.push(R.x,R.y,R.z)),u[b]=null):x in u||(u[x]={index0:c[y],index1:c[A],normal:$r.clone()})}}for(const g in u)if(u[g]){const{index0:v,index1:m}=u[g];Ns.fromBufferAttribute(a,v),Us.fromBufferAttribute(a,m),f.push(Ns.x,Ns.y,Ns.z),f.push(Us.x,Us.y,Us.z)}this.setAttribute("position",new dt(f,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}}class un{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){Be("Curve: .getPoint() not implemented.")}getPointAt(e,t){const n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){const e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const t=[];let n,s=this.getPoint(0),r=0;t.push(0);for(let o=1;o<=e;o++)n=this.getPoint(o/e),r+=n.distanceTo(s),t.push(r),s=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){const n=this.getLengths();let s=0;const r=n.length;let o;t?o=t:o=e*n[r-1];let a=0,l=r-1,c;for(;a<=l;)if(s=Math.floor(a+(l-a)/2),c=n[s]-o,c<0)a=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,n[s]===o)return s/(r-1);const h=n[s],u=n[s+1]-h,f=(o-h)/u;return(s+f)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);const o=this.getPoint(s),a=this.getPoint(r),l=t||(o.isVector2?new me:new D);return l.copy(a).sub(o).normalize(),l}getTangentAt(e,t){const n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){const n=new D,s=[],r=[],o=[],a=new D,l=new nt;for(let f=0;f<=e;f++){const g=f/e;s[f]=this.getTangentAt(g,new D)}r[0]=new D,o[0]=new D;let c=Number.MAX_VALUE;const h=Math.abs(s[0].x),d=Math.abs(s[0].y),u=Math.abs(s[0].z);h<=c&&(c=h,n.set(1,0,0)),d<=c&&(c=d,n.set(0,1,0)),u<=c&&n.set(0,0,1),a.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],a),o[0].crossVectors(s[0],r[0]);for(let f=1;f<=e;f++){if(r[f]=r[f-1].clone(),o[f]=o[f-1].clone(),a.crossVectors(s[f-1],s[f]),a.length()>Number.EPSILON){a.normalize();const g=Math.acos($e(s[f-1].dot(s[f]),-1,1));r[f].applyMatrix4(l.makeRotationAxis(a,g))}o[f].crossVectors(s[f],r[f])}if(t===!0){let f=Math.acos($e(r[0].dot(r[e]),-1,1));f/=e,s[0].dot(a.crossVectors(r[0],r[e]))>0&&(f=-f);for(let g=1;g<=e;g++)r[g].applyMatrix4(l.makeRotationAxis(s[g],f*g)),o[g].crossVectors(s[g],r[g])}return{tangents:s,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){const e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}}class Aa extends un{constructor(e=0,t=0,n=1,s=1,r=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(e,t=new me){const n=t,s=Math.PI*2;let r=this.aEndAngle-this.aStartAngle;const o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(o?r=0:r=s),this.aClockwise===!0&&!o&&(r===s?r=-s:r=r-s);const a=this.aStartAngle+e*r;let l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){const h=Math.cos(this.aRotation),d=Math.sin(this.aRotation),u=l-this.aX,f=c-this.aY;l=u*h-f*d+this.aX,c=u*d+f*h+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){const e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}}class td extends Aa{constructor(e,t,n,s,r,o){super(e,t,n,n,s,r,o),this.isArcCurve=!0,this.type="ArcCurve"}}function Ra(){let i=0,e=0,t=0,n=0;function s(r,o,a,l){i=r,e=a,t=-3*r+3*o-2*a-l,n=2*r-2*o+a+l}return{initCatmullRom:function(r,o,a,l,c){s(o,a,c*(a-r),c*(l-o))},initNonuniformCatmullRom:function(r,o,a,l,c,h,d){let u=(o-r)/c-(a-r)/(c+h)+(a-o)/h,f=(a-o)/h-(l-o)/(h+d)+(l-a)/d;u*=h,f*=h,s(o,a,u,f)},calc:function(r){const o=r*r,a=o*r;return i+e*r+t*o+n*a}}}const Al=new D,Rl=new D,Zr=new Ra,Qr=new Ra,jr=new Ra;class nd extends un{constructor(e=[],t=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=s}getPoint(e,t=new D){const n=t,s=this.points,r=s.length,o=(r-(this.closed?0:1))*e;let a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:l===0&&a===r-1&&(a=r-2,l=1);let c,h;this.closed||a>0?c=s[(a-1)%r]:(Rl.subVectors(s[0],s[1]).add(s[0]),c=Rl);const d=s[a%r],u=s[(a+1)%r];if(this.closed||a+2<r?h=s[(a+2)%r]:(Al.subVectors(s[r-1],s[r-2]).add(s[r-1]),h=Al),this.curveType==="centripetal"||this.curveType==="chordal"){const f=this.curveType==="chordal"?.5:.25;let g=Math.pow(c.distanceToSquared(d),f),v=Math.pow(d.distanceToSquared(u),f),m=Math.pow(u.distanceToSquared(h),f);v<1e-4&&(v=1),g<1e-4&&(g=v),m<1e-4&&(m=v),Zr.initNonuniformCatmullRom(c.x,d.x,u.x,h.x,g,v,m),Qr.initNonuniformCatmullRom(c.y,d.y,u.y,h.y,g,v,m),jr.initNonuniformCatmullRom(c.z,d.z,u.z,h.z,g,v,m)}else this.curveType==="catmullrom"&&(Zr.initCatmullRom(c.x,d.x,u.x,h.x,this.tension),Qr.initCatmullRom(c.y,d.y,u.y,h.y,this.tension),jr.initCatmullRom(c.z,d.z,u.z,h.z,this.tension));return n.set(Zr.calc(l),Qr.calc(l),jr.calc(l)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const s=e.points[t];this.points.push(new D().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}}function Cl(i,e,t,n,s){const r=(n-e)*.5,o=(s-t)*.5,a=i*i,l=i*a;return(2*t-2*n+r+o)*l+(-3*t+3*n-2*r-o)*a+r*i+t}function id(i,e){const t=1-i;return t*t*e}function sd(i,e){return 2*(1-i)*i*e}function rd(i,e){return i*i*e}function Zi(i,e,t,n){return id(i,e)+sd(i,t)+rd(i,n)}function od(i,e){const t=1-i;return t*t*t*e}function ad(i,e){const t=1-i;return 3*t*t*i*e}function ld(i,e){return 3*(1-i)*i*i*e}function cd(i,e){return i*i*i*e}function Qi(i,e,t,n,s){return od(i,e)+ad(i,t)+ld(i,n)+cd(i,s)}class ih extends un{constructor(e=new me,t=new me,n=new me,s=new me){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new me){const n=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(Qi(e,s.x,r.x,o.x,a.x),Qi(e,s.y,r.y,o.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class hd extends un{constructor(e=new D,t=new D,n=new D,s=new D){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new D){const n=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(Qi(e,s.x,r.x,o.x,a.x),Qi(e,s.y,r.y,o.y,a.y),Qi(e,s.z,r.z,o.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class sh extends un{constructor(e=new me,t=new me){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new me){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new me){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class ud extends un{constructor(e=new D,t=new D){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new D){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new D){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class rh extends un{constructor(e=new me,t=new me,n=new me){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new me){const n=t,s=this.v0,r=this.v1,o=this.v2;return n.set(Zi(e,s.x,r.x,o.x),Zi(e,s.y,r.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class dd extends un{constructor(e=new D,t=new D,n=new D){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new D){const n=t,s=this.v0,r=this.v1,o=this.v2;return n.set(Zi(e,s.x,r.x,o.x),Zi(e,s.y,r.y,o.y),Zi(e,s.z,r.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class oh extends un{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new me){const n=t,s=this.points,r=(s.length-1)*e,o=Math.floor(r),a=r-o,l=s[o===0?o:o-1],c=s[o],h=s[o>s.length-2?s.length-1:o+1],d=s[o>s.length-3?s.length-1:o+2];return n.set(Cl(a,l.x,c.x,h.x,d.x),Cl(a,l.y,c.y,h.y,d.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const s=e.points[t];this.points.push(s.clone())}return this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const s=e.points[t];this.points.push(new me().fromArray(s))}return this}}var na=Object.freeze({__proto__:null,ArcCurve:td,CatmullRomCurve3:nd,CubicBezierCurve:ih,CubicBezierCurve3:hd,EllipseCurve:Aa,LineCurve:sh,LineCurve3:ud,QuadraticBezierCurve:rh,QuadraticBezierCurve3:dd,SplineCurve:oh});class fd extends un{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){const e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){const n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new na[n](t,e))}return this}getPoint(e,t){const n=e*this.getLength(),s=this.getCurveLengths();let r=0;for(;r<s.length;){if(s[r]>=n){const o=s[r]-n,a=this.curves[r],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,t)}r++}return null}getLength(){const e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const e=[];let t=0;for(let n=0,s=this.curves.length;n<s;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){const t=[];let n;for(let s=0,r=this.curves;s<r.length;s++){const o=r[s],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,l=o.getPoints(a);for(let c=0;c<l.length;c++){const h=l[c];n&&n.equals(h)||(t.push(h),n=h)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){const s=e.curves[t];this.curves.push(s.clone())}return this.autoClose=e.autoClose,this}toJSON(){const e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){const s=this.curves[t];e.curves.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){const s=e.curves[t];this.curves.push(new na[s.type]().fromJSON(s))}return this}}class dr extends fd{constructor(e){super(),this.type="Path",this.currentPoint=new me,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){const n=new sh(this.currentPoint.clone(),new me(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,s){const r=new rh(this.currentPoint.clone(),new me(e,t),new me(n,s));return this.curves.push(r),this.currentPoint.set(n,s),this}bezierCurveTo(e,t,n,s,r,o){const a=new ih(this.currentPoint.clone(),new me(e,t),new me(n,s),new me(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(e){const t=[this.currentPoint.clone()].concat(e),n=new oh(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,s,r,o){const a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+a,t+l,n,s,r,o),this}absarc(e,t,n,s,r,o){return this.absellipse(e,t,n,n,s,r,o),this}ellipse(e,t,n,s,r,o,a,l){const c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(e+c,t+h,n,s,r,o,a,l),this}absellipse(e,t,n,s,r,o,a,l){const c=new Aa(e,t,n,s,r,o,a,l);if(this.curves.length>0){const d=c.getPoint(0);d.equals(this.currentPoint)||this.lineTo(d.x,d.y)}this.curves.push(c);const h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){const e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}}class Ca extends dr{constructor(e){super(e),this.uuid=Ri(),this.type="Shape",this.holes=[]}getPointsHoles(e){const t=[];for(let n=0,s=this.holes.length;n<s;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){const s=e.holes[t];this.holes.push(s.clone())}return this}toJSON(){const e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){const s=this.holes[t];e.holes.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){const s=e.holes[t];this.holes.push(new dr().fromJSON(s))}return this}}function pd(i,e,t=2){const n=e&&e.length,s=n?e[0]*t:i.length;let r=ah(i,0,s,t,!0);const o=[];if(!r||r.next===r.prev)return o;let a,l,c;if(n&&(r=vd(i,e,r,t)),i.length>80*t){a=i[0],l=i[1];let h=a,d=l;for(let u=t;u<s;u+=t){const f=i[u],g=i[u+1];f<a&&(a=f),g<l&&(l=g),f>h&&(h=f),g>d&&(d=g)}c=Math.max(h-a,d-l),c=c!==0?32767/c:0}return os(r,o,t,a,l,c,0),o}function ah(i,e,t,n,s){let r;if(s===Pd(i,e,t,n)>0)for(let o=e;o<t;o+=n)r=Pl(o/n|0,i[o],i[o+1],r);else for(let o=t-n;o>=e;o-=n)r=Pl(o/n|0,i[o],i[o+1],r);return r&&bi(r,r.next)&&(ls(r),r=r.next),r}function $n(i,e){if(!i)return i;e||(e=i);let t=i,n;do if(n=!1,!t.steiner&&(bi(t,t.next)||pt(t.prev,t,t.next)===0)){if(ls(t),t=e=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==e);return e}function os(i,e,t,n,s,r,o){if(!i)return;!o&&r&&wd(i,n,s,r);let a=i;for(;i.prev!==i.next;){const l=i.prev,c=i.next;if(r?gd(i,n,s,r):md(i)){e.push(l.i,i.i,c.i),ls(i),i=c.next,a=c.next;continue}if(i=c,i===a){o?o===1?(i=_d($n(i),e),os(i,e,t,n,s,r,2)):o===2&&xd(i,e,t,n,s,r):os($n(i),e,t,n,s,r,1);break}}}function md(i){const e=i.prev,t=i,n=i.next;if(pt(e,t,n)>=0)return!1;const s=e.x,r=t.x,o=n.x,a=e.y,l=t.y,c=n.y,h=Math.min(s,r,o),d=Math.min(a,l,c),u=Math.max(s,r,o),f=Math.max(a,l,c);let g=n.next;for(;g!==e;){if(g.x>=h&&g.x<=u&&g.y>=d&&g.y<=f&&qi(s,a,r,l,o,c,g.x,g.y)&&pt(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function gd(i,e,t,n){const s=i.prev,r=i,o=i.next;if(pt(s,r,o)>=0)return!1;const a=s.x,l=r.x,c=o.x,h=s.y,d=r.y,u=o.y,f=Math.min(a,l,c),g=Math.min(h,d,u),v=Math.max(a,l,c),m=Math.max(h,d,u),p=ia(f,g,e,t,n),y=ia(v,m,e,t,n);let A=i.prevZ,S=i.nextZ;for(;A&&A.z>=p&&S&&S.z<=y;){if(A.x>=f&&A.x<=v&&A.y>=g&&A.y<=m&&A!==s&&A!==o&&qi(a,h,l,d,c,u,A.x,A.y)&&pt(A.prev,A,A.next)>=0||(A=A.prevZ,S.x>=f&&S.x<=v&&S.y>=g&&S.y<=m&&S!==s&&S!==o&&qi(a,h,l,d,c,u,S.x,S.y)&&pt(S.prev,S,S.next)>=0))return!1;S=S.nextZ}for(;A&&A.z>=p;){if(A.x>=f&&A.x<=v&&A.y>=g&&A.y<=m&&A!==s&&A!==o&&qi(a,h,l,d,c,u,A.x,A.y)&&pt(A.prev,A,A.next)>=0)return!1;A=A.prevZ}for(;S&&S.z<=y;){if(S.x>=f&&S.x<=v&&S.y>=g&&S.y<=m&&S!==s&&S!==o&&qi(a,h,l,d,c,u,S.x,S.y)&&pt(S.prev,S,S.next)>=0)return!1;S=S.nextZ}return!0}function _d(i,e){let t=i;do{const n=t.prev,s=t.next.next;!bi(n,s)&&ch(n,t,t.next,s)&&as(n,s)&&as(s,n)&&(e.push(n.i,t.i,s.i),ls(t),ls(t.next),t=i=s),t=t.next}while(t!==i);return $n(t)}function xd(i,e,t,n,s,r){let o=i;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&Ad(o,a)){let l=hh(o,a);o=$n(o,o.next),l=$n(l,l.next),os(o,e,t,n,s,r,0),os(l,e,t,n,s,r,0);return}a=a.next}o=o.next}while(o!==i)}function vd(i,e,t,n){const s=[];for(let r=0,o=e.length;r<o;r++){const a=e[r]*n,l=r<o-1?e[r+1]*n:i.length,c=ah(i,a,l,n,!1);c===c.next&&(c.steiner=!0),s.push(bd(c))}s.sort(Md);for(let r=0;r<s.length;r++)t=Sd(s[r],t);return t}function Md(i,e){let t=i.x-e.x;if(t===0&&(t=i.y-e.y,t===0)){const n=(i.next.y-i.y)/(i.next.x-i.x),s=(e.next.y-e.y)/(e.next.x-e.x);t=n-s}return t}function Sd(i,e){const t=yd(i,e);if(!t)return e;const n=hh(t,i);return $n(n,n.next),$n(t,t.next)}function yd(i,e){let t=e;const n=i.x,s=i.y;let r=-1/0,o;if(bi(i,t))return t;do{if(bi(i,t.next))return t.next;if(s<=t.y&&s>=t.next.y&&t.next.y!==t.y){const d=t.x+(s-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(d<=n&&d>r&&(r=d,o=t.x<t.next.x?t:t.next,d===n))return o}t=t.next}while(t!==e);if(!o)return null;const a=o,l=o.x,c=o.y;let h=1/0;t=o;do{if(n>=t.x&&t.x>=l&&n!==t.x&&lh(s<c?n:r,s,l,c,s<c?r:n,s,t.x,t.y)){const d=Math.abs(s-t.y)/(n-t.x);as(t,i)&&(d<h||d===h&&(t.x>o.x||t.x===o.x&&Ed(o,t)))&&(o=t,h=d)}t=t.next}while(t!==a);return o}function Ed(i,e){return pt(i.prev,i,e.prev)<0&&pt(e.next,i,i.next)<0}function wd(i,e,t,n){let s=i;do s.z===0&&(s.z=ia(s.x,s.y,e,t,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,Td(s)}function Td(i){let e,t=1;do{let n=i,s;i=null;let r=null;for(e=0;n;){e++;let o=n,a=0;for(let c=0;c<t&&(a++,o=o.nextZ,!!o);c++);let l=t;for(;a>0||l>0&&o;)a!==0&&(l===0||!o||n.z<=o.z)?(s=n,n=n.nextZ,a--):(s=o,o=o.nextZ,l--),r?r.nextZ=s:i=s,s.prevZ=r,r=s;n=o}r.nextZ=null,t*=2}while(e>1);return i}function ia(i,e,t,n,s){return i=(i-t)*s|0,e=(e-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,i|e<<1}function bd(i){let e=i,t=i;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==i);return t}function lh(i,e,t,n,s,r,o,a){return(s-o)*(e-a)>=(i-o)*(r-a)&&(i-o)*(n-a)>=(t-o)*(e-a)&&(t-o)*(r-a)>=(s-o)*(n-a)}function qi(i,e,t,n,s,r,o,a){return!(i===o&&e===a)&&lh(i,e,t,n,s,r,o,a)}function Ad(i,e){return i.next.i!==e.i&&i.prev.i!==e.i&&!Rd(i,e)&&(as(i,e)&&as(e,i)&&Cd(i,e)&&(pt(i.prev,i,e.prev)||pt(i,e.prev,e))||bi(i,e)&&pt(i.prev,i,i.next)>0&&pt(e.prev,e,e.next)>0)}function pt(i,e,t){return(e.y-i.y)*(t.x-e.x)-(e.x-i.x)*(t.y-e.y)}function bi(i,e){return i.x===e.x&&i.y===e.y}function ch(i,e,t,n){const s=Bs(pt(i,e,t)),r=Bs(pt(i,e,n)),o=Bs(pt(t,n,i)),a=Bs(pt(t,n,e));return!!(s!==r&&o!==a||s===0&&Os(i,t,e)||r===0&&Os(i,n,e)||o===0&&Os(t,i,n)||a===0&&Os(t,e,n))}function Os(i,e,t){return e.x<=Math.max(i.x,t.x)&&e.x>=Math.min(i.x,t.x)&&e.y<=Math.max(i.y,t.y)&&e.y>=Math.min(i.y,t.y)}function Bs(i){return i>0?1:i<0?-1:0}function Rd(i,e){let t=i;do{if(t.i!==i.i&&t.next.i!==i.i&&t.i!==e.i&&t.next.i!==e.i&&ch(t,t.next,i,e))return!0;t=t.next}while(t!==i);return!1}function as(i,e){return pt(i.prev,i,i.next)<0?pt(i,e,i.next)>=0&&pt(i,i.prev,e)>=0:pt(i,e,i.prev)<0||pt(i,i.next,e)<0}function Cd(i,e){let t=i,n=!1;const s=(i.x+e.x)/2,r=(i.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&s<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==i);return n}function hh(i,e){const t=sa(i.i,i.x,i.y),n=sa(e.i,e.x,e.y),s=i.next,r=e.prev;return i.next=e,e.prev=i,t.next=s,s.prev=t,n.next=t,t.prev=n,r.next=n,n.prev=r,n}function Pl(i,e,t,n){const s=sa(i,e,t);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function ls(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function sa(i,e,t){return{i,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function Pd(i,e,t,n){let s=0;for(let r=e,o=t-n;r<t;r+=n)s+=(i[o]-i[r])*(i[r+1]+i[o+1]),o=r;return s}class Ld{static triangulate(e,t,n=2){return pd(e,t,n)}}class Mi{static area(e){const t=e.length;let n=0;for(let s=t-1,r=0;r<t;s=r++)n+=e[s].x*e[r].y-e[r].x*e[s].y;return n*.5}static isClockWise(e){return Mi.area(e)<0}static triangulateShape(e,t){const n=[],s=[],r=[];Ll(e),Il(n,e);let o=e.length;t.forEach(Ll);for(let l=0;l<t.length;l++)s.push(o),o+=t[l].length,Il(n,t[l]);const a=Ld.triangulate(n,s);for(let l=0;l<a.length;l+=3)r.push(a.slice(l,l+3));return r}}function Ll(i){const e=i.length;e>2&&i[e-1].equals(i[0])&&i.pop()}function Il(i,e){for(let t=0;t<e.length;t++)i.push(e[t].x),i.push(e[t].y)}class _r extends wt{constructor(e=new Ca([new me(.5,.5),new me(-.5,.5),new me(-.5,-.5),new me(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];const n=this,s=[],r=[];for(let a=0,l=e.length;a<l;a++){const c=e[a];o(c)}this.setAttribute("position",new dt(s,3)),this.setAttribute("uv",new dt(r,2)),this.computeVertexNormals();function o(a){const l=[],c=t.curveSegments!==void 0?t.curveSegments:12,h=t.steps!==void 0?t.steps:1,d=t.depth!==void 0?t.depth:1;let u=t.bevelEnabled!==void 0?t.bevelEnabled:!0,f=t.bevelThickness!==void 0?t.bevelThickness:.2,g=t.bevelSize!==void 0?t.bevelSize:f-.1,v=t.bevelOffset!==void 0?t.bevelOffset:0,m=t.bevelSegments!==void 0?t.bevelSegments:3;const p=t.extrudePath,y=t.UVGenerator!==void 0?t.UVGenerator:Id;let A,S=!1,T,w,R,x;if(p){A=p.getSpacedPoints(h),S=!0,u=!1;const $=p.isCatmullRomCurve3?p.closed:!1;T=p.computeFrenetFrames(h,$),w=new D,R=new D,x=new D}u||(m=0,f=0,g=0,v=0);const b=a.extractPoints(c);let P=b.shape;const N=b.holes;if(!Mi.isClockWise(P)){P=P.reverse();for(let $=0,ne=N.length;$<ne;$++){const re=N[$];Mi.isClockWise(re)&&(N[$]=re.reverse())}}function V($){const re=10000000000000001e-36;let oe=$[0];for(let ce=1;ce<=$.length;ce++){const Fe=ce%$.length,Ne=$[Fe],ke=Ne.x-oe.x,ze=Ne.y-oe.y,C=ke*ke+ze*ze,it=Math.max(Math.abs(Ne.x),Math.abs(Ne.y),Math.abs(oe.x),Math.abs(oe.y)),Ke=re*it*it;if(C<=Ke){$.splice(Fe,1),ce--;continue}oe=Ne}}V(P),N.forEach(V);const U=N.length,O=P;for(let $=0;$<U;$++){const ne=N[$];P=P.concat(ne)}function J($,ne,re){return ne||je("ExtrudeGeometry: vec does not exist"),$.clone().addScaledVector(ne,re)}const H=P.length;function se($,ne,re){let oe,ce,Fe;const Ne=$.x-ne.x,ke=$.y-ne.y,ze=re.x-$.x,C=re.y-$.y,it=Ne*Ne+ke*ke,Ke=Ne*C-ke*ze;if(Math.abs(Ke)>Number.EPSILON){const E=Math.sqrt(it),_=Math.sqrt(ze*ze+C*C),F=ne.x-ke/E,G=ne.y+Ne/E,Y=re.x-C/_,ae=re.y+ze/_,le=((Y-F)*C-(ae-G)*ze)/(Ne*C-ke*ze);oe=F+Ne*le-$.x,ce=G+ke*le-$.y;const K=oe*oe+ce*ce;if(K<=2)return new me(oe,ce);Fe=Math.sqrt(K/2)}else{let E=!1;Ne>Number.EPSILON?ze>Number.EPSILON&&(E=!0):Ne<-Number.EPSILON?ze<-Number.EPSILON&&(E=!0):Math.sign(ke)===Math.sign(C)&&(E=!0),E?(oe=-ke,ce=Ne,Fe=Math.sqrt(it)):(oe=Ne,ce=ke,Fe=Math.sqrt(it/2))}return new me(oe/Fe,ce/Fe)}const X=[];for(let $=0,ne=O.length,re=ne-1,oe=$+1;$<ne;$++,re++,oe++)re===ne&&(re=0),oe===ne&&(oe=0),X[$]=se(O[$],O[re],O[oe]);const j=[];let te,Ae=X.concat();for(let $=0,ne=U;$<ne;$++){const re=N[$];te=[];for(let oe=0,ce=re.length,Fe=ce-1,Ne=oe+1;oe<ce;oe++,Fe++,Ne++)Fe===ce&&(Fe=0),Ne===ce&&(Ne=0),te[oe]=se(re[oe],re[Fe],re[Ne]);j.push(te),Ae=Ae.concat(te)}let Ee;if(m===0)Ee=Mi.triangulateShape(O,N);else{const $=[],ne=[];for(let re=0;re<m;re++){const oe=re/m,ce=f*Math.cos(oe*Math.PI/2),Fe=g*Math.sin(oe*Math.PI/2)+v;for(let Ne=0,ke=O.length;Ne<ke;Ne++){const ze=J(O[Ne],X[Ne],Fe);he(ze.x,ze.y,-ce),oe===0&&$.push(ze)}for(let Ne=0,ke=U;Ne<ke;Ne++){const ze=N[Ne];te=j[Ne];const C=[];for(let it=0,Ke=ze.length;it<Ke;it++){const E=J(ze[it],te[it],Fe);he(E.x,E.y,-ce),oe===0&&C.push(E)}oe===0&&ne.push(C)}}Ee=Mi.triangulateShape($,ne)}const et=Ee.length,We=g+v;for(let $=0;$<H;$++){const ne=u?J(P[$],Ae[$],We):P[$];S?(R.copy(T.normals[0]).multiplyScalar(ne.x),w.copy(T.binormals[0]).multiplyScalar(ne.y),x.copy(A[0]).add(R).add(w),he(x.x,x.y,x.z)):he(ne.x,ne.y,0)}for(let $=1;$<=h;$++)for(let ne=0;ne<H;ne++){const re=u?J(P[ne],Ae[ne],We):P[ne];S?(R.copy(T.normals[$]).multiplyScalar(re.x),w.copy(T.binormals[$]).multiplyScalar(re.y),x.copy(A[$]).add(R).add(w),he(x.x,x.y,x.z)):he(re.x,re.y,d/h*$)}for(let $=m-1;$>=0;$--){const ne=$/m,re=f*Math.cos(ne*Math.PI/2),oe=g*Math.sin(ne*Math.PI/2)+v;for(let ce=0,Fe=O.length;ce<Fe;ce++){const Ne=J(O[ce],X[ce],oe);he(Ne.x,Ne.y,d+re)}for(let ce=0,Fe=N.length;ce<Fe;ce++){const Ne=N[ce];te=j[ce];for(let ke=0,ze=Ne.length;ke<ze;ke++){const C=J(Ne[ke],te[ke],oe);S?he(C.x,C.y+A[h-1].y,A[h-1].x+re):he(C.x,C.y,d+re)}}}Ze(),q();function Ze(){const $=s.length/3;if(u){let ne=0,re=H*ne;for(let oe=0;oe<et;oe++){const ce=Ee[oe];Ue(ce[2]+re,ce[1]+re,ce[0]+re)}ne=h+m*2,re=H*ne;for(let oe=0;oe<et;oe++){const ce=Ee[oe];Ue(ce[0]+re,ce[1]+re,ce[2]+re)}}else{for(let ne=0;ne<et;ne++){const re=Ee[ne];Ue(re[2],re[1],re[0])}for(let ne=0;ne<et;ne++){const re=Ee[ne];Ue(re[0]+H*h,re[1]+H*h,re[2]+H*h)}}n.addGroup($,s.length/3-$,0)}function q(){const $=s.length/3;let ne=0;Q(O,ne),ne+=O.length;for(let re=0,oe=N.length;re<oe;re++){const ce=N[re];Q(ce,ne),ne+=ce.length}n.addGroup($,s.length/3-$,1)}function Q($,ne){let re=$.length;for(;--re>=0;){const oe=re;let ce=re-1;ce<0&&(ce=$.length-1);for(let Fe=0,Ne=h+m*2;Fe<Ne;Fe++){const ke=H*Fe,ze=H*(Fe+1),C=ne+oe+ke,it=ne+ce+ke,Ke=ne+ce+ze,E=ne+oe+ze;Se(C,it,Ke,E)}}}function he($,ne,re){l.push($),l.push(ne),l.push(re)}function Ue($,ne,re){Re($),Re(ne),Re(re);const oe=s.length/3,ce=y.generateTopUV(n,s,oe-3,oe-2,oe-1);qe(ce[0]),qe(ce[1]),qe(ce[2])}function Se($,ne,re,oe){Re($),Re(ne),Re(oe),Re(ne),Re(re),Re(oe);const ce=s.length/3,Fe=y.generateSideWallUV(n,s,ce-6,ce-3,ce-2,ce-1);qe(Fe[0]),qe(Fe[1]),qe(Fe[3]),qe(Fe[1]),qe(Fe[2]),qe(Fe[3])}function Re($){s.push(l[$*3+0]),s.push(l[$*3+1]),s.push(l[$*3+2])}function qe($){r.push($.x),r.push($.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON(),t=this.parameters.shapes,n=this.parameters.options;return Dd(t,n,e)}static fromJSON(e,t){const n=[];for(let r=0,o=e.shapes.length;r<o;r++){const a=t[e.shapes[r]];n.push(a)}const s=e.options.extrudePath;return s!==void 0&&(e.options.extrudePath=new na[s.type]().fromJSON(s)),new _r(n,e.options)}}const Id={generateTopUV:function(i,e,t,n,s){const r=e[t*3],o=e[t*3+1],a=e[n*3],l=e[n*3+1],c=e[s*3],h=e[s*3+1];return[new me(r,o),new me(a,l),new me(c,h)]},generateSideWallUV:function(i,e,t,n,s,r){const o=e[t*3],a=e[t*3+1],l=e[t*3+2],c=e[n*3],h=e[n*3+1],d=e[n*3+2],u=e[s*3],f=e[s*3+1],g=e[s*3+2],v=e[r*3],m=e[r*3+1],p=e[r*3+2];return Math.abs(a-h)<Math.abs(o-c)?[new me(o,1-l),new me(c,1-d),new me(u,1-g),new me(v,1-p)]:[new me(a,1-l),new me(h,1-d),new me(f,1-g),new me(m,1-p)]}};function Dd(i,e,t){if(t.shapes=[],Array.isArray(i))for(let n=0,s=i.length;n<s;n++){const r=i[n];t.shapes.push(r.uuid)}else t.shapes.push(i.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}class ei extends wt{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};const r=e/2,o=t/2,a=Math.floor(n),l=Math.floor(s),c=a+1,h=l+1,d=e/a,u=t/l,f=[],g=[],v=[],m=[];for(let p=0;p<h;p++){const y=p*u-o;for(let A=0;A<c;A++){const S=A*d-r;g.push(S,-y,0),v.push(0,0,1),m.push(A/a),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let y=0;y<a;y++){const A=y+c*p,S=y+c*(p+1),T=y+1+c*(p+1),w=y+1+c*p;f.push(A,S,w),f.push(S,T,w)}this.setIndex(f),this.setAttribute("position",new dt(g,3)),this.setAttribute("normal",new dt(v,3)),this.setAttribute("uv",new dt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ei(e.width,e.height,e.widthSegments,e.heightSegments)}}class Pa extends wt{constructor(e=.5,t=1,n=32,s=1,r=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:s,thetaStart:r,thetaLength:o},n=Math.max(3,n),s=Math.max(1,s);const a=[],l=[],c=[],h=[];let d=e;const u=(t-e)/s,f=new D,g=new me;for(let v=0;v<=s;v++){for(let m=0;m<=n;m++){const p=r+m/n*o;f.x=d*Math.cos(p),f.y=d*Math.sin(p),l.push(f.x,f.y,f.z),c.push(0,0,1),g.x=(f.x/t+1)/2,g.y=(f.y/t+1)/2,h.push(g.x,g.y)}d+=u}for(let v=0;v<s;v++){const m=v*(n+1);for(let p=0;p<n;p++){const y=p+m,A=y,S=y+n+1,T=y+n+2,w=y+1;a.push(A,S,w),a.push(S,T,w)}}this.setIndex(a),this.setAttribute("position",new dt(l,3)),this.setAttribute("normal",new dt(c,3)),this.setAttribute("uv",new dt(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Pa(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}}class cs extends wt{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));const l=Math.min(o+a,Math.PI);let c=0;const h=[],d=new D,u=new D,f=[],g=[],v=[],m=[];for(let p=0;p<=n;p++){const y=[],A=p/n,S=o+A*a,T=e*Math.cos(S),w=Math.sqrt(e*e-T*T);let R=0;p===0&&o===0?R=.5/t:p===n&&l===Math.PI&&(R=-.5/t);for(let x=0;x<=t;x++){const b=x/t,P=s+b*r;d.x=-w*Math.cos(P),d.y=T,d.z=w*Math.sin(P),g.push(d.x,d.y,d.z),u.copy(d).normalize(),v.push(u.x,u.y,u.z),m.push(b+R,1-A),y.push(c++)}h.push(y)}for(let p=0;p<n;p++)for(let y=0;y<t;y++){const A=h[p][y+1],S=h[p][y],T=h[p+1][y],w=h[p+1][y+1];(p!==0||o>0)&&f.push(A,S,w),(p!==n-1||l<Math.PI)&&f.push(S,T,w)}this.setIndex(f),this.setAttribute("position",new dt(g,3)),this.setAttribute("normal",new dt(v,3)),this.setAttribute("uv",new dt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new cs(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}function Ai(i){const e={};for(const t in i){e[t]={};for(const n in i[t]){const s=i[t][n];if(Dl(s))s.isRenderTargetTexture?(Be("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone();else if(Array.isArray(s))if(Dl(s[0])){const r=[];for(let o=0,a=s.length;o<a;o++)r[o]=s[o].clone();e[t][n]=r}else e[t][n]=s.slice();else e[t][n]=s}}return e}function Pt(i){const e={};for(let t=0;t<i.length;t++){const n=Ai(i[t]);for(const s in n)e[s]=n[s]}return e}function Dl(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function Nd(i){const e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function uh(i){const e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Qe.workingColorSpace}const Ud={clone:Ai,merge:Pt};var Fd=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Od=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class hn extends Li{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Fd,this.fragmentShader=Od,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ai(e.uniforms),this.uniformsGroups=Nd(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const s in this.uniforms){const o=this.uniforms[s].value;o&&o.isTexture?t.uniforms[s]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[s]={type:"m4",value:o.toArray()}:t.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(const n in e.uniforms){const s=e.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=t[s.value]||null;break;case"c":this.uniforms[n].value=new Ve().setHex(s.value);break;case"v2":this.uniforms[n].value=new me().fromArray(s.value);break;case"v3":this.uniforms[n].value=new D().fromArray(s.value);break;case"v4":this.uniforms[n].value=new ft().fromArray(s.value);break;case"m3":this.uniforms[n].value=new Ge().fromArray(s.value);break;case"m4":this.uniforms[n].value=new nt().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(const n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}}class Bd extends hn{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class _n extends Li{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ve(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ve(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=ea,this.normalScale=new me(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new On,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class kd extends Li{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=pu,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class zd extends Li{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}class dh extends vt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ve(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}}class Gd extends dh{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(vt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ve(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){const t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}}const eo=new nt,Nl=new D,Ul=new D;class Hd{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new me(512,512),this.mapType=Bt,this.map=null,this.mapPass=null,this.matrix=new nt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new ba,this._frameExtents=new me(1,1),this._viewportCount=1,this._viewports=[new ft(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera;Nl.setFromMatrixPosition(e.matrixWorld),t.position.copy(Nl),Ul.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Ul),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,s){eo.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(eo,e.coordinateSystem,e.reversedDepth);const r=this._frameExtents,o=s?s.z/r.x:1,a=s?s.w/r.y:1,l=s?s.x/r.x:0,c=s?s.y/r.y:0;e.coordinateSystem===ss||e.reversedDepth?t.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+c,0,0,1,0,0,0,0,1):t.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+c,0,0,.5,.5,0,0,0,1),t.multiply(eo)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}const ks=new D,zs=new Ci,en=new D;class fh extends vt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new nt,this.projectionMatrix=new nt,this.projectionMatrixInverse=new nt,this.coordinateSystem=on,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(ks,zs,en),en.x===1&&en.y===1&&en.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ks,zs,en.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(ks,zs,en),en.x===1&&en.y===1&&en.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ks,zs,en.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}const Ln=new D,Fl=new me,Ol=new me;class qt extends fh{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=ta*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(tr*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return ta*2*Math.atan(Math.tan(tr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Ln.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Ln.x,Ln.y).multiplyScalar(-e/Ln.z),Ln.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Ln.x,Ln.y).multiplyScalar(-e/Ln.z)}getViewSize(e,t){return this.getViewBounds(e,Fl,Ol),t.subVectors(Ol,Fl)}setViewOffset(e,t,n,s,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(tr*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*s/l,t-=o.offsetY*n/c,s*=o.width/l,n*=o.height/c}const a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}class xr extends fh{constructor(e=-1,t=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=n-e,o=n+e,a=s+t,l=s-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class Vd extends Hd{constructor(){super(new xr(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Wd extends dh{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(vt.DEFAULT_UP),this.updateMatrix(),this.target=new vt,this.shadow=new Vd}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}}const pi=-90,mi=1;class Xd extends vt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new qt(pi,mi,e,t);s.layers=this.layers,this.add(s);const r=new qt(pi,mi,e,t);r.layers=this.layers,this.add(r);const o=new qt(pi,mi,e,t);o.layers=this.layers,this.add(o);const a=new qt(pi,mi,e,t);a.layers=this.layers,this.add(a);const l=new qt(pi,mi,e,t);l.layers=this.layers,this.add(l);const c=new qt(pi,mi,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,s,r,o,a,l]=t;for(const c of t)this.remove(c);if(e===on)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===ss)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,o,a,l,c,h]=this.children,d=e.getRenderTarget(),u=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const v=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let m=!1;e.isWebGLRenderer===!0?m=e.state.buffers.depth.getReversed():m=e.reversedDepthBuffer,e.setRenderTarget(n,0,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(n,1,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,2,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,3,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(n,4,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.generateMipmaps=v,e.setRenderTarget(n,5,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,h),e.setRenderTarget(d,u,f),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class Yd extends qt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}const Bl=new nt;class qd{constructor(e,t,n=0,s=1/0){this.ray=new wa(e,t),this.near=n,this.far=s,this.camera=null,this.layers=new Ea,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,t.projectionMatrix.elements[14]).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):je("Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return Bl.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Bl),this}intersectObject(e,t=!0,n=[]){return ra(e,this,n,t),n.sort(kl),n}intersectObjects(e,t=!0,n=[]){for(let s=0,r=e.length;s<r;s++)ra(e[s],this,n,t);return n.sort(kl),n}}function kl(i,e){return i.distance-e.distance}function ra(i,e,t,n){let s=!0;if(i.layers.test(e.layers)&&i.raycast(e,t)===!1&&(s=!1),s===!0&&n===!0){const r=i.children;for(let o=0,a=r.length;o<a;o++)ra(r[o],e,t,!0)}}const Ga=class Ga{constructor(e,t,n,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,s){const r=this.elements;return r[0]=e,r[2]=t,r[1]=n,r[3]=s,this}};Ga.prototype.isMatrix2=!0;let zl=Ga;function Gl(i,e,t,n){const s=Kd(n);switch(t){case qc:return i*e;case ga:return i*e/s.components*s.byteLength;case _a:return i*e/s.components*s.byteLength;case Jn:return i*e*2/s.components*s.byteLength;case xa:return i*e*2/s.components*s.byteLength;case Kc:return i*e*3/s.components*s.byteLength;case Jt:return i*e*4/s.components*s.byteLength;case va:return i*e*4/s.components*s.byteLength;case Zs:case Qs:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case js:case er:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case To:case Ao:return Math.max(i,16)*Math.max(e,8)/4;case wo:case bo:return Math.max(i,8)*Math.max(e,8)/2;case Ro:case Co:case Lo:case Io:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Po:case sr:case Do:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case No:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Uo:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case Fo:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case Oo:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case Bo:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case ko:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case zo:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case Go:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case Ho:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case Vo:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case Wo:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case Xo:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case Yo:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case qo:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case Ko:case Jo:case $o:return Math.ceil(i/4)*Math.ceil(e/4)*16;case Zo:case Qo:return Math.ceil(i/4)*Math.ceil(e/4)*8;case rr:case jo:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Kd(i){switch(i){case Bt:case Vc:return{byteLength:1,components:1};case ns:case Wc:case cn:return{byteLength:2,components:1};case pa:case ma:return{byteLength:2,components:4};case ln:case fa:case Kt:return{byteLength:4,components:1};case Xc:case Yc:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:ua}}));typeof window<"u"&&(window.__THREE__?Be("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=ua);/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function ph(){let i=null,e=!1,t=null,n=null;function s(r,o){n=i.requestAnimationFrame(s),t(r,o)}return{start:function(){e!==!0&&t!==null&&i!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function Jd(i){const e=new WeakMap;function t(a,l){const c=a.array,h=a.usage,d=c.byteLength,u=i.createBuffer();i.bindBuffer(l,u),i.bufferData(l,c,h),a.onUploadCallback();let f;if(c instanceof Float32Array)f=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=i.HALF_FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?f=i.HALF_FLOAT:f=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=i.SHORT;else if(c instanceof Uint32Array)f=i.UNSIGNED_INT;else if(c instanceof Int32Array)f=i.INT;else if(c instanceof Int8Array)f=i.BYTE;else if(c instanceof Uint8Array)f=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:u,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:d}}function n(a,l,c){const h=l.array,d=l.updateRanges;if(i.bindBuffer(c,a),d.length===0)i.bufferSubData(c,0,h);else{d.sort((f,g)=>f.start-g.start);let u=0;for(let f=1;f<d.length;f++){const g=d[u],v=d[f];v.start<=g.start+g.count+1?g.count=Math.max(g.count,v.start+v.count-g.start):(++u,d[u]=v)}d.length=u+1;for(let f=0,g=d.length;f<g;f++){const v=d[f];i.bufferSubData(c,v.start*h.BYTES_PER_ELEMENT,h,v.start,v.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);const l=e.get(a);l&&(i.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const h=e.get(a);(!h||h.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:s,remove:r,update:o}}var $d=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Zd=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Qd=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,jd=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,ef=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,tf=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,nf=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,sf=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,rf=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,of=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,af=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,lf=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,cf=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,hf=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,uf=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,df=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,ff=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,pf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,mf=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,gf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,_f=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,xf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,vf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,Mf=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Sf=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,yf=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,Ef=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,wf=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Tf=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,bf=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Af="gl_FragColor = linearToOutputTexel( gl_FragColor );",Rf=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Cf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,Pf=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,Lf=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,If=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Df=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Nf=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Uf=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Ff=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Of=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Bf=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,kf=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,zf=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Gf=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Hf=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,Vf=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,Wf=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Xf=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Yf=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,qf=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Kf=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Jf=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,$f=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Zf=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Qf=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,jf=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,ep=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,tp=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,np=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,ip=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,sp=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,rp=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,op=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,ap=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,lp=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,cp=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,hp=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,up=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,dp=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,fp=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,pp=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,mp=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,gp=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,_p=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,xp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,vp=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,Mp=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Sp=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,yp=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Ep=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,wp=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Tp=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,bp=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,Ap=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Rp=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Cp=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Pp=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Lp=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Ip=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Dp=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,Np=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Up=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Fp=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Op=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Bp=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,kp=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,zp=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Gp=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Hp=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Vp=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Wp=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Xp=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Yp=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,qp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Kp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Jp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,$p=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Zp=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Qp=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,jp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,em=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,tm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,nm=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,im=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,sm=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,rm=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,om=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,am=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,lm=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cm=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,hm=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,um=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,dm=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,fm=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,pm=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,mm=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,gm=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,_m=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,xm=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,vm=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Mm=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Sm=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,ym=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Em=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,wm=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Tm=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,bm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Am=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Rm=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Cm=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Pm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Ye={alphahash_fragment:$d,alphahash_pars_fragment:Zd,alphamap_fragment:Qd,alphamap_pars_fragment:jd,alphatest_fragment:ef,alphatest_pars_fragment:tf,aomap_fragment:nf,aomap_pars_fragment:sf,batching_pars_vertex:rf,batching_vertex:of,begin_vertex:af,beginnormal_vertex:lf,bsdfs:cf,iridescence_fragment:hf,bumpmap_pars_fragment:uf,clipping_planes_fragment:df,clipping_planes_pars_fragment:ff,clipping_planes_pars_vertex:pf,clipping_planes_vertex:mf,color_fragment:gf,color_pars_fragment:_f,color_pars_vertex:xf,color_vertex:vf,common:Mf,cube_uv_reflection_fragment:Sf,defaultnormal_vertex:yf,displacementmap_pars_vertex:Ef,displacementmap_vertex:wf,emissivemap_fragment:Tf,emissivemap_pars_fragment:bf,colorspace_fragment:Af,colorspace_pars_fragment:Rf,envmap_fragment:Cf,envmap_common_pars_fragment:Pf,envmap_pars_fragment:Lf,envmap_pars_vertex:If,envmap_physical_pars_fragment:Vf,envmap_vertex:Df,fog_vertex:Nf,fog_pars_vertex:Uf,fog_fragment:Ff,fog_pars_fragment:Of,gradientmap_pars_fragment:Bf,lightmap_pars_fragment:kf,lights_lambert_fragment:zf,lights_lambert_pars_fragment:Gf,lights_pars_begin:Hf,lights_toon_fragment:Wf,lights_toon_pars_fragment:Xf,lights_phong_fragment:Yf,lights_phong_pars_fragment:qf,lights_physical_fragment:Kf,lights_physical_pars_fragment:Jf,lights_fragment_begin:$f,lights_fragment_maps:Zf,lights_fragment_end:Qf,lightprobes_pars_fragment:jf,logdepthbuf_fragment:ep,logdepthbuf_pars_fragment:tp,logdepthbuf_pars_vertex:np,logdepthbuf_vertex:ip,map_fragment:sp,map_pars_fragment:rp,map_particle_fragment:op,map_particle_pars_fragment:ap,metalnessmap_fragment:lp,metalnessmap_pars_fragment:cp,morphinstance_vertex:hp,morphcolor_vertex:up,morphnormal_vertex:dp,morphtarget_pars_vertex:fp,morphtarget_vertex:pp,normal_fragment_begin:mp,normal_fragment_maps:gp,normal_pars_fragment:_p,normal_pars_vertex:xp,normal_vertex:vp,normalmap_pars_fragment:Mp,clearcoat_normal_fragment_begin:Sp,clearcoat_normal_fragment_maps:yp,clearcoat_pars_fragment:Ep,iridescence_pars_fragment:wp,opaque_fragment:Tp,packing:bp,premultiplied_alpha_fragment:Ap,project_vertex:Rp,dithering_fragment:Cp,dithering_pars_fragment:Pp,roughnessmap_fragment:Lp,roughnessmap_pars_fragment:Ip,shadowmap_pars_fragment:Dp,shadowmap_pars_vertex:Np,shadowmap_vertex:Up,shadowmask_pars_fragment:Fp,skinbase_vertex:Op,skinning_pars_vertex:Bp,skinning_vertex:kp,skinnormal_vertex:zp,specularmap_fragment:Gp,specularmap_pars_fragment:Hp,tonemapping_fragment:Vp,tonemapping_pars_fragment:Wp,transmission_fragment:Xp,transmission_pars_fragment:Yp,uv_pars_fragment:qp,uv_pars_vertex:Kp,uv_vertex:Jp,worldpos_vertex:$p,background_vert:Zp,background_frag:Qp,backgroundCube_vert:jp,backgroundCube_frag:em,cube_vert:tm,cube_frag:nm,depth_vert:im,depth_frag:sm,distance_vert:rm,distance_frag:om,equirect_vert:am,equirect_frag:lm,linedashed_vert:cm,linedashed_frag:hm,meshbasic_vert:um,meshbasic_frag:dm,meshlambert_vert:fm,meshlambert_frag:pm,meshmatcap_vert:mm,meshmatcap_frag:gm,meshnormal_vert:_m,meshnormal_frag:xm,meshphong_vert:vm,meshphong_frag:Mm,meshphysical_vert:Sm,meshphysical_frag:ym,meshtoon_vert:Em,meshtoon_frag:wm,points_vert:Tm,points_frag:bm,shadow_vert:Am,shadow_frag:Rm,sprite_vert:Cm,sprite_frag:Pm},_e={common:{diffuse:{value:new Ve(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ge},alphaMap:{value:null},alphaMapTransform:{value:new Ge},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ge}},envmap:{envMap:{value:null},envMapRotation:{value:new Ge},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ge}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ge}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ge},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ge},normalScale:{value:new me(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ge},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ge}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ge}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ge}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ve(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new D},probesMax:{value:new D},probesResolution:{value:new D}},points:{diffuse:{value:new Ve(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ge},alphaTest:{value:0},uvTransform:{value:new Ge}},sprite:{diffuse:{value:new Ve(16777215)},opacity:{value:1},center:{value:new me(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ge},alphaMap:{value:null},alphaMapTransform:{value:new Ge},alphaTest:{value:0}}},nn={basic:{uniforms:Pt([_e.common,_e.specularmap,_e.envmap,_e.aomap,_e.lightmap,_e.fog]),vertexShader:Ye.meshbasic_vert,fragmentShader:Ye.meshbasic_frag},lambert:{uniforms:Pt([_e.common,_e.specularmap,_e.envmap,_e.aomap,_e.lightmap,_e.emissivemap,_e.bumpmap,_e.normalmap,_e.displacementmap,_e.fog,_e.lights,{emissive:{value:new Ve(0)},envMapIntensity:{value:1}}]),vertexShader:Ye.meshlambert_vert,fragmentShader:Ye.meshlambert_frag},phong:{uniforms:Pt([_e.common,_e.specularmap,_e.envmap,_e.aomap,_e.lightmap,_e.emissivemap,_e.bumpmap,_e.normalmap,_e.displacementmap,_e.fog,_e.lights,{emissive:{value:new Ve(0)},specular:{value:new Ve(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Ye.meshphong_vert,fragmentShader:Ye.meshphong_frag},standard:{uniforms:Pt([_e.common,_e.envmap,_e.aomap,_e.lightmap,_e.emissivemap,_e.bumpmap,_e.normalmap,_e.displacementmap,_e.roughnessmap,_e.metalnessmap,_e.fog,_e.lights,{emissive:{value:new Ve(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ye.meshphysical_vert,fragmentShader:Ye.meshphysical_frag},toon:{uniforms:Pt([_e.common,_e.aomap,_e.lightmap,_e.emissivemap,_e.bumpmap,_e.normalmap,_e.displacementmap,_e.gradientmap,_e.fog,_e.lights,{emissive:{value:new Ve(0)}}]),vertexShader:Ye.meshtoon_vert,fragmentShader:Ye.meshtoon_frag},matcap:{uniforms:Pt([_e.common,_e.bumpmap,_e.normalmap,_e.displacementmap,_e.fog,{matcap:{value:null}}]),vertexShader:Ye.meshmatcap_vert,fragmentShader:Ye.meshmatcap_frag},points:{uniforms:Pt([_e.points,_e.fog]),vertexShader:Ye.points_vert,fragmentShader:Ye.points_frag},dashed:{uniforms:Pt([_e.common,_e.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ye.linedashed_vert,fragmentShader:Ye.linedashed_frag},depth:{uniforms:Pt([_e.common,_e.displacementmap]),vertexShader:Ye.depth_vert,fragmentShader:Ye.depth_frag},normal:{uniforms:Pt([_e.common,_e.bumpmap,_e.normalmap,_e.displacementmap,{opacity:{value:1}}]),vertexShader:Ye.meshnormal_vert,fragmentShader:Ye.meshnormal_frag},sprite:{uniforms:Pt([_e.sprite,_e.fog]),vertexShader:Ye.sprite_vert,fragmentShader:Ye.sprite_frag},background:{uniforms:{uvTransform:{value:new Ge},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ye.background_vert,fragmentShader:Ye.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ge}},vertexShader:Ye.backgroundCube_vert,fragmentShader:Ye.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ye.cube_vert,fragmentShader:Ye.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ye.equirect_vert,fragmentShader:Ye.equirect_frag},distance:{uniforms:Pt([_e.common,_e.displacementmap,{referencePosition:{value:new D},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ye.distance_vert,fragmentShader:Ye.distance_frag},shadow:{uniforms:Pt([_e.lights,_e.fog,{color:{value:new Ve(0)},opacity:{value:1}}]),vertexShader:Ye.shadow_vert,fragmentShader:Ye.shadow_frag}};nn.physical={uniforms:Pt([nn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ge},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ge},clearcoatNormalScale:{value:new me(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ge},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ge},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ge},sheen:{value:0},sheenColor:{value:new Ve(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ge},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ge},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ge},transmissionSamplerSize:{value:new me},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ge},attenuationDistance:{value:0},attenuationColor:{value:new Ve(0)},specularColor:{value:new Ve(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ge},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ge},anisotropyVector:{value:new me},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ge}}]),vertexShader:Ye.meshphysical_vert,fragmentShader:Ye.meshphysical_frag};const Gs={r:0,b:0,g:0},Lm=new nt,mh=new Ge;mh.set(-1,0,0,0,1,0,0,0,1);function Im(i,e,t,n,s,r){const o=new Ve(0);let a=s===!0?0:1,l,c,h=null,d=0,u=null;function f(y){let A=y.isScene===!0?y.background:null;if(A&&A.isTexture){const S=y.backgroundBlurriness>0;A=e.get(A,S)}return A}function g(y){let A=!1;const S=f(y);S===null?m(o,a):S&&S.isColor&&(m(S,1),A=!0);const T=i.xr.getEnvironmentBlendMode();T==="additive"?t.buffers.color.setClear(0,0,0,1,r):T==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(i.autoClear||A)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function v(y,A){const S=f(A);S&&(S.isCubeTexture||S.mapping===gr)?(c===void 0&&(c=new gt(new Di(1,1,1),new hn({name:"BackgroundCubeMaterial",uniforms:Ai(nn.backgroundCube.uniforms),vertexShader:nn.backgroundCube.vertexShader,fragmentShader:nn.backgroundCube.fragmentShader,side:Nt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(T,w,R){this.matrixWorld.copyPosition(R.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=S,c.material.uniforms.backgroundBlurriness.value=A.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(Lm.makeRotationFromEuler(A.backgroundRotation)).transpose(),S.isCubeTexture&&S.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(mh),c.material.toneMapped=Qe.getTransfer(S.colorSpace)!==ot,(h!==S||d!==S.version||u!==i.toneMapping)&&(c.material.needsUpdate=!0,h=S,d=S.version,u=i.toneMapping),c.layers.enableAll(),y.unshift(c,c.geometry,c.material,0,0,null)):S&&S.isTexture&&(l===void 0&&(l=new gt(new ei(2,2),new hn({name:"BackgroundMaterial",uniforms:Ai(nn.background.uniforms),vertexShader:nn.background.vertexShader,fragmentShader:nn.background.fragmentShader,side:qn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=S,l.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,l.material.toneMapped=Qe.getTransfer(S.colorSpace)!==ot,S.matrixAutoUpdate===!0&&S.updateMatrix(),l.material.uniforms.uvTransform.value.copy(S.matrix),(h!==S||d!==S.version||u!==i.toneMapping)&&(l.material.needsUpdate=!0,h=S,d=S.version,u=i.toneMapping),l.layers.enableAll(),y.unshift(l,l.geometry,l.material,0,0,null))}function m(y,A){y.getRGB(Gs,uh(i)),t.buffers.color.setClear(Gs.r,Gs.g,Gs.b,A,r)}function p(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return o},setClearColor:function(y,A=1){o.set(y),a=A,m(o,a)},getClearAlpha:function(){return a},setClearAlpha:function(y){a=y,m(o,a)},render:g,addToRenderList:v,dispose:p}}function Dm(i,e){const t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=u(null);let r=s,o=!1;function a(N,z,V,U,O){let J=!1;const H=d(N,U,V,z);r!==H&&(r=H,c(r.object)),J=f(N,U,V,O),J&&g(N,U,V,O),O!==null&&e.update(O,i.ELEMENT_ARRAY_BUFFER),(J||o)&&(o=!1,S(N,z,V,U),O!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(O).buffer))}function l(){return i.createVertexArray()}function c(N){return i.bindVertexArray(N)}function h(N){return i.deleteVertexArray(N)}function d(N,z,V,U){const O=U.wireframe===!0;let J=n[z.id];J===void 0&&(J={},n[z.id]=J);const H=N.isInstancedMesh===!0?N.id:0;let se=J[H];se===void 0&&(se={},J[H]=se);let X=se[V.id];X===void 0&&(X={},se[V.id]=X);let j=X[O];return j===void 0&&(j=u(l()),X[O]=j),j}function u(N){const z=[],V=[],U=[];for(let O=0;O<t;O++)z[O]=0,V[O]=0,U[O]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:z,enabledAttributes:V,attributeDivisors:U,object:N,attributes:{},index:null}}function f(N,z,V,U){const O=r.attributes,J=z.attributes;let H=0;const se=V.getAttributes();for(const X in se)if(se[X].location>=0){const te=O[X];let Ae=J[X];if(Ae===void 0&&(X==="instanceMatrix"&&N.instanceMatrix&&(Ae=N.instanceMatrix),X==="instanceColor"&&N.instanceColor&&(Ae=N.instanceColor)),te===void 0||te.attribute!==Ae||Ae&&te.data!==Ae.data)return!0;H++}return r.attributesNum!==H||r.index!==U}function g(N,z,V,U){const O={},J=z.attributes;let H=0;const se=V.getAttributes();for(const X in se)if(se[X].location>=0){let te=J[X];te===void 0&&(X==="instanceMatrix"&&N.instanceMatrix&&(te=N.instanceMatrix),X==="instanceColor"&&N.instanceColor&&(te=N.instanceColor));const Ae={};Ae.attribute=te,te&&te.data&&(Ae.data=te.data),O[X]=Ae,H++}r.attributes=O,r.attributesNum=H,r.index=U}function v(){const N=r.newAttributes;for(let z=0,V=N.length;z<V;z++)N[z]=0}function m(N){p(N,0)}function p(N,z){const V=r.newAttributes,U=r.enabledAttributes,O=r.attributeDivisors;V[N]=1,U[N]===0&&(i.enableVertexAttribArray(N),U[N]=1),O[N]!==z&&(i.vertexAttribDivisor(N,z),O[N]=z)}function y(){const N=r.newAttributes,z=r.enabledAttributes;for(let V=0,U=z.length;V<U;V++)z[V]!==N[V]&&(i.disableVertexAttribArray(V),z[V]=0)}function A(N,z,V,U,O,J,H){H===!0?i.vertexAttribIPointer(N,z,V,O,J):i.vertexAttribPointer(N,z,V,U,O,J)}function S(N,z,V,U){v();const O=U.attributes,J=V.getAttributes(),H=z.defaultAttributeValues;for(const se in J){const X=J[se];if(X.location>=0){let j=O[se];if(j===void 0&&(se==="instanceMatrix"&&N.instanceMatrix&&(j=N.instanceMatrix),se==="instanceColor"&&N.instanceColor&&(j=N.instanceColor)),j!==void 0){const te=j.normalized,Ae=j.itemSize,Ee=e.get(j);if(Ee===void 0)continue;const et=Ee.buffer,We=Ee.type,Ze=Ee.bytesPerElement,q=We===i.INT||We===i.UNSIGNED_INT||j.gpuType===fa;if(j.isInterleavedBufferAttribute){const Q=j.data,he=Q.stride,Ue=j.offset;if(Q.isInstancedInterleavedBuffer){for(let Se=0;Se<X.locationSize;Se++)p(X.location+Se,Q.meshPerAttribute);N.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=Q.meshPerAttribute*Q.count)}else for(let Se=0;Se<X.locationSize;Se++)m(X.location+Se);i.bindBuffer(i.ARRAY_BUFFER,et);for(let Se=0;Se<X.locationSize;Se++)A(X.location+Se,Ae/X.locationSize,We,te,he*Ze,(Ue+Ae/X.locationSize*Se)*Ze,q)}else{if(j.isInstancedBufferAttribute){for(let Q=0;Q<X.locationSize;Q++)p(X.location+Q,j.meshPerAttribute);N.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=j.meshPerAttribute*j.count)}else for(let Q=0;Q<X.locationSize;Q++)m(X.location+Q);i.bindBuffer(i.ARRAY_BUFFER,et);for(let Q=0;Q<X.locationSize;Q++)A(X.location+Q,Ae/X.locationSize,We,te,Ae*Ze,Ae/X.locationSize*Q*Ze,q)}}else if(H!==void 0){const te=H[se];if(te!==void 0)switch(te.length){case 2:i.vertexAttrib2fv(X.location,te);break;case 3:i.vertexAttrib3fv(X.location,te);break;case 4:i.vertexAttrib4fv(X.location,te);break;default:i.vertexAttrib1fv(X.location,te)}}}}y()}function T(){b();for(const N in n){const z=n[N];for(const V in z){const U=z[V];for(const O in U){const J=U[O];for(const H in J)h(J[H].object),delete J[H];delete U[O]}}delete n[N]}}function w(N){if(n[N.id]===void 0)return;const z=n[N.id];for(const V in z){const U=z[V];for(const O in U){const J=U[O];for(const H in J)h(J[H].object),delete J[H];delete U[O]}}delete n[N.id]}function R(N){for(const z in n){const V=n[z];for(const U in V){const O=V[U];if(O[N.id]===void 0)continue;const J=O[N.id];for(const H in J)h(J[H].object),delete J[H];delete O[N.id]}}}function x(N){for(const z in n){const V=n[z],U=N.isInstancedMesh===!0?N.id:0,O=V[U];if(O!==void 0){for(const J in O){const H=O[J];for(const se in H)h(H[se].object),delete H[se];delete O[J]}delete V[U],Object.keys(V).length===0&&delete n[z]}}}function b(){P(),o=!0,r!==s&&(r=s,c(r.object))}function P(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:b,resetDefaultState:P,dispose:T,releaseStatesOfGeometry:w,releaseStatesOfObject:x,releaseStatesOfProgram:R,initAttributes:v,enableAttribute:m,disableUnusedAttributes:y}}function Nm(i,e,t){let n;function s(l){n=l}function r(l,c){i.drawArrays(n,l,c),t.update(c,n,1)}function o(l,c,h){h!==0&&(i.drawArraysInstanced(n,l,c,h),t.update(c,n,h))}function a(l,c,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,h);let u=0;for(let f=0;f<h;f++)u+=c[f];t.update(u,n,1)}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a}function Um(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){const R=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(R.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(R){return!(R!==Jt&&n.convert(R)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(R){const x=R===cn&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(R!==Bt&&R!==Kt&&!x&&n.convert(R)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function l(R){if(R==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";R="mediump"}return R==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const h=l(c);h!==c&&(Be("WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);const d=t.logarithmicDepthBuffer===!0,u=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&u===!1&&Be("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");const f=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),p=i.getParameter(i.MAX_VERTEX_ATTRIBS),y=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),A=i.getParameter(i.MAX_VARYING_VECTORS),S=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),T=i.getParameter(i.MAX_SAMPLES),w=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:d,reversedDepthBuffer:u,maxTextures:f,maxVertexTextures:g,maxTextureSize:v,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:y,maxVaryings:A,maxFragmentUniforms:S,maxSamples:T,samples:w}}function Fm(i){const e=this;let t=null,n=0,s=!1,r=!1;const o=new xn,a=new Ge,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(d,u){const f=d.length!==0||u||n!==0||s;return s=u,n=d.length,f},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(d,u){t=h(d,u,0)},this.setState=function(d,u,f){const g=d.clippingPlanes,v=d.clipIntersection,m=d.clipShadows,p=i.get(d);if(!s||g===null||g.length===0||r&&!m)r?h(null):c();else{const y=r?0:n,A=y*4;let S=p.clippingState||null;l.value=S,S=h(g,u,A,f);for(let T=0;T!==A;++T)S[T]=t[T];p.clippingState=S,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=y}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(d,u,f,g){const v=d!==null?d.length:0;let m=null;if(v!==0){if(m=l.value,g!==!0||m===null){const p=f+v*4,y=u.matrixWorldInverse;a.getNormalMatrix(y),(m===null||m.length<p)&&(m=new Float32Array(p));for(let A=0,S=f;A!==v;++A,S+=4)o.copy(d[A]).applyMatrix4(y,a),o.normal.toArray(m,S),m[S+3]=o.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=v,e.numIntersection=0,m}}const Si=4,Om=6,Bm=20,km=256,Vi=new xr,Hl=new Ve;let to=null,no=0,io=0,so=!1;const zm=new D,Vn=new D;class Vl{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,s=100,r={}){const{size:o=256,position:a=zm}=r;to=this._renderer.getRenderTarget(),no=this._renderer.getActiveCubeFace(),io=this._renderer.getActiveMipmapLevel(),so=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);const l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,n,s,l,a),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Yl(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Xl(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(to,no,io),this._renderer.xr.enabled=so,e.scissorTest=!1,gi(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Kn||e.mapping===Ti?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),to=this._renderer.getRenderTarget(),no=this._renderer.getActiveCubeFace(),io=this._renderer.getActiveMipmapLevel(),so=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Et,minFilter:Et,generateMipmaps:!1,type:cn,format:Jt,colorSpace:or,depthBuffer:!1},s=Wl(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Wl(e,t,n);const{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=Gm(r)),this._blurMaterial=Vm(r,e,t),this._ggxMaterial=Hm(r,e,t)}return s}_compileMaterial(e){const t=new gt(new wt,e);this._renderer.compile(t,Vi)}_sceneToCubeUV(e,t,n,s,r){const l=new qt(90,1,t,n),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],d=this._renderer,u=d.autoClear,f=d.toneMapping;d.getClearColor(Hl),d.toneMapping=an,d.autoClear=!1,d.state.buffers.depth.getReversed()&&(d.setRenderTarget(s),d.clearDepth(),d.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new gt(new Di,new Ii({name:"PMREM.Background",side:Nt,depthWrite:!1,depthTest:!1})));const v=this._backgroundBox,m=v.material;let p=!1;const y=e.background;y?y.isColor&&(m.color.copy(y),e.background=null,p=!0):(m.color.copy(Hl),p=!0);for(let A=0;A<6;A++){const S=A%3;S===0?(l.up.set(0,c[A],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+h[A],r.y,r.z)):S===1?(l.up.set(0,0,c[A]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+h[A],r.z)):(l.up.set(0,c[A],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+h[A]));const T=this._cubeSize;gi(s,S*T,A>2?T:0,T,T),d.setRenderTarget(s),p&&d.render(v,l),d.render(e,l)}d.toneMapping=f,d.autoClear=u,e.background=y}_textureToCubeUV(e,t){const n=this._renderer,s=e.mapping===Kn||e.mapping===Ti;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Yl()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Xl());const r=s?this._cubemapMaterial:this._equirectMaterial,o=this._lodMeshes[0];o.material=r;const a=r.uniforms;a.envMap.value=e;const l=this._cubeSize;gi(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(o,Vi)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=n}_applyGGXFilter(e,t,n){const s=this._renderer,r=this._pingPongRenderTarget,o=this._ggxMaterial,a=this._lodMeshes[n];a.material=o;const l=o.uniforms,c=n/(this._lodMeshes.length-1),h=t/(this._lodMeshes.length-1),d=Math.sqrt(c*c-h*h),u=c*1.25,f=d*u,{_lodMax:g}=this,v=this._sizeLods[n],m=3*v*(n>g-Si?n-g+Si:0),p=4*(this._cubeSize-v);l.envMap.value=e.texture,l.roughness.value=f,l.mipInt.value=g-t,gi(r,m,p,3*v,2*v),s.setRenderTarget(r),s.render(a,Vi),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=g-n,gi(e,m,p,3*v,2*v),s.setRenderTarget(e),s.render(a,Vi)}_blur(e,t,n,s){const r=this._pingPongRenderTarget,o=Math.min(s,Math.PI)/Math.SQRT2;this._blurPass(e,r,t,n,o),this._blurPass(r,e,n,n,o)}_blurPass(e,t,n,s,r){const o=this._renderer,a=this._blurMaterial,l=this._lodMeshes[s];l.material=a;const c=a.uniforms;c.envMap.value=e.texture,c.sigma.value=r,c.mipInt.value=this._lodMax-n;const h=this._sizeLods[s],d=3*h*(s>this._lodMax-Si?s-this._lodMax+Si:0),u=4*(this._cubeSize-h);gi(t,d,u,3*h,2*h),o.setRenderTarget(t),o.render(l,Vi)}}function Gm(i){const e=[],t=[];let n=i;const s=i-Si+1+Om;for(let r=0;r<s;r++){const o=Math.pow(2,n);e.push(o);const a=1/(o-2),l=-a,c=1+a,h=[l,l,c,l,c,c,l,l,c,c,l,c],d=6,u=6,f=3,g=new Float32Array(f*u*d),v=new Float32Array(f*u*d);for(let p=0;p<d;p++){const y=p%3*2/3-1,A=p>2?0:-1,S=[y,A,0,y+2/3,A,0,y+2/3,A+1,0,y,A,0,y+2/3,A+1,0,y,A+1,0];g.set(S,f*u*p);for(let T=0;T<u;T++){const w=h[T*2]*2-1,R=h[T*2+1]*2-1;p===0?Vn.set(1,R,w):p===1?Vn.set(-w,1,-R):p===2?Vn.set(-w,R,1):p===3?Vn.set(-1,R,-w):p===4?Vn.set(-w,-1,R):Vn.set(w,R,-1),Vn.toArray(v,(p*u+T)*f)}}const m=new wt;m.setAttribute("position",new Dt(g,f)),m.setAttribute("outputDirection",new Dt(v,f)),t.push(new gt(m,null)),n>Si&&n--}return{lodMeshes:t,sizeLods:e}}function Wl(i,e,t){const n=new Zt(i,e,t);return n.texture.mapping=gr,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function gi(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function Hm(i,e,t){return new hn({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:km,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:vr(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:Sn,depthTest:!1,depthWrite:!1})}function Vm(i,e,t){return new hn({name:"SphericalGaussianBlur",defines:{SAMPLES:Bm,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:vr(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:Sn,depthTest:!1,depthWrite:!1})}function Xl(){return new hn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:vr(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Sn,depthTest:!1,depthWrite:!1})}function Yl(){return new hn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:vr(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Sn,depthTest:!1,depthWrite:!1})}function vr(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}class gh extends Zt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new th(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new Di(5,5,5),r=new hn({name:"CubemapFromEquirect",uniforms:Ai(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Nt,blending:Sn});r.uniforms.tEquirect.value=t;const o=new gt(s,r),a=t.minFilter;return t.minFilter===Wn&&(t.minFilter=Et),new Xd(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){const r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,s);e.setRenderTarget(r)}}function Wm(i){let e=new WeakMap,t=new WeakMap,n=null;function s(u,f=!1){return u==null?null:f?o(u):r(u)}function r(u){if(u&&u.isTexture){const f=u.mapping;if(f===wr||f===Tr)if(e.has(u)){const g=e.get(u).texture;return a(g,u.mapping)}else{const g=u.image;if(g&&g.height>0){const v=new gh(g.height);return v.fromEquirectangularTexture(i,u),e.set(u,v),u.addEventListener("dispose",c),a(v.texture,u.mapping)}else return null}}return u}function o(u){if(u&&u.isTexture){const f=u.mapping,g=f===wr||f===Tr,v=f===Kn||f===Ti;if(g||v){let m=t.get(u);const p=m!==void 0?m.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==p)return n===null&&(n=new Vl(i)),m=g?n.fromEquirectangular(u,m):n.fromCubemap(u,m),m.texture.pmremVersion=u.pmremVersion,t.set(u,m),m.texture;if(m!==void 0)return m.texture;{const y=u.image;return g&&y&&y.height>0||v&&y&&l(y)?(n===null&&(n=new Vl(i)),m=g?n.fromEquirectangular(u):n.fromCubemap(u),m.texture.pmremVersion=u.pmremVersion,t.set(u,m),u.addEventListener("dispose",h),m.texture):null}}}return u}function a(u,f){return f===wr?u.mapping=Kn:f===Tr&&(u.mapping=Ti),u}function l(u){let f=0;const g=6;for(let v=0;v<g;v++)u[v]!==void 0&&f++;return f===g}function c(u){const f=u.target;f.removeEventListener("dispose",c);const g=e.get(f);g!==void 0&&(e.delete(f),g.dispose())}function h(u){const f=u.target;f.removeEventListener("dispose",h);const g=t.get(f);g!==void 0&&(t.delete(f),g.dispose())}function d(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:d}}function Xm(i){const e={};function t(n){if(e[n]!==void 0)return e[n];const s=i.getExtension(n);return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const s=t(n);return s===null&&Ei("WebGLRenderer: "+n+" extension not supported."),s}}}function Ym(i,e,t,n){const s={},r=new WeakMap;function o(d){const u=d.target;u.index!==null&&e.remove(u.index);for(const g in u.attributes)e.remove(u.attributes[g]);u.removeEventListener("dispose",o),delete s[u.id];const f=r.get(u);f&&(e.remove(f),r.delete(u)),n.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,t.memory.geometries--}function a(d,u){return s[u.id]===!0||(u.addEventListener("dispose",o),s[u.id]=!0,t.memory.geometries++),u}function l(d){const u=d.attributes;for(const f in u)e.update(u[f],i.ARRAY_BUFFER)}function c(d){const u=[],f=d.index,g=d.attributes.position;let v=0;if(g===void 0)return;if(f!==null){const y=f.array;v=f.version;for(let A=0,S=y.length;A<S;A+=3){const T=y[A+0],w=y[A+1],R=y[A+2];u.push(T,w,w,R,R,T)}}else{const y=g.array;v=g.version;for(let A=0,S=y.length/3-1;A<S;A+=3){const T=A+0,w=A+1,R=A+2;u.push(T,w,w,R,R,T)}}const m=new(g.count>=65535?jc:Qc)(u,1);m.version=v;const p=r.get(d);p&&e.remove(p),r.set(d,m)}function h(d){const u=r.get(d);if(u){const f=d.index;f!==null&&u.version<f.version&&c(d)}else c(d);return r.get(d)}return{get:a,update:l,getWireframeAttribute:h}}function qm(i,e,t){let n;function s(d){n=d}let r,o;function a(d){r=d.type,o=d.bytesPerElement}function l(d,u){i.drawElements(n,u,r,d*o),t.update(u,n,1)}function c(d,u,f){f!==0&&(i.drawElementsInstanced(n,u,r,d*o,f),t.update(u,n,f))}function h(d,u,f){if(f===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,u,0,r,d,0,f);let v=0;for(let m=0;m<f;m++)v+=u[m];t.update(v,n,1)}this.setMode=s,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=h}function Km(i){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(t.calls++,o){case i.TRIANGLES:t.triangles+=a*(r/3);break;case i.LINES:t.lines+=a*(r/2);break;case i.LINE_STRIP:t.lines+=a*(r-1);break;case i.LINE_LOOP:t.lines+=a*r;break;case i.POINTS:t.points+=a*r;break;default:je("WebGLInfo: Unknown draw mode:",o);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function Jm(i,e,t){const n=new WeakMap,s=new ft;function r(o,a,l){const c=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,d=h!==void 0?h.length:0;let u=n.get(a);if(u===void 0||u.count!==d){let P=function(){x.dispose(),n.delete(a),a.removeEventListener("dispose",P)};var f=P;u!==void 0&&u.texture.dispose();const g=a.morphAttributes.position!==void 0,v=a.morphAttributes.normal!==void 0,m=a.morphAttributes.color!==void 0,p=a.morphAttributes.position||[],y=a.morphAttributes.normal||[],A=a.morphAttributes.color||[];let S=0;g===!0&&(S=1),v===!0&&(S=2),m===!0&&(S=3);let T=a.attributes.position.count*S,w=1;T>e.maxTextureSize&&(w=Math.ceil(T/e.maxTextureSize),T=e.maxTextureSize);const R=new Float32Array(T*w*4*d),x=new $c(R,T,w,d);x.type=Kt,x.needsUpdate=!0;const b=S*4;for(let N=0;N<d;N++){const z=p[N],V=y[N],U=A[N],O=T*w*4*N;for(let J=0;J<z.count;J++){const H=J*b;g===!0&&(s.fromBufferAttribute(z,J),R[O+H+0]=s.x,R[O+H+1]=s.y,R[O+H+2]=s.z,R[O+H+3]=0),v===!0&&(s.fromBufferAttribute(V,J),R[O+H+4]=s.x,R[O+H+5]=s.y,R[O+H+6]=s.z,R[O+H+7]=0),m===!0&&(s.fromBufferAttribute(U,J),R[O+H+8]=s.x,R[O+H+9]=s.y,R[O+H+10]=s.z,R[O+H+11]=U.itemSize===4?s.w:1)}}u={count:d,texture:x,size:new me(T,w)},n.set(a,u),a.addEventListener("dispose",P)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",o.morphTexture,t);else{let g=0;for(let m=0;m<c.length;m++)g+=c[m];const v=a.morphTargetsRelative?1:1-g;l.getUniforms().setValue(i,"morphTargetBaseInfluence",v),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",u.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",u.size)}return{update:r}}function $m(i,e,t,n,s){let r=new WeakMap;function o(c){const h=s.render.frame,d=c.geometry,u=e.get(c,d);if(r.get(u)!==h&&(e.update(u),r.set(u,h)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==h&&(t.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,i.ARRAY_BUFFER),r.set(c,h))),c.isSkinnedMesh){const f=c.skeleton;r.get(f)!==h&&(f.update(),r.set(f,h))}return u}function a(){r=new WeakMap}function l(c){const h=c.target;h.removeEventListener("dispose",l),n.releaseStatesOfObject(h),t.remove(h.instanceMatrix),h.instanceColor!==null&&t.remove(h.instanceColor)}return{update:o,dispose:a}}const Zm={[Fc]:"LINEAR_TONE_MAPPING",[Oc]:"REINHARD_TONE_MAPPING",[Bc]:"CINEON_TONE_MAPPING",[da]:"ACES_FILMIC_TONE_MAPPING",[zc]:"AGX_TONE_MAPPING",[Gc]:"NEUTRAL_TONE_MAPPING",[kc]:"CUSTOM_TONE_MAPPING"};function Qm(i,e,t,n,s,r){const o=new Zt(e,t,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1});let a=null,l=null;const c=new wt;c.setAttribute("position",new dt([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new dt([0,2,0,0,2,0],2));const h=new Bd({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),d=new gt(c,h),u=new xr(-1,1,1,-1,0,1);let f=null,g=null,v=!1,m,p=null,y=[],A=!1;this.setSize=function(S,T){o.setSize(S,T),a!==null&&a.setSize(S,T),l!==null&&l.setSize(S,T);for(let w=0;w<y.length;w++){const R=y[w];R.setSize&&R.setSize(S,T)}},this.setEffects=function(S){y=S,A=y.length>0&&y[0].isRenderPass===!0;const T=o.width,w=o.height;y.length>0&&a===null&&(a=new Zt(T,w,{type:cn,depthBuffer:!1,stencilBuffer:!1}),l=new Zt(T,w,{type:cn,depthBuffer:!1,stencilBuffer:!1}));for(let R=0;R<y.length;R++){const x=y[R];x.setSize&&x.setSize(T,w)}},this.begin=function(S,T){if(v||S.toneMapping===an&&y.length===0)return!1;if(p=T,T!==null){const w=T.width,R=T.height;(o.width!==w||o.height!==R)&&this.setSize(w,R)}return A===!1&&S.setRenderTarget(o),m=S.toneMapping,S.toneMapping=an,!0},this.hasRenderPass=function(){return A},this.end=function(S,T){S.toneMapping=m,v=!0;let w=o,R=a;for(let x=0;x<y.length;x++){const b=y[x];b.enabled!==!1&&(b.render(S,R,w,T),b.needsSwap!==!1&&(w=R,R=R===a?l:a))}if(f!==S.outputColorSpace||g!==S.toneMapping){f=S.outputColorSpace,g=S.toneMapping,h.defines={},Qe.getTransfer(f)===ot&&(h.defines.SRGB_TRANSFER="");const x=Zm[g];x&&(h.defines[x]=""),h.needsUpdate=!0}h.uniforms.tDiffuse.value=w.texture,S.setRenderTarget(p),S.render(d,u),p=null,v=!1},this.isCompositing=function(){return v},this.dispose=function(){o.dispose(),a!==null&&a.dispose(),l!==null&&l.dispose(),c.dispose(),h.dispose()}}const _h=new Lt,oa=new rs(1,1),xh=new $c,vh=new Nu,Mh=new th,ql=[],Kl=[],Jl=new Float32Array(16),$l=new Float32Array(9),Zl=new Float32Array(4);function Ni(i,e,t){const n=i[0];if(n<=0||n>0)return i;const s=e*t;let r=ql[s];if(r===void 0&&(r=new Float32Array(s),ql[s]=r),e!==0){n.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,i[o].toArray(r,a)}return r}function Mt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function St(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function Mr(i,e){let t=Kl[e];t===void 0&&(t=new Int32Array(e),Kl[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function jm(i,e){const t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function eg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Mt(t,e))return;i.uniform2fv(this.addr,e),St(t,e)}}function tg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Mt(t,e))return;i.uniform3fv(this.addr,e),St(t,e)}}function ng(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Mt(t,e))return;i.uniform4fv(this.addr,e),St(t,e)}}function ig(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Mt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),St(t,e)}else{if(Mt(t,n))return;Zl.set(n),i.uniformMatrix2fv(this.addr,!1,Zl),St(t,n)}}function sg(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Mt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),St(t,e)}else{if(Mt(t,n))return;$l.set(n),i.uniformMatrix3fv(this.addr,!1,$l),St(t,n)}}function rg(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Mt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),St(t,e)}else{if(Mt(t,n))return;Jl.set(n),i.uniformMatrix4fv(this.addr,!1,Jl),St(t,n)}}function og(i,e){const t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function ag(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Mt(t,e))return;i.uniform2iv(this.addr,e),St(t,e)}}function lg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Mt(t,e))return;i.uniform3iv(this.addr,e),St(t,e)}}function cg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Mt(t,e))return;i.uniform4iv(this.addr,e),St(t,e)}}function hg(i,e){const t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function ug(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Mt(t,e))return;i.uniform2uiv(this.addr,e),St(t,e)}}function dg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Mt(t,e))return;i.uniform3uiv(this.addr,e),St(t,e)}}function fg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Mt(t,e))return;i.uniform4uiv(this.addr,e),St(t,e)}}function pg(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(oa.compareFunction=t.isReversedDepthBuffer()?Sa:Ma,r=oa):r=_h,t.setTexture2D(e||r,s)}function mg(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||vh,s)}function gg(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||Mh,s)}function _g(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||xh,s)}function xg(i){switch(i){case 5126:return jm;case 35664:return eg;case 35665:return tg;case 35666:return ng;case 35674:return ig;case 35675:return sg;case 35676:return rg;case 5124:case 35670:return og;case 35667:case 35671:return ag;case 35668:case 35672:return lg;case 35669:case 35673:return cg;case 5125:return hg;case 36294:return ug;case 36295:return dg;case 36296:return fg;case 35678:case 36198:case 36298:case 36306:case 35682:return pg;case 35679:case 36299:case 36307:return mg;case 35680:case 36300:case 36308:case 36293:return gg;case 36289:case 36303:case 36311:case 36292:return _g}}function vg(i,e){i.uniform1fv(this.addr,e)}function Mg(i,e){const t=Ni(e,this.size,2);i.uniform2fv(this.addr,t)}function Sg(i,e){const t=Ni(e,this.size,3);i.uniform3fv(this.addr,t)}function yg(i,e){const t=Ni(e,this.size,4);i.uniform4fv(this.addr,t)}function Eg(i,e){const t=Ni(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function wg(i,e){const t=Ni(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function Tg(i,e){const t=Ni(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function bg(i,e){i.uniform1iv(this.addr,e)}function Ag(i,e){i.uniform2iv(this.addr,e)}function Rg(i,e){i.uniform3iv(this.addr,e)}function Cg(i,e){i.uniform4iv(this.addr,e)}function Pg(i,e){i.uniform1uiv(this.addr,e)}function Lg(i,e){i.uniform2uiv(this.addr,e)}function Ig(i,e){i.uniform3uiv(this.addr,e)}function Dg(i,e){i.uniform4uiv(this.addr,e)}function Ng(i,e,t){const n=this.cache,s=e.length,r=Mr(t,s);Mt(n,r)||(i.uniform1iv(this.addr,r),St(n,r));let o;this.type===i.SAMPLER_2D_SHADOW?o=oa:o=_h;for(let a=0;a!==s;++a)t.setTexture2D(e[a]||o,r[a])}function Ug(i,e,t){const n=this.cache,s=e.length,r=Mr(t,s);Mt(n,r)||(i.uniform1iv(this.addr,r),St(n,r));for(let o=0;o!==s;++o)t.setTexture3D(e[o]||vh,r[o])}function Fg(i,e,t){const n=this.cache,s=e.length,r=Mr(t,s);Mt(n,r)||(i.uniform1iv(this.addr,r),St(n,r));for(let o=0;o!==s;++o)t.setTextureCube(e[o]||Mh,r[o])}function Og(i,e,t){const n=this.cache,s=e.length,r=Mr(t,s);Mt(n,r)||(i.uniform1iv(this.addr,r),St(n,r));for(let o=0;o!==s;++o)t.setTexture2DArray(e[o]||xh,r[o])}function Bg(i){switch(i){case 5126:return vg;case 35664:return Mg;case 35665:return Sg;case 35666:return yg;case 35674:return Eg;case 35675:return wg;case 35676:return Tg;case 5124:case 35670:return bg;case 35667:case 35671:return Ag;case 35668:case 35672:return Rg;case 35669:case 35673:return Cg;case 5125:return Pg;case 36294:return Lg;case 36295:return Ig;case 36296:return Dg;case 35678:case 36198:case 36298:case 36306:case 35682:return Ng;case 35679:case 36299:case 36307:return Ug;case 35680:case 36300:case 36308:case 36293:return Fg;case 36289:case 36303:case 36311:case 36292:return Og}}class kg{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=xg(t.type)}}class zg{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Bg(t.type)}}class Gg{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const s=this.seq;for(let r=0,o=s.length;r!==o;++r){const a=s[r];a.setValue(e,t[a.id],n)}}}const ro=/(\w+)(\])?(\[|\.)?/g;function Ql(i,e){i.seq.push(e),i.map[e.id]=e}function Hg(i,e,t){const n=i.name,s=n.length;for(ro.lastIndex=0;;){const r=ro.exec(n),o=ro.lastIndex;let a=r[1];const l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===s){Ql(t,c===void 0?new kg(a,i,e):new zg(a,i,e));break}else{let d=t.map[a];d===void 0&&(d=new Gg(a),Ql(t,d)),t=d}}}class nr{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let o=0;o<n;++o){const a=e.getActiveUniform(t,o),l=e.getUniformLocation(t,a.name);Hg(a,l,this)}const s=[],r=[];for(const o of this.seq)o.type===e.SAMPLER_2D_SHADOW||o.type===e.SAMPLER_CUBE_SHADOW||o.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(o):r.push(o);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,n,s){const r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){const s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,o=t.length;r!==o;++r){const a=t[r],l=n[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,s)}}static seqWithValue(e,t){const n=[];for(let s=0,r=e.length;s!==r;++s){const o=e[s];o.id in t&&n.push(o)}return n}}function jl(i,e,t){const n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}const Vg=37297;let Wg=0;function Xg(i,e){const t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=s;o<r;o++){const a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}const ec=new Ge;function Yg(i){Qe._getMatrix(ec,Qe.workingColorSpace,i);const e=`mat3( ${ec.elements.map(t=>t.toFixed(4))} )`;switch(Qe.getTransfer(i)){case ar:return[e,"LinearTransferOETF"];case ot:return[e,"sRGBTransferOETF"];default:return Be("WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function tc(i,e,t){const n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";const o=/ERROR: 0:(\d+)/.exec(r);if(o){const a=parseInt(o[1]);return t.toUpperCase()+`

`+r+`

`+Xg(i.getShaderSource(e),a)}else return r}function qg(i,e){const t=Yg(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}const Kg={[Fc]:"Linear",[Oc]:"Reinhard",[Bc]:"Cineon",[da]:"ACESFilmic",[zc]:"AgX",[Gc]:"Neutral",[kc]:"Custom"};function Jg(i,e){const t=Kg[e];return t===void 0?(Be("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const Hs=new D;function $g(){Qe.getLuminanceCoefficients(Hs);const i=Hs.x.toFixed(4),e=Hs.y.toFixed(4),t=Hs.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Zg(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Ki).join(`
`)}function Qg(i){const e=[];for(const t in i){const n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function jg(i,e){const t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const r=i.getActiveAttrib(e,s),o=r.name;let a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:i.getAttribLocation(e,o),locationSize:a}}return t}function Ki(i){return i!==""}function nc(i,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function ic(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const e0=/^[ \t]*#include +<([\w\d./]+)>/gm;function aa(i){return i.replace(e0,n0)}const t0=new Map;function n0(i,e){let t=Ye[e];if(t===void 0){const n=t0.get(e);if(n!==void 0)t=Ye[n],Be('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return aa(t)}const i0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function sc(i){return i.replace(i0,s0)}function s0(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function rc(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}const r0={[$s]:"SHADOWMAP_TYPE_PCF",[Yi]:"SHADOWMAP_TYPE_VSM"};function o0(i){return r0[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const a0={[Kn]:"ENVMAP_TYPE_CUBE",[Ti]:"ENVMAP_TYPE_CUBE",[gr]:"ENVMAP_TYPE_CUBE_UV"};function l0(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":a0[i.envMapMode]||"ENVMAP_TYPE_CUBE"}const c0={[Ti]:"ENVMAP_MODE_REFRACTION"};function h0(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":c0[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}const u0={[Uc]:"ENVMAP_BLENDING_MULTIPLY",[uu]:"ENVMAP_BLENDING_MIX",[du]:"ENVMAP_BLENDING_ADD"};function d0(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":u0[i.combine]||"ENVMAP_BLENDING_NONE"}function f0(i){const e=i.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),7*16)),texelHeight:n,maxMip:t}}function p0(i,e,t,n){const s=i.getContext(),r=t.defines;let o=t.vertexShader,a=t.fragmentShader;const l=o0(t),c=l0(t),h=h0(t),d=d0(t),u=f0(t),f=Zg(t),g=Qg(r),v=s.createProgram();let m,p,y=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Ki).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Ki).join(`
`),p.length>0&&(p+=`
`)):(m=[rc(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Ki).join(`
`),p=[rc(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+d:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==an?"#define TONE_MAPPING":"",t.toneMapping!==an?Ye.tonemapping_pars_fragment:"",t.toneMapping!==an?Jg("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Ye.colorspace_pars_fragment,qg("linearToOutputTexel",t.outputColorSpace),$g(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Ki).join(`
`)),o=aa(o),o=nc(o,t),o=ic(o,t),a=aa(a),a=nc(a,t),a=ic(a,t),o=sc(o),a=sc(a),t.isRawShaderMaterial!==!0&&(y=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",t.glslVersion===nl?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===nl?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const A=y+m+o,S=y+p+a,T=jl(s,s.VERTEX_SHADER,A),w=jl(s,s.FRAGMENT_SHADER,S);s.attachShader(v,T),s.attachShader(v,w),t.index0AttributeName!==void 0?s.bindAttribLocation(v,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(v,0,"position"),s.linkProgram(v);function R(N){if(i.debug.checkShaderErrors){const z=s.getProgramInfoLog(v)||"",V=s.getShaderInfoLog(T)||"",U=s.getShaderInfoLog(w)||"",O=z.trim(),J=V.trim(),H=U.trim();let se=!0,X=!0;if(s.getProgramParameter(v,s.LINK_STATUS)===!1)if(se=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,v,T,w);else{const j=tc(s,T,"vertex"),te=tc(s,w,"fragment");je("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(v,s.VALIDATE_STATUS)+`

Material Name: `+N.name+`
Material Type: `+N.type+`

Program Info Log: `+O+`
`+j+`
`+te)}else O!==""?Be("WebGLProgram: Program Info Log:",O):(J===""||H==="")&&(X=!1);X&&(N.diagnostics={runnable:se,programLog:O,vertexShader:{log:J,prefix:m},fragmentShader:{log:H,prefix:p}})}s.deleteShader(T),s.deleteShader(w),x=new nr(s,v),b=jg(s,v)}let x;this.getUniforms=function(){return x===void 0&&R(this),x};let b;this.getAttributes=function(){return b===void 0&&R(this),b};let P=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return P===!1&&(P=s.getProgramParameter(v,Vg)),P},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(v),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Wg++,this.cacheKey=e,this.usedTimes=1,this.program=v,this.vertexShader=T,this.fragmentShader=w,this}let m0=0;class g0{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){const s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new _0(e),t.set(e,n)),n}}class _0{constructor(e){this.id=m0++,this.code=e,this.usedTimes=0}}function x0(i){return i===Jn||i===sr||i===rr}function v0(i,e,t,n,s,r){const o=new Ea,a=new g0,l=new Set,c=[],h=new Map,d=n.logarithmicDepthBuffer;let u=n.precision;const f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(x){return l.add(x),x===0?"uv":`uv${x}`}function v(x,b,P,N,z,V){const U=N.fog,O=z.geometry,J=x.isMeshStandardMaterial||x.isMeshLambertMaterial||x.isMeshPhongMaterial?N.environment:null,H=x.isMeshStandardMaterial||x.isMeshLambertMaterial&&!x.envMap||x.isMeshPhongMaterial&&!x.envMap,se=e.get(x.envMap||J,H),X=se&&se.mapping===gr?se.image.height:null,j=f[x.type];x.precision!==null&&(u=n.getMaxPrecision(x.precision),u!==x.precision&&Be("WebGLProgram.getParameters:",x.precision,"not supported, using",u,"instead."));const te=O.morphAttributes.position||O.morphAttributes.normal||O.morphAttributes.color,Ae=te!==void 0?te.length:0;let Ee=0;O.morphAttributes.position!==void 0&&(Ee=1),O.morphAttributes.normal!==void 0&&(Ee=2),O.morphAttributes.color!==void 0&&(Ee=3);let et,We,Ze,q;if(j){const ct=nn[j];et=ct.vertexShader,We=ct.fragmentShader}else{et=x.vertexShader,We=x.fragmentShader;const ct=a.getVertexShaderStage(x),st=a.getFragmentShaderStage(x);a.update(x,ct,st),Ze=ct.id,q=st.id}const Q=i.getRenderTarget(),he=i.state.buffers.depth.getReversed(),Ue=z.isInstancedMesh===!0,Se=z.isBatchedMesh===!0,Re=!!x.map,qe=!!x.matcap,$=!!se,ne=!!x.aoMap,re=!!x.lightMap,oe=!!x.bumpMap&&x.wireframe===!1,ce=!!x.normalMap,Fe=!!x.displacementMap,Ne=!!x.emissiveMap,ke=!!x.metalnessMap,ze=!!x.roughnessMap,C=x.anisotropy>0,it=x.clearcoat>0,Ke=x.dispersion>0,E=x.retroreflectivity>0,_=x.iridescence>0,F=x.sheen>0,G=x.transmission>0,Y=C&&!!x.anisotropyMap,ae=it&&!!x.clearcoatMap,le=it&&!!x.clearcoatNormalMap,K=it&&!!x.clearcoatRoughnessMap,ee=_&&!!x.iridescenceMap,ue=_&&!!x.iridescenceThicknessMap,Le=F&&!!x.sheenColorMap,ge=F&&!!x.sheenRoughnessMap,de=!!x.specularMap,Ie=!!x.specularColorMap,Oe=!!x.specularIntensityMap,He=G&&!!x.transmissionMap,I=G&&!!x.thicknessMap,fe=!!x.gradientMap,Z=!!x.alphaMap,pe=x.alphaTest>0,Me=!!x.alphaHash,ie=!!x.extensions;let De=an;x.toneMapped&&(Q===null||Q.isXRRenderTarget===!0)&&(De=i.toneMapping);const Ce={shaderID:j,shaderType:x.type,shaderName:x.name,vertexShader:et,fragmentShader:We,defines:x.defines,customVertexShaderID:Ze,customFragmentShaderID:q,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:u,batching:Se,batchingColor:Se&&z._colorsTexture!==null,instancing:Ue,instancingColor:Ue&&z.instanceColor!==null,instancingMorph:Ue&&z.morphTexture!==null,outputColorSpace:Q===null?i.outputColorSpace:Q.isXRRenderTarget===!0?Q.texture.colorSpace:Qe.workingColorSpace,alphaToCoverage:!!x.alphaToCoverage,map:Re,matcap:qe,envMap:$,envMapMode:$&&se.mapping,envMapCubeUVHeight:X,aoMap:ne,lightMap:re,bumpMap:oe,normalMap:ce,displacementMap:Fe,emissiveMap:Ne,normalMapObjectSpace:ce&&x.normalMapType===mu,normalMapTangentSpace:ce&&x.normalMapType===ea,packedNormalMap:ce&&x.normalMapType===ea&&x0(x.normalMap.format),metalnessMap:ke,roughnessMap:ze,anisotropy:C,anisotropyMap:Y,clearcoat:it,clearcoatMap:ae,clearcoatNormalMap:le,clearcoatRoughnessMap:K,dispersion:Ke,retroreflection:E,iridescence:_,iridescenceMap:ee,iridescenceThicknessMap:ue,sheen:F,sheenColorMap:Le,sheenRoughnessMap:ge,specularMap:de,specularColorMap:Ie,specularIntensityMap:Oe,transmission:G,transmissionMap:He,thicknessMap:I,gradientMap:fe,opaque:x.transparent===!1&&x.blending===$i&&x.alphaToCoverage===!1,alphaMap:Z,alphaTest:pe,alphaHash:Me,combine:x.combine,mapUv:Re&&g(x.map.channel),aoMapUv:ne&&g(x.aoMap.channel),lightMapUv:re&&g(x.lightMap.channel),bumpMapUv:oe&&g(x.bumpMap.channel),normalMapUv:ce&&g(x.normalMap.channel),displacementMapUv:Fe&&g(x.displacementMap.channel),emissiveMapUv:Ne&&g(x.emissiveMap.channel),metalnessMapUv:ke&&g(x.metalnessMap.channel),roughnessMapUv:ze&&g(x.roughnessMap.channel),anisotropyMapUv:Y&&g(x.anisotropyMap.channel),clearcoatMapUv:ae&&g(x.clearcoatMap.channel),clearcoatNormalMapUv:le&&g(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:K&&g(x.clearcoatRoughnessMap.channel),iridescenceMapUv:ee&&g(x.iridescenceMap.channel),iridescenceThicknessMapUv:ue&&g(x.iridescenceThicknessMap.channel),sheenColorMapUv:Le&&g(x.sheenColorMap.channel),sheenRoughnessMapUv:ge&&g(x.sheenRoughnessMap.channel),specularMapUv:de&&g(x.specularMap.channel),specularColorMapUv:Ie&&g(x.specularColorMap.channel),specularIntensityMapUv:Oe&&g(x.specularIntensityMap.channel),transmissionMapUv:He&&g(x.transmissionMap.channel),thicknessMapUv:I&&g(x.thicknessMap.channel),alphaMapUv:Z&&g(x.alphaMap.channel),vertexTangents:!!O.attributes.tangent&&(ce||C),vertexNormals:!!O.attributes.normal,vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!O.attributes.color&&O.attributes.color.itemSize===4,pointsUvs:z.isPoints===!0&&!!O.attributes.uv&&(Re||Z),fog:!!U,useFog:x.fog===!0,fogExp2:!!U&&U.isFogExp2,flatShading:x.wireframe===!1&&(x.flatShading===!0||O.attributes.normal===void 0&&ce===!1&&(x.isMeshLambertMaterial||x.isMeshPhongMaterial||x.isMeshStandardMaterial||x.isMeshPhysicalMaterial)),sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:he,skinning:z.isSkinnedMesh===!0,hasPositionAttribute:O.attributes.position!==void 0,morphTargets:O.morphAttributes.position!==void 0,morphNormals:O.morphAttributes.normal!==void 0,morphColors:O.morphAttributes.color!==void 0,morphTargetsCount:Ae,morphTextureStride:Ee,numSunLights:b.sun.length,numDirLights:b.directional.length,numPointLights:b.point.length,numSpotLights:b.spot.length,numSpotLightMaps:b.spotLightMap.length,numRectAreaLights:b.rectArea.length,numHemiLights:b.hemi.length,numSunLightShadows:b.sunShadowMap.length,numDirLightShadows:b.directionalShadowMap.length,numPointLightShadows:b.pointShadowMap.length,numSpotLightShadows:b.spotShadowMap.length,numSpotLightShadowsWithMaps:b.numSpotLightShadowsWithMaps,numLightProbes:b.numLightProbes,numLightProbeGrids:V.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:x.dithering,shadowMapEnabled:i.shadowMap.enabled&&P.length>0,shadowMapType:i.shadowMap.type,toneMapping:De,decodeVideoTexture:Re&&x.map.isVideoTexture===!0&&Qe.getTransfer(x.map.colorSpace)===ot,decodeVideoTextureEmissive:Ne&&x.emissiveMap.isVideoTexture===!0&&Qe.getTransfer(x.emissiveMap.colorSpace)===ot,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===vn,flipSided:x.side===Nt,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionClipCullDistance:ie&&x.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ie&&x.extensions.multiDraw===!0||Se)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()};return Ce.vertexUv1s=l.has(1),Ce.vertexUv2s=l.has(2),Ce.vertexUv3s=l.has(3),l.clear(),Ce}function m(x){const b=[];if(x.shaderID?b.push(x.shaderID):(b.push(x.customVertexShaderID),b.push(x.customFragmentShaderID)),x.defines!==void 0)for(const P in x.defines)b.push(P),b.push(x.defines[P]);return x.isRawShaderMaterial===!1&&(p(b,x),y(b,x),b.push(i.outputColorSpace)),b.push(x.customProgramCacheKey),b.join()}function p(x,b){x.push(b.precision),x.push(b.outputColorSpace),x.push(b.envMapMode),x.push(b.envMapCubeUVHeight),x.push(b.mapUv),x.push(b.alphaMapUv),x.push(b.lightMapUv),x.push(b.aoMapUv),x.push(b.bumpMapUv),x.push(b.normalMapUv),x.push(b.displacementMapUv),x.push(b.emissiveMapUv),x.push(b.metalnessMapUv),x.push(b.roughnessMapUv),x.push(b.anisotropyMapUv),x.push(b.clearcoatMapUv),x.push(b.clearcoatNormalMapUv),x.push(b.clearcoatRoughnessMapUv),x.push(b.iridescenceMapUv),x.push(b.iridescenceThicknessMapUv),x.push(b.sheenColorMapUv),x.push(b.sheenRoughnessMapUv),x.push(b.specularMapUv),x.push(b.specularColorMapUv),x.push(b.specularIntensityMapUv),x.push(b.transmissionMapUv),x.push(b.thicknessMapUv),x.push(b.combine),x.push(b.fogExp2),x.push(b.sizeAttenuation),x.push(b.morphTargetsCount),x.push(b.morphAttributeCount),x.push(b.numSunLights),x.push(b.numDirLights),x.push(b.numPointLights),x.push(b.numSpotLights),x.push(b.numSpotLightMaps),x.push(b.numHemiLights),x.push(b.numRectAreaLights),x.push(b.numSunLightShadows),x.push(b.numDirLightShadows),x.push(b.numPointLightShadows),x.push(b.numSpotLightShadows),x.push(b.numSpotLightShadowsWithMaps),x.push(b.numLightProbes),x.push(b.shadowMapType),x.push(b.toneMapping),x.push(b.numClippingPlanes),x.push(b.numClipIntersection),x.push(b.depthPacking)}function y(x,b){o.disableAll(),b.instancing&&o.enable(0),b.instancingColor&&o.enable(1),b.instancingMorph&&o.enable(2),b.matcap&&o.enable(3),b.envMap&&o.enable(4),b.normalMapObjectSpace&&o.enable(5),b.normalMapTangentSpace&&o.enable(6),b.clearcoat&&o.enable(7),b.iridescence&&o.enable(8),b.alphaTest&&o.enable(9),b.vertexColors&&o.enable(10),b.vertexAlphas&&o.enable(11),b.vertexUv1s&&o.enable(12),b.vertexUv2s&&o.enable(13),b.vertexUv3s&&o.enable(14),b.vertexTangents&&o.enable(15),b.anisotropy&&o.enable(16),b.alphaHash&&o.enable(17),b.batching&&o.enable(18),b.dispersion&&o.enable(19),b.retroreflection&&o.enable(24),b.batchingColor&&o.enable(20),b.gradientMap&&o.enable(21),b.packedNormalMap&&o.enable(22),b.vertexNormals&&o.enable(23),x.push(o.mask),o.disableAll(),b.fog&&o.enable(0),b.useFog&&o.enable(1),b.flatShading&&o.enable(2),b.logarithmicDepthBuffer&&o.enable(3),b.reversedDepthBuffer&&o.enable(4),b.skinning&&o.enable(5),b.morphTargets&&o.enable(6),b.morphNormals&&o.enable(7),b.morphColors&&o.enable(8),b.premultipliedAlpha&&o.enable(9),b.shadowMapEnabled&&o.enable(10),b.doubleSided&&o.enable(11),b.flipSided&&o.enable(12),b.useDepthPacking&&o.enable(13),b.dithering&&o.enable(14),b.transmission&&o.enable(15),b.sheen&&o.enable(16),b.opaque&&o.enable(17),b.pointsUvs&&o.enable(18),b.decodeVideoTexture&&o.enable(19),b.decodeVideoTextureEmissive&&o.enable(20),b.alphaToCoverage&&o.enable(21),b.numLightProbeGrids>0&&o.enable(22),b.hasPositionAttribute&&o.enable(23),x.push(o.mask)}function A(x){const b=f[x.type];let P;if(b){const N=nn[b];P=Ud.clone(N.uniforms)}else P=x.uniforms;return P}function S(x,b){let P=h.get(b);return P!==void 0?++P.usedTimes:(P=new p0(i,b,x,s),c.push(P),h.set(b,P)),P}function T(x){if(--x.usedTimes===0){const b=c.indexOf(x);c[b]=c[c.length-1],c.pop(),h.delete(x.cacheKey),x.destroy()}}function w(x){a.remove(x)}function R(){a.dispose()}return{getParameters:v,getProgramCacheKey:m,getUniforms:A,acquireProgram:S,releaseProgram:T,releaseShaderCache:w,programs:c,dispose:R}}function M0(){let i=new WeakMap;function e(o){return i.has(o)}function t(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function s(o,a,l){i.get(o)[a]=l}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function S0(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.materialVariant!==e.materialVariant?i.materialVariant-e.materialVariant:i.z!==e.z?i.z-e.z:i.id-e.id}function oc(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function ac(){const i=[];let e=0;const t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function o(u){let f=0;return u.isInstancedMesh&&(f+=2),u.isSkinnedMesh&&(f+=1),f}function a(u,f,g,v,m,p){let y=i[e];return y===void 0?(y={id:u.id,object:u,geometry:f,material:g,materialVariant:o(u),groupOrder:v,renderOrder:u.renderOrder,z:m,group:p},i[e]=y):(y.id=u.id,y.object=u,y.geometry=f,y.material=g,y.materialVariant=o(u),y.groupOrder=v,y.renderOrder=u.renderOrder,y.z=m,y.group=p),e++,y}function l(u,f,g,v,m,p,y){y.reversedDepth===!0&&(m=-m);const A=a(u,f,g,v,m,p);g.transmission>0?n.push(A):g.transparent===!0?s.push(A):t.push(A)}function c(u,f,g,v,m,p){const y=a(u,f,g,v,m,p);g.transmission>0?n.unshift(y):g.transparent===!0?s.unshift(y):t.unshift(y)}function h(u,f){t.length>1&&t.sort(u||S0),n.length>1&&n.sort(f||oc),s.length>1&&s.sort(f||oc)}function d(){for(let u=e,f=i.length;u<f;u++){const g=i[u];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:l,unshift:c,finish:d,sort:h}}function y0(){let i=new WeakMap;function e(n,s){const r=i.get(n);let o;return r===void 0?(o=new ac,i.set(n,[o])):s>=r.length?(o=new ac,r.push(o)):o=r[s],o}function t(){i=new WeakMap}return{get:e,dispose:t}}function E0(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new D,color:new Ve};break;case"SpotLight":t={position:new D,direction:new D,color:new Ve,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new D,color:new Ve,distance:0,decay:0};break;case"HemisphereLight":t={direction:new D,skyColor:new Ve,groundColor:new Ve};break;case"RectAreaLight":t={color:new Ve,position:new D,halfWidth:new D,halfHeight:new D};break}return i[e.id]=t,t}}}function w0(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new me};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new me};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new me,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}let T0=0;function b0(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function A0(i){const e=new E0,t=w0(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new D);const s=new D,r=new nt,o=new nt;function a(c){let h=0,d=0,u=0;for(let z=0;z<9;z++)n.probe[z].set(0,0,0);let f=0,g=0,v=0,m=0,p=0,y=0,A=0,S=0,T=0,w=0,R=0,x=0,b=0,P=0;c.sort(b0);for(let z=0,V=c.length;z<V;z++){const U=c[z],O=U.color,J=U.intensity,H=U.distance;let se=null;if(U.shadow&&U.shadow.map&&(U.shadow.map.texture.format===Jn?se=U.shadow.map.texture:se=U.shadow.map.depthTexture||U.shadow.map.texture),U.isAmbientLight)h+=O.r*J,d+=O.g*J,u+=O.b*J;else if(U.isLightProbe){for(let X=0;X<9;X++)n.probe[X].addScaledVector(U.sh.coefficients[X],J);P++}else if(U.isSunLight){const X=e.get(U);if(X.color.copy(U.color).multiplyScalar(U.intensity),U.castShadow){const j=U.shadow,te=t.get(U);te.shadowIntensity=j.intensity,te.shadowBias=j.bias,te.shadowNormalBias=j.normalBias,te.shadowRadius=j.radius,te.shadowMapSize.copy(j.mapSize).multiply(j.getFrameExtents()),n.sunShadow[g]=te,n.sunShadowMap[g]=se;const Ae=j.getViewportCount();for(let Ee=0;Ee<Ae;Ee++)n.sunShadowMatrix[v+Ee]=j.getMatrix(Ee),n.sunShadowCascade[v+Ee]=j._cascadeData[Ee];v+=Ae,g++}n.sun[f]=X,f++}else if(U.isDirectionalLight){const X=e.get(U);if(X.color.copy(U.color).multiplyScalar(U.intensity),U.castShadow){const j=U.shadow,te=t.get(U);te.shadowIntensity=j.intensity,te.shadowBias=j.bias,te.shadowNormalBias=j.normalBias,te.shadowRadius=j.radius,te.shadowMapSize=j.mapSize,n.directionalShadow[m]=te,n.directionalShadowMap[m]=se,n.directionalShadowMatrix[m]=U.shadow.matrix,T++}n.directional[m]=X,m++}else if(U.isSpotLight){const X=e.get(U);X.position.setFromMatrixPosition(U.matrixWorld),X.color.copy(O).multiplyScalar(J),X.distance=H,X.coneCos=Math.cos(U.angle),X.penumbraCos=Math.cos(U.angle*(1-U.penumbra)),X.decay=U.decay,n.spot[y]=X;const j=U.shadow;if(U.map&&(n.spotLightMap[x]=U.map,x++,j.updateMatrices(U),U.castShadow&&b++),n.spotLightMatrix[y]=j.matrix,U.castShadow){const te=t.get(U);te.shadowIntensity=j.intensity,te.shadowBias=j.bias,te.shadowNormalBias=j.normalBias,te.shadowRadius=j.radius,te.shadowMapSize=j.mapSize,n.spotShadow[y]=te,n.spotShadowMap[y]=se,R++}y++}else if(U.isRectAreaLight){const X=e.get(U);X.color.copy(O).multiplyScalar(J),X.halfWidth.set(U.width*.5,0,0),X.halfHeight.set(0,U.height*.5,0),n.rectArea[A]=X,A++}else if(U.isPointLight){const X=e.get(U);if(X.color.copy(U.color).multiplyScalar(U.intensity),X.distance=U.distance,X.decay=U.decay,U.castShadow){const j=U.shadow,te=t.get(U);te.shadowIntensity=j.intensity,te.shadowBias=j.bias,te.shadowNormalBias=j.normalBias,te.shadowRadius=j.radius,te.shadowMapSize=j.mapSize,te.shadowCameraNear=j.camera.near,te.shadowCameraFar=j.camera.far,n.pointShadow[p]=te,n.pointShadowMap[p]=se,n.pointShadowMatrix[p]=U.shadow.matrix,w++}n.point[p]=X,p++}else if(U.isHemisphereLight){const X=e.get(U);X.skyColor.copy(U.color).multiplyScalar(J),X.groundColor.copy(U.groundColor).multiplyScalar(J),n.hemi[S]=X,S++}}A>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=_e.LTC_FLOAT_1,n.rectAreaLTC2=_e.LTC_FLOAT_2):(n.rectAreaLTC1=_e.LTC_HALF_1,n.rectAreaLTC2=_e.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=d,n.ambient[2]=u;const N=n.hash;(N.sunLength!==f||N.directionalLength!==m||N.pointLength!==p||N.spotLength!==y||N.rectAreaLength!==A||N.hemiLength!==S||N.numSunShadows!==g||N.numDirectionalShadows!==T||N.numPointShadows!==w||N.numSpotShadows!==R||N.numSpotMaps!==x||N.numLightProbes!==P)&&(n.sun.length=f,n.directional.length=m,n.spot.length=y,n.rectArea.length=A,n.point.length=p,n.hemi.length=S,n.sunShadow.length=g,n.sunShadowMap.length=g,n.sunShadowMatrix.length=v,n.sunShadowCascade.length=v,n.directionalShadow.length=T,n.directionalShadowMap.length=T,n.directionalShadowMatrix.length=T,n.pointShadow.length=w,n.pointShadowMap.length=w,n.pointShadowMatrix.length=w,n.spotShadow.length=R,n.spotShadowMap.length=R,n.spotLightMatrix.length=R+x-b,n.spotLightMap.length=x,n.numSpotLightShadowsWithMaps=b,n.numLightProbes=P,N.sunLength=f,N.directionalLength=m,N.pointLength=p,N.spotLength=y,N.rectAreaLength=A,N.hemiLength=S,N.numSunShadows=g,N.numDirectionalShadows=T,N.numPointShadows=w,N.numSpotShadows=R,N.numSpotMaps=x,N.numLightProbes=P,n.version=T0++)}function l(c,h){let d=0,u=0,f=0,g=0,v=0,m=0;const p=h.matrixWorldInverse;for(let y=0,A=c.length;y<A;y++){const S=c[y];if(S.isSunLight){const T=n.sun[d];T.direction.setFromMatrixPosition(S.matrixWorld),T.direction.transformDirection(p),d++}else if(S.isDirectionalLight){const T=n.directional[u];T.direction.setFromMatrixPosition(S.matrixWorld),s.setFromMatrixPosition(S.target.matrixWorld),T.direction.sub(s),T.direction.transformDirection(p),u++}else if(S.isSpotLight){const T=n.spot[g];T.position.setFromMatrixPosition(S.matrixWorld),T.position.applyMatrix4(p),T.direction.setFromMatrixPosition(S.matrixWorld),s.setFromMatrixPosition(S.target.matrixWorld),T.direction.sub(s),T.direction.transformDirection(p),g++}else if(S.isRectAreaLight){const T=n.rectArea[v];T.position.setFromMatrixPosition(S.matrixWorld),T.position.applyMatrix4(p),o.identity(),r.copy(S.matrixWorld),r.premultiply(p),o.extractRotation(r),T.halfWidth.set(S.width*.5,0,0),T.halfHeight.set(0,S.height*.5,0),T.halfWidth.applyMatrix4(o),T.halfHeight.applyMatrix4(o),v++}else if(S.isPointLight){const T=n.point[f];T.position.setFromMatrixPosition(S.matrixWorld),T.position.applyMatrix4(p),f++}else if(S.isHemisphereLight){const T=n.hemi[m];T.direction.setFromMatrixPosition(S.matrixWorld),T.direction.transformDirection(p),m++}}}return{setup:a,setupView:l,state:n}}function lc(i){const e=new A0(i),t=[],n=[],s=[];function r(u){d.camera=u,t.length=0,n.length=0,s.length=0}function o(u){t.push(u)}function a(u){n.push(u)}function l(u){s.push(u)}function c(){e.setup(t)}function h(u){e.setupView(t,u)}const d={lightsArray:t,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:d,setupLights:c,setupLightsView:h,pushLight:o,pushShadow:a,pushLightProbeGrid:l}}function R0(i){let e=new WeakMap;function t(s,r=0){const o=e.get(s);let a;return o===void 0?(a=new lc(i),e.set(s,[a])):r>=o.length?(a=new lc(i),o.push(a)):a=o[r],a}function n(){e=new WeakMap}return{get:t,dispose:n}}const C0=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,P0=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,L0=[new D(1,0,0),new D(-1,0,0),new D(0,1,0),new D(0,-1,0),new D(0,0,1),new D(0,0,-1)],I0=[new D(0,-1,0),new D(0,-1,0),new D(0,0,1),new D(0,0,-1),new D(0,-1,0),new D(0,-1,0)],cc=new nt,Wi=new D,oo=new D;function D0(i,e,t){let n=new ba;const s=new me,r=new me,o=new ft,a=new kd,l=new zd,c={},h=t.maxTextureSize,d={[qn]:Nt,[Nt]:qn,[vn]:vn},u=new hn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new me},radius:{value:4}},vertexShader:C0,fragmentShader:P0}),f=u.clone();f.defines.HORIZONTAL_PASS=1;const g=new wt;g.setAttribute("position",new Dt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const v=new gt(g,u),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=$s;let p=this.type;this.render=function(w,R,x){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||w.length===0)return;this.type===Yh&&(Be("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=$s);const b=i.getRenderTarget(),P=i.getActiveCubeFace(),N=i.getActiveMipmapLevel(),z=i.state;z.setBlending(Sn),z.buffers.depth.getReversed()===!0?z.buffers.color.setClear(0,0,0,0):z.buffers.color.setClear(1,1,1,1),z.buffers.depth.setTest(!0),z.setScissorTest(!1);const V=p!==this.type;V&&R.traverse(function(U){U.material&&(Array.isArray(U.material)?U.material.forEach(O=>O.needsUpdate=!0):U.material.needsUpdate=!0)});for(let U=0,O=w.length;U<O;U++){const J=w[U],H=J.shadow;if(H===void 0){Be("WebGLShadowMap:",J,"has no shadow.");continue}if(H.autoUpdate===!1&&H.needsUpdate===!1)continue;s.copy(H.mapSize);const se=H.getFrameExtents();s.multiply(se),r.copy(H.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/se.x),s.x=r.x*se.x,H.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/se.y),s.y=r.y*se.y,H.mapSize.y=r.y));const X=i.state.buffers.depth.getReversed();if(H.camera._reversedDepth=X,H.map===null||V===!0){if(H.map!==null&&(H.map.depthTexture!==null&&(H.map.depthTexture.dispose(),H.map.depthTexture=null),H.map.dispose()),this.type===Yi){if(J.isPointLight){Be("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}H.map=new Zt(s.x,s.y,{format:Jn,type:cn,minFilter:Et,magFilter:Et,generateMipmaps:!1}),H.map.texture.name=J.name+".shadowMap",H.map.depthTexture=new rs(s.x,s.y,Kt),H.map.depthTexture.name=J.name+".shadowMapDepth",H.map.depthTexture.format=En,H.map.depthTexture.compareFunction=null,H.map.depthTexture.minFilter=Tt,H.map.depthTexture.magFilter=Tt}else J.isPointLight?(H.map=new gh(s.x),H.map.depthTexture=new ju(s.x,ln)):(H.map=new Zt(s.x,s.y),H.map.depthTexture=new rs(s.x,s.y,ln)),H.map.depthTexture.name=J.name+".shadowMap",H.map.depthTexture.format=En,this.type===$s?(H.map.depthTexture.compareFunction=X?Sa:Ma,H.map.depthTexture.minFilter=Et,H.map.depthTexture.magFilter=Et):(H.map.depthTexture.compareFunction=null,H.map.depthTexture.minFilter=Tt,H.map.depthTexture.magFilter=Tt);H.camera.updateProjectionMatrix()}H.map.isWebGLCubeRenderTarget!==!0&&(H.map.width!==s.x||H.map.height!==s.y)&&H.map.setSize(s.x,s.y);const j=H.map.isWebGLCubeRenderTarget?6:H.getViewportCount();J.isPointLight!==!0&&H.updateMatrices(J,x);for(let te=0;te<j;te++){const Ae=H.getCamera(te);if(J.isPointLight){const Ee=H.camera,et=H.matrix,We=J.distance||Ee.far;We!==Ee.far&&(Ee.far=We,Ee.updateProjectionMatrix()),Wi.setFromMatrixPosition(J.matrixWorld),Ee.position.copy(Wi),oo.copy(Ee.position),oo.add(L0[te]),Ee.up.copy(I0[te]),Ee.lookAt(oo),Ee.updateMatrixWorld(),et.makeTranslation(-Wi.x,-Wi.y,-Wi.z),cc.multiplyMatrices(Ee.projectionMatrix,Ee.matrixWorldInverse),H._frustum.setFromProjectionMatrix(cc,Ee.coordinateSystem,Ee.reversedDepth)}if(H.map.isWebGLCubeRenderTarget)i.setRenderTarget(H.map,te),i.clear();else{te===0&&(i.setRenderTarget(H.map),i.clear());const Ee=H.getViewport(te);o.set(r.x*Ee.x,r.y*Ee.y,r.x*Ee.z,r.y*Ee.w),z.viewport(o)}n=H.getFrustum(te),S(R,x,Ae,J,this.type)}H.isPointLightShadow!==!0&&this.type===Yi&&y(H,x),H.needsUpdate=!1}p=this.type,m.needsUpdate=!1,i.setRenderTarget(b,P,N)};function y(w,R){const x=e.update(v);u.defines.VSM_SAMPLES!==w.blurSamples&&(u.defines.VSM_SAMPLES=w.blurSamples,f.defines.VSM_SAMPLES=w.blurSamples,u.needsUpdate=!0,f.needsUpdate=!0),w.mapPass===null?w.mapPass=new Zt(s.x,s.y,{format:Jn,type:cn}):(w.mapPass.width!==w.map.width||w.mapPass.height!==w.map.height)&&w.mapPass.setSize(w.map.width,w.map.height),u.uniforms.shadow_pass.value=w.map.depthTexture,u.uniforms.resolution.value.set(w.map.width,w.map.height),u.uniforms.radius.value=w.radius,i.setRenderTarget(w.mapPass),i.clear(),i.renderBufferDirect(R,null,x,u,v,null),f.uniforms.shadow_pass.value=w.mapPass.texture,f.uniforms.resolution.value.set(w.map.width,w.map.height),f.uniforms.radius.value=w.radius,i.setRenderTarget(w.map),i.clear(),i.renderBufferDirect(R,null,x,f,v,null)}function A(w,R,x,b){let P=null;const N=x.isPointLight===!0?w.customDistanceMaterial:w.customDepthMaterial;if(N!==void 0)P=N;else if(P=x.isPointLight===!0?l:a,i.localClippingEnabled&&R.clipShadows===!0&&Array.isArray(R.clippingPlanes)&&R.clippingPlanes.length!==0||R.displacementMap&&R.displacementScale!==0||R.alphaMap&&R.alphaTest>0||R.map&&R.alphaTest>0||R.alphaToCoverage===!0){const z=P.uuid,V=R.uuid;let U=c[z];U===void 0&&(U={},c[z]=U);let O=U[V];O===void 0&&(O=P.clone(),U[V]=O,R.addEventListener("dispose",T)),P=O}if(P.visible=R.visible,P.wireframe=R.wireframe,b===Yi?P.side=R.shadowSide!==null?R.shadowSide:R.side:P.side=R.shadowSide!==null?R.shadowSide:d[R.side],P.alphaMap=R.alphaMap,P.alphaTest=R.alphaToCoverage===!0?.5:R.alphaTest,P.map=R.map,P.clipShadows=R.clipShadows,P.clippingPlanes=R.clippingPlanes,P.clipIntersection=R.clipIntersection,P.displacementMap=R.displacementMap,P.displacementScale=R.displacementScale,P.displacementBias=R.displacementBias,P.wireframeLinewidth=R.wireframeLinewidth,P.linewidth=R.linewidth,x.isPointLight===!0&&P.isMeshDistanceMaterial===!0){const z=i.properties.get(P);z.light=x}return P}function S(w,R,x,b,P){if(w.visible===!1)return;if(w.layers.test(R.layers)&&(w.isMesh||w.isLine||w.isPoints)&&(w.castShadow||w.receiveShadow&&P===Yi)&&(!w.frustumCulled||w.intersectsFrustum(n))){w.modelViewMatrix.multiplyMatrices(x.matrixWorldInverse,w.matrixWorld);const V=e.update(w),U=w.material;if(Array.isArray(U)){const O=V.groups;for(let J=0,H=O.length;J<H;J++){const se=O[J],X=U[se.materialIndex];if(X&&X.visible){const j=A(w,X,b,P);w.onBeforeShadow(i,w,R,x,V,j,se),i.renderBufferDirect(x,null,V,j,w,se),w.onAfterShadow(i,w,R,x,V,j,se)}}}else if(U.visible){const O=A(w,U,b,P);w.onBeforeShadow(i,w,R,x,V,O,null),i.renderBufferDirect(x,null,V,O,w,null),w.onAfterShadow(i,w,R,x,V,O,null)}}const z=w.children;for(let V=0,U=z.length;V<U;V++)S(z[V],R,x,b,P)}function T(w){w.target.removeEventListener("dispose",T);for(const x in c){const b=c[x],P=w.target.uuid;P in b&&(b[P].dispose(),delete b[P])}}}function N0(i,e){function t(){let I=!1;const fe=new ft;let Z=null;const pe=new ft(0,0,0,0);return{setMask:function(Me){Z!==Me&&!I&&(i.colorMask(Me,Me,Me,Me),Z=Me)},setLocked:function(Me){I=Me},setClear:function(Me,ie,De,Ce,ct){ct===!0&&(Me*=Ce,ie*=Ce,De*=Ce),fe.set(Me,ie,De,Ce),pe.equals(fe)===!1&&(i.clearColor(Me,ie,De,Ce),pe.copy(fe))},reset:function(){I=!1,Z=null,pe.set(-1,0,0,0)}}}function n(){let I=!1,fe=!1,Z=null,pe=null,Me=null;return{setReversed:function(ie){if(fe!==ie){const De=e.get("EXT_clip_control");ie?De.clipControlEXT(De.LOWER_LEFT_EXT,De.ZERO_TO_ONE_EXT):De.clipControlEXT(De.LOWER_LEFT_EXT,De.NEGATIVE_ONE_TO_ONE_EXT),fe=ie;const Ce=Me;Me=null,this.setClear(Ce)}},getReversed:function(){return fe},setTest:function(ie){ie?Q(i.DEPTH_TEST):he(i.DEPTH_TEST)},setMask:function(ie){Z!==ie&&!I&&(i.depthMask(ie),Z=ie)},setFunc:function(ie){if(fe&&(ie=Au[ie]),pe!==ie){switch(ie){case mo:i.depthFunc(i.NEVER);break;case go:i.depthFunc(i.ALWAYS);break;case _o:i.depthFunc(i.LESS);break;case ts:i.depthFunc(i.LEQUAL);break;case xo:i.depthFunc(i.EQUAL);break;case vo:i.depthFunc(i.GEQUAL);break;case Mo:i.depthFunc(i.GREATER);break;case So:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}pe=ie}},setLocked:function(ie){I=ie},setClear:function(ie){Me!==ie&&(Me=ie,fe&&(ie=1-ie),i.clearDepth(ie))},reset:function(){I=!1,Z=null,pe=null,Me=null,fe=!1}}}function s(){let I=!1,fe=null,Z=null,pe=null,Me=null,ie=null,De=null,Ce=null,ct=null;return{setTest:function(st){I||(st?Q(i.STENCIL_TEST):he(i.STENCIL_TEST))},setMask:function(st){fe!==st&&!I&&(i.stencilMask(st),fe=st)},setFunc:function(st,Vt,Qt){(Z!==st||pe!==Vt||Me!==Qt)&&(i.stencilFunc(st,Vt,Qt),Z=st,pe=Vt,Me=Qt)},setOp:function(st,Vt,Qt){(ie!==st||De!==Vt||Ce!==Qt)&&(i.stencilOp(st,Vt,Qt),ie=st,De=Vt,Ce=Qt)},setLocked:function(st){I=st},setClear:function(st){ct!==st&&(i.clearStencil(st),ct=st)},reset:function(){I=!1,fe=null,Z=null,pe=null,Me=null,ie=null,De=null,Ce=null,ct=null}}}const r=new t,o=new n,a=new s,l=new WeakMap,c=new WeakMap;let h={},d={},u={},f=new WeakMap,g=[],v=null,m=!1,p=null,y=null,A=null,S=null,T=null,w=null,R=null,x=new Ve(0,0,0),b=0,P=!1,N=null,z=null,V=null,U=null,O=null;const J=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let H=!1,se=0;const X=i.getParameter(i.VERSION);X.indexOf("WebGL")!==-1?(se=parseFloat(/^WebGL (\d)/.exec(X)[1]),H=se>=1):X.indexOf("OpenGL ES")!==-1&&(se=parseFloat(/^OpenGL ES (\d)/.exec(X)[1]),H=se>=2);let j=null,te={};const Ae=i.getParameter(i.SCISSOR_BOX),Ee=i.getParameter(i.VIEWPORT),et=new ft().fromArray(Ae),We=new ft().fromArray(Ee);function Ze(I,fe,Z,pe){const Me=new Uint8Array(4),ie=i.createTexture();i.bindTexture(I,ie),i.texParameteri(I,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(I,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let De=0;De<Z;De++)I===i.TEXTURE_3D||I===i.TEXTURE_2D_ARRAY?i.texImage3D(fe,0,i.RGBA,1,1,pe,0,i.RGBA,i.UNSIGNED_BYTE,Me):i.texImage2D(fe+De,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,Me);return ie}const q={};q[i.TEXTURE_2D]=Ze(i.TEXTURE_2D,i.TEXTURE_2D,1),q[i.TEXTURE_CUBE_MAP]=Ze(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),q[i.TEXTURE_2D_ARRAY]=Ze(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),q[i.TEXTURE_3D]=Ze(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),Q(i.DEPTH_TEST),o.setFunc(ts),oe(!1),ce(Qa),Q(i.CULL_FACE),ne(Sn);function Q(I){h[I]!==!0&&(i.enable(I),h[I]=!0)}function he(I){h[I]!==!1&&(i.disable(I),h[I]=!1)}function Ue(I,fe){return u[I]!==fe?(i.bindFramebuffer(I,fe),u[I]=fe,I===i.DRAW_FRAMEBUFFER&&(u[i.FRAMEBUFFER]=fe),I===i.FRAMEBUFFER&&(u[i.DRAW_FRAMEBUFFER]=fe),!0):!1}function Se(I,fe){let Z=g,pe=!1;if(I){Z=f.get(fe),Z===void 0&&(Z=[],f.set(fe,Z));const Me=I.textures;if(Z.length!==Me.length||Z[0]!==i.COLOR_ATTACHMENT0){for(let ie=0,De=Me.length;ie<De;ie++)Z[ie]=i.COLOR_ATTACHMENT0+ie;Z.length=Me.length,pe=!0}}else Z[0]!==i.BACK&&(Z[0]=i.BACK,pe=!0);pe&&i.drawBuffers(Z)}function Re(I){return v!==I?(i.useProgram(I),v=I,!0):!1}const qe={[xi]:i.FUNC_ADD,[Kh]:i.FUNC_SUBTRACT,[Jh]:i.FUNC_REVERSE_SUBTRACT};qe[$h]=i.MIN,qe[Zh]=i.MAX;const $={[Qh]:i.ZERO,[jh]:i.ONE,[eu]:i.SRC_COLOR,[Dc]:i.SRC_ALPHA,[ou]:i.SRC_ALPHA_SATURATE,[su]:i.DST_COLOR,[nu]:i.DST_ALPHA,[tu]:i.ONE_MINUS_SRC_COLOR,[Nc]:i.ONE_MINUS_SRC_ALPHA,[ru]:i.ONE_MINUS_DST_COLOR,[iu]:i.ONE_MINUS_DST_ALPHA,[au]:i.CONSTANT_COLOR,[lu]:i.ONE_MINUS_CONSTANT_COLOR,[cu]:i.CONSTANT_ALPHA,[hu]:i.ONE_MINUS_CONSTANT_ALPHA};function ne(I,fe,Z,pe,Me,ie,De,Ce,ct,st){if(I===Sn){m===!0&&(he(i.BLEND),m=!1);return}if(m===!1&&(Q(i.BLEND),m=!0),I!==qh){if(I!==p||st!==P){if((y!==xi||T!==xi)&&(i.blendEquation(i.FUNC_ADD),y=xi,T=xi),st)switch(I){case $i:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case ja:i.blendFunc(i.ONE,i.ONE);break;case el:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case tl:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:je("WebGLState: Invalid blending: ",I);break}else switch(I){case $i:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case ja:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case el:je("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case tl:je("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:je("WebGLState: Invalid blending: ",I);break}A=null,S=null,w=null,R=null,x.set(0,0,0),b=0,p=I,P=st}return}Me=Me||fe,ie=ie||Z,De=De||pe,(fe!==y||Me!==T)&&(i.blendEquationSeparate(qe[fe],qe[Me]),y=fe,T=Me),(Z!==A||pe!==S||ie!==w||De!==R)&&(i.blendFuncSeparate($[Z],$[pe],$[ie],$[De]),A=Z,S=pe,w=ie,R=De),(Ce.equals(x)===!1||ct!==b)&&(i.blendColor(Ce.r,Ce.g,Ce.b,ct),x.copy(Ce),b=ct),p=I,P=!1}function re(I,fe){I.side===vn?he(i.CULL_FACE):Q(i.CULL_FACE);let Z=I.side===Nt;fe&&(Z=!Z),oe(Z),I.blending===$i&&I.transparent===!1?ne(Sn):ne(I.blending,I.blendEquation,I.blendSrc,I.blendDst,I.blendEquationAlpha,I.blendSrcAlpha,I.blendDstAlpha,I.blendColor,I.blendAlpha,I.premultipliedAlpha),o.setFunc(I.depthFunc),o.setTest(I.depthTest),o.setMask(I.depthWrite),r.setMask(I.colorWrite);const pe=I.stencilWrite;a.setTest(pe),pe&&(a.setMask(I.stencilWriteMask),a.setFunc(I.stencilFunc,I.stencilRef,I.stencilFuncMask),a.setOp(I.stencilFail,I.stencilZFail,I.stencilZPass)),Ne(I.polygonOffset,I.polygonOffsetFactor,I.polygonOffsetUnits),I.alphaToCoverage===!0?Q(i.SAMPLE_ALPHA_TO_COVERAGE):he(i.SAMPLE_ALPHA_TO_COVERAGE)}function oe(I){N!==I&&(I?i.frontFace(i.CW):i.frontFace(i.CCW),N=I)}function ce(I){I!==Wh?(Q(i.CULL_FACE),I!==z&&(I===Qa?i.cullFace(i.BACK):I===Xh?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):he(i.CULL_FACE),z=I}function Fe(I){I!==V&&(H&&i.lineWidth(I),V=I)}function Ne(I,fe,Z){I?(Q(i.POLYGON_OFFSET_FILL),(U!==fe||O!==Z)&&(U=fe,O=Z,o.getReversed()&&(fe=-fe),i.polygonOffset(fe,Z))):he(i.POLYGON_OFFSET_FILL)}function ke(I){I?Q(i.SCISSOR_TEST):he(i.SCISSOR_TEST)}function ze(I){I===void 0&&(I=i.TEXTURE0+J-1),j!==I&&(i.activeTexture(I),j=I)}function C(I,fe,Z){Z===void 0&&(j===null?Z=i.TEXTURE0+J-1:Z=j);let pe=te[Z];pe===void 0&&(pe={type:void 0,texture:void 0},te[Z]=pe),(pe.type!==I||pe.texture!==fe)&&(j!==Z&&(i.activeTexture(Z),j=Z),i.bindTexture(I,fe||q[I]),pe.type=I,pe.texture=fe)}function it(){const I=te[j];I!==void 0&&I.type!==void 0&&(i.bindTexture(I.type,null),I.type=void 0,I.texture=void 0)}function Ke(){try{i.compressedTexImage2D(...arguments)}catch(I){je("WebGLState:",I)}}function E(){try{i.compressedTexImage3D(...arguments)}catch(I){je("WebGLState:",I)}}function _(){try{i.texSubImage2D(...arguments)}catch(I){je("WebGLState:",I)}}function F(){try{i.texSubImage3D(...arguments)}catch(I){je("WebGLState:",I)}}function G(){try{i.compressedTexSubImage2D(...arguments)}catch(I){je("WebGLState:",I)}}function Y(){try{i.compressedTexSubImage3D(...arguments)}catch(I){je("WebGLState:",I)}}function ae(){try{i.texStorage2D(...arguments)}catch(I){je("WebGLState:",I)}}function le(){try{i.texStorage3D(...arguments)}catch(I){je("WebGLState:",I)}}function K(){try{i.texImage2D(...arguments)}catch(I){je("WebGLState:",I)}}function ee(){try{i.texImage3D(...arguments)}catch(I){je("WebGLState:",I)}}function ue(I){return d[I]!==void 0?d[I]:i.getParameter(I)}function Le(I,fe){d[I]!==fe&&(i.pixelStorei(I,fe),d[I]=fe)}function ge(I){et.equals(I)===!1&&(i.scissor(I.x,I.y,I.z,I.w),et.copy(I))}function de(I){We.equals(I)===!1&&(i.viewport(I.x,I.y,I.z,I.w),We.copy(I))}function Ie(I,fe){let Z=c.get(fe);Z===void 0&&(Z=new WeakMap,c.set(fe,Z));let pe=Z.get(I);pe===void 0&&(pe=i.getUniformBlockIndex(fe,I.name),Z.set(I,pe))}function Oe(I,fe){const pe=c.get(fe).get(I);l.get(fe)!==pe&&(i.uniformBlockBinding(fe,pe,I.__bindingPointIndex),l.set(fe,pe))}function He(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),o.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),h={},d={},j=null,te={},u={},f=new WeakMap,g=[],v=null,m=!1,p=null,y=null,A=null,S=null,T=null,w=null,R=null,x=new Ve(0,0,0),b=0,P=!1,N=null,z=null,V=null,U=null,O=null,et.set(0,0,i.canvas.width,i.canvas.height),We.set(0,0,i.canvas.width,i.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:Q,disable:he,bindFramebuffer:Ue,drawBuffers:Se,useProgram:Re,setBlending:ne,setMaterial:re,setFlipSided:oe,setCullFace:ce,setLineWidth:Fe,setPolygonOffset:Ne,setScissorTest:ke,activeTexture:ze,bindTexture:C,unbindTexture:it,compressedTexImage2D:Ke,compressedTexImage3D:E,texImage2D:K,texImage3D:ee,pixelStorei:Le,getParameter:ue,updateUBOMapping:Ie,uniformBlockBinding:Oe,texStorage2D:ae,texStorage3D:le,texSubImage2D:_,texSubImage3D:F,compressedTexSubImage2D:G,compressedTexSubImage3D:Y,scissor:ge,viewport:de,reset:He}}function U0(i,e,t,n,s,r,o){const a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new me,h=new WeakMap,d=new Set;let u;const f=new WeakMap;let g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function v(E,_){return g?new OffscreenCanvas(E,_):lr("canvas")}function m(E,_,F){let G=1;const Y=Ke(E);if((Y.width>F||Y.height>F)&&(G=F/Math.max(Y.width,Y.height)),G<1)if(typeof HTMLImageElement<"u"&&E instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&E instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&E instanceof ImageBitmap||typeof VideoFrame<"u"&&E instanceof VideoFrame){const ae=Math.floor(G*Y.width),le=Math.floor(G*Y.height);u===void 0&&(u=v(ae,le));const K=_?v(ae,le):u;return K.width=ae,K.height=le,K.getContext("2d").drawImage(E,0,0,ae,le),Be("WebGLRenderer: Texture has been resized from ("+Y.width+"x"+Y.height+") to ("+ae+"x"+le+")."),K}else return"data"in E&&Be("WebGLRenderer: Image in DataTexture is too big ("+Y.width+"x"+Y.height+")."),E;return E}function p(E){return E.generateMipmaps}function y(E){i.generateMipmap(E)}function A(E){return E.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:E.isWebGL3DRenderTarget?i.TEXTURE_3D:E.isWebGLArrayRenderTarget||E.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function S(E,_,F,G,Y,ae=!1){if(E!==null){if(i[E]!==void 0)return i[E];Be("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+E+"'")}let le;G&&(le=e.get("EXT_texture_norm16"),le||Be("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let K=_;if(_===i.RED&&(F===i.FLOAT&&(K=i.R32F),F===i.HALF_FLOAT&&(K=i.R16F),F===i.UNSIGNED_BYTE&&(K=i.R8),F===i.UNSIGNED_SHORT&&le&&(K=le.R16_EXT),F===i.SHORT&&le&&(K=le.R16_SNORM_EXT)),_===i.RED_INTEGER&&(F===i.UNSIGNED_BYTE&&(K=i.R8UI),F===i.UNSIGNED_SHORT&&(K=i.R16UI),F===i.UNSIGNED_INT&&(K=i.R32UI),F===i.BYTE&&(K=i.R8I),F===i.SHORT&&(K=i.R16I),F===i.INT&&(K=i.R32I)),_===i.RG&&(F===i.FLOAT&&(K=i.RG32F),F===i.HALF_FLOAT&&(K=i.RG16F),F===i.UNSIGNED_BYTE&&(K=i.RG8),F===i.UNSIGNED_SHORT&&le&&(K=le.RG16_EXT),F===i.SHORT&&le&&(K=le.RG16_SNORM_EXT)),_===i.RG_INTEGER&&(F===i.UNSIGNED_BYTE&&(K=i.RG8UI),F===i.UNSIGNED_SHORT&&(K=i.RG16UI),F===i.UNSIGNED_INT&&(K=i.RG32UI),F===i.BYTE&&(K=i.RG8I),F===i.SHORT&&(K=i.RG16I),F===i.INT&&(K=i.RG32I)),_===i.RGB_INTEGER&&(F===i.UNSIGNED_BYTE&&(K=i.RGB8UI),F===i.UNSIGNED_SHORT&&(K=i.RGB16UI),F===i.UNSIGNED_INT&&(K=i.RGB32UI),F===i.BYTE&&(K=i.RGB8I),F===i.SHORT&&(K=i.RGB16I),F===i.INT&&(K=i.RGB32I)),_===i.RGBA_INTEGER&&(F===i.UNSIGNED_BYTE&&(K=i.RGBA8UI),F===i.UNSIGNED_SHORT&&(K=i.RGBA16UI),F===i.UNSIGNED_INT&&(K=i.RGBA32UI),F===i.BYTE&&(K=i.RGBA8I),F===i.SHORT&&(K=i.RGBA16I),F===i.INT&&(K=i.RGBA32I)),_===i.RGB&&(F===i.UNSIGNED_SHORT&&le&&(K=le.RGB16_EXT),F===i.SHORT&&le&&(K=le.RGB16_SNORM_EXT),F===i.UNSIGNED_INT_5_9_9_9_REV&&(K=i.RGB9_E5),F===i.UNSIGNED_INT_10F_11F_11F_REV&&(K=i.R11F_G11F_B10F)),_===i.RGBA){const ee=ae?ar:Qe.getTransfer(Y);F===i.FLOAT&&(K=i.RGBA32F),F===i.HALF_FLOAT&&(K=i.RGBA16F),F===i.UNSIGNED_BYTE&&(K=ee===ot?i.SRGB8_ALPHA8:i.RGBA8),F===i.UNSIGNED_SHORT&&le&&(K=le.RGBA16_EXT),F===i.SHORT&&le&&(K=le.RGBA16_SNORM_EXT),F===i.UNSIGNED_SHORT_4_4_4_4&&(K=i.RGBA4),F===i.UNSIGNED_SHORT_5_5_5_1&&(K=i.RGB5_A1)}return(K===i.R16F||K===i.R32F||K===i.RG16F||K===i.RG32F||K===i.RGBA16F||K===i.RGBA32F)&&e.get("EXT_color_buffer_float"),K}function T(E,_){let F;return E?_===null||_===ln||_===is?F=i.DEPTH24_STENCIL8:_===Kt?F=i.DEPTH32F_STENCIL8:_===ns&&(F=i.DEPTH24_STENCIL8,Be("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):_===null||_===ln||_===is?F=i.DEPTH_COMPONENT24:_===Kt?F=i.DEPTH_COMPONENT32F:_===ns&&(F=i.DEPTH_COMPONENT16),F}function w(E,_){return p(E)===!0||E.isFramebufferTexture&&E.minFilter!==Tt&&E.minFilter!==Et?Math.log2(Math.max(_.width,_.height))+1:E.mipmaps!==void 0&&E.mipmaps.length>0?E.mipmaps.length:E.isCompressedTexture&&Array.isArray(E.image)?_.mipmaps.length:1}function R(E){const _=E.target;_.removeEventListener("dispose",R),b(_),_.isVideoTexture&&h.delete(_),_.isHTMLTexture&&d.delete(_)}function x(E){const _=E.target;_.removeEventListener("dispose",x),N(_)}function b(E){const _=n.get(E);if(_.__webglInit===void 0)return;const F=E.source,G=f.get(F);if(G){const Y=G[_.__cacheKey];Y.usedTimes--,Y.usedTimes===0&&P(E),Object.keys(G).length===0&&f.delete(F)}n.remove(E)}function P(E){const _=n.get(E);i.deleteTexture(_.__webglTexture);const F=E.source,G=f.get(F);delete G[_.__cacheKey],o.memory.textures--}function N(E){const _=n.get(E);if(E.depthTexture&&(E.depthTexture.dispose(),n.remove(E.depthTexture)),E.isWebGLCubeRenderTarget)for(let G=0;G<6;G++){if(Array.isArray(_.__webglFramebuffer[G]))for(let Y=0;Y<_.__webglFramebuffer[G].length;Y++)i.deleteFramebuffer(_.__webglFramebuffer[G][Y]);else i.deleteFramebuffer(_.__webglFramebuffer[G]);_.__webglDepthbuffer&&i.deleteRenderbuffer(_.__webglDepthbuffer[G])}else{if(Array.isArray(_.__webglFramebuffer))for(let G=0;G<_.__webglFramebuffer.length;G++)i.deleteFramebuffer(_.__webglFramebuffer[G]);else i.deleteFramebuffer(_.__webglFramebuffer);if(_.__webglDepthbuffer&&i.deleteRenderbuffer(_.__webglDepthbuffer),_.__webglMultisampledFramebuffer&&i.deleteFramebuffer(_.__webglMultisampledFramebuffer),_.__webglColorRenderbuffer)for(let G=0;G<_.__webglColorRenderbuffer.length;G++)_.__webglColorRenderbuffer[G]&&i.deleteRenderbuffer(_.__webglColorRenderbuffer[G]);_.__webglDepthRenderbuffer&&i.deleteRenderbuffer(_.__webglDepthRenderbuffer)}const F=E.textures;for(let G=0,Y=F.length;G<Y;G++){const ae=n.get(F[G]);ae.__webglTexture&&(i.deleteTexture(ae.__webglTexture),o.memory.textures--),n.remove(F[G])}n.remove(E)}let z=0;function V(){z=0}function U(){return z}function O(E){z=E}function J(){const E=z;return E>=s.maxTextures&&Be("WebGLTextures: Trying to use "+(E+1)+" texture units while this GPU supports only "+s.maxTextures),z+=1,E}function H(E){const _=[];return _.push(E.wrapS),_.push(E.wrapT),_.push(E.wrapR||0),_.push(E.magFilter),_.push(E.minFilter),_.push(E.anisotropy),_.push(E.internalFormat),_.push(E.format),_.push(E.type),_.push(E.generateMipmaps),_.push(E.premultiplyAlpha),_.push(E.flipY),_.push(E.unpackAlignment),_.push(E.colorSpace),_.join()}function se(E,_){const F=n.get(E);if(E.isVideoTexture&&C(E),E.isRenderTargetTexture===!1&&E.isExternalTexture!==!0&&E.version>0&&F.__version!==E.version){const G=E.image;if(G===null)Be("WebGLRenderer: Texture marked for update but no image data found.");else if(G.complete===!1)Be("WebGLRenderer: Texture marked for update but image is incomplete");else{he(F,E,_);return}}else E.isExternalTexture&&(F.__webglTexture=E.sourceTexture?E.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,F.__webglTexture,i.TEXTURE0+_)}function X(E,_){const F=n.get(E);if(E.isRenderTargetTexture===!1&&E.version>0&&F.__version!==E.version){he(F,E,_);return}else E.isExternalTexture&&(F.__webglTexture=E.sourceTexture?E.sourceTexture:null);t.bindTexture(i.TEXTURE_2D_ARRAY,F.__webglTexture,i.TEXTURE0+_)}function j(E,_){const F=n.get(E);if(E.isRenderTargetTexture===!1&&E.version>0&&F.__version!==E.version){he(F,E,_);return}t.bindTexture(i.TEXTURE_3D,F.__webglTexture,i.TEXTURE0+_)}function te(E,_){const F=n.get(E);if(E.isCubeDepthTexture!==!0&&E.version>0&&F.__version!==E.version){Ue(F,E,_);return}t.bindTexture(i.TEXTURE_CUBE_MAP,F.__webglTexture,i.TEXTURE0+_)}const Ae={[yo]:i.REPEAT,[Mn]:i.CLAMP_TO_EDGE,[Eo]:i.MIRRORED_REPEAT},Ee={[Tt]:i.NEAREST,[fu]:i.NEAREST_MIPMAP_NEAREST,[fs]:i.NEAREST_MIPMAP_LINEAR,[Et]:i.LINEAR,[br]:i.LINEAR_MIPMAP_NEAREST,[Wn]:i.LINEAR_MIPMAP_LINEAR},et={[_u]:i.NEVER,[yu]:i.ALWAYS,[xu]:i.LESS,[Ma]:i.LEQUAL,[vu]:i.EQUAL,[Sa]:i.GEQUAL,[Mu]:i.GREATER,[Su]:i.NOTEQUAL};function We(E,_){if(_.type===Kt&&e.has("OES_texture_float_linear")===!1&&(_.magFilter===Et||_.magFilter===br||_.magFilter===fs||_.magFilter===Wn||_.minFilter===Et||_.minFilter===br||_.minFilter===fs||_.minFilter===Wn)&&Be("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(E,i.TEXTURE_WRAP_S,Ae[_.wrapS]),i.texParameteri(E,i.TEXTURE_WRAP_T,Ae[_.wrapT]),(E===i.TEXTURE_3D||E===i.TEXTURE_2D_ARRAY)&&i.texParameteri(E,i.TEXTURE_WRAP_R,Ae[_.wrapR]),i.texParameteri(E,i.TEXTURE_MAG_FILTER,Ee[_.magFilter]),i.texParameteri(E,i.TEXTURE_MIN_FILTER,Ee[_.minFilter]),_.compareFunction&&(i.texParameteri(E,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(E,i.TEXTURE_COMPARE_FUNC,et[_.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(_.magFilter===Tt||_.minFilter!==fs&&_.minFilter!==Wn||_.type===Kt&&e.has("OES_texture_float_linear")===!1)return;if(_.anisotropy>1||n.get(_).__currentAnisotropy){const F=e.get("EXT_texture_filter_anisotropic");i.texParameterf(E,F.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(_.anisotropy,s.getMaxAnisotropy())),n.get(_).__currentAnisotropy=_.anisotropy}}}function Ze(E,_){let F=!1;E.__webglInit===void 0&&(E.__webglInit=!0,_.addEventListener("dispose",R));const G=_.source;let Y=f.get(G);Y===void 0&&(Y={},f.set(G,Y));const ae=H(_);if(ae!==E.__cacheKey){Y[ae]===void 0&&(Y[ae]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,F=!0),Y[ae].usedTimes++;const le=Y[E.__cacheKey];le!==void 0&&(Y[E.__cacheKey].usedTimes--,le.usedTimes===0&&P(_)),E.__cacheKey=ae,E.__webglTexture=Y[ae].texture}return F}function q(E,_,F){return Math.floor(Math.floor(E/F)/_)}function Q(E,_,F,G){const ae=E.updateRanges;if(ae.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,_.width,_.height,F,G,_.data);else{ae.sort((Le,ge)=>Le.start-ge.start);let le=0;for(let Le=1;Le<ae.length;Le++){const ge=ae[le],de=ae[Le],Ie=ge.start+ge.count,Oe=q(de.start,_.width,4),He=q(ge.start,_.width,4);de.start<=Ie+1&&Oe===He&&q(de.start+de.count-1,_.width,4)===Oe?ge.count=Math.max(ge.count,de.start+de.count-ge.start):(++le,ae[le]=de)}ae.length=le+1;const K=t.getParameter(i.UNPACK_ROW_LENGTH),ee=t.getParameter(i.UNPACK_SKIP_PIXELS),ue=t.getParameter(i.UNPACK_SKIP_ROWS);t.pixelStorei(i.UNPACK_ROW_LENGTH,_.width);for(let Le=0,ge=ae.length;Le<ge;Le++){const de=ae[Le],Ie=Math.floor(de.start/4),Oe=Math.ceil(de.count/4),He=Ie%_.width,I=Math.floor(Ie/_.width),fe=Oe,Z=1;t.pixelStorei(i.UNPACK_SKIP_PIXELS,He),t.pixelStorei(i.UNPACK_SKIP_ROWS,I),t.texSubImage2D(i.TEXTURE_2D,0,He,I,fe,Z,F,G,_.data)}E.clearUpdateRanges(),t.pixelStorei(i.UNPACK_ROW_LENGTH,K),t.pixelStorei(i.UNPACK_SKIP_PIXELS,ee),t.pixelStorei(i.UNPACK_SKIP_ROWS,ue)}}function he(E,_,F){let G=i.TEXTURE_2D;(_.isDataArrayTexture||_.isCompressedArrayTexture)&&(G=i.TEXTURE_2D_ARRAY),_.isData3DTexture&&(G=i.TEXTURE_3D);const Y=Ze(E,_),ae=_.source;t.bindTexture(G,E.__webglTexture,i.TEXTURE0+F);const le=n.get(ae);if(ae.version!==le.__version||Y===!0){if(t.activeTexture(i.TEXTURE0+F),(typeof ImageBitmap<"u"&&_.image instanceof ImageBitmap)===!1){const Z=Qe.getPrimaries(Qe.workingColorSpace),pe=_.colorSpace===Nn?null:Qe.getPrimaries(_.colorSpace),Me=_.colorSpace===Nn||Z===pe?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,_.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Me)}t.pixelStorei(i.UNPACK_ALIGNMENT,_.unpackAlignment);let ee=m(_.image,!1,s.maxTextureSize);ee=it(_,ee);const ue=r.convert(_.format,_.colorSpace),Le=r.convert(_.type);let ge=S(_.internalFormat,ue,Le,_.normalized,_.colorSpace,_.isVideoTexture);We(G,_);let de;const Ie=_.mipmaps,Oe=_.isVideoTexture!==!0,He=le.__version===void 0||Y===!0,I=ae.dataReady,fe=w(_,ee);if(_.isDepthTexture)ge=T(_.format===Xn,_.type),He&&(Oe?t.texStorage2D(i.TEXTURE_2D,1,ge,ee.width,ee.height):t.texImage2D(i.TEXTURE_2D,0,ge,ee.width,ee.height,0,ue,Le,null));else if(_.isDataTexture)if(Ie.length>0){Oe&&He&&t.texStorage2D(i.TEXTURE_2D,fe,ge,Ie[0].width,Ie[0].height);for(let Z=0,pe=Ie.length;Z<pe;Z++)de=Ie[Z],Oe?I&&t.texSubImage2D(i.TEXTURE_2D,Z,0,0,de.width,de.height,ue,Le,de.data):t.texImage2D(i.TEXTURE_2D,Z,ge,de.width,de.height,0,ue,Le,de.data);_.generateMipmaps=!1}else Oe?(He&&t.texStorage2D(i.TEXTURE_2D,fe,ge,ee.width,ee.height),I&&Q(_,ee,ue,Le)):t.texImage2D(i.TEXTURE_2D,0,ge,ee.width,ee.height,0,ue,Le,ee.data);else if(_.isCompressedTexture)if(_.isCompressedArrayTexture){Oe&&He&&t.texStorage3D(i.TEXTURE_2D_ARRAY,fe,ge,Ie[0].width,Ie[0].height,ee.depth);for(let Z=0,pe=Ie.length;Z<pe;Z++)if(de=Ie[Z],_.format!==Jt)if(ue!==null)if(Oe){if(I)if(_.layerUpdates.size>0){const Me=Gl(de.width,de.height,_.format,_.type);for(const ie of _.layerUpdates){const De=de.data.subarray(ie*Me/de.data.BYTES_PER_ELEMENT,(ie+1)*Me/de.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,Z,0,0,ie,de.width,de.height,1,ue,De)}}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,Z,0,0,0,de.width,de.height,ee.depth,ue,de.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,Z,ge,de.width,de.height,ee.depth,0,de.data,0,0);else Be("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Oe?I&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,Z,0,0,0,de.width,de.height,ee.depth,ue,Le,de.data):t.texImage3D(i.TEXTURE_2D_ARRAY,Z,ge,de.width,de.height,ee.depth,0,ue,Le,de.data);_.layerUpdates.size>0&&_.clearLayerUpdates()}else{Oe&&He&&t.texStorage2D(i.TEXTURE_2D,fe,ge,Ie[0].width,Ie[0].height);for(let Z=0,pe=Ie.length;Z<pe;Z++)de=Ie[Z],_.format!==Jt?ue!==null?Oe?I&&t.compressedTexSubImage2D(i.TEXTURE_2D,Z,0,0,de.width,de.height,ue,de.data):t.compressedTexImage2D(i.TEXTURE_2D,Z,ge,de.width,de.height,0,de.data):Be("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Oe?I&&t.texSubImage2D(i.TEXTURE_2D,Z,0,0,de.width,de.height,ue,Le,de.data):t.texImage2D(i.TEXTURE_2D,Z,ge,de.width,de.height,0,ue,Le,de.data)}else if(_.isDataArrayTexture)if(Oe){if(He&&t.texStorage3D(i.TEXTURE_2D_ARRAY,fe,ge,ee.width,ee.height,ee.depth),I)if(_.layerUpdates.size>0){const Z=Gl(ee.width,ee.height,_.format,_.type);for(const pe of _.layerUpdates){const Me=ee.data.subarray(pe*Z/ee.data.BYTES_PER_ELEMENT,(pe+1)*Z/ee.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,pe,ee.width,ee.height,1,ue,Le,Me)}_.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,ee.width,ee.height,ee.depth,ue,Le,ee.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,ge,ee.width,ee.height,ee.depth,0,ue,Le,ee.data);else if(_.isData3DTexture)Oe?(He&&t.texStorage3D(i.TEXTURE_3D,fe,ge,ee.width,ee.height,ee.depth),I&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,ee.width,ee.height,ee.depth,ue,Le,ee.data)):t.texImage3D(i.TEXTURE_3D,0,ge,ee.width,ee.height,ee.depth,0,ue,Le,ee.data);else if(_.isFramebufferTexture){if(He)if(Oe)t.texStorage2D(i.TEXTURE_2D,fe,ge,ee.width,ee.height);else{let Z=ee.width,pe=ee.height;for(let Me=0;Me<fe;Me++)t.texImage2D(i.TEXTURE_2D,Me,ge,Z,pe,0,ue,Le,null),Z>>=1,pe>>=1}}else if(_.isHTMLTexture){if("texElementImage2D"in i){const Z=i.canvas;if(Z.hasAttribute("layoutsubtree")||Z.setAttribute("layoutsubtree","true"),ee.parentNode!==Z){Z.appendChild(ee),d.add(_),Z.onpaint=pe=>{const Me=pe.changedElements;for(const ie of d)Me.includes(ie.image)&&(ie.needsUpdate=!0)},Z.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,ee);else{const Me=i.RGBA,ie=i.RGBA,De=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,Me,ie,De,ee)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(Ie.length>0){if(Oe&&He){const Z=Ke(Ie[0]);t.texStorage2D(i.TEXTURE_2D,fe,ge,Z.width,Z.height)}for(let Z=0,pe=Ie.length;Z<pe;Z++)de=Ie[Z],Oe?I&&t.texSubImage2D(i.TEXTURE_2D,Z,0,0,ue,Le,de):t.texImage2D(i.TEXTURE_2D,Z,ge,ue,Le,de);_.generateMipmaps=!1}else if(Oe){if(He){const Z=Ke(ee);t.texStorage2D(i.TEXTURE_2D,fe,ge,Z.width,Z.height)}I&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,ue,Le,ee)}else t.texImage2D(i.TEXTURE_2D,0,ge,ue,Le,ee);p(_)&&y(G),le.__version=ae.version,_.onUpdate&&_.onUpdate(_)}E.__version=_.version}function Ue(E,_,F){if(_.image.length!==6)return;const G=Ze(E,_),Y=_.source;t.bindTexture(i.TEXTURE_CUBE_MAP,E.__webglTexture,i.TEXTURE0+F);const ae=n.get(Y);if(Y.version!==ae.__version||G===!0){t.activeTexture(i.TEXTURE0+F);const le=Qe.getPrimaries(Qe.workingColorSpace),K=_.colorSpace===Nn?null:Qe.getPrimaries(_.colorSpace),ee=_.colorSpace===Nn||le===K?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,_.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),t.pixelStorei(i.UNPACK_ALIGNMENT,_.unpackAlignment),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ee);const ue=_.isCompressedTexture||_.image[0].isCompressedTexture,Le=_.image[0]&&_.image[0].isDataTexture,ge=[];for(let ie=0;ie<6;ie++)!ue&&!Le?ge[ie]=m(_.image[ie],!0,s.maxCubemapSize):ge[ie]=Le?_.image[ie].image:_.image[ie],ge[ie]=it(_,ge[ie]);const de=ge[0],Ie=r.convert(_.format,_.colorSpace),Oe=r.convert(_.type),He=S(_.internalFormat,Ie,Oe,_.normalized,_.colorSpace),I=_.isVideoTexture!==!0,fe=ae.__version===void 0||G===!0,Z=Y.dataReady;let pe=w(_,de);We(i.TEXTURE_CUBE_MAP,_);let Me;if(ue){I&&fe&&t.texStorage2D(i.TEXTURE_CUBE_MAP,pe,He,de.width,de.height);for(let ie=0;ie<6;ie++){Me=ge[ie].mipmaps;for(let De=0;De<Me.length;De++){const Ce=Me[De];_.format!==Jt?Ie!==null?I?Z&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,De,0,0,Ce.width,Ce.height,Ie,Ce.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,De,He,Ce.width,Ce.height,0,Ce.data):Be("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):I?Z&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,De,0,0,Ce.width,Ce.height,Ie,Oe,Ce.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,De,He,Ce.width,Ce.height,0,Ie,Oe,Ce.data)}}}else{if(Me=_.mipmaps,I&&fe){Me.length>0&&pe++;const ie=Ke(ge[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,pe,He,ie.width,ie.height)}for(let ie=0;ie<6;ie++)if(Le){I?Z&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,0,0,ge[ie].width,ge[ie].height,Ie,Oe,ge[ie].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,He,ge[ie].width,ge[ie].height,0,Ie,Oe,ge[ie].data);for(let De=0;De<Me.length;De++){const ct=Me[De].image[ie].image;I?Z&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,De+1,0,0,ct.width,ct.height,Ie,Oe,ct.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,De+1,He,ct.width,ct.height,0,Ie,Oe,ct.data)}}else{I?Z&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,0,0,Ie,Oe,ge[ie]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,He,Ie,Oe,ge[ie]);for(let De=0;De<Me.length;De++){const Ce=Me[De];I?Z&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,De+1,0,0,Ie,Oe,Ce.image[ie]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,De+1,He,Ie,Oe,Ce.image[ie])}}}p(_)&&y(i.TEXTURE_CUBE_MAP),ae.__version=Y.version,_.onUpdate&&_.onUpdate(_)}E.__version=_.version}function Se(E,_,F,G,Y,ae){const le=r.convert(F.format,F.colorSpace),K=r.convert(F.type),ee=S(F.internalFormat,le,K,F.normalized,F.colorSpace),ue=n.get(_),Le=n.get(F);if(Le.__renderTarget=_,!ue.__hasExternalTextures){const ge=Math.max(1,_.width>>ae),de=Math.max(1,_.height>>ae);Y===i.TEXTURE_3D||Y===i.TEXTURE_2D_ARRAY?t.texImage3D(Y,ae,ee,ge,de,_.depth,0,le,K,null):t.texImage2D(Y,ae,ee,ge,de,0,le,K,null)}t.bindFramebuffer(i.FRAMEBUFFER,E),ze(_)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,G,Y,Le.__webglTexture,0,ke(_)):(Y===i.TEXTURE_2D||Y>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&Y<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,G,Y,Le.__webglTexture,ae),t.bindFramebuffer(i.FRAMEBUFFER,null)}function Re(E,_,F){if(i.bindRenderbuffer(i.RENDERBUFFER,E),_.depthBuffer){const G=_.depthTexture,Y=G&&G.isDepthTexture?G.type:null,ae=T(_.stencilBuffer,Y),le=_.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;ze(_)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ke(_),ae,_.width,_.height):F?i.renderbufferStorageMultisample(i.RENDERBUFFER,ke(_),ae,_.width,_.height):i.renderbufferStorage(i.RENDERBUFFER,ae,_.width,_.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,le,i.RENDERBUFFER,E)}else{const G=_.textures;for(let Y=0;Y<G.length;Y++){const ae=G[Y],le=r.convert(ae.format,ae.colorSpace),K=r.convert(ae.type),ee=S(ae.internalFormat,le,K,ae.normalized,ae.colorSpace);ze(_)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ke(_),ee,_.width,_.height):F?i.renderbufferStorageMultisample(i.RENDERBUFFER,ke(_),ee,_.width,_.height):i.renderbufferStorage(i.RENDERBUFFER,ee,_.width,_.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function qe(E,_,F){const G=_.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(i.FRAMEBUFFER,E),!(_.depthTexture&&_.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");const Y=n.get(_.depthTexture);if(Y.__renderTarget=_,(!Y.__webglTexture||_.depthTexture.image.width!==_.width||_.depthTexture.image.height!==_.height)&&(_.depthTexture.image.width=_.width,_.depthTexture.image.height=_.height,_.depthTexture.needsUpdate=!0),G){if(Y.__webglInit===void 0&&(Y.__webglInit=!0,_.depthTexture.addEventListener("dispose",R)),Y.__webglTexture===void 0){Y.__webglTexture=i.createTexture(),t.bindTexture(i.TEXTURE_CUBE_MAP,Y.__webglTexture),We(i.TEXTURE_CUBE_MAP,_.depthTexture);const ue=r.convert(_.depthTexture.format),Le=r.convert(_.depthTexture.type);let ge;_.depthTexture.format===En?ge=i.DEPTH_COMPONENT24:_.depthTexture.format===Xn&&(ge=i.DEPTH24_STENCIL8);for(let de=0;de<6;de++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,0,ge,_.width,_.height,0,ue,Le,null)}}else se(_.depthTexture,0);const ae=Y.__webglTexture,le=ke(_),K=G?i.TEXTURE_CUBE_MAP_POSITIVE_X+F:i.TEXTURE_2D,ee=_.depthTexture.format===Xn?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(_.depthTexture.format===En)ze(_)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ee,K,ae,0,le):i.framebufferTexture2D(i.FRAMEBUFFER,ee,K,ae,0);else if(_.depthTexture.format===Xn)ze(_)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ee,K,ae,0,le):i.framebufferTexture2D(i.FRAMEBUFFER,ee,K,ae,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function $(E){const _=n.get(E),F=E.isWebGLCubeRenderTarget===!0;if(_.__boundDepthTexture!==E.depthTexture){const G=E.depthTexture;if(_.__depthDisposeCallback&&_.__depthDisposeCallback(),G){const Y=()=>{delete _.__boundDepthTexture,delete _.__depthDisposeCallback,G.removeEventListener("dispose",Y)};G.addEventListener("dispose",Y),_.__depthDisposeCallback=Y}_.__boundDepthTexture=G}if(E.depthTexture&&!_.__autoAllocateDepthBuffer)if(F)for(let G=0;G<6;G++)qe(_.__webglFramebuffer[G],E,G);else{const G=E.texture.mipmaps;G&&G.length>0?qe(_.__webglFramebuffer[0],E,0):qe(_.__webglFramebuffer,E,0)}else if(F){_.__webglDepthbuffer=[];for(let G=0;G<6;G++)if(t.bindFramebuffer(i.FRAMEBUFFER,_.__webglFramebuffer[G]),_.__webglDepthbuffer[G]===void 0)_.__webglDepthbuffer[G]=i.createRenderbuffer(),Re(_.__webglDepthbuffer[G],E,!1);else{const Y=E.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ae=_.__webglDepthbuffer[G];i.bindRenderbuffer(i.RENDERBUFFER,ae),i.framebufferRenderbuffer(i.FRAMEBUFFER,Y,i.RENDERBUFFER,ae)}}else{const G=E.texture.mipmaps;if(G&&G.length>0?t.bindFramebuffer(i.FRAMEBUFFER,_.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,_.__webglFramebuffer),_.__webglDepthbuffer===void 0)_.__webglDepthbuffer=i.createRenderbuffer(),Re(_.__webglDepthbuffer,E,!1);else{const Y=E.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ae=_.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,ae),i.framebufferRenderbuffer(i.FRAMEBUFFER,Y,i.RENDERBUFFER,ae)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function ne(E,_,F){const G=n.get(E);_!==void 0&&Se(G.__webglFramebuffer,E,E.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),F!==void 0&&$(E)}function re(E){const _=E.texture,F=n.get(E),G=n.get(_);E.addEventListener("dispose",x);const Y=E.textures,ae=E.isWebGLCubeRenderTarget===!0,le=Y.length>1;if(le||(G.__webglTexture===void 0&&(G.__webglTexture=i.createTexture()),G.__version=_.version,o.memory.textures++),ae){F.__webglFramebuffer=[];for(let K=0;K<6;K++)if(_.mipmaps&&_.mipmaps.length>0){F.__webglFramebuffer[K]=[];for(let ee=0;ee<_.mipmaps.length;ee++)F.__webglFramebuffer[K][ee]=i.createFramebuffer()}else F.__webglFramebuffer[K]=i.createFramebuffer()}else{if(_.mipmaps&&_.mipmaps.length>0){F.__webglFramebuffer=[];for(let K=0;K<_.mipmaps.length;K++)F.__webglFramebuffer[K]=i.createFramebuffer()}else F.__webglFramebuffer=i.createFramebuffer();if(le)for(let K=0,ee=Y.length;K<ee;K++){const ue=n.get(Y[K]);ue.__webglTexture===void 0&&(ue.__webglTexture=i.createTexture(),o.memory.textures++)}if(E.samples>0&&ze(E)===!1){F.__webglMultisampledFramebuffer=i.createFramebuffer(),F.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,F.__webglMultisampledFramebuffer);for(let K=0;K<Y.length;K++){const ee=Y[K];F.__webglColorRenderbuffer[K]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,F.__webglColorRenderbuffer[K]);const ue=r.convert(ee.format,ee.colorSpace),Le=r.convert(ee.type),ge=S(ee.internalFormat,ue,Le,ee.normalized,ee.colorSpace,E.isXRRenderTarget===!0),de=ke(E);i.renderbufferStorageMultisample(i.RENDERBUFFER,de,ge,E.width,E.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+K,i.RENDERBUFFER,F.__webglColorRenderbuffer[K])}i.bindRenderbuffer(i.RENDERBUFFER,null),E.depthBuffer&&(F.__webglDepthRenderbuffer=i.createRenderbuffer(),Re(F.__webglDepthRenderbuffer,E,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(ae){t.bindTexture(i.TEXTURE_CUBE_MAP,G.__webglTexture),We(i.TEXTURE_CUBE_MAP,_);for(let K=0;K<6;K++)if(_.mipmaps&&_.mipmaps.length>0)for(let ee=0;ee<_.mipmaps.length;ee++)Se(F.__webglFramebuffer[K][ee],E,_,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+K,ee);else Se(F.__webglFramebuffer[K],E,_,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+K,0);p(_)&&y(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(le){for(let K=0,ee=Y.length;K<ee;K++){const ue=Y[K],Le=n.get(ue);let ge=i.TEXTURE_2D;(E.isWebGL3DRenderTarget||E.isWebGLArrayRenderTarget)&&(ge=E.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(ge,Le.__webglTexture),We(ge,ue),Se(F.__webglFramebuffer,E,ue,i.COLOR_ATTACHMENT0+K,ge,0),p(ue)&&y(ge)}t.unbindTexture()}else{let K=i.TEXTURE_2D;if((E.isWebGL3DRenderTarget||E.isWebGLArrayRenderTarget)&&(K=E.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(K,G.__webglTexture),We(K,_),_.mipmaps&&_.mipmaps.length>0)for(let ee=0;ee<_.mipmaps.length;ee++)Se(F.__webglFramebuffer[ee],E,_,i.COLOR_ATTACHMENT0,K,ee);else Se(F.__webglFramebuffer,E,_,i.COLOR_ATTACHMENT0,K,0);p(_)&&y(K),t.unbindTexture()}E.depthBuffer&&$(E)}function oe(E){const _=E.textures;for(let F=0,G=_.length;F<G;F++){const Y=_[F];if(p(Y)){const ae=A(E),le=n.get(Y).__webglTexture;t.bindTexture(ae,le),y(ae),t.unbindTexture()}}}const ce=[],Fe=[];function Ne(E){if(E.samples>0){if(ze(E)===!1){const _=E.textures,F=E.width,G=E.height;let Y=i.COLOR_BUFFER_BIT;const ae=E.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,le=n.get(E),K=_.length>1;if(K)for(let ue=0;ue<_.length;ue++)t.bindFramebuffer(i.FRAMEBUFFER,le.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ue,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,le.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ue,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,le.__webglMultisampledFramebuffer);const ee=E.texture.mipmaps;ee&&ee.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,le.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,le.__webglFramebuffer);for(let ue=0;ue<_.length;ue++){if(E.resolveDepthBuffer&&(E.depthBuffer&&(Y|=i.DEPTH_BUFFER_BIT),E.stencilBuffer&&E.resolveStencilBuffer&&(Y|=i.STENCIL_BUFFER_BIT)),K){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,le.__webglColorRenderbuffer[ue]);const Le=n.get(_[ue]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Le,0)}i.blitFramebuffer(0,0,F,G,0,0,F,G,Y,i.NEAREST),l===!0&&(ce.length=0,Fe.length=0,ce.push(i.COLOR_ATTACHMENT0+ue),E.depthBuffer&&E.storeMultisampledDepthBuffer===!1&&(ce.push(ae),Fe.push(ae),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,Fe)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,ce))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),K)for(let ue=0;ue<_.length;ue++){t.bindFramebuffer(i.FRAMEBUFFER,le.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ue,i.RENDERBUFFER,le.__webglColorRenderbuffer[ue]);const Le=n.get(_[ue]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,le.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ue,i.TEXTURE_2D,Le,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,le.__webglMultisampledFramebuffer)}else if(E.depthBuffer&&E.storeMultisampledDepthBuffer===!1&&l){const _=E.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[_])}}}function ke(E){return Math.min(s.maxSamples,E.samples)}function ze(E){const _=n.get(E);return E.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&_.__useRenderToTexture!==!1}function C(E){const _=o.render.frame;h.get(E)!==_&&(h.set(E,_),E.update())}function it(E,_){const F=E.colorSpace,G=E.format,Y=E.type;return E.isCompressedTexture===!0||E.isVideoTexture===!0||F!==or&&F!==Nn&&(Qe.getTransfer(F)===ot?(G!==Jt||Y!==Bt)&&Be("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):je("WebGLTextures: Unsupported texture color space:",F)),_}function Ke(E){return typeof HTMLImageElement<"u"&&E instanceof HTMLImageElement?(c.width=E.naturalWidth||E.width,c.height=E.naturalHeight||E.height):typeof VideoFrame<"u"&&E instanceof VideoFrame?(c.width=E.displayWidth,c.height=E.displayHeight):(c.width=E.width,c.height=E.height),c}this.allocateTextureUnit=J,this.resetTextureUnits=V,this.getTextureUnits=U,this.setTextureUnits=O,this.setTexture2D=se,this.setTexture2DArray=X,this.setTexture3D=j,this.setTextureCube=te,this.rebindTextures=ne,this.setupRenderTarget=re,this.updateRenderTargetMipmap=oe,this.updateMultisampleRenderTarget=Ne,this.setupDepthRenderbuffer=$,this.setupFrameBufferTexture=Se,this.useMultisampledRTT=ze,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function F0(i,e){function t(n,s=Nn){let r;const o=Qe.getTransfer(s);if(n===Bt)return i.UNSIGNED_BYTE;if(n===pa)return i.UNSIGNED_SHORT_4_4_4_4;if(n===ma)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Xc)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Yc)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===Vc)return i.BYTE;if(n===Wc)return i.SHORT;if(n===ns)return i.UNSIGNED_SHORT;if(n===fa)return i.INT;if(n===ln)return i.UNSIGNED_INT;if(n===Kt)return i.FLOAT;if(n===cn)return i.HALF_FLOAT;if(n===qc)return i.ALPHA;if(n===Kc)return i.RGB;if(n===Jt)return i.RGBA;if(n===En)return i.DEPTH_COMPONENT;if(n===Xn)return i.DEPTH_STENCIL;if(n===ga)return i.RED;if(n===_a)return i.RED_INTEGER;if(n===Jn)return i.RG;if(n===xa)return i.RG_INTEGER;if(n===va)return i.RGBA_INTEGER;if(n===Zs||n===Qs||n===js||n===er)if(o===ot)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Zs)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Qs)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===js)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===er)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Zs)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Qs)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===js)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===er)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===wo||n===To||n===bo||n===Ao)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===wo)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===To)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===bo)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Ao)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Ro||n===Co||n===Po||n===Lo||n===Io||n===sr||n===Do)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Ro||n===Co)return o===ot?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Po)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===Lo)return r.COMPRESSED_R11_EAC;if(n===Io)return r.COMPRESSED_SIGNED_R11_EAC;if(n===sr)return r.COMPRESSED_RG11_EAC;if(n===Do)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===No||n===Uo||n===Fo||n===Oo||n===Bo||n===ko||n===zo||n===Go||n===Ho||n===Vo||n===Wo||n===Xo||n===Yo||n===qo)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===No)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Uo)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Fo)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Oo)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Bo)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===ko)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===zo)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Go)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Ho)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Vo)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Wo)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Xo)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Yo)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===qo)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Ko||n===Jo||n===$o)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===Ko)return o===ot?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Jo)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===$o)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Zo||n===Qo||n===rr||n===jo)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===Zo)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Qo)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===rr)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===jo)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===is?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}const O0=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,B0=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class k0{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const n=new nh(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new hn({vertexShader:O0,fragmentShader:B0,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new gt(new ei(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class z0 extends Qn{constructor(e,t){super();const n=this;let s=null,r=1,o=null,a="local-floor",l=1,c=null,h=null,d=null,u=null,f=null,g=null;const v=typeof XRWebGLBinding<"u",m=new k0,p={},y=t.getContextAttributes();let A=null,S=null;const T=[],w=[],R=new me;let x=null,b=null;const P=new qt;P.viewport=new ft;const N=new qt;N.viewport=new ft;const z=[P,N],V=new Yd;let U=null,O=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(q){let Q=T[q];return Q===void 0&&(Q=new Nr,T[q]=Q),Q.getTargetRaySpace()},this.getControllerGrip=function(q){let Q=T[q];return Q===void 0&&(Q=new Nr,T[q]=Q),Q.getGripSpace()},this.getHand=function(q){let Q=T[q];return Q===void 0&&(Q=new Nr,T[q]=Q),Q.getHandSpace()};function J(q){const Q=w.indexOf(q.inputSource);if(Q===-1)return;const he=T[Q];he!==void 0&&(he.update(q.inputSource,q.frame,c||o),he.dispatchEvent({type:q.type,data:q.inputSource}))}function H(){s.removeEventListener("select",J),s.removeEventListener("selectstart",J),s.removeEventListener("selectend",J),s.removeEventListener("squeeze",J),s.removeEventListener("squeezestart",J),s.removeEventListener("squeezeend",J),s.removeEventListener("end",H),s.removeEventListener("inputsourceschange",se);for(let q=0;q<T.length;q++){const Q=w[q];Q!==null&&(w[q]=null,T[q].disconnect(Q))}U=null,O=null,m.reset();for(const q in p)delete p[q];if(e.setRenderTarget(A),f=null,u=null,d=null,s=null,S=null,Ze.stop(),n.isPresenting=!1,e.setPixelRatio(x),e.setSize(R.width,R.height,!1),b!==null){const q=b.camera;q.fov=b.fov,q.zoom=b.zoom,q.updateProjectionMatrix(),b=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(q){r=q,n.isPresenting===!0&&Be("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(q){a=q,n.isPresenting===!0&&Be("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(q){c=q},this.getBaseLayer=function(){return u!==null?u:f},this.getBinding=function(){return d===null&&v&&(d=new XRWebGLBinding(s,t)),d},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(q){if(s=q,s!==null){if(A=e.getRenderTarget(),s.addEventListener("select",J),s.addEventListener("selectstart",J),s.addEventListener("selectend",J),s.addEventListener("squeeze",J),s.addEventListener("squeezestart",J),s.addEventListener("squeezeend",J),s.addEventListener("end",H),s.addEventListener("inputsourceschange",se),y.xrCompatible!==!0&&await t.makeXRCompatible(),x=e.getPixelRatio(),e.getSize(R),v&&"createProjectionLayer"in XRWebGLBinding.prototype){let he=null,Ue=null,Se=null;y.depth&&(Se=y.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,he=y.stencil?Xn:En,Ue=y.stencil?is:ln);const Re={colorFormat:t.RGBA8,depthFormat:Se,scaleFactor:r};d=this.getBinding(),u=d.createProjectionLayer(Re),s.updateRenderState({layers:[u]}),e.setPixelRatio(1),e.setSize(u.textureWidth,u.textureHeight,!1),S=new Zt(u.textureWidth,u.textureHeight,{format:Jt,type:Bt,depthTexture:new rs(u.textureWidth,u.textureHeight,Ue,void 0,void 0,void 0,void 0,void 0,void 0,he),stencilBuffer:y.stencil,colorSpace:e.outputColorSpace,samples:y.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1,storeMultisampledDepthBuffer:u.ignoreDepthValues===!1,storeMultisampledStencilBuffer:u.ignoreDepthValues===!1})}else{const he={antialias:y.antialias,alpha:!0,depth:y.depth,stencil:y.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,t,he),s.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),S=new Zt(f.framebufferWidth,f.framebufferHeight,{format:Jt,type:Bt,colorSpace:e.outputColorSpace,stencilBuffer:y.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}S.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await s.requestReferenceSpace(a),Ze.setContext(s),Ze.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function se(q){for(let Q=0;Q<q.removed.length;Q++){const he=q.removed[Q],Ue=w.indexOf(he);Ue>=0&&(w[Ue]=null,T[Ue].disconnect(he))}for(let Q=0;Q<q.added.length;Q++){const he=q.added[Q];let Ue=w.indexOf(he);if(Ue===-1){for(let Re=0;Re<T.length;Re++)if(Re>=w.length){w.push(he),Ue=Re;break}else if(w[Re]===null){w[Re]=he,Ue=Re;break}if(Ue===-1)break}const Se=T[Ue];Se&&Se.connect(he)}}const X=new D,j=new D;function te(q,Q,he){X.setFromMatrixPosition(Q.matrixWorld),j.setFromMatrixPosition(he.matrixWorld);const Ue=X.distanceTo(j),Se=Q.projectionMatrix.elements,Re=he.projectionMatrix.elements,qe=Se[14]/(Se[10]-1),$=Se[14]/(Se[10]+1),ne=(Se[9]+1)/Se[5],re=(Se[9]-1)/Se[5],oe=(Se[8]-1)/Se[0],ce=(Re[8]+1)/Re[0],Fe=qe*oe,Ne=qe*ce,ke=Ue/(-oe+ce),ze=ke*-oe;if(Q.matrixWorld.decompose(q.position,q.quaternion,q.scale),q.translateX(ze),q.translateZ(ke),q.matrixWorld.compose(q.position,q.quaternion,q.scale),q.matrixWorldInverse.copy(q.matrixWorld).invert(),Se[10]===-1)q.projectionMatrix.copy(Q.projectionMatrix),q.projectionMatrixInverse.copy(Q.projectionMatrixInverse);else{const C=qe+ke,it=$+ke,Ke=Fe-ze,E=Ne+(Ue-ze),_=ne*$/it*C,F=re*$/it*C;q.projectionMatrix.makePerspective(Ke,E,_,F,C,it),q.projectionMatrixInverse.copy(q.projectionMatrix).invert()}}function Ae(q,Q){Q===null?q.matrixWorld.copy(q.matrix):q.matrixWorld.multiplyMatrices(Q.matrixWorld,q.matrix),q.matrixWorldInverse.copy(q.matrixWorld).invert()}this.updateCamera=function(q){if(s===null)return;let Q=q.near,he=q.far;m.texture!==null&&(m.depthNear>0&&(Q=m.depthNear),m.depthFar>0&&(he=m.depthFar)),V.near=N.near=P.near=Q,V.far=N.far=P.far=he,(U!==V.near||O!==V.far)&&(s.updateRenderState({depthNear:V.near,depthFar:V.far}),U=V.near,O=V.far),V.layers.mask=q.layers.mask|6,P.layers.mask=V.layers.mask&-5,N.layers.mask=V.layers.mask&-3;const Ue=q.parent,Se=V.cameras;Ae(V,Ue);for(let Re=0;Re<Se.length;Re++)Ae(Se[Re],Ue);Se.length===2?te(V,P,N):V.projectionMatrix.copy(P.projectionMatrix),b===null&&q.isPerspectiveCamera&&(b={camera:q,fov:q.fov,zoom:q.zoom}),Ee(q,V,Ue)};function Ee(q,Q,he){he===null?q.matrix.copy(Q.matrixWorld):(q.matrix.copy(he.matrixWorld),q.matrix.invert(),q.matrix.multiply(Q.matrixWorld)),q.matrix.decompose(q.position,q.quaternion,q.scale),q.updateMatrixWorld(!0),q.projectionMatrix.copy(Q.projectionMatrix),q.projectionMatrixInverse.copy(Q.projectionMatrixInverse),q.isPerspectiveCamera&&(q.fov=ta*2*Math.atan(1/q.projectionMatrix.elements[5]),q.zoom=1)}this.getCamera=function(){return V},this.getFoveation=function(){if(!(u===null&&f===null))return l},this.setFoveation=function(q){l=q,u!==null&&(u.fixedFoveation=q),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=q)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(V)},this.getCameraTexture=function(q){return p[q]};let et=null;function We(q,Q){if(h=Q.getViewerPose(c||o),g=Q,h!==null){const he=h.views;f!==null&&(e.setRenderTargetFramebuffer(S,f.framebuffer),e.setRenderTarget(S));let Ue=!1;he.length!==V.cameras.length&&(V.cameras.length=0,Ue=!0);for(let $=0;$<he.length;$++){const ne=he[$];let re=null;if(f!==null)re=f.getViewport(ne);else{const ce=d.getViewSubImage(u,ne);re=ce.viewport,$===0&&(e.setRenderTargetTextures(S,ce.colorTexture,ce.depthStencilTexture),e.setRenderTarget(S))}let oe=z[$];oe===void 0&&(oe=new qt,oe.layers.enable($),oe.viewport=new ft,z[$]=oe),oe.matrix.fromArray(ne.transform.matrix),oe.matrix.decompose(oe.position,oe.quaternion,oe.scale),oe.projectionMatrix.fromArray(ne.projectionMatrix),oe.projectionMatrixInverse.copy(oe.projectionMatrix).invert(),oe.viewport.set(re.x,re.y,re.width,re.height),$===0&&(V.matrix.copy(oe.matrix),V.matrix.decompose(V.position,V.quaternion,V.scale)),Ue===!0&&V.cameras.push(oe)}const Se=s.enabledFeatures;if(Se&&Se.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&v){d=n.getBinding();const $=d.getDepthInformation(he[0]);$&&$.isValid&&$.texture&&m.init($,s.renderState)}if(Se&&Se.includes("camera-access")&&v){e.state.unbindTexture(),d=n.getBinding();for(let $=0;$<he.length;$++){const ne=he[$].camera;if(ne){let re=p[ne];re||(re=new nh,p[ne]=re);const oe=d.getCameraImage(ne);re.sourceTexture=oe}}}}for(let he=0;he<T.length;he++){const Ue=w[he],Se=T[he];Ue!==null&&Se!==void 0&&Se.update(Ue,Q,c||o)}et&&et(q,Q),Q.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:Q}),g=null}const Ze=new ph;Ze.setAnimationLoop(We),this.setAnimationLoop=function(q){et=q},this.dispose=function(){}}}const G0=new nt,Sh=new Ge;Sh.set(-1,0,0,0,1,0,0,0,1);function H0(i,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,uh(i)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function s(m,p,y,A,S){p.isNodeMaterial?p.uniformsNeedUpdate=!1:p.isMeshBasicMaterial?r(m,p):p.isMeshLambertMaterial?(r(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshToonMaterial?(r(m,p),d(m,p)):p.isMeshPhongMaterial?(r(m,p),h(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshStandardMaterial?(r(m,p),u(m,p),p.isMeshPhysicalMaterial&&f(m,p,S)):p.isMeshMatcapMaterial?(r(m,p),g(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),v(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(o(m,p),p.isLineDashedMaterial&&a(m,p)):p.isPointsMaterial?l(m,p,y,A):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===Nt&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===Nt&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);const y=e.get(p),A=y.envMap,S=y.envMapRotation;A&&(m.envMap.value=A,m.envMapRotation.value.setFromMatrix4(G0.makeRotationFromEuler(S)).transpose(),A.isCubeTexture&&A.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(Sh),m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function o(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function a(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,y,A){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*y,m.scale.value=A*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function h(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function d(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function u(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function f(m,p,y){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Nt&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.retroreflectivity>0&&(m.retroreflectivity.value=p.retroreflectivity),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=y.texture,m.transmissionSamplerSize.value.set(y.width,y.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function v(m,p){const y=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(y.matrixWorld),m.nearDistance.value=y.shadow.camera.near,m.farDistance.value=y.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function V0(i,e,t,n){let s={},r={},o=[];const a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(S,T){const w=T.program;n.uniformBlockBinding(S,w)}function c(S,T){let w=s[S.id];w===void 0&&(m(S),w=h(S),s[S.id]=w,S.addEventListener("dispose",y));const R=T.program;n.updateUBOMapping(S,R);const x=e.render.frame;r[S.id]!==x&&(u(S),r[S.id]=x)}function h(S){const T=d();S.__bindingPointIndex=T;const w=i.createBuffer(),R=S.__size,x=S.usage;return i.bindBuffer(i.UNIFORM_BUFFER,w),i.bufferData(i.UNIFORM_BUFFER,R,x),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,T,w),w}function d(){for(let S=0;S<a;S++)if(o.indexOf(S)===-1)return o.push(S),S;return je("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(S){const T=s[S.id],w=S.uniforms,R=S.__cache;i.bindBuffer(i.UNIFORM_BUFFER,T);for(let x=0,b=w.length;x<b;x++){const P=w[x];if(Array.isArray(P))for(let N=0,z=P.length;N<z;N++)f(P[N],x,N,R);else f(P,x,0,R)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function f(S,T,w,R){if(v(S,T,w,R)===!0){const x=S.__offset,b=S.value;if(Array.isArray(b)){let P=0;for(let N=0;N<b.length;N++){const z=b[N],V=p(z);g(z,S.__data,P),typeof z!="number"&&typeof z!="boolean"&&!z.isMatrix3&&!ArrayBuffer.isView(z)&&(P+=V.storage/Float32Array.BYTES_PER_ELEMENT)}}else g(b,S.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,x,S.__data)}}function g(S,T,w){typeof S=="number"||typeof S=="boolean"?T[0]=S:S.isMatrix3?(T[0]=S.elements[0],T[1]=S.elements[1],T[2]=S.elements[2],T[3]=0,T[4]=S.elements[3],T[5]=S.elements[4],T[6]=S.elements[5],T[7]=0,T[8]=S.elements[6],T[9]=S.elements[7],T[10]=S.elements[8],T[11]=0):ArrayBuffer.isView(S)?T.set(new S.constructor(S.buffer,S.byteOffset,T.length)):S.toArray(T,w)}function v(S,T,w,R){const x=S.value,b=T+"_"+w;if(R[b]===void 0)return typeof x=="number"||typeof x=="boolean"?R[b]=x:ArrayBuffer.isView(x)?R[b]=x.slice():R[b]=x.clone(),!0;{const P=R[b];if(typeof x=="number"||typeof x=="boolean"){if(P!==x)return R[b]=x,!0}else{if(ArrayBuffer.isView(x))return!0;if(P.equals(x)===!1)return P.copy(x),!0}}return!1}function m(S){const T=S.uniforms;let w=0;const R=16;for(let b=0,P=T.length;b<P;b++){const N=Array.isArray(T[b])?T[b]:[T[b]];for(let z=0,V=N.length;z<V;z++){const U=N[z],O=Array.isArray(U.value)?U.value:[U.value];for(let J=0,H=O.length;J<H;J++){const se=O[J],X=p(se),j=w%R,te=j%X.boundary,Ae=j+te;w+=te,Ae!==0&&R-Ae<X.storage&&(w+=R-Ae),U.__data=new Float32Array(X.storage/Float32Array.BYTES_PER_ELEMENT),U.__offset=w,w+=X.storage}}}const x=w%R;return x>0&&(w+=R-x),S.__size=w,S.__cache={},this}function p(S){const T={boundary:0,storage:0};return typeof S=="number"||typeof S=="boolean"?(T.boundary=4,T.storage=4):S.isVector2?(T.boundary=8,T.storage=8):S.isVector3||S.isColor?(T.boundary=16,T.storage=12):S.isVector4?(T.boundary=16,T.storage=16):S.isMatrix3?(T.boundary=48,T.storage=48):S.isMatrix4?(T.boundary=64,T.storage=64):S.isTexture?Be("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(S)?(T.boundary=16,T.storage=S.byteLength):Be("WebGLRenderer: Unsupported uniform value type.",S),T}function y(S){const T=S.target;T.removeEventListener("dispose",y);const w=o.indexOf(T.__bindingPointIndex);o.splice(w,1),i.deleteBuffer(s[T.id]),delete s[T.id],delete r[T.id]}function A(){for(const S in s)i.deleteBuffer(s[S]);o=[],s={},r={}}return{bind:l,update:c,dispose:A}}const W0=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let tn=null;function X0(){return tn===null&&(tn=new Ta(W0,16,16,Jn,cn),tn.name="DFG_LUT",tn.minFilter=Et,tn.magFilter=Et,tn.wrapS=Mn,tn.wrapT=Mn,tn.generateMipmaps=!1,tn.needsUpdate=!0),tn}class Y0{constructor(e={}){const{canvas:t=Tu(),context:n=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:u=!1,outputBufferType:f=Bt}=e;this.isWebGLRenderer=!0;let g;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=n.getContextAttributes().alpha}else g=o;const v=f,m=new Set([va,xa,_a]),p=new Set([Bt,ln,ns,is,pa,ma]),y=new Uint32Array(4),A=new Int32Array(4),S=new D;let T=null,w=null;const R=[],x=[];let b=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=an,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const P=this;let N=!1,z=null,V=null,U=null,O=null;this._outputColorSpace=Ot;let J=0,H=0,se=null,X=-1,j=null;const te=new ft,Ae=new ft;let Ee=null;const et=new Ve(0);let We=0,Ze=t.width,q=t.height,Q=1,he=null,Ue=null;const Se=new ft(0,0,Ze,q),Re=new ft(0,0,Ze,q);let qe=!1;const $=new ba;let ne=!1,re=!1;const oe=new nt,ce=new D,Fe=new ft,Ne={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let ke=!1;function ze(){return se===null?Q:1}let C=n;function it(M,L){return t.getContext(M,L)}let Ke,E,_,F,G,Y,ae,le,K,ee,ue,Le,ge,de,Ie,Oe,He,I,fe,Z,pe,Me,ie;try{const M={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:d};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${ua}`),t.addEventListener("webglcontextlost",ct,!1),t.addEventListener("webglcontextrestored",st,!1),t.addEventListener("webglcontextcreationerror",Vt,!1),C===null){const L="webgl2";if(C=it(L,M),C===null)throw it(L)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}De()}catch(M){throw t.removeEventListener("webglcontextlost",ct,!1),t.removeEventListener("webglcontextrestored",st,!1),t.removeEventListener("webglcontextcreationerror",Vt,!1),je("WebGLRenderer: "+M.message),M}function De(){Ke=new Xm(C),Ke.init(),pe=new F0(C,Ke),E=new Um(C,Ke,e,pe),_=new N0(C,Ke),E.reversedDepthBuffer&&u&&_.buffers.depth.setReversed(!0),V=C.createFramebuffer(),U=C.createFramebuffer(),O=C.createFramebuffer(),F=new Km(C),G=new M0,Y=new U0(C,Ke,_,G,E,pe,F),ae=new Wm(P),le=new Jd(C),Me=new Dm(C,le),K=new Ym(C,le,F,Me),ee=new $m(C,K,le,Me,F),I=new Jm(C,E,Y),Ie=new Fm(G),ue=new v0(P,ae,Ke,E,Me,Ie),Le=new H0(P,G),ge=new y0,de=new R0(Ke),He=new Im(P,ae,_,ee,g,l),Oe=new D0(P,ee,E),ie=new V0(C,F,E,_),fe=new Nm(C,Ke,F),Z=new qm(C,Ke,F),F.programs=ue.programs,P.capabilities=E,P.extensions=Ke,P.properties=G,P.renderLists=ge,P.shadowMap=Oe,P.state=_,P.info=F}v!==Bt&&(b=new Qm(v,t.width,t.height,a,s,r));const Ce=new z0(P,C);this.xr=Ce,this.getContext=function(){return C},this.getContextAttributes=function(){return C.getContextAttributes()},this.forceContextLoss=function(){const M=Ke.get("WEBGL_lose_context");M&&M.loseContext()},this.forceContextRestore=function(){const M=Ke.get("WEBGL_lose_context");M&&M.restoreContext()},this.getPixelRatio=function(){return Q},this.setPixelRatio=function(M){M!==void 0&&(Q=M,this.setSize(Ze,q,!1))},this.getSize=function(M){return M.set(Ze,q)},this.setSize=function(M,L,W=!0){if(Ce.isPresenting){Be("WebGLRenderer: Can't change size while VR device is presenting.");return}Ze=M,q=L,t.width=Math.floor(M*Q),t.height=Math.floor(L*Q),W===!0&&(t.style.width=M+"px",t.style.height=L+"px"),b!==null&&b.setSize(t.width,t.height),this.setViewport(0,0,M,L)},this.getDrawingBufferSize=function(M){return M.set(Ze*Q,q*Q).floor()},this.setDrawingBufferSize=function(M,L,W){Ze=M,q=L,Q=W,t.width=Math.floor(M*W),t.height=Math.floor(L*W),this.setViewport(0,0,M,L)},this.setEffects=function(M){if(v===Bt){je("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(M){for(let L=0;L<M.length;L++)if(M[L].isOutputPass===!0){Be("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}b.setEffects(M||[])},this.getCurrentViewport=function(M){return M.copy(te)},this.getViewport=function(M){return M.copy(Se)},this.setViewport=function(M,L,W,B){M.isVector4?Se.set(M.x,M.y,M.z,M.w):Se.set(M,L,W,B),_.viewport(te.copy(Se).multiplyScalar(Q).round())},this.getScissor=function(M){return M.copy(Re)},this.setScissor=function(M,L,W,B){M.isVector4?Re.set(M.x,M.y,M.z,M.w):Re.set(M,L,W,B),_.scissor(Ae.copy(Re).multiplyScalar(Q).round())},this.getScissorTest=function(){return qe},this.setScissorTest=function(M){_.setScissorTest(qe=M)},this.setOpaqueSort=function(M){he=M},this.setTransparentSort=function(M){Ue=M},this.getClearColor=function(M){return M.copy(He.getClearColor())},this.setClearColor=function(){He.setClearColor(...arguments)},this.getClearAlpha=function(){return He.getClearAlpha()},this.setClearAlpha=function(){He.setClearAlpha(...arguments)},this.clear=function(M=!0,L=!0,W=!0){let B=0;if(M){let k=!1;if(se!==null){const ve=se.texture.format;k=m.has(ve)}if(k){const ve=se.texture.type,we=p.has(ve),xe=He.getClearColor(),Te=He.getClearAlpha(),Pe=xe.r,Xe=xe.g,Je=xe.b;we?(y[0]=Pe,y[1]=Xe,y[2]=Je,y[3]=Te,C.clearBufferuiv(C.COLOR,0,y)):(A[0]=Pe,A[1]=Xe,A[2]=Je,A[3]=Te,C.clearBufferiv(C.COLOR,0,A))}else B|=C.COLOR_BUFFER_BIT}L&&(B|=C.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),W&&(B|=C.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),B!==0&&C.clear(B)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(M){M.setRenderer(this),z=M},this.dispose=function(){t.removeEventListener("webglcontextlost",ct,!1),t.removeEventListener("webglcontextrestored",st,!1),t.removeEventListener("webglcontextcreationerror",Vt,!1),He.dispose(),ge.dispose(),de.dispose(),G.dispose(),ae.dispose(),ee.dispose(),Me.dispose(),ie.dispose(),ue.dispose(),Ce.dispose(),Ce.removeEventListener("sessionstart",Va),Ce.removeEventListener("sessionend",Wa),Bn.stop()};function ct(M){M.preventDefault(),sl("WebGLRenderer: Context Lost."),N=!0}function st(){sl("WebGLRenderer: Context Restored."),N=!1;const M=F.autoReset,L=Oe.enabled,W=Oe.autoUpdate,B=Oe.needsUpdate,k=Oe.type;De(),F.autoReset=M,Oe.enabled=L,Oe.autoUpdate=W,Oe.needsUpdate=B,Oe.type=k}function Vt(M){je("WebGLRenderer: A WebGL context could not be created. Reason: ",M.statusMessage)}function Qt(M){const L=M.target;L.removeEventListener("dispose",Qt),Oh(L)}function Oh(M){Bh(M),G.remove(M)}function Bh(M){const L=G.get(M).programs;L!==void 0&&(L.forEach(function(W){ue.releaseProgram(W)}),M.isShaderMaterial&&ue.releaseShaderCache(M))}this.renderBufferDirect=function(M,L,W,B,k,ve){L===null&&(L=Ne);const we=k.isMesh&&k.matrixWorld.determinantAffine()<0,xe=Gh(M,L,W,B,k);_.setMaterial(B,we);let Te=W.index,Pe=1;if(B.wireframe===!0){if(Te=K.getWireframeAttribute(W),Te===void 0)return;Pe=2}const Xe=W.drawRange,Je=W.attributes.position;let be=Xe.start*Pe,rt=(Xe.start+Xe.count)*Pe;ve!==null&&(be=Math.max(be,ve.start*Pe),rt=Math.min(rt,(ve.start+ve.count)*Pe)),Te!==null?(be=Math.max(be,0),rt=Math.min(rt,Te.count)):Je!=null&&(be=Math.max(be,0),rt=Math.min(rt,Je.count));const _t=rt-be;if(_t<0||_t===1/0)return;Me.setup(k,B,xe,W,Te);let ut,lt=fe;if(Te!==null&&(ut=le.get(Te),lt=Z,lt.setIndex(ut)),k.isMesh)B.wireframe===!0?(_.setLineWidth(B.wireframeLinewidth*ze()),lt.setMode(C.LINES)):lt.setMode(C.TRIANGLES);else if(k.isLine){let bt=B.linewidth;bt===void 0&&(bt=1),_.setLineWidth(bt*ze()),k.isLineSegments?lt.setMode(C.LINES):k.isLineLoop?lt.setMode(C.LINE_LOOP):lt.setMode(C.LINE_STRIP)}else k.isPoints?lt.setMode(C.POINTS):k.isSprite&&lt.setMode(C.TRIANGLES);if(k.isBatchedMesh)if(Ke.get("WEBGL_multi_draw"))lt.renderMultiDraw(k._multiDrawStarts,k._multiDrawCounts,k._multiDrawCount);else{const bt=k._multiDrawStarts,ye=k._multiDrawCounts,Ct=k._multiDrawCount,tt=Te?le.get(Te).bytesPerElement:1,kt=G.get(B).currentProgram.getUniforms();for(let jt=0;jt<Ct;jt++)kt.setValue(C,"_gl_DrawID",jt),lt.render(bt[jt]/tt,ye[jt])}else if(k.isInstancedMesh)lt.renderInstances(be,_t,k.count);else if(W.isInstancedBufferGeometry){const bt=W._maxInstanceCount!==void 0?W._maxInstanceCount:1/0,ye=Math.min(W.instanceCount,bt);lt.renderInstances(be,_t,ye)}else lt.render(be,_t)};function Ha(M,L,W,B){z!==null&&M.isNodeMaterial&&z.setObject(B,M),ne===!0&&Ie.setState(M,W,!1),M.transparent===!0&&M.side===vn&&M.forceSinglePass===!1?(M.side=Nt,M.needsUpdate=!0,ds(M,L,B),M.side=qn,M.needsUpdate=!0,ds(M,L,B),M.side=vn):ds(M,L,B)}this.compile=function(M,L,W=null){W===null&&(W=M),z!==null&&z.renderStart(M,L,W),w=de.get(W),w.init(L),x.push(w),W.traverseVisible(function(k){k.isLight&&k.layers.test(L.layers)&&(w.pushLight(k),k.castShadow&&w.pushShadow(k))}),M!==W&&M.traverseVisible(function(k){k.isLight&&k.layers.test(L.layers)&&(w.pushLight(k),k.castShadow&&w.pushShadow(k))}),w.setupLights(),z!==null&&z.updateLights(w.state.lightsArray),re=this.localClippingEnabled,ne=Ie.init(this.clippingPlanes,re),ne===!0&&Ie.setGlobalState(this.clippingPlanes,L),z!==null&&Oe.render(w.state.shadowsArray,W,L);const B=new Set;return M.traverse(function(k){if(!(k.isMesh||k.isPoints||k.isLine||k.isSprite))return;const ve=k.material;if(ve)if(Array.isArray(ve))for(let we=0;we<ve.length;we++){const xe=ve[we];Ha(xe,W,L,k),B.add(xe)}else Ha(ve,W,L,k),B.add(ve)}),w=x.pop(),z!==null&&z.renderEnd(),B},this.compileAsync=function(M,L,W=null){const B=this.compile(M,L,W);return new Promise(k=>{function ve(){if(B.forEach(function(we){const Te=G.get(we).currentProgram;(Te===void 0||Te.isReady())&&B.delete(we)}),B.size===0){k(M);return}setTimeout(ve,10)}Ke.get("KHR_parallel_shader_compile")!==null?ve():setTimeout(ve,10)})};let yr=null;function kh(M){yr&&yr(M)}function Va(){Bn.stop()}function Wa(){Bn.start()}const Bn=new ph;Bn.setAnimationLoop(kh),typeof self<"u"&&Bn.setContext(self),this.setAnimationLoop=function(M){yr=M,Ce.setAnimationLoop(M),M===null?Bn.stop():Bn.start()},Ce.addEventListener("sessionstart",Va),Ce.addEventListener("sessionend",Wa),this.render=function(M,L){if(L!==void 0&&L.isCamera!==!0){je("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(N===!0)return;z!==null&&z.renderStart(M,L);const W=Ce.enabled===!0&&Ce.isPresenting===!0,B=b!==null&&(se===null||W)&&b.begin(P,se);if(M.matrixWorldAutoUpdate===!0&&M.updateMatrixWorld(),L.parent===null&&L.matrixWorldAutoUpdate===!0&&L.updateMatrixWorld(),Ce.enabled===!0&&Ce.isPresenting===!0&&(b===null||b.isCompositing()===!1)&&(Ce.cameraAutoUpdate===!0&&Ce.updateCamera(L),L=Ce.getCamera()),M.isScene===!0&&M.onBeforeRender(P,M,L,se),w=de.get(M,x.length),w.init(L),w.state.textureUnits=Y.getTextureUnits(),x.push(w),oe.multiplyMatrices(L.projectionMatrix,L.matrixWorldInverse),$.setFromProjectionMatrix(oe,on,L.reversedDepth),re=this.localClippingEnabled,ne=Ie.init(this.clippingPlanes,re),T=ge.get(M,R.length),T.init(),R.push(T),Ce.enabled===!0&&Ce.isPresenting===!0){const we=P.xr.getDepthSensingMesh();we!==null&&Er(we,L,-1/0,P.sortObjects)}Er(M,L,0,P.sortObjects),T.finish(),z!==null&&z.updateLights(w.state.lightsArray),P.sortObjects===!0&&T.sort(he,Ue),ke=Ce.enabled===!1||Ce.isPresenting===!1||Ce.hasDepthSensing()===!1,ke&&He.addToRenderList(T,M),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),ne===!0&&Ie.beginShadows();const k=w.state.shadowsArray;if(Oe.render(k,M,L),ne===!0&&Ie.endShadows(),(B&&b.hasRenderPass())===!1){const we=T.opaque,xe=T.transmissive;if(w.setupLights(),L.isArrayCamera){const Te=L.cameras;if(xe.length>0)for(let Pe=0,Xe=Te.length;Pe<Xe;Pe++){const Je=Te[Pe];Ya(we,xe,M,Je)}ke&&He.render(M);for(let Pe=0,Xe=Te.length;Pe<Xe;Pe++){const Je=Te[Pe];Xa(T,M,Je,Je.viewport)}}else xe.length>0&&Ya(we,xe,M,L),ke&&He.render(M),Xa(T,M,L)}se!==null&&H===0&&(Y.updateMultisampleRenderTarget(se),Y.updateRenderTargetMipmap(se)),B&&b.end(P),M.isScene===!0&&M.onAfterRender(P,M,L),Me.resetDefaultState(),X=-1,j=null,x.pop(),x.length>0?(w=x[x.length-1],Y.setTextureUnits(w.state.textureUnits),ne===!0&&Ie.setGlobalState(P.clippingPlanes,w.state.camera)):w=null,R.pop(),R.length>0?T=R[R.length-1]:T=null,z!==null&&z.renderEnd()};function Er(M,L,W,B){if(M.visible===!1)return;if(M.layers.test(L.layers)){if(M.isGroup)W=M.renderOrder;else if(M.isLOD)M.autoUpdate===!0&&M.update(L);else if(M.isLightProbeGrid)w.pushLightProbeGrid(M);else if(M.isLight)w.pushLight(M),M.castShadow&&w.pushShadow(M);else if(M.isSprite){if(!M.frustumCulled||M.intersectsFrustum($)){B&&Fe.setFromMatrixPosition(M.matrixWorld).applyMatrix4(oe);const we=ee.update(M),xe=M.material;xe.visible&&T.push(M,we,xe,W,Fe.z,null,L)}}else if((M.isMesh||M.isLine||M.isPoints)&&(!M.frustumCulled||M.intersectsFrustum($))){const we=ee.update(M),xe=M.material;if(B&&(M.boundingSphere!==void 0?(M.boundingSphere===null&&M.computeBoundingSphere(),Fe.copy(M.boundingSphere.center)):(we.boundingSphere===null&&we.computeBoundingSphere(),Fe.copy(we.boundingSphere.center)),Fe.applyMatrix4(M.matrixWorld).applyMatrix4(oe)),Array.isArray(xe)){const Te=we.groups;for(let Pe=0,Xe=Te.length;Pe<Xe;Pe++){const Je=Te[Pe],be=xe[Je.materialIndex];be&&be.visible&&T.push(M,we,be,W,Fe.z,Je,L)}}else xe.visible&&T.push(M,we,xe,W,Fe.z,null,L)}}const ve=M.children;for(let we=0,xe=ve.length;we<xe;we++)Er(ve[we],L,W,B)}function Xa(M,L,W,B){const{opaque:k,transmissive:ve,transparent:we}=M;w.setupLightsView(W),ne===!0&&Ie.setGlobalState(P.clippingPlanes,W),B&&_.viewport(te.copy(B)),k.length>0&&us(k,L,W),ve.length>0&&us(ve,L,W),we.length>0&&us(we,L,W),_.buffers.depth.setTest(!0),_.buffers.depth.setMask(!0),_.buffers.color.setMask(!0),_.setPolygonOffset(!1)}function Ya(M,L,W,B){if((W.isScene===!0?W.overrideMaterial:null)!==null)return;if(w.state.transmissionRenderTarget[B.id]===void 0){const be=Ke.has("EXT_color_buffer_half_float")||Ke.has("EXT_color_buffer_float");w.state.transmissionRenderTarget[B.id]=new Zt(1,1,{generateMipmaps:!0,type:be?cn:Bt,minFilter:Wn,samples:Math.max(4,E.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:Qe.workingColorSpace})}const ve=w.state.transmissionRenderTarget[B.id],we=B.viewport||te;ve.setSize(we.z*P.transmissionResolutionScale,we.w*P.transmissionResolutionScale);const xe=P.getRenderTarget(),Te=P.getActiveCubeFace(),Pe=P.getActiveMipmapLevel();P.setRenderTarget(ve),P.getClearColor(et),We=P.getClearAlpha(),We<1&&P.setClearColor(16777215,.5),P.clear(),ke&&He.render(W);const Xe=P.toneMapping;P.toneMapping=an;const Je=B.viewport;if(B.viewport!==void 0&&(B.viewport=void 0),w.setupLightsView(B),ne===!0&&Ie.setGlobalState(P.clippingPlanes,B),us(M,W,B),Y.updateMultisampleRenderTarget(ve),Y.updateRenderTargetMipmap(ve),Ke.has("WEBGL_multisampled_render_to_texture")===!1){let be=!1;for(let rt=0,_t=L.length;rt<_t;rt++){const ut=L[rt],{object:lt,geometry:bt,material:ye,group:Ct}=ut;if(ye.side===vn&&lt.layers.test(B.layers)){const tt=ye.side;ye.side=Nt,ye.needsUpdate=!0,qa(lt,W,B,bt,ye,Ct),ye.side=tt,ye.needsUpdate=!0,be=!0}}be===!0&&(Y.updateMultisampleRenderTarget(ve),Y.updateRenderTargetMipmap(ve))}P.setRenderTarget(xe,Te,Pe),P.setClearColor(et,We),Je!==void 0&&(B.viewport=Je),P.toneMapping=Xe}function us(M,L,W){const B=L.isScene===!0?L.overrideMaterial:null;for(let k=0,ve=M.length;k<ve;k++){const we=M[k],{object:xe,geometry:Te,group:Pe}=we;let Xe=we.material;Xe.allowOverride===!0&&B!==null&&(Xe=B),xe.layers.test(W.layers)&&qa(xe,L,W,Te,Xe,Pe)}}function qa(M,L,W,B,k,ve){z!==null&&k.isNodeMaterial&&z.setObject(M,k),M.onBeforeRender(P,L,W,B,k,ve),M.modelViewMatrix.multiplyMatrices(W.matrixWorldInverse,M.matrixWorld),M.normalMatrix.getNormalMatrix(M.modelViewMatrix),k.onBeforeRender(P,L,W,B,M,ve),k.transparent===!0&&k.side===vn&&k.forceSinglePass===!1?(k.side=Nt,k.needsUpdate=!0,P.renderBufferDirect(W,L,B,k,M,ve),k.side=qn,k.needsUpdate=!0,P.renderBufferDirect(W,L,B,k,M,ve),k.side=vn):P.renderBufferDirect(W,L,B,k,M,ve),M.onAfterRender(P,L,W,B,k,ve)}function ds(M,L,W){L.isScene!==!0&&(L=Ne);const B=G.get(M),k=w.state.lights,ve=w.state.shadowsArray,we=k.state.version,xe=ue.getParameters(M,k.state,ve,L,W,w.state.lightProbeGridArray),Te=ue.getProgramCacheKey(xe);let Pe=B.programs;B.environment=M.isMeshStandardMaterial||M.isMeshLambertMaterial||M.isMeshPhongMaterial?L.environment:null,B.fog=L.fog;const Xe=M.isMeshStandardMaterial||M.isMeshLambertMaterial&&!M.envMap||M.isMeshPhongMaterial&&!M.envMap;B.envMap=ae.get(M.envMap||B.environment,Xe),B.envMapRotation=B.environment!==null&&M.envMap===null?L.environmentRotation:M.envMapRotation,Pe===void 0&&(M.addEventListener("dispose",Qt),Pe=new Map,B.programs=Pe);let Je=Pe.get(Te);if(Je!==void 0){if(B.currentProgram===Je&&B.lightsStateVersion===we)return Ja(M,xe),Je}else xe.uniforms=ue.getUniforms(M),z!==null&&M.isNodeMaterial&&z.build(M,W,xe),M.onBeforeCompile(xe,P),Je=ue.acquireProgram(xe,Te),Pe.set(Te,Je),B.uniforms=xe.uniforms;const be=B.uniforms;return(!M.isShaderMaterial&&!M.isRawShaderMaterial||M.clipping===!0)&&(be.clippingPlanes=Ie.uniform),Ja(M,xe),B.needsLights=Vh(M),B.lightsStateVersion=we,B.needsLights&&(be.ambientLightColor.value=k.state.ambient,be.lightProbe.value=k.state.probe,be.sunLights.value=k.state.sun,be.sunLightShadows.value=k.state.sunShadow,be.directionalLights.value=k.state.directional,be.directionalLightShadows.value=k.state.directionalShadow,be.spotLights.value=k.state.spot,be.spotLightShadows.value=k.state.spotShadow,be.rectAreaLights.value=k.state.rectArea,be.ltc_1.value=k.state.rectAreaLTC1,be.ltc_2.value=k.state.rectAreaLTC2,be.pointLights.value=k.state.point,be.pointLightShadows.value=k.state.pointShadow,be.hemisphereLights.value=k.state.hemi,be.sunShadowMatrix.value=k.state.sunShadowMatrix,be.sunShadowCascade.value=k.state.sunShadowCascade,be.directionalShadowMatrix.value=k.state.directionalShadowMatrix,be.spotLightMatrix.value=k.state.spotLightMatrix,be.spotLightMap.value=k.state.spotLightMap,be.pointShadowMatrix.value=k.state.pointShadowMatrix),B.lightProbeGrid=w.state.lightProbeGridArray.length>0,B.currentProgram=Je,B.uniformsList=null,Je}function Ka(M){if(M.uniformsList===null){const L=M.currentProgram.getUniforms();M.uniformsList=nr.seqWithValue(L.seq,M.uniforms)}return M.uniformsList}function Ja(M,L){const W=G.get(M);W.outputColorSpace=L.outputColorSpace,W.batching=L.batching,W.batchingColor=L.batchingColor,W.instancing=L.instancing,W.instancingColor=L.instancingColor,W.instancingMorph=L.instancingMorph,W.skinning=L.skinning,W.morphTargets=L.morphTargets,W.morphNormals=L.morphNormals,W.morphColors=L.morphColors,W.morphTargetsCount=L.morphTargetsCount,W.numClippingPlanes=L.numClippingPlanes,W.numIntersection=L.numClipIntersection,W.vertexAlphas=L.vertexAlphas,W.vertexTangents=L.vertexTangents,W.toneMapping=L.toneMapping}function zh(M,L){if(M.length===0)return null;if(M.length===1)return M[0].texture!==null?M[0]:null;S.setFromMatrixPosition(L.matrixWorld);for(let W=0,B=M.length;W<B;W++){const k=M[W];if(k.texture!==null&&k.boundingBox.containsPoint(S))return k}return null}function Gh(M,L,W,B,k){L.isScene!==!0&&(L=Ne),Y.resetTextureUnits();const ve=L.fog,we=B.isMeshStandardMaterial||B.isMeshLambertMaterial||B.isMeshPhongMaterial?L.environment:null,xe=se===null?P.outputColorSpace:se.isXRRenderTarget===!0?se.texture.colorSpace:Qe.workingColorSpace,Te=B.isMeshStandardMaterial||B.isMeshLambertMaterial&&!B.envMap||B.isMeshPhongMaterial&&!B.envMap,Pe=ae.get(B.envMap||we,Te),Xe=B.vertexColors===!0&&!!W.attributes.color&&W.attributes.color.itemSize===4,Je=!!W.attributes.tangent&&(!!B.normalMap||B.anisotropy>0),be=!!W.morphAttributes.position,rt=!!W.morphAttributes.normal,_t=!!W.morphAttributes.color;let ut=an;B.toneMapped&&(se===null||se.isXRRenderTarget===!0)&&(ut=P.toneMapping);const lt=W.morphAttributes.position||W.morphAttributes.normal||W.morphAttributes.color,bt=lt!==void 0?lt.length:0,ye=G.get(B),Ct=w.state.lights;if(ne===!0&&(re===!0||M!==j)){const ht=M===j&&B.id===X;Ie.setState(B,M,ht)}let tt=!1;B.version===ye.__version?(ye.needsLights&&ye.lightsStateVersion!==Ct.state.version||ye.outputColorSpace!==xe||k.isBatchedMesh&&ye.batching===!1||!k.isBatchedMesh&&ye.batching===!0||k.isBatchedMesh&&ye.batchingColor===!0&&k._colorsTexture===null||k.isBatchedMesh&&ye.batchingColor===!1&&k._colorsTexture!==null||k.isInstancedMesh&&ye.instancing===!1||!k.isInstancedMesh&&ye.instancing===!0||k.isSkinnedMesh&&ye.skinning===!1||!k.isSkinnedMesh&&ye.skinning===!0||k.isInstancedMesh&&ye.instancingColor===!0&&k.instanceColor===null||k.isInstancedMesh&&ye.instancingColor===!1&&k.instanceColor!==null||k.isInstancedMesh&&ye.instancingMorph===!0&&k.morphTexture===null||k.isInstancedMesh&&ye.instancingMorph===!1&&k.morphTexture!==null||ye.envMap!==Pe||B.fog===!0&&ye.fog!==ve||ye.numClippingPlanes!==void 0&&(ye.numClippingPlanes!==Ie.numPlanes||ye.numIntersection!==Ie.numIntersection)||ye.vertexAlphas!==Xe||ye.vertexTangents!==Je||ye.morphTargets!==be||ye.morphNormals!==rt||ye.morphColors!==_t||ye.toneMapping!==ut||ye.morphTargetsCount!==bt||!!ye.lightProbeGrid!=w.state.lightProbeGridArray.length>0)&&(tt=!0):(tt=!0,ye.__version=B.version);let kt=ye.currentProgram;tt===!0&&(kt=ds(B,L,k),z&&B.isNodeMaterial&&z.onUpdateProgram(B,kt,ye));let jt=!1,wn=!1,ti=!1;const at=kt.getUniforms(),mt=ye.uniforms;if(_.useProgram(kt.program)&&(jt=!0,wn=!0,ti=!0),B.id!==X&&(X=B.id,wn=!0),ye.needsLights){const ht=zh(w.state.lightProbeGridArray,k);ye.lightProbeGrid!==ht&&(ye.lightProbeGrid=ht,wn=!0)}if(jt||j!==M){_.buffers.depth.getReversed()&&M.reversedDepth!==!0&&(M._reversedDepth=!0,M.updateProjectionMatrix()),at.setValue(C,"projectionMatrix",M.projectionMatrix),at.setValue(C,"viewMatrix",M.matrixWorldInverse);const bn=at.map.cameraPosition;bn!==void 0&&bn.setValue(C,ce.setFromMatrixPosition(M.matrixWorld)),E.logarithmicDepthBuffer&&at.setValue(C,"logDepthBufFC",2/(Math.log(M.far+1)/Math.LN2)),(B.isMeshPhongMaterial||B.isMeshToonMaterial||B.isMeshLambertMaterial||B.isMeshBasicMaterial||B.isMeshStandardMaterial||B.isShaderMaterial)&&at.setValue(C,"isOrthographic",M.isOrthographicCamera===!0),j!==M&&(j=M,wn=!0,ti=!0)}if(ye.needsLights&&(Ct.state.sunShadowMap.length>0&&at.setValue(C,"sunShadowMap",Ct.state.sunShadowMap,Y),Ct.state.directionalShadowMap.length>0&&at.setValue(C,"directionalShadowMap",Ct.state.directionalShadowMap,Y),Ct.state.spotShadowMap.length>0&&at.setValue(C,"spotShadowMap",Ct.state.spotShadowMap,Y),Ct.state.pointShadowMap.length>0&&at.setValue(C,"pointShadowMap",Ct.state.pointShadowMap,Y)),k.isSkinnedMesh){at.setOptional(C,k,"bindMatrix"),at.setOptional(C,k,"bindMatrixInverse");const ht=k.skeleton;ht&&(ht.boneTexture===null&&ht.computeBoneTexture(),at.setValue(C,"boneTexture",ht.boneTexture,Y))}k.isBatchedMesh&&(at.setOptional(C,k,"batchingTexture"),at.setValue(C,"batchingTexture",k._matricesTexture,Y),at.setOptional(C,k,"batchingIdTexture"),at.setValue(C,"batchingIdTexture",k._indirectTexture,Y),at.setOptional(C,k,"batchingColorTexture"),k._colorsTexture!==null&&at.setValue(C,"batchingColorTexture",k._colorsTexture,Y));const Tn=W.morphAttributes;if((Tn.position!==void 0||Tn.normal!==void 0||Tn.color!==void 0)&&I.update(k,W,kt),(wn||ye.receiveShadow!==k.receiveShadow)&&(ye.receiveShadow=k.receiveShadow,at.setValue(C,"receiveShadow",k.receiveShadow)),(B.isMeshStandardMaterial||B.isMeshLambertMaterial||B.isMeshPhongMaterial)&&B.envMap===null&&L.environment!==null&&(mt.envMapIntensity.value=L.environmentIntensity),mt.dfgLUT!==void 0&&(mt.dfgLUT.value=X0()),wn){if(at.setValue(C,"toneMappingExposure",P.toneMappingExposure),ye.needsLights&&Hh(mt,ti),ve&&B.fog===!0&&Le.refreshFogUniforms(mt,ve),Le.refreshMaterialUniforms(mt,B,Q,q,w.state.transmissionRenderTarget[M.id]),ye.needsLights&&ye.lightProbeGrid){const ht=ye.lightProbeGrid;mt.probesSH.value=ht.texture,mt.probesMin.value.copy(ht.boundingBox.min),mt.probesMax.value.copy(ht.boundingBox.max),mt.probesResolution.value.copy(ht.resolution)}nr.upload(C,Ka(ye),mt,Y)}if(B.isShaderMaterial&&B.uniformsNeedUpdate===!0&&(nr.upload(C,Ka(ye),mt,Y),B.uniformsNeedUpdate=!1),B.isSpriteMaterial&&at.setValue(C,"center",k.center),at.setValue(C,"modelViewMatrix",k.modelViewMatrix),at.setValue(C,"normalMatrix",k.normalMatrix),at.setValue(C,"modelMatrix",k.matrixWorld),B.uniformsGroups!==void 0){const ht=B.uniformsGroups;for(let bn=0,ni=ht.length;bn<ni;bn++){const Za=ht[bn];ie.update(Za,kt),ie.bind(Za,kt)}}return kt}function Hh(M,L){M.ambientLightColor.needsUpdate=L,M.lightProbe.needsUpdate=L,M.sunLights.needsUpdate=L,M.sunLightShadows.needsUpdate=L,M.directionalLights.needsUpdate=L,M.directionalLightShadows.needsUpdate=L,M.pointLights.needsUpdate=L,M.pointLightShadows.needsUpdate=L,M.spotLights.needsUpdate=L,M.spotLightShadows.needsUpdate=L,M.rectAreaLights.needsUpdate=L,M.hemisphereLights.needsUpdate=L}function Vh(M){return M.isMeshLambertMaterial||M.isMeshToonMaterial||M.isMeshPhongMaterial||M.isMeshStandardMaterial||M.isShadowMaterial||M.isShaderMaterial&&M.lights===!0}this.getActiveCubeFace=function(){return J},this.getActiveMipmapLevel=function(){return H},this.getRenderTarget=function(){return se},this.setRenderTargetTextures=function(M,L,W){const B=G.get(M);B.__autoAllocateDepthBuffer=M.resolveDepthBuffer===!1,B.__autoAllocateDepthBuffer===!1&&(B.__useRenderToTexture=!1),G.get(M.texture).__webglTexture=L,G.get(M.depthTexture).__webglTexture=B.__autoAllocateDepthBuffer?void 0:W,B.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(M,L){const W=G.get(M);W.__webglFramebuffer=L,W.__useDefaultFramebuffer=L===void 0},this.setRenderTarget=function(M,L=0,W=0){se=M,J=L,H=W;let B=null,k=!1,ve=!1;if(M){const xe=G.get(M);if(xe.__useDefaultFramebuffer!==void 0){_.bindFramebuffer(C.FRAMEBUFFER,xe.__webglFramebuffer),te.copy(M.viewport),Ae.copy(M.scissor),Ee=M.scissorTest,_.viewport(te),_.scissor(Ae),_.setScissorTest(Ee),X=-1;return}else if(xe.__webglFramebuffer===void 0)Y.setupRenderTarget(M);else if(xe.__hasExternalTextures)Y.rebindTextures(M,G.get(M.texture).__webglTexture,G.get(M.depthTexture).__webglTexture);else if(M.depthBuffer){const Xe=M.depthTexture;if(xe.__boundDepthTexture!==Xe){if(Xe!==null&&G.has(Xe)&&(M.width!==Xe.image.width||M.height!==Xe.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Y.setupDepthRenderbuffer(M)}}const Te=M.texture;(Te.isData3DTexture||Te.isDataArrayTexture||Te.isCompressedArrayTexture)&&(ve=!0);const Pe=G.get(M).__webglFramebuffer;M.isWebGLCubeRenderTarget?(Array.isArray(Pe[L])?B=Pe[L][W]:B=Pe[L],k=!0):M.samples>0&&Y.useMultisampledRTT(M)===!1?B=G.get(M).__webglMultisampledFramebuffer:Array.isArray(Pe)?B=Pe[W]:B=Pe,te.copy(M.viewport),Ae.copy(M.scissor),Ee=M.scissorTest}else te.copy(Se).multiplyScalar(Q).floor(),Ae.copy(Re).multiplyScalar(Q).floor(),Ee=qe;if(W!==0&&(B=V),_.bindFramebuffer(C.FRAMEBUFFER,B)&&_.drawBuffers(M,B),_.viewport(te),_.scissor(Ae),_.setScissorTest(Ee),k){const xe=G.get(M.texture);C.framebufferTexture2D(C.FRAMEBUFFER,C.COLOR_ATTACHMENT0,C.TEXTURE_CUBE_MAP_POSITIVE_X+L,xe.__webglTexture,W)}else if(ve){const xe=L;for(let Te=0;Te<M.textures.length;Te++){const Pe=G.get(M.textures[Te]);C.framebufferTextureLayer(C.FRAMEBUFFER,C.COLOR_ATTACHMENT0+Te,Pe.__webglTexture,W,xe)}}else if(M!==null&&W!==0){const xe=G.get(M.texture);C.framebufferTexture2D(C.FRAMEBUFFER,C.COLOR_ATTACHMENT0,C.TEXTURE_2D,xe.__webglTexture,W)}X=-1};function $a(M){const L=G.get(M);return(L.__readFormat!==M.format||L.__readType!==M.type)&&(L.__readFormat=M.format,L.__readType=M.type,L.__formatReadable=E.textureFormatReadable(M.format),L.__typeReadable=E.textureTypeReadable(M.type)),L}this.readRenderTargetPixels=function(M,L,W,B,k,ve,we,xe=0){if(!(M&&M.isWebGLRenderTarget)){je("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Te=G.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&we!==void 0&&(Te=Te[we]),Te){_.bindFramebuffer(C.FRAMEBUFFER,Te);try{const Pe=M.textures[xe],Xe=Pe.format,Je=Pe.type;M.textures.length>1&&C.readBuffer(C.COLOR_ATTACHMENT0+xe);const be=$a(Pe);if(be.__formatReadable===!1){je("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(be.__typeReadable===!1){je("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}L>=0&&L<=M.width-B&&W>=0&&W<=M.height-k&&C.readPixels(L,W,B,k,pe.convert(Xe),pe.convert(Je),ve)}finally{const Pe=se!==null?G.get(se).__webglFramebuffer:null;_.bindFramebuffer(C.FRAMEBUFFER,Pe)}}},this.readRenderTargetPixelsAsync=async function(M,L,W,B,k,ve,we,xe=0){if(!(M&&M.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Te=G.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&we!==void 0&&(Te=Te[we]),Te)if(L>=0&&L<=M.width-B&&W>=0&&W<=M.height-k){_.bindFramebuffer(C.FRAMEBUFFER,Te);const Pe=M.textures[xe],Xe=Pe.format,Je=Pe.type;M.textures.length>1&&C.readBuffer(C.COLOR_ATTACHMENT0+xe);const be=$a(Pe);if(be.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(be.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const rt=C.createBuffer();C.bindBuffer(C.PIXEL_PACK_BUFFER,rt),C.bufferData(C.PIXEL_PACK_BUFFER,ve.byteLength,C.STREAM_READ),C.readPixels(L,W,B,k,pe.convert(Xe),pe.convert(Je),0),C.bindBuffer(C.PIXEL_PACK_BUFFER,null);const _t=se!==null?G.get(se).__webglFramebuffer:null;_.bindFramebuffer(C.FRAMEBUFFER,_t);const ut=C.fenceSync(C.SYNC_GPU_COMMANDS_COMPLETE,0);return C.flush(),await bu(C,ut,4),C.bindBuffer(C.PIXEL_PACK_BUFFER,rt),C.getBufferSubData(C.PIXEL_PACK_BUFFER,0,ve),C.bindBuffer(C.PIXEL_PACK_BUFFER,null),C.deleteBuffer(rt),C.deleteSync(ut),ve}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(M,L=null,W=0){const B=Math.pow(2,-W),k=Math.floor(M.image.width*B),ve=Math.floor(M.image.height*B),we=L!==null?L.x:0,xe=L!==null?L.y:0;Y.setTexture2D(M,0),C.copyTexSubImage2D(C.TEXTURE_2D,W,0,0,we,xe,k,ve),_.unbindTexture()},this.copyTextureToTexture=function(M,L,W=null,B=null,k=0,ve=0){let we,xe,Te,Pe,Xe,Je,be,rt,_t;const ut=M.isCompressedTexture?M.mipmaps[ve]:M.image;if(W!==null)we=W.max.x-W.min.x,xe=W.max.y-W.min.y,Te=W.isBox3?W.max.z-W.min.z:1,Pe=W.min.x,Xe=W.min.y,Je=W.isBox3?W.min.z:0;else{const mt=Math.pow(2,-k);we=Math.floor(ut.width*mt),xe=Math.floor(ut.height*mt),M.isDataArrayTexture?Te=ut.depth:M.isData3DTexture?Te=Math.floor(ut.depth*mt):Te=1,Pe=0,Xe=0,Je=0}B!==null?(be=B.x,rt=B.y,_t=B.z):(be=0,rt=0,_t=0);const lt=pe.convert(L.format),bt=pe.convert(L.type);let ye;L.isData3DTexture?(Y.setTexture3D(L,0),ye=C.TEXTURE_3D):L.isDataArrayTexture||L.isCompressedArrayTexture?(Y.setTexture2DArray(L,0),ye=C.TEXTURE_2D_ARRAY):(Y.setTexture2D(L,0),ye=C.TEXTURE_2D),_.activeTexture(C.TEXTURE0),_.pixelStorei(C.UNPACK_FLIP_Y_WEBGL,L.flipY),_.pixelStorei(C.UNPACK_PREMULTIPLY_ALPHA_WEBGL,L.premultiplyAlpha),_.pixelStorei(C.UNPACK_ALIGNMENT,L.unpackAlignment);const Ct=_.getParameter(C.UNPACK_ROW_LENGTH),tt=_.getParameter(C.UNPACK_IMAGE_HEIGHT),kt=_.getParameter(C.UNPACK_SKIP_PIXELS),jt=_.getParameter(C.UNPACK_SKIP_ROWS),wn=_.getParameter(C.UNPACK_SKIP_IMAGES);_.pixelStorei(C.UNPACK_ROW_LENGTH,ut.width),_.pixelStorei(C.UNPACK_IMAGE_HEIGHT,ut.height),_.pixelStorei(C.UNPACK_SKIP_PIXELS,Pe),_.pixelStorei(C.UNPACK_SKIP_ROWS,Xe),_.pixelStorei(C.UNPACK_SKIP_IMAGES,Je);const ti=M.isDataArrayTexture||M.isData3DTexture,at=L.isDataArrayTexture||L.isData3DTexture;if(M.isDepthTexture){const mt=G.get(M),Tn=G.get(L),ht=G.get(mt.__renderTarget),bn=G.get(Tn.__renderTarget);_.bindFramebuffer(C.READ_FRAMEBUFFER,ht.__webglFramebuffer),_.bindFramebuffer(C.DRAW_FRAMEBUFFER,bn.__webglFramebuffer);for(let ni=0;ni<Te;ni++)ti&&(C.framebufferTextureLayer(C.READ_FRAMEBUFFER,C.COLOR_ATTACHMENT0,G.get(M).__webglTexture,k,Je+ni),C.framebufferTextureLayer(C.DRAW_FRAMEBUFFER,C.COLOR_ATTACHMENT0,G.get(L).__webglTexture,ve,_t+ni)),C.blitFramebuffer(Pe,Xe,we,xe,be,rt,we,xe,C.DEPTH_BUFFER_BIT,C.NEAREST);_.bindFramebuffer(C.READ_FRAMEBUFFER,null),_.bindFramebuffer(C.DRAW_FRAMEBUFFER,null)}else if(k!==0||M.isRenderTargetTexture||G.has(M)){const mt=G.get(M),Tn=G.get(L);_.bindFramebuffer(C.READ_FRAMEBUFFER,U),_.bindFramebuffer(C.DRAW_FRAMEBUFFER,O);for(let ht=0;ht<Te;ht++)ti?C.framebufferTextureLayer(C.READ_FRAMEBUFFER,C.COLOR_ATTACHMENT0,mt.__webglTexture,k,Je+ht):C.framebufferTexture2D(C.READ_FRAMEBUFFER,C.COLOR_ATTACHMENT0,C.TEXTURE_2D,mt.__webglTexture,k),at?C.framebufferTextureLayer(C.DRAW_FRAMEBUFFER,C.COLOR_ATTACHMENT0,Tn.__webglTexture,ve,_t+ht):C.framebufferTexture2D(C.DRAW_FRAMEBUFFER,C.COLOR_ATTACHMENT0,C.TEXTURE_2D,Tn.__webglTexture,ve),k!==0?C.blitFramebuffer(Pe,Xe,we,xe,be,rt,we,xe,C.COLOR_BUFFER_BIT,C.NEAREST):at?C.copyTexSubImage3D(ye,ve,be,rt,_t+ht,Pe,Xe,we,xe):C.copyTexSubImage2D(ye,ve,be,rt,Pe,Xe,we,xe);_.bindFramebuffer(C.READ_FRAMEBUFFER,null),_.bindFramebuffer(C.DRAW_FRAMEBUFFER,null)}else at?M.isDataTexture||M.isData3DTexture?C.texSubImage3D(ye,ve,be,rt,_t,we,xe,Te,lt,bt,ut.data):L.isCompressedArrayTexture?C.compressedTexSubImage3D(ye,ve,be,rt,_t,we,xe,Te,lt,ut.data):C.texSubImage3D(ye,ve,be,rt,_t,we,xe,Te,lt,bt,ut):M.isDataTexture?C.texSubImage2D(C.TEXTURE_2D,ve,be,rt,we,xe,lt,bt,ut.data):M.isCompressedTexture?C.compressedTexSubImage2D(C.TEXTURE_2D,ve,be,rt,ut.width,ut.height,lt,ut.data):C.texSubImage2D(C.TEXTURE_2D,ve,be,rt,we,xe,lt,bt,ut);_.pixelStorei(C.UNPACK_ROW_LENGTH,Ct),_.pixelStorei(C.UNPACK_IMAGE_HEIGHT,tt),_.pixelStorei(C.UNPACK_SKIP_PIXELS,kt),_.pixelStorei(C.UNPACK_SKIP_ROWS,jt),_.pixelStorei(C.UNPACK_SKIP_IMAGES,wn),ve===0&&L.generateMipmaps&&C.generateMipmap(ye),_.unbindTexture()},this.initRenderTarget=function(M){G.get(M).__webglFramebuffer===void 0&&Y.setupRenderTarget(M)},this.initTexture=function(M){M.isCubeTexture?Y.setTextureCube(M,0):M.isData3DTexture?Y.setTexture3D(M,0):M.isDataArrayTexture||M.isCompressedArrayTexture?Y.setTexture2DArray(M,0):Y.setTexture2D(M,0),_.unbindTexture()},this.resetState=function(){J=0,H=0,se=null,_.reset(),Me.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return on}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=Qe._getDrawingBufferColorSpace(e),t.unpackColorSpace=Qe._getUnpackColorSpace()}}const sn=(i,e,t)=>i<e?e:i>t?t:i,yi=(i,e,t)=>i+(e-i)*t;class q0{constructor(){this.x=0,this.y=0,this.previousX=0,this.previousY=0,this.zoom=1,this.viewportWidth=1,this.viewportHeight=1,this.worldWidth=1,this.worldHeight=1,this.followLerpX=1,this.followLerpY=1}setViewport(e,t){this.viewportWidth=Math.max(1,e),this.viewportHeight=Math.max(1,t),this.clampToBounds(),this.syncPreviousPosition()}setBounds(e,t){this.worldWidth=Math.max(1,e),this.worldHeight=Math.max(1,t),this.clampToBounds(),this.syncPreviousPosition()}setZoom(e){this.zoom=Math.max(.001,e),this.clampToBounds(),this.syncPreviousPosition()}getZoom(){return this.zoom}startFollow(e,t,n){this.followTarget=e,this.followLerpX=sn(t,0,1),this.followLerpY=sn(n,0,1)}snapToFollowTarget(){const e=this.getDesiredFollowPosition();if(!e){this.clampToBounds(),this.syncPreviousPosition();return}this.x=e.x,this.y=e.y,this.clampToBounds(),this.syncPreviousPosition()}update(){this.syncPreviousPosition();const e=this.getDesiredFollowPosition();if(!e){this.clampToBounds(),this.syncPreviousPosition();return}this.x=yi(this.x,e.x,this.followLerpX),this.y=yi(this.y,e.y,this.followLerpY),this.clampToBounds()}screenToWorld(e,t){return{x:this.x+e/this.zoom,y:this.y+t/this.zoom}}getRenderPosition(e=1){const t=sn(e,0,1);return{x:yi(this.previousX,this.x,t),y:yi(this.previousY,this.y,t)}}syncPreviousPosition(){this.previousX=this.x,this.previousY=this.y}getDesiredFollowPosition(){if(!this.followTarget)return;const e=this.viewportWidth/this.zoom,t=this.viewportHeight/this.zoom;return{x:this.followTarget.x-e/2,y:this.followTarget.y-t/2}}clampToBounds(){const e=this.viewportWidth/this.zoom,t=this.viewportHeight/this.zoom,n=e>=this.worldWidth?(this.worldWidth-e)/2:0,s=e>=this.worldWidth?n:this.worldWidth-e,r=t>=this.worldHeight?(this.worldHeight-t)/2:0,o=t>=this.worldHeight?r:this.worldHeight-t;this.x=sn(this.x,n,s),this.y=sn(this.y,r,o)}}const la=20*Math.PI/180,Vs=Math.cos(la),La=5*Math.PI/180,K0=Math.sin(La),hc=Math.cos(La);class J0{constructor(){this.camera=new xr(-.5,.5,.5,-.5,.1,4e3),this.tracker=new q0,this.raycaster=new qd,this.pointer=new me,this.ground=new xn(new D(0,1,0),0),this.intersection=new D,this.viewportWidth=1,this.viewportHeight=1,this.worldWidth=1,this.worldHeight=1,this.distance=1e3}setBounds(e,t){this.worldWidth=Math.max(1,e),this.worldHeight=Math.max(1,t),this.tracker.setBounds(e,t),this.distance=Math.max(1e3,Math.hypot(e,t)*2),this.camera.far=this.distance*4,this.updateProjection()}setZoom(e){this.tracker.setZoom(e),this.updateProjection()}getZoom(){return this.tracker.getZoom()}setViewport(e,t){this.viewportWidth=Math.max(1,e),this.viewportHeight=Math.max(1,t),this.tracker.setViewport(this.viewportWidth,this.viewportHeight/Vs),this.updateProjection()}startFollow(e,t,n){this.tracker.startFollow(e,t,n)}snapToFollowTarget(){this.tracker.snapToFollowTarget()}update(){this.tracker.update()}getRenderPosition(e=1){return this.tracker.getRenderPosition(e)}present(e=1,t=1){const n=this.tracker.getRenderPosition(e),s=this.tracker.getZoom(),r=this.viewportWidth/s,o=this.viewportHeight/s/Vs,a=Math.max(1,Math.floor(this.viewportWidth*t))/r,l=Math.max(1,Math.floor(this.viewportHeight*t))/o,c=this.alignToPixel(n.x,a,this.worldWidth,r)+r/2,h=this.alignToPixel(n.y,l,this.worldHeight,o)+o/2;this.camera.up.set(0,0,-1),this.camera.position.set(c+this.distance*Vs*K0,this.distance*Vs*hc,h+this.distance*Math.sin(la)),this.camera.lookAt(c,0,h),this.camera.updateMatrixWorld()}alignToPixel(e,t,n,s){const r=s>=n?(n-s)/2:0,o=Math.max(r,n-s);return e<=r||e>=o?sn(e,r,o):sn(Math.round(e*t)/t,r,o)}screenToWorld(e,t){return this.pointer.set(e/this.viewportWidth*2-1,1-t/this.viewportHeight*2),this.raycaster.setFromCamera(this.pointer,this.camera),this.raycaster.ray.intersectPlane(this.ground,this.intersection),{x:this.intersection.x,y:this.intersection.z}}updateProjection(){const e=this.viewportWidth/this.tracker.getZoom()/2,t=this.viewportHeight/this.tracker.getZoom()/2;this.camera.left=-e,this.camera.right=e,this.camera.top=t,this.camera.bottom=-t,this.camera.updateProjectionMatrix();const n=this.camera.projectionMatrix.elements;n[0]/=hc,n[1]=-Math.sin(la)*Math.tan(La)*n[5],this.camera.projectionMatrixInverse.copy(this.camera.projectionMatrix).invert()}}const $0=16,Yn={packet:10,ghost:11},ji={packet:1,ghost:1},yh={durationMs:1500,intervalMs:120},rn={durationMs:1200,blinkStartIntervalMs:60,blinkEndIntervalMs:220},ao={zoom:5,followLerp:{x:.09,y:.09}},Z0="(hover: none) and (pointer: coarse)",Q0=18,j0=1.2,e_=10,Ia=3,lo=5e3,uc=900,t_=.5,Eh=6e3,Dn=1200,Ws=[200,400,800,1600],hs={0:{texture:"point",size:2.5,score:10},1:{texture:"point",size:4,score:50},2:{texture:"cherry",size:4,score:100},3:{texture:"strawberry",size:4,score:150},4:{texture:"banana",size:4,score:200},5:{texture:"pear",size:4,score:250},6:{texture:"heart",size:4,score:300}};class n_{constructor(){this.listeners={}}on(e,t){const n=this.listeners[e];if(n){n.add(t);return}this.listeners[e]=new Set([t])}off(e,t){var n;(n=this.listeners[e])==null||n.delete(t)}emit(e,t){var n;(n=this.listeners[e])==null||n.forEach(s=>{s(t)})}clear(){Object.keys(this.listeners).forEach(e=>{var t;(t=this.listeners[e])==null||t.clear()})}}const Un={ScoreChanged:"score-changed",LivesChanged:"lives-changed"},Ht={score:0,lives:Ia},co=new n_,Fn={on(i,e){co.on(i,e)},off(i,e){co.off(i,e)},emit(i,e){co.emit(i,e)}};function i_(i=0,e=Ia){Ht.score=i,Ht.lives=e,Fn.emit(Un.ScoreChanged,Ht.score),Fn.emit(Un.LivesChanged,Ht.lives)}function wh(i){Ht.score+=i,Fn.emit(Un.ScoreChanged,Ht.score)}function s_(i=1){const e=Math.max(0,Math.floor(i));return e===0||(Ht.lives=Math.max(0,Ht.lives-e),Fn.emit(Un.LivesChanged,Ht.lives)),Ht.lives}function r_(){return{...Ht}}class o_{constructor(e){this.x=0,this.y=0,this.angle=0,this.flipX=!1,this.flipY=!1,this.depth=2,this.active=!0,this.moved={x:0,y:0},this.key=e.key,this.direction=e.direction,this.speed=e.speed,this.tile={...e.tile},this.displayWidth=e.displayWidth,this.displayHeight=e.displayHeight,this.state={free:!1,soonFree:!0,scared:!1,dead:!1,animation:"default"}}}class a_{constructor(e,t,n){this.x=0,this.y=0,this.angle=0,this.flipX=!1,this.flipY=!1,this.depth=2,this.active=!0,this.moved={x:0,y:0},this.direction={current:"right",next:"right"},this.portalBlinkRemainingMs=0,this.portalBlinkElapsedMs=0,this.deathRecoveryRemainingMs=0,this.deathRecoveryElapsedMs=0,this.deathRecoveryNextToggleAtMs=0,this.deathRecoveryVisible=!0,this.tile={...e},this.displayWidth=t,this.displayHeight=n}}const Da=["up","down","left","right"],ca={up:"down",down:"up",left:"right",right:"left"},Na={up:{dx:0,dy:-1},down:{dx:0,dy:1},left:{dx:-1,dy:0},right:{dx:1,dy:0}},l_=()=>({collides:!1,penGate:!1,portal:!1,up:!1,down:!1,left:!1,right:!1}),ho=Object.freeze({collides:!0,penGate:!1,portal:!1,up:!0,down:!0,left:!0,right:!0});class c_{constructor(e){var t;this.grid=e,this.height=e.length,this.width=((t=e[0])==null?void 0:t.length)??0}getTileAt(e,t){if(!this.isInBounds(e,t))return ho;const n=this.grid[t];return n?n[e]??ho:ho}getTilesAt(e){const{x:t,y:n}=e;return{current:this.getTileAt(t,n),up:this.getTileAt(t,n-1),down:this.getTileAt(t,n+1),left:this.getTileAt(t-1,n),right:this.getTileAt(t+1,n)}}toArray(){return this.grid.map(e=>e.map(t=>({...t})))}isInBounds(e,t){return t>=0&&t<this.height&&e>=0&&e<this.width}}const Sr=16;function Zn(i,e,t,n,s=Sr,r="packet"){const o=n.current,a=n.up,l=n.down,c=n.left,h=n.right,d=r==="ghostRelease",u=(f,g)=>!(!g||d&&f.penGate);return i==="up"?u(o,o.up)||u(a,a.down)?e<0&&e>=-s:!0:i==="down"?u(o,o.down)||u(l,l.up)?e>0&&e<=s:!0:i==="right"?u(o,o.right)||u(h,h.left)?t>0&&t<=s:!0:i==="left"&&(u(o,o.left)||u(c,c.right))?t<0&&t>=-s:!0}function Th(i,e,t=Sr,n="packet"){const s=Da.filter(r=>r===ca[e]?!1:Zn(r,0,0,i,t,n));if(!s.length){const r=ca[e];Zn(r,0,0,i,t,n)&&s.push(r)}return s}function h_(i,e,t=Sr,n=Zn){const{current:s,next:r}=i.direction;return r===s||i.moved.x!==0||i.moved.y!==0?s:(n(r,i.moved.y,i.moved.x,e,t,"packet")&&(i.direction.current=r,r==="left"||r==="right"?i.moved.x=0:i.moved.y=0),i.direction.current)}function u_(i,e,t,n){const s=Na[e];for(i.moved.x+=s.dx*t,i.moved.y+=s.dy*t;i.moved.x>=n;)i.tile.x+=1,i.moved.x-=n;for(;i.moved.x<=-n;)i.tile.x-=1,i.moved.x+=n;for(;i.moved.y>=n;)i.tile.y+=1,i.moved.y-=n;for(;i.moved.y<=-n;)i.tile.y-=1,i.moved.y+=n}function d_(i,e,t){const n=t/2;return{x:i.x*t+n+e.x,y:i.y*t+n+e.y}}function bh(i,e){const t=d_(i.tile,i.moved,e);i.x=t.x,i.y=t.y}function f_(i,e,t){i.tile={...e},i.moved={x:0,y:0},bh(i,t)}class p_{constructor(e=Sr){this.tileSize=e}canMove(e,t,n,s,r="packet"){return Zn(e,t,n,s,this.tileSize,r)}getAvailableDirections(e,t,n){return Th(e,t,this.tileSize,n)}applyBufferedDirection(e,t){return h_(e,t,this.tileSize)}advanceEntity(e,t,n){u_(e,t,n,this.tileSize)}syncEntityPosition(e){bh(e,this.tileSize)}setEntityTile(e,t){f_(e,t,this.tileSize)}}class m_{chooseDirectionAtCenter(e,t,n,s){const r=Th(t,e,n,"ghost");return r.length?r[s.int(r.length)]??e:e}chooseDirectionWhenBlocked(e,t,n,s,r,o){const l=(e==="left"||e==="right"?["up","down"]:["left","right"]).filter(h=>Zn(h,t,n,s,r,"ghost"));if(l.length>0)return l[o.int(l.length)]??e;const c=ca[e];return Zn(c,t,n,s,r,"ghost")?c:e}}function g_(i){var t,n;const e=new Map;for(let s=0;s<i.height;s+=1)for(let r=0;r<i.width;r+=1){const o=(n=(t=i.tiles[s])==null?void 0:t[r])==null?void 0:n.localId;typeof o=="number"&&e.set(o,(e.get(o)??0)+1)}return e}function __(i){var t,n,s,r;const e=[];for(let o=0;o<i.height;o+=1){let a=0;for(;a<i.width;){if(!((n=(t=i.tiles[o])==null?void 0:t[a])!=null&&n.collision.penGate)){a+=1;continue}const l=a;for(;a<i.width&&((r=(s=i.tiles[o])==null?void 0:s[a])!=null&&r.collision.penGate);)a+=1;const c=a-1,h=c-l+1;h>=3&&e.push({minX:l,maxX:c,y:o,length:h,centerX:l+Math.floor((c-l)/2)})}}return e}function x_(i){var t,n,s,r;const e=[];if(i.width<3||i.height<3)return e;for(let o=1;o<i.height-1;o+=1){let a=1;for(;a<i.width-1;){const l=(n=(t=i.tiles[o])==null?void 0:t[a])==null?void 0:n.localId;if(typeof l!="number"){a+=1;continue}const c=a;for(a+=1;a<i.width-1&&((r=(s=i.tiles[o])==null?void 0:s[a])==null?void 0:r.localId)===l;)a+=1;const h=a-1,d=h-c+1;d>=3&&e.push({minX:c,maxX:h,y:o,length:d,centerX:c+Math.floor((h-c)/2),localId:l})}}return e}function v_(i){const e=__(i);if(e.length===0)return null;const t=(i.width-1)/2;e.sort((a,l)=>{const c=l.length-a.length;if(c!==0)return c;const h=Math.abs(a.centerX-t)-Math.abs(l.centerX-t);return h!==0?h:a.y!==l.y?a.y-l.y:a.minX-l.minX});const n=e[0];if(!n)return null;const s=n.y+1,r=i.height-1,o=s<0?0:s>r?r:s;return{minX:n.minX,maxX:n.maxX,homeY:o,centerX:n.centerX}}function M_(i){const e=x_(i);if(e.length===0)return null;const t=g_(i),n=(i.width-1)/2,s=(i.height-1)/2,r=Math.floor((i.height-1)*.66);e.sort((a,l)=>{const c=(a.y>=s?0:1)-(l.y>=s?0:1);if(c!==0)return c;const h=Math.abs(a.centerX-n)-Math.abs(l.centerX-n);if(h!==0)return h;const d=(t.get(a.localId)??Number.MAX_SAFE_INTEGER)-(t.get(l.localId)??Number.MAX_SAFE_INTEGER);if(d!==0)return d;const u=l.length-a.length;if(u!==0)return u;const f=Math.abs(a.y-r)-Math.abs(l.y-r);return f!==0?f:a.y!==l.y?a.y-l.y:a.minX-l.minX});const o=e[0];return o?{minX:o.minX,maxX:o.maxX,homeY:o.y,centerX:o.centerX}:null}function S_(i,e){var r,o,a,l,c;const t=[],n=Math.min(Math.max(e-1,0),i.height-2),s=(i.width-1)/2;for(let h=1;h<=n;h+=1){let d=1;for(;d<i.width-1;){const u=(o=(r=i.tiles[h])==null?void 0:r[d])==null?void 0:o.localId;if(typeof u!="number"){d+=1;continue}let f=u;const g=d;for(d+=1;d<i.width-1;){const p=(l=(a=i.tiles[h])==null?void 0:a[d])==null?void 0:l.localId;if(typeof p!="number"||p!==f+1)break;f=p,d+=1}const v=d-1,m=v-g+1;m>=3&&t.push({y:h,length:m,centerX:g+Math.floor((v-g)/2),minX:g})}}if(t.length!==0)return t.sort((h,d)=>{const u=Math.abs(h.centerX-s)-Math.abs(d.centerX-s);if(u!==0)return u;const f=e-h.y-(e-d.y);if(f!==0)return f;const g=d.length-h.length;return g!==0?g:h.y!==d.y?d.y-h.y:h.minX-d.minX}),(c=t[0])==null?void 0:c.y}function dc(i){const e=v_(i);if(e)return e;const t=M_(i);return t?{minX:t.minX,maxX:t.maxX,homeY:t.homeY,centerX:t.centerX}:null}function In(i,e,t){return i<e?e:i>t?t:i}function vi(i,e){var n;const t=(n=i==null?void 0:i.properties)==null?void 0:n.find(s=>s.name===e);return typeof(t==null?void 0:t.value)=="number"?t.value:void 0}class y_{resolveSpawnTile(e,t,n){const s=vi(e,"gridX"),r=vi(e,"gridY");if(typeof s=="number"&&typeof r=="number")return this.clampTilePosition({x:s,y:r},n);if(e&&typeof e.x=="number"&&typeof e.y=="number")return this.clampTilePosition({x:Math.floor(e.x/n.tileWidth),y:Math.floor(e.y/n.tileHeight)},n);const o=dc(n);if(o){let a=o.homeY-1;const l=S_(n,o.homeY);return typeof l=="number"&&a<=l&&(a=Math.min(o.homeY-1,l+1)),this.clampTilePosition({x:o.centerX,y:a},n)}return this.clampTilePosition(t,n)}resolveGhostJailBounds(e,t){const n=dc(e),s=vi(e.ghostHome,"startX")??(n==null?void 0:n.minX)??t.x,r=vi(e.ghostHome,"endX")??(n==null?void 0:n.maxX)??t.x,o=In(Math.round(Math.min(s,r)),0,e.width-1),a=In(Math.round(Math.max(s,r)),0,e.width-1),l=vi(e.ghostHome,"gridY"),c=typeof l=="number"?l:e.ghostHome&&typeof e.ghostHome.y=="number"?Math.round(e.ghostHome.y/e.tileHeight):n?n.homeY:t.y,h=In(c,0,e.height-1);return{minX:o,maxX:a,y:h}}findReleaseTile(e){const t=In(e.bounds.y-1,0,e.map.height-1),n=[];for(let c=e.bounds.minX;c<=e.bounds.maxX;c+=1){const h={x:c,y:t};h.x===e.avoidTile.x&&h.y===e.avoidTile.y||this.canGhostMoveFromTile(h,e.collisionGrid,e.movementRules)&&n.push(h)}const s=this.clampTilePosition({x:e.currentTile.x,y:t},e.map);if(n.length===0)return s;const r=In(e.currentTile.x,e.bounds.minX,e.bounds.maxX),o=n.reduce((c,h)=>Math.min(c,Math.abs(h.x-r)),Number.POSITIVE_INFINITY),a=n.filter(c=>Math.abs(c.x-r)===o);if(e.preferDirection==="right")return[...a].sort((h,d)=>d.x-h.x)[0]??s;if(e.preferDirection==="left")return[...a].sort((h,d)=>h.x-d.x)[0]??s;const l=e.rng.int(Math.max(1,a.length));return a[l]??s}moveGhostInJail(e,t,n,s,r){if((e.tile.y!==t.y||e.moved.y!==0)&&n.setEntityTile(e,{x:e.tile.x,y:t.y}),e.moved.x===0&&(e.direction!=="left"&&e.direction!=="right"&&(e.direction=s.next()<.5?"right":"left"),e.tile.x<=t.minX&&e.direction==="left"?e.direction="right":e.tile.x>=t.maxX&&e.direction==="right"&&(e.direction="left")),n.advanceEntity(e,e.direction,r),e.tile.x<t.minX||e.tile.x>t.maxX){const o=In(e.tile.x,t.minX,t.maxX);n.setEntityTile(e,{x:o,y:t.y}),e.direction=e.direction==="left"?"right":"left"}}canGhostMoveFromTile(e,t,n){const s=t.getTilesAt(e);return["up","down","left","right"].some(o=>n.canMove(o,0,0,s,"ghost"))}clampTilePosition(e,t){return{x:In(e.x,0,t.width-1),y:In(e.y,0,t.height-1)}}}function uo(i){return`${i.x},${i.y}`}class E_{constructor(e,t=[]){if(this.portalPairs=new Map,this.lastTeleportTick=new WeakMap,t.length>0){t.forEach(s=>{this.setPortalPair(s.from,s.to)});return}const n=[];for(let s=0;s<e.height;s+=1)for(let r=0;r<e.width;r+=1)e.getTileAt(r,s).portal&&n.push({x:r,y:s});for(let s=0;s+1<n.length;s+=2){const r=n[s],o=n[s+1];this.setPortalPair(r,o)}}canAdvanceOutward(e,t){if(e.moved.x!==0||e.moved.y!==0)return!1;const n=this.resolvePortalContext(e);return n?!this.isDestinationFullyBlocking(n.portalLink,t):!1}tryTeleport(e,t,n,s=16){if(this.lastTeleportTick.get(e)===n)return!1;const r=this.resolvePortalContext(e);if(!r||!this.hasReachedOutwardTeleportThreshold(e.moved,r.direction,s)||this.isDestinationFullyBlocking(r.portalLink,t))return!1;const o=r.portalLink.destination;return e.tile={...o},e.moved.x=0,e.moved.y=0,this.lastTeleportTick.set(e,n),!0}setPortalPair(e,t){this.portalPairs.set(uo(e),{destination:{...t},outwardDirection:this.resolveOutwardDirection(e,t)}),this.portalPairs.set(uo(t),{destination:{...e},outwardDirection:this.resolveOutwardDirection(t,e)})}resolveEntityDirection(e){if(this.isDirection(e.direction))return e.direction;if(!this.isRecord(e.direction))return;const t=e.direction.current;return this.isDirection(t)?t:void 0}resolveOutwardDirection(e,t){if(e.x===t.x)return e.y<t.y?"up":"down";if(e.y===t.y)return e.x<t.x?"left":"right"}resolvePortalContext(e){const t=uo(e.tile),n=this.portalPairs.get(t);if(!n||!n.outwardDirection)return null;const s=this.resolveEntityDirection(e);return!s||s!==n.outwardDirection?null:{portalLink:n,direction:s}}hasReachedOutwardTeleportThreshold(e,t,n){const r=(Number.isFinite(n)&&n>0?n:16)/2;return this.resolveOutwardOffset(e,t)>=r}resolveOutwardOffset(e,t){return t==="up"?-e.y:t==="down"?e.y:t==="left"?-e.x:e.x}isDestinationFullyBlocking(e,t){const n=e.destination,s=t.getTileAt(n.x,n.y);return this.isFullyBlocking(s)}isRecord(e){return typeof e=="object"&&e!==null}isDirection(e){return e==="up"||e==="right"||e==="down"||e==="left"}isFullyBlocking(e){return e.collides&&e.up&&e.right&&e.down&&e.left}}class w_{constructor(e){this.ghostScaredTimers=new Map,this.ghostScaredWarnings=new Map,this.ghostEatChainCount=0,this.ghostsExitingJail=new Set,this.ghostAnimations=new Map,this.packetAnimation={frame:0,elapsedMs:0,sequenceIndex:0,active:!1},this.isMoving=!0,this.collisionDebugEnabled=!1,this.hoveredDebugTile=null,this.pointerScreen=null,this.debugPanelText="",this.tick=0,this.map=e.map,this.tileSize=e.tileSize,this.collisionGrid=e.collisionGrid,this.packetSpawnTile={...e.packetSpawnTile},this.packet=e.packet,this.ghosts=e.ghosts,this.ghostJailBounds=e.ghostJailBounds,this.ghostJailReturnTile={x:e.ghostJailBounds.minX+Math.floor((e.ghostJailBounds.maxX-e.ghostJailBounds.minX)/2),y:e.ghostJailBounds.y}}nextTick(){return this.tick+=1,this.tick}}class Ah{constructor(){this.images=new Map,this.jsonData=new Map,this.spriteSheets=new Map}async loadJSON(e,t){const n=await fetch(t);if(!n.ok)throw new Error(`Failed to load JSON: ${t}`);const s=await n.json();return this.jsonData.set(e,s),s}async loadImage(e,t){const n=await this.createImage(t);return this.images.set(e,n),n}async loadSpriteSheet(e,t,n,s){const r=await this.createImage(t),o=Math.max(1,Math.floor(r.width/n)),a=Math.max(1,Math.floor(r.height/s)),l={image:r,frameWidth:n,frameHeight:s,frameCount:o*a};return this.spriteSheets.set(e,l),l}getJSON(e){const t=this.jsonData.get(e);if(!t)throw new Error(`JSON asset not found: ${e}`);return t}getImage(e){const t=this.images.get(e);if(!t)throw new Error(`Image asset not found: ${e}`);return t}getSpriteSheet(e){const t=this.spriteSheets.get(e);if(!t)throw new Error(`Spritesheet asset not found: ${e}`);return t}createImage(e){return new Promise((t,n)=>{const s=new Image;s.onload=()=>t(s),s.onerror=()=>n(new Error(`Failed to load image: ${e}`)),s.src=e})}}const T_=85,b_=91,fc={packet:"assets/sprites/Packet.png",blinky:"assets/sprites/Blinky.png",clyde:"assets/sprites/Clyde.png",pinky:"assets/sprites/Pinky.png",inky:"assets/sprites/Inky.png",scared:"assets/sprites/Scared.png"};class A_{constructor(){this.assets=new Ah,this.tileImageCache=new Map,this.spritesheets=new Map,this.spriteMaskCache=new Map,this.tileMaskCache=new Map,this.maskCanvas=null,this.maskContext=null}async loadForMap(e,t){const n=new Set;e.tiles.forEach(r=>{r.forEach(o=>{o.imagePath!=="(empty)"&&o.imagePath!=="(unknown)"&&n.add(o.imagePath)})});const s=[];n.forEach(r=>{s.push(this.assets.loadImage(r,`${t}/${r}`))}),Object.entries(fc).forEach(([r,o])=>{s.push(this.assets.loadSpriteSheet(r,o,T_,b_))}),await Promise.all(s),n.forEach(r=>{this.tileImageCache.set(r,this.assets.getImage(r))}),Object.keys(fc).forEach(r=>{const o=r;this.spritesheets.set(o,this.assets.getSpriteSheet(r))})}getTileImage(e){return this.tileImageCache.get(e)}getTileMask(e){const t=this.tileMaskCache.get(e);if(t)return t;const n=this.getTileImage(e);if(!n)return;const s=n.naturalWidth,r=n.naturalHeight,o=this.getMaskContext(s,r);o.clearRect(0,0,s,r),o.drawImage(n,0,0);const a=o.getImageData(0,0,s,r).data,l=new Uint8Array(s*r);for(let h=0;h<l.length;h+=1)l[h]=a[h*4+3]>=128?1:0;const c={width:s,height:r,opaque:l};return this.tileMaskCache.set(e,c),c}getSpriteSheet(e){return this.spritesheets.get(e)}getSpriteMask(e,t,n,s,r=1){const o=Math.max(1,Math.round(n)),a=Math.max(1,Math.round(s)),l=Math.max(0,Math.min(255,Math.floor(r))),c=`${e}:${t}:${o}:${a}:${l}`,h=this.spriteMaskCache.get(c);if(h)return h;const d=this.getSpriteSheet(e);if(!d)throw new Error(`Spritesheet asset not found: ${e}`);const u=Math.max(1,Math.floor(d.image.width/d.frameWidth)),f=Math.max(0,Math.min(t,d.frameCount-1)),g=f%u*d.frameWidth,v=Math.floor(f/u)*d.frameHeight,m=this.getMaskContext(o,a);m.save(),m.clearRect(0,0,o,a),m.imageSmoothingEnabled=!1,m.drawImage(d.image,g,v,d.frameWidth,d.frameHeight,0,0,o,a);const p=m.getImageData(0,0,o,a).data;m.restore();const y=new Uint8Array(o*a);for(let S=0;S<y.length;S+=1){const T=p[S*4+3]??0;y[S]=T>=l?1:0}const A={width:o,height:a,opaque:y};return this.spriteMaskCache.set(c,A),A}getMaskContext(e,t){if(this.maskContext&&this.maskCanvas&&this.maskCanvas.width===e&&this.maskCanvas.height===t)return this.maskContext;if(typeof OffscreenCanvas<"u"){const n=new OffscreenCanvas(e,t),s=n.getContext("2d");if(!s)throw new Error("Offscreen canvas 2D context is required for sprite mask generation");return s.imageSmoothingEnabled=!1,this.maskCanvas=n,this.maskContext=s,s}if(typeof document<"u"){const n=document.createElement("canvas");n.width=e,n.height=t;const s=n.getContext("2d");if(!s)throw new Error("Canvas 2D context is required for sprite mask generation");return s.imageSmoothingEnabled=!1,this.maskCanvas=n,this.maskContext=s,s}throw new Error("No canvas implementation available for sprite mask generation")}}class R_{constructor(e){this.keyDown=new Set,this.keyDownListeners=new Set,this.pointerMoveListeners=new Set,this.pointerDownListeners=new Set,this.pointerUpListeners=new Set,this.pointerCancelListeners=new Set,this.handleKeyDown=t=>{this.keyDown.add(t.code),this.keyDownListeners.forEach(n=>{n(t)})},this.handleKeyUp=t=>{this.keyDown.delete(t.code)},this.handleBlur=()=>{this.keyDown.clear()},this.handlePointerMove=t=>{this.pointerMoveListeners.forEach(n=>{n(this.toPointerState(t))})},this.handlePointerDown=t=>{this.pointerDownListeners.forEach(n=>{n(this.toPointerState(t))})},this.handlePointerUp=t=>{this.pointerUpListeners.forEach(n=>{n(this.toPointerState(t))})},this.handlePointerCancel=t=>{this.pointerCancelListeners.forEach(n=>{n(this.toPointerState(t))})},this.element=e,window.addEventListener("keydown",this.handleKeyDown),window.addEventListener("keyup",this.handleKeyUp),window.addEventListener("blur",this.handleBlur),this.element.addEventListener("pointermove",this.handlePointerMove),this.element.addEventListener("pointerdown",this.handlePointerDown),window.addEventListener("pointerup",this.handlePointerUp),window.addEventListener("pointercancel",this.handlePointerCancel)}isKeyDown(e){return this.keyDown.has(e)}onKeyDown(e){return this.keyDownListeners.add(e),()=>{this.keyDownListeners.delete(e)}}onPointerMove(e){return this.pointerMoveListeners.add(e),()=>{this.pointerMoveListeners.delete(e)}}onPointerDown(e){return this.pointerDownListeners.add(e),()=>{this.pointerDownListeners.delete(e)}}onPointerUp(e){return this.pointerUpListeners.add(e),()=>{this.pointerUpListeners.delete(e)}}onPointerCancel(e){return this.pointerCancelListeners.add(e),()=>{this.pointerCancelListeners.delete(e)}}destroy(){window.removeEventListener("keydown",this.handleKeyDown),window.removeEventListener("keyup",this.handleKeyUp),window.removeEventListener("blur",this.handleBlur),this.element.removeEventListener("pointermove",this.handlePointerMove),this.element.removeEventListener("pointerdown",this.handlePointerDown),window.removeEventListener("pointerup",this.handlePointerUp),window.removeEventListener("pointercancel",this.handlePointerCancel),this.keyDown.clear(),this.keyDownListeners.clear(),this.pointerMoveListeners.clear(),this.pointerDownListeners.clear(),this.pointerUpListeners.clear(),this.pointerCancelListeners.clear()}toPointerState(e){const t=this.element.getBoundingClientRect();return{x:e.clientX-t.left,y:e.clientY-t.top,buttons:e.buttons,pointerId:e.pointerId,pointerType:e.pointerType,isPrimary:e.isPrimary}}}class C_{constructor(e){this.input=new R_(e)}isKeyDown(e){return this.input.isKeyDown(e)}onKeyDown(e){return this.input.onKeyDown(e)}onPointerMove(e){return this.input.onPointerMove(e)}onPointerDown(e){return this.input.onPointerDown(e)}onPointerUp(e){return this.input.onPointerUp(e)}onPointerCancel(e){return this.input.onPointerCancel(e)}destroy(){this.input.destroy()}}class P_{constructor(e){this.viewportWidth=1,this.viewportHeight=1,this.disposed=!1;try{this.renderer=new Y0({canvas:e,antialias:!0,alpha:!1})}catch{throw new Error("The 3D game requires WebGL 2. Enable hardware acceleration or try a browser that supports WebGL 2.")}this.renderer.outputColorSpace=Ot,this.renderer.toneMapping=da}get width(){return this.viewportWidth}get height(){return this.viewportHeight}get pixelRatio(){return this.renderer.getPixelRatio()}resize(e,t){this.viewportWidth=Math.max(1,Math.round(e)),this.viewportHeight=Math.max(1,Math.round(t));const n=typeof window>"u"?1:window.devicePixelRatio,s=Number.isFinite(n)&&n>0?Math.min(n,2):1;this.renderer.setDrawingBufferSize(this.viewportWidth,this.viewportHeight,s)}render(e,t){this.disposed||this.renderer.render(e,t)}dispose(){this.disposed||(this.disposed=!0,this.renderer.dispose())}}class L_{constructor(){this.timers=new Set,this.paused=!1}delayedCall(e,t){const n={active:!0,paused:!1,delayMs:e,elapsedMs:0,callback:t,cancel:()=>{n.active=!1,this.timers.delete(n)}};return this.timers.add(n),n}setPaused(e){this.paused=e}update(e){if(this.paused||e<=0)return;Array.from(this.timers).forEach(n=>{!n.active||n.paused||(n.elapsedMs+=e,!(n.elapsedMs<n.delayMs)&&(n.active=!1,this.timers.delete(n),n.callback()))})}clear(){this.timers.forEach(e=>{e.active=!1}),this.timers.clear()}}const I_=(i,e)=>i==="sineInOut"?-(Math.cos(Math.PI*e)-1)/2:e;class D_{constructor(){this.tweens=new Set,this.paused=!1}setPaused(e){this.paused=e}add(e){const t=e.target,n={};Object.keys(e.to).forEach(r=>{const o=t[r];n[r]=typeof o=="number"?o:0});const s={active:!0,paused:!1,target:e.target,from:n,to:e.to,durationMs:Math.max(1,e.durationMs),elapsedMs:0,ease:e.ease??"linear",onComplete:e.onComplete,cancel:()=>{s.active=!1,this.tweens.delete(s)}};return this.tweens.add(s),s}update(e){if(this.paused||e<=0)return;Array.from(this.tweens).forEach(n=>{var o;if(!n.active||n.paused)return;n.elapsedMs+=e;const s=Math.min(1,n.elapsedMs/n.durationMs),r=I_(n.ease,s);Object.keys(n.to).forEach(a=>{const l=n.from[a]??0,c=n.to[a]??l;n.target[a]=l+(c-l)*r}),s>=1&&(n.active=!1,this.tweens.delete(n),(o=n.onComplete)==null||o.call(n))})}clear(){this.tweens.forEach(e=>{e.active=!1}),this.tweens.clear()}}class N_{constructor(){this.timers=new L_,this.tweens=new D_}delayedCall(e,t){return this.timers.delayedCall(e,t)}addTween(e){return this.tweens.add(e)}update(e){this.timers.update(e),this.tweens.update(e)}setPaused(e){this.timers.setPaused(e),this.tweens.setPaused(e)}clear(){this.timers.clear(),this.tweens.clear()}}function Ua(){return{collides:!0,penGate:!1,portal:!1,up:!0,down:!0,left:!0,right:!0}}function Ji(i){return!i||i.gid===null}function U_(i){if(!i)return!0;const e=i.collision;return e.collides&&e.up&&e.right&&e.down&&e.left}function Xs(i){return!i||i.gid===null||i.collision.penGate?!1:!U_(i)}function F_(i){var s,r,o,a,l,c,h,d,u;const e=[],t=i.length,n=((s=i[0])==null?void 0:s.length)??0;if(t<3||n<3)return e;for(let f=0;f<t;f+=1){const g=(r=i[f])==null?void 0:r[1],v=(o=i[f])==null?void 0:o[0];Xs(g)&&v&&v.gid!==null&&!v.collision.left&&e.push({tile:{x:1,y:f},side:"left"});const m=(a=i[f])==null?void 0:a[n-2],p=(l=i[f])==null?void 0:l[n-1];Xs(m)&&p&&p.gid!==null&&!p.collision.right&&e.push({tile:{x:n-2,y:f},side:"right"})}for(let f=0;f<n;f+=1){const g=(c=i[1])==null?void 0:c[f],v=(h=i[0])==null?void 0:h[f];Xs(g)&&v&&v.gid!==null&&!v.collision.up&&e.push({tile:{x:f,y:1},side:"top"});const m=(d=i[t-2])==null?void 0:d[f],p=(u=i[t-1])==null?void 0:u[f];Xs(m)&&p&&p.gid!==null&&!p.collision.down&&e.push({tile:{x:f,y:t-2},side:"bottom"})}return e}function O_(i){var t,n,s,r,o,a;const e=[];for(let l=0;l<i.length;l+=1)for(let c=0;c<(((t=i[l])==null?void 0:t.length)??0);c+=1){const h=(n=i[l])==null?void 0:n[c];if(!h||h.gid===null||h.collision.collides||h.collision.penGate)continue;const d=(s=i[l-1])==null?void 0:s[c],u=(r=i[l+1])==null?void 0:r[c],f=(o=i[l])==null?void 0:o[c-1],g=(a=i[l])==null?void 0:a[c+1];Ji(f)&&!h.collision.left&&e.push({tile:{x:c,y:l},side:"left"}),Ji(g)&&!h.collision.right&&e.push({tile:{x:c,y:l},side:"right"}),Ji(d)&&!h.collision.up&&e.push({tile:{x:c,y:l},side:"top"}),Ji(u)&&!h.collision.down&&e.push({tile:{x:c,y:l},side:"bottom"})}return e}function B_(i){var e,t;for(let n=0;n<i.length;n+=1)for(let s=0;s<(((e=i[n])==null?void 0:e.length)??0);s+=1){const r=(t=i[n])==null?void 0:t[s];!r||r.gid===null||(r.collision.portal=!1)}}function k_(i,e){const t=i.filter(n=>{var r;const s=(r=e[n.tile.y])==null?void 0:r[n.tile.x];return!!(s&&!s.collision.collides)});return t.length>0?t:i}function Ys(i,e,t,n){const s=(t-1)/2,r=(n-1)/2,o=i.filter(a=>a.side===e);return o.length===0?null:(o.sort((a,l)=>{if(e==="left"||e==="right"){const h=Math.abs(a.tile.y-r)-Math.abs(l.tile.y-r);return h!==0?h:a.tile.x!==l.tile.x?e==="left"?a.tile.x-l.tile.x:l.tile.x-a.tile.x:a.tile.y-l.tile.y}const c=Math.abs(a.tile.x-s)-Math.abs(l.tile.x-s);return c!==0?c:a.tile.y!==l.tile.y?e==="top"?a.tile.y-l.tile.y:l.tile.y-a.tile.y:a.tile.x-l.tile.x}),o[0]??null)}function z_(i){var u,f;if(i.length===0||(((u=i[0])==null?void 0:u.length)??0)===0)return[];B_(i);const e=F_(i),t=O_(i),n=["left","right","top","bottom"],s=[];n.forEach(g=>{const v=e.filter(m=>m.side===g);if(v.length>0){s.push(...k_(v,i));return}s.push(...t.filter(m=>m.side===g))});const r=((f=i[0])==null?void 0:f.length)??0,o=i.length,a=Ys(s,"left",r,o),l=Ys(s,"right",r,o),c=Ys(s,"top",r,o),h=Ys(s,"bottom",r,o),d=[];return a&&l&&d.push({from:{...a.tile},to:{...l.tile}}),c&&h&&d.push({from:{...c.tile},to:{...h.tile}}),d.forEach(g=>{var p,y;const v=(p=i[g.from.y])==null?void 0:p[g.from.x],m=(y=i[g.to.y])==null?void 0:y[g.to.x];v&&(v.collision.portal=!0),m&&(m.collision.portal=!0)}),d}function G_(i){var t,n;const e=[{dx:0,dy:-1,edge:"up"},{dx:1,dy:0,edge:"right"},{dx:0,dy:1,edge:"down"},{dx:-1,dy:0,edge:"left"}];for(let s=0;s<i.length;s+=1)for(let r=0;r<(((t=i[s])==null?void 0:t.length)??0);r+=1){const o=(n=i[s])==null?void 0:n[r];if(!o||o.gid===null||o.collision.portal)continue;e.some(({dx:l,dy:c,edge:h})=>{var u;const d=(u=i[s+c])==null?void 0:u[r+l];return Ji(d)&&!o.collision[h]})&&(o.collision=Ua())}}const pc=2147483648,mc=1073741824,gc=536870912,qs=i=>typeof i=="object"&&i!==null;function H_(i){const e=!!(i&pc),t=!!(i&mc),n=!!(i&gc),s=i&~(pc|mc|gc);let r=0,o=!1;return e&&t&&n?(r=Math.PI/2,o=!0):e&&t&&!n?r=Math.PI:e&&!t&&n?r=Math.PI/2:e&&!t&&!n?o=!0:!e&&t&&n?r=3*Math.PI/2:!e&&t&&!n?(r=Math.PI,o=!0):!e&&!t&&n&&(r=3*Math.PI/2,o=!0),{gid:s,flippedHorizontal:e,flippedVertical:t,flippedAntiDiagonal:n,rotation:r,flipped:o}}function V_(i){const e=n=>i[n],t=n=>!!n;return{collides:t(e("collides")),penGate:t(e("penGate")),portal:t(e("portal")),up:t(e("up")??e("blocksUp")),down:t(e("down")??e("blocksDown")),left:t(e("left")??e("blocksLeft")),right:t(e("right")??e("blocksRight"))}}function W_(i,e,t,n){let s={up:i.up,right:i.right,down:i.down,left:i.left};t&&([s.left,s.right]=[s.right,s.left]),n&&([s.up,s.down]=[s.down,s.up]);const r=(Math.round(e/(Math.PI/2))%4+4)%4;for(let o=0;o<r;o+=1)s={up:s.left,right:s.up,down:s.right,left:s.down};return{collides:i.collides,penGate:i.penGate,portal:i.portal,...s}}const X_=(i,e)=>{var t;for(let n=0;n<e.length;n+=1){const s=e[n],r=((t=e[n+1])==null?void 0:t.firstgid)??Number.POSITIVE_INFINITY;if(i>=s.firstgid&&i<r)return s}},Y_=i=>{const e={};return Array.isArray(i)&&i.forEach(t=>{t&&typeof t.name=="string"&&(e[t.name]=t.value)}),e},_c=i=>{var e;return{id:i.id,name:i.name,type:i.type,visible:i.visible,x:i.x,y:i.y,width:i.width,height:i.height,properties:(e=i.properties)==null?void 0:e.map(t=>({name:t.name,type:t.type,value:t.value}))}};function q_(i){var r,o,a,l;let e=Number.POSITIVE_INFINITY,t=Number.POSITIVE_INFINITY,n=Number.NEGATIVE_INFINITY,s=Number.NEGATIVE_INFINITY;for(let c=0;c<i.length;c+=1)for(let h=0;h<(((r=i[c])==null?void 0:r.length)??0);h+=1)((a=(o=i[c])==null?void 0:o[h])==null?void 0:a.gid)!==null&&(e=Math.min(e,h),t=Math.min(t,c),n=Math.max(n,h),s=Math.max(s,c));return!Number.isFinite(e)||!Number.isFinite(t)||!Number.isFinite(n)||!Number.isFinite(s)?{minX:0,minY:0,width:((l=i[0])==null?void 0:l.length)??0,height:i.length}:{minX:e,minY:t,width:n-e+1,height:s-t+1}}function K_(i,e){var n;const t=[];for(let s=0;s<e.height;s+=1){const r=[];for(let o=0;o<e.width;o+=1){const a=(n=i[e.minY+s])==null?void 0:n[e.minX+o];if(!a){r.push({x:o,y:s,rawGid:0,gid:null,localId:null,imagePath:"(empty)",rotation:0,flipX:!1,flipY:!1,collision:Ua()});continue}r.push({...a,x:o,y:s})}t.push(r)}return t}function xc(i,e,t,n){var a;const s=e.minX*t,r=e.minY*n,o=(a=i.properties)==null?void 0:a.map(l=>{const c=l.name==="gridX"||l.name==="startX"||l.name==="endX",h=l.name==="gridY";return!c&&!h||typeof l.value!="number"?l:{...l,value:c?l.value-e.minX:l.value-e.minY}});return{...i,x:typeof i.x=="number"?i.x-s:i.x,y:typeof i.y=="number"?i.y-r:i.y,properties:o}}function J_(i){const e=i.layers.find(p=>qs(p)&&p.type==="tilelayer"&&p.name==="Maze"),t=i.layers.find(p=>qs(p)&&p.type==="tilelayer"),n=e??t;if(!n||!Array.isArray(n.data))throw new Error("Maze tile layer is required in maze.json");const s=n.width,r=n.height;if(!Number.isFinite(s)||!Number.isFinite(r)||s<=0||r<=0)throw new Error("Maze layer width/height must be positive numbers");const o=new Map,a=new Map;i.tilesets.forEach(p=>{!Number.isFinite(p.firstgid)||!Array.isArray(p.tiles)||p.tiles.forEach(y=>{if(!y||!Number.isFinite(y.id))return;const A=p.firstgid+y.id,S=Y_(y.properties);o.set(A,V_(S)),typeof y.image=="string"&&a.set(A,y.image)})});const l=[...i.tilesets].sort((p,y)=>p.firstgid-y.firstgid),c=[];for(let p=0;p<r;p+=1){const y=[];for(let A=0;A<s;A+=1){const S=p*s+A,T=n.data[S]??0,w=H_(T);if(w.gid<=0){y.push({x:A,y:p,rawGid:T,gid:null,localId:null,imagePath:"(empty)",rotation:0,flipX:!1,flipY:!1,collision:Ua()});continue}const R=X_(w.gid,l),x=R?w.gid-R.firstgid:w.gid,b=o.get(w.gid)??l_();y.push({x:A,y:p,rawGid:T,gid:w.gid,localId:x,imagePath:a.get(w.gid)??"(unknown)",rotation:w.rotation,flipX:w.flipped,flipY:!1,collision:W_(b,w.rotation,w.flipped,!1)})}c.push(y)}const h=q_(c),d=K_(c,h),u=i.layers.find(p=>qs(p)&&p.type==="objectgroup"&&p.name==="Spawns"),f=i.layers.find(p=>qs(p)&&p.type==="objectgroup"&&p.name==="Dots"),g=((u==null?void 0:u.objects)??[]).map(p=>xc(_c(p),h,i.tilewidth,i.tileheight)),v=((f==null?void 0:f.objects)??[]).map(p=>xc(_c(p),h,i.tilewidth,i.tileheight)),m=z_(d);return G_(d),{width:h.width,height:h.height,tileWidth:i.tilewidth,tileHeight:i.tileheight,widthInPixels:h.width*i.tilewidth,heightInPixels:h.height*i.tileheight,tiles:d,collisionByGid:o,imageByGid:a,portalPairs:m,spawnObjects:g,collectibleObjects:v,packetSpawn:g.find(p=>p.type==="packet"),ghostHome:g.find(p=>p.type==="ghost-home")}}class $_{constructor(){this.assets=new Ah}async loadMap(e){const t=await this.assets.loadJSON("maze",e);return J_(t)}}function Z_(i){return typeof i=="function"?{next:i,int(e){return e<=0?0:Math.floor(i()*e)}}:i}function Q_(i,e,t){e.state.scared=!0,i.ghostScaredTimers.set(e,t),i.ghostScaredWarnings.delete(e)}function Fa(i,e){e.state.scared=!1,i.ghostScaredTimers.delete(e),i.ghostScaredWarnings.delete(e)}function Rh(i,e){i.ghosts.forEach(t=>{t.active&&Q_(i,t,e)})}function j_(i){i.ghosts.forEach(e=>{Fa(i,e)})}function es(i,e,t){if(i>=e)return 0;let n=t.blinkStartIntervalMs;if(!(e<=0)){const r=Math.max(0,Math.min(1,i/e)),o=t.blinkStartIntervalMs+(t.blinkEndIntervalMs-t.blinkStartIntervalMs)*r;n=Math.max(1,Math.round(o))}const s=i+n;return s>=e?e:s}const ex={scaredIdle:{start:0,end:7,yoyo:!0,frameRate:4},inkyIdle:{start:0,end:7,yoyo:!0,frameRate:4},clydeIdle:{start:0,end:7,yoyo:!0,frameRate:4},pinkyIdle:{start:0,end:7,yoyo:!0,frameRate:4},blinkyIdle:{start:0,end:7,yoyo:!0,frameRate:4}},ha=[0,1,2,3,2,1],fo=ha[0],tx=20,nx=.5;class ix{constructor(e,t,n=ex){this.world=e,this.defaultGhostSpeed=t,this.animations=n}start(){this.world.packetAnimation=this.createPacketAnimationPlayback(),this.world.ghosts.forEach(e=>{this.world.ghostAnimations.set(e,this.createAnimationPlayback(`${e.key}Idle`))})}update(e){this.updatePacketAnimationState(e),this.world.ghosts.forEach(t=>{this.updateGhostAnimationState(t,e)})}updatePacketAnimationState(e){const t=this.world.packetAnimation;if(!t.active){t.frame=fo,t.elapsedMs=0,t.sequenceIndex=0;return}const n=1e3/tx;for(t.elapsedMs+=e;t.elapsedMs>=n;){if(t.elapsedMs-=n,t.sequenceIndex+=1,t.sequenceIndex>=ha.length){t.active=!1,t.frame=fo,t.elapsedMs=0,t.sequenceIndex=0;return}t.frame=ha[t.sequenceIndex]}}updateGhostAnimationState(e,t){this.updateGhostScaredTimer(e,t),e.state.scared&&e.state.animation!=="scared"?(e.state.animation="scared",e.speed=nx,this.world.ghostAnimations.set(e,this.createAnimationPlayback("scaredIdle"))):!e.state.scared&&e.state.animation==="scared"&&(e.state.animation="default",this.world.ghostAnimations.set(e,this.createAnimationPlayback(`${e.key}Idle`)),this.canRestoreGhostSpeed(e)&&(e.speed=this.defaultGhostSpeed)),!e.state.scared&&e.speed!==this.defaultGhostSpeed&&this.canRestoreGhostSpeed(e)&&(e.speed=this.defaultGhostSpeed);const n=this.world.ghostAnimations.get(e);if(!n)return;const s=this.animations[n.key],r=1e3/s.frameRate;for(n.elapsedMs+=t;n.elapsedMs>=r;){if(n.elapsedMs-=r,!s.yoyo){n.frame=n.frame+1>s.end?s.start:n.frame+1;continue}n.forward===1?n.frame<s.end?n.frame+=1:(n.forward=-1,n.frame-=1):n.frame>s.start?n.frame-=1:(n.forward=1,n.frame+=1)}}updateGhostScaredTimer(e,t){const n=this.world.ghostScaredTimers.get(e)??0;if(n<=0){this.world.ghostScaredWarnings.delete(e);return}e.state.scared||(e.state.scared=!0);const s=Number.isFinite(t)&&t>0?t:0,r=Math.max(0,n-s);if(r<=0){Fa(this.world,e);return}this.world.ghostScaredTimers.set(e,r),this.updateGhostWarningState(e,n,r)}updateGhostWarningState(e,t,n){if(n>Dn){this.world.ghostScaredWarnings.delete(e);return}const s=Math.max(0,Dn-t),r=Math.max(0,Dn-n),o=Math.max(0,r-s);let a=this.world.ghostScaredWarnings.get(e);a||(a={elapsedMs:s,nextToggleAtMs:es(s,Dn,rn),showBaseColor:!1});const l=a.elapsedMs;a.elapsedMs=Math.min(Dn,a.elapsedMs+o);let c=a.nextToggleAtMs;for((!Number.isFinite(c)||c<=0)&&(c=es(l,Dn,rn));c>0&&a.elapsedMs>=c;)a.showBaseColor=!a.showBaseColor,c=es(c,Dn,rn);a.nextToggleAtMs=c,this.world.ghostScaredWarnings.set(e,a)}createAnimationPlayback(e){const t=this.animations[e];return{key:e,frame:t.start,elapsedMs:0,forward:1}}createPacketAnimationPlayback(){return{frame:fo,elapsedMs:0,sequenceIndex:0,active:!1}}canRestoreGhostSpeed(e){return e.state.free?e.moved.x===0&&e.moved.y===0:!0}}class sx{constructor(e,t,n,s){this.world=e,this.camera=t,this.renderer=n,this.canvas=s}start(){this.camera.setBounds(this.world.map.widthInPixels,this.world.map.heightInPixels),this.camera.setZoom(ao.zoom),this.camera.startFollow(this.world.packet,ao.followLerp.x,ao.followLerp.y),this.handleResize(),this.camera.snapToFollowTarget(),this.onResize=()=>{this.handleResize()},window.addEventListener("resize",this.onResize)}update(){this.camera.update()}destroy(){this.onResize&&(window.removeEventListener("resize",this.onResize),this.onResize=void 0)}handleResize(){this.renderer.resize(window.innerWidth,window.innerHeight);const e=Number.isFinite(this.renderer.width)?this.renderer.width:this.canvas.width,t=Number.isFinite(this.renderer.height)?this.renderer.height:this.canvas.height;this.camera.setViewport(e,t)}}class rx{constructor(e){this.value=e>>>0}next(){this.value+=1831565813;let e=Math.imul(this.value^this.value>>>15,1|this.value);return e^=e+Math.imul(e^e>>>7,61|e),((e^e>>>14)>>>0)/4294967296}int(e){return e<=0?0:Math.floor(this.next()*e)}}const ox=2166136261,ax=16777619,lx=1/13;function cx(i,e,t){return i<e?e:i>t?t:i}function hx(i){return`${i.x},${i.y}`}function Ch(i,e){return i.y!==e.y?i.y-e.y:i.x-e.x}function Ph(i,e){return e.x>=0&&e.x<i.width&&e.y>=0&&e.y<i.height}function ux(i,e){var n;if(!Ph(i,e))return!1;const t=(n=i.tiles[e.y])==null?void 0:n[e.x];return!t||t.gid===null}function dx(i,e){var s,r;if(!fr(i,e))return!1;const t=(r=(s=i.tiles[e.y])==null?void 0:s[e.x])==null?void 0:r.collision;if(!t)return!1;const n=o=>o==="up"?t.up:o==="down"?t.down:o==="left"?t.left:t.right;return Da.some(o=>{const a=Na[o],l={x:e.x+a.dx,y:e.y+a.dy};return ux(i,l)?!n(o):!1})}function fr(i,e){var n;if(!Ph(i,e))return!1;const t=(n=i.tiles[e.y])==null?void 0:n[e.x];return!!(t&&t.gid!==null&&!t.collision.penGate)}function fx(i,e,t,n){return fr(i,t)?!dx(i,t):!1}function Lh(i,e,t,n){if(!fr(i,t))return[];const s=e.getTilesAt(t),r=[];return Da.forEach(o=>{const a=Na[o],l={x:t.x+a.dx,y:t.y+a.dy};fr(i,l)&&Zn(o,0,0,s,n,"packet")&&r.push(l)}),r}function vc(i,e,t,n){return Lh(i,e,t,n).length>0}function px(i,e,t,n){if(vc(i,e,t,n))return t;for(let s=0;s<i.height;s+=1)for(let r=0;r<i.width;r+=1){const o={x:r,y:s};if(vc(i,e,o,n))return o}return null}function mx(i,e,t,n){const s=[t],r=new Set,o=[];for(let a=0;a<s.length;a+=1){const l=s[a],c=hx(l);if(r.has(c))continue;r.add(c);const h=Lh(i,e,l,n);h.length&&(o.push(l),h.forEach(d=>{s.push(d)}))}return o.sort(Ch),o}function Xi(i,e){const t=(i^e>>>0)>>>0;return Math.imul(t,ax)>>>0}function gx(i,e){let t=ox;return t=Xi(t,i.width),t=Xi(t,i.height),t=Xi(t,e.x),t=Xi(t,e.y),i.tiles.forEach(n=>{n.forEach(s=>{t=Xi(t,s.rawGid)})}),t>>>0}function _x(i,e,t){if(e<=0||i.length===0)return[];const n=[...i],s=new rx(t);for(let r=n.length-1;r>0;r-=1){const o=s.int(r+1);[n[r],n[o]]=[n[o],n[r]]}return n.slice(0,e).sort(Ch)}function xx(i){const{map:e,collisionGrid:t,startTile:n,tileSize:s,options:r}=i,o=px(e,t,n,s);if(!o)return{basePoints:[],powerPoints:[],seed:0};const l=mx(e,t,o,s).filter(m=>fx(e,t,m)),c=Math.max(0,(r==null?void 0:r.powerPointRatio)??lx),h=Math.min(l.length,Math.max(0,(r==null?void 0:r.maxPowerPoints)??l.length)),d=Math.min(h,Math.max(0,(r==null?void 0:r.minPowerPoints)??1)),u=Math.round(l.length*c),f=cx(u,d,h),g=((r==null?void 0:r.seed)??gx(e,o))>>>0,v=_x(l,f,g);return{basePoints:l,powerPoints:v,seed:g}}const vx=hs[0].size,Mx=hs[1].size,Sx=96,yx=1.5,Mc=.001,Sc=.01;function Ks(i){return`${i.x},${i.y}`}function po(i,e){var n;const t=(n=i.properties)==null?void 0:n.find(s=>s.name===e);return typeof(t==null?void 0:t.value)=="number"?t.value:void 0}class Ex{constructor(e){this.world=e,this.pointsByTile=new Map,this.eatEffects=[];const t=this.buildMapAuthoredCollectibles();if(t.size>0){t.forEach((n,s)=>{this.pointsByTile.set(s,n)});return}this.buildAlgorithmicCollectibles()}update(e){this.consumePointAtPacketTile(),this.updateEatEffects(e)}getPoints(){return this.pointsByTile.values()}getPointCount(){return this.pointsByTile.size}getEatEffects(){return this.eatEffects}consumePointAtPacketTile(){const e=Ks(this.world.packet.tile),t=this.pointsByTile.get(e);if(!t||!this.isPacketCenteredOnPoint(t))return;this.pointsByTile.delete(e);const n=t.kind==="power"?hs[1].score:hs[0].score;wh(n),t.kind==="power"&&this.triggerScaredGhostWindow(),this.triggerPacketEatAnimation();const s=t.kind==="power"?Mx:vx;this.eatEffects.push({x:t.x,y:t.y,elapsedMs:0,durationMs:Sx,sizeStart:s,sizeEnd:s*yx})}triggerPacketEatAnimation(){const e=this.world.packetAnimation;e.active=!0,e.frame=0,e.elapsedMs=0,e.sequenceIndex=0}triggerScaredGhostWindow(){Rh(this.world,Eh),this.world.ghostEatChainCount=0}isPacketCenteredOnPoint(e){return Math.abs(this.world.packet.moved.x)>Mc||Math.abs(this.world.packet.moved.y)>Mc?!1:Math.abs(this.world.packet.x-e.x)<=Sc&&Math.abs(this.world.packet.y-e.y)<=Sc}updateEatEffects(e){for(let t=this.eatEffects.length-1;t>=0;t-=1){const n=this.eatEffects[t];n.elapsedMs+=e,n.elapsedMs>=n.durationMs&&this.eatEffects.splice(t,1)}}buildMapAuthoredCollectibles(){const e=new Map;return(this.world.map.collectibleObjects??[]).forEach(n=>{const s=po(n,"pointType"),r=s===1||n.type==="power-pellet"?"power":s===0||n.type==="pellet"?"base":null;if(!r)return;const o=po(n,"gridX"),a=po(n,"gridY"),l=this.resolveCollectibleTile({gridX:o,gridY:a,x:n.x,y:n.y});if(!l)return;const c=Ks(l),h=this.toPointCenter(l),d=e.get(c);(d==null?void 0:d.kind)!=="power"&&e.set(c,{tile:l,x:h.x,y:h.y,kind:r})}),e}buildAlgorithmicCollectibles(){const e=xx({map:this.world.map,collisionGrid:this.world.collisionGrid,startTile:this.world.packet.tile,tileSize:this.world.tileSize}),t=new Set(e.powerPoints.map(n=>Ks(n)));e.basePoints.forEach(n=>{const s=Ks(n),r=this.toPointCenter(n);this.pointsByTile.set(s,{tile:n,x:r.x,y:r.y,kind:t.has(s)?"power":"base"})})}resolveCollectibleTile(e){return typeof e.gridX=="number"&&typeof e.gridY=="number"?{x:e.gridX,y:e.gridY}:typeof e.x=="number"&&typeof e.y=="number"?{x:Math.floor(e.x/this.world.tileSize),y:Math.floor(e.y/this.world.tileSize)}:null}toPointCenter(e){return{x:e.x*this.world.tileSize+this.world.tileSize/2,y:e.y*this.world.tileSize+this.world.tileSize/2}}}class wx{constructor(e,t){this.world=e,this.camera=t,this.runsWhenPaused=!0,this.lastRenderTimestampMs=null,this.smoothedFps=null,this.panelsVisible=null}start(){this.createPanels()}update(){if(!this.world.collisionDebugEnabled){this.world.hoveredDebugTile=null;return}const e=this.world.pointerScreen;if(!e)return;const t=this.camera.screenToWorld(e.x,e.y),n=Math.floor(t.x/this.world.tileSize),s=Math.floor(t.y/this.world.tileSize);if(n<0||s<0||n>=this.world.map.width||s>=this.world.map.height){this.world.hoveredDebugTile=null;return}this.world.hoveredDebugTile={x:n,y:s}}render(){if(!(!this.collisionPanel||!this.runtimePanel)){if(!this.world.collisionDebugEnabled){if(this.panelsVisible===!1)return;this.panelsVisible=!1,this.collisionPanel.style.display="none",this.collisionPanel.textContent="",this.runtimePanel.style.display="none",this.runtimePanel.textContent="",this.world.debugPanelText="",this.lastRenderTimestampMs=null,this.smoothedFps=null;return}this.panelsVisible!==!0&&(this.panelsVisible=!0,this.collisionPanel.style.display="block",this.runtimePanel.style.display="block"),this.world.hoveredDebugTile?this.world.debugPanelText=this.getTileDebugInfo(this.world.hoveredDebugTile):this.world.debugPanelText=`Collision Debug
move mouse over a block to inspect`,this.collisionPanel.textContent=this.world.debugPanelText,this.runtimePanel.textContent=this.getRuntimeDebugText()}}destroy(){var e,t;(e=this.collisionPanel)==null||e.remove(),(t=this.runtimePanel)==null||t.remove(),this.collisionPanel=void 0,this.runtimePanel=void 0,this.lastRenderTimestampMs=null,this.smoothedFps=null,this.panelsVisible=null}createPanels(){this.collisionPanel=this.createCollisionPanel(),this.runtimePanel=this.createRuntimePanel(),document.body.append(this.runtimePanel,this.collisionPanel)}createCollisionPanel(){var n;const e="collision-debug-panel";(n=document.getElementById(e))==null||n.remove();const t=document.createElement("pre");return t.id=e,t.style.position="fixed",t.style.left="8px",t.style.top="52px",t.style.margin="0",t.style.padding="6px 8px",t.style.color="#ffffff",t.style.background="rgba(0, 0, 0, 0.78)",t.style.font="12px/1.35 monospace",t.style.whiteSpace="pre",t.style.pointerEvents="none",t.style.zIndex="9999",t.style.border="1px solid rgba(255, 255, 255, 0.2)",t.style.borderRadius="4px",t.style.display="none",t}createRuntimePanel(){var n;const e="runtime-debug-panel";(n=document.getElementById(e))==null||n.remove();const t=document.createElement("pre");return t.id=e,t.style.position="fixed",t.style.left="8px",t.style.top="8px",t.style.margin="0",t.style.padding="6px 8px",t.style.color="#ffffff",t.style.background="rgba(0, 0, 0, 0.78)",t.style.font="12px/1.35 monospace",t.style.whiteSpace="pre",t.style.pointerEvents="none",t.style.zIndex="9999",t.style.border="1px solid rgba(255, 255, 255, 0.2)",t.style.borderRadius="4px",t.style.display="none",t}getRuntimeDebugText(){const e=this.getTimestampMs();let t=null;if(this.lastRenderTimestampMs!==null){const r=e-this.lastRenderTimestampMs;Number.isFinite(r)&&r>0&&(t=r)}if(this.lastRenderTimestampMs=e,t===null)return["Runtime Diagnostics","fps: --","frame: -- ms"].join(`
`);const n=1e3/t,s=.2;return this.smoothedFps=this.smoothedFps===null?n:this.smoothedFps+(n-this.smoothedFps)*s,["Runtime Diagnostics",`fps: ${this.smoothedFps.toFixed(1)}`,`frame: ${t.toFixed(2)} ms`].join(`
`)}getTimestampMs(){return typeof performance<"u"&&typeof performance.now=="function"?performance.now():Date.now()}getTileDebugInfo(e){var r;const t=(r=this.world.map.tiles[e.y])==null?void 0:r[e.x],n=this.world.collisionGrid.getTileAt(e.x,e.y);if(!t||t.gid===null)return["Collision Debug",`tile: (${e.x}, ${e.y})`,"gid: empty","edges: up:false right:false down:false left:false"].join(`
`);const s=(Math.round(t.rotation/(Math.PI/2))%4+4)%4;return["Collision Debug",`tile: (${e.x}, ${e.y}) gid:${t.gid} local:${t.localId}`,`image: ${t.imagePath}`,`collides:${n.collides} penGate:${n.penGate} portal:${n.portal}`,`edges: up:${n.up} right:${n.right} down:${n.down} left:${n.left}`,`transform: rot:${s*90}deg flipX:${t.flipX} flipY:${t.flipY}`].join(`
`)}}class Tx{constructor(e,t,n,s,r){this.world=e,this.movementRules=t,this.decisions=n,this.portalService=s,this.rng=r}update(){this.world.ghosts.forEach(e=>{if(!e.state.free||this.world.ghostsExitingJail.has(e))return;const t=this.world.collisionGrid.getTilesAt(e.tile),n=this.movementRules.canMove(e.direction,e.moved.y,e.moved.x,t,"ghost"),s=this.portalService.canAdvanceOutward(e,this.world.collisionGrid);n||s?(e.moved.x===0&&e.moved.y===0&&n&&(e.direction=this.decisions.chooseDirectionAtCenter(e.direction,t,this.world.tileSize,this.rng)),this.movementRules.advanceEntity(e,e.direction,e.speed)):e.moved.x===0&&e.moved.y===0&&(e.direction=this.decisions.chooseDirectionWhenBlocked(e.direction,e.moved.y,e.moved.x,t,this.world.tileSize,this.rng)),this.portalService.tryTeleport(e,this.world.collisionGrid,this.world.tick,this.world.tileSize),this.movementRules.syncEntityPosition(e)})}}function Ih(i){return i*Math.PI/180}function bx(i){const e=i.width/2,t=i.height/2,n=Ih(i.angle),s=Math.cos(n),r=Math.sin(n),o=[{x:-e,y:-t},{x:e,y:-t},{x:e,y:t},{x:-e,y:t}];let a=Number.POSITIVE_INFINITY,l=Number.POSITIVE_INFINITY,c=Number.NEGATIVE_INFINITY,h=Number.NEGATIVE_INFINITY;return o.forEach(d=>{const u=i.x+d.x*s-d.y*r,f=i.y+d.x*r+d.y*s;a=Math.min(a,u),l=Math.min(l,f),c=Math.max(c,u),h=Math.max(h,f)}),{minX:a,minY:l,maxX:c,maxY:h}}function Ax(i,e){const t=Math.max(i.minX,e.minX),n=Math.max(i.minY,e.minY),s=Math.min(i.maxX,e.maxX),r=Math.min(i.maxY,e.maxY);return t>=s||n>=r?null:{minX:t,minY:n,maxX:s,maxY:r}}function yc(i){return{sample:i,bounds:bx(i),halfWidth:i.width/2,halfHeight:i.height/2,valid:!(i.width<=0||i.height<=0||i.mask.width<=0||i.mask.height<=0)}}function Ec(i){if(!i.inverseRotation){const e=Ih(-i.sample.angle);i.inverseRotation={cos:Math.cos(e),sin:Math.sin(e)}}return i.inverseRotation}function wc(i,{cos:e,sin:t},n,s){const{sample:r,halfWidth:o,halfHeight:a}=i,l=n-r.x,c=s-r.y;let h=l*e-c*t,d=l*t+c*e;r.flipX&&(h*=-1),r.flipY&&(d*=-1);const u=(h+o)/r.width,f=(d+a)/r.height;if(u<0||u>=1||f<0||f>=1)return!1;const g=Math.floor(u*r.mask.width),v=Math.floor(f*r.mask.height);if(g<0||g>=r.mask.width||v<0||v>=r.mask.height)return!1;const m=v*r.mask.width+g;return(r.mask.opaque[m]??0)>0}function Rx(i,e){if(!i.valid||!e.valid)return!1;const t=Ax(i.bounds,e.bounds);if(!t)return!1;const n=Ec(i),s=Ec(e),r=Math.floor(t.minX),o=Math.ceil(t.maxX),a=Math.floor(t.minY),l=Math.ceil(t.maxY);for(let c=a;c<l;c+=1)for(let h=r;h<o;h+=1){const d=h+.5,u=c+.5;if(wc(i,n,d,u)&&wc(e,s,d,u))return!0}return!1}function Cx(i){return i.state.scared?"ghost-hit":"packet-hit"}function Px(i){const e=i.resolveOutcome??Cx;if(i.ghosts.length===0)return null;const t=yc(i.packet);for(const n of i.ghosts)if(Rx(t,yc(n.sample)))return{ghost:n.ghost,contact:"pixel-mask-overlap",outcome:e(n.ghost)};return null}function Dh(i,e){if(!e.state.scared)return e.key;const t=i.ghostScaredTimers.get(e)??0;if(t>0&&t<=Dn){const n=i.ghostScaredWarnings.get(e);if(n!=null&&n.showBaseColor)return e.key}return"scared"}const Tc="right",bc=1;class Lx{constructor(){this.cache=new Map}getPacketMask(e,t,n,s){return this.getSolidMask(`packet:${e}:${t}:${n}`,t,n)}getGhostMask(e,t,n,s,r){return this.getSolidMask(`ghost:${e}:${t}:${n}:${s}`,n,s)}getSolidMask(e,t,n){const s=this.cache.get(e);if(s)return s;const r=Math.max(1,Math.round(t)),o=Math.max(1,Math.round(n)),a=new Uint8Array(r*o);a.fill(1);const l={width:r,height:o,opaque:a};return this.cache.set(e,l),l}}class Ix{constructor(e,t,n=ji.ghost,s=new Lx){this.world=e,this.movementRules=t,this.defaultGhostSpeed=n,this.maskProvider=s}update(){if(this.resetGhostEatChainIfNoScaredGhosts(),this.isPacketInDeathRecovery())return;const e=this.world.ghosts.filter(n=>n.active&&n.state.free&&!this.world.ghostsExitingJail.has(n)),t=Px({packet:this.buildPacketSample(),ghosts:this.buildGhostCandidates(e)});if(t&&!(t.outcome==="packet-hit"&&this.isPacketInPortalShieldWindow())){if(t.outcome==="packet-hit"){this.applyPacketHitOutcome();return}this.applyGhostHitOutcome(t.ghost),this.resetGhostEatChainIfNoScaredGhosts()}}destroy(){}applyPacketHitOutcome(){s_(),this.movementRules.setEntityTile(this.world.packet,this.world.packetSpawnTile),this.world.packet.direction.current=Tc,this.world.packet.direction.next=Tc,this.world.packet.portalBlinkRemainingMs=0,this.world.packet.portalBlinkElapsedMs=0,this.world.packet.deathRecoveryRemainingMs=rn.durationMs,this.world.packet.deathRecoveryElapsedMs=0,this.world.packet.deathRecoveryNextToggleAtMs=rn.blinkStartIntervalMs,this.world.packet.deathRecoveryVisible=!0}applyGhostHitOutcome(e){const t=Math.min(this.world.ghostEatChainCount,Ws.length-1);wh(Ws[t]??Ws[Ws.length-1]),this.world.ghostEatChainCount+=1,this.world.ghostsExitingJail.delete(e),Fa(this.world,e),this.movementRules.setEntityTile(e,this.world.ghostJailReturnTile),e.state.free=!1,e.state.soonFree=!0,e.state.dead=!1,e.state.animation="default",e.speed=this.defaultGhostSpeed}isPacketInDeathRecovery(){return(this.world.packet.deathRecoveryRemainingMs??0)>0}isPacketInPortalShieldWindow(){return(this.world.packet.portalBlinkRemainingMs??0)>0}resetGhostEatChainIfNoScaredGhosts(){this.world.ghosts.some(t=>t.state.scared)||(this.world.ghostEatChainCount=0)}buildPacketSample(){const e=this.world.packetAnimation.frame,t=this.maskProvider.getPacketMask(e,this.world.packet.displayWidth,this.world.packet.displayHeight,bc);return this.toCollisionMaskSample(this.world.packet,t)}buildGhostCandidates(e){return e.map(t=>{var o;const n=((o=this.world.ghostAnimations.get(t))==null?void 0:o.frame)??0,s=Dh(this.world,t),r=this.maskProvider.getGhostMask(s,n,t.displayWidth,t.displayHeight,bc);return{ghost:t,sample:this.toCollisionMaskSample(t,r)}})}toCollisionMaskSample(e,t){return{x:e.x,y:e.y,width:e.displayWidth,height:e.displayHeight,angle:e.angle,flipX:e.flipX,flipY:e.flipY,mask:t}}}const Js=.001;class Dx{constructor(e,t,n,s,r){this.world=e,this.movementRules=t,this.jailService=n,this.scheduler=s,this.rng=r,this.ghostReleaseTimers=new Map,this.releaseProgressByGhost=new Map,this.nextReleaseSide="left"}start(){this.clearReleaseTimers(),this.releaseProgressByGhost.clear(),this.world.ghostsExitingJail.clear(),this.nextReleaseSide="left",this.world.ghosts.forEach((e,t)=>{const n=lo+t*uc;this.queueGhostRelease(e,n)})}update(){this.world.ghosts.forEach(e=>{if(!e.active){this.cleanupGhostReleaseState(e);return}if(this.shouldQueueRelease(e)&&this.queueGhostRelease(e),this.world.ghostsExitingJail.has(e)){this.advanceRelease(e);return}e.state.free||(this.jailService.moveGhostInJail(e,this.world.ghostJailBounds,this.movementRules,this.rng,t_),this.movementRules.syncEntityPosition(e))})}destroy(){this.clearReleaseTimers(),this.releaseProgressByGhost.clear(),this.world.ghostsExitingJail.clear()}queueGhostRelease(e,t=lo){if(!e.active||e.state.free)return;e.state.soonFree=!0;const n=this.ghostReleaseTimers.get(e);n&&(n.cancel(),this.ghostReleaseTimers.delete(e));const s=Math.max(0,this.world.ghosts.indexOf(e)),r=t===lo?this.resolveQueuedReleaseOffsetMs(e):0,o=this.scheduler.delayedCall(t+r,()=>{this.ghostReleaseTimers.delete(e),this.releaseGhost(e,s)});this.ghostReleaseTimers.set(e,o)}releaseGhost(e,t){if(!e.active||e.state.free||!e.state.soonFree)return;const n=this.nextReleaseSide,s=this.resolveReleaseY(),r=this.resolveGateColumn(n,s);this.nextReleaseSide=n==="left"?"right":"left",this.world.ghostsExitingJail.add(e),this.releaseProgressByGhost.set(e,{side:n,phase:"to_side_center",gateColumnX:r,releaseY:s})}advanceRelease(e){const t=this.releaseProgressByGhost.get(e);if(!t){this.cleanupGhostReleaseState(e);return}if(t.phase==="to_side_center"){const s={x:t.side==="left"?this.world.ghostJailBounds.minX:this.world.ghostJailBounds.maxX,y:this.world.ghostJailBounds.y};this.moveGhostTowardTarget(e,s)==="reached"&&(t.phase="to_gate_column");return}if(t.phase==="to_gate_column"){const n={x:t.gateColumnX,y:this.world.ghostJailBounds.y};this.moveGhostTowardTarget(e,n)==="reached"&&(t.phase="cross_gate_once");return}if(t.phase==="cross_gate_once"){const n={x:t.gateColumnX,y:t.releaseY};this.moveGhostTowardTarget(e,n)==="reached"&&this.completeRelease(e,t)}}clearReleaseTimers(){this.ghostReleaseTimers.forEach(e=>{e.cancel()}),this.ghostReleaseTimers.clear()}shouldQueueRelease(e){return!e.state.free&&e.state.soonFree&&!this.world.ghostsExitingJail.has(e)&&!this.ghostReleaseTimers.has(e)}resolveQueuedReleaseOffsetMs(e){let t=0;return this.ghostReleaseTimers.forEach((n,s)=>{s!==e&&(t+=1)}),t*uc}resolveReleaseY(){const e=this.world.ghostJailBounds.y-1;return e<0?0:e>=this.world.map.height?this.world.map.height-1:e}resolveGateColumn(e,t){const n=this.resolveGateScanColumns(e);for(const o of n)if(this.isGateColumnTraversable(o,t))return o;const s=this.world.ghostJailBounds.minX,r=this.world.ghostJailBounds.maxX;return s+Math.floor((r-s)/2)}resolveGateScanColumns(e){const t=this.world.ghostJailBounds.minX,n=this.world.ghostJailBounds.maxX,s=[];if(e==="left"){for(let r=t;r<=n;r+=1)s.push(r);return s}for(let r=n;r>=t;r-=1)s.push(r);return s}isGateColumnTraversable(e,t){const n={x:e,y:this.world.ghostJailBounds.y},s=this.world.collisionGrid.getTilesAt(n);return this.movementRules.canMove("up",0,0,s,"ghostRelease")}moveGhostTowardTarget(e,t){if(this.snapResidualOffsetsAtTargetAxes(e,t)&&this.movementRules.syncEntityPosition(e),this.isAtTargetCenter(e,t))return"reached";const s=this.resolveDirectionTowardTarget(e,t);if(!s)return"reached";e.direction=s,this.movementRules.advanceEntity(e,s,e.speed);const r=this.snapResidualOffsetsAtTargetAxes(e,t);return this.movementRules.syncEntityPosition(e),r&&this.movementRules.syncEntityPosition(e),this.isAtTargetCenter(e,t)?"reached":"moved"}isAtTargetCenter(e,t){return e.tile.x===t.x&&e.tile.y===t.y&&Math.abs(e.moved.x)<=Js&&Math.abs(e.moved.y)<=Js}snapResidualOffsetsAtTargetAxes(e,t){let n=!1;return e.tile.x===t.x&&Math.abs(e.moved.x)<=e.speed&&Math.abs(e.moved.x)>Js&&(e.moved.x=0,n=!0),e.tile.y===t.y&&Math.abs(e.moved.y)<=e.speed&&Math.abs(e.moved.y)>Js&&(e.moved.y=0,n=!0),n}resolveDirectionTowardTarget(e,t){const n=this.resolveVerticalDirection(e,t.y);return n||this.resolveHorizontalDirection(e,t.x)}resolveHorizontalDirection(e,t){return e.tile.x<t?"right":e.tile.x>t||e.moved.x>0?"left":e.moved.x<0?"right":null}resolveVerticalDirection(e,t){return e.tile.y<t?"down":e.tile.y>t||e.moved.y>0?"up":e.moved.y<0?"down":null}completeRelease(e,t){this.cleanupGhostReleaseState(e),this.movementRules.setEntityTile(e,{x:t.gateColumnX,y:t.releaseY}),e.direction="up",e.state.free=!0,e.state.soonFree=!1}cleanupGhostReleaseState(e){const t=this.ghostReleaseTimers.get(e);t&&(t.cancel(),this.ghostReleaseTimers.delete(e)),this.releaseProgressByGhost.delete(e),this.world.ghostsExitingJail.delete(e)}}class Nx{constructor(e){var a;this.mount=e,(a=this.mount.querySelector("[data-game-hud]"))==null||a.remove(),this.container=document.createElement("div"),this.container.className="pointer-events-none absolute inset-x-0 bottom-0 z-50 flex items-center justify-between gap-4 bg-black/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-100 sm:text-sm",this.container.style.position="fixed",this.container.style.left="0",this.container.style.right="0",this.container.style.bottom="0",this.container.style.zIndex="9998",this.container.style.pointerEvents="none",this.container.style.display="flex",this.container.style.alignItems="center",this.container.style.justifyContent="space-between",this.container.style.gap="1rem",this.container.style.padding="10px 16px",this.container.style.background="rgba(0, 0, 0, 0.9)",this.container.style.borderTop="1px solid rgba(255, 255, 255, 0.18)",this.container.style.color="#f4f4f5",this.container.style.fontSize="14px",this.container.style.fontWeight="600",this.container.style.letterSpacing="0.12em",this.container.style.textTransform="uppercase",this.container.style.fontFamily='"Orbitron", ui-sans-serif, system-ui, sans-serif',this.container.setAttribute("data-game-hud","true");const t=document.createElement("div");t.className="flex min-w-0 items-center gap-2",t.style.display="flex",t.style.alignItems="center",t.style.gap="0.5rem",t.setAttribute("data-hud-score","true");const n=document.createElement("span");n.className="text-zinc-400",n.style.color="#a1a1aa",n.textContent="Score",this.scoreText=document.createElement("span"),this.scoreText.className="tabular-nums text-zinc-100",this.scoreText.style.color="#f4f4f5",this.scoreText.style.fontVariantNumeric="tabular-nums",this.scoreText.setAttribute("data-hud-score-value","true"),t.append(n,this.scoreText);const s=document.createElement("div");s.className="flex items-center justify-end gap-2",s.style.display="flex",s.style.alignItems="center",s.style.justifyContent="flex-end",s.style.gap="0.5rem",s.setAttribute("data-hud-lives","true");const r=document.createElement("span");r.className="text-zinc-400",r.style.color="#a1a1aa",r.textContent="Lives",this.livesIcons=document.createElement("div"),this.livesIcons.className="flex items-center gap-1",this.livesIcons.style.display="flex",this.livesIcons.style.alignItems="center",this.livesIcons.style.gap="0.25rem",this.livesIcons.setAttribute("data-hud-lives-icons","true"),this.livesCountText=document.createElement("span"),this.livesCountText.className="tabular-nums text-zinc-300",this.livesCountText.style.color="#d4d4d8",this.livesCountText.style.fontVariantNumeric="tabular-nums",this.livesCountText.setAttribute("data-hud-lives-value","true"),s.append(r,this.livesIcons,this.livesCountText),this.container.append(t,s);const o=r_();this.setScore(o.score),this.setLives(o.lives),this.onScoreChanged=l=>{this.setScore(l)},this.onLivesChanged=l=>{this.setLives(l)},Fn.on(Un.ScoreChanged,this.onScoreChanged),Fn.on(Un.LivesChanged,this.onLivesChanged),this.mount.appendChild(this.container)}destroy(){Fn.off(Un.ScoreChanged,this.onScoreChanged),Fn.off(Un.LivesChanged,this.onLivesChanged),this.container.remove()}setScore(e){this.scoreText.textContent=String(e)}setLives(e){const t=Math.max(0,Math.floor(e));this.livesCountText.textContent=String(t),this.livesIcons.replaceChildren();for(let n=0;n<t;n+=1)this.livesIcons.appendChild(this.createHeartIcon())}createHeartIcon(){const e=document.createElement("img");return e.src="assets/sprites/Heart.png",e.alt="",e.setAttribute("aria-hidden","true"),e.className="h-4 w-4 object-contain",e.style.width="16px",e.style.height="16px",e.style.objectFit="contain",e}}class Ux{constructor(e){this.mount=e}start(){this.hud=new Nx(this.mount)}update(){}render(){}destroy(){var e;(e=this.hud)==null||e.destroy(),this.hud=void 0}}const Fx=[{codes:["ArrowLeft","KeyA"],direction:"left"},{codes:["ArrowRight","KeyD"],direction:"right"},{codes:["ArrowUp","KeyW"],direction:"up"},{codes:["ArrowDown","KeyS"],direction:"down"}],Ox=new Set(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"]),Bx=new Set([" ","Spacebar"]);class kx{constructor(e,t,n){this.input=e,this.world=t,this.pauseController=n,this.disposers=[],this.activeTouchGesture=null}start(){this.disposers.push(this.input.onKeyDown(e=>this.handleKeyDown(e))),this.disposers.push(this.input.onPointerMove(e=>this.handlePointerMove(e))),this.disposers.push(this.input.onPointerDown(e=>this.handlePointerDown(e))),this.disposers.push(this.input.onPointerUp(e=>this.handlePointerUp(e))),this.disposers.push(this.input.onPointerCancel(e=>this.handlePointerCancel(e)))}update(){const e=this.getDirectionalKeyboardIntent();e&&(this.world.packet.direction.next=e)}destroy(){this.disposers.forEach(e=>{e()}),this.disposers=[],this.activeTouchGesture=null}handleKeyDown(e){if(!e.repeat){if(this.isPauseToggleEvent(e)){e.preventDefault(),this.pauseController.togglePause();return}if(e.code==="KeyH"){this.world.ghosts.some(n=>n.active&&!n.state.scared)?(Rh(this.world,Eh),this.world.ghostEatChainCount=0):j_(this.world);return}if(e.code==="KeyC"){if(e.altKey){e.preventDefault(),this.world.collisionDebugEnabled=!this.world.collisionDebugEnabled,this.world.collisionDebugEnabled||(this.world.hoveredDebugTile=null,this.world.debugPanelText="");return}if(e.shiftKey){e.preventDefault(),this.copyDebugPanelText();return}return}Ox.has(e.code)&&e.preventDefault()}}isPauseToggleEvent(e){return e.code==="Space"||Bx.has(e.key)}handlePointerMove(e){this.world.pointerScreen={x:e.x,y:e.y};const t=this.getActiveGesture(e.pointerId);if(!t||t.hasCommittedSwipe||this.hasDirectionalKeyboardInput())return;const n=this.resolveSwipeDirection(t,e);n&&(this.world.packet.direction.next=n,t.hasCommittedSwipe=!0)}handlePointerDown(e){if(this.world.pointerScreen={x:e.x,y:e.y},!this.isTouchLikePointer(e)){this.pauseController.togglePause();return}if(!this.world.isMoving){this.pauseController.togglePause(),this.activeTouchGesture=null;return}this.activeTouchGesture={pointerId:e.pointerId,startX:e.x,startY:e.y,hasCommittedSwipe:!1}}handlePointerUp(e){const t=this.getActiveGesture(e.pointerId);t&&(this.isTapGesture(t,e)&&this.pauseController.togglePause(),this.activeTouchGesture=null)}handlePointerCancel(e){var t;((t=this.activeTouchGesture)==null?void 0:t.pointerId)===e.pointerId&&(this.activeTouchGesture=null)}getActiveGesture(e){return!this.activeTouchGesture||this.activeTouchGesture.pointerId!==e?null:this.activeTouchGesture}isTapGesture(e,t){if(e.hasCommittedSwipe)return!1;const{absX:n,absY:s}=this.getGestureMagnitude(e,t);return Math.max(n,s)<=e_}resolveSwipeDirection(e,t){const{dx:n,dy:s,absX:r,absY:o}=this.getGestureMagnitude(e,t),a=Math.max(r,o);if(a<Q0)return null;const l=Math.min(r,o);return l>0&&a/l<j0?null:r>=o?n>=0?"right":"left":s>=0?"down":"up"}getGestureMagnitude(e,t){const n=t.x-e.startX,s=t.y-e.startY;return{dx:n,dy:s,absX:Math.abs(n),absY:Math.abs(s)}}hasDirectionalKeyboardInput(){return this.getDirectionalKeyboardIntent()!==null}getDirectionalKeyboardIntent(){for(const e of Fx)if(e.codes.some(t=>this.input.isKeyDown(t)))return e.direction;return null}isTouchLikePointer(e){var t;return e.pointerType==="touch"?!0:!e.isPrimary||typeof window>"u"?!1:!!((t=window.matchMedia)!=null&&t.call(window,Z0).matches)}async copyDebugPanelText(){const e=this.world.debugPanelText;if(!e)return;await this.copyTextToClipboard(e)||(this.world.debugPanelText=`${e}
copy failed (browser blocked clipboard access)`)}async copyTextToClipboard(e){var t;try{if((t=navigator.clipboard)!=null&&t.writeText)return await navigator.clipboard.writeText(e),!0}catch{}try{const n=document.createElement("textarea");n.value=e,n.setAttribute("readonly","true"),n.style.position="fixed",n.style.left="-9999px",document.body.appendChild(n),n.focus(),n.select();const s=document.execCommand("copy");return n.remove(),s}catch{return!1}}}class zx{constructor(e,t,n){this.world=e,this.movementRules=t,this.portalService=n}update(e=0){this.updatePortalBlink(e),this.updateDeathRecovery(e),this.updateDirectionVisuals();const t=this.world.collisionGrid.getTilesAt(this.world.packet.tile);this.movementRules.applyBufferedDirection(this.world.packet,t),this.applyPortalTurnOverride(t);const n=this.movementRules.canMove(this.world.packet.direction.current,this.world.packet.moved.y,this.world.packet.moved.x,t),s=this.portalService.canAdvanceOutward(this.world.packet,this.world.collisionGrid);(n||s)&&this.movementRules.advanceEntity(this.world.packet,this.world.packet.direction.current,ji.packet),this.portalService.tryTeleport(this.world.packet,this.world.collisionGrid,this.world.tick,this.world.tileSize)&&(this.world.packet.portalBlinkRemainingMs=yh.durationMs,this.world.packet.portalBlinkElapsedMs=0),this.movementRules.syncEntityPosition(this.world.packet)}updatePortalBlink(e){const t=this.world.packet.portalBlinkRemainingMs??0;if(t<=0){this.world.packet.portalBlinkRemainingMs=0,this.world.packet.portalBlinkElapsedMs=0;return}const n=Number.isFinite(e)&&e>0?e:0,s=Math.max(0,t-n);if(this.world.packet.portalBlinkRemainingMs=s,s<=0){this.world.packet.portalBlinkElapsedMs=0;return}const r=this.world.packet.portalBlinkElapsedMs??0;this.world.packet.portalBlinkElapsedMs=r+n}updateDeathRecovery(e){const t=this.world.packet.deathRecoveryRemainingMs??0;if(t<=0){this.world.packet.deathRecoveryRemainingMs=0,this.world.packet.deathRecoveryElapsedMs=0,this.world.packet.deathRecoveryNextToggleAtMs=0,this.world.packet.deathRecoveryVisible=!0;return}const n=Number.isFinite(e)&&e>0?e:0,s=this.world.packet.deathRecoveryElapsedMs??0,r=Math.min(rn.durationMs,s+n),o=Math.max(0,t-n);if(this.world.packet.deathRecoveryElapsedMs=r,this.world.packet.deathRecoveryRemainingMs=o,o<=0){this.world.packet.deathRecoveryElapsedMs=0,this.world.packet.deathRecoveryNextToggleAtMs=0,this.world.packet.deathRecoveryVisible=!0;return}let a=this.world.packet.deathRecoveryNextToggleAtMs;for((!Number.isFinite(a)||a<=0)&&(a=es(s,rn.durationMs,rn));a>0&&r>=a;)this.world.packet.deathRecoveryVisible=!this.world.packet.deathRecoveryVisible,a=es(a,rn.durationMs,rn);this.world.packet.deathRecoveryNextToggleAtMs=a}updateDirectionVisuals(){if(this.world.packet.direction.current==="right"){this.world.packet.angle=0,this.world.packet.flipY=!1;return}if(this.world.packet.direction.current==="left"){this.world.packet.angle=180,this.world.packet.flipY=!0;return}if(this.world.packet.direction.current==="up"){this.world.packet.angle=-90;return}this.world.packet.direction.current==="down"&&(this.world.packet.angle=90)}applyPortalTurnOverride(e){if(this.world.packet.moved.x!==0||this.world.packet.moved.y!==0)return;const t=this.world.packet.direction.current,n=this.world.packet.direction.next;if(n===t||this.movementRules.canMove(n,this.world.packet.moved.y,this.world.packet.moved.x,e))return;this.portalService.canAdvanceOutward({tile:this.world.packet.tile,moved:this.world.packet.moved,direction:n},this.world.collisionGrid)&&(this.world.packet.direction.current=n)}}const Gx="opacity-100",Ac=["grayscale","sepia","saturate-50","brightness-90","contrast-100"],Hx="grayscale(0.72) sepia(0.22) saturate(0.55) brightness(0.86) contrast(0.96)";class Vx{constructor(e,t){this.world=e,this.mount=t,this.runsWhenPaused=!0,this.overlay=null,this.pausedStateApplied=!1}start(){this.mount.style.transition="filter 200ms ease-out",this.createOverlay(),this.applyPausePresentation()}update(){this.applyPausePresentation()}destroy(){var e;this.mount.classList.remove(...Ac),this.mount.style.filter="",(e=this.overlay)==null||e.remove(),this.overlay=null,this.pausedStateApplied=!1}createOverlay(){var s;(s=this.mount.querySelector("[data-pause-overlay]"))==null||s.remove();const e=document.createElement("div");e.className="pointer-events-none absolute inset-0 z-40 flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-black/25 to-black/50 opacity-0 transition-opacity duration-200 ease-out",e.style.position="absolute",e.style.inset="0",e.style.zIndex="60",e.style.display="flex",e.style.alignItems="center",e.style.justifyContent="center",e.style.flexDirection="column",e.style.gap="0.75rem",e.style.background="linear-gradient(to bottom, rgba(8, 8, 8, 0.18), rgba(8, 8, 8, 0.34)), repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.025), rgba(255, 255, 255, 0.025) 1px, rgba(0, 0, 0, 0) 1px, rgba(0, 0, 0, 0) 3px)",e.style.opacity="0",e.style.visibility="hidden",e.style.transition="opacity 200ms ease-out",e.style.pointerEvents="none",e.style.userSelect="none",e.style.webkitUserSelect="none",e.setAttribute("data-pause-overlay","true"),e.setAttribute("aria-hidden","true");const t=document.createElement("p");t.className="m-0 rounded-xl border border-zinc-400/50 bg-black/70 px-5 py-3 text-center text-[clamp(2.2rem,8vw,4.8rem)] font-semibold tracking-[0.34em] text-zinc-100 shadow-[0_0_20px_rgba(0,0,0,0.6)] [text-indent:0.34em] max-sm:px-4 max-sm:text-[clamp(2rem,14vw,4rem)] max-sm:tracking-[0.24em] max-sm:[text-indent:0.24em]",t.style.margin="0",t.style.padding="0.7rem 1.2rem",t.style.border="1px solid rgba(220, 220, 220, 0.55)",t.style.borderRadius="0.75rem",t.style.background="rgba(0, 0, 0, 0.55)",t.style.color="#f5f5f4",t.style.fontFamily='"Orbitron", ui-sans-serif, system-ui, sans-serif',t.style.fontWeight="900",t.style.fontSize="clamp(2.6rem, 10vw, 6rem)",t.style.letterSpacing="0.34em",t.style.textIndent="0.34em",t.style.textAlign="center",t.style.textShadow="0 0 18px rgba(0, 0, 0, 0.7)",t.style.pointerEvents="none",t.style.userSelect="none",t.style.webkitUserSelect="none",t.textContent="PAUSED";const n=document.createElement("p");n.className="m-0 rounded-md bg-black/60 px-3 py-1 text-center text-[clamp(0.72rem,2.4vw,1rem)] uppercase tracking-[0.13em] text-zinc-300 max-sm:w-[90vw] max-sm:max-w-[24rem] max-sm:text-[0.7rem] max-sm:tracking-[0.1em] max-sm:leading-[1.35]",n.style.margin="0",n.style.padding="0.28rem 0.6rem",n.style.borderRadius="0.375rem",n.style.background="rgba(0, 0, 0, 0.42)",n.style.color="#e4e4e7",n.style.fontFamily='"Orbitron", ui-sans-serif, system-ui, sans-serif',n.style.fontSize="clamp(0.78rem, 2.4vw, 1.05rem)",n.style.letterSpacing="0.12em",n.style.textAlign="center",n.style.textTransform="uppercase",n.style.pointerEvents="none",n.style.userSelect="none",n.style.webkitUserSelect="none",n.textContent="Tap or press Space to resume",e.append(t,n),this.mount.appendChild(e),this.overlay=e}applyPausePresentation(){var t,n;const e=!this.world.isMoving;e!==this.pausedStateApplied&&(this.pausedStateApplied=e,Ac.forEach(s=>{this.mount.classList.toggle(s,e)}),this.mount.style.filter=e?Hx:"",(t=this.overlay)==null||t.classList.toggle(Gx,e),this.overlay&&(this.overlay.style.opacity=e?"1":"0",this.overlay.style.visibility=e?"visible":"hidden"),(n=this.overlay)==null||n.setAttribute("aria-hidden",e?"false":"true"))}}const Wx={inky:4578795,clyde:16753476,pinky:16748989,blinky:16403296,scared:4611557};class Xx{constructor(){this.pelletGeometry=new cs(1,12,8),this.pelletMaterial=new _n({color:14075558,roughness:.9}),this.powerPelletMaterial=new _n({color:14866365,roughness:.9}),this.packetGeometries=[0,Math.PI/12,Math.PI/6,Math.PI/4].map(Yx),this.packetMaterial=new _n({color:16766761,emissive:16766761,emissiveIntensity:.25,roughness:.3,metalness:.04}),this.ghostGeometries=[Rc(0),Rc(Math.PI)],this.ghostMaterials=Object.fromEntries(Object.entries(Wx).map(([e,t])=>[e,new _n({color:t,emissive:t,emissiveIntensity:.2,roughness:.38,metalness:.02})])),this.eyeGeometry=new cs(1,16,12),this.eyeMaterial=new _n({color:16777215,roughness:.25}),this.pupilMaterial=new _n({color:1057601,roughness:.3}),this.scaredPupilMaterial=new _n({color:16767158,roughness:.4}),this.shadowGeometry=new ei(1,1).rotateX(-Math.PI/2),this.shadowTexture=qx(),this.shadowMaterial=new Ii({map:this.shadowTexture,transparent:!0,opacity:.5,depthWrite:!1,toneMapped:!1}),this.packetBodies=new WeakMap,this.ghostParts=new WeakMap,this.disposed=!1}createPacket(){const e=new $t;e.name="packet";const t=new gt(this.packetGeometries[0],this.packetMaterial);t.name="body",t.position.y=Yn.packet/2,e.add(t),this.packetBodies.set(e,t);for(const n of[-1,1]){const s=new gt(this.eyeGeometry,this.pupilMaterial);s.name=`eye-${n}`,s.scale.set(.4,.18,.55),s.position.set(.8,9.7,n*1.6),e.add(s)}return e}setPacketFrame(e,t){const n=this.packetBodies.get(e);n&&(n.geometry=this.packetGeometries[Math.max(0,Math.min(3,Math.trunc(t)))])}createGhost(e){const t=new $t;t.name=e;const n=new gt(this.ghostGeometries[0],this.ghostMaterials[e]);n.name="body",t.add(n);const s=[];for(const r of[-1,1]){const o=new $t;o.name=`eye-${r}`,o.position.set(r*1.8,7.85,3.4),o.rotation.x=-Math.PI/4;const a=new gt(this.eyeGeometry,this.eyeMaterial);a.scale.set(1.3,1.45,.8);const l=new gt(this.eyeGeometry,this.pupilMaterial);l.name=`pupil-${r}`,l.scale.set(.56,.65,.25),l.position.z=.76,o.add(a,l),t.add(o),s.push(l)}return this.ghostParts.set(t,{body:n,pupils:s}),this.setGhostAppearance(t,e,0,"right"),t}setGhostAppearance(e,t,n,s){const r=this.ghostParts.get(e);if(r){r.body.geometry=this.ghostGeometries[Math.trunc(n)%2],r.body.material=this.ghostMaterials[t];for(const o of r.pupils)o.material=t==="scared"?this.scaredPupilMaterial:this.pupilMaterial,o.position.x=s==="left"?-.3:s==="right"?.3:0,o.position.y=s==="up"?.3:s==="down"?-.3:0}}createContactShadow(e){const t=new gt(this.shadowGeometry,this.shadowMaterial);return t.name="contact-shadow",t.scale.set(e,1,e),t.position.y=.035,t}dispose(){if(!this.disposed){this.disposed=!0;for(const e of[this.pelletGeometry,...this.packetGeometries,...this.ghostGeometries,this.eyeGeometry,this.shadowGeometry])e.dispose();for(const e of[this.pelletMaterial,this.powerPelletMaterial,this.packetMaterial,...Object.values(this.ghostMaterials),this.eyeMaterial,this.pupilMaterial,this.scaredPupilMaterial,this.shadowMaterial])e.dispose();this.shadowTexture.dispose()}}}function Yx(i){const e=Yn.packet/2,t=new cs(e,40,24,Math.PI+i,2*Math.PI-2*i);if(i===0)return t;const n=t.toNonIndexed();t.dispose();const s=Array.from(n.getAttribute("position").array),r=Array.from(n.getAttribute("normal").array);for(const o of[-1,1]){const a=[Math.sin(i),0,-o*Math.cos(i)];for(let l=0;l<24;l+=1){const c=u=>{const f=u/24*Math.PI;return[e*Math.sin(f)*Math.cos(i),e*Math.cos(f),o*e*Math.sin(f)*Math.sin(i)]},h=c(l),d=c(l+1);s.push(0,0,0,...o===1?h:d,...o===1?d:h),r.push(...a,...a,...a)}}return n.setAttribute("position",new dt(s,3)),n.setAttribute("normal",new dt(r,3)),n.deleteAttribute("uv"),n}function Rc(i){const e=Yn.ghost/2,t=48,n=[],s=[],r=12;for(let l=0;l<r;l+=1){const c=Math.max(0,l-1)/(r-2)*(Math.PI/2),h=e*Math.cos(c);for(let d=0;d<=t;d+=1){const u=d/t*2*Math.PI,f=l===0?.45+.45*Math.cos(8*u+i):4.3+e*Math.sin(c);if(n.push(h*Math.cos(u),f,h*Math.sin(u)),l<r-1&&d<t){const g=l*(t+1)+d,v=g+1,m=g+t+1;s.push(g,m,v,v,m,m+1)}}}const o=n.length/3;n.push(0,.45,0);for(let l=0;l<t;l+=1)s.push(o,l,l+1);const a=new wt;return a.setAttribute("position",new dt(n,3)),a.setIndex(s),a.computeVertexNormals(),a}function qx(){const e=new Uint8Array(4096);for(let n=0;n<32;n+=1)for(let s=0;s<32;s+=1){const r=((s+.5-16)/16)**2+((n+.5-16)/16)**2;e[(n*32+s)*4+3]=Math.round(255*Math.exp(-3*r)*Math.max(0,1-r))}const t=new Ta(e,32,32);return t.magFilter=Et,t.minFilter=Et,t.needsUpdate=!0,t}class Kx{constructor(e){this.world=e,this.group=new $t,this.edges=new wt,this.markers=new wt,this.linesMaterial=new eh({vertexColors:!0,depthTest:!1,depthWrite:!1}),this.fillGeometry=new ei(1,1),this.fillMaterial=new Ii({color:"#ff3355",transparent:!0,opacity:.06,depthTest:!1,depthWrite:!1}),this.group.name="collision-debug",this.group.visible=!1;const t=[],n=[],s=[],r=e.tileSize;for(let h=0;h<e.map.height;h+=1)for(let d=0;d<e.map.width;d+=1){const u=e.collisionGrid.getTileAt(d,h),f=new Ve(u.penGate?"#00ffff":"#ff3355"),g=(v,m,p,y)=>{t.push(v*r,.1,m*r,p*r,.1,y*r),n.push(f.r,f.g,f.b,f.r,f.g,f.b)};u.up&&g(d,h,d+1,h),u.down&&g(d,h+1,d+1,h+1),u.left&&g(d,h,d,h+1),u.right&&g(d+1,h,d+1,h+1),u.up&&u.down&&u.left&&u.right&&s.push({x:d,y:h})}this.edges.setAttribute("position",new Dt(new Float32Array(t),3)),this.edges.setAttribute("color",new Dt(new Float32Array(n),3));const o=new bl(this.edges,this.linesMaterial);o.renderOrder=101,this.group.add(o),this.fillGeometry.rotateX(-Math.PI/2),this.fills=new cr(this.fillGeometry,this.fillMaterial,s.length),this.fills.renderOrder=100;const a=new nt;s.forEach((h,d)=>{a.makeScale(r,1,r),a.setPosition((h.x+.5)*r,.05,(h.y+.5)*r),this.fills.setMatrixAt(d,a)}),this.fills.computeBoundingSphere(),this.group.add(this.fills);const l=(e.ghosts.length+2)*24;this.markers.setAttribute("position",new Dt(new Float32Array(l),3)),this.markers.setAttribute("color",new Dt(new Float32Array(l),3));const c=new bl(this.markers,this.linesMaterial);c.name="debug-markers",c.frustumCulled=!1,c.renderOrder=102,this.group.add(c)}sync(){if(this.group.visible=this.world.collisionDebugEnabled,!this.group.visible)return;const e=this.markers.getAttribute("position"),t=this.markers.getAttribute("color");let n=0;const s=(r,o)=>{const a=new Ve(o),l=r.x*this.world.tileSize+1,c=r.y*this.world.tileSize+1,h=l+this.world.tileSize-2,d=c+this.world.tileSize-2;for(const[u,f]of[[l,c],[h,c],[h,c],[h,d],[h,d],[l,d],[l,d],[l,c]])e.setXYZ(n,u,.12,f),t.setXYZ(n,a.r,a.g,a.b),n+=1};s(this.world.packet.tile,"#ffdd00"),this.world.ghosts.forEach(r=>s(r.tile,"#00ff66")),this.world.hoveredDebugTile&&s(this.world.hoveredDebugTile,"#33ccff"),e.needsUpdate=!0,t.needsUpdate=!0,this.markers.setDrawRange(0,n)}dispose(){this.edges.dispose(),this.markers.dispose(),this.linesMaterial.dispose(),this.fillGeometry.dispose(),this.fillMaterial.dispose(),this.fills.dispose(),this.group.clear()}}const pr=12;function Jx(i,e){return Nh(i,e,t=>t.localId===null||t.localId<16||t.localId>21)}function $x(i,e){return Nh(i,e,t=>t.localId===16)}function Nh(i,e,t){const n=i.width*i.tileWidth,s=i.height*i.tileHeight,r=new Uint8Array(n*s),o=new Map;for(const a of i.tiles)for(const l of a){if(l.gid===null||!t(l))continue;o.has(l.imagePath)||o.set(l.imagePath,e(l.imagePath));const c=o.get(l.imagePath);if(!c)continue;const h=Math.round(Math.cos(l.rotation)),d=Math.round(Math.sin(l.rotation));for(let u=0;u<i.tileHeight;u+=1)for(let f=0;f<i.tileWidth;f+=1){const g=(f+.5)/i.tileWidth-.5,v=(u+.5)/i.tileHeight-.5,m=Math.floor(((g*h+v*d)*(l.flipX?-1:1)+.5)*c.width),p=Math.floor(((-g*d+v*h)*(l.flipY?-1:1)+.5)*c.height);c.opaque[p*c.width+m]&&(r[(l.y*i.tileHeight+u)*n+l.x*i.tileWidth+f]=1)}}return{width:n,height:s,opaque:r}}function Uh(i){const e=[],t=new Map,n=a=>a.y*(i.width+1)+a.x,s=(a,l)=>a>=0&&l>=0&&a<i.width&&l<i.height&&!!i.opaque[l*i.width+a],r=(a,l,c,h,d)=>{const u={start:{x:a,y:l},end:{x:c,y:h},direction:d,visited:!1};e.push(u);const f=n(u.start),g=t.get(f)??[];g.push(u),t.set(f,g)};for(let a=0;a<i.height;a+=1)for(let l=0;l<i.width;l+=1)s(l,a)&&(s(l,a-1)||r(l,a,l+1,a,0),s(l+1,a)||r(l+1,a,l+1,a+1,1),s(l,a+1)||r(l+1,a+1,l,a+1,2),s(l-1,a)||r(l,a+1,l,a,3));const o=[];for(const a of e){if(a.visited)continue;const l=[];let c=a;do{if(c.visited=!0,l.push(c.start),n(c.end)===n(a.start))break;const h=t.get(n(c.end))??[],d=[1,0,3,2].map(u=>h.find(f=>!f.visited&&f.direction===(c.direction+u)%4)).find(u=>u!==void 0);if(!d)throw new Error("Wall mask contains an open boundary");c=d}while(!c.visited);o.push(l.filter((h,d)=>{const u=l[(d+l.length-1)%l.length],f=l[(d+1)%l.length];return(h.x-u.x)*(f.y-h.y)!==(h.y-u.y)*(f.x-h.x)}))}return o}function ir(i){return i.reduce((e,t,n)=>{const s=i[(n+1)%i.length];return e+t.x*s.y-s.x*t.y},0)/2}function Zx(i,e){let t=!1;for(let n=0,s=i.length-1;n<i.length;s=n,n+=1){const r=i[n],o=i[s];r.y>e.y!=o.y>e.y&&e.x<(o.x-r.x)*(e.y-r.y)/(o.y-r.y)+r.x&&(t=!t)}return t}function Cc(i,e){e.forEach((t,n)=>{n===0?i.moveTo(t.x,-t.y):i.lineTo(t.x,-t.y)}),i.closePath()}function Pc(i,e,t=!0){const n=[],s=new Set,r=(o,a)=>{if(!e)return!1;const l=Math.floor(o),c=Math.floor(a);return l>=0&&l<e.width&&c>=0&&c<e.height&&!!e.opaque[c*e.width+l]};for(const o of Uh(i))if(!(!t&&ir(o)>0)){for(const a of[.08,pr+.01])o.forEach((l,c)=>{const h=o[(c+1)%o.length],d=Math.abs(h.x-l.x)+Math.abs(h.y-l.y),u=(h.x-l.x)/d,f=(h.y-l.y)/d;let g=0;for(let v=0;v<=d;v+=1)(v<d&&r(l.x+u*(v+.5)+f*.5,l.y+f*(v+.5)-u*.5)||v===d)&&(v>g&&n.push(l.x+u*g,a,l.y+f*g,l.x+u*v,a,l.y+f*v),g=v+1)});for(let a=0;a<o.length;a+=1){const l=o[a],c=o[(a+o.length-1)%o.length],h=o[(a+1)%o.length];if(Math.hypot(l.x-c.x,l.y-c.y)<=1&&Math.hypot(h.x-l.x,h.y-l.y)<=1||[-.5,.5].some(u=>[-.5,.5].some(f=>r(l.x+u,l.y+f))))continue;const d=`${l.x}:${l.y}`;s.has(d)||(s.add(d),n.push(l.x,.08,l.y,l.x,pr+.01,l.y))}}return new wt().setAttribute("position",new dt(n,3))}function Lc(i){const e=Uh(i),t=e.filter(s=>ir(s)>0).map(s=>{const r=new Ca;return Cc(r,s),{contour:s,area:ir(s),shape:r}});for(const s of e.filter(r=>ir(r)<0)){const[r,o]=s,a=Math.hypot(o.x-r.x,o.y-r.y),l={x:(r.x+o.x)/2+(o.y-r.y)/a*.25,y:(r.y+o.y)/2-(o.x-r.x)/a*.25},c=t.filter(h=>Zx(h.contour,l)).sort((h,d)=>h.area-d.area)[0];if(c){const h=new dr;Cc(h,s),c.shape.holes.push(h)}}const n=new _r(t.map(({shape:s})=>s),{depth:pr,steps:1,bevelEnabled:!1});return n.rotateX(-Math.PI/2),n.clearGroups(),n}const Qx={P:{outline:[[0,0],[0,10],[6.5,10],[8,8.5],[8,5.5],[6.5,4],[2,4],[2,0]],holes:[[[2,6],[6,6],[6,8],[2,8]]]},A:{outline:[[0,0],[0,8.5],[1.5,10],[6.5,10],[8,8.5],[8,0],[6,0],[6,3.5],[2,3.5],[2,0]],holes:[[[2,5.5],[6,5.5],[6,8],[2,8]]]},C:{outline:[[8,1.5],[6.5,0],[1.5,0],[0,1.5],[0,8.5],[1.5,10],[6.5,10],[8,8.5],[8,7],[6,7],[6,8],[2,8],[2,2],[6,2],[6,3],[8,3]]},K:{outline:[[0,0],[0,10],[2,10],[2,6],[6,10],[8,10],[4.5,5.5],[8,0],[5.5,0],[3,4],[2,3],[2,0]]},E:{outline:[[0,0],[0,10],[8,10],[8,8],[2,8],[2,6],[7,6],[7,4],[2,4],[2,2],[8,2],[8,0]]},T:{outline:[[3,0],[3,8],[0,8],[0,10],[8,10],[8,8],[5,8],[5,0]]},L:{outline:[[0,0],[0,10],[2,10],[2,2],[8,2],[8,0]]},O:{outline:[[1.5,0],[0,1.5],[0,8.5],[1.5,10],[6.5,10],[8,8.5],[8,1.5],[6.5,0]],holes:[[[2,2],[6,2],[6,8],[2,8]]]},S:{outline:[[0,1.5],[1.5,0],[6.5,0],[8,1.5],[8,4],[6.5,5.5],[2,5.5],[2,8],[6,8],[6,7],[8,7],[8,8.5],[6.5,10],[1.5,10],[0,8.5],[0,6],[1.5,4.5],[6,4.5],[6,2],[2,2],[2,3],[0,3]]}},Fh=["P","A","C","K","E","T","L","O","S","S"],jx=Fh.length*10-2;function ev(i,e){const t=i/jx,n=e/10,s=Fh.map((o,a)=>{const l=Qx[o],c=(d,u)=>{u.forEach(([f,g],v)=>{const m=(f+a*10)*t-i/2,p=g*n-e/2;v===0?d.moveTo(m,p):d.lineTo(m,p)}),d.closePath()},h=new Ca;c(h,l.outline);for(const d of l.holes??[]){const u=new dr;c(u,d),h.holes.push(u)}return h}),r=new _r(s,{depth:pr,steps:1,bevelEnabled:!1});return r.rotateX(-Math.PI/2),r.clearGroups(),r}class tv{constructor(e,t){this.group=new $t,this.resources=new Set,this.group.name="maze";const{map:n}=e,s=this.own(new ei(n.tileWidth,n.tileHeight));s.rotateX(-Math.PI/2);const r=this.own(new _n({color:"#050912",roughness:.86})),o=n.tiles.flat().filter(v=>v.gid!==null),a=this.own(new cr(s,r,o.length));a.name="floor";const l=new nt;o.forEach((v,m)=>{a.setMatrixAt(m,l.makeTranslation((v.x+.5)*n.tileWidth,-.04,(v.y+.5)*n.tileHeight))}),a.computeBoundingSphere(),this.group.add(a);const c=o.some(v=>v.localId===16)?$x(n,v=>t.getTileMask(v)):void 0,h=Jx(n,v=>t.getTileMask(v)),d=this.own(Lc(h)),u=this.createWallMaterial("#1e0d20"),f=new gt(d,u);f.name="walls",this.group.add(f);const g=this.createOutlineStrips(Pc(h,c),new Ve("#b579a1"));g.name="wall-edges",this.group.add(g),c&&this.addPen(c),this.addSigns(e,o)}dispose(){this.resources.forEach(e=>e.dispose()),this.resources.clear(),this.group.clear()}own(e){return this.resources.add(e),e}createWallMaterial(e){return this.own(new _n({color:e,roughness:.3,metalness:.12}))}createOutlineStrips(e,t){const n=e.getAttribute("position"),s=this.own(new Di(1,1,1)),r=this.own(new Ii({color:t,toneMapped:!1})),o=this.own(new cr(s,r,n.count/2)),a=new vt,l=new D,c=new D,h=new D,d=new D(0,1,0),u=.35;for(let f=0;f<n.count;f+=2)l.fromBufferAttribute(n,f),c.fromBufferAttribute(n,f+1),h.subVectors(c,l),a.position.copy(l).add(c).multiplyScalar(.5),a.scale.set(u,h.length()+u,u),a.quaternion.setFromUnitVectors(d,h.normalize()),a.updateMatrix(),o.setMatrixAt(f/2,a.matrix);return o.computeBoundingSphere(),e.dispose(),o}addSigns(e,t){const n=t.filter(o=>o.localId!==null&&o.localId>=17&&o.localId<=21).sort((o,a)=>o.y-a.y||o.x-a.x);if(n.length===0)return;const s=[];for(const o of n){const a=s[s.length-1],l=a==null?void 0:a[a.length-1];l&&l.y===o.y&&l.x+1===o.x?a.push(o):s.push([o])}const r=this.createWallMaterial("#241b0b");for(const o of s){const a=o.length*e.map.tileWidth,l=e.map.tileHeight,c=this.own(ev(a-2,l-2)),h=new gt(c,r);h.name="sign-lettering";const d=this.createOutlineStrips(new ed(c),new Ve("#b9a36b"));d.name="sign-edges";const u=new $t;u.name="sign-artwork",u.position.set((o[0].x+o.length/2)*e.map.tileWidth,0,(o[0].y+.5)*l),u.add(h,d),this.group.add(u)}}addPen(e){const t=new $t;t.name="ghost-pen";const n=new gt(this.own(Lc(e)),this.createWallMaterial("#061428"));n.name="pen-bars";const s=this.createOutlineStrips(Pc(e,void 0,!1),new Ve("#419da9"));s.name="pen-edges",t.add(n,s),this.group.add(t)}}class nv{constructor(e){this.world=e,this.previousPositions=new WeakMap}capturePreviousState(){this.capture(this.world.packet);for(const e of this.world.ghosts)this.capture(e)}getPosition(e,t){const n=this.previousPositions.get(e);if(!n||n.tile!==e.tile)return e;const s=sn(t,0,1);return n.output.x=yi(n.x,e.x,s),n.output.y=yi(n.y,e.y,s),n.output}capture(e){const t=this.previousPositions.get(e);if(t){t.x=e.x,t.y=e.y,t.tile=e.tile;return}this.previousPositions.set(e,{x:e.x,y:e.y,tile:e.tile,output:{x:e.x,y:e.y}})}}class iv{constructor(e,t,n,s,r){this.world=e,this.renderer=t,this.camera=n,this.collectibles=r,this.scene=new Hu,this.assets=new Xx,this.ghosts=new Map,this.points=new Map,this.effects=new Map,this.effectGeometry=new Pa(.7,1,24),this.pointMatrix=new nt,this.lastPointCount=-1,this.destroyed=!1,this.presentation=new nv(e),this.scene.background=new Ve("#02040b"),this.scene.add(new Gd("#a7c5ff","#160b30",.85));const o=new Wd("#c7dfff",1.4);o.position.set(-150,300,100),this.scene.add(o),this.maze=new tv(e,s),this.debug=new Kx(e),this.scene.add(this.maze.group,this.debug.group),this.packet=this.assets.createPacket(),this.packet.name="packet",this.packet.add(this.assets.createContactShadow(e.packet.displayWidth)),this.scene.add(this.packet);for(const l of e.ghosts){const c=this.assets.createGhost(l.key);c.name="ghost-"+l.key,c.add(this.assets.createContactShadow(l.displayWidth)),this.ghosts.set(l,c),this.scene.add(c)}const a=Array.from(this.collectibles.getPoints());for(const l of["base","power"]){const c=a.filter(u=>u.kind===l).length,h=l==="power"?this.assets.powerPelletMaterial:this.assets.pelletMaterial,d=new cr(this.assets.pelletGeometry,h,c);d.name="pellets-"+l,this.points.set(l,d),this.scene.add(d)}this.syncPoints()}capturePreviousState(){this.presentation.capturePreviousState()}render(e=1){if(this.destroyed)return;this.camera.present(e,this.renderer.pixelRatio);const t=this.presentation.getPosition(this.world.packet,e);this.packet.position.set(t.x,0,t.y),this.packet.rotation.y=-(this.world.packet.angle*Math.PI)/180,this.packet.visible=this.isPacketVisible(),this.assets.setPacketFrame(this.packet,this.world.packetAnimation.frame),this.ghosts.forEach((n,s)=>{var o;const r=this.presentation.getPosition(s,e);n.position.set(r.x,0,r.y),this.assets.setGhostAppearance(n,Dh(this.world,s),((o=this.world.ghostAnimations.get(s))==null?void 0:o.frame)??0,s.direction)}),this.syncPoints(),this.syncEffects(),this.debug.sync(),this.renderer.render(this.scene,this.camera.camera)}destroy(){this.destroyed||(this.destroyed=!0,this.maze.dispose(),this.debug.dispose(),this.points.forEach(e=>e.dispose()),this.effects.forEach(e=>e.material.dispose()),this.effects.clear(),this.effectGeometry.dispose(),this.assets.dispose(),this.scene.clear(),this.renderer.dispose())}syncPoints(){const e=this.collectibles.getPointCount();if(e===this.lastPointCount)return;this.lastPointCount=e;const t={base:0,power:0};for(const n of this.collectibles.getPoints()){const s=this.points.get(n.kind),r=hs[n.kind==="power"?1:0].size/2;this.pointMatrix.makeScale(r,r,r),this.pointMatrix.setPosition(n.x,r+.12,n.y),s.setMatrixAt(t[n.kind],this.pointMatrix),t[n.kind]+=1}this.points.forEach((n,s)=>{n.count=t[s],n.instanceMatrix.needsUpdate=!0,n.computeBoundingSphere()})}syncEffects(){const e=this.collectibles.getEatEffects();this.effects.forEach((t,n)=>{e.includes(n)||(this.scene.remove(t),t.material.dispose(),this.effects.delete(n))});for(const t of e){let n=this.effects.get(t);n||(n=new gt(this.effectGeometry,new Ii({color:"#c8ba9c",transparent:!0,depthWrite:!1})),n.name="pellet-effect",n.rotation.x=-Math.PI/2,n.position.set(t.x,.08,t.y),this.effects.set(t,n),this.scene.add(n));const s=Math.min(1,t.elapsedMs/t.durationMs),r=(1-s)*(1-s),o=t.sizeStart+(t.sizeEnd-t.sizeStart)*(1-r);n.scale.setScalar(o/2),n.material.opacity=r}}isPacketVisible(){if((this.world.packet.deathRecoveryRemainingMs??0)>0)return this.world.packet.deathRecoveryVisible??!0;if((this.world.packet.portalBlinkRemainingMs??0)<=0)return!0;const n=this.world.packet.portalBlinkElapsedMs??0;return Math.floor(n/yh.intervalMs)%2===0}}const sv={mapJsonPath:"assets/mazes/default/maze.json",tileBasePath:"assets/mazes/default"},rv={mapJsonPath:"assets/mazes/default/demo.json",tileBasePath:"assets/mazes/default"};function ov(i){return i==="DEMO"?"demo":"default"}function av(i){return i==="demo"?{...rv}:{...sv}}const Ic=["inky","clyde","pinky","blinky"];class lv{constructor(e={}){this.options=e}async compose(e,t){const n=this.options.mountId??"game-root",s=document.getElementById(n);if(!s)throw new Error(`Game mount element not found: #${n}`);const r=new $_,o=new A_,a=Z_(this.options.rng??Math.random),l=this.options.mapVariant??"default",{mapJsonPath:c,tileBasePath:h}=av(l),d=await this.loadMapForVariant(r,l,c);t==null||t.throwIfAborted();const u=d.tileWidth||$0;await o.loadForMap(d,h),t==null||t.throwIfAborted();const f=document.createElement("canvas");f.className="block h-full w-full touch-none transition-[filter] duration-200 ease-out";const g=new c_(d.tiles.map(Re=>Re.map(qe=>({...qe.collision})))),v=new p_(u),m=new y_,p={x:Math.floor(d.width/2),y:Math.floor(d.height/2)},y=m.resolveSpawnTile(d.packetSpawn,p,d),A=m.resolveGhostJailBounds(d,y),S=vi(d.ghostHome,"ghostCount")??4,T=Math.max(0,Math.round(S)),w=new a_(y,Yn.packet,Yn.packet);v.setEntityTile(w,y);const R=[],x=Math.max(1,A.maxX-A.minX+1),b=sn(A.y,0,d.height-1);for(let Re=0;Re<T;Re+=1){const qe=A.minX+a.int(x),$={x:sn(qe,0,d.width-1),y:b},ne=new o_({key:Ic[Re%Ic.length],tile:$,direction:a.next()<.5?"right":"left",speed:ji.ghost,displayWidth:Yn.ghost,displayHeight:Yn.ghost});v.setEntityTile(ne,$),R.push(ne)}i_(0,Ia);const P=new w_({map:d,tileSize:u,collisionGrid:g,packetSpawnTile:y,packet:w,ghosts:R,ghostJailBounds:A}),N=new J0,z=new P_(f),V=new C_(f),U=new N_,O=new E_(g,d.portalPairs??[]),J=new m_,H=new kx(V,P,e),se=new zx(P,v,O),X=new Dx(P,v,m,U,a),j=new Tx(P,v,J,O,a),te={getPacketMask:(Re,qe,$,ne)=>o.getSpriteMask("packet",Re,qe,$,ne),getGhostMask:(Re,qe,$,ne,re)=>o.getSpriteMask(Re,qe,$,ne,re)},Ae=new Ix(P,v,ji.ghost,te),Ee=new ix(P,ji.ghost),et=new sx(P,N,z,f),We=new Ex(P),Ze=new Ux(s),q=new Vx(P,s),Q=new wx(P,N);let he;try{he=new iv(P,z,N,o,We)}catch(Re){throw V.destroy(),z.dispose(),f.remove(),Re}const Ue=[H,se,X,j,Ae,Ee,et,We,Ze,q,Q],Se=[he,Q,Ze];return s.replaceChildren(f),{world:P,renderer:z,input:V,scheduler:U,updateSystems:Ue,renderSystems:Se,destroy:()=>{f.remove()}}}async loadMapForVariant(e,t,n){try{return await e.loadMap(n)}catch(s){throw t==="demo"?new Error(`DEMO map startup failed while loading "${n}": ${s instanceof Error?s.message:String(s)}`):s}}}function cv(i,e,t,n=8){const s=Number.isFinite(e)&&e>0?e:0,r=t*n,o=s>r?r:s;let a=i.accumulatorMs+o,l=0;for(;a>=t&&l<n;)a-=t,l+=1;return l===n&&a>=t&&(a=0),{ticks:l,accumulatorMs:a,clampedDeltaMs:o}}class hv{constructor(e,t,n=1e3/60,s=8){this.state={accumulatorMs:0},this.running=!1,this.lastTimestamp=0,this.frameId=0,this.tick=r=>{if(!this.running)return;this.lastTimestamp===0&&(this.lastTimestamp=r);const o=r-this.lastTimestamp;this.lastTimestamp=r;const a=cv(this.state,o,this.stepMs,this.maxSubSteps);this.state.accumulatorMs=a.accumulatorMs;for(let c=0;c<a.ticks;c+=1)this.update(this.stepMs);const l=this.stepMs>0?this.state.accumulatorMs/this.stepMs:0;this.render(l),this.frameId=window.requestAnimationFrame(this.tick)},this.update=e,this.render=t,this.stepMs=n,this.maxSubSteps=s}start(){this.running||(this.running=!0,this.lastTimestamp=0,this.state.accumulatorMs=0,this.frameId=window.requestAnimationFrame(this.tick))}stop(){this.running&&(this.running=!1,window.cancelAnimationFrame(this.frameId))}}class uv{constructor(e){this.compositionRoot=e,this.loop=null,this.composed=null,this.started=!1,this.destroyed=!1,this.pausedByFocusLoss=!1,this.focusListenersBound=!1,this.presentationReady=!1,this.starting=null,this.startupAbort=new AbortController,this.runtimeControl={pause:()=>{this.pause()},resume:()=>{this.resume()},togglePause:()=>{this.composed&&(this.composed.world.isMoving?this.pause():this.resume())}},this.handleWindowBlur=()=>{this.handleFocusLost()},this.handleWindowFocus=()=>{this.handleFocusReturned()},this.handleVisibilityChange=()=>{if(!(typeof document>"u"||!("hidden"in document))){if(document.hidden){this.handleFocusLost();return}this.handleFocusReturned()}},this.update=t=>{if(!(!this.composed||this.destroyed)){if(!this.composed.world.isMoving){this.composed.updateSystems.forEach(n=>{n.runsWhenPaused&&n.update(t)});return}this.composed.renderSystems.forEach(n=>{var s;(s=n.capturePreviousState)==null||s.call(n)}),this.composed.world.nextTick(),this.composed.scheduler.update(t),this.composed.updateSystems.forEach(n=>{n.update(t)}),this.presentationReady=this.composed.world.isMoving}},this.render=t=>{if(!this.composed||this.destroyed)return;const n=this.presentationReady&&this.composed.world.isMoving?t:1;this.composed.renderSystems.forEach(s=>{s.render(n)})}}start(){return this.started||this.destroyed?Promise.resolve():(this.starting??(this.starting=this.initialize().finally(()=>{this.starting=null})),this.starting)}async initialize(){let e;try{e=await this.compositionRoot.compose(this.runtimeControl,this.startupAbort.signal)}catch(t){if(this.destroyed)return;throw t}if(this.destroyed){this.destroyComposedGame(e);return}this.composed=e,this.loop=new hv(this.update,this.render),this.started=!0;try{this.bindFocusListeners(),e.updateSystems.forEach(t=>{var n;(n=t.start)==null||n.call(t)}),this.loop.start()}catch(t){throw this.loop.stop(),this.loop=null,this.started=!1,this.unbindFocusListeners(),this.composed=null,this.destroyComposedGame(e),t}}pause(){this.composed&&(this.composed.world.isMoving=!1,this.presentationReady=!1,this.composed.scheduler.setPaused(!0))}resume(){this.composed&&(this.pausedByFocusLoss=!1,this.presentationReady=!1,this.composed.world.isMoving=!0,this.composed.scheduler.setPaused(!1))}destroy(){var e;this.destroyed||(this.destroyed=!0,this.startupAbort.abort(),this.presentationReady=!1,this.started=!1,this.unbindFocusListeners(),this.pausedByFocusLoss=!1,(e=this.loop)==null||e.stop(),this.loop=null,this.composed&&this.destroyComposedGame(this.composed),this.composed=null)}bindFocusListeners(){this.focusListenersBound||!this.canBindWindowListeners()||(window.addEventListener("blur",this.handleWindowBlur),window.addEventListener("focus",this.handleWindowFocus),this.canBindDocumentListeners()&&document.addEventListener("visibilitychange",this.handleVisibilityChange),this.focusListenersBound=!0)}unbindFocusListeners(){!this.focusListenersBound||!this.canBindWindowListeners()||(window.removeEventListener("blur",this.handleWindowBlur),window.removeEventListener("focus",this.handleWindowFocus),this.canBindDocumentListeners()&&document.removeEventListener("visibilitychange",this.handleVisibilityChange),this.focusListenersBound=!1)}canBindWindowListeners(){return typeof window<"u"&&typeof window.addEventListener=="function"&&typeof window.removeEventListener=="function"}canBindDocumentListeners(){return typeof document<"u"&&typeof document.addEventListener=="function"&&typeof document.removeEventListener=="function"}handleFocusLost(){!this.started||this.destroyed||!this.composed||!this.composed.world.isMoving||(this.pause(),this.pausedByFocusLoss=!0)}handleFocusReturned(){!this.started||this.destroyed||!this.composed||!this.pausedByFocusLoss||this.resume()}destroyComposedGame(e){const t=new Set([...e.renderSystems,...e.updateSystems]);this.destroySystems(Array.from(t)),e.scheduler.clear(),e.input.destroy(),e.destroy()}destroySystems(e){e.forEach(t=>{var n;(n=t.destroy)==null||n.call(t)})}}let _i=null;function dv(i={}){_i==null||_i.destroy();const e=new uv(new lv(i)),t={start:()=>e.start(),pause:()=>e.pause(),resume:()=>e.resume(),destroy:()=>{e.destroy(),_i===t&&(_i=null)}};return _i=t,t}const fv=dv({mountId:"game-root",mapVariant:ov({}.VITE_GAME_ENV)});fv.start().catch(i=>{var t;const e=document.createElement("p");e.className="m-auto max-w-lg p-8 text-center text-white",e.setAttribute("role","alert"),e.textContent=i instanceof Error?i.message:"The game could not start. Please reload and try again.",(t=document.getElementById("game-root"))==null||t.replaceChildren(e)});
