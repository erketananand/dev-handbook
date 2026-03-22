export class Logger {
  static info(msg: string): void {
    console.log(`[INFO] ${new Date().toISOString()} - ${msg}`);
  }

  static error(msg: string): void {
    console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`);
  }

  static success(msg: string): void {
    console.log(`[SUCCESS] ${new Date().toISOString()} - ${msg}`);
  }

  static warn(msg: string): void {
    console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`);
  }

  static debug(msg: string): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${msg}`);
    }
  }

  static separator(): void {
    console.log('\n' + '='.repeat(70) + '\n');
  }

  static header(title: string): void {
    console.log('\n' + '='.repeat(70));
    const padding = Math.floor((70 - title.length) / 2);
    console.log(' '.repeat(padding) + title);
    console.log('='.repeat(70) + '\n');
  }
}
