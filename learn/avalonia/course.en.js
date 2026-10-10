/** The "Avalonia basics" course: cross-platform UI in C# and XAML. */
import u1l1 from './u1/l1-what.en.js?v=202610100800';
import u1l2 from './u1/l2-project.en.js?v=202610100800';
import u1l3 from './u1/l3-axaml.en.js?v=202610100800';
import u1boss from './u1/boss.en.js?v=202610100800';
import u2l1 from './u2/l1-layout.en.js?v=202610100800';
import u2l2 from './u2/l2-panels.en.js?v=202610100800';
import u2l3 from './u2/l3-grid.en.js?v=202610100800';
import u2boss from './u2/boss.en.js?v=202610100800';
import u3l1 from './u3/l1-binding.en.js?v=202610100800';
import u3l2 from './u3/l2-notify.en.js?v=202610100800';
import u3l3 from './u3/l3-mvvm.en.js?v=202610100800';
import u3l4 from './u3/l4-commands.en.js?v=202610100800';
import u3boss from './u3/boss.en.js?v=202610100800';
import u4l1 from './u4/l1-styles.en.js?v=202610100800';
import u4l2 from './u4/l2-themes.en.js?v=202610100800';
import u4l3 from './u4/l3-lists.en.js?v=202610100800';
import u4l4 from './u4/l4-threads.en.js?v=202610100800';
import u4boss from './u4/boss.en.js?v=202610100800';

export default {
  id: 'avalonia',
  title: 'Avalonia basics',
  units: [
    {
      id: 'u1',
      title: 'Getting started',
      blurb: 'What Avalonia is and how it differs from WPF and MAUI, a first project from a template, and AXAML markup.',
      lessons: [u1l1, u1l2, u1l3, u1boss]
    },
    {
      id: 'u2',
      title: 'Layout',
      blurb: 'Measure and Arrange, Margin and Padding, the StackPanel, WrapPanel and DockPanel panels, and Grid with Auto, pixels and stars.',
      lessons: [u2l1, u2l2, u2l3, u2boss]
    },
    {
      id: 'u3',
      title: 'Bindings and MVVM',
      blurb: 'DataContext and {Binding}, INotifyPropertyChanged and modes, CommunityToolkit.Mvvm, compiled bindings and commands.',
      lessons: [u3l1, u3l2, u3l3, u3l4, u3boss]
    },
    {
      id: 'u4',
      title: 'Styles, lists and the UI thread',
      blurb: 'Style selectors and pseudo-classes, themes and resources, lists with ObservableCollection and DataTemplate, Dispatcher.UIThread. The course final.',
      lessons: [u4l1, u4l2, u4l3, u4l4, u4boss]
    }
  ]
};
