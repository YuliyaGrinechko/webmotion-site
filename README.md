# WebMotion Agency

Сайт webmotion.com.ua. Статичний HTML/CSS/JS, без збірки.

Кожен push у `main` автоматично заливається на хостинг ukraine.com.ua через FTP (`.github/workflows/deploy.yml`).
Доступи до FTP зберігаються в Settings → Secrets and variables → Actions: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`.
