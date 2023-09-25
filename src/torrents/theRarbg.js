const cheerio = require('cheerio');
const axios = require('axios');
const TorrentSearch = require('./abstract');

class TorrentTheRarbg extends TorrentSearch {
  #url = 'https://therarbg.com';

  static #parseTorrent(data) {
    const torrent = {};
    const $ = cheerio.load(data);
    const [seeders, leechers] = $('tr:has(th:contains("Peers:")) > td')
      .text()
      .match(/Seeders:\s(\d+),\sLeechers:\s(\d+),/) || [0, 0];
    torrent.seeds = seeders;
    torrent.leeches = leechers;

    torrent.size = $("tr:has(th:contains('Size:')) > td").text();
    torrent.uploadDate = $("tr:has(th:contains('Added:')) > td").text();

    torrent.magnetLink = $("tr:has(th:contains('Torrent:')) > td > button:nth-child(2) > a").attr(
      'href',
    ) || '';

    torrent.title = $('h4:eq(1)').text() || '';

    return torrent;
  }

  async search(query, limit) {
    const formattedQuery = query.trim().replace(/ /g, '%20');
    let page = 1;
    const torrentLinks = [];

    try {
      while (torrentLinks.length < limit) {
        // eslint-disable-next-line no-await-in-loop
        const response = await axios.get(
          `${this.#url}/get-posts/keywords:${formattedQuery}/?page=${page}`,
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
        torrentLinks.map(async (torrentLink) => {
          const response = await axios.get(`${this.#url}${torrentLink}`);
          const torrent = TorrentTheRarbg.#parseTorrent(response.data);
          return torrent;
        }),
      );
      return torrents;
    } catch (error) {
      throw new Error('No torrents found');
    }
  }
}

module.exports = TorrentTheRarbg;
