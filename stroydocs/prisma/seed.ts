import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface KsiDataNode {
  code: string;
  name: string;
  children?: KsiDataNode[];
}

/** Рекурсивная загрузка дерева КСИ */
async function seedKsi() {
  const filePath = path.join(__dirname, 'ksi-data.json');
  const data: KsiDataNode[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  async function createNode(node: KsiDataNode, parentId: string | null, level: number) {
    const created = await prisma.ksiNode.upsert({
      where: { code: node.code },
      update: { name: node.name, parentId, level },
      create: { code: node.code, name: node.name, parentId, level },
    });
    if (node.children) {
      for (const child of node.children) {
        await createNode(child, created.id, level + 1);
      }
    }
  }

  for (const root of data) {
    await createNode(root, null, 0);
  }

  const count = await prisma.ksiNode.count();
  console.log(`КСИ загружено: ${count} узлов`);
}

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

  // Загрузка справочника КСИ
  await seedKsi();

  // Тестовые виды работ
  const ksiNode = await prisma.ksiNode.findFirst({ where: { code: '02.01.01' } });
  const workItem1 = await prisma.workItem.upsert({
    where: { id: '00000000-0000-0000-0000-000000000020' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000020',
      cipher: 'КЖ-01',
      name: 'Устройство монолитного фундамента блока А',
      unit: 'м³',
      quantity: 250,
      contractId: contract1.id,
      ksiNodeId: ksiNode?.id ?? null,
    },
  });

  const ksiNode2 = await prisma.ksiNode.findFirst({ where: { code: '02.03.01' } });
  await prisma.workItem.upsert({
    where: { id: '00000000-0000-0000-0000-000000000021' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000021',
      cipher: 'КЖ-02',
      name: 'Установка арматурных каркасов фундамента',
      unit: 'т',
      quantity: 45,
      contractId: contract1.id,
      ksiNodeId: ksiNode2?.id ?? null,
    },
  });

  // Тестовые материалы
  const material1 = await prisma.material.upsert({
    where: { id: '00000000-0000-0000-0000-000000000030' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000030',
      name: 'Бетон В25 (М350)',
      supplier: 'ООО "БетонМикс"',
      invoiceNumber: 'ТН-2024-0156',
      invoiceDate: new Date('2024-05-15'),
      unit: 'м³',
      quantityReceived: 100,
      quantityUsed: 35,
      contractId: contract1.id,
      workItemId: workItem1.id,
    },
  });

  await prisma.material.upsert({
    where: { id: '00000000-0000-0000-0000-000000000031' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000031',
      name: 'Арматура А500С d12',
      supplier: 'ООО "МеталлТрейд"',
      invoiceNumber: 'ТН-2024-0203',
      invoiceDate: new Date('2024-05-20'),
      unit: 'т',
      quantityReceived: 20,
      quantityUsed: 8,
      contractId: contract1.id,
    },
  });

  // Тестовая запись о работе
  await prisma.workRecord.upsert({
    where: { id: '00000000-0000-0000-0000-000000000040' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000040',
      date: new Date('2024-06-01'),
      location: 'Блок А, оси 1-3 / А-В, отм. -3.200',
      description: 'Бетонирование фундаментной плиты секции 1',
      standard: 'СП 70.13330.2012',
      status: 'COMPLETED',
      workItemId: workItem1.id,
      authorId: admin.id,
    },
  });

  // Тестовое списание материала
  await prisma.materialWriteoff.upsert({
    where: {
      workRecordId_materialId: {
        workRecordId: '00000000-0000-0000-0000-000000000040',
        materialId: material1.id,
      },
    },
    update: {},
    create: {
      quantity: 35,
      workRecordId: '00000000-0000-0000-0000-000000000040',
      materialId: material1.id,
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
