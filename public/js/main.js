/* ---- bloque 0 ---- */
/**
 * Ejecuta una función una sola vez, cuando el elemento está por entrar en pantalla
 * (400 px antes). Así las galerías pesadas no descargan fotos ni usan la tarjeta
 * gráfica hasta que el visitante se acerca a ellas.
 */
window.JF_alAcercarse = function (elemento, funcion) {
  if (!elemento) return;
  if (!("IntersectionObserver" in window)) { funcion(); return; }
  var observador = new IntersectionObserver(function (entradas) {
    if (entradas.some(function (e) { return e.isIntersecting; })) {
      observador.disconnect();
      funcion();
    }
  }, { rootMargin: "400px 0px" });
  observador.observe(elemento);
};

/**
 * ¿Puede este navegador dibujar 3D (WebGL)? Algunos celulares antiguos, navegadores con la
 * aceleración por hardware desactivada o en modo de ahorro no pueden. Se comprueba una sola vez.
 */
window.JF_webglDisponible = (function () {
  try {
    var lienzo = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (lienzo.getContext("webgl2") || lienzo.getContext("webgl")));
  } catch (error) {
    return false;
  }
})();

/**
 * Muestra un mensaje dentro de una sección (por ejemplo, si una galería no puede cargarse).
 * Usa textContent: el texto nunca se interpreta como HTML.
 */
window.JF_mostrarAviso = function (contenedor, texto) {
  if (!contenedor) return;
  var aviso = contenedor.querySelector(".aviso-galeria") || document.createElement("p");
  aviso.className = "aviso-galeria";
  aviso.setAttribute("role", "status");
  aviso.textContent = texto;
  contenedor.appendChild(aviso);
};

/* ---- bloque 1 ---- */
/* Copia la foto del hero a la capa de fondo desenfocada */
(function(){
  function apply(){
    var hero=document.querySelector('.hero-section');
    var bd=hero&&hero.querySelector('.hero-backdrop');
    if(!bd) return;
    var bg=getComputedStyle(hero,'::before').backgroundImage;
    if(bg&&bg!=='none') bd.style.backgroundImage=bg;
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',apply); else apply();
})();

/* ---- bloque 2 ---- */
(function(){var a=document.querySelector("#layered-hero-a img");["b","c"].forEach(function(k){document.querySelector("#layered-hero-"+k+" img").src=a.src;});})();

/* ---- bloque 3 ---- */
/* Celular: usa versiones pequeñas recortadas al centro en "A través del lente" */
(function(){
  var MOBILE_LENTE="img/hero/a-traves-del-lente-jeniffer-valle-movil.webp";
  var imgs=document.querySelectorAll('#layered-motion-gallery .layered-hero img');
  if(!imgs.length) return;
  var full=imgs[0].src, mq=window.matchMedia('(max-width:768px)');
  function sync(){ var src=mq.matches?MOBILE_LENTE:full; imgs.forEach(function(i){ if(i.src!==src) i.src=src; }); }
  sync();
  if(mq.addEventListener) mq.addEventListener('change',sync); else if(mq.addListener) mq.addListener(sync);
})();

/* ---- bloque 4 ---- */
/* Cámara 3D: la persona se toma una foto y la ve en la pantalla de la cámara */
(function(){
  var section=document.getElementById('camara-3d');
  var modal=document.getElementById('selfieModal');
  if(!section||!modal) return;
  var video=document.getElementById('selfieVideo'), msg=document.getElementById('selfieMsg');
  var btnOpen=document.getElementById('selfieOpen'), lblOpen=document.getElementById('selfieOpenLabel');
  var btnCap=document.getElementById('selfieCapture'), btnCancel=document.getElementById('selfieCancel');
  var btnBack=document.getElementById('selfieBack'), dl=document.getElementById('selfieDownload');
  var shot=document.getElementById('selfieShot'), flash=document.getElementById('selfieFlash');
  var count=document.getElementById('selfieCount');
  var fb=document.getElementById('selfieFallback'), fileIn=document.getElementById('selfieFile');
  var view=modal.querySelector('.selfie-modal__view');
  function useFallback(t){ setMsg(t,true); fb.hidden=false; btnCap.hidden=true; view.style.display='none'; }
  var stream=null, busy=false;
  var DEFAULT_MSG='Para tomarte la foto, permite el acceso a la cámara cuando tu navegador te lo pida.';

  function setMsg(t,err){ msg.textContent=t; msg.classList.toggle('error',!!err); }
  function stop(){ if(stream){ stream.getTracks().forEach(function(t){t.stop();}); stream=null; } video.srcObject=null; }
  function close(){ stop(); modal.hidden=true; document.documentElement.style.overflow=''; count.textContent=''; busy=false; btnOpen.focus(); }

  async function open(){
    modal.hidden=false; document.documentElement.style.overflow='hidden';
    btnCap.disabled=true; btnCap.hidden=false; fb.hidden=true; view.style.display=''; setMsg(DEFAULT_MSG);
    if(!window.isSecureContext||!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){
      useFallback('Tu navegador no permite la cámara en vivo aquí. Toca “Abrir la cámara del celular” para tomarte la foto.');
      return;
    }
    try{
      stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1280},height:{ideal:960}},audio:false});
      video.srcObject=stream; await video.play().catch(function(){});
      btnCap.disabled=false; setMsg('¡Listo! Sonríe y presiona “Tomar foto”.');
    }catch(e){
      var n=e&&e.name;
      if(n==='NotAllowedError'||n==='SecurityError') useFallback('No diste permiso para usar la cámara. Permite el acceso en tu navegador y vuelve a intentarlo, o toca “Abrir la cámara del celular”.');
      else if(n==='NotFoundError'||n==='OverconstrainedError') useFallback('No encontramos una cámara disponible. Puedes intentar con “Abrir la cámara del celular”.');
      else if(n==='NotReadableError') useFallback('La cámara está siendo usada por otra aplicación. Ciérrala o toca “Abrir la cámara del celular”.');
      else useFallback('No se pudo encender la cámara. Toca “Abrir la cámara del celular” para tomarte la foto.');
    }
  }

  function capture(){
    if(!stream||busy) return; busy=true; btnCap.disabled=true;
    var n=3; count.textContent=n;
    var t=setInterval(function(){
      n--; if(n>0){ count.textContent=n; return; }
      clearInterval(t); count.textContent='';
      var w=video.videoWidth||1280, h=video.videoHeight||960;
      var c=document.createElement('canvas'); c.width=w; c.height=h;
      var ctx=c.getContext('2d'); ctx.translate(w,0); ctx.scale(-1,1); ctx.drawImage(video,0,0,w,h);
      var data=c.toDataURL('image/jpeg',0.9);
      close();
      show(data);
    },1000);
  }

  function show(data){
    shot.style.backgroundImage='url("'+data+'")';
    dl.href=data; dl.setAttribute('download','mi-foto-jeniffer-photography.jpg'); dl.hidden=false; btnBack.hidden=false; lblOpen.textContent='Tomar otra foto';
    section.scrollIntoView({behavior:'smooth',block:'center'});
    flash.classList.add('on');
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ flash.classList.remove('on'); }); });
    section.classList.add('selfie-mode');
  }

  fileIn.addEventListener('change',function(){
    var f=fileIn.files&&fileIn.files[0]; if(!f) return;
    var url=URL.createObjectURL(f), img=new Image();
    img.onload=function(){
      var max=1280, k=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));
      var c=document.createElement('canvas'); c.width=Math.round(img.naturalWidth*k); c.height=Math.round(img.naturalHeight*k);
      var ctx=c.getContext('2d'); ctx.translate(c.width,0); ctx.scale(-1,1); ctx.drawImage(img,0,0,c.width,c.height);
      URL.revokeObjectURL(url); fileIn.value='';
      close(); show(c.toDataURL('image/jpeg',0.9));
    };
    img.onerror=function(){ URL.revokeObjectURL(url); setMsg('No se pudo leer la foto. Inténtalo de nuevo.',true); };
    img.src=url;
  });
  btnOpen.addEventListener('click',open);
  btnCap.addEventListener('click',capture);
  btnCancel.addEventListener('click',close);
  modal.addEventListener('click',function(e){ if(e.target===modal) close(); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&!modal.hidden) close(); });
  btnBack.addEventListener('click',function(){
    var on=section.classList.toggle('selfie-mode');
    btnBack.textContent=on?'Ver la animación':'Ver mi foto';
  });
})();

