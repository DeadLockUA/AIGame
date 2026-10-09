// Реестр стилей ковров. Каждый стиль: { id, name, paint(g, rng, spec) -> { edge, fringe } }
import persian from './persian.js';
import turkish from './turkish.js';
import scandi from './scandi.js';
import japanese from './japanese.js';
import indian from './indian.js';
import moroccan from './moroccan.js';
import navajo from './navajo.js';
import retro from './retro.js';
import pizza from './pizza.js';
import space from './space.js';
import ocean from './ocean.js';
import cats from './cats.js';
import ducks from './ducks.js';
import wizard from './wizard.js';
import garden from './garden.js';
import mushrooms from './mushrooms.js';
import dino from './dino.js';
import candy from './candy.js';
import robots from './robots.js';
import clouds from './clouds.js';

export const STYLES = { persian, turkish, scandi, japanese, indian, moroccan, navajo, retro, pizza, space, ocean, cats, ducks, wizard, garden, mushrooms, dino, candy, robots, clouds };
export const CULTURES = ['persian', 'turkish', 'scandi', 'japanese', 'indian', 'moroccan', 'navajo', 'retro'];
export const ABSURD = ['pizza', 'space', 'ocean', 'cats', 'ducks', 'wizard', 'garden', 'mushrooms', 'dino', 'candy', 'robots', 'clouds'];
