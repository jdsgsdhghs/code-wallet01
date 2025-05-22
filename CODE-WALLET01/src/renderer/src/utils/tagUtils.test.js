// Tests unitaires pour parseTags et filterFragmentsByTag
const { parseTags, filterFragmentsByTag } = require('./tagUtils');

describe('parseTags', () => {
  test('parse une chaîne en tableau tags propres et uniques', () => {
    const input = "React, api, React , UI , ";
    const expected = ['react', 'api', 'ui'];
    expect(parseTags(input)).toEqual(expected);
  });

  test('parseTags avec chaîne vide ou undefined', () => {
    expect(parseTags('')).toEqual([]);
    expect(parseTags(null)).toEqual([]);
    expect(parseTags(undefined)).toEqual([]);
  });
});

describe('filterFragmentsByTag', () => {
  const fragments = [
    { id: 1, tags: ['react', 'api'] },
    { id: 2, tags: ['ui'] },
    { id: 3, tags: ['api'] }
  ];

  test('filtre les fragments contenant un tag donné', () => {
    expect(filterFragmentsByTag(fragments, 'api')).toEqual([
      { id: 1, tags: ['react', 'api'] },
      { id: 3, tags: ['api'] }
    ]);
  });

  test('si tag vide, retourne tous les fragments', () => {
    expect(filterFragmentsByTag(fragments, '')).toEqual(fragments);
  });
});
