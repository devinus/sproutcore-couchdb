Installation
============

	$ git clone git://github.com/devinus/sproutcore-couchdb.git
	$ ln -s /path/to/sproutcore-couchdb sproutapp/framworks/couch_db

Usage
=====

In `Buildfile`
---------

	config :sproutapp, :required => [:couch_db]
	proxy '/sproutapp', :to => 'localhost:5984'

In `apps/sproutapp/core.js`
----------------------

	store: SC.Store.create({ commitRecordsAutomatically: YES })
		.from('Sproutapp.RecordsDataStore')

In `model` file
-------------

	Sproutapp.Record = CouchDB.Record.extend(…

Sample `data source` implementation
---------------------------------

	Sproutapp.RecordDataStore = CouchDB.DataSource.extend(
	{
		database: "sproutapp",
		designDoc: "app",
		view: "records"
	}) ;

Glossary
========

* _Sproutapp_ - the name of your SproutCore application.
* _Record_ - name of model class.
