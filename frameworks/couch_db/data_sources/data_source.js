// ==========================================================================
// Project:   CouchDB.DataSource
// Copyright: ©2010 Devin Torres, 
//            ©2011 Alexey Shevchenko
// ==========================================================================
/*globals CouchDB */

/** @class

  (Document Your Data Source Here)

  @extends SC.DataSource
*/
CouchDB.DataSource = SC.DataSource.extend(
/** @scope CouchDB.DataSource.prototype */ {

  server: '',
  database: null,
  designDoc: null,
  view: '_all_docs',

  // ..........................................................
  // QUERY SUPPORT
  //

  fetch: function(store, query) {
    var server = this.get('server'),
        database = this.get('database'),
        designDoc = this.get('designDoc'),
        view = this.get('view'),
        params = { query: query, store: store };

    SC.Request.getUrl(server + '/' + database + (designDoc ? '/_design/' + designDoc + '/_view/': '') + view)
      .set('isJSON', YES)
      .notify(this, this._didFetch, params)
      .send();

    return YES ; // Not required, but good form.
  },

  _didFetch: function(response, params) {
    var store = params.store,
        query = params.query;

    if (SC.$ok(response)) {
      // load the contacts into the store...
      var body = response.getPath('body');
      var storeKeys = store.loadRecords(query.get('recordType'), body.rows.map(function(row) {
        if (row.value && !row.value._id) row.value._id = row.id;
        return row.value;
      }));
      store.loadQueryResults(query, storeKeys);

      // notify store that we handled the fetch
      store.dataSourceDidFetchQuery(query);

    // handle error case
    } else store.dataSourceDidErrorQuery(query, response);
  },

  // ..........................................................
  // RECORD SUPPORT
  //

  retrieveRecord: function(store, storeKey) {
    var id = store.idFor(storeKey),
        server = this.get('server'),
        database = this.get('database'),
        params = { store: store, storeKey: storeKey };

    SC.Request.getUrl(server + '/' + database + '/' + id)
      .set('isJSON', YES)
      .notify(this, this._didRetrieveRecord, params)
      .send();

    return YES ; // return YES if you handled the storeKey
  },

  _didRetrieveRecord: function(request, params) {
    var store = params.store,
        storeKey = params.storeKey,
        response = request.response();

    // normal: load into store...response == dataHash
    if (SC.$ok(response)) {
      store.dataSourceDidComplete(storeKey, response);

    // error: indicate as such...response == error
    } else store.dataSourceDidError(storeKey, response);
  },

  createRecord: function(store, storeKey) {
    var doc = store.readDataHash(storeKey),
        server = this.get('server'),
        database = this.get('database'),
        params = { store: store, storeKey: storeKey, doc: doc };

    SC.Request.postUrl(server + '/' + database + '/')
      .set('isJSON', YES)
      .notify(this, this._didCreateRecord, params)
      .send(doc);

    return YES ; // return YES if you handled the storeKey
  },

  _didCreateRecord: function(request, params) {
    var store = params.store,
        storeKey = params.storeKey,
        doc = params.doc,
        response = request.response();

    // normal: load into store...response == dataHash
    if (SC.$ok(response)) {
      doc._id = response.id;
      doc._rev = response.rev;
      store.dataSourceDidComplete(storeKey, doc);

    // error: indicate as such...response == error
    } else store.dataSourceDidError(storeKey, response);
  },

  updateRecord: function(store, storeKey) {
    var id = store.idFor(storeKey),
        doc = store.readDataHash(storeKey),
        server = this.get('server'),
        database = this.get('database'),
        params = { store: store, storeKey: storeKey, doc: doc };

    SC.Request.putUrl(server + '/' + database + '/' + id)
      .set('isJSON', YES)
      .notify(this, this._didUpdateRecord, params)
      .send(doc);

    return YES ; // return YES if you handled the storeKey
  },

  _didUpdateRecord: function(request, params) {
    var store = params.store,
        storeKey = params.storeKey,
        doc = params.doc,
        response = request.response();

    if (SC.$ok(response)) {
      doc._rev = response.rev;
      store.dataSourceDidComplete(storeKey, doc);

    // error: indicate as such...response == error
    } else store.dataSourceDidError(storeKey, response);
  },

  destroyRecord: function(store, storeKey) {
    var id = store.idFor(storeKey),
        doc = store.readDataHash(storeKey),
        server = this.get('server'),
        database = this.get('database'),
        params = { store: store, storeKey: storeKey };

    SC.Request.deleteUrl(server + '/' + database + '/' + id)
      .header('If-Match', doc._rev)
      .set('isJSON', YES)
      .notify(this, this._didDestroyRecord, params)
      .send();

    return YES ; // return YES if you handled the storeKey
  },

  _didDestroyRecord: function(request, params) {
    var store = params.store,
        storeKey = params.storeKey,
        response = request.response();

    if (SC.$ok(response)) {
      store.dataSourceDidDestroy(storeKey);

    // error: indicate as such...response == error
    } else store.dataSourceDidError(storeKey, response);
  }

}) ;
