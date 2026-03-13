import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Тестовая организация
  const org = await prisma.organization.upsert({
    where: { inn: '7707083893' },
    update: {},
    create: {
      name: 'ООО "СтройПроект"',
      inn: '7707083893',
      ogrn: '1027700132195',
      sroName: 'СРО "Строители Москвы"',
      sroNumber: 'СРО-С-123-45678',
      address: 'г. Москва, ул. Строителей, д. 10',
      phone: '+7 (495) 123-45-67',
      email: 'info@stroyproekt.ru',
    },
  });

  const passwordHash = await hash('password123', 12);

  // Администратор
  const admin = await prisma.user.upsert({
    where: { email: 'admin@stroydocs.ru' },
    update: {},
    create: {
      email: 'admin@stroydocs.ru',
      passwordHash,
      firstName: 'Иван',
      lastName: 'Петров',
      middleName: 'Сергеевич',
      phone: '+7 (916) 111-22-33',
      position: 'Генеральный директор',
      role: 'ADMIN',
      organizationId: org.id,
    },
  });

  // Менеджер
  await prisma.user.upsert({
    where: { email: 'manager@stroydocs.ru' },
    update: {},
    create: {
      email: 'manager@stroydocs.ru',
      passwordHash,
      firstName: 'Анна',
      lastName: 'Сидорова',
      middleName: 'Владимировна',
      phone: '+7 (916) 444-55-66',
      position: 'Начальник ПТО',
      role: 'MANAGER',
      organizationId: org.id,
    },
  });

  // Работник
  await prisma.user.upsert({
    where: { email: 'worker@stroydocs.ru' },
    update: {},
    create: {
      email: 'worker@stroydocs.ru',
      passwordHash,
      firstName: 'Алексей',
      lastName: 'Козлов',
      phone: '+7 (916) 777-88-99',
      position: 'Прораб',
      role: 'WORKER',
      organizationId: org.id,
    },
  });

  // Проект 1
  const project1 = await prisma.project.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'ЖК "Солнечный"',
      address: 'г. Москва, ул. Ленина, д. 15',
      description: 'Строительство жилого комплекса на 120 квартир',
      generalContractor: 'ООО "СтройПроект"',
      customer: 'АО "Инвестстрой"',
      status: 'ACTIVE',
      organizationId: org.id,
    },
  });

  // Проект 2
  await prisma.project.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'БЦ "Меркурий"',
      address: 'г. Москва, Пресненская наб., д. 8',
      description: 'Реконструкция бизнес-центра',
      generalContractor: 'ООО "СтройПроект"',
      customer: 'ПАО "МеркурийГрупп"',
      status: 'ACTIVE',
      organizationId: org.id,
    },
  });

  // Договор (основной)
  const contract1 = await prisma.contract.upsert({
    where: { id: '00000000-0000-0000-0000-000000000010' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000010',
      number: 'ДГП-2024-001',
      name: 'Договор генподряда на строительство ЖК "Солнечный"',
      type: 'MAIN',
      status: 'ACTIVE',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2025-12-31'),
      projectId: project1.id,
    },
  });

  // Субдоговор
  await prisma.contract.upsert({
    where: { id: '00000000-0000-0000-0000-000000000011' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000011',
      number: 'СД-2024-001-01',
      name: 'Субдоговор на монолитные работы',
      type: 'SUBCONTRACT',
      status: 'ACTIVE',
      startDate: new Date('2024-04-01'),
      endDate: new Date('2025-06-30'),
      projectId: project1.id,
      parentId: contract1.id,
    },
  });

  // Участник договора
  await prisma.contractParticipant.upsert({
    where: {
      contractId_organizationId_role: {
        contractId: contract1.id,
        organizationId: org.id,
        role: 'CONTRACTOR',
      },
    },
    update: {},
    create: {
      contractId: contract1.id,
      organizationId: org.id,
      role: 'CONTRACTOR',
      appointmentOrder: 'Приказ №15 от 01.03.2024',
      appointmentDate: new Date('2024-03-01'),
    },
  });

  console.log('Seed завершён:', { org: org.name, admin: admin.email });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
