/*
  PRODUCT ADMINISTRATION
  ----------------------
  This is the single source used by the homepage, the Products page and the cart.

  - Hide a product: change active to false.
  - Show it again: change active to true.
  - Mark it unavailable: add or change available to false.
  - Mark it in stock again: change available to true.
  - Put it on promotion: set promotion to true and add salePrice.
  - Add package choices: use variants with a label and price multiplier.
  - Change a price: edit price.
  - Show it on the homepage: set featured to true.
  - Change its position: edit order (and featuredOrder for the homepage).
  - Change its photo: edit image or replace the referenced file.

  Keep every product id unique. See PRODUCTS-GUIDE.md for copy-and-edit examples.
*/

window.GALAS_GROZS_CATALOG = {
  schemaVersion: 2,
  defaultLanguage: "lv",

  categories: [
    {
      id: "pork",
      active: true,
      order: 10,
      label: { en: "Pork" },
      title: { en: "Fresh pork cuts" },
      description: {
        en: "Pork products for home cooking, roasting, grilling and family meals."
      }
    },
    {
      id: "beef",
      active: true,
      order: 20,
      label: { en: "Beef" },
      title: { en: "Beef products" },
      description: {
        en: "Fresh beef cuts for slow cooking, roasting, grilling and everyday meals."
      }
    },
    {
      id: "chicken",
      active: true,
      order: 30,
      label: { en: "Chicken" },
      title: { en: "Chicken products" },
      description: {
        en: "Fresh chicken products for quick meals, grilling, roasting and everyday cooking."
      }
    },
    {
      id: "bbq",
      active: true,
      order: 40,
      label: { en: "BBQ & Grill" },
      title: { en: "BBQ and grill products" },
      description: {
        en: "Grill-friendly products for weekends, gatherings and outdoor cooking."
      }
    },
    {
      id: "boxes",
      active: true,
      order: 50,
      label: { en: "Meat Boxes" },
      title: { en: "Prepared meat boxes" },
      description: {
        en: "Practical mixed boxes for families, BBQ days and weekly cooking. Box contents may vary slightly depending on fresh availability."
      }
    }
  ],

  products: [
    {
      id: "pork-loin-without-rib-skinless",
      active: true,
      featured: false,
      order: 10,
      category: "pork",
      price: 7.5,
      priceSource: "client",
      unit: "kg",
      variants: [
        { id: "500g", label: { en: "500 g" }, multiplier: 0.5 },
        { id: "1kg", label: { en: "1 kg" }, multiplier: 1 }
      ],
      image: "assets/products/pork-loin-without-rib-skinless-client-v2.jpg",
      name: {
        en: "Pork loin without rib, skinless"
      },
      description: {
        en: "Lean pork loin without rib and without skin, suitable for slices, roasting and everyday cooking."
      },
      meta: {
        en: "Cut: loin · Best for: roasting, slicing, pan cooking"
      }
    },
    {
      id: "pork-loin-without-rib-skinless-cutted",
      active: true,
      featured: false,
      order: 15,
      category: "pork",
      price: 7.5,
      priceSource: "client",
      unit: "kg",
      variants: [
        { id: "500g", label: { en: "500 g" }, multiplier: 0.5 },
        { id: "1kg", label: { en: "1 kg" }, multiplier: 1 }
      ],
      image: "assets/products/pork-loin-without-rib-skinless-cutted.png",
      name: {
        en: "Pork loin without rib, skinless, cut"
      },
      description: {
        en: "Skinless and boneless pork loin cut into practical portions for frying, grilling or roasting."
      },
      meta: {
        en: "Cut: portioned loin · Best for: pan cooking, grill, roasting"
      }
    },
    {
      id: "pork-loin-with-fat-and-skin",
      active: true,
      featured: false,
      order: 20,
      category: "pork",
      price: 6.5,
      priceSource: "client",
      unit: "kg",
      image: "assets/products/pork-loin-with-fat-and-skin-client-v3.webp",
      name: {
        en: "Pork loin with fat and skin"
      },
      description: {
        en: "Pork loin with a visible layer of fat and skin, suitable for juicy roasts and traditional home cooking."
      },
      meta: {
        en: "Cut: loin with fat and skin · Best for: roasting, oven cooking"
      }
    },
    {
      id: "pork-loin-long-rib",
      active: true,
      featured: false,
      order: 25,
      category: "pork",
      price: 7,
      priceSource: "client",
      unit: "kg",
      image: "assets/products/pork-loin-long-rib.png",
      name: {
        en: "Pork loin with long rib",
        lv: "Karbonāde ar garo ribu"
      },
      description: {
        en: "Pork loin attached to a long rib, suitable for roasting, grilling and cutting into chops."
      },
      meta: {
        en: "Cut: loin with long rib · Best for: chops, grill, roasting"
      }
    },
    {
      id: "pork-neck",
      active: true,
      featured: true,
      featuredOrder: 10,
      order: 30,
      category: "pork",
      price: 7.5,
      priceSource: "client",
      unit: "kg",
      image: "assets/products/pork-neck-client-v3.webp",
      name: {
        en: "Pork neck"
      },
      description: {
        en: "Juicy pork neck with good marbling, suitable for grilling, roasting and steaks."
      },
      featuredDescription: {
        en: "Juicy pork neck, suitable for roasting, grilling and slow cooking."
      },
      meta: {
        en: "Cut: neck · Best for: BBQ, steak, roast"
      }
    },
    {
      id: "pork-tenderloin",
      active: true,
      featured: true,
      featuredOrder: 20,
      order: 40,
      category: "pork",
      price: 8.5,
      priceSource: "client",
      unit: "kg",
      image: "assets/products/pork-tenderloin-whole-v4.webp",
      name: {
        en: "Pork tenderloin"
      },
      description: {
        en: "Tender pork cut for quick cooking, pan dishes and special meals."
      },
      featuredDescription: {
        en: "Tender pork fillet for premium home cooking and quick meals."
      },
      meta: {
        en: "Cut: tenderloin · Best for: quick meals, pan cooking"
      }
    },
    {
      id: "pork-ham-piece-skinless",
      active: true,
      featured: false,
      order: 50,
      category: "pork",
      price: 6.5,
      priceSource: "client",
      unit: "kg",
      image: "assets/products/pork-ham-piece-skinless-real.png",
      name: {
        en: "Skinless pork leg cut",
        lv: "Gurna gabals bez ādas"
      },
      description: {
        en: "Skinless pork leg cut for roasting, stews and sliced home meals."
      },
      meta: {
        en: "Cut: pork leg · Best for: roasting, stews"
      }
    },
    {
      id: "pork-ham-piece-with-skin",
      active: false,
      featured: false,
      order: 60,
      category: "pork",
      price: 6,
      priceSource: "client",
      unit: "kg",
      image: "assets/products/pork-ham-piece-with-skin.png",
      name: {
        en: "Pork ham piece with skin"
      },
      description: {
        en: "Pork ham piece with skin, suitable for traditional roasting and slow cooking."
      },
      meta: {
        en: "Cut: ham · Best for: roast, slow cooking"
      }
    },
    {
      id: "boneless-pork-ham-with-skin",
      active: true,
      featured: false,
      order: 70,
      category: "pork",
      price: 5.5,
      priceSource: "client",
      unit: "kg",
      image: "assets/products/boneless-pork-ham-with-skin.png",
      name: {
        en: "Boneless pork ham with skin"
      },
      description: {
        en: "Boneless pork ham with skin, practical for roasts and larger family meals."
      },
      meta: {
        en: "Cut: ham · Best for: oven roasting, family meals"
      }
    },
    {
      id: "boneless-pork-ham-skinless",
      active: false,
      featured: false,
      order: 80,
      category: "pork",
      price: 5.7,
      priceSource: "client",
      unit: "kg",
      image: "assets/products/boneless-pork-ham-skinless.png",
      name: {
        en: "Boneless pork ham, skinless"
      },
      description: {
        en: "Skinless boneless pork ham for clean preparation, roasts and slicing."
      },
      meta: {
        en: "Cut: ham · Best for: roast, slicing"
      }
    },
    {
      id: "pork-belly-with-rib",
      active: true,
      featured: false,
      order: 90,
      category: "pork",
      price: 6.5,
      priceSource: "client",
      unit: "kg",
      image: "assets/products/pork-ribs-with-skin-and-fat.png",
      name: {
        en: "Pork belly with rib",
        lv: "Cūkgaļas krūtiņa ar garo ribu"
      },
      description: {
        en: "Pork belly with rib bone, suitable for roasting, BBQ and slow-cooked dishes."
      },
      meta: {
        en: "Cut: belly with rib · Best for: BBQ, roasting, slow cooking"
      }
    },
    {
      id: "pork-belly",
      active: true,
      featured: false,
      order: 100,
      category: "pork",
      price: 5.8,
      priceSource: "client",
      unit: "kg",
      image: "assets/products/pork-belly-real.png",
      name: {
        en: "Pork belly",
        lv: "Cūkgaļas pavēdere"
      },
      description: {
        en: "Classic boneless pork belly for roasting, frying and traditional home dishes."
      },
      meta: {
        en: "Cut: boneless belly · Best for: oven, frying, slow cooking"
      }
    },
    {
      id: "pork-belly-for-smoking",
      active: true,
      featured: false,
      order: 105,
      category: "pork",
      price: 6.5,
      priceSource: "client",
      unit: "kg",
      image: "assets/products/pork-belly-for-smoking-client-v2.webp",
      name: {
        en: "Pork belly / streaky pork"
      },
      description: {
        en: "Fresh pork belly suitable for smoking."
      },
      meta: {
        en: "Best for: smoking"
      }
    },
    {
      id: "pork-ribs-with-skin-and-fat",
      active: false,
      featured: false,
      order: 110,
      category: "pork",
      price: 7,
      priceSource: "client",
      unit: "kg",
      image: "assets/products/pork-ribs-with-skin-and-fat.png",
      name: {
        en: "Pork ribs with skin and fat"
      },
      description: {
        en: "Pork ribs with skin and fat, good for rich oven dishes and BBQ-style meals."
      },
      meta: {
        en: "Cut: ribs · Best for: oven, BBQ cooking"
      }
    },
    {
      id: "pork-shoulder-with-bone-and-skin",
      active: true,
      featured: false,
      order: 120,
      category: "pork",
      price: 4.8,
      priceSource: "client",
      unit: "kg",
      image: "assets/products/pork-shoulder-with-bone-and-skin.png",
      name: {
        en: "Pork shoulder with bone and skin"
      },
      description: {
        en: "Pork shoulder with bone and skin, suitable for slow cooking, soups and traditional meals."
      },
      meta: {
        en: "Cut: shoulder · Best for: slow cooking, roast, soup"
      }
    },
    {
      id: "boneless-pork-shoulder-skinless",
      active: true,
      featured: false,
      order: 130,
      category: "pork",
      price: 5.5,
      priceSource: "client",
      unit: "kg",
      image: "assets/products/boneless-pork-shoulder-skinless.png",
      name: {
        en: "Boneless pork shoulder, skinless"
      },
      description: {
        en: "Skinless boneless pork shoulder for roasts, pulled pork-style cooking and home meals."
      },
      meta: {
        en: "Cut: shoulder · Best for: stews, slow cooking"
      }
    },
    {
      id: "pork-shanks",
      active: true,
      featured: false,
      order: 140,
      category: "pork",
      price: 2.5,
      priceSource: "client",
      unit: "kg",
      image: "assets/products/pork-shanks.png",
      name: {
        en: "Pork shanks"
      },
      description: {
        en: "Pork shanks for soups, slow cooking and rich traditional dishes."
      },
      meta: {
        en: "Cut: shanks · Best for: soups, slow cooking"
      }
    },
    {
      id: "pork-soup-set",
      active: true,
      featured: false,
      order: 145,
      category: "pork",
      price: 1.5,
      priceSource: "client",
      unit: "kg",
      image: "assets/products/pork-soup-set.png",
      name: {
        en: "Pork soup set",
        lv: "Zupas izlase"
      },
      description: {
        en: "A selection of pork bones and meat pieces for broth, soups and slow-cooked dishes."
      },
      meta: {
        en: "Type: soup set · Best for: broth, soup, slow cooking"
      }
    },
    {
      id: "pork-loin-ribs",
      active: true,
      featured: false,
      order: 150,
      category: "pork",
      price: 6.5,
      priceSource: "client",
      unit: "kg",
      image: "assets/products/pork-loin-ribs-v2.webp",
      name: {
        en: "Pork loin ribs",
        lv: "Cūkgaļas ribas"
      },
      description: {
        en: "Pork loin ribs suitable for roasting, oven dishes, grilling and BBQ meals."
      },
      meta: {
        en: "Cut: loin ribs · Best for: oven, grill, BBQ"
      }
    },
    {
      id: "minced-pork",
      active: true,
      featured: false,
      order: 160,
      category: "pork",
      price: 5.5,
      priceSource: "client",
      unit: "kg",
      variants: [
        { id: "500g", label: { en: "500 g" }, multiplier: 0.5 },
        { id: "1kg", label: { en: "1 kg" }, multiplier: 1 }
      ],
      image: "assets/products/minced-pork.png",
      name: {
        en: "Minced pork"
      },
      description: {
        en: "Minced pork for meatballs, sauces, stuffed dishes and everyday cooking."
      },
      meta: {
        en: "Type: minced meat · Best for: meatballs, sauces, fillings"
      }
    },

    {
      id: "beef-ribs",
      active: true,
      featured: false,
      order: 10,
      category: "beef",
      price: 8,
      priceSource: "client",
      unit: "kg",
      image: "assets/products/beef-ribs.png",
      name: {
        en: "Beef ribs / brisket"
      },
      description: {
        en: "Fresh beef ribs or brisket, suitable for slow cooking, soups and roasting."
      },
      meta: {
        en: "Typical use: slow cooking, soups, roasting"
      }
    },
    {
      id: "beef-stew-meat",
      active: true,
      featured: false,
      order: 20,
      category: "beef",
      price: 16,
      priceSource: "client",
      unit: "kg",
      image: "assets/products/beef-leg-v2.webp",
      name: {
        en: "Beef leg"
      },
      description: {
        en: "Lean beef leg cut, suitable for roasting, stews and sliced meat dishes."
      },
      meta: {
        en: "Typical use: roasting, stews, slicing"
      }
    },
    {
      id: "beef-steak-cuts",
      active: true,
      featured: false,
      order: 30,
      category: "beef",
      price: 20,
      priceSource: "client",
      unit: "kg",
      image: "assets/products/beef-loin-whole-v2.webp",
      name: {
        en: "Beef loin / steak cut"
      },
      description: {
        en: "Quality beef cut suitable for steaks, grilling and pan cooking."
      },
      meta: {
        en: "Typical use: steaks, grilling, pan cooking"
      }
    },
    {
      id: "beef-shoulder-with-bone",
      active: true,
      featured: false,
      order: 40,
      category: "beef",
      price: 12,
      priceSource: "client",
      unit: "kg",
      image: "assets/products/beef-shoulder-with-bone-v2.webp",
      name: {
        en: "Beef shoulder with bone"
      },
      description: {
        en: "Beef shoulder with bone, suitable for slow cooking, broth and hearty meals."
      },
      meta: {
        en: "Typical use: slow cooking, broth, stews"
      }
    },
    {
      id: "minced-beef",
      active: true,
      featured: false,
      order: 50,
      category: "beef",
      price: 8.5,
      priceSource: "client",
      unit: "kg",
      variants: [
        { id: "500g", label: { en: "500 g" }, multiplier: 0.5 },
        { id: "1kg", label: { en: "1 kg" }, multiplier: 1 }
      ],
      image: "assets/products/minced-beef.png",
      name: {
        en: "Minced beef"
      },
      description: {
        en: "Fresh minced beef for burgers, meatballs, sauces and everyday cooking."
      },
      meta: {
        en: "Typical use: burgers, meatballs, sauces"
      }
    },

    {
      id: "chicken-breast",
      active: true,
      featured: true,
      featuredOrder: 30,
      order: 10,
      category: "chicken",
      price: 8.5,
      priceSource: "client",
      unit: "kg",
      image: "assets/products/chicken-breast.png",
      name: {
        en: "Chicken fillet"
      },
      description: {
        en: "Lean chicken fillet for simple meals, pan cooking, salads and oven dishes."
      },
      featuredDescription: {
        en: "Lean chicken fillet for everyday cooking, meal prep and family dishes."
      },
      meta: {
        en: "Typical use: pan cooking, salads, oven dishes"
      }
    },
    {
      id: "skinless-chicken-gyros",
      active: true,
      featured: false,
      order: 20,
      category: "chicken",
      price: 7,
      priceSource: "client",
      unit: "kg",
      image: "assets/products/skinless-chicken-gyros-v2.webp",
      name: {
        en: "Skinless chicken gyros"
      },
      description: {
        en: "Skinless chicken gyros-style meat, suitable for quick frying, wraps and grilled dishes."
      },
      meta: {
        en: "Typical use: frying, wraps, grilling"
      }
    },
    {
      id: "chicken-thighs",
      active: true,
      featured: false,
      order: 30,
      category: "chicken",
      price: 5.5,
      priceSource: "client",
      unit: "kg",
      image: "assets/products/chicken-thighs.png",
      name: {
        en: "Chicken thighs with bone"
      },
      description: {
        en: "Chicken thighs with bone, suitable for roasting, grilling and slow cooking."
      },
      meta: {
        en: "Typical use: roasting, grilling, slow cooking"
      }
    },
    {
      id: "chicken-drumsticks",
      active: true,
      featured: false,
      order: 40,
      category: "chicken",
      price: 4.5,
      priceSource: "client",
      unit: "kg",
      image: "assets/products/chicken-drumsticks.png",
      name: {
        en: "Chicken drumsticks"
      },
      description: {
        en: "Chicken drumsticks for oven trays, grilling and everyday family meals."
      },
      meta: {
        en: "Typical use: oven trays, grilling, family meals"
      }
    },
    {
      id: "whole-chicken",
      active: true,
      featured: false,
      order: 50,
      category: "chicken",
      price: 5,
      priceSource: "client",
      unit: "kg",
      image: "assets/products/whole-chicken.png",
      name: {
        en: "Whole chicken"
      },
      description: {
        en: "Whole chicken suitable for roasting, soup, broth and family meals."
      },
      meta: {
        en: "Typical use: roasting, soup, broth"
      }
    },

    {
      id: "marinated-pork-neck",
      active: true,
      available: false,
      featured: false,
      order: 10,
      category: "bbq",
      price: 8.99,
      priceSource: "indicative",
      unit: "kg",
      image: "assets/products/marinated-pork-neck.png",
      name: {
        en: "Marinated pork neck"
      },
      description: {
        en: "Marinated pork neck for juicy grilled steaks and BBQ meals."
      },
      meta: {
        en: "Typical use: BBQ, grill, weekend meals"
      }
    },
    {
      id: "bbq-ribs",
      active: true,
      available: false,
      featured: true,
      featuredOrder: 40,
      order: 20,
      category: "bbq",
      price: 9.9,
      priceSource: "indicative",
      unit: "kg",
      image: "assets/products/bbq-ribs.png",
      name: {
        en: "BBQ ribs"
      },
      description: {
        en: "BBQ-prepared ribs for oven cooking, grilling and family meals."
      },
      featuredDescription: {
        en: "Ribs for grill, oven or BBQ-style meals."
      },
      meta: {
        en: "Typical use: BBQ, oven, grill"
      }
    },
    {
      id: "grill-sausages",
      active: true,
      available: false,
      featured: false,
      order: 30,
      category: "bbq",
      price: 8.9,
      priceSource: "indicative",
      unit: "kg",
      image: "assets/products/grill-sausages.png",
      name: {
        en: "Grill sausages"
      },
      description: {
        en: "Sausages suitable for grilling, quick meals and outdoor gatherings."
      },
      meta: {
        en: "Typical use: grill, BBQ, quick meals"
      }
    },
    {
      id: "chicken-skewers",
      active: true,
      available: false,
      featured: false,
      order: 40,
      category: "bbq",
      price: 8.5,
      priceSource: "indicative",
      unit: "kg",
      image: "assets/products/chicken-skewers.png",
      name: {
        en: "Chicken skewers"
      },
      description: {
        en: "Chicken skewers for grilling, BBQ meals and easy outdoor cooking."
      },
      meta: {
        en: "Typical use: BBQ, grill, gatherings"
      }
    },

    {
      id: "family-meat-box",
      active: true,
      available: false,
      featured: false,
      order: 10,
      category: "boxes",
      price: 36.5,
      priceSource: "client",
      unit: "box",
      image: "assets/products/large-meat-box-client.jpg",
      name: {
        en: "Large Meat Box",
        lv: "Lielais gaļas komplekts",
        ru: "Большой мясной набор"
      },
      description: {
        en: "500 g minced pork, 500 g beef for soup, 1 kg pork neck, 1 kg beef leg and 500 g chicken fillet.",
        lv: "500 g maltās cūkgaļas, 500 g liellopa gaļas zupai, 1 kg cūkgaļas kakla karbonādes, 1 kg liellopa šķiņķa un 500 g vistas filejas.",
        ru: "500 г свиного фарша, 500 г говядины для супа, 1 кг свиной шеи, 1 кг говяжьего окорока и 500 г куриного филе."
      },
      meta: {
        en: ""
      }
    },
    {
      id: "bbq-box",
      active: true,
      available: false,
      featured: false,
      order: 20,
      category: "boxes",
      price: 18.75,
      priceSource: "client",
      unit: "box",
      image: "assets/products/small-meat-box-client.jpg",
      name: {
        en: "Small Meat Box",
        lv: "Mazais gaļas komplekts",
        ru: "Малый мясной набор"
      },
      description: {
        en: "500 g minced pork, 500 g chicken fillet, 500 g beef leg and 500 g pork neck.",
        lv: "500 g maltās cūkgaļas, 500 g vistas filejas, 500 g liellopa šķiņķa un 500 g cūkgaļas kakla karbonādes.",
        ru: "500 г свиного фарша, 500 г куриного филе, 500 г говяжьего окорока и 500 г свиной шеи."
      },
      meta: {
        en: ""
      }
    },
    {
      id: "pork-box",
      active: true,
      available: false,
      featured: false,
      order: 30,
      category: "boxes",
      price: 0,
      hidePrice: true,
      priceSource: "client",
      unit: "box",
      image: "assets/products/choose-your-own-box-client.jpg",
      name: {
        en: "Choose Your Own",
        lv: "Izvēlies pats",
        ru: "Выберите сами"
      },
      description: {
        en: "Choose the products for your own personalised meat box.",
        lv: "Izvēlieties produktus savam individuālajam gaļas komplektam.",
        ru: "Выберите продукты для своего индивидуального мясного набора."
      },
      meta: {
        en: ""
      }
    },
    {
      id: "chicken-box",
      active: false,
      featured: false,
      order: 40,
      category: "boxes",
      price: 29,
      priceSource: "indicative",
      unit: "box",
      image: "assets/products/chicken-box.png",
      name: {
        en: "Chicken Box"
      },
      description: {
        en: "A chicken-focused selection for simple meals. Usually includes chicken breast, thighs, wings and drumsticks, depending on availability."
      },
      meta: {
        en: "Typical use: quick meals, family cooking"
      }
    }
  ]
};
