document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  const searchItems = [
    ['Stéthoscope professionnel', 'Diagnostic', 'produit.html'],
    ['Tensiomètre électronique', 'Diagnostic', 'catalogue.html'],
    ['Kit de premiers secours', 'Soins & protection', 'catalogue.html'],
    ['Fauteuil roulant pliable', 'Location médicale', 'location.html'],
    ['Lit médicalisé', 'Location médicale', 'location.html'],
    ['Concentrateur d’oxygène', 'Location médicale', 'location.html'],
    ['Premiers secours & gestes d’urgence', 'Formation', 'formation-detail.html'],
    ['Prise des constantes vitales', 'Formation', 'formations.html']
  ];
  const searchDialog = document.createElement('div');
  searchDialog.className = 'search-dialog';
  searchDialog.hidden = true;
  searchDialog.innerHTML = '<div class="search-box" role="dialog" aria-modal="true" aria-label="Recherche FarySanté"><button class="search-close" type="button" aria-label="Fermer">×</button><label for="site-search">Que recherchez-vous ?</label><input id="site-search" type="search" placeholder="Ex. fauteuil roulant, formation, tensiomètre" autocomplete="off"><div class="search-results"></div></div>';
  document.body.append(searchDialog);
  const searchInput = searchDialog.querySelector('input');
  const searchResults = searchDialog.querySelector('.search-results');
  const renderSearch = query => {
    const term = query.trim().toLocaleLowerCase('fr');
    const results = term ? searchItems.filter(item => `${item[0]} ${item[1]}`.toLocaleLowerCase('fr').includes(term)) : searchItems.slice(0, 5);
    searchResults.innerHTML = results.length ? results.map(([name, type, url]) => `<a href="${url}"><span>${type}</span><strong>${name}</strong><b>→</b></a>`).join('') : '<p>Aucun résultat. Essayez un autre mot-clé ou contactez-nous dans le chat.</p>';
  };
  const openSearch = () => { searchDialog.hidden = false; renderSearch(''); window.setTimeout(() => searchInput.focus(), 0); };
  const closeSearch = () => { searchDialog.hidden = true; };
  searchInput.addEventListener('input', () => renderSearch(searchInput.value));
  searchDialog.querySelector('.search-close').addEventListener('click', closeSearch);
  searchDialog.addEventListener('click', event => { if (event.target === searchDialog) closeSearch(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !searchDialog.hidden) closeSearch(); });

  document.querySelectorAll('.nav').forEach(nav => {
    const links = nav.querySelector('.links');
    const actions = nav.querySelector('.nav-actions, .actions');
    if (!links || !actions) return;
    let menuButton = nav.querySelector('.menu');
    if (!menuButton) {
      menuButton = document.createElement('button');
      menuButton.className = 'round menu global-menu';
      menuButton.type = 'button';
      menuButton.setAttribute('aria-label', 'Ouvrir le menu');
      menuButton.textContent = '☰';
      actions.append(menuButton);
    }
    menuButton.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('mobile-open');
      menuButton.textContent = isOpen ? '×' : '☰';
      menuButton.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
    });
    if (!actions.querySelector('.global-search') && !nav.querySelector('[aria-label="Rechercher"]')) {
      const searchButton = document.createElement('button');
      searchButton.className = 'round global-search';
      searchButton.type = 'button';
      searchButton.setAttribute('aria-label', 'Rechercher');
      searchButton.textContent = '⌕';
      actions.prepend(searchButton);
    }
  });
  document.querySelectorAll('[aria-label="Rechercher"]').forEach(button => button.addEventListener('click', openSearch));

  const chatKey = 'farysante-chat-history';
  const defaultChat = [{ sender: 'bot', text: 'Bonjour 👋 Je suis l’assistant FarySanté. Comment puis-je vous aider ?' }];
  const readChat = () => JSON.parse(localStorage.getItem(chatKey) || JSON.stringify(defaultChat));
  const saveChat = messages => localStorage.setItem(chatKey, JSON.stringify(messages));
  const chat = document.createElement('section');
  chat.className = 'chat-widget';
  chat.innerHTML = '<button class="chat-launcher" type="button" aria-expanded="false" aria-controls="farysante-chat"><span>💬</span><b>Besoin d’aide ?</b></button><div class="chat-panel" id="farysante-chat" hidden><header><div><strong>FarySanté</strong><small><i></i> En ligne</small></div><button class="chat-close" type="button" aria-label="Fermer le chat">×</button></header><div class="chat-messages" aria-live="polite"></div><div class="chat-suggestions"><button type="button">Louer un matériel</button><button type="button">Suivre une commande</button><button type="button">Nous contacter</button></div><form class="chat-form"><input aria-label="Votre message" placeholder="Écrivez votre message…" maxlength="300" required><button type="submit" aria-label="Envoyer">↑</button></form></div>';
  document.body.append(chat);
  const launcher = chat.querySelector('.chat-launcher');
  const panel = chat.querySelector('.chat-panel');
  const closeChat = chat.querySelector('.chat-close');
  const messagesBox = chat.querySelector('.chat-messages');
  const form = chat.querySelector('.chat-form');
  const input = form.querySelector('input');
  const messageReply = text => {
    const lower = text.toLowerCase();
    if (lower.includes('louer') || lower.includes('location') || lower.includes('matériel')) return 'Vous pouvez consulter notre matériel à louer depuis la page Location. Pour réserver, choisissez votre équipement puis sa durée de location.';
    if (lower.includes('commande') || lower.includes('livraison')) return 'Pour une commande ou une réservation, notre équipe confirme la disponibilité et la livraison par téléphone au +269 389 98 72.';
    if (lower.includes('contact') || lower.includes('appeler')) return 'Vous pouvez nous joindre au +269 389 98 72 ou par email à contact@farysante.km.';
    if (lower.includes('formation')) return 'Nos formations sont proposées en présentiel et en ligne. Vous pouvez voir les prochaines sessions dans la rubrique Formations.';
    return 'Merci pour votre message. Un conseiller FarySanté reviendra vers vous rapidement. Vous pouvez aussi nous appeler au +269 389 98 72.';
  };
  const renderMessages = () => {
    messagesBox.replaceChildren();
    readChat().forEach(message => {
      const bubble = document.createElement('p');
      bubble.className = `chat-message ${message.sender}`;
      bubble.textContent = message.text;
      messagesBox.append(bubble);
    });
    messagesBox.scrollTop = messagesBox.scrollHeight;
  };
  const sendMessage = text => {
    const clean = text.trim();
    if (!clean) return;
    const messages = readChat();
    messages.push({ sender: 'user', text: clean });
    saveChat(messages); renderMessages(); input.value = '';
    window.setTimeout(() => {
      const updated = readChat();
      updated.push({ sender: 'bot', text: messageReply(clean) });
      saveChat(updated); renderMessages();
    }, 480);
  };
  launcher.addEventListener('click', () => { panel.hidden = false; launcher.setAttribute('aria-expanded', 'true'); input.focus(); renderMessages(); });
  closeChat.addEventListener('click', () => { panel.hidden = true; launcher.setAttribute('aria-expanded', 'false'); launcher.focus(); });
  form.addEventListener('submit', event => { event.preventDefault(); sendMessage(input.value); });
  chat.querySelectorAll('.chat-suggestions button').forEach(button => button.addEventListener('click', () => sendMessage(button.textContent)));
  renderMessages();

  const cartKey = 'farysante-rental-cart';
  const readCart = () => JSON.parse(localStorage.getItem(cartKey) || '[]');
  const saveCart = cart => localStorage.setItem(cartKey, JSON.stringify(cart));
  const priceNumber = value => Number(value.replace(/[^0-9]/g, '')) || 0;
  const money = value => `${new Intl.NumberFormat('fr-FR').format(value)} KMF`;
  const showToast = message => {
    let toast = document.querySelector('.cart-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'cart-toast';
      toast.setAttribute('role', 'status');
      document.body.append(toast);
    }
    toast.textContent = message;
    toast.classList.add('is-showing');
    window.setTimeout(() => toast.classList.remove('is-showing'), 2600);
  };
  const updateCartBadges = () => {
    const count = readCart().reduce((total, item) => total + item.quantity, 0);
    document.querySelectorAll('.bag b').forEach(badge => { badge.textContent = count; });
  };

  document.querySelectorAll('.rental-card .btn').forEach(button => {
    button.addEventListener('click', event => {
      event.preventDefault();
      const card = button.closest('.rental-card');
      const name = card.querySelector('h3').textContent.trim();
      const category = card.querySelector('small').textContent.trim();
      const weeklyPrice = priceNumber(card.querySelector('.rental-body strong').textContent);
      const cart = readCart();
      const existing = cart.find(item => item.name === name && item.kind === 'rental');
      if (existing) existing.quantity += 1;
      else cart.push({ id: `rental-${Date.now()}`, kind: 'rental', name, category, weeklyPrice, quantity: 1, weeks: 1 });
      saveCart(cart);
      updateCartBadges();
      showToast(`${name} a été ajouté au panier`);
      window.setTimeout(() => { window.location.href = 'panier.html'; }, 550);
    });
  });

  const cartBox = document.querySelector('.cart-box');
  const summary = document.querySelector('.summary');
  const isCartPage = cartBox && summary;
  const renderCart = () => {
    if (!isCartPage) return;
    const cart = readCart();
    if (!cart.length) {
      cartBox.innerHTML = '<h2>Votre panier est vide</h2><p class="intro">Découvrez notre matériel disponible à la location.</p><a class="btn primary" href="location.html">Voir la location</a>';
      summary.innerHTML = '<h3>Récapitulatif</h3><p class="summary-empty">Ajoutez du matériel pour voir votre total.</p>';
      return;
    }
    cartBox.innerHTML = `<h2>Vos locations</h2>${cart.map(item => `<article class="cart-item rental-cart-item" data-id="${item.id}"><div class="cart-art">${item.name.includes('Fauteuil') ? '🦽' : item.name.includes('Lit') ? '🛏️' : item.name.includes('Béquilles') ? '🩼' : item.name.includes('oxygène') ? '🌬️' : item.name.includes('Déambulateur') ? '🚶' : '🛁'}</div><div><h3>${item.name}</h3><p>${item.category} · ${money(item.weeklyPrice)} / semaine</p><div class="rental-controls"><label>Durée <select data-action="weeks"><option value="1" ${item.weeks === 1 ? 'selected' : ''}>1 semaine</option><option value="2" ${item.weeks === 2 ? 'selected' : ''}>2 semaines</option><option value="4" ${item.weeks === 4 ? 'selected' : ''}>4 semaines</option></select></label><div class="qty"><button data-action="decrease">−</button><span>${item.quantity}</span><button data-action="increase">+</button></div></div></div><div class="cart-price"><strong>${money(item.weeklyPrice * item.weeks * item.quantity)}</strong><button class="remove-rental" data-action="remove">Retirer</button></div></article>`).join('')}`;
    const subtotal = cart.reduce((total, item) => total + item.weeklyPrice * item.weeks * item.quantity, 0);
    summary.innerHTML = `<h3>Récapitulatif</h3><div class="summary-line"><span>Location</span><span>${money(subtotal)}</span></div><div class="summary-line"><span>Livraison</span><span>À confirmer</span></div><div class="summary-line summary-total"><span>Total estimé</span><span>${money(subtotal)}</span></div><button class="btn primary full" type="button" id="checkout-rental">Demander la réservation</button><p class="summary-empty">La disponibilité finale sera confirmée par notre équipe.</p>`;
  };
  if (isCartPage) {
    cartBox.addEventListener('click', event => {
      const action = event.target.dataset.action;
      if (!action || action === 'weeks') return;
      const itemNode = event.target.closest('[data-id]');
      const cart = readCart();
      const index = cart.findIndex(item => item.id === itemNode.dataset.id);
      if (index < 0) return;
      if (action === 'increase') cart[index].quantity += 1;
      if (action === 'decrease') cart[index].quantity = Math.max(1, cart[index].quantity - 1);
      if (action === 'remove') cart.splice(index, 1);
      saveCart(cart); updateCartBadges(); renderCart();
    });
    cartBox.addEventListener('change', event => {
      if (event.target.dataset.action !== 'weeks') return;
      const itemNode = event.target.closest('[data-id]');
      const cart = readCart();
      const item = cart.find(entry => entry.id === itemNode.dataset.id);
      if (item) { item.weeks = Number(event.target.value); saveCart(cart); renderCart(); }
    });
    summary.addEventListener('click', event => {
      if (event.target.id === 'checkout-rental') showToast('Votre demande de réservation est prête à être envoyée.');
    });
    renderCart();
  }
  updateCartBadges();

  document.querySelectorAll('.links').forEach(nav => {
    if (nav.querySelector('[href="location.html"]')) return;
    const locationLink = document.createElement('a');
    locationLink.href = 'location.html';
    locationLink.textContent = 'Location';
    const formations = nav.querySelector('[href="formations.html"]');
    nav.insertBefore(locationLink, formations || null);
  });

  const categoryList = document.querySelector('.categories');
  if (categoryList && !categoryList.querySelector('[href="location.html"]')) {
    const category = document.createElement('a');
    category.className = 'category rental-category';
    category.href = 'location.html';
    category.innerHTML = '<h3>Location médicale</h3><p>Équipement pour vos besoins ponctuels</p><span class="illustration">🦽</span>';
    categoryList.append(category);
  }

  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);
  const updateProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0}%`;
  };
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });

  const revealSelectors = [
    '.page-hero .container > *', '.hero-inner > div', '.section-top',
    '.category', '.product', '.benefit', '.training-box', '.filter',
    '.detail > *', '.course', '.course-hero > *', '.stat', '.two-col > *',
    '.article', '.about > *', '.value', '.cart > *'
  ];
  const elements = [...document.querySelectorAll(revealSelectors.join(','))];
  elements.forEach((element, index) => {
    element.classList.add('reveal');
    element.style.transitionDelay = `${Math.min((index % 4) * 75, 225)}ms`;
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  elements.forEach(element => observer.observe(element));

  const heroArt = document.querySelector('.hero-art');
  if (heroArt && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    heroArt.addEventListener('pointermove', event => {
      const bounds = heroArt.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - .5;
      const y = (event.clientY - bounds.top) / bounds.height - .5;
      heroArt.style.transform = `translate(${x * 7}px, ${y * 7}px)`;
    });
    heroArt.addEventListener('pointerleave', () => { heroArt.style.transform = ''; });
  }

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.btn-primary').forEach(button => {
      button.addEventListener('pointermove', event => {
        const bounds = button.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - .5;
        const y = (event.clientY - bounds.top) / bounds.height - .5;
        button.style.transform = `translate(${x * 4}px, ${y * 3}px)`;
      });
      button.addEventListener('pointerleave', () => { button.style.transform = ''; });
    });
  }
});
