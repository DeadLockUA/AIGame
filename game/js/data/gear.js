// Типы грязи, инструменты, расходники, модификаторы.
export const DIRT = [
  { id: 'dust', short: 'Пыль', name: 'Пыль',            phase: 'dry', weight: 0.5, color: [150, 132, 110], alpha: 0.62, hint: 'Пылесос' },
  { id: 'hair', short: 'Шерсть', name: 'Шерсть и волосы', phase: 'dry', weight: 0.7, color: [70, 52, 40],    alpha: 0.9,  hint: 'Пылесос с щёткой' },
  { id: 'sand', short: 'Песок', name: 'Песок',           phase: 'dry', weight: 0.8, color: [196, 166, 108], alpha: 0.85, hint: 'Мощный пылесос' },
  { id: 'mud', short: 'Грязь', name: 'Мокрая грязь',    phase: 'wet', weight: 1.0, color: [84, 58, 38],    alpha: 0.92, hint: 'Мыло и вода' },
  { id: 'grease', short: 'Жир', name: 'Жир',             phase: 'wet', weight: 1.2, color: [150, 118, 40],  alpha: 0.78, hint: 'Обезжириватель' },
  { id: 'stain', short: 'Пятна', name: 'Пятна',           phase: 'wet', weight: 1.3, color: [100, 40, 40],   alpha: 0.9,  hint: 'Энзим' },
  { id: 'deep', short: 'Въевшаяся', name: 'Въевшаяся грязь', phase: 'wet', weight: 1.5, color: [110, 100, 92],  alpha: 0.7,  hint: 'Скраб, оксипена, пар' },
  { id: 'mold', short: 'Плесень', name: 'Плесень',         phase: 'wet', weight: 1.4, color: [64, 112, 74],   alpha: 0.88, hint: 'Антиплесень, пар' },
];
export const D = Object.fromEntries(DIRT.map((d, i) => [d.id, i]));
export const NDIRT = DIRT.length;

// Цвета вариантов пятен (кофе, вино, чернила).
export const STAIN_COLORS = [[96, 58, 34], [118, 28, 52], [38, 44, 110]];

export const PHASES = ['vacuum', 'apply', 'rinse'];
export const PHASE_NAMES = { vacuum: 'Пылесос', apply: 'Средство', rinse: 'Смыв' };

// Пылесосы. radius в клетках, power — скорость, aff — чувствительность к сухим типам.
export const VACUUMS = [
  { id: 'v_mouse',   name: 'Ручной «Мышка»',     price: 0,    rep: 0, radius: 5,  power: 1.1, aff: [1.0, 0.5, 0.35], tank: 40,  desc: 'Простой и компактный. С пылью справляется, с песком и шерстью туго.' },
  { id: 'v_slot',    name: 'Щелевой «Щучка»',    price: 140,  rep: 0, radius: 4,  power: 1.5, aff: [1.0, 0.95, 0.6], tank: 40,  desc: 'Узкий, зато цепкий. Хорош по шерсти и в углах.' },
  { id: 'v_fox',     name: 'Турбощётка «Лисичка»', price: 420, rep: 0, radius: 6,  power: 1.45, aff: [1.05, 1.35, 0.65], tank: 70, desc: 'Вращающаяся щётка вычёсывает шерсть.' },
  { id: 'v_cyclone', name: 'Циклон-3000',        price: 980,  rep: 0, radius: 8,  power: 2.0, aff: [1.1, 1.0, 1.0], tank: 100, desc: 'Широкий и мощный. Песок ему не страшен.' },
  { id: 'v_hippo',   name: 'Промышленный «Бегемот»', price: 2300, rep: 3, radius: 11, power: 2.7, aff: [1.15, 1.15, 1.25], tank: 150, desc: 'Вычищает целые районы за раз.' },
];

// Аппликаторы (фаза «Средство»). deposit — сколько пены даёт, usage — расход, scrub — усиление при движении.
export const APPLICATORS = [
  { id: 'a_spray',  name: 'Распылитель «Дождик»', price: 0,    rep: 0, radius: 6,  deposit: 1.2, usage: 1.0, scrub: 1.0, desc: 'Базовый распылитель. Мыльный туман без лишних изысков.' },
  { id: 'a_sponge', name: 'Губка-скраб «Тётя Зина»', price: 120, rep: 0, radius: 4, deposit: 0.6, usage: 0.7, scrub: 2.0, desc: 'Чем быстрее водишь, тем сильнее трёт. Для въевшегося.' },
  { id: 'a_foam',   name: 'Пеногенератор «Айсберг»', price: 460, rep: 0, radius: 8, deposit: 1.6, usage: 1.35, scrub: 1.0, desc: 'Накрывает щедрым слоем пены.' },
  { id: 'a_vortex', name: 'Роторная щётка «Вихрь»', price: 1150, rep: 0, radius: 7, deposit: 1.0, usage: 1.1, scrub: 2.6, desc: 'Тянет пену и сразу втирает её.' },
  { id: 'a_mist',   name: 'Туманник «Облако»', price: 2500, rep: 3, radius: 12, deposit: 1.2, usage: 0.65, scrub: 1.2, desc: 'Огромный охват и экономный расход.' },
];

// Инструменты смыва. pressure — сила, flow — расход воды, steam — паровой.
export const RINSERS = [
  { id: 'r_can',   name: 'Лейка «Бабушкина»', price: 0,    rep: 0, radius: 7,  pressure: 0.9, flow: 0.8, steam: false, tank: 60,  desc: 'Мягкий душ без спешки и нервов.' },
  { id: 'r_hose',  name: 'Шланг «Змей»',     price: 160,  rep: 0, radius: 5,  pressure: 1.2, flow: 1.0, steam: false, tank: 80,  desc: 'Ровная струя. Работяга.' },
  { id: 'r_storm', name: 'Мойка «Шторм»',     price: 760,  rep: 0, radius: 4,  pressure: 2.2, flow: 1.2, steam: false, tank: 100, desc: 'Узкая и злая струя. Удержание даёт ещё больше напора.' },
  { id: 'r_dragon', name: 'Паровой «Дракон»', price: 1700, rep: 2, radius: 6,  pressure: 1.2, flow: 0.5, steam: true,  tank: 120, desc: 'Горячий пар берёт жир, плесень и въевшееся. Вода не нужна, нужен пар.' },
  { id: 'r_rain',  name: 'Дождеватель «Ливень»', price: 2700, rep: 4, radius: 12, pressure: 1.0, flow: 2.0, steam: false, tank: 200, desc: 'Накрывает огромную площадь. Воду любит в больших количествах.' },
];

// Средства. aff — сродство к типам грязи (по порядку DIRT), rate — скорость, dwell — сколько секунд «настаивать».
export const PRODUCTS = [
  { id: 'p_eco',    name: 'Эко-гель «Травка»',    price: 1,  rep: 0, rate: 0.45, dwell: 2.0, aff: [0.5, 0.2, 0.2, 0.5, 0.25, 0.25, 0.25, 0.1], color: [196, 232, 190], desc: 'Дёшево и почти безвредно. Но и силы маловато.' },
  { id: 'p_soap',   name: 'Мыло «Ромашка»',       price: 2,  rep: 0, rate: 0.8, dwell: 2.0, aff: [0.7, 0.4, 0.4, 1.0, 0.35, 0.4, 0.35, 0.1], color: [250, 246, 220], desc: 'Универсальное. Особенно хорошо берёт мокрую грязь.' },
  { id: 'p_degreaser', name: 'Обезжириватель «Жиронет»', price: 4, rep: 0, rate: 1.0, dwell: 2.5, aff: [0.3, 0.3, 0.2, 0.7, 1.4, 0.55, 0.6, 0.1], color: [255, 238, 150], desc: 'Растворяет жир без лишней суеты.' },
  { id: 'p_enzyme', name: 'Энзим «Пятновыводец»', price: 5,  rep: 0, rate: 1.0, dwell: 3.5, aff: [0.2, 0.2, 0.1, 0.55, 0.5, 1.5, 0.7, 0.2], color: [255, 214, 232], desc: 'Любит кофе, вино и чернила. Даёшь настояться — получаешь результат.' },
  { id: 'p_antimold', name: 'Антиплесень «Грибок-стоп»', price: 6, rep: 0, rate: 1.0, dwell: 3.0, aff: [0.1, 0.1, 0.1, 0.4, 0.2, 0.2, 0.5, 1.5], color: [196, 238, 255], desc: 'Против плесени и сырости.' },
  { id: 'p_oxy',    name: 'Оксипена «Атом»',      price: 11, rep: 1, rate: 1.2, dwell: 3.0, aff: [0.8, 0.6, 0.5, 1.0, 1.0, 1.1, 1.4, 0.9], color: [214, 234, 255], desc: 'Дорого и сердито. Берёт почти всё.' },
];

