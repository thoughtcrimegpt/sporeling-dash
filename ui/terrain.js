/* High resolution, low contrast terrain ink. World rendering stays bounded to
 * visible tiles, so this remains cheap even for long chambers. */
(function (root) {
  "use strict";
  var tiles = Object.create(null), TAU = Math.PI * 2;
  var palettes = {
    earth: { soil: "#44383a", soil2: "#57423d", moss: "#8cac78", moss2: "#b8c889", stone: "#756b67", crack: "#2a2830" },
    dusk: { soil: "#34353f", soil2: "#454550", moss: "#769481", moss2: "#9eb990", stone: "#666776", crack: "#222430" },
    root: { soil: "#3d3039", soil2: "#59414a", moss: "#8b9d78", moss2: "#c1bd87", stone: "#776269", crack: "#29232f" }
  };
  function code(v) { if (v && typeof v === "object") v = v.type || v.tile || v.kind; return String(v == null ? "" : v).toLowerCase(); }
  function solid(v) { var c=code(v); return c==="#"||c==="ground"||c==="dirt"||c==="soil"||c==="x"||c==="q"||c==="stone"; }
  function tileCanvas(tile,pal,mask,type,variant){
    const key=[tile,pal,mask,type,variant].join(":");if(tiles[key])return tiles[key];
    if(typeof document==="undefined")return null;
    const cv=document.createElement("canvas");cv.width=cv.height=tile*4;const g=cv.getContext("2d");g.scale(4,4);
    const p=palettes[pal]||palettes.earth,top=mask.includes("top");
    g.fillStyle=p.soil;g.fillRect(0,0,tile,tile);
    // Quiet earth wash, no tile-shaped highlights or checkerboard noise.
    const wash=g.createLinearGradient(0,0,0,tile);wash.addColorStop(0,top?p.soil2:p.soil);wash.addColorStop(1,p.soil);g.fillStyle=wash;g.fillRect(0,0,tile,tile);
    for(let i=0;i<3;i++){const xx=(variant*7+i*11)%16,yy=(variant*3+i*7)%16;
      g.fillStyle=i%2?'rgba(218,192,145,.05)':'rgba(18,28,22,.09)';g.beginPath();g.ellipse(xx,yy,3+(variant%3),1.5,-.3,0,TAU);g.fill();
    }
    if(top){
      g.fillStyle=p.moss;g.beginPath();g.moveTo(0,0);g.lineTo(16,0);g.lineTo(16,2.5);g.quadraticCurveTo(12,3+(variant%3),8,2.5);g.quadraticCurveTo(4,4,0,2.5);g.fill();
      g.strokeStyle=p.moss2;g.lineWidth=.65;g.beginPath();g.moveTo(0,.35);g.lineTo(16,.35);g.stroke();
      g.strokeStyle='rgba(169,157,102,.3)';g.lineWidth=.65;g.beginPath();g.moveTo(3+variant%9,2);g.bezierCurveTo(8,6,2,8,6,14);g.stroke();
      g.strokeStyle='rgba(135,147,94,.4)';g.beginPath();g.moveTo(12,2);g.quadraticCurveTo(10,5,14,7);g.stroke();
    }
    if(type==='x'){g.save();g.beginPath();g.rect(0,0,tile,tile);g.clip();g.fillStyle='#6d7a75';g.fillRect(1,0,14,16);g.strokeStyle='#aebba0';g.lineWidth=1;for(let i=-16;i<32;i+=6){g.beginPath();g.moveTo(i,0);g.lineTo(i+16,16);g.stroke();}g.restore();}
    if(type==='q'){g.strokeStyle='#ead4a3';g.lineWidth=.8;g.strokeRect(1.5,1.5,13,13);g.strokeStyle='#b5a17c';g.beginPath();g.moveTo(7,2);g.lineTo(9,7);g.lineTo(5,10);g.lineTo(7,15);g.stroke();g.beginPath();g.moveTo(9,7);g.lineTo(14,5);g.stroke();}
    tiles[key]=cv;return cv;
  }
  function drawTerrain(g,o){o=o||{};var tile=o.tile||16,cols=o.cols||20,rows=o.rows||12,camX=Number(o.camX)||0,camY=Number(o.camY)||0,pal=o.palette||"earth",margin=2;
    var left=Math.max(0,Math.floor(camX/tile)-margin),right=Math.min(cols-1,Math.ceil((camX+(o.width||g.canvas.width))/tile)+margin),top=Math.max(0,Math.floor(camY/tile)-margin),bottom=Math.min(rows-1,Math.ceil((camY+(o.height||g.canvas.height))/tile)+margin);
    for(var r=top;r<=bottom;r++)for(var c=left;c<=right;c++){var v=o.tileAt&&o.tileAt(c,r),kind=code(v);if(!solid(v))continue;var mask="";if(!o.tileAt||!solid(o.tileAt(c,r-1)))mask+="top";var variant=((c*17+r*31+(o.seed||0))%16+16)%16,art=tileCanvas(tile,pal,mask,kind,variant);if(art)g.drawImage(art,c*tile,r*tile,tile,tile);else{g.fillStyle=(palettes[pal]||palettes.earth).soil;g.fillRect(c*tile,r*tile,tile,tile);}}
  }
  function drawSpikes(g,o){
    const tile=o.tile||16,cx=o.camX||0,cy=o.camY||0;
    g.save();g.fillStyle="#cd8e7f";g.strokeStyle="#f0c2a3";g.lineWidth=.5;
    for(const sp of o.spikes||[]){const x=sp.tx*tile,y=sp.ty*tile;if(x<cx-tile||x>cx+o.width||y<cy-tile||y>cy+o.height)continue;
      for(let i=0;i<4;i++){g.beginPath();const a=i*4;
        if(sp.dir==="up"){g.moveTo(x+a,y+16);g.lineTo(x+a+2,y+5);g.lineTo(x+a+4,y+16);}
        else if(sp.dir==="down"){g.moveTo(x+a,y);g.lineTo(x+a+2,y+11);g.lineTo(x+a+4,y);}
        else if(sp.dir==="right"){g.moveTo(x,y+a);g.lineTo(x+11,y+a+2);g.lineTo(x,y+a+4);}
        else {g.moveTo(x+16,y+a);g.lineTo(x+5,y+a+2);g.lineTo(x+16,y+a+4);}
        g.closePath();g.fill();g.stroke();
      }
    }g.restore();
  }
  root.SporelingTerrain={drawTerrain:drawTerrain,drawSpikes:drawSpikes,clearCache:function(){tiles=Object.create(null);}};
})(typeof globalThis!=="undefined"?globalThis:window);
