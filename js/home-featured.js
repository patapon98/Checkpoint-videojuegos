(function(){
  // La selección editorial de Novedades vive en el HTML inicial de la portada.
  document.getElementById('heroCard')?.classList.add('is-hydrated');

  const latestCard=document.querySelector('#cardsGrid a[href="/resenas/gurei"]');
  if(latestCard){
    latestCard.href='/resenas/scritchy-scratchy';
    latestCard.innerHTML=`
      <div class="card-art art-24">
        <img src="img/scritchy%20scratch/portada.png" alt="Scritchy Scratchy" loading="lazy" />
        <div class="date-pill"><b>17</b><span>Ago</span></div>
        <div class="ring" style="--target: 40">
          <svg width="52" height="52">
            <circle cx="26" cy="26" r="24" />
            <circle class="track" cx="26" cy="26" r="20" />
            <circle class="bar" cx="26" cy="26" r="20" />
          </svg><span class="num">68</span>
        </div>
      </div>
      <div class="card-body">
        <div class="meta">Incremental · PC / macOS / iOS / Android</div>
        <h3>Scritchy Scratchy</h3>
        <p>Un rasca y gana incremental con boletos distintos, prestigio adictivo y suficiente variedad para destacar dentro del género.</p>
        <span class="read"><u>Leer reseña</u></span>
      </div>
    `;
  }
})();
