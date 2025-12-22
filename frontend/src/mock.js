export const mockMaterials = [
  {
    id: 'pla',
    name: 'PLA',
    nameRo: 'PLA',
    type: 'PLA',
    price: 180,
    description: 'Идеален для декоративных изделий, прототипов. Экологически чистый, простой в печати.',
    descriptionRo: 'Ideal pentru obiecte decorative, prototipuri. Ecologic, ușor de imprimat.',
    colors: ['Белый', 'Чёрный', 'Красный', 'Синий', 'Зелёный', 'Жёлтый', 'Оранжевый', 'Серый']
  },
  {
    id: 'petg',
    name: 'PETG',
    nameRo: 'PETG',
    type: 'PETG',
    price: 220,
    description: 'Прочный материал для функциональных деталей. Устойчив к влаге и ударам.',
    descriptionRo: 'Material rezistent pentru piese funcționale. Rezistent la umiditate și impact.',
    colors: ['Прозрачный', 'Чёрный', 'Белый', 'Синий', 'Зелёный']
  },
  {
    id: 'abs',
    name: 'ABS',
    nameRo: 'ABS',
    type: 'ABS',
    price: 200,
    description: 'Термостойкий, прочный. Подходит для деталей, работающих при высоких температурах.',
    descriptionRo: 'Termo-rezistent, durabil. Potrivit pentru piese care funcționează la temperaturi înalte.',
    colors: ['Белый', 'Чёрный', 'Серый', 'Красный']
  },
  {
    id: 'tpu',
    name: 'TPU',
    nameRo: 'TPU',
    type: 'TPU',
    price: 350,
    description: 'Гибкий эластичный материал. Для чехлов, прокладок, амортизаторов.',
    descriptionRo: 'Material flexibil elastic. Pentru huse, garnituri, amortizoare.',
    colors: ['Чёрный', 'Белый', 'Прозрачный']
  },
  {
    id: 'nylon',
    name: 'Nylon',
    nameRo: 'Nylon',
    type: 'Nylon',
    price: 450,
    description: 'Высокопрочный материал для механических деталей. Износостойкий.',
    descriptionRo: 'Material de înaltă rezistență pentru piese mecanice. Rezistent la uzură.',
    colors: ['Натуральный', 'Чёрный', 'Белый']
  }
];

export const mockGalleryItems = [
  {
    id: 1,
    title: 'Функциональный Прототип',
    titleRo: 'Prototip Funcțional',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80',
    material: 'PETG',
    description: 'Прототип механической детали'
  },
  {
    id: 2,
    title: 'Декоративная Модель',
    titleRo: 'Model Decorativ',
    image: 'https://images.unsplash.com/photo-1612753931365-5609ec4b447e?w=800&q=80',
    material: 'PLA',
    description: 'Декоративная фигурка'
  },
  {
    id: 3,
    title: 'Инженерная Деталь',
    titleRo: 'Piesă de Inginerie',
    image: 'https://images.unsplash.com/photo-1605648916319-cf082f7524a1?w=800&q=80',
    material: 'ABS',
    description: 'Термостойкая деталь'
  },
  {
    id: 4,
    title: 'Гибкий Чехол',
    titleRo: 'Husă Flexibilă',
    image: 'https://images.unsplash.com/photo-1558403194-611308249627?w=800&q=80',
    material: 'TPU',
    description: 'Защитный чехол'
  },
  {
    id: 5,
    title: 'Архитектурная Модель',
    titleRo: 'Model Arhitectural',
    image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80',
    material: 'PLA',
    description: 'Макет здания'
  },
  {
    id: 6,
    title: 'Запасная Часть',
    titleRo: 'Piesă de Schimb',
    image: 'https://images.unsplash.com/photo-1581092335397-9583eb92d232?w=800&q=80',
    material: 'PETG',
    description: 'Замена оригинальной детали'
  }
];

export const mockOrders = [
  {
    id: 1,
    fileName: 'bracket_v2.stl',
    material: 'PETG',
    color: 'Чёрный',
    weight: 45.5,
    printTime: '3ч 25мин',
    calculatedCost: 135,
    status: 'pending',
    uploadDate: '2025-01-15T10:30:00'
  },
  {
    id: 2,
    fileName: 'phone_case.obj',
    material: 'TPU',
    color: 'Чёрный',
    weight: 28.0,
    printTime: '2ч 10мин',
    calculatedCost: 245,
    status: 'pending',
    uploadDate: '2025-01-15T11:45:00'
  }
];

export const mockShopItems = [
  {
    id: 1,
    name: 'Держатель для телефона',
    nameRo: 'Suport pentru telefon',
    price: 150,
    material: 'PETG',
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80',
    description: 'Универсальный держатель для телефона. Регулируемый угол наклона.',
    descriptionRo: 'Suport universal pentru telefon. Unghi de înclinare reglabil.',
    inStock: true
  },
  {
    id: 2,
    name: 'Органайзер для стола',
    nameRo: 'Organizator pentru birou',
    price: 280,
    material: 'PLA',
    image: 'https://images.unsplash.com/photo-1600494603989-9650cf6ddd3d?w=800&q=80',
    description: 'Многофункциональный органайзер с отделениями для канцелярии.',
    descriptionRo: 'Organizator multifuncțional cu compartimente pentru papetărie.',
    inStock: true
  },
  {
    id: 3,
    name: 'Кашпо для суккулентов',
    nameRo: 'Ghiveci pentru succulente',
    price: 120,
    material: 'PLA',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&q=80',
    description: 'Стильное кашпо с дренажной системой для маленьких растений.',
    descriptionRo: 'Ghiveci elegant cu sistem de drenaj pentru plante mici.',
    inStock: true
  },
  {
    id: 4,
    name: 'Подставка для наушников',
    nameRo: 'Suport pentru căști',
    price: 180,
    material: 'PETG',
    image: 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=800&q=80',
    description: 'Элегантная подставка для хранения наушников.',
    descriptionRo: 'Suport elegant pentru depozitarea căștilor.',
    inStock: true
  }
];
