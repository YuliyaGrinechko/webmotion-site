# WebMotion Agency

Сайт webmotion.com.ua. Статичний HTML/CSS/JS, без збірки.

Кожен push у `main` автоматично заливається на хостинг ukraine.com.ua через SSH/rsync (`.github/workflows/deploy.yml`).
Доступи зберігаються в Settings → Secrets and variables → Actions: `SSH_HOST`, `SSH_PORT`, `SSH_USER`, `SSH_PASSWORD`, `SSH_PATH`.
