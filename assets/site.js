(function(){
  if(location.hash)return;
  try{if('scrollRestoration' in history)history.scrollRestoration='manual'}catch(e){}
  var user=false,t0=Date.now();
  function mark(){user=true}
  ['wheel','touchstart','keydown','mousedown'].forEach(function(e){window.addEventListener(e,mark,{passive:true,once:true})});
  function top(){if(!user&&!location.hash)window.scrollTo(0,0)}
  top();
  document.addEventListener('DOMContentLoaded',top);
  window.addEventListener('load',top);
  window.addEventListener('pageshow',top);
  (function loop(){top();if(!user&&Date.now()-t0<2000)requestAnimationFrame(loop)})();
})();

window.__t0=Date.now();
(function(){
  var root=document.documentElement;
  function setLang(l){
    root.setAttribute('data-lang',l);
    document.querySelectorAll('option[data-uk]').forEach(function(o){o.textContent=o.dataset[l]||o.dataset.uk});
    root.setAttribute('lang',l==='uk'?'uk':'en');
    document.querySelectorAll('[data-set-lang]').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.setLang===l?'true':'false')});
    try{localStorage.setItem('wm-lang',l)}catch(e){}
  }
  var saved=null;try{saved=localStorage.getItem('wm-lang')}catch(e){}
  if(!saved){saved=(navigator.language||'uk').toLowerCase().indexOf('uk')===0?'uk':'en'}
  setLang(saved==='en'?'en':'uk');
  document.querySelectorAll('[data-set-lang]').forEach(function(b){b.addEventListener('click',function(){setLang(b.dataset.setLang)})});
  var bf=document.getElementById('brief');if(bf)bf.addEventListener('submit',function(e){
    e.preventDefault();var ok=true;
    ['f-name','f-contact'].forEach(function(id){var el=document.getElementById(id);if(!el.value.trim()){el.style.borderColor='var(--accent)';ok=false}else{el.style.borderColor=''}});
    if(!ok)return;
    var btn=bf.querySelector('button[type=submit]'),okB=document.getElementById('form-ok'),errB=document.getElementById('form-err');
    var fd=new FormData(bf);fd.delete('need');fd.append('need',[].map.call(bf.querySelectorAll('[name=need]:checked'),function(c){return c.value}).join(','));
    fd.append('t',String(window.__t0||0));fd.append('page',location.href);
    btn.disabled=true;okB.hidden=true;errB.hidden=true;
    fetch(bf.action,{method:'POST',body:fd}).then(function(r){return r.json()}).then(function(d){
      if(d&&d.ok){okB.hidden=false;bf.reset();bf.querySelectorAll('input,textarea,select,button[type=submit]').forEach(function(e){if(e.type!=='submit')e.blur()})}else{errB.hidden=false}
    }).catch(function(){errB.hidden=false}).finally(function(){btn.disabled=false});
  });
})();
(function(){
  var fb=document.querySelectorAll('[data-filter]');if(!fb.length)return;
  fb.forEach(function(b){b.addEventListener('click',function(){
    var f=b.dataset.filter;
    fb.forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});
    document.querySelectorAll('.work .tile').forEach(function(t){t.hidden=!(f==='all'||(' '+t.dataset.cat+' ').indexOf(' '+f+' ')>-1)});
  })});
})();
(function(){
  document.querySelectorAll('[data-carousel]').forEach(function(c){
    var tr=c.querySelector('.rev-track'),dots=c.querySelector('.car-dots'),prev=c.querySelector('[data-car="prev"]'),next=c.querySelector('[data-car="next"]');
    var items=[].slice.call(tr.children);
    function perView(){return Math.max(1,Math.round(tr.clientWidth/items[0].getBoundingClientRect().width))}
    function pages(){return Math.max(1,items.length-perView()+1)}
    function cur(){var x=tr.scrollLeft,best=0,d=1e9;items.forEach(function(it,i){var dd=Math.abs(it.offsetLeft-items[0].offsetLeft-x);if(dd<d){d=dd;best=i}});return best}
    function go(i){i=Math.max(0,Math.min(pages()-1,i));tr.scrollTo({left:items[i].offsetLeft-items[0].offsetLeft,behavior:'smooth'})}
    function build(){dots.innerHTML='';for(var i=0;i<pages();i++){var b=document.createElement('button');b.type='button';b.setAttribute('aria-label',String(i+1));(function(n){b.addEventListener('click',function(){go(n)})})(i);dots.appendChild(b)}sync()}
    function sync(){var i=cur(),n=pages();[].forEach.call(dots.children,function(b,k){b.setAttribute('aria-current',k===i?'true':'false')});prev.disabled=i<=0;next.disabled=i>=n-1||tr.scrollLeft+tr.clientWidth>=tr.scrollWidth-4}
    prev.addEventListener('click',function(){go(cur()-1)});next.addEventListener('click',function(){go(cur()+1)});
    var t;tr.addEventListener('scroll',function(){clearTimeout(t);t=setTimeout(sync,60)});
    var w=window.innerWidth;window.addEventListener('resize',function(){if(window.innerWidth!==w){w=window.innerWidth;build()}});
    build();
  });
})();

