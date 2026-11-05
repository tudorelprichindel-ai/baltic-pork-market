// Keep each Durable Object value below its 128 KiB limit, including Unicode.
export class ChunkStorage {
  constructor(storage) { this.storage = storage; }
  async get(key) {
    const meta = await this.storage.get(key);
    if (!meta?.chunked) return meta;
    let raw = "";
    for (let i = 0; i < meta.count; i++) raw += await this.storage.get(`${key}~${meta.id}~${i}`);
    return JSON.parse(raw);
  }
  async put(key, value) {
    const raw = JSON.stringify(value);
    const old = await this.storage.get(key);
    if (raw.length <= 20000) await this.storage.put(key, value);
    else {
      const id = crypto.randomUUID();
      const count = Math.ceil(raw.length / 20000);
      for (let i = 0; i < count; i++) await this.storage.put(`${key}~${id}~${i}`, raw.slice(i * 20000, (i + 1) * 20000));
      await this.storage.put(key, { chunked: true, id, count });
    }
    if (old?.chunked) for (let i = 0; i < old.count; i++) await this.storage.delete(`${key}~${old.id}~${i}`);
  }
  async delete(key) {
    const old = await this.storage.get(key);
    await this.storage.delete(key);
    if (old?.chunked) for (let i = 0; i < old.count; i++) await this.storage.delete(`${key}~${old.id}~${i}`);
  }
}
