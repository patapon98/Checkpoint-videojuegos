(function(){
  document.querySelectorAll('.countdown[data-countdown-date]').forEach((countdown)=>{
    ['d','h','m','s'].forEach((unit)=>{
      const node=countdown.querySelector(`#cd-${unit}`);
      if(node) node.id=`calendar-cd-${unit}`;
    });
  });
})();
