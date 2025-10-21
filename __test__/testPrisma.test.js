const { prisma } = require('../prismaClient');

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Integration Test SELECT - TestPrisma', () => {

  test('Select all rows from TestPrisma', async () => {
    const rows = await prisma.TestPrisma.findMany(); // SELECT * FROM test_prisma
    console.log('Rows:', rows);

    // เช็คว่าเป็น array
    expect(rows).toBeInstanceOf(Array);
  });

});
