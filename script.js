// ============================================================
// JavaScript — saytni "jonlantiradi": bosish, almashish, harakat.
// HTML = skelet, CSS = bezak, JavaScript = xatti-harakat.
//
// JavaScript'da izohlar ikki chiziq (//) bilan boshlanadi.
// ============================================================


// ------------------------------------------------------------
// 1. AYLANTIRGANDA PAYDO BO'LISH
// IntersectionObserver — "element ekranda ko'rinyaptimi?" deb kuzatadi.
// Ko'ringan bo'limga "visible" klassini qo'shamiz, CSS uni yumshoq chiqaradi.
// ------------------------------------------------------------
const kuzatuvchi = new IntersectionObserver(function (yozuvlar) {
  yozuvlar.forEach(function (yozuv) {
    if (yozuv.isIntersecting) {
      yozuv.target.classList.add('visible');
      kuzatuvchi.unobserve(yozuv.target);   // bir marta paydo bo'lsa yetadi
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(function (element) {
  kuzatuvchi.observe(element);
});


// ------------------------------------------------------------
// 2. MENYU — pastga aylantirilganda shisha fon va chiziq paydo bo'ladi
// ------------------------------------------------------------
const menyu = document.querySelector('.nav');

function menyuniYangila() {
  // window.scrollY — sahifa necha piksel pastga aylantirilgani
  menyu.classList.toggle('scrolled', window.scrollY > 10);
}

window.addEventListener('scroll', menyuniYangila, { passive: true });
menyuniYangila();


// ------------------------------------------------------------
// 3. KUNDUZGI / TUNGI REJIM
//
// Rejim <html data-theme="light|dark"> atributida saqlanadi.
// CSS shu atributga qarab ranglarni almashtiradi (style.css, 1-bo'lim).
// Tanlov brauzer xotirasiga (localStorage) yoziladi — keyingi safar ham eslab qoladi.
// ------------------------------------------------------------
const ildiz = document.documentElement;
const rejimTugmasi = document.querySelector('.theme-toggle');
const rangMeta = document.querySelector('meta[name="theme-color"]');
const tizimQorongi = window.matchMedia('(prefers-color-scheme: dark)');
const kamHarakat = window.matchMedia('(prefers-reduced-motion: reduce)');

// Rejimni sahifaga qo'llash
function rejimniQollash(mavzu) {
  ildiz.setAttribute('data-theme', mavzu);
  const qorongi = mavzu === 'dark';
  rejimTugmasi.setAttribute('aria-label', qorongi ? 'Kunduzgi rejimni yoqish' : 'Tungi rejimni yoqish');
  rangMeta.setAttribute('content', qorongi ? '#0e0e11' : '#f5f5f7');
}

// Tanlovni eslab qolish (xotira yopiq bo'lsa ham sayt buzilmasin — try/catch)
function saqlash(mavzu) {
  try { localStorage.setItem('mavzu', mavzu); } catch (e) {}
}

function saqlanganRejim() {
  try { return localStorage.getItem('mavzu'); } catch (e) { return null; }
}

// Sahifa ochilganda tugma yozuvi va rangini to'g'rilab qo'yamiz
rejimniQollash(ildiz.getAttribute('data-theme') || 'light');

rejimTugmasi.addEventListener('click', function () {
  const yangi = ildiz.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  saqlash(yangi);

  // Brauzer "View Transitions"ni bilmasa yoki animatsiya o'chirilgan bo'lsa — oddiy almashtiramiz
  if (!document.startViewTransition || kamHarakat.matches) {
    rejimniQollash(yangi);
    return;
  }

  // Aks holda: yangi rejim tugmadan boshlab DOIRA shaklida butun ekranga yoyiladi
  const joy = rejimTugmasi.getBoundingClientRect();
  const x = joy.left + joy.width / 2;
  const y = joy.top + joy.height / 2;
  // Doira radiusi — tugmadan ekranning eng uzoq burchagigacha masofa
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  const otish = document.startViewTransition(function () {
    rejimniQollash(yangi);
  });

  otish.ready.then(function () {
    ildiz.animate(
      {
        clipPath: [
          'circle(0px at ' + x + 'px ' + y + 'px)',
          'circle(' + radius + 'px at ' + x + 'px ' + y + 'px)'
        ]
      },
      {
        duration: 600,
        easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
        pseudoElement: '::view-transition-new(root)'
      }
    );
  });
});

// Foydalanuvchi o'zi tanlamagan bo'lsa — qurilma sozlamasi o'zgarganda saytni ham moslaymiz
tizimQorongi.addEventListener('change', function (e) {
  const s = saqlanganRejim();
  if (s !== 'light' && s !== 'dark') {
    rejimniQollash(e.matches ? 'dark' : 'light');
  }
});


// ------------------------------------------------------------
// 4. TELEFON MENYUSI
// <dialog> elementi: showModal() — ochadi, close() — yopadi.
// Brauzer o'zi fokusni oyna ichida ushlab turadi va orqa fonni "muzlatadi".
// ------------------------------------------------------------
const menyuTugmasi = document.querySelector('.menu-btn');
const mobilMenyu = document.getElementById('mobil-menyu');
const yopishTugmasi = mobilMenyu.querySelector('.mm-close');

function menyuniOch() {
  mobilMenyu.showModal();
  menyuTugmasi.setAttribute('aria-expanded', 'true');
  menyuTugmasi.setAttribute('aria-label', 'Menyuni yopish');
}

// Yopishdan oldin "pastga tushish" animatsiyasini o'ynatamiz, keyin haqiqatan yopamiz.
// keyin — yopilgandan so'ng bajariladigan ish (masalan, bo'limga o'tish)
function menyuniYop(keyin) {
  if (!mobilMenyu.open) return;
  const tugat = function () {
    mobilMenyu.classList.remove('closing');
    mobilMenyu.close();
    menyuTugmasi.setAttribute('aria-expanded', 'false');
    menyuTugmasi.setAttribute('aria-label', 'Menyuni ochish');
    if (keyin) keyin();
  };
  if (kamHarakat.matches) {
    tugat();
    return;
  }
  mobilMenyu.classList.add('closing');
  mobilMenyu.addEventListener('animationend', tugat, { once: true });
}

menyuTugmasi.addEventListener('click', function () {
  if (mobilMenyu.open) {
    menyuniYop();
  } else {
    menyuniOch();
  }
});

yopishTugmasi.addEventListener('click', function () {
  menyuniYop();
});

// Esc bosilganda — brauzerning keskin yopishi o'rniga animatsiyali yopamiz
mobilMenyu.addEventListener('cancel', function (e) {
  e.preventDefault();
  menyuniYop();
});

// Panel tashqarisiga (qoraygan fonga) bosilganda yopiladi
mobilMenyu.addEventListener('click', function (e) {
  if (e.target === mobilMenyu) {
    const r = mobilMenyu.getBoundingClientRect();
    const ichida = e.clientX >= r.left && e.clientX <= r.right &&
                   e.clientY >= r.top && e.clientY <= r.bottom;
    if (!ichida) menyuniYop();
  }
});

// Menyudagi bo'lim havolasi bosilganda: avval menyu yopiladi, keyin o'sha bo'limga o'tiladi
mobilMenyu.querySelectorAll('.mm-links a').forEach(function (havola) {
  havola.addEventListener('click', function (e) {
    e.preventDefault();
    const manzil = havola.getAttribute('href');
    menyuniYop(function () {
      const bolim = document.querySelector(manzil);
      if (bolim) {
        bolim.scrollIntoView({ behavior: kamHarakat.matches ? 'auto' : 'smooth' });
        history.pushState(null, '', manzil);
      }
    });
  });
});

// Ekran kattalashib, menyu kerak bo'lmay qolsa — yopib qo'yamiz
window.matchMedia('(min-width: 981px)').addEventListener('change', function (e) {
  if (e.matches && mobilMenyu.open) {
    mobilMenyu.close();
    menyuTugmasi.setAttribute('aria-expanded', 'false');
  }
});


// ------------------------------------------------------------
// 5. FAOL BO'LIMNI YORITISH
// Ekran o'rtasidagi bo'lim menyuda belgilanadi (kompyuter va telefon menyusida)
// ------------------------------------------------------------
const bolimlar = ['loyihalar', 'men-haqimda', 'yolim', 'boglanish'];
const menyuHavolalari = document.querySelectorAll('.nav-links a, .mm-links a');

function faolBolim(id) {
  menyuHavolalari.forEach(function (h) {
    const mos = h.getAttribute('href') === '#' + id;
    h.classList.toggle('active', mos);
    if (mos) {
      h.setAttribute('aria-current', 'location');   // ekran o'quvchilar uchun: "siz shu yerdasiz"
    } else {
      h.removeAttribute('aria-current');
    }
  });
}

const bolimKuzatuvchi = new IntersectionObserver(function (yozuvlar) {
  yozuvlar.forEach(function (yozuv) {
    if (yozuv.isIntersecting) faolBolim(yozuv.target.id);
  });
}, { rootMargin: '-45% 0px -50% 0px' });   // faqat ekran o'rtasidagi tor chiziq hisobga olinadi

bolimlar.forEach(function (id) {
  const el = document.getElementById(id);
  if (el) bolimKuzatuvchi.observe(el);
});


// ------------------------------------------------------------
// 6. TEPAGA QAYTISH TUGMASI
// ------------------------------------------------------------
const tepagaTugma = document.querySelector('.to-top');

window.addEventListener('scroll', function () {
  const pastda = window.scrollY > 800;
  tepagaTugma.classList.toggle('show', pastda);
  // Sahifa tepasida hech qaysi bo'lim faol emas
  if (window.scrollY < 300) faolBolim(null);
}, { passive: true });

tepagaTugma.addEventListener('click', function (e) {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: kamHarakat.matches ? 'auto' : 'smooth' });
  history.pushState(null, '', location.pathname);
});


// ------------------------------------------------------------
// 7. EMAIL'NI NUSXALASH + XABARCHA (toast)
// ------------------------------------------------------------
const xabarcha = document.querySelector('.toast');
let xabarTaymeri;

function xabarKorsat(matn) {
  xabarcha.textContent = matn;
  // Kichik kechikish — CSS animatsiyasi ishlashi uchun
  requestAnimationFrame(function () {
    xabarcha.classList.add('show');
  });
  clearTimeout(xabarTaymeri);
  xabarTaymeri = setTimeout(function () {
    xabarcha.classList.remove('show');
  }, 2500);
}

// Eski brauzerlar uchun zaxira usul
function eskichaNusxalash(matn) {
  const maydon = document.createElement('textarea');
  maydon.value = matn;
  maydon.setAttribute('readonly', '');
  maydon.style.position = 'fixed';
  maydon.style.opacity = '0';
  document.body.appendChild(maydon);
  maydon.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch (e) {}
  maydon.remove();
  return ok;
}

document.querySelectorAll('.copy-btn').forEach(function (tugma) {
  const yozuv = tugma.querySelector('.copy-text');

  tugma.addEventListener('click', function () {
    const matn = tugma.dataset.copy;

    function muvaffaqiyat() {
      tugma.classList.add('copied');
      yozuv.textContent = 'Nusxalandi';
      xabarKorsat('Email nusxalandi ✓');
      setTimeout(function () {
        tugma.classList.remove('copied');
        yozuv.textContent = 'Nusxalash';
      }, 2000);
    }

    function xato() {
      xabarKorsat('Nusxalab bo\'lmadi — qo\'lda belgilab oling');
    }

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(matn).then(muvaffaqiyat, function () {
        eskichaNusxalash(matn) ? muvaffaqiyat() : xato();
      });
    } else {
      eskichaNusxalash(matn) ? muvaffaqiyat() : xato();
    }
  });
});
