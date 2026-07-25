(function(){
  const root=document.getElementById('releases');
  if(!root) return;

  const officialImages={
    'Tomb Raider: Legacy of Atlantis':{
      src:'https://gmedia.playstation.com/is/image/SIEPDC/Tomb-Raider-LoA-hero-desktop-01-en-27may26',
      fallback:'https://image.api.playstation.com/vulcan/ap/rnd/202605/1817/10921c4aa5a64eb8acd6fa79874aea5310f6ddafad3c57fb.jpg'
    },
    'Persona 4 Revival':{
      src:'https://www.sega.co.jp/en/release/images/260608_4/260608_5_01.jpg',
      fallback:'https://p4re.jp/resources/img/product/product_thumb_3.BRdx6sYy.webp'
    },
    'Fable':{
      src:'https://pgfableweqzl6jpbr734gosa.blob.core.windows.net/blobpgfablewe-qzl6jpbr734go/uploads/massive_holland_hero_16x9_b28c45c830.png',
      fallback:'https://pgfableweqzl6jpbr734gosa.blob.core.windows.net/blobpgfablewe-qzl6jpbr734go/uploads/tiny_fable_standard_edition_09beed2c78.png'
    }
  };

  root.querySelectorAll('.release').forEach(release=>{
    const title=release.querySelector('h4')?.childNodes[0]?.textContent.trim()||release.querySelector('h4')?.textContent.trim();
    const config=officialImages[title];
    const image=release.querySelector('.release-art img');
    if(!config||!image) return;

    image.classList.remove('fit-contain');
    image.decoding='async';
    image.src=config.src;

    let fallbackUsed=false;
    image.addEventListener('error',()=>{
      if(fallbackUsed||!config.fallback) return;
      fallbackUsed=true;
      image.src=config.fallback;
    });
  });
})();
