import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get saved language from localStorage or default to 'ru'
    return localStorage.getItem('language') || 'ru';
  });

  const toggleLanguage = () => {
    const newLang = language === 'ru' ? 'ro' : 'ru';
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const translations = {
    ru: {
      nav: {
        home: 'Главная',
        gallery: 'Проекты',
        shop: 'Товары',
        calculator: 'Расчёт стоимости',
        contacts: 'Контакты',
        textilePrint: 'Black Textile Print',
        admin: 'Панель администратора'
      },
      gallery: {
        title: 'Наши проекты',
        subtitle: 'Примеры выполненных работ'
      },
      shop: {
        title: 'Готовые товары',
        subtitle: 'Модели, которые можно заказать прямо сейчас',
        contact: 'Заказать'
      },
      home: {
        hero: {
          title: 'Профессиональная 3D печать и реверс-инжиниринг',
          subtitle: 'Воплощаем ваши идеи в реальность с помощью передовых технологий 3D печати',
          ctaPrimary: 'Рассчитать стоимость',
          ctaSecondary: 'Наши проекты'
        },
        services: {
          title: 'Наши услуги',
          service1: {
            title: '3D Печать',
            desc: 'Высокоточная печать из различных материалов',
            description: 'Высокоточная печать из различных материалов'
          },
          service2: {
            title: 'Быстрое прототипирование',
            desc: 'От идеи до готового прототипа за считанные дни',
            description: 'От идеи до готового прототипа за считанные дни'
          },
          service3: {
            title: 'Реверс-инжиниринг',
            desc: 'Воссоздание деталей по образцу',
            description: 'Воссоздание деталей по образцу'
          }
        }
      },
      calculator: {
        title: 'Расчёт стоимости',
        upload: {
          title: 'Загрузите 3D модель',
          desc: 'Поддерживаются файлы формата STL и OBJ',
          button: 'Выбрать файл',
          selected: 'Выбран файл:',
          formats: 'STL или OBJ файлы'
        },
        material: {
          title: 'Выберите материал',
          notSure: 'Не уверен в выборе? Доверьте выбор оператору',
          purpose: 'Назначение детали',
          loads: 'Какие нагрузки будут?'
        },
        calculate: 'Рассчитать стоимость',
        askOperator: 'Спросить оператора',
        noFile: {
          title: 'Нет файла для 3D печати?',
          desc: 'Свяжитесь с нами - поможем создать модель с нуля или адаптируем вашу идею'
        },
        submit: 'Рассчитать стоимость'
      },
      contacts: {
        title: 'Контакты',
        email: 'Email',
        phone: 'Телефон',
        address: 'Адрес'
      },
      admin: {
        login: 'Вход в админ-панель',
        email: 'Email',
        password: 'Пароль',
        loginButton: 'Войти',
        orders: {
          title: 'Заказы',
          pending: 'Ожидающие заказы',
          file: 'Файл',
          material: 'Материал',
          cost: 'Стоимость',
          approve: 'Подтвердить',
          edit: 'Изменить цену'
        },
        materials: {
          title: 'Материалы',
          add: 'Добавить материал',
          name: 'Название',
          color: 'Цвет',
          type: 'Тип',
          price: 'Цена за кг',
          description: 'Описание'
        },
        settings: {
          title: 'Настройки',
          electricity: 'Стоимость электричества',
          power: 'Мощность принтера',
          markup: 'Наценка %',
          labor: 'Стоимость работы'
        }
      },
      profile: {
        title: 'Личный кабинет',
        login: 'Войдите через аккаунт Google',
        loginDesc: 'Для отслеживания заказов, получения скидок и персональных предложений',
        loginButton: 'Войти через Google',
        logout: 'Выйти',
        totalOrders: 'Всего заказов',
        yourDiscount: 'Ваша скидка',
        orderHistory: 'История заказов',
        noOrders: 'У вас пока нет заказов',
        createFirstOrder: 'Создать первый заказ',
        repeat: 'Повторить',
        admin: 'Администратор',
        adminLogin: 'Вход для администратора',
        cancel: 'Отмена'
      },
      common: {
        loading: 'Загрузка...',
        error: 'Ошибка',
        success: 'Успешно',
        save: 'Сохранить',
        cancel: 'Отмена',
        delete: 'Удалить',
        edit: 'Редактировать',
        add: 'Добавить',
        search: 'Поиск',
        filter: 'Фильтр',
        sort: 'Сортировка',
        price: 'Цена',
        material: 'Материал',
        color: 'Цвет',
        status: 'Статус'
      },
      orderStatus: {
        pending: 'В обработке',
        approved: 'Подтверждён',
        printing: 'В печати',
        pendingPayment: 'Ожидание оплаты',
        ready: 'Готов к выдаче',
        completed: 'Завершён'
      }
    },
    ro: {
      nav: {
        home: 'Acasă',
        gallery: 'Proiecte',
        shop: 'Produse',
        calculator: 'Calcul cost',
        contacts: 'Contacte',
        textilePrint: 'Black Textile Print',
        admin: 'Panou administrator'
      },
      gallery: {
        title: 'Proiectele noastre',
        subtitle: 'Exemple de lucrări finalizate'
      },
      shop: {
        title: 'Produse gata',
        subtitle: 'Modele pe care le puteți comanda acum',
        contact: 'Comandă'
      },
      home: {
        hero: {
          title: 'Printare 3D profesională și inginerie inversă',
          subtitle: 'Transformăm ideile tale în realitate cu tehnologii avansate de printare 3D',
          ctaPrimary: 'Calculează costul',
          ctaSecondary: 'Proiectele noastre'
        },
        services: {
          title: 'Serviciile noastre',
          service1: {
            title: 'Printare 3D',
            desc: 'Printare de înaltă precizie din diverse materiale',
            description: 'Printare de înaltă precizie din diverse materiale'
          },
          service2: {
            title: 'Prototipare rapidă',
            desc: 'De la idee la prototip gata în câteva zile',
            description: 'De la idee la prototip gata în câteva zile'
          },
          service3: {
            title: 'Inginerie inversă',
            desc: 'Recrearea pieselor după model',
            description: 'Recrearea pieselor după model'
          }
        }
      },
      calculator: {
        title: 'Calcul cost',
        upload: {
          title: 'Încarcă modelul 3D',
          desc: 'Sunt acceptate fișiere STL și OBJ',
          button: 'Alege fișier',
          selected: 'Fișier selectat:',
          formats: 'Fișiere STL sau OBJ'
        },
        material: {
          title: 'Alege materialul',
          notSure: 'Nu ești sigur? Lasă operatorul să aleagă',
          purpose: 'Scopul piesei',
          loads: 'Ce sarcini vor fi?'
        },
        calculate: 'Calculează costul',
        askOperator: 'Întreabă operatorul',
        noFile: {
          title: 'Nu ai fișier pentru printare 3D?',
          desc: 'Contactați-ne - vă ajutăm să creați un model de la zero sau să adaptăm ideea dvs.'
        },
        submit: 'Calculează costul'
      },
      contacts: {
        title: 'Contacte',
        email: 'Email',
        phone: 'Telefon',
        address: 'Adresă'
      },
      admin: {
        login: 'Autentificare admin',
        email: 'Email',
        password: 'Parolă',
        loginButton: 'Intră',
        orders: {
          title: 'Comenzi',
          pending: 'Comenzi în așteptare',
          file: 'Fișier',
          material: 'Material',
          cost: 'Cost',
          approve: 'Confirmă',
          edit: 'Modifică prețul'
        },
        materials: {
          title: 'Materiale',
          add: 'Adaugă material',
          name: 'Denumire',
          color: 'Culoare',
          type: 'Tip',
          price: 'Preț per kg',
          description: 'Descriere'
        },
        settings: {
          title: 'Setări',
          electricity: 'Cost electricitate',
          power: 'Putere imprimantă',
          markup: 'Adaos %',
          labor: 'Cost manoperă'
        }
      },
      profile: {
        title: 'Cont personal',
        login: 'Conectați-vă prin contul Google',
        loginDesc: 'Pentru urmărirea comenzilor, reduceri și oferte personale',
        loginButton: 'Conectare cu Google',
        logout: 'Ieși',
        totalOrders: 'Total comenzi',
        yourDiscount: 'Reducerea dvs.',
        orderHistory: 'Istoric comenzi',
        noOrders: 'Nu aveți încă comenzi',
        createFirstOrder: 'Creează prima comandă',
        repeat: 'Repetă',
        admin: 'Administrator',
        adminLogin: 'Autentificare administrator',
        cancel: 'Anulare'
      },
      common: {
        loading: 'Se încarcă...',
        error: 'Eroare',
        success: 'Succes',
        save: 'Salvează',
        cancel: 'Anulare',
        delete: 'Șterge',
        edit: 'Editează',
        add: 'Adaugă',
        search: 'Caută',
        filter: 'Filtrează',
        sort: 'Sortează',
        price: 'Preț',
        material: 'Material',
        color: 'Culoare',
        status: 'Status'
      },
      orderStatus: {
        pending: 'În procesare',
        approved: 'Confirmat',
        printing: 'În printare',
        pendingPayment: 'Așteptare plată',
        ready: 'Gata pentru ridicare',
        completed: 'Finalizat'
      }
    }
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};