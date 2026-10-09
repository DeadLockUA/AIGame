import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runBot } from '../../game/js/sim/bot.js';
import { storyOrders, refKit } from '../../game/js/core/progress.js';
import { stockFor } from '../../tools/calibrate-lib.mjs';

test('бот проходит выборку сюжетных заказов в пределах лимита времени', () => {
  for (const [s, i] of [[1, 0], [1, 4], [2, 2], [4, 3], [6, 0], [8, 4], [10, 5]]) {
    const o = storyOrders(s)[i];
    const r = runBot({ profile: o.profile, seed: o.seed, kit: { ...refKit(s), stock: stockFor(s) }, limit: 900, speed: 40, quirks: o.quirks, finds: o.finds, target: 90 });
    assert.ok(r.time <= o.limit * 1.05, `${o.id}: ${r.time.toFixed(0)}с при лимите ${o.limit}`);
    assert.ok(r.clean >= 90, `${o.id}: чистота ${r.clean.toFixed(1)}`);
  }
});
