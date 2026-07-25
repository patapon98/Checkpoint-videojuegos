(function(){
  const nav=document.querySelector('header nav');
  if(!nav) return;

  const nested=/\/resenas\//.test(location.pathname);
  const href=nested?'../contacto.html':'contacto.html';
  let contact=nav.querySelector('a[data-contact-link],a[href$="contacto.html"]');

  if(!contact){
    contact=document.createElement('a');
    contact.dataset.contactLink='';
    contact.textContent='Contacto';
    const reviews=[...nav.querySelectorAll('a')].find(link=>link.getAttribute('href')?.endsWith('resenas.html'));
    if(reviews) reviews.after(contact);
    else nav.prepend(contact);
  }

  contact.href=href;
  contact.dataset.contactLink='';

  const page=location.pathname.replace(/\/+$/,'').split('/').pop()||'index.html';
  const onContact=page==='contacto.html'||page==='contacto';
  contact.classList.toggle('active',onContact);
  if(onContact) contact.setAttribute('aria-current','page');
  else contact.removeAttribute('aria-current');
})();