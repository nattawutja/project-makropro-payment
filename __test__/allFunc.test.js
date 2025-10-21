function add(a, b) {
  return a + b;
}

function testA(val) {
  return val
}

function fileSize(size) {
  return (size / (1024 * 1024)).toFixed(2);
}

describe('Unit Tests', () => {



  test('testFileSize', () => {
    expect(fileSize(40132)).toBe("0.04")
  })

  test('add 2 + 3 = 5', () => {
    expect(add(2, 3)).toBe(5);
  });

  test('test Func A', () => {
    expect(testA("A")).toBe("A");
  })

});