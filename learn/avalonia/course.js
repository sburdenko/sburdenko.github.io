/** Курс «Avalonia: основы»: кросс-платформенный UI на C# и XAML. */
import u1l1 from './u1/l1-what.js?v=202610081418';
import u1l2 from './u1/l2-project.js?v=202610081418';
import u1l3 from './u1/l3-axaml.js?v=202610081418';
import u1boss from './u1/boss.js?v=202610081418';
import u2l1 from './u2/l1-layout.js?v=202610081418';
import u2l2 from './u2/l2-panels.js?v=202610081418';
import u2l3 from './u2/l3-grid.js?v=202610081418';
import u2boss from './u2/boss.js?v=202610081418';
import u3l1 from './u3/l1-binding.js?v=202610081418';
import u3l2 from './u3/l2-notify.js?v=202610081418';
import u3l3 from './u3/l3-mvvm.js?v=202610081418';
import u3l4 from './u3/l4-commands.js?v=202610081418';
import u3boss from './u3/boss.js?v=202610081418';
import u4l1 from './u4/l1-styles.js?v=202610081418';
import u4l2 from './u4/l2-themes.js?v=202610081418';
import u4l3 from './u4/l3-lists.js?v=202610081418';
import u4l4 from './u4/l4-threads.js?v=202610081418';
import u4boss from './u4/boss.js?v=202610081418';

export default {
  id: 'avalonia',
  title: 'Avalonia: основы',
  units: [
    {
      id: 'u1',
      title: 'Знакомство',
      blurb: 'Что такое Avalonia и чем она отличается от WPF и MAUI, первый проект из шаблона и разметка AXAML.',
      lessons: [u1l1, u1l2, u1l3, u1boss]
    },
    {
      id: 'u2',
      title: 'Раскладка',
      blurb: 'Measure и Arrange, Margin и Padding, панели StackPanel, WrapPanel и DockPanel, Grid с Auto, пикселями и звёздочками.',
      lessons: [u2l1, u2l2, u2l3, u2boss]
    },
    {
      id: 'u3',
      title: 'Привязки и MVVM',
      blurb: 'DataContext и {Binding}, INotifyPropertyChanged и режимы, CommunityToolkit.Mvvm, compiled bindings и команды.',
      lessons: [u3l1, u3l2, u3l3, u3l4, u3boss]
    },
    {
      id: 'u4',
      title: 'Стили, списки и UI-поток',
      blurb: 'Селекторы стилей и псевдоклассы, темы и ресурсы, списки с ObservableCollection и DataTemplate, Dispatcher.UIThread. Финал курса.',
      lessons: [u4l1, u4l2, u4l3, u4l4, u4boss]
    }
  ]
};
