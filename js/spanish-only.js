(function(){
  document.documentElement.lang='es';

  const removeLanguageSelector=()=>{
    document.querySelectorAll('.lang-toggle').forEach(selector=>selector.remove());
  };

  removeLanguageSelector();

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',removeLanguageSelector,{once:true});
  }
})();
