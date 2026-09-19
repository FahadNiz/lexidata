/**
 * Generate inflected forms from WordNet lemmas for lexidata-api
 * Rules: plural (S/ES/IES), past tense (ED), present 3rd person (S/ES), participle (ING), comparative (ER), superlative (EST)
 */
const fs = require('fs');

const rules = {
  plural: (w) => {
    if (w.endsWith('s') || w.endsWith('x') || w.endsWith('z') || w.endsWith('ch') || w.endsWith('sh')) return w + 'es';
    if (w.endsWith('y') && !'aeiou'.includes(w[w.length-2])) return w.slice(0,-1) + 'ies';
    return w + 's';
  },
  past_tense: (w) => w + 'ed',
  present_3rd_person: (w) => {
    if (w.endsWith('s') || w.endsWith('x') || w.endsWith('z') || w.endsWith('ch') || w.endsWith('sh')) return w + 'es';
    if (w.endsWith('y') && !'aeiou'.includes(w[w.length-2])) return w.slice(0,-1) + 'ies';
    return w + 's';
  },
  present_participle: (w) => w + 'ing',
  comparative: (w) => w + 'er',
  superlative: (w) => w + 'est',
  future: (w) => 'will ' + w,
  gerund: (w) => w + 'ing'
};

function generateInflections(word) {
  const w = word.toUpperCase();
  const forms = [];
  for (const [type, fn] of Object.entries(rules)) {
    const inflected = fn(w);
    if (inflected !== w && inflected.length === w.length) forms.push({ word: w, inflected_word: inflected, type });
  }
  return forms;
}

module.exports = { generateInflections, rules };
console.log('Inflection generator loaded — rules for plural, past_tense, present_3rd_person, present_participle, comparative, superlative, future, gerund');
