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
      }
    },
    ro: {
      nav: {
        home: 'Acasă',
        gallery: 'Proiecte',
        shop: 'Produse',
        calculator: 'Calcul cost',
        contacts: 'Contacte',
        textilePrint: 'Black Textile Print'
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
        materials: {
          color: 'Culoare'
        },
        settings: {
          title: 'Setări',
          electricity: 'Electricitate',
          postProcessing: 'Post-procesare',
          markup: 'Adaos'
        }
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
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};