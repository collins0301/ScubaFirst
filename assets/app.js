(() => {
  const cfg = window.SCUBA_FIRST_CONFIG || {};
  const enrollModal = document.getElementById('enroll-modal');
  const infoModal = document.getElementById('info-modal');
  const infoForm = document.getElementById('info-form');
  const status = document.getElementById('form-status');
  const paymentNote = document.getElementById('payment-note');

  document.getElementById('year').textContent = new Date().getFullYear();

  document.querySelectorAll('[data-price]').forEach(el => {
    const key = el.dataset.price;
    if (cfg.pricing?.[key]) el.textContent = cfg.pricing[key];
  });

  document.querySelectorAll('[data-social="instagram"]').forEach(el => el.href = cfg.instagramUrl || '#');
  document.querySelectorAll('[data-social="facebook"]').forEach(el => el.href = cfg.facebookUrl || '#');

  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('primary-nav');
  navToggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open'); navToggle?.setAttribute('aria-expanded','false');
  }));

  const openEnroll = () => { if (!enrollModal.open) enrollModal.showModal(); };
  const openInfo = (course) => {
    if (course) {
      const select = infoForm?.querySelector('[name="course"]');
      if (select && [...select.options].some(o => o.value === course)) select.value = course;
    }
    if (!infoModal.open) infoModal.showModal();
  };

  document.querySelectorAll('.js-open-enroll').forEach(btn => btn.addEventListener('click', () => openEnroll()));
  document.querySelectorAll('.js-open-info').forEach(btn => btn.addEventListener('click', () => openInfo()));
  document.querySelector('.js-switch-info')?.addEventListener('click', () => { enrollModal.close(); openInfo(); });
  document.querySelector('.js-close-info')?.addEventListener('click', () => infoModal.close());

  document.querySelectorAll('.modal-close').forEach(btn => btn.addEventListener('click', () => btn.closest('dialog')?.close()));
  [enrollModal, infoModal].forEach(d => d?.addEventListener('click', e => { if (e.target === d) d.close(); }));

  document.querySelectorAll('.js-pay').forEach(btn => btn.addEventListener('click', () => {
    const key = btn.dataset.payment;
    const url = cfg.paymentLinks?.[key];
    if (url) {
      window.location.href = url;
      return;
    }
    paymentNote.textContent = 'Online checkout is ready to connect, but the payment link has not been added yet. Send us a request and we’ll help you reserve a spot.';
    const courseMap = {padiOpenWater:'Open Water',sdiOpenWater:'Open Water',advanced:'Advanced',rescue:'Rescue',masterDiver:'Master Diver Path'};
    setTimeout(() => { enrollModal.close(); openInfo(courseMap[key]); }, 900);
  }));

  infoForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const endpoint = cfg.inquiryFormEndpoint;
    if (!endpoint) {
      status.textContent = 'Online form delivery is not connected yet. Please message us on Instagram or Facebook.';
      return;
    }
    status.textContent = 'Sending…';
    try {
      const response = await fetch(endpoint, {method:'POST',body:new FormData(infoForm),headers:{Accept:'application/json'}});
      if (!response.ok) throw new Error('Request failed');
      infoForm.reset();
      status.textContent = 'Sent! We’ll get back to you soon.';
    } catch {
      status.textContent = 'We couldn’t send that form. Please message us on Instagram or Facebook.';
    }
  });
})();
