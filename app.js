/* Спільний код для всіх сторінок застосунку "Базис". */

(function applyFontScale(){
  try{
    const saved = localStorage.getItem('basis_font_scale');
    const scale = saved ? parseFloat(saved) : 1;
    document.documentElement.style.setProperty('--fs', scale);
  }catch(e){}
})();

function initFireflies(){
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const container = document.getElementById('fireflies');
  if(reduceMotion || !container) return;
  const COUNT = 18;
  for(let i = 0; i < COUNT; i++){
    const el = document.createElement('div');
    el.className = 'firefly';
    const left = Math.random() * 100;
    const duration = 14 + Math.random() * 14;
    const delay = Math.random() * 20;
    const drift = (Math.random() * 80 - 40).toFixed(0) + 'px';
    const size = (2 + Math.random() * 2.5).toFixed(1) + 'px';
    el.style.left = left + 'vw';
    el.style.width = size;
    el.style.height = size;
    el.style.animationDuration = duration + 's';
    el.style.animationDelay = '-' + delay + 's';
    el.style.setProperty('--drift', drift);
    container.appendChild(el);
  }
}

function registerServiceWorker(){
  if('serviceWorker' in navigator){
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }
}

// Показує тонкий фейд-градієнт унизу картки, якщо контент не влазить і потребує прокрутки.
function initScrollFade(scrollElId, fadeElId){
  const scrollEl = document.getElementById(scrollElId);
  const fadeEl = document.getElementById(fadeElId);
  if(!scrollEl || !fadeEl) return;

  function update(){
    const hasMore = scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight > 4;
    fadeEl.classList.toggle('visible', hasMore);
  }

  scrollEl.addEventListener('scroll', update);
  window.addEventListener('resize', update);
  // Невелика затримка, щоб контент встиг відрендеритись перед першим виміром.
  setTimeout(update, 50);

  return update;
}

document.addEventListener('DOMContentLoaded', () => {
  initFireflies();
  registerServiceWorker();
});
