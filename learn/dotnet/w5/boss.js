/** .NET изнутри, финал раздела «Сборки и версии». */
export default {
  id: 'dotnet.w5.boss',
  title: 'Финал: сборки и версии',
  sub: 'Идентичность, привязка, строгие имена и NuGet',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'choice',
      q: 'Приложение на .NET Framework 4.8. Подписанная библиотека собрана против Newtonsoft.Json 12.0.0.0, в папке лежит 13.0.0.0, redirect в App.exe.config нет. Что будет?',
      options: ['FileLoadException: строгая привязка требует 12.0.0.0', 'Загрузится 13.0.0.0: версия не ниже запрошенной', 'Загрузятся обе версии: каждая для своих потребителей', 'Предупреждение в журнале Fusion, работа продолжится'],
      answer: 0,
      explain: 'Framework для строго именованной сборки требует точного совпадения версии. Правило «не ниже» — это .NET Core и .NET 5+.',
      wrong: { 1: 'Так поведёт себя .NET 8, а не Framework.' }
    },
    {
      t: 'multi',
      q: 'Что из этого меняет идентичность сборки? Отметь все.',
      options: ['AssemblyVersion', 'Ключ строгого имени', 'Культура', 'FileVersion', 'InformationalVersion'],
      answer: [0, 1, 2],
      explain: 'Идентичность — имя, версия, культура и открытый ключ. FileVersion и InformationalVersion — просто атрибуты, загрузчик CLR на них не смотрит.'
    },
    {
      t: 'tapline',
      q: 'Подписанная библиотека под netstandard2.0. Какую строку изменить, чтобы патчи 3.7.x не требовали binding redirect у потребителей на Framework?',
      code: '<PropertyGroup>\n  <Version>3.7.2</Version>\n  <AssemblyVersion>3.7.2.0</AssemblyVersion>\n  <FileVersion>3.7.2.41</FileVersion>\n  <SignAssembly>true</SignAssembly>\n</PropertyGroup>',
      lang: 'xml',
      answer: 2,
      explain: 'AssemblyVersion должна быть 3.0.0.0 — только мажор. Удалить строку мало: SDK выведет 3.7.2.0 из Version. Номер патча и сборки CI пусть живут в Version и FileVersion.'
    },
    {
      t: 'choice',
      q: 'Acme.Pricing требует Acme.Log >= 2.1, Acme.Tax — Acme.Log >= 2.0. На сервере есть 2.0, 2.2 и 3.0, версии 2.1 нет. Что выберет NuGet?',
      options: ['2.2', '3.0', '2.0', 'Ошибку NU1107'],
      answer: 0,
      explain: 'Нужна наименьшая версия, которая устроит обоих: не ниже 2.1. Самой 2.1 нет, следующая доступная — 2.2.',
      wrong: { 1: 'NuGet не берёт самую новую: правило — наименьшая подходящая.', 2: '2.0 не устроит Acme.Pricing.' }
    },
    {
      t: 'order',
      q: 'Расставь, как приложение на .NET 8 получает сборку Acme.Log',
      items: ['При сборке SDK пишет App.deps.json по результату restore', 'hostfxr читает runtimeconfig.json и выбирает фреймворк', 'hostpolicy собирает TPA из deps.json приложения и фреймворка', 'Код впервые обращается к типу из Acme.Log', 'Контекст по умолчанию находит Acme.Log в TPA по имени и сверяет версию'],
      explain: 'Сначала restore и сборка, потом хост строит список сборок, и только когда JIT встречает тип из Acme.Log, сборка загружается — по имени из списка, с проверкой «не ниже».'
    },
    {
      t: 'blanks',
      q: 'Класс Money переехал из Shop.dll в Shop.Core.dll. Сделай так, чтобы старые программы его нашли',
      code: '// Shop.dll, версия 2\n[assembly: ___(typeof(Shop.Money))]',
      tiles: ['TypeForwardedTo', 'TypeForwardedFrom', 'InternalsVisibleTo', 'AssemblyVersion'],
      answer: ['TypeForwardedTo'],
      explain: 'TypeForwardedTo пишет строку в ExportedType, и CLR идёт за типом в Shop.Core. TypeForwardedFrom ставят на сам тип в новой сборке — его читают сериализаторы, а не загрузчик.'
    },
    {
      t: 'match',
      q: 'Соедини механизм .NET Framework и что стало с ним в современном .NET',
      pairs: [
        ['GAC', 'Общие сборки в папке установленного рантайма'],
        ['Binding redirect', 'Не нужен: подходит версия не ниже запрошенной'],
        ['Probing по папкам', 'Поиск по имени в списке TPA из deps.json'],
        ['Проверка подписи строгого имени', 'Не выполняется вовсе']
      ]
    },
    {
      t: 'choice',
      q: 'Коллега: «Подпишем сборку строгим именем — и никто не подменит наш код». Прав ли он?',
      options: ['Нет: строгое имя — идентичность, а не защита; автора подтверждают Authenticode и подпись NuGet-пакета', 'Да: CLR проверяет подпись при каждой загрузке', 'Да, но только в .NET 8 и новее', 'Нет: строгим именем можно подписывать только сборки Microsoft'],
      answer: 0,
      explain: 'Современный рантайм подпись строгого имени не проверяет, Framework при обычной загрузке тоже давно её пропускает, а ключи многих библиотек открыты.'
    },
    {
      t: 'choice',
      q: 'Приложение на .NET 8 собрано против Acme.Pricing с AssemblyVersion 3.7.0.0. При развёртывании в папку попала старая сборка 3.6.0.0. Что будет?',
      options: ['FileLoadException: найденная версия ниже запрошенной', 'Загрузится: проверяется только мажорная версия', 'Загрузится: .NET 8 версии не проверяет', 'MissingMethodException при старте процесса'],
      answer: 0,
      explain: '«Не ниже» работает в обе стороны: выше — можно, ниже — ошибка загрузки. MissingMethodException был бы, если бы AssemblyVersion у обеих была 3.0.0.0 и проверка прошла.'
    }
  ]
};
