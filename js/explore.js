(() => {
  const regions = window.HERITAGE_REGIONS;
  const panel = document.getElementById('region-panel');
  const title = document.getElementById('region-title');
  const meta = document.getElementById('region-meta');
  const countries = document.getElementById('country-list');
  const markers = [...document.querySelectorAll('.map-marker')];

  if (!regions || !panel || !countries) return;

  const makeSiteCard = (site) => {
    const card = document.createElement('article');
    card.className = 'site-card';
    const image = document.createElement('img');
    image.src = site.image;
    image.alt = `${site.name} in ${site.place}`;
    image.loading = 'lazy';
    const copy = document.createElement('div');
    copy.className = 'site-copy';
    const heading = document.createElement('h3');
    heading.textContent = site.name;
    const place = document.createElement('span');
    place.className = 'place';
    place.textContent = site.place;
    const story = document.createElement('p');
    story.textContent = site.story;
    copy.append(heading, place, story);
    card.append(image, copy);
    return card;
  };

  function showRegion(key, moveFocus = false) {
    const region = regions[key];
    if (!region) return;
    title.textContent = region.title;
    const siteCount = region.countries.reduce((sum, country) => sum + country.sites.length, 0);
    meta.textContent = `${region.countries.length} ${region.countries.length === 1 ? 'country' : 'countries'} · ${siteCount} historic sites`;
    countries.replaceChildren();
    region.countries.forEach((country, index) => {
      const details = document.createElement('details');
      details.className = 'country-card';
      details.open = index === 0;
      const summary = document.createElement('summary');
      summary.append(document.createTextNode(country.name));
      const count = document.createElement('small');
      count.textContent = `${country.sites.length} sites`;
      summary.append(count);
      const siteGrid = document.createElement('div');
      siteGrid.className = 'site-list';
      country.sites.forEach(site => siteGrid.append(makeSiteCard(site)));
      details.append(summary, siteGrid);
      countries.append(details);
    });
    markers.forEach(marker => {
      const active = marker.dataset.region === key;
      marker.setAttribute('aria-pressed', String(active));
    });
    if (moveFocus) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  markers.forEach(marker => marker.addEventListener('click', () => showRegion(marker.dataset.region, true)));
  showRegion('asia');
})();
