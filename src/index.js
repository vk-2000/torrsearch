const torrents = require("./torrents");

const listSites = () => {
  const sites = Object.keys(torrents).map((site) => {
    return site;
  });
  return sites;
};

const search = async (query, limit, site) => {
  if (!listSites().includes(site)) {
    throw new Error("Invalid site specified");
  }
  const torrentSite = new torrents[site]();
  const results = await torrentSite.search(query, limit);
  return results;
};

const searchMany = async (query, limitEach, sites) => {
  if (sites === undefined) {
    sites = listSites();
  }
  if (typeof sites === "string") {
    sites = [sites];
  }
  if (sites.length === 0) {
    throw new Error("No sites specified");
  }
  if (sites.some((site) => !listSites().includes(site))) {
    throw new Error("Invalid site specified");
  }
  const result = {};
  const promises = sites.map(async (site) => {
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
