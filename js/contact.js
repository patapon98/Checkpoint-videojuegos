(function(){
  const form=document.getElementById('contactForm');
  if(!form) return;

  const message=form.querySelector('#contactMessage');
  const counter=document.getElementById('contactCount');
  const email=form.querySelector('#contactEmail');
  const replyTo=form.querySelector('input[name="_replyto"]');
  const subject=form.querySelector('input[name="_subject"]');
  const topic=form.querySelector('#contactTopic');
  const submit=form.querySelector('.contact-submit');
  const success=document.getElementById('contactSuccess');
  const defaultSubmitText=submit?.querySelector('span')?.textContent||'Enviar mensaje';

  function updateCount(){
    if(!message||!counter) return;
    counter.textContent=String(message.value.length);
  }

  updateCount();
  message?.addEventListener('input',updateCount);

  const params=new URLSearchParams(location.search);
  if(params.get('enviado')==='1'){
    if(success) success.hidden=false;
    success?.scrollIntoView({block:'center'});
    history.replaceState(null,'',location.pathname+location.hash);
  }

  form.addEventListener('submit',()=>{
    const topicLabel=topic?.selectedOptions[0]?.textContent.trim()||'Mensaje general';
    if(replyTo&&email) replyTo.value=email.value.trim();
    if(subject) subject.value=`Moderlode · ${topicLabel}`;

    if(submit){
      submit.setAttribute('aria-busy','true');
      submit.disabled=true;
      const label=submit.querySelector('span');
      if(label) label.textContent='Enviando…';

      window.setTimeout(()=>{
        submit.removeAttribute('aria-busy');
        submit.disabled=false;
        if(label) label.textContent=defaultSubmitText;
      },8000);
    }
  });
})();