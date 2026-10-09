// Достижения «Чистого ворса». check — ключ метрики, goal — порог.
export default [
  // jobs
  { id: 'a_jobs_1', name: 'Первый ворс', desc: 'Выполни первый заказ. Дед гордится, кот делает вид, что нет.', check: 'jobs', goal: 1, rewardCoins: 20, rewardRep: 0 },
  { id: 'a_jobs_10', name: 'Руки пахнут пеной', desc: 'Выполни 10 заказов.', check: 'jobs', goal: 10, rewardCoins: 80, rewardRep: 0 },
  { id: 'a_jobs_30', name: 'Свой человек в районе', desc: 'Выполни 30 заказов. Тебя уже узнают в булочной.', check: 'jobs', goal: 30, rewardCoins: 200, rewardRep: 1 },
  { id: 'a_jobs_60', name: 'Ковровый рабочий', desc: 'Выполни 60 заказов.', check: 'jobs', goal: 60, rewardCoins: 450, rewardRep: 1 },
  { id: 'a_jobs_100', name: 'Сто к одному', desc: 'Выполни 100 заказов. Остальные ковры нервно курят.', check: 'jobs', goal: 100, rewardCoins: 900, rewardRep: 2 },
  { id: 'a_jobs_250', name: 'Легенда мокрых рукавов', desc: 'Выполни 250 заказов.', check: 'jobs', goal: 250, rewardCoins: 2000, rewardRep: 4 },

  // perfect
  { id: 'a_perfect_1', name: 'Как с иголочки', desc: 'Сделай идеальную мойку.', check: 'perfect', goal: 1, rewardCoins: 40, rewardRep: 0 },
  { id: 'a_perfect_10', name: 'Придирчивый глаз', desc: 'Сделай 10 идеальных моек.', check: 'perfect', goal: 10, rewardCoins: 200, rewardRep: 1 },
  { id: 'a_perfect_40', name: 'Ни пылинки, ни совести', desc: 'Сделай 40 идеальных моек.', check: 'perfect', goal: 40, rewardCoins: 700, rewardRep: 2 },
  { id: 'a_perfect_100', name: 'Эталон чистоты', desc: 'Сделай 100 идеальных моек. Кот впервые моргнул одобрительно.', check: 'perfect', goal: 100, rewardCoins: 1800, rewardRep: 4 },

  // stars3
  { id: 'a_stars_1', name: 'Три звезды и ужин', desc: 'Получи три звезды за заказ.', check: 'stars3', goal: 1, rewardCoins: 30, rewardRep: 0 },
  { id: 'a_stars_15', name: 'Звёздный небосклон', desc: 'Получи три звезды 15 раз.', check: 'stars3', goal: 15, rewardCoins: 250, rewardRep: 1 },
  { id: 'a_stars_50', name: 'Генерал ковровых войск', desc: 'Получи три звезды 50 раз.', check: 'stars3', goal: 50, rewardCoins: 800, rewardRep: 2 },

  // finds
  { id: 'a_finds_1', name: 'Что-то блестит', desc: 'Найди первый предмет в ковре.', check: 'finds', goal: 1, rewardCoins: 25, rewardRep: 0 },
  { id: 'a_finds_10', name: 'Карманы ковра', desc: 'Найди 10 предметов.', check: 'finds', goal: 10, rewardCoins: 100, rewardRep: 0 },
  { id: 'a_finds_30', name: 'Старьёвщик-любитель', desc: 'Найди 30 предметов. Серёга-с-рынка просит тебя не конкурировать.', check: 'finds', goal: 30, rewardCoins: 350, rewardRep: 1 },
  { id: 'a_finds_60', name: 'Музей забытых вещей', desc: 'Найди 60 предметов.', check: 'finds', goal: 60, rewardCoins: 900, rewardRep: 2 },

  // followers
  { id: 'a_followers_20', name: 'Первые болельщики', desc: 'Набери 20 подписчиков. Среди них — мама и тётя Валя.', check: 'followers', goal: 20, rewardCoins: 60, rewardRep: 0 },
  { id: 'a_followers_100', name: 'Почти знаменитость', desc: 'Набери 100 подписчиков.', check: 'followers', goal: 100, rewardCoins: 200, rewardRep: 1 },
  { id: 'a_followers_500', name: 'Голос района', desc: 'Набери 500 подписчиков.', check: 'followers', goal: 500, rewardCoins: 600, rewardRep: 2 },
  { id: 'a_followers_2000', name: 'Звезда ковровой ленты', desc: 'Набери 2000 подписчиков. Эдуард Борисович в ярости.', check: 'followers', goal: 2000, rewardCoins: 1500, rewardRep: 3 },

  // coins
  { id: 'a_coins_500', name: 'Копилка не пуста', desc: 'Накопи 500 монет.', check: 'coins', goal: 500, rewardCoins: 50, rewardRep: 0 },
  { id: 'a_coins_5000', name: 'Кубышка зашуршала', desc: 'Накопи 5000 монет.', check: 'coins', goal: 5000, rewardCoins: 400, rewardRep: 1 },
  { id: 'a_coins_30000', name: 'Серьёзный бизнесмен', desc: 'Накопи 30 000 монет. Налоговая смотрит с интересом.', check: 'coins', goal: 30000, rewardCoins: 1200, rewardRep: 2 },

  // fast
  { id: 'a_fast_1', name: 'Не терял ни секунды', desc: 'Вымой ковёр быстрее, чем за половину времени.', check: 'fast', goal: 1, rewardCoins: 40, rewardRep: 0 },
  { id: 'a_fast_10', name: 'Реактивная пена', desc: 'Сделай 10 быстрых моек.', check: 'fast', goal: 10, rewardCoins: 250, rewardRep: 1 },
  { id: 'a_fast_40', name: 'Молния с ведром', desc: 'Сделай 40 быстрых моек. Кот не успел зевнуть.', check: 'fast', goal: 40, rewardCoins: 900, rewardRep: 2 },

  // noVacuum
  { id: 'a_novac_1', name: 'Пыль не помеха', desc: 'Вымой ковёр без пылесоса.', check: 'noVacuum', goal: 1, rewardCoins: 40, rewardRep: 0 },
  { id: 'a_novac_10', name: 'Пылесос в отпуске', desc: 'Сделай 10 моек без пылесоса.', check: 'noVacuum', goal: 10, rewardCoins: 300, rewardRep: 1 },

  // noRescue
  { id: 'a_norescue_5', name: 'Сам с усам', desc: 'Выполни 5 заказов подряд без спасения репутацией.', check: 'noRescue', goal: 5, rewardCoins: 120, rewardRep: 0 },
  { id: 'a_norescue_20', name: 'Без костылей и поблажек', desc: 'Выполни 20 заказов подряд без спасения.', check: 'noRescue', goal: 20, rewardCoins: 600, rewardRep: 2 },

  // seasons
  { id: 'a_seasons_1', name: 'Район покорён', desc: 'Закрой первый район. Тополиная машет платочком.', check: 'seasons', goal: 1, rewardCoins: 150, rewardRep: 1 },
  { id: 'a_seasons_3', name: 'Три района в кармане', desc: 'Закрой 3 района.', check: 'seasons', goal: 3, rewardCoins: 400, rewardRep: 2 },
  { id: 'a_seasons_6', name: 'Полгорода отмыто', desc: 'Закрой 6 районов.', check: 'seasons', goal: 6, rewardCoins: 900, rewardRep: 3 },
  { id: 'a_seasons_10', name: 'Хозяин Площади Ковров', desc: 'Закрой все 10 районов. Дед Ефим утирает слезу рукавом.', check: 'seasons', goal: 10, rewardCoins: 2000, rewardRep: 5 },

  // absurd
  { id: 'a_absurd_1', name: 'Реальность прогнулась', desc: 'Вымой первый абсурдный ковёр.', check: 'absurd', goal: 1, rewardCoins: 60, rewardRep: 0 },
  { id: 'a_absurd_5', name: 'Укротитель странностей', desc: 'Вымой 5 абсурдных ковров. Утки на них больше не крякают.', check: 'absurd', goal: 5, rewardCoins: 300, rewardRep: 1 },
  { id: 'a_absurd_10', name: 'Хранитель безумия', desc: 'Вымой 10 абсурдных ковров.', check: 'absurd', goal: 10, rewardCoins: 800, rewardRep: 3 },

  // owned
  { id: 'a_owned_5', name: 'Полный арсенал', desc: 'Обзаведись 5 инструментами.', check: 'owned', goal: 5, rewardCoins: 100, rewardRep: 0 },
  { id: 'a_owned_12', name: 'Мастерская как лавка', desc: 'Обзаведись 12 инструментами.', check: 'owned', goal: 12, rewardCoins: 500, rewardRep: 2 },

  // mods
  { id: 'a_mods_3', name: 'Тюнинг для щётки', desc: 'Поставь 3 насадки.', check: 'mods', goal: 3, rewardCoins: 120, rewardRep: 0 },
  { id: 'a_mods_10', name: 'Инженер с пенным уклоном', desc: 'Поставь 10 насадок.', check: 'mods', goal: 10, rewardCoins: 600, rewardRep: 2 },

  // decor
  { id: 'a_decor_3', name: 'Вьём гнёздышко', desc: 'Расставь 3 предмета декора. Кот выбрал себе одну подушку.', check: 'decor', goal: 3, rewardCoins: 100, rewardRep: 0 },
  { id: 'a_decor_12', name: 'Дизайнер из народа', desc: 'Расставь 12 предметов декора.', check: 'decor', goal: 12, rewardCoins: 600, rewardRep: 2 },

  // challenges
  { id: 'a_chal_1', name: 'Первый вызов', desc: 'Пройди первый вызов.', check: 'challenges', goal: 1, rewardCoins: 80, rewardRep: 0 },
  { id: 'a_chal_10', name: 'Любитель острых ощущений', desc: 'Пройди 10 вызовов.', check: 'challenges', goal: 10, rewardCoins: 500, rewardRep: 2 },
  { id: 'a_chal_25', name: 'Вызов принят, нервы — нет', desc: 'Пройди 25 вызовов.', check: 'challenges', goal: 25, rewardCoins: 1400, rewardRep: 3 },

  // gallery
  { id: 'a_gal_1', name: 'Первый пост', desc: 'Выложи в ленту первый пост «до/после».', check: 'gallery', goal: 1, rewardCoins: 30, rewardRep: 0 },
  { id: 'a_gal_20', name: 'Фотограф ковров', desc: 'Выложи 20 постов.', check: 'gallery', goal: 20, rewardCoins: 250, rewardRep: 1 },
  { id: 'a_gal_80', name: 'Летописец ворса', desc: 'Выложи 80 постов. Лента скрипит, но держится.', check: 'gallery', goal: 80, rewardCoins: 1000, rewardRep: 3 },
];
