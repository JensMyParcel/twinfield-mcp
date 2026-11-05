/** The code of a Twinfield company (office), such as `001` or `NLA001234`. */
export class CompanyCode {
  private constructor(readonly value: string) {}

  static parse(value: string): CompanyCode {
    if (!/^[A-Za-z0-9_-]{1,32}$/.test(value)) {
      throw new Error(`Invalid company code: ${JSON.stringify(value)}`);
    }

    return new CompanyCode(value);
  }

  toString(): string {
    return this.value;
  }
}