(function(){
  document.querySelectorAll('.screen .reel').forEach(function(v){
    function ok(){v.parentNode.classList.add('has-video')}
    if(v.readyState>=2)ok();else v.addEventListener('loadeddata',ok);
  });
})();
(function(){
  document.querySelectorAll('[data-snd]').forEach(function(b){
    var v=b.parentNode.querySelector('video');if(!v)return;
    b.addEventListener('click',function(){
      var on=v.muted;v.muted=!on;if(on){v.currentTime=0;var p=v.play();if(p&&p.catch)p.catch(function(){})}
      b.setAttribute('aria-pressed',on?'true':'false');
    });
  });
})();
(function(){
  var v=document.querySelector('.screen .reel');if(!v)return;
  var br=v.closest('.browser'),ph=br.querySelector('.playhead'),tc=br.querySelector('.tc b'),rec=br.querySelector('.rec');
  var FPS=30;
  function fmt(t){t=Math.max(0,t||0);var f=Math.floor((t%1)*FPS),s=Math.floor(t),p=function(n){return(n<10?'0':'')+n};
    return p(Math.floor(s/3600))+':'+p(Math.floor(s/60)%60)+':'+p(s%60)+':'+p(f)}
  function meta(){if(!v.duration||!isFinite(v.duration))return;br.classList.add('live');if(rec)rec.textContent='REC '+fmt(v.duration)}
  function tick(){if(v.duration){ph.style.setProperty('--p',(v.currentTime/v.duration).toFixed(5));tc.textContent=fmt(v.currentTime)}requestAnimationFrame(tick)}
  if(v.readyState>=1)meta();else v.addEventListener('loadedmetadata',meta);
  requestAnimationFrame(tick);
  ph.addEventListener('click',function(e){if(!v.duration)return;var r=ph.getBoundingClientRect();v.currentTime=Math.min(v.duration-0.05,Math.max(0,(e.clientX-r.left)/r.width*v.duration))});
})();
(function(){
  var vs=document.querySelectorAll('video[data-inview]');if(!vs.length||!('IntersectionObserver' in window))return;
  var io=new IntersectionObserver(function(es){es.forEach(function(e){var v=e.target;
    if(e.isIntersecting){if(v.preload==='none')v.preload='auto';var p=v.play();if(p&&p.catch)p.catch(function(){})}else if(!v.paused)v.pause()})},{threshold:.35});
  vs.forEach(function(v){io.observe(v)});
})();
(function(){
  var vs=[].slice.call(document.querySelectorAll('video[data-inview]'));if(!vs.length)return;
  function solo(v){vs.forEach(function(o){if(o!==v&&!o.muted){o.muted=true}})}
  vs.forEach(function(v){
    v.addEventListener('pointerdown',function(){if(v.muted){v.muted=false;solo(v);var p=v.play();if(p&&p.catch)p.catch(function(){})}});
    v.addEventListener('volumechange',function(){if(!v.muted)solo(v)});
  });
  function fs(){var el=document.fullscreenElement||document.webkitFullscreenElement;if(el&&el.tagName==='VIDEO'){el.muted=false;solo(el)}}
  document.addEventListener('fullscreenchange',fs);document.addEventListener('webkitfullscreenchange',fs);
})();
(function(){
  var tiles=[].slice.call(document.querySelectorAll('.tile'));
  tiles.forEach(function(t){
    var v=t.querySelector('.tile-vid');if(!v)return;
    if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    function play(){if(v.preload==='none')v.preload='auto';var p=v.play();if(p&&p.then)p.then(function(){t.classList.add('is-playing')}).catch(function(){})}
    function stop(){v.pause();t.classList.remove('is-playing')}
    var hover=window.matchMedia&&window.matchMedia('(hover: hover)').matches;
    if(hover){t.addEventListener('mouseenter',play);t.addEventListener('mouseleave',stop);t.addEventListener('focus',play);t.addEventListener('blur',stop)}
    else if('IntersectionObserver' in window){
      new IntersectionObserver(function(es){es.forEach(function(e){e.isIntersecting?play():stop()})},{threshold:.6}).observe(t);
    }
  });
})();
(function(){
  document.querySelectorAll('.dd').forEach(function(d){
    var b=d.querySelector('.dd-btn');
    b.addEventListener('click',function(e){e.stopPropagation();var o=d.classList.toggle('open');b.setAttribute('aria-expanded',o?'true':'false')});
    document.addEventListener('click',function(e){if(!d.contains(e.target)){d.classList.remove('open');b.setAttribute('aria-expanded','false')}});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'){d.classList.remove('open');b.setAttribute('aria-expanded','false')}});
  });
  document.querySelectorAll('[data-goto-filter]').forEach(function(a){
    a.addEventListener('click',function(){var f=document.querySelector('[data-filter="'+a.dataset.gotoFilter+'"]');if(f)f.click()});
  });
})();
(function(){
  var g=document.getElementById('work-grid'),b=document.querySelector('[data-more]');if(!g||!b)return;
  var box=b.parentNode,n=b.querySelector('[data-more-n]'),extra=g.querySelectorAll('.tile.extra');
  var labels={uk:['Показати всі роботи','Згорнути'],en:['Show all work','Show less']};
  function sync(){var open=!g.classList.contains('collapsed');b.setAttribute('aria-expanded',open?'true':'false');
    var sp=b.querySelectorAll('span[lang]');sp[0].textContent=labels.uk[open?1:0];sp[1].textContent=labels.en[open?1:0];n.textContent=open?'':'+'+extra.length}
  b.addEventListener('click',function(){var was=!g.classList.contains('collapsed');g.classList.toggle('collapsed');sync();
    if(!was){var first=g.querySelector('.tile.extra');if(first)first.scrollIntoView({behavior:'smooth',block:'start'})}else{box.scrollIntoView({behavior:'smooth',block:'end'})}});
  document.querySelectorAll('[data-filter]').forEach(function(f){f.addEventListener('click',function(){
    var all=f.dataset.filter==='all';g.classList.toggle('collapsed',all);box.hidden=!all;sync()})});
  sync();
})();
(function(){
  var nav=document.querySelector('header.nav'),links=nav&&nav.querySelector('.nav-links'),right=nav&&nav.querySelector('.nav-right');if(!links||!right)return;
  var b=document.createElement('button');b.type='button';b.className='burger';b.setAttribute('aria-label','Menu');b.setAttribute('aria-expanded','false');b.innerHTML='<i></i><i></i><i></i>';
  right.appendChild(b);
  var cta=right.querySelector('.btn-primary');if(cta){var c=cta.cloneNode(true);c.classList.remove('btn-sm');c.classList.add('nav-cta-m');links.appendChild(c)}
  function set(o){nav.classList.toggle('menu-open',o);document.body.classList.toggle('menu-lock',o);b.setAttribute('aria-expanded',o?'true':'false')}
  b.addEventListener('click',function(){set(!nav.classList.contains('menu-open'))});
  links.addEventListener('click',function(e){if(e.target.closest('a'))set(false)});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')set(false)});
  window.addEventListener('resize',function(){if(window.innerWidth>=1000)set(false)});
})();
(function(){
  var L={uk:['Читати повністю','Згорнути'],en:['Read more','Show less']};
  function lang(){return document.documentElement.getAttribute('data-lang')==='en'?'en':'uk'}
  var revs=[].slice.call(document.querySelectorAll('.rev'));
  revs.forEach(function(r){
    var b=document.createElement('button');b.type='button';b.className='more-rev';b.hidden=true;
    var who=r.querySelector('.who');r.insertBefore(b,who||null);
    b.addEventListener('click',function(){r.classList.toggle('open');sync()});
    r._b=b;
  });
  function sync(){var l=lang();revs.forEach(function(r){
    var t=r.querySelector(l==='en'?'blockquote':'.tr');if(!t)return;
    var open=r.classList.contains('open');
    r._b.hidden=!open&&t.scrollHeight<=t.clientHeight+2;
    r._b.textContent=L[l][open?1:0];
  })}
  document.querySelectorAll('[data-set-lang]').forEach(function(b){b.addEventListener('click',function(){setTimeout(sync,0)})});
  window.addEventListener('resize',sync);window.addEventListener('load',sync);sync();
})();
