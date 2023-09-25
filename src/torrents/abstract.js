class TorrentSearch {
  constructor() {
    if (this.constructor === TorrentSearch) {
      throw new TypeError(
        'Abstract class "TorrentSearch" cannot be instantiated directly.',
      );
    }
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async search(query, limit) {
    throw new Error('Method "search(query, limit)" must be implemented.');
  }
}

module.exports = TorrentSearch;
