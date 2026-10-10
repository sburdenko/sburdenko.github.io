/** Async, unit 2, lesson 5: cancellation and timeouts (English version). */
export default {
  id: 'as.u2.l5',
  title: 'Cancellation and timeouts',
  sub: 'CancellationToken: a polite request to stop',
  minutes: 5,
  cards: [
    {
      t: 'learn',
      title: 'Cancellation is a request',
      body: '<p>Cancellation in .NET is <b>cooperative</b>: a CancellationTokenSource hands out a token, you pass it to methods, and they check it and stop on their own. You can\'t forcibly "kill" a task.</p>',
      code: 'using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));\ntry\n{\n    var data = await http.GetStringAsync(url, cts.Token);\n}\ncatch (OperationCanceledException)\n{\n    Show("Took too long");\n}'
    },
    {
      t: 'choice',
      q: 'The server didn\'t answer within 5 seconds. What happens?',
      options: ['The token is canceled, and GetStringAsync throws OperationCanceledException', 'The request keeps waiting', 'The program exits'],
      answer: 0,
      explain: 'HttpClient throws TaskCanceledException, which derives from OperationCanceledException.'
    },
    {
      t: 'learn',
      title: 'Your own code must listen too',
      body: '<p>In a long loop, call <code>token.ThrowIfCancellationRequested()</code> and pass the token on to every async method. Otherwise cancellation gets stuck at your method.</p>'
    },
    {
      t: 'tapline',
      q: 'Where does cancellation get lost?',
      code: 'async Task ProcessAsync(List<Item> items, CancellationToken ct)\n{\n    foreach (var item in items)\n    {\n        ct.ThrowIfCancellationRequested();\n        await SaveAsync(item);\n    }\n}',
      answer: 5,
      explain: 'SaveAsync never got the token, so a save in progress won\'t be interrupted.'
    },
    {
      t: 'choice',
      q: 'How do you cancel a task that doesn\'t accept a token?',
      options: ['Not directly: you can only stop waiting for it, e.g. with WaitAsync(token)', 'Call task.Abort()', 'Set task = null'],
      answer: 0,
      explain: 'WaitAsync (.NET 6+) stops the waiting, but the operation itself keeps running in the background.'
    },
    {
      t: 'multi',
      q: 'Which are true? Select all that apply.',
      options: ['Cancellation is cooperative', 'Cancellation usually throws OperationCanceledException', 'You can create a CancellationTokenSource with a timeout', 'Cancel() instantly stops any code', 'Checking the token at the end of the method is enough'],
      answer: [0, 1, 2],
      explain: 'Code stops only where it checks the token.'
    },
    {
      t: 'blanks',
      q: 'Pass cancellation along',
      code: 'await SaveAsync(item, ___);',
      lang: 'cs',
      tiles: ['ct', 'cts', 'null', 'true'],
      answer: ['ct'],
      explain: 'You pass the token itself to methods, not the source.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['CancellationTokenSource', 'The one who cancels'],
        ['CancellationToken', 'What you pass to methods'],
        ['OperationCanceledException', 'How a canceled operation ends'],
        ['WaitAsync', 'Stop waiting after a timeout']
      ]
    }
  ]
};
