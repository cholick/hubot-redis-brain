# hubot-redis-brain

A hubot script to persist hubot's brain using redis

See [`src/redis-brain.js`](src/redis-brain.js).

Fork of https://github.com/hubot-scripts/hubot-redis-brain to
encrypt data at rest: hubot is likely storing the type of
thing you'd want to encrypt.

## Installation

In the hubot project repo, run:

`npm install cholick/hubot-redis-brain --save`

Then add **hubot-redis-brain** to your `external-scripts.json`:

```json
[
  "hubot-redis-brain"
]
```

#### Local

Change the package dependency to
```
...
"hubot-redis-brain": "file:../hubot-redis-brain"
...
```

## Configuration

hubot-redis-brain requires a redis server to work. It uses the `REDIS_URL` environment variable for determining
where to connect to. The default is on localhost, port 6379 (ie the redis default).

The following attributes can be set using the `REDIS_URL`

* authentication
* hostname
* port
* key prefix

For example, `export REDIS_URL=redis://passwd@192.168.0.1:16379/prefix` would
authenticate with `password`, connecting to 192.168.0.1 on port 16379, and store
data using the `prefix:storage` key.

Symmetric encryption also requires a key stored in `REDIS_CRYPT`.

**Note** changing the key will destroy existing data.

### Installing your own

If you need to install and run your own, most package managers have a package for redis:

* Docker `docker run -p 6379:6379 --name hubot-redis -d redis` 
* Mac OS X with homebrew: `brew install redis`
* Ubuntu/Debian with apt: `apt-get install redis-server`
* Compile from source: http://redis.io/topics/quickstart

### Providers

* [Redis Cloud](https://redislabs.com/redis-cloud)
* [Redis To Go](http://redistogo.com/)
