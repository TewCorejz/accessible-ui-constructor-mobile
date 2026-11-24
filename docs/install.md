# Установка тестовой версии

Задача: [#5](https://github.com/TewCorejz/accessible-ui-constructor-mobile/issues/5)

Есть три способа попробовать приложение — от самого простого к «настоящему».

## 1. Expo Go (для команды, без сборки)

Нужны компьютер с проектом и телефон в одной Wi-Fi сети.

1. Установите **Expo Go**: [App Store](https://apps.apple.com/app/expo-go/id982107779) / [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent).
2. На компьютере: `npm install && npx expo start`.
3. Отсканируйте QR-код из терминала камерой iPhone или приложением Expo Go на Android.

## 2. Тестовая сборка (для заказчика и тестировщиков)

Обычное приложение с иконкой «Конструктор», работает без компьютера. Собирается в облаке Expo (EAS).

### Android — файл APK

Ссылку на последнюю сборку команда публикует в [Releases](https://github.com/TewCorejz/accessible-ui-constructor-mobile/releases) или присылает напрямую.

1. Откройте ссылку на телефоне и скачайте `.apk`.
2. Разрешите установку из этого источника, когда Android спросит.
3. Установите и откройте «Конструктор».

### iPhone

- **TestFlight** — нужен платный аккаунт Apple Developer (99 $ в год). Тестировщик устанавливает TestFlight из App Store и принимает приглашение по почте.
- **Ad Hoc (без TestFlight)** — тоже нужен Apple Developer; устройство тестировщика заранее регистрируется командой (`eas device:create`).

## 3. Как собрать (для команды)

Один раз:

```bash
npm install -g eas-cli
eas login            # аккаунт Expo, бесплатный: https://expo.dev/signup
eas init             # привяжет проект к аккаунту, добавит projectId в app.json
```

Сборки:

| Команда | Что получится |
|---|---|
| `npm run build:android` | APK для установки на любой Android (профиль `preview`) |
| `npm run build:ios-sim` | Сборка для iOS-симулятора — без аккаунта Apple |
| `npm run build:ios` | Сборка для iPhone — нужен Apple Developer |
| `eas build --profile production --platform all` | Сборки для App Store и Google Play |

Профили описаны в [`eas.json`](../eas.json). Бесплатный тариф Expo даёт ограниченное число облачных сборок в месяц — для тестовых раздач этого достаточно.
