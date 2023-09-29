const cheerio = require('cheerio');
const axios = require('axios').default;

const url = 'https://solidtorrents.to';
const search = async (query, limit) => {
  const formattedQuery = query.trim().replace(/ /g, '+');
  let page = 1;
  let totalResults = -1;
  const torrents = [];
  try {
    while (torrents.length < limit) {
      // eslint-disable-next-line no-await-in-loop
      const response = await axios.get(
        `${url}/search?q=${formattedQuery}&page=${page}`,
      );
      const $ = cheerio.load(response.data);
      if (totalResults === -1) {
        totalResults = parseInt(
          $('div.search-stats > span > b:nth-child(1)')
            .text()
            .replace(/,/g, ''),
          10,
        );
      }
      const rows = $('li.search-result');
      if (rows.length === 0) {
        break;
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
      if (torrents.length >= totalResults) {
        break;
      }
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
