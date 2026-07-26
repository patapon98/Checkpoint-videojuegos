(function(){
  const nav=document.querySelector('header nav');
  if(!nav) return;

  const href='/contacto';
  let contact=nav.querySelector('a[data-contact-link],a[href="/contacto"],a[href$="contacto.html"]');

  if(!contact){
    contact=document.createElement('a');
    contact.dataset.contactLink='';
    contact.textContent='Contacto';
    const reviews=[...nav.querySelectorAll('a')].find(link=>{
      const target=(link.getAttribute('href')||'').replace(/\/+$/,'');
      return target==='/resenas'||target==='resenas'||target.endsWith('/resenas')||target.endsWith('resenas.html');
    });
    if(reviews) reviews.after(contact);
    else{
      const controls=nav.querySelector('.lang-toggle,.theme-toggle');
      if(controls) nav.insertBefore(contact,controls);
      else nav.append(contact);
    }
  }

  contact.href=href;
  contact.dataset.contactLink='';

  const page=location.pathname.replace(/\/+$/,'').split('/').pop()||'index';
  const onContact=page==='contacto.html'||page==='contacto';
  contact.classList.toggle('active',onContact);
  if(onContact) contact.setAttribute('aria-current','page');
  else contact.removeAttribute('aria-current');
})();