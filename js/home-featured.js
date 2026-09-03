(async function(){
  const heroCard=document.getElementById('heroCard');
  if(heroCard){
    try{
      const response=await fetch('/data/events/state-of-play-septiembre-2026.json',{cache:'no-store'});
      if(!response.ok) throw new Error('No se pudo cargar el evento destacado');
      const event=await response.json();
      heroCard.classList.add('event-featured');
      heroCard.href=`/eventos/${event.id}`;
      heroCard.setAttribute('aria-label',`${event.phase === 'finished' ? 'Repasar' : 'Seguir'} ${event.title} en Final Secreto`);
      heroCard.innerHTML=`
        <img src="${event.heroImage}" alt="${event.heroImageAlt}" />
        <div class="event-featured-date" aria-hidden="true"><b>${event.homeFeature.day}</b><span>${event.homeFeature.month}</span></div>
        <div class="tag">${event.homeFeature.tag}</div>
        <h3>${event.homeFeature.title}</h3>
        <p>${event.homeFeature.summary}</p>
      `;
    }catch(error){
      console.warn(error);
    }
  }

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
