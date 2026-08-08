(function(){
  const lightbox=document.querySelector('.review-lightbox');
  if(!lightbox) return;

  const style=document.createElement('style');
  style.textContent=`
    .review-lightbox{
      position:fixed;
      inset:0;
      width:100%;
      max-width:none;
      height:100%;
      max-height:none;
      margin:0;
      padding:clamp(54px,7vw,82px) clamp(14px,3vw,32px) clamp(22px,4vw,40px);
    }
    .review-lightbox[open]{
      display:grid;
      place-items:center;
    }
    .review-lightbox::backdrop{
      background:rgba(7,6,10,.78);
    }
    .review-lightbox-frame{
      position:relative;
      display:grid;
      place-items:center;
      width:100%;
      max-width:none;
      height:100%;
      max-height:none;
      margin:0;
      pointer-events:none;
    }
    .review-lightbox-image{
      grid-area:1/1;
      display:block;
      width:auto;
      height:auto;
      max-width:min(94vw,1600px);
      max-height:calc(100dvh - 150px);
      margin:0;
      object-fit:contain;
      pointer-events:auto;
    }
    .review-lightbox-caption{
      position:absolute;
      left:50%;
      bottom:0;
      width:min(760px,90vw);
      max-width:none;
      margin:0;
      transform:translateX(-50%);
      pointer-events:none;
    }

    /* Las capturas de Gurei conservan unos pocos píxeles blancos del recorte
       original. Se ocultan visualmente sin recomprimir ni degradar los JPG. */
    .article-body figure>img[src*="/img/gurei/"]{
      clip-path:inset(3px round 14px);
      transform:scale(1.006);
      transform-origin:center;
    }
    .review-lightbox-image[src*="/img/gurei/"]{
      clip-path:inset(3px round 10px);
      transform:scale(1.006);
      transform-origin:center;
    }

    @media(max-width:700px){
      .review-lightbox{padding:60px 12px 20px}
      .review-lightbox-image{
        max-width:100%;
        max-height:calc(100dvh - 130px);
      }
      .review-lightbox-caption{width:min(92vw,760px)}
    }
  `;
  document.head.appendChild(style);

  const image=lightbox.querySelector('.review-lightbox-image');
  lightbox.addEventListener('pointerdown',event=>{
    if(!lightbox.open||event.target.closest('.review-lightbox-close')) return;
    const rect=image.getBoundingClientRect();
    const insideImage=
      event.clientX>=rect.left&&event.clientX<=rect.right&&
      event.clientY>=rect.top&&event.clientY<=rect.bottom;
    if(!insideImage) lightbox.close();
  },true);
})();