// Фильтры для пылесоса. cap — сколько грязи выдерживает, quality — множитель силы.
export const FILTERS = [
  { id: 'f_paper', name: 'Бумажный',  price: 4,  cap: 140, quality: 1.0, desc: 'Забивается быстро.' },
  { id: 'f_coal',  name: 'Угольный',  price: 12, cap: 280, quality: 1.12, desc: 'Живёт дольше и сосёт бодрее.' },
  { id: 'f_hepa',  name: 'HEPA «Нос»', price: 28, cap: 560, quality: 1.25, desc: 'Почти не забивается.' },
];

export const CONSUMABLE_PRICES = { water: 0.25, steam: 0.8 }; // за единицу

// Модификаторы (слот на инструмент). Появляются с 3-го сезона.
export const MODS = [
  { id: 'm_wide',    slot: 'vacuum',  name: 'Широкая насадка',  price: 380,  rep: 0, stats: { radius: 1.25, power: 0.9 }, desc: '+25% ширины, -10% силы.' },
  { id: 'm_turbo',   slot: 'vacuum',  name: 'Турбина+',        price: 620,  rep: 0, stats: { power: 1.25 }, desc: '+25% силы.' },
  { id: 'm_cassette',slot: 'vacuum',  name: 'Кассета на запас', price: 340,  rep: 0, stats: { filterCap: 1.6 }, desc: 'Фильтр служит на 60% дольше.' },
  { id: 'm_dose',    slot: 'applicator', name: 'Дозатор',       price: 360,  rep: 0, stats: { usage: 0.7 }, desc: '-30% расхода средства.' },
  { id: 'm_humid',   slot: 'applicator', name: 'Увлажнитель',   price: 540,  rep: 0, stats: { dwell: 0.65 }, desc: 'Средство работает быстрее.' },
  { id: 'm_color',   slot: 'applicator', name: 'Цветная пена',  price: 300,  rep: 1, stats: { appeal: 0.15 }, desc: 'Красиво в ленте: больше подписчиков.' },
  { id: 'm_fan',     slot: 'rinse',   name: 'Форсунка-веер',   price: 420,  rep: 0, stats: { radius: 1.3, pressure: 0.9 }, desc: '+30% ширины, -10% напора.' },
  { id: 'm_eco',     slot: 'rinse',   name: 'Экономайзер',     price: 460,  rep: 0, stats: { flow: 0.65 }, desc: '-35% воды и пара.' },
  { id: 'm_ion',     slot: 'rinse',   name: 'Ионизатор',       price: 780,  rep: 1, stats: { pressure: 1.2, heat: 1.15 }, desc: '+20% напора, лучше против пятен.' },
];

export const ALL_TOOLS = Object.fromEntries([...VACUUMS, ...APPLICATORS, ...RINSERS].map((t) => [t.id, t]));
export const ALL_PRODUCTS = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
export const ALL_FILTERS = Object.fromEntries(FILTERS.map((p) => [p.id, p]));
export const ALL_MODS = Object.fromEntries(MODS.map((p) => [p.id, p]));
export const TOOLS_BY_PHASE = { vacuum: VACUUMS, apply: APPLICATORS, rinse: RINSERS };

// Эффективность простой воды и пара по типам грязи.
export const WATER_AFF = [0.12, 0.12, 0.25, 0.5, 0.03, 0.06, 0.02, 0.02];
export const STEAM_AFF = [0.2, 0.2, 0.3, 0.7, 0.7, 0.4, 0.85, 0.8];
