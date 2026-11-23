/* Rutas de las fotografías usadas por los sliders, la espiral y las galerías */
window.JF_PHOTOS = [
  "img/quinceanos/quinceanera-vestido-turquesa-jardin.webp",
  "img/quinceanos/quinceanera-vestido-turquesa-sentada.webp",
  "img/quinceanos/quinceanera-momento-familiar.webp",
  "img/quinceanos/quinceanera-vestido-negro-jardin.webp",
  "img/quinceanos/quinceanera-vestido-negro-arco-de-flores.webp",
  "img/bodas/boda-baile-de-los-novios.webp",
  "img/bodas/boda-beso-de-los-novios.webp",
  "img/bodas/boda-familia-en-la-iglesia.webp",
  "img/bodas/boda-retrato-de-los-novios.webp",
  "img/bodas/boda-cortejo-nupcial.webp",
  "img/cumpleanos/cumpleanos-nina-con-burbujas.webp",
  "img/sesiones/paisaje-montanas-rayos-de-sol.webp",
  "img/desfiles/desfile-palillona-sombrero-rosa.webp",
  "img/desfiles/desfile-banda-tambor-azul.webp",
  "img/desfiles/desfile-banda-tambor-celeste.webp",
  "img/desfiles/desfile-ninos-banda-de-tambores.webp",
  "img/desfiles/desfile-nina-banda-celeste.webp",
  "img/cumpleanos/cumpleanos-tres-anos-globo.webp",
  "img/desfiles/desfile-palillona-blanco-y-dorado.webp",
  "img/desfiles/desfile-palillona-sonriendo.webp",
  "img/cumpleanos/cumpleanos-retrato-nino.webp",
  "img/cumpleanos/cumpleanos-hermanos-en-la-fiesta.webp",
  "img/cumpleanos/cumpleanos-tematica-sirenita.webp",
  "img/cumpleanos/cumpleanos-nina-decoracion-verde.webp",
  "img/cumpleanos/cumpleanos-nina-jugando.webp",
  "img/cumpleanos/cumpleanos-cinco-anos.webp",
  "img/cumpleanos/cumpleanos-tematica-minnie-familia.webp",
  "img/cumpleanos/cumpleanos-tematica-roblox-familia.webp",
  "img/cumpleanos/cumpleanos-tematica-roblox-celebracion.webp",
  "img/cumpleanos/cumpleanos-adulta-con-pastel.webp",
  "img/sesiones/sesion-bebe-gorro-amarillo.webp",
  "img/cumpleanos/cumpleanos-nina-con-corona.webp",
  "img/desfiles/desfile-banda-de-gala-azul.webp"
];

window.JF_SPIRAL_PHOTOS = [
  "img/cumpleanos/cumpleanos-40-anos-velas-corona.webp",
  "img/cumpleanos/cumpleanos-tematica-roblox-dereck.webp",
  "img/cumpleanos/cumpleanos-mama-y-bebe-rosa.webp",
  "img/cumpleanos/cumpleanos-nino-en-inflable.webp",
  "img/cumpleanos/cumpleanos-nino-pastel-vaquero.webp",
  "img/cumpleanos/cumpleanos-decoracion-vaquera.webp",
  "img/quinceanos/quinceanera-vestido-rosa-iglesia.webp",
  "img/quinceanos/quinceanera-vals-con-su-padre.webp",
  "img/quinceanos/quinceanera-alas-de-luz.webp",
  "img/quinceanos/quinceanera-pastel-15-anos.webp",
  "img/quinceanos/quinceanera-trono-y-ramo.webp",
  "img/quinceanos/quinceanera-vestido-verde-menta.webp",
  "img/cumpleanos/cumpleanos-show-de-payasos.webp"
];

/* Miniaturas de 480 px (generadas con npm run recursos) para las galerías donde las fotos se ven pequeñas. */
window.JF_PHOTOS_MINI = window.JF_PHOTOS.map(function (ruta) { return ruta.replace(/^img\//, 'img/miniaturas/'); });
