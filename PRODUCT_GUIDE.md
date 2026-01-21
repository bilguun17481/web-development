# 📦 Návod na přidávání produktů

## 🎯 Jak přidat nový produkt

### Krok 1: Upravte `assets/data/products.json`

Otevřete soubor a přidejte nový produkt do pole `products`:

```json
{
  "id": "pro17144",              // Unikátní ID (kód produktu)
  "name": "Název produktu",      // Celý název
  "category": "kategorie-slug",  // Slug kategorie (malými písmeny, bez diakritiky)
  "categoryName": "Kategorie",   // Zobrazovaný název kategorie
  "price": 1990,                 // Cena (číslo bez mezer)
  "oldPrice": null,              // Stará cena (pokud je sleva) nebo null
  "currency": "Kč",              // Měna
  "inStock": true,               // true = skladem, false = vyprodáno
  "stockQuantity": 10,           // Počet kusů na skladě
  "sku": "PRO17144",             // Kód produktu (SKU)
  "brand": "Značka",             // Výrobce/značka
  "shortDescription": "Krátký popis do 150 znaků",
  "description": "Dlouhý detailní popis produktu...",
  "specifications": {            // Technické parametry
    "parametr1": "hodnota1",
    "parametr2": "hodnota2"
  },
  "images": [                    // Obrázky produktu
    "/assets/images/products/pro17144-1.jpg",
    "/assets/images/products/pro17144-2.jpg"
  ],
  "badges": ["new"],             // Štítky: "new", "-20%", "sale"
  "rating": 4.5,                 // Hodnocení 0-5
  "reviewCount": 23,             // Počet hodnocení
  "tags": ["tag1", "tag2"]       // Tagy pro vyhledávání
}
```

### Krok 2: Nahrajte obrázky

1. Vytvořte složku `assets/images/products/`
2. Nahrajte obrázky produktu (doporučená velikost: 800×800px)
3. Pojmenujte je například: `pro17144-1.jpg`, `pro17144-2.jpg`

### Krok 3: Uložte a otestujte

Otevřete stránku `pages/categories.html` v prohlížeči - produkt se automaticky zobrazí!

---

## 📝 Příklad kompletního produktu

```json
{
  "id": "pro17144",
  "name": "Pařák - Kotel na brambory nerezový 65 L",
  "category": "kuchynske-spotrebice",
  "categoryName": "Kuchyňské spotřebiče",
  "price": 2990,
  "oldPrice": 3490,
  "currency": "Kč",
  "inStock": true,
  "stockQuantity": 5,
  "sku": "PRO17144",
  "brand": "Pařák",
  "shortDescription": "Kvalitní nerezový kotel na vaření brambor, guláše a dalších pokrmů.",
  "description": "Profesionální nerezový kotel o objemu 65 litrů je ideální pro přípravu velkých porcí jídla. Vyrobený z kvalitní nerezové oceli, odolný a snadno udržovatelný.",
  "specifications": {
    "Objem": "65 L",
    "Materiál": "Nerezová ocel",
    "Průměr": "45 cm",
    "Výška": "50 cm",
    "Hmotnost": "8 kg"
  },
  "images": [
    "/assets/images/products/pro17144-1.jpg"
  ],
  "badges": ["-14%"],
  "rating": 4.8,
  "reviewCount": 12,
  "tags": ["kotel", "nerez", "vareni", "guláš", "brambory"]
}
```

---

## 🎨 Kategorie (slugy)

Použijte tyto slugy pro kategorie:

- `led-osvetleni` - LED Osvětlení
- `zasuvky-vypinace` - Zásuvky a Vypínače
- `kabely-vodice` - Kabely a Vodiče
- `jistice-chranice` - Jističe a Chrániče
- `instalacni-material` - Instalační materiál
- `naradi` - Nářadí
- `kuchynske-spotrebice` - Kuchyňské spotřebiče

---

## 💡 Tipy

✅ **Používejte kvalitní obrázky** - alespoň 800×800px
✅ **Pište SEO popisy** - kvalitní text pomůže ve vyhledávání
✅ **Vyplňte všechny parametry** - více informací = více prodejů
✅ **Používejte tagy** - pomáhají při vyhledávání
✅ **Pravidelně aktualizujte** - ceny a dostupnost

---

## 🚀 Hromadné přidání produktů

Pokud máte produkty v Excel/CSV, pošlete mi je a převedu je do JSON formátu automaticky!

**Formát CSV:**
```
Kód,Název,Cena,Kategorie,Popis,Skladem
PRO17144,Kotel 65L,2990,Kuchyňské spotřebiče,Popis...,Ano
```
