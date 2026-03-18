import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding ...')

  // Create Roles
  const adminRole = await prisma.roles.create({
    data: {
      rolename: 'admin'
    }
  })

  const studentRole = await prisma.roles.create({
    data: {
      rolename: 'student'
    }
  })

  console.log('Created roles')

  // Create Users
  const john = await prisma.users.create({
    data: {
      username: 'john_admin',
      email: 'john@example.com',
      passwordhash: 'hash1',
      roleid: adminRole.roleid
    }
  })

  const mike = await prisma.users.create({
    data: {
      username: 'mike_student',
      email: 'mike@example.com',
      passwordhash: 'hash2',
      roleid: studentRole.roleid
    }
  })

  const alex = await prisma.users.create({
    data: {
      username: 'alex_project',
      email: 'alex@example.com',
      passwordhash: 'hash3',
      roleid: studentRole.roleid
    }
  })

  const ravi = await prisma.users.create({
    data: {
      username: 'ravi_student',
      email: 'ravi@example.com',
      passwordhash: 'hash4',
      roleid: studentRole.roleid
    }
  })

  const sara = await prisma.users.create({
    data: {
      username: 'sara_admin',
      email: 'sara@example.com',
      passwordhash: 'hash5',
      roleid: adminRole.roleid
    }
  })

  console.log('Created users')

  // Create Projects
  const websiteProject = await prisma.projects.create({
    data: {
      projectname: 'Website Redesign',
      description: 'Redesign of client website',
      createdby: john.userid
    }
  })

  const inventoryProject = await prisma.projects.create({
    data: {
      projectname: 'Inventory System',
      description: 'Internal stock tracking system',
      createdby: mike.userid
    }
  })

  console.log('Created projects')

  // Create TaskLists
  const uiUxTasks = await prisma.tasklists.create({
    data: {
      projectid: websiteProject.projectid,
      listname: 'UI/UX Tasks'
    }
  })

  const backendTasks = await prisma.tasklists.create({
    data: {
      projectid: websiteProject.projectid,
      listname: 'Backend Tasks'
    }
  })

  const apiDevelopment = await prisma.tasklists.create({
    data: {
      projectid: inventoryProject.projectid,
      listname: 'API Development'
    }
  })

  const testingQa = await prisma.tasklists.create({
    data: {
      projectid: inventoryProject.projectid,
      listname: 'Testing & QA'
    }
  })

  console.log('Created task lists')

  // Create Tasks
  const task1 = await prisma.tasks.create({
    data: {
      listid: uiUxTasks.listid,
      assignedto: john.userid,
      title: 'Create Mockups',
      description: 'Design homepage mockups',
      priority: 'High',
      status: 'In Progress',
      duedate: new Date('2026-01-25')
    }
  })

  const task2 = await prisma.tasks.create({
    data: {
      listid: uiUxTasks.listid,
      assignedto: alex.userid,
      title: 'Color Palette',
      description: 'Define project color palette',
      priority: 'Medium',
      status: 'Pending',
      duedate: new Date('2026-01-28')
    }
  })

  const task3 = await prisma.tasks.create({
    data: {
      listid: backendTasks.listid,
      assignedto: mike.userid,
      title: 'Auth System',
      description: 'Implement login with JWT',
      priority: 'High',
      status: 'In Progress',
      duedate: new Date('2026-02-05')
    }
  })

  const task4 = await prisma.tasks.create({
    data: {
      listid: backendTasks.listid,
      assignedto: alex.userid,
      title: 'Database Models',
      description: 'Create Prisma models',
      priority: 'Medium',
      status: 'Pending',
      duedate: new Date('2026-02-10')
    }
  })

  const task5 = await prisma.tasks.create({
    data: {
      listid: apiDevelopment.listid,
      assignedto: john.userid,
      title: 'Product API',
      description: 'Build product listing API',
      priority: 'High',
      status: 'Pending',
      duedate: new Date('2026-01-30')
    }
  })

  const task6 = await prisma.tasks.create({
    data: {
      listid: apiDevelopment.listid,
      assignedto: mike.userid,
      title: 'Stock Sync',
      description: 'Daily sync with ERP',
      priority: 'Medium',
      status: 'Pending',
      duedate: new Date('2026-02-02')
    }
  })

  const task7 = await prisma.tasks.create({
    data: {
      listid: testingQa.listid,
      assignedto: alex.userid,
      title: 'Unit Testing',
      description: 'Write test cases',
      priority: 'Low',
      status: 'Pending',
      duedate: new Date('2026-02-15')
    }
  })

  console.log('Created tasks')

  // Create TaskComments
  await prisma.taskcomments.createMany({
    data: [
      {
        taskid: task1.taskid,
        userid: john.userid,
        commenttext: 'Starting mockups today'
      },
      {
        taskid: task1.taskid,
        userid: alex.userid,
        commenttext: 'Share Figma link when done'
      },
      {
        taskid: task2.taskid,
        userid: alex.userid,
        commenttext: 'Palette suggestions added'
      },
      {
        taskid: task3.taskid,
        userid: mike.userid,
        commenttext: 'Auth flow is working, testing remaining'
      }
    ]
  })

  console.log('Created task comments')

  // Create TaskHistory
  await prisma.taskhistory.createMany({
    data: [
      {
        taskid: task1.taskid,
        changedby: john.userid,
        changetype: 'Status changed to In Progress'
      },
      {
        taskid: task3.taskid,
        changedby: mike.userid,
        changetype: 'Status changed to In Progress'
      },
      {
        taskid: task3.taskid,
        changedby: mike.userid,
        changetype: 'Priority changed to High'
      },
      {
        taskid: task5.taskid,
        changedby: john.userid,
        changetype: 'Task created'
      },
      {
        taskid: task7.taskid,
        changedby: alex.userid,
        changetype: 'Assigned to Sam'
      }
    ]
  })

  console.log('Created task history')

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })