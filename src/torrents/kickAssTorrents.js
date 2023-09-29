const cheerio = require('cheerio');
const axios = require('axios').default;

const url = 'https://kickasstorrents.to';

const parseTorrent = (data) => {
  const torrent = {};
  const $ = cheerio.load(data);
  torrent.title = $('span[itemprop="name"]').first().text().trim();
  torrent.seeds = $('div.seedBlock > strong').first().text().trim();
  torrent.leeches = $('div.leechBlock > strong').first().text().trim();
  torrent.uploadDate = $('div.timeBlock > time').first().text().trim();
  torrent.size = $('div.widgetSize > strong').first().text().trim();
  torrent.magnetLink = $('a[title="Magnet link"]').attr('href') || '';
  return torrent;
};

const search = async (query, limit) => {
  const formattedQuery = query.trim().replace(/ /g, '%20');
  let page = 1;
  const torrentLinks = [];
  try {
    while (torrentLinks.length < limit) {
      // eslint-disable-next-line no-await-in-loop
      const response = await axios.get(
        `${url}/search/${formattedQuery}/${page}/`,
      );
      const $ = cheerio.load(response.data);
      const rows = $('div.torrentname');
      if (rows.length === 0) {
        break;
      }
      rows.each((i, el) => {
        if (torrentLinks.length < limit) {
          const torrentLink = $(el).find('a:nth-child(1)');
          if (torrentLink) {
            torrentLinks.push(torrentLink.attr('href'));
          }
        }
      });
      page += 1;
    }
  } catch (error) {
    throw new Error('No torrents found');
  }
  // console.log(torrentLinks);
  try {
    const torrents = await Promise.all(
      torrentLinks.map(async (torrentLink, i) => {
        const response = await axios.get(`${url}${torrentLink}`);
        return {
          index: i,
          ...parseTorrent(response.data),
        };
      }),
    );
    return torrents;
  } catch (error) {
    throw new Error('No torrents found');
  }
};

module.exports = {
  search,
};
