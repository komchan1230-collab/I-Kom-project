import prisma from './lib/prisma';

async function main() {
  await prisma.equipment.create({
    data: {
      productId: '75459f90-2e7d-4dcf-bcc4-7c422c02683c',
      serialNumber: 'GM-003',
      status: 'AVAILABLE'
    }
  });
  console.log('Successfully added GM-003 to stock!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
