/** Unit 4, lesson 2: a data race on count++. */
export default {
  id: 'dotnet.w4.l2',
  title: 'Data races',
  sub: 'Why count++ from two threads loses increments',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'count++ is three actions',
      body: '<p>To the CPU, <code>count++</code> is three steps: read count from memory, add 1, write it back. Remember CIL from the first unit? Here it is:</p>',
      code: 'ldsfld  int32 Program::count   // read\nldc.i4.1\nadd                            // add\nstsfld  int32 Program::count   // write',
      lang: 'il'
    },
    {
      t: 'rig', rig: 'datarace', mode: 'plain',
      task: 'Two threads do count++. Pick an order of steps so that count ends up equal to 1.',
      goal: 'lost',
      solve: ['step:A', 'step:B', 'step:A', 'step:A', 'step:B', 'step:B']
    },
    {
      t: 'choice',
      q: 'Why did we get 1 and not 2?',
      options: ['Both threads read 0 before anyone wrote 1', 'The CPU can\'t add from two threads', 'The second thread never started'],
      answer: 0,
      explain: 'Each added 1 to the 0 it had read and wrote 1. The second increment overwrote the first.'
    },
    {
      t: 'rig', rig: 'datarace', mode: 'plain', random: true,
      task: 'Now for real: two threads each do count++ 1,000 times. Run it a few times and look at the results.',
      goal: 'random',
      solve: ['random']
    },
    {
      t: 'choice',
      q: 'Why is the result different every time and almost never 2,000?',
      options: ['Thread switches land at different moments', 'count++ has a random number generator inside', 'There isn\'t enough memory'],
      answer: 0,
      explain: 'An increment is lost only when a switch happens between the read and the write. That happens more often on some runs, less on others.'
    },
    {
      t: 'learn',
      title: 'This is called a data race',
      body: '<p>A <b>race condition</b> is when the result depends on how threads happened to switch.</p><p>These are the nastiest bugs: everything works on the developer\'s machine, but on a loaded server it breaks once a week. The debugger often "cures" a race because it changes the timing.</p>'
    },
    {
      t: 'multi',
      q: 'Where can a race happen? Select all that apply.',
      options: ['Two threads add items to the same List<T>', 'Two threads do total += x on a shared field', 'One thread checks if (cache == null) while another is filling it', 'Each thread sums into its own local variable', 'Two threads only read an immutable string'],
      answer: [0, 1, 2],
      explain: 'A race needs shared mutable memory and at least one write. Your own local variables and reading immutable data are safe.'
    },
    {
      t: 'tapline',
      q: 'This method is called from many threads. Where is the race?',
      code: 'static int _hits;\nstatic void OnRequest()\n{\n    var local = Compute();\n    _hits++;\n    Log(local);\n}',
      answer: 4,
      explain: '_hits is a shared static field, and ++ is three steps. local belongs to each thread separately.'
    },
    {
      t: 'choice',
      q: 'Two threads add to the same List<T> without synchronization. What can happen?',
      options: ['Lost items or an exception: List<T> isn\'t thread-safe', 'Nothing, List<T> synchronizes itself', 'The items just end up shuffled'],
      answer: 0,
      explain: 'Add has several steps inside too: check the size, write, bump the counter. A race breaks them. That\'s what ConcurrentQueue, ConcurrentDictionary or lock are for.'
    }
  ]
};
