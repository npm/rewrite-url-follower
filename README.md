# Rewrite URL Follower

npm On-Site and npm-registry-couchapp store package URLs in their
database. This can be a problem if you write the wrong URL to the database,
or if you need to migrate data from one URL to another.

`rewrite-url-follower` solves this problem! simply point this tool
at your CouchDB database, and it will rewrite the package URL for you.

## Usage

**rewrite URL to `http://10.19.99.196:8080`:**

```sh
rewrite-url-follower rewrite --rewrite=http://10.19.99.196:8080 --host=172.17.0.1 --port=5984
```

**get help:**

```sh
rewrite-url-follower --help
rewrite-url-follower rewrite --help
```

## License

ISC
