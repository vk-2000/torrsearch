# Torrsearch

**Torrsearch** is a Node.js library for searching torrents on various torrent sites.

<h3>Installation</h3>

```bash
npm install git+https://github.com/vk-2000/torrsearch.git
```

<h3>API</h3>

<h4>listSites()</h4>

Returns a list of supported sites.


<h4>search(query, limit, site)</h4>

Searches for torrents from a single site.

| Parameter | Type | Description |
| --- | --- | --- |
| query | <code>string</code> | Search query |
| limit | <code>number</code> | Number of results to return |
| site | <code>string</code> | Site to search from |

<h4>searchMany(query, limit, sites)</h4>

Searches for torrents from multiple sites.

| Parameter | Type | Description |
| --- | --- | --- |
| query | <code>string</code> | Search query |
| limit | <code>number</code> | Number of results to return from each site |
| sites | <code>Array&lt;string&gt;</code> | Sites to search from |


<h3>Usage</h3>

```javascript
const torrsearch = require('torrsearch');

// List available torrent sites
const sites = torrsearch.listSites();
console.log('Available Sites:', sites);

// Perform a single-site search
try {
  const results = await torrsearch.search("Ubuntu", 10, "1337x");
  console.log('Search Results:', results);
} catch (error) {
  console.error('Error:', error.message);
}

// Perform a multi-site search
try {
  const results = await torrsearch.searchMany("Linux", 5, ["1337x", "theRarbg"]);
  console.log('Multi-Site Search Results:', results);
} catch (error) {
  console.error('Error:', error.message);
}

```




