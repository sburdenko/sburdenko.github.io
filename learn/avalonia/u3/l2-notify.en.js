/** Avalonia, unit 3, lesson 2: INotifyPropertyChanged and modes. */
export default {
  id: 'av.u3.l2',
  title: 'Why the screen did not update',
  sub: 'INotifyPropertyChanged and binding modes',
  minutes: 8,
  cards: [
    {
      t: 'learn',
      title: 'The screen does not watch the model on its own',
      body: '<p>A binding does not poll the property every second. The model has to <b>announce</b> it: "my property changed." That is what the <code>INotifyPropertyChanged</code> interface and its <code>PropertyChanged</code> event are for.</p>'
    },
    {
      t: 'rig', rig: 'bind',
      task: 'Code changes the name, but the screen does not budge. Fix the model and check.',
      start: { mode: 'TwoWay', notify: false }, lock: ['mode'],
      goal: { sync: ['code'] },
      solve: ['notify', 'code']
    },
    {
      t: 'choice',
      q: 'Why didn\'t the screen update without INotifyPropertyChanged?',
      options: ['The model never raised PropertyChanged, so the binding never learned about the change', 'The binding broke', 'The window needs a restart'],
      answer: 0,
      explain: 'No event, no update.'
    },
    {
      t: 'learn',
      title: 'Modes',
      body: '<p><b>OneWay</b>: from the model to the screen.<br><b>TwoWay</b>: both directions (the default for TextBox.Text).<br><b>OneTime</b>: once, at startup.<br><b>OneWayToSource</b>: only from the screen to the model.</p>'
    },
    {
      t: 'rig', rig: 'bind',
      task: 'Code updates the TextBox, but what the user types never reaches the model. Change the mode.',
      start: { mode: 'OneWay', notify: true }, lock: ['notify'],
      goal: { sync: ['type'] },
      solve: ['mode:TwoWay', 'type']
    },
    {
      t: 'rig', rig: 'bind',
      task: 'Pick the mode in which both typing and changes from code show up everywhere.',
      start: { mode: 'OneTime', notify: true }, lock: ['notify'],
      goal: { sync: ['type', 'code'] },
      solve: ['mode:TwoWay', 'type', 'code']
    },
    {
      t: 'match',
      q: 'Match each mode to its direction',
      pairs: [
        ['OneWay', 'Model → screen'],
        ['TwoWay', 'Both directions'],
        ['OneTime', 'Once at startup'],
        ['OneWayToSource', 'Screen → model']
      ]
    },
    {
      t: 'tapline',
      q: 'Which line makes the screen update?',
      code: 'public string Name\n{\n    get => _name;\n    set { _name = value; OnPropertyChanged(); }\n}',
      answer: 3,
      explain: 'OnPropertyChanged raises the PropertyChanged event with the property name.'
    },
    {
      t: 'choice',
      q: 'The user typed some text, the model got it, but the greeting (a TextBlock bound to the same property) did not update. What is wrong?',
      options: ['The model did not raise PropertyChanged, so other bindings to Name never heard about the change', 'TwoWay mode is broken', 'TextBlock does not support bindings'],
      answer: 0,
      explain: 'That is exactly what the first exercise without INotifyPropertyChanged showed.'
    }
  ]
};
