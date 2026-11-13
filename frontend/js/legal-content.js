/* FuelWise legal texts. Each section is [id, heading, blocks]; a block is a paragraph (string) or a list (array). */
(() => {
    const mail = '<a href="mailto:fuelwise.support@gmail.com">fuelwise.support@gmail.com</a>';

    const labels = {
        en: { updated: "Last updated", toc: "On this page" },
        tr: { updated: "Son güncelleme", toc: "Bu sayfada" },
        ru: { updated: "Обновлено", toc: "На этой странице" },
        zh: { updated: "最后更新", toc: "本页内容" }
    };

    const privacy = {
        en: {
            badge: "Privacy", title: "Privacy", accent: "Policy", pageTitle: "Privacy Policy | FuelWise",
            lead: "What FuelWise collects, why it is needed, and the choices you have over your data.",
            note: `Questions about your data? Write to ${mail}.`,
            sections: [
                ["who", "Who we are", [
                    "FuelWise (fuelwise.com.tr) is a fuel cost calculator and trip planner developed and operated by Selim Eskimumcu in Istanbul, Türkiye. Under the Turkish Personal Data Protection Law No. 6698 (KVKK), he is the data controller.",
                    "This policy explains what we collect, why, and what you can do about it. Some features, such as saving vehicles and trip history, require an account."
                ]],
                ["data", "Data we collect", [
                    [
                        "<strong>Account details:</strong> full name, username, email address and your password. The password is stored only as a one-way hash and is never kept in readable form.",
                        "<strong>Vehicles:</strong> the name, make, model, year, type, fuel type, consumption and tank capacity you enter.",
                        "<strong>Trip history:</strong> start and destination, distance, traffic condition, vehicle name and the fuel and cost estimates of the trips you calculate while signed in.",
                        "<strong>Technical data:</strong> sign-in sessions and limited server logs (time, page requested, response status) with a shortened, hashed identifier derived from your IP address, used to prevent abuse."
                    ],
                    "We do not ask for or store payment details, identity numbers or your live location."
                ]],
                ["use", "How we use your data", [
                    [
                        "To create your account and keep you signed in.",
                        "To save your vehicles and show your recent trips.",
                        "To email verification codes when you reset or change your password or delete your account.",
                        "To protect the service against abuse and excessive automated requests."
                    ],
                    "We do not sell your data, show advertising, or build marketing profiles."
                ]],
                ["basis", "Legal basis", [
                    "We process account, vehicle and trip data because it is necessary to provide the service you asked for (KVKK Art. 5/2-c). Security logging relies on our legitimate interest in keeping the service safe (KVKK Art. 5/2-f). Where the GDPR applies to you, the equivalent bases are Art. 6(1)(b) and 6(1)(f)."
                ]],
                ["third", "Third-party services", [
                    "FuelWise relies on a few external services. When your browser contacts them they receive your IP address and the request itself:",
                    [
                        "<strong>OpenStreetMap</strong> for map tiles.",
                        "<strong>Nominatim</strong> for address search: the text you type and the points you pick on the map.",
                        "<strong>OSRM</strong> for driving routes: the coordinates of your start and destination.",
                        "<strong>Google Fonts, cdnjs and unpkg</strong> for fonts and open-source libraries.",
                        "<strong>Cloudflare</strong> for DNS, and our hosting and email providers to run the site and deliver verification emails."
                    ],
                    "Fuel prices are fetched from EPDK by our own server, so no personal data is sent for that. Some of these providers are located outside Türkiye."
                ]],
                ["cookies", "Cookies and local storage", [
                    "FuelWise only uses storage that is necessary for the site to work:",
                    [
                        "<strong>access_token</strong> (cookie, 15 minutes) and <strong>refresh_token</strong> (cookie, 30 days): keep you signed in. Both are HttpOnly, so scripts cannot read them.",
                        "<strong>fuelwise-language</strong> (local storage): remembers the language you chose.",
                        "<strong>fuelwise-consent</strong> (local storage): remembers your cookie choice."
                    ],
                    'We do not use advertising or analytics cookies today. If analytics are ever added, they will run only if you allow them. You can review your choice at any time through <a href="#" data-cookie-settings>Cookie Preferences</a>.'
                ]],
                ["retention", "How long we keep data", [
                    "Account, vehicle and trip data is kept for as long as your account exists. Deleting your account from the Profile page permanently removes your account, vehicles and trip history.",
                    "Verification codes expire after 10 minutes. Server logs and database backups are kept for a limited period and then deleted."
                ]],
                ["rights", "Your rights", [
                    "Under KVKK Art. 11 you can ask whether your data is processed, request a copy, have it corrected or deleted, and object to processing. You can also delete your account yourself at any time from your Profile.",
                    `To use these rights, write to ${mail}. We answer within 30 days. You also have the right to lodge a complaint with the Turkish Personal Data Protection Authority (KVKK).`
                ]],
                ["security", "Security", [
                    "Passwords are hashed with Argon2, connections are encrypted with HTTPS, sign-in cookies are HttpOnly, and request rate limiting is in place. No online service can promise absolute security, but we work to protect your data and will tell you about any breach that affects you."
                ]],
                ["changes", "Changes and contact", [
                    `We may update this policy as FuelWise evolves; the date at the top shows the latest version. For anything related to privacy, contact ${mail}.`
                ]]
            ]
        },
        tr: {
            badge: "Gizlilik", title: "Gizlilik", accent: "Politikası", pageTitle: "Gizlilik Politikası | FuelWise",
            lead: "FuelWise hangi verileri topluyor, neden gerekli ve verileriniz üzerinde hangi seçeneklere sahipsiniz.",
            note: `Verilerinizle ilgili sorularınız mı var? ${mail} adresine yazın.`,
            sections: [
                ["who", "Biz kimiz", [
                    "FuelWise (fuelwise.com.tr), İstanbul'da Selim Eskimumcu tarafından geliştirilen ve işletilen bir yakıt maliyeti hesaplayıcı ve yolculuk planlayıcıdır. 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında veri sorumlusu kendisidir.",
                    "Bu politika hangi verileri neden topladığımızı ve bu konuda neler yapabileceğinizi açıklar. Araç kaydetme ve yolculuk geçmişi gibi bazı özellikler hesap gerektirir."
                ]],
                ["data", "Topladığımız veriler", [
                    [
                        "<strong>Hesap bilgileri:</strong> ad soyad, kullanıcı adı, e-posta adresi ve şifreniz. Şifre yalnızca tek yönlü özet (hash) olarak saklanır, okunabilir biçimde tutulmaz.",
                        "<strong>Araçlar:</strong> girdiğiniz araç adı, marka, model, yıl, tür, yakıt türü, tüketim ve depo kapasitesi.",
                        "<strong>Yolculuk geçmişi:</strong> oturum açıkken hesapladığınız yolculukların başlangıç ve varış noktası, mesafesi, trafik koşulu, araç adı ile yakıt ve maliyet tahminleri.",
                        "<strong>Teknik veriler:</strong> oturum kayıtları ve sınırlı sunucu günlükleri (zaman, istenen sayfa, yanıt durumu). Kötüye kullanımı önlemek için IP adresinizden türetilen kısaltılmış, özetlenmiş bir tanımlayıcı kullanılır."
                    ],
                    "Ödeme bilgisi, kimlik numarası veya anlık konum bilgisi istemiyor ve saklamıyoruz."
                ]],
                ["use", "Verilerinizi nasıl kullanıyoruz", [
                    [
                        "Hesabınızı oluşturmak ve oturumunuzu açık tutmak için.",
                        "Araçlarınızı kaydetmek ve son yolculuklarınızı göstermek için.",
                        "Şifre sıfırlama, şifre değiştirme veya hesap silme işlemlerinde doğrulama kodu göndermek için.",
                        "Hizmeti kötüye kullanıma ve aşırı otomatik isteklere karşı korumak için."
                    ],
                    "Verilerinizi satmıyor, reklam göstermiyor ve pazarlama profili oluşturmuyoruz."
                ]],
                ["basis", "Hukuki sebep", [
                    "Hesap, araç ve yolculuk verilerini, talep ettiğiniz hizmeti sunabilmek için gerekli olduğundan işliyoruz (KVKK m. 5/2-c). Güvenlik günlükleri, hizmeti güvende tutmaya yönelik meşru menfaatimize dayanır (KVKK m. 5/2-f). GDPR'ın size uygulandığı durumlarda karşılık gelen dayanaklar m. 6(1)(b) ve 6(1)(f)'dir."
                ]],
                ["third", "Üçüncü taraf hizmetler", [
                    "FuelWise birkaç dış hizmetten yararlanır. Tarayıcınız bu hizmetlere bağlandığında IP adresiniz ve isteğin kendisi onlara ulaşır:",
                    [
                        "<strong>OpenStreetMap:</strong> harita görselleri.",
                        "<strong>Nominatim:</strong> adres arama; yazdığınız metin ve haritada seçtiğiniz noktalar.",
                        "<strong>OSRM:</strong> sürüş rotaları; başlangıç ve varış noktanızın koordinatları.",
                        "<strong>Google Fonts, cdnjs ve unpkg:</strong> yazı tipleri ve açık kaynak kütüphaneler.",
                        "<strong>Cloudflare:</strong> DNS; ayrıca siteyi çalıştırmak ve doğrulama e-postalarını iletmek için barındırma ve e-posta sağlayıcılarımız."
                    ],
                    "Yakıt fiyatları EPDK'den kendi sunucumuz tarafından alınır; bunun için kişisel veri gönderilmez. Bu sağlayıcıların bir kısmı Türkiye dışındadır."
                ]],
                ["cookies", "Çerezler ve yerel depolama", [
                    "FuelWise yalnızca sitenin çalışması için zorunlu olan depolamayı kullanır:",
                    [
                        "<strong>access_token</strong> (çerez, 15 dakika) ve <strong>refresh_token</strong> (çerez, 30 gün): oturumunuzu açık tutar. İkisi de HttpOnly'dir; betikler bunları okuyamaz.",
                        "<strong>fuelwise-language</strong> (yerel depolama): seçtiğiniz dili hatırlar.",
                        "<strong>fuelwise-consent</strong> (yerel depolama): çerez tercihinizi hatırlar."
                    ],
                    'Şu anda reklam veya analitik çerezi kullanmıyoruz. İleride analitik eklenirse yalnızca siz izin verirseniz çalışır. Tercihinizi istediğiniz zaman <a href="#" data-cookie-settings>Çerez Tercihleri</a> üzerinden gözden geçirebilirsiniz.'
                ]],
                ["retention", "Verileri ne kadar saklıyoruz", [
                    "Hesap, araç ve yolculuk verileri hesabınız var olduğu sürece saklanır. Profil sayfasından hesabınızı sildiğinizde hesabınız, araçlarınız ve yolculuk geçmişiniz kalıcı olarak silinir.",
                    "Doğrulama kodları 10 dakika sonra geçersiz olur. Sunucu günlükleri ve veritabanı yedekleri sınırlı bir süre tutulur, ardından silinir."
                ]],
                ["rights", "Haklarınız", [
                    "KVKK m. 11 uyarınca verilerinizin işlenip işlenmediğini öğrenebilir, bir kopyasını isteyebilir, düzeltilmesini veya silinmesini talep edebilir ve işlemeye itiraz edebilirsiniz. Hesabınızı dilediğiniz zaman Profil sayfasından kendiniz de silebilirsiniz.",
                    `Bu haklarınızı kullanmak için ${mail} adresine yazın. 30 gün içinde yanıt veririz. Ayrıca Kişisel Verileri Koruma Kurulu'na şikâyette bulunma hakkınız vardır.`
                ]],
                ["security", "Güvenlik", [
                    "Şifreler Argon2 ile özetlenir, bağlantılar HTTPS ile şifrelenir, oturum çerezleri HttpOnly'dir ve istek sınırlaması uygulanır. Hiçbir çevrimiçi hizmet mutlak güvenlik vaat edemez; yine de verilerinizi korumak için çalışıyoruz ve sizi etkileyen bir ihlal olursa bildiririz."
                ]],
                ["changes", "Değişiklikler ve iletişim", [
                    `FuelWise geliştikçe bu politikayı güncelleyebiliriz; en güncel sürümün tarihi sayfanın başında yer alır. Gizlilikle ilgili her konuda ${mail} adresinden bize ulaşabilirsiniz.`
                ]]
            ]
        },
        ru: {
            badge: "Конфиденциальность", title: "Политика", accent: "конфиденциальности", pageTitle: "Политика конфиденциальности | FuelWise",
            lead: "Какие данные собирает FuelWise, зачем они нужны и как вы можете ими управлять.",
            note: `Вопросы о ваших данных? Напишите на ${mail}.`,
            sections: [
                ["who", "Кто мы", [
                    "FuelWise (fuelwise.com.tr) — калькулятор расходов на топливо и планировщик поездок, который разрабатывает и поддерживает Selim Eskimumcu в Стамбуле, Турция. Согласно турецкому Закону о защите персональных данных № 6698 (KVKK) он является оператором данных.",
                    "Эта политика объясняет, что и зачем мы собираем и что вы можете с этим сделать. Для некоторых функций, например сохранения транспорта и истории поездок, нужен аккаунт."
                ]],
                ["data", "Какие данные мы собираем", [
                    [
                        "<strong>Данные аккаунта:</strong> полное имя, имя пользователя, адрес электронной почты и пароль. Пароль хранится только в виде одностороннего хеша и никогда не хранится в читаемом виде.",
                        "<strong>Транспорт:</strong> введённые вами название, марка, модель, год, тип, вид топлива, расход и объём бака.",
                        "<strong>История поездок:</strong> отправление и назначение, расстояние, дорожная обстановка, название транспорта, оценки топлива и стоимости для поездок, рассчитанных после входа.",
                        "<strong>Технические данные:</strong> сессии входа и ограниченные журналы сервера (время, запрошенная страница, статус ответа) с укороченным хешированным идентификатором, полученным из IP-адреса, для защиты от злоупотреблений."
                    ],
                    "Мы не запрашиваем и не храним платёжные данные, номера документов или ваше текущее местоположение."
                ]],
                ["use", "Как мы используем данные", [
                    [
                        "Чтобы создать аккаунт и сохранять вход.",
                        "Чтобы сохранять транспорт и показывать недавние поездки.",
                        "Чтобы отправлять коды подтверждения при сбросе или смене пароля и удалении аккаунта.",
                        "Чтобы защищать сервис от злоупотреблений и чрезмерных автоматических запросов."
                    ],
                    "Мы не продаём данные, не показываем рекламу и не создаём маркетинговые профили."
                ]],
                ["basis", "Правовое основание", [
                    "Мы обрабатываем данные аккаунта, транспорта и поездок, так как это необходимо для оказания запрошенной вами услуги (KVKK ст. 5/2-c). Журналы безопасности основаны на нашем законном интересе в защите сервиса (KVKK ст. 5/2-f). Если к вам применяется GDPR, соответствующие основания — ст. 6(1)(b) и 6(1)(f)."
                ]],
                ["third", "Сторонние сервисы", [
                    "FuelWise использует несколько внешних сервисов. Когда ваш браузер обращается к ним, они получают ваш IP-адрес и сам запрос:",
                    [
                        "<strong>OpenStreetMap</strong> — плитки карты.",
                        "<strong>Nominatim</strong> — поиск адресов: введённый текст и выбранные на карте точки.",
                        "<strong>OSRM</strong> — маршруты: координаты отправления и назначения.",
                        "<strong>Google Fonts, cdnjs и unpkg</strong> — шрифты и открытые библиотеки.",
                        "<strong>Cloudflare</strong> — DNS, а также наши провайдеры хостинга и почты для работы сайта и доставки писем с кодами."
                    ],
                    "Цены на топливо наш сервер получает от EPDK сам, персональные данные для этого не передаются. Часть этих провайдеров находится за пределами Турции."
                ]],
                ["cookies", "Cookie и локальное хранилище", [
                    "FuelWise использует только хранилище, необходимое для работы сайта:",
                    [
                        "<strong>access_token</strong> (cookie, 15 минут) и <strong>refresh_token</strong> (cookie, 30 дней): сохраняют вход. Оба с флагом HttpOnly, скрипты не могут их прочитать.",
                        "<strong>fuelwise-language</strong> (локальное хранилище): запоминает выбранный язык.",
                        "<strong>fuelwise-consent</strong> (локальное хранилище): запоминает ваш выбор по cookie."
                    ],
                    'Сейчас мы не используем рекламные или аналитические cookie. Если аналитика появится, она будет работать только с вашего разрешения. Изменить выбор можно в любой момент через <a href="#" data-cookie-settings>Настройки cookie</a>.'
                ]],
                ["retention", "Сроки хранения", [
                    "Данные аккаунта, транспорта и поездок хранятся, пока существует аккаунт. Удаление аккаунта на странице профиля навсегда удаляет аккаунт, транспорт и историю поездок.",
                    "Коды подтверждения действуют 10 минут. Журналы сервера и резервные копии базы хранятся ограниченное время и затем удаляются."
                ]],
                ["rights", "Ваши права", [
                    "Согласно ст. 11 KVKK вы можете узнать, обрабатываются ли ваши данные, запросить копию, потребовать исправления или удаления и возразить против обработки. Вы также можете сами удалить аккаунт в профиле в любой момент.",
                    `Чтобы воспользоваться правами, напишите на ${mail}. Мы отвечаем в течение 30 дней. Вы также вправе подать жалобу в турецкий орган по защите персональных данных (KVKK).`
                ]],
                ["security", "Безопасность", [
                    "Пароли хешируются с помощью Argon2, соединения шифруются по HTTPS, cookie входа имеют флаг HttpOnly, действует ограничение частоты запросов. Ни один онлайн-сервис не может обещать абсолютную безопасность, но мы защищаем ваши данные и сообщим о нарушении, которое вас затронет."
                ]],
                ["changes", "Изменения и контакты", [
                    `Мы можем обновлять эту политику по мере развития FuelWise; дата вверху показывает актуальную версию. По любым вопросам конфиденциальности пишите на ${mail}.`
                ]]
            ]
        },
        zh: {
            badge: "隐私", title: "隐私", accent: "政策", pageTitle: "隐私政策 | FuelWise",
            lead: "FuelWise 收集哪些数据、为什么需要，以及您对自己数据的选择。",
            note: `对您的数据有疑问？请写信至 ${mail}。`,
            sections: [
                ["who", "我们是谁", [
                    "FuelWise（fuelwise.com.tr）是一款燃油成本计算与行程规划工具，由 Selim Eskimumcu 在土耳其伊斯坦布尔开发和运营。根据土耳其第 6698 号《个人数据保护法》（KVKK），他是数据控制者。",
                    "本政策说明我们收集什么、为什么收集，以及您可以怎么做。保存车辆和行程记录等部分功能需要账户。"
                ]],
                ["data", "我们收集的数据", [
                    [
                        "<strong>账户信息：</strong>姓名、用户名、电子邮箱和密码。密码仅以单向哈希形式保存，绝不以可读形式存储。",
                        "<strong>车辆：</strong>您输入的名称、品牌、型号、年份、类型、燃料类型、油耗和油箱容量。",
                        "<strong>行程记录：</strong>登录状态下计算的行程的起点和目的地、距离、交通状况、车辆名称以及燃油和费用估算。",
                        "<strong>技术数据：</strong>登录会话和有限的服务器日志（时间、请求页面、响应状态），并使用由 IP 地址生成的截短哈希标识来防止滥用。"
                    ],
                    "我们不索取也不保存支付信息、证件号码或您的实时位置。"
                ]],
                ["use", "我们如何使用数据", [
                    [
                        "创建您的账户并保持登录状态。",
                        "保存您的车辆并显示最近的行程。",
                        "在您重置或更改密码、删除账户时发送验证码邮件。",
                        "保护服务免受滥用和过量自动请求。"
                    ],
                    "我们不出售您的数据，不展示广告，也不建立营销画像。"
                ]],
                ["basis", "法律依据", [
                    "我们处理账户、车辆和行程数据，是因为提供您所请求的服务必须如此（KVKK 第 5/2-c 条）。安全日志基于我们保障服务安全的正当利益（KVKK 第 5/2-f 条）。若 GDPR 适用于您，对应依据为第 6(1)(b) 和 6(1)(f) 条。"
                ]],
                ["third", "第三方服务", [
                    "FuelWise 依赖少量外部服务。当您的浏览器访问它们时，它们会收到您的 IP 地址和请求内容：",
                    [
                        "<strong>OpenStreetMap：</strong>地图图块。",
                        "<strong>Nominatim：</strong>地址搜索，即您输入的文字和在地图上选择的点。",
                        "<strong>OSRM：</strong>驾驶路线，即起点和目的地的坐标。",
                        "<strong>Google Fonts、cdnjs 和 unpkg：</strong>字体和开源库。",
                        "<strong>Cloudflare：</strong>DNS；以及用于运行网站和发送验证邮件的托管与邮件服务商。"
                    ],
                    "燃油价格由我们自己的服务器从 EPDK 获取，不会为此发送个人数据。其中部分服务商位于土耳其境外。"
                ]],
                ["cookies", "Cookie 与本地存储", [
                    "FuelWise 仅使用网站运行所必需的存储：",
                    [
                        "<strong>access_token</strong>（Cookie，15 分钟）和 <strong>refresh_token</strong>（Cookie，30 天）：保持登录状态。两者均为 HttpOnly，脚本无法读取。",
                        "<strong>fuelwise-language</strong>（本地存储）：记住您选择的语言。",
                        "<strong>fuelwise-consent</strong>（本地存储）：记住您的 Cookie 选择。"
                    ],
                    '目前我们不使用广告或分析 Cookie。若日后添加分析功能，仅在您允许时运行。您可以随时通过 <a href="#" data-cookie-settings>Cookie 设置</a>查看或更改选择。'
                ]],
                ["retention", "数据保存期限", [
                    "账户、车辆和行程数据在账户存续期间保存。在个人资料页面删除账户后，您的账户、车辆和行程记录将被永久删除。",
                    "验证码 10 分钟后失效。服务器日志和数据库备份仅保存有限时间，之后删除。"
                ]],
                ["rights", "您的权利", [
                    "根据 KVKK 第 11 条，您可以查询数据是否被处理、索取副本、要求更正或删除，并对处理提出异议。您也可以随时在个人资料中自行删除账户。",
                    `如需行使这些权利，请写信至 ${mail}。我们将在 30 天内答复。您也有权向土耳其个人数据保护机构（KVKK）投诉。`
                ]],
                ["security", "安全", [
                    "密码使用 Argon2 哈希，连接通过 HTTPS 加密，登录 Cookie 为 HttpOnly，并设有请求频率限制。任何在线服务都无法保证绝对安全，但我们会尽力保护您的数据，如发生影响您的泄露会及时告知。"
                ]],
                ["changes", "变更与联系", [
                    `随着 FuelWise 的发展，我们可能更新本政策；页面顶部的日期为最新版本。任何隐私相关事宜，请联系 ${mail}。`
                ]]
            ]
        }
    };

    const terms = {
        en: {
            badge: "Terms", title: "Terms of", accent: "Service", pageTitle: "Terms of Service | FuelWise",
            lead: "The rules for using FuelWise, written to be read in a few minutes.",
            note: `Questions about these terms? Write to ${mail}.`,
            sections: [
                ["accept", "Accepting these terms", [
                    "By using FuelWise (fuelwise.com.tr) or creating an account, you agree to these terms. If you do not agree, please do not use the service."
                ]],
                ["service", "What FuelWise is", [
                    "FuelWise is a free tool that estimates fuel consumption and trip cost, plans routes, stores your vehicles and shows official fuel prices for provinces in Türkiye. It is currently in beta, so features may change."
                ]],
                ["estimates", "Estimates, not guarantees", [
                    "Every figure FuelWise shows is an estimate. Real consumption and cost depend on driving style, traffic, weather, load, tyre pressure and the condition of your vehicle.",
                    [
                        "Fuel prices come from official EPDK records and may differ from the price at a particular station.",
                        "Routes and distances come from OpenStreetMap data and may not reflect closures or road works.",
                        "FuelWise is not a navigation device. Follow traffic rules and road signs, and do not use the site while driving."
                    ]
                ]],
                ["account", "Your account", [
                    [
                        "Give accurate information when you register and keep your email address up to date.",
                        "Keep your password private. You are responsible for activity on your account.",
                        "You must be old enough to enter into a binding agreement, or use the service with a parent or guardian's permission.",
                        "You can delete your account at any time from your Profile."
                    ]
                ]],
                ["use", "Acceptable use", [
                    "Please do not:",
                    [
                        "attempt to access other people's accounts or data;",
                        "overload the service with automated requests, scraping or bots;",
                        "probe, disrupt or bypass security measures;",
                        "use FuelWise for anything unlawful."
                    ]
                ]],
                ["thirdparty", "Third-party data", [
                    "Maps are © OpenStreetMap contributors, routes are calculated with OSRM, address search uses Nominatim, and fuel prices are published by EPDK. These sources have their own terms, and we cannot guarantee that they are always available or accurate."
                ]],
                ["ip", "Intellectual property", [
                    "The FuelWise name, logo, design and software belong to their developer. You may use the site for personal, non-commercial purposes. Please do not copy or redistribute it without permission."
                ]],
                ["liability", "Availability and liability", [
                    "FuelWise is provided \"as is\" and \"as available\". We may change, suspend or discontinue features, and we do not promise uninterrupted service.",
                    "To the extent permitted by law, FuelWise and its developer are not liable for losses arising from reliance on estimates, prices or routes shown on the site. Nothing in these terms limits rights you have under mandatory consumer law."
                ]],
                ["termination", "Suspension", [
                    "We may suspend or close accounts that break these terms or put the service or other users at risk."
                ]],
                ["law", "Governing law", [
                    "These terms are governed by the laws of the Republic of Türkiye. Disputes fall under the jurisdiction of the Istanbul courts and enforcement offices, without prejudice to mandatory consumer protections."
                ]],
                ["changes", "Changes and contact", [
                    `We may update these terms; the date at the top shows the latest version, and continuing to use FuelWise means you accept it. Contact: ${mail}.`
                ]]
            ]
        },
        tr: {
            badge: "Koşullar", title: "Kullanım", accent: "Koşulları", pageTitle: "Kullanım Koşulları | FuelWise",
            lead: "FuelWise'ı kullanmanın kuralları; birkaç dakikada okunacak şekilde yazıldı.",
            note: `Bu koşullarla ilgili sorularınız mı var? ${mail} adresine yazın.`,
            sections: [
                ["accept", "Koşulların kabulü", [
                    "FuelWise'ı (fuelwise.com.tr) kullanarak veya hesap oluşturarak bu koşulları kabul etmiş olursunuz. Kabul etmiyorsanız lütfen hizmeti kullanmayın."
                ]],
                ["service", "FuelWise nedir", [
                    "FuelWise; yakıt tüketimini ve yolculuk maliyetini tahmin eden, rota planlayan, araçlarınızı saklayan ve Türkiye'deki iller için resmî yakıt fiyatlarını gösteren ücretsiz bir araçtır. Şu anda beta aşamasındadır; özellikler değişebilir."
                ]],
                ["estimates", "Tahmindir, garanti değildir", [
                    "FuelWise'ın gösterdiği her değer bir tahmindir. Gerçek tüketim ve maliyet; sürüş tarzına, trafiğe, hava koşullarına, yüke, lastik basıncına ve aracınızın durumuna göre değişir.",
                    [
                        "Yakıt fiyatları resmî EPDK kayıtlarından alınır ve belirli bir istasyondaki fiyattan farklı olabilir.",
                        "Rotalar ve mesafeler OpenStreetMap verilerine dayanır; yol kapanmalarını veya çalışmalarını yansıtmayabilir.",
                        "FuelWise bir navigasyon cihazı değildir. Trafik kurallarına ve yol işaretlerine uyun, araç kullanırken siteyi kullanmayın."
                    ]
                ]],
                ["account", "Hesabınız", [
                    [
                        "Kayıt olurken doğru bilgi verin ve e-posta adresinizi güncel tutun.",
                        "Şifrenizi kimseyle paylaşmayın. Hesabınızdaki işlemlerden siz sorumlusunuz.",
                        "Bağlayıcı bir sözleşme yapabilecek yaşta olmalı veya hizmeti velinizin izniyle kullanmalısınız.",
                        "Hesabınızı dilediğiniz zaman Profil sayfasından silebilirsiniz."
                    ]
                ]],
                ["use", "Kabul edilebilir kullanım", [
                    "Lütfen şunları yapmayın:",
                    [
                        "başkalarının hesaplarına veya verilerine erişmeye çalışmak;",
                        "hizmeti otomatik istekler, veri kazıma veya botlarla aşırı yüklemek;",
                        "güvenlik önlemlerini yoklamak, aksatmak veya aşmaya çalışmak;",
                        "FuelWise'ı hukuka aykırı herhangi bir amaçla kullanmak."
                    ]
                ]],
                ["thirdparty", "Üçüncü taraf verileri", [
                    "Haritalar © OpenStreetMap katkıda bulunanlarına aittir; rotalar OSRM ile hesaplanır, adres araması Nominatim ile yapılır ve yakıt fiyatları EPDK tarafından yayımlanır. Bu kaynakların kendi koşulları vardır; her zaman erişilebilir veya doğru olacaklarını garanti edemeyiz."
                ]],
                ["ip", "Fikrî mülkiyet", [
                    "FuelWise adı, logosu, tasarımı ve yazılımı geliştiricisine aittir. Siteyi kişisel ve ticari olmayan amaçlarla kullanabilirsiniz. Lütfen izinsiz kopyalamayın veya yeniden dağıtmayın."
                ]],
                ["liability", "Erişilebilirlik ve sorumluluk", [
                    "FuelWise \"olduğu gibi\" ve \"mevcut olduğu ölçüde\" sunulur. Özellikleri değiştirebilir, askıya alabilir veya sonlandırabiliriz; kesintisiz hizmet taahhüt etmiyoruz.",
                    "Hukukun izin verdiği ölçüde FuelWise ve geliştiricisi; sitede gösterilen tahminlere, fiyatlara veya rotalara güvenilmesinden doğan zararlardan sorumlu değildir. Bu koşullardaki hiçbir hüküm, emredici tüketici mevzuatından doğan haklarınızı sınırlamaz."
                ]],
                ["termination", "Askıya alma", [
                    "Bu koşulları ihlal eden veya hizmeti ya da diğer kullanıcıları riske atan hesapları askıya alabilir veya kapatabiliriz."
                ]],
                ["law", "Uygulanacak hukuk", [
                    "Bu koşullar Türkiye Cumhuriyeti hukukuna tabidir. Uyuşmazlıklarda, emredici tüketici korumaları saklı kalmak kaydıyla İstanbul mahkemeleri ve icra daireleri yetkilidir."
                ]],
                ["changes", "Değişiklikler ve iletişim", [
                    `Bu koşulları güncelleyebiliriz; en güncel sürümün tarihi sayfanın başında yer alır ve FuelWise'ı kullanmaya devam etmeniz yeni sürümü kabul ettiğiniz anlamına gelir. İletişim: ${mail}.`
                ]]
            ]
        },
        ru: {
            badge: "Условия", title: "Условия", accent: "использования", pageTitle: "Условия использования | FuelWise",
            lead: "Правила использования FuelWise, которые можно прочитать за пару минут.",
            note: `Вопросы об этих условиях? Напишите на ${mail}.`,
            sections: [
                ["accept", "Принятие условий", [
                    "Используя FuelWise (fuelwise.com.tr) или создавая аккаунт, вы соглашаетесь с этими условиями. Если вы не согласны, пожалуйста, не пользуйтесь сервисом."
                ]],
                ["service", "Что такое FuelWise", [
                    "FuelWise — бесплатный инструмент, который оценивает расход топлива и стоимость поездки, планирует маршруты, хранит ваш транспорт и показывает официальные цены на топливо по регионам Турции. Сервис находится в бета-версии, функции могут меняться."
                ]],
                ["estimates", "Оценки, а не гарантии", [
                    "Все значения в FuelWise — это оценки. Реальный расход и стоимость зависят от стиля вождения, трафика, погоды, загрузки, давления в шинах и состояния автомобиля.",
                    [
                        "Цены на топливо берутся из официальных данных EPDK и могут отличаться от цены на конкретной заправке.",
                        "Маршруты и расстояния основаны на данных OpenStreetMap и могут не учитывать перекрытия и ремонт дорог.",
                        "FuelWise не является навигатором. Соблюдайте правила и дорожные знаки и не пользуйтесь сайтом за рулём."
                    ]
                ]],
                ["account", "Ваш аккаунт", [
                    [
                        "Указывайте точные данные при регистрации и поддерживайте актуальность адреса почты.",
                        "Храните пароль в тайне. Вы отвечаете за действия в своём аккаунте.",
                        "Вы должны быть в возрасте, позволяющем заключать договоры, либо пользоваться сервисом с разрешения родителя или опекуна.",
                        "Вы можете удалить аккаунт в любой момент в профиле."
                    ]
                ]],
                ["use", "Допустимое использование", [
                    "Пожалуйста, не следует:",
                    [
                        "пытаться получить доступ к чужим аккаунтам или данным;",
                        "перегружать сервис автоматическими запросами, парсингом или ботами;",
                        "проверять на уязвимости, нарушать работу или обходить защиту;",
                        "использовать FuelWise в противоправных целях."
                    ]
                ]],
                ["thirdparty", "Сторонние данные", [
                    "Карты © участники OpenStreetMap, маршруты рассчитываются с помощью OSRM, поиск адресов использует Nominatim, цены на топливо публикует EPDK. У этих источников свои условия, и мы не можем гарантировать их постоянную доступность или точность."
                ]],
                ["ip", "Интеллектуальная собственность", [
                    "Название, логотип, дизайн и программное обеспечение FuelWise принадлежат разработчику. Сайт можно использовать в личных некоммерческих целях. Пожалуйста, не копируйте и не распространяйте его без разрешения."
                ]],
                ["liability", "Доступность и ответственность", [
                    "FuelWise предоставляется «как есть» и «по мере доступности». Мы можем изменять, приостанавливать или прекращать функции и не обещаем бесперебойной работы.",
                    "В пределах, допускаемых законом, FuelWise и его разработчик не несут ответственности за убытки, возникшие из-за того, что вы полагались на оценки, цены или маршруты на сайте. Ничто в этих условиях не ограничивает ваши права по императивным нормам о защите потребителей."
                ]],
                ["termination", "Приостановка", [
                    "Мы можем приостановить или закрыть аккаунты, которые нарушают эти условия или создают риск для сервиса или других пользователей."
                ]],
                ["law", "Применимое право", [
                    "Эти условия регулируются законодательством Турецкой Республики. Споры подсудны судам и исполнительным органам Стамбула без ущерба для императивных норм о защите потребителей."
                ]],
                ["changes", "Изменения и контакты", [
                    `Мы можем обновлять эти условия; дата вверху показывает актуальную версию, а продолжение использования FuelWise означает согласие с ней. Контакт: ${mail}.`
                ]]
            ]
        },
        zh: {
            badge: "条款", title: "服务", accent: "条款", pageTitle: "服务条款 | FuelWise",
            lead: "使用 FuelWise 的规则，几分钟即可读完。",
            note: `对这些条款有疑问？请写信至 ${mail}。`,
            sections: [
                ["accept", "接受条款", [
                    "使用 FuelWise（fuelwise.com.tr）或创建账户，即表示您同意这些条款。如果您不同意，请不要使用本服务。"
                ]],
                ["service", "FuelWise 是什么", [
                    "FuelWise 是一款免费工具，可估算油耗和行程费用、规划路线、保存车辆，并显示土耳其各省的官方燃油价格。目前处于测试阶段，功能可能变化。"
                ]],
                ["estimates", "是估算，不是保证", [
                    "FuelWise 显示的所有数值都是估算。实际油耗和费用取决于驾驶方式、交通、天气、载重、胎压和车辆状况。",
                    [
                        "燃油价格来自 EPDK 官方记录，可能与某个加油站的实际价格不同。",
                        "路线和距离基于 OpenStreetMap 数据，可能未反映封路或施工情况。",
                        "FuelWise 不是导航设备。请遵守交通规则和道路标志，驾驶时请勿使用本网站。"
                    ]
                ]],
                ["account", "您的账户", [
                    [
                        "注册时请提供准确信息，并保持邮箱地址有效。",
                        "请妥善保管密码。您对账户下的活动负责。",
                        "您须达到可订立有约束力协议的年龄，或在父母或监护人许可下使用本服务。",
                        "您可以随时在个人资料中删除账户。"
                    ]
                ]],
                ["use", "合理使用", [
                    "请不要：",
                    [
                        "试图访问他人的账户或数据；",
                        "以自动请求、抓取或机器人使服务过载；",
                        "探测、干扰或绕过安全措施；",
                        "将 FuelWise 用于任何违法用途。"
                    ]
                ]],
                ["thirdparty", "第三方数据", [
                    "地图 © OpenStreetMap 贡献者，路线由 OSRM 计算，地址搜索使用 Nominatim，燃油价格由 EPDK 发布。这些来源各有其条款，我们无法保证它们始终可用或准确。"
                ]],
                ["ip", "知识产权", [
                    "FuelWise 的名称、标志、设计和软件归其开发者所有。您可以出于个人、非商业目的使用本网站。未经许可请勿复制或再分发。"
                ]],
                ["liability", "可用性与责任", [
                    "FuelWise 按“现状”和“现有”提供。我们可能更改、暂停或终止功能，不承诺服务不中断。",
                    "在法律允许的范围内，FuelWise 及其开发者不对因依赖网站所示估算、价格或路线而产生的损失负责。本条款不限制您依强制性消费者保护法享有的权利。"
                ]],
                ["termination", "暂停使用", [
                    "对于违反本条款或危及服务或其他用户的账户，我们可以暂停或关闭。"
                ]],
                ["law", "适用法律", [
                    "本条款受土耳其共和国法律管辖。争议由伊斯坦布尔法院和执行机构管辖，但不影响强制性消费者保护规定。"
                ]],
                ["changes", "变更与联系", [
                    `我们可能更新这些条款；页面顶部的日期为最新版本，继续使用 FuelWise 即表示接受。联系方式：${mail}。`
                ]]
            ]
        }
    };

    window.FuelWiseLegal = { updated: "2026-11-13", labels, documents: { privacy, terms } };
})();
