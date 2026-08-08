(function(){
  const heroCard=document.getElementById('heroCard');
  if(!heroCard) return;

  heroCard.href='/resenas/gurei';
  heroCard.setAttribute('aria-label','Leer la reseña de Gurei');
  heroCard.innerHTML=`
    <img
      src="/img/gurei/portada.jpg"
      alt="Imagen principal de Gurei"
    />
    <div class="tag">Nueva reseña · 62/100</div>
    <h3>Gurei, café para cafeteros del boss rush</h3>
    <p>
      Un boss rush exigente y muy de nicho, con dificultad dinámica y una propuesta pensada para quien disfruta aprendiendo cada combate.
    </p>
  `;
})();
