const cheerio = require('cheerio');
const axios = require('axios').default;

const url = 'https://torrentgalaxy.to';
const search = async (query, limit) => {
  const formattedQuery = query.trim().replace(/ /g, '+');
  let page = 1;
  const torrents = [];
  try {
    while (torrents.length < limit) {
      // eslint-disable-next-line no-await-in-loop
      const response = await axios.get(
        `${url}/torrents.php?search=${formattedQuery}&sort=seeders&order=desc&page=${page}`,
      );
      const $ = cheerio.load(response.data);
      //   console.log(response.data);
      const rows = $('div.tgxtablerow');
      if (rows.length === 0) {
        break;
      }
      rows.each((i, el) => {
        const torrent = {};
        torrent.index = i;
        torrent.title = $(el).find('div.tgxtablecell:nth-child(4) > div > a:nth-child(1)').attr('title');
        torrent.magnetLink = $(el)
          .find('div.tgxtablecell:nth-child(5) > a:nth-child(2)')
          .attr('href');
        torrent.size = $(el).find('div.tgxtablecell:nth-child(8) > span').text();
        torrent.seeds = $(el).find('div.tgxtablecell:nth-child(11) > span > font:nth-child(1) > b').text();
        torrent.leeches = $(el).find('div.tgxtablecell:nth-child(11) > span > font:nth-child(2) > b').text();
        torrent.uploadDate = $(el).find('div.tgxtablecell:nth-child(12) > small').text();
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
