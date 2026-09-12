(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function t(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(s){if(s.ep)return;s.ep=!0;const r=t(s);fetch(s.href,r)}})();/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const _a="186",Hh=0,sl=1,Vh=2,tr=1,Wh=2,$i=3,Zn=0,Ut=1,Sn=2,En=0,ts=1,rl=2,ol=3,al=4,Xh=5,Si=100,Yh=101,qh=102,Kh=103,Jh=104,Zh=200,$h=201,Qh=202,jh=203,Nc=204,Uc=205,eu=206,tu=207,nu=208,iu=209,su=210,ru=211,ou=212,au=213,lu=214,So=0,yo=1,Eo=2,os=3,wo=4,To=5,bo=6,Ao=7,Fc=0,cu=1,hu=2,cn=0,Oc=1,Bc=2,kc=3,xa=4,zc=5,Gc=6,Hc=7,Vc=300,$n=301,Ri=302,Cr=303,Pr=304,Sr=306,Ro=1e3,yn=1001,Co=1002,Tt=1003,uu=1004,xs=1005,Et=1006,Lr=1007,qn=1008,kt=1009,Wc=1010,Xc=1011,as=1012,va=1013,hn=1014,Zt=1015,un=1016,Ma=1017,Sa=1018,ls=1020,Yc=35902,qc=35899,Kc=1021,Jc=1022,$t=1023,Tn=1026,Kn=1027,ya=1028,Ea=1029,Qn=1030,wa=1031,Ta=1033,nr=33776,ir=33777,sr=33778,rr=33779,Po=35840,Lo=35841,Io=35842,Do=35843,No=36196,Uo=37492,Fo=37496,Oo=37488,Bo=37489,cr=37490,ko=37491,zo=37808,Go=37809,Ho=37810,Vo=37811,Wo=37812,Xo=37813,Yo=37814,qo=37815,Ko=37816,Jo=37817,Zo=37818,$o=37819,Qo=37820,jo=37821,ea=36492,ta=36494,na=36495,ia=36283,sa=36284,hr=36285,ra=36286,du=3200,oa=0,fu=1,On="",Bt="srgb",ur="srgb-linear",dr="linear",ot="srgb",Ir=7680,pu=519,mu=512,gu=513,_u=514,ba=515,xu=516,vu=517,Aa=518,Mu=519,Su=35044,ll="300 es",ln=2e3,cs=2001;function yu(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function fr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Eu(){const i=fr("canvas");return i.style.display="block",i}const cl={};function hl(...i){const e="THREE."+i.shift();console.log(e,...i)}function Zc(i){const e=i[0];if(typeof e=="string"&&e.startsWith("TSL:")){const t=i[1];t&&t.isStackTrace?i[0]+=" "+t.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function Be(...i){i=Zc(i);const e="THREE."+i.shift();{const t=i[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...i)}}function Qe(...i){i=Zc(i);const e="THREE."+i.shift();{const t=i[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...i)}}function bi(...i){const e=i.join(" ");e in cl||(cl[e]=!0,Be(...i))}function wu(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}const Tu={[So]:yo,[Eo]:bo,[wo]:Ao,[os]:To,[yo]:So,[bo]:Eo,[Ao]:wo,[To]:os};class ti{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){const n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){const n=this._listeners;if(n===void 0)return;const s=n[e];if(s!==void 0){const r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const n=t[e.type];if(n!==void 0){e.target=this;const s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,e);e.target=null}}}const At=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],or=Math.PI/180,aa=180/Math.PI;function Li(){const i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(At[i&255]+At[i>>8&255]+At[i>>16&255]+At[i>>24&255]+"-"+At[e&255]+At[e>>8&255]+"-"+At[e>>16&15|64]+At[e>>24&255]+"-"+At[t&63|128]+At[t>>8&255]+"-"+At[t>>16&255]+At[t>>24&255]+At[n&255]+At[n>>8&255]+At[n>>16&255]+At[n>>24&255]).toLowerCase()}function Je(i,e,t){return Math.max(e,Math.min(t,i))}function bu(i,e){return(i%e+e)%e}function Dr(i,e,t){return(1-t)*i+t*e}function Bi(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:case Uint8ClampedArray:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function Dt(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}const Va=class Va{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Je(this.x,e.x,t.x),this.y=Je(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Je(this.x,e,t),this.y=Je(this.y,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Je(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Je(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*n-o*s+e.x,this.y=r*s+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};Va.prototype.isVector2=!0;let me=Va;class Ii{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,o,a){let l=n[s+0],c=n[s+1],h=n[s+2],d=n[s+3],u=r[o+0],f=r[o+1],g=r[o+2],M=r[o+3];if(d!==M||l!==u||c!==f||h!==g){let m=l*u+c*f+h*g+d*M;m<0&&(u=-u,f=-f,g=-g,M=-M,m=-m);let p=1-a;if(m<.9995){const w=Math.acos(m),A=Math.sin(w);p=Math.sin(p*w)/A,a=Math.sin(a*w)/A,l=l*p+u*a,c=c*p+f*a,h=h*p+g*a,d=d*p+M*a}else{l=l*p+u*a,c=c*p+f*a,h=h*p+g*a,d=d*p+M*a;const w=1/Math.sqrt(l*l+c*c+h*h+d*d);l*=w,c*=w,h*=w,d*=w}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=d}static multiplyQuaternionsFlat(e,t,n,s,r,o){const a=n[s],l=n[s+1],c=n[s+2],h=n[s+3],d=r[o],u=r[o+1],f=r[o+2],g=r[o+3];return e[t]=a*g+h*d+l*f-c*u,e[t+1]=l*g+h*u+c*d-a*f,e[t+2]=c*g+h*f+a*u-l*d,e[t+3]=h*g-a*d-l*u-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,s=e._y,r=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(n/2),h=a(s/2),d=a(r/2),u=l(n/2),f=l(s/2),g=l(r/2);switch(o){case"XYZ":this._x=u*h*d+c*f*g,this._y=c*f*d-u*h*g,this._z=c*h*g+u*f*d,this._w=c*h*d-u*f*g;break;case"YXZ":this._x=u*h*d+c*f*g,this._y=c*f*d-u*h*g,this._z=c*h*g-u*f*d,this._w=c*h*d+u*f*g;break;case"ZXY":this._x=u*h*d-c*f*g,this._y=c*f*d+u*h*g,this._z=c*h*g+u*f*d,this._w=c*h*d-u*f*g;break;case"ZYX":this._x=u*h*d-c*f*g,this._y=c*f*d+u*h*g,this._z=c*h*g-u*f*d,this._w=c*h*d+u*f*g;break;case"YZX":this._x=u*h*d+c*f*g,this._y=c*f*d+u*h*g,this._z=c*h*g-u*f*d,this._w=c*h*d-u*f*g;break;case"XZY":this._x=u*h*d-c*f*g,this._y=c*f*d-u*h*g,this._z=c*h*g+u*f*d,this._w=c*h*d+u*f*g;break;default:Be("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],s=t[4],r=t[8],o=t[1],a=t[5],l=t[9],c=t[2],h=t[6],d=t[10],u=n+a+d;if(u>0){const f=.5/Math.sqrt(u+1);this._w=.25/f,this._x=(h-l)*f,this._y=(r-c)*f,this._z=(o-s)*f}else if(n>a&&n>d){const f=2*Math.sqrt(1+n-a-d);this._w=(h-l)/f,this._x=.25*f,this._y=(s+o)/f,this._z=(r+c)/f}else if(a>d){const f=2*Math.sqrt(1+a-n-d);this._w=(r-c)/f,this._x=(s+o)/f,this._y=.25*f,this._z=(l+h)/f}else{const f=2*Math.sqrt(1+d-n-a);this._w=(o-s)/f,this._x=(r+c)/f,this._y=(l+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Je(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,s=e._y,r=e._z,o=e._w,a=t._x,l=t._y,c=t._z,h=t._w;return this._x=n*h+o*a+s*c-r*l,this._y=s*h+o*l+r*a-n*c,this._z=r*h+o*c+n*l-s*a,this._w=o*h-n*a-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,s=e._y,r=e._z,o=e._w,a=this.dot(e);a<0&&(n=-n,s=-s,r=-r,o=-o,a=-a);let l=1-t;if(a<.9995){const c=Math.acos(a),h=Math.sin(c);l=Math.sin(l*c)/h,t=Math.sin(t*c)/h,this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+o*t,this._onChangeCallback()}else this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+o*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}const Wa=class Wa{constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(ul.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(ul.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=e.elements,o=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(e){const t=this.x,n=this.y,s=this.z,r=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*s-a*n),h=2*(a*t-r*s),d=2*(r*n-o*t);return this.x=t+l*c+o*d-a*h,this.y=n+l*h+a*c-r*d,this.z=s+l*d+r*h-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Je(this.x,e.x,t.x),this.y=Je(this.y,e.y,t.y),this.z=Je(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Je(this.x,e,t),this.y=Je(this.y,e,t),this.z=Je(this.z,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Je(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,s=e.y,r=e.z,o=t.x,a=t.y,l=t.z;return this.x=s*l-r*a,this.y=r*o-n*l,this.z=n*a-s*o,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Nr.copy(this).projectOnVector(e),this.sub(Nr)}reflect(e){return this.sub(Nr.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Je(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};Wa.prototype.isVector3=!0;let D=Wa;const Nr=new D,ul=new Ii,Xa=class Xa{constructor(e,t,n,s,r,o,a,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,l,c)}set(e,t,n,s,r,o,a,l,c){const h=this.elements;return h[0]=e,h[1]=s,h[2]=a,h[3]=t,h[4]=r,h[5]=l,h[6]=n,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],h=n[4],d=n[7],u=n[2],f=n[5],g=n[8],M=s[0],m=s[3],p=s[6],w=s[1],A=s[4],S=s[7],E=s[2],T=s[5],R=s[8];return r[0]=o*M+a*w+l*E,r[3]=o*m+a*A+l*T,r[6]=o*p+a*S+l*R,r[1]=c*M+h*w+d*E,r[4]=c*m+h*A+d*T,r[7]=c*p+h*S+d*R,r[2]=u*M+f*w+g*E,r[5]=u*m+f*A+g*T,r[8]=u*p+f*S+g*R,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8];return t*o*h-t*a*c-n*r*h+n*a*l+s*r*c-s*o*l}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],d=h*o-a*c,u=a*l-h*r,f=c*r-o*l,g=t*d+n*u+s*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const M=1/g;return e[0]=d*M,e[1]=(s*c-h*n)*M,e[2]=(a*n-s*o)*M,e[3]=u*M,e[4]=(h*t-s*l)*M,e[5]=(s*r-a*t)*M,e[6]=f*M,e[7]=(n*l-c*t)*M,e[8]=(o*t-n*r)*M,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,o,a){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*o+c*a)+o+e,-s*c,s*l,-s*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return bi("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Ur.makeScale(e,t)),this}rotate(e){return bi("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Ur.makeRotation(-e)),this}translate(e,t){return bi("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Ur.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}};Xa.prototype.isMatrix3=!0;let Ge=Xa;const Ur=new Ge,dl=new Ge().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),fl=new Ge().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Au(){const i={enabled:!0,workingColorSpace:ur,spaces:{},convert:function(s,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===ot&&(s.r=wn(s.r),s.g=wn(s.g),s.b=wn(s.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===ot&&(s.r=Ai(s.r),s.g=Ai(s.g),s.b=Ai(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===On?dr:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,o){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return bi("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return bi("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[ur]:{primaries:e,whitePoint:n,transfer:dr,toXYZ:dl,fromXYZ:fl,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Bt},outputColorSpaceConfig:{drawingBufferColorSpace:Bt}},[Bt]:{primaries:e,whitePoint:n,transfer:ot,toXYZ:dl,fromXYZ:fl,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Bt}}}),i}const $e=Au();function wn(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Ai(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let oi;class Ru{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{oi===void 0&&(oi=fr("canvas")),oi.width=e.width,oi.height=e.height;const s=oi.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=oi}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=fr("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=wn(r[o]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(wn(t[n]/255)*255):t[n]=wn(t[n]);return{data:t,width:e.width,height:e.height}}else return Be("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let Cu=0;class Ra{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Cu++}),this.uuid=Li(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(Fr(s[o].image)):r.push(Fr(s[o]))}else r=Fr(s);n.url=r}return t||(e.images[this.uuid]=n),n}}function Fr(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Ru.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(Be("Texture: Unable to serialize Texture."),{})}let Pu=0;const Or=new D;class It extends ti{constructor(e=It.DEFAULT_IMAGE,t=It.DEFAULT_MAPPING,n=yn,s=yn,r=Et,o=qn,a=$t,l=kt,c=It.DEFAULT_ANISOTROPY,h=On){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Pu++}),this.uuid=Li(),this.name="",this.source=new Ra(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new me(0,0),this.repeat=new me(1,1),this.center=new me(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ge,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Or).x}get height(){return this.source.getSize(Or).y}get depth(){return this.source.getSize(Or).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const n=e[t];if(n===void 0){Be(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){Be(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Vc)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Ro:e.x=e.x-Math.floor(e.x);break;case yn:e.x=e.x<0?0:1;break;case Co:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Ro:e.y=e.y-Math.floor(e.y);break;case yn:e.y=e.y<0?0:1;break;case Co:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}It.DEFAULT_IMAGE=null;It.DEFAULT_MAPPING=Vc;It.DEFAULT_ANISOTROPY=1;const Ya=class Ya{constructor(e=0,t=0,n=0,s=1){this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*t+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*t+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*t+o[7]*n+o[11]*s+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r;const l=e.elements,c=l[0],h=l[4],d=l[8],u=l[1],f=l[5],g=l[9],M=l[2],m=l[6],p=l[10];if(Math.abs(h-u)<.01&&Math.abs(d-M)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+u)<.1&&Math.abs(d+M)<.1&&Math.abs(g+m)<.1&&Math.abs(c+f+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const A=(c+1)/2,S=(f+1)/2,E=(p+1)/2,T=(h+u)/4,R=(d+M)/4,x=(g+m)/4;return A>S&&A>E?A<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(A),s=T/n,r=R/n):S>E?S<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(S),n=T/s,r=x/s):E<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(E),n=R/r,s=x/r),this.set(n,s,r,t),this}let w=Math.sqrt((m-g)*(m-g)+(d-M)*(d-M)+(u-h)*(u-h));return Math.abs(w)<.001&&(w=1),this.x=(m-g)/w,this.y=(d-M)/w,this.z=(u-h)/w,this.w=Math.acos((c+f+p-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Je(this.x,e.x,t.x),this.y=Je(this.y,e.y,t.y),this.z=Je(this.z,e.z,t.z),this.w=Je(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Je(this.x,e,t),this.y=Je(this.y,e,t),this.z=Je(this.z,e,t),this.w=Je(this.w,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Je(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};Ya.prototype.isVector4=!0;let ft=Ya;class Lu extends ti{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Et,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new ft(0,0,e,t),this.scissorTest=!1,this.viewport=new ft(0,0,e,t),this.textures=[];const s={width:e,height:t,depth:n.depth},r=new It(s),o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){const t={minFilter:Et,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const s=Object.assign({},e.textures[t].image);this.textures[t].source=new Ra(s)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){const t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}class jt extends Lu{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class $c extends It{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Tt,this.minFilter=Tt,this.wrapR=yn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class Iu extends It{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Tt,this.minFilter=Tt,this.wrapR=yn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}}const Mr=class Mr{constructor(e,t,n,s,r,o,a,l,c,h,d,u,f,g,M,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,l,c,h,d,u,f,g,M,m)}set(e,t,n,s,r,o,a,l,c,h,d,u,f,g,M,m){const p=this.elements;return p[0]=e,p[4]=t,p[8]=n,p[12]=s,p[1]=r,p[5]=o,p[9]=a,p[13]=l,p[2]=c,p[6]=h,p[10]=d,p[14]=u,p[3]=f,p[7]=g,p[11]=M,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Mr().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();const t=this.elements,n=e.elements,s=1/ai.setFromMatrixColumn(e,0).length(),r=1/ai.setFromMatrixColumn(e,1).length(),o=1/ai.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,s=e.y,r=e.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),d=Math.sin(r);if(e.order==="XYZ"){const u=o*h,f=o*d,g=a*h,M=a*d;t[0]=l*h,t[4]=-l*d,t[8]=c,t[1]=f+g*c,t[5]=u-M*c,t[9]=-a*l,t[2]=M-u*c,t[6]=g+f*c,t[10]=o*l}else if(e.order==="YXZ"){const u=l*h,f=l*d,g=c*h,M=c*d;t[0]=u+M*a,t[4]=g*a-f,t[8]=o*c,t[1]=o*d,t[5]=o*h,t[9]=-a,t[2]=f*a-g,t[6]=M+u*a,t[10]=o*l}else if(e.order==="ZXY"){const u=l*h,f=l*d,g=c*h,M=c*d;t[0]=u-M*a,t[4]=-o*d,t[8]=g+f*a,t[1]=f+g*a,t[5]=o*h,t[9]=M-u*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){const u=o*h,f=o*d,g=a*h,M=a*d;t[0]=l*h,t[4]=g*c-f,t[8]=u*c+M,t[1]=l*d,t[5]=M*c+u,t[9]=f*c-g,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){const u=o*l,f=o*c,g=a*l,M=a*c;t[0]=l*h,t[4]=M-u*d,t[8]=g*d+f,t[1]=d,t[5]=o*h,t[9]=-a*h,t[2]=-c*h,t[6]=f*d+g,t[10]=u-M*d}else if(e.order==="XZY"){const u=o*l,f=o*c,g=a*l,M=a*c;t[0]=l*h,t[4]=-d,t[8]=c*h,t[1]=u*d+M,t[5]=o*h,t[9]=f*d-g,t[2]=g*d-f,t[6]=a*h,t[10]=M*d+u}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Du,e,Nu)}lookAt(e,t,n){const s=this.elements;return Ft.subVectors(e,t),Ft.lengthSq()===0&&(Ft.z=1),Ft.normalize(),Cn.crossVectors(n,Ft),Cn.lengthSq()===0&&(Math.abs(n.z)===1?Ft.x+=1e-4:Ft.z+=1e-4,Ft.normalize(),Cn.crossVectors(n,Ft)),Cn.normalize(),vs.crossVectors(Ft,Cn),s[0]=Cn.x,s[4]=vs.x,s[8]=Ft.x,s[1]=Cn.y,s[5]=vs.y,s[9]=Ft.y,s[2]=Cn.z,s[6]=vs.z,s[10]=Ft.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],h=n[1],d=n[5],u=n[9],f=n[13],g=n[2],M=n[6],m=n[10],p=n[14],w=n[3],A=n[7],S=n[11],E=n[15],T=s[0],R=s[4],x=s[8],b=s[12],P=s[1],N=s[5],z=s[9],V=s[13],U=s[2],O=s[6],J=s[10],H=s[14],ie=s[3],X=s[7],$=s[11],ee=s[15];return r[0]=o*T+a*P+l*U+c*ie,r[4]=o*R+a*N+l*O+c*X,r[8]=o*x+a*z+l*J+c*$,r[12]=o*b+a*V+l*H+c*ee,r[1]=h*T+d*P+u*U+f*ie,r[5]=h*R+d*N+u*O+f*X,r[9]=h*x+d*z+u*J+f*$,r[13]=h*b+d*V+u*H+f*ee,r[2]=g*T+M*P+m*U+p*ie,r[6]=g*R+M*N+m*O+p*X,r[10]=g*x+M*z+m*J+p*$,r[14]=g*b+M*V+m*H+p*ee,r[3]=w*T+A*P+S*U+E*ie,r[7]=w*R+A*N+S*O+E*X,r[11]=w*x+A*z+S*J+E*$,r[15]=w*b+A*V+S*H+E*ee,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],o=e[1],a=e[5],l=e[9],c=e[13],h=e[2],d=e[6],u=e[10],f=e[14],g=e[3],M=e[7],m=e[11],p=e[15],w=l*f-c*u,A=a*f-c*d,S=a*u-l*d,E=o*f-c*h,T=o*u-l*h,R=o*d-a*h;return t*(M*w-m*A+p*S)-n*(g*w-m*E+p*T)+s*(g*A-M*E+p*R)-r*(g*S-M*T+m*R)}determinantAffine(){const e=this.elements,t=e[0],n=e[4],s=e[8],r=e[1],o=e[5],a=e[9],l=e[2],c=e[6],h=e[10];return t*(o*h-a*c)-n*(r*h-a*l)+s*(r*c-o*l)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],d=e[9],u=e[10],f=e[11],g=e[12],M=e[13],m=e[14],p=e[15],w=t*a-n*o,A=t*l-s*o,S=t*c-r*o,E=n*l-s*a,T=n*c-r*a,R=s*c-r*l,x=h*M-d*g,b=h*m-u*g,P=h*p-f*g,N=d*m-u*M,z=d*p-f*M,V=u*p-f*m,U=w*V-A*z+S*N+E*P-T*b+R*x;if(U===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const O=1/U;return e[0]=(a*V-l*z+c*N)*O,e[1]=(s*z-n*V-r*N)*O,e[2]=(M*R-m*T+p*E)*O,e[3]=(u*T-d*R-f*E)*O,e[4]=(l*P-o*V-c*b)*O,e[5]=(t*V-s*P+r*b)*O,e[6]=(m*S-g*R-p*A)*O,e[7]=(h*R-u*S+f*A)*O,e[8]=(o*z-a*P+c*x)*O,e[9]=(n*P-t*z-r*x)*O,e[10]=(g*T-M*S+p*w)*O,e[11]=(d*S-h*T-f*w)*O,e[12]=(a*b-o*N-l*x)*O,e[13]=(t*N-n*b+s*x)*O,e[14]=(M*A-g*E-m*w)*O,e[15]=(h*E-d*A+u*w)*O,this}scale(e){const t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),s=Math.sin(t),r=1-n,o=e.x,a=e.y,l=e.z,c=r*o,h=r*a;return this.set(c*o+n,c*a-s*l,c*l+s*a,0,c*a+s*l,h*a+n,h*l-s*o,0,c*l-s*a,h*l+s*o,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,o){return this.set(1,n,r,0,e,1,o,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){const s=this.elements,r=t._x,o=t._y,a=t._z,l=t._w,c=r+r,h=o+o,d=a+a,u=r*c,f=r*h,g=r*d,M=o*h,m=o*d,p=a*d,w=l*c,A=l*h,S=l*d,E=n.x,T=n.y,R=n.z;return s[0]=(1-(M+p))*E,s[1]=(f+S)*E,s[2]=(g-A)*E,s[3]=0,s[4]=(f-S)*T,s[5]=(1-(u+p))*T,s[6]=(m+w)*T,s[7]=0,s[8]=(g+A)*R,s[9]=(m-w)*R,s[10]=(1-(u+M))*R,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){const s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];const r=this.determinantAffine();if(r===0)return n.set(1,1,1),t.identity(),this;let o=ai.set(s[0],s[1],s[2]).length();const a=ai.set(s[4],s[5],s[6]).length(),l=ai.set(s[8],s[9],s[10]).length();r<0&&(o=-o),Yt.copy(this);const c=1/o,h=1/a,d=1/l;return Yt.elements[0]*=c,Yt.elements[1]*=c,Yt.elements[2]*=c,Yt.elements[4]*=h,Yt.elements[5]*=h,Yt.elements[6]*=h,Yt.elements[8]*=d,Yt.elements[9]*=d,Yt.elements[10]*=d,t.setFromRotationMatrix(Yt),n.x=o,n.y=a,n.z=l,this}makePerspective(e,t,n,s,r,o,a=ln,l=!1){const c=this.elements,h=2*r/(t-e),d=2*r/(n-s),u=(t+e)/(t-e),f=(n+s)/(n-s);let g,M;if(l)g=r/(o-r),M=o*r/(o-r);else if(a===ln)g=-(o+r)/(o-r),M=-2*o*r/(o-r);else if(a===cs)g=-o/(o-r),M=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=u,c[12]=0,c[1]=0,c[5]=d,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=M,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,s,r,o,a=ln,l=!1){const c=this.elements,h=2/(t-e),d=2/(n-s),u=-(t+e)/(t-e),f=-(n+s)/(n-s);let g,M;if(l)g=1/(o-r),M=o/(o-r);else if(a===ln)g=-2/(o-r),M=-(o+r)/(o-r);else if(a===cs)g=-1/(o-r),M=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=0,c[12]=u,c[1]=0,c[5]=d,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=g,c[14]=M,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}};Mr.prototype.isMatrix4=!0;let tt=Mr;const ai=new D,Yt=new tt,Du=new D(0,0,0),Nu=new D(1,1,1),Cn=new D,vs=new D,Ft=new D,pl=new tt,ml=new Ii;class zn{constructor(e=0,t=0,n=0,s=zn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const s=e.elements,r=s[0],o=s[4],a=s[8],l=s[1],c=s[5],h=s[9],d=s[2],u=s[6],f=s[10];switch(t){case"XYZ":this._y=Math.asin(Je(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(u,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Je(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-d,r),this._z=0);break;case"ZXY":this._x=Math.asin(Je(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-d,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Je(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(u,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(Je(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-d,r)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-Je(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(u,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,f),this._y=0);break;default:Be("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return pl.makeRotationFromQuaternion(e),this.setFromRotationMatrix(pl,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return ml.setFromEuler(this),this.setFromQuaternion(ml,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}zn.DEFAULT_ORDER="XYZ";class Ca{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let Uu=0;const gl=new D,li=new Ii,pn=new tt,Ms=new D,ki=new D,Fu=new D,Ou=new Ii,_l=new D(1,0,0),xl=new D(0,1,0),vl=new D(0,0,1),Ml={type:"added"},Bu={type:"removed"},ci={type:"childadded",child:null},Br={type:"childremoved",child:null};class vt extends ti{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Uu++}),this.uuid=Li(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=vt.DEFAULT_UP.clone();const e=new D,t=new zn,n=new Ii,s=new D(1,1,1);function r(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new tt},normalMatrix:{value:new Ge}}),this.matrix=new tt,this.matrixWorld=new tt,this.matrixAutoUpdate=vt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=vt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Ca,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return li.setFromAxisAngle(e,t),this.quaternion.multiply(li),this}rotateOnWorldAxis(e,t){return li.setFromAxisAngle(e,t),this.quaternion.premultiply(li),this}rotateX(e){return this.rotateOnAxis(_l,e)}rotateY(e){return this.rotateOnAxis(xl,e)}rotateZ(e){return this.rotateOnAxis(vl,e)}translateOnAxis(e,t){return gl.copy(e).applyQuaternion(this.quaternion),this.position.add(gl.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(_l,e)}translateY(e){return this.translateOnAxis(xl,e)}translateZ(e){return this.translateOnAxis(vl,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(pn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Ms.copy(e):Ms.set(e,t,n);const s=this.parent;this.updateWorldMatrix(!0,!1),ki.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?pn.lookAt(ki,Ms,this.up):pn.lookAt(Ms,ki,this.up),this.quaternion.setFromRotationMatrix(pn),s&&(pn.extractRotation(s.matrixWorld),li.setFromRotationMatrix(pn),this.quaternion.premultiply(li.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(Qe("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Ml),ci.child=e,this.dispatchEvent(ci),ci.child=null):Qe("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Bu),Br.child=e,this.dispatchEvent(Br),Br.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),pn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),pn.multiply(e.parent.matrixWorld)),e.applyMatrix4(pn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Ml),ci.child=e,this.dispatchEvent(ci),ci.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){const o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ki,e,Fu),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ki,Ou,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(e){e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);const e=this.pivot;if(e!==null){const t=e.x,n=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*n-r[8]*s,r[13]+=n-r[1]*t-r[5]*n-r[9]*s,r[14]+=s-r[2]*t-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){const s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){const r=this.children;for(let o=0,a=r.length;o<a;o++)r[o].updateWorldMatrix(!1,!0,n)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(a=>({...a})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const d=l[c];r(e.shapes,d)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(e.materials,this.material[l]));s.material=a}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];s.animations.push(r(e.animations,l))}}if(t){const a=o(e.geometries),l=o(e.materials),c=o(e.textures),h=o(e.images),d=o(e.shapes),u=o(e.skeletons),f=o(e.animations),g=o(e.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),d.length>0&&(n.shapes=d),u.length>0&&(n.skeletons=u),f.length>0&&(n.animations=f),g.length>0&&(n.nodes=g)}return n.object=s,n;function o(a){const l=[];for(const c in a){const h=a[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const s=e.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}}vt.DEFAULT_UP=new D(0,1,0);vt.DEFAULT_MATRIX_AUTO_UPDATE=!0;vt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class Qt extends vt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const ku={type:"move"};class kr{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Qt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Qt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new D,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new D),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Qt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new D,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new D,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,o=null;const a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(const M of e.hand.values()){const m=t.getJointPose(M,n),p=this._getHandJoint(c,M);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}const h=c.joints["index-finger-tip"],d=c.joints["thumb-tip"],u=h.position.distanceTo(d.position),f=.02,g=.005;c.inputState.pinching&&u>f+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&u<=f-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));a!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(ku)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new Qt;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}const Qc={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Pn={h:0,s:0,l:0},Ss={h:0,s:0,l:0};function zr(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}class Ve{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Bt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,$e.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=$e.workingColorSpace){return this.r=e,this.g=t,this.b=n,$e.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=$e.workingColorSpace){if(e=bu(e,1),t=Je(t,0,1),n=Je(n,0,1),t===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+t):n+t-n*t,o=2*n-r;this.r=zr(o,r,e+1/3),this.g=zr(o,r,e),this.b=zr(o,r,e-1/3)}return $e.colorSpaceToWorking(this,s),this}setStyle(e,t=Bt){function n(r){r!==void 0&&parseFloat(r)<1&&Be("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Be("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);Be("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Bt){const n=Qc[e.toLowerCase()];return n!==void 0?this.setHex(n,t):Be("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=wn(e.r),this.g=wn(e.g),this.b=wn(e.b),this}copyLinearToSRGB(e){return this.r=Ai(e.r),this.g=Ai(e.g),this.b=Ai(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Bt){return $e.workingToColorSpace(Rt.copy(this),e),Math.round(Je(Rt.r*255,0,255))*65536+Math.round(Je(Rt.g*255,0,255))*256+Math.round(Je(Rt.b*255,0,255))}getHexString(e=Bt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=$e.workingColorSpace){$e.workingToColorSpace(Rt.copy(this),t);const n=Rt.r,s=Rt.g,r=Rt.b,o=Math.max(n,s,r),a=Math.min(n,s,r);let l,c;const h=(a+o)/2;if(a===o)l=0,c=0;else{const d=o-a;switch(c=h<=.5?d/(o+a):d/(2-o-a),o){case n:l=(s-r)/d+(s<r?6:0);break;case s:l=(r-n)/d+2;break;case r:l=(n-s)/d+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=$e.workingColorSpace){return $e.workingToColorSpace(Rt.copy(this),t),e.r=Rt.r,e.g=Rt.g,e.b=Rt.b,e}getStyle(e=Bt){$e.workingToColorSpace(Rt.copy(this),e);const t=Rt.r,n=Rt.g,s=Rt.b;return e!==Bt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(Pn),this.setHSL(Pn.h+e,Pn.s+t,Pn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Pn),e.getHSL(Ss);const n=Dr(Pn.h,Ss.h,t),s=Dr(Pn.s,Ss.s,t),r=Dr(Pn.l,Ss.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Rt=new Ve;Ve.NAMES=Qc;class zu extends vt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new zn,this.environmentIntensity=1,this.environmentRotation=new zn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}}const qt=new D,mn=new D,Gr=new D,gn=new D,hi=new D,ui=new D,Sl=new D,Hr=new D,Vr=new D,Wr=new D,Xr=new ft,Yr=new ft,qr=new ft;class Vt{constructor(e=new D,t=new D,n=new D){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),qt.subVectors(e,t),s.cross(qt);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){qt.subVectors(s,t),mn.subVectors(n,t),Gr.subVectors(e,t);const o=qt.dot(qt),a=qt.dot(mn),l=qt.dot(Gr),c=mn.dot(mn),h=mn.dot(Gr),d=o*c-a*a;if(d===0)return r.set(0,0,0),null;const u=1/d,f=(c*l-a*h)*u,g=(o*h-a*l)*u;return r.set(1-f-g,g,f)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,gn)===null?!1:gn.x>=0&&gn.y>=0&&gn.x+gn.y<=1}static getInterpolation(e,t,n,s,r,o,a,l){return this.getBarycoord(e,t,n,s,gn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,gn.x),l.addScaledVector(o,gn.y),l.addScaledVector(a,gn.z),l)}static getInterpolatedAttribute(e,t,n,s,r,o){return Xr.setScalar(0),Yr.setScalar(0),qr.setScalar(0),Xr.fromBufferAttribute(e,t),Yr.fromBufferAttribute(e,n),qr.fromBufferAttribute(e,s),o.setScalar(0),o.addScaledVector(Xr,r.x),o.addScaledVector(Yr,r.y),o.addScaledVector(qr,r.z),o}static isFrontFacing(e,t,n,s){return qt.subVectors(n,t),mn.subVectors(e,t),qt.cross(mn).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return qt.subVectors(this.c,this.b),mn.subVectors(this.a,this.b),qt.cross(mn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return Vt.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return Vt.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return Vt.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return Vt.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return Vt.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,s=this.b,r=this.c;let o,a;hi.subVectors(s,n),ui.subVectors(r,n),Hr.subVectors(e,n);const l=hi.dot(Hr),c=ui.dot(Hr);if(l<=0&&c<=0)return t.copy(n);Vr.subVectors(e,s);const h=hi.dot(Vr),d=ui.dot(Vr);if(h>=0&&d<=h)return t.copy(s);const u=l*d-h*c;if(u<=0&&l>=0&&h<=0)return o=l/(l-h),t.copy(n).addScaledVector(hi,o);Wr.subVectors(e,r);const f=hi.dot(Wr),g=ui.dot(Wr);if(g>=0&&f<=g)return t.copy(r);const M=f*c-l*g;if(M<=0&&c>=0&&g<=0)return a=c/(c-g),t.copy(n).addScaledVector(ui,a);const m=h*g-f*d;if(m<=0&&d-h>=0&&f-g>=0)return Sl.subVectors(r,s),a=(d-h)/(d-h+(f-g)),t.copy(s).addScaledVector(Sl,a);const p=1/(m+M+u);return o=M*p,a=u*p,t.copy(n).addScaledVector(hi,o).addScaledVector(ui,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}class ni{constructor(e=new D(1/0,1/0,1/0),t=new D(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Kt.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Kt.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=Kt.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,Kt):Kt.fromBufferAttribute(r,o),Kt.applyMatrix4(e.matrixWorld),this.expandByPoint(Kt);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),ys.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),ys.copy(n.boundingBox)),ys.applyMatrix4(e.matrixWorld),this.union(ys)}const s=e.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Kt),Kt.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(zi),Es.subVectors(this.max,zi),di.subVectors(e.a,zi),fi.subVectors(e.b,zi),pi.subVectors(e.c,zi),Ln.subVectors(fi,di),In.subVectors(pi,fi),Hn.subVectors(di,pi);let t=[0,-Ln.z,Ln.y,0,-In.z,In.y,0,-Hn.z,Hn.y,Ln.z,0,-Ln.x,In.z,0,-In.x,Hn.z,0,-Hn.x,-Ln.y,Ln.x,0,-In.y,In.x,0,-Hn.y,Hn.x,0];return!Kr(t,di,fi,pi,Es)||(t=[1,0,0,0,1,0,0,0,1],!Kr(t,di,fi,pi,Es))?!1:(ws.crossVectors(Ln,In),t=[ws.x,ws.y,ws.z],Kr(t,di,fi,pi,Es))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Kt).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Kt).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(_n[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),_n[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),_n[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),_n[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),_n[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),_n[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),_n[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),_n[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(_n),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const _n=[new D,new D,new D,new D,new D,new D,new D,new D],Kt=new D,ys=new ni,di=new D,fi=new D,pi=new D,Ln=new D,In=new D,Hn=new D,zi=new D,Es=new D,ws=new D,Vn=new D;function Kr(i,e,t,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){Vn.fromArray(i,r);const a=s.x*Math.abs(Vn.x)+s.y*Math.abs(Vn.y)+s.z*Math.abs(Vn.z),l=e.dot(Vn),c=t.dot(Vn),h=n.dot(Vn);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}const xt=new D,Ts=new me;let Gu=0;class Nt extends ti{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Gu++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Su,this.updateRanges=[],this.gpuType=Zt,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Ts.fromBufferAttribute(this,t),Ts.applyMatrix3(e),this.setXY(t,Ts.x,Ts.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)xt.fromBufferAttribute(this,t),xt.applyMatrix3(e),this.setXYZ(t,xt.x,xt.y,xt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)xt.fromBufferAttribute(this,t),xt.applyMatrix4(e),this.setXYZ(t,xt.x,xt.y,xt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)xt.fromBufferAttribute(this,t),xt.applyNormalMatrix(e),this.setXYZ(t,xt.x,xt.y,xt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)xt.fromBufferAttribute(this,t),xt.transformDirection(e),this.setXYZ(t,xt.x,xt.y,xt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Bi(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Dt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Bi(t,this.array)),t}setX(e,t){return this.normalized&&(t=Dt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Bi(t,this.array)),t}setY(e,t){return this.normalized&&(t=Dt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Bi(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Dt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Bi(t,this.array)),t}setW(e,t){return this.normalized&&(t=Dt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Dt(t,this.array),n=Dt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=Dt(t,this.array),n=Dt(n,this.array),s=Dt(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=Dt(t,this.array),n=Dt(n,this.array),s=Dt(s,this.array),r=Dt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}}class jc extends Nt{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class eh extends Nt{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class dt extends Nt{constructor(e,t,n){super(new Float32Array(e),t,n)}}const Hu=new ni,Gi=new D,Jr=new D;class Di{constructor(e=new D,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):Hu.setFromPoints(e).getCenter(n);let s=0;for(let r=0,o=e.length;r<o;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Gi.subVectors(e,this.center);const t=Gi.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(Gi,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Jr.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Gi.copy(e.center).add(Jr)),this.expandByPoint(Gi.copy(e.center).sub(Jr))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}let Vu=0;const Gt=new tt,Zr=new vt,mi=new D,Ot=new ni,Hi=new ni,yt=new D;class wt extends ti{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Vu++}),this.uuid=Li(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(yu(e)?eh:jc)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new Ge().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return Gt.makeRotationFromQuaternion(e),this.applyMatrix4(Gt),this}rotateX(e){return Gt.makeRotationX(e),this.applyMatrix4(Gt),this}rotateY(e){return Gt.makeRotationY(e),this.applyMatrix4(Gt),this}rotateZ(e){return Gt.makeRotationZ(e),this.applyMatrix4(Gt),this}translate(e,t,n){return Gt.makeTranslation(e,t,n),this.applyMatrix4(Gt),this}scale(e,t,n){return Gt.makeScale(e,t,n),this.applyMatrix4(Gt),this}lookAt(e){return Zr.lookAt(e),Zr.updateMatrix(),this.applyMatrix4(Zr.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(mi).negate(),this.translate(mi.x,mi.y,mi.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let s=0,r=e.length;s<r;s++){const o=e[s];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new dt(n,3))}else{const n=Math.min(e.length,t.count);for(let s=0;s<n;s++){const r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&Be("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new ni);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Qe("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new D(-1/0,-1/0,-1/0),new D(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){const r=t[n];Ot.setFromBufferAttribute(r),this.morphTargetsRelative?(yt.addVectors(this.boundingBox.min,Ot.min),this.boundingBox.expandByPoint(yt),yt.addVectors(this.boundingBox.max,Ot.max),this.boundingBox.expandByPoint(yt)):(this.boundingBox.expandByPoint(Ot.min),this.boundingBox.expandByPoint(Ot.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Qe('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Di);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Qe("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new D,1/0);return}if(e){const n=this.boundingSphere.center;if(Ot.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){const a=t[r];Hi.setFromBufferAttribute(a),this.morphTargetsRelative?(yt.addVectors(Ot.min,Hi.min),Ot.expandByPoint(yt),yt.addVectors(Ot.max,Hi.max),Ot.expandByPoint(yt)):(Ot.expandByPoint(Hi.min),Ot.expandByPoint(Hi.max))}Ot.getCenter(n);let s=0;for(let r=0,o=e.count;r<o;r++)yt.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(yt));if(t)for(let r=0,o=t.length;r<o;r++){const a=t[r],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)yt.fromBufferAttribute(a,c),l&&(mi.fromBufferAttribute(e,c),yt.add(mi)),s=Math.max(s,n.distanceToSquared(yt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Qe('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){Qe("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,s=t.normal,r=t.uv;let o=this.getAttribute("tangent");(o===void 0||o.count!==n.count)&&(o=new Nt(new Float32Array(4*n.count),4),this.setAttribute("tangent",o));const a=[],l=[];for(let x=0;x<n.count;x++)a[x]=new D,l[x]=new D;const c=new D,h=new D,d=new D,u=new me,f=new me,g=new me,M=new D,m=new D;function p(x,b,P){c.fromBufferAttribute(n,x),h.fromBufferAttribute(n,b),d.fromBufferAttribute(n,P),u.fromBufferAttribute(r,x),f.fromBufferAttribute(r,b),g.fromBufferAttribute(r,P),h.sub(c),d.sub(c),f.sub(u),g.sub(u);const N=1/(f.x*g.y-g.x*f.y);isFinite(N)&&(M.copy(h).multiplyScalar(g.y).addScaledVector(d,-f.y).multiplyScalar(N),m.copy(d).multiplyScalar(f.x).addScaledVector(h,-g.x).multiplyScalar(N),a[x].add(M),a[b].add(M),a[P].add(M),l[x].add(m),l[b].add(m),l[P].add(m))}let w=this.groups;w.length===0&&(w=[{start:0,count:e.count}]);for(let x=0,b=w.length;x<b;++x){const P=w[x],N=P.start,z=P.count;for(let V=N,U=N+z;V<U;V+=3)p(e.getX(V+0),e.getX(V+1),e.getX(V+2))}const A=new D,S=new D,E=new D,T=new D;function R(x){E.fromBufferAttribute(s,x),T.copy(E);const b=a[x];A.copy(b),A.sub(E.multiplyScalar(E.dot(b))).normalize(),S.crossVectors(T,b);const N=S.dot(l[x])<0?-1:1;o.setXYZW(x,A.x,A.y,A.z,N)}for(let x=0,b=w.length;x<b;++x){const P=w[x],N=P.start,z=P.count;for(let V=N,U=N+z;V<U;V+=3)R(e.getX(V+0)),R(e.getX(V+1)),R(e.getX(V+2))}this._transformed=!0}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new Nt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let u=0,f=n.count;u<f;u++)n.setXYZ(u,0,0,0);const s=new D,r=new D,o=new D,a=new D,l=new D,c=new D,h=new D,d=new D;if(e)for(let u=0,f=e.count;u<f;u+=3){const g=e.getX(u+0),M=e.getX(u+1),m=e.getX(u+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,M),o.fromBufferAttribute(t,m),h.subVectors(o,r),d.subVectors(s,r),h.cross(d),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,M),c.fromBufferAttribute(n,m),a.add(h),l.add(h),c.add(h),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(M,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let u=0,f=t.count;u<f;u+=3)s.fromBufferAttribute(t,u+0),r.fromBufferAttribute(t,u+1),o.fromBufferAttribute(t,u+2),h.subVectors(o,r),d.subVectors(s,r),h.cross(d),n.setXYZ(u+0,h.x,h.y,h.z),n.setXYZ(u+1,h.x,h.y,h.z),n.setXYZ(u+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)yt.fromBufferAttribute(e,t),yt.normalize(),e.setXYZ(t,yt.x,yt.y,yt.z)}toNonIndexed(){function e(a,l){const c=a.array,h=a.itemSize,d=a.normalized,u=new c.constructor(l.length*h);let f=0,g=0;for(let M=0,m=l.length;M<m;M++){a.isInterleavedBufferAttribute?f=l[M]*a.data.stride+a.offset:f=l[M]*h;for(let p=0;p<h;p++)u[g++]=c[f++]}return new Nt(u,h,d)}if(this.index===null)return Be("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new wt,n=this.index.array,s=this.attributes;for(const a in s){const l=s[a],c=e(l,n);t.setAttribute(a,c)}const r=this.morphAttributes;for(const a in r){const l=[],c=r[a];for(let h=0,d=c.length;h<d;h++){const u=c[h],f=e(u,n);l.push(f)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const l in n){const c=n[l];e.data.attributes[l]=c.toJSON(e.data)}const s={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let d=0,u=c.length;d<u;d++){const f=c[d];h.push(f.toJSON(e.data))}h.length>0&&(s[l]=h,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone());const s=e.attributes;for(const c in s){const h=s[c];this.setAttribute(c,h.clone(t))}const r=e.morphAttributes;for(const c in r){const h=[],d=r[c];for(let u=0,f=d.length;u<f;u++)h.push(d[u].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let c=0,h=o.length;c<h;c++){const d=o[c];this.addGroup(d.start,d.count,d.materialIndex)}const a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}}const $r=new D,Wu=new D,Xu=new Ge;class Mn{constructor(e=new D(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const s=$r.subVectors(n,t).cross(Wu.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){const s=e.delta($r),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const o=-(e.start.dot(this.normal)+this.constant)/r;return n===!0&&(o<0||o>1)?null:t.copy(e.start).addScaledVector(s,o)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||Xu.getNormalMatrix(e),s=this.coplanarPoint($r).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}}let Yu=0;class Ni extends ti{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Yu++}),this.uuid=Li(),this.name="",this.type="Material",this.blending=ts,this.side=Zn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Nc,this.blendDst=Uc,this.blendEquation=Si,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ve(0,0,0),this.blendAlpha=0,this.depthFunc=os,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=pu,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ir,this.stencilZFail=Ir,this.stencilZPass=Ir,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){Be(`Material: parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){Be(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){const o=[];for(const a in r){const l=r[a];delete l.metadata,o.push(l)}return o}if(t){const r=s(e.textures),o=s(e.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Ve().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(n=>new Mn().fromJSON(n))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new me().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new me().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}const xn=new D,Qr=new D,bs=new D,As=new D;class Pa{constructor(e=new D,t=new D(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,xn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=xn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(xn.copy(this.origin).addScaledVector(this.direction,t),xn.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){Qr.copy(e).add(t).multiplyScalar(.5),bs.copy(t).sub(e).normalize(),As.copy(this.origin).sub(Qr);const r=e.distanceTo(t)*.5,o=-this.direction.dot(bs),a=As.dot(this.direction),l=-As.dot(bs),c=As.lengthSq(),h=Math.abs(1-o*o);let d,u,f,g;if(h>0)if(d=o*l-a,u=o*a-l,g=r*h,d>=0)if(u>=-g)if(u<=g){const M=1/h;d*=M,u*=M,f=d*(d+o*u+2*a)+u*(o*d+u+2*l)+c}else u=r,d=Math.max(0,-(o*u+a)),f=-d*d+u*(u+2*l)+c;else u=-r,d=Math.max(0,-(o*u+a)),f=-d*d+u*(u+2*l)+c;else u<=-g?(d=Math.max(0,-(-o*r+a)),u=d>0?-r:Math.min(Math.max(-r,-l),r),f=-d*d+u*(u+2*l)+c):u<=g?(d=0,u=Math.min(Math.max(-r,-l),r),f=u*(u+2*l)+c):(d=Math.max(0,-(o*r+a)),u=d>0?r:Math.min(Math.max(-r,-l),r),f=-d*d+u*(u+2*l)+c);else u=o>0?-r:r,d=Math.max(0,-(o*u+a)),f=-d*d+u*(u+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,d),s&&s.copy(Qr).addScaledVector(bs,u),f}intersectSphere(e,t){if(e.radius<0)return null;xn.subVectors(e.center,this.origin);const n=xn.dot(this.direction),s=xn.dot(xn)-n*n,r=e.radius*e.radius;if(s>r)return null;const o=Math.sqrt(r-s),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,o,a,l;const c=1/this.direction.x,h=1/this.direction.y,d=1/this.direction.z,u=this.origin;return c>=0?(n=(e.min.x-u.x)*c,s=(e.max.x-u.x)*c):(n=(e.max.x-u.x)*c,s=(e.min.x-u.x)*c),h>=0?(r=(e.min.y-u.y)*h,o=(e.max.y-u.y)*h):(r=(e.max.y-u.y)*h,o=(e.min.y-u.y)*h),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),d>=0?(a=(e.min.z-u.z)*d,l=(e.max.z-u.z)*d):(a=(e.max.z-u.z)*d,l=(e.min.z-u.z)*d),n>l||a>s)||((a>n||n!==n)&&(n=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,xn)!==null}intersectTriangle(e,t,n,s,r){const o=this.origin,a=this.direction,l=a.x,c=a.y,h=a.z,d=e.x-o.x,u=e.y-o.y,f=e.z-o.z,g=t.x-o.x,M=t.y-o.y,m=t.z-o.z,p=n.x-o.x,w=n.y-o.y,A=n.z-o.z,S=Math.abs(l),E=Math.abs(c),T=Math.abs(h);let R,x,b,P,N,z,V,U,O,J,H,ie;if(S>=E&&S>=T?(b=l,z=d,O=g,ie=p,l>=0?(R=c,x=h,P=u,N=f,V=M,U=m,J=w,H=A):(R=h,x=c,P=f,N=u,V=m,U=M,J=A,H=w)):E>=T?(b=c,z=u,O=M,ie=w,c>=0?(R=h,x=l,P=f,N=d,V=m,U=g,J=A,H=p):(R=l,x=h,P=d,N=f,V=g,U=m,J=p,H=A)):(b=h,z=f,O=m,ie=A,h>=0?(R=l,x=c,P=d,N=u,V=g,U=M,J=p,H=w):(R=c,x=l,P=u,N=d,V=M,U=g,J=w,H=p)),b===0)return null;const X=R/b,$=x/b,ee=1/b,Ae=P-X*z,ye=N-$*z,je=V-X*O,We=U-$*O,Ze=J-X*ie,q=H-$*ie,Q=Ze*We-q*je,le=Ae*q-ye*Ze,Ne=je*ye-We*Ae;if(s){if(Q<0||le<0||Ne<0)return null}else if((Q<0||le<0||Ne<0)&&(Q>0||le>0||Ne>0))return null;const Me=Q+le+Ne;if(Me===0)return null;const Ue=ee*(Q*z+le*O+Ne*ie);return(Me>0?Ue<0:Ue>0)?null:this.at(Ue/Me,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Ui extends Ni{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ve(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new zn,this.combine=Fc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const yl=new tt,Wn=new Pa,Rs=new Di,El=new D,Cs=new D,Ps=new D,Ls=new D,jr=new D,Is=new D,wl=new D,Ds=new D;class gt extends vt{constructor(e=new wt,t=new Ui){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){const n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(s,e);const a=this.morphTargetInfluences;if(r&&a){Is.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const h=a[l],d=r[l];h!==0&&(jr.fromBufferAttribute(d,e),o?Is.addScaledVector(jr,h):Is.addScaledVector(jr.sub(t),h))}t.add(Is)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){const n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Rs.copy(n.boundingSphere),Rs.applyMatrix4(r),Wn.copy(e.ray).recast(e.near),!(Rs.containsPoint(Wn.origin)===!1&&(Wn.intersectSphere(Rs,El)===null||Wn.origin.distanceToSquared(El)>(e.far-e.near)**2))&&(yl.copy(r).invert(),Wn.copy(e.ray).applyMatrix4(yl),!(n.boundingBox!==null&&Wn.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Wn)))}_computeIntersections(e,t,n){let s;const r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,d=r.attributes.normal,u=r.groups,f=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,M=u.length;g<M;g++){const m=u[g],p=o[m.materialIndex],w=Math.max(m.start,f.start),A=Math.min(a.count,Math.min(m.start+m.count,f.start+f.count));for(let S=w,E=A;S<E;S+=3){const T=a.getX(S),R=a.getX(S+1),x=a.getX(S+2);s=Ns(this,p,e,n,c,h,d,T,R,x),s&&(s.faceIndex=Math.floor(S/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const g=Math.max(0,f.start),M=Math.min(a.count,f.start+f.count);for(let m=g,p=M;m<p;m+=3){const w=a.getX(m),A=a.getX(m+1),S=a.getX(m+2);s=Ns(this,o,e,n,c,h,d,w,A,S),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,M=u.length;g<M;g++){const m=u[g],p=o[m.materialIndex],w=Math.max(m.start,f.start),A=Math.min(l.count,Math.min(m.start+m.count,f.start+f.count));for(let S=w,E=A;S<E;S+=3){const T=S,R=S+1,x=S+2;s=Ns(this,p,e,n,c,h,d,T,R,x),s&&(s.faceIndex=Math.floor(S/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const g=Math.max(0,f.start),M=Math.min(l.count,f.start+f.count);for(let m=g,p=M;m<p;m+=3){const w=m,A=m+1,S=m+2;s=Ns(this,o,e,n,c,h,d,w,A,S),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}}function qu(i,e,t,n,s,r,o,a){let l;if(e.side===Ut?l=n.intersectTriangle(o,r,s,!0,a):l=n.intersectTriangle(s,r,o,e.side===Zn,a),l===null)return null;Ds.copy(a),Ds.applyMatrix4(i.matrixWorld);const c=t.ray.origin.distanceTo(Ds);return c<t.near||c>t.far?null:{distance:c,point:Ds.clone(),object:i}}function Ns(i,e,t,n,s,r,o,a,l,c){i.getVertexPosition(a,Cs),i.getVertexPosition(l,Ps),i.getVertexPosition(c,Ls);const h=qu(i,e,t,n,Cs,Ps,Ls,wl);if(h){const d=new D;Vt.getBarycoord(wl,Cs,Ps,Ls,d),s&&(h.uv=Vt.getInterpolatedAttribute(s,a,l,c,d,new me)),r&&(h.uv1=Vt.getInterpolatedAttribute(r,a,l,c,d,new me)),o&&(h.normal=Vt.getInterpolatedAttribute(o,a,l,c,d,new D),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));const u={a,b:l,c,normal:new D,materialIndex:0};Vt.getNormal(Cs,Ps,Ls,u.normal),h.face=u,h.barycoord=d}return h}class La extends It{constructor(e=null,t=1,n=1,s,r,o,a,l,c=Tt,h=Tt,d,u){super(null,o,a,l,c,h,s,r,d,u),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Tl extends Nt{constructor(e,t,n,s=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const gi=new tt,bl=new tt,Us=[],Al=new ni,Ku=new tt,Vi=new gt,Wi=new Di;class pr extends gt{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Tl(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,Ku)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new ni),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,gi),Al.copy(e.boundingBox).applyMatrix4(gi),this.boundingBox.union(Al)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Di),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,gi),Wi.copy(e.boundingSphere).applyMatrix4(gi),this.boundingSphere.union(Wi)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const n=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,o=e*r+1;for(let a=0;a<n.length;a++)n[a]=s[o+a]}raycast(e,t){const n=this.matrixWorld,s=this.count;if(Vi.geometry=this.geometry,Vi.material=this.material,Vi.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Wi.copy(this.boundingSphere),Wi.applyMatrix4(n),e.ray.intersectsSphere(Wi)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,gi),bl.multiplyMatrices(n,gi),Vi.matrixWorld=bl,Vi.raycast(e,Us);for(let o=0,a=Us.length;o<a;o++){const l=Us[o];l.instanceId=r,l.object=this,t.push(l)}Us.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new Tl(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){const n=t.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new La(new Float32Array(s*this.count),s,this.count,ya,Zt));const r=this.morphTexture.source.data.data;let o=0;for(let c=0;c<n.length;c++)o+=n[c];const a=this.geometry.morphTargetsRelative?1:1-o,l=s*e;return r[l]=a,r.set(n,l+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}}const Xn=new Di,Ju=new me(.5,.5),Fs=new D;class Ia{constructor(e=new Mn,t=new Mn,n=new Mn,s=new Mn,r=new Mn,o=new Mn){this.planes=[e,t,n,s,r,o]}set(e,t,n,s,r,o){const a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=ln,n=!1){const s=this.planes,r=e.elements,o=r[0],a=r[1],l=r[2],c=r[3],h=r[4],d=r[5],u=r[6],f=r[7],g=r[8],M=r[9],m=r[10],p=r[11],w=r[12],A=r[13],S=r[14],E=r[15];if(s[0].setComponents(c-o,f-h,p-g,E-w).normalize(),s[1].setComponents(c+o,f+h,p+g,E+w).normalize(),s[2].setComponents(c+a,f+d,p+M,E+A).normalize(),s[3].setComponents(c-a,f-d,p-M,E-A).normalize(),n)s[4].setComponents(l,u,m,S).normalize(),s[5].setComponents(c-l,f-u,p-m,E-S).normalize();else if(s[4].setComponents(c-l,f-u,p-m,E-S).normalize(),t===ln)s[5].setComponents(c+l,f+u,p+m,E+S).normalize();else if(t===cs)s[5].setComponents(l,u,m,S).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Xn.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Xn.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Xn)}intersectsSprite(e){Xn.center.set(0,0,0);const t=Ju.distanceTo(e.center);return Xn.radius=.7071067811865476+t,Xn.applyMatrix4(e.matrixWorld),this.intersectsSphere(Xn)}intersectsSphere(e){const t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const s=t[n];if(Fs.x=s.normal.x>0?e.max.x:e.min.x,Fs.y=s.normal.y>0?e.max.y:e.min.y,Fs.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Fs)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class th extends Ni{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ve(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const mr=new D,gr=new D,Rl=new tt,Xi=new Pa,Os=new Di,eo=new D,Cl=new D;class Zu extends vt{constructor(e=new wt,t=new th){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let s=1,r=t.count;s<r;s++)mr.fromBufferAttribute(t,s-1),gr.fromBufferAttribute(t,s),n[s]=n[s-1],n[s]+=mr.distanceTo(gr);e.setAttribute("lineDistance",new dt(n,1))}else Be("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){const n=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Os.copy(n.boundingSphere),Os.applyMatrix4(s),Os.radius+=r,e.ray.intersectsSphere(Os)===!1)return;Rl.copy(s).invert(),Xi.copy(e.ray).applyMatrix4(Rl);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=this.isLineSegments?2:1,h=n.index,u=n.attributes.position;if(h!==null){const f=Math.max(0,o.start),g=Math.min(h.count,o.start+o.count);for(let M=f,m=g-1;M<m;M+=c){const p=h.getX(M),w=h.getX(M+1),A=Bs(this,e,Xi,l,p,w,M);A&&t.push(A)}if(this.isLineLoop){const M=h.getX(g-1),m=h.getX(f),p=Bs(this,e,Xi,l,M,m,g-1);p&&t.push(p)}}else{const f=Math.max(0,o.start),g=Math.min(u.count,o.start+o.count);for(let M=f,m=g-1;M<m;M+=c){const p=Bs(this,e,Xi,l,M,M+1,M);p&&t.push(p)}if(this.isLineLoop){const M=Bs(this,e,Xi,l,g-1,f,g-1);M&&t.push(M)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function Bs(i,e,t,n,s,r,o){const a=i.geometry.attributes.position;if(mr.fromBufferAttribute(a,s),gr.fromBufferAttribute(a,r),t.distanceSqToSegment(mr,gr,eo,Cl)>n)return;eo.applyMatrix4(i.matrixWorld);const c=e.ray.origin.distanceTo(eo);if(!(c<e.near||c>e.far))return{distance:c,point:Cl.clone().applyMatrix4(i.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:i}}const Pl=new D,Ll=new D;class Il extends Zu{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[];for(let s=0,r=t.count;s<r;s+=2)Pl.fromBufferAttribute(t,s),Ll.fromBufferAttribute(t,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+Pl.distanceTo(Ll);e.setAttribute("lineDistance",new dt(n,1))}else Be("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class nh extends It{constructor(e=[],t=$n,n,s,r,o,a,l,c,h){super(e,t,n,s,r,o,a,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class hs extends It{constructor(e,t,n=hn,s,r,o,a=Tt,l=Tt,c,h=Tn,d=1){if(h!==Tn&&h!==Kn)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const u={width:e,height:t,depth:d};super(u,s,r,o,a,l,h,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Ra(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}}class $u extends hs{constructor(e,t=hn,n=$n,s,r,o=Tt,a=Tt,l,c=Tn){const h={width:e,height:e,depth:1},d=[h,h,h,h,h,h];super(e,e,t,n,s,r,o,a,l,c),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}}class ih extends It{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class Fi extends wt{constructor(e=1,t=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};const a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);const l=[],c=[],h=[],d=[];let u=0,f=0;g("z","y","x",-1,-1,n,t,e,o,r,0),g("z","y","x",1,-1,n,t,-e,o,r,1),g("x","z","y",1,1,e,n,t,s,o,2),g("x","z","y",1,-1,e,n,-t,s,o,3),g("x","y","z",1,-1,e,t,n,s,r,4),g("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new dt(c,3)),this.setAttribute("normal",new dt(h,3)),this.setAttribute("uv",new dt(d,2));function g(M,m,p,w,A,S,E,T,R,x,b){const P=S/R,N=E/x,z=S/2,V=E/2,U=T/2,O=R+1,J=x+1;let H=0,ie=0;const X=new D;for(let $=0;$<J;$++){const ee=$*N-V;for(let Ae=0;Ae<O;Ae++){const ye=Ae*P-z;X[M]=ye*w,X[m]=ee*A,X[p]=U,c.push(X.x,X.y,X.z),X[M]=0,X[m]=0,X[p]=T>0?1:-1,h.push(X.x,X.y,X.z),d.push(Ae/R),d.push(1-$/x),H+=1}}for(let $=0;$<x;$++)for(let ee=0;ee<R;ee++){const Ae=u+ee+O*$,ye=u+ee+O*($+1),je=u+(ee+1)+O*($+1),We=u+(ee+1)+O*$;l.push(Ae,ye,We),l.push(ye,je,We),ie+=6}a.addGroup(f,ie,b),f+=ie,u+=H}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Fi(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}const ks=new D,zs=new D,to=new D,Gs=new Vt;class Qu extends wt{constructor(e=null,t=1){if(super(),this.type="EdgesGeometry",this.parameters={geometry:e,thresholdAngle:t},e!==null){const s=Math.pow(10,4),r=Math.cos(or*t),o=e.getIndex(),a=e.getAttribute("position"),l=o?o.count:a.count,c=[0,0,0],h=["a","b","c"],d=new Array(3),u={},f=[];for(let g=0;g<l;g+=3){o?(c[0]=o.getX(g),c[1]=o.getX(g+1),c[2]=o.getX(g+2)):(c[0]=g,c[1]=g+1,c[2]=g+2);const{a:M,b:m,c:p}=Gs;if(M.fromBufferAttribute(a,c[0]),m.fromBufferAttribute(a,c[1]),p.fromBufferAttribute(a,c[2]),Gs.getNormal(to),d[0]=`${Math.round(M.x*s)},${Math.round(M.y*s)},${Math.round(M.z*s)}`,d[1]=`${Math.round(m.x*s)},${Math.round(m.y*s)},${Math.round(m.z*s)}`,d[2]=`${Math.round(p.x*s)},${Math.round(p.y*s)},${Math.round(p.z*s)}`,!(d[0]===d[1]||d[1]===d[2]||d[2]===d[0]))for(let w=0;w<3;w++){const A=(w+1)%3,S=d[w],E=d[A],T=Gs[h[w]],R=Gs[h[A]],x=`${S}_${E}`,b=`${E}_${S}`;b in u&&u[b]?(to.dot(u[b].normal)<=r&&(f.push(T.x,T.y,T.z),f.push(R.x,R.y,R.z)),u[b]=null):x in u||(u[x]={index0:c[w],index1:c[A],normal:to.clone()})}}for(const g in u)if(u[g]){const{index0:M,index1:m}=u[g];ks.fromBufferAttribute(a,M),zs.fromBufferAttribute(a,m),f.push(ks.x,ks.y,ks.z),f.push(zs.x,zs.y,zs.z)}this.setAttribute("position",new dt(f,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}}class fn{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){Be("Curve: .getPoint() not implemented.")}getPointAt(e,t){const n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){const e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const t=[];let n,s=this.getPoint(0),r=0;t.push(0);for(let o=1;o<=e;o++)n=this.getPoint(o/e),r+=n.distanceTo(s),t.push(r),s=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){const n=this.getLengths();let s=0;const r=n.length;let o;t?o=t:o=e*n[r-1];let a=0,l=r-1,c;for(;a<=l;)if(s=Math.floor(a+(l-a)/2),c=n[s]-o,c<0)a=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,n[s]===o)return s/(r-1);const h=n[s],u=n[s+1]-h,f=(o-h)/u;return(s+f)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);const o=this.getPoint(s),a=this.getPoint(r),l=t||(o.isVector2?new me:new D);return l.copy(a).sub(o).normalize(),l}getTangentAt(e,t){const n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){const n=new D,s=[],r=[],o=[],a=new D,l=new tt;for(let f=0;f<=e;f++){const g=f/e;s[f]=this.getTangentAt(g,new D)}r[0]=new D,o[0]=new D;let c=Number.MAX_VALUE;const h=Math.abs(s[0].x),d=Math.abs(s[0].y),u=Math.abs(s[0].z);h<=c&&(c=h,n.set(1,0,0)),d<=c&&(c=d,n.set(0,1,0)),u<=c&&n.set(0,0,1),a.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],a),o[0].crossVectors(s[0],r[0]);for(let f=1;f<=e;f++){if(r[f]=r[f-1].clone(),o[f]=o[f-1].clone(),a.crossVectors(s[f-1],s[f]),a.length()>Number.EPSILON){a.normalize();const g=Math.acos(Je(s[f-1].dot(s[f]),-1,1));r[f].applyMatrix4(l.makeRotationAxis(a,g))}o[f].crossVectors(s[f],r[f])}if(t===!0){let f=Math.acos(Je(r[0].dot(r[e]),-1,1));f/=e,s[0].dot(a.crossVectors(r[0],r[e]))>0&&(f=-f);for(let g=1;g<=e;g++)r[g].applyMatrix4(l.makeRotationAxis(s[g],f*g)),o[g].crossVectors(s[g],r[g])}return{tangents:s,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){const e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}}class Da extends fn{constructor(e=0,t=0,n=1,s=1,r=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(e,t=new me){const n=t,s=Math.PI*2;let r=this.aEndAngle-this.aStartAngle;const o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(o?r=0:r=s),this.aClockwise===!0&&!o&&(r===s?r=-s:r=r-s);const a=this.aStartAngle+e*r;let l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){const h=Math.cos(this.aRotation),d=Math.sin(this.aRotation),u=l-this.aX,f=c-this.aY;l=u*h-f*d+this.aX,c=u*d+f*h+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){const e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}}class ju extends Da{constructor(e,t,n,s,r,o){super(e,t,n,n,s,r,o),this.isArcCurve=!0,this.type="ArcCurve"}}function Na(){let i=0,e=0,t=0,n=0;function s(r,o,a,l){i=r,e=a,t=-3*r+3*o-2*a-l,n=2*r-2*o+a+l}return{initCatmullRom:function(r,o,a,l,c){s(o,a,c*(a-r),c*(l-o))},initNonuniformCatmullRom:function(r,o,a,l,c,h,d){let u=(o-r)/c-(a-r)/(c+h)+(a-o)/h,f=(a-o)/h-(l-o)/(h+d)+(l-a)/d;u*=h,f*=h,s(o,a,u,f)},calc:function(r){const o=r*r,a=o*r;return i+e*r+t*o+n*a}}}const Dl=new D,Nl=new D,no=new Na,io=new Na,so=new Na;class ed extends fn{constructor(e=[],t=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=s}getPoint(e,t=new D){const n=t,s=this.points,r=s.length,o=(r-(this.closed?0:1))*e;let a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:l===0&&a===r-1&&(a=r-2,l=1);let c,h;this.closed||a>0?c=s[(a-1)%r]:(Nl.subVectors(s[0],s[1]).add(s[0]),c=Nl);const d=s[a%r],u=s[(a+1)%r];if(this.closed||a+2<r?h=s[(a+2)%r]:(Dl.subVectors(s[r-1],s[r-2]).add(s[r-1]),h=Dl),this.curveType==="centripetal"||this.curveType==="chordal"){const f=this.curveType==="chordal"?.5:.25;let g=Math.pow(c.distanceToSquared(d),f),M=Math.pow(d.distanceToSquared(u),f),m=Math.pow(u.distanceToSquared(h),f);M<1e-4&&(M=1),g<1e-4&&(g=M),m<1e-4&&(m=M),no.initNonuniformCatmullRom(c.x,d.x,u.x,h.x,g,M,m),io.initNonuniformCatmullRom(c.y,d.y,u.y,h.y,g,M,m),so.initNonuniformCatmullRom(c.z,d.z,u.z,h.z,g,M,m)}else this.curveType==="catmullrom"&&(no.initCatmullRom(c.x,d.x,u.x,h.x,this.tension),io.initCatmullRom(c.y,d.y,u.y,h.y,this.tension),so.initCatmullRom(c.z,d.z,u.z,h.z,this.tension));return n.set(no.calc(l),io.calc(l),so.calc(l)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const s=e.points[t];this.points.push(new D().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}}function Ul(i,e,t,n,s){const r=(n-e)*.5,o=(s-t)*.5,a=i*i,l=i*a;return(2*t-2*n+r+o)*l+(-3*t+3*n-2*r-o)*a+r*i+t}function td(i,e){const t=1-i;return t*t*e}function nd(i,e){return 2*(1-i)*i*e}function id(i,e){return i*i*e}function ns(i,e,t,n){return td(i,e)+nd(i,t)+id(i,n)}function sd(i,e){const t=1-i;return t*t*t*e}function rd(i,e){const t=1-i;return 3*t*t*i*e}function od(i,e){return 3*(1-i)*i*i*e}function ad(i,e){return i*i*i*e}function is(i,e,t,n,s){return sd(i,e)+rd(i,t)+od(i,n)+ad(i,s)}class sh extends fn{constructor(e=new me,t=new me,n=new me,s=new me){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new me){const n=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(is(e,s.x,r.x,o.x,a.x),is(e,s.y,r.y,o.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class ld extends fn{constructor(e=new D,t=new D,n=new D,s=new D){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new D){const n=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(is(e,s.x,r.x,o.x,a.x),is(e,s.y,r.y,o.y,a.y),is(e,s.z,r.z,o.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class rh extends fn{constructor(e=new me,t=new me){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new me){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new me){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class cd extends fn{constructor(e=new D,t=new D){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new D){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new D){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class oh extends fn{constructor(e=new me,t=new me,n=new me){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new me){const n=t,s=this.v0,r=this.v1,o=this.v2;return n.set(ns(e,s.x,r.x,o.x),ns(e,s.y,r.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class hd extends fn{constructor(e=new D,t=new D,n=new D){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new D){const n=t,s=this.v0,r=this.v1,o=this.v2;return n.set(ns(e,s.x,r.x,o.x),ns(e,s.y,r.y,o.y),ns(e,s.z,r.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class ah extends fn{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new me){const n=t,s=this.points,r=(s.length-1)*e,o=Math.floor(r),a=r-o,l=s[o===0?o:o-1],c=s[o],h=s[o>s.length-2?s.length-1:o+1],d=s[o>s.length-3?s.length-1:o+2];return n.set(Ul(a,l.x,c.x,h.x,d.x),Ul(a,l.y,c.y,h.y,d.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const s=e.points[t];this.points.push(s.clone())}return this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const s=e.points[t];this.points.push(new me().fromArray(s))}return this}}var la=Object.freeze({__proto__:null,ArcCurve:ju,CatmullRomCurve3:ed,CubicBezierCurve:sh,CubicBezierCurve3:ld,EllipseCurve:Da,LineCurve:rh,LineCurve3:cd,QuadraticBezierCurve:oh,QuadraticBezierCurve3:hd,SplineCurve:ah});class ud extends fn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){const e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){const n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new la[n](t,e))}return this}getPoint(e,t){const n=e*this.getLength(),s=this.getCurveLengths();let r=0;for(;r<s.length;){if(s[r]>=n){const o=s[r]-n,a=this.curves[r],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,t)}r++}return null}getLength(){const e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const e=[];let t=0;for(let n=0,s=this.curves.length;n<s;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){const t=[];let n;for(let s=0,r=this.curves;s<r.length;s++){const o=r[s],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,l=o.getPoints(a);for(let c=0;c<l.length;c++){const h=l[c];n&&n.equals(h)||(t.push(h),n=h)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){const s=e.curves[t];this.curves.push(s.clone())}return this.autoClose=e.autoClose,this}toJSON(){const e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){const s=this.curves[t];e.curves.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){const s=e.curves[t];this.curves.push(new la[s.type]().fromJSON(s))}return this}}class _r extends ud{constructor(e){super(),this.type="Path",this.currentPoint=new me,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){const n=new rh(this.currentPoint.clone(),new me(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,s){const r=new oh(this.currentPoint.clone(),new me(e,t),new me(n,s));return this.curves.push(r),this.currentPoint.set(n,s),this}bezierCurveTo(e,t,n,s,r,o){const a=new sh(this.currentPoint.clone(),new me(e,t),new me(n,s),new me(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(e){const t=[this.currentPoint.clone()].concat(e),n=new ah(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,s,r,o){const a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+a,t+l,n,s,r,o),this}absarc(e,t,n,s,r,o){return this.absellipse(e,t,n,n,s,r,o),this}ellipse(e,t,n,s,r,o,a,l){const c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(e+c,t+h,n,s,r,o,a,l),this}absellipse(e,t,n,s,r,o,a,l){const c=new Da(e,t,n,s,r,o,a,l);if(this.curves.length>0){const d=c.getPoint(0);d.equals(this.currentPoint)||this.lineTo(d.x,d.y)}this.curves.push(c);const h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){const e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}}class Ua extends _r{constructor(e){super(e),this.uuid=Li(),this.type="Shape",this.holes=[]}getPointsHoles(e){const t=[];for(let n=0,s=this.holes.length;n<s;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){const s=e.holes[t];this.holes.push(s.clone())}return this}toJSON(){const e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){const s=this.holes[t];e.holes.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){const s=e.holes[t];this.holes.push(new _r().fromJSON(s))}return this}}function dd(i,e,t=2){const n=e&&e.length,s=n?e[0]*t:i.length;let r=lh(i,0,s,t,!0);const o=[];if(!r||r.next===r.prev)return o;let a,l,c;if(n&&(r=_d(i,e,r,t)),i.length>80*t){a=i[0],l=i[1];let h=a,d=l;for(let u=t;u<s;u+=t){const f=i[u],g=i[u+1];f<a&&(a=f),g<l&&(l=g),f>h&&(h=f),g>d&&(d=g)}c=Math.max(h-a,d-l),c=c!==0?32767/c:0}return us(r,o,t,a,l,c,0),o}function lh(i,e,t,n,s){let r;if(s===Rd(i,e,t,n)>0)for(let o=e;o<t;o+=n)r=Fl(o/n|0,i[o],i[o+1],r);else for(let o=t-n;o>=e;o-=n)r=Fl(o/n|0,i[o],i[o+1],r);return r&&Ci(r,r.next)&&(fs(r),r=r.next),r}function jn(i,e){if(!i)return i;e||(e=i);let t=i,n;do if(n=!1,!t.steiner&&(Ci(t,t.next)||pt(t.prev,t,t.next)===0)){if(fs(t),t=e=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==e);return e}function us(i,e,t,n,s,r,o){if(!i)return;!o&&r&&yd(i,n,s,r);let a=i;for(;i.prev!==i.next;){const l=i.prev,c=i.next;if(r?pd(i,n,s,r):fd(i)){e.push(l.i,i.i,c.i),fs(i),i=c.next,a=c.next;continue}if(i=c,i===a){o?o===1?(i=md(jn(i),e),us(i,e,t,n,s,r,2)):o===2&&gd(i,e,t,n,s,r):us(jn(i),e,t,n,s,r,1);break}}}function fd(i){const e=i.prev,t=i,n=i.next;if(pt(e,t,n)>=0)return!1;const s=e.x,r=t.x,o=n.x,a=e.y,l=t.y,c=n.y,h=Math.min(s,r,o),d=Math.min(a,l,c),u=Math.max(s,r,o),f=Math.max(a,l,c);let g=n.next;for(;g!==e;){if(g.x>=h&&g.x<=u&&g.y>=d&&g.y<=f&&Qi(s,a,r,l,o,c,g.x,g.y)&&pt(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function pd(i,e,t,n){const s=i.prev,r=i,o=i.next;if(pt(s,r,o)>=0)return!1;const a=s.x,l=r.x,c=o.x,h=s.y,d=r.y,u=o.y,f=Math.min(a,l,c),g=Math.min(h,d,u),M=Math.max(a,l,c),m=Math.max(h,d,u),p=ca(f,g,e,t,n),w=ca(M,m,e,t,n);let A=i.prevZ,S=i.nextZ;for(;A&&A.z>=p&&S&&S.z<=w;){if(A.x>=f&&A.x<=M&&A.y>=g&&A.y<=m&&A!==s&&A!==o&&Qi(a,h,l,d,c,u,A.x,A.y)&&pt(A.prev,A,A.next)>=0||(A=A.prevZ,S.x>=f&&S.x<=M&&S.y>=g&&S.y<=m&&S!==s&&S!==o&&Qi(a,h,l,d,c,u,S.x,S.y)&&pt(S.prev,S,S.next)>=0))return!1;S=S.nextZ}for(;A&&A.z>=p;){if(A.x>=f&&A.x<=M&&A.y>=g&&A.y<=m&&A!==s&&A!==o&&Qi(a,h,l,d,c,u,A.x,A.y)&&pt(A.prev,A,A.next)>=0)return!1;A=A.prevZ}for(;S&&S.z<=w;){if(S.x>=f&&S.x<=M&&S.y>=g&&S.y<=m&&S!==s&&S!==o&&Qi(a,h,l,d,c,u,S.x,S.y)&&pt(S.prev,S,S.next)>=0)return!1;S=S.nextZ}return!0}function md(i,e){let t=i;do{const n=t.prev,s=t.next.next;!Ci(n,s)&&hh(n,t,t.next,s)&&ds(n,s)&&ds(s,n)&&(e.push(n.i,t.i,s.i),fs(t),fs(t.next),t=i=s),t=t.next}while(t!==i);return jn(t)}function gd(i,e,t,n,s,r){let o=i;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&Td(o,a)){let l=uh(o,a);o=jn(o,o.next),l=jn(l,l.next),us(o,e,t,n,s,r,0),us(l,e,t,n,s,r,0);return}a=a.next}o=o.next}while(o!==i)}function _d(i,e,t,n){const s=[];for(let r=0,o=e.length;r<o;r++){const a=e[r]*n,l=r<o-1?e[r+1]*n:i.length,c=lh(i,a,l,n,!1);c===c.next&&(c.steiner=!0),s.push(wd(c))}s.sort(xd);for(let r=0;r<s.length;r++)t=vd(s[r],t);return t}function xd(i,e){let t=i.x-e.x;if(t===0&&(t=i.y-e.y,t===0)){const n=(i.next.y-i.y)/(i.next.x-i.x),s=(e.next.y-e.y)/(e.next.x-e.x);t=n-s}return t}function vd(i,e){const t=Md(i,e);if(!t)return e;const n=uh(t,i);return jn(n,n.next),jn(t,t.next)}function Md(i,e){let t=e;const n=i.x,s=i.y;let r=-1/0,o;if(Ci(i,t))return t;do{if(Ci(i,t.next))return t.next;if(s<=t.y&&s>=t.next.y&&t.next.y!==t.y){const d=t.x+(s-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(d<=n&&d>r&&(r=d,o=t.x<t.next.x?t:t.next,d===n))return o}t=t.next}while(t!==e);if(!o)return null;const a=o,l=o.x,c=o.y;let h=1/0;t=o;do{if(n>=t.x&&t.x>=l&&n!==t.x&&ch(s<c?n:r,s,l,c,s<c?r:n,s,t.x,t.y)){const d=Math.abs(s-t.y)/(n-t.x);ds(t,i)&&(d<h||d===h&&(t.x>o.x||t.x===o.x&&Sd(o,t)))&&(o=t,h=d)}t=t.next}while(t!==a);return o}function Sd(i,e){return pt(i.prev,i,e.prev)<0&&pt(e.next,i,i.next)<0}function yd(i,e,t,n){let s=i;do s.z===0&&(s.z=ca(s.x,s.y,e,t,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,Ed(s)}function Ed(i){let e,t=1;do{let n=i,s;i=null;let r=null;for(e=0;n;){e++;let o=n,a=0;for(let c=0;c<t&&(a++,o=o.nextZ,!!o);c++);let l=t;for(;a>0||l>0&&o;)a!==0&&(l===0||!o||n.z<=o.z)?(s=n,n=n.nextZ,a--):(s=o,o=o.nextZ,l--),r?r.nextZ=s:i=s,s.prevZ=r,r=s;n=o}r.nextZ=null,t*=2}while(e>1);return i}function ca(i,e,t,n,s){return i=(i-t)*s|0,e=(e-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,i|e<<1}function wd(i){let e=i,t=i;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==i);return t}function ch(i,e,t,n,s,r,o,a){return(s-o)*(e-a)>=(i-o)*(r-a)&&(i-o)*(n-a)>=(t-o)*(e-a)&&(t-o)*(r-a)>=(s-o)*(n-a)}function Qi(i,e,t,n,s,r,o,a){return!(i===o&&e===a)&&ch(i,e,t,n,s,r,o,a)}function Td(i,e){return i.next.i!==e.i&&i.prev.i!==e.i&&!bd(i,e)&&(ds(i,e)&&ds(e,i)&&Ad(i,e)&&(pt(i.prev,i,e.prev)||pt(i,e.prev,e))||Ci(i,e)&&pt(i.prev,i,i.next)>0&&pt(e.prev,e,e.next)>0)}function pt(i,e,t){return(e.y-i.y)*(t.x-e.x)-(e.x-i.x)*(t.y-e.y)}function Ci(i,e){return i.x===e.x&&i.y===e.y}function hh(i,e,t,n){const s=Vs(pt(i,e,t)),r=Vs(pt(i,e,n)),o=Vs(pt(t,n,i)),a=Vs(pt(t,n,e));return!!(s!==r&&o!==a||s===0&&Hs(i,t,e)||r===0&&Hs(i,n,e)||o===0&&Hs(t,i,n)||a===0&&Hs(t,e,n))}function Hs(i,e,t){return e.x<=Math.max(i.x,t.x)&&e.x>=Math.min(i.x,t.x)&&e.y<=Math.max(i.y,t.y)&&e.y>=Math.min(i.y,t.y)}function Vs(i){return i>0?1:i<0?-1:0}function bd(i,e){let t=i;do{if(t.i!==i.i&&t.next.i!==i.i&&t.i!==e.i&&t.next.i!==e.i&&hh(t,t.next,i,e))return!0;t=t.next}while(t!==i);return!1}function ds(i,e){return pt(i.prev,i,i.next)<0?pt(i,e,i.next)>=0&&pt(i,i.prev,e)>=0:pt(i,e,i.prev)<0||pt(i,i.next,e)<0}function Ad(i,e){let t=i,n=!1;const s=(i.x+e.x)/2,r=(i.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&s<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==i);return n}function uh(i,e){const t=ha(i.i,i.x,i.y),n=ha(e.i,e.x,e.y),s=i.next,r=e.prev;return i.next=e,e.prev=i,t.next=s,s.prev=t,n.next=t,t.prev=n,r.next=n,n.prev=r,n}function Fl(i,e,t,n){const s=ha(i,e,t);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function fs(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function ha(i,e,t){return{i,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function Rd(i,e,t,n){let s=0;for(let r=e,o=t-n;r<t;r+=n)s+=(i[o]-i[r])*(i[r+1]+i[o+1]),o=r;return s}class Cd{static triangulate(e,t,n=2){return dd(e,t,n)}}class Ei{static area(e){const t=e.length;let n=0;for(let s=t-1,r=0;r<t;s=r++)n+=e[s].x*e[r].y-e[r].x*e[s].y;return n*.5}static isClockWise(e){return Ei.area(e)<0}static triangulateShape(e,t){const n=[],s=[],r=[];Ol(e),Bl(n,e);let o=e.length;t.forEach(Ol);for(let l=0;l<t.length;l++)s.push(o),o+=t[l].length,Bl(n,t[l]);const a=Cd.triangulate(n,s);for(let l=0;l<a.length;l+=3)r.push(a.slice(l,l+3));return r}}function Ol(i){const e=i.length;e>2&&i[e-1].equals(i[0])&&i.pop()}function Bl(i,e){for(let t=0;t<e.length;t++)i.push(e[t].x),i.push(e[t].y)}class yr extends wt{constructor(e=new Ua([new me(.5,.5),new me(-.5,.5),new me(-.5,-.5),new me(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];const n=this,s=[],r=[];for(let a=0,l=e.length;a<l;a++){const c=e[a];o(c)}this.setAttribute("position",new dt(s,3)),this.setAttribute("uv",new dt(r,2)),this.computeVertexNormals();function o(a){const l=[],c=t.curveSegments!==void 0?t.curveSegments:12,h=t.steps!==void 0?t.steps:1,d=t.depth!==void 0?t.depth:1;let u=t.bevelEnabled!==void 0?t.bevelEnabled:!0,f=t.bevelThickness!==void 0?t.bevelThickness:.2,g=t.bevelSize!==void 0?t.bevelSize:f-.1,M=t.bevelOffset!==void 0?t.bevelOffset:0,m=t.bevelSegments!==void 0?t.bevelSegments:3;const p=t.extrudePath,w=t.UVGenerator!==void 0?t.UVGenerator:Pd;let A,S=!1,E,T,R,x;if(p){A=p.getSpacedPoints(h),S=!0,u=!1;const te=p.isCatmullRomCurve3?p.closed:!1;E=p.computeFrenetFrames(h,te),T=new D,R=new D,x=new D}u||(m=0,f=0,g=0,M=0);const b=a.extractPoints(c);let P=b.shape;const N=b.holes;if(!Ei.isClockWise(P)){P=P.reverse();for(let te=0,se=N.length;te<se;te++){const re=N[te];Ei.isClockWise(re)&&(N[te]=re.reverse())}}function V(te){const re=10000000000000001e-36;let oe=te[0];for(let he=1;he<=te.length;he++){const Fe=he%te.length,De=te[Fe],ke=De.x-oe.x,ze=De.y-oe.y,C=ke*ke+ze*ze,nt=Math.max(Math.abs(De.x),Math.abs(De.y),Math.abs(oe.x),Math.abs(oe.y)),qe=re*nt*nt;if(C<=qe){te.splice(Fe,1),he--;continue}oe=De}}V(P),N.forEach(V);const U=N.length,O=P;for(let te=0;te<U;te++){const se=N[te];P=P.concat(se)}function J(te,se,re){return se||Qe("ExtrudeGeometry: vec does not exist"),te.clone().addScaledVector(se,re)}const H=P.length;function ie(te,se,re){let oe,he,Fe;const De=te.x-se.x,ke=te.y-se.y,ze=re.x-te.x,C=re.y-te.y,nt=De*De+ke*ke,qe=De*C-ke*ze;if(Math.abs(qe)>Number.EPSILON){const y=Math.sqrt(nt),_=Math.sqrt(ze*ze+C*C),F=se.x-ke/y,G=se.y+De/y,Y=re.x-C/_,ae=re.y+ze/_,ce=((Y-F)*C-(ae-G)*ze)/(De*C-ke*ze);oe=F+De*ce-te.x,he=G+ke*ce-te.y;const K=oe*oe+he*he;if(K<=2)return new me(oe,he);Fe=Math.sqrt(K/2)}else{let y=!1;De>Number.EPSILON?ze>Number.EPSILON&&(y=!0):De<-Number.EPSILON?ze<-Number.EPSILON&&(y=!0):Math.sign(ke)===Math.sign(C)&&(y=!0),y?(oe=-ke,he=De,Fe=Math.sqrt(nt)):(oe=De,he=ke,Fe=Math.sqrt(nt/2))}return new me(oe/Fe,he/Fe)}const X=[];for(let te=0,se=O.length,re=se-1,oe=te+1;te<se;te++,re++,oe++)re===se&&(re=0),oe===se&&(oe=0),X[te]=ie(O[te],O[re],O[oe]);const $=[];let ee,Ae=X.concat();for(let te=0,se=U;te<se;te++){const re=N[te];ee=[];for(let oe=0,he=re.length,Fe=he-1,De=oe+1;oe<he;oe++,Fe++,De++)Fe===he&&(Fe=0),De===he&&(De=0),ee[oe]=ie(re[oe],re[Fe],re[De]);$.push(ee),Ae=Ae.concat(ee)}let ye;if(m===0)ye=Ei.triangulateShape(O,N);else{const te=[],se=[];for(let re=0;re<m;re++){const oe=re/m,he=f*Math.cos(oe*Math.PI/2),Fe=g*Math.sin(oe*Math.PI/2)+M;for(let De=0,ke=O.length;De<ke;De++){const ze=J(O[De],X[De],Fe);le(ze.x,ze.y,-he),oe===0&&te.push(ze)}for(let De=0,ke=U;De<ke;De++){const ze=N[De];ee=$[De];const C=[];for(let nt=0,qe=ze.length;nt<qe;nt++){const y=J(ze[nt],ee[nt],Fe);le(y.x,y.y,-he),oe===0&&C.push(y)}oe===0&&se.push(C)}}ye=Ei.triangulateShape(te,se)}const je=ye.length,We=g+M;for(let te=0;te<H;te++){const se=u?J(P[te],Ae[te],We):P[te];S?(R.copy(E.normals[0]).multiplyScalar(se.x),T.copy(E.binormals[0]).multiplyScalar(se.y),x.copy(A[0]).add(R).add(T),le(x.x,x.y,x.z)):le(se.x,se.y,0)}for(let te=1;te<=h;te++)for(let se=0;se<H;se++){const re=u?J(P[se],Ae[se],We):P[se];S?(R.copy(E.normals[te]).multiplyScalar(re.x),T.copy(E.binormals[te]).multiplyScalar(re.y),x.copy(A[te]).add(R).add(T),le(x.x,x.y,x.z)):le(re.x,re.y,d/h*te)}for(let te=m-1;te>=0;te--){const se=te/m,re=f*Math.cos(se*Math.PI/2),oe=g*Math.sin(se*Math.PI/2)+M;for(let he=0,Fe=O.length;he<Fe;he++){const De=J(O[he],X[he],oe);le(De.x,De.y,d+re)}for(let he=0,Fe=N.length;he<Fe;he++){const De=N[he];ee=$[he];for(let ke=0,ze=De.length;ke<ze;ke++){const C=J(De[ke],ee[ke],oe);S?le(C.x,C.y+A[h-1].y,A[h-1].x+re):le(C.x,C.y,d+re)}}}Ze(),q();function Ze(){const te=s.length/3;if(u){let se=0,re=H*se;for(let oe=0;oe<je;oe++){const he=ye[oe];Ne(he[2]+re,he[1]+re,he[0]+re)}se=h+m*2,re=H*se;for(let oe=0;oe<je;oe++){const he=ye[oe];Ne(he[0]+re,he[1]+re,he[2]+re)}}else{for(let se=0;se<je;se++){const re=ye[se];Ne(re[2],re[1],re[0])}for(let se=0;se<je;se++){const re=ye[se];Ne(re[0]+H*h,re[1]+H*h,re[2]+H*h)}}n.addGroup(te,s.length/3-te,0)}function q(){const te=s.length/3;let se=0;Q(O,se),se+=O.length;for(let re=0,oe=N.length;re<oe;re++){const he=N[re];Q(he,se),se+=he.length}n.addGroup(te,s.length/3-te,1)}function Q(te,se){let re=te.length;for(;--re>=0;){const oe=re;let he=re-1;he<0&&(he=te.length-1);for(let Fe=0,De=h+m*2;Fe<De;Fe++){const ke=H*Fe,ze=H*(Fe+1),C=se+oe+ke,nt=se+he+ke,qe=se+he+ze,y=se+oe+ze;Me(C,nt,qe,y)}}}function le(te,se,re){l.push(te),l.push(se),l.push(re)}function Ne(te,se,re){Ue(te),Ue(se),Ue(re);const oe=s.length/3,he=w.generateTopUV(n,s,oe-3,oe-2,oe-1);rt(he[0]),rt(he[1]),rt(he[2])}function Me(te,se,re,oe){Ue(te),Ue(se),Ue(oe),Ue(se),Ue(re),Ue(oe);const he=s.length/3,Fe=w.generateSideWallUV(n,s,he-6,he-3,he-2,he-1);rt(Fe[0]),rt(Fe[1]),rt(Fe[3]),rt(Fe[1]),rt(Fe[2]),rt(Fe[3])}function Ue(te){s.push(l[te*3+0]),s.push(l[te*3+1]),s.push(l[te*3+2])}function rt(te){r.push(te.x),r.push(te.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON(),t=this.parameters.shapes,n=this.parameters.options;return Ld(t,n,e)}static fromJSON(e,t){const n=[];for(let r=0,o=e.shapes.length;r<o;r++){const a=t[e.shapes[r]];n.push(a)}const s=e.options.extrudePath;return s!==void 0&&(e.options.extrudePath=new la[s.type]().fromJSON(s)),new yr(n,e.options)}}const Pd={generateTopUV:function(i,e,t,n,s){const r=e[t*3],o=e[t*3+1],a=e[n*3],l=e[n*3+1],c=e[s*3],h=e[s*3+1];return[new me(r,o),new me(a,l),new me(c,h)]},generateSideWallUV:function(i,e,t,n,s,r){const o=e[t*3],a=e[t*3+1],l=e[t*3+2],c=e[n*3],h=e[n*3+1],d=e[n*3+2],u=e[s*3],f=e[s*3+1],g=e[s*3+2],M=e[r*3],m=e[r*3+1],p=e[r*3+2];return Math.abs(a-h)<Math.abs(o-c)?[new me(o,1-l),new me(c,1-d),new me(u,1-g),new me(M,1-p)]:[new me(a,1-l),new me(h,1-d),new me(f,1-g),new me(m,1-p)]}};function Ld(i,e,t){if(t.shapes=[],Array.isArray(i))for(let n=0,s=i.length;n<s;n++){const r=i[n];t.shapes.push(r.uuid)}else t.shapes.push(i.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}class ii extends wt{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};const r=e/2,o=t/2,a=Math.floor(n),l=Math.floor(s),c=a+1,h=l+1,d=e/a,u=t/l,f=[],g=[],M=[],m=[];for(let p=0;p<h;p++){const w=p*u-o;for(let A=0;A<c;A++){const S=A*d-r;g.push(S,-w,0),M.push(0,0,1),m.push(A/a),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let w=0;w<a;w++){const A=w+c*p,S=w+c*(p+1),E=w+1+c*(p+1),T=w+1+c*p;f.push(A,S,T),f.push(S,E,T)}this.setIndex(f),this.setAttribute("position",new dt(g,3)),this.setAttribute("normal",new dt(M,3)),this.setAttribute("uv",new dt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ii(e.width,e.height,e.widthSegments,e.heightSegments)}}class Fa extends wt{constructor(e=.5,t=1,n=32,s=1,r=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:s,thetaStart:r,thetaLength:o},n=Math.max(3,n),s=Math.max(1,s);const a=[],l=[],c=[],h=[];let d=e;const u=(t-e)/s,f=new D,g=new me;for(let M=0;M<=s;M++){for(let m=0;m<=n;m++){const p=r+m/n*o;f.x=d*Math.cos(p),f.y=d*Math.sin(p),l.push(f.x,f.y,f.z),c.push(0,0,1),g.x=(f.x/t+1)/2,g.y=(f.y/t+1)/2,h.push(g.x,g.y)}d+=u}for(let M=0;M<s;M++){const m=M*(n+1);for(let p=0;p<n;p++){const w=p+m,A=w,S=w+n+1,E=w+n+2,T=w+1;a.push(A,S,T),a.push(S,E,T)}}this.setIndex(a),this.setAttribute("position",new dt(l,3)),this.setAttribute("normal",new dt(c,3)),this.setAttribute("uv",new dt(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Fa(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}}class ps extends wt{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));const l=Math.min(o+a,Math.PI);let c=0;const h=[],d=new D,u=new D,f=[],g=[],M=[],m=[];for(let p=0;p<=n;p++){const w=[],A=p/n,S=o+A*a,E=e*Math.cos(S),T=Math.sqrt(e*e-E*E);let R=0;p===0&&o===0?R=.5/t:p===n&&l===Math.PI&&(R=-.5/t);for(let x=0;x<=t;x++){const b=x/t,P=s+b*r;d.x=-T*Math.cos(P),d.y=E,d.z=T*Math.sin(P),g.push(d.x,d.y,d.z),u.copy(d).normalize(),M.push(u.x,u.y,u.z),m.push(b+R,1-A),w.push(c++)}h.push(w)}for(let p=0;p<n;p++)for(let w=0;w<t;w++){const A=h[p][w+1],S=h[p][w],E=h[p+1][w],T=h[p+1][w+1];(p!==0||o>0)&&f.push(A,S,T),(p!==n-1||l<Math.PI)&&f.push(S,E,T)}this.setIndex(f),this.setAttribute("position",new dt(g,3)),this.setAttribute("normal",new dt(M,3)),this.setAttribute("uv",new dt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ps(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}function Pi(i){const e={};for(const t in i){e[t]={};for(const n in i[t]){const s=i[t][n];if(kl(s))s.isRenderTargetTexture?(Be("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone();else if(Array.isArray(s))if(kl(s[0])){const r=[];for(let o=0,a=s.length;o<a;o++)r[o]=s[o].clone();e[t][n]=r}else e[t][n]=s.slice();else e[t][n]=s}}return e}function Lt(i){const e={};for(let t=0;t<i.length;t++){const n=Pi(i[t]);for(const s in n)e[s]=n[s]}return e}function kl(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function Id(i){const e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function dh(i){const e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:$e.workingColorSpace}const Dd={clone:Pi,merge:Lt};var Nd=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Ud=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class dn extends Ni{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Nd,this.fragmentShader=Ud,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Pi(e.uniforms),this.uniformsGroups=Id(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const s in this.uniforms){const o=this.uniforms[s].value;o&&o.isTexture?t.uniforms[s]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[s]={type:"m4",value:o.toArray()}:t.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(const n in e.uniforms){const s=e.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=t[s.value]||null;break;case"c":this.uniforms[n].value=new Ve().setHex(s.value);break;case"v2":this.uniforms[n].value=new me().fromArray(s.value);break;case"v3":this.uniforms[n].value=new D().fromArray(s.value);break;case"v4":this.uniforms[n].value=new ft().fromArray(s.value);break;case"m3":this.uniforms[n].value=new Ge().fromArray(s.value);break;case"m4":this.uniforms[n].value=new tt().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(const n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}}class Fd extends dn{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class vn extends Ni{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ve(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ve(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=oa,this.normalScale=new me(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new zn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Od extends Ni{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=du,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class Bd extends Ni{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}class fh extends vt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ve(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}}class kd extends fh{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(vt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ve(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){const t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}}const ro=new tt,zl=new D,Gl=new D;class zd{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new me(512,512),this.mapType=kt,this.map=null,this.mapPass=null,this.matrix=new tt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Ia,this._frameExtents=new me(1,1),this._viewportCount=1,this._viewports=[new ft(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera;zl.setFromMatrixPosition(e.matrixWorld),t.position.copy(zl),Gl.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Gl),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,s){ro.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(ro,e.coordinateSystem,e.reversedDepth);const r=this._frameExtents,o=s?s.z/r.x:1,a=s?s.w/r.y:1,l=s?s.x/r.x:0,c=s?s.y/r.y:0;e.coordinateSystem===cs||e.reversedDepth?t.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+c,0,0,1,0,0,0,0,1):t.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+c,0,0,.5,.5,0,0,0,1),t.multiply(ro)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}const Ws=new D,Xs=new Ii,nn=new D;class ph extends vt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new tt,this.projectionMatrix=new tt,this.projectionMatrixInverse=new tt,this.coordinateSystem=ln,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Ws,Xs,nn),nn.x===1&&nn.y===1&&nn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ws,Xs,nn.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(Ws,Xs,nn),nn.x===1&&nn.y===1&&nn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ws,Xs,nn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}const Dn=new D,Hl=new me,Vl=new me;class Jt extends ph{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=aa*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(or*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return aa*2*Math.atan(Math.tan(or*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Dn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Dn.x,Dn.y).multiplyScalar(-e/Dn.z),Dn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Dn.x,Dn.y).multiplyScalar(-e/Dn.z)}getViewSize(e,t){return this.getViewBounds(e,Hl,Vl),t.subVectors(Vl,Hl)}setViewOffset(e,t,n,s,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(or*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*s/l,t-=o.offsetY*n/c,s*=o.width/l,n*=o.height/c}const a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}class Er extends ph{constructor(e=-1,t=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=n-e,o=n+e,a=s+t,l=s-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class Gd extends zd{constructor(){super(new Er(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Hd extends fh{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(vt.DEFAULT_UP),this.updateMatrix(),this.target=new vt,this.shadow=new Gd}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}}const _i=-90,xi=1;class Vd extends vt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new Jt(_i,xi,e,t);s.layers=this.layers,this.add(s);const r=new Jt(_i,xi,e,t);r.layers=this.layers,this.add(r);const o=new Jt(_i,xi,e,t);o.layers=this.layers,this.add(o);const a=new Jt(_i,xi,e,t);a.layers=this.layers,this.add(a);const l=new Jt(_i,xi,e,t);l.layers=this.layers,this.add(l);const c=new Jt(_i,xi,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,s,r,o,a,l]=t;for(const c of t)this.remove(c);if(e===ln)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===cs)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,o,a,l,c,h]=this.children,d=e.getRenderTarget(),u=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const M=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let m=!1;e.isWebGLRenderer===!0?m=e.state.buffers.depth.getReversed():m=e.reversedDepthBuffer,e.setRenderTarget(n,0,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(n,1,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,2,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,3,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(n,4,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.generateMipmaps=M,e.setRenderTarget(n,5,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,h),e.setRenderTarget(d,u,f),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class Wd extends Jt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}const Wl=new tt;class Xd{constructor(e,t,n=0,s=1/0){this.ray=new Pa(e,t),this.near=n,this.far=s,this.camera=null,this.layers=new Ca,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,t.projectionMatrix.elements[14]).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):Qe("Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return Wl.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Wl),this}intersectObject(e,t=!0,n=[]){return ua(e,this,n,t),n.sort(Xl),n}intersectObjects(e,t=!0,n=[]){for(let s=0,r=e.length;s<r;s++)ua(e[s],this,n,t);return n.sort(Xl),n}}function Xl(i,e){return i.distance-e.distance}function ua(i,e,t,n){let s=!0;if(i.layers.test(e.layers)&&i.raycast(e,t)===!1&&(s=!1),s===!0&&n===!0){const r=i.children;for(let o=0,a=r.length;o<a;o++)ua(r[o],e,t,!0)}}const qa=class qa{constructor(e,t,n,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,s){const r=this.elements;return r[0]=e,r[2]=t,r[1]=n,r[3]=s,this}};qa.prototype.isMatrix2=!0;let Yl=qa;function ql(i,e,t,n){const s=Yd(n);switch(t){case Kc:return i*e;case ya:return i*e/s.components*s.byteLength;case Ea:return i*e/s.components*s.byteLength;case Qn:return i*e*2/s.components*s.byteLength;case wa:return i*e*2/s.components*s.byteLength;case Jc:return i*e*3/s.components*s.byteLength;case $t:return i*e*4/s.components*s.byteLength;case Ta:return i*e*4/s.components*s.byteLength;case nr:case ir:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case sr:case rr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Lo:case Do:return Math.max(i,16)*Math.max(e,8)/4;case Po:case Io:return Math.max(i,8)*Math.max(e,8)/2;case No:case Uo:case Oo:case Bo:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Fo:case cr:case ko:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case zo:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Go:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case Ho:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case Vo:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case Wo:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case Xo:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case Yo:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case qo:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case Ko:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case Jo:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case Zo:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case $o:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case Qo:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case jo:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case ea:case ta:case na:return Math.ceil(i/4)*Math.ceil(e/4)*16;case ia:case sa:return Math.ceil(i/4)*Math.ceil(e/4)*8;case hr:case ra:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Yd(i){switch(i){case kt:case Wc:return{byteLength:1,components:1};case as:case Xc:case un:return{byteLength:2,components:1};case Ma:case Sa:return{byteLength:2,components:4};case hn:case va:case Zt:return{byteLength:4,components:1};case Yc:case qc:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:_a}}));typeof window<"u"&&(window.__THREE__?Be("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=_a);/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function mh(){let i=null,e=!1,t=null,n=null;function s(r,o){n=i.requestAnimationFrame(s),t(r,o)}return{start:function(){e!==!0&&t!==null&&i!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function qd(i){const e=new WeakMap;function t(a,l){const c=a.array,h=a.usage,d=c.byteLength,u=i.createBuffer();i.bindBuffer(l,u),i.bufferData(l,c,h),a.onUploadCallback();let f;if(c instanceof Float32Array)f=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=i.HALF_FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?f=i.HALF_FLOAT:f=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=i.SHORT;else if(c instanceof Uint32Array)f=i.UNSIGNED_INT;else if(c instanceof Int32Array)f=i.INT;else if(c instanceof Int8Array)f=i.BYTE;else if(c instanceof Uint8Array)f=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:u,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:d}}function n(a,l,c){const h=l.array,d=l.updateRanges;if(i.bindBuffer(c,a),d.length===0)i.bufferSubData(c,0,h);else{d.sort((f,g)=>f.start-g.start);let u=0;for(let f=1;f<d.length;f++){const g=d[u],M=d[f];M.start<=g.start+g.count+1?g.count=Math.max(g.count,M.start+M.count-g.start):(++u,d[u]=M)}d.length=u+1;for(let f=0,g=d.length;f<g;f++){const M=d[f];i.bufferSubData(c,M.start*h.BYTES_PER_ELEMENT,h,M.start,M.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);const l=e.get(a);l&&(i.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const h=e.get(a);(!h||h.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:s,remove:r,update:o}}var Kd=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Jd=`#ifdef USE_ALPHAHASH
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
#endif`,Zd=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,$d=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Qd=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,jd=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,ef=`#ifdef USE_AOMAP
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
#endif`,tf=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,nf=`#ifdef USE_BATCHING
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
#endif`,sf=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,rf=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,of=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,af=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,lf=`#ifdef USE_IRIDESCENCE
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
#endif`,cf=`#ifdef USE_BUMPMAP
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
#endif`,hf=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,uf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,df=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,ff=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,pf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,mf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,gf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,_f=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,xf=`#define PI 3.141592653589793
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
} // validated`,vf=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,Mf=`vec3 transformedNormal = objectNormal;
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
#endif`,Sf=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,yf=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Ef=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,wf=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Tf="gl_FragColor = linearToOutputTexel( gl_FragColor );",bf=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Af=`#ifdef USE_ENVMAP
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
#endif`,Rf=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,Cf=`#ifdef USE_ENVMAP
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
#endif`,Pf=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Lf=`#ifdef USE_ENVMAP
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
#endif`,If=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Df=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Nf=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Uf=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Ff=`#ifdef USE_GRADIENTMAP
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
}`,Of=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Bf=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,kf=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,zf=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,Gf=`#ifdef USE_ENVMAP
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
#endif`,Hf=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Vf=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Wf=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Xf=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Yf=`PhysicalMaterial material;
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
#endif`,qf=`uniform sampler2D dfgLUT;
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
}`,Kf=`
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
#endif`,Jf=`#if defined( RE_IndirectDiffuse )
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
#endif`,Zf=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,$f=`#ifdef USE_LIGHT_PROBES_GRID
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
#endif`,Qf=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,jf=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,ep=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,tp=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,np=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,ip=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,sp=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,rp=`#if defined( USE_POINTS_UV )
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
#endif`,op=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,ap=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,lp=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,cp=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,hp=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,up=`#ifdef USE_MORPHTARGETS
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
#endif`,dp=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,fp=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,pp=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,mp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,gp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,_p=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,xp=`#ifdef USE_NORMALMAP
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
#endif`,vp=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Mp=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Sp=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,yp=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Ep=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,wp=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Tp=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,bp=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Ap=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Rp=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Cp=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Pp=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Lp=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Ip=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Dp=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,Np=`float getShadowMask() {
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
}`,Up=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Fp=`#ifdef USE_SKINNING
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
#endif`,Op=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Bp=`#ifdef USE_SKINNING
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
#endif`,kp=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,zp=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Gp=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Hp=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,Vp=`#ifdef USE_TRANSMISSION
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
#endif`,Wp=`#ifdef USE_TRANSMISSION
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
#endif`,Xp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Yp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,qp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Kp=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Jp=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Zp=`uniform sampler2D t2D;
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
}`,$p=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Qp=`#ifdef ENVMAP_TYPE_CUBE
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
}`,jp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,em=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,tm=`#include <common>
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
}`,nm=`#if DEPTH_PACKING == 3200
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
}`,im=`#define DISTANCE
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
}`,sm=`#define DISTANCE
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
}`,rm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,om=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,am=`uniform float scale;
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
}`,lm=`uniform vec3 diffuse;
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
}`,cm=`#include <common>
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
}`,hm=`uniform vec3 diffuse;
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
}`,um=`#define LAMBERT
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
}`,dm=`#define LAMBERT
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
}`,fm=`#define MATCAP
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
}`,pm=`#define MATCAP
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
}`,mm=`#define NORMAL
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
}`,gm=`#define NORMAL
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
}`,_m=`#define PHONG
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
}`,xm=`#define PHONG
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
}`,vm=`#define STANDARD
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
}`,Mm=`#define STANDARD
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
}`,Sm=`#define TOON
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
}`,ym=`#define TOON
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
}`,Em=`uniform float size;
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
}`,wm=`uniform vec3 diffuse;
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
}`,Tm=`#include <common>
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
}`,bm=`uniform vec3 color;
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
}`,Am=`uniform float rotation;
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
}`,Rm=`uniform vec3 diffuse;
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
}`,Ye={alphahash_fragment:Kd,alphahash_pars_fragment:Jd,alphamap_fragment:Zd,alphamap_pars_fragment:$d,alphatest_fragment:Qd,alphatest_pars_fragment:jd,aomap_fragment:ef,aomap_pars_fragment:tf,batching_pars_vertex:nf,batching_vertex:sf,begin_vertex:rf,beginnormal_vertex:of,bsdfs:af,iridescence_fragment:lf,bumpmap_pars_fragment:cf,clipping_planes_fragment:hf,clipping_planes_pars_fragment:uf,clipping_planes_pars_vertex:df,clipping_planes_vertex:ff,color_fragment:pf,color_pars_fragment:mf,color_pars_vertex:gf,color_vertex:_f,common:xf,cube_uv_reflection_fragment:vf,defaultnormal_vertex:Mf,displacementmap_pars_vertex:Sf,displacementmap_vertex:yf,emissivemap_fragment:Ef,emissivemap_pars_fragment:wf,colorspace_fragment:Tf,colorspace_pars_fragment:bf,envmap_fragment:Af,envmap_common_pars_fragment:Rf,envmap_pars_fragment:Cf,envmap_pars_vertex:Pf,envmap_physical_pars_fragment:Gf,envmap_vertex:Lf,fog_vertex:If,fog_pars_vertex:Df,fog_fragment:Nf,fog_pars_fragment:Uf,gradientmap_pars_fragment:Ff,lightmap_pars_fragment:Of,lights_lambert_fragment:Bf,lights_lambert_pars_fragment:kf,lights_pars_begin:zf,lights_toon_fragment:Hf,lights_toon_pars_fragment:Vf,lights_phong_fragment:Wf,lights_phong_pars_fragment:Xf,lights_physical_fragment:Yf,lights_physical_pars_fragment:qf,lights_fragment_begin:Kf,lights_fragment_maps:Jf,lights_fragment_end:Zf,lightprobes_pars_fragment:$f,logdepthbuf_fragment:Qf,logdepthbuf_pars_fragment:jf,logdepthbuf_pars_vertex:ep,logdepthbuf_vertex:tp,map_fragment:np,map_pars_fragment:ip,map_particle_fragment:sp,map_particle_pars_fragment:rp,metalnessmap_fragment:op,metalnessmap_pars_fragment:ap,morphinstance_vertex:lp,morphcolor_vertex:cp,morphnormal_vertex:hp,morphtarget_pars_vertex:up,morphtarget_vertex:dp,normal_fragment_begin:fp,normal_fragment_maps:pp,normal_pars_fragment:mp,normal_pars_vertex:gp,normal_vertex:_p,normalmap_pars_fragment:xp,clearcoat_normal_fragment_begin:vp,clearcoat_normal_fragment_maps:Mp,clearcoat_pars_fragment:Sp,iridescence_pars_fragment:yp,opaque_fragment:Ep,packing:wp,premultiplied_alpha_fragment:Tp,project_vertex:bp,dithering_fragment:Ap,dithering_pars_fragment:Rp,roughnessmap_fragment:Cp,roughnessmap_pars_fragment:Pp,shadowmap_pars_fragment:Lp,shadowmap_pars_vertex:Ip,shadowmap_vertex:Dp,shadowmask_pars_fragment:Np,skinbase_vertex:Up,skinning_pars_vertex:Fp,skinning_vertex:Op,skinnormal_vertex:Bp,specularmap_fragment:kp,specularmap_pars_fragment:zp,tonemapping_fragment:Gp,tonemapping_pars_fragment:Hp,transmission_fragment:Vp,transmission_pars_fragment:Wp,uv_pars_fragment:Xp,uv_pars_vertex:Yp,uv_vertex:qp,worldpos_vertex:Kp,background_vert:Jp,background_frag:Zp,backgroundCube_vert:$p,backgroundCube_frag:Qp,cube_vert:jp,cube_frag:em,depth_vert:tm,depth_frag:nm,distance_vert:im,distance_frag:sm,equirect_vert:rm,equirect_frag:om,linedashed_vert:am,linedashed_frag:lm,meshbasic_vert:cm,meshbasic_frag:hm,meshlambert_vert:um,meshlambert_frag:dm,meshmatcap_vert:fm,meshmatcap_frag:pm,meshnormal_vert:mm,meshnormal_frag:gm,meshphong_vert:_m,meshphong_frag:xm,meshphysical_vert:vm,meshphysical_frag:Mm,meshtoon_vert:Sm,meshtoon_frag:ym,points_vert:Em,points_frag:wm,shadow_vert:Tm,shadow_frag:bm,sprite_vert:Am,sprite_frag:Rm},_e={common:{diffuse:{value:new Ve(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ge},alphaMap:{value:null},alphaMapTransform:{value:new Ge},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ge}},envmap:{envMap:{value:null},envMapRotation:{value:new Ge},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ge}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ge}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ge},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ge},normalScale:{value:new me(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ge},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ge}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ge}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ge}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ve(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new D},probesMax:{value:new D},probesResolution:{value:new D}},points:{diffuse:{value:new Ve(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ge},alphaTest:{value:0},uvTransform:{value:new Ge}},sprite:{diffuse:{value:new Ve(16777215)},opacity:{value:1},center:{value:new me(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ge},alphaMap:{value:null},alphaMapTransform:{value:new Ge},alphaTest:{value:0}}},rn={basic:{uniforms:Lt([_e.common,_e.specularmap,_e.envmap,_e.aomap,_e.lightmap,_e.fog]),vertexShader:Ye.meshbasic_vert,fragmentShader:Ye.meshbasic_frag},lambert:{uniforms:Lt([_e.common,_e.specularmap,_e.envmap,_e.aomap,_e.lightmap,_e.emissivemap,_e.bumpmap,_e.normalmap,_e.displacementmap,_e.fog,_e.lights,{emissive:{value:new Ve(0)},envMapIntensity:{value:1}}]),vertexShader:Ye.meshlambert_vert,fragmentShader:Ye.meshlambert_frag},phong:{uniforms:Lt([_e.common,_e.specularmap,_e.envmap,_e.aomap,_e.lightmap,_e.emissivemap,_e.bumpmap,_e.normalmap,_e.displacementmap,_e.fog,_e.lights,{emissive:{value:new Ve(0)},specular:{value:new Ve(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Ye.meshphong_vert,fragmentShader:Ye.meshphong_frag},standard:{uniforms:Lt([_e.common,_e.envmap,_e.aomap,_e.lightmap,_e.emissivemap,_e.bumpmap,_e.normalmap,_e.displacementmap,_e.roughnessmap,_e.metalnessmap,_e.fog,_e.lights,{emissive:{value:new Ve(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ye.meshphysical_vert,fragmentShader:Ye.meshphysical_frag},toon:{uniforms:Lt([_e.common,_e.aomap,_e.lightmap,_e.emissivemap,_e.bumpmap,_e.normalmap,_e.displacementmap,_e.gradientmap,_e.fog,_e.lights,{emissive:{value:new Ve(0)}}]),vertexShader:Ye.meshtoon_vert,fragmentShader:Ye.meshtoon_frag},matcap:{uniforms:Lt([_e.common,_e.bumpmap,_e.normalmap,_e.displacementmap,_e.fog,{matcap:{value:null}}]),vertexShader:Ye.meshmatcap_vert,fragmentShader:Ye.meshmatcap_frag},points:{uniforms:Lt([_e.points,_e.fog]),vertexShader:Ye.points_vert,fragmentShader:Ye.points_frag},dashed:{uniforms:Lt([_e.common,_e.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ye.linedashed_vert,fragmentShader:Ye.linedashed_frag},depth:{uniforms:Lt([_e.common,_e.displacementmap]),vertexShader:Ye.depth_vert,fragmentShader:Ye.depth_frag},normal:{uniforms:Lt([_e.common,_e.bumpmap,_e.normalmap,_e.displacementmap,{opacity:{value:1}}]),vertexShader:Ye.meshnormal_vert,fragmentShader:Ye.meshnormal_frag},sprite:{uniforms:Lt([_e.sprite,_e.fog]),vertexShader:Ye.sprite_vert,fragmentShader:Ye.sprite_frag},background:{uniforms:{uvTransform:{value:new Ge},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ye.background_vert,fragmentShader:Ye.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ge}},vertexShader:Ye.backgroundCube_vert,fragmentShader:Ye.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ye.cube_vert,fragmentShader:Ye.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ye.equirect_vert,fragmentShader:Ye.equirect_frag},distance:{uniforms:Lt([_e.common,_e.displacementmap,{referencePosition:{value:new D},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ye.distance_vert,fragmentShader:Ye.distance_frag},shadow:{uniforms:Lt([_e.lights,_e.fog,{color:{value:new Ve(0)},opacity:{value:1}}]),vertexShader:Ye.shadow_vert,fragmentShader:Ye.shadow_frag}};rn.physical={uniforms:Lt([rn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ge},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ge},clearcoatNormalScale:{value:new me(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ge},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ge},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ge},sheen:{value:0},sheenColor:{value:new Ve(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ge},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ge},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ge},transmissionSamplerSize:{value:new me},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ge},attenuationDistance:{value:0},attenuationColor:{value:new Ve(0)},specularColor:{value:new Ve(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ge},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ge},anisotropyVector:{value:new me},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ge}}]),vertexShader:Ye.meshphysical_vert,fragmentShader:Ye.meshphysical_frag};const Ys={r:0,b:0,g:0},Cm=new tt,gh=new Ge;gh.set(-1,0,0,0,1,0,0,0,1);function Pm(i,e,t,n,s,r){const o=new Ve(0);let a=s===!0?0:1,l,c,h=null,d=0,u=null;function f(w){let A=w.isScene===!0?w.background:null;if(A&&A.isTexture){const S=w.backgroundBlurriness>0;A=e.get(A,S)}return A}function g(w){let A=!1;const S=f(w);S===null?m(o,a):S&&S.isColor&&(m(S,1),A=!0);const E=i.xr.getEnvironmentBlendMode();E==="additive"?t.buffers.color.setClear(0,0,0,1,r):E==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(i.autoClear||A)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function M(w,A){const S=f(A);S&&(S.isCubeTexture||S.mapping===Sr)?(c===void 0&&(c=new gt(new Fi(1,1,1),new dn({name:"BackgroundCubeMaterial",uniforms:Pi(rn.backgroundCube.uniforms),vertexShader:rn.backgroundCube.vertexShader,fragmentShader:rn.backgroundCube.fragmentShader,side:Ut,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(E,T,R){this.matrixWorld.copyPosition(R.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=S,c.material.uniforms.backgroundBlurriness.value=A.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(Cm.makeRotationFromEuler(A.backgroundRotation)).transpose(),S.isCubeTexture&&S.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(gh),c.material.toneMapped=$e.getTransfer(S.colorSpace)!==ot,(h!==S||d!==S.version||u!==i.toneMapping)&&(c.material.needsUpdate=!0,h=S,d=S.version,u=i.toneMapping),c.layers.enableAll(),w.unshift(c,c.geometry,c.material,0,0,null)):S&&S.isTexture&&(l===void 0&&(l=new gt(new ii(2,2),new dn({name:"BackgroundMaterial",uniforms:Pi(rn.background.uniforms),vertexShader:rn.background.vertexShader,fragmentShader:rn.background.fragmentShader,side:Zn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=S,l.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,l.material.toneMapped=$e.getTransfer(S.colorSpace)!==ot,S.matrixAutoUpdate===!0&&S.updateMatrix(),l.material.uniforms.uvTransform.value.copy(S.matrix),(h!==S||d!==S.version||u!==i.toneMapping)&&(l.material.needsUpdate=!0,h=S,d=S.version,u=i.toneMapping),l.layers.enableAll(),w.unshift(l,l.geometry,l.material,0,0,null))}function m(w,A){w.getRGB(Ys,dh(i)),t.buffers.color.setClear(Ys.r,Ys.g,Ys.b,A,r)}function p(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return o},setClearColor:function(w,A=1){o.set(w),a=A,m(o,a)},getClearAlpha:function(){return a},setClearAlpha:function(w){a=w,m(o,a)},render:g,addToRenderList:M,dispose:p}}function Lm(i,e){const t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=u(null);let r=s,o=!1;function a(N,z,V,U,O){let J=!1;const H=d(N,U,V,z);r!==H&&(r=H,c(r.object)),J=f(N,U,V,O),J&&g(N,U,V,O),O!==null&&e.update(O,i.ELEMENT_ARRAY_BUFFER),(J||o)&&(o=!1,S(N,z,V,U),O!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(O).buffer))}function l(){return i.createVertexArray()}function c(N){return i.bindVertexArray(N)}function h(N){return i.deleteVertexArray(N)}function d(N,z,V,U){const O=U.wireframe===!0;let J=n[z.id];J===void 0&&(J={},n[z.id]=J);const H=N.isInstancedMesh===!0?N.id:0;let ie=J[H];ie===void 0&&(ie={},J[H]=ie);let X=ie[V.id];X===void 0&&(X={},ie[V.id]=X);let $=X[O];return $===void 0&&($=u(l()),X[O]=$),$}function u(N){const z=[],V=[],U=[];for(let O=0;O<t;O++)z[O]=0,V[O]=0,U[O]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:z,enabledAttributes:V,attributeDivisors:U,object:N,attributes:{},index:null}}function f(N,z,V,U){const O=r.attributes,J=z.attributes;let H=0;const ie=V.getAttributes();for(const X in ie)if(ie[X].location>=0){const ee=O[X];let Ae=J[X];if(Ae===void 0&&(X==="instanceMatrix"&&N.instanceMatrix&&(Ae=N.instanceMatrix),X==="instanceColor"&&N.instanceColor&&(Ae=N.instanceColor)),ee===void 0||ee.attribute!==Ae||Ae&&ee.data!==Ae.data)return!0;H++}return r.attributesNum!==H||r.index!==U}function g(N,z,V,U){const O={},J=z.attributes;let H=0;const ie=V.getAttributes();for(const X in ie)if(ie[X].location>=0){let ee=J[X];ee===void 0&&(X==="instanceMatrix"&&N.instanceMatrix&&(ee=N.instanceMatrix),X==="instanceColor"&&N.instanceColor&&(ee=N.instanceColor));const Ae={};Ae.attribute=ee,ee&&ee.data&&(Ae.data=ee.data),O[X]=Ae,H++}r.attributes=O,r.attributesNum=H,r.index=U}function M(){const N=r.newAttributes;for(let z=0,V=N.length;z<V;z++)N[z]=0}function m(N){p(N,0)}function p(N,z){const V=r.newAttributes,U=r.enabledAttributes,O=r.attributeDivisors;V[N]=1,U[N]===0&&(i.enableVertexAttribArray(N),U[N]=1),O[N]!==z&&(i.vertexAttribDivisor(N,z),O[N]=z)}function w(){const N=r.newAttributes,z=r.enabledAttributes;for(let V=0,U=z.length;V<U;V++)z[V]!==N[V]&&(i.disableVertexAttribArray(V),z[V]=0)}function A(N,z,V,U,O,J,H){H===!0?i.vertexAttribIPointer(N,z,V,O,J):i.vertexAttribPointer(N,z,V,U,O,J)}function S(N,z,V,U){M();const O=U.attributes,J=V.getAttributes(),H=z.defaultAttributeValues;for(const ie in J){const X=J[ie];if(X.location>=0){let $=O[ie];if($===void 0&&(ie==="instanceMatrix"&&N.instanceMatrix&&($=N.instanceMatrix),ie==="instanceColor"&&N.instanceColor&&($=N.instanceColor)),$!==void 0){const ee=$.normalized,Ae=$.itemSize,ye=e.get($);if(ye===void 0)continue;const je=ye.buffer,We=ye.type,Ze=ye.bytesPerElement,q=We===i.INT||We===i.UNSIGNED_INT||$.gpuType===va;if($.isInterleavedBufferAttribute){const Q=$.data,le=Q.stride,Ne=$.offset;if(Q.isInstancedInterleavedBuffer){for(let Me=0;Me<X.locationSize;Me++)p(X.location+Me,Q.meshPerAttribute);N.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=Q.meshPerAttribute*Q.count)}else for(let Me=0;Me<X.locationSize;Me++)m(X.location+Me);i.bindBuffer(i.ARRAY_BUFFER,je);for(let Me=0;Me<X.locationSize;Me++)A(X.location+Me,Ae/X.locationSize,We,ee,le*Ze,(Ne+Ae/X.locationSize*Me)*Ze,q)}else{if($.isInstancedBufferAttribute){for(let Q=0;Q<X.locationSize;Q++)p(X.location+Q,$.meshPerAttribute);N.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=$.meshPerAttribute*$.count)}else for(let Q=0;Q<X.locationSize;Q++)m(X.location+Q);i.bindBuffer(i.ARRAY_BUFFER,je);for(let Q=0;Q<X.locationSize;Q++)A(X.location+Q,Ae/X.locationSize,We,ee,Ae*Ze,Ae/X.locationSize*Q*Ze,q)}}else if(H!==void 0){const ee=H[ie];if(ee!==void 0)switch(ee.length){case 2:i.vertexAttrib2fv(X.location,ee);break;case 3:i.vertexAttrib3fv(X.location,ee);break;case 4:i.vertexAttrib4fv(X.location,ee);break;default:i.vertexAttrib1fv(X.location,ee)}}}}w()}function E(){b();for(const N in n){const z=n[N];for(const V in z){const U=z[V];for(const O in U){const J=U[O];for(const H in J)h(J[H].object),delete J[H];delete U[O]}}delete n[N]}}function T(N){if(n[N.id]===void 0)return;const z=n[N.id];for(const V in z){const U=z[V];for(const O in U){const J=U[O];for(const H in J)h(J[H].object),delete J[H];delete U[O]}}delete n[N.id]}function R(N){for(const z in n){const V=n[z];for(const U in V){const O=V[U];if(O[N.id]===void 0)continue;const J=O[N.id];for(const H in J)h(J[H].object),delete J[H];delete O[N.id]}}}function x(N){for(const z in n){const V=n[z],U=N.isInstancedMesh===!0?N.id:0,O=V[U];if(O!==void 0){for(const J in O){const H=O[J];for(const ie in H)h(H[ie].object),delete H[ie];delete O[J]}delete V[U],Object.keys(V).length===0&&delete n[z]}}}function b(){P(),o=!0,r!==s&&(r=s,c(r.object))}function P(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:b,resetDefaultState:P,dispose:E,releaseStatesOfGeometry:T,releaseStatesOfObject:x,releaseStatesOfProgram:R,initAttributes:M,enableAttribute:m,disableUnusedAttributes:w}}function Im(i,e,t){let n;function s(l){n=l}function r(l,c){i.drawArrays(n,l,c),t.update(c,n,1)}function o(l,c,h){h!==0&&(i.drawArraysInstanced(n,l,c,h),t.update(c,n,h))}function a(l,c,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,h);let u=0;for(let f=0;f<h;f++)u+=c[f];t.update(u,n,1)}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a}function Dm(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){const R=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(R.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(R){return!(R!==$t&&n.convert(R)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(R){const x=R===un&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(R!==kt&&R!==Zt&&!x&&n.convert(R)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function l(R){if(R==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";R="mediump"}return R==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const h=l(c);h!==c&&(Be("WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);const d=t.logarithmicDepthBuffer===!0,u=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&u===!1&&Be("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");const f=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),M=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),p=i.getParameter(i.MAX_VERTEX_ATTRIBS),w=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),A=i.getParameter(i.MAX_VARYING_VECTORS),S=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),E=i.getParameter(i.MAX_SAMPLES),T=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:d,reversedDepthBuffer:u,maxTextures:f,maxVertexTextures:g,maxTextureSize:M,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:w,maxVaryings:A,maxFragmentUniforms:S,maxSamples:E,samples:T}}function Nm(i){const e=this;let t=null,n=0,s=!1,r=!1;const o=new Mn,a=new Ge,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(d,u){const f=d.length!==0||u||n!==0||s;return s=u,n=d.length,f},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(d,u){t=h(d,u,0)},this.setState=function(d,u,f){const g=d.clippingPlanes,M=d.clipIntersection,m=d.clipShadows,p=i.get(d);if(!s||g===null||g.length===0||r&&!m)r?h(null):c();else{const w=r?0:n,A=w*4;let S=p.clippingState||null;l.value=S,S=h(g,u,A,f);for(let E=0;E!==A;++E)S[E]=t[E];p.clippingState=S,this.numIntersection=M?this.numPlanes:0,this.numPlanes+=w}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(d,u,f,g){const M=d!==null?d.length:0;let m=null;if(M!==0){if(m=l.value,g!==!0||m===null){const p=f+M*4,w=u.matrixWorldInverse;a.getNormalMatrix(w),(m===null||m.length<p)&&(m=new Float32Array(p));for(let A=0,S=f;A!==M;++A,S+=4)o.copy(d[A]).applyMatrix4(w,a),o.normal.toArray(m,S),m[S+3]=o.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=M,e.numIntersection=0,m}}const wi=4,Um=6,Fm=20,Om=256,Yi=new Er,Kl=new Ve;let oo=null,ao=0,lo=0,co=!1;const Bm=new D,Yn=new D;class Jl{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,s=100,r={}){const{size:o=256,position:a=Bm}=r;oo=this._renderer.getRenderTarget(),ao=this._renderer.getActiveCubeFace(),lo=this._renderer.getActiveMipmapLevel(),co=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);const l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,n,s,l,a),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Ql(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=$l(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(oo,ao,lo),this._renderer.xr.enabled=co,e.scissorTest=!1,vi(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===$n||e.mapping===Ri?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),oo=this._renderer.getRenderTarget(),ao=this._renderer.getActiveCubeFace(),lo=this._renderer.getActiveMipmapLevel(),co=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Et,minFilter:Et,generateMipmaps:!1,type:un,format:$t,colorSpace:ur,depthBuffer:!1},s=Zl(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Zl(e,t,n);const{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=km(r)),this._blurMaterial=Gm(r,e,t),this._ggxMaterial=zm(r,e,t)}return s}_compileMaterial(e){const t=new gt(new wt,e);this._renderer.compile(t,Yi)}_sceneToCubeUV(e,t,n,s,r){const l=new Jt(90,1,t,n),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],d=this._renderer,u=d.autoClear,f=d.toneMapping;d.getClearColor(Kl),d.toneMapping=cn,d.autoClear=!1,d.state.buffers.depth.getReversed()&&(d.setRenderTarget(s),d.clearDepth(),d.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new gt(new Fi,new Ui({name:"PMREM.Background",side:Ut,depthWrite:!1,depthTest:!1})));const M=this._backgroundBox,m=M.material;let p=!1;const w=e.background;w?w.isColor&&(m.color.copy(w),e.background=null,p=!0):(m.color.copy(Kl),p=!0);for(let A=0;A<6;A++){const S=A%3;S===0?(l.up.set(0,c[A],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+h[A],r.y,r.z)):S===1?(l.up.set(0,0,c[A]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+h[A],r.z)):(l.up.set(0,c[A],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+h[A]));const E=this._cubeSize;vi(s,S*E,A>2?E:0,E,E),d.setRenderTarget(s),p&&d.render(M,l),d.render(e,l)}d.toneMapping=f,d.autoClear=u,e.background=w}_textureToCubeUV(e,t){const n=this._renderer,s=e.mapping===$n||e.mapping===Ri;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Ql()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=$l());const r=s?this._cubemapMaterial:this._equirectMaterial,o=this._lodMeshes[0];o.material=r;const a=r.uniforms;a.envMap.value=e;const l=this._cubeSize;vi(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(o,Yi)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=n}_applyGGXFilter(e,t,n){const s=this._renderer,r=this._pingPongRenderTarget,o=this._ggxMaterial,a=this._lodMeshes[n];a.material=o;const l=o.uniforms,c=n/(this._lodMeshes.length-1),h=t/(this._lodMeshes.length-1),d=Math.sqrt(c*c-h*h),u=c*1.25,f=d*u,{_lodMax:g}=this,M=this._sizeLods[n],m=3*M*(n>g-wi?n-g+wi:0),p=4*(this._cubeSize-M);l.envMap.value=e.texture,l.roughness.value=f,l.mipInt.value=g-t,vi(r,m,p,3*M,2*M),s.setRenderTarget(r),s.render(a,Yi),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=g-n,vi(e,m,p,3*M,2*M),s.setRenderTarget(e),s.render(a,Yi)}_blur(e,t,n,s){const r=this._pingPongRenderTarget,o=Math.min(s,Math.PI)/Math.SQRT2;this._blurPass(e,r,t,n,o),this._blurPass(r,e,n,n,o)}_blurPass(e,t,n,s,r){const o=this._renderer,a=this._blurMaterial,l=this._lodMeshes[s];l.material=a;const c=a.uniforms;c.envMap.value=e.texture,c.sigma.value=r,c.mipInt.value=this._lodMax-n;const h=this._sizeLods[s],d=3*h*(s>this._lodMax-wi?s-this._lodMax+wi:0),u=4*(this._cubeSize-h);vi(t,d,u,3*h,2*h),o.setRenderTarget(t),o.render(l,Yi)}}function km(i){const e=[],t=[];let n=i;const s=i-wi+1+Um;for(let r=0;r<s;r++){const o=Math.pow(2,n);e.push(o);const a=1/(o-2),l=-a,c=1+a,h=[l,l,c,l,c,c,l,l,c,c,l,c],d=6,u=6,f=3,g=new Float32Array(f*u*d),M=new Float32Array(f*u*d);for(let p=0;p<d;p++){const w=p%3*2/3-1,A=p>2?0:-1,S=[w,A,0,w+2/3,A,0,w+2/3,A+1,0,w,A,0,w+2/3,A+1,0,w,A+1,0];g.set(S,f*u*p);for(let E=0;E<u;E++){const T=h[E*2]*2-1,R=h[E*2+1]*2-1;p===0?Yn.set(1,R,T):p===1?Yn.set(-T,1,-R):p===2?Yn.set(-T,R,1):p===3?Yn.set(-1,R,-T):p===4?Yn.set(-T,-1,R):Yn.set(T,R,-1),Yn.toArray(M,(p*u+E)*f)}}const m=new wt;m.setAttribute("position",new Nt(g,f)),m.setAttribute("outputDirection",new Nt(M,f)),t.push(new gt(m,null)),n>wi&&n--}return{lodMeshes:t,sizeLods:e}}function Zl(i,e,t){const n=new jt(i,e,t);return n.texture.mapping=Sr,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function vi(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function zm(i,e,t){return new dn({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:Om,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:wr(),fragmentShader:`

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
		`,blending:En,depthTest:!1,depthWrite:!1})}function Gm(i,e,t){return new dn({name:"SphericalGaussianBlur",defines:{SAMPLES:Fm,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:wr(),fragmentShader:`

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
		`,blending:En,depthTest:!1,depthWrite:!1})}function $l(){return new dn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:wr(),fragmentShader:`

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
		`,blending:En,depthTest:!1,depthWrite:!1})}function Ql(){return new dn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:wr(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:En,depthTest:!1,depthWrite:!1})}function wr(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}class _h extends jt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new nh(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new Fi(5,5,5),r=new dn({name:"CubemapFromEquirect",uniforms:Pi(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Ut,blending:En});r.uniforms.tEquirect.value=t;const o=new gt(s,r),a=t.minFilter;return t.minFilter===qn&&(t.minFilter=Et),new Vd(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){const r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,s);e.setRenderTarget(r)}}function Hm(i){let e=new WeakMap,t=new WeakMap,n=null;function s(u,f=!1){return u==null?null:f?o(u):r(u)}function r(u){if(u&&u.isTexture){const f=u.mapping;if(f===Cr||f===Pr)if(e.has(u)){const g=e.get(u).texture;return a(g,u.mapping)}else{const g=u.image;if(g&&g.height>0){const M=new _h(g.height);return M.fromEquirectangularTexture(i,u),e.set(u,M),u.addEventListener("dispose",c),a(M.texture,u.mapping)}else return null}}return u}function o(u){if(u&&u.isTexture){const f=u.mapping,g=f===Cr||f===Pr,M=f===$n||f===Ri;if(g||M){let m=t.get(u);const p=m!==void 0?m.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==p)return n===null&&(n=new Jl(i)),m=g?n.fromEquirectangular(u,m):n.fromCubemap(u,m),m.texture.pmremVersion=u.pmremVersion,t.set(u,m),m.texture;if(m!==void 0)return m.texture;{const w=u.image;return g&&w&&w.height>0||M&&w&&l(w)?(n===null&&(n=new Jl(i)),m=g?n.fromEquirectangular(u):n.fromCubemap(u),m.texture.pmremVersion=u.pmremVersion,t.set(u,m),u.addEventListener("dispose",h),m.texture):null}}}return u}function a(u,f){return f===Cr?u.mapping=$n:f===Pr&&(u.mapping=Ri),u}function l(u){let f=0;const g=6;for(let M=0;M<g;M++)u[M]!==void 0&&f++;return f===g}function c(u){const f=u.target;f.removeEventListener("dispose",c);const g=e.get(f);g!==void 0&&(e.delete(f),g.dispose())}function h(u){const f=u.target;f.removeEventListener("dispose",h);const g=t.get(f);g!==void 0&&(t.delete(f),g.dispose())}function d(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:d}}function Vm(i){const e={};function t(n){if(e[n]!==void 0)return e[n];const s=i.getExtension(n);return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const s=t(n);return s===null&&bi("WebGLRenderer: "+n+" extension not supported."),s}}}function Wm(i,e,t,n){const s={},r=new WeakMap;function o(d){const u=d.target;u.index!==null&&e.remove(u.index);for(const g in u.attributes)e.remove(u.attributes[g]);u.removeEventListener("dispose",o),delete s[u.id];const f=r.get(u);f&&(e.remove(f),r.delete(u)),n.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,t.memory.geometries--}function a(d,u){return s[u.id]===!0||(u.addEventListener("dispose",o),s[u.id]=!0,t.memory.geometries++),u}function l(d){const u=d.attributes;for(const f in u)e.update(u[f],i.ARRAY_BUFFER)}function c(d){const u=[],f=d.index,g=d.attributes.position;let M=0;if(g===void 0)return;if(f!==null){const w=f.array;M=f.version;for(let A=0,S=w.length;A<S;A+=3){const E=w[A+0],T=w[A+1],R=w[A+2];u.push(E,T,T,R,R,E)}}else{const w=g.array;M=g.version;for(let A=0,S=w.length/3-1;A<S;A+=3){const E=A+0,T=A+1,R=A+2;u.push(E,T,T,R,R,E)}}const m=new(g.count>=65535?eh:jc)(u,1);m.version=M;const p=r.get(d);p&&e.remove(p),r.set(d,m)}function h(d){const u=r.get(d);if(u){const f=d.index;f!==null&&u.version<f.version&&c(d)}else c(d);return r.get(d)}return{get:a,update:l,getWireframeAttribute:h}}function Xm(i,e,t){let n;function s(d){n=d}let r,o;function a(d){r=d.type,o=d.bytesPerElement}function l(d,u){i.drawElements(n,u,r,d*o),t.update(u,n,1)}function c(d,u,f){f!==0&&(i.drawElementsInstanced(n,u,r,d*o,f),t.update(u,n,f))}function h(d,u,f){if(f===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,u,0,r,d,0,f);let M=0;for(let m=0;m<f;m++)M+=u[m];t.update(M,n,1)}this.setMode=s,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=h}function Ym(i){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(t.calls++,o){case i.TRIANGLES:t.triangles+=a*(r/3);break;case i.LINES:t.lines+=a*(r/2);break;case i.LINE_STRIP:t.lines+=a*(r-1);break;case i.LINE_LOOP:t.lines+=a*r;break;case i.POINTS:t.points+=a*r;break;default:Qe("WebGLInfo: Unknown draw mode:",o);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function qm(i,e,t){const n=new WeakMap,s=new ft;function r(o,a,l){const c=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,d=h!==void 0?h.length:0;let u=n.get(a);if(u===void 0||u.count!==d){let P=function(){x.dispose(),n.delete(a),a.removeEventListener("dispose",P)};var f=P;u!==void 0&&u.texture.dispose();const g=a.morphAttributes.position!==void 0,M=a.morphAttributes.normal!==void 0,m=a.morphAttributes.color!==void 0,p=a.morphAttributes.position||[],w=a.morphAttributes.normal||[],A=a.morphAttributes.color||[];let S=0;g===!0&&(S=1),M===!0&&(S=2),m===!0&&(S=3);let E=a.attributes.position.count*S,T=1;E>e.maxTextureSize&&(T=Math.ceil(E/e.maxTextureSize),E=e.maxTextureSize);const R=new Float32Array(E*T*4*d),x=new $c(R,E,T,d);x.type=Zt,x.needsUpdate=!0;const b=S*4;for(let N=0;N<d;N++){const z=p[N],V=w[N],U=A[N],O=E*T*4*N;for(let J=0;J<z.count;J++){const H=J*b;g===!0&&(s.fromBufferAttribute(z,J),R[O+H+0]=s.x,R[O+H+1]=s.y,R[O+H+2]=s.z,R[O+H+3]=0),M===!0&&(s.fromBufferAttribute(V,J),R[O+H+4]=s.x,R[O+H+5]=s.y,R[O+H+6]=s.z,R[O+H+7]=0),m===!0&&(s.fromBufferAttribute(U,J),R[O+H+8]=s.x,R[O+H+9]=s.y,R[O+H+10]=s.z,R[O+H+11]=U.itemSize===4?s.w:1)}}u={count:d,texture:x,size:new me(E,T)},n.set(a,u),a.addEventListener("dispose",P)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",o.morphTexture,t);else{let g=0;for(let m=0;m<c.length;m++)g+=c[m];const M=a.morphTargetsRelative?1:1-g;l.getUniforms().setValue(i,"morphTargetBaseInfluence",M),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",u.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",u.size)}return{update:r}}function Km(i,e,t,n,s){let r=new WeakMap;function o(c){const h=s.render.frame,d=c.geometry,u=e.get(c,d);if(r.get(u)!==h&&(e.update(u),r.set(u,h)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==h&&(t.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,i.ARRAY_BUFFER),r.set(c,h))),c.isSkinnedMesh){const f=c.skeleton;r.get(f)!==h&&(f.update(),r.set(f,h))}return u}function a(){r=new WeakMap}function l(c){const h=c.target;h.removeEventListener("dispose",l),n.releaseStatesOfObject(h),t.remove(h.instanceMatrix),h.instanceColor!==null&&t.remove(h.instanceColor)}return{update:o,dispose:a}}const Jm={[Oc]:"LINEAR_TONE_MAPPING",[Bc]:"REINHARD_TONE_MAPPING",[kc]:"CINEON_TONE_MAPPING",[xa]:"ACES_FILMIC_TONE_MAPPING",[Gc]:"AGX_TONE_MAPPING",[Hc]:"NEUTRAL_TONE_MAPPING",[zc]:"CUSTOM_TONE_MAPPING"};function Zm(i,e,t,n,s,r){const o=new jt(e,t,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1});let a=null,l=null;const c=new wt;c.setAttribute("position",new dt([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new dt([0,2,0,0,2,0],2));const h=new Fd({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),d=new gt(c,h),u=new Er(-1,1,1,-1,0,1);let f=null,g=null,M=!1,m,p=null,w=[],A=!1;this.setSize=function(S,E){o.setSize(S,E),a!==null&&a.setSize(S,E),l!==null&&l.setSize(S,E);for(let T=0;T<w.length;T++){const R=w[T];R.setSize&&R.setSize(S,E)}},this.setEffects=function(S){w=S,A=w.length>0&&w[0].isRenderPass===!0;const E=o.width,T=o.height;w.length>0&&a===null&&(a=new jt(E,T,{type:un,depthBuffer:!1,stencilBuffer:!1}),l=new jt(E,T,{type:un,depthBuffer:!1,stencilBuffer:!1}));for(let R=0;R<w.length;R++){const x=w[R];x.setSize&&x.setSize(E,T)}},this.begin=function(S,E){if(M||S.toneMapping===cn&&w.length===0)return!1;if(p=E,E!==null){const T=E.width,R=E.height;(o.width!==T||o.height!==R)&&this.setSize(T,R)}return A===!1&&S.setRenderTarget(o),m=S.toneMapping,S.toneMapping=cn,!0},this.hasRenderPass=function(){return A},this.end=function(S,E){S.toneMapping=m,M=!0;let T=o,R=a;for(let x=0;x<w.length;x++){const b=w[x];b.enabled!==!1&&(b.render(S,R,T,E),b.needsSwap!==!1&&(T=R,R=R===a?l:a))}if(f!==S.outputColorSpace||g!==S.toneMapping){f=S.outputColorSpace,g=S.toneMapping,h.defines={},$e.getTransfer(f)===ot&&(h.defines.SRGB_TRANSFER="");const x=Jm[g];x&&(h.defines[x]=""),h.needsUpdate=!0}h.uniforms.tDiffuse.value=T.texture,S.setRenderTarget(p),S.render(d,u),p=null,M=!1},this.isCompositing=function(){return M},this.dispose=function(){o.dispose(),a!==null&&a.dispose(),l!==null&&l.dispose(),c.dispose(),h.dispose()}}const xh=new It,da=new hs(1,1),vh=new $c,Mh=new Iu,Sh=new nh,jl=[],ec=[],tc=new Float32Array(16),nc=new Float32Array(9),ic=new Float32Array(4);function Oi(i,e,t){const n=i[0];if(n<=0||n>0)return i;const s=e*t;let r=jl[s];if(r===void 0&&(r=new Float32Array(s),jl[s]=r),e!==0){n.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,i[o].toArray(r,a)}return r}function Mt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function St(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function Tr(i,e){let t=ec[e];t===void 0&&(t=new Int32Array(e),ec[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function $m(i,e){const t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function Qm(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Mt(t,e))return;i.uniform2fv(this.addr,e),St(t,e)}}function jm(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Mt(t,e))return;i.uniform3fv(this.addr,e),St(t,e)}}function eg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Mt(t,e))return;i.uniform4fv(this.addr,e),St(t,e)}}function tg(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Mt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),St(t,e)}else{if(Mt(t,n))return;ic.set(n),i.uniformMatrix2fv(this.addr,!1,ic),St(t,n)}}function ng(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Mt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),St(t,e)}else{if(Mt(t,n))return;nc.set(n),i.uniformMatrix3fv(this.addr,!1,nc),St(t,n)}}function ig(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Mt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),St(t,e)}else{if(Mt(t,n))return;tc.set(n),i.uniformMatrix4fv(this.addr,!1,tc),St(t,n)}}function sg(i,e){const t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function rg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Mt(t,e))return;i.uniform2iv(this.addr,e),St(t,e)}}function og(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Mt(t,e))return;i.uniform3iv(this.addr,e),St(t,e)}}function ag(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Mt(t,e))return;i.uniform4iv(this.addr,e),St(t,e)}}function lg(i,e){const t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function cg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Mt(t,e))return;i.uniform2uiv(this.addr,e),St(t,e)}}function hg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Mt(t,e))return;i.uniform3uiv(this.addr,e),St(t,e)}}function ug(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Mt(t,e))return;i.uniform4uiv(this.addr,e),St(t,e)}}function dg(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(da.compareFunction=t.isReversedDepthBuffer()?Aa:ba,r=da):r=xh,t.setTexture2D(e||r,s)}function fg(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||Mh,s)}function pg(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||Sh,s)}function mg(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||vh,s)}function gg(i){switch(i){case 5126:return $m;case 35664:return Qm;case 35665:return jm;case 35666:return eg;case 35674:return tg;case 35675:return ng;case 35676:return ig;case 5124:case 35670:return sg;case 35667:case 35671:return rg;case 35668:case 35672:return og;case 35669:case 35673:return ag;case 5125:return lg;case 36294:return cg;case 36295:return hg;case 36296:return ug;case 35678:case 36198:case 36298:case 36306:case 35682:return dg;case 35679:case 36299:case 36307:return fg;case 35680:case 36300:case 36308:case 36293:return pg;case 36289:case 36303:case 36311:case 36292:return mg}}function _g(i,e){i.uniform1fv(this.addr,e)}function xg(i,e){const t=Oi(e,this.size,2);i.uniform2fv(this.addr,t)}function vg(i,e){const t=Oi(e,this.size,3);i.uniform3fv(this.addr,t)}function Mg(i,e){const t=Oi(e,this.size,4);i.uniform4fv(this.addr,t)}function Sg(i,e){const t=Oi(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function yg(i,e){const t=Oi(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function Eg(i,e){const t=Oi(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function wg(i,e){i.uniform1iv(this.addr,e)}function Tg(i,e){i.uniform2iv(this.addr,e)}function bg(i,e){i.uniform3iv(this.addr,e)}function Ag(i,e){i.uniform4iv(this.addr,e)}function Rg(i,e){i.uniform1uiv(this.addr,e)}function Cg(i,e){i.uniform2uiv(this.addr,e)}function Pg(i,e){i.uniform3uiv(this.addr,e)}function Lg(i,e){i.uniform4uiv(this.addr,e)}function Ig(i,e,t){const n=this.cache,s=e.length,r=Tr(t,s);Mt(n,r)||(i.uniform1iv(this.addr,r),St(n,r));let o;this.type===i.SAMPLER_2D_SHADOW?o=da:o=xh;for(let a=0;a!==s;++a)t.setTexture2D(e[a]||o,r[a])}function Dg(i,e,t){const n=this.cache,s=e.length,r=Tr(t,s);Mt(n,r)||(i.uniform1iv(this.addr,r),St(n,r));for(let o=0;o!==s;++o)t.setTexture3D(e[o]||Mh,r[o])}function Ng(i,e,t){const n=this.cache,s=e.length,r=Tr(t,s);Mt(n,r)||(i.uniform1iv(this.addr,r),St(n,r));for(let o=0;o!==s;++o)t.setTextureCube(e[o]||Sh,r[o])}function Ug(i,e,t){const n=this.cache,s=e.length,r=Tr(t,s);Mt(n,r)||(i.uniform1iv(this.addr,r),St(n,r));for(let o=0;o!==s;++o)t.setTexture2DArray(e[o]||vh,r[o])}function Fg(i){switch(i){case 5126:return _g;case 35664:return xg;case 35665:return vg;case 35666:return Mg;case 35674:return Sg;case 35675:return yg;case 35676:return Eg;case 5124:case 35670:return wg;case 35667:case 35671:return Tg;case 35668:case 35672:return bg;case 35669:case 35673:return Ag;case 5125:return Rg;case 36294:return Cg;case 36295:return Pg;case 36296:return Lg;case 35678:case 36198:case 36298:case 36306:case 35682:return Ig;case 35679:case 36299:case 36307:return Dg;case 35680:case 36300:case 36308:case 36293:return Ng;case 36289:case 36303:case 36311:case 36292:return Ug}}class Og{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=gg(t.type)}}class Bg{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Fg(t.type)}}class kg{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const s=this.seq;for(let r=0,o=s.length;r!==o;++r){const a=s[r];a.setValue(e,t[a.id],n)}}}const ho=/(\w+)(\])?(\[|\.)?/g;function sc(i,e){i.seq.push(e),i.map[e.id]=e}function zg(i,e,t){const n=i.name,s=n.length;for(ho.lastIndex=0;;){const r=ho.exec(n),o=ho.lastIndex;let a=r[1];const l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===s){sc(t,c===void 0?new Og(a,i,e):new Bg(a,i,e));break}else{let d=t.map[a];d===void 0&&(d=new kg(a),sc(t,d)),t=d}}}class ar{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let o=0;o<n;++o){const a=e.getActiveUniform(t,o),l=e.getUniformLocation(t,a.name);zg(a,l,this)}const s=[],r=[];for(const o of this.seq)o.type===e.SAMPLER_2D_SHADOW||o.type===e.SAMPLER_CUBE_SHADOW||o.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(o):r.push(o);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,n,s){const r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){const s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,o=t.length;r!==o;++r){const a=t[r],l=n[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,s)}}static seqWithValue(e,t){const n=[];for(let s=0,r=e.length;s!==r;++s){const o=e[s];o.id in t&&n.push(o)}return n}}function rc(i,e,t){const n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}const Gg=37297;let Hg=0;function Vg(i,e){const t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=s;o<r;o++){const a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}const oc=new Ge;function Wg(i){$e._getMatrix(oc,$e.workingColorSpace,i);const e=`mat3( ${oc.elements.map(t=>t.toFixed(4))} )`;switch($e.getTransfer(i)){case dr:return[e,"LinearTransferOETF"];case ot:return[e,"sRGBTransferOETF"];default:return Be("WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function ac(i,e,t){const n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";const o=/ERROR: 0:(\d+)/.exec(r);if(o){const a=parseInt(o[1]);return t.toUpperCase()+`

`+r+`

`+Vg(i.getShaderSource(e),a)}else return r}function Xg(i,e){const t=Wg(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}const Yg={[Oc]:"Linear",[Bc]:"Reinhard",[kc]:"Cineon",[xa]:"ACESFilmic",[Gc]:"AgX",[Hc]:"Neutral",[zc]:"Custom"};function qg(i,e){const t=Yg[e];return t===void 0?(Be("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const qs=new D;function Kg(){$e.getLuminanceCoefficients(qs);const i=qs.x.toFixed(4),e=qs.y.toFixed(4),t=qs.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Jg(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(ji).join(`
`)}function Zg(i){const e=[];for(const t in i){const n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function $g(i,e){const t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const r=i.getActiveAttrib(e,s),o=r.name;let a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:i.getAttribLocation(e,o),locationSize:a}}return t}function ji(i){return i!==""}function lc(i,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function cc(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const Qg=/^[ \t]*#include +<([\w\d./]+)>/gm;function fa(i){return i.replace(Qg,e0)}const jg=new Map;function e0(i,e){let t=Ye[e];if(t===void 0){const n=jg.get(e);if(n!==void 0)t=Ye[n],Be('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return fa(t)}const t0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function hc(i){return i.replace(t0,n0)}function n0(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function uc(i){let e=`precision ${i.precision} float;
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
#define LOW_PRECISION`),e}const i0={[tr]:"SHADOWMAP_TYPE_PCF",[$i]:"SHADOWMAP_TYPE_VSM"};function s0(i){return i0[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const r0={[$n]:"ENVMAP_TYPE_CUBE",[Ri]:"ENVMAP_TYPE_CUBE",[Sr]:"ENVMAP_TYPE_CUBE_UV"};function o0(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":r0[i.envMapMode]||"ENVMAP_TYPE_CUBE"}const a0={[Ri]:"ENVMAP_MODE_REFRACTION"};function l0(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":a0[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}const c0={[Fc]:"ENVMAP_BLENDING_MULTIPLY",[cu]:"ENVMAP_BLENDING_MIX",[hu]:"ENVMAP_BLENDING_ADD"};function h0(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":c0[i.combine]||"ENVMAP_BLENDING_NONE"}function u0(i){const e=i.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),7*16)),texelHeight:n,maxMip:t}}function d0(i,e,t,n){const s=i.getContext(),r=t.defines;let o=t.vertexShader,a=t.fragmentShader;const l=s0(t),c=o0(t),h=l0(t),d=h0(t),u=u0(t),f=Jg(t),g=Zg(r),M=s.createProgram();let m,p,w=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(ji).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(ji).join(`
`),p.length>0&&(p+=`
`)):(m=[uc(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(ji).join(`
`),p=[uc(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+d:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==cn?"#define TONE_MAPPING":"",t.toneMapping!==cn?Ye.tonemapping_pars_fragment:"",t.toneMapping!==cn?qg("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Ye.colorspace_pars_fragment,Xg("linearToOutputTexel",t.outputColorSpace),Kg(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(ji).join(`
`)),o=fa(o),o=lc(o,t),o=cc(o,t),a=fa(a),a=lc(a,t),a=cc(a,t),o=hc(o),a=hc(a),t.isRawShaderMaterial!==!0&&(w=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",t.glslVersion===ll?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===ll?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const A=w+m+o,S=w+p+a,E=rc(s,s.VERTEX_SHADER,A),T=rc(s,s.FRAGMENT_SHADER,S);s.attachShader(M,E),s.attachShader(M,T),t.index0AttributeName!==void 0?s.bindAttribLocation(M,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(M,0,"position"),s.linkProgram(M);function R(N){if(i.debug.checkShaderErrors){const z=s.getProgramInfoLog(M)||"",V=s.getShaderInfoLog(E)||"",U=s.getShaderInfoLog(T)||"",O=z.trim(),J=V.trim(),H=U.trim();let ie=!0,X=!0;if(s.getProgramParameter(M,s.LINK_STATUS)===!1)if(ie=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,M,E,T);else{const $=ac(s,E,"vertex"),ee=ac(s,T,"fragment");Qe("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(M,s.VALIDATE_STATUS)+`

Material Name: `+N.name+`
Material Type: `+N.type+`

Program Info Log: `+O+`
`+$+`
`+ee)}else O!==""?Be("WebGLProgram: Program Info Log:",O):(J===""||H==="")&&(X=!1);X&&(N.diagnostics={runnable:ie,programLog:O,vertexShader:{log:J,prefix:m},fragmentShader:{log:H,prefix:p}})}s.deleteShader(E),s.deleteShader(T),x=new ar(s,M),b=$g(s,M)}let x;this.getUniforms=function(){return x===void 0&&R(this),x};let b;this.getAttributes=function(){return b===void 0&&R(this),b};let P=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return P===!1&&(P=s.getProgramParameter(M,Gg)),P},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(M),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Hg++,this.cacheKey=e,this.usedTimes=1,this.program=M,this.vertexShader=E,this.fragmentShader=T,this}let f0=0;class p0{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){const s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new m0(e),t.set(e,n)),n}}class m0{constructor(e){this.id=f0++,this.code=e,this.usedTimes=0}}function g0(i){return i===Qn||i===cr||i===hr}function _0(i,e,t,n,s,r){const o=new Ca,a=new p0,l=new Set,c=[],h=new Map,d=n.logarithmicDepthBuffer;let u=n.precision;const f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(x){return l.add(x),x===0?"uv":`uv${x}`}function M(x,b,P,N,z,V){const U=N.fog,O=z.geometry,J=x.isMeshStandardMaterial||x.isMeshLambertMaterial||x.isMeshPhongMaterial?N.environment:null,H=x.isMeshStandardMaterial||x.isMeshLambertMaterial&&!x.envMap||x.isMeshPhongMaterial&&!x.envMap,ie=e.get(x.envMap||J,H),X=ie&&ie.mapping===Sr?ie.image.height:null,$=f[x.type];x.precision!==null&&(u=n.getMaxPrecision(x.precision),u!==x.precision&&Be("WebGLProgram.getParameters:",x.precision,"not supported, using",u,"instead."));const ee=O.morphAttributes.position||O.morphAttributes.normal||O.morphAttributes.color,Ae=ee!==void 0?ee.length:0;let ye=0;O.morphAttributes.position!==void 0&&(ye=1),O.morphAttributes.normal!==void 0&&(ye=2),O.morphAttributes.color!==void 0&&(ye=3);let je,We,Ze,q;if($){const ct=rn[$];je=ct.vertexShader,We=ct.fragmentShader}else{je=x.vertexShader,We=x.fragmentShader;const ct=a.getVertexShaderStage(x),it=a.getFragmentShaderStage(x);a.update(x,ct,it),Ze=ct.id,q=it.id}const Q=i.getRenderTarget(),le=i.state.buffers.depth.getReversed(),Ne=z.isInstancedMesh===!0,Me=z.isBatchedMesh===!0,Ue=!!x.map,rt=!!x.matcap,te=!!ie,se=!!x.aoMap,re=!!x.lightMap,oe=!!x.bumpMap&&x.wireframe===!1,he=!!x.normalMap,Fe=!!x.displacementMap,De=!!x.emissiveMap,ke=!!x.metalnessMap,ze=!!x.roughnessMap,C=x.anisotropy>0,nt=x.clearcoat>0,qe=x.dispersion>0,y=x.retroreflectivity>0,_=x.iridescence>0,F=x.sheen>0,G=x.transmission>0,Y=C&&!!x.anisotropyMap,ae=nt&&!!x.clearcoatMap,ce=nt&&!!x.clearcoatNormalMap,K=nt&&!!x.clearcoatRoughnessMap,j=_&&!!x.iridescenceMap,ue=_&&!!x.iridescenceThicknessMap,Pe=F&&!!x.sheenColorMap,ge=F&&!!x.sheenRoughnessMap,de=!!x.specularMap,Le=!!x.specularColorMap,Oe=!!x.specularIntensityMap,He=G&&!!x.transmissionMap,I=G&&!!x.thicknessMap,fe=!!x.gradientMap,Z=!!x.alphaMap,pe=x.alphaTest>0,Se=!!x.alphaHash,ne=!!x.extensions;let Ie=cn;x.toneMapped&&(Q===null||Q.isXRRenderTarget===!0)&&(Ie=i.toneMapping);const Re={shaderID:$,shaderType:x.type,shaderName:x.name,vertexShader:je,fragmentShader:We,defines:x.defines,customVertexShaderID:Ze,customFragmentShaderID:q,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:u,batching:Me,batchingColor:Me&&z._colorsTexture!==null,instancing:Ne,instancingColor:Ne&&z.instanceColor!==null,instancingMorph:Ne&&z.morphTexture!==null,outputColorSpace:Q===null?i.outputColorSpace:Q.isXRRenderTarget===!0?Q.texture.colorSpace:$e.workingColorSpace,alphaToCoverage:!!x.alphaToCoverage,map:Ue,matcap:rt,envMap:te,envMapMode:te&&ie.mapping,envMapCubeUVHeight:X,aoMap:se,lightMap:re,bumpMap:oe,normalMap:he,displacementMap:Fe,emissiveMap:De,normalMapObjectSpace:he&&x.normalMapType===fu,normalMapTangentSpace:he&&x.normalMapType===oa,packedNormalMap:he&&x.normalMapType===oa&&g0(x.normalMap.format),metalnessMap:ke,roughnessMap:ze,anisotropy:C,anisotropyMap:Y,clearcoat:nt,clearcoatMap:ae,clearcoatNormalMap:ce,clearcoatRoughnessMap:K,dispersion:qe,retroreflection:y,iridescence:_,iridescenceMap:j,iridescenceThicknessMap:ue,sheen:F,sheenColorMap:Pe,sheenRoughnessMap:ge,specularMap:de,specularColorMap:Le,specularIntensityMap:Oe,transmission:G,transmissionMap:He,thicknessMap:I,gradientMap:fe,opaque:x.transparent===!1&&x.blending===ts&&x.alphaToCoverage===!1,alphaMap:Z,alphaTest:pe,alphaHash:Se,combine:x.combine,mapUv:Ue&&g(x.map.channel),aoMapUv:se&&g(x.aoMap.channel),lightMapUv:re&&g(x.lightMap.channel),bumpMapUv:oe&&g(x.bumpMap.channel),normalMapUv:he&&g(x.normalMap.channel),displacementMapUv:Fe&&g(x.displacementMap.channel),emissiveMapUv:De&&g(x.emissiveMap.channel),metalnessMapUv:ke&&g(x.metalnessMap.channel),roughnessMapUv:ze&&g(x.roughnessMap.channel),anisotropyMapUv:Y&&g(x.anisotropyMap.channel),clearcoatMapUv:ae&&g(x.clearcoatMap.channel),clearcoatNormalMapUv:ce&&g(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:K&&g(x.clearcoatRoughnessMap.channel),iridescenceMapUv:j&&g(x.iridescenceMap.channel),iridescenceThicknessMapUv:ue&&g(x.iridescenceThicknessMap.channel),sheenColorMapUv:Pe&&g(x.sheenColorMap.channel),sheenRoughnessMapUv:ge&&g(x.sheenRoughnessMap.channel),specularMapUv:de&&g(x.specularMap.channel),specularColorMapUv:Le&&g(x.specularColorMap.channel),specularIntensityMapUv:Oe&&g(x.specularIntensityMap.channel),transmissionMapUv:He&&g(x.transmissionMap.channel),thicknessMapUv:I&&g(x.thicknessMap.channel),alphaMapUv:Z&&g(x.alphaMap.channel),vertexTangents:!!O.attributes.tangent&&(he||C),vertexNormals:!!O.attributes.normal,vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!O.attributes.color&&O.attributes.color.itemSize===4,pointsUvs:z.isPoints===!0&&!!O.attributes.uv&&(Ue||Z),fog:!!U,useFog:x.fog===!0,fogExp2:!!U&&U.isFogExp2,flatShading:x.wireframe===!1&&(x.flatShading===!0||O.attributes.normal===void 0&&he===!1&&(x.isMeshLambertMaterial||x.isMeshPhongMaterial||x.isMeshStandardMaterial||x.isMeshPhysicalMaterial)),sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:le,skinning:z.isSkinnedMesh===!0,hasPositionAttribute:O.attributes.position!==void 0,morphTargets:O.morphAttributes.position!==void 0,morphNormals:O.morphAttributes.normal!==void 0,morphColors:O.morphAttributes.color!==void 0,morphTargetsCount:Ae,morphTextureStride:ye,numSunLights:b.sun.length,numDirLights:b.directional.length,numPointLights:b.point.length,numSpotLights:b.spot.length,numSpotLightMaps:b.spotLightMap.length,numRectAreaLights:b.rectArea.length,numHemiLights:b.hemi.length,numSunLightShadows:b.sunShadowMap.length,numDirLightShadows:b.directionalShadowMap.length,numPointLightShadows:b.pointShadowMap.length,numSpotLightShadows:b.spotShadowMap.length,numSpotLightShadowsWithMaps:b.numSpotLightShadowsWithMaps,numLightProbes:b.numLightProbes,numLightProbeGrids:V.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:x.dithering,shadowMapEnabled:i.shadowMap.enabled&&P.length>0,shadowMapType:i.shadowMap.type,toneMapping:Ie,decodeVideoTexture:Ue&&x.map.isVideoTexture===!0&&$e.getTransfer(x.map.colorSpace)===ot,decodeVideoTextureEmissive:De&&x.emissiveMap.isVideoTexture===!0&&$e.getTransfer(x.emissiveMap.colorSpace)===ot,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===Sn,flipSided:x.side===Ut,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionClipCullDistance:ne&&x.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ne&&x.extensions.multiDraw===!0||Me)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()};return Re.vertexUv1s=l.has(1),Re.vertexUv2s=l.has(2),Re.vertexUv3s=l.has(3),l.clear(),Re}function m(x){const b=[];if(x.shaderID?b.push(x.shaderID):(b.push(x.customVertexShaderID),b.push(x.customFragmentShaderID)),x.defines!==void 0)for(const P in x.defines)b.push(P),b.push(x.defines[P]);return x.isRawShaderMaterial===!1&&(p(b,x),w(b,x),b.push(i.outputColorSpace)),b.push(x.customProgramCacheKey),b.join()}function p(x,b){x.push(b.precision),x.push(b.outputColorSpace),x.push(b.envMapMode),x.push(b.envMapCubeUVHeight),x.push(b.mapUv),x.push(b.alphaMapUv),x.push(b.lightMapUv),x.push(b.aoMapUv),x.push(b.bumpMapUv),x.push(b.normalMapUv),x.push(b.displacementMapUv),x.push(b.emissiveMapUv),x.push(b.metalnessMapUv),x.push(b.roughnessMapUv),x.push(b.anisotropyMapUv),x.push(b.clearcoatMapUv),x.push(b.clearcoatNormalMapUv),x.push(b.clearcoatRoughnessMapUv),x.push(b.iridescenceMapUv),x.push(b.iridescenceThicknessMapUv),x.push(b.sheenColorMapUv),x.push(b.sheenRoughnessMapUv),x.push(b.specularMapUv),x.push(b.specularColorMapUv),x.push(b.specularIntensityMapUv),x.push(b.transmissionMapUv),x.push(b.thicknessMapUv),x.push(b.combine),x.push(b.fogExp2),x.push(b.sizeAttenuation),x.push(b.morphTargetsCount),x.push(b.morphAttributeCount),x.push(b.numSunLights),x.push(b.numDirLights),x.push(b.numPointLights),x.push(b.numSpotLights),x.push(b.numSpotLightMaps),x.push(b.numHemiLights),x.push(b.numRectAreaLights),x.push(b.numSunLightShadows),x.push(b.numDirLightShadows),x.push(b.numPointLightShadows),x.push(b.numSpotLightShadows),x.push(b.numSpotLightShadowsWithMaps),x.push(b.numLightProbes),x.push(b.shadowMapType),x.push(b.toneMapping),x.push(b.numClippingPlanes),x.push(b.numClipIntersection),x.push(b.depthPacking)}function w(x,b){o.disableAll(),b.instancing&&o.enable(0),b.instancingColor&&o.enable(1),b.instancingMorph&&o.enable(2),b.matcap&&o.enable(3),b.envMap&&o.enable(4),b.normalMapObjectSpace&&o.enable(5),b.normalMapTangentSpace&&o.enable(6),b.clearcoat&&o.enable(7),b.iridescence&&o.enable(8),b.alphaTest&&o.enable(9),b.vertexColors&&o.enable(10),b.vertexAlphas&&o.enable(11),b.vertexUv1s&&o.enable(12),b.vertexUv2s&&o.enable(13),b.vertexUv3s&&o.enable(14),b.vertexTangents&&o.enable(15),b.anisotropy&&o.enable(16),b.alphaHash&&o.enable(17),b.batching&&o.enable(18),b.dispersion&&o.enable(19),b.retroreflection&&o.enable(24),b.batchingColor&&o.enable(20),b.gradientMap&&o.enable(21),b.packedNormalMap&&o.enable(22),b.vertexNormals&&o.enable(23),x.push(o.mask),o.disableAll(),b.fog&&o.enable(0),b.useFog&&o.enable(1),b.flatShading&&o.enable(2),b.logarithmicDepthBuffer&&o.enable(3),b.reversedDepthBuffer&&o.enable(4),b.skinning&&o.enable(5),b.morphTargets&&o.enable(6),b.morphNormals&&o.enable(7),b.morphColors&&o.enable(8),b.premultipliedAlpha&&o.enable(9),b.shadowMapEnabled&&o.enable(10),b.doubleSided&&o.enable(11),b.flipSided&&o.enable(12),b.useDepthPacking&&o.enable(13),b.dithering&&o.enable(14),b.transmission&&o.enable(15),b.sheen&&o.enable(16),b.opaque&&o.enable(17),b.pointsUvs&&o.enable(18),b.decodeVideoTexture&&o.enable(19),b.decodeVideoTextureEmissive&&o.enable(20),b.alphaToCoverage&&o.enable(21),b.numLightProbeGrids>0&&o.enable(22),b.hasPositionAttribute&&o.enable(23),x.push(o.mask)}function A(x){const b=f[x.type];let P;if(b){const N=rn[b];P=Dd.clone(N.uniforms)}else P=x.uniforms;return P}function S(x,b){let P=h.get(b);return P!==void 0?++P.usedTimes:(P=new d0(i,b,x,s),c.push(P),h.set(b,P)),P}function E(x){if(--x.usedTimes===0){const b=c.indexOf(x);c[b]=c[c.length-1],c.pop(),h.delete(x.cacheKey),x.destroy()}}function T(x){a.remove(x)}function R(){a.dispose()}return{getParameters:M,getProgramCacheKey:m,getUniforms:A,acquireProgram:S,releaseProgram:E,releaseShaderCache:T,programs:c,dispose:R}}function x0(){let i=new WeakMap;function e(o){return i.has(o)}function t(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function s(o,a,l){i.get(o)[a]=l}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function v0(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.materialVariant!==e.materialVariant?i.materialVariant-e.materialVariant:i.z!==e.z?i.z-e.z:i.id-e.id}function dc(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function fc(){const i=[];let e=0;const t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function o(u){let f=0;return u.isInstancedMesh&&(f+=2),u.isSkinnedMesh&&(f+=1),f}function a(u,f,g,M,m,p){let w=i[e];return w===void 0?(w={id:u.id,object:u,geometry:f,material:g,materialVariant:o(u),groupOrder:M,renderOrder:u.renderOrder,z:m,group:p},i[e]=w):(w.id=u.id,w.object=u,w.geometry=f,w.material=g,w.materialVariant=o(u),w.groupOrder=M,w.renderOrder=u.renderOrder,w.z=m,w.group=p),e++,w}function l(u,f,g,M,m,p,w){w.reversedDepth===!0&&(m=-m);const A=a(u,f,g,M,m,p);g.transmission>0?n.push(A):g.transparent===!0?s.push(A):t.push(A)}function c(u,f,g,M,m,p){const w=a(u,f,g,M,m,p);g.transmission>0?n.unshift(w):g.transparent===!0?s.unshift(w):t.unshift(w)}function h(u,f){t.length>1&&t.sort(u||v0),n.length>1&&n.sort(f||dc),s.length>1&&s.sort(f||dc)}function d(){for(let u=e,f=i.length;u<f;u++){const g=i[u];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:l,unshift:c,finish:d,sort:h}}function M0(){let i=new WeakMap;function e(n,s){const r=i.get(n);let o;return r===void 0?(o=new fc,i.set(n,[o])):s>=r.length?(o=new fc,r.push(o)):o=r[s],o}function t(){i=new WeakMap}return{get:e,dispose:t}}function S0(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new D,color:new Ve};break;case"SpotLight":t={position:new D,direction:new D,color:new Ve,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new D,color:new Ve,distance:0,decay:0};break;case"HemisphereLight":t={direction:new D,skyColor:new Ve,groundColor:new Ve};break;case"RectAreaLight":t={color:new Ve,position:new D,halfWidth:new D,halfHeight:new D};break}return i[e.id]=t,t}}}function y0(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new me};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new me};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new me,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}let E0=0;function w0(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function T0(i){const e=new S0,t=y0(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new D);const s=new D,r=new tt,o=new tt;function a(c){let h=0,d=0,u=0;for(let z=0;z<9;z++)n.probe[z].set(0,0,0);let f=0,g=0,M=0,m=0,p=0,w=0,A=0,S=0,E=0,T=0,R=0,x=0,b=0,P=0;c.sort(w0);for(let z=0,V=c.length;z<V;z++){const U=c[z],O=U.color,J=U.intensity,H=U.distance;let ie=null;if(U.shadow&&U.shadow.map&&(U.shadow.map.texture.format===Qn?ie=U.shadow.map.texture:ie=U.shadow.map.depthTexture||U.shadow.map.texture),U.isAmbientLight)h+=O.r*J,d+=O.g*J,u+=O.b*J;else if(U.isLightProbe){for(let X=0;X<9;X++)n.probe[X].addScaledVector(U.sh.coefficients[X],J);P++}else if(U.isSunLight){const X=e.get(U);if(X.color.copy(U.color).multiplyScalar(U.intensity),U.castShadow){const $=U.shadow,ee=t.get(U);ee.shadowIntensity=$.intensity,ee.shadowBias=$.bias,ee.shadowNormalBias=$.normalBias,ee.shadowRadius=$.radius,ee.shadowMapSize.copy($.mapSize).multiply($.getFrameExtents()),n.sunShadow[g]=ee,n.sunShadowMap[g]=ie;const Ae=$.getViewportCount();for(let ye=0;ye<Ae;ye++)n.sunShadowMatrix[M+ye]=$.getMatrix(ye),n.sunShadowCascade[M+ye]=$._cascadeData[ye];M+=Ae,g++}n.sun[f]=X,f++}else if(U.isDirectionalLight){const X=e.get(U);if(X.color.copy(U.color).multiplyScalar(U.intensity),U.castShadow){const $=U.shadow,ee=t.get(U);ee.shadowIntensity=$.intensity,ee.shadowBias=$.bias,ee.shadowNormalBias=$.normalBias,ee.shadowRadius=$.radius,ee.shadowMapSize=$.mapSize,n.directionalShadow[m]=ee,n.directionalShadowMap[m]=ie,n.directionalShadowMatrix[m]=U.shadow.matrix,E++}n.directional[m]=X,m++}else if(U.isSpotLight){const X=e.get(U);X.position.setFromMatrixPosition(U.matrixWorld),X.color.copy(O).multiplyScalar(J),X.distance=H,X.coneCos=Math.cos(U.angle),X.penumbraCos=Math.cos(U.angle*(1-U.penumbra)),X.decay=U.decay,n.spot[w]=X;const $=U.shadow;if(U.map&&(n.spotLightMap[x]=U.map,x++,$.updateMatrices(U),U.castShadow&&b++),n.spotLightMatrix[w]=$.matrix,U.castShadow){const ee=t.get(U);ee.shadowIntensity=$.intensity,ee.shadowBias=$.bias,ee.shadowNormalBias=$.normalBias,ee.shadowRadius=$.radius,ee.shadowMapSize=$.mapSize,n.spotShadow[w]=ee,n.spotShadowMap[w]=ie,R++}w++}else if(U.isRectAreaLight){const X=e.get(U);X.color.copy(O).multiplyScalar(J),X.halfWidth.set(U.width*.5,0,0),X.halfHeight.set(0,U.height*.5,0),n.rectArea[A]=X,A++}else if(U.isPointLight){const X=e.get(U);if(X.color.copy(U.color).multiplyScalar(U.intensity),X.distance=U.distance,X.decay=U.decay,U.castShadow){const $=U.shadow,ee=t.get(U);ee.shadowIntensity=$.intensity,ee.shadowBias=$.bias,ee.shadowNormalBias=$.normalBias,ee.shadowRadius=$.radius,ee.shadowMapSize=$.mapSize,ee.shadowCameraNear=$.camera.near,ee.shadowCameraFar=$.camera.far,n.pointShadow[p]=ee,n.pointShadowMap[p]=ie,n.pointShadowMatrix[p]=U.shadow.matrix,T++}n.point[p]=X,p++}else if(U.isHemisphereLight){const X=e.get(U);X.skyColor.copy(U.color).multiplyScalar(J),X.groundColor.copy(U.groundColor).multiplyScalar(J),n.hemi[S]=X,S++}}A>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=_e.LTC_FLOAT_1,n.rectAreaLTC2=_e.LTC_FLOAT_2):(n.rectAreaLTC1=_e.LTC_HALF_1,n.rectAreaLTC2=_e.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=d,n.ambient[2]=u;const N=n.hash;(N.sunLength!==f||N.directionalLength!==m||N.pointLength!==p||N.spotLength!==w||N.rectAreaLength!==A||N.hemiLength!==S||N.numSunShadows!==g||N.numDirectionalShadows!==E||N.numPointShadows!==T||N.numSpotShadows!==R||N.numSpotMaps!==x||N.numLightProbes!==P)&&(n.sun.length=f,n.directional.length=m,n.spot.length=w,n.rectArea.length=A,n.point.length=p,n.hemi.length=S,n.sunShadow.length=g,n.sunShadowMap.length=g,n.sunShadowMatrix.length=M,n.sunShadowCascade.length=M,n.directionalShadow.length=E,n.directionalShadowMap.length=E,n.directionalShadowMatrix.length=E,n.pointShadow.length=T,n.pointShadowMap.length=T,n.pointShadowMatrix.length=T,n.spotShadow.length=R,n.spotShadowMap.length=R,n.spotLightMatrix.length=R+x-b,n.spotLightMap.length=x,n.numSpotLightShadowsWithMaps=b,n.numLightProbes=P,N.sunLength=f,N.directionalLength=m,N.pointLength=p,N.spotLength=w,N.rectAreaLength=A,N.hemiLength=S,N.numSunShadows=g,N.numDirectionalShadows=E,N.numPointShadows=T,N.numSpotShadows=R,N.numSpotMaps=x,N.numLightProbes=P,n.version=E0++)}function l(c,h){let d=0,u=0,f=0,g=0,M=0,m=0;const p=h.matrixWorldInverse;for(let w=0,A=c.length;w<A;w++){const S=c[w];if(S.isSunLight){const E=n.sun[d];E.direction.setFromMatrixPosition(S.matrixWorld),E.direction.transformDirection(p),d++}else if(S.isDirectionalLight){const E=n.directional[u];E.direction.setFromMatrixPosition(S.matrixWorld),s.setFromMatrixPosition(S.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(p),u++}else if(S.isSpotLight){const E=n.spot[g];E.position.setFromMatrixPosition(S.matrixWorld),E.position.applyMatrix4(p),E.direction.setFromMatrixPosition(S.matrixWorld),s.setFromMatrixPosition(S.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(p),g++}else if(S.isRectAreaLight){const E=n.rectArea[M];E.position.setFromMatrixPosition(S.matrixWorld),E.position.applyMatrix4(p),o.identity(),r.copy(S.matrixWorld),r.premultiply(p),o.extractRotation(r),E.halfWidth.set(S.width*.5,0,0),E.halfHeight.set(0,S.height*.5,0),E.halfWidth.applyMatrix4(o),E.halfHeight.applyMatrix4(o),M++}else if(S.isPointLight){const E=n.point[f];E.position.setFromMatrixPosition(S.matrixWorld),E.position.applyMatrix4(p),f++}else if(S.isHemisphereLight){const E=n.hemi[m];E.direction.setFromMatrixPosition(S.matrixWorld),E.direction.transformDirection(p),m++}}}return{setup:a,setupView:l,state:n}}function pc(i){const e=new T0(i),t=[],n=[],s=[];function r(u){d.camera=u,t.length=0,n.length=0,s.length=0}function o(u){t.push(u)}function a(u){n.push(u)}function l(u){s.push(u)}function c(){e.setup(t)}function h(u){e.setupView(t,u)}const d={lightsArray:t,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:d,setupLights:c,setupLightsView:h,pushLight:o,pushShadow:a,pushLightProbeGrid:l}}function b0(i){let e=new WeakMap;function t(s,r=0){const o=e.get(s);let a;return o===void 0?(a=new pc(i),e.set(s,[a])):r>=o.length?(a=new pc(i),o.push(a)):a=o[r],a}function n(){e=new WeakMap}return{get:t,dispose:n}}const A0=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,R0=`uniform sampler2D shadow_pass;
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
}`,C0=[new D(1,0,0),new D(-1,0,0),new D(0,1,0),new D(0,-1,0),new D(0,0,1),new D(0,0,-1)],P0=[new D(0,-1,0),new D(0,-1,0),new D(0,0,1),new D(0,0,-1),new D(0,-1,0),new D(0,-1,0)],mc=new tt,qi=new D,uo=new D;function L0(i,e,t){let n=new Ia;const s=new me,r=new me,o=new ft,a=new Od,l=new Bd,c={},h=t.maxTextureSize,d={[Zn]:Ut,[Ut]:Zn,[Sn]:Sn},u=new dn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new me},radius:{value:4}},vertexShader:A0,fragmentShader:R0}),f=u.clone();f.defines.HORIZONTAL_PASS=1;const g=new wt;g.setAttribute("position",new Nt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const M=new gt(g,u),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=tr;let p=this.type;this.render=function(T,R,x){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||T.length===0)return;this.type===Wh&&(Be("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=tr);const b=i.getRenderTarget(),P=i.getActiveCubeFace(),N=i.getActiveMipmapLevel(),z=i.state;z.setBlending(En),z.buffers.depth.getReversed()===!0?z.buffers.color.setClear(0,0,0,0):z.buffers.color.setClear(1,1,1,1),z.buffers.depth.setTest(!0),z.setScissorTest(!1);const V=p!==this.type;V&&R.traverse(function(U){U.material&&(Array.isArray(U.material)?U.material.forEach(O=>O.needsUpdate=!0):U.material.needsUpdate=!0)});for(let U=0,O=T.length;U<O;U++){const J=T[U],H=J.shadow;if(H===void 0){Be("WebGLShadowMap:",J,"has no shadow.");continue}if(H.autoUpdate===!1&&H.needsUpdate===!1)continue;s.copy(H.mapSize);const ie=H.getFrameExtents();s.multiply(ie),r.copy(H.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/ie.x),s.x=r.x*ie.x,H.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/ie.y),s.y=r.y*ie.y,H.mapSize.y=r.y));const X=i.state.buffers.depth.getReversed();if(H.camera._reversedDepth=X,H.map===null||V===!0){if(H.map!==null&&(H.map.depthTexture!==null&&(H.map.depthTexture.dispose(),H.map.depthTexture=null),H.map.dispose()),this.type===$i){if(J.isPointLight){Be("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}H.map=new jt(s.x,s.y,{format:Qn,type:un,minFilter:Et,magFilter:Et,generateMipmaps:!1}),H.map.texture.name=J.name+".shadowMap",H.map.depthTexture=new hs(s.x,s.y,Zt),H.map.depthTexture.name=J.name+".shadowMapDepth",H.map.depthTexture.format=Tn,H.map.depthTexture.compareFunction=null,H.map.depthTexture.minFilter=Tt,H.map.depthTexture.magFilter=Tt}else J.isPointLight?(H.map=new _h(s.x),H.map.depthTexture=new $u(s.x,hn)):(H.map=new jt(s.x,s.y),H.map.depthTexture=new hs(s.x,s.y,hn)),H.map.depthTexture.name=J.name+".shadowMap",H.map.depthTexture.format=Tn,this.type===tr?(H.map.depthTexture.compareFunction=X?Aa:ba,H.map.depthTexture.minFilter=Et,H.map.depthTexture.magFilter=Et):(H.map.depthTexture.compareFunction=null,H.map.depthTexture.minFilter=Tt,H.map.depthTexture.magFilter=Tt);H.camera.updateProjectionMatrix()}H.map.isWebGLCubeRenderTarget!==!0&&(H.map.width!==s.x||H.map.height!==s.y)&&H.map.setSize(s.x,s.y);const $=H.map.isWebGLCubeRenderTarget?6:H.getViewportCount();J.isPointLight!==!0&&H.updateMatrices(J,x);for(let ee=0;ee<$;ee++){const Ae=H.getCamera(ee);if(J.isPointLight){const ye=H.camera,je=H.matrix,We=J.distance||ye.far;We!==ye.far&&(ye.far=We,ye.updateProjectionMatrix()),qi.setFromMatrixPosition(J.matrixWorld),ye.position.copy(qi),uo.copy(ye.position),uo.add(C0[ee]),ye.up.copy(P0[ee]),ye.lookAt(uo),ye.updateMatrixWorld(),je.makeTranslation(-qi.x,-qi.y,-qi.z),mc.multiplyMatrices(ye.projectionMatrix,ye.matrixWorldInverse),H._frustum.setFromProjectionMatrix(mc,ye.coordinateSystem,ye.reversedDepth)}if(H.map.isWebGLCubeRenderTarget)i.setRenderTarget(H.map,ee),i.clear();else{ee===0&&(i.setRenderTarget(H.map),i.clear());const ye=H.getViewport(ee);o.set(r.x*ye.x,r.y*ye.y,r.x*ye.z,r.y*ye.w),z.viewport(o)}n=H.getFrustum(ee),S(R,x,Ae,J,this.type)}H.isPointLightShadow!==!0&&this.type===$i&&w(H,x),H.needsUpdate=!1}p=this.type,m.needsUpdate=!1,i.setRenderTarget(b,P,N)};function w(T,R){const x=e.update(M);u.defines.VSM_SAMPLES!==T.blurSamples&&(u.defines.VSM_SAMPLES=T.blurSamples,f.defines.VSM_SAMPLES=T.blurSamples,u.needsUpdate=!0,f.needsUpdate=!0),T.mapPass===null?T.mapPass=new jt(s.x,s.y,{format:Qn,type:un}):(T.mapPass.width!==T.map.width||T.mapPass.height!==T.map.height)&&T.mapPass.setSize(T.map.width,T.map.height),u.uniforms.shadow_pass.value=T.map.depthTexture,u.uniforms.resolution.value.set(T.map.width,T.map.height),u.uniforms.radius.value=T.radius,i.setRenderTarget(T.mapPass),i.clear(),i.renderBufferDirect(R,null,x,u,M,null),f.uniforms.shadow_pass.value=T.mapPass.texture,f.uniforms.resolution.value.set(T.map.width,T.map.height),f.uniforms.radius.value=T.radius,i.setRenderTarget(T.map),i.clear(),i.renderBufferDirect(R,null,x,f,M,null)}function A(T,R,x,b){let P=null;const N=x.isPointLight===!0?T.customDistanceMaterial:T.customDepthMaterial;if(N!==void 0)P=N;else if(P=x.isPointLight===!0?l:a,i.localClippingEnabled&&R.clipShadows===!0&&Array.isArray(R.clippingPlanes)&&R.clippingPlanes.length!==0||R.displacementMap&&R.displacementScale!==0||R.alphaMap&&R.alphaTest>0||R.map&&R.alphaTest>0||R.alphaToCoverage===!0){const z=P.uuid,V=R.uuid;let U=c[z];U===void 0&&(U={},c[z]=U);let O=U[V];O===void 0&&(O=P.clone(),U[V]=O,R.addEventListener("dispose",E)),P=O}if(P.visible=R.visible,P.wireframe=R.wireframe,b===$i?P.side=R.shadowSide!==null?R.shadowSide:R.side:P.side=R.shadowSide!==null?R.shadowSide:d[R.side],P.alphaMap=R.alphaMap,P.alphaTest=R.alphaToCoverage===!0?.5:R.alphaTest,P.map=R.map,P.clipShadows=R.clipShadows,P.clippingPlanes=R.clippingPlanes,P.clipIntersection=R.clipIntersection,P.displacementMap=R.displacementMap,P.displacementScale=R.displacementScale,P.displacementBias=R.displacementBias,P.wireframeLinewidth=R.wireframeLinewidth,P.linewidth=R.linewidth,x.isPointLight===!0&&P.isMeshDistanceMaterial===!0){const z=i.properties.get(P);z.light=x}return P}function S(T,R,x,b,P){if(T.visible===!1)return;if(T.layers.test(R.layers)&&(T.isMesh||T.isLine||T.isPoints)&&(T.castShadow||T.receiveShadow&&P===$i)&&(!T.frustumCulled||T.intersectsFrustum(n))){T.modelViewMatrix.multiplyMatrices(x.matrixWorldInverse,T.matrixWorld);const V=e.update(T),U=T.material;if(Array.isArray(U)){const O=V.groups;for(let J=0,H=O.length;J<H;J++){const ie=O[J],X=U[ie.materialIndex];if(X&&X.visible){const $=A(T,X,b,P);T.onBeforeShadow(i,T,R,x,V,$,ie),i.renderBufferDirect(x,null,V,$,T,ie),T.onAfterShadow(i,T,R,x,V,$,ie)}}}else if(U.visible){const O=A(T,U,b,P);T.onBeforeShadow(i,T,R,x,V,O,null),i.renderBufferDirect(x,null,V,O,T,null),T.onAfterShadow(i,T,R,x,V,O,null)}}const z=T.children;for(let V=0,U=z.length;V<U;V++)S(z[V],R,x,b,P)}function E(T){T.target.removeEventListener("dispose",E);for(const x in c){const b=c[x],P=T.target.uuid;P in b&&(b[P].dispose(),delete b[P])}}}function I0(i,e){function t(){let I=!1;const fe=new ft;let Z=null;const pe=new ft(0,0,0,0);return{setMask:function(Se){Z!==Se&&!I&&(i.colorMask(Se,Se,Se,Se),Z=Se)},setLocked:function(Se){I=Se},setClear:function(Se,ne,Ie,Re,ct){ct===!0&&(Se*=Re,ne*=Re,Ie*=Re),fe.set(Se,ne,Ie,Re),pe.equals(fe)===!1&&(i.clearColor(Se,ne,Ie,Re),pe.copy(fe))},reset:function(){I=!1,Z=null,pe.set(-1,0,0,0)}}}function n(){let I=!1,fe=!1,Z=null,pe=null,Se=null;return{setReversed:function(ne){if(fe!==ne){const Ie=e.get("EXT_clip_control");ne?Ie.clipControlEXT(Ie.LOWER_LEFT_EXT,Ie.ZERO_TO_ONE_EXT):Ie.clipControlEXT(Ie.LOWER_LEFT_EXT,Ie.NEGATIVE_ONE_TO_ONE_EXT),fe=ne;const Re=Se;Se=null,this.setClear(Re)}},getReversed:function(){return fe},setTest:function(ne){ne?Q(i.DEPTH_TEST):le(i.DEPTH_TEST)},setMask:function(ne){Z!==ne&&!I&&(i.depthMask(ne),Z=ne)},setFunc:function(ne){if(fe&&(ne=Tu[ne]),pe!==ne){switch(ne){case So:i.depthFunc(i.NEVER);break;case yo:i.depthFunc(i.ALWAYS);break;case Eo:i.depthFunc(i.LESS);break;case os:i.depthFunc(i.LEQUAL);break;case wo:i.depthFunc(i.EQUAL);break;case To:i.depthFunc(i.GEQUAL);break;case bo:i.depthFunc(i.GREATER);break;case Ao:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}pe=ne}},setLocked:function(ne){I=ne},setClear:function(ne){Se!==ne&&(Se=ne,fe&&(ne=1-ne),i.clearDepth(ne))},reset:function(){I=!1,Z=null,pe=null,Se=null,fe=!1}}}function s(){let I=!1,fe=null,Z=null,pe=null,Se=null,ne=null,Ie=null,Re=null,ct=null;return{setTest:function(it){I||(it?Q(i.STENCIL_TEST):le(i.STENCIL_TEST))},setMask:function(it){fe!==it&&!I&&(i.stencilMask(it),fe=it)},setFunc:function(it,Xt,en){(Z!==it||pe!==Xt||Se!==en)&&(i.stencilFunc(it,Xt,en),Z=it,pe=Xt,Se=en)},setOp:function(it,Xt,en){(ne!==it||Ie!==Xt||Re!==en)&&(i.stencilOp(it,Xt,en),ne=it,Ie=Xt,Re=en)},setLocked:function(it){I=it},setClear:function(it){ct!==it&&(i.clearStencil(it),ct=it)},reset:function(){I=!1,fe=null,Z=null,pe=null,Se=null,ne=null,Ie=null,Re=null,ct=null}}}const r=new t,o=new n,a=new s,l=new WeakMap,c=new WeakMap;let h={},d={},u={},f=new WeakMap,g=[],M=null,m=!1,p=null,w=null,A=null,S=null,E=null,T=null,R=null,x=new Ve(0,0,0),b=0,P=!1,N=null,z=null,V=null,U=null,O=null;const J=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let H=!1,ie=0;const X=i.getParameter(i.VERSION);X.indexOf("WebGL")!==-1?(ie=parseFloat(/^WebGL (\d)/.exec(X)[1]),H=ie>=1):X.indexOf("OpenGL ES")!==-1&&(ie=parseFloat(/^OpenGL ES (\d)/.exec(X)[1]),H=ie>=2);let $=null,ee={};const Ae=i.getParameter(i.SCISSOR_BOX),ye=i.getParameter(i.VIEWPORT),je=new ft().fromArray(Ae),We=new ft().fromArray(ye);function Ze(I,fe,Z,pe){const Se=new Uint8Array(4),ne=i.createTexture();i.bindTexture(I,ne),i.texParameteri(I,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(I,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Ie=0;Ie<Z;Ie++)I===i.TEXTURE_3D||I===i.TEXTURE_2D_ARRAY?i.texImage3D(fe,0,i.RGBA,1,1,pe,0,i.RGBA,i.UNSIGNED_BYTE,Se):i.texImage2D(fe+Ie,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,Se);return ne}const q={};q[i.TEXTURE_2D]=Ze(i.TEXTURE_2D,i.TEXTURE_2D,1),q[i.TEXTURE_CUBE_MAP]=Ze(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),q[i.TEXTURE_2D_ARRAY]=Ze(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),q[i.TEXTURE_3D]=Ze(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),Q(i.DEPTH_TEST),o.setFunc(os),oe(!1),he(sl),Q(i.CULL_FACE),se(En);function Q(I){h[I]!==!0&&(i.enable(I),h[I]=!0)}function le(I){h[I]!==!1&&(i.disable(I),h[I]=!1)}function Ne(I,fe){return u[I]!==fe?(i.bindFramebuffer(I,fe),u[I]=fe,I===i.DRAW_FRAMEBUFFER&&(u[i.FRAMEBUFFER]=fe),I===i.FRAMEBUFFER&&(u[i.DRAW_FRAMEBUFFER]=fe),!0):!1}function Me(I,fe){let Z=g,pe=!1;if(I){Z=f.get(fe),Z===void 0&&(Z=[],f.set(fe,Z));const Se=I.textures;if(Z.length!==Se.length||Z[0]!==i.COLOR_ATTACHMENT0){for(let ne=0,Ie=Se.length;ne<Ie;ne++)Z[ne]=i.COLOR_ATTACHMENT0+ne;Z.length=Se.length,pe=!0}}else Z[0]!==i.BACK&&(Z[0]=i.BACK,pe=!0);pe&&i.drawBuffers(Z)}function Ue(I){return M!==I?(i.useProgram(I),M=I,!0):!1}const rt={[Si]:i.FUNC_ADD,[Yh]:i.FUNC_SUBTRACT,[qh]:i.FUNC_REVERSE_SUBTRACT};rt[Kh]=i.MIN,rt[Jh]=i.MAX;const te={[Zh]:i.ZERO,[$h]:i.ONE,[Qh]:i.SRC_COLOR,[Nc]:i.SRC_ALPHA,[su]:i.SRC_ALPHA_SATURATE,[nu]:i.DST_COLOR,[eu]:i.DST_ALPHA,[jh]:i.ONE_MINUS_SRC_COLOR,[Uc]:i.ONE_MINUS_SRC_ALPHA,[iu]:i.ONE_MINUS_DST_COLOR,[tu]:i.ONE_MINUS_DST_ALPHA,[ru]:i.CONSTANT_COLOR,[ou]:i.ONE_MINUS_CONSTANT_COLOR,[au]:i.CONSTANT_ALPHA,[lu]:i.ONE_MINUS_CONSTANT_ALPHA};function se(I,fe,Z,pe,Se,ne,Ie,Re,ct,it){if(I===En){m===!0&&(le(i.BLEND),m=!1);return}if(m===!1&&(Q(i.BLEND),m=!0),I!==Xh){if(I!==p||it!==P){if((w!==Si||E!==Si)&&(i.blendEquation(i.FUNC_ADD),w=Si,E=Si),it)switch(I){case ts:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case rl:i.blendFunc(i.ONE,i.ONE);break;case ol:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case al:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:Qe("WebGLState: Invalid blending: ",I);break}else switch(I){case ts:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case rl:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case ol:Qe("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case al:Qe("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Qe("WebGLState: Invalid blending: ",I);break}A=null,S=null,T=null,R=null,x.set(0,0,0),b=0,p=I,P=it}return}Se=Se||fe,ne=ne||Z,Ie=Ie||pe,(fe!==w||Se!==E)&&(i.blendEquationSeparate(rt[fe],rt[Se]),w=fe,E=Se),(Z!==A||pe!==S||ne!==T||Ie!==R)&&(i.blendFuncSeparate(te[Z],te[pe],te[ne],te[Ie]),A=Z,S=pe,T=ne,R=Ie),(Re.equals(x)===!1||ct!==b)&&(i.blendColor(Re.r,Re.g,Re.b,ct),x.copy(Re),b=ct),p=I,P=!1}function re(I,fe){I.side===Sn?le(i.CULL_FACE):Q(i.CULL_FACE);let Z=I.side===Ut;fe&&(Z=!Z),oe(Z),I.blending===ts&&I.transparent===!1?se(En):se(I.blending,I.blendEquation,I.blendSrc,I.blendDst,I.blendEquationAlpha,I.blendSrcAlpha,I.blendDstAlpha,I.blendColor,I.blendAlpha,I.premultipliedAlpha),o.setFunc(I.depthFunc),o.setTest(I.depthTest),o.setMask(I.depthWrite),r.setMask(I.colorWrite);const pe=I.stencilWrite;a.setTest(pe),pe&&(a.setMask(I.stencilWriteMask),a.setFunc(I.stencilFunc,I.stencilRef,I.stencilFuncMask),a.setOp(I.stencilFail,I.stencilZFail,I.stencilZPass)),De(I.polygonOffset,I.polygonOffsetFactor,I.polygonOffsetUnits),I.alphaToCoverage===!0?Q(i.SAMPLE_ALPHA_TO_COVERAGE):le(i.SAMPLE_ALPHA_TO_COVERAGE)}function oe(I){N!==I&&(I?i.frontFace(i.CW):i.frontFace(i.CCW),N=I)}function he(I){I!==Hh?(Q(i.CULL_FACE),I!==z&&(I===sl?i.cullFace(i.BACK):I===Vh?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):le(i.CULL_FACE),z=I}function Fe(I){I!==V&&(H&&i.lineWidth(I),V=I)}function De(I,fe,Z){I?(Q(i.POLYGON_OFFSET_FILL),(U!==fe||O!==Z)&&(U=fe,O=Z,o.getReversed()&&(fe=-fe),i.polygonOffset(fe,Z))):le(i.POLYGON_OFFSET_FILL)}function ke(I){I?Q(i.SCISSOR_TEST):le(i.SCISSOR_TEST)}function ze(I){I===void 0&&(I=i.TEXTURE0+J-1),$!==I&&(i.activeTexture(I),$=I)}function C(I,fe,Z){Z===void 0&&($===null?Z=i.TEXTURE0+J-1:Z=$);let pe=ee[Z];pe===void 0&&(pe={type:void 0,texture:void 0},ee[Z]=pe),(pe.type!==I||pe.texture!==fe)&&($!==Z&&(i.activeTexture(Z),$=Z),i.bindTexture(I,fe||q[I]),pe.type=I,pe.texture=fe)}function nt(){const I=ee[$];I!==void 0&&I.type!==void 0&&(i.bindTexture(I.type,null),I.type=void 0,I.texture=void 0)}function qe(){try{i.compressedTexImage2D(...arguments)}catch(I){Qe("WebGLState:",I)}}function y(){try{i.compressedTexImage3D(...arguments)}catch(I){Qe("WebGLState:",I)}}function _(){try{i.texSubImage2D(...arguments)}catch(I){Qe("WebGLState:",I)}}function F(){try{i.texSubImage3D(...arguments)}catch(I){Qe("WebGLState:",I)}}function G(){try{i.compressedTexSubImage2D(...arguments)}catch(I){Qe("WebGLState:",I)}}function Y(){try{i.compressedTexSubImage3D(...arguments)}catch(I){Qe("WebGLState:",I)}}function ae(){try{i.texStorage2D(...arguments)}catch(I){Qe("WebGLState:",I)}}function ce(){try{i.texStorage3D(...arguments)}catch(I){Qe("WebGLState:",I)}}function K(){try{i.texImage2D(...arguments)}catch(I){Qe("WebGLState:",I)}}function j(){try{i.texImage3D(...arguments)}catch(I){Qe("WebGLState:",I)}}function ue(I){return d[I]!==void 0?d[I]:i.getParameter(I)}function Pe(I,fe){d[I]!==fe&&(i.pixelStorei(I,fe),d[I]=fe)}function ge(I){je.equals(I)===!1&&(i.scissor(I.x,I.y,I.z,I.w),je.copy(I))}function de(I){We.equals(I)===!1&&(i.viewport(I.x,I.y,I.z,I.w),We.copy(I))}function Le(I,fe){let Z=c.get(fe);Z===void 0&&(Z=new WeakMap,c.set(fe,Z));let pe=Z.get(I);pe===void 0&&(pe=i.getUniformBlockIndex(fe,I.name),Z.set(I,pe))}function Oe(I,fe){const pe=c.get(fe).get(I);l.get(fe)!==pe&&(i.uniformBlockBinding(fe,pe,I.__bindingPointIndex),l.set(fe,pe))}function He(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),o.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),h={},d={},$=null,ee={},u={},f=new WeakMap,g=[],M=null,m=!1,p=null,w=null,A=null,S=null,E=null,T=null,R=null,x=new Ve(0,0,0),b=0,P=!1,N=null,z=null,V=null,U=null,O=null,je.set(0,0,i.canvas.width,i.canvas.height),We.set(0,0,i.canvas.width,i.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:Q,disable:le,bindFramebuffer:Ne,drawBuffers:Me,useProgram:Ue,setBlending:se,setMaterial:re,setFlipSided:oe,setCullFace:he,setLineWidth:Fe,setPolygonOffset:De,setScissorTest:ke,activeTexture:ze,bindTexture:C,unbindTexture:nt,compressedTexImage2D:qe,compressedTexImage3D:y,texImage2D:K,texImage3D:j,pixelStorei:Pe,getParameter:ue,updateUBOMapping:Le,uniformBlockBinding:Oe,texStorage2D:ae,texStorage3D:ce,texSubImage2D:_,texSubImage3D:F,compressedTexSubImage2D:G,compressedTexSubImage3D:Y,scissor:ge,viewport:de,reset:He}}function D0(i,e,t,n,s,r,o){const a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new me,h=new WeakMap,d=new Set;let u;const f=new WeakMap;let g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function M(y,_){return g?new OffscreenCanvas(y,_):fr("canvas")}function m(y,_,F){let G=1;const Y=qe(y);if((Y.width>F||Y.height>F)&&(G=F/Math.max(Y.width,Y.height)),G<1)if(typeof HTMLImageElement<"u"&&y instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&y instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&y instanceof ImageBitmap||typeof VideoFrame<"u"&&y instanceof VideoFrame){const ae=Math.floor(G*Y.width),ce=Math.floor(G*Y.height);u===void 0&&(u=M(ae,ce));const K=_?M(ae,ce):u;return K.width=ae,K.height=ce,K.getContext("2d").drawImage(y,0,0,ae,ce),Be("WebGLRenderer: Texture has been resized from ("+Y.width+"x"+Y.height+") to ("+ae+"x"+ce+")."),K}else return"data"in y&&Be("WebGLRenderer: Image in DataTexture is too big ("+Y.width+"x"+Y.height+")."),y;return y}function p(y){return y.generateMipmaps}function w(y){i.generateMipmap(y)}function A(y){return y.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:y.isWebGL3DRenderTarget?i.TEXTURE_3D:y.isWebGLArrayRenderTarget||y.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function S(y,_,F,G,Y,ae=!1){if(y!==null){if(i[y]!==void 0)return i[y];Be("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+y+"'")}let ce;G&&(ce=e.get("EXT_texture_norm16"),ce||Be("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let K=_;if(_===i.RED&&(F===i.FLOAT&&(K=i.R32F),F===i.HALF_FLOAT&&(K=i.R16F),F===i.UNSIGNED_BYTE&&(K=i.R8),F===i.UNSIGNED_SHORT&&ce&&(K=ce.R16_EXT),F===i.SHORT&&ce&&(K=ce.R16_SNORM_EXT)),_===i.RED_INTEGER&&(F===i.UNSIGNED_BYTE&&(K=i.R8UI),F===i.UNSIGNED_SHORT&&(K=i.R16UI),F===i.UNSIGNED_INT&&(K=i.R32UI),F===i.BYTE&&(K=i.R8I),F===i.SHORT&&(K=i.R16I),F===i.INT&&(K=i.R32I)),_===i.RG&&(F===i.FLOAT&&(K=i.RG32F),F===i.HALF_FLOAT&&(K=i.RG16F),F===i.UNSIGNED_BYTE&&(K=i.RG8),F===i.UNSIGNED_SHORT&&ce&&(K=ce.RG16_EXT),F===i.SHORT&&ce&&(K=ce.RG16_SNORM_EXT)),_===i.RG_INTEGER&&(F===i.UNSIGNED_BYTE&&(K=i.RG8UI),F===i.UNSIGNED_SHORT&&(K=i.RG16UI),F===i.UNSIGNED_INT&&(K=i.RG32UI),F===i.BYTE&&(K=i.RG8I),F===i.SHORT&&(K=i.RG16I),F===i.INT&&(K=i.RG32I)),_===i.RGB_INTEGER&&(F===i.UNSIGNED_BYTE&&(K=i.RGB8UI),F===i.UNSIGNED_SHORT&&(K=i.RGB16UI),F===i.UNSIGNED_INT&&(K=i.RGB32UI),F===i.BYTE&&(K=i.RGB8I),F===i.SHORT&&(K=i.RGB16I),F===i.INT&&(K=i.RGB32I)),_===i.RGBA_INTEGER&&(F===i.UNSIGNED_BYTE&&(K=i.RGBA8UI),F===i.UNSIGNED_SHORT&&(K=i.RGBA16UI),F===i.UNSIGNED_INT&&(K=i.RGBA32UI),F===i.BYTE&&(K=i.RGBA8I),F===i.SHORT&&(K=i.RGBA16I),F===i.INT&&(K=i.RGBA32I)),_===i.RGB&&(F===i.UNSIGNED_SHORT&&ce&&(K=ce.RGB16_EXT),F===i.SHORT&&ce&&(K=ce.RGB16_SNORM_EXT),F===i.UNSIGNED_INT_5_9_9_9_REV&&(K=i.RGB9_E5),F===i.UNSIGNED_INT_10F_11F_11F_REV&&(K=i.R11F_G11F_B10F)),_===i.RGBA){const j=ae?dr:$e.getTransfer(Y);F===i.FLOAT&&(K=i.RGBA32F),F===i.HALF_FLOAT&&(K=i.RGBA16F),F===i.UNSIGNED_BYTE&&(K=j===ot?i.SRGB8_ALPHA8:i.RGBA8),F===i.UNSIGNED_SHORT&&ce&&(K=ce.RGBA16_EXT),F===i.SHORT&&ce&&(K=ce.RGBA16_SNORM_EXT),F===i.UNSIGNED_SHORT_4_4_4_4&&(K=i.RGBA4),F===i.UNSIGNED_SHORT_5_5_5_1&&(K=i.RGB5_A1)}return(K===i.R16F||K===i.R32F||K===i.RG16F||K===i.RG32F||K===i.RGBA16F||K===i.RGBA32F)&&e.get("EXT_color_buffer_float"),K}function E(y,_){let F;return y?_===null||_===hn||_===ls?F=i.DEPTH24_STENCIL8:_===Zt?F=i.DEPTH32F_STENCIL8:_===as&&(F=i.DEPTH24_STENCIL8,Be("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):_===null||_===hn||_===ls?F=i.DEPTH_COMPONENT24:_===Zt?F=i.DEPTH_COMPONENT32F:_===as&&(F=i.DEPTH_COMPONENT16),F}function T(y,_){return p(y)===!0||y.isFramebufferTexture&&y.minFilter!==Tt&&y.minFilter!==Et?Math.log2(Math.max(_.width,_.height))+1:y.mipmaps!==void 0&&y.mipmaps.length>0?y.mipmaps.length:y.isCompressedTexture&&Array.isArray(y.image)?_.mipmaps.length:1}function R(y){const _=y.target;_.removeEventListener("dispose",R),b(_),_.isVideoTexture&&h.delete(_),_.isHTMLTexture&&d.delete(_)}function x(y){const _=y.target;_.removeEventListener("dispose",x),N(_)}function b(y){const _=n.get(y);if(_.__webglInit===void 0)return;const F=y.source,G=f.get(F);if(G){const Y=G[_.__cacheKey];Y.usedTimes--,Y.usedTimes===0&&P(y),Object.keys(G).length===0&&f.delete(F)}n.remove(y)}function P(y){const _=n.get(y);i.deleteTexture(_.__webglTexture);const F=y.source,G=f.get(F);delete G[_.__cacheKey],o.memory.textures--}function N(y){const _=n.get(y);if(y.depthTexture&&(y.depthTexture.dispose(),n.remove(y.depthTexture)),y.isWebGLCubeRenderTarget)for(let G=0;G<6;G++){if(Array.isArray(_.__webglFramebuffer[G]))for(let Y=0;Y<_.__webglFramebuffer[G].length;Y++)i.deleteFramebuffer(_.__webglFramebuffer[G][Y]);else i.deleteFramebuffer(_.__webglFramebuffer[G]);_.__webglDepthbuffer&&i.deleteRenderbuffer(_.__webglDepthbuffer[G])}else{if(Array.isArray(_.__webglFramebuffer))for(let G=0;G<_.__webglFramebuffer.length;G++)i.deleteFramebuffer(_.__webglFramebuffer[G]);else i.deleteFramebuffer(_.__webglFramebuffer);if(_.__webglDepthbuffer&&i.deleteRenderbuffer(_.__webglDepthbuffer),_.__webglMultisampledFramebuffer&&i.deleteFramebuffer(_.__webglMultisampledFramebuffer),_.__webglColorRenderbuffer)for(let G=0;G<_.__webglColorRenderbuffer.length;G++)_.__webglColorRenderbuffer[G]&&i.deleteRenderbuffer(_.__webglColorRenderbuffer[G]);_.__webglDepthRenderbuffer&&i.deleteRenderbuffer(_.__webglDepthRenderbuffer)}const F=y.textures;for(let G=0,Y=F.length;G<Y;G++){const ae=n.get(F[G]);ae.__webglTexture&&(i.deleteTexture(ae.__webglTexture),o.memory.textures--),n.remove(F[G])}n.remove(y)}let z=0;function V(){z=0}function U(){return z}function O(y){z=y}function J(){const y=z;return y>=s.maxTextures&&Be("WebGLTextures: Trying to use "+(y+1)+" texture units while this GPU supports only "+s.maxTextures),z+=1,y}function H(y){const _=[];return _.push(y.wrapS),_.push(y.wrapT),_.push(y.wrapR||0),_.push(y.magFilter),_.push(y.minFilter),_.push(y.anisotropy),_.push(y.internalFormat),_.push(y.format),_.push(y.type),_.push(y.generateMipmaps),_.push(y.premultiplyAlpha),_.push(y.flipY),_.push(y.unpackAlignment),_.push(y.colorSpace),_.join()}function ie(y,_){const F=n.get(y);if(y.isVideoTexture&&C(y),y.isRenderTargetTexture===!1&&y.isExternalTexture!==!0&&y.version>0&&F.__version!==y.version){const G=y.image;if(G===null)Be("WebGLRenderer: Texture marked for update but no image data found.");else if(G.complete===!1)Be("WebGLRenderer: Texture marked for update but image is incomplete");else{le(F,y,_);return}}else y.isExternalTexture&&(F.__webglTexture=y.sourceTexture?y.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,F.__webglTexture,i.TEXTURE0+_)}function X(y,_){const F=n.get(y);if(y.isRenderTargetTexture===!1&&y.version>0&&F.__version!==y.version){le(F,y,_);return}else y.isExternalTexture&&(F.__webglTexture=y.sourceTexture?y.sourceTexture:null);t.bindTexture(i.TEXTURE_2D_ARRAY,F.__webglTexture,i.TEXTURE0+_)}function $(y,_){const F=n.get(y);if(y.isRenderTargetTexture===!1&&y.version>0&&F.__version!==y.version){le(F,y,_);return}t.bindTexture(i.TEXTURE_3D,F.__webglTexture,i.TEXTURE0+_)}function ee(y,_){const F=n.get(y);if(y.isCubeDepthTexture!==!0&&y.version>0&&F.__version!==y.version){Ne(F,y,_);return}t.bindTexture(i.TEXTURE_CUBE_MAP,F.__webglTexture,i.TEXTURE0+_)}const Ae={[Ro]:i.REPEAT,[yn]:i.CLAMP_TO_EDGE,[Co]:i.MIRRORED_REPEAT},ye={[Tt]:i.NEAREST,[uu]:i.NEAREST_MIPMAP_NEAREST,[xs]:i.NEAREST_MIPMAP_LINEAR,[Et]:i.LINEAR,[Lr]:i.LINEAR_MIPMAP_NEAREST,[qn]:i.LINEAR_MIPMAP_LINEAR},je={[mu]:i.NEVER,[Mu]:i.ALWAYS,[gu]:i.LESS,[ba]:i.LEQUAL,[_u]:i.EQUAL,[Aa]:i.GEQUAL,[xu]:i.GREATER,[vu]:i.NOTEQUAL};function We(y,_){if(_.type===Zt&&e.has("OES_texture_float_linear")===!1&&(_.magFilter===Et||_.magFilter===Lr||_.magFilter===xs||_.magFilter===qn||_.minFilter===Et||_.minFilter===Lr||_.minFilter===xs||_.minFilter===qn)&&Be("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(y,i.TEXTURE_WRAP_S,Ae[_.wrapS]),i.texParameteri(y,i.TEXTURE_WRAP_T,Ae[_.wrapT]),(y===i.TEXTURE_3D||y===i.TEXTURE_2D_ARRAY)&&i.texParameteri(y,i.TEXTURE_WRAP_R,Ae[_.wrapR]),i.texParameteri(y,i.TEXTURE_MAG_FILTER,ye[_.magFilter]),i.texParameteri(y,i.TEXTURE_MIN_FILTER,ye[_.minFilter]),_.compareFunction&&(i.texParameteri(y,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(y,i.TEXTURE_COMPARE_FUNC,je[_.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(_.magFilter===Tt||_.minFilter!==xs&&_.minFilter!==qn||_.type===Zt&&e.has("OES_texture_float_linear")===!1)return;if(_.anisotropy>1||n.get(_).__currentAnisotropy){const F=e.get("EXT_texture_filter_anisotropic");i.texParameterf(y,F.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(_.anisotropy,s.getMaxAnisotropy())),n.get(_).__currentAnisotropy=_.anisotropy}}}function Ze(y,_){let F=!1;y.__webglInit===void 0&&(y.__webglInit=!0,_.addEventListener("dispose",R));const G=_.source;let Y=f.get(G);Y===void 0&&(Y={},f.set(G,Y));const ae=H(_);if(ae!==y.__cacheKey){Y[ae]===void 0&&(Y[ae]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,F=!0),Y[ae].usedTimes++;const ce=Y[y.__cacheKey];ce!==void 0&&(Y[y.__cacheKey].usedTimes--,ce.usedTimes===0&&P(_)),y.__cacheKey=ae,y.__webglTexture=Y[ae].texture}return F}function q(y,_,F){return Math.floor(Math.floor(y/F)/_)}function Q(y,_,F,G){const ae=y.updateRanges;if(ae.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,_.width,_.height,F,G,_.data);else{ae.sort((Pe,ge)=>Pe.start-ge.start);let ce=0;for(let Pe=1;Pe<ae.length;Pe++){const ge=ae[ce],de=ae[Pe],Le=ge.start+ge.count,Oe=q(de.start,_.width,4),He=q(ge.start,_.width,4);de.start<=Le+1&&Oe===He&&q(de.start+de.count-1,_.width,4)===Oe?ge.count=Math.max(ge.count,de.start+de.count-ge.start):(++ce,ae[ce]=de)}ae.length=ce+1;const K=t.getParameter(i.UNPACK_ROW_LENGTH),j=t.getParameter(i.UNPACK_SKIP_PIXELS),ue=t.getParameter(i.UNPACK_SKIP_ROWS);t.pixelStorei(i.UNPACK_ROW_LENGTH,_.width);for(let Pe=0,ge=ae.length;Pe<ge;Pe++){const de=ae[Pe],Le=Math.floor(de.start/4),Oe=Math.ceil(de.count/4),He=Le%_.width,I=Math.floor(Le/_.width),fe=Oe,Z=1;t.pixelStorei(i.UNPACK_SKIP_PIXELS,He),t.pixelStorei(i.UNPACK_SKIP_ROWS,I),t.texSubImage2D(i.TEXTURE_2D,0,He,I,fe,Z,F,G,_.data)}y.clearUpdateRanges(),t.pixelStorei(i.UNPACK_ROW_LENGTH,K),t.pixelStorei(i.UNPACK_SKIP_PIXELS,j),t.pixelStorei(i.UNPACK_SKIP_ROWS,ue)}}function le(y,_,F){let G=i.TEXTURE_2D;(_.isDataArrayTexture||_.isCompressedArrayTexture)&&(G=i.TEXTURE_2D_ARRAY),_.isData3DTexture&&(G=i.TEXTURE_3D);const Y=Ze(y,_),ae=_.source;t.bindTexture(G,y.__webglTexture,i.TEXTURE0+F);const ce=n.get(ae);if(ae.version!==ce.__version||Y===!0){if(t.activeTexture(i.TEXTURE0+F),(typeof ImageBitmap<"u"&&_.image instanceof ImageBitmap)===!1){const Z=$e.getPrimaries($e.workingColorSpace),pe=_.colorSpace===On?null:$e.getPrimaries(_.colorSpace),Se=_.colorSpace===On||Z===pe?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,_.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Se)}t.pixelStorei(i.UNPACK_ALIGNMENT,_.unpackAlignment);let j=m(_.image,!1,s.maxTextureSize);j=nt(_,j);const ue=r.convert(_.format,_.colorSpace),Pe=r.convert(_.type);let ge=S(_.internalFormat,ue,Pe,_.normalized,_.colorSpace,_.isVideoTexture);We(G,_);let de;const Le=_.mipmaps,Oe=_.isVideoTexture!==!0,He=ce.__version===void 0||Y===!0,I=ae.dataReady,fe=T(_,j);if(_.isDepthTexture)ge=E(_.format===Kn,_.type),He&&(Oe?t.texStorage2D(i.TEXTURE_2D,1,ge,j.width,j.height):t.texImage2D(i.TEXTURE_2D,0,ge,j.width,j.height,0,ue,Pe,null));else if(_.isDataTexture)if(Le.length>0){Oe&&He&&t.texStorage2D(i.TEXTURE_2D,fe,ge,Le[0].width,Le[0].height);for(let Z=0,pe=Le.length;Z<pe;Z++)de=Le[Z],Oe?I&&t.texSubImage2D(i.TEXTURE_2D,Z,0,0,de.width,de.height,ue,Pe,de.data):t.texImage2D(i.TEXTURE_2D,Z,ge,de.width,de.height,0,ue,Pe,de.data);_.generateMipmaps=!1}else Oe?(He&&t.texStorage2D(i.TEXTURE_2D,fe,ge,j.width,j.height),I&&Q(_,j,ue,Pe)):t.texImage2D(i.TEXTURE_2D,0,ge,j.width,j.height,0,ue,Pe,j.data);else if(_.isCompressedTexture)if(_.isCompressedArrayTexture){Oe&&He&&t.texStorage3D(i.TEXTURE_2D_ARRAY,fe,ge,Le[0].width,Le[0].height,j.depth);for(let Z=0,pe=Le.length;Z<pe;Z++)if(de=Le[Z],_.format!==$t)if(ue!==null)if(Oe){if(I)if(_.layerUpdates.size>0){const Se=ql(de.width,de.height,_.format,_.type);for(const ne of _.layerUpdates){const Ie=de.data.subarray(ne*Se/de.data.BYTES_PER_ELEMENT,(ne+1)*Se/de.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,Z,0,0,ne,de.width,de.height,1,ue,Ie)}}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,Z,0,0,0,de.width,de.height,j.depth,ue,de.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,Z,ge,de.width,de.height,j.depth,0,de.data,0,0);else Be("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Oe?I&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,Z,0,0,0,de.width,de.height,j.depth,ue,Pe,de.data):t.texImage3D(i.TEXTURE_2D_ARRAY,Z,ge,de.width,de.height,j.depth,0,ue,Pe,de.data);_.layerUpdates.size>0&&_.clearLayerUpdates()}else{Oe&&He&&t.texStorage2D(i.TEXTURE_2D,fe,ge,Le[0].width,Le[0].height);for(let Z=0,pe=Le.length;Z<pe;Z++)de=Le[Z],_.format!==$t?ue!==null?Oe?I&&t.compressedTexSubImage2D(i.TEXTURE_2D,Z,0,0,de.width,de.height,ue,de.data):t.compressedTexImage2D(i.TEXTURE_2D,Z,ge,de.width,de.height,0,de.data):Be("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Oe?I&&t.texSubImage2D(i.TEXTURE_2D,Z,0,0,de.width,de.height,ue,Pe,de.data):t.texImage2D(i.TEXTURE_2D,Z,ge,de.width,de.height,0,ue,Pe,de.data)}else if(_.isDataArrayTexture)if(Oe){if(He&&t.texStorage3D(i.TEXTURE_2D_ARRAY,fe,ge,j.width,j.height,j.depth),I)if(_.layerUpdates.size>0){const Z=ql(j.width,j.height,_.format,_.type);for(const pe of _.layerUpdates){const Se=j.data.subarray(pe*Z/j.data.BYTES_PER_ELEMENT,(pe+1)*Z/j.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,pe,j.width,j.height,1,ue,Pe,Se)}_.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,j.width,j.height,j.depth,ue,Pe,j.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,ge,j.width,j.height,j.depth,0,ue,Pe,j.data);else if(_.isData3DTexture)Oe?(He&&t.texStorage3D(i.TEXTURE_3D,fe,ge,j.width,j.height,j.depth),I&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,j.width,j.height,j.depth,ue,Pe,j.data)):t.texImage3D(i.TEXTURE_3D,0,ge,j.width,j.height,j.depth,0,ue,Pe,j.data);else if(_.isFramebufferTexture){if(He)if(Oe)t.texStorage2D(i.TEXTURE_2D,fe,ge,j.width,j.height);else{let Z=j.width,pe=j.height;for(let Se=0;Se<fe;Se++)t.texImage2D(i.TEXTURE_2D,Se,ge,Z,pe,0,ue,Pe,null),Z>>=1,pe>>=1}}else if(_.isHTMLTexture){if("texElementImage2D"in i){const Z=i.canvas;if(Z.hasAttribute("layoutsubtree")||Z.setAttribute("layoutsubtree","true"),j.parentNode!==Z){Z.appendChild(j),d.add(_),Z.onpaint=pe=>{const Se=pe.changedElements;for(const ne of d)Se.includes(ne.image)&&(ne.needsUpdate=!0)},Z.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,j);else{const Se=i.RGBA,ne=i.RGBA,Ie=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,Se,ne,Ie,j)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(Le.length>0){if(Oe&&He){const Z=qe(Le[0]);t.texStorage2D(i.TEXTURE_2D,fe,ge,Z.width,Z.height)}for(let Z=0,pe=Le.length;Z<pe;Z++)de=Le[Z],Oe?I&&t.texSubImage2D(i.TEXTURE_2D,Z,0,0,ue,Pe,de):t.texImage2D(i.TEXTURE_2D,Z,ge,ue,Pe,de);_.generateMipmaps=!1}else if(Oe){if(He){const Z=qe(j);t.texStorage2D(i.TEXTURE_2D,fe,ge,Z.width,Z.height)}I&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,ue,Pe,j)}else t.texImage2D(i.TEXTURE_2D,0,ge,ue,Pe,j);p(_)&&w(G),ce.__version=ae.version,_.onUpdate&&_.onUpdate(_)}y.__version=_.version}function Ne(y,_,F){if(_.image.length!==6)return;const G=Ze(y,_),Y=_.source;t.bindTexture(i.TEXTURE_CUBE_MAP,y.__webglTexture,i.TEXTURE0+F);const ae=n.get(Y);if(Y.version!==ae.__version||G===!0){t.activeTexture(i.TEXTURE0+F);const ce=$e.getPrimaries($e.workingColorSpace),K=_.colorSpace===On?null:$e.getPrimaries(_.colorSpace),j=_.colorSpace===On||ce===K?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,_.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),t.pixelStorei(i.UNPACK_ALIGNMENT,_.unpackAlignment),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,j);const ue=_.isCompressedTexture||_.image[0].isCompressedTexture,Pe=_.image[0]&&_.image[0].isDataTexture,ge=[];for(let ne=0;ne<6;ne++)!ue&&!Pe?ge[ne]=m(_.image[ne],!0,s.maxCubemapSize):ge[ne]=Pe?_.image[ne].image:_.image[ne],ge[ne]=nt(_,ge[ne]);const de=ge[0],Le=r.convert(_.format,_.colorSpace),Oe=r.convert(_.type),He=S(_.internalFormat,Le,Oe,_.normalized,_.colorSpace),I=_.isVideoTexture!==!0,fe=ae.__version===void 0||G===!0,Z=Y.dataReady;let pe=T(_,de);We(i.TEXTURE_CUBE_MAP,_);let Se;if(ue){I&&fe&&t.texStorage2D(i.TEXTURE_CUBE_MAP,pe,He,de.width,de.height);for(let ne=0;ne<6;ne++){Se=ge[ne].mipmaps;for(let Ie=0;Ie<Se.length;Ie++){const Re=Se[Ie];_.format!==$t?Le!==null?I?Z&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Ie,0,0,Re.width,Re.height,Le,Re.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Ie,He,Re.width,Re.height,0,Re.data):Be("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):I?Z&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Ie,0,0,Re.width,Re.height,Le,Oe,Re.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Ie,He,Re.width,Re.height,0,Le,Oe,Re.data)}}}else{if(Se=_.mipmaps,I&&fe){Se.length>0&&pe++;const ne=qe(ge[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,pe,He,ne.width,ne.height)}for(let ne=0;ne<6;ne++)if(Pe){I?Z&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,0,0,ge[ne].width,ge[ne].height,Le,Oe,ge[ne].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,He,ge[ne].width,ge[ne].height,0,Le,Oe,ge[ne].data);for(let Ie=0;Ie<Se.length;Ie++){const ct=Se[Ie].image[ne].image;I?Z&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Ie+1,0,0,ct.width,ct.height,Le,Oe,ct.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Ie+1,He,ct.width,ct.height,0,Le,Oe,ct.data)}}else{I?Z&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,0,0,Le,Oe,ge[ne]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,He,Le,Oe,ge[ne]);for(let Ie=0;Ie<Se.length;Ie++){const Re=Se[Ie];I?Z&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Ie+1,0,0,Le,Oe,Re.image[ne]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Ie+1,He,Le,Oe,Re.image[ne])}}}p(_)&&w(i.TEXTURE_CUBE_MAP),ae.__version=Y.version,_.onUpdate&&_.onUpdate(_)}y.__version=_.version}function Me(y,_,F,G,Y,ae){const ce=r.convert(F.format,F.colorSpace),K=r.convert(F.type),j=S(F.internalFormat,ce,K,F.normalized,F.colorSpace),ue=n.get(_),Pe=n.get(F);if(Pe.__renderTarget=_,!ue.__hasExternalTextures){const ge=Math.max(1,_.width>>ae),de=Math.max(1,_.height>>ae);Y===i.TEXTURE_3D||Y===i.TEXTURE_2D_ARRAY?t.texImage3D(Y,ae,j,ge,de,_.depth,0,ce,K,null):t.texImage2D(Y,ae,j,ge,de,0,ce,K,null)}t.bindFramebuffer(i.FRAMEBUFFER,y),ze(_)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,G,Y,Pe.__webglTexture,0,ke(_)):(Y===i.TEXTURE_2D||Y>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&Y<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,G,Y,Pe.__webglTexture,ae),t.bindFramebuffer(i.FRAMEBUFFER,null)}function Ue(y,_,F){if(i.bindRenderbuffer(i.RENDERBUFFER,y),_.depthBuffer){const G=_.depthTexture,Y=G&&G.isDepthTexture?G.type:null,ae=E(_.stencilBuffer,Y),ce=_.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;ze(_)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ke(_),ae,_.width,_.height):F?i.renderbufferStorageMultisample(i.RENDERBUFFER,ke(_),ae,_.width,_.height):i.renderbufferStorage(i.RENDERBUFFER,ae,_.width,_.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,ce,i.RENDERBUFFER,y)}else{const G=_.textures;for(let Y=0;Y<G.length;Y++){const ae=G[Y],ce=r.convert(ae.format,ae.colorSpace),K=r.convert(ae.type),j=S(ae.internalFormat,ce,K,ae.normalized,ae.colorSpace);ze(_)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ke(_),j,_.width,_.height):F?i.renderbufferStorageMultisample(i.RENDERBUFFER,ke(_),j,_.width,_.height):i.renderbufferStorage(i.RENDERBUFFER,j,_.width,_.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function rt(y,_,F){const G=_.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(i.FRAMEBUFFER,y),!(_.depthTexture&&_.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");const Y=n.get(_.depthTexture);if(Y.__renderTarget=_,(!Y.__webglTexture||_.depthTexture.image.width!==_.width||_.depthTexture.image.height!==_.height)&&(_.depthTexture.image.width=_.width,_.depthTexture.image.height=_.height,_.depthTexture.needsUpdate=!0),G){if(Y.__webglInit===void 0&&(Y.__webglInit=!0,_.depthTexture.addEventListener("dispose",R)),Y.__webglTexture===void 0){Y.__webglTexture=i.createTexture(),t.bindTexture(i.TEXTURE_CUBE_MAP,Y.__webglTexture),We(i.TEXTURE_CUBE_MAP,_.depthTexture);const ue=r.convert(_.depthTexture.format),Pe=r.convert(_.depthTexture.type);let ge;_.depthTexture.format===Tn?ge=i.DEPTH_COMPONENT24:_.depthTexture.format===Kn&&(ge=i.DEPTH24_STENCIL8);for(let de=0;de<6;de++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,0,ge,_.width,_.height,0,ue,Pe,null)}}else ie(_.depthTexture,0);const ae=Y.__webglTexture,ce=ke(_),K=G?i.TEXTURE_CUBE_MAP_POSITIVE_X+F:i.TEXTURE_2D,j=_.depthTexture.format===Kn?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(_.depthTexture.format===Tn)ze(_)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,j,K,ae,0,ce):i.framebufferTexture2D(i.FRAMEBUFFER,j,K,ae,0);else if(_.depthTexture.format===Kn)ze(_)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,j,K,ae,0,ce):i.framebufferTexture2D(i.FRAMEBUFFER,j,K,ae,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function te(y){const _=n.get(y),F=y.isWebGLCubeRenderTarget===!0;if(_.__boundDepthTexture!==y.depthTexture){const G=y.depthTexture;if(_.__depthDisposeCallback&&_.__depthDisposeCallback(),G){const Y=()=>{delete _.__boundDepthTexture,delete _.__depthDisposeCallback,G.removeEventListener("dispose",Y)};G.addEventListener("dispose",Y),_.__depthDisposeCallback=Y}_.__boundDepthTexture=G}if(y.depthTexture&&!_.__autoAllocateDepthBuffer)if(F)for(let G=0;G<6;G++)rt(_.__webglFramebuffer[G],y,G);else{const G=y.texture.mipmaps;G&&G.length>0?rt(_.__webglFramebuffer[0],y,0):rt(_.__webglFramebuffer,y,0)}else if(F){_.__webglDepthbuffer=[];for(let G=0;G<6;G++)if(t.bindFramebuffer(i.FRAMEBUFFER,_.__webglFramebuffer[G]),_.__webglDepthbuffer[G]===void 0)_.__webglDepthbuffer[G]=i.createRenderbuffer(),Ue(_.__webglDepthbuffer[G],y,!1);else{const Y=y.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ae=_.__webglDepthbuffer[G];i.bindRenderbuffer(i.RENDERBUFFER,ae),i.framebufferRenderbuffer(i.FRAMEBUFFER,Y,i.RENDERBUFFER,ae)}}else{const G=y.texture.mipmaps;if(G&&G.length>0?t.bindFramebuffer(i.FRAMEBUFFER,_.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,_.__webglFramebuffer),_.__webglDepthbuffer===void 0)_.__webglDepthbuffer=i.createRenderbuffer(),Ue(_.__webglDepthbuffer,y,!1);else{const Y=y.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ae=_.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,ae),i.framebufferRenderbuffer(i.FRAMEBUFFER,Y,i.RENDERBUFFER,ae)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function se(y,_,F){const G=n.get(y);_!==void 0&&Me(G.__webglFramebuffer,y,y.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),F!==void 0&&te(y)}function re(y){const _=y.texture,F=n.get(y),G=n.get(_);y.addEventListener("dispose",x);const Y=y.textures,ae=y.isWebGLCubeRenderTarget===!0,ce=Y.length>1;if(ce||(G.__webglTexture===void 0&&(G.__webglTexture=i.createTexture()),G.__version=_.version,o.memory.textures++),ae){F.__webglFramebuffer=[];for(let K=0;K<6;K++)if(_.mipmaps&&_.mipmaps.length>0){F.__webglFramebuffer[K]=[];for(let j=0;j<_.mipmaps.length;j++)F.__webglFramebuffer[K][j]=i.createFramebuffer()}else F.__webglFramebuffer[K]=i.createFramebuffer()}else{if(_.mipmaps&&_.mipmaps.length>0){F.__webglFramebuffer=[];for(let K=0;K<_.mipmaps.length;K++)F.__webglFramebuffer[K]=i.createFramebuffer()}else F.__webglFramebuffer=i.createFramebuffer();if(ce)for(let K=0,j=Y.length;K<j;K++){const ue=n.get(Y[K]);ue.__webglTexture===void 0&&(ue.__webglTexture=i.createTexture(),o.memory.textures++)}if(y.samples>0&&ze(y)===!1){F.__webglMultisampledFramebuffer=i.createFramebuffer(),F.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,F.__webglMultisampledFramebuffer);for(let K=0;K<Y.length;K++){const j=Y[K];F.__webglColorRenderbuffer[K]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,F.__webglColorRenderbuffer[K]);const ue=r.convert(j.format,j.colorSpace),Pe=r.convert(j.type),ge=S(j.internalFormat,ue,Pe,j.normalized,j.colorSpace,y.isXRRenderTarget===!0),de=ke(y);i.renderbufferStorageMultisample(i.RENDERBUFFER,de,ge,y.width,y.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+K,i.RENDERBUFFER,F.__webglColorRenderbuffer[K])}i.bindRenderbuffer(i.RENDERBUFFER,null),y.depthBuffer&&(F.__webglDepthRenderbuffer=i.createRenderbuffer(),Ue(F.__webglDepthRenderbuffer,y,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(ae){t.bindTexture(i.TEXTURE_CUBE_MAP,G.__webglTexture),We(i.TEXTURE_CUBE_MAP,_);for(let K=0;K<6;K++)if(_.mipmaps&&_.mipmaps.length>0)for(let j=0;j<_.mipmaps.length;j++)Me(F.__webglFramebuffer[K][j],y,_,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+K,j);else Me(F.__webglFramebuffer[K],y,_,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+K,0);p(_)&&w(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(ce){for(let K=0,j=Y.length;K<j;K++){const ue=Y[K],Pe=n.get(ue);let ge=i.TEXTURE_2D;(y.isWebGL3DRenderTarget||y.isWebGLArrayRenderTarget)&&(ge=y.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(ge,Pe.__webglTexture),We(ge,ue),Me(F.__webglFramebuffer,y,ue,i.COLOR_ATTACHMENT0+K,ge,0),p(ue)&&w(ge)}t.unbindTexture()}else{let K=i.TEXTURE_2D;if((y.isWebGL3DRenderTarget||y.isWebGLArrayRenderTarget)&&(K=y.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(K,G.__webglTexture),We(K,_),_.mipmaps&&_.mipmaps.length>0)for(let j=0;j<_.mipmaps.length;j++)Me(F.__webglFramebuffer[j],y,_,i.COLOR_ATTACHMENT0,K,j);else Me(F.__webglFramebuffer,y,_,i.COLOR_ATTACHMENT0,K,0);p(_)&&w(K),t.unbindTexture()}y.depthBuffer&&te(y)}function oe(y){const _=y.textures;for(let F=0,G=_.length;F<G;F++){const Y=_[F];if(p(Y)){const ae=A(y),ce=n.get(Y).__webglTexture;t.bindTexture(ae,ce),w(ae),t.unbindTexture()}}}const he=[],Fe=[];function De(y){if(y.samples>0){if(ze(y)===!1){const _=y.textures,F=y.width,G=y.height;let Y=i.COLOR_BUFFER_BIT;const ae=y.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ce=n.get(y),K=_.length>1;if(K)for(let ue=0;ue<_.length;ue++)t.bindFramebuffer(i.FRAMEBUFFER,ce.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ue,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,ce.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ue,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,ce.__webglMultisampledFramebuffer);const j=y.texture.mipmaps;j&&j.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ce.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ce.__webglFramebuffer);for(let ue=0;ue<_.length;ue++){if(y.resolveDepthBuffer&&(y.depthBuffer&&(Y|=i.DEPTH_BUFFER_BIT),y.stencilBuffer&&y.resolveStencilBuffer&&(Y|=i.STENCIL_BUFFER_BIT)),K){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,ce.__webglColorRenderbuffer[ue]);const Pe=n.get(_[ue]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Pe,0)}i.blitFramebuffer(0,0,F,G,0,0,F,G,Y,i.NEAREST),l===!0&&(he.length=0,Fe.length=0,he.push(i.COLOR_ATTACHMENT0+ue),y.depthBuffer&&y.storeMultisampledDepthBuffer===!1&&(he.push(ae),Fe.push(ae),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,Fe)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,he))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),K)for(let ue=0;ue<_.length;ue++){t.bindFramebuffer(i.FRAMEBUFFER,ce.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ue,i.RENDERBUFFER,ce.__webglColorRenderbuffer[ue]);const Pe=n.get(_[ue]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,ce.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ue,i.TEXTURE_2D,Pe,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ce.__webglMultisampledFramebuffer)}else if(y.depthBuffer&&y.storeMultisampledDepthBuffer===!1&&l){const _=y.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[_])}}}function ke(y){return Math.min(s.maxSamples,y.samples)}function ze(y){const _=n.get(y);return y.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&_.__useRenderToTexture!==!1}function C(y){const _=o.render.frame;h.get(y)!==_&&(h.set(y,_),y.update())}function nt(y,_){const F=y.colorSpace,G=y.format,Y=y.type;return y.isCompressedTexture===!0||y.isVideoTexture===!0||F!==ur&&F!==On&&($e.getTransfer(F)===ot?(G!==$t||Y!==kt)&&Be("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Qe("WebGLTextures: Unsupported texture color space:",F)),_}function qe(y){return typeof HTMLImageElement<"u"&&y instanceof HTMLImageElement?(c.width=y.naturalWidth||y.width,c.height=y.naturalHeight||y.height):typeof VideoFrame<"u"&&y instanceof VideoFrame?(c.width=y.displayWidth,c.height=y.displayHeight):(c.width=y.width,c.height=y.height),c}this.allocateTextureUnit=J,this.resetTextureUnits=V,this.getTextureUnits=U,this.setTextureUnits=O,this.setTexture2D=ie,this.setTexture2DArray=X,this.setTexture3D=$,this.setTextureCube=ee,this.rebindTextures=se,this.setupRenderTarget=re,this.updateRenderTargetMipmap=oe,this.updateMultisampleRenderTarget=De,this.setupDepthRenderbuffer=te,this.setupFrameBufferTexture=Me,this.useMultisampledRTT=ze,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function N0(i,e){function t(n,s=On){let r;const o=$e.getTransfer(s);if(n===kt)return i.UNSIGNED_BYTE;if(n===Ma)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Sa)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Yc)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===qc)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===Wc)return i.BYTE;if(n===Xc)return i.SHORT;if(n===as)return i.UNSIGNED_SHORT;if(n===va)return i.INT;if(n===hn)return i.UNSIGNED_INT;if(n===Zt)return i.FLOAT;if(n===un)return i.HALF_FLOAT;if(n===Kc)return i.ALPHA;if(n===Jc)return i.RGB;if(n===$t)return i.RGBA;if(n===Tn)return i.DEPTH_COMPONENT;if(n===Kn)return i.DEPTH_STENCIL;if(n===ya)return i.RED;if(n===Ea)return i.RED_INTEGER;if(n===Qn)return i.RG;if(n===wa)return i.RG_INTEGER;if(n===Ta)return i.RGBA_INTEGER;if(n===nr||n===ir||n===sr||n===rr)if(o===ot)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===nr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===ir)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===sr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===rr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===nr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===ir)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===sr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===rr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Po||n===Lo||n===Io||n===Do)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Po)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Lo)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Io)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Do)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===No||n===Uo||n===Fo||n===Oo||n===Bo||n===cr||n===ko)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===No||n===Uo)return o===ot?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Fo)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===Oo)return r.COMPRESSED_R11_EAC;if(n===Bo)return r.COMPRESSED_SIGNED_R11_EAC;if(n===cr)return r.COMPRESSED_RG11_EAC;if(n===ko)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===zo||n===Go||n===Ho||n===Vo||n===Wo||n===Xo||n===Yo||n===qo||n===Ko||n===Jo||n===Zo||n===$o||n===Qo||n===jo)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===zo)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Go)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Ho)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Vo)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Wo)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Xo)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Yo)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===qo)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Ko)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Jo)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Zo)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===$o)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Qo)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===jo)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===ea||n===ta||n===na)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===ea)return o===ot?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===ta)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===na)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===ia||n===sa||n===hr||n===ra)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===ia)return r.COMPRESSED_RED_RGTC1_EXT;if(n===sa)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===hr)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===ra)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===ls?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}const U0=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,F0=`
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

}`;class O0{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const n=new ih(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new dn({vertexShader:U0,fragmentShader:F0,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new gt(new ii(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class B0 extends ti{constructor(e,t){super();const n=this;let s=null,r=1,o=null,a="local-floor",l=1,c=null,h=null,d=null,u=null,f=null,g=null;const M=typeof XRWebGLBinding<"u",m=new O0,p={},w=t.getContextAttributes();let A=null,S=null;const E=[],T=[],R=new me;let x=null,b=null;const P=new Jt;P.viewport=new ft;const N=new Jt;N.viewport=new ft;const z=[P,N],V=new Wd;let U=null,O=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(q){let Q=E[q];return Q===void 0&&(Q=new kr,E[q]=Q),Q.getTargetRaySpace()},this.getControllerGrip=function(q){let Q=E[q];return Q===void 0&&(Q=new kr,E[q]=Q),Q.getGripSpace()},this.getHand=function(q){let Q=E[q];return Q===void 0&&(Q=new kr,E[q]=Q),Q.getHandSpace()};function J(q){const Q=T.indexOf(q.inputSource);if(Q===-1)return;const le=E[Q];le!==void 0&&(le.update(q.inputSource,q.frame,c||o),le.dispatchEvent({type:q.type,data:q.inputSource}))}function H(){s.removeEventListener("select",J),s.removeEventListener("selectstart",J),s.removeEventListener("selectend",J),s.removeEventListener("squeeze",J),s.removeEventListener("squeezestart",J),s.removeEventListener("squeezeend",J),s.removeEventListener("end",H),s.removeEventListener("inputsourceschange",ie);for(let q=0;q<E.length;q++){const Q=T[q];Q!==null&&(T[q]=null,E[q].disconnect(Q))}U=null,O=null,m.reset();for(const q in p)delete p[q];if(e.setRenderTarget(A),f=null,u=null,d=null,s=null,S=null,Ze.stop(),n.isPresenting=!1,e.setPixelRatio(x),e.setSize(R.width,R.height,!1),b!==null){const q=b.camera;q.fov=b.fov,q.zoom=b.zoom,q.updateProjectionMatrix(),b=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(q){r=q,n.isPresenting===!0&&Be("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(q){a=q,n.isPresenting===!0&&Be("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(q){c=q},this.getBaseLayer=function(){return u!==null?u:f},this.getBinding=function(){return d===null&&M&&(d=new XRWebGLBinding(s,t)),d},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(q){if(s=q,s!==null){if(A=e.getRenderTarget(),s.addEventListener("select",J),s.addEventListener("selectstart",J),s.addEventListener("selectend",J),s.addEventListener("squeeze",J),s.addEventListener("squeezestart",J),s.addEventListener("squeezeend",J),s.addEventListener("end",H),s.addEventListener("inputsourceschange",ie),w.xrCompatible!==!0&&await t.makeXRCompatible(),x=e.getPixelRatio(),e.getSize(R),M&&"createProjectionLayer"in XRWebGLBinding.prototype){let le=null,Ne=null,Me=null;w.depth&&(Me=w.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,le=w.stencil?Kn:Tn,Ne=w.stencil?ls:hn);const Ue={colorFormat:t.RGBA8,depthFormat:Me,scaleFactor:r};d=this.getBinding(),u=d.createProjectionLayer(Ue),s.updateRenderState({layers:[u]}),e.setPixelRatio(1),e.setSize(u.textureWidth,u.textureHeight,!1),S=new jt(u.textureWidth,u.textureHeight,{format:$t,type:kt,depthTexture:new hs(u.textureWidth,u.textureHeight,Ne,void 0,void 0,void 0,void 0,void 0,void 0,le),stencilBuffer:w.stencil,colorSpace:e.outputColorSpace,samples:w.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1,storeMultisampledDepthBuffer:u.ignoreDepthValues===!1,storeMultisampledStencilBuffer:u.ignoreDepthValues===!1})}else{const le={antialias:w.antialias,alpha:!0,depth:w.depth,stencil:w.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,t,le),s.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),S=new jt(f.framebufferWidth,f.framebufferHeight,{format:$t,type:kt,colorSpace:e.outputColorSpace,stencilBuffer:w.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}S.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await s.requestReferenceSpace(a),Ze.setContext(s),Ze.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function ie(q){for(let Q=0;Q<q.removed.length;Q++){const le=q.removed[Q],Ne=T.indexOf(le);Ne>=0&&(T[Ne]=null,E[Ne].disconnect(le))}for(let Q=0;Q<q.added.length;Q++){const le=q.added[Q];let Ne=T.indexOf(le);if(Ne===-1){for(let Ue=0;Ue<E.length;Ue++)if(Ue>=T.length){T.push(le),Ne=Ue;break}else if(T[Ue]===null){T[Ue]=le,Ne=Ue;break}if(Ne===-1)break}const Me=E[Ne];Me&&Me.connect(le)}}const X=new D,$=new D;function ee(q,Q,le){X.setFromMatrixPosition(Q.matrixWorld),$.setFromMatrixPosition(le.matrixWorld);const Ne=X.distanceTo($),Me=Q.projectionMatrix.elements,Ue=le.projectionMatrix.elements,rt=Me[14]/(Me[10]-1),te=Me[14]/(Me[10]+1),se=(Me[9]+1)/Me[5],re=(Me[9]-1)/Me[5],oe=(Me[8]-1)/Me[0],he=(Ue[8]+1)/Ue[0],Fe=rt*oe,De=rt*he,ke=Ne/(-oe+he),ze=ke*-oe;if(Q.matrixWorld.decompose(q.position,q.quaternion,q.scale),q.translateX(ze),q.translateZ(ke),q.matrixWorld.compose(q.position,q.quaternion,q.scale),q.matrixWorldInverse.copy(q.matrixWorld).invert(),Me[10]===-1)q.projectionMatrix.copy(Q.projectionMatrix),q.projectionMatrixInverse.copy(Q.projectionMatrixInverse);else{const C=rt+ke,nt=te+ke,qe=Fe-ze,y=De+(Ne-ze),_=se*te/nt*C,F=re*te/nt*C;q.projectionMatrix.makePerspective(qe,y,_,F,C,nt),q.projectionMatrixInverse.copy(q.projectionMatrix).invert()}}function Ae(q,Q){Q===null?q.matrixWorld.copy(q.matrix):q.matrixWorld.multiplyMatrices(Q.matrixWorld,q.matrix),q.matrixWorldInverse.copy(q.matrixWorld).invert()}this.updateCamera=function(q){if(s===null)return;let Q=q.near,le=q.far;m.texture!==null&&(m.depthNear>0&&(Q=m.depthNear),m.depthFar>0&&(le=m.depthFar)),V.near=N.near=P.near=Q,V.far=N.far=P.far=le,(U!==V.near||O!==V.far)&&(s.updateRenderState({depthNear:V.near,depthFar:V.far}),U=V.near,O=V.far),V.layers.mask=q.layers.mask|6,P.layers.mask=V.layers.mask&-5,N.layers.mask=V.layers.mask&-3;const Ne=q.parent,Me=V.cameras;Ae(V,Ne);for(let Ue=0;Ue<Me.length;Ue++)Ae(Me[Ue],Ne);Me.length===2?ee(V,P,N):V.projectionMatrix.copy(P.projectionMatrix),b===null&&q.isPerspectiveCamera&&(b={camera:q,fov:q.fov,zoom:q.zoom}),ye(q,V,Ne)};function ye(q,Q,le){le===null?q.matrix.copy(Q.matrixWorld):(q.matrix.copy(le.matrixWorld),q.matrix.invert(),q.matrix.multiply(Q.matrixWorld)),q.matrix.decompose(q.position,q.quaternion,q.scale),q.updateMatrixWorld(!0),q.projectionMatrix.copy(Q.projectionMatrix),q.projectionMatrixInverse.copy(Q.projectionMatrixInverse),q.isPerspectiveCamera&&(q.fov=aa*2*Math.atan(1/q.projectionMatrix.elements[5]),q.zoom=1)}this.getCamera=function(){return V},this.getFoveation=function(){if(!(u===null&&f===null))return l},this.setFoveation=function(q){l=q,u!==null&&(u.fixedFoveation=q),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=q)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(V)},this.getCameraTexture=function(q){return p[q]};let je=null;function We(q,Q){if(h=Q.getViewerPose(c||o),g=Q,h!==null){const le=h.views;f!==null&&(e.setRenderTargetFramebuffer(S,f.framebuffer),e.setRenderTarget(S));let Ne=!1;le.length!==V.cameras.length&&(V.cameras.length=0,Ne=!0);for(let te=0;te<le.length;te++){const se=le[te];let re=null;if(f!==null)re=f.getViewport(se);else{const he=d.getViewSubImage(u,se);re=he.viewport,te===0&&(e.setRenderTargetTextures(S,he.colorTexture,he.depthStencilTexture),e.setRenderTarget(S))}let oe=z[te];oe===void 0&&(oe=new Jt,oe.layers.enable(te),oe.viewport=new ft,z[te]=oe),oe.matrix.fromArray(se.transform.matrix),oe.matrix.decompose(oe.position,oe.quaternion,oe.scale),oe.projectionMatrix.fromArray(se.projectionMatrix),oe.projectionMatrixInverse.copy(oe.projectionMatrix).invert(),oe.viewport.set(re.x,re.y,re.width,re.height),te===0&&(V.matrix.copy(oe.matrix),V.matrix.decompose(V.position,V.quaternion,V.scale)),Ne===!0&&V.cameras.push(oe)}const Me=s.enabledFeatures;if(Me&&Me.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&M){d=n.getBinding();const te=d.getDepthInformation(le[0]);te&&te.isValid&&te.texture&&m.init(te,s.renderState)}if(Me&&Me.includes("camera-access")&&M){e.state.unbindTexture(),d=n.getBinding();for(let te=0;te<le.length;te++){const se=le[te].camera;if(se){let re=p[se];re||(re=new ih,p[se]=re);const oe=d.getCameraImage(se);re.sourceTexture=oe}}}}for(let le=0;le<E.length;le++){const Ne=T[le],Me=E[le];Ne!==null&&Me!==void 0&&Me.update(Ne,Q,c||o)}je&&je(q,Q),Q.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:Q}),g=null}const Ze=new mh;Ze.setAnimationLoop(We),this.setAnimationLoop=function(q){je=q},this.dispose=function(){}}}const k0=new tt,yh=new Ge;yh.set(-1,0,0,0,1,0,0,0,1);function z0(i,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,dh(i)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function s(m,p,w,A,S){p.isNodeMaterial?p.uniformsNeedUpdate=!1:p.isMeshBasicMaterial?r(m,p):p.isMeshLambertMaterial?(r(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshToonMaterial?(r(m,p),d(m,p)):p.isMeshPhongMaterial?(r(m,p),h(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshStandardMaterial?(r(m,p),u(m,p),p.isMeshPhysicalMaterial&&f(m,p,S)):p.isMeshMatcapMaterial?(r(m,p),g(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),M(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(o(m,p),p.isLineDashedMaterial&&a(m,p)):p.isPointsMaterial?l(m,p,w,A):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===Ut&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===Ut&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);const w=e.get(p),A=w.envMap,S=w.envMapRotation;A&&(m.envMap.value=A,m.envMapRotation.value.setFromMatrix4(k0.makeRotationFromEuler(S)).transpose(),A.isCubeTexture&&A.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(yh),m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function o(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function a(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,w,A){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*w,m.scale.value=A*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function h(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function d(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function u(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function f(m,p,w){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Ut&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.retroreflectivity>0&&(m.retroreflectivity.value=p.retroreflectivity),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=w.texture,m.transmissionSamplerSize.value.set(w.width,w.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function M(m,p){const w=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(w.matrixWorld),m.nearDistance.value=w.shadow.camera.near,m.farDistance.value=w.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function G0(i,e,t,n){let s={},r={},o=[];const a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(S,E){const T=E.program;n.uniformBlockBinding(S,T)}function c(S,E){let T=s[S.id];T===void 0&&(m(S),T=h(S),s[S.id]=T,S.addEventListener("dispose",w));const R=E.program;n.updateUBOMapping(S,R);const x=e.render.frame;r[S.id]!==x&&(u(S),r[S.id]=x)}function h(S){const E=d();S.__bindingPointIndex=E;const T=i.createBuffer(),R=S.__size,x=S.usage;return i.bindBuffer(i.UNIFORM_BUFFER,T),i.bufferData(i.UNIFORM_BUFFER,R,x),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,E,T),T}function d(){for(let S=0;S<a;S++)if(o.indexOf(S)===-1)return o.push(S),S;return Qe("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(S){const E=s[S.id],T=S.uniforms,R=S.__cache;i.bindBuffer(i.UNIFORM_BUFFER,E);for(let x=0,b=T.length;x<b;x++){const P=T[x];if(Array.isArray(P))for(let N=0,z=P.length;N<z;N++)f(P[N],x,N,R);else f(P,x,0,R)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function f(S,E,T,R){if(M(S,E,T,R)===!0){const x=S.__offset,b=S.value;if(Array.isArray(b)){let P=0;for(let N=0;N<b.length;N++){const z=b[N],V=p(z);g(z,S.__data,P),typeof z!="number"&&typeof z!="boolean"&&!z.isMatrix3&&!ArrayBuffer.isView(z)&&(P+=V.storage/Float32Array.BYTES_PER_ELEMENT)}}else g(b,S.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,x,S.__data)}}function g(S,E,T){typeof S=="number"||typeof S=="boolean"?E[0]=S:S.isMatrix3?(E[0]=S.elements[0],E[1]=S.elements[1],E[2]=S.elements[2],E[3]=0,E[4]=S.elements[3],E[5]=S.elements[4],E[6]=S.elements[5],E[7]=0,E[8]=S.elements[6],E[9]=S.elements[7],E[10]=S.elements[8],E[11]=0):ArrayBuffer.isView(S)?E.set(new S.constructor(S.buffer,S.byteOffset,E.length)):S.toArray(E,T)}function M(S,E,T,R){const x=S.value,b=E+"_"+T;if(R[b]===void 0)return typeof x=="number"||typeof x=="boolean"?R[b]=x:ArrayBuffer.isView(x)?R[b]=x.slice():R[b]=x.clone(),!0;{const P=R[b];if(typeof x=="number"||typeof x=="boolean"){if(P!==x)return R[b]=x,!0}else{if(ArrayBuffer.isView(x))return!0;if(P.equals(x)===!1)return P.copy(x),!0}}return!1}function m(S){const E=S.uniforms;let T=0;const R=16;for(let b=0,P=E.length;b<P;b++){const N=Array.isArray(E[b])?E[b]:[E[b]];for(let z=0,V=N.length;z<V;z++){const U=N[z],O=Array.isArray(U.value)?U.value:[U.value];for(let J=0,H=O.length;J<H;J++){const ie=O[J],X=p(ie),$=T%R,ee=$%X.boundary,Ae=$+ee;T+=ee,Ae!==0&&R-Ae<X.storage&&(T+=R-Ae),U.__data=new Float32Array(X.storage/Float32Array.BYTES_PER_ELEMENT),U.__offset=T,T+=X.storage}}}const x=T%R;return x>0&&(T+=R-x),S.__size=T,S.__cache={},this}function p(S){const E={boundary:0,storage:0};return typeof S=="number"||typeof S=="boolean"?(E.boundary=4,E.storage=4):S.isVector2?(E.boundary=8,E.storage=8):S.isVector3||S.isColor?(E.boundary=16,E.storage=12):S.isVector4?(E.boundary=16,E.storage=16):S.isMatrix3?(E.boundary=48,E.storage=48):S.isMatrix4?(E.boundary=64,E.storage=64):S.isTexture?Be("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(S)?(E.boundary=16,E.storage=S.byteLength):Be("WebGLRenderer: Unsupported uniform value type.",S),E}function w(S){const E=S.target;E.removeEventListener("dispose",w);const T=o.indexOf(E.__bindingPointIndex);o.splice(T,1),i.deleteBuffer(s[E.id]),delete s[E.id],delete r[E.id]}function A(){for(const S in s)i.deleteBuffer(s[S]);o=[],s={},r={}}return{bind:l,update:c,dispose:A}}const H0=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let sn=null;function V0(){return sn===null&&(sn=new La(H0,16,16,Qn,un),sn.name="DFG_LUT",sn.minFilter=Et,sn.magFilter=Et,sn.wrapS=yn,sn.wrapT=yn,sn.generateMipmaps=!1,sn.needsUpdate=!0),sn}class W0{constructor(e={}){const{canvas:t=Eu(),context:n=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:u=!1,outputBufferType:f=kt}=e;this.isWebGLRenderer=!0;let g;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=n.getContextAttributes().alpha}else g=o;const M=f,m=new Set([Ta,wa,Ea]),p=new Set([kt,hn,as,ls,Ma,Sa]),w=new Uint32Array(4),A=new Int32Array(4),S=new D;let E=null,T=null;const R=[],x=[];let b=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=cn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const P=this;let N=!1,z=null,V=null,U=null,O=null;this._outputColorSpace=Bt;let J=0,H=0,ie=null,X=-1,$=null;const ee=new ft,Ae=new ft;let ye=null;const je=new Ve(0);let We=0,Ze=t.width,q=t.height,Q=1,le=null,Ne=null;const Me=new ft(0,0,Ze,q),Ue=new ft(0,0,Ze,q);let rt=!1;const te=new Ia;let se=!1,re=!1;const oe=new tt,he=new D,Fe=new ft,De={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let ke=!1;function ze(){return ie===null?Q:1}let C=n;function nt(v,L){return t.getContext(v,L)}let qe,y,_,F,G,Y,ae,ce,K,j,ue,Pe,ge,de,Le,Oe,He,I,fe,Z,pe,Se,ne;try{const v={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:d};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${_a}`),t.addEventListener("webglcontextlost",ct,!1),t.addEventListener("webglcontextrestored",it,!1),t.addEventListener("webglcontextcreationerror",Xt,!1),C===null){const L="webgl2";if(C=nt(L,v),C===null)throw nt(L)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Ie()}catch(v){throw t.removeEventListener("webglcontextlost",ct,!1),t.removeEventListener("webglcontextrestored",it,!1),t.removeEventListener("webglcontextcreationerror",Xt,!1),Qe("WebGLRenderer: "+v.message),v}function Ie(){qe=new Vm(C),qe.init(),pe=new N0(C,qe),y=new Dm(C,qe,e,pe),_=new I0(C,qe),y.reversedDepthBuffer&&u&&_.buffers.depth.setReversed(!0),V=C.createFramebuffer(),U=C.createFramebuffer(),O=C.createFramebuffer(),F=new Ym(C),G=new x0,Y=new D0(C,qe,_,G,y,pe,F),ae=new Hm(P),ce=new qd(C),Se=new Lm(C,ce),K=new Wm(C,ce,F,Se),j=new Km(C,K,ce,Se,F),I=new qm(C,y,Y),Le=new Nm(G),ue=new _0(P,ae,qe,y,Se,Le),Pe=new z0(P,G),ge=new M0,de=new b0(qe),He=new Pm(P,ae,_,j,g,l),Oe=new L0(P,j,y),ne=new G0(C,F,y,_),fe=new Im(C,qe,F),Z=new Xm(C,qe,F),F.programs=ue.programs,P.capabilities=y,P.extensions=qe,P.properties=G,P.renderLists=ge,P.shadowMap=Oe,P.state=_,P.info=F}M!==kt&&(b=new Zm(M,t.width,t.height,a,s,r));const Re=new B0(P,C);this.xr=Re,this.getContext=function(){return C},this.getContextAttributes=function(){return C.getContextAttributes()},this.forceContextLoss=function(){const v=qe.get("WEBGL_lose_context");v&&v.loseContext()},this.forceContextRestore=function(){const v=qe.get("WEBGL_lose_context");v&&v.restoreContext()},this.getPixelRatio=function(){return Q},this.setPixelRatio=function(v){v!==void 0&&(Q=v,this.setSize(Ze,q,!1))},this.getSize=function(v){return v.set(Ze,q)},this.setSize=function(v,L,W=!0){if(Re.isPresenting){Be("WebGLRenderer: Can't change size while VR device is presenting.");return}Ze=v,q=L,t.width=Math.floor(v*Q),t.height=Math.floor(L*Q),W===!0&&(t.style.width=v+"px",t.style.height=L+"px"),b!==null&&b.setSize(t.width,t.height),this.setViewport(0,0,v,L)},this.getDrawingBufferSize=function(v){return v.set(Ze*Q,q*Q).floor()},this.setDrawingBufferSize=function(v,L,W){Ze=v,q=L,Q=W,t.width=Math.floor(v*W),t.height=Math.floor(L*W),this.setViewport(0,0,v,L)},this.setEffects=function(v){if(M===kt){Qe("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(v){for(let L=0;L<v.length;L++)if(v[L].isOutputPass===!0){Be("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}b.setEffects(v||[])},this.getCurrentViewport=function(v){return v.copy(ee)},this.getViewport=function(v){return v.copy(Me)},this.setViewport=function(v,L,W,B){v.isVector4?Me.set(v.x,v.y,v.z,v.w):Me.set(v,L,W,B),_.viewport(ee.copy(Me).multiplyScalar(Q).round())},this.getScissor=function(v){return v.copy(Ue)},this.setScissor=function(v,L,W,B){v.isVector4?Ue.set(v.x,v.y,v.z,v.w):Ue.set(v,L,W,B),_.scissor(Ae.copy(Ue).multiplyScalar(Q).round())},this.getScissorTest=function(){return rt},this.setScissorTest=function(v){_.setScissorTest(rt=v)},this.setOpaqueSort=function(v){le=v},this.setTransparentSort=function(v){Ne=v},this.getClearColor=function(v){return v.copy(He.getClearColor())},this.setClearColor=function(){He.setClearColor(...arguments)},this.getClearAlpha=function(){return He.getClearAlpha()},this.setClearAlpha=function(){He.setClearAlpha(...arguments)},this.clear=function(v=!0,L=!0,W=!0){let B=0;if(v){let k=!1;if(ie!==null){const ve=ie.texture.format;k=m.has(ve)}if(k){const ve=ie.texture.type,we=p.has(ve),xe=He.getClearColor(),Te=He.getClearAlpha(),Ce=xe.r,Xe=xe.g,Ke=xe.b;we?(w[0]=Ce,w[1]=Xe,w[2]=Ke,w[3]=Te,C.clearBufferuiv(C.COLOR,0,w)):(A[0]=Ce,A[1]=Xe,A[2]=Ke,A[3]=Te,C.clearBufferiv(C.COLOR,0,A))}else B|=C.COLOR_BUFFER_BIT}L&&(B|=C.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),W&&(B|=C.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),B!==0&&C.clear(B)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(v){v.setRenderer(this),z=v},this.dispose=function(){t.removeEventListener("webglcontextlost",ct,!1),t.removeEventListener("webglcontextrestored",it,!1),t.removeEventListener("webglcontextcreationerror",Xt,!1),He.dispose(),ge.dispose(),de.dispose(),G.dispose(),ae.dispose(),j.dispose(),Se.dispose(),ne.dispose(),ue.dispose(),Re.dispose(),Re.removeEventListener("sessionstart",Ja),Re.removeEventListener("sessionend",Za),Gn.stop()};function ct(v){v.preventDefault(),hl("WebGLRenderer: Context Lost."),N=!0}function it(){hl("WebGLRenderer: Context Restored."),N=!1;const v=F.autoReset,L=Oe.enabled,W=Oe.autoUpdate,B=Oe.needsUpdate,k=Oe.type;Ie(),F.autoReset=v,Oe.enabled=L,Oe.autoUpdate=W,Oe.needsUpdate=B,Oe.type=k}function Xt(v){Qe("WebGLRenderer: A WebGL context could not be created. Reason: ",v.statusMessage)}function en(v){const L=v.target;L.removeEventListener("dispose",en),Uh(L)}function Uh(v){Fh(v),G.remove(v)}function Fh(v){const L=G.get(v).programs;L!==void 0&&(L.forEach(function(W){ue.releaseProgram(W)}),v.isShaderMaterial&&ue.releaseShaderCache(v))}this.renderBufferDirect=function(v,L,W,B,k,ve){L===null&&(L=De);const we=k.isMesh&&k.matrixWorld.determinantAffine()<0,xe=kh(v,L,W,B,k);_.setMaterial(B,we);let Te=W.index,Ce=1;if(B.wireframe===!0){if(Te=K.getWireframeAttribute(W),Te===void 0)return;Ce=2}const Xe=W.drawRange,Ke=W.attributes.position;let be=Xe.start*Ce,st=(Xe.start+Xe.count)*Ce;ve!==null&&(be=Math.max(be,ve.start*Ce),st=Math.min(st,(ve.start+ve.count)*Ce)),Te!==null?(be=Math.max(be,0),st=Math.min(st,Te.count)):Ke!=null&&(be=Math.max(be,0),st=Math.min(st,Ke.count));const _t=st-be;if(_t<0||_t===1/0)return;Se.setup(k,B,xe,W,Te);let ut,lt=fe;if(Te!==null&&(ut=ce.get(Te),lt=Z,lt.setIndex(ut)),k.isMesh)B.wireframe===!0?(_.setLineWidth(B.wireframeLinewidth*ze()),lt.setMode(C.LINES)):lt.setMode(C.TRIANGLES);else if(k.isLine){let bt=B.linewidth;bt===void 0&&(bt=1),_.setLineWidth(bt*ze()),k.isLineSegments?lt.setMode(C.LINES):k.isLineLoop?lt.setMode(C.LINE_LOOP):lt.setMode(C.LINE_STRIP)}else k.isPoints?lt.setMode(C.POINTS):k.isSprite&&lt.setMode(C.TRIANGLES);if(k.isBatchedMesh)if(qe.get("WEBGL_multi_draw"))lt.renderMultiDraw(k._multiDrawStarts,k._multiDrawCounts,k._multiDrawCount);else{const bt=k._multiDrawStarts,Ee=k._multiDrawCounts,Pt=k._multiDrawCount,et=Te?ce.get(Te).bytesPerElement:1,zt=G.get(B).currentProgram.getUniforms();for(let tn=0;tn<Pt;tn++)zt.setValue(C,"_gl_DrawID",tn),lt.render(bt[tn]/et,Ee[tn])}else if(k.isInstancedMesh)lt.renderInstances(be,_t,k.count);else if(W.isInstancedBufferGeometry){const bt=W._maxInstanceCount!==void 0?W._maxInstanceCount:1/0,Ee=Math.min(W.instanceCount,bt);lt.renderInstances(be,_t,Ee)}else lt.render(be,_t)};function Ka(v,L,W,B){z!==null&&v.isNodeMaterial&&z.setObject(B,v),se===!0&&Le.setState(v,W,!1),v.transparent===!0&&v.side===Sn&&v.forceSinglePass===!1?(v.side=Ut,v.needsUpdate=!0,_s(v,L,B),v.side=Zn,v.needsUpdate=!0,_s(v,L,B),v.side=Sn):_s(v,L,B)}this.compile=function(v,L,W=null){W===null&&(W=v),z!==null&&z.renderStart(v,L,W),T=de.get(W),T.init(L),x.push(T),W.traverseVisible(function(k){k.isLight&&k.layers.test(L.layers)&&(T.pushLight(k),k.castShadow&&T.pushShadow(k))}),v!==W&&v.traverseVisible(function(k){k.isLight&&k.layers.test(L.layers)&&(T.pushLight(k),k.castShadow&&T.pushShadow(k))}),T.setupLights(),z!==null&&z.updateLights(T.state.lightsArray),re=this.localClippingEnabled,se=Le.init(this.clippingPlanes,re),se===!0&&Le.setGlobalState(this.clippingPlanes,L),z!==null&&Oe.render(T.state.shadowsArray,W,L);const B=new Set;return v.traverse(function(k){if(!(k.isMesh||k.isPoints||k.isLine||k.isSprite))return;const ve=k.material;if(ve)if(Array.isArray(ve))for(let we=0;we<ve.length;we++){const xe=ve[we];Ka(xe,W,L,k),B.add(xe)}else Ka(ve,W,L,k),B.add(ve)}),T=x.pop(),z!==null&&z.renderEnd(),B},this.compileAsync=function(v,L,W=null){const B=this.compile(v,L,W);return new Promise(k=>{function ve(){if(B.forEach(function(we){const Te=G.get(we).currentProgram;(Te===void 0||Te.isReady())&&B.delete(we)}),B.size===0){k(v);return}setTimeout(ve,10)}qe.get("KHR_parallel_shader_compile")!==null?ve():setTimeout(ve,10)})};let Ar=null;function Oh(v){Ar&&Ar(v)}function Ja(){Gn.stop()}function Za(){Gn.start()}const Gn=new mh;Gn.setAnimationLoop(Oh),typeof self<"u"&&Gn.setContext(self),this.setAnimationLoop=function(v){Ar=v,Re.setAnimationLoop(v),v===null?Gn.stop():Gn.start()},Re.addEventListener("sessionstart",Ja),Re.addEventListener("sessionend",Za),this.render=function(v,L){if(L!==void 0&&L.isCamera!==!0){Qe("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(N===!0)return;z!==null&&z.renderStart(v,L);const W=Re.enabled===!0&&Re.isPresenting===!0,B=b!==null&&(ie===null||W)&&b.begin(P,ie);if(v.matrixWorldAutoUpdate===!0&&v.updateMatrixWorld(),L.parent===null&&L.matrixWorldAutoUpdate===!0&&L.updateMatrixWorld(),Re.enabled===!0&&Re.isPresenting===!0&&(b===null||b.isCompositing()===!1)&&(Re.cameraAutoUpdate===!0&&Re.updateCamera(L),L=Re.getCamera()),v.isScene===!0&&v.onBeforeRender(P,v,L,ie),T=de.get(v,x.length),T.init(L),T.state.textureUnits=Y.getTextureUnits(),x.push(T),oe.multiplyMatrices(L.projectionMatrix,L.matrixWorldInverse),te.setFromProjectionMatrix(oe,ln,L.reversedDepth),re=this.localClippingEnabled,se=Le.init(this.clippingPlanes,re),E=ge.get(v,R.length),E.init(),R.push(E),Re.enabled===!0&&Re.isPresenting===!0){const we=P.xr.getDepthSensingMesh();we!==null&&Rr(we,L,-1/0,P.sortObjects)}Rr(v,L,0,P.sortObjects),E.finish(),z!==null&&z.updateLights(T.state.lightsArray),P.sortObjects===!0&&E.sort(le,Ne),ke=Re.enabled===!1||Re.isPresenting===!1||Re.hasDepthSensing()===!1,ke&&He.addToRenderList(E,v),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),se===!0&&Le.beginShadows();const k=T.state.shadowsArray;if(Oe.render(k,v,L),se===!0&&Le.endShadows(),(B&&b.hasRenderPass())===!1){const we=E.opaque,xe=E.transmissive;if(T.setupLights(),L.isArrayCamera){const Te=L.cameras;if(xe.length>0)for(let Ce=0,Xe=Te.length;Ce<Xe;Ce++){const Ke=Te[Ce];Qa(we,xe,v,Ke)}ke&&He.render(v);for(let Ce=0,Xe=Te.length;Ce<Xe;Ce++){const Ke=Te[Ce];$a(E,v,Ke,Ke.viewport)}}else xe.length>0&&Qa(we,xe,v,L),ke&&He.render(v),$a(E,v,L)}ie!==null&&H===0&&(Y.updateMultisampleRenderTarget(ie),Y.updateRenderTargetMipmap(ie)),B&&b.end(P),v.isScene===!0&&v.onAfterRender(P,v,L),Se.resetDefaultState(),X=-1,$=null,x.pop(),x.length>0?(T=x[x.length-1],Y.setTextureUnits(T.state.textureUnits),se===!0&&Le.setGlobalState(P.clippingPlanes,T.state.camera)):T=null,R.pop(),R.length>0?E=R[R.length-1]:E=null,z!==null&&z.renderEnd()};function Rr(v,L,W,B){if(v.visible===!1)return;if(v.layers.test(L.layers)){if(v.isGroup)W=v.renderOrder;else if(v.isLOD)v.autoUpdate===!0&&v.update(L);else if(v.isLightProbeGrid)T.pushLightProbeGrid(v);else if(v.isLight)T.pushLight(v),v.castShadow&&T.pushShadow(v);else if(v.isSprite){if(!v.frustumCulled||v.intersectsFrustum(te)){B&&Fe.setFromMatrixPosition(v.matrixWorld).applyMatrix4(oe);const we=j.update(v),xe=v.material;xe.visible&&E.push(v,we,xe,W,Fe.z,null,L)}}else if((v.isMesh||v.isLine||v.isPoints)&&(!v.frustumCulled||v.intersectsFrustum(te))){const we=j.update(v),xe=v.material;if(B&&(v.boundingSphere!==void 0?(v.boundingSphere===null&&v.computeBoundingSphere(),Fe.copy(v.boundingSphere.center)):(we.boundingSphere===null&&we.computeBoundingSphere(),Fe.copy(we.boundingSphere.center)),Fe.applyMatrix4(v.matrixWorld).applyMatrix4(oe)),Array.isArray(xe)){const Te=we.groups;for(let Ce=0,Xe=Te.length;Ce<Xe;Ce++){const Ke=Te[Ce],be=xe[Ke.materialIndex];be&&be.visible&&E.push(v,we,be,W,Fe.z,Ke,L)}}else xe.visible&&E.push(v,we,xe,W,Fe.z,null,L)}}const ve=v.children;for(let we=0,xe=ve.length;we<xe;we++)Rr(ve[we],L,W,B)}function $a(v,L,W,B){const{opaque:k,transmissive:ve,transparent:we}=v;T.setupLightsView(W),se===!0&&Le.setGlobalState(P.clippingPlanes,W),B&&_.viewport(ee.copy(B)),k.length>0&&gs(k,L,W),ve.length>0&&gs(ve,L,W),we.length>0&&gs(we,L,W),_.buffers.depth.setTest(!0),_.buffers.depth.setMask(!0),_.buffers.color.setMask(!0),_.setPolygonOffset(!1)}function Qa(v,L,W,B){if((W.isScene===!0?W.overrideMaterial:null)!==null)return;if(T.state.transmissionRenderTarget[B.id]===void 0){const be=qe.has("EXT_color_buffer_half_float")||qe.has("EXT_color_buffer_float");T.state.transmissionRenderTarget[B.id]=new jt(1,1,{generateMipmaps:!0,type:be?un:kt,minFilter:qn,samples:Math.max(4,y.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:$e.workingColorSpace})}const ve=T.state.transmissionRenderTarget[B.id],we=B.viewport||ee;ve.setSize(we.z*P.transmissionResolutionScale,we.w*P.transmissionResolutionScale);const xe=P.getRenderTarget(),Te=P.getActiveCubeFace(),Ce=P.getActiveMipmapLevel();P.setRenderTarget(ve),P.getClearColor(je),We=P.getClearAlpha(),We<1&&P.setClearColor(16777215,.5),P.clear(),ke&&He.render(W);const Xe=P.toneMapping;P.toneMapping=cn;const Ke=B.viewport;if(B.viewport!==void 0&&(B.viewport=void 0),T.setupLightsView(B),se===!0&&Le.setGlobalState(P.clippingPlanes,B),gs(v,W,B),Y.updateMultisampleRenderTarget(ve),Y.updateRenderTargetMipmap(ve),qe.has("WEBGL_multisampled_render_to_texture")===!1){let be=!1;for(let st=0,_t=L.length;st<_t;st++){const ut=L[st],{object:lt,geometry:bt,material:Ee,group:Pt}=ut;if(Ee.side===Sn&&lt.layers.test(B.layers)){const et=Ee.side;Ee.side=Ut,Ee.needsUpdate=!0,ja(lt,W,B,bt,Ee,Pt),Ee.side=et,Ee.needsUpdate=!0,be=!0}}be===!0&&(Y.updateMultisampleRenderTarget(ve),Y.updateRenderTargetMipmap(ve))}P.setRenderTarget(xe,Te,Ce),P.setClearColor(je,We),Ke!==void 0&&(B.viewport=Ke),P.toneMapping=Xe}function gs(v,L,W){const B=L.isScene===!0?L.overrideMaterial:null;for(let k=0,ve=v.length;k<ve;k++){const we=v[k],{object:xe,geometry:Te,group:Ce}=we;let Xe=we.material;Xe.allowOverride===!0&&B!==null&&(Xe=B),xe.layers.test(W.layers)&&ja(xe,L,W,Te,Xe,Ce)}}function ja(v,L,W,B,k,ve){z!==null&&k.isNodeMaterial&&z.setObject(v,k),v.onBeforeRender(P,L,W,B,k,ve),v.modelViewMatrix.multiplyMatrices(W.matrixWorldInverse,v.matrixWorld),v.normalMatrix.getNormalMatrix(v.modelViewMatrix),k.onBeforeRender(P,L,W,B,v,ve),k.transparent===!0&&k.side===Sn&&k.forceSinglePass===!1?(k.side=Ut,k.needsUpdate=!0,P.renderBufferDirect(W,L,B,k,v,ve),k.side=Zn,k.needsUpdate=!0,P.renderBufferDirect(W,L,B,k,v,ve),k.side=Sn):P.renderBufferDirect(W,L,B,k,v,ve),v.onAfterRender(P,L,W,B,k,ve)}function _s(v,L,W){L.isScene!==!0&&(L=De);const B=G.get(v),k=T.state.lights,ve=T.state.shadowsArray,we=k.state.version,xe=ue.getParameters(v,k.state,ve,L,W,T.state.lightProbeGridArray),Te=ue.getProgramCacheKey(xe);let Ce=B.programs;B.environment=v.isMeshStandardMaterial||v.isMeshLambertMaterial||v.isMeshPhongMaterial?L.environment:null,B.fog=L.fog;const Xe=v.isMeshStandardMaterial||v.isMeshLambertMaterial&&!v.envMap||v.isMeshPhongMaterial&&!v.envMap;B.envMap=ae.get(v.envMap||B.environment,Xe),B.envMapRotation=B.environment!==null&&v.envMap===null?L.environmentRotation:v.envMapRotation,Ce===void 0&&(v.addEventListener("dispose",en),Ce=new Map,B.programs=Ce);let Ke=Ce.get(Te);if(Ke!==void 0){if(B.currentProgram===Ke&&B.lightsStateVersion===we)return tl(v,xe),Ke}else xe.uniforms=ue.getUniforms(v),z!==null&&v.isNodeMaterial&&z.build(v,W,xe),v.onBeforeCompile(xe,P),Ke=ue.acquireProgram(xe,Te),Ce.set(Te,Ke),B.uniforms=xe.uniforms;const be=B.uniforms;return(!v.isShaderMaterial&&!v.isRawShaderMaterial||v.clipping===!0)&&(be.clippingPlanes=Le.uniform),tl(v,xe),B.needsLights=Gh(v),B.lightsStateVersion=we,B.needsLights&&(be.ambientLightColor.value=k.state.ambient,be.lightProbe.value=k.state.probe,be.sunLights.value=k.state.sun,be.sunLightShadows.value=k.state.sunShadow,be.directionalLights.value=k.state.directional,be.directionalLightShadows.value=k.state.directionalShadow,be.spotLights.value=k.state.spot,be.spotLightShadows.value=k.state.spotShadow,be.rectAreaLights.value=k.state.rectArea,be.ltc_1.value=k.state.rectAreaLTC1,be.ltc_2.value=k.state.rectAreaLTC2,be.pointLights.value=k.state.point,be.pointLightShadows.value=k.state.pointShadow,be.hemisphereLights.value=k.state.hemi,be.sunShadowMatrix.value=k.state.sunShadowMatrix,be.sunShadowCascade.value=k.state.sunShadowCascade,be.directionalShadowMatrix.value=k.state.directionalShadowMatrix,be.spotLightMatrix.value=k.state.spotLightMatrix,be.spotLightMap.value=k.state.spotLightMap,be.pointShadowMatrix.value=k.state.pointShadowMatrix),B.lightProbeGrid=T.state.lightProbeGridArray.length>0,B.currentProgram=Ke,B.uniformsList=null,Ke}function el(v){if(v.uniformsList===null){const L=v.currentProgram.getUniforms();v.uniformsList=ar.seqWithValue(L.seq,v.uniforms)}return v.uniformsList}function tl(v,L){const W=G.get(v);W.outputColorSpace=L.outputColorSpace,W.batching=L.batching,W.batchingColor=L.batchingColor,W.instancing=L.instancing,W.instancingColor=L.instancingColor,W.instancingMorph=L.instancingMorph,W.skinning=L.skinning,W.morphTargets=L.morphTargets,W.morphNormals=L.morphNormals,W.morphColors=L.morphColors,W.morphTargetsCount=L.morphTargetsCount,W.numClippingPlanes=L.numClippingPlanes,W.numIntersection=L.numClipIntersection,W.vertexAlphas=L.vertexAlphas,W.vertexTangents=L.vertexTangents,W.toneMapping=L.toneMapping}function Bh(v,L){if(v.length===0)return null;if(v.length===1)return v[0].texture!==null?v[0]:null;S.setFromMatrixPosition(L.matrixWorld);for(let W=0,B=v.length;W<B;W++){const k=v[W];if(k.texture!==null&&k.boundingBox.containsPoint(S))return k}return null}function kh(v,L,W,B,k){L.isScene!==!0&&(L=De),Y.resetTextureUnits();const ve=L.fog,we=B.isMeshStandardMaterial||B.isMeshLambertMaterial||B.isMeshPhongMaterial?L.environment:null,xe=ie===null?P.outputColorSpace:ie.isXRRenderTarget===!0?ie.texture.colorSpace:$e.workingColorSpace,Te=B.isMeshStandardMaterial||B.isMeshLambertMaterial&&!B.envMap||B.isMeshPhongMaterial&&!B.envMap,Ce=ae.get(B.envMap||we,Te),Xe=B.vertexColors===!0&&!!W.attributes.color&&W.attributes.color.itemSize===4,Ke=!!W.attributes.tangent&&(!!B.normalMap||B.anisotropy>0),be=!!W.morphAttributes.position,st=!!W.morphAttributes.normal,_t=!!W.morphAttributes.color;let ut=cn;B.toneMapped&&(ie===null||ie.isXRRenderTarget===!0)&&(ut=P.toneMapping);const lt=W.morphAttributes.position||W.morphAttributes.normal||W.morphAttributes.color,bt=lt!==void 0?lt.length:0,Ee=G.get(B),Pt=T.state.lights;if(se===!0&&(re===!0||v!==$)){const ht=v===$&&B.id===X;Le.setState(B,v,ht)}let et=!1;B.version===Ee.__version?(Ee.needsLights&&Ee.lightsStateVersion!==Pt.state.version||Ee.outputColorSpace!==xe||k.isBatchedMesh&&Ee.batching===!1||!k.isBatchedMesh&&Ee.batching===!0||k.isBatchedMesh&&Ee.batchingColor===!0&&k._colorsTexture===null||k.isBatchedMesh&&Ee.batchingColor===!1&&k._colorsTexture!==null||k.isInstancedMesh&&Ee.instancing===!1||!k.isInstancedMesh&&Ee.instancing===!0||k.isSkinnedMesh&&Ee.skinning===!1||!k.isSkinnedMesh&&Ee.skinning===!0||k.isInstancedMesh&&Ee.instancingColor===!0&&k.instanceColor===null||k.isInstancedMesh&&Ee.instancingColor===!1&&k.instanceColor!==null||k.isInstancedMesh&&Ee.instancingMorph===!0&&k.morphTexture===null||k.isInstancedMesh&&Ee.instancingMorph===!1&&k.morphTexture!==null||Ee.envMap!==Ce||B.fog===!0&&Ee.fog!==ve||Ee.numClippingPlanes!==void 0&&(Ee.numClippingPlanes!==Le.numPlanes||Ee.numIntersection!==Le.numIntersection)||Ee.vertexAlphas!==Xe||Ee.vertexTangents!==Ke||Ee.morphTargets!==be||Ee.morphNormals!==st||Ee.morphColors!==_t||Ee.toneMapping!==ut||Ee.morphTargetsCount!==bt||!!Ee.lightProbeGrid!=T.state.lightProbeGridArray.length>0)&&(et=!0):(et=!0,Ee.__version=B.version);let zt=Ee.currentProgram;et===!0&&(zt=_s(B,L,k),z&&B.isNodeMaterial&&z.onUpdateProgram(B,zt,Ee));let tn=!1,bn=!1,si=!1;const at=zt.getUniforms(),mt=Ee.uniforms;if(_.useProgram(zt.program)&&(tn=!0,bn=!0,si=!0),B.id!==X&&(X=B.id,bn=!0),Ee.needsLights){const ht=Bh(T.state.lightProbeGridArray,k);Ee.lightProbeGrid!==ht&&(Ee.lightProbeGrid=ht,bn=!0)}if(tn||$!==v){_.buffers.depth.getReversed()&&v.reversedDepth!==!0&&(v._reversedDepth=!0,v.updateProjectionMatrix()),at.setValue(C,"projectionMatrix",v.projectionMatrix),at.setValue(C,"viewMatrix",v.matrixWorldInverse);const Rn=at.map.cameraPosition;Rn!==void 0&&Rn.setValue(C,he.setFromMatrixPosition(v.matrixWorld)),y.logarithmicDepthBuffer&&at.setValue(C,"logDepthBufFC",2/(Math.log(v.far+1)/Math.LN2)),(B.isMeshPhongMaterial||B.isMeshToonMaterial||B.isMeshLambertMaterial||B.isMeshBasicMaterial||B.isMeshStandardMaterial||B.isShaderMaterial)&&at.setValue(C,"isOrthographic",v.isOrthographicCamera===!0),$!==v&&($=v,bn=!0,si=!0)}if(Ee.needsLights&&(Pt.state.sunShadowMap.length>0&&at.setValue(C,"sunShadowMap",Pt.state.sunShadowMap,Y),Pt.state.directionalShadowMap.length>0&&at.setValue(C,"directionalShadowMap",Pt.state.directionalShadowMap,Y),Pt.state.spotShadowMap.length>0&&at.setValue(C,"spotShadowMap",Pt.state.spotShadowMap,Y),Pt.state.pointShadowMap.length>0&&at.setValue(C,"pointShadowMap",Pt.state.pointShadowMap,Y)),k.isSkinnedMesh){at.setOptional(C,k,"bindMatrix"),at.setOptional(C,k,"bindMatrixInverse");const ht=k.skeleton;ht&&(ht.boneTexture===null&&ht.computeBoneTexture(),at.setValue(C,"boneTexture",ht.boneTexture,Y))}k.isBatchedMesh&&(at.setOptional(C,k,"batchingTexture"),at.setValue(C,"batchingTexture",k._matricesTexture,Y),at.setOptional(C,k,"batchingIdTexture"),at.setValue(C,"batchingIdTexture",k._indirectTexture,Y),at.setOptional(C,k,"batchingColorTexture"),k._colorsTexture!==null&&at.setValue(C,"batchingColorTexture",k._colorsTexture,Y));const An=W.morphAttributes;if((An.position!==void 0||An.normal!==void 0||An.color!==void 0)&&I.update(k,W,zt),(bn||Ee.receiveShadow!==k.receiveShadow)&&(Ee.receiveShadow=k.receiveShadow,at.setValue(C,"receiveShadow",k.receiveShadow)),(B.isMeshStandardMaterial||B.isMeshLambertMaterial||B.isMeshPhongMaterial)&&B.envMap===null&&L.environment!==null&&(mt.envMapIntensity.value=L.environmentIntensity),mt.dfgLUT!==void 0&&(mt.dfgLUT.value=V0()),bn){if(at.setValue(C,"toneMappingExposure",P.toneMappingExposure),Ee.needsLights&&zh(mt,si),ve&&B.fog===!0&&Pe.refreshFogUniforms(mt,ve),Pe.refreshMaterialUniforms(mt,B,Q,q,T.state.transmissionRenderTarget[v.id]),Ee.needsLights&&Ee.lightProbeGrid){const ht=Ee.lightProbeGrid;mt.probesSH.value=ht.texture,mt.probesMin.value.copy(ht.boundingBox.min),mt.probesMax.value.copy(ht.boundingBox.max),mt.probesResolution.value.copy(ht.resolution)}ar.upload(C,el(Ee),mt,Y)}if(B.isShaderMaterial&&B.uniformsNeedUpdate===!0&&(ar.upload(C,el(Ee),mt,Y),B.uniformsNeedUpdate=!1),B.isSpriteMaterial&&at.setValue(C,"center",k.center),at.setValue(C,"modelViewMatrix",k.modelViewMatrix),at.setValue(C,"normalMatrix",k.normalMatrix),at.setValue(C,"modelMatrix",k.matrixWorld),B.uniformsGroups!==void 0){const ht=B.uniformsGroups;for(let Rn=0,ri=ht.length;Rn<ri;Rn++){const il=ht[Rn];ne.update(il,zt),ne.bind(il,zt)}}return zt}function zh(v,L){v.ambientLightColor.needsUpdate=L,v.lightProbe.needsUpdate=L,v.sunLights.needsUpdate=L,v.sunLightShadows.needsUpdate=L,v.directionalLights.needsUpdate=L,v.directionalLightShadows.needsUpdate=L,v.pointLights.needsUpdate=L,v.pointLightShadows.needsUpdate=L,v.spotLights.needsUpdate=L,v.spotLightShadows.needsUpdate=L,v.rectAreaLights.needsUpdate=L,v.hemisphereLights.needsUpdate=L}function Gh(v){return v.isMeshLambertMaterial||v.isMeshToonMaterial||v.isMeshPhongMaterial||v.isMeshStandardMaterial||v.isShadowMaterial||v.isShaderMaterial&&v.lights===!0}this.getActiveCubeFace=function(){return J},this.getActiveMipmapLevel=function(){return H},this.getRenderTarget=function(){return ie},this.setRenderTargetTextures=function(v,L,W){const B=G.get(v);B.__autoAllocateDepthBuffer=v.resolveDepthBuffer===!1,B.__autoAllocateDepthBuffer===!1&&(B.__useRenderToTexture=!1),G.get(v.texture).__webglTexture=L,G.get(v.depthTexture).__webglTexture=B.__autoAllocateDepthBuffer?void 0:W,B.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(v,L){const W=G.get(v);W.__webglFramebuffer=L,W.__useDefaultFramebuffer=L===void 0},this.setRenderTarget=function(v,L=0,W=0){ie=v,J=L,H=W;let B=null,k=!1,ve=!1;if(v){const xe=G.get(v);if(xe.__useDefaultFramebuffer!==void 0){_.bindFramebuffer(C.FRAMEBUFFER,xe.__webglFramebuffer),ee.copy(v.viewport),Ae.copy(v.scissor),ye=v.scissorTest,_.viewport(ee),_.scissor(Ae),_.setScissorTest(ye),X=-1;return}else if(xe.__webglFramebuffer===void 0)Y.setupRenderTarget(v);else if(xe.__hasExternalTextures)Y.rebindTextures(v,G.get(v.texture).__webglTexture,G.get(v.depthTexture).__webglTexture);else if(v.depthBuffer){const Xe=v.depthTexture;if(xe.__boundDepthTexture!==Xe){if(Xe!==null&&G.has(Xe)&&(v.width!==Xe.image.width||v.height!==Xe.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Y.setupDepthRenderbuffer(v)}}const Te=v.texture;(Te.isData3DTexture||Te.isDataArrayTexture||Te.isCompressedArrayTexture)&&(ve=!0);const Ce=G.get(v).__webglFramebuffer;v.isWebGLCubeRenderTarget?(Array.isArray(Ce[L])?B=Ce[L][W]:B=Ce[L],k=!0):v.samples>0&&Y.useMultisampledRTT(v)===!1?B=G.get(v).__webglMultisampledFramebuffer:Array.isArray(Ce)?B=Ce[W]:B=Ce,ee.copy(v.viewport),Ae.copy(v.scissor),ye=v.scissorTest}else ee.copy(Me).multiplyScalar(Q).floor(),Ae.copy(Ue).multiplyScalar(Q).floor(),ye=rt;if(W!==0&&(B=V),_.bindFramebuffer(C.FRAMEBUFFER,B)&&_.drawBuffers(v,B),_.viewport(ee),_.scissor(Ae),_.setScissorTest(ye),k){const xe=G.get(v.texture);C.framebufferTexture2D(C.FRAMEBUFFER,C.COLOR_ATTACHMENT0,C.TEXTURE_CUBE_MAP_POSITIVE_X+L,xe.__webglTexture,W)}else if(ve){const xe=L;for(let Te=0;Te<v.textures.length;Te++){const Ce=G.get(v.textures[Te]);C.framebufferTextureLayer(C.FRAMEBUFFER,C.COLOR_ATTACHMENT0+Te,Ce.__webglTexture,W,xe)}}else if(v!==null&&W!==0){const xe=G.get(v.texture);C.framebufferTexture2D(C.FRAMEBUFFER,C.COLOR_ATTACHMENT0,C.TEXTURE_2D,xe.__webglTexture,W)}X=-1};function nl(v){const L=G.get(v);return(L.__readFormat!==v.format||L.__readType!==v.type)&&(L.__readFormat=v.format,L.__readType=v.type,L.__formatReadable=y.textureFormatReadable(v.format),L.__typeReadable=y.textureTypeReadable(v.type)),L}this.readRenderTargetPixels=function(v,L,W,B,k,ve,we,xe=0){if(!(v&&v.isWebGLRenderTarget)){Qe("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Te=G.get(v).__webglFramebuffer;if(v.isWebGLCubeRenderTarget&&we!==void 0&&(Te=Te[we]),Te){_.bindFramebuffer(C.FRAMEBUFFER,Te);try{const Ce=v.textures[xe],Xe=Ce.format,Ke=Ce.type;v.textures.length>1&&C.readBuffer(C.COLOR_ATTACHMENT0+xe);const be=nl(Ce);if(be.__formatReadable===!1){Qe("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(be.__typeReadable===!1){Qe("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}L>=0&&L<=v.width-B&&W>=0&&W<=v.height-k&&C.readPixels(L,W,B,k,pe.convert(Xe),pe.convert(Ke),ve)}finally{const Ce=ie!==null?G.get(ie).__webglFramebuffer:null;_.bindFramebuffer(C.FRAMEBUFFER,Ce)}}},this.readRenderTargetPixelsAsync=async function(v,L,W,B,k,ve,we,xe=0){if(!(v&&v.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Te=G.get(v).__webglFramebuffer;if(v.isWebGLCubeRenderTarget&&we!==void 0&&(Te=Te[we]),Te)if(L>=0&&L<=v.width-B&&W>=0&&W<=v.height-k){_.bindFramebuffer(C.FRAMEBUFFER,Te);const Ce=v.textures[xe],Xe=Ce.format,Ke=Ce.type;v.textures.length>1&&C.readBuffer(C.COLOR_ATTACHMENT0+xe);const be=nl(Ce);if(be.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(be.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const st=C.createBuffer();C.bindBuffer(C.PIXEL_PACK_BUFFER,st),C.bufferData(C.PIXEL_PACK_BUFFER,ve.byteLength,C.STREAM_READ),C.readPixels(L,W,B,k,pe.convert(Xe),pe.convert(Ke),0),C.bindBuffer(C.PIXEL_PACK_BUFFER,null);const _t=ie!==null?G.get(ie).__webglFramebuffer:null;_.bindFramebuffer(C.FRAMEBUFFER,_t);const ut=C.fenceSync(C.SYNC_GPU_COMMANDS_COMPLETE,0);return C.flush(),await wu(C,ut,4),C.bindBuffer(C.PIXEL_PACK_BUFFER,st),C.getBufferSubData(C.PIXEL_PACK_BUFFER,0,ve),C.bindBuffer(C.PIXEL_PACK_BUFFER,null),C.deleteBuffer(st),C.deleteSync(ut),ve}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(v,L=null,W=0){const B=Math.pow(2,-W),k=Math.floor(v.image.width*B),ve=Math.floor(v.image.height*B),we=L!==null?L.x:0,xe=L!==null?L.y:0;Y.setTexture2D(v,0),C.copyTexSubImage2D(C.TEXTURE_2D,W,0,0,we,xe,k,ve),_.unbindTexture()},this.copyTextureToTexture=function(v,L,W=null,B=null,k=0,ve=0){let we,xe,Te,Ce,Xe,Ke,be,st,_t;const ut=v.isCompressedTexture?v.mipmaps[ve]:v.image;if(W!==null)we=W.max.x-W.min.x,xe=W.max.y-W.min.y,Te=W.isBox3?W.max.z-W.min.z:1,Ce=W.min.x,Xe=W.min.y,Ke=W.isBox3?W.min.z:0;else{const mt=Math.pow(2,-k);we=Math.floor(ut.width*mt),xe=Math.floor(ut.height*mt),v.isDataArrayTexture?Te=ut.depth:v.isData3DTexture?Te=Math.floor(ut.depth*mt):Te=1,Ce=0,Xe=0,Ke=0}B!==null?(be=B.x,st=B.y,_t=B.z):(be=0,st=0,_t=0);const lt=pe.convert(L.format),bt=pe.convert(L.type);let Ee;L.isData3DTexture?(Y.setTexture3D(L,0),Ee=C.TEXTURE_3D):L.isDataArrayTexture||L.isCompressedArrayTexture?(Y.setTexture2DArray(L,0),Ee=C.TEXTURE_2D_ARRAY):(Y.setTexture2D(L,0),Ee=C.TEXTURE_2D),_.activeTexture(C.TEXTURE0),_.pixelStorei(C.UNPACK_FLIP_Y_WEBGL,L.flipY),_.pixelStorei(C.UNPACK_PREMULTIPLY_ALPHA_WEBGL,L.premultiplyAlpha),_.pixelStorei(C.UNPACK_ALIGNMENT,L.unpackAlignment);const Pt=_.getParameter(C.UNPACK_ROW_LENGTH),et=_.getParameter(C.UNPACK_IMAGE_HEIGHT),zt=_.getParameter(C.UNPACK_SKIP_PIXELS),tn=_.getParameter(C.UNPACK_SKIP_ROWS),bn=_.getParameter(C.UNPACK_SKIP_IMAGES);_.pixelStorei(C.UNPACK_ROW_LENGTH,ut.width),_.pixelStorei(C.UNPACK_IMAGE_HEIGHT,ut.height),_.pixelStorei(C.UNPACK_SKIP_PIXELS,Ce),_.pixelStorei(C.UNPACK_SKIP_ROWS,Xe),_.pixelStorei(C.UNPACK_SKIP_IMAGES,Ke);const si=v.isDataArrayTexture||v.isData3DTexture,at=L.isDataArrayTexture||L.isData3DTexture;if(v.isDepthTexture){const mt=G.get(v),An=G.get(L),ht=G.get(mt.__renderTarget),Rn=G.get(An.__renderTarget);_.bindFramebuffer(C.READ_FRAMEBUFFER,ht.__webglFramebuffer),_.bindFramebuffer(C.DRAW_FRAMEBUFFER,Rn.__webglFramebuffer);for(let ri=0;ri<Te;ri++)si&&(C.framebufferTextureLayer(C.READ_FRAMEBUFFER,C.COLOR_ATTACHMENT0,G.get(v).__webglTexture,k,Ke+ri),C.framebufferTextureLayer(C.DRAW_FRAMEBUFFER,C.COLOR_ATTACHMENT0,G.get(L).__webglTexture,ve,_t+ri)),C.blitFramebuffer(Ce,Xe,we,xe,be,st,we,xe,C.DEPTH_BUFFER_BIT,C.NEAREST);_.bindFramebuffer(C.READ_FRAMEBUFFER,null),_.bindFramebuffer(C.DRAW_FRAMEBUFFER,null)}else if(k!==0||v.isRenderTargetTexture||G.has(v)){const mt=G.get(v),An=G.get(L);_.bindFramebuffer(C.READ_FRAMEBUFFER,U),_.bindFramebuffer(C.DRAW_FRAMEBUFFER,O);for(let ht=0;ht<Te;ht++)si?C.framebufferTextureLayer(C.READ_FRAMEBUFFER,C.COLOR_ATTACHMENT0,mt.__webglTexture,k,Ke+ht):C.framebufferTexture2D(C.READ_FRAMEBUFFER,C.COLOR_ATTACHMENT0,C.TEXTURE_2D,mt.__webglTexture,k),at?C.framebufferTextureLayer(C.DRAW_FRAMEBUFFER,C.COLOR_ATTACHMENT0,An.__webglTexture,ve,_t+ht):C.framebufferTexture2D(C.DRAW_FRAMEBUFFER,C.COLOR_ATTACHMENT0,C.TEXTURE_2D,An.__webglTexture,ve),k!==0?C.blitFramebuffer(Ce,Xe,we,xe,be,st,we,xe,C.COLOR_BUFFER_BIT,C.NEAREST):at?C.copyTexSubImage3D(Ee,ve,be,st,_t+ht,Ce,Xe,we,xe):C.copyTexSubImage2D(Ee,ve,be,st,Ce,Xe,we,xe);_.bindFramebuffer(C.READ_FRAMEBUFFER,null),_.bindFramebuffer(C.DRAW_FRAMEBUFFER,null)}else at?v.isDataTexture||v.isData3DTexture?C.texSubImage3D(Ee,ve,be,st,_t,we,xe,Te,lt,bt,ut.data):L.isCompressedArrayTexture?C.compressedTexSubImage3D(Ee,ve,be,st,_t,we,xe,Te,lt,ut.data):C.texSubImage3D(Ee,ve,be,st,_t,we,xe,Te,lt,bt,ut):v.isDataTexture?C.texSubImage2D(C.TEXTURE_2D,ve,be,st,we,xe,lt,bt,ut.data):v.isCompressedTexture?C.compressedTexSubImage2D(C.TEXTURE_2D,ve,be,st,ut.width,ut.height,lt,ut.data):C.texSubImage2D(C.TEXTURE_2D,ve,be,st,we,xe,lt,bt,ut);_.pixelStorei(C.UNPACK_ROW_LENGTH,Pt),_.pixelStorei(C.UNPACK_IMAGE_HEIGHT,et),_.pixelStorei(C.UNPACK_SKIP_PIXELS,zt),_.pixelStorei(C.UNPACK_SKIP_ROWS,tn),_.pixelStorei(C.UNPACK_SKIP_IMAGES,bn),ve===0&&L.generateMipmaps&&C.generateMipmap(Ee),_.unbindTexture()},this.initRenderTarget=function(v){G.get(v).__webglFramebuffer===void 0&&Y.setupRenderTarget(v)},this.initTexture=function(v){v.isCubeTexture?Y.setTextureCube(v,0):v.isData3DTexture?Y.setTexture3D(v,0):v.isDataArrayTexture||v.isCompressedArrayTexture?Y.setTexture2DArray(v,0):Y.setTexture2D(v,0),_.unbindTexture()},this.resetState=function(){J=0,H=0,ie=null,_.reset(),Se.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return ln}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=$e._getDrawingBufferColorSpace(e),t.unpackColorSpace=$e._getUnpackColorSpace()}}const on=(i,e,t)=>i<e?e:i>t?t:i,Ti=(i,e,t)=>i+(e-i)*t;class X0{constructor(){this.x=0,this.y=0,this.previousX=0,this.previousY=0,this.zoom=1,this.viewportWidth=1,this.viewportHeight=1,this.worldWidth=1,this.worldHeight=1,this.followLerpX=1,this.followLerpY=1}setViewport(e,t){this.viewportWidth=Math.max(1,e),this.viewportHeight=Math.max(1,t),this.clampToBounds(),this.syncPreviousPosition()}setBounds(e,t){this.worldWidth=Math.max(1,e),this.worldHeight=Math.max(1,t),this.clampToBounds(),this.syncPreviousPosition()}setZoom(e){this.zoom=Math.max(.001,e),this.clampToBounds(),this.syncPreviousPosition()}getZoom(){return this.zoom}startFollow(e,t,n){this.followTarget=e,this.followLerpX=on(t,0,1),this.followLerpY=on(n,0,1)}snapToFollowTarget(){const e=this.getDesiredFollowPosition();if(!e){this.clampToBounds(),this.syncPreviousPosition();return}this.x=e.x,this.y=e.y,this.clampToBounds(),this.syncPreviousPosition()}update(){this.syncPreviousPosition();const e=this.getDesiredFollowPosition();if(!e){this.clampToBounds(),this.syncPreviousPosition();return}this.x=Ti(this.x,e.x,this.followLerpX),this.y=Ti(this.y,e.y,this.followLerpY),this.clampToBounds()}screenToWorld(e,t){return{x:this.x+e/this.zoom,y:this.y+t/this.zoom}}getRenderPosition(e=1){const t=on(e,0,1);return{x:Ti(this.previousX,this.x,t),y:Ti(this.previousY,this.y,t)}}syncPreviousPosition(){this.previousX=this.x,this.previousY=this.y}getDesiredFollowPosition(){if(!this.followTarget)return;const e=this.viewportWidth/this.zoom,t=this.viewportHeight/this.zoom;return{x:this.followTarget.x-e/2,y:this.followTarget.y-t/2}}clampToBounds(){const e=this.viewportWidth/this.zoom,t=this.viewportHeight/this.zoom,n=e>=this.worldWidth?(this.worldWidth-e)/2:0,s=e>=this.worldWidth?n:this.worldWidth-e,r=t>=this.worldHeight?(this.worldHeight-t)/2:0,o=t>=this.worldHeight?r:this.worldHeight-t;this.x=on(this.x,n,s),this.y=on(this.y,r,o)}}const pa=20*Math.PI/180,Ks=Math.cos(pa),Oa=5*Math.PI/180,Y0=Math.sin(Oa),gc=Math.cos(Oa);class q0{constructor(){this.camera=new Er(-.5,.5,.5,-.5,.1,4e3),this.tracker=new X0,this.raycaster=new Xd,this.pointer=new me,this.ground=new Mn(new D(0,1,0),0),this.intersection=new D,this.viewportWidth=1,this.viewportHeight=1,this.worldWidth=1,this.worldHeight=1,this.distance=1e3}setBounds(e,t){this.worldWidth=Math.max(1,e),this.worldHeight=Math.max(1,t),this.tracker.setBounds(e,t),this.distance=Math.max(1e3,Math.hypot(e,t)*2),this.camera.far=this.distance*4,this.updateProjection()}setZoom(e){this.tracker.setZoom(e),this.updateProjection()}getZoom(){return this.tracker.getZoom()}setViewport(e,t){this.viewportWidth=Math.max(1,e),this.viewportHeight=Math.max(1,t),this.tracker.setViewport(this.viewportWidth,this.viewportHeight/Ks),this.updateProjection()}startFollow(e,t,n){this.tracker.startFollow(e,t,n)}snapToFollowTarget(){this.tracker.snapToFollowTarget()}update(){this.tracker.update()}getRenderPosition(e=1){return this.tracker.getRenderPosition(e)}present(e=1,t=1){const n=this.tracker.getRenderPosition(e),s=this.tracker.getZoom(),r=this.viewportWidth/s,o=this.viewportHeight/s/Ks,a=Math.max(1,Math.floor(this.viewportWidth*t))/r,l=Math.max(1,Math.floor(this.viewportHeight*t))/o,c=this.alignToPixel(n.x,a,this.worldWidth,r)+r/2,h=this.alignToPixel(n.y,l,this.worldHeight,o)+o/2;this.camera.up.set(0,0,-1),this.camera.position.set(c+this.distance*Ks*Y0,this.distance*Ks*gc,h+this.distance*Math.sin(pa)),this.camera.lookAt(c,0,h),this.camera.updateMatrixWorld()}alignToPixel(e,t,n,s){const r=s>=n?(n-s)/2:0,o=Math.max(r,n-s);return e<=r||e>=o?on(e,r,o):on(Math.round(e*t)/t,r,o)}screenToWorld(e,t){return this.pointer.set(e/this.viewportWidth*2-1,1-t/this.viewportHeight*2),this.raycaster.setFromCamera(this.pointer,this.camera),this.raycaster.ray.intersectPlane(this.ground,this.intersection),{x:this.intersection.x,y:this.intersection.z}}updateProjection(){const e=this.viewportWidth/this.tracker.getZoom()/2,t=this.viewportHeight/this.tracker.getZoom()/2;this.camera.left=-e,this.camera.right=e,this.camera.top=t,this.camera.bottom=-t,this.camera.updateProjectionMatrix();const n=this.camera.projectionMatrix.elements;n[0]/=gc,n[1]=-Math.sin(pa)*Math.tan(Oa)*n[5],this.camera.projectionMatrixInverse.copy(this.camera.projectionMatrix).invert()}}const K0=16,Jn={packet:10,ghost:11},ss={packet:1,ghost:1},Eh={durationMs:1500,intervalMs:120},an={durationMs:1200,blinkStartIntervalMs:60,blinkEndIntervalMs:220},fo={zoom:5,followLerp:{x:.09,y:.09}},J0="(hover: none) and (pointer: coarse)",Z0=18,$0=1.2,Q0=10,Ba=3,po=5e3,_c=900,j0=.5,wh=6e3,Fn=1200,Js=[200,400,800,1600],ms={0:{texture:"point",size:2.5,score:10},1:{texture:"point",size:4,score:50},2:{texture:"cherry",size:4,score:100},3:{texture:"strawberry",size:4,score:150},4:{texture:"banana",size:4,score:200},5:{texture:"pear",size:4,score:250},6:{texture:"heart",size:4,score:300}};class e_{constructor(){this.listeners={}}on(e,t){const n=this.listeners[e];if(n){n.add(t);return}this.listeners[e]=new Set([t])}off(e,t){var n;(n=this.listeners[e])==null||n.delete(t)}emit(e,t){var n;(n=this.listeners[e])==null||n.forEach(s=>{s(t)})}clear(){Object.keys(this.listeners).forEach(e=>{var t;(t=this.listeners[e])==null||t.clear()})}}const Bn={ScoreChanged:"score-changed",LivesChanged:"lives-changed"},Wt={score:0,lives:Ba},mo=new e_,kn={on(i,e){mo.on(i,e)},off(i,e){mo.off(i,e)},emit(i,e){mo.emit(i,e)}};function t_(i=0,e=Ba){Wt.score=i,Wt.lives=e,kn.emit(Bn.ScoreChanged,Wt.score),kn.emit(Bn.LivesChanged,Wt.lives)}function Th(i){Wt.score+=i,kn.emit(Bn.ScoreChanged,Wt.score)}function n_(i=1){const e=Math.max(0,Math.floor(i));return e===0||(Wt.lives=Math.max(0,Wt.lives-e),kn.emit(Bn.LivesChanged,Wt.lives)),Wt.lives}function i_(){return{...Wt}}class s_{constructor(e){this.x=0,this.y=0,this.angle=0,this.flipX=!1,this.flipY=!1,this.depth=2,this.active=!0,this.moved={x:0,y:0},this.key=e.key,this.direction=e.direction,this.speed=e.speed,this.tile={...e.tile},this.displayWidth=e.displayWidth,this.displayHeight=e.displayHeight,this.state={free:!1,soonFree:!0,scared:!1,dead:!1,animation:"default"}}}class r_{constructor(e,t,n){this.x=0,this.y=0,this.angle=0,this.flipX=!1,this.flipY=!1,this.depth=2,this.active=!0,this.moved={x:0,y:0},this.direction={current:"right",next:"right"},this.portalBlinkRemainingMs=0,this.portalBlinkElapsedMs=0,this.deathRecoveryRemainingMs=0,this.deathRecoveryElapsedMs=0,this.deathRecoveryNextToggleAtMs=0,this.deathRecoveryVisible=!0,this.tile={...e},this.displayWidth=t,this.displayHeight=n}}const ka=["up","down","left","right"],ma={up:"down",down:"up",left:"right",right:"left"},za={up:{dx:0,dy:-1},down:{dx:0,dy:1},left:{dx:-1,dy:0},right:{dx:1,dy:0}},o_=()=>({collides:!1,penGate:!1,portal:!1,up:!1,down:!1,left:!1,right:!1}),go=Object.freeze({collides:!0,penGate:!1,portal:!1,up:!0,down:!0,left:!0,right:!0});class a_{constructor(e){var t;this.grid=e,this.height=e.length,this.width=((t=e[0])==null?void 0:t.length)??0}getTileAt(e,t){if(!this.isInBounds(e,t))return go;const n=this.grid[t];return n?n[e]??go:go}getTilesAt(e){const{x:t,y:n}=e;return{current:this.getTileAt(t,n),up:this.getTileAt(t,n-1),down:this.getTileAt(t,n+1),left:this.getTileAt(t-1,n),right:this.getTileAt(t+1,n)}}toArray(){return this.grid.map(e=>e.map(t=>({...t})))}isInBounds(e,t){return t>=0&&t<this.height&&e>=0&&e<this.width}}const br=16;function ei(i,e,t,n,s=br,r="packet"){const o=n.current,a=n.up,l=n.down,c=n.left,h=n.right,d=r==="ghostRelease",u=(f,g)=>!(!g||d&&f.penGate);return i==="up"?u(o,o.up)||u(a,a.down)?e<0&&e>=-s:!0:i==="down"?u(o,o.down)||u(l,l.up)?e>0&&e<=s:!0:i==="right"?u(o,o.right)||u(h,h.left)?t>0&&t<=s:!0:i==="left"&&(u(o,o.left)||u(c,c.right))?t<0&&t>=-s:!0}function bh(i,e,t=br,n="packet"){const s=ka.filter(r=>r===ma[e]?!1:ei(r,0,0,i,t,n));if(!s.length){const r=ma[e];ei(r,0,0,i,t,n)&&s.push(r)}return s}function l_(i,e,t=br,n=ei){const{current:s,next:r}=i.direction;return r===s||i.moved.x!==0||i.moved.y!==0?s:(n(r,i.moved.y,i.moved.x,e,t,"packet")&&(i.direction.current=r,r==="left"||r==="right"?i.moved.x=0:i.moved.y=0),i.direction.current)}function c_(i,e,t,n){const s=za[e];for(i.moved.x+=s.dx*t,i.moved.y+=s.dy*t;i.moved.x>=n;)i.tile.x+=1,i.moved.x-=n;for(;i.moved.x<=-n;)i.tile.x-=1,i.moved.x+=n;for(;i.moved.y>=n;)i.tile.y+=1,i.moved.y-=n;for(;i.moved.y<=-n;)i.tile.y-=1,i.moved.y+=n}function h_(i,e,t){const n=t/2;return{x:i.x*t+n+e.x,y:i.y*t+n+e.y}}function Ah(i,e){const t=h_(i.tile,i.moved,e);i.x=t.x,i.y=t.y}function u_(i,e,t){i.tile={...e},i.moved={x:0,y:0},Ah(i,t)}class d_{constructor(e=br){this.tileSize=e}canMove(e,t,n,s,r="packet"){return ei(e,t,n,s,this.tileSize,r)}getAvailableDirections(e,t,n){return bh(e,t,this.tileSize,n)}applyBufferedDirection(e,t){return l_(e,t,this.tileSize)}advanceEntity(e,t,n){c_(e,t,n,this.tileSize)}syncEntityPosition(e){Ah(e,this.tileSize)}setEntityTile(e,t){u_(e,t,this.tileSize)}}class f_{chooseDirectionAtCenter(e,t,n,s){const r=bh(t,e,n,"ghost");return r.length?r[s.int(r.length)]??e:e}chooseDirectionWhenBlocked(e,t,n,s,r,o){const l=(e==="left"||e==="right"?["up","down"]:["left","right"]).filter(h=>ei(h,t,n,s,r,"ghost"));if(l.length>0)return l[o.int(l.length)]??e;const c=ma[e];return ei(c,t,n,s,r,"ghost")?c:e}}function p_(i){var t,n;const e=new Map;for(let s=0;s<i.height;s+=1)for(let r=0;r<i.width;r+=1){const o=(n=(t=i.tiles[s])==null?void 0:t[r])==null?void 0:n.localId;typeof o=="number"&&e.set(o,(e.get(o)??0)+1)}return e}function m_(i){var t,n,s,r;const e=[];for(let o=0;o<i.height;o+=1){let a=0;for(;a<i.width;){if(!((n=(t=i.tiles[o])==null?void 0:t[a])!=null&&n.collision.penGate)){a+=1;continue}const l=a;for(;a<i.width&&((r=(s=i.tiles[o])==null?void 0:s[a])!=null&&r.collision.penGate);)a+=1;const c=a-1,h=c-l+1;h>=3&&e.push({minX:l,maxX:c,y:o,length:h,centerX:l+Math.floor((c-l)/2)})}}return e}function g_(i){var t,n,s,r;const e=[];if(i.width<3||i.height<3)return e;for(let o=1;o<i.height-1;o+=1){let a=1;for(;a<i.width-1;){const l=(n=(t=i.tiles[o])==null?void 0:t[a])==null?void 0:n.localId;if(typeof l!="number"){a+=1;continue}const c=a;for(a+=1;a<i.width-1&&((r=(s=i.tiles[o])==null?void 0:s[a])==null?void 0:r.localId)===l;)a+=1;const h=a-1,d=h-c+1;d>=3&&e.push({minX:c,maxX:h,y:o,length:d,centerX:c+Math.floor((h-c)/2),localId:l})}}return e}function __(i){const e=m_(i);if(e.length===0)return null;const t=(i.width-1)/2;e.sort((a,l)=>{const c=l.length-a.length;if(c!==0)return c;const h=Math.abs(a.centerX-t)-Math.abs(l.centerX-t);return h!==0?h:a.y!==l.y?a.y-l.y:a.minX-l.minX});const n=e[0];if(!n)return null;const s=n.y+1,r=i.height-1,o=s<0?0:s>r?r:s;return{minX:n.minX,maxX:n.maxX,homeY:o,centerX:n.centerX}}function x_(i){const e=g_(i);if(e.length===0)return null;const t=p_(i),n=(i.width-1)/2,s=(i.height-1)/2,r=Math.floor((i.height-1)*.66);e.sort((a,l)=>{const c=(a.y>=s?0:1)-(l.y>=s?0:1);if(c!==0)return c;const h=Math.abs(a.centerX-n)-Math.abs(l.centerX-n);if(h!==0)return h;const d=(t.get(a.localId)??Number.MAX_SAFE_INTEGER)-(t.get(l.localId)??Number.MAX_SAFE_INTEGER);if(d!==0)return d;const u=l.length-a.length;if(u!==0)return u;const f=Math.abs(a.y-r)-Math.abs(l.y-r);return f!==0?f:a.y!==l.y?a.y-l.y:a.minX-l.minX});const o=e[0];return o?{minX:o.minX,maxX:o.maxX,homeY:o.y,centerX:o.centerX}:null}function v_(i,e){var r,o,a,l,c;const t=[],n=Math.min(Math.max(e-1,0),i.height-2),s=(i.width-1)/2;for(let h=1;h<=n;h+=1){let d=1;for(;d<i.width-1;){const u=(o=(r=i.tiles[h])==null?void 0:r[d])==null?void 0:o.localId;if(typeof u!="number"){d+=1;continue}let f=u;const g=d;for(d+=1;d<i.width-1;){const p=(l=(a=i.tiles[h])==null?void 0:a[d])==null?void 0:l.localId;if(typeof p!="number"||p!==f+1)break;f=p,d+=1}const M=d-1,m=M-g+1;m>=3&&t.push({y:h,length:m,centerX:g+Math.floor((M-g)/2),minX:g})}}if(t.length!==0)return t.sort((h,d)=>{const u=Math.abs(h.centerX-s)-Math.abs(d.centerX-s);if(u!==0)return u;const f=e-h.y-(e-d.y);if(f!==0)return f;const g=d.length-h.length;return g!==0?g:h.y!==d.y?d.y-h.y:h.minX-d.minX}),(c=t[0])==null?void 0:c.y}function xc(i){const e=__(i);if(e)return e;const t=x_(i);return t?{minX:t.minX,maxX:t.maxX,homeY:t.homeY,centerX:t.centerX}:null}function Nn(i,e,t){return i<e?e:i>t?t:i}function yi(i,e){var n;const t=(n=i==null?void 0:i.properties)==null?void 0:n.find(s=>s.name===e);return typeof(t==null?void 0:t.value)=="number"?t.value:void 0}class M_{resolveSpawnTile(e,t,n){const s=yi(e,"gridX"),r=yi(e,"gridY");if(typeof s=="number"&&typeof r=="number")return this.clampTilePosition({x:s,y:r},n);if(e&&typeof e.x=="number"&&typeof e.y=="number")return this.clampTilePosition({x:Math.floor(e.x/n.tileWidth),y:Math.floor(e.y/n.tileHeight)},n);const o=xc(n);if(o){let a=o.homeY-1;const l=v_(n,o.homeY);return typeof l=="number"&&a<=l&&(a=Math.min(o.homeY-1,l+1)),this.clampTilePosition({x:o.centerX,y:a},n)}return this.clampTilePosition(t,n)}resolveGhostJailBounds(e,t){const n=xc(e),s=yi(e.ghostHome,"startX")??(n==null?void 0:n.minX)??t.x,r=yi(e.ghostHome,"endX")??(n==null?void 0:n.maxX)??t.x,o=Nn(Math.round(Math.min(s,r)),0,e.width-1),a=Nn(Math.round(Math.max(s,r)),0,e.width-1),l=yi(e.ghostHome,"gridY"),c=typeof l=="number"?l:e.ghostHome&&typeof e.ghostHome.y=="number"?Math.round(e.ghostHome.y/e.tileHeight):n?n.homeY:t.y,h=Nn(c,0,e.height-1);return{minX:o,maxX:a,y:h}}findReleaseTile(e){const t=Nn(e.bounds.y-1,0,e.map.height-1),n=[];for(let c=e.bounds.minX;c<=e.bounds.maxX;c+=1){const h={x:c,y:t};h.x===e.avoidTile.x&&h.y===e.avoidTile.y||this.canGhostMoveFromTile(h,e.collisionGrid,e.movementRules)&&n.push(h)}const s=this.clampTilePosition({x:e.currentTile.x,y:t},e.map);if(n.length===0)return s;const r=Nn(e.currentTile.x,e.bounds.minX,e.bounds.maxX),o=n.reduce((c,h)=>Math.min(c,Math.abs(h.x-r)),Number.POSITIVE_INFINITY),a=n.filter(c=>Math.abs(c.x-r)===o);if(e.preferDirection==="right")return[...a].sort((h,d)=>d.x-h.x)[0]??s;if(e.preferDirection==="left")return[...a].sort((h,d)=>h.x-d.x)[0]??s;const l=e.rng.int(Math.max(1,a.length));return a[l]??s}moveGhostInJail(e,t,n,s,r){if((e.tile.y!==t.y||e.moved.y!==0)&&n.setEntityTile(e,{x:e.tile.x,y:t.y}),e.moved.x===0&&(e.direction!=="left"&&e.direction!=="right"&&(e.direction=s.next()<.5?"right":"left"),e.tile.x<=t.minX&&e.direction==="left"?e.direction="right":e.tile.x>=t.maxX&&e.direction==="right"&&(e.direction="left")),n.advanceEntity(e,e.direction,r),e.tile.x<t.minX||e.tile.x>t.maxX){const o=Nn(e.tile.x,t.minX,t.maxX);n.setEntityTile(e,{x:o,y:t.y}),e.direction=e.direction==="left"?"right":"left"}}canGhostMoveFromTile(e,t,n){const s=t.getTilesAt(e);return["up","down","left","right"].some(o=>n.canMove(o,0,0,s,"ghost"))}clampTilePosition(e,t){return{x:Nn(e.x,0,t.width-1),y:Nn(e.y,0,t.height-1)}}}function _o(i){return`${i.x},${i.y}`}class S_{constructor(e,t=[]){if(this.portalPairs=new Map,this.lastTeleportTick=new WeakMap,t.length>0){t.forEach(s=>{this.setPortalPair(s.from,s.to)});return}const n=[];for(let s=0;s<e.height;s+=1)for(let r=0;r<e.width;r+=1)e.getTileAt(r,s).portal&&n.push({x:r,y:s});for(let s=0;s+1<n.length;s+=2){const r=n[s],o=n[s+1];this.setPortalPair(r,o)}}canAdvanceOutward(e,t){if(e.moved.x!==0||e.moved.y!==0)return!1;const n=this.resolvePortalContext(e);return n?!this.isDestinationFullyBlocking(n.portalLink,t):!1}tryTeleport(e,t,n,s=16){if(this.lastTeleportTick.get(e)===n)return!1;const r=this.resolvePortalContext(e);if(!r||!this.hasReachedOutwardTeleportThreshold(e.moved,r.direction,s)||this.isDestinationFullyBlocking(r.portalLink,t))return!1;const o=r.portalLink.destination;return e.tile={...o},e.moved.x=0,e.moved.y=0,this.lastTeleportTick.set(e,n),!0}setPortalPair(e,t){this.portalPairs.set(_o(e),{destination:{...t},outwardDirection:this.resolveOutwardDirection(e,t)}),this.portalPairs.set(_o(t),{destination:{...e},outwardDirection:this.resolveOutwardDirection(t,e)})}resolveEntityDirection(e){if(this.isDirection(e.direction))return e.direction;if(!this.isRecord(e.direction))return;const t=e.direction.current;return this.isDirection(t)?t:void 0}resolveOutwardDirection(e,t){if(e.x===t.x)return e.y<t.y?"up":"down";if(e.y===t.y)return e.x<t.x?"left":"right"}resolvePortalContext(e){const t=_o(e.tile),n=this.portalPairs.get(t);if(!n||!n.outwardDirection)return null;const s=this.resolveEntityDirection(e);return!s||s!==n.outwardDirection?null:{portalLink:n,direction:s}}hasReachedOutwardTeleportThreshold(e,t,n){const r=(Number.isFinite(n)&&n>0?n:16)/2;return this.resolveOutwardOffset(e,t)>=r}resolveOutwardOffset(e,t){return t==="up"?-e.y:t==="down"?e.y:t==="left"?-e.x:e.x}isDestinationFullyBlocking(e,t){const n=e.destination,s=t.getTileAt(n.x,n.y);return this.isFullyBlocking(s)}isRecord(e){return typeof e=="object"&&e!==null}isDirection(e){return e==="up"||e==="right"||e==="down"||e==="left"}isFullyBlocking(e){return e.collides&&e.up&&e.right&&e.down&&e.left}}class y_{constructor(e){this.ghostScaredTimers=new Map,this.ghostScaredWarnings=new Map,this.ghostEatChainCount=0,this.ghostsExitingJail=new Set,this.ghostAnimations=new Map,this.packetAnimation={frame:0,elapsedMs:0,sequenceIndex:0,active:!1},this.isMoving=!0,this.collisionDebugEnabled=!1,this.hoveredDebugTile=null,this.pointerScreen=null,this.debugPanelText="",this.tick=0,this.map=e.map,this.tileSize=e.tileSize,this.collisionGrid=e.collisionGrid,this.packetSpawnTile={...e.packetSpawnTile},this.packet=e.packet,this.ghosts=e.ghosts,this.ghostJailBounds=e.ghostJailBounds,this.ghostJailReturnTile={x:e.ghostJailBounds.minX+Math.floor((e.ghostJailBounds.maxX-e.ghostJailBounds.minX)/2),y:e.ghostJailBounds.y}}nextTick(){return this.tick+=1,this.tick}}class E_{constructor(e){this.keyDown=new Set,this.keyDownListeners=new Set,this.pointerMoveListeners=new Set,this.pointerDownListeners=new Set,this.pointerUpListeners=new Set,this.pointerCancelListeners=new Set,this.handleKeyDown=t=>{this.keyDown.add(t.code),this.keyDownListeners.forEach(n=>{n(t)})},this.handleKeyUp=t=>{this.keyDown.delete(t.code)},this.handleBlur=()=>{this.keyDown.clear()},this.handlePointerMove=t=>{this.pointerMoveListeners.forEach(n=>{n(this.toPointerState(t))})},this.handlePointerDown=t=>{this.pointerDownListeners.forEach(n=>{n(this.toPointerState(t))})},this.handlePointerUp=t=>{this.pointerUpListeners.forEach(n=>{n(this.toPointerState(t))})},this.handlePointerCancel=t=>{this.pointerCancelListeners.forEach(n=>{n(this.toPointerState(t))})},this.element=e,window.addEventListener("keydown",this.handleKeyDown),window.addEventListener("keyup",this.handleKeyUp),window.addEventListener("blur",this.handleBlur),this.element.addEventListener("pointermove",this.handlePointerMove),this.element.addEventListener("pointerdown",this.handlePointerDown),window.addEventListener("pointerup",this.handlePointerUp),window.addEventListener("pointercancel",this.handlePointerCancel)}isKeyDown(e){return this.keyDown.has(e)}onKeyDown(e){return this.keyDownListeners.add(e),()=>{this.keyDownListeners.delete(e)}}onPointerMove(e){return this.pointerMoveListeners.add(e),()=>{this.pointerMoveListeners.delete(e)}}onPointerDown(e){return this.pointerDownListeners.add(e),()=>{this.pointerDownListeners.delete(e)}}onPointerUp(e){return this.pointerUpListeners.add(e),()=>{this.pointerUpListeners.delete(e)}}onPointerCancel(e){return this.pointerCancelListeners.add(e),()=>{this.pointerCancelListeners.delete(e)}}destroy(){window.removeEventListener("keydown",this.handleKeyDown),window.removeEventListener("keyup",this.handleKeyUp),window.removeEventListener("blur",this.handleBlur),this.element.removeEventListener("pointermove",this.handlePointerMove),this.element.removeEventListener("pointerdown",this.handlePointerDown),window.removeEventListener("pointerup",this.handlePointerUp),window.removeEventListener("pointercancel",this.handlePointerCancel),this.keyDown.clear(),this.keyDownListeners.clear(),this.pointerMoveListeners.clear(),this.pointerDownListeners.clear(),this.pointerUpListeners.clear(),this.pointerCancelListeners.clear()}toPointerState(e){const t=this.element.getBoundingClientRect();return{x:e.clientX-t.left,y:e.clientY-t.top,buttons:e.buttons,pointerId:e.pointerId,pointerType:e.pointerType,isPrimary:e.isPrimary}}}class w_{constructor(e){this.input=new E_(e)}isKeyDown(e){return this.input.isKeyDown(e)}onKeyDown(e){return this.input.onKeyDown(e)}onPointerMove(e){return this.input.onPointerMove(e)}onPointerDown(e){return this.input.onPointerDown(e)}onPointerUp(e){return this.input.onPointerUp(e)}onPointerCancel(e){return this.input.onPointerCancel(e)}destroy(){this.input.destroy()}}class T_{constructor(e){this.viewportWidth=1,this.viewportHeight=1,this.disposed=!1;try{this.renderer=new W0({canvas:e,antialias:!0,alpha:!1})}catch{throw new Error("The 3D game requires WebGL 2. Enable hardware acceleration or try a browser that supports WebGL 2.")}this.renderer.outputColorSpace=Bt,this.renderer.toneMapping=xa}get width(){return this.viewportWidth}get height(){return this.viewportHeight}get pixelRatio(){return this.renderer.getPixelRatio()}resize(e,t){this.viewportWidth=Math.max(1,Math.round(e)),this.viewportHeight=Math.max(1,Math.round(t));const n=typeof window>"u"?1:window.devicePixelRatio,s=Number.isFinite(n)&&n>0?Math.min(n,2):1;this.renderer.setDrawingBufferSize(this.viewportWidth,this.viewportHeight,s)}render(e,t){this.disposed||this.renderer.render(e,t)}dispose(){this.disposed||(this.disposed=!0,this.renderer.dispose())}}class b_{constructor(){this.timers=new Set,this.paused=!1}delayedCall(e,t){const n={active:!0,paused:!1,delayMs:e,elapsedMs:0,callback:t,cancel:()=>{n.active=!1,this.timers.delete(n)}};return this.timers.add(n),n}setPaused(e){this.paused=e}update(e){if(this.paused||e<=0)return;Array.from(this.timers).forEach(n=>{!n.active||n.paused||(n.elapsedMs+=e,!(n.elapsedMs<n.delayMs)&&(n.active=!1,this.timers.delete(n),n.callback()))})}clear(){this.timers.forEach(e=>{e.active=!1}),this.timers.clear()}}const A_=(i,e)=>i==="sineInOut"?-(Math.cos(Math.PI*e)-1)/2:e;class R_{constructor(){this.tweens=new Set,this.paused=!1}setPaused(e){this.paused=e}add(e){const t=e.target,n={};Object.keys(e.to).forEach(r=>{const o=t[r];n[r]=typeof o=="number"?o:0});const s={active:!0,paused:!1,target:e.target,from:n,to:e.to,durationMs:Math.max(1,e.durationMs),elapsedMs:0,ease:e.ease??"linear",onComplete:e.onComplete,cancel:()=>{s.active=!1,this.tweens.delete(s)}};return this.tweens.add(s),s}update(e){if(this.paused||e<=0)return;Array.from(this.tweens).forEach(n=>{var o;if(!n.active||n.paused)return;n.elapsedMs+=e;const s=Math.min(1,n.elapsedMs/n.durationMs),r=A_(n.ease,s);Object.keys(n.to).forEach(a=>{const l=n.from[a]??0,c=n.to[a]??l;n.target[a]=l+(c-l)*r}),s>=1&&(n.active=!1,this.tweens.delete(n),(o=n.onComplete)==null||o.call(n))})}clear(){this.tweens.forEach(e=>{e.active=!1}),this.tweens.clear()}}class C_{constructor(){this.timers=new b_,this.tweens=new R_}delayedCall(e,t){return this.timers.delayedCall(e,t)}addTween(e){return this.tweens.add(e)}update(e){this.timers.update(e),this.tweens.update(e)}setPaused(e){this.timers.setPaused(e),this.tweens.setPaused(e)}clear(){this.timers.clear(),this.tweens.clear()}}function Ga(){return{collides:!0,penGate:!1,portal:!1,up:!0,down:!0,left:!0,right:!0}}function es(i){return!i||i.gid===null}function P_(i){if(!i)return!0;const e=i.collision;return e.collides&&e.up&&e.right&&e.down&&e.left}function Zs(i){return!i||i.gid===null||i.collision.penGate?!1:!P_(i)}function L_(i){var s,r,o,a,l,c,h,d,u;const e=[],t=i.length,n=((s=i[0])==null?void 0:s.length)??0;if(t<3||n<3)return e;for(let f=0;f<t;f+=1){const g=(r=i[f])==null?void 0:r[1],M=(o=i[f])==null?void 0:o[0];Zs(g)&&M&&M.gid!==null&&!M.collision.left&&e.push({tile:{x:1,y:f},side:"left"});const m=(a=i[f])==null?void 0:a[n-2],p=(l=i[f])==null?void 0:l[n-1];Zs(m)&&p&&p.gid!==null&&!p.collision.right&&e.push({tile:{x:n-2,y:f},side:"right"})}for(let f=0;f<n;f+=1){const g=(c=i[1])==null?void 0:c[f],M=(h=i[0])==null?void 0:h[f];Zs(g)&&M&&M.gid!==null&&!M.collision.up&&e.push({tile:{x:f,y:1},side:"top"});const m=(d=i[t-2])==null?void 0:d[f],p=(u=i[t-1])==null?void 0:u[f];Zs(m)&&p&&p.gid!==null&&!p.collision.down&&e.push({tile:{x:f,y:t-2},side:"bottom"})}return e}function I_(i){var t,n,s,r,o,a;const e=[];for(let l=0;l<i.length;l+=1)for(let c=0;c<(((t=i[l])==null?void 0:t.length)??0);c+=1){const h=(n=i[l])==null?void 0:n[c];if(!h||h.gid===null||h.collision.collides||h.collision.penGate)continue;const d=(s=i[l-1])==null?void 0:s[c],u=(r=i[l+1])==null?void 0:r[c],f=(o=i[l])==null?void 0:o[c-1],g=(a=i[l])==null?void 0:a[c+1];es(f)&&!h.collision.left&&e.push({tile:{x:c,y:l},side:"left"}),es(g)&&!h.collision.right&&e.push({tile:{x:c,y:l},side:"right"}),es(d)&&!h.collision.up&&e.push({tile:{x:c,y:l},side:"top"}),es(u)&&!h.collision.down&&e.push({tile:{x:c,y:l},side:"bottom"})}return e}function D_(i){var e,t;for(let n=0;n<i.length;n+=1)for(let s=0;s<(((e=i[n])==null?void 0:e.length)??0);s+=1){const r=(t=i[n])==null?void 0:t[s];!r||r.gid===null||(r.collision.portal=!1)}}function N_(i,e){const t=i.filter(n=>{var r;const s=(r=e[n.tile.y])==null?void 0:r[n.tile.x];return!!(s&&!s.collision.collides)});return t.length>0?t:i}function $s(i,e,t,n){const s=(t-1)/2,r=(n-1)/2,o=i.filter(a=>a.side===e);return o.length===0?null:(o.sort((a,l)=>{if(e==="left"||e==="right"){const h=Math.abs(a.tile.y-r)-Math.abs(l.tile.y-r);return h!==0?h:a.tile.x!==l.tile.x?e==="left"?a.tile.x-l.tile.x:l.tile.x-a.tile.x:a.tile.y-l.tile.y}const c=Math.abs(a.tile.x-s)-Math.abs(l.tile.x-s);return c!==0?c:a.tile.y!==l.tile.y?e==="top"?a.tile.y-l.tile.y:l.tile.y-a.tile.y:a.tile.x-l.tile.x}),o[0]??null)}function U_(i){var u,f;if(i.length===0||(((u=i[0])==null?void 0:u.length)??0)===0)return[];D_(i);const e=L_(i),t=I_(i),n=["left","right","top","bottom"],s=[];n.forEach(g=>{const M=e.filter(m=>m.side===g);if(M.length>0){s.push(...N_(M,i));return}s.push(...t.filter(m=>m.side===g))});const r=((f=i[0])==null?void 0:f.length)??0,o=i.length,a=$s(s,"left",r,o),l=$s(s,"right",r,o),c=$s(s,"top",r,o),h=$s(s,"bottom",r,o),d=[];return a&&l&&d.push({from:{...a.tile},to:{...l.tile}}),c&&h&&d.push({from:{...c.tile},to:{...h.tile}}),d.forEach(g=>{var p,w;const M=(p=i[g.from.y])==null?void 0:p[g.from.x],m=(w=i[g.to.y])==null?void 0:w[g.to.x];M&&(M.collision.portal=!0),m&&(m.collision.portal=!0)}),d}function F_(i){var t,n;const e=[{dx:0,dy:-1,edge:"up"},{dx:1,dy:0,edge:"right"},{dx:0,dy:1,edge:"down"},{dx:-1,dy:0,edge:"left"}];for(let s=0;s<i.length;s+=1)for(let r=0;r<(((t=i[s])==null?void 0:t.length)??0);r+=1){const o=(n=i[s])==null?void 0:n[r];if(!o||o.gid===null||o.collision.portal)continue;e.some(({dx:l,dy:c,edge:h})=>{var u;const d=(u=i[s+c])==null?void 0:u[r+l];return es(d)&&!o.collision[h]})&&(o.collision=Ga())}}const vc=2147483648,Mc=1073741824,Sc=536870912,Qs=i=>typeof i=="object"&&i!==null;function O_(i){const e=!!(i&vc),t=!!(i&Mc),n=!!(i&Sc),s=i&~(vc|Mc|Sc);let r=0,o=!1;return e&&t&&n?(r=Math.PI/2,o=!0):e&&t&&!n?r=Math.PI:e&&!t&&n?r=Math.PI/2:e&&!t&&!n?o=!0:!e&&t&&n?r=3*Math.PI/2:!e&&t&&!n?(r=Math.PI,o=!0):!e&&!t&&n&&(r=3*Math.PI/2,o=!0),{gid:s,flippedHorizontal:e,flippedVertical:t,flippedAntiDiagonal:n,rotation:r,flipped:o}}function B_(i){const e=n=>i[n],t=n=>!!n;return{collides:t(e("collides")),penGate:t(e("penGate")),portal:t(e("portal")),up:t(e("up")??e("blocksUp")),down:t(e("down")??e("blocksDown")),left:t(e("left")??e("blocksLeft")),right:t(e("right")??e("blocksRight"))}}function k_(i,e,t,n){let s={up:i.up,right:i.right,down:i.down,left:i.left};t&&([s.left,s.right]=[s.right,s.left]),n&&([s.up,s.down]=[s.down,s.up]);const r=(Math.round(e/(Math.PI/2))%4+4)%4;for(let o=0;o<r;o+=1)s={up:s.left,right:s.up,down:s.right,left:s.down};return{collides:i.collides,penGate:i.penGate,portal:i.portal,...s}}const z_=(i,e)=>{var t;for(let n=0;n<e.length;n+=1){const s=e[n],r=((t=e[n+1])==null?void 0:t.firstgid)??Number.POSITIVE_INFINITY;if(i>=s.firstgid&&i<r)return s}},G_=i=>{const e={};return Array.isArray(i)&&i.forEach(t=>{t&&typeof t.name=="string"&&(e[t.name]=t.value)}),e},yc=i=>{var e;return{id:i.id,name:i.name,type:i.type,visible:i.visible,x:i.x,y:i.y,width:i.width,height:i.height,properties:(e=i.properties)==null?void 0:e.map(t=>({name:t.name,type:t.type,value:t.value}))}};function H_(i){var r,o,a,l;let e=Number.POSITIVE_INFINITY,t=Number.POSITIVE_INFINITY,n=Number.NEGATIVE_INFINITY,s=Number.NEGATIVE_INFINITY;for(let c=0;c<i.length;c+=1)for(let h=0;h<(((r=i[c])==null?void 0:r.length)??0);h+=1)((a=(o=i[c])==null?void 0:o[h])==null?void 0:a.gid)!==null&&(e=Math.min(e,h),t=Math.min(t,c),n=Math.max(n,h),s=Math.max(s,c));return!Number.isFinite(e)||!Number.isFinite(t)||!Number.isFinite(n)||!Number.isFinite(s)?{minX:0,minY:0,width:((l=i[0])==null?void 0:l.length)??0,height:i.length}:{minX:e,minY:t,width:n-e+1,height:s-t+1}}function V_(i,e){var n;const t=[];for(let s=0;s<e.height;s+=1){const r=[];for(let o=0;o<e.width;o+=1){const a=(n=i[e.minY+s])==null?void 0:n[e.minX+o];if(!a){r.push({x:o,y:s,rawGid:0,gid:null,localId:null,rotation:0,flipX:!1,flipY:!1,collision:Ga()});continue}r.push({...a,x:o,y:s})}t.push(r)}return t}function Ec(i,e,t,n){var a;const s=e.minX*t,r=e.minY*n,o=(a=i.properties)==null?void 0:a.map(l=>{const c=l.name==="gridX"||l.name==="startX"||l.name==="endX",h=l.name==="gridY";return!c&&!h||typeof l.value!="number"?l:{...l,value:c?l.value-e.minX:l.value-e.minY}});return{...i,x:typeof i.x=="number"?i.x-s:i.x,y:typeof i.y=="number"?i.y-r:i.y,properties:o}}function W_(i){const e=i.layers.find(m=>Qs(m)&&m.type==="tilelayer"&&m.name==="Maze"),t=i.layers.find(m=>Qs(m)&&m.type==="tilelayer"),n=e??t;if(!n||!Array.isArray(n.data))throw new Error("Maze tile layer is required in maze.json");const s=n.width,r=n.height;if(!Number.isFinite(s)||!Number.isFinite(r)||s<=0||r<=0)throw new Error("Maze layer width/height must be positive numbers");const o=new Map;i.tilesets.forEach(m=>{!Number.isFinite(m.firstgid)||!Array.isArray(m.tiles)||m.tiles.forEach(p=>{if(!p||!Number.isFinite(p.id))return;const w=m.firstgid+p.id,A=G_(p.properties);o.set(w,B_(A))})});const a=[...i.tilesets].sort((m,p)=>m.firstgid-p.firstgid),l=[];for(let m=0;m<r;m+=1){const p=[];for(let w=0;w<s;w+=1){const A=m*s+w,S=n.data[A]??0,E=O_(S);if(E.gid<=0){p.push({x:w,y:m,rawGid:S,gid:null,localId:null,rotation:0,flipX:!1,flipY:!1,collision:Ga()});continue}const T=z_(E.gid,a),R=T?E.gid-T.firstgid:E.gid,x=o.get(E.gid)??o_();p.push({x:w,y:m,rawGid:S,gid:E.gid,localId:R,rotation:E.rotation,flipX:E.flipped,flipY:!1,collision:k_(x,E.rotation,E.flipped,!1)})}l.push(p)}const c=H_(l),h=V_(l,c),d=i.layers.find(m=>Qs(m)&&m.type==="objectgroup"&&m.name==="Spawns"),u=i.layers.find(m=>Qs(m)&&m.type==="objectgroup"&&m.name==="Dots"),f=((d==null?void 0:d.objects)??[]).map(m=>Ec(yc(m),c,i.tilewidth,i.tileheight)),g=((u==null?void 0:u.objects)??[]).map(m=>Ec(yc(m),c,i.tilewidth,i.tileheight)),M=U_(h);return F_(h),{width:c.width,height:c.height,tileWidth:i.tilewidth,tileHeight:i.tileheight,widthInPixels:c.width*i.tilewidth,heightInPixels:c.height*i.tileheight,tiles:h,collisionByGid:o,portalPairs:M,spawnObjects:f,collectibleObjects:g,packetSpawn:f.find(m=>m.type==="packet"),ghostHome:f.find(m=>m.type==="ghost-home")}}class X_{async loadMap(e){const t=await fetch(e);if(!t.ok)throw new Error(`Failed to load JSON: ${e}`);const n=await t.json();return W_(n)}}function Y_(i){return typeof i=="function"?{next:i,int(e){return e<=0?0:Math.floor(i()*e)}}:i}function q_(i,e,t){e.state.scared=!0,i.ghostScaredTimers.set(e,t),i.ghostScaredWarnings.delete(e)}function Ha(i,e){e.state.scared=!1,i.ghostScaredTimers.delete(e),i.ghostScaredWarnings.delete(e)}function Rh(i,e){i.ghosts.forEach(t=>{t.active&&q_(i,t,e)})}function K_(i){i.ghosts.forEach(e=>{Ha(i,e)})}function rs(i,e,t){if(i>=e)return 0;let n=t.blinkStartIntervalMs;if(!(e<=0)){const r=Math.max(0,Math.min(1,i/e)),o=t.blinkStartIntervalMs+(t.blinkEndIntervalMs-t.blinkStartIntervalMs)*r;n=Math.max(1,Math.round(o))}const s=i+n;return s>=e?e:s}const J_={scaredIdle:{start:0,end:7,yoyo:!0,frameRate:4},inkyIdle:{start:0,end:7,yoyo:!0,frameRate:4},clydeIdle:{start:0,end:7,yoyo:!0,frameRate:4},pinkyIdle:{start:0,end:7,yoyo:!0,frameRate:4},blinkyIdle:{start:0,end:7,yoyo:!0,frameRate:4}},ga=[0,1,2,3,2,1],xo=ga[0],Z_=20,$_=.5;class Q_{constructor(e,t,n=J_){this.world=e,this.defaultGhostSpeed=t,this.animations=n}start(){this.world.packetAnimation=this.createPacketAnimationPlayback(),this.world.ghosts.forEach(e=>{this.world.ghostAnimations.set(e,this.createAnimationPlayback(`${e.key}Idle`))})}update(e){this.updatePacketAnimationState(e),this.world.ghosts.forEach(t=>{this.updateGhostAnimationState(t,e)})}updatePacketAnimationState(e){const t=this.world.packetAnimation;if(!t.active){t.frame=xo,t.elapsedMs=0,t.sequenceIndex=0;return}const n=1e3/Z_;for(t.elapsedMs+=e;t.elapsedMs>=n;){if(t.elapsedMs-=n,t.sequenceIndex+=1,t.sequenceIndex>=ga.length){t.active=!1,t.frame=xo,t.elapsedMs=0,t.sequenceIndex=0;return}t.frame=ga[t.sequenceIndex]}}updateGhostAnimationState(e,t){this.updateGhostScaredTimer(e,t),e.state.scared&&e.state.animation!=="scared"?(e.state.animation="scared",e.speed=$_,this.world.ghostAnimations.set(e,this.createAnimationPlayback("scaredIdle"))):!e.state.scared&&e.state.animation==="scared"&&(e.state.animation="default",this.world.ghostAnimations.set(e,this.createAnimationPlayback(`${e.key}Idle`)),this.canRestoreGhostSpeed(e)&&(e.speed=this.defaultGhostSpeed)),!e.state.scared&&e.speed!==this.defaultGhostSpeed&&this.canRestoreGhostSpeed(e)&&(e.speed=this.defaultGhostSpeed);const n=this.world.ghostAnimations.get(e);if(!n)return;const s=this.animations[n.key],r=1e3/s.frameRate;for(n.elapsedMs+=t;n.elapsedMs>=r;){if(n.elapsedMs-=r,!s.yoyo){n.frame=n.frame+1>s.end?s.start:n.frame+1;continue}n.forward===1?n.frame<s.end?n.frame+=1:(n.forward=-1,n.frame-=1):n.frame>s.start?n.frame-=1:(n.forward=1,n.frame+=1)}}updateGhostScaredTimer(e,t){const n=this.world.ghostScaredTimers.get(e)??0;if(n<=0){this.world.ghostScaredWarnings.delete(e);return}e.state.scared||(e.state.scared=!0);const s=Number.isFinite(t)&&t>0?t:0,r=Math.max(0,n-s);if(r<=0){Ha(this.world,e);return}this.world.ghostScaredTimers.set(e,r),this.updateGhostWarningState(e,n,r)}updateGhostWarningState(e,t,n){if(n>Fn){this.world.ghostScaredWarnings.delete(e);return}const s=Math.max(0,Fn-t),r=Math.max(0,Fn-n),o=Math.max(0,r-s);let a=this.world.ghostScaredWarnings.get(e);a||(a={elapsedMs:s,nextToggleAtMs:rs(s,Fn,an),showBaseColor:!1});const l=a.elapsedMs;a.elapsedMs=Math.min(Fn,a.elapsedMs+o);let c=a.nextToggleAtMs;for((!Number.isFinite(c)||c<=0)&&(c=rs(l,Fn,an));c>0&&a.elapsedMs>=c;)a.showBaseColor=!a.showBaseColor,c=rs(c,Fn,an);a.nextToggleAtMs=c,this.world.ghostScaredWarnings.set(e,a)}createAnimationPlayback(e){const t=this.animations[e];return{key:e,frame:t.start,elapsedMs:0,forward:1}}createPacketAnimationPlayback(){return{frame:xo,elapsedMs:0,sequenceIndex:0,active:!1}}canRestoreGhostSpeed(e){return e.state.free?e.moved.x===0&&e.moved.y===0:!0}}class j_{constructor(e,t,n,s){this.world=e,this.camera=t,this.renderer=n,this.canvas=s}start(){this.camera.setBounds(this.world.map.widthInPixels,this.world.map.heightInPixels),this.camera.setZoom(fo.zoom),this.camera.startFollow(this.world.packet,fo.followLerp.x,fo.followLerp.y),this.handleResize(),this.camera.snapToFollowTarget(),this.onResize=()=>{this.handleResize()},window.addEventListener("resize",this.onResize)}update(){this.camera.update()}destroy(){this.onResize&&(window.removeEventListener("resize",this.onResize),this.onResize=void 0)}handleResize(){this.renderer.resize(window.innerWidth,window.innerHeight);const e=Number.isFinite(this.renderer.width)?this.renderer.width:this.canvas.width,t=Number.isFinite(this.renderer.height)?this.renderer.height:this.canvas.height;this.camera.setViewport(e,t)}}class ex{constructor(e){this.value=e>>>0}next(){this.value+=1831565813;let e=Math.imul(this.value^this.value>>>15,1|this.value);return e^=e+Math.imul(e^e>>>7,61|e),((e^e>>>14)>>>0)/4294967296}int(e){return e<=0?0:Math.floor(this.next()*e)}}const tx=2166136261,nx=16777619,ix=1/13;function sx(i,e,t){return i<e?e:i>t?t:i}function rx(i){return`${i.x},${i.y}`}function Ch(i,e){return i.y!==e.y?i.y-e.y:i.x-e.x}function Ph(i,e){return e.x>=0&&e.x<i.width&&e.y>=0&&e.y<i.height}function ox(i,e){var n;if(!Ph(i,e))return!1;const t=(n=i.tiles[e.y])==null?void 0:n[e.x];return!t||t.gid===null}function ax(i,e){var s,r;if(!xr(i,e))return!1;const t=(r=(s=i.tiles[e.y])==null?void 0:s[e.x])==null?void 0:r.collision;if(!t)return!1;const n=o=>o==="up"?t.up:o==="down"?t.down:o==="left"?t.left:t.right;return ka.some(o=>{const a=za[o],l={x:e.x+a.dx,y:e.y+a.dy};return ox(i,l)?!n(o):!1})}function xr(i,e){var n;if(!Ph(i,e))return!1;const t=(n=i.tiles[e.y])==null?void 0:n[e.x];return!!(t&&t.gid!==null&&!t.collision.penGate)}function lx(i,e,t,n){return xr(i,t)?!ax(i,t):!1}function Lh(i,e,t,n){if(!xr(i,t))return[];const s=e.getTilesAt(t),r=[];return ka.forEach(o=>{const a=za[o],l={x:t.x+a.dx,y:t.y+a.dy};xr(i,l)&&ei(o,0,0,s,n,"packet")&&r.push(l)}),r}function wc(i,e,t,n){return Lh(i,e,t,n).length>0}function cx(i,e,t,n){if(wc(i,e,t,n))return t;for(let s=0;s<i.height;s+=1)for(let r=0;r<i.width;r+=1){const o={x:r,y:s};if(wc(i,e,o,n))return o}return null}function hx(i,e,t,n){const s=[t],r=new Set,o=[];for(let a=0;a<s.length;a+=1){const l=s[a],c=rx(l);if(r.has(c))continue;r.add(c);const h=Lh(i,e,l,n);h.length&&(o.push(l),h.forEach(d=>{s.push(d)}))}return o.sort(Ch),o}function Ki(i,e){const t=(i^e>>>0)>>>0;return Math.imul(t,nx)>>>0}function ux(i,e){let t=tx;return t=Ki(t,i.width),t=Ki(t,i.height),t=Ki(t,e.x),t=Ki(t,e.y),i.tiles.forEach(n=>{n.forEach(s=>{t=Ki(t,s.rawGid)})}),t>>>0}function dx(i,e,t){if(e<=0||i.length===0)return[];const n=[...i],s=new ex(t);for(let r=n.length-1;r>0;r-=1){const o=s.int(r+1);[n[r],n[o]]=[n[o],n[r]]}return n.slice(0,e).sort(Ch)}function fx(i){const{map:e,collisionGrid:t,startTile:n,tileSize:s,options:r}=i,o=cx(e,t,n,s);if(!o)return{basePoints:[],powerPoints:[],seed:0};const l=hx(e,t,o,s).filter(m=>lx(e,t,m)),c=Math.max(0,(r==null?void 0:r.powerPointRatio)??ix),h=Math.min(l.length,Math.max(0,(r==null?void 0:r.maxPowerPoints)??l.length)),d=Math.min(h,Math.max(0,(r==null?void 0:r.minPowerPoints)??1)),u=Math.round(l.length*c),f=sx(u,d,h),g=((r==null?void 0:r.seed)??ux(e,o))>>>0,M=dx(l,f,g);return{basePoints:l,powerPoints:M,seed:g}}const px=ms[0].size,mx=ms[1].size,gx=96,_x=1.5,Tc=.001,bc=.01;function js(i){return`${i.x},${i.y}`}function vo(i,e){var n;const t=(n=i.properties)==null?void 0:n.find(s=>s.name===e);return typeof(t==null?void 0:t.value)=="number"?t.value:void 0}class xx{constructor(e){this.world=e,this.pointsByTile=new Map,this.eatEffects=[];const t=this.buildMapAuthoredCollectibles();if(t.size>0){t.forEach((n,s)=>{this.pointsByTile.set(s,n)});return}this.buildAlgorithmicCollectibles()}update(e){this.consumePointAtPacketTile(),this.updateEatEffects(e)}getPoints(){return this.pointsByTile.values()}getPointCount(){return this.pointsByTile.size}getEatEffects(){return this.eatEffects}consumePointAtPacketTile(){const e=js(this.world.packet.tile),t=this.pointsByTile.get(e);if(!t||!this.isPacketCenteredOnPoint(t))return;this.pointsByTile.delete(e);const n=t.kind==="power"?ms[1].score:ms[0].score;Th(n),t.kind==="power"&&this.triggerScaredGhostWindow(),this.triggerPacketEatAnimation();const s=t.kind==="power"?mx:px;this.eatEffects.push({x:t.x,y:t.y,elapsedMs:0,durationMs:gx,sizeStart:s,sizeEnd:s*_x})}triggerPacketEatAnimation(){const e=this.world.packetAnimation;e.active=!0,e.frame=0,e.elapsedMs=0,e.sequenceIndex=0}triggerScaredGhostWindow(){Rh(this.world,wh),this.world.ghostEatChainCount=0}isPacketCenteredOnPoint(e){return Math.abs(this.world.packet.moved.x)>Tc||Math.abs(this.world.packet.moved.y)>Tc?!1:Math.abs(this.world.packet.x-e.x)<=bc&&Math.abs(this.world.packet.y-e.y)<=bc}updateEatEffects(e){for(let t=this.eatEffects.length-1;t>=0;t-=1){const n=this.eatEffects[t];n.elapsedMs+=e,n.elapsedMs>=n.durationMs&&this.eatEffects.splice(t,1)}}buildMapAuthoredCollectibles(){const e=new Map;return(this.world.map.collectibleObjects??[]).forEach(n=>{const s=vo(n,"pointType"),r=s===1||n.type==="power-pellet"?"power":s===0||n.type==="pellet"?"base":null;if(!r)return;const o=vo(n,"gridX"),a=vo(n,"gridY"),l=this.resolveCollectibleTile({gridX:o,gridY:a,x:n.x,y:n.y});if(!l)return;const c=js(l),h=this.toPointCenter(l),d=e.get(c);(d==null?void 0:d.kind)!=="power"&&e.set(c,{tile:l,x:h.x,y:h.y,kind:r})}),e}buildAlgorithmicCollectibles(){const e=fx({map:this.world.map,collisionGrid:this.world.collisionGrid,startTile:this.world.packet.tile,tileSize:this.world.tileSize}),t=new Set(e.powerPoints.map(n=>js(n)));e.basePoints.forEach(n=>{const s=js(n),r=this.toPointCenter(n);this.pointsByTile.set(s,{tile:n,x:r.x,y:r.y,kind:t.has(s)?"power":"base"})})}resolveCollectibleTile(e){return typeof e.gridX=="number"&&typeof e.gridY=="number"?{x:e.gridX,y:e.gridY}:typeof e.x=="number"&&typeof e.y=="number"?{x:Math.floor(e.x/this.world.tileSize),y:Math.floor(e.y/this.world.tileSize)}:null}toPointCenter(e){return{x:e.x*this.world.tileSize+this.world.tileSize/2,y:e.y*this.world.tileSize+this.world.tileSize/2}}}class vx{constructor(e,t){this.world=e,this.camera=t,this.runsWhenPaused=!0,this.lastRenderTimestampMs=null,this.smoothedFps=null,this.panelsVisible=null}start(){this.createPanels()}update(){if(!this.world.collisionDebugEnabled){this.world.hoveredDebugTile=null;return}const e=this.world.pointerScreen;if(!e)return;const t=this.camera.screenToWorld(e.x,e.y),n=Math.floor(t.x/this.world.tileSize),s=Math.floor(t.y/this.world.tileSize);if(n<0||s<0||n>=this.world.map.width||s>=this.world.map.height){this.world.hoveredDebugTile=null;return}this.world.hoveredDebugTile={x:n,y:s}}render(){if(!(!this.collisionPanel||!this.runtimePanel)){if(!this.world.collisionDebugEnabled){if(this.panelsVisible===!1)return;this.panelsVisible=!1,this.collisionPanel.style.display="none",this.collisionPanel.textContent="",this.runtimePanel.style.display="none",this.runtimePanel.textContent="",this.world.debugPanelText="",this.lastRenderTimestampMs=null,this.smoothedFps=null;return}this.panelsVisible!==!0&&(this.panelsVisible=!0,this.collisionPanel.style.display="block",this.runtimePanel.style.display="block"),this.world.hoveredDebugTile?this.world.debugPanelText=this.getTileDebugInfo(this.world.hoveredDebugTile):this.world.debugPanelText=`Collision Debug
move mouse over a block to inspect`,this.collisionPanel.textContent=this.world.debugPanelText,this.runtimePanel.textContent=this.getRuntimeDebugText()}}destroy(){var e,t;(e=this.collisionPanel)==null||e.remove(),(t=this.runtimePanel)==null||t.remove(),this.collisionPanel=void 0,this.runtimePanel=void 0,this.lastRenderTimestampMs=null,this.smoothedFps=null,this.panelsVisible=null}createPanels(){this.collisionPanel=this.createCollisionPanel(),this.runtimePanel=this.createRuntimePanel(),document.body.append(this.runtimePanel,this.collisionPanel)}createCollisionPanel(){var n;const e="collision-debug-panel";(n=document.getElementById(e))==null||n.remove();const t=document.createElement("pre");return t.id=e,t.style.position="fixed",t.style.left="8px",t.style.top="52px",t.style.margin="0",t.style.padding="6px 8px",t.style.color="#ffffff",t.style.background="rgba(0, 0, 0, 0.78)",t.style.font="12px/1.35 monospace",t.style.whiteSpace="pre",t.style.pointerEvents="none",t.style.zIndex="9999",t.style.border="1px solid rgba(255, 255, 255, 0.2)",t.style.borderRadius="4px",t.style.display="none",t}createRuntimePanel(){var n;const e="runtime-debug-panel";(n=document.getElementById(e))==null||n.remove();const t=document.createElement("pre");return t.id=e,t.style.position="fixed",t.style.left="8px",t.style.top="8px",t.style.margin="0",t.style.padding="6px 8px",t.style.color="#ffffff",t.style.background="rgba(0, 0, 0, 0.78)",t.style.font="12px/1.35 monospace",t.style.whiteSpace="pre",t.style.pointerEvents="none",t.style.zIndex="9999",t.style.border="1px solid rgba(255, 255, 255, 0.2)",t.style.borderRadius="4px",t.style.display="none",t}getRuntimeDebugText(){const e=this.getTimestampMs();let t=null;if(this.lastRenderTimestampMs!==null){const r=e-this.lastRenderTimestampMs;Number.isFinite(r)&&r>0&&(t=r)}if(this.lastRenderTimestampMs=e,t===null)return["Runtime Diagnostics","fps: --","frame: -- ms"].join(`
`);const n=1e3/t,s=.2;return this.smoothedFps=this.smoothedFps===null?n:this.smoothedFps+(n-this.smoothedFps)*s,["Runtime Diagnostics",`fps: ${this.smoothedFps.toFixed(1)}`,`frame: ${t.toFixed(2)} ms`].join(`
`)}getTimestampMs(){return typeof performance<"u"&&typeof performance.now=="function"?performance.now():Date.now()}getTileDebugInfo(e){var r;const t=(r=this.world.map.tiles[e.y])==null?void 0:r[e.x],n=this.world.collisionGrid.getTileAt(e.x,e.y);if(!t||t.gid===null)return["Collision Debug",`tile: (${e.x}, ${e.y})`,"gid: empty","edges: up:false right:false down:false left:false"].join(`
`);const s=(Math.round(t.rotation/(Math.PI/2))%4+4)%4;return["Collision Debug",`tile: (${e.x}, ${e.y}) gid:${t.gid} local:${t.localId}`,`collides:${n.collides} penGate:${n.penGate} portal:${n.portal}`,`edges: up:${n.up} right:${n.right} down:${n.down} left:${n.left}`,`transform: rot:${s*90}deg flipX:${t.flipX} flipY:${t.flipY}`].join(`
`)}}class Mx{constructor(e,t,n,s,r){this.world=e,this.movementRules=t,this.decisions=n,this.portalService=s,this.rng=r}update(){this.world.ghosts.forEach(e=>{if(!e.state.free||this.world.ghostsExitingJail.has(e))return;const t=this.world.collisionGrid.getTilesAt(e.tile),n=this.movementRules.canMove(e.direction,e.moved.y,e.moved.x,t,"ghost"),s=this.portalService.canAdvanceOutward(e,this.world.collisionGrid);n||s?(e.moved.x===0&&e.moved.y===0&&n&&(e.direction=this.decisions.chooseDirectionAtCenter(e.direction,t,this.world.tileSize,this.rng)),this.movementRules.advanceEntity(e,e.direction,e.speed)):e.moved.x===0&&e.moved.y===0&&(e.direction=this.decisions.chooseDirectionWhenBlocked(e.direction,e.moved.y,e.moved.x,t,this.world.tileSize,this.rng)),this.portalService.tryTeleport(e,this.world.collisionGrid,this.world.tick,this.world.tileSize),this.movementRules.syncEntityPosition(e)})}}function Sx(i,e){if(i.radius<=0||e.radius<=0)return!1;const t=i.x-e.x,n=i.y-e.y,s=i.radius+e.radius;return t*t+n*n<s*s}function yx(i){return i.state.scared?"ghost-hit":"packet-hit"}function Ex(i){const e=i.resolveOutcome??yx;if(i.ghosts.length===0)return null;for(const t of i.ghosts)if(Sx(i.packet,t.body))return{ghost:t.ghost,contact:"body-overlap",outcome:e(t.ghost)};return null}const Ac="right";class wx{constructor(e,t,n=ss.ghost){this.world=e,this.movementRules=t,this.defaultGhostSpeed=n}update(){if(this.resetGhostEatChainIfNoScaredGhosts(),this.isPacketInDeathRecovery())return;const e=this.world.ghosts.filter(n=>n.active&&n.state.free&&!this.world.ghostsExitingJail.has(n)),t=Ex({packet:this.toCollisionBody(this.world.packet),ghosts:this.buildGhostCandidates(e)});if(t&&!(t.outcome==="packet-hit"&&this.isPacketInPortalShieldWindow())){if(t.outcome==="packet-hit"){this.applyPacketHitOutcome();return}this.applyGhostHitOutcome(t.ghost),this.resetGhostEatChainIfNoScaredGhosts()}}destroy(){}applyPacketHitOutcome(){n_(),this.movementRules.setEntityTile(this.world.packet,this.world.packetSpawnTile),this.world.packet.direction.current=Ac,this.world.packet.direction.next=Ac,this.world.packet.portalBlinkRemainingMs=0,this.world.packet.portalBlinkElapsedMs=0,this.world.packet.deathRecoveryRemainingMs=an.durationMs,this.world.packet.deathRecoveryElapsedMs=0,this.world.packet.deathRecoveryNextToggleAtMs=an.blinkStartIntervalMs,this.world.packet.deathRecoveryVisible=!0}applyGhostHitOutcome(e){const t=Math.min(this.world.ghostEatChainCount,Js.length-1);Th(Js[t]??Js[Js.length-1]),this.world.ghostEatChainCount+=1,this.world.ghostsExitingJail.delete(e),Ha(this.world,e),this.movementRules.setEntityTile(e,this.world.ghostJailReturnTile),e.state.free=!1,e.state.soonFree=!0,e.state.dead=!1,e.state.animation="default",e.speed=this.defaultGhostSpeed}isPacketInDeathRecovery(){return(this.world.packet.deathRecoveryRemainingMs??0)>0}isPacketInPortalShieldWindow(){return(this.world.packet.portalBlinkRemainingMs??0)>0}resetGhostEatChainIfNoScaredGhosts(){this.world.ghosts.some(t=>t.state.scared)||(this.world.ghostEatChainCount=0)}buildGhostCandidates(e){return e.map(t=>({ghost:t,body:this.toCollisionBody(t)}))}toCollisionBody(e){return{x:e.x,y:e.y,radius:Math.min(e.displayWidth,e.displayHeight)/2}}}const er=.001;class Tx{constructor(e,t,n,s,r){this.world=e,this.movementRules=t,this.jailService=n,this.scheduler=s,this.rng=r,this.ghostReleaseTimers=new Map,this.releaseProgressByGhost=new Map,this.nextReleaseSide="left"}start(){this.clearReleaseTimers(),this.releaseProgressByGhost.clear(),this.world.ghostsExitingJail.clear(),this.nextReleaseSide="left",this.world.ghosts.forEach((e,t)=>{const n=po+t*_c;this.queueGhostRelease(e,n)})}update(){this.world.ghosts.forEach(e=>{if(!e.active){this.cleanupGhostReleaseState(e);return}if(this.shouldQueueRelease(e)&&this.queueGhostRelease(e),this.world.ghostsExitingJail.has(e)){this.advanceRelease(e);return}e.state.free||(this.jailService.moveGhostInJail(e,this.world.ghostJailBounds,this.movementRules,this.rng,j0),this.movementRules.syncEntityPosition(e))})}destroy(){this.clearReleaseTimers(),this.releaseProgressByGhost.clear(),this.world.ghostsExitingJail.clear()}queueGhostRelease(e,t=po){if(!e.active||e.state.free)return;e.state.soonFree=!0;const n=this.ghostReleaseTimers.get(e);n&&(n.cancel(),this.ghostReleaseTimers.delete(e));const s=Math.max(0,this.world.ghosts.indexOf(e)),r=t===po?this.resolveQueuedReleaseOffsetMs(e):0,o=this.scheduler.delayedCall(t+r,()=>{this.ghostReleaseTimers.delete(e),this.releaseGhost(e,s)});this.ghostReleaseTimers.set(e,o)}releaseGhost(e,t){if(!e.active||e.state.free||!e.state.soonFree)return;const n=this.nextReleaseSide,s=this.resolveReleaseY(),r=this.resolveGateColumn(n,s);this.nextReleaseSide=n==="left"?"right":"left",this.world.ghostsExitingJail.add(e),this.releaseProgressByGhost.set(e,{side:n,phase:"to_side_center",gateColumnX:r,releaseY:s})}advanceRelease(e){const t=this.releaseProgressByGhost.get(e);if(!t){this.cleanupGhostReleaseState(e);return}if(t.phase==="to_side_center"){const s={x:t.side==="left"?this.world.ghostJailBounds.minX:this.world.ghostJailBounds.maxX,y:this.world.ghostJailBounds.y};this.moveGhostTowardTarget(e,s)==="reached"&&(t.phase="to_gate_column");return}if(t.phase==="to_gate_column"){const n={x:t.gateColumnX,y:this.world.ghostJailBounds.y};this.moveGhostTowardTarget(e,n)==="reached"&&(t.phase="cross_gate_once");return}if(t.phase==="cross_gate_once"){const n={x:t.gateColumnX,y:t.releaseY};this.moveGhostTowardTarget(e,n)==="reached"&&this.completeRelease(e,t)}}clearReleaseTimers(){this.ghostReleaseTimers.forEach(e=>{e.cancel()}),this.ghostReleaseTimers.clear()}shouldQueueRelease(e){return!e.state.free&&e.state.soonFree&&!this.world.ghostsExitingJail.has(e)&&!this.ghostReleaseTimers.has(e)}resolveQueuedReleaseOffsetMs(e){let t=0;return this.ghostReleaseTimers.forEach((n,s)=>{s!==e&&(t+=1)}),t*_c}resolveReleaseY(){const e=this.world.ghostJailBounds.y-1;return e<0?0:e>=this.world.map.height?this.world.map.height-1:e}resolveGateColumn(e,t){const n=this.resolveGateScanColumns(e);for(const o of n)if(this.isGateColumnTraversable(o,t))return o;const s=this.world.ghostJailBounds.minX,r=this.world.ghostJailBounds.maxX;return s+Math.floor((r-s)/2)}resolveGateScanColumns(e){const t=this.world.ghostJailBounds.minX,n=this.world.ghostJailBounds.maxX,s=[];if(e==="left"){for(let r=t;r<=n;r+=1)s.push(r);return s}for(let r=n;r>=t;r-=1)s.push(r);return s}isGateColumnTraversable(e,t){const n={x:e,y:this.world.ghostJailBounds.y},s=this.world.collisionGrid.getTilesAt(n);return this.movementRules.canMove("up",0,0,s,"ghostRelease")}moveGhostTowardTarget(e,t){if(this.snapResidualOffsetsAtTargetAxes(e,t)&&this.movementRules.syncEntityPosition(e),this.isAtTargetCenter(e,t))return"reached";const s=this.resolveDirectionTowardTarget(e,t);if(!s)return"reached";e.direction=s,this.movementRules.advanceEntity(e,s,e.speed);const r=this.snapResidualOffsetsAtTargetAxes(e,t);return this.movementRules.syncEntityPosition(e),r&&this.movementRules.syncEntityPosition(e),this.isAtTargetCenter(e,t)?"reached":"moved"}isAtTargetCenter(e,t){return e.tile.x===t.x&&e.tile.y===t.y&&Math.abs(e.moved.x)<=er&&Math.abs(e.moved.y)<=er}snapResidualOffsetsAtTargetAxes(e,t){let n=!1;return e.tile.x===t.x&&Math.abs(e.moved.x)<=e.speed&&Math.abs(e.moved.x)>er&&(e.moved.x=0,n=!0),e.tile.y===t.y&&Math.abs(e.moved.y)<=e.speed&&Math.abs(e.moved.y)>er&&(e.moved.y=0,n=!0),n}resolveDirectionTowardTarget(e,t){const n=this.resolveVerticalDirection(e,t.y);return n||this.resolveHorizontalDirection(e,t.x)}resolveHorizontalDirection(e,t){return e.tile.x<t?"right":e.tile.x>t||e.moved.x>0?"left":e.moved.x<0?"right":null}resolveVerticalDirection(e,t){return e.tile.y<t?"down":e.tile.y>t||e.moved.y>0?"up":e.moved.y<0?"down":null}completeRelease(e,t){this.cleanupGhostReleaseState(e),this.movementRules.setEntityTile(e,{x:t.gateColumnX,y:t.releaseY}),e.direction="up",e.state.free=!0,e.state.soonFree=!1}cleanupGhostReleaseState(e){const t=this.ghostReleaseTimers.get(e);t&&(t.cancel(),this.ghostReleaseTimers.delete(e)),this.releaseProgressByGhost.delete(e),this.world.ghostsExitingJail.delete(e)}}class bx{constructor(e){var a;this.mount=e,(a=this.mount.querySelector("[data-game-hud]"))==null||a.remove(),this.container=document.createElement("div"),this.container.className="pointer-events-none absolute inset-x-0 bottom-0 z-50 flex items-center justify-between gap-4 bg-black/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-100 sm:text-sm",this.container.style.position="fixed",this.container.style.left="0",this.container.style.right="0",this.container.style.bottom="0",this.container.style.zIndex="9998",this.container.style.pointerEvents="none",this.container.style.display="flex",this.container.style.alignItems="center",this.container.style.justifyContent="space-between",this.container.style.gap="1rem",this.container.style.padding="10px 16px",this.container.style.background="rgba(0, 0, 0, 0.9)",this.container.style.borderTop="1px solid rgba(255, 255, 255, 0.18)",this.container.style.color="#f4f4f5",this.container.style.fontSize="14px",this.container.style.fontWeight="600",this.container.style.letterSpacing="0.12em",this.container.style.textTransform="uppercase",this.container.style.fontFamily='"Orbitron", ui-sans-serif, system-ui, sans-serif',this.container.setAttribute("data-game-hud","true");const t=document.createElement("div");t.className="flex min-w-0 items-center gap-2",t.style.display="flex",t.style.alignItems="center",t.style.gap="0.5rem",t.setAttribute("data-hud-score","true");const n=document.createElement("span");n.className="text-zinc-400",n.style.color="#a1a1aa",n.textContent="Score",this.scoreText=document.createElement("span"),this.scoreText.className="tabular-nums text-zinc-100",this.scoreText.style.color="#f4f4f5",this.scoreText.style.fontVariantNumeric="tabular-nums",this.scoreText.setAttribute("data-hud-score-value","true"),t.append(n,this.scoreText);const s=document.createElement("div");s.className="flex items-center justify-end gap-2",s.style.display="flex",s.style.alignItems="center",s.style.justifyContent="flex-end",s.style.gap="0.5rem",s.setAttribute("data-hud-lives","true");const r=document.createElement("span");r.className="text-zinc-400",r.style.color="#a1a1aa",r.textContent="Lives",this.livesCountText=document.createElement("span"),this.livesCountText.className="tabular-nums text-zinc-300",this.livesCountText.style.color="#d4d4d8",this.livesCountText.style.fontVariantNumeric="tabular-nums",this.livesCountText.setAttribute("data-hud-lives-value","true"),s.append(r,this.livesCountText),this.container.append(t,s);const o=i_();this.setScore(o.score),this.setLives(o.lives),this.onScoreChanged=l=>{this.setScore(l)},this.onLivesChanged=l=>{this.setLives(l)},kn.on(Bn.ScoreChanged,this.onScoreChanged),kn.on(Bn.LivesChanged,this.onLivesChanged),this.mount.appendChild(this.container)}destroy(){kn.off(Bn.ScoreChanged,this.onScoreChanged),kn.off(Bn.LivesChanged,this.onLivesChanged),this.container.remove()}setScore(e){this.scoreText.textContent=String(e)}setLives(e){const t=Math.max(0,Math.floor(e));this.livesCountText.textContent=String(t)}}class Ax{constructor(e){this.mount=e}start(){this.hud=new bx(this.mount)}update(){}render(){}destroy(){var e;(e=this.hud)==null||e.destroy(),this.hud=void 0}}const Rx=[{codes:["ArrowLeft","KeyA"],direction:"left"},{codes:["ArrowRight","KeyD"],direction:"right"},{codes:["ArrowUp","KeyW"],direction:"up"},{codes:["ArrowDown","KeyS"],direction:"down"}],Cx=new Set(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"]),Px=new Set([" ","Spacebar"]);class Lx{constructor(e,t,n){this.input=e,this.world=t,this.pauseController=n,this.disposers=[],this.activeTouchGesture=null}start(){this.disposers.push(this.input.onKeyDown(e=>this.handleKeyDown(e))),this.disposers.push(this.input.onPointerMove(e=>this.handlePointerMove(e))),this.disposers.push(this.input.onPointerDown(e=>this.handlePointerDown(e))),this.disposers.push(this.input.onPointerUp(e=>this.handlePointerUp(e))),this.disposers.push(this.input.onPointerCancel(e=>this.handlePointerCancel(e)))}update(){const e=this.getDirectionalKeyboardIntent();e&&(this.world.packet.direction.next=e)}destroy(){this.disposers.forEach(e=>{e()}),this.disposers=[],this.activeTouchGesture=null}handleKeyDown(e){if(!e.repeat){if(this.isPauseToggleEvent(e)){e.preventDefault(),this.pauseController.togglePause();return}if(e.code==="KeyH"){this.world.ghosts.some(n=>n.active&&!n.state.scared)?(Rh(this.world,wh),this.world.ghostEatChainCount=0):K_(this.world);return}if(e.code==="KeyC"){if(e.altKey){e.preventDefault(),this.world.collisionDebugEnabled=!this.world.collisionDebugEnabled,this.world.collisionDebugEnabled||(this.world.hoveredDebugTile=null,this.world.debugPanelText="");return}if(e.shiftKey){e.preventDefault(),this.copyDebugPanelText();return}return}Cx.has(e.code)&&e.preventDefault()}}isPauseToggleEvent(e){return e.code==="Space"||Px.has(e.key)}handlePointerMove(e){this.world.pointerScreen={x:e.x,y:e.y};const t=this.getActiveGesture(e.pointerId);if(!t||t.hasCommittedSwipe||this.hasDirectionalKeyboardInput())return;const n=this.resolveSwipeDirection(t,e);n&&(this.world.packet.direction.next=n,t.hasCommittedSwipe=!0)}handlePointerDown(e){if(this.world.pointerScreen={x:e.x,y:e.y},!this.isTouchLikePointer(e)){this.pauseController.togglePause();return}if(!this.world.isMoving){this.pauseController.togglePause(),this.activeTouchGesture=null;return}this.activeTouchGesture={pointerId:e.pointerId,startX:e.x,startY:e.y,hasCommittedSwipe:!1}}handlePointerUp(e){const t=this.getActiveGesture(e.pointerId);t&&(this.isTapGesture(t,e)&&this.pauseController.togglePause(),this.activeTouchGesture=null)}handlePointerCancel(e){var t;((t=this.activeTouchGesture)==null?void 0:t.pointerId)===e.pointerId&&(this.activeTouchGesture=null)}getActiveGesture(e){return!this.activeTouchGesture||this.activeTouchGesture.pointerId!==e?null:this.activeTouchGesture}isTapGesture(e,t){if(e.hasCommittedSwipe)return!1;const{absX:n,absY:s}=this.getGestureMagnitude(e,t);return Math.max(n,s)<=Q0}resolveSwipeDirection(e,t){const{dx:n,dy:s,absX:r,absY:o}=this.getGestureMagnitude(e,t),a=Math.max(r,o);if(a<Z0)return null;const l=Math.min(r,o);return l>0&&a/l<$0?null:r>=o?n>=0?"right":"left":s>=0?"down":"up"}getGestureMagnitude(e,t){const n=t.x-e.startX,s=t.y-e.startY;return{dx:n,dy:s,absX:Math.abs(n),absY:Math.abs(s)}}hasDirectionalKeyboardInput(){return this.getDirectionalKeyboardIntent()!==null}getDirectionalKeyboardIntent(){for(const e of Rx)if(e.codes.some(t=>this.input.isKeyDown(t)))return e.direction;return null}isTouchLikePointer(e){var t;return e.pointerType==="touch"?!0:!e.isPrimary||typeof window>"u"?!1:!!((t=window.matchMedia)!=null&&t.call(window,J0).matches)}async copyDebugPanelText(){const e=this.world.debugPanelText;if(!e)return;await this.copyTextToClipboard(e)||(this.world.debugPanelText=`${e}
copy failed (browser blocked clipboard access)`)}async copyTextToClipboard(e){var t;try{if((t=navigator.clipboard)!=null&&t.writeText)return await navigator.clipboard.writeText(e),!0}catch{}try{const n=document.createElement("textarea");n.value=e,n.setAttribute("readonly","true"),n.style.position="fixed",n.style.left="-9999px",document.body.appendChild(n),n.focus(),n.select();const s=document.execCommand("copy");return n.remove(),s}catch{return!1}}}class Ix{constructor(e,t,n){this.world=e,this.movementRules=t,this.portalService=n}update(e=0){this.updatePortalBlink(e),this.updateDeathRecovery(e),this.updateDirectionVisuals();const t=this.world.collisionGrid.getTilesAt(this.world.packet.tile);this.movementRules.applyBufferedDirection(this.world.packet,t),this.applyPortalTurnOverride(t);const n=this.movementRules.canMove(this.world.packet.direction.current,this.world.packet.moved.y,this.world.packet.moved.x,t),s=this.portalService.canAdvanceOutward(this.world.packet,this.world.collisionGrid);(n||s)&&this.movementRules.advanceEntity(this.world.packet,this.world.packet.direction.current,ss.packet),this.portalService.tryTeleport(this.world.packet,this.world.collisionGrid,this.world.tick,this.world.tileSize)&&(this.world.packet.portalBlinkRemainingMs=Eh.durationMs,this.world.packet.portalBlinkElapsedMs=0),this.movementRules.syncEntityPosition(this.world.packet)}updatePortalBlink(e){const t=this.world.packet.portalBlinkRemainingMs??0;if(t<=0){this.world.packet.portalBlinkRemainingMs=0,this.world.packet.portalBlinkElapsedMs=0;return}const n=Number.isFinite(e)&&e>0?e:0,s=Math.max(0,t-n);if(this.world.packet.portalBlinkRemainingMs=s,s<=0){this.world.packet.portalBlinkElapsedMs=0;return}const r=this.world.packet.portalBlinkElapsedMs??0;this.world.packet.portalBlinkElapsedMs=r+n}updateDeathRecovery(e){const t=this.world.packet.deathRecoveryRemainingMs??0;if(t<=0){this.world.packet.deathRecoveryRemainingMs=0,this.world.packet.deathRecoveryElapsedMs=0,this.world.packet.deathRecoveryNextToggleAtMs=0,this.world.packet.deathRecoveryVisible=!0;return}const n=Number.isFinite(e)&&e>0?e:0,s=this.world.packet.deathRecoveryElapsedMs??0,r=Math.min(an.durationMs,s+n),o=Math.max(0,t-n);if(this.world.packet.deathRecoveryElapsedMs=r,this.world.packet.deathRecoveryRemainingMs=o,o<=0){this.world.packet.deathRecoveryElapsedMs=0,this.world.packet.deathRecoveryNextToggleAtMs=0,this.world.packet.deathRecoveryVisible=!0;return}let a=this.world.packet.deathRecoveryNextToggleAtMs;for((!Number.isFinite(a)||a<=0)&&(a=rs(s,an.durationMs,an));a>0&&r>=a;)this.world.packet.deathRecoveryVisible=!this.world.packet.deathRecoveryVisible,a=rs(a,an.durationMs,an);this.world.packet.deathRecoveryNextToggleAtMs=a}updateDirectionVisuals(){if(this.world.packet.direction.current==="right"){this.world.packet.angle=0,this.world.packet.flipY=!1;return}if(this.world.packet.direction.current==="left"){this.world.packet.angle=180,this.world.packet.flipY=!0;return}if(this.world.packet.direction.current==="up"){this.world.packet.angle=-90;return}this.world.packet.direction.current==="down"&&(this.world.packet.angle=90)}applyPortalTurnOverride(e){if(this.world.packet.moved.x!==0||this.world.packet.moved.y!==0)return;const t=this.world.packet.direction.current,n=this.world.packet.direction.next;if(n===t||this.movementRules.canMove(n,this.world.packet.moved.y,this.world.packet.moved.x,e))return;this.portalService.canAdvanceOutward({tile:this.world.packet.tile,moved:this.world.packet.moved,direction:n},this.world.collisionGrid)&&(this.world.packet.direction.current=n)}}const Dx="opacity-100",Rc=["grayscale","sepia","saturate-50","brightness-90","contrast-100"],Nx="grayscale(0.72) sepia(0.22) saturate(0.55) brightness(0.86) contrast(0.96)";class Ux{constructor(e,t){this.world=e,this.mount=t,this.runsWhenPaused=!0,this.overlay=null,this.pausedStateApplied=!1}start(){this.mount.style.transition="filter 200ms ease-out",this.createOverlay(),this.applyPausePresentation()}update(){this.applyPausePresentation()}destroy(){var e;this.mount.classList.remove(...Rc),this.mount.style.filter="",(e=this.overlay)==null||e.remove(),this.overlay=null,this.pausedStateApplied=!1}createOverlay(){var s;(s=this.mount.querySelector("[data-pause-overlay]"))==null||s.remove();const e=document.createElement("div");e.className="pointer-events-none absolute inset-0 z-40 flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-black/25 to-black/50 opacity-0 transition-opacity duration-200 ease-out",e.style.position="absolute",e.style.inset="0",e.style.zIndex="60",e.style.display="flex",e.style.alignItems="center",e.style.justifyContent="center",e.style.flexDirection="column",e.style.gap="0.75rem",e.style.background="linear-gradient(to bottom, rgba(8, 8, 8, 0.18), rgba(8, 8, 8, 0.34)), repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.025), rgba(255, 255, 255, 0.025) 1px, rgba(0, 0, 0, 0) 1px, rgba(0, 0, 0, 0) 3px)",e.style.opacity="0",e.style.visibility="hidden",e.style.transition="opacity 200ms ease-out",e.style.pointerEvents="none",e.style.userSelect="none",e.style.webkitUserSelect="none",e.setAttribute("data-pause-overlay","true"),e.setAttribute("aria-hidden","true");const t=document.createElement("p");t.className="m-0 rounded-xl border border-zinc-400/50 bg-black/70 px-5 py-3 text-center text-[clamp(2.2rem,8vw,4.8rem)] font-semibold tracking-[0.34em] text-zinc-100 shadow-[0_0_20px_rgba(0,0,0,0.6)] [text-indent:0.34em] max-sm:px-4 max-sm:text-[clamp(2rem,14vw,4rem)] max-sm:tracking-[0.24em] max-sm:[text-indent:0.24em]",t.style.margin="0",t.style.padding="0.7rem 1.2rem",t.style.border="1px solid rgba(220, 220, 220, 0.55)",t.style.borderRadius="0.75rem",t.style.background="rgba(0, 0, 0, 0.55)",t.style.color="#f5f5f4",t.style.fontFamily='"Orbitron", ui-sans-serif, system-ui, sans-serif',t.style.fontWeight="900",t.style.fontSize="clamp(2.6rem, 10vw, 6rem)",t.style.letterSpacing="0.34em",t.style.textIndent="0.34em",t.style.textAlign="center",t.style.textShadow="0 0 18px rgba(0, 0, 0, 0.7)",t.style.pointerEvents="none",t.style.userSelect="none",t.style.webkitUserSelect="none",t.textContent="PAUSED";const n=document.createElement("p");n.className="m-0 rounded-md bg-black/60 px-3 py-1 text-center text-[clamp(0.72rem,2.4vw,1rem)] uppercase tracking-[0.13em] text-zinc-300 max-sm:w-[90vw] max-sm:max-w-[24rem] max-sm:text-[0.7rem] max-sm:tracking-[0.1em] max-sm:leading-[1.35]",n.style.margin="0",n.style.padding="0.28rem 0.6rem",n.style.borderRadius="0.375rem",n.style.background="rgba(0, 0, 0, 0.42)",n.style.color="#e4e4e7",n.style.fontFamily='"Orbitron", ui-sans-serif, system-ui, sans-serif',n.style.fontSize="clamp(0.78rem, 2.4vw, 1.05rem)",n.style.letterSpacing="0.12em",n.style.textAlign="center",n.style.textTransform="uppercase",n.style.pointerEvents="none",n.style.userSelect="none",n.style.webkitUserSelect="none",n.textContent="Tap or press Space to resume",e.append(t,n),this.mount.appendChild(e),this.overlay=e}applyPausePresentation(){var t,n;const e=!this.world.isMoving;e!==this.pausedStateApplied&&(this.pausedStateApplied=e,Rc.forEach(s=>{this.mount.classList.toggle(s,e)}),this.mount.style.filter=e?Nx:"",(t=this.overlay)==null||t.classList.toggle(Dx,e),this.overlay&&(this.overlay.style.opacity=e?"1":"0",this.overlay.style.visibility=e?"visible":"hidden"),(n=this.overlay)==null||n.setAttribute("aria-hidden",e?"false":"true"))}}const Fx={inky:4578795,clyde:16753476,pinky:16748989,blinky:16403296,scared:4611557};class Ox{constructor(){this.pelletGeometry=new ps(1,12,8),this.pelletMaterial=new vn({color:14075558,roughness:.9}),this.powerPelletMaterial=new vn({color:14866365,roughness:.9}),this.packetGeometries=[0,Math.PI/12,Math.PI/6,Math.PI/4].map(Bx),this.packetMaterial=new vn({color:16766761,emissive:16766761,emissiveIntensity:.25,roughness:.3,metalness:.04}),this.ghostGeometries=[Cc(0),Cc(Math.PI)],this.ghostMaterials=Object.fromEntries(Object.entries(Fx).map(([e,t])=>[e,new vn({color:t,emissive:t,emissiveIntensity:.2,roughness:.38,metalness:.02})])),this.eyeGeometry=new ps(1,16,12),this.eyeMaterial=new vn({color:16777215,roughness:.25}),this.pupilMaterial=new vn({color:1057601,roughness:.3}),this.scaredPupilMaterial=new vn({color:16767158,roughness:.4}),this.shadowGeometry=new ii(1,1).rotateX(-Math.PI/2),this.shadowTexture=kx(),this.shadowMaterial=new Ui({map:this.shadowTexture,transparent:!0,opacity:.5,depthWrite:!1,toneMapped:!1}),this.packetBodies=new WeakMap,this.ghostParts=new WeakMap,this.disposed=!1}createPacket(){const e=new Qt;e.name="packet";const t=new gt(this.packetGeometries[0],this.packetMaterial);t.name="body",t.position.y=Jn.packet/2,e.add(t),this.packetBodies.set(e,t);for(const n of[-1,1]){const s=new gt(this.eyeGeometry,this.pupilMaterial);s.name=`eye-${n}`,s.scale.set(.4,.18,.55),s.position.set(.8,9.7,n*1.6),e.add(s)}return e}setPacketFrame(e,t){const n=this.packetBodies.get(e);n&&(n.geometry=this.packetGeometries[Math.max(0,Math.min(3,Math.trunc(t)))])}createGhost(e){const t=new Qt;t.name=e;const n=new gt(this.ghostGeometries[0],this.ghostMaterials[e]);n.name="body",t.add(n);const s=[];for(const r of[-1,1]){const o=new Qt;o.name=`eye-${r}`,o.position.set(r*1.8,7.85,3.4),o.rotation.x=-Math.PI/4;const a=new gt(this.eyeGeometry,this.eyeMaterial);a.scale.set(1.3,1.45,.8);const l=new gt(this.eyeGeometry,this.pupilMaterial);l.name=`pupil-${r}`,l.scale.set(.56,.65,.25),l.position.z=.76,o.add(a,l),t.add(o),s.push(l)}return this.ghostParts.set(t,{body:n,pupils:s}),this.setGhostAppearance(t,e,0,"right"),t}setGhostAppearance(e,t,n,s){const r=this.ghostParts.get(e);if(r){r.body.geometry=this.ghostGeometries[Math.trunc(n)%2],r.body.material=this.ghostMaterials[t];for(const o of r.pupils)o.material=t==="scared"?this.scaredPupilMaterial:this.pupilMaterial,o.position.x=s==="left"?-.3:s==="right"?.3:0,o.position.y=s==="up"?.3:s==="down"?-.3:0}}createContactShadow(e){const t=new gt(this.shadowGeometry,this.shadowMaterial);return t.name="contact-shadow",t.scale.set(e,1,e),t.position.y=.035,t}dispose(){if(!this.disposed){this.disposed=!0;for(const e of[this.pelletGeometry,...this.packetGeometries,...this.ghostGeometries,this.eyeGeometry,this.shadowGeometry])e.dispose();for(const e of[this.pelletMaterial,this.powerPelletMaterial,this.packetMaterial,...Object.values(this.ghostMaterials),this.eyeMaterial,this.pupilMaterial,this.scaredPupilMaterial,this.shadowMaterial])e.dispose();this.shadowTexture.dispose()}}}function Bx(i){const e=Jn.packet/2,t=new ps(e,40,24,Math.PI+i,2*Math.PI-2*i);if(i===0)return t;const n=t.toNonIndexed();t.dispose();const s=Array.from(n.getAttribute("position").array),r=Array.from(n.getAttribute("normal").array);for(const o of[-1,1]){const a=[Math.sin(i),0,-o*Math.cos(i)];for(let l=0;l<24;l+=1){const c=u=>{const f=u/24*Math.PI;return[e*Math.sin(f)*Math.cos(i),e*Math.cos(f),o*e*Math.sin(f)*Math.sin(i)]},h=c(l),d=c(l+1);s.push(0,0,0,...o===1?h:d,...o===1?d:h),r.push(...a,...a,...a)}}return n.setAttribute("position",new dt(s,3)),n.setAttribute("normal",new dt(r,3)),n.deleteAttribute("uv"),n}function Cc(i){const e=Jn.ghost/2,t=48,n=[],s=[],r=12;for(let l=0;l<r;l+=1){const c=Math.max(0,l-1)/(r-2)*(Math.PI/2),h=e*Math.cos(c);for(let d=0;d<=t;d+=1){const u=d/t*2*Math.PI,f=l===0?.45+.45*Math.cos(8*u+i):4.3+e*Math.sin(c);if(n.push(h*Math.cos(u),f,h*Math.sin(u)),l<r-1&&d<t){const g=l*(t+1)+d,M=g+1,m=g+t+1;s.push(g,m,M,M,m,m+1)}}}const o=n.length/3;n.push(0,.45,0);for(let l=0;l<t;l+=1)s.push(o,l,l+1);const a=new wt;return a.setAttribute("position",new dt(n,3)),a.setIndex(s),a.computeVertexNormals(),a}function kx(){const e=new Uint8Array(4096);for(let n=0;n<32;n+=1)for(let s=0;s<32;s+=1){const r=((s+.5-16)/16)**2+((n+.5-16)/16)**2;e[(n*32+s)*4+3]=Math.round(255*Math.exp(-3*r)*Math.max(0,1-r))}const t=new La(e,32,32);return t.magFilter=Et,t.minFilter=Et,t.needsUpdate=!0,t}class zx{constructor(e){this.world=e,this.group=new Qt,this.edges=new wt,this.markers=new wt,this.linesMaterial=new th({vertexColors:!0,depthTest:!1,depthWrite:!1}),this.fillGeometry=new ii(1,1),this.fillMaterial=new Ui({color:"#ff3355",transparent:!0,opacity:.06,depthTest:!1,depthWrite:!1}),this.group.name="collision-debug",this.group.visible=!1;const t=[],n=[],s=[],r=e.tileSize;for(let h=0;h<e.map.height;h+=1)for(let d=0;d<e.map.width;d+=1){const u=e.collisionGrid.getTileAt(d,h),f=new Ve(u.penGate?"#00ffff":"#ff3355"),g=(M,m,p,w)=>{t.push(M*r,.1,m*r,p*r,.1,w*r),n.push(f.r,f.g,f.b,f.r,f.g,f.b)};u.up&&g(d,h,d+1,h),u.down&&g(d,h+1,d+1,h+1),u.left&&g(d,h,d,h+1),u.right&&g(d+1,h,d+1,h+1),u.up&&u.down&&u.left&&u.right&&s.push({x:d,y:h})}this.edges.setAttribute("position",new Nt(new Float32Array(t),3)),this.edges.setAttribute("color",new Nt(new Float32Array(n),3));const o=new Il(this.edges,this.linesMaterial);o.renderOrder=101,this.group.add(o),this.fillGeometry.rotateX(-Math.PI/2),this.fills=new pr(this.fillGeometry,this.fillMaterial,s.length),this.fills.renderOrder=100;const a=new tt;s.forEach((h,d)=>{a.makeScale(r,1,r),a.setPosition((h.x+.5)*r,.05,(h.y+.5)*r),this.fills.setMatrixAt(d,a)}),this.fills.computeBoundingSphere(),this.group.add(this.fills);const l=(e.ghosts.length+2)*24;this.markers.setAttribute("position",new Nt(new Float32Array(l),3)),this.markers.setAttribute("color",new Nt(new Float32Array(l),3));const c=new Il(this.markers,this.linesMaterial);c.name="debug-markers",c.frustumCulled=!1,c.renderOrder=102,this.group.add(c)}sync(){if(this.group.visible=this.world.collisionDebugEnabled,!this.group.visible)return;const e=this.markers.getAttribute("position"),t=this.markers.getAttribute("color");let n=0;const s=(r,o)=>{const a=new Ve(o),l=r.x*this.world.tileSize+1,c=r.y*this.world.tileSize+1,h=l+this.world.tileSize-2,d=c+this.world.tileSize-2;for(const[u,f]of[[l,c],[h,c],[h,c],[h,d],[h,d],[l,d],[l,d],[l,c]])e.setXYZ(n,u,.12,f),t.setXYZ(n,a.r,a.g,a.b),n+=1};s(this.world.packet.tile,"#ffdd00"),this.world.ghosts.forEach(r=>s(r.tile,"#00ff66")),this.world.hoveredDebugTile&&s(this.world.hoveredDebugTile,"#33ccff"),e.needsUpdate=!0,t.needsUpdate=!0,this.markers.setDrawRange(0,n)}dispose(){this.edges.dispose(),this.markers.dispose(),this.linesMaterial.dispose(),this.fillGeometry.dispose(),this.fillMaterial.dispose(),this.fills.dispose(),this.group.clear()}}const vr=12,Ji="................",Ct="################",Mo="##..............",Zi="..............##",Un="##............##",Ht=(i,e)=>Array.from({length:e},()=>i),Gx={0:Ht(Mo,16),1:Ht(Un,16),2:[Ct,Ct,...Ht(Mo,14)],5:[Ct,Ct,...Ht(Ji,12),"#...............",Mo],6:[Ct,Ct,...Ht(Ji,12),"#...............","##.............#"],7:[Un,"#.............##",...Ht(Zi,12),"#.............##",Un],10:[Un,"#.............##",...Ht(Zi,12),Ct,Ct],14:[Un,"#..............#",...Ht(Ji,12),"#..............#",Un],15:[...Ht(Ji,14),"...............#",Zi],16:[Ct,Ct,...Ht(Un,4),Ct,Ct,Ct,Ct,...Ht(Un,4),Ct,Ct],23:[Zi,"...............#",...Ht(Ji,12),"...............#",Zi]};function Hx(i){return Ih(i,e=>e.localId===null||e.localId<16||e.localId>21)}function Vx(i){return Ih(i,e=>e.localId===16)}function Ih(i,e){var r,o;const t=i.width*i.tileWidth,n=i.height*i.tileHeight,s=new Uint8Array(t*n);for(const a of i.tiles)for(const l of a){if(l.gid===null||!e(l))continue;const c=l.localId===null?void 0:Gx[l.localId];if(!c)continue;const h=((r=c[0])==null?void 0:r.length)??0,d=c.length,u=Math.round(Math.cos(l.rotation)),f=Math.round(Math.sin(l.rotation));for(let g=0;g<i.tileHeight;g+=1)for(let M=0;M<i.tileWidth;M+=1){const m=(M+.5)/i.tileWidth-.5,p=(g+.5)/i.tileHeight-.5,w=Math.floor(((m*u+p*f)*(l.flipX?-1:1)+.5)*h),A=Math.floor(((-m*f+p*u)*(l.flipY?-1:1)+.5)*d);((o=c[A])==null?void 0:o[w])==="#"&&(s[(l.y*i.tileHeight+g)*t+l.x*i.tileWidth+M]=1)}}return{width:t,height:n,solid:s}}function Dh(i){const e=[],t=new Map,n=a=>a.y*(i.width+1)+a.x,s=(a,l)=>a>=0&&l>=0&&a<i.width&&l<i.height&&!!i.solid[l*i.width+a],r=(a,l,c,h,d)=>{const u={start:{x:a,y:l},end:{x:c,y:h},direction:d,visited:!1};e.push(u);const f=n(u.start),g=t.get(f)??[];g.push(u),t.set(f,g)};for(let a=0;a<i.height;a+=1)for(let l=0;l<i.width;l+=1)s(l,a)&&(s(l,a-1)||r(l,a,l+1,a,0),s(l+1,a)||r(l+1,a,l+1,a+1,1),s(l,a+1)||r(l+1,a+1,l,a+1,2),s(l-1,a)||r(l,a+1,l,a,3));const o=[];for(const a of e){if(a.visited)continue;const l=[];let c=a;do{if(c.visited=!0,l.push(c.start),n(c.end)===n(a.start))break;const h=t.get(n(c.end))??[],d=[1,0,3,2].map(u=>h.find(f=>!f.visited&&f.direction===(c.direction+u)%4)).find(u=>u!==void 0);if(!d)throw new Error("Wall footprint contains an open boundary");c=d}while(!c.visited);o.push(l.filter((h,d)=>{const u=l[(d+l.length-1)%l.length],f=l[(d+1)%l.length];return(h.x-u.x)*(f.y-h.y)!==(h.y-u.y)*(f.x-h.x)}))}return o}function lr(i){return i.reduce((e,t,n)=>{const s=i[(n+1)%i.length];return e+t.x*s.y-s.x*t.y},0)/2}function Wx(i,e){let t=!1;for(let n=0,s=i.length-1;n<i.length;s=n,n+=1){const r=i[n],o=i[s];r.y>e.y!=o.y>e.y&&e.x<(o.x-r.x)*(e.y-r.y)/(o.y-r.y)+r.x&&(t=!t)}return t}function Pc(i,e){e.forEach((t,n)=>{n===0?i.moveTo(t.x,-t.y):i.lineTo(t.x,-t.y)}),i.closePath()}function Lc(i,e,t=!0){const n=[],s=new Set,r=(o,a)=>{if(!e)return!1;const l=Math.floor(o),c=Math.floor(a);return l>=0&&l<e.width&&c>=0&&c<e.height&&!!e.solid[c*e.width+l]};for(const o of Dh(i))if(!(!t&&lr(o)>0)){for(const a of[.08,vr+.01])o.forEach((l,c)=>{const h=o[(c+1)%o.length],d=Math.abs(h.x-l.x)+Math.abs(h.y-l.y),u=(h.x-l.x)/d,f=(h.y-l.y)/d;let g=0;for(let M=0;M<=d;M+=1)(M<d&&r(l.x+u*(M+.5)+f*.5,l.y+f*(M+.5)-u*.5)||M===d)&&(M>g&&n.push(l.x+u*g,a,l.y+f*g,l.x+u*M,a,l.y+f*M),g=M+1)});for(let a=0;a<o.length;a+=1){const l=o[a],c=o[(a+o.length-1)%o.length],h=o[(a+1)%o.length];if(Math.hypot(l.x-c.x,l.y-c.y)<=1&&Math.hypot(h.x-l.x,h.y-l.y)<=1||[-.5,.5].some(u=>[-.5,.5].some(f=>r(l.x+u,l.y+f))))continue;const d=`${l.x}:${l.y}`;s.has(d)||(s.add(d),n.push(l.x,.08,l.y,l.x,vr+.01,l.y))}}return new wt().setAttribute("position",new dt(n,3))}function Ic(i){const e=Dh(i),t=e.filter(s=>lr(s)>0).map(s=>{const r=new Ua;return Pc(r,s),{contour:s,area:lr(s),shape:r}});for(const s of e.filter(r=>lr(r)<0)){const[r,o]=s,a=Math.hypot(o.x-r.x,o.y-r.y),l={x:(r.x+o.x)/2+(o.y-r.y)/a*.25,y:(r.y+o.y)/2-(o.x-r.x)/a*.25},c=t.filter(h=>Wx(h.contour,l)).sort((h,d)=>h.area-d.area)[0];if(c){const h=new _r;Pc(h,s),c.shape.holes.push(h)}}const n=new yr(t.map(({shape:s})=>s),{depth:vr,steps:1,bevelEnabled:!1});return n.rotateX(-Math.PI/2),n.clearGroups(),n}const Xx={P:{outline:[[0,0],[0,10],[6.5,10],[8,8.5],[8,5.5],[6.5,4],[2,4],[2,0]],holes:[[[2,6],[6,6],[6,8],[2,8]]]},A:{outline:[[0,0],[0,8.5],[1.5,10],[6.5,10],[8,8.5],[8,0],[6,0],[6,3.5],[2,3.5],[2,0]],holes:[[[2,5.5],[6,5.5],[6,8],[2,8]]]},C:{outline:[[8,1.5],[6.5,0],[1.5,0],[0,1.5],[0,8.5],[1.5,10],[6.5,10],[8,8.5],[8,7],[6,7],[6,8],[2,8],[2,2],[6,2],[6,3],[8,3]]},K:{outline:[[0,0],[0,10],[2,10],[2,6],[6,10],[8,10],[4.5,5.5],[8,0],[5.5,0],[3,4],[2,3],[2,0]]},E:{outline:[[0,0],[0,10],[8,10],[8,8],[2,8],[2,6],[7,6],[7,4],[2,4],[2,2],[8,2],[8,0]]},T:{outline:[[3,0],[3,8],[0,8],[0,10],[8,10],[8,8],[5,8],[5,0]]},L:{outline:[[0,0],[0,10],[2,10],[2,2],[8,2],[8,0]]},O:{outline:[[1.5,0],[0,1.5],[0,8.5],[1.5,10],[6.5,10],[8,8.5],[8,1.5],[6.5,0]],holes:[[[2,2],[6,2],[6,8],[2,8]]]},S:{outline:[[0,1.5],[1.5,0],[6.5,0],[8,1.5],[8,4],[6.5,5.5],[2,5.5],[2,8],[6,8],[6,7],[8,7],[8,8.5],[6.5,10],[1.5,10],[0,8.5],[0,6],[1.5,4.5],[6,4.5],[6,2],[2,2],[2,3],[0,3]]}},Nh=["P","A","C","K","E","T","L","O","S","S"],Yx=Nh.length*10-2;function qx(i,e){const t=i/Yx,n=e/10,s=Nh.map((o,a)=>{const l=Xx[o],c=(d,u)=>{u.forEach(([f,g],M)=>{const m=(f+a*10)*t-i/2,p=g*n-e/2;M===0?d.moveTo(m,p):d.lineTo(m,p)}),d.closePath()},h=new Ua;c(h,l.outline);for(const d of l.holes??[]){const u=new _r;c(u,d),h.holes.push(u)}return h}),r=new yr(s,{depth:vr,steps:1,bevelEnabled:!1});return r.rotateX(-Math.PI/2),r.clearGroups(),r}class Kx{constructor(e){this.group=new Qt,this.resources=new Set,this.group.name="maze";const{map:t}=e,n=this.own(new ii(t.tileWidth,t.tileHeight));n.rotateX(-Math.PI/2);const s=this.own(new vn({color:"#050912",roughness:.86})),r=t.tiles.flat().filter(g=>g.gid!==null),o=this.own(new pr(n,s,r.length));o.name="floor";const a=new tt;r.forEach((g,M)=>{o.setMatrixAt(M,a.makeTranslation((g.x+.5)*t.tileWidth,-.04,(g.y+.5)*t.tileHeight))}),o.computeBoundingSphere(),this.group.add(o);const l=r.some(g=>g.localId===16)?Vx(t):void 0,c=Hx(t),h=this.own(Ic(c)),d=this.createWallMaterial("#1e0d20"),u=new gt(h,d);u.name="walls",this.group.add(u);const f=this.createOutlineStrips(Lc(c,l),new Ve("#b579a1"));f.name="wall-edges",this.group.add(f),l&&this.addPen(l),this.addSigns(e,r)}dispose(){this.resources.forEach(e=>e.dispose()),this.resources.clear(),this.group.clear()}own(e){return this.resources.add(e),e}createWallMaterial(e){return this.own(new vn({color:e,roughness:.3,metalness:.12}))}createOutlineStrips(e,t){const n=e.getAttribute("position"),s=this.own(new Fi(1,1,1)),r=this.own(new Ui({color:t,toneMapped:!1})),o=this.own(new pr(s,r,n.count/2)),a=new vt,l=new D,c=new D,h=new D,d=new D(0,1,0),u=.35;for(let f=0;f<n.count;f+=2)l.fromBufferAttribute(n,f),c.fromBufferAttribute(n,f+1),h.subVectors(c,l),a.position.copy(l).add(c).multiplyScalar(.5),a.scale.set(u,h.length()+u,u),a.quaternion.setFromUnitVectors(d,h.normalize()),a.updateMatrix(),o.setMatrixAt(f/2,a.matrix);return o.computeBoundingSphere(),e.dispose(),o}addSigns(e,t){const n=t.filter(o=>o.localId!==null&&o.localId>=17&&o.localId<=21).sort((o,a)=>o.y-a.y||o.x-a.x);if(n.length===0)return;const s=[];for(const o of n){const a=s[s.length-1],l=a==null?void 0:a[a.length-1];l&&l.y===o.y&&l.x+1===o.x?a.push(o):s.push([o])}const r=this.createWallMaterial("#241b0b");for(const o of s){const a=o.length*e.map.tileWidth,l=e.map.tileHeight,c=this.own(qx(a-2,l-2)),h=new gt(c,r);h.name="sign-lettering";const d=this.createOutlineStrips(new Qu(c),new Ve("#b9a36b"));d.name="sign-edges";const u=new Qt;u.name="sign-artwork",u.position.set((o[0].x+o.length/2)*e.map.tileWidth,0,(o[0].y+.5)*l),u.add(h,d),this.group.add(u)}}addPen(e){const t=new Qt;t.name="ghost-pen";const n=new gt(this.own(Ic(e)),this.createWallMaterial("#061428"));n.name="pen-bars";const s=this.createOutlineStrips(Lc(e,void 0,!1),new Ve("#419da9"));s.name="pen-edges",t.add(n,s),this.group.add(t)}}class Jx{constructor(e){this.world=e,this.previousPositions=new WeakMap}capturePreviousState(){this.capture(this.world.packet);for(const e of this.world.ghosts)this.capture(e)}getPosition(e,t){const n=this.previousPositions.get(e);if(!n||n.tile!==e.tile)return e;const s=on(t,0,1);return n.output.x=Ti(n.x,e.x,s),n.output.y=Ti(n.y,e.y,s),n.output}capture(e){const t=this.previousPositions.get(e);if(t){t.x=e.x,t.y=e.y,t.tile=e.tile;return}this.previousPositions.set(e,{x:e.x,y:e.y,tile:e.tile,output:{x:e.x,y:e.y}})}}function Zx(i,e){if(!e.state.scared)return e.key;const t=i.ghostScaredTimers.get(e)??0;if(t>0&&t<=Fn){const n=i.ghostScaredWarnings.get(e);if(n!=null&&n.showBaseColor)return e.key}return"scared"}class $x{constructor(e,t,n,s){this.world=e,this.renderer=t,this.camera=n,this.collectibles=s,this.scene=new zu,this.assets=new Ox,this.ghosts=new Map,this.points=new Map,this.effects=new Map,this.effectGeometry=new Fa(.7,1,24),this.pointMatrix=new tt,this.lastPointCount=-1,this.destroyed=!1,this.presentation=new Jx(e),this.scene.background=new Ve("#02040b"),this.scene.add(new kd("#a7c5ff","#160b30",.85));const r=new Hd("#c7dfff",1.4);r.position.set(-150,300,100),this.scene.add(r),this.maze=new Kx(e),this.debug=new zx(e),this.scene.add(this.maze.group,this.debug.group),this.packet=this.assets.createPacket(),this.packet.name="packet",this.packet.add(this.assets.createContactShadow(e.packet.displayWidth)),this.scene.add(this.packet);for(const a of e.ghosts){const l=this.assets.createGhost(a.key);l.name="ghost-"+a.key,l.add(this.assets.createContactShadow(a.displayWidth)),this.ghosts.set(a,l),this.scene.add(l)}const o=Array.from(this.collectibles.getPoints());for(const a of["base","power"]){const l=o.filter(d=>d.kind===a).length,c=a==="power"?this.assets.powerPelletMaterial:this.assets.pelletMaterial,h=new pr(this.assets.pelletGeometry,c,l);h.name="pellets-"+a,this.points.set(a,h),this.scene.add(h)}this.syncPoints()}capturePreviousState(){this.presentation.capturePreviousState()}render(e=1){if(this.destroyed)return;this.camera.present(e,this.renderer.pixelRatio);const t=this.presentation.getPosition(this.world.packet,e);this.packet.position.set(t.x,0,t.y),this.packet.rotation.y=-(this.world.packet.angle*Math.PI)/180,this.packet.visible=this.isPacketVisible(),this.assets.setPacketFrame(this.packet,this.world.packetAnimation.frame),this.ghosts.forEach((n,s)=>{var o;const r=this.presentation.getPosition(s,e);n.position.set(r.x,0,r.y),this.assets.setGhostAppearance(n,Zx(this.world,s),((o=this.world.ghostAnimations.get(s))==null?void 0:o.frame)??0,s.direction)}),this.syncPoints(),this.syncEffects(),this.debug.sync(),this.renderer.render(this.scene,this.camera.camera)}destroy(){this.destroyed||(this.destroyed=!0,this.maze.dispose(),this.debug.dispose(),this.points.forEach(e=>e.dispose()),this.effects.forEach(e=>e.material.dispose()),this.effects.clear(),this.effectGeometry.dispose(),this.assets.dispose(),this.scene.clear(),this.renderer.dispose())}syncPoints(){const e=this.collectibles.getPointCount();if(e===this.lastPointCount)return;this.lastPointCount=e;const t={base:0,power:0};for(const n of this.collectibles.getPoints()){const s=this.points.get(n.kind),r=ms[n.kind==="power"?1:0].size/2;this.pointMatrix.makeScale(r,r,r),this.pointMatrix.setPosition(n.x,r+.12,n.y),s.setMatrixAt(t[n.kind],this.pointMatrix),t[n.kind]+=1}this.points.forEach((n,s)=>{n.count=t[s],n.instanceMatrix.needsUpdate=!0,n.computeBoundingSphere()})}syncEffects(){const e=this.collectibles.getEatEffects();this.effects.forEach((t,n)=>{e.includes(n)||(this.scene.remove(t),t.material.dispose(),this.effects.delete(n))});for(const t of e){let n=this.effects.get(t);n||(n=new gt(this.effectGeometry,new Ui({color:"#c8ba9c",transparent:!0,depthWrite:!1})),n.name="pellet-effect",n.rotation.x=-Math.PI/2,n.position.set(t.x,.08,t.y),this.effects.set(t,n),this.scene.add(n));const s=Math.min(1,t.elapsedMs/t.durationMs),r=(1-s)*(1-s),o=t.sizeStart+(t.sizeEnd-t.sizeStart)*(1-r);n.scale.setScalar(o/2),n.material.opacity=r}}isPacketVisible(){if((this.world.packet.deathRecoveryRemainingMs??0)>0)return this.world.packet.deathRecoveryVisible??!0;if((this.world.packet.portalBlinkRemainingMs??0)<=0)return!0;const n=this.world.packet.portalBlinkElapsedMs??0;return Math.floor(n/Eh.intervalMs)%2===0}}const Qx={mapJsonPath:"assets/mazes/default/maze.json"},jx={mapJsonPath:"assets/mazes/default/demo.json"};function ev(i){return i==="DEMO"?"demo":"default"}function tv(i){return i==="demo"?{...jx}:{...Qx}}const Dc=["inky","clyde","pinky","blinky"];class nv{constructor(e={}){this.options=e}async compose(e,t){const n=this.options.mountId??"game-root",s=document.getElementById(n);if(!s)throw new Error(`Game mount element not found: #${n}`);const r=new X_,o=Y_(this.options.rng??Math.random),a=this.options.mapVariant??"default",{mapJsonPath:l}=tv(a),c=await this.loadMapForVariant(r,a,l);t==null||t.throwIfAborted();const h=c.tileWidth||K0,d=document.createElement("canvas");d.className="block h-full w-full touch-none transition-[filter] duration-200 ease-out";const u=new a_(c.tiles.map(le=>le.map(Ne=>({...Ne.collision})))),f=new d_(h),g=new M_,M={x:Math.floor(c.width/2),y:Math.floor(c.height/2)},m=g.resolveSpawnTile(c.packetSpawn,M,c),p=g.resolveGhostJailBounds(c,m),w=yi(c.ghostHome,"ghostCount")??4,A=Math.max(0,Math.round(w)),S=new r_(m,Jn.packet,Jn.packet);f.setEntityTile(S,m);const E=[],T=Math.max(1,p.maxX-p.minX+1),R=on(p.y,0,c.height-1);for(let le=0;le<A;le+=1){const Ne=p.minX+o.int(T),Me={x:on(Ne,0,c.width-1),y:R},Ue=new s_({key:Dc[le%Dc.length],tile:Me,direction:o.next()<.5?"right":"left",speed:ss.ghost,displayWidth:Jn.ghost,displayHeight:Jn.ghost});f.setEntityTile(Ue,Me),E.push(Ue)}t_(0,Ba);const x=new y_({map:c,tileSize:h,collisionGrid:u,packetSpawnTile:m,packet:S,ghosts:E,ghostJailBounds:p}),b=new q0,P=new T_(d),N=new w_(d),z=new C_,V=new S_(u,c.portalPairs??[]),U=new f_,O=new Lx(N,x,e),J=new Ix(x,f,V),H=new Tx(x,f,g,z,o),ie=new Mx(x,f,U,V,o),X=new wx(x,f,ss.ghost),$=new Q_(x,ss.ghost),ee=new j_(x,b,P,d),Ae=new xx(x),ye=new Ax(s),je=new Ux(x,s),We=new vx(x,b);let Ze;try{Ze=new $x(x,P,b,Ae)}catch(le){throw N.destroy(),P.dispose(),d.remove(),le}const q=[O,J,H,ie,X,$,ee,Ae,ye,je,We],Q=[Ze,We,ye];return s.replaceChildren(d),{world:x,renderer:P,input:N,scheduler:z,updateSystems:q,renderSystems:Q,destroy:()=>{d.remove()}}}async loadMapForVariant(e,t,n){try{return await e.loadMap(n)}catch(s){throw t==="demo"?new Error(`DEMO map startup failed while loading "${n}": ${s instanceof Error?s.message:String(s)}`):s}}}function iv(i,e,t,n=8){const s=Number.isFinite(e)&&e>0?e:0,r=t*n,o=s>r?r:s;let a=i.accumulatorMs+o,l=0;for(;a>=t&&l<n;)a-=t,l+=1;return l===n&&a>=t&&(a=0),{ticks:l,accumulatorMs:a,clampedDeltaMs:o}}class sv{constructor(e,t,n=1e3/60,s=8){this.state={accumulatorMs:0},this.running=!1,this.lastTimestamp=0,this.frameId=0,this.tick=r=>{if(!this.running)return;this.lastTimestamp===0&&(this.lastTimestamp=r);const o=r-this.lastTimestamp;this.lastTimestamp=r;const a=iv(this.state,o,this.stepMs,this.maxSubSteps);this.state.accumulatorMs=a.accumulatorMs;for(let c=0;c<a.ticks;c+=1)this.update(this.stepMs);const l=this.stepMs>0?this.state.accumulatorMs/this.stepMs:0;this.render(l),this.frameId=window.requestAnimationFrame(this.tick)},this.update=e,this.render=t,this.stepMs=n,this.maxSubSteps=s}start(){this.running||(this.running=!0,this.lastTimestamp=0,this.state.accumulatorMs=0,this.frameId=window.requestAnimationFrame(this.tick))}stop(){this.running&&(this.running=!1,window.cancelAnimationFrame(this.frameId))}}class rv{constructor(e){this.compositionRoot=e,this.loop=null,this.composed=null,this.started=!1,this.destroyed=!1,this.pausedByFocusLoss=!1,this.focusListenersBound=!1,this.presentationReady=!1,this.starting=null,this.startupAbort=new AbortController,this.runtimeControl={pause:()=>{this.pause()},resume:()=>{this.resume()},togglePause:()=>{this.composed&&(this.composed.world.isMoving?this.pause():this.resume())}},this.handleWindowBlur=()=>{this.handleFocusLost()},this.handleWindowFocus=()=>{this.handleFocusReturned()},this.handleVisibilityChange=()=>{if(!(typeof document>"u"||!("hidden"in document))){if(document.hidden){this.handleFocusLost();return}this.handleFocusReturned()}},this.update=t=>{if(!(!this.composed||this.destroyed)){if(!this.composed.world.isMoving){this.composed.updateSystems.forEach(n=>{n.runsWhenPaused&&n.update(t)});return}this.composed.renderSystems.forEach(n=>{var s;(s=n.capturePreviousState)==null||s.call(n)}),this.composed.world.nextTick(),this.composed.scheduler.update(t),this.composed.updateSystems.forEach(n=>{n.update(t)}),this.presentationReady=this.composed.world.isMoving}},this.render=t=>{if(!this.composed||this.destroyed)return;const n=this.presentationReady&&this.composed.world.isMoving?t:1;this.composed.renderSystems.forEach(s=>{s.render(n)})}}start(){return this.started||this.destroyed?Promise.resolve():(this.starting??(this.starting=this.initialize().finally(()=>{this.starting=null})),this.starting)}async initialize(){let e;try{e=await this.compositionRoot.compose(this.runtimeControl,this.startupAbort.signal)}catch(t){if(this.destroyed)return;throw t}if(this.destroyed){this.destroyComposedGame(e);return}this.composed=e,this.loop=new sv(this.update,this.render),this.started=!0;try{this.bindFocusListeners(),e.updateSystems.forEach(t=>{var n;(n=t.start)==null||n.call(t)}),this.loop.start()}catch(t){throw this.loop.stop(),this.loop=null,this.started=!1,this.unbindFocusListeners(),this.composed=null,this.destroyComposedGame(e),t}}pause(){this.composed&&(this.composed.world.isMoving=!1,this.presentationReady=!1,this.composed.scheduler.setPaused(!0))}resume(){this.composed&&(this.pausedByFocusLoss=!1,this.presentationReady=!1,this.composed.world.isMoving=!0,this.composed.scheduler.setPaused(!1))}destroy(){var e;this.destroyed||(this.destroyed=!0,this.startupAbort.abort(),this.presentationReady=!1,this.started=!1,this.unbindFocusListeners(),this.pausedByFocusLoss=!1,(e=this.loop)==null||e.stop(),this.loop=null,this.composed&&this.destroyComposedGame(this.composed),this.composed=null)}bindFocusListeners(){this.focusListenersBound||!this.canBindWindowListeners()||(window.addEventListener("blur",this.handleWindowBlur),window.addEventListener("focus",this.handleWindowFocus),this.canBindDocumentListeners()&&document.addEventListener("visibilitychange",this.handleVisibilityChange),this.focusListenersBound=!0)}unbindFocusListeners(){!this.focusListenersBound||!this.canBindWindowListeners()||(window.removeEventListener("blur",this.handleWindowBlur),window.removeEventListener("focus",this.handleWindowFocus),this.canBindDocumentListeners()&&document.removeEventListener("visibilitychange",this.handleVisibilityChange),this.focusListenersBound=!1)}canBindWindowListeners(){return typeof window<"u"&&typeof window.addEventListener=="function"&&typeof window.removeEventListener=="function"}canBindDocumentListeners(){return typeof document<"u"&&typeof document.addEventListener=="function"&&typeof document.removeEventListener=="function"}handleFocusLost(){!this.started||this.destroyed||!this.composed||!this.composed.world.isMoving||(this.pause(),this.pausedByFocusLoss=!0)}handleFocusReturned(){!this.started||this.destroyed||!this.composed||!this.pausedByFocusLoss||this.resume()}destroyComposedGame(e){const t=new Set([...e.renderSystems,...e.updateSystems]);this.destroySystems(Array.from(t)),e.scheduler.clear(),e.input.destroy(),e.destroy()}destroySystems(e){e.forEach(t=>{var n;(n=t.destroy)==null||n.call(t)})}}let Mi=null;function ov(i={}){Mi==null||Mi.destroy();const e=new rv(new nv(i)),t={start:()=>e.start(),pause:()=>e.pause(),resume:()=>e.resume(),destroy:()=>{e.destroy(),Mi===t&&(Mi=null)}};return Mi=t,t}const av=ov({mountId:"game-root",mapVariant:ev({}.VITE_GAME_ENV)});av.start().catch(i=>{var t;const e=document.createElement("p");e.className="m-auto max-w-lg p-8 text-center text-white",e.setAttribute("role","alert"),e.textContent=i instanceof Error?i.message:"The game could not start. Please reload and try again.",(t=document.getElementById("game-root"))==null||t.replaceChildren(e)});