/* ---- bloque 5 ---- */
(function () {
  const root = document.querySelector(".css-camera-section");
  if (!root) return;
  const names = ["one","two","three","four","five","six","seven","eight","nine","ten",
    "eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen",
    "nineteen","twenty","twentyone","twentytwo","twentythree","twentyfour","twentyfive",
    "twentysix","twentyseven","twentyeight","twentynine","thirty","thirtyone","thirtytwo",
    "thirtythree","thirtyfour","thirtyfive","thirtysix"];
  root.querySelectorAll(".depths").forEach(function (container) {
    names.forEach(function (name) {
      const part = document.createElement("div");
      part.className = "depth " + name;
      container.appendChild(part);
    });
  });
  const groups = [
    [".handle .radius", 10, "one two three four five six seven eight nine ten"],
    [".trigger .radius", 18, "one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen"],
    [".flash .radius", 10, "one two three four five six seven eight nine ten"]
  ];
  groups.forEach(function (item) {
    const target = root.querySelector(item[0]);
    if (!target) return;
    item[2].split(" ").forEach(function (name) {
      const part = document.createElement("div"); part.className = name; target.appendChild(part);
    });
  });
  const triggerTwo = root.querySelector(".trigger.two .radius");
  if (triggerTwo) {
    "one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen".split(" ").forEach(function(name){
      const part=document.createElement("div"); part.className=name; triggerTwo.appendChild(part);
    });
  }
})();

/* ---- bloque 6 ---- */
/* ============================================================
   1) CURSOR + OVERLAYS
   ============================================================ */
(function () {
  "use strict";

  document.body.addEventListener("mousemove", function (n) {
    t.style.left = n.clientX + "px"; t.style.top = n.clientY + "px";
    e.style.left = n.clientX + "px"; e.style.top = n.clientY + "px";
    i.style.left = n.clientX + "px"; i.style.top = n.clientY + "px";
  });
  var t = document.getElementById("cursor"),
      e = document.getElementById("cursor2"),
      i = document.getElementById("cursor3");

  function n() { e.classList.add("hover"); i.classList.add("hover"); }
  function s() { e.classList.remove("hover"); i.classList.remove("hover"); }
  s();

  for (var r = document.querySelectorAll(".hover-target"), a = r.length - 1; a >= 0; a--) o(r[a]);
  function o(el) { el.addEventListener("mouseover", n); el.addEventListener("mouseout", s); }

  // [clase que abre, clase que cierra, nombre del panel] — sin jQuery: JavaScript nativo.
  const PANELES = [
    ["about-text", "about-close", "about"],
    ["contact-text", "contact-close", "contact"],
    ["travel", "travel-close", "travel"],
    ["wildlife", "wildlife-close", "wildlife"],
    ["nature", "nature-close", "nature"],
  ];
  PANELES.forEach(([abre, cierra, panel]) => {
    document.querySelectorAll("." + abre).forEach((el) => el.addEventListener("click", () => document.body.classList.add(panel + "-on")));
    document.querySelectorAll("." + cierra).forEach((el) => el.addEventListener("click", () => document.body.classList.remove(panel + "-on")));
  });
})();

/* ============================================================
   SECCIÓN INTERMEDIA — MOVIMIENTO 3D CON EL RATÓN
   Conversión del fragmento TweenMax a GSAP 3
   ============================================================ */
(function () {
  "use strict";

  const section = document.getElementById("layered-motion-gallery");
  const heroA = document.querySelector("#layered-hero-a img");
  const heroB = document.querySelector("#layered-hero-b img");
  const heroC = document.querySelector("#layered-hero-c img");

  if (!section || !heroA || !heroB || !heroC || typeof gsap === "undefined") return;

  gsap.set([heroA, heroB, heroC], {
    transformStyle: "preserve-3d",
    transformOrigin: "center center"
  });

  let moveX = 0;
  let moveY = 0;
  let rafId = null;

  function updateLayers() {
    rafId = null;

    gsap.to(heroA, {
      duration: 1,
      rotationY: 0.05 * moveX,
      rotationX: 0.20 * moveY,
      rotationZ: -0.1,
      transformPerspective: 500,
      transformOrigin: "center center",
      ease: "power2.out",
      overwrite: true
    });

    gsap.to(heroB, {
      duration: 1,
      rotationY: 0.10 * moveX,
      rotationX: 0.15 * moveY,
      rotationZ: 0,
      transformPerspective: 500,
      transformOrigin: "center center",
      ease: "power2.out",
      overwrite: true
    });

    gsap.to(heroC, {
      duration: 1,
      rotationY: 0.15 * moveX,
      rotationX: 0.10 * moveY,
      rotationZ: 0.10,
      transformPerspective: 500,
      transformOrigin: "center center",
      ease: "power2.out",
      overwrite: true
    });
  }

  section.addEventListener("pointermove", function (event) {
    const rect = section.getBoundingClientRect();

    moveX = ((event.clientX - rect.left) / rect.width) * 100 - 50;
    moveY = ((event.clientY - rect.top) / rect.height) * 100 - 50;

    if (!rafId) rafId = requestAnimationFrame(updateLayers);
  });

  section.addEventListener("pointerleave", function () {
    moveX = 0;
    moveY = 0;
    if (!rafId) rafId = requestAnimationFrame(updateLayers);
  });
})();

/* Fotos locales del sitio (índices usados en sliders, galerías y secciones) */


/* ============================================================
   2) SLIDER 3D (múltiples instancias)
   ============================================================ */
