(() => {
    const languages = {
        en: { label: "English", short: "EN", flag: "🇬🇧" },
        tr: { label: "Türkçe", short: "TR", flag: "🇹🇷" },
        ru: { label: "Русский", short: "RU", flag: "🇷🇺" },
        zh: { label: "中文", short: "中文", flag: "🇨🇳" }
    };

    const t = {
        "Home": ["Ana Sayfa","Главная","首页"], "Trip Planner": ["Yolculuk Planlayıcı","Планировщик","行程规划"], "Vehicles": ["Araçlar","Транспорт","车辆"], "Fuel Prices": ["Yakıt Fiyatları","Цены на топливо","燃油价格"], "About": ["Hakkımızda","О нас","关于"], "Login": ["Giriş Yap","Войти","登录"], "Register": ["Kayıt Ol","Регистрация","注册"], "Logout": ["Çıkış Yap","Выйти","退出"],
        "Start Planning": ["Planlamaya Başla","Начать планирование","开始规划"], "Learn More": ["Daha Fazla Bilgi","Подробнее","了解更多"], "Quick Links": ["Hızlı Bağlantılar","Быстрые ссылки","快速链接"], "Contact": ["İletişim","Контакты","联系我们"], "Privacy Policy": ["Gizlilik Politikası","Политика конфиденциальности","隐私政策"], "Terms of Service": ["Kullanım Koşulları","Условия использования","服务条款"], "Trusted by drivers": ["Sürücülerin tercihi","Нам доверяют водители","深受驾驶者信赖"], "Drivers": ["Sürücü","Водители","驾驶者"], "Trips Planned": ["Planlanan Yolculuk","Поездок спланировано","已规划行程"], "Satisfaction": ["Memnuniyet","Удовлетворённость","满意度"],
        "© 2026 FuelWise. All rights reserved.": ["© 2026 FuelWise. Tüm hakları saklıdır.","© 2026 FuelWise. Все права защищены.","© 2026 FuelWise。保留所有权利。"], "Designed & Developed by Selim Eskimumcu": ["Tasarım ve Geliştirme: Selim Eskimumcu","Дизайн и разработка: Selim Eskimumcu","设计与开发：Selim Eskimumcu"], "Designed & Developed by Selim Eskimumcu.": ["Tasarım ve Geliştirme: Selim Eskimumcu.","Дизайн и разработка: Selim Eskimumcu.","设计与开发：Selim Eskimumcu。"],
        "Plan smarter journeys, calculate fuel costs and manage every vehicle from one place.": ["Daha akıllı yolculuklar planlayın, yakıt maliyetlerini hesaplayın ve tüm araçlarınızı tek yerden yönetin.","Планируйте умнее, рассчитывайте расходы и управляйте транспортом в одном месте.","更智能地规划行程、计算燃油成本并统一管理车辆。"],
        "Smart Trip Planner": ["Akıllı Yolculuk Planlayıcı","Умный планировщик","智能行程规划"], "Drive smarter. Spend less. Travel further.": ["Daha akıllı sür. Daha az harca. Daha uzağa git.","Водите умнее. Тратьте меньше. Езжайте дальше.","智慧驾驶，节省开支，行得更远。"], "FuelWise helps you estimate fuel costs, compare routes and plan your journey before you even hit the road.": ["FuelWise, yola çıkmadan yakıt maliyetini hesaplamanıza, rotaları karşılaştırmanıza ve yolculuğunuzu planlamanıza yardımcı olur.","FuelWise помогает оценить расходы, сравнить маршруты и спланировать поездку заранее.","FuelWise 帮助您在出发前估算燃油成本、比较路线并规划行程。"],
        "Why FuelWise?": ["Neden FuelWise?","Почему FuelWise?","为什么选择 FuelWise？"], "Everything you need for smarter trips.": ["Daha akıllı yolculuklar için ihtiyacınız olan her şey.","Всё для более умных поездок.","智能出行所需的一切。"], "Instant Calculations": ["Anlık Hesaplamalar","Мгновенные расчёты","即时计算"], "Estimate fuel usage and total trip costs within seconds.": ["Yakıt tüketimini ve toplam yolculuk maliyetini saniyeler içinde hesaplayın.","Оцените расход топлива и стоимость поездки за секунды.","数秒内估算油耗和总行程成本。"], "Vehicle Library": ["Araç Kütüphanesi","Гараж автомобилей","车辆库"], "Save all of your vehicles and switch between them instantly.": ["Tüm araçlarınızı kaydedin ve aralarında anında geçiş yapın.","Сохраняйте транспорт и мгновенно переключайтесь между ним.","保存所有车辆并快速切换。"], "Route Planning": ["Rota Planlama","Планирование маршрута","路线规划"], "Plan every journey with accurate distance and fuel estimates.": ["Her yolculuğu doğru mesafe ve yakıt tahminleriyle planlayın.","Планируйте поездки с точной оценкой расстояния и топлива.","通过准确的里程和燃油估算规划每次出行。"], "Live Fuel Prices": ["Canlı Yakıt Fiyatları","Актуальные цены","实时燃油价格"],
        "Calculate your journey": ["Yolculuğunu hesapla","Рассчитайте поездку","计算您的行程"], "Journey details": ["Yolculuk detayları","Детали поездки","行程详情"], "Plan your trip": ["Yolculuğunu planla","Спланируйте поездку","规划行程"], "Vehicle": ["Araç","Транспорт","车辆"], "Manual entry": ["Manuel giriş","Ввести вручную","手动输入"], "Distance": ["Mesafe","Расстояние","距离"], "Average consumption": ["Ortalama tüketim","Средний расход","平均油耗"], "Tank capacity": ["Depo kapasitesi","Объём бака","油箱容量"], "Fuel price": ["Yakıt fiyatı","Цена топлива","燃油价格"], "Trip type": ["Yolculuk tipi","Тип поездки","行程类型"], "One Way": ["Tek Yön","В одну сторону","单程"], "Round Trip": ["Gidiş Dönüş","Туда и обратно","往返"], "Calculate trip": ["Yolculuğu Hesapla","Рассчитать поездку","计算行程"], "Calculate Trip": ["Yolculuğu Hesapla","Рассчитать поездку","计算行程"], "Calculation": ["Hesaplama","Расчёт","计算结果"], "Trip Results": ["Yolculuk Sonuçları","Результаты поездки","行程结果"], "Live Preview": ["Canlı Önizleme","Предпросмотр","实时预览"], "Total Distance": ["Toplam Mesafe","Общее расстояние","总里程"], "Fuel Required": ["Gerekli Yakıt","Нужно топлива","所需燃油"], "Estimated Cost": ["Tahmini Maliyet","Примерная стоимость","预计成本"], "Estimated Range": ["Tahmini Menzil","Запас хода","预计续航"], "Fuel Stops": ["Yakıt Molası","Заправки","加油次数"], "Calculations assume that your journey starts with a full tank.": ["Hesaplamalar yolculuğa dolu depoyla başladığınızı varsayar.","Расчёт предполагает полный бак в начале поездки.","计算默认出发时油箱已加满。"],
        "Route selection": ["Rota seçimi","Выбор маршрута","路线选择"], "Choose your route on the map": ["Rotanızı haritadan seçin","Выберите маршрут на карте","在地图上选择路线"], "Select your starting point first, then select your destination.": ["Önce başlangıç noktanızı, ardından varış noktanızı seçin.","Сначала выберите точку отправления, затем пункт назначения.","请先选择起点，然后选择目的地。"], "Reset route": ["Rotayı sıfırla","Сбросить маршрут","重置路线"], "Starting point": ["Başlangıç noktası","Точка отправления","起点"], "Destination": ["Varış noktası","Пункт назначения","目的地"], "Click the map to choose": ["Seçmek için haritaya tıklayın","Нажмите на карту для выбора","点击地图进行选择"], "Waiting for starting point": ["Başlangıç noktası bekleniyor","Ожидание точки отправления","等待选择起点"], "Route distance": ["Rota mesafesi","Расстояние маршрута","路线距离"], "Choose your starting point": ["Başlangıç noktanızı seçin","Выберите точку отправления","选择您的起点"], "Select a route above": ["Yukarıdan rota seçin","Выберите маршрут выше","请在上方选择路线"],
        "Vehicle Manager": ["Araç Yöneticisi","Управление транспортом","车辆管理"], "Manage your vehicles.": ["Araçlarını yönet.","Управляйте транспортом.","管理您的车辆。"], "Save your vehicles once and use them in every trip calculation.": ["Araçlarınızı bir kez kaydedin ve her hesaplamada kullanın.","Сохраните транспорт один раз и используйте во всех расчётах.","保存车辆后即可用于每次行程计算。"], "My Vehicles": ["Araçlarım","Мой транспорт","我的车辆"], "Add Vehicle": ["Araç Ekle","Добавить транспорт","添加车辆"], "Vehicle Name": ["Araç Adı","Название","车辆名称"], "Vehicle Type": ["Araç Türü","Тип транспорта","车辆类型"], "Fuel Type": ["Yakıt Türü","Тип топлива","燃料类型"], "Consumption": ["Tüketim","Расход","油耗"], "Tank": ["Depo","Бак","油箱"], "Car": ["Otomobil","Автомобиль","汽车"], "Motorcycle": ["Motosiklet","Мотоцикл","摩托车"], "Truck": ["Kamyon","Грузовик","卡车"], "Bus": ["Otobüs","Автобус","公共汽车"], "Semi Truck": ["Tır","Тягач","半挂卡车"], "Save Vehicle": ["Aracı Kaydet","Сохранить","保存车辆"], "Edit": ["Düzenle","Изменить","编辑"], "Delete": ["Sil","Удалить","删除"], "Delete vehicle?": ["Araç silinsin mi?","Удалить транспорт?","删除车辆？"], "Cancel": ["İptal","Отмена","取消"], "Are you sure you want to delete": ["Silmek istediğinizden emin misiniz:","Вы уверены, что хотите удалить","确定要删除"], "This action cannot be undone.": ["Bu işlem geri alınamaz.","Это действие нельзя отменить.","此操作无法撤销。"],
        "Calculate every journey": ["Her yolculuğu hesapla","Рассчитайте каждую поездку","计算每次行程"], "before you start.": ["yola çıkmadan önce.","до старта.","出发之前。"], "FuelWise Trip Planner": ["FuelWise Yolculuk Planlayıcı","Планировщик FuelWise","FuelWise 行程规划"], "Enter your vehicle and trip details to estimate fuel usage, total cost, full-tank range and required fuel stops.": ["Yakıt tüketimini, toplam maliyeti, dolu depo menzilini ve gerekli molaları görmek için araç ve yolculuk bilgilerinizi girin.","Введите данные транспорта и поездки, чтобы оценить расход, стоимость, запас хода и заправки.","输入车辆和行程信息，即可估算油耗、总成本、满箱续航和加油次数。"],
        "Your Garage": ["Garajınız","Ваш гараж","您的车库"], "Every vehicle.": ["Her araç.","Каждый транспорт.","每辆车。"], "One smart garage.": ["Tek akıllı garaj.","Один умный гараж.","一个智能车库。"], "Your vehicles": ["Araçlarınız","Ваш транспорт","您的车辆"], "Please add a vehicle": ["Lütfen araç ekleyin","Пожалуйста, добавьте транспорт","请添加车辆"], "Login to add and securely save your vehicles.": ["Araçlarınızı eklemek ve güvenle kaydetmek için giriş yapın.","Войдите, чтобы добавлять и безопасно сохранять транспорт.","登录后即可添加并安全保存车辆。"], "Add your first vehicle to use it in trip calculations.": ["Yolculuk hesaplamalarında kullanmak için ilk aracınızı ekleyin.","Добавьте первый транспорт для расчёта поездок.","添加第一辆车以用于行程计算。"], "Ready to calculate a journey?": ["Bir yolculuk hesaplamaya hazır mısınız?","Готовы рассчитать поездку?","准备好计算行程了吗？"], "Open Trip Planner": ["Yolculuk Planlayıcıyı Aç","Открыть планировщик","打开行程规划"], "Range": ["Menzil","Запас хода","续航"],
        "Fuel Price Board": ["Yakıt Fiyat Panosu","Таблица цен","燃油价格表"], "Know the price.": ["Fiyatı bil.","Знайте цену.","了解价格。"], "Plan the cost.": ["Maliyeti planla.","Планируйте расходы.","规划成本。"], "Türkiye fuel overview": ["Türkiye yakıt görünümü","Обзор цен в Турции","土耳其燃油概览"], "Reference price": ["Referans fiyat","Справочная цена","参考价格"], "Gasoline": ["Benzin","Бензин","汽油"], "Diesel": ["Motorin","Дизель","柴油"], "per litre": ["litre başına","за литр","每升"], "Best for": ["En uygun","Лучше для","适合"], "Passenger cars": ["Binek araçlar","Легковые авто","乘用车"], "Long distance": ["Uzun mesafe","Дальние поездки","长途驾驶"], "Budget driving": ["Ekonomik sürüş","Экономия","经济驾驶"], "Trend": ["Eğilim","Тренд","趋势"], "Stable": ["Sabit","Стабильно","稳定"], "Turn a litre price into a trip total": ["Litre fiyatını yolculuk toplamına dönüştürün","Превратите цену литра в стоимость поездки","将每升价格换算为行程总成本"], "Calculate My Trip": ["Yolculuğumu Hesapla","Рассчитать поездку","计算我的行程"],
        "About FuelWise": ["FuelWise Hakkında","О FuelWise","关于 FuelWise"], "Smarter journeys.": ["Daha akıllı yolculuklar.","Более умные поездки.","更智能的行程。"], "Clearer decisions.": ["Daha net kararlar.","Более ясные решения.","更清晰的决策。"], "Built to remove guesswork from every trip": ["Her yolculuktaki belirsizliği ortadan kaldırmak için tasarlandı","Создано, чтобы убрать догадки из поездок","为消除每次出行中的猜测而打造"], "What guides FuelWise": ["FuelWise'a yön verenler","Принципы FuelWise","FuelWise 的理念"], "Clarity first": ["Önce netlik","Прежде всего ясность","清晰优先"], "Honest estimates": ["Şeffaf tahminler","Честные оценки","真实估算"], "Thoughtful design": ["Özenli tasarım","Продуманный дизайн","贴心设计"], "See FuelWise in action": ["FuelWise'ı deneyin","Попробуйте FuelWise","体验 FuelWise"], "Plan a Trip": ["Yolculuk Planla","Спланировать поездку","规划行程"],
        "Create account": ["Hesap oluştur","Создать аккаунт","创建账户"], "Join FuelWise": ["FuelWise'a Katıl","Присоединяйтесь к FuelWise","加入 FuelWise"], "Full name": ["Ad soyad","Полное имя","姓名"], "Username": ["Kullanıcı adı","Имя пользователя","用户名"], "Email address": ["E-posta adresi","Электронная почта","电子邮箱"], "Password": ["Şifre","Пароль","密码"], "Confirm password": ["Şifreyi doğrula","Подтвердите пароль","确认密码"], "Your password must include:": ["Şifreniz şunları içermelidir:","Пароль должен содержать:","密码必须包含："], "At least 8 characters": ["En az 8 karakter","Не менее 8 символов","至少 8 个字符"], "One uppercase letter": ["Bir büyük harf","Одну заглавную букву","一个大写字母"], "One number": ["Bir rakam","Одну цифру","一个数字"], "Caps Lock is on": ["Caps Lock açık","Caps Lock включён","大写锁定已开启"], "Create Account": ["Hesap Oluştur","Создать аккаунт","创建账户"], "Already have an account?": ["Zaten hesabınız var mı?","Уже есть аккаунт?","已有账户？"], "Plan smarter. Drive farther. Spend wiser.": ["Daha akıllı planla. Daha uzağa git. Daha bilinçli harca.","Планируйте умнее. Езжайте дальше. Тратьте разумнее.","智慧规划，行得更远，消费更明智。"],
        "Welcome": ["Hoş Geldiniz","Добро пожаловать","欢迎"], "Sign in to continue your smarter journey.": ["Daha akıllı yolculuğunuza devam etmek için giriş yapın.","Войдите, чтобы продолжить умное путешествие.","登录以继续您的智能旅程。"],
        "Create your profile to save vehicles and plan every journey in one place.": ["Araçlarınızı kaydetmek ve tüm yolculuklarınızı tek yerden planlamak için profilinizi oluşturun.","Создайте профиль, чтобы сохранять транспорт и планировать поездки в одном месте.","创建个人资料，在一个地方保存车辆并规划所有行程。"],
        "Keep fuel consumption and tank information together, then use the right profile while planning every journey.": ["Yakıt tüketimi ve depo bilgilerini bir arada tutun, her yolculukta doğru profili kullanın.","Храните расход и объём бака вместе и выбирайте нужный профиль для поездки.","集中保存油耗和油箱信息，并在规划时使用合适的车辆档案。"],
        "Example profiles are ready for trip calculations. Your saved vehicles can be managed here as the project grows.": ["Örnek profiller hesaplamaya hazır. Kaydettiğiniz araçları proje geliştikçe buradan yönetebilirsiniz.","Примеры профилей готовы к расчётам. Сохранённым транспортом можно управлять здесь.","示例车辆档案已可用于计算，您可以在这里管理保存的车辆。"],
        "Comfortable maxi-scooter profile for daily and long-distance rides.": ["Günlük ve uzun mesafeli sürüşler için konforlu maxi-scooter profili.","Комфортный макси-скутер для города и дальних поездок.","适合日常及长途骑行的舒适大型踏板车。"],
        "Lightweight scrambler profile for mixed city and weekend routes.": ["Şehir içi ve hafta sonu rotaları için hafif scrambler profili.","Лёгкий скрэмблер для города и поездок выходного дня.","适合城市与周末路线的轻量级复古摩托。"],
        "Efficient urban scooter profile designed for everyday commuting.": ["Günlük ulaşım için tasarlanmış verimli şehir scooterı profili.","Экономичный городской скутер для ежедневных поездок.","专为日常通勤设计的高效城市踏板车。"],
        "Choose one of these vehicles directly in the Trip Planner.": ["Bu araçlardan birini Yolculuk Planlayıcıda doğrudan seçin.","Выберите один из этих вариантов прямо в планировщике.","直接在行程规划中选择其中一辆车。"],
        "Use clear reference prices for gasoline, diesel and LPG before calculating your next journey.": ["Yolculuğunuzu hesaplamadan önce benzin, motorin ve LPG referans fiyatlarını inceleyin.","Перед расчётом поездки используйте справочные цены на бензин, дизель и LPG.","计算下次行程前，查看汽油、柴油和 LPG 的参考价格。"],
        "Illustrative reference values for the interface. Enter the current station price in Trip Planner for an exact personal estimate.": ["Bunlar arayüz için örnek değerlerdir. Kişisel tahmin için istasyondaki güncel fiyatı Yolculuk Planlayıcıya girin.","Это примерные значения. Для точной оценки введите актуальную цену станции.","这些是界面参考值；如需准确估算，请输入加油站当前价格。"],
        "Add your vehicle, distance and local station price to see the full estimate.": ["Tam tahmini görmek için aracınızı, mesafeyi ve yerel istasyon fiyatını ekleyin.","Добавьте транспорт, расстояние и местную цену, чтобы увидеть полный расчёт.","添加车辆、距离和当地油价以查看完整估算。"],
        "FuelWise turns everyday vehicle and fuel data into simple, useful answers before you start the engine.": ["FuelWise, günlük araç ve yakıt verilerini yola çıkmadan önce basit ve yararlı sonuçlara dönüştürür.","FuelWise превращает данные о транспорте и топливе в понятные ответы ещё до старта.","FuelWise 在出发前将车辆和燃油数据转化为简单实用的答案。"],
        "FuelWise began with a straightforward idea: drivers should be able to understand the real fuel cost of a journey without spreadsheets or complicated tools.": ["FuelWise basit bir fikirle başladı: sürücüler karmaşık araçlar olmadan yolculuğun gerçek yakıt maliyetini anlayabilmeli.","FuelWise начался с простой идеи: водитель должен понимать реальную стоимость поездки без сложных инструментов.","FuelWise 始于一个简单理念：驾驶者无需复杂工具也能了解真实燃油成本。"],
        "The project brings trip calculations, vehicle profiles and reference fuel prices into one calm interface. Whether it is a daily commute or a long weekend route, the goal stays the same—help you plan with confidence.": ["Proje; yolculuk hesaplarını, araç profillerini ve yakıt fiyatlarını sade bir arayüzde birleştirir. Amaç her zaman güvenle planlamanıza yardımcı olmaktır.","Проект объединяет расчёты, профили транспорта и цены в одном спокойном интерфейсе, помогая планировать уверенно.","本项目将行程计算、车辆档案和参考油价整合到简洁界面中，帮助您自信规划。"],
        "Three principles shape every screen and calculation.": ["Her ekranı ve hesaplamayı üç ilke şekillendirir.","Каждый экран и расчёт основан на трёх принципах.","三个原则塑造每个页面和计算。"],
        "Useful answers should be easy to find, understand and act on.": ["Yararlı cevaplar kolay bulunmalı, anlaşılmalı ve uygulanmalıdır.","Полезные ответы должны быть понятными и доступными.","有用的答案应该易于查找、理解和执行。"],
        "Calculations explain their assumptions so you stay in control of the inputs.": ["Hesaplamalar varsayımlarını açıklar; girdiler her zaman sizin kontrolünüzdedir.","Расчёты объясняют допущения, оставляя данные под вашим контролем.","计算会说明假设，让输入始终由您掌控。"],
        "A focused experience keeps planning quick on desktop and mobile.": ["Odaklı deneyim masaüstü ve mobilde planlamayı hızlı tutar.","Продуманный интерфейс ускоряет планирование на любом устройстве.","专注的体验让桌面和移动端规划都保持高效。"],
        "Plan a journey and get your distance, required fuel, range and estimated cost.": ["Bir yolculuk planlayın; mesafe, gerekli yakıt, menzil ve tahmini maliyeti görün.","Спланируйте поездку и узнайте расстояние, топливо, запас хода и стоимость.","规划行程并获取距离、所需燃油、续航和预计成本。"],
        "Email address": ["E-posta adresi","Электронная почта","电子邮箱"], "Member since": ["Üyelik tarihi","Дата регистрации","加入时间"], "Account status": ["Hesap durumu","Статус аккаунта","账户状态"], "Active account": ["Aktif hesap","Активный аккаунт","账户已激活"], "Journey archive": ["Yolculuk arşivi","Архив поездок","行程档案"], "Recent trips": ["Son yolculuklar","Недавние поездки","最近行程"], "Your latest 3 calculations": ["En son 3 hesaplamanız","Ваши последние 3 расчёта","最近3次计算"], "No trip history yet": ["Henüz yolculuk geçmişi yok","Истории поездок пока нет","暂无行程记录"], "Your completed Trip Planner calculations will appear here.": ["Tamamladığınız yolculuk hesapları burada görünecek.","Завершённые расчёты появятся здесь.","已完成的行程计算将显示在这里。"], "Total cost": ["Toplam tutar","Общая стоимость","总费用"], "Loading trip history...": ["Yolculuk geçmişi yükleniyor...","Загрузка истории поездок...","正在加载行程记录..."]
        ,"Estimated Fuel": ["Tahmini Yakıt","Расчётное топливо","预计燃油"], "Estimated fuel": ["Tahmini yakıt","Расчётное топливо","预计燃油"], "Estimated cost": ["Tahmini maliyet","Ориентировочная стоимость","预计费用"], "Estimates assume a full tank at departure. The range includes modeled city traffic, road, weather, climate and vehicle-load effects.": ["Tahminler yolculuğa dolu depoyla başlandığını varsayar. Aralık; şehir içi trafik, yol, hava, iklimlendirme ve araç yükü etkilerini içerir.","Расчёт предполагает полный бак при выезде. Диапазон учитывает городской трафик, дорогу, погоду, климат и загрузку автомобиля.","估算假定出发时油箱已满；范围包含城市交通、道路、天气、空调及车辆载重影响。"]
        ,"Search starting address": ["Başlangıç adresi ara","Найти адрес отправления","搜索起点地址"], "Search destination address": ["Varış adresi ara","Найти адрес назначения","搜索目的地地址"]
        ,"Traffic condition": ["Trafik koşulu","Дорожная обстановка","交通状况"], "Flowing": ["Akıcı","Свободно","畅通"], "Heavy": ["Yoğun","Плотное движение","拥堵"], "Very Heavy": ["Çok Yoğun","Очень плотное движение","严重拥堵"], "Applied only to the estimated urban parts of your route.": ["Yalnızca rotanızın tahmini şehir içi bölümlerine uygulanır.","Применяется только к предполагаемым городским участкам маршрута.","仅应用于路线中估算的城市路段。"]
        ,"Normal": ["Normal","Нормальное движение","正常"]
        ,"Fuel type": ["Yakıt türü","Тип топлива","燃料类型"], "LPG / Autogas": ["LPG / Otogaz","СУГ / Автогаз","液化石油气 / 汽车燃气"]
        ,"Official EPDK price will load automatically.": ["Resmî EPDK fiyatı otomatik yüklenecek.","Официальная цена EPDK загрузится автоматически.","将自动加载 EPDK 官方价格。"]
        ,"View official provincial pump-price ranges before calculating your journey.": ["Yolculuğunuzu hesaplamadan önce resmî il bazlı pompa fiyat aralıklarını görün.","Перед расчётом поездки просмотрите официальные региональные диапазоны цен.","计算行程前查看各省官方加油站价格范围。"]
        ,"Official provincial pump-price ranges retrieved from EPDK and refreshed every six hours.": ["EPDK'den alınan resmî il bazlı pompa fiyatları altı saatte bir yenilenir.","Официальные региональные цены EPDK обновляются каждые шесть часов.","来自 EPDK 的各省官方价格每六小时更新。"]
        ,"Province": ["İl","Регион","省份"], "Show Prices": ["Fiyatları Göster","Показать цены","显示价格"], "Official EPDK": ["Resmî EPDK","Официальные данные EPDK","EPDK 官方数据"]
        ,"average per litre": ["litre başına ortalama","средняя цена за литр","每升平均价"], "Price range": ["Fiyat aralığı","Диапазон цен","价格范围"], "Observed": ["Veri tarihi","Дата данных","数据日期"]
        ,"Trip Planner automatically uses the official range for your fuel type and starting province.": ["Yolculuk Planlayıcı, yakıt türünüz ve başlangıç iliniz için resmî fiyat aralığını otomatik kullanır.","Планировщик автоматически использует официальный диапазон для вашего топлива и региона отправления.","行程规划器会自动使用燃料类型和出发省份的官方价格范围。"]
        ,"Forgot your password?": ["Şifrenizi mi unuttunuz?","Забыли пароль?","忘记密码？"], "Password recovery": ["Şifre kurtarma","Восстановление пароля","密码找回"]
        ,"Reset your password": ["Şifrenizi sıfırlayın","Сбросьте пароль","重置密码"], "Enter the email address registered to your FuelWise account.": ["FuelWise hesabınıza kayıtlı e-posta adresini girin.","Введите адрес электронной почты вашей учётной записи FuelWise.","请输入 FuelWise 账户的注册邮箱。"]
        ,"Send verification code": ["Doğrulama kodu gönder","Отправить код","发送验证码"], "Your verification code has been sent to your email.": ["Onay kodunuz e-postanıza gönderilmiştir.","Код подтверждения отправлен на вашу почту.","验证码已发送至您的邮箱。"]
        ,"6-digit verification code": ["6 haneli doğrulama kodu","6-значный код подтверждения","6 位验证码"], "Resend code": ["Kodu tekrar gönder","Отправить код повторно","重新发送"], "Verify code": ["Kodu doğrula","Подтвердить код","验证代码"]
        ,"New password": ["Yeni şifre","Новый пароль","新密码"], "Confirm new password": ["Yeni şifre tekrar","Подтвердите новый пароль","确认新密码"], "Save new password": ["Yeni şifreyi kaydet","Сохранить новый пароль","保存新密码"]
        ,"Your password has been changed successfully.": ["Şifreniz başarıyla değiştirilmiştir.","Ваш пароль успешно изменён.","密码已成功更改。"], "You can now sign in with your new password.": ["Artık yeni şifrenizle giriş yapabilirsiniz.","Теперь вы можете войти с новым паролем.","现在可以使用新密码登录。"]
        ,"Return to Home": ["Ana sayfaya dön","Вернуться на главную","返回首页"], "Return to login": ["Giriş ekranına dön","Вернуться ко входу","返回登录"], "Please wait": ["Lütfen bekleyin","Пожалуйста, подождите","请稍候"]
        ,"Renew Password": ["Şifre Yenile","Обновить пароль","更新密码"], "Delete Account": ["Hesabı Sil","Удалить аккаунт","删除账户"]
        ,"Verify account action": ["Hesap işlemini doğrulayın","Подтвердите действие","验证账户操作"], "A verification code has been sent to your registered email.": ["Kayıtlı e-posta adresinize doğrulama kodu gönderildi.","Код отправлен на зарегистрированную почту.","验证码已发送至注册邮箱。"]
        ,"Verify Code": ["Kodu Doğrula","Подтвердить код","验证代码"], "This action permanently deletes your account, vehicles and trip history. It cannot be undone.": ["Bu işlem hesabınızı, araçlarınızı ve yolculuk geçmişinizi kalıcı olarak siler. Geri alınamaz.","Это навсегда удалит аккаунт, транспорт и историю поездок. Отменить действие нельзя.","此操作将永久删除账户、车辆和行程历史，且无法撤销。"]
        ,"Permanently Delete My Account": ["Hesabımı Kalıcı Olarak Sil","Навсегда удалить аккаунт","永久删除我的账户"]
        ,"Plan Smarter.": ["Akıllı Planla.","Планируйте умнее.","智慧规划。"]
        ,"Travel Cheaper.": ["Daha Ucuza Yol Al.","Путешествуйте дешевле.","省钱出行。"]
        ,"Official EPDK prices": ["Resmî EPDK fiyatları","Официальные цены EPDK","EPDK 官方价格"]
        ,"81 provinces": ["81 il","81 регион","81 个省"]
        ,"Free to use": ["Ücretsiz kullanım","Бесплатно","免费使用"]
        ,"Sample route": ["Örnek rota","Пример маршрута","示例路线"]
        ,"Live estimate": ["Canlı tahmin","Живой расчёт","实时估算"]
        ,"From": ["Nereden","Откуда","出发地"]
        ,"To": ["Nereye","Куда","目的地"]
        ,"Fuel use": ["Yakıt","Топливо","燃油"]
        ,"Cost": ["Maliyet","Стоимость","费用"]
        ,"Traffic profiles": ["Trafik profilleri","Профили трафика","交通状况模式"]
        ,"Vehicle garage": ["Araç garajı","Гараж","车辆库"]
        ,"Everything you need": ["İhtiyacınız olan her şey","Всё необходимое","您需要的一切"]
        ,"for smarter trips.": ["daha akıllı yolculuklar için.","для умных поездок.","尽在智能出行。"]
        ,"Designed to help drivers calculate costs, manage vehicles and travel more efficiently.": ["Sürücülerin maliyetleri hesaplamasına, araçlarını yönetmesine ve daha verimli yolculuk etmesine yardımcı olmak için tasarlandı.","Создано, чтобы помогать водителям считать расходы, управлять транспортом и ездить эффективнее.","旨在帮助驾驶者计算成本、管理车辆并更高效地出行。"]
        ,"Official EPDK gasoline, diesel and LPG prices for every province in Türkiye.": ["Türkiye'nin her ili için resmî EPDK benzin, motorin ve LPG fiyatları.","Официальные цены EPDK на бензин, дизель и LPG для каждого региона Турции.","土耳其各省的 EPDK 官方汽油、柴油和 LPG 价格。"]
        ,"How it works": ["Nasıl çalışır?","Как это работает","使用方法"]
        ,"Three steps": ["Üç adımda","Три шага","三个步骤"]
        ,"to a clear answer.": ["net bir cevap.","к ясному ответу.","得到清晰答案。"]
        ,"Choose your route": ["Rotanı seç","Выберите маршрут","选择路线"]
        ,"Search an address or tap the map. FuelWise measures the real road distance for you.": ["Adres arayın ya da haritaya dokunun. FuelWise gerçek yol mesafesini sizin için ölçer.","Найдите адрес или нажмите на карту. FuelWise измерит реальное расстояние по дорогам.","搜索地址或点击地图，FuelWise 会为您测量真实的道路距离。"]
        ,"Pick your vehicle": ["Aracını seç","Выберите транспорт","选择车辆"]
        ,"Use a vehicle saved in your garage, with its own consumption and tank capacity.": ["Garajınıza kayıtlı aracı, kendi tüketim ve depo kapasitesiyle kullanın.","Используйте транспорт из гаража с его расходом и объёмом бака.","使用车库中保存的车辆及其油耗和油箱容量。"]
        ,"See the real cost": ["Gerçek maliyeti gör","Узнайте реальную стоимость","查看真实成本"]
        ,"Get minimum and maximum fuel, cost and fuel-stop estimates based on traffic and official prices.": ["Trafiğe ve resmî fiyatlara göre minimum ve maksimum yakıt, maliyet ve yakıt molası tahminlerini alın.","Получите минимальные и максимальные оценки топлива, стоимости и заправок с учётом трафика и официальных цен.","根据交通状况和官方价格，获取最低和最高的燃油、成本及加油次数估算。"]
        ,"Provinces covered": ["Kapsanan il","Регионов охвачено","覆盖省份"]
        ,"Fuel types": ["Yakıt türü","Вида топлива","燃料类型"]
        ,"Languages": ["Dil","Языка","种语言"]
        ,"Today at the pump": ["Bugün pompada","Сегодня на заправке","今日油价"]
        ,"in Istanbul.": ["İstanbul'da.","в Стамбуле.","伊斯坦布尔。"]
        ,"Official average pump prices from EPDK, refreshed every six hours.": ["EPDK'den alınan resmî ortalama pompa fiyatları, altı saatte bir yenilenir.","Официальные средние цены EPDK, обновляются каждые шесть часов.","来自 EPDK 的官方平均油价，每六小时更新。"]
        ,"View all provinces": ["Tüm illeri gör","Все регионы","查看所有省份"]
        ,"Cookie Preferences": ["Çerez Tercihleri","Настройки cookie","Cookie 设置"]
        ,"I agree to the": ["Şunları kabul ediyorum:","Я принимаю","我同意"]
        ,"and": ["ve","и","和"]
        ,"Add and manage vehicles saved securely in your FuelWise account.": ["FuelWise hesabınıza güvenle kaydedilen araçları ekleyin ve yönetin.","Добавляйте транспорт, надёжно сохранённый в аккаунте FuelWise, и управляйте им.","添加并管理安全保存在 FuelWise 账户中的车辆。"]
        ,"Choose your saved vehicle directly in the Trip Planner.": ["Kayıtlı aracınızı doğrudan Yolculuk Planlayıcıda seçin.","Выберите сохранённый транспорт прямо в планировщике.","直接在行程规划中选择已保存的车辆。"]
        ,"“Know what the journey will cost before the road begins.”": ["“Yol başlamadan önce yolculuğun neye mal olacağını bilin.”","«Узнайте стоимость поездки ещё до выезда.»","“出发之前，先知道这趟行程要花多少。”"]
        ,"Designed and developed in Istanbul with clarity, speed and practical driving needs at its core.": ["Netlik, hız ve pratik sürüş ihtiyaçları merkeze alınarak İstanbul'da tasarlandı ve geliştirildi.","Создано в Стамбуле с упором на ясность, скорость и практические нужды водителей.","在伊斯坦布尔设计和开发，以清晰、快速和实用的驾驶需求为核心。"]
        ,"Trips": ["Yolculuk","Поездок","行程"]
    };

    const langIndex = { tr: 0, ru: 1, zh: 2 };
    const originals = new WeakMap();
    const originalTitle = document.title;
    const normalize = value => value.replace(/\s+/g, " ").trim();

    function translateText(lang) {
        document.documentElement.lang = lang === "zh" ? "zh-CN" : lang;
        const titleTranslations = {
            "FuelWise": ["FuelWise","FuelWise","FuelWise"],
            "Trip Planner | FuelWise": ["Yolculuk Planlayıcı | FuelWise","Планировщик | FuelWise","行程规划 | FuelWise"],
            "Vehicles | FuelWise": ["Araçlar | FuelWise","Транспорт | FuelWise","车辆 | FuelWise"],
            "Fuel Prices | FuelWise": ["Yakıt Fiyatları | FuelWise","Цены на топливо | FuelWise","燃油价格 | FuelWise"],
            "About | FuelWise": ["Hakkımızda | FuelWise","О нас | FuelWise","关于 | FuelWise"],
            "Register | FuelWise": ["Kayıt Ol | FuelWise","Регистрация | FuelWise","注册 | FuelWise"]
        };
        document.title = lang === "en" ? originalTitle : (titleTranslations[originalTitle]?.[langIndex[lang]] || originalTitle);
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);
        nodes.forEach(node => {
            if (node.parentElement?.closest("script, style, .language-switcher")) return;
            if (!originals.has(node)) originals.set(node, normalize(node.nodeValue));
            const source = originals.get(node);
            if (!source) return;
            const translated = lang === "en" ? source : t[source]?.[langIndex[lang]];
            if (translated) node.nodeValue = translated;
        });

        document.querySelectorAll("input[placeholder]").forEach(input => {
            if (!input.dataset.i18nPlaceholder) input.dataset.i18nPlaceholder = input.placeholder;
            const source = input.dataset.i18nPlaceholder;
            const placeholders = {
                "Enter your username": ["Kullanıcı adınızı girin","Введите имя пользователя","输入用户名"], "Enter your password": ["Şifrenizi girin","Введите пароль","输入密码"], "Your full name": ["Adınız ve soyadınız","Ваше полное имя","您的姓名"], "Choose a username": ["Kullanıcı adı seçin","Выберите имя","选择用户名"], "Create a strong password": ["Güçlü bir şifre oluşturun","Создайте надёжный пароль","创建强密码"], "Repeat your password": ["Şifrenizi tekrarlayın","Повторите пароль","再次输入密码"]
            };
            input.placeholder = lang === "en" ? source : (placeholders[source]?.[langIndex[lang]] || source);
        });

        document.querySelectorAll(".language-option").forEach(option => option.classList.toggle("active", option.dataset.lang === lang));
        document.querySelectorAll(".language-current").forEach(label => label.textContent = languages[lang].short);
        localStorage.setItem("fuelwise-language", lang);
        document.dispatchEvent(new CustomEvent("fuelwise:language", { detail: lang }));
    }

    function createSwitcher() {
        const wrap = document.createElement("div");
        wrap.className = "language-switcher" + (document.body.classList.contains("register-page") ? " register-language" : "");
        wrap.innerHTML = `<button class="language-button" type="button" aria-label="Select language" aria-expanded="false"><i data-lucide="languages"></i><span class="language-current">EN</span><i data-lucide="chevron-down"></i></button><div class="language-menu">${Object.entries(languages).map(([code,item]) => `<button type="button" class="language-option" data-lang="${code}"><span>${item.flag}</span>${item.label}</button>`).join("")}</div>`;
        const target = document.querySelector(".nav-buttons");
        if (target) target.prepend(wrap); else document.body.prepend(wrap);
        const button = wrap.querySelector(".language-button");
        button.addEventListener("click", event => { event.stopPropagation(); wrap.classList.toggle("open"); button.setAttribute("aria-expanded", String(wrap.classList.contains("open"))); });
        wrap.querySelectorAll(".language-option").forEach(option => option.addEventListener("click", () => { translateText(option.dataset.lang); wrap.classList.remove("open"); button.setAttribute("aria-expanded", "false"); }));
        document.addEventListener("click", event => { if (!wrap.contains(event.target)) { wrap.classList.remove("open"); button.setAttribute("aria-expanded", "false"); } });
        if (window.lucide) window.lucide.createIcons();
    }

    document.addEventListener("DOMContentLoaded", () => {
        createSwitcher();
        const saved = localStorage.getItem("fuelwise-language");
        const browserLang = navigator.language?.slice(0, 2);
        translateText(languages[saved] ? saved : (languages[browserLang] ? browserLang : "en"));
    });

    window.FuelWiseI18n = { translate: translateText };
})();
