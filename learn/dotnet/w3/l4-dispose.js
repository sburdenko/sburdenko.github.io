/** Раздел 3, урок 4: IDisposable и using. */
export default {
  id: 'dotnet.w3.l4',
  title: 'IDisposable и using',
  sub: 'Освободить ресурс сейчас, а не когда-нибудь',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'Ресурсы, о которых GC не знает',
      body: '<p>Файл, сетевое соединение, подключение к базе — это ресурсы ОС. GC видит только память и не знает, что объект держит открытый файл.</p><p>Если ждать GC, файл может оставаться открытым неизвестно сколько.</p>'
    },
    {
      t: 'rig', rig: 'files',
      task: 'Открой файл, потом «забудь» его (= null) и попробуй открыть снова. Добейся второго открытия без Dispose.',
      buttons: ['open', 'forget', 'gc', 'fin'],
      goal: { n: 2, noDispose: true },
      solve: ['open', 'open', 'forget:fs1', 'gc', 'fin', 'open']
    },
    {
      t: 'learn',
      title: 'IDisposable — освободить сейчас',
      body: '<p>Классы с такими ресурсами реализуют <code>IDisposable</code>: метод <code>Dispose()</code> закрывает ресурс сразу.</p><p><code>using</code> вызывает <code>Dispose()</code> автоматически — даже если внутри случилось исключение.</p>',
      code: 'using (var fs = new FileStream("log.txt", FileMode.Open))\n{\n    // работаем с файлом\n}   // здесь вызван fs.Dispose()\n\n// C# 8+: Dispose в конце текущего блока\nusing var reader = new StreamReader("data.txt");'
    },
    {
      t: 'rig', rig: 'files',
      task: 'Теперь открой файл дважды правильно: через Dispose() или using.',
      buttons: ['open', 'dispose', 'using', 'forget', 'gc', 'fin'],
      goal: { n: 2 },
      solve: ['open', 'dispose:fs1', 'open']
    },
    {
      t: 'choice',
      q: 'Внутри блока using вылетело исключение. Что с ресурсом?',
      options: ['Dispose() всё равно будет вызван', 'Останется открытым', 'Исключение будет проглочено'],
      answer: 0,
      explain: 'using разворачивается в try/finally, а finally выполняется в любом случае.'
    },
    {
      t: 'blanks',
      q: 'using — это сахар. Во что он разворачивается?',
      code: 'var fs = new FileStream(path, FileMode.Open);\n___\n{\n    Work(fs);\n}\n___\n{\n    fs?.Dispose();\n}',
      lang: 'cs',
      tiles: ['try', 'finally', 'catch', 'lock'],
      answer: ['try', 'finally'],
      explain: 'try/finally гарантирует Dispose() и при нормальном выходе, и при исключении.'
    },
    {
      t: 'learn',
      title: 'Свой класс с ресурсом',
      body: '<p>Если класс владеет <code>IDisposable</code>-полем, он тоже должен реализовать <code>IDisposable</code> и в своём <code>Dispose()</code> освобождать поле. Финализатор при этом не нужен.</p>',
      code: 'sealed class Report : IDisposable\n{\n    private readonly FileStream _file = File.OpenWrite("report.txt");\n    public void Dispose() => _file.Dispose();\n}',
      deep: 'Полный паттерн Dispose(bool disposing) с GC.SuppressFinalize(this) нужен незапечатанным классам, у которых могут быть наследники, и классам, которые напрямую держат неуправляемый ресурс. Для последнего случая есть SafeHandle — следующий урок.'
    },
    {
      t: 'choice',
      q: 'Класс хранит в поле FileStream. Что правильно?',
      options: ['Реализовать IDisposable и в Dispose() вызвать _file.Dispose()', 'Написать финализатор, который закроет файл', 'Ничего: GC закроет'],
      answer: 0,
      explain: 'Владелец ресурса передаёт ответственность дальше: его самого тоже будут оборачивать в using.'
    },
    {
      t: 'multi',
      q: 'Что правда? Отметь все.',
      options: ['Dispose() освобождает ресурс сразу, не дожидаясь GC', 'После Dispose() объект ещё может жить в памяти', 'using вызывает Dispose() даже при исключении', 'Dispose() освобождает память объекта', 'IDisposable нужен каждому классу'],
      answer: [0, 1, 2],
      explain: 'Dispose закрывает ресурс ОС. Память самого объекта по-прежнему освободит GC, когда объект станет недостижим.'
    }
  ]
};
