/* Woodland guardians. Drawing is separate from combat and uses its exact dimensions. */
(function(root){
  'use strict';
  const TAU=Math.PI*2;
  function oval(g,x,y,rx,ry,c,rot=0){g.fillStyle=c;g.beginPath();g.ellipse(x,y,rx,ry,rot,0,TAU);g.fill();}
  function line(g,points,c,w=1){g.strokeStyle=c;g.lineWidth=w;g.lineCap='round';g.beginPath();g.moveTo(...points[0]);for(let i=1;i<points.length;i++)g.lineTo(...points[i]);g.stroke();}
  function glow(g,x,y,r,c='176,244,198'){const q=g.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,`rgba(${c},.45)`);q.addColorStop(1,`rgba(${c},0)`);oval(g,x,y,r,r,q);}
  function leaf(g,x,y,s,rot,c){g.save();g.translate(x,y);g.rotate(rot);g.fillStyle=c;g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(-s,-s,s*.2,-s*2);g.quadraticCurveTo(s,-s,0,0);g.fill();g.restore();}
  function flower(g,x,y,r,c,time=0){for(let i=0;i<5;i++){const a=i*TAU/5+time;oval(g,x+Math.cos(a)*r*.58,y+Math.sin(a)*r*.58,r*.55,r*.35,c,a);}oval(g,x,y,r*.25,r*.25,'#ffe7a7');}
  function eye(g,x,y,closed=false){if(closed)line(g,[[x-2,y],[x,y+1],[x+2,y]],'#342a24',1);else{oval(g,x,y,2.2,2.8,'#fff5d9');oval(g,x+.5,y+.5,1,1.5,'#342a24');}}
  function barrow(g,b,o){
    const t=o.reducedMotion?0:o.time,floor=13*16;
    if(b.state==='burrow'||b.state==='telegraph'){
      const x=b.mx||b.x,warn=b.state==='telegraph';
      oval(g,x,floor,31,5,'#503f31');oval(g,x,floor-3,24,6,'#8d8653');
      for(let i=0;i<7;i++)leaf(g,x-22+i*7,floor-3,3,Math.sin(t*5+i)*.3,'#a8bd71');
      if(warn){line(g,[[x-28,floor-9],[x-18,floor-13],[x+18,floor-13],[x+28,floor-9]],'#f5ba75',2);for(const dx of [-20,0,20])line(g,[[x+dx-3,floor-18],[x+dx,floor-23],[x+dx+3,floor-18]],'#ffe6b2',1);}
      return;
    }
    const x=b.x,y=b.y,sleep=b.state==='defeated',open=b.state==='arc';
    oval(g,x,y+25,36,4,'rgba(24,32,22,.25)');
    const skin=g.createLinearGradient(x,y,x,y+26);skin.addColorStop(0,'#b8ba7d');skin.addColorStop(1,'#738753');
    oval(g,x,y+13,32,13,skin);oval(g,x-5,y+6,23,9,'#6b8953');
    for(let i=0;i<9;i++){const xx=x-24+i*6;oval(g,xx,y+3+Math.sin(i)*2,5,3,'#8aa65d');}
    for(let i=0;i<4;i++){const xx=x-20+i*10,yy=y-3-Math.sin(i)*4;line(g,[[xx,y+5],[xx,yy]],'#d6d8a2',1.7);oval(g,xx,yy,4,2.5,i%2?'#e6b971':'#d78e6e');flower(g,xx+3,yy-3,2,'#f5dc9c');}
    const hx=x+(b.dir||1)*23;oval(g,hx,y+9,11,11,skin);
    for(let i=0;i<2;i++){const ex=hx-3+i*7;line(g,[[ex,y+3],[ex+Math.sin(t*2+i),y-8+i*2]],'#9ca867',2.5);eye(g,ex+Math.sin(t*2+i),y-9+i*2,sleep);}
    line(g,[[hx-3,y+13],[hx,y+15],[hx+4,y+13]],'#596343',.8);
    if(open){glow(g,x,y+24,33);oval(g,x,y+23,29,4,'#b8f2c9');for(let i=-2;i<=2;i++)oval(g,x+i*9,y+23,2,1.5,'#f7ffe7');}
    if(sleep)flower(g,x,y-8,7,'#f0bb86');
  }
  function chorus(g,b,o){
    const t=o.reducedMotion?0:o.time,open=b.state==='gather',gone=b.state==='defeated';
    const x=b.x,y=b.y;
    glow(g,x,y,52,open?'166,240,191':'244,191,117');
    // Six suspended bell petals fold away from the reachable mint core.
    for(let i=0;i<6;i++){
      const a=i*TAU/6-Math.PI/2,rr=open?24:16;
      const px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr;
      line(g,[[x,y],[px,py]],'#9eae7d',1.6);
      leaf(g,px,py,10,a+Math.PI/2,open?'#ddbe90':'#b29bc2');
      oval(g,px,py,4,3,'#f5d7a4');
    }
    oval(g,x,y,open?13:8,open?13:8,open?'#b4f3c8':'#d9afc3');
    flower(g,x,y,open?10:6,gone?'#ffe5ac':'#f7f4dc',t*.06);
    if(open){g.strokeStyle='#e5ffe7';g.lineWidth=1;g.beginPath();g.arc(x,y,17,0,TAU);g.stroke();}
    for(const w of b.wisps||[]){
      if(w.dead)continue;const wx=w.x+4,wy=w.y+4;
      if(!Number.isFinite(wx)||!Number.isFinite(wy))continue;
      const danger=w.mode==='dive'||w.mode==='warn';
      glow(g,wx,wy,10,danger?'255,158,114':'244,207,150');
      oval(g,wx,wy,5,6,danger?'#f0a077':'#dc8e82');
      leaf(g,wx-1,wy,3,-1,'#faf1d3');leaf(g,wx+1,wy,3,1,'#faf1d3');
      eye(g,wx,wy+1,false);
      if(w.mode==='warn'){line(g,[[wx-5,wy-11],[wx,wy-7],[wx+5,wy-11]],'#ffdeac',1.3);}
      if(w.mode==='dive'){const v=Math.hypot(w.vx||0,w.vy||0)||1;line(g,[[wx-(w.vx||0)/v*12,wy-(w.vy||0)/v*12],[wx,wy]],'rgba(247,167,116,.6)',2);}
    }
  }
  function boar(g,b,o){
    const t=o.reducedMotion?0:o.time,side=['side','getup','defeated'].includes(b.state),floor=o.floor||256;
    const charging=b.state==='charge',crash=b.state==='crash',warn=['warn','rebound'].includes(b.state),dir=b.dir||1;
    const breath=Math.sin(t*3)*.5, stride=charging?Math.sin(t*22):0;
    g.save(); g.translate(b.x,side?floor-25:b.y);g.scale(dir,1);
    oval(g,0,side?23:33,36,3,'rgba(15,14,20,.38)');
    // Four planted hooves, with the far pair behind the shoulder.
    for(let i=0;i<4;i++){
      const xx=i<2?-19:18, phase=i%2?1:-1, foot=side?3:31+stride*phase*2;
      line(g,[[xx+(i%2?3:-3),17],[xx+phase*stride*3,25],[xx+phase*stride*5,foot]],i%2?'#382d32':'#59404a',5);
      line(g,[[xx+phase*stride*5-3,foot+1],[xx+phase*stride*5+3,foot+1]],'#211f2a',3);
    }
    const body=g.createLinearGradient(-15,0,10,33);body.addColorStop(0,'#ac8268');body.addColorStop(.35,'#71574f');body.addColorStop(1,'#352d39');
    oval(g,-2,18+breath,33,15,body);oval(g,13,13,20,14,body);
    // Overlapping bark plates follow the back, with grain and moss in the seams.
    for(let i=0;i<6;i++){
      const xx=-29+i*8, yy=5-Math.sin((i+1)/7*Math.PI)*4;
      g.fillStyle=i%2?'#504144':'#68534c';g.beginPath();g.moveTo(xx-3,yy+12);g.quadraticCurveTo(xx-6,yy+3,xx+1,yy-2);g.lineTo(xx+7,yy+1);g.quadraticCurveTo(xx+5,yy+12,xx+1,yy+17);g.closePath();g.fill();
      line(g,[[xx+1,yy+2],[xx-1,yy+7],[xx+2,yy+13]],'#b08a69',.65);
      line(g,[[xx+5,yy+4],[xx+3,yy+11]],'#332f36',1);
      if(i%2===0)line(g,[[xx-2,yy+5],[xx-3,yy+9]],'#819473',1);
    }
    for(let i=0;i<20;i++){const xx=-26+(i*17%54),yy=17+(i*7%13);line(g,[[xx,yy],[xx-2,yy+3]],'rgba(224,188,145,.18)',.6);}
    // A lowered wedge-shaped skull carries the charge, not a floating round face.
    const head=g.createLinearGradient(18,6,36,30);head.addColorStop(0,'#9b7762');head.addColorStop(1,'#49383e');
    g.fillStyle=head;g.beginPath();g.moveTo(13,10);g.quadraticCurveTo(22,-2,29,7);g.lineTo(34,17);g.quadraticCurveTo(44,17,43,26);g.quadraticCurveTo(37,32,27,28);g.lineTo(18,25);g.closePath();g.fill();
    g.fillStyle='#5b4446';g.beginPath();g.moveTo(18,8);g.lineTo(12,-1);g.quadraticCurveTo(24,-3,26,7);g.closePath();g.fill();line(g,[[18,4],[22,7]],'#b59679',1);
    oval(g,38,23,7,5,'#826055',-.12);oval(g,36,23,1.1,1.8,'#28252e');oval(g,41,22,1.1,1.8,'#28252e');
    line(g,[[23,13],[28,14]],'#29252c',3);line(g,[[24,13],[27,14]],warn?'#ffe0a0':'#d2b894',1.2);line(g,[[21,10],[29,12]],'#382c34',2);
    // Tusks curl upward beside the snout. Their tips are decorative, not extra hitboxes.
    for(const [xx,yy,scale] of [[31,26,1],[40,27,.7]]){
      g.fillStyle='#e9d4ac';g.beginPath();g.moveTo(xx-2,yy);g.quadraticCurveTo(xx+7*scale,yy+3,xx+8*scale,yy-10*scale);g.quadraticCurveTo(xx+4*scale,yy-2,xx,yy-3);g.closePath();g.fill();
    }
    line(g,[[-33,17],[-38,14],[-36,10]],'#6b5550',2);
    if(side){
      glow(g,0,0,26);oval(g,0,0,18,7,'#395d53');oval(g,0,-1,15,5,'#b8f1c8');
      for(let i=-2;i<=2;i++)line(g,[[i*5-2,-4],[i*5+2,2]],'#e9ffe0',.8);
    }
    if(charging){for(let i=0;i<5;i++){const dust=(t*9+i*.21)%1;oval(g,-35-dust*23,31-dust*9,2+dust*4,1+dust*2,`rgba(206,183,146,${(1-dust)*.4})`);}}
    if(crash){for(let i=0;i<5;i++){const a=i*.8-1.6;line(g,[[36,16],[36+Math.cos(a)*12,16+Math.sin(a)*15]],'#f3c995',1);}}
    g.restore();
  }
  function heart(g,b,o){
    const t=o.reducedMotion?0:o.time,x=b.x,y=b.y,final=b.kind==='shoggoth';
    const open=['open','eyeOpen','stunned'].includes(b.state),restored=['defeated','melting','falsebloom'].includes(b.state);
    const w=final?o.shog.W:o.boss.CAP_W,h=final?o.shog.H:o.boss.CAP_H;
    if(!final){
      if(Number.isFinite(b.crownX)&&['attack','warn','rise'].includes(b.state)){
        const tx=b.crownX,ty=(b.homeY||y)-h-5;
        g.strokeStyle='#f3bf7c';g.lineWidth=1;g.setLineDash([3,3]);g.strokeRect(tx-25,ty-5,50,10);g.setLineDash([]);
        line(g,[[tx-5,ty-12],[tx,ty-7],[tx+5,ty-12]],'#f3bf7c',1.3);
      }
      const cy=y-13;glow(g,x,cy,66,open?'172,245,199':'92,83,75');
      g.fillStyle=restored?'#9c806e':'#3f3d4c';g.beginPath();g.moveTo(x-w/2,cy+7);g.quadraticCurveTo(x-w*.4,cy-15,x-w*.2,cy-18);g.quadraticCurveTo(x-w*.08,cy-30,x,cy-22);g.quadraticCurveTo(x+w*.12,cy-34,x+w*.23,cy-17);g.quadraticCurveTo(x+w*.43,cy-18,x+w/2,cy+7);g.closePath();g.fill();
      for(let i=-3;i<=3;i++){const bx=x+i*11;line(g,[[bx,cy+7],[bx+i*2,cy-6-Math.abs(i)*2],[bx+i*3,cy-15]],i%2?'#6a6170':'#81717a',2);}
      line(g,[[x-w/2+7,y-h],[x-w*.18,y-h-3],[x+w*.18,y-h-3],[x+w/2-7,y-h]],open?'#b5f3cb':'#a69688',2);
      if(open){const ey=y-h-3;glow(g,x,ey,25,'172,245,199');flower(g,x,ey,10,'#b5f3cb',t*.1);oval(g,x,ey,3,5,'#f5ffe2');}
      if(b.state==='defeated')flower(g,x,cy-20,7,'#f0c58f');
      return;
    }
    const floor=o.shog.FLOOR,cy=y+h*.5;
    glow(g,x,cy,72,open?'170,238,207':'86,66,126');
    const flesh=g.createLinearGradient(x-20,y-4,x+10,y+h);flesh.addColorStop(0,'#786282');flesh.addColorStop(.25,'#45465e');flesh.addColorStop(.65,'#252538');flesh.addColorStop(1,'#151e2a');g.fillStyle=flesh;g.beginPath();g.moveTo(x-w/2+5,y+h-3);g.quadraticCurveTo(x-w/2-9,cy+8,x-w/2+4,y+8);g.quadraticCurveTo(x-w*.2,y-10,x-8,y+4);g.quadraticCurveTo(x+2,y-8,x+11,y+5);g.quadraticCurveTo(x+w*.35,y-8,x+w/2-3,y+7);g.quadraticCurveTo(x+w/2+10,cy+12,x+w/2-5,y+h-3);g.closePath();g.fill();
    // Wet, folding tendrils move along the silhouette and leave the center readable.
    for(let i=0;i<8;i++){
      const ox=(i-3.5)*7, wave=Math.sin(t*2.1+i*1.7)*2;
      g.strokeStyle=i%2?'#52455f':'#64707a';g.lineWidth=i%2?2:1;g.beginPath();
      g.moveTo(x+ox,y+h-2);g.bezierCurveTo(x+ox+wave*3,cy+9,x+ox-wave*2,y+2,x+ox*.7,y+6+wave);g.stroke();
    }
    for(let i=0;i<28;i++){
      const xx=x-27+(i*17%54),yy=y+7+(i*11%25);
      oval(g,xx,yy,.55,.8,i%3?'rgba(166,164,167,.17)':'rgba(199,180,183,.35)');
    }
    for(const [dx,dy,r] of [[-20,12,2.3],[-10,25,2],[4,10,2.8],[20,18,2],[1,31,1.4]]){
      const ex=x+dx,ey=y+dy;
      oval(g,ex,ey,r+2,r+1,'#131b28',-.25);oval(g,ex,ey,r+1,r*.68,'#d3b18a',-.25);
      oval(g,ex+(b.dir||1)*.45,ey,.65,r*.7,'#171823');oval(g,ex-.6,ey-.45,.4,.3,'#ffe4b4');
      line(g,[[ex-r-1,ey-1],[ex,ey-r*.8],[ex+r+1,ey-1]],'#68566c',.8);
    }
    if(open){
      glow(g,x,cy+3,23,'144,229,194');
      g.fillStyle='#17232a';g.beginPath();g.moveTo(x-13,cy-8);g.quadraticCurveTo(x+5,cy-3,x+12,cy+12);g.quadraticCurveTo(x-7,cy+8,x-13,cy-8);g.fill();
      line(g,[[x-10,cy-6],[x,cy+2],[x+9,cy+9]],'#a5ecc8',3);
      line(g,[[x-10,cy-6],[x,cy+2],[x+9,cy+9]],'#ebffe2',.7);
    }
    if(b.state==='grin')line(g,[[x-14,cy+13],[x-6,cy+17],[x+3,cy+13],[x+12,cy+17]],'#d7a7cf',1.5);
    if(b.state==='lungeWarn'&&Number.isFinite(b.lungeEnd)){g.fillStyle='rgba(243,191,124,.13)';g.fillRect(Math.min(x,b.lungeEnd)-w/2,y,Math.abs(x-b.lungeEnd)+w,h);line(g,[[x,floor-2],[b.lungeEnd,floor-2]],'#f3bf7c',2);}
    if(b.state==='lungeWarn'||b.state==='lunge'){const dir=b.dir||1,tip=x+dir*(w/2+22);line(g,[[x+dir*w/2,cy+7],[tip,cy+7]],'#bba1df',2);line(g,[[tip-dir*7,cy+1],[tip,cy+7],[tip-dir*7,cy+13]],'#ead9ff',2);}
    if(open){const ey=b.state==='eyeOpen'?y-37:y+18;glow(g,x,ey,24,'170,238,207');oval(g,x,ey,7,9,'#9ee6c1');oval(g,x+1,ey,2.5,5,'#1b2030');line(g,[[x,cy],[x,y-20],[x,ey]],'#8fb89f',2);}
    for(const tn of b.tents||[]){if(!tn.live){g.fillStyle='rgba(243,191,124,.14)';g.fillRect(tn.x,floor-o.shog.TENT_H,o.shog.TENT_W,o.shog.TENT_H);g.strokeStyle='#f3bf7c';g.lineWidth=1;g.setLineDash([3,4]);g.strokeRect(tn.x,floor-o.shog.TENT_H,o.shog.TENT_W,o.shog.TENT_H);g.setLineDash([]);line(g,[[tn.x,floor-2],[tn.x+o.shog.TENT_W,floor-2]],'#c8a9dc',3);for(let j=0;j<3;j++)line(g,[[tn.x+j*8,floor-7],[tn.x+j*8+3,floor-12],[tn.x+j*8+6,floor-7]],'#e4d2ef',1);}else{const hh=o.shog.TENT_H;g.fillStyle='#514061';g.fillRect(tn.x,floor-hh,o.shog.TENT_W,hh);for(let j=0;j<5;j++)line(g,[[tn.x+o.shog.TENT_W/2,floor-j*hh/5],[tn.x+3+(j%2)*14,floor-j*hh/5-8]],'#80639a',2);}}
    for(const r of b.rollers||[]){oval(g,r.x+6,floor-6,6,6,'#6f5b8e');oval(g,r.x+6,floor-7,2,2,'#e0c8ee');line(g,[[r.x+2,floor-6],[r.x+10,floor-6]],'#b495c8',1);}
    for(const m of b.minions||[]){if(m.dead)continue;oval(g,m.x+7,m.y+8,5,4,'#55446d');oval(g,m.x+7,m.y+3,7,4,'#9277ad');oval(g,m.x+5,m.y+2,2,1,'#d9cbed');}
  }
  root.SporelingGuardians={barrow,chorus,boar,heart};
})(typeof window!=='undefined'?window:globalThis);
