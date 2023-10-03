const cheerio = require('cheerio');
const axios = require('axios').default;

const url = 'https://solidtorrents.to';
const resultsPerPage = 20;

const search = async (query, offset, limit) => {
  const formattedQuery = query.trim().replace(/ /g, '+');
  const initPage = Math.floor(offset / resultsPerPage) + 1;
  let page = initPage;
  const torrents = [];
  try {
    while (torrents.length < limit) {
      // eslint-disable-next-line no-await-in-loop
      const response = await axios.get(
        `${url}/search?q=${formattedQuery}&page=${page}`,
      );
      const $ = cheerio.load(response.data);
      const rows = $('li.search-result:has(div.links > a)');
      if (rows.length === 0) {
        break;
      }
      if (page === initPage) {
        rows.splice(0, offset % resultsPerPage);
      }
      rows.each((i, el) => {
        const torrent = {};
        torrent.index = i;
        torrent.title = $(el).find('div.info h5.title > a').text();
        torrent.magnetLink = $(el)
          .find('div.links > a:nth-child(2)')
          .attr('href');
        torrent.uploadDate = $(el).find('div.info div.stats > div:nth-child(5)').text();
        torrent.size = $(el).find('div.info div.stats > div:nth-child(2)').text();
        torrent.seeds = $(el).find('div.info div.stats > div:nth-child(3) > font').text();
        torrent.leeches = $(el).find('div.info div.stats > div:nth-child(4) > font').text();
        torrents.push(torrent);
        if (torrents.length >= limit) {
          return false;
        }
        return true;
      });
      page += 1;
    }
    return torrents;
  } catch (error) {
    throw new Error('No torrents found');
  }
};

module.exports = {
  search,
};
