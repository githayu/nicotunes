export default class LocalStorageController {
  get defaultStorage() {
    return {
      app: {
        activeNicoAccountId: null,
        volume: 0.2,
        version: '0.0.1'
      }
    };
  }

  constructor(name) {
    this.name = name;

    if (localStorage.getItem(name) == null || this.get().version != this.defaultStorage[this.name].version) {
      this.initialize();
    }
  }

  initialize() {
    localStorage.setItem(this.name, JSON.stringify(this.defaultStorage[this.name]));
  }

  update(req) {
    localStorage.setItem(this.name, JSON.stringify(
      Object.assign({}, this.defaultStorage[this.name], this.get(), req)));
  }

  get() {
    return JSON.parse(localStorage.getItem(this.name));
  }
}
