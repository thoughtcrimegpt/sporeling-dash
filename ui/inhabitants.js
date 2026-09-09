/* Small illustrated residents and woodland creatures, anchored to engine boxes. */
(function(root){
'use strict'; const tau=Math.PI*2;
function oval(g,x,y,a,b,col,rot=0){g.fillStyle=col;g.beginPath();g.ellipse(x,y,a,b,rot,0,tau);g.fill();}
function stroke(g,x,y,x2,y2,col,w=1){g.strokeStyle=col;g.lineWidth=w;g.lineCap='round';g.beginPath();g.moveTo(x,y);g.lineTo(x2,y2);g.stroke();}
function eyes(g,x,y,space=2){for(const dx of [-space,space]){oval(g,x+dx,y,.7,1,'#302d29');oval(g,x+dx-.2,y-.3,.18,.22,'#fffbe5');}}
function shroom(g,x,y,c,scale=1){g.save();g.translate(x,y);g.scale(scale,scale);oval(g,0,-4,4,5,'#eee0b9');oval(g,-2,0,2,1,'#97715d');oval(g,2,0,2,1,'#97715d');g.fillStyle=c;g.beginPath();g.moveTo(-7,-7);g.quadraticCurveTo(-7,-15,0,-15);g.quadraticCurveTo(7,-15,7,-7);g.quadraticCurveTo(0,-5,-7,-7);g.fill();oval(g,-2,-11,2,1,'#f0d69f');eyes(g,0,-4,1.5);g.restore();}
function resident(g,n,o){const t=o.reducedMotion?0:o.time,bob=Math.sin(t*2+(n.ph||0))*.35,x=n.x,y=n.y,h=o.height||14;
g.save();g.translate(x+6,y+h);if(n.big)g.scale(1.7,1.7);
if(n.sprite==='dog'){
 oval(g,0,-6,5,6,'#bb955d');oval(g,1,-7,3,5,'#65523b');oval(g,3,-12,4,4,'#c7a570');
 for(const ex of [0,5]){g.fillStyle='#5b4935';g.beginPath();g.moveTo(ex-2,-13);g.lineTo(ex,-21);g.lineTo(ex+2,-13);g.fill();}
 oval(g,6,-11,3,2,'#493b2e');eyes(g,3,-14,1.5);oval(g,-3,-1,3,1,'#d9b87e');stroke(g,-4,-5,-9,-1,'#b59160',2);
}else if(n.sprite==='moth'){
 const flap=.9+Math.sin(t*5)*.12;oval(g,-4,-8,5*flap,7,'#d6c7a5',-.5);oval(g,4,-8,5*flap,7,'#e5d6b4',.5);oval(g,0,-7,2,6,'#917e70');eyes(g,0,-11,1);
 stroke(g,-1,-12,-3,-16,'#9d8e75',.6);stroke(g,1,-12,3,-16,'#9d8e75',.6);g.fillStyle='#eee2bc';g.fillRect(4,-5,6,4);stroke(g,5,-3,8,-3,'#a7a079',.5);
}else if(n.sprite==='twins'){shroom(g,-4,0,'#d4a95c',.65);shroom(g,4,0,'#c39e60',.7);
}else if(n.sprite==='grel'||n.sprite==='frog'){
 oval(g,0,-4,6,4,'#9db889');for(const dx of [-3,3]){oval(g,dx,-7,2.3,2.6,'#abc998');oval(g,dx,-7,.7,1,'#263d33');}stroke(g,-2,-3,2,-3,'#54664b',.6);oval(g,-5,-1,3,1.2,'#8ca87b');oval(g,5,-1,3,1.2,'#8ca87b');
}else{
 const colors={keeper:'#b59d72',granny:'#bd9e6b',jb:'#8eaa9a',echo:'#d0d9be'};if(n.sprite==='echo')g.globalAlpha=.75;
 shroom(g,0,bob,colors[n.sprite]||'#c3b28b',n.sprite==='granny'?1.05:.85);
 if(n.sprite==='keeper'){stroke(g,-8,0,-8,-18,'#83714e',1);g.fillStyle='#e8bc6e';g.fillRect(-10,-17,4,5);oval(g,-8,-14.5,1,1.7,'#fff3b9');}
 if(n.sprite==='granny'){for(const dx of [-2,2]){g.strokeStyle='#71604d';g.lineWidth=.5;g.beginPath();g.arc(dx,-4,1.6,0,tau);g.stroke();}oval(g,0,-1,3,1.5,'#9ba681');}
 if(n.sprite==='jb'){g.fillStyle='#d5b183';g.fillRect(-6,-4,3,4);stroke(g,5,-7,8,-3,'#bbaa82',1.5);}
}
g.restore();
}
function enemy(g,e,o){const t=o.reducedMotion?0:o.time,x=e.x,y=e.y,w=e.w||10,h=e.h||10,cx=x+w/2,cy=y+h/2;
if(e.t==='slug'||e.t==='skitter'){
 const col=e.fast||e.t==='skitter'?'#ca8b74':'#9fae7e';oval(g,cx,y+h*.6,w*.5,h*.45,col);oval(g,cx-2,y+h*.3,w*.3,h*.25,'#c4cb99');const ex=cx+(e.dir||1)*w*.3;eyes(g,ex,y+h*.4,1);stroke(g,ex,y+2,ex+(e.dir||1),y-2,'#a5ad7e',.8);
 if(e.t==='skitter')for(let i=0;i<3;i++){const xx=x+2+i*3;stroke(g,xx,y+h-2,xx+Math.sin(t*12+i),y+h,'#706b50',.7);}
}else if(e.t==='puff'){
 for(let i=0;i<7;i++){const a=i*tau/7;oval(g,cx+Math.cos(a)*3,cy+Math.sin(a)*3,3,3,'#e2dbc2');}eyes(g,cx,cy+1,1.5);oval(g,cx-2,cy-2,1.6,1,'#fff4d8');
}else if(e.t==='wisp'){
 oval(g,cx,cy,5,5,e.state==='open'?'#b2ebc2':'#e1aa96');oval(g,cx-3,cy-2,3,2,'#edd6b4',-.7);oval(g,cx+3,cy-2,3,2,'#edd6b4',.7);eyes(g,cx,cy,1.4);
}else if(e.t==='mine'){
 for(let i=0;i<7;i++){const a=i*tau/7;stroke(g,cx+Math.cos(a)*3,cy+Math.sin(a)*3,cx+Math.cos(a)*6,cy+Math.sin(a)*6,'#a9826b',1.5);}oval(g,cx,cy,4,4,e.armT>0?'#f1ae78':'#b79b70');eyes(g,cx,cy,1.3);if(e.armT>0){g.strokeStyle='#ffe2ac';g.lineWidth=1;g.beginPath();g.arc(cx,cy,7,0,tau);g.stroke();stroke(g,cx,cy-12,cx,cy-9,'#ffe2ac',1.4);}
}else if(e.t==='ember'){
 oval(g,cx,cy+2,5,4,'#e4ba8a');oval(g,cx,cy-2,6,4,'#d78966');oval(g,cx-2,cy-3,2,1,'#f3d494');eyes(g,cx,cy+2,1.5);
}else if(e.t==='spitter'){
 const aim=(o.playerX==null?cx+1:o.playerX)<cx?-1:1;oval(g,cx,cy+2,5,5,'#91a27b');oval(g,cx+aim*4,cy,3,2,e.cd<.5?'#ffc38b':'#b7bc8c');if(e.cd<.5){stroke(g,cx+aim*7,cy-2,cx+aim*10,cy,'#ffe1a8',1);stroke(g,cx+aim*10,cy,cx+aim*7,cy+2,'#ffe1a8',1);}eyes(g,cx,cy-3,1.5);
}else return false;
return true;
}
root.SporelingInhabitants={resident,enemy};
})(typeof window!=='undefined'?window:globalThis);
