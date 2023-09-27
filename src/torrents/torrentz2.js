const cheerio = require('cheerio');
const axios = require('axios').default;

const url = 'https://torrentz2.nz';
const search = async (query, limit) => {
  const formattedQuery = query.trim().replace(/ /g, '+');
  let page = 1;
  const torrents = [];
  try {
    while (torrents.length < limit) {
      // eslint-disable-next-line no-await-in-loop
      const response = await axios.get(
        `${url}/search?q=${formattedQuery}&page=${page}`,
      );
      const $ = cheerio.load(response.data);
      const rows = $('dl');
      if (rows.length === 0) {
        break;
      }
      rows.each((i, el) => {
        const torrent = {};
        torrent.index = i;
        torrent.title = $(el).find('dt > a').text();
        torrent.magnetLink = $(el)
          .find('dd > span:nth-child(1) > a')
          .attr('href');
        torrent.uploadDate = $(el).find('dd > span:nth-child(2)').text();
        torrent.size = $(el).find('dd > span:nth-child(3)').text();
        torrent.seeds = $(el).find('dd > span:nth-child(4)').text();
        torrent.leeches = $(el).find('dd > span:nth-child(5)').text();
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