(function () {
  "use strict";


  const QUINCE_SLIDES = [
    { img: JF_PHOTOS[0], title: "Brillo", text: "Luz, color y una mirada que lo dice todo." },
    { img: JF_PHOTOS[1], title: "Elegancia", text: "Un vestido que parece una nube turquesa." },
    { img: JF_PHOTOS[2], title: "Cariño", text: "Un beso en la frente lleno de amor y orgullo." },
    { img: JF_PHOTOS[3], title: "Majestad", text: "Una reina lista para brillar en su noche especial." },
    { img: JF_PHOTOS[4], title: "Estilo", text: "Elegancia en cada detalle, bajo el verde de la naturaleza." },
  ];
  const BODA_SLIDES = [
    { img: JF_PHOTOS[5], title: "Baile", text: "Risas y un vals que se quedan en el corazón." },
    { img: JF_PHOTOS[6], title: "Promesa", text: "Un beso frente al altar, la promesa de toda una vida." },
    { img: JF_PHOTOS[7], title: "Familia", text: "Los que más quieres, siempre a tu lado en el gran día." },
    { img: JF_PHOTOS[8], title: "Amor", text: "Dos corazones unidos, listos para comenzar su historia." },
    { img: JF_PHOTOS[9], title: "Celebración", text: "Alegría, compañía y un amor que se celebra en grande." },
  ];
  const CUMPLE_SLIDES = [
    { img: JF_PHOTOS[10], title: "Burbujas", text: "Magia y risas entre pompas de jabón." },
    { img: JF_PHOTOS[17], title: "Tres añitos", text: "Un globo, una corona y mucha ilusión." },
    { img: JF_PHOTOS[20], title: "Diversión", text: "Sonrisas y juegos en su día especial." },
    { img: JF_PHOTOS[21], title: "Hermanos", text: "Compartir la fiesta con los más pequeños de la familia." },
    { img: JF_PHOTOS[22], title: "Sirenita", text: "Una fiesta inspirada en su princesa favorita." },
    { img: JF_PHOTOS[23], title: "Cinco años", text: "Brillo, color y un pastel lleno de sorpresas." },
  ];
  const SLIDE_SETS = { boda: BODA_SLIDES, quinceanos: QUINCE_SLIDES, cumpleanos: CUMPLE_SLIDES };

  const IMG_CLASS = "slider__images-item";
  const TEXT_CLASS = "slider__text-item";
  const ACTIVE_IMG_CLASS  = IMG_CLASS  + "--active";
  const ACTIVE_TEXT_CLASS = TEXT_CLASS + "--active";

  function lerp({ x, y }, { x: tx, y: ty }) {
    const f = 0.1;
    x += (tx - x) * f;
    y += (ty - y) * f;
    return { x, y };
  }

  class Slider {
    constructor(el) {
      this.el = el;
      this.contentEl = el.querySelector(".slider__content");
      this.dotsEl    = el.querySelector(".slider__nav-dots");
      this.leftEl    = el.querySelector(".slider__nav-arrow--left");
      this.rightEl   = el.querySelector(".slider__nav-arrow--right");

      this.onMouseMove = this.onMouseMove.bind(this);
      this.onResize    = this.onResize.bind(this);

      this.activeImg  = el.getElementsByClassName(ACTIVE_IMG_CLASS);
      this.activeText = el.getElementsByClassName(ACTIVE_TEXT_CLASS);
      this.images     = el.getElementsByTagName("img");

      this.dotsEl.addEventListener("click", this.onDotClick.bind(this));
      this.leftEl.addEventListener("click", this.prev.bind(this));
      this.rightEl.addEventListener("click", this.next.bind(this));
      window.addEventListener("resize", this.onResize);

      this.onResize();
      this.length = this.images.length;
      this.lastX = this.lastY = this.targetX = this.targetY = 0;
    }

    onResize() {
      const htmlStyles = getComputedStyle(document.documentElement);
      const mobileBreakpoint = htmlStyles.getPropertyValue("--mobile-bkp");
      const isMobile = this.isMobile = matchMedia(`only screen and (max-width: ${mobileBreakpoint})`).matches;
      this.halfWidth  = innerWidth  / 2;
      this.halfHeight = innerHeight / 2;
      this.zDistance  = htmlStyles.getPropertyValue("--z-distance");

      if (!isMobile && !this.mouseWatched) {
        this.mouseWatched = true;
        this.el.addEventListener("mousemove", this.onMouseMove);
        if (this.activeImg[0]) this.el.style.setProperty("--img-prev", `url(${this.images[+this.activeImg[0].dataset.id - 1].src})`);
        this.contentEl.style.setProperty("transform", `translateZ(${this.zDistance})`);
      } else if (isMobile && this.mouseWatched) {
        this.mouseWatched = false;
        this.el.removeEventListener("mousemove", this.onMouseMove);
        this.contentEl.style.setProperty("transform", "none");
      }
    }

    getMouseCoefficients({ pageX, pageY } = {}) {
      const xCoeff = ((pageX || this.targetX) - this.halfWidth) / this.halfWidth;
      const yCoeff = (this.halfHeight - (pageY || this.targetY)) / this.halfHeight;
      return { xCoeff, yCoeff };
    }

    onMouseMove({ pageX, pageY }) {
      this.targetX = pageX; this.targetY = pageY;
      if (!this.animationRunning) { this.animationRunning = true; this.runAnimation(); }
    }

    runAnimation() {
      if (this.animationStopped) { this.animationRunning = false; return; }
      const newPos = lerp({ x: this.lastX, y: this.lastY }, { x: this.targetX, y: this.targetY });
      const { xCoeff, yCoeff } = this.getMouseCoefficients({ pageX: newPos.x, pageY: newPos.y });
      this.lastX = newPos.x; this.lastY = newPos.y;
      this.positionImage({ xCoeff, yCoeff });
      this.contentEl.style.setProperty("transform", `translateZ(${this.zDistance}) rotateX(${10 * yCoeff}deg) rotateY(${10 * xCoeff}deg)`);
      if (this.reachedFinalPoint) { this.animationRunning = false; }
      else requestAnimationFrame(this.runAnimation.bind(this));
    }

    get reachedFinalPoint() {
      const lastX = ~~this.lastX, lastY = ~~this.lastY;
      return (lastX == this.targetX || lastX - 1 == this.targetX || lastX + 1 == this.targetX)
          && (lastY == this.targetY || lastY - 1 == this.targetY || lastY + 1 == this.targetY);
    }

    positionImage({ xCoeff, yCoeff }) {
      if (!this.activeImg[0]) return;
      const currentImage = this.activeImg[0].children[0];
      if (!currentImage) return;
      currentImage.style.setProperty("transform", `translateX(${-1 * xCoeff}em) translateY(${1 * yCoeff}em)`);
    }

    onDotClick({ target }) {
      if (this.inTransit) return;
      const dot = target.closest(".slider__nav-dot");
      if (!dot) return;
      const nextId = dot.dataset.id;
      if (this.activeImg[0].dataset.id == nextId) return;
      this.startTransition(nextId);
    }

    transitionItem(nextId) {
      const self = this, el = this.el;
      const currentImg = this.activeImg[0];
      const currentId = currentImg.dataset.id;
      const subActiveClass = `${IMG_CLASS}--subactive`;
      const transitClass   = `${IMG_CLASS}--transit`;
      const nextImg  = el.querySelector(`.${IMG_CLASS}[data-id='${nextId}']`);
      const nextText = el.querySelector(`.${TEXT_CLASS}[data-id='${nextId}']`);

      let outClass = "", inClass = "";
      this.animationStopped = true;
      nextText.classList.add(ACTIVE_TEXT_CLASS);
      el.style.setProperty("--from-left", nextId);
      currentImg.classList.remove(ACTIVE_IMG_CLASS);
      currentImg.classList.add(subActiveClass);

      if (currentId < nextId) { outClass = `${IMG_CLASS}--next`; inClass = `${IMG_CLASS}--prev`; }
      else { outClass = `${IMG_CLASS}--prev`; inClass = `${IMG_CLASS}--next`; }

      nextImg.classList.add(outClass);

      requestAnimationFrame(() => {
        nextImg.classList.add(transitClass, ACTIVE_IMG_CLASS);
        nextImg.classList.remove(outClass);
        this.animationStopped = false;
        this.positionImage(this.getMouseCoefficients());
        currentImg.classList.add(transitClass, inClass);

        const onEnd = function (e) {
          e.stopPropagation();
          nextImg.classList.remove(transitClass);
          self.inTransit = false;
          this.className = IMG_CLASS;
          this.removeEventListener("transitionend", onEnd);
        };
        currentImg.addEventListener("transitionend", onEnd);
      });

      if (!this.isMobile) this.switchBackgroundImage(nextId);
    }

    startTransition(nextId) {
      if (this.inTransit) return;
      const self = this;
      const activeText = this.activeText[0];
      const backwardsClass = `${TEXT_CLASS}--backwards`;
      this.inTransit = true;
      activeText.classList.add(backwardsClass);
      activeText.classList.remove(ACTIVE_TEXT_CLASS);

      const onEnd = function (e) {
        if (!e.pseudoElement) {
          e.stopPropagation();
          requestAnimationFrame(() => self.transitionItem(nextId));
          this.removeEventListener("transitionend", onEnd);
        }
      };
      activeText.addEventListener("transitionend", onEnd);
      requestAnimationFrame(() => activeText.classList.remove(backwardsClass));
    }

    next() {
      if (this.inTransit) return;
      let nextId = +this.activeImg[0].dataset.id + 1;
      if (nextId > this.length) nextId = 1;
      this.startTransition(nextId);
    }

    prev() {
      if (this.inTransit) return;
      let nextId = +this.activeImg[0].dataset.id - 1;
      if (nextId < 1) nextId = this.length;
      this.startTransition(nextId);
    }

    switchBackgroundImage(nextId) {
      const bgClass = "slider--bg-next";
      const el = this.el;
      const imageUrl = `url(${this.images[+nextId - 1].src})`;

      el.style.setProperty("--img-next", imageUrl);
      el.addEventListener("transitionend", function onEnd(e) {
        if (e.target === el) {
          el.style.setProperty("--img-prev", imageUrl);
          el.classList.remove(bgClass);
          el.removeEventListener("transitionend", onEnd);
        }
      });
      el.classList.add(bgClass);
    }
  }

  function buildSlider(el) {
    const slides = SLIDE_SETS[el.dataset.slider] || BODA_SLIDES;
    el.innerHTML = `
      <div class="slider__content">
        <div class="slider__images"></div>
        <div class="slider__text"></div>
      </div>
      <div class="slider__nav">
        <div class="slider__nav-arrows">
          <div class="slider__nav-arrow slider__nav-arrow--left">left</div>
          <div class="slider__nav-arrow slider__nav-arrow--right">right</div>
        </div>
        <div class="slider__nav-dots"></div>
      </div>
    `;

    const imagesEl2 = el.querySelector(".slider__images");
    const textEl   = el.querySelector(".slider__text");
    const dotsEl   = el.querySelector(".slider__nav-dots");
    imagesEl2.innerHTML = ""; textEl.innerHTML = ""; dotsEl.innerHTML = "";

    slides.forEach((s, i) => {
      const n = i + 1;
      const item = document.createElement("div");
      item.className = IMG_CLASS + (i === 0 ? " " + ACTIVE_IMG_CLASS : "");
      item.dataset.id = n;
      const img = document.createElement("img");
      // La foto no se descarga hasta que se abre la galería (ver cargarFotosAlAbrir).
      img.dataset.src = s.img; img.alt = s.title; img.decoding = "async";
      item.appendChild(img); imagesEl2.appendChild(item);

      const text = document.createElement("div");
      text.className = TEXT_CLASS + (i === 0 ? " " + ACTIVE_TEXT_CLASS : "");
      text.dataset.id = n;
      // Se construye con textContent (no innerHTML): aunque algún día los textos vinieran
      // de otra fuente, nunca se interpretarían como HTML ni como código.
      const cabeza = document.createElement("div");
      cabeza.className = "slider__text-item-head";
      const titulo = document.createElement("h3");
      titulo.textContent = s.title;
      cabeza.appendChild(titulo);
      const info = document.createElement("div");
      info.className = "slider__text-item-info";
      const parrafo = document.createElement("p");
      parrafo.textContent = s.text;
      info.appendChild(parrafo);
      text.append(cabeza, info);
      textEl.appendChild(text);

      const dot = document.createElement("div");
      dot.className = "slider__nav-dot" + (i === 0 ? " slider__nav-dot--active" : "");
      dot.dataset.id = n;
      dotsEl.appendChild(dot);
    });

    new Slider(el);
  }

  document.querySelectorAll("[data-slider]").forEach(buildSlider);

  /**
   * Descarga las fotos de una galería solo cuando se abre (cuando <body> recibe la clase
   * travel-on, wildlife-on o nature-on). Antes se descargaban 16 fotos grandes al abrir
   * la página aunque nadie viera las galerías.
   */
  function cargarFotosAlAbrir() {
    document.querySelectorAll("[data-slider]").forEach((el) => {
      const panel = el.parentElement.className.split("-")[0]; // travel | wildlife | nature
      if (el.dataset.cargado || !document.body.classList.contains(panel + "-on")) return;
      el.dataset.cargado = "1";
      el.querySelectorAll("img[data-src]").forEach((img) => {
        img.addEventListener("error", () => { img.alt = "No se pudo cargar esta foto. Revisa tu conexión."; }, { once: true });
        img.src = img.dataset.src;
      });
      const activa = el.querySelector("." + ACTIVE_IMG_CLASS + " img");
      if (activa) {
        el.style.setProperty("--img-prev", `url(${activa.src})`);
        // Indicador de carga mientras llega la primera foto (se quita al cargar o al fallar).
        if (!activa.complete) {
          el.dataset.cargando = "1";
          const listo = () => { delete el.dataset.cargando; };
          activa.addEventListener("load", listo, { once: true });
          activa.addEventListener("error", () => {
            listo();
            window.JF_mostrarAviso(el, "No se pudo cargar la galería. Revisa tu conexión e inténtalo de nuevo.");
          }, { once: true });
        }
      }
    });
  }
  new MutationObserver(cargarFotosAlAbrir).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  cargarFotosAlAbrir();
})();

