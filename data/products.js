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
  schemaVersion: 1,
  defaultLanguage: "en",

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
      image: "assets/products/pork-loin-without-rib-skinless.png",
      name: { en: "Pork loin without rib, skinless" },
      description: {
        en: "Lean pork loin without rib and without skin, suitable for slices, roasting and everyday cooking."
      },
      meta: { en: "Cut: loin · Best for: roasting, slicing, pan cooking" }
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
      image: "assets/products/pork-loin-with-fat-and-skin.png",
      name: { en: "Pork loin with fat and skin" },
      description: {
        en: "Pork loin with fat and skin, useful for juicy roasts and traditional home cooking."
      },
      meta: { en: "Cut: loin · Best for: roasting, oven cooking" }
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
      image: "assets/products/pork-neck.png",
      name: { en: "Pork neck" },
      description: {
        en: "Juicy pork neck with good marbling, suitable for grilling, roasting and steaks."
      },
      featuredDescription: {
        en: "Juicy pork neck, suitable for roasting, grilling and slow cooking."
      },
      meta: { en: "Cut: neck · Best for: BBQ, steak, roast" }
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
      image: "assets/products/pork-tenderloin.png",
      name: { en: "Pork tenderloin" },
      description: {
        en: "Tender pork cut for quick cooking, pan dishes and special meals."
      },
      featuredDescription: {
        en: "Tender pork fillet for premium home cooking and quick meals."
      },
      meta: { en: "Cut: tenderloin · Best for: quick meals, pan cooking" }
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
      image: "assets/products/pork-ham-piece-skinless.png",
      name: { en: "Pork ham piece, skinless" },
      description: {
        en: "Skinless pork ham piece for roasting, stews and sliced home meals."
      },
      meta: { en: "Cut: ham · Best for: roasting, stews" }
    },
    {
      id: "pork-ham-piece-with-skin",
      active: true,
      featured: false,
      order: 60,
      category: "pork",
      price: 6,
      priceSource: "client",
      unit: "kg",
      image: "assets/products/pork-ham-piece-with-skin.png",
      name: { en: "Pork ham piece with skin" },
      description: {
        en: "Pork ham piece with skin, suitable for traditional roasting and slow cooking."
      },
      meta: { en: "Cut: ham · Best for: roast, slow cooking" }
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
      name: { en: "Boneless pork ham with skin" },
      description: {
        en: "Boneless pork ham with skin, practical for roasts and larger family meals."
      },
      meta: { en: "Cut: ham · Best for: oven roasting, family meals" }
    },
    {
      id: "boneless-pork-ham-skinless",
      active: true,
      featured: false,
      order: 80,
      category: "pork",
      price: 5.7,
      priceSource: "client",
      unit: "kg",
      image: "assets/products/boneless-pork-ham-skinless.png",
      name: { en: "Boneless pork ham, skinless" },
      description: {
        en: "Skinless boneless pork ham for clean preparation, roasts and slicing."
      },
      meta: { en: "Cut: ham · Best for: roast, slicing" }
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
      image: "assets/products/pork-belly-with-rib.png",
      name: { en: "Pork belly with rib" },
      description: {
        en: "Pork belly with rib, suitable for roasting, BBQ and slow-cooked dishes."
      },
      meta: { en: "Cut: belly with rib · Best for: BBQ, roasting, slow cooking" }
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
      image: "assets/products/pork-belly.png",
      name: { en: "Pork belly" },
      description: {
        en: "Classic pork belly for roasting, frying and traditional home dishes."
      },
      meta: { en: "Cut: belly · Best for: oven, frying, slow cooking" }
    },
    {
      id: "pork-ribs-with-skin-and-fat",
      active: true,
      featured: false,
      order: 110,
      category: "pork",
      price: 7,
      priceSource: "client",
      unit: "kg",
      image: "assets/products/pork-ribs-with-skin-and-fat.png",
      name: { en: "Pork ribs with skin and fat" },
      description: {
        en: "Pork ribs with skin and fat, good for rich oven dishes and BBQ-style meals."
      },
      meta: { en: "Cut: ribs · Best for: oven, BBQ cooking" }
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
      name: { en: "Pork shoulder with bone and skin" },
      description: {
        en: "Pork shoulder with bone and skin, suitable for slow cooking, soups and traditional meals."
      },
      meta: { en: "Cut: shoulder · Best for: slow cooking, roast, soup" }
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
      name: { en: "Boneless pork shoulder, skinless" },
      description: {
        en: "Skinless boneless pork shoulder for roasts, pulled pork-style cooking and home meals."
      },
      meta: { en: "Cut: shoulder · Best for: stews, slow cooking" }
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
      name: { en: "Pork shanks" },
      description: {
        en: "Pork shanks for soups, slow cooking and rich traditional dishes."
      },
      meta: { en: "Cut: shanks · Best for: soups, slow cooking" }
    },
    {
      id: "pork-ribs",
      active: true,
      featured: false,
      order: 150,
      category: "pork",
      price: 1.5,
      priceSource: "client",
      unit: "kg",
      image: "assets/products/pork-ribs.png",
      name: { en: "Pork ribs" },
      description: {
        en: "Pork ribs for soups, oven dishes and slow-cooked meals."
      },
      meta: { en: "Cut: ribs · Best for: soups, slow cooking" }
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
      name: { en: "Minced pork" },
      description: {
        en: "Minced pork for meatballs, sauces, stuffed dishes and everyday cooking."
      },
      meta: { en: "Type: minced meat · Best for: meatballs, sauces, fillings" }
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
      name: { en: "Beef ribs / brisket" },
      description: {
        en: "Fresh beef ribs or brisket, suitable for slow cooking, soups and roasting."
      },
      meta: { en: "Typical use: slow cooking, soups, roasting" }
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
      image: "assets/products/beef-stew-meat.png",
      name: { en: "Beef leg" },
      description: {
        en: "Lean beef leg cut, suitable for roasting, stews and sliced meat dishes."
      },
      meta: { en: "Typical use: roasting, stews, slicing" }
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
      image: "assets/products/beef-steak-cuts.png",
      name: { en: "Beef loin / steak cut" },
      description: {
        en: "Quality beef cut suitable for steaks, grilling and pan cooking."
      },
      meta: { en: "Typical use: steaks, grilling, pan cooking" }
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
      image: "assets/products/beef-shoulder-with-bone.png",
      name: { en: "Beef shoulder with bone" },
      description: {
        en: "Beef shoulder with bone, suitable for slow cooking, broth and hearty meals."
      },
      meta: { en: "Typical use: slow cooking, broth, stews" }
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
      name: { en: "Minced beef" },
      description: {
        en: "Fresh minced beef for burgers, meatballs, sauces and everyday cooking."
      },
      meta: { en: "Typical use: burgers, meatballs, sauces" }
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
      name: { en: "Chicken fillet" },
      description: {
        en: "Lean chicken fillet for simple meals, pan cooking, salads and oven dishes."
      },
      featuredDescription: {
        en: "Lean chicken fillet for everyday cooking, meal prep and family dishes."
      },
      meta: { en: "Typical use: pan cooking, salads, oven dishes" }
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
      image: "assets/products/skinless-chicken-gyros.png",
      name: { en: "Skinless chicken gyros" },
      description: {
        en: "Skinless chicken gyros-style meat, suitable for quick frying, wraps and grilled dishes."
      },
      meta: { en: "Typical use: frying, wraps, grilling" }
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
      name: { en: "Chicken thighs with bone" },
      description: {
        en: "Chicken thighs with bone, suitable for roasting, grilling and slow cooking."
      },
      meta: { en: "Typical use: roasting, grilling, slow cooking" }
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
      name: { en: "Chicken drumsticks" },
      description: {
        en: "Chicken drumsticks for oven trays, grilling and everyday family meals."
      },
      meta: { en: "Typical use: oven trays, grilling, family meals" }
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
      name: { en: "Whole chicken" },
      description: {
        en: "Whole chicken suitable for roasting, soup, broth and family meals."
      },
      meta: { en: "Typical use: roasting, soup, broth" }
    },

    {
      id: "marinated-pork-neck",
      active: true,
      featured: false,
      order: 10,
      category: "bbq",
      price: 8.99,
      priceSource: "indicative",
      unit: "kg",
      image: "assets/products/marinated-pork-neck.png",
      name: { en: "Marinated pork neck" },
      description: {
        en: "Marinated pork neck for juicy grilled steaks and BBQ meals."
      },
      meta: { en: "Typical use: BBQ, grill, weekend meals" }
    },
    {
      id: "bbq-ribs",
      active: true,
      featured: true,
      featuredOrder: 40,
      order: 20,
      category: "bbq",
      price: 9.9,
      priceSource: "indicative",
      unit: "kg",
      image: "assets/products/bbq-ribs.png",
      name: { en: "BBQ ribs" },
      description: {
        en: "BBQ-prepared ribs for oven cooking, grilling and family meals."
      },
      featuredDescription: {
        en: "Ribs for grill, oven or BBQ-style meals."
      },
      meta: { en: "Typical use: BBQ, oven, grill" }
    },
    {
      id: "grill-sausages",
      active: true,
      featured: false,
      order: 30,
      category: "bbq",
      price: 8.9,
      priceSource: "indicative",
      unit: "kg",
      image: "assets/products/grill-sausages.png",
      name: { en: "Grill sausages" },
      description: {
        en: "Sausages suitable for grilling, quick meals and outdoor gatherings."
      },
      meta: { en: "Typical use: grill, BBQ, quick meals" }
    },
    {
      id: "chicken-skewers",
      active: true,
      featured: false,
      order: 40,
      category: "bbq",
      price: 8.5,
      priceSource: "indicative",
      unit: "kg",
      image: "assets/products/chicken-skewers.png",
      name: { en: "Chicken skewers" },
      description: {
        en: "Chicken skewers for grilling, BBQ meals and easy outdoor cooking."
      },
      meta: { en: "Typical use: BBQ, grill, gatherings" }
    },

    {
      id: "family-meat-box",
      active: true,
      featured: false,
      order: 10,
      category: "boxes",
      price: 49,
      priceSource: "indicative",
      unit: "box",
      image: "assets/products/family-meat-box.png",
      name: { en: "Family Meat Box" },
      description: {
        en: "A mixed family selection for weekly cooking. Usually includes pork cuts, chicken pieces, minced meat and grill-friendly items, depending on availability."
      },
      meta: { en: "Typical use: family meals, weekly cooking" }
    },
    {
      id: "bbq-box",
      active: true,
      featured: false,
      order: 20,
      category: "boxes",
      price: 45,
      priceSource: "indicative",
      unit: "box",
      image: "assets/products/bbq-box.png",
      name: { en: "BBQ Box" },
      description: {
        en: "A ready-to-grill selection for weekends and gatherings. Usually includes marinated pork neck, BBQ ribs, grill sausages and chicken skewers, depending on availability."
      },
      meta: { en: "Typical use: BBQ, grill, gatherings" }
    },
    {
      id: "pork-box",
      active: true,
      featured: false,
      order: 30,
      category: "boxes",
      price: 35,
      priceSource: "indicative",
      unit: "box",
      image: "assets/products/pork-box.png",
      name: { en: "Pork Box" },
      description: {
        en: "A pork-focused selection for home cooking. Usually includes pork shoulder, pork belly, ribs, pork loin and minced pork, depending on availability."
      },
      meta: { en: "Typical use: pork dishes, stews, roasts" }
    },
    {
      id: "chicken-box",
      active: true,
      featured: false,
      order: 40,
      category: "boxes",
      price: 29,
      priceSource: "indicative",
      unit: "box",
      image: "assets/products/chicken-box.png",
      name: { en: "Chicken Box" },
      description: {
        en: "A chicken-focused selection for simple meals. Usually includes chicken breast, thighs, wings and drumsticks, depending on availability."
      },
      meta: { en: "Typical use: quick meals, family cooking" }
    }
  ]
};
