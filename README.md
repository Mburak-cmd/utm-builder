# HAVELSAN UTM Builder

Statik, kurulum gerektirmeyen UTM link oluşturma aracı.

## Özellikler

- Landing URL'den ürün/çözüm eşleştirme
- Product / Solution türü ve kısa kod önerisi
- Source ve Medium dropdown'ları
- Campaign önerisi ve elle düzenleme
- Generate URL, Copy URL ve Clear
- Kayıt tutmaz
- GitHub Pages ile yayınlanabilir

## Dosyalar

- `index.html`: Arayüz
- `style.css`: Görsel tasarım
- `app.js`: UTM ve eşleştirme mantığı
- `mapping.json`: Page Category Structure dosyasından üretilen 84 URL eşlemesi

## GitHub Pages

1. Bu klasörü bir GitHub repository'sine yükleyin.
2. Repository içinde `Settings > Pages` bölümüne gidin.
3. `Deploy from a branch` seçin.
4. Branch olarak `main`, klasör olarak `/root` seçin.
5. Kaydedin.

## Lokal test

Tarayıcı güvenlik kuralları nedeniyle `mapping.json` dosyasının yüklenmesi için klasörü basit bir yerel sunucuyla açın:

```bash
python -m http.server 8000
```

Sonra `http://localhost:8000` adresini açın.