/* ============================================================
   3) FLY TEXT
   ============================================================ */
(function () {
  gsap.registerPlugin(ScrollTrigger);

  const DEFAULTS = {
    windAngle: 25, windStrength: 400, scatter: 80, maxRotation: 360,
    stagger: 0.5, depth: 120, reverse: false, order: "random",
    randomness: 0, gustiness: 0, gustFrequency: 1, gustPhaseSpread: 1,
    startY: null, animationDuration: 1, easing: null,
  };

  function sfc32(a, b, c, d) {
    return function () {
      a |= 0; b |= 0; c |= 0; d |= 0;
      const t = (a + b | 0) + d | 0;
      d = d + 1 | 0;
      a = b ^ (b >>> 9);
      b = c + (c << 3) | 0;
      c = (c << 21) | (c >>> 11);
      c = c + t | 0;
      return (t >>> 0) / 4294967296;
    };
  }
  function seededRandom(seed) {
    let s = seed >>> 0;
    const splitmix32 = () => {
      s = (s + 0x9e3779b9) | 0;
      let t = s ^ (s >>> 16);
      t = Math.imul(t, 0x21f0aaad); t = t ^ (t >>> 15);
      t = Math.imul(t, 0x735a2d97); return (t ^ (t >>> 15)) >>> 0;
    };
    const rand = sfc32(splitmix32(), splitmix32(), splitmix32(), splitmix32());
    for (let i = 0; i < 12; i++) rand();
    return rand;
  }

  const seed = 42;
  let r = seededRandom(seed);
  const rand = (min, max) => min + r() * (max - min);
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  function buildStructure(el, text) {
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    el.textContent = "";
    const srEl = document.createElement("span");
    srEl.className = "visually-hidden"; srEl.textContent = text; el.appendChild(srEl);
    const placeholder = document.createElement("span");
    placeholder.setAttribute("aria-hidden", "true");
    placeholder.style.cssText = "visibility:hidden; pointer-events:none; user-select:none;";
    placeholder.textContent = text; el.appendChild(placeholder);
    const overlay = document.createElement("span");
    overlay.setAttribute("aria-hidden", "true");
    overlay.style.cssText = "position:absolute; top:0; left:0; width:100%; height:100%; overflow:visible; pointer-events:none;";
    el.appendChild(overlay);
    return { placeholder, overlay };
  }

  function measureAndCreateChars(el, raw, placeholder, overlay) {
    const containerRect = el.getBoundingClientRect();
    const textNode = placeholder.firstChild;
    const chars = [];
    for (let i = 0; i < raw.length; i++) {
      if (raw[i] === " ") continue;
      const range = document.createRange();
      range.setStart(textNode, i); range.setEnd(textNode, i + 1);
      const rc = range.getBoundingClientRect();
      const span = document.createElement("span");
      span.textContent = raw[i]; span.classList.add("fly-char");
      span.style.cssText = ["position:absolute", `left:${rc.left - containerRect.left}px`, `top:${rc.top - containerRect.top}px`, `width:${rc.width}px`, `height:${rc.height}px`, "white-space:nowrap"].join(";");
      span._x = rc.left - containerRect.left;
      overlay.appendChild(span); chars.push(span);
    }
    const xs = chars.map((c) => c._x);
    const xMin = Math.min(...xs); const xRange = Math.max(...xs) - xMin || 1;
    chars.forEach((c) => { c._normX = (c._x - xMin) / xRange; });
    return chars;
  }

  function charStartTime(char, total, order, stagger, randomness = 0) {
    if (total <= 1) return 0;
    const x = char._normX;
    let ordered;
    switch (order) {
      case "ltr": ordered = x * stagger; break;
      case "rtl": ordered = (1 - x) * stagger; break;
      case "outward": ordered = (1 - Math.abs(x - 0.5) * 2) * stagger; break;
      default: return rand(0, stagger);
    }
    return ordered * (1 - randomness) + rand(0, stagger) * randomness;
  }

  function buildTimeline(el, chars, p) {
    const { reverse, windAngle, windStrength, scatter, maxRotation, depth, order, stagger, randomness, gustiness, gustFrequency, gustPhaseSpread, easing } = p;
    const tl = gsap.timeline({ paused: true });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const from = reverse ? { opacity: 0 } : { opacity: 1 };
      const to   = reverse ? { opacity: 1 } : { opacity: 0 };
      tl.fromTo(el, from, { ...to, duration: 1 });
      return tl;
    }
    const rad = (windAngle * Math.PI) / 180;
    const windX = Math.cos(rad), windY = -Math.sin(rad);
    const perpX = Math.sin(rad), perpY = Math.cos(rad);
    const sharedAmp = gustiness > 0 ? rand(0.1, 1.0) * gustiness * (r() > 0.5 ? 1 : -1) : 0;

    chars.forEach((char, i) => {
      const startTime = charStartTime(char, chars.length, order, stagger, randomness);
      const duration  = rand(1 - randomness * 0.5, 1 + randomness * 0.5);
      const scatterAngle = rand(0, Math.PI * 2);
      const scatterDist  = rand(0, scatter);
      const syncPhase  = Math.PI * gustFrequency * startTime;
      const indexPhase = (i / Math.max(1, chars.length - 1)) * Math.PI * 2;
      const phase = lerp(syncPhase, indexPhase, gustPhaseSpread);
      const fx = windX * windStrength + Math.cos(scatterAngle) * scatterDist;
      const fy = windY * windStrength + Math.sin(scatterAngle) * scatterDist;
      const fz = rand(-depth, depth);
      const rx = rand(-maxRotation, maxRotation);
      const ry = rand(-maxRotation * 0.7, maxRotation * 0.7);
      const rz = rand(-maxRotation * 0.3, maxRotation * 0.3);
      const scattered = { x: fx, y: fy, z: fz, rotationX: rx, rotationY: ry, rotationZ: rz, opacity: 0 };
      const natural   = { x: 0,  y: 0,  z: 0,  rotationX: 0,  rotationY: 0,  rotationZ: 0,  opacity: 1 };

      if (gustiness > 0) {
        const individualAmp = rand(0.1, 1.0) * gustiness * (r() > 0.5 ? 1 : -1);
        const amp = lerp(sharedAmp, individualAmp, gustPhaseSpread);
        const s0 = Math.sin(phase);
        const s1 = Math.sin(Math.PI * gustFrequency + phase);
        const gustSine = (t) => amp * (Math.sin(Math.PI * gustFrequency * t + phase) - s0 - t * (s1 - s0));
        const sineAt = (t) => {
          const s = reverse ? 1 - t : t;
          return { x: s * fx + perpX * gustSine(t), y: s * fy + perpY * gustSine(t), z: s * fz, rotationX: rx * s, rotationY: ry * s, rotationZ: rz * s, opacity: clamp01((1 - s) / 0.6) };
        };
        gsap.set(char, sineAt(0));
        const proxy = { t: 0 };
        tl.to(proxy, {
          t: 1, duration,
          ease: easing ? easing : "power3.in",
          immediateRender: true,
          onUpdate() { gsap.set(char, sineAt(proxy.t)); },
        }, startTime);
      } else {
        const [from, to] = reverse ? [scattered, natural] : [natural, scattered];
        tl.fromTo(char, from, { ...to, duration, ease: easing ?? (reverse ? "power3.out" : "power3.in") }, startTime);
      }
    });

    const animDuration = parseFloat(p.animationDuration);
    if (animDuration > 0 && animDuration < 1) tl.call(() => {}, [], tl.duration() / animDuration);
    return tl;
  }

  function initFlyText(el) {
    const d = el.dataset;
    const p = { ...DEFAULTS, ...d };
    const raw = el.textContent.replace(/\s+/g, " ").trim();
    const { placeholder, overlay } = buildStructure(el, raw);
    let st = null, tl = null;

    function setup() {
      if (st) st.kill(); if (tl) tl.kill();
      overlay.innerHTML = "";
      const chars = measureAndCreateChars(el, raw, placeholder, overlay);
      if (!chars.length) return;
      gsap.set(chars, { transformPerspective: 500 });
      tl = buildTimeline(el, chars, p);
      const { startY, reverse } = p;
      const startPct = Math.round((startY ?? (reverse ? 0.85 : 0.65)) * 100);
      st = ScrollTrigger.create({
        trigger: el,
        start: `top ${startPct}%`,
        end: reverse ? "top 20%" : "bottom top",
        scrub: 1,
        animation: tl,
      });
    }
    setup();

    let resizeTimer, lastW = 0, lastH = 0;
    const ro = new ResizeObserver(([entry]) => {
      r = seededRandom(seed);
      const { inlineSize: w, blockSize: h } = entry.contentBoxSize[0];
      if (w === lastW && h === lastH) return;
      lastW = w; lastH = h;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(setup, 200);
    });
    ro.observe(el);
  }

  document.fonts.ready.then(() => {
    document.querySelectorAll(".fly-text").forEach(initFlyText);
  });
})();

