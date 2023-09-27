const cheerio = require('cheerio');
const axios = require('axios').default;

const url = 'https://therarbg.com';

const parseTorrent = (data) => {
  const torrent = {};
  const $ = cheerio.load(data);
  // eslint-disable-next-line no-unused-vars
  const [_, seeders, leechers] = /Seeders:\s(\d+),\sLeechers:\s(\d+),/.exec(
    $('tr:has(th:contains("Peers:")) > td').text(),
  ) || [0, 0, 0];
  torrent.seeds = seeders;
  torrent.leeches = leechers;

  torrent.size = $("tr:has(th:contains('Size:')) > td").text();
  torrent.uploadDate = $("tr:has(th:contains('Added:')) > td").text();

  torrent.magnetLink = $("tr:has(th:contains('Torrent:')) > td > button:nth-child(2) > a").attr(
    'href',
  ) || '';

  torrent.title = $('h4:eq(1)').text() || '';

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
        `${url}/get-posts/keywords:${formattedQuery}/?page=${page}`,
      );
      const $ = cheerio.load(response.data);
      const rows = $('td.cellName');
      if (rows.length === 0) {
        break;
      }
      rows.each((i, el) => {
        if (torrentLinks.length < limit) {
          const torrentLink = $(el).find('div.wrapper > a:nth-child(1)');
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
