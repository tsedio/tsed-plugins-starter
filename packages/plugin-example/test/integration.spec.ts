import {DITest, inject} from "@tsed/di";

import {MyModule} from "../src/MyModule.js";

describe("@tsed/plugin-example: MyModule", () => {
  beforeEach(() => DITest.create());
  afterEach(() => DITest.reset());

  it("should be defined", () => {
    const instance = inject(MyModule);

    expect(instance).toBeInstanceOf(MyModule);
  });
});
