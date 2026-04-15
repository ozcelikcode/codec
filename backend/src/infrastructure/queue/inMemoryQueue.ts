export class InMemoryQueue {
  private readonly concurrency: number;
  private active = 0;
  private readonly pending: Array<() => Promise<void>> = [];

  constructor(concurrency: number) {
    this.concurrency = Math.max(1, concurrency);
  }

  enqueue(task: () => Promise<void>) {
    this.pending.push(task);
    this.runNext();
  }

  private runNext() {
    while (this.active < this.concurrency && this.pending.length > 0) {
      const task = this.pending.shift();
      if (!task) {
        return;
      }

      this.active += 1;
      void task()
        .catch(() => {
          // Task-specific error handling is done at caller level.
        })
        .finally(() => {
          this.active -= 1;
          this.runNext();
        });
    }
  }
}
