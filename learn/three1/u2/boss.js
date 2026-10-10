/** Финал раздела 2: камера. */
export default {
  id: 'tj.u2.boss',
  title: 'Финал: камера',
  sub: 'Пирамида видимости под контролем',
  minutes: 5,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'tjcam',
      task: 'Всё сломано: узкий угол, ближняя граница слишком далеко, дальняя слишком близко. Сделай так, чтобы были видны все три кубика.',
      start: { fov: 35, z: 3, near: 5, far: 10 },
      goal: { see: ['a', 'b', 'c'] },
      solve: ['fov:50', 'near:0.1', 'far:50']
    },
    {
      t: 'choice',
      q: 'Поменяли camera.fov = 75 — ничего не изменилось. Почему?',
      options: ['Забыли camera.updateProjectionMatrix()', 'fov нельзя менять', 'Нужно пересоздать рендерер'],
      answer: 0,
      explain: 'Камера кэширует матрицу проекции.'
    },
    {
      t: 'multi',
      q: 'Что отрежет объект? Отметь все.',
      options: ['Он ближе near', 'Он дальше far', 'Он вне угла обзора', 'Он слишком тёмный'],
      answer: [0, 1, 2],
      explain: 'Тёмный объект рисуется — просто тёмным.'
    },
    {
      t: 'blanks',
      q: 'Поставь камеру и поверни на центр',
      code: 'camera.position.set(4, 3, 6);\ncamera.___(0, 0, 0);',
      tiles: ['lookAt', 'rotate', 'target', 'look'],
      answer: ['lookAt'],
      explain: 'lookAt поворачивает объект лицом к точке.'
    },
    {
      t: 'match',
      q: 'Соедини симптом и причину',
      pairs: [
        ['Ближний объект обрезан', 'Большой near'],
        ['Дальний пропал', 'Маленький far'],
        ['Мерцание поверхностей', 'Крошечный near'],
        ['Картинка растянута', 'Не обновили aspect']
      ]
    },
    {
      t: 'choice',
      q: 'Какая камера для изометрической игры?',
      options: ['OrthographicCamera', 'PerspectiveCamera с fov 100', 'Любая'],
      answer: 0,
      explain: 'Изометрия — без перспективного уменьшения.'
    },
    {
      t: 'choice',
      q: 'OrbitControls с enableDamping. Что обязательно в цикле?',
      options: ['controls.update()', 'controls.reset()', 'Ничего'],
      answer: 0,
      explain: 'update каждый кадр плавно доводит движение.'
    },
    {
      t: 'rig', rig: 'tjcam',
      task: 'Оставь в кадре только красный и зелёный: синий — фон, его не рисуем. fov и камеру не трогай.',
      lock: ['fov', 'z'],
      goal: { see: ['a', 'b'], hide: ['c'] },
      solve: ['far:10']
    }
  ]
};
