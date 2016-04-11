export default class IDBController {
  constructor(req) {
    const values = Object.assign({}, {
      name: 'NicoTunes',
      version: 6,
      store: [
        { name: 'tunes', keyPath: 'id', index: [
          { name: 'count', keyPath: 'count' },
          { name: 'last', keyPath: 'last' },
          { name: 'like', keyPath: 'like' }
        ] },
        { name: 'myLists', keyPath: 'id', index: [
          { name: 'userId', keyPath: 'userId' }
        ] },
        { name: 'playLists', keyPath: 'id' },
        { name: 'nicoAccounts', keyPath: 'id' },
        { name: 'account', keyPath: 'id' }
      ]
    }, req);

    for (let key in values) this[key] = values[key];
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.dbReq = indexedDB.open(this.name, this.version);

      this.dbReq.onupgradeneeded = e => {
        let db = e.target.result;

        for (let store of this.store) {

          // 既に ObjectStore が存在していれば削除
          if (db.objectStoreNames.contains(store.name)) {
            db.deleteObjectStore(store.name);
          }

          // ObjectStore の作成
          let objectStore = db.createObjectStore(store.name, {
            keyPath: store.keyPath,
            autoIncrement: store.autoIncrement ? store.autoIncrement : false
          });

          // インデックスの作成
          if (store.index) {
            for (let index of store.index) {
              objectStore.createIndex(index.name, index.keyPath, Object.assign({}, index.params));
            }
          }
        }
      }

      this.dbReq.onsuccess = e => {
        this.db = e.target.result;
        resolve(this);
      }

      this.dbReq.onerror = e => {
        console.error(e);
        reject();
      }
    });
  }

  add(storeName, values, mode = 'readwrite') {
    return new Promise((resolve, reject) => {
      this.connect().then(db => {
        let transaction = this.db.transaction(storeName, mode),
            store = transaction.objectStore(storeName);

        // 複数追加
        if (toString.call(values).includes('Array')) {
          for (let value of values) {
            let request = store.put(value);

            request.onerror = e => {
              console.error(e);
              reject();
            }
          }

          resolve();
        }

        // 1件追加
        else {
          let request = store.put(values)

          console.log(request);

          request.onsuccess = e => {
            resolve(e.type);
          }

          request.onerror = e => {
            console.error(e);
            reject();
          }
        }
      });
    });
  }

  get(storeName, req = {}, mode = 'readonly') {
    return new Promise((resolve, reject) => {
      this.connect().then(db => {
        let transaction = this.db.transaction(storeName, mode),
            store = transaction.objectStore(storeName),
            request;

        // 1件取得
        if (toString.call(req).includes('String')) {
          request = store.get(req);

          request.onsuccess = e => {
            resolve(e.target.result);
          }

          request.onerror = e => {
            console.error(e);
            reject();
          }
        }

        // 複数件取得
        else if (toString.call(req).includes('Object')) {
          let result = [];

          // 条件指定
          if (Object.keys(req).length) {
            switch (req.method) {
              case 'index': {
                let index = store.index(req.keyPath),
                    range = IDBKeyRange.only(req.keyValue);

                request = index.openCursor(range);
                break;
              }

              case 'keyRange':
                break;
            }
          }

          // 全件取得
          else {
            request = store.openCursor();
          }

          request.onsuccess = e => {
            let cursor = e.target.result;

            if (cursor) {
              result.push(cursor.value);
              cursor.continue();
            } else {
              resolve(result);
            }
          }

          request.onerror = e => {
            console.error(e);
            reject();
          }
        }
      });
    });
  }

  delete(storeName, key, mode = 'readwrite') {
    return new Promise((resolve, reject) => {
      this.connect().then(db => {
        var transaction = this.db.transaction(storeName, mode),
            store = transaction.objectStore(storeName),
            request = store.delete(key);

        request.onsuccess = e => {
          resolve(e.target.result);
        }

        request.onerror = e => {
          console.error(e);
          reject();
        }
      })
    });
  }
}
