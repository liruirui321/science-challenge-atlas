import * as T from './vendor/three.module.js';
import {OrbitControls} from './vendor/OrbitControls.js';
const $=s=>document.querySelector(s),host=$('#view');
SiliconInsight.mount(document.querySelector('#downloads'));
let gain=5;
try{
const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));host.appendChild(renderer.domElement);
const scene=new T.Scene();scene.background=new T.Color('#e8f2ed');const camera=new T.PerspectiveCamera(40,1,.01,1000);const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;
scene.add(new T.HemisphereLight(0xffffff,0x809a8e,2.5));let sun=new T.DirectionalLight(0xffffff,3);sun.position.set(8,12,15);scene.add(sun);
let group,mixer,action,data,playing=false,last=0,frame=0,radius=10;
const geom=new T.SphereGeometry(.22,24,16),mat=new T.MeshStandardMaterial({color:0x087e8b,roughness:.35,metalness:.1});
function reset(){camera.position.set(radius*1.6,radius*1.15,radius*1.8);controls.target.set(0,0,0);controls.update();}
function load(key){$('#system').value=key;if(group){scene.remove(group);mixer.stopAllAction();mixer.uncacheRoot(group)}data=SCIENCE[key];group=new T.Group();scene.add(group);let first=data.frames[0],center=[0,1,2].map(k=>first.reduce((s,v)=>s+v[k],0)/first.length);radius=Math.max(...data.frames.flat().map(v=>Math.hypot(...v.map((x,k)=>x-center[k]))));let tracks=[];
for(let i=0;i<first.length;i++){let atom=new T.Mesh(geom,i===0?new T.MeshStandardMaterial({color:0xdb683f}):mat);atom.name='atom'+i;group.add(atom);let values=data.frames.flatMap(f=>f[i].map((x,k)=>first[i][k]+gain*(x-first[i][k])-center[k]));let tr=new T.VectorKeyframeTrack(atom.name+'.position',data.frames.map((_,j)=>j/10),values);tr.setInterpolation(T.InterpolateDiscrete);tracks.push(tr)}
mixer=new T.AnimationMixer(group);let clip=new T.AnimationClip('recorded',data.frames.length/10,tracks);action=mixer.clipAction(clip);action.play();frame=0;playing=false;$('#play').textContent='播放';$('#frame').max=data.frames.length-1;$('#note').textContent=data.note.replace('未放大位移。','')+` 位移显示 ×${gain}（仅放大相对初帧的变化）；橙色球用于跟踪同一个原子。下方物理量不放大。`;$('#downloads').innerHTML=`下载：<a href="assets/${key}.mp4">MP4 动画</a> · <a href="assets/${key}.gif">GIF 动画</a>`;reset();seek(0);}
function seek(i){frame=Math.max(0,Math.min(data.frames.length-1,i));mixer.setTime(frame/10+.00001);SiliconInsight.update($('#system').value,frame);$('#frame').value=frame;$('#time').textContent=`第 ${frame+1} / ${data.frames.length} 帧 · t=${data.time[frame]} ${data.unit} · 坐标 ${data.positionUnit}`;renderer.render(scene,camera);}
function resize(){renderer.setSize(host.clientWidth,host.clientHeight);camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();}new ResizeObserver(resize).observe(host);
$('#system').onchange=e=>{gain=e.target.value==='silicon'?5:1;$('#gain').value=gain;load(e.target.value);};$('#gain').onchange=e=>{gain=+e.target.value;const saved=frame,wasPlaying=playing;load($('#system').value);seek(saved);playing=wasPlaying;$('#play').textContent=playing?'暂停':'播放';};$('#frame').oninput=e=>seek(+e.target.value);$('#play').onclick=()=>{playing=!playing;$('#play').textContent=playing?'暂停':'播放';};$('#reset').onclick=reset;
window.setRecordedFrame=(key,i)=>{if($('#system').value!==key){$('#system').value=key;load(key)}seek(i);controls.update();renderer.render(scene,camera);return {atoms:group.children.length,frame,time:data.time[frame]}};
function loop(t){requestAnimationFrame(loop);if(playing&&t-last>100){last=t;seek((frame+1)%data.frames.length)}controls.update();renderer.render(scene,camera)}
if(new URLSearchParams(location.search).get('system')==='xenon'){gain=1;$('#gain').value=1;}
load(new URLSearchParams(location.search).get('system')==='xenon'?'xenon':'silicon');resize();requestAnimationFrame(loop);window.sceneReady=true;
}catch(e){$('#error').textContent='当前环境无法初始化 WebGL，可返回主页面使用二维投影回放。'+e.message;}