/* ============================================================
   4) THREE.JS — GALERÍA ESPIRAL
   ============================================================ */
(function () {
  const imageUrls = (window.JF_SPIRAL_PHOTOS || []).concat(window.JF_SPIRAL_PHOTOS || []);

  const numberOfImages = imageUrls.length;
  let scene, camera, renderer, spiralMesh, tiltGroup, shaderMaterial;
  let scrollOffset = 0;
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };
  let dragRotation = { x: 0, z: 0 };
  let baseRotation = { x: 0, z: 0 };
  let imageRatios = [];
  let originalPositions = [];
  let targetVelocity = 0;
  let currentVelocity = 0;

  let inertiaParams = { friction: 0.94, strength: 0.8, maxSpeed: 0.05, directionSmoothing: 0.92, scrollSensitivity: 0.0008 };

  let config = {
    imageHeight: 7, curvature: -0.030, gapSize: 0,
    spiralRadius: 3.5,
    spiralTurns: 2.8 + (numberOfImages - 21) * 0.1,
    spiralHeight: 12 + (numberOfImages - 21) * 0.25,
    centerX: 0, centerY: 0.25, centerZ: 0
  };

  function setupTouchControls() {
    const container = document.getElementById('spiral-gallery');
    container.style.pointerEvents = 'auto';
    let touchStartY = 0, touchLastY = 0, touchVelocity = 0;
    let isTouching = false, lastTouchTimestamp = 0;

    container.addEventListener('touchstart', (e) => {
      isTouching = true; touchStartY = e.touches[0].clientY; touchLastY = touchStartY;
      touchVelocity = 0; lastTouchTimestamp = performance.now();
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
      if (!isTouching) return;
      const now = performance.now();
      let deltaTime = Math.min(32, now - lastTouchTimestamp);
      if (deltaTime < 1) deltaTime = 16;
      lastTouchTimestamp = now;
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - touchLastY;
      const rawVelocity = deltaY * inertiaParams.scrollSensitivity * inertiaParams.strength * 0.5;
      touchVelocity = touchVelocity * 0.7 + rawVelocity * 0.3;
      let deltaScroll = deltaY * inertiaParams.scrollSensitivity * inertiaParams.strength * 0.8;
      scrollOffset += deltaScroll; updateUVOffset();
      touchLastY = currentY;
    }, { passive: true });

    container.addEventListener('touchend', () => {
      isTouching = false;
      if (Math.abs(touchVelocity) > 0.001) {
        targetVelocity = touchVelocity * 1.2;
        targetVelocity = Math.max(-inertiaParams.maxSpeed * 1.5, Math.min(inertiaParams.maxSpeed * 1.5, targetVelocity));
      }
      touchVelocity = 0;
    });
  }

  function updateTouchInertia() {}

  function rebuildGeometry() {
    if (!spiralMesh) return;
    const totalSlots = imageRatios.length;
    const widths = imageRatios.map(r => r * config.imageHeight);
    const totalWidth = widths.reduce((a, b) => a + b, 0);
    const segmentsW = 200 + totalSlots * 20;
    const segmentsH = 24;
    const geometry = new THREE.PlaneGeometry(totalWidth, config.imageHeight, segmentsW, segmentsH);
    const positions = geometry.attributes.position;
    const uvs = geometry.attributes.uv;
    let origX = [], origY = [];
    for (let i = 0; i < positions.count; i++) { origX.push(positions.getX(i)); origY.push(positions.getY(i)); }

    let cumulative = [0];
    for (let i = 0; i < totalSlots; i++) cumulative.push(cumulative[i] + widths[i] / totalWidth);
    const imageRatio = 1 - config.gapSize;

    for (let i = 0; i < uvs.count; i++) {
      let u = uvs.getX(i);
      u = Math.max(0, Math.min(0.999999, u));
      let found = false;
      for (let j = 0; j < totalSlots; j++) {
        if (u >= cumulative[j] && u < cumulative[j + 1]) {
          let localU = (u - cumulative[j]) / (cumulative[j + 1] - cumulative[j]);
          if (localU > imageRatio) uvs.setX(i, cumulative[j + 1] - 0.001);
          else {
            let scaledU = localU / imageRatio;
            scaledU = Math.max(0.001, Math.min(0.999, scaledU));
            uvs.setX(i, cumulative[j] + scaledU * (cumulative[j + 1] - cumulative[j]));
          }
          found = true; break;
        }
      }
      if (!found) uvs.setX(i, cumulative[totalSlots] - 0.001);
    }

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const nx = x / (totalWidth / 2);
      const curve = config.curvature * 0.4 * (nx * nx - 1);
      positions.setXYZ(i, x, positions.getY(i), -curve);
    }

    for (let i = 0; i < positions.count; i++) {
      const x = origX[i], y = origY[i];
      let t = (x + totalWidth / 2) / totalWidth;
      t = Math.max(0, Math.min(1, t));
      const angle = t * Math.PI * 2 * config.spiralTurns;
      const radius = config.spiralRadius * (1 - t * 0.12);
      let px = Math.sin(angle) * radius;
      let pz = Math.cos(angle) * radius;
      let py = (t - 0.5) * config.spiralHeight + y * 0.35;
      if (!originalPositions[i]) originalPositions[i] = { offsetX: (Math.random() - 0.5) * 0.001, offsetY: (Math.random() - 0.5) * 0.001, offsetZ: (Math.random() - 0.5) * 0.001 };
      px += originalPositions[i].offsetX; py += originalPositions[i].offsetY; pz += originalPositions[i].offsetZ;
      positions.setXYZ(i, px, py, pz);
    }
    geometry.computeVertexNormals();
    const oldGeo = spiralMesh.geometry;
    spiralMesh.geometry = geometry;
    if (oldGeo) oldGeo.dispose();
    if (shaderMaterial) shaderMaterial.uniforms.gap.value = config.gapSize;
  }

  function updateUVOffset() {
    if (!shaderMaterial) return;
    let offset = scrollOffset;
    while (offset >= 1.0) offset -= 1.0;
    while (offset < 0) offset += 1.0;
    shaderMaterial.uniforms.offset.value = offset;
  }

  function createMasterTexture() {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const baseHeight = 500;
      const LOCAL = window.JF_PHOTOS || [];
      const slots = new Array(numberOfImages);
      const settled = new Array(numberOfImages).fill(false);

      const finish = () => {
        const list = slots.map((d, idx) => d || { img: null, width: baseHeight * (imageRatios[idx] || 0.8), height: baseHeight });
        const rawW = list.reduce((sum, d) => sum + d.width, 0) || baseHeight;
        const k = Math.min(1, 16000 / rawW);
        canvas.width = Math.floor(rawW * k);
        canvas.height = Math.floor(baseHeight * k);
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        let offsetX = 0;
        list.forEach((d) => {
          if (d.img) ctx.drawImage(d.img, offsetX, 0, d.width * k, d.height * k);
          offsetX += d.width * k;
        });
        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        resolve(tex);
      };

      const settleSlot = (idx, data) => {
        if (settled[idx]) return;
        settled[idx] = true;
        if (data) slots[idx] = data;
        if (settled.every(Boolean)) finish();
      };

      const load = (idx, src, isFallback) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        let handled = false;
        let timer = null;
        const fail = () => {
          if (settled[idx] || handled) return;
          handled = true;
          clearTimeout(timer);
          if (isFallback || !LOCAL.length) settleSlot(idx, null);
          else load(idx, LOCAL[idx % LOCAL.length], true);
        };
        timer = setTimeout(fail, 6000);
        img.onload = () => {
          if (settled[idx]) return;
          clearTimeout(timer);
          const ratio = img.naturalWidth / img.naturalHeight;
          imageRatios[idx] = ratio;
          settleSlot(idx, { img, width: baseHeight * ratio, height: baseHeight });
        };
        img.onerror = fail;
        img.src = src;
      };

      imageUrls.forEach((url, idx) => load(idx, url, false));
    });
  }

  async function init() {
    const container = document.getElementById('spiral-gallery');
    if (!window.JF_webglDisponible) {
      window.JF_mostrarAviso(container, 'Tu navegador no puede mostrar esta galería en 3D. Puedes ver las fotos en las galerías de bodas, quinceaños y cumpleaños.');
      return;
    }
    window.JF_mostrarAviso(container, 'Cargando galería…');
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);

    camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, window.innerWidth < 769 ? 0.35 : 0.75, window.innerWidth < 769 ? 10.8 : 9.6);

    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('webgl-canvas'), antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.9);
    mainLight.position.set(5, 8, 5);
    scene.add(mainLight);

    tiltGroup = new THREE.Group();
    baseRotation = { x: -0.18, z: 0.12 };
    tiltGroup.rotation.x = baseRotation.x;
    tiltGroup.rotation.z = baseRotation.z;
    scene.add(tiltGroup);

    const compact = container.clientWidth < 769;
    if (compact) {
      config.imageHeight = 4.8;
      config.spiralRadius = 2.35;
      config.spiralHeight = 9.5;
      config.spiralTurns = 2.55;
      config.centerX = 0;
      config.centerY = 0;
    } else if (container.clientWidth < 1100) {
      config.imageHeight = 5.8;
      config.spiralRadius = 2.9;
      config.spiralHeight = 10.8;
      config.spiralTurns = 2.65;
      config.centerX = 0;
      config.centerY = 0.15;
    } else {
      config.imageHeight = 7;
      config.spiralRadius = 3.5;
      config.spiralHeight = 12;
      config.spiralTurns = 2.8;
      config.centerX = 0;
      config.centerY = 0.25;
    }

    const texture = await createMasterTexture();
    const avisoCarga = container.querySelector('.aviso-galeria');
    if (avisoCarga) avisoCarga.remove();

    shaderMaterial = new THREE.ShaderMaterial({
      uniforms: { map: { value: texture }, gap: { value: config.gapSize }, offset: { value: 0.0 } },
      vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `
        uniform sampler2D map;
        uniform float gap;
        uniform float offset;
        varying vec2 vUv;
        void main() {
          float u = vUv.x + offset;
          if (u >= 1.0) u -= 1.0;
          if (u < 0.0) u += 1.0;
          gl_FragColor = texture2D(map, vec2(u, vUv.y));
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });

    spiralMesh = new THREE.Mesh(new THREE.BufferGeometry(), shaderMaterial);
    spiralMesh.position.set(config.centerX, config.centerY, config.centerZ);
    spiralMesh.rotation.x = 0.35;
    tiltGroup.add(spiralMesh);

    rebuildGeometry();

    window.addEventListener('resize', () => {
      if (!camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });

    setupInertia();
    setupDrag();
    setupTouchControls();
    animate();
  }

  function setupInertia() {
    let lastTimestamp = 0;
    let acceleration = 0;
    window.addEventListener('wheel', (e) => {
      if (!document.getElementById('spiral-gallery').matches(':hover')) return;
      e.preventDefault();
      const now = performance.now();
      let deltaTime = Math.min(32, now - lastTimestamp);
      if (deltaTime < 1) deltaTime = 16;
      lastTimestamp = now;
      const rawDelta = e.deltaY * inertiaParams.scrollSensitivity * inertiaParams.strength;
      let maxAccel = 0.015;
      let deltaAccel = rawDelta - acceleration;
      deltaAccel = Math.max(-maxAccel, Math.min(maxAccel, deltaAccel));
      acceleration += deltaAccel;
      acceleration = Math.max(-0.03, Math.min(0.03, acceleration));
      let targetDelta = acceleration;
      targetVelocity = targetVelocity * inertiaParams.directionSmoothing + targetDelta * (1 - inertiaParams.directionSmoothing);
      targetVelocity = Math.max(-inertiaParams.maxSpeed, Math.min(inertiaParams.maxSpeed, targetVelocity));
    }, { passive: false });

    window._updateInertia = () => {
      targetVelocity *= inertiaParams.friction;
      currentVelocity = currentVelocity * 0.85 + targetVelocity * 0.15;
      if (Math.abs(currentVelocity) > 0.0001) { scrollOffset += currentVelocity; updateUVOffset(); }
      else { currentVelocity = 0; targetVelocity = 0; acceleration = 0; }
    };
  }

  function setupDrag() {
    const container = document.getElementById('spiral-gallery');
    container.style.pointerEvents = 'auto';
    container.style.cursor = 'grab';

    container.addEventListener('mousedown', (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
      container.style.cursor = 'grabbing';
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - previousMousePosition.x;
      const dy = e.clientY - previousMousePosition.y;
      dragRotation.z += dx * 0.002;
      dragRotation.x -= dy * 0.002;
      dragRotation.x = Math.max(-0.35, Math.min(0.35, dragRotation.x));
      dragRotation.z = Math.max(-0.35, Math.min(0.35, dragRotation.z));
      tiltGroup.rotation.x = baseRotation.x + dragRotation.x;
      tiltGroup.rotation.z = baseRotation.z + dragRotation.z;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
      container.style.cursor = 'grab';
    });
  }

  function animate() {
    requestAnimationFrame(animate);
    if (window._updateInertia) window._updateInertia();
    renderer.render(scene, camera);
  }

  // La espiral se inicia solo cuando el visitante se acerca a ella.
  window.addEventListener('load', () => window.JF_alAcercarse(document.getElementById('spiral-gallery'), init));
})();

/* ============================================================
   5) THREE.JS — CÁMARAS NIKON FLOTANTES (fondo)
   ============================================================ */
(function () {
  class Experience {
    constructor(options = { containerSelector: "[data-app-container]" }) {
      this.options = options;
      this.container = document.querySelector(this.options.containerSelector);
      gsap.registerPlugin(ScrollTrigger);
      this.clock = new THREE.Clock();
      this.time = 0;
      this.cameras = [];
      this.settings = { cameraDistance: 5, scalePeriod: 8 };
      this.init();
    }

    init = () => {
      this.createApp();
      this.createItems();
      this.update();
      this.container.classList.add("is-ready");
    };

    createApp = () => {
      this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
      this.container.appendChild(this.renderer.domElement);

      this.camera = new THREE.PerspectiveCamera(45, this.container.offsetWidth / this.container.offsetHeight, 1, 10000);
      this.camera.position.set(0, 0, this.settings.cameraDistance);
      this.scene = new THREE.Scene();

      window.addEventListener("resize", () => {
        this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
      }, true);

      this.scene.add(new THREE.AmbientLight(0xffffff, 0.35));
      const dir = new THREE.DirectionalLight(0xffffff, 0.7);
      dir.position.set(5, 3, 4); dir.target.position.set(0, 0, 0);
      this.scene.add(dir);
      this.scene.add(new THREE.PointLight(0x866BAF, 0.5, 50));
    };

    createNikonCamera = () => {
      const group = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxBufferGeometry(1.6, 1.05, 0.55), new THREE.MeshLambertMaterial({ color: 0x1a1a20 }));
      group.add(body);
      const prism = new THREE.Mesh(new THREE.BoxBufferGeometry(0.55, 0.28, 0.45), new THREE.MeshLambertMaterial({ color: 0x0c0c10 }));
      prism.position.set(0.05, 0.66, 0); group.add(prism);
      const grip = new THREE.Mesh(new THREE.BoxBufferGeometry(0.30, 1.0, 0.62), new THREE.MeshLambertMaterial({ color: 0x0c0c10 }));
      grip.position.set(0.66, 0, 0); group.add(grip);
      const lens = new THREE.Mesh(new THREE.CylinderBufferGeometry(0.40, 0.40, 0.5, 32), new THREE.MeshLambertMaterial({ color: 0x101014 }));
      lens.rotation.x = Math.PI / 2; lens.position.set(-0.15, -0.05, 0.42); group.add(lens);
      const glass = new THREE.Mesh(new THREE.CylinderBufferGeometry(0.32, 0.32, 0.06, 32), new THREE.MeshLambertMaterial({ color: 0x1c2a4a }));
      glass.rotation.x = Math.PI / 2; glass.position.set(-0.15, -0.05, 0.68); group.add(glass);
      const shutter = new THREE.Mesh(new THREE.CylinderBufferGeometry(0.08, 0.08, 0.08, 16), new THREE.MeshLambertMaterial({ color: 0x777777 }));
      shutter.position.set(0.48, 0.57, 0); group.add(shutter);
      const dial = new THREE.Mesh(new THREE.CylinderBufferGeometry(0.10, 0.10, 0.06, 16), new THREE.MeshLambertMaterial({ color: 0x333338 }));
      dial.position.set(-0.55, 0.57, 0); group.add(dial);
      const stripe = new THREE.Mesh(new THREE.BoxBufferGeometry(0.15, 0.05, 0.02), new THREE.MeshLambertMaterial({ color: 0x9a1f2b }));
      stripe.position.set(0.55, 0.28, 0.29); group.add(stripe);
      return group;
    };

    createItems = () => {
      const itemCount = 28;
      for (let i = 0; i < itemCount; i++) {
        const cam = this.createNikonCamera();
        cam.position.y = 13 * (Math.random() * 2 - 1);
        cam.position.x = 3  * (Math.random() * 2 - 1);
        cam.position.z = 4  * (Math.random() * 2 - 1);
        cam.rotation.y = Math.PI * Math.random();
        cam.rotationSpeed = Math.random() * 0.01 + 0.005;
        this.scene.add(cam);
        this.cameras.push(cam);
      }
    };

    mapToRange = (v, inMin, inMax, outMin, outMax) => ((v - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;

    updateItems = () => {
      const time = this.time;
      const amplitude = 0.05;
      const period = this.settings.scalePeriod;
      const baseScale = 0.32;
      const scaleEffect = baseScale + amplitude * Math.sin(Math.PI * 2 * (time / period));
      this.cameras.forEach((cam) => {
        cam.scale.set(scaleEffect, scaleEffect, scaleEffect);
        cam.rotation.x += cam.rotationSpeed * 0.3;
        cam.rotation.y += cam.rotationSpeed * 0.7;
      });
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress  = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      this.camera.position.y = this.mapToRange(progress, 0, 1, 9, -9);
    };

    update = () => {
      this.time = this.clock.getElapsedTime();
      this.updateItems();
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(this.update);
    };
  }

  window.addEventListener("load", () => {
    if (window.JF_webglDisponible) new Experience();
  });
})();

/* ---- bloque 7 ---- */
/* ============================================================
   6) NUEVA GALERÍA PARALLAX (fragmento 1)
   ============================================================ */
(function () {
  if (!window.THREE) {
    console.error("Three.js no cargado — galería parallax omitida");
    return;
  }

  const DEPTH_LAYERS = 5;
  const IMAGES_PER_LAYER = 10;
  const MAX_WIDTH = 160;
  const MAX_HEIGHT = 160;

  const LAYER_CONFIG = [
    { scale: 1.5, speed: 80, opacity: 1.0 },
    { scale: 1.0, speed: 40, opacity: 0.85 },
    { scale: 0.8, speed: 30, opacity: 0.7 },
    { scale: 0.6, speed: 20, opacity: 0.55 },
    { scale: 0.5, speed: 15, opacity: 0.4 }
  ];

  // Las fotos se ven de máximo 160 px: se usan las miniaturas de 480 px.
  const IMAGE_PATHS = (window.JF_PHOTOS_MINI || window.JF_PHOTOS || []).slice();

  const parallaxContainer = document.getElementById('parallax-container');
  const loadingEl = document.getElementById('parallax-loading');
  const uiEl = document.getElementById('parallax-ui');

  if (!parallaxContainer) return;

  let layers = [];
  const textures = [];
  let loaded = 0;
  let lastTime = 0;
  let dragActive = false;
  let lastX = 0;
  let dragVelocity = 0;
  let speedFactor = 1;
  let shuffledImages = [];
  let currentImageIndex = 0;

  function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  function getNextRandomImage() {
    if (currentImageIndex >= shuffledImages.length) {
      shuffledImages = shuffleArray(IMAGE_PATHS);
      currentImageIndex = 0;
    }
    return shuffledImages[currentImageIndex++];
  }

  // Sin WebGL, crear el motor 3D lanzaría un error que detendría TODO el resto de main.js
  // (incluida la accesibilidad con teclado). Se muestra un aviso y se sale de este bloque.
  if (!window.JF_webglDisponible) {
    if (loadingEl) loadingEl.textContent = "Tu navegador no puede mostrar esta galería en 3D.";
    return;
  }

  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  parallaxContainer.appendChild(renderer.domElement);

  let camera;

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function fallbackTexture(layer) {
    const c = document.createElement("canvas");
    c.width = MAX_WIDTH;
    c.height = MAX_HEIGHT;
    const ctx = c.getContext("2d");
    ctx.fillStyle = ["#4a6572", "#344955", "#232f34", "#1c2529", "#0f1518"][layer];
    ctx.fillRect(0, 0, c.width, c.height);
    return new THREE.CanvasTexture(c);
  }

  for (let l = 0; l < DEPTH_LAYERS; l++) layers[l] = [];

  function resize() {
    const w = parallaxContainer.clientWidth;
    const h = parallaxContainer.clientHeight;
    renderer.setSize(w, h);
    if (!camera) {
      camera = new THREE.OrthographicCamera(0, w, h, 0, -1000, 1000);
      camera.position.z = 10;
    } else {
      camera.right = w;
      camera.top = h;
      camera.updateProjectionMatrix();
    }
    for (const layer of layers) {
      if (!layer) continue;
      for (const s of layer) {
        scene.remove(s);
        if (s.material.map) s.material.map.dispose();
        s.material.dispose();
        s.geometry.dispose();
      }
    }
    layers = [];
    for (let l = 0; l < DEPTH_LAYERS; l++) layers[l] = [];
    if (textures.length === DEPTH_LAYERS * IMAGES_PER_LAYER) fillViewport();
  }

  window.addEventListener("resize", resize);
  resize();

  const loader = new THREE.TextureLoader();
  loader.crossOrigin = "anonymous";
  const TOTAL = DEPTH_LAYERS * IMAGES_PER_LAYER;

  const photoCanvases = {};
  function loadPhotoTexture(src, onOk, onErr) {
    if (photoCanvases[src]) { onOk(makeTex(photoCanvases[src])); return; }
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, 480 / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(img.naturalWidth * k));
      c.height = Math.max(1, Math.round(img.naturalHeight * k));
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      photoCanvases[src] = c;
      onOk(makeTex(c));
    };
    img.onerror = () => onErr();
    img.src = src;
  }
  function makeTex(canvas) {
    const t = new THREE.CanvasTexture(canvas);
    t.minFilter = THREE.LinearFilter;
    t.generateMipmaps = false;
    return t;
  }

  function loadAll() {
    shuffledImages = shuffleArray(IMAGE_PATHS);
    currentImageIndex = 0;
    for (let l = 0; l < DEPTH_LAYERS; l++) {
      for (let i = 0; i < IMAGES_PER_LAYER; i++) {
        const path = getNextRandomImage();
        loadPhotoTexture(path, tex => onLoaded(tex), () => onLoaded(fallbackTexture(l)));
      }
    }
  }

  function onLoaded(tex) {
    textures.push(tex);
    loaded++;
    if (loadingEl) loadingEl.textContent = `Cargando ${Math.round((loaded / TOTAL) * 100)}%`;
    if (loaded === TOTAL) initSprites();
  }

  function initSprites() {
    fillViewport();
    if (loadingEl) loadingEl.style.display = "none";
    if (uiEl) uiEl.style.display = "block";
    lastTime = performance.now();
    animate();
  }

  function addSprite(layerIndex, startX) {
    const cfg = LAYER_CONFIG[layerIndex];
    const texIndex = Math.floor(Math.random() * textures.length);
    const texture = textures[texIndex] || fallbackTexture(layerIndex);
    const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: cfg.opacity });
    const sprite = new THREE.Sprite(mat);
    const image = texture.image;
    let width = MAX_WIDTH;
    let height = MAX_HEIGHT;
    if (image && image.width && image.height) {
      const ratio = image.width / image.height;
      if (ratio > 1) { width = MAX_WIDTH; height = MAX_WIDTH / ratio; }
      else { height = MAX_HEIGHT; width = MAX_HEIGHT * ratio; }
    }
    const sizeVar = rand(0.85, 1.15);
    const w = width * cfg.scale * sizeVar;
    const h = height * cfg.scale * sizeVar;
    const spacing = w * rand(0.5, 0.9);
    sprite.scale.set(w, h, 1);
    sprite.position.set(startX + w / 2 + spacing, rand(h / 2, parallaxContainer.clientHeight - h / 2), -layerIndex * 50);
    const speedVariation = rand(0.45, 1.15);
    sprite.userData = {
      speed: cfg.speed * speedVariation,
      width: w, height: h,
      seed: rand(0, 1000),
      baseY: sprite.position.y,
      opacity: cfg.opacity
    };
    layers[layerIndex].push(sprite);
    scene.add(sprite);
    return sprite;
  }

  function cleanupSprites() {
    const w = parallaxContainer.clientWidth;
    const bufferZone = w * 0.5;
    for (let l = 0; l < DEPTH_LAYERS; l++) {
      if (!layers[l] || layers[l].length === 0) continue;
      const sprites = layers[l];
      const maxSprites = IMAGES_PER_LAYER + 3;
      if (sprites.length > maxSprites) {
        for (let i = sprites.length - 1; i >= 0; i--) {
          const s = sprites[i];
          const ud = s.userData;
          let shouldRemove = false;
          if (speedFactor > 0) shouldRemove = (s.position.x - ud.width / 2) > (w + bufferZone);
          else if (speedFactor < 0) shouldRemove = (s.position.x + ud.width / 2) < (-bufferZone);
          if (shouldRemove) {
            scene.remove(s);
            if (s.material.map) s.material.map.dispose();
            s.material.dispose();
            sprites.splice(i, 1);
            if (sprites.length <= maxSprites) break;
          }
        }
      }
    }
  }

  function fillViewport() {
    const w = parallaxContainer.clientWidth;
    for (let l = 0; l < DEPTH_LAYERS; l++) {
      let sprites = layers[l];
      if (!sprites) continue;
      let rightMost = sprites.length > 0 ? Math.max(...sprites.map(s => s.position.x + s.userData.width / 2)) : -parallaxContainer.clientWidth * 1.2;
      while (rightMost < w) {
        addSprite(l, rightMost);
        sprites = layers[l];
        rightMost = Math.max(...sprites.map(s => s.position.x + s.userData.width / 2));
      }
    }
  }

  function animate() {
    const now = performance.now();
    const dt = Math.min(40, now - lastTime) / 1000;
    lastTime = now;
    const w = parallaxContainer.clientWidth;

    dragVelocity *= 0.92;
    speedFactor = dragVelocity !== 0 ? Math.sign(dragVelocity) : speedFactor;

    if (Math.random() < 0.01) cleanupSprites();

    for (const sprites of layers) {
      if (!sprites || !sprites.length) continue;
      for (const s of sprites) {
        const ud = s.userData;
        s.position.x += ud.speed * speedFactor * dt;
        if (speedFactor > 0 && s.position.x - ud.width / 2 > w) {
          s.position.x = -ud.width / 2 - rand(0, ud.width);
        } else if (speedFactor < 0 && s.position.x + ud.width / 2 < 0) {
          s.position.x = w + ud.width / 2 + rand(0, ud.width);
        }
        const pulse = 1 + Math.sin(now * 0.001 + ud.seed) * 0.015;
        s.scale.x = ud.width * pulse;
        s.scale.y = ud.height * pulse;
        s.position.y = ud.baseY + Math.sin(now * 0.001 + ud.seed) * 5;
        s.material.opacity = ud.opacity;
      }
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  // La galería se carga solo cuando el visitante se acerca a ella.
  window.JF_alAcercarse(document.getElementById('parallax-gallery'), loadAll);

  function getX(e) {
    return e.touches ? e.touches[0].clientX : e.clientX;
  }

  parallaxContainer.addEventListener("mousedown", e => {
    dragActive = true;
    lastX = getX(e);
  });

  parallaxContainer.addEventListener("mousemove", e => {
    if (!dragActive) return;
    const x = getX(e);
    const dx = x - lastX;
    lastX = x;
    dragVelocity = dx * 0.02;
  });

  window.addEventListener("mouseup", () => { dragActive = false; });

  parallaxContainer.addEventListener("touchstart", e => {
    dragActive = true;
    lastX = getX(e);
  }, { passive: true });

  parallaxContainer.addEventListener("touchmove", e => {
    if (!dragActive) return;
    const x = getX(e);
    const dx = x - lastX;
    lastX = x;
    dragVelocity = dx * 0.02;
  }, { passive: true });

  window.addEventListener("touchend", () => { dragActive = false; });

  parallaxContainer.addEventListener("wheel", e => {
    e.preventDefault();
    const wheelDelta = Math.sign(e.deltaY);
    const direction = wheelDelta > 0 ? 1 : -1;
    const acceleration = 0.8;
    speedFactor = direction * (Math.abs(speedFactor) + acceleration);
    const maxSpeed = 5;
    const sign = Math.sign(speedFactor);
    const absSpeed = Math.min(maxSpeed, Math.abs(speedFactor));
    speedFactor = sign * absSpeed;
    dragVelocity = 0;
    cleanupSprites();
  }, { passive: false });

  parallaxContainer.addEventListener("wheel", e => e.preventDefault(), { passive: false });
})();

/* ---- bloque 8 ---- */
/* ============================================================
   MEJORAS: táctil, teclado y accesibilidad
   ============================================================ */
(function () {
  "use strict";
  var B = document.body;
  var labels = [
    [".about-text", "Abrir sobre mí"], [".contact-text", "Abrir contacto"],
    // El nombre accesible empieza con el texto visible (WCAG 2.5.3): quien usa control por voz dice lo que ve.
    [".hero-section .travel", "Boda: ver galería"], [".hero-section .wildlife", "Quinceaños: ver galería"], [".hero-section .nature", "Cumpleaños: ver galería"],
    [".about-close", "Cerrar sobre mí"], [".contact-close", "Cerrar contacto"], [".travel-close", "Cerrar galería de bodas"],
    [".wildlife-close", "Cerrar galería de quinceaños"], [".nature-close", "Cerrar galería de cumpleaños"]
  ];
  labels.forEach(function (p) {
    document.querySelectorAll(p[0]).forEach(function (el) {
      el.setAttribute("role", "button"); el.setAttribute("tabindex", "0"); el.setAttribute("aria-label", p[1]);
    });
  });

  function closeAll() { B.className = B.className.replace(/\b(about|contact|travel|wildlife|nature)-on\b/g, "").trim(); }
  document.addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " ") && e.target.matches && e.target.matches('[role="button"]')) { e.preventDefault(); e.target.click(); }
    if (e.key === "Escape") closeAll();
  });

  // Enlaces del footer -> abren los paneles
  document.querySelectorAll("[data-open]").forEach(function (a) {
    a.addEventListener("click", function (e) { e.preventDefault(); closeAll(); B.classList.add(a.getAttribute("data-open") + "-on"); });
  });

  // Deslizar con el dedo en los sliders
  document.querySelectorAll(".slider").forEach(function (sl) {
    var x = 0, y = 0;
    sl.addEventListener("touchstart", function (e) { x = e.changedTouches[0].clientX; y = e.changedTouches[0].clientY; }, { passive: true });
    sl.addEventListener("touchend", function (e) {
      var dx = e.changedTouches[0].clientX - x, dy = e.changedTouches[0].clientY - y;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        var arrow = sl.querySelector(dx < 0 ? ".slider__nav-arrow--right" : ".slider__nav-arrow--left");
        if (arrow) arrow.click();
      }
    }, { passive: true });
  });

  // Galería "expansión": en pantallas sin hover se abre al tocar
  if (!window.matchMedia("(hover:hover)").matches) {
    var groups = document.querySelectorAll(".spread-fx-gallery ul");
    groups.forEach(function (u) {
      u.addEventListener("click", function () {
        var open = u.classList.contains("is-open");
        groups.forEach(function (g) { g.classList.remove("is-open"); });
        if (!open) u.classList.add("is-open");
      });
    });
  }
})();

/* ---- bloque 9 ---- */
(function(){var P=window.JF_PHOTOS_MINI||window.JF_PHOTOS||[];document.querySelectorAll("[data-photo]").forEach(function(el){var s=P[+el.getAttribute("data-photo")];if(s)el.style.backgroundImage="url(\""+s+"\")";});var spread=[12,13,14,15,16,18];document.querySelectorAll(".spread-fx-gallery ul").forEach(function(ul,i){var s=P[spread[i%spread.length]];if(!s)return;ul.querySelectorAll("li").forEach(function(li){li.style.backgroundImage="url(\""+s+"\")";});});})();
