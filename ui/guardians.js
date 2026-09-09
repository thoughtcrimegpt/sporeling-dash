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
    g.save();g.translate(b.x,side?floor-25:b.y);g.scale(b.dir||1,1);
    const skin=g.createLinearGradient(0,0,0,34);skin.addColorStop(0,'#bd9770');skin.addColorStop(1,'#826343');
    oval(g,0,side?14:20,35,side?12:15,skin);
    oval(g,24,side?15:18,13,12,'#c8a27c');oval(g,36,side?18:23,10,7,'#d5b194');
    oval(g,33,side?18:23,1.7,2,'#856046');oval(g,39,side?18:23,1.7,2,'#856046');
    leaf(g,20,9,7,-.55,'#907451');leaf(g,29,10,6,.65,'#a1815d');
    for(let i=0;i<9;i++)leaf(g,-25+i*6,9+Math.sin(i)*2,4,-.5,'#625b3d');
    for(const xx of [-20,13]){oval(g,xx,side?3:30,4,side?5:6,'#6c523d');oval(g,xx,side?0:33,4,2,'#463d31');}
    eye(g,23,side?14:16,b.state==='defeated');
    if(b.state==='warn'||b.state==='rebound')line(g,[[19,12],[27,14]],'#53472f',2);
    // A leafy flank patch matches nikitaFlankBox; it opens only after a crash.
    if(b.state==='side'){glow(g,0,2,25);oval(g,0,2,15,5,'#b8f1c8');leaf(g,0,6,5,0,'#52755a');}
    else{leaf(g,-8,19,5,-.6,'#889d58');leaf(g,-7,19,4,.7,'#afbb75');}
    line(g,[[-33,15],[-39,11],[-37,8],[-34,10]],'#9e835d',2);
    if(b.state==='charge')for(let i=0;i<3;i++)oval(g,-40-i*8,31,4+i,2,'rgba(220,194,147,.3)');
    if(b.state==='defeated')flower(g,-5,2,6,'#efd292');
    g.restore();
  }
  function heart(g,b,o){
    const t=o.reducedMotion?0:o.time,x=b.x,y=b.y,final=b.kind==='shoggoth';
    const restored=['defeated','melting','falsebloom'].includes(b.state),open=['open','eyeOpen','stunned'].includes(b.state);
    const w=final?o.shog.W:o.boss.CAP_W,h=final?o.shog.H:o.boss.CAP_H;
    const cy=final?y+h*.5:y-h*.5;
    glow(g,x,cy,70,restored?'248,213,144':open?'172,245,199':'196,175,124');
    if(final && (b.state==='lungeWarn'||b.state==='lunge')){
      const dir=b.dir||1, tip=x+dir*(w/2+22);
      // A directional trail and lifted leaf fan are readable without flashing.
      line(g,[[x+dir*w/2,cy+8],[tip,cy+8]],'#efbb79',2);
      line(g,[[tip-dir*7,cy+2],[tip,cy+8],[tip-dir*7,cy+14]],'#ffdf9e',2);
      for(let i=0;i<3;i++)leaf(g,x-dir*(w/2-8)+i*dir*6,cy-h*.25,9,dir*(-.7-i*.1),'#dcc18d');
    }
    // Interwoven branches form an old sleeping face, with a flowering crown.
    for(let i=0;i<7;i++){
      const xx=x+(i-3)*w/7;
      g.strokeStyle=i%2?'#7d8062':'#626e53';g.lineWidth=6;g.lineCap='round';g.beginPath();g.moveTo(xx,final?y+h:y+24);g.bezierCurveTo(xx-12,cy+8,xx+10,cy-5,xx,cy-h*.45);g.stroke();
      leaf(g,xx,cy-h*.3,8,(i-3)*.35,restored?'#9faf66':'#82906c');
    }
    const wood=g.createLinearGradient(x,cy-h/2,x,cy+h/2);wood.addColorStop(0,'#b1aa7c');wood.addColorStop(1,'#697c5a');
    oval(g,x,cy,w/2,h/2,wood);
    for(let i=-2;i<=2;i++){const xx=x+i*w*.18,yy=cy-h*.43-Math.abs(i)*2;leaf(g,xx,yy,8,i*.35,'#a5b878');flower(g,xx,yy-7,restored?9:5,restored?'#f7d59d':'#c4ae9f',Math.sin(t+i)*.03);}
    eye(g,x-11,cy,restored);eye(g,x+11,cy,restored);
    if(final && b.state==='grin'){
      oval(g,x,cy+8,10,5,'#4c5c41');
      for(const dx of [-5,0,5]){oval(g,x+dx,cy+9,2,2,'#f2c486');}
      line(g,[[x-15,cy+12],[x-21,cy+15]],'#f6d59b',1.5);
      line(g,[[x+15,cy+12],[x+21,cy+15]],'#f6d59b',1.5);
    }else line(g,[[x-5,cy+7],[x,cy+9],[x+5,cy+7]],'#546147',1);
    if(open){const ey=!final?y-h-3:b.state==='eyeOpen'?y-37:b.state==='stunned'?y+18:cy;
      if(b.state==='eyeOpen')line(g,[[x,cy],[x,y-22],[x,ey]],'#9cac77',3);
      flower(g,x,ey,b.state==='eyeOpen'?9:12,'#b5f3cb',0);oval(g,x,ey,4,4,'#f5ffe2');
      if(!final){line(g,[[x-5,ey-18],[x,ey-12],[x+5,ey-18]],'#ddffca',1.6);line(g,[[x-w/2+6,y-h],[x+w/2-6,y-h]],'#b5f3cb',2);}
    }
    if(!final)return;
    for(const tn of b.tents||[]){const fy=o.shog.FLOOR;
      if(!tn.live){line(g,[[tn.x,fy-2],[tn.x+o.shog.TENT_W,fy-2]],'#ffc18a',3);for(let j=0;j<3;j++)line(g,[[tn.x+j*8,fy-7],[tn.x+j*8+3,fy-12],[tn.x+j*8+6,fy-7]],'#ffe3b3',1);}
      else{const hh=o.shog.TENT_H;g.fillStyle='#a08a67';g.fillRect(tn.x,fy-hh,o.shog.TENT_W,hh);for(let j=0;j<5;j++)leaf(g,tn.x+o.shog.TENT_W/2,fy-j*hh/5,8,(j%2?1:-1),'#c9a572');}
    }
    for(const r of b.rollers||[]){oval(g,r.x+6,o.shog.FLOOR-6,6,6,'#e3b579');line(g,[[r.x+2,o.shog.FLOOR-6],[r.x+10,o.shog.FLOOR-6]],'#947246',1);}
    for(const m of b.minions||[]){if(m.dead)continue;oval(g,m.x+7,m.y+8,5,4,'#e7dbac');oval(g,m.x+7,m.y+3,7,4,'#afd29c');oval(g,m.x+5,m.y+2,2,1,'#edf2c5');}
  }
  root.SporelingGuardians={barrow,chorus,boar,heart};
})(typeof window!=='undefined'?window:globalThis);
