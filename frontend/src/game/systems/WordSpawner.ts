export class WordSpawner {
  private words: string[];
  private wordIndex = 0;
  private shuffled: string[] = [];

  constructor(words: string[]) {
    this.words = words;
    this.shuffle();
  }

  private shuffle() {
    this.shuffled = [...this.words];
    for (let i = this.shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.shuffled[i], this.shuffled[j]] = [this.shuffled[j], this.shuffled[i]];
    }
    this.wordIndex = 0;
  }

  nextWord(): string {
    if (this.wordIndex >= this.shuffled.length) {
      this.shuffle();
    }
    return this.shuffled[this.wordIndex++];
  }
}
