import {injectable} from "@tsed/di";

export class MyModule {
  $onInit() {
    console.log("MyModule initialized");
  }
}

injectable(MyModule);
