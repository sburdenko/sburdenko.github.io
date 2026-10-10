/** Unit 4, lesson 1: threads and the scheduler. */
export default {
  id: 'dotnet.w4.l1',
  title: 'A thread is a worker',
  sub: 'Threads, cores and the OS scheduler',
  minutes: 5,
  cards: [
    {
      t: 'learn',
      title: 'Several things at once',
      body: '<p>A <b>thread</b> is a worker that walks through code line by line. Every program has at least one, the main thread.</p><p>You can create more threads, and they will run at the same time: on different CPU cores, or taking turns on one.</p>'
    },
    {
      t: 'learn',
      title: 'Who decides who runs',
      body: '<p>Threads are managed by the <b>OS scheduler</b>. It lets a thread run for a short time slice and can switch to another at any moment, even in the middle of a line of code.</p><p>Picture two cooks in one kitchen: the head chef decides who does what, and can interrupt either of them mid-sentence.</p>',
      deep: 'A time slice is on the order of tens of milliseconds; a context switch costs microseconds. On a machine with N cores, at most N threads truly run at once.'
    },
    {
      t: 'choice',
      q: 'What gets printed first?',
      code: 'var t = new Thread(() => Console.WriteLine("from thread"));\nt.Start();\nConsole.WriteLine("from Main");\nt.Join();   // wait for the thread',
      options: ['Unknown: the scheduler decides', 'Always "from Main"', 'Always "from thread"'],
      answer: 0,
      explain: 'After Start(), the two threads run independently. The output order can change from run to run.'
    },
    {
      t: 'rig', rig: 'datarace', mode: 'plain',
      task: 'You are the scheduler. Two threads do count++, and you decide whose step is next. Run both threads to completion.',
      goal: 'done',
      solve: ['step:A', 'step:A', 'step:A', 'step:B', 'step:B', 'step:B']
    },
    {
      t: 'multi',
      q: 'What is true about threads? Select all that apply.',
      options: ['Each thread has its own stack', 'The heap is shared by all threads', 'The scheduler can interrupt a thread at any moment', 'Threads run strictly in the order they were created', 'More threads is always faster'],
      answer: [0, 1, 2],
      explain: 'Separate stacks and a shared heap follow straight from the memory unit. Extra threads just get in each other\'s way.'
    },
    {
      t: 'choice',
      q: 'How expensive is creating a thread?',
      options: ['Noticeably: stack memory plus OS work, which is why threads get reused', 'It costs nothing', 'Cheaper than calling a method'],
      answer: 0,
      explain: 'Each thread needs its own stack, typically around a megabyte of address space, plus system structures. That\'s why the thread pool exists (lesson 4).'
    },
    {
      t: 'learn',
      title: 'A shared heap is a source of trouble',
      body: '<p>Each thread has its own local variables: they live on its stack. But objects on the heap are shared.</p><p>If two threads change the same object at once, the result can break. How exactly is the next lesson.</p>'
    },
    {
      t: 'choice',
      q: 'Two threads run the same method with a local variable int i. How many i variables are there?',
      options: ['Two: each thread has its own stack and its own frame', 'One shared variable', 'It depends on the scheduler'],
      answer: 0,
      explain: 'Every method call gets its own frame on its own thread\'s stack.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['Thread', 'A worker that walks through code'],
        ['OS scheduler', 'Decides which thread runs now'],
        ['Thread stack', 'Its own local variables'],
        ['Heap', 'Objects shared by all threads']
      ]
    }
  ]
};
