# Rewrite URL Follower

[![Build Status](https://travis-ci.org/npm/rewrite-url-follower.svg)](https://travis-ci.org/npm/rewrite-url-follower)

npm On-Site and npm-registry-couchapp store package URLs in their
database. These represent the full canonical path to the a package.
If the database ends up with the wrong URL for a package you will not
be able to fetch that package.

Situations which can result in the wrong URL:
- the wrong URL was written to the database
- the URLs contain the external IP address of the registry and the IP has changed
- the URLs contain the external domain name of the registry and the domain has changed

`rewrite-url-follower` solves this problem! simply point this tool
at your CouchDB database, and it will rewrite the package URL for you.

## Usage

**rewrite URL to `http://10.19.99.196:8080`:**

```sh
rewrite-url-follower rewrite --rewrite=http://10.19.99.196:8080 --host=172.17.0.1 --port=5984
```

**rewrite URL to `https://myreg.mydomain.tld`:**

```sh
rewrite-url-follower rewrite --rewrite=https://myreg.mydomain.tld --host=172.17.0.1 --port=5984
```


**get help:**

```sh
rewrite-url-follower --help
rewrite-url-follower rewrite --help
```

## License

ISC
