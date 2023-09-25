const torrents = require('./torrents');

const listSites = () => {
  const sites = Object.keys(torrents).map((site) => site);
  return sites;
};

const search = async (query, limit, site) => {
  if (site === undefined) {
    throw new Error('No site specified');
  }
  if (!listSites().includes(site)) {
    throw new Error('Invalid site specified');
  }
  const torrentSite = new torrents[site]();
  const results = await torrentSite.search(query, limit);
  return results;
};

const searchMany = async (query, limitEach, sites) => {
  let torrentSites = sites;
  if (torrentSites === undefined) {
    torrentSites = listSites();
  }
  if (typeof torrentSites === 'string') {
    torrentSites = [sites];
  }
  if (torrentSites.length === 0) {
    throw new Error('No sites specified');
  }
  if (torrentSites.some((site) => !listSites().includes(site))) {
    throw new Error('Invalid site specified');
  }
  const result = {};
  const promises = torrentSites.map(async (site) => {
    const torrentSite = new torrents[site]();
    const siteResults = await torrentSite.search(query, limitEach);
    result[site] = siteResults;
  });
  await Promise.all(promises);
  return result;
};

module.exports = {
  listSites,
  searchMany,
  search,
};
