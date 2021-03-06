class Storage {
  private storage = window.localStorage;

  public set(key: string = '', value: string | number | object): void {
    this.storage.setItem(key, JSON.stringify(value));

    return void 0;
  }

  public get<T extends string | object | number>(key: string = ''): T {
    const storedKey = this.storage.getItem(key) || '';

    return storedKey ? JSON.parse(storedKey) : '';
  }

  public remove(key: string = ''): void {
    this.storage.removeItem(key);

    return void 0;
  }
}

export { Storage };
