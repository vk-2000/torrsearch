class TorrentSearch {
  constructor() {
    if (this.constructor === TorrentSearch) {
      throw new TypeError(
        'Abstract class "TorrentSearch" cannot be instantiated directly.'
      );
    }
  }
  async search(query, limit) {
    throw new Error('Method "search(query, limit)" must be implemented.');
  }
}

module.exports = TorrentSearch;
