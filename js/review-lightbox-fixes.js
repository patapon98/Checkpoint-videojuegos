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
      margin:auto;
      padding:clamp(54px,7vw,82px) clamp(14px,3vw,32px) clamp(22px,4vw,40px);
    }
    .review-lightbox[open]{
      display:flex;
      align-items:center;
      justify-content:center;
    }
    .review-lightbox::backdrop{
      background:rgba(7,6,10,.78);
    }
    .review-lightbox-frame{
      width:auto;
      max-width:100%;
      height:auto;
      max-height:100%;
      margin:auto;
      pointer-events:none;
    }
    .review-lightbox-image{
      margin:auto;
      pointer-events:auto;
    }
    .review-lightbox-caption{
      pointer-events:none;
    }
    @media(max-width:700px){
      .review-lightbox{padding:64px 12px 24px}
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
