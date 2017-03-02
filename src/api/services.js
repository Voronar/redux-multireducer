class Service {
  constructor(mock) {
    this._mock = mock;
  }
  get() {
    return new Promise((res) => {
      res(this._mock)
    });
  }
}

const users = new Service(['John', 'Jack', 'Said']);
const posts = new Service(['post1', 'post2', 'post3']);

export {
  users,
  posts,
};
