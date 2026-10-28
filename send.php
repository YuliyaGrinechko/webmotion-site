<?php
// Form handler: sends a request to Telegram (and email as a fallback).
// Secrets live outside the web root in ../form-config.php, written by the deploy workflow.
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo '{"ok":false}'; exit; }

$cfgFile = dirname(__DIR__) . '/form-config.php';
$cfg = is_file($cfgFile) ? include $cfgFile : [];

// Honeypot and basic timing check against bots
if (!empty($_POST['website']) || (isset($_POST['t']) && (time() - (int)$_POST['t'] / 1000) < 3)) { echo '{"ok":true}'; exit; }

function f($k, $max = 2000) { return mb_substr(trim(strip_tags($_POST[$k] ?? '')), 0, $max); }
$name    = f('name', 200);
$contact = f('contact', 200);
$budget  = f('budget', 50);
$message = f('message', 3000);
$need    = isset($_POST['need']) && is_array($_POST['need']) ? implode(', ', array_map(fn($x) => mb_substr(strip_tags($x), 0, 30), $_POST['need'])) : '';
$page    = f('page', 300);

if ($name === '' || $contact === '') { http_response_code(422); echo '{"ok":false,"error":"required"}'; exit; }

$labels = ['site'=>'Сайт','landing'=>'Лендинг','video'=>'AI-відео','edit'=>'Монтаж','bot'=>'Чат-бот','copy'=>'Тексти','course'=>'Платформа курсу'];
$need = implode(', ', array_map(fn($x) => $labels[trim($x)] ?? trim($x), array_filter(explode(',', $need))));
$budgets = ['unknown'=>'Ще не знає','lt100'=>'$40–100','100-300'=>'$100–300','300-1000'=>'$300–1 000','1000-3000'=>'$1 000–3 000','3000-10000'=>'$3 000–10 000','gt10000'=>'$10 000+'];
$budget = $budgets[$budget] ?? $budget;

$text = "🆕 Нова заявка з webmotion.com.ua\n\n"
      . "👤 $name\n"
      . "📨 $contact\n"
      . ($need ? "🎯 $need\n" : '')
      . "💰 $budget\n"
      . ($message ? "\n📝 $message\n" : '')
      . ($page ? "\n🔗 $page" : '');

$sent = false;
if (!empty($cfg['tg_token']) && !empty($cfg['tg_chat'])) {
    $ch = curl_init('https://api.telegram.org/bot' . $cfg['tg_token'] . '/sendMessage');
    curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 10,
        CURLOPT_POSTFIELDS => ['chat_id' => $cfg['tg_chat'], 'text' => $text, 'disable_web_page_preview' => 'true']]);
    $res = json_decode((string)curl_exec($ch), true);
    curl_close($ch);
    $sent = !empty($res['ok']);
}
if (!empty($cfg['mail_to'])) {
    $subject = '=?UTF-8?B?' . base64_encode("Заявка з сайту: $name") . '?=';
    $headers = "Content-Type: text/plain; charset=utf-8\r\nFrom: WebMotion <info@webmotion.com.ua>";
    $sent = mail($cfg['mail_to'], $subject, $text, $headers) || $sent;
}

if (!$sent) { http_response_code(500); echo '{"ok":false,"error":"send"}'; exit; }
echo '{"ok":true}';
