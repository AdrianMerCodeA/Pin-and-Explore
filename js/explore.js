(() => {
  const regions = window.HERITAGE_REGIONS;
  const map = document.getElementById('explore-map');
  const markers = document.getElementById('map-markers');
  const heading = document.getElementById('region-title');
  const meta = document.getElementById('region-meta');
  const list = document.getElementById('country-list');
  const instruction = document.getElementById('map-instruction');
  const back = document.getElementById('back-to-world');
  if (!regions || !map || !markers) return;
  const continentPins = {'north-america':[20,31],'south-america':[31,66],europe:[51,25],africa:[49,51],asia:[74,34],oceania:[86,72]};
  // Normalized marker positions on the supplied continent map images.
  const countryPins = {
    asia:{Philippines:[77,69],China:[57,38]}, europe:{Italy:[57,66],France:[43,46]},
    africa:{Egypt:[55,29],'South Africa':[54,78]}, 'north-america':{'United States':[43,43],Mexico:[40,66]},
    'south-america':{Peru:[49,44]}, oceania:{Australia:[53,76]}
  };
  const mapFiles = {asia:'asia.png',europe:'europe.png',africa:'africa.png','north-america':'north-america.png','south-america':'south-america.png',oceania:'australia.png'};
  function makePin(label,x,y,action) {
    const button=document.createElement('button'); button.type='button'; button.className='map-marker';
    button.style.left=`${x}%`; button.style.top=`${y}%`;
    const icon=document.createElement('img'); icon.src='Assets/location-pin.svg'; icon.alt='';
    const text=document.createElement('span'); text.textContent=label;
    button.append(icon,text); button.addEventListener('click',action); markers.append(button);
  }
  function showWorld() {
    map.src='Assets/map-with-grid.png'; map.alt='World map showing six continents. Antarctica is not shown.'; markers.replaceChildren();
    Object.entries(regions).forEach(([key,region])=>makePin(region.title,...continentPins[key],()=>showContinent(key)));
    heading.textContent='Choose a continent'; meta.textContent='Six continents · Thirty featured sites';
    list.innerHTML='<p class="empty-note">Select a continent pin, then a country pin to see its landmarks.</p>';
    instruction.textContent='Select a continent to explore'; back.hidden=true;
  }
  function showContinent(key) {
    const region=regions[key]; if(!region)return;
    map.src=`Assets/${mapFiles[key]}`; map.alt=`Map of ${region.title}`; markers.replaceChildren();
    region.countries.forEach(country=>makePin(country.name,...(countryPins[key]?.[country.name]||[50,50]),()=>showCountry(key,country.name)));
    heading.textContent=region.title; meta.textContent='Select a country pin to explore its landmarks.';
    list.innerHTML='<p class="empty-note">Choose a country pin on the map to see its three landmarks.</p>';
    instruction.textContent=`Select a country in ${region.title}`; back.hidden=false;
  }
  function showCountry(key,name) {
    const country=regions[key].countries.find(item=>item.name===name); if(!country)return;
    heading.textContent=name; meta.textContent=`${country.sites.length} historic landmarks`; list.replaceChildren();
    const grid=document.createElement('div'); grid.className='site-list';
    country.sites.forEach(site=>{
      const card=document.createElement('article'); card.className='site-card';
      const image=document.createElement('img'); image.src=site.image; image.alt=`${site.name} in ${site.place}`; image.loading='lazy';
      const copy=document.createElement('div'); copy.className='site-copy';
      const title=document.createElement('h3'); title.textContent=site.name;
      const place=document.createElement('span'); place.className='place'; place.textContent=site.place;
      const story=document.createElement('p'); story.textContent=site.story;
      copy.append(title,place,story); card.append(image,copy); grid.append(card);
    });
    list.append(grid); list.scrollIntoView({behavior:'smooth',block:'start'});
  }
  back.addEventListener('click',showWorld); showWorld();
})();
