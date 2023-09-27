const cheerio = require('cheerio');
const axios = require('axios').default;

const url = 'https://1337x.to';

const parseTorrent = (data) => {
  const torrent = {};
  const $ = cheerio.load(data);

  torrent.title = $('div.box-info-heading > h1').text();
  torrent.seeds = $('span.seeds').text();
  torrent.leeches = $('span.leeches').text();
  torrent.size = $(
    'div.clearfix > ul:nth-child(2) > li:nth-child(4) > span',
  ).text();
  torrent.uploadDate = $(
    'div.clearfix > ul:nth-child(3) > li:nth-child(3) > span',
  ).text();
  torrent.magnetLink = $(
    'div.clearfix > ul:nth-child(1) > li:nth-child(1) > a:nth-child(1)',
  ).attr('href') || '';
  return torrent;
};

const search = async (query, limit) => {
  const formattedQuery = query.trim().replace(/ /g, '+');
  let page = 1;
  const torrentLinks = [];
  try {
    while (torrentLinks.length < limit) {
      // eslint-disable-next-line no-await-in-loop
      const response = await axios.get(
        `${url}/search/${formattedQuery}/${page}/`,
      );
      const $ = cheerio.load(response.data);
      const rows = $('td.name');
      if (rows.length === 0) {
        break;
      }
      rows.each((i, el) => {
        if (torrentLinks.length < limit) {
          const torrentLink = $(el).find('a:nth-child(2)');
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
