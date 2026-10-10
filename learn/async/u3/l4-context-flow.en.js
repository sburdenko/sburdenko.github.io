/** Async, unit 3, lesson 4: the builder and ExecutionContext (English version). */
export default {
  id: 'as.u3.l4',
  title: 'Builder and ExecutionContext',
  sub: 'Who builds the task and what travels across await',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'Who builds the task',
      body: '<p>The state machine doesn\'t create the task itself. A <b>builder</b> does: <code>AsyncTaskMethodBuilder&lt;T&gt;</code>. It creates the Task, subscribes MoveNext to the awaiter and at the end calls <code>SetResult</code> or <code>SetException</code>.</p>'
    },
    {
      t: 'choice',
      q: 'An exception is thrown inside an async method. What does the builder do?',
      options: ['Calls SetException: the task becomes Faulted, and await will throw the exception', 'Crashes the process', 'Ignores it'],
      answer: 0,
      explain: 'The exception rides inside the task until someone awaits it.'
    },
    {
      t: 'learn',
      title: 'ExecutionContext travels with await',
      body: '<p>Along with the continuation, .NET carries the <b>ExecutionContext</b>: the current culture, AsyncLocal&lt;T&gt; values and other "ambient" data. That\'s why AsyncLocal is still visible after await, even if a different thread runs the continuation.</p>',
      code: 'static AsyncLocal<string> RequestId = new();\n\nRequestId.Value = "req-42";\nawait Task.Delay(100);        // may resume on another thread\nLog(RequestId.Value);         // still "req-42"'
    },
    {
      t: 'choice',
      q: 'What does Log print after the await?',
      options: ['req-42', 'null', 'It depends on the thread'],
      answer: 0,
      explain: 'ExecutionContext carried the AsyncLocal value along with the continuation.'
    },
    {
      t: 'choice',
      q: 'How is ExecutionContext different from SynchronizationContext?',
      options: ['ExecutionContext is data that travels with code; SynchronizationContext is where execution resumes', 'They\'re the same thing', 'ExecutionContext exists only in WPF'],
      answer: 0,
      explain: 'ConfigureAwait(false) turns off the return to the SynchronizationContext, but ExecutionContext still flows.'
    },
    {
      t: 'learn',
      title: 'ThreadStatic vs. AsyncLocal',
      body: '<p>A [ThreadStatic] field belongs to a thread: if another thread resumes the code after await, the value "vanishes". For per-request or per-operation data, use AsyncLocal.</p>',
      deep: 'If a called async method changes an AsyncLocal, the caller doesn\'t see the change after it returns: ExecutionContext is immutable and copied on write. Values flow down the call chain, not up.'
    },
    {
      t: 'multi',
      q: 'What flows across await with the ExecutionContext? Select all that apply.',
      options: ['AsyncLocal values', 'The current culture (CultureInfo.CurrentCulture)', 'Values of [ThreadStatic] fields', 'Local variables of other threads'],
      answer: [0, 1],
      explain: 'ThreadStatic stays with its own thread.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['Builder', 'Creates and completes the Task'],
        ['AsyncLocal', 'Data that travels across await'],
        ['ThreadStatic', 'Per-thread data, lost on a thread switch'],
        ['SynchronizationContext', 'Where to run the continuation']
      ]
    }
  ]
};
