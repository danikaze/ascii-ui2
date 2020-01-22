# Test system

_This folder doesn't contain tests, but the functions used for the test system._

## Internal behavior

### Showcase

The showcase is just a simple page generated from all the [vr-test](../vr-test) cases, to see how they behave.

`webpack` is just used for the showcase, not the actual tests.

- If executed via `npm run showcase` it will start a `webpack-dev-server` which can be used to develop visual elements.
- If executed via `npm run showcase-static` it won't start any server, but generate a static version in the [vr-test-static](../vr-test-static) folder (not included in the repository)

This webpack configuration will just generate a bundle with the required elements for the showcase, which means, everything inside the [html](./html) folder (exclusive for execution in the browser), and everything inside the [vr-test](../vr-test) itself.

### Visual Regression Tests

Just perform operations over a `Buffer` or a `<canvas>` and capture the state after each step, comparing it with the expected result.

```
npm run vr-test
```

(or `npm run vr-test-dev` to run it with the `--inspect-brk` node option)

This tests are executed from [index.ts](./index.ts), which set [puppeteer](https://github.com/puppeteer/puppeteer) and the mocha environment up, and test against the running showcase server or the static generated one if the server is not running.

> Note: Currently running `vr-test` against the _showcase server_ (via `npm run showcase`) will conflict some times with folder permissions, since the webpack `watch` mode is reloading every time a new screenshot is generated -specially in Windows- (but it shouldn't), so it's better to stop the server and run the tests agains the static version

This being said, puppeteer will not run directly the client-side tests, but call a global function prepared by the showcase, which will load and execute the test. Explained better in this steps:

1. Load the showcase page via puppeteer
2. For each test case (`.spec.ts` file in [vr-test](../vr-test)):
3. For each step of the test case:
   1. Execute the step `beforeTest` function in puppeteer (if any)
   2. Tell the showcase to execute the step `test` function
   3. Save the state of the `Buffer` or the `<canvas>`, left by the previous step
   - If an expected file already existed for this step, compare the result with it
   - If an expected file doesn't exist, store the current result as the expected one for the next time the test is executed
   4. Execute the step `beforeTest` function in puppeteer (if any)
4. If any of the steps failed or the test are run with the `--noRm` flag, the results from the step `2.1.3` are not removed (to check the reason of failing the test), in any other case it's clean

### Unit Tests

Unit tests are exectued from all `.spec.ts` files inside `src/**/__test` using [mocha](https://github.com/mochajs/mocha) and [sinon](https://github.com/sinonjs/sinon) in the regular way any library is tested.

They can be run with

```
npm run unit-test
```

(or `npm run unit-test-dev` to run it with the `--inspect-brk` node option)
