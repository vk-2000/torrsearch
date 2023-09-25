const TorrentSearch = require("./abstract");
const cheerio = require("cheerio");
const axios = require("axios");

class TorrentTheRarbg extends TorrentSearch {
  #url = "https://therarbg.com";

  constructor() {
    super();
  }

  #parseTorrent(data) {
    const torrent = {};
    const $ = cheerio.load(data);
    const peerString = $('tr:has(th:contains("Peers:")) > td').text();
    const peerRegex = /Seeders:\s(\d+),\sLeechers:\s(\d+),/;
    const peerMatch = peerString.match(peerRegex);
    if (peerMatch) {
      torrent.seeds = peerMatch[1];
      torrent.leeches = peerMatch[2];
    } else {
      torrent.seeds = "0";
      torrent.leeches = "0";
    }

    torrent.size = $("tr:has(th:contains('Size:')) > td").text();
    torrent.uploadDate = $("tr:has(th:contains('Added:')) > td").text();

    torrent.magnetLink =
      $("tr:has(th:contains('Torrent:')) > td > button:nth-child(2) > a").attr(
        "href"
      ) || "";

    torrent.title = $("h4:eq(1)").text() || "";

    return torrent;
  }

  async search(query, limit) {
    const formattedQuery = query.trim().replace(/ /g, "%20");
    let page = 1;
    let torrentLinks = [];

    try {
      while (torrentLinks.length < limit) {
        const response = await axios.get(
          `${this.#url}/get-posts/keywords:${formattedQuery}/?page=${page}`
        );
        const $ = cheerio.load(response.data);
        const rows = $("td.cellName");
        if (rows.length === 0) {
          break;
        }
        rows.each((i, el) => {
          if (torrentLinks.length < limit) {
            const torrentLink = $(el).find("div.wrapper > a:nth-child(1)");
            if (torrentLink) {
              torrentLinks.push(torrentLink.attr("href"));
            }
          }
        });
        page++;
      }
    } catch (error) {
      throw new Error("No torrents found");
    }
    // console.log(torrentLinks);
    try {
      const torrents = await Promise.all(
        torrentLinks.map(async (torrentLink) => {
          const response = await axios.get(`${this.#url}${torrentLink}`);
          const torrent = this.#parseTorrent(response.data);
          return torrent;
        })
      );
      return torrents;
    } catch (error) {
      throw new Error("No torrents found");
    }
  }
}

module.exports = TorrentTheRarbg;
