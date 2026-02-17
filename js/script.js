// مفتاح API الخاص بك
const API_KEY = '1a520e812453b5af508151047e353115';

let state = { 
    rates: {}, 
    egp: 0, 
    g24: 0, 
    lang: 'ar', 
    ounce: 0 
};

let goldChart, currChart;

// بيانات العملات (إضافة الأردن، قطر، ليبيا كما طلبت)
const currencyData = {
    ar: { 
        'USD': { name: 'دولار أمريكي', flag: '🇺🇸' }, 
        'EUR': { name: 'يورو أوروبي', flag: '🇪🇺' }, 
        'SAR': { name: 'ريال سعودي', flag: '🇸🇦' }, 
        'AED': { name: 'درهم إماراتي', flag: '🇦🇪' }, 
        'KWD': { name: 'دينار كويتي', flag: '🇰🇼' },
        'JOD': { name: 'دينار أردني', flag: '🇯🇴' },
        'QAR': { name: 'ريال قطري', flag: '🇶🇦' },
        'LYD': { name: 'دينار ليبي', flag: '🇱🇾' }
    },
    en: { 
        'USD': { name: 'US Dollar', flag: '🇺🇸' }, 
        'EUR': { name: 'Euro', flag: '🇪🇺' }, 
        'SAR': { name: 'Saudi Riyal', flag: '🇸🇦' }, 
        'AED': { name: 'UAE Dirham', flag: '🇦🇪' }, 
        'KWD': { name: 'Kuwaiti Dinar', flag: '🇰🇼' },
        'JOD': { name: 'Jordanian Dinar', flag: '🇯🇴' },
        'QAR': { name: 'Qatari Riyal', flag: '🇶🇦' },
        'LYD': { name: 'Libyan Dinar', flag: '🇱🇾' }
    }
};

// 1. تحديث الوقت والتاريخ لحظياً (بالتنسيق الذي طلبته)
function updateDateTime() {
    const now = new Date();
    const isAr = state.lang === 'ar';
    
    // الساعة
    document.getElementById('live-clock').innerText = now.toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', {
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    // التاريخ
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('live-full-date').innerText = now.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', options);
}
setInterval(updateDateTime, 1000);

// 2. جلب البيانات من الـ API
async function init() {
    try {
        const res = await fetch(`https://api.metalpriceapi.com/v1/latest?api_key=${API_KEY}`);
        const data = await res.json();
        
        if (data && data.success) {
            state.rates = data.rates;
            state.egp = data.rates.EGP;
            state.ounce = 1 / data.rates.XAU;
            state.g24 = (state.ounce / 31.1035) * state.egp;
            
            render();
            renderCharts();
            updateDateTime();
        }
    } catch (e) {
        console.error("خطأ في جلب البيانات، تأكد من مفتاح الـ API");
    }
}

// 3. عرض البيانات في الصفحة
function render() {
    const isAr = state.lang === 'ar';
    const list = document.getElementById('currency-list');
    if (!list) return;  

// عرض العملات في القائمة بتنسيق: اسم العملة | العلم | القيمة
// عرض العملات بتنسيق: اسم | علم (صورة) | قيمة
    list.innerHTML = '';
    Object.keys(currencyData[state.lang]).forEach(c => {
        const val = c === 'USD' ? state.egp : (state.egp / state.rates[c]);
        const currencyInfo = currencyData[state.lang][c];
        
        // تحويل كود العملة لكود الدولة (مثال: USD -> us)
        const countryCode = c.substring(0, 2).toLowerCase();

        list.innerHTML += `
            <div class="flex justify-between items-center p-4 bg-gray-800/20 rounded-2xl border border-gray-800/40 hover:border-yellow-600/30 transition-all mb-2">
                
                <div class="flex flex-col w-1/3 text-right">
                    <span class="text-[11px] font-bold text-white leading-tight">${currencyInfo.name}</span>
                    <span class="text-[9px] text-gray-500 uppercase font-mono">${c}</span>
                </div>

                <div class="flex justify-center items-center w-1/3">
                    <img src="https://flagcdn.com/w40/${countryCode}.png" 
                         onerror="this.src='https://flagcdn.com/w40/un.png'"
                         alt="${c}" 
                         class="w-8 h-auto rounded-sm shadow-sm opacity-90">
                </div>

                <div class="w-1/3 text-left">
                    <span class="font-mono font-bold text-yellow-500 text-sm">
                        ${val.toFixed(2)}
                    </span>
                </div>

            </div>`;
    });

    // تحديث أسعار الذهب (العيارات)
    document.getElementById('val-g24').innerText = Math.round(state.g24).toLocaleString() + (isAr ? ' ج.م' : ' EGP');
    document.getElementById('val-g21').innerText = Math.round(state.g24 * 0.875).toLocaleString() + (isAr ? ' ج.م' : ' EGP');
    document.getElementById('val-g18').innerText = Math.round(state.g24 * 0.75).toLocaleString() + (isAr ? ' ج.م' : ' EGP');
    const g12 = Math.round(state.g24 * 0.5);
    const g12El = document.getElementById('val-g12');
    if (g12El) {
        g12El.innerText = g12.toLocaleString() + (isAr ? ' ج.م' : ' EGP');
    }

    // الأونصة (العالمية إنجليزي دائماً والمصرية محلي)
    document.getElementById('val-ounce-usd').innerText = `$${state.ounce.toLocaleString(undefined, {maximumFractionDigits: 1})}`;
    document.getElementById('val-ounce-egp').innerText = Math.round(state.g24 * 31.1035).toLocaleString() + (isAr ? ' ج.م' : ' EGP');
    
    // الأونصة (العالمية إنجليزي دائماً والمصرية جدول)
    document.getElementById('val-ounce-usd_g').innerText = `$${state.ounce.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    document.getElementById('val-ounce-egp_g').innerText = Math.round(state.g24 * 31.1035).toLocaleString() + (isAr ? ' ج.م' : ' EGP');
    
    // الجنيه الذهب والفضة
    document.getElementById('val-coin').innerText = Math.round(state.g24 * 0.875 * 8).toLocaleString() + (isAr ? ' ج.م' : ' EGP');
    const silVal = ((1 / state.rates.XAG) / 31.1035) * state.egp;
    document.getElementById('val-silver').innerText = silVal.toFixed(2) + (isAr ? ' ج.م' : ' EGP');

    // جدول الوحدات
    // حساب عيار 12 (سعر عيار 24 مضروب في 0.50)
    const p12 = state.g24 * 0.50;
    const val12El = document.getElementById('val-g12');
    if (val12El) {
        val12El.innerText = Math.round(p12).toLocaleString() + (isAr ? ' ج.م' : ' EGP');
    }

    // جدول الوحدات (الجدول المخصص)
    document.getElementById('val-g24_g').innerText = Math.round(state.g24).toLocaleString() + (isAr ? ' ج.م' : ' EGP');
    document.getElementById('val-g21_g').innerText = Math.round(state.g24 * 0.875).toLocaleString() + (isAr ? ' ج.م' : ' EGP');
    document.getElementById('val-g18_g').innerText = Math.round(state.g24 * 0.75).toLocaleString() + (isAr ? ' ج.م' : ' EGP');
    document.getElementById('val-g12_g').innerText = Math.round(p12).toLocaleString() + (isAr ? ' ج.م' : ' EGP');
    document.getElementById('val-ounce-usd_g').innerText = `$${state.ounce.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    document.getElementById('val-coin_g').innerText = Math.round(state.g24 * 0.875 * 8).toLocaleString() + (isAr ? ' ج.م' : ' EGP');
    const silver_g = ((1 / state.rates.XAG) / 31.1035) * state.egp;
    document.getElementById('val-silver_g').innerText = silver_g.toFixed(2) + (isAr ? ' ج.م' : ' EGP');
    document.getElementById('val-g12_g').innerText = Math.round(p12).toLocaleString() + (isAr ? ' ج.م' : ' EGP');

    setupCalculator(isAr);
}

// 4. الرسوم البيانية (مقارنة العيارات + منع الزوم + حماية اللمس)
function renderCharts() {
    const isAr = state.lang === 'ar';
    const p24 = Math.round(state.g24), p21 = Math.round(state.g24*0.875), p18 = Math.round(state.g24*0.75);

    if (goldChart) goldChart.destroy();
    goldChart = new ApexCharts(document.querySelector("#goldMultiChart"), {
        chart: { 
            type: 'line', height: 350, toolbar: { show: false },
            zoom: { enabled: false }, // منع الزوم
            selection: { enabled: false }, // منع التحديد
            touchAction: 'pan-y' // حماية السكرول في الموبايل
        },
        series: [
            { name: isAr ? 'عيار 24' : '24K', data: [p24-10, p24+5, p24-5, p24+8, p24] },
            { name: isAr ? 'عيار 21' : '21K', data: [p21-8, p21+4, p21-4, p21+6, p21] },
            { name: isAr ? 'عيار 18' : '18K', data: [p18-6, p18+3, p18-3, p18+4, p18] }
        ],
        colors: ['#facc15', '#ca8a04'],
        stroke: { curve: 'smooth', width: [4, 4, 2] },
        xaxis: { categories: ['10:00', '12:00', '14:00', '16:00', 'الآن'] },
        tooltip: { shared: true, intersect: false, theme: 'dark', followCursor: false }, // تظهر عند النقر فقط
        legend: { position: 'top', labels: { colors: '#fff' } }
    });
    goldChart.render();

    // شارت العملات
    if (currChart) currChart.destroy();
    const cLabels = ['USD', 'SAR', 'AED', 'JOD', 'QAR'];
    const cData = cLabels.map(c => (state.egp / (state.rates[c] || 1)).toFixed(2));

    currChart = new ApexCharts(document.querySelector("#currencyChart"), {
        chart: { type: 'bar', height: 350, toolbar: { show: false }, zoom: { enabled: false }, touchAction: 'pan-y' },
        series: [{ name: isAr ? 'مقابل الجنيه' : 'vs EGP', data: cData }],
        colors: ['#3b82f6'],
        xaxis: { categories: cLabels },
        theme: { mode: 'dark' }
    });
    currChart.render();
}

// =======================
// حاسبة الصاغة والمصنعية
// =======================
function setupCalculator(isAr) {

    const weightInput = document.getElementById('g-w');
    const makingInput = document.getElementById('g-m');
    const caratSelect = document.getElementById('g-k');
    const result = document.getElementById('g-res');

    if (!weightInput || !makingInput || !caratSelect || !result) return;

    function calculate() {

        const w = parseFloat(weightInput.value) || 0;
        const m = parseFloat(makingInput.value) || 0;
        const k = caratSelect.value;

        let price = state.g24;

        if (k == "21") price *= 0.875;
        if (k == "18") price *= 0.75;

        const total = (price + m) * w;

        result.innerText =
            Math.round(total).toLocaleString() + (isAr ? ' ج.م' : ' EGP');
    }

    weightInput.addEventListener('input', calculate);
    makingInput.addEventListener('input', calculate);
    caratSelect.addEventListener('change', calculate);
}




// حاسبة العملات
// =======================
function setupCurrencyCalculator() {

    const amountInput = document.getElementById('calcAmount');
    const currencySelect = document.getElementById('fromCurrency');
    const resultDisplay = document.getElementById('calcResult');

    function calculate() {
        const amount = parseFloat(amountInput.value) || 0;
        const currency = currencySelect.value;

        let rateToEGP;
        if (currency === 'USD') {
            rateToEGP = state.egp;
        } else {
            rateToEGP = state.egp / state.rates[currency];
        }

        const finalResult = amount * rateToEGP;

        resultDisplay.innerText =
            finalResult.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }) + ' ج.م';
    }

    amountInput.addEventListener('input', calculate);
    currencySelect.addEventListener('change', calculate);

    setTimeout(calculate, 2000);
}


// 6. تبديل الأقسام واللغة
function switchTab(t) {
    document.getElementById('section-currency').classList.toggle('hidden-section', t !== 'currency');
    document.getElementById('section-gold').classList.toggle('hidden-section', t !== 'gold');
    document.getElementById('btn-currency').classList.toggle('active', t === 'currency');
    document.getElementById('btn-gold').classList.toggle('active', t === 'gold');
    setTimeout(() => { window.dispatchEvent(new Event('resize')); }, 100);
}

function toggleLang() {
    state.lang = state.lang === 'ar' ? 'en' : 'ar';
    document.getElementById('app-html').dir = state.lang === 'ar' ? 'rtl' : 'ltr';
    document.getElementById('lang-toggle-btn').innerText = state.lang === 'ar' ? 'ENGLISH' : 'العربية';
    render();
    renderCharts();
    updateDateTime();
}

// تشغيل التطبيق عند التحميل



// 7. تحسينات إضافية 

const articlesData = {
    1: {
        title: "توقعات أسعار الذهب في مصر 2026",
        content: `
            <div class="prose prose-invert max-w-none">
                <p class="text-lg leading-relaxed mb-4">
                    يشهد سوق الذهب في مصر تحولات كبيرة خلال عام 2026، حيث تتأثر الأسعار بعوامل عالمية ومحلية متعددة. في هذا التقرير الشامل، نستعرض أبرز التوقعات والتحليلات المتعلقة بحركة أسعار الذهب خلال الفترة القادمة.
                </p>
                
                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">العوامل المؤثرة على أسعار الذهب عالمياً</h3>
                <p class="mb-4">
                    تتحكم عدة عوامل رئيسية في تحديد سعر الأونصة العالمية، وهي العامل الأساسي الذي يؤثر على الأسعار المحلية. أبرز هذه العوامل:
                </p>
                <ul class="list-disc list-inside mb-4 space-y-2">
                    <li><strong>السياسة النقدية للفيدرالي الأمريكي:</strong> قرارات أسعار الفائدة تؤثر بشكل مباشر على جاذبية الذهب كملاذ آمن</li>
                    <li><strong>التضخم العالمي:</strong> ارتفاع معدلات التضخم يدفع المستثمرين للذهب كوسيلة للحفاظ على القيمة</li>
                    <li><strong>التوترات الجيوسياسية:</strong> أي اضطرابات سياسية أو عسكرية عالمية تعزز الطلب على الذهب</li>
                    <li><strong>قوة الدولار الأمريكي:</strong> علاقة عكسية بين قوة الدولار وسعر الذهب</li>
                </ul>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">التأثيرات المحلية في السوق المصري</h3>
                <p class="mb-4">
                    على المستوى المحلي، يلعب سعر صرف الجنيه المصري مقابل الدولار دوراً محورياً في تحديد السعر النهائي للذهب. كما أن الرسوم الجمركية والضرائب على استيراد الذهب تضيف تكلفة إضافية على المستهلك المصري.
                </p>
                <p class="mb-4">
                    خلال الربع الأول من 2026، شهدنا تذبذباً ملحوظاً في الأسعار نتيجة التغيرات في سياسات البنك المركزي المصري، بالإضافة إلى تأثير الطلب الموسمي المرتفع في فترات الأعياد والمناسبات.
                </p>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">توقعات الخبراء للربع الثاني</h3>
                <p class="mb-4">
                    يتوقع المحللون أن يشهد الذهب ارتفاعاً تدريجياً خلال الأشهر القادمة، مع احتمالية وصول سعر عيار 21 إلى مستويات قياسية جديدة. وتشير التقديرات إلى أن الأونصة العالمية قد تتجاوز 2,700 دولار بحلول منتصف العام.
                </p>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">نصائح للمستثمرين</h3>
                <p class="mb-4">
                    ينصح الخبراء المستثمرين بتوزيع مشترياتهم على فترات زمنية مختلفة لتجنب مخاطر التذبذب، والتركيز على السبائك والجنيهات الذهبية بدلاً من المشغولات ذات المصنعية المرتفعة. كما يُنصح بمتابعة الأخبار الاقتصادية العالمية باستمرار لاتخاذ قرارات مستنيرة.
                </p>
            </div>
        `
    },
    2: {
        title: "السبائك أم الجنيه الذهب؟ دليل الاختيار الأمثل",
        content: `
            <div class="prose prose-invert max-w-none">
                <p class="text-lg leading-relaxed mb-4">
                    يواجه كثير من المدخرين والمستثمرين في مصر حيرة كبيرة عند اتخاذ قرار شراء الذهب: هل يختارون السبائك الذهبية أم الجنيهات الذهبية؟ في هذا الدليل الشامل، نقدم مقارنة تفصيلية تساعدك على اتخاذ القرار المناسب.
                </p>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">السبائك الذهبية: الخيار الاستثماري الأمثل</h3>
                <p class="mb-4">
                    السبائك الذهبية عيار 24 تُعتبر الخيار المفضل للمستثمرين الجادين الباحثين عن أعلى نقاء وأقل نسبة مصنعية. تتوفر السبائك بأوزان مختلفة تبدأ من جرام واحد وتصل إلى كيلوجرام كامل، مما يتيح مرونة في الاستثمار.
                </p>

                <h4 class="text-lg font-bold text-yellow-400 mt-4 mb-2">مميزات السبائك:</h4>
                <ul class="list-disc list-inside mb-4 space-y-2">
                    <li><strong>نقاء عالٍ:</strong> عيار 24 يعني 99.9% ذهب خالص</li>
                    <li><strong>مصنعية منخفضة:</strong> عادة لا تتجاوز 1-2% من سعر الذهب</li>
                    <li><strong>سهولة البيع:</strong> مقبولة في جميع محلات الصاغة والبنوك</li>
                    <li><strong>قيمة استثمارية:</strong> تحتفظ بقيمتها بشكل أفضل على المدى الطويل</li>
                </ul>

                <h4 class="text-lg font-bold text-yellow-400 mt-4 mb-2">عيوب السبائك:</h4>
                <ul class="list-disc list-inside mb-4 space-y-2">
                    <li>تتطلب رأس مال أكبر للاستثمار (خاصة الأوزان الكبيرة)</li>
                    <li>قد تكون أقل سيولة من الجنيهات في بعض المناطق</li>
                    <li>تحتاج لشهادة ضمان موثقة عند البيع</li>
                </ul>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">الجنيه الذهب: المفضل لدى المصريين</h3>
                <p class="mb-4">
                    الجنيه الذهب المصري هو عملة ذهبية رسمية تزن 8 جرامات من عيار 21، وهو الخيار الأكثر شعبية في السوق المصري منذ عقود. يتميز الجنيه الذهب بقبول واسع وسهولة تداول استثنائية.
                </p>

                <h4 class="text-lg font-bold text-yellow-400 mt-4 mb-2">مميزات الجنيه الذهب:</h4>
                <ul class="list-disc list-inside mb-4 space-y-2">
                    <li><strong>سهولة البيع والشراء:</strong> مقبول في كل محلات الصاغة بدون تردد</li>
                    <li><strong>وحدة قياسية:</strong> وزن ثابت معروف للجميع (8 جرام)</li>
                    <li><strong>موثوقية:</strong> يحمل ختم دار سك العملة المصرية</li>
                    <li><strong>مصنعية معقولة:</strong> عادة أقل من المشغولات الذهبية</li>
                    <li><strong>قيمة تاريخية:</strong> بعض الإصدارات القديمة لها قيمة تاريخية إضافية</li>
                </ul>

                <h4 class="text-lg font-bold text-yellow-400 mt-4 mb-2">عيوب الجنيه الذهب:</h4>
                <ul class="list-disc list-inside mb-4 space-y-2">
                    <li>عيار 21 وليس 24 (نسبة نقاء أقل قليلاً)</li>
                    <li>مصنعية أعلى من السبائك (قد تصل إلى 3-5%)</li>
                    <li>وزن ثابت قد لا يناسب كل الميزانيات</li>
                </ul>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">كيف تختار الأنسب لك؟</h3>
                <p class="mb-4">
                    اختيارك يعتمد على أهدافك الاستثمارية وميزانيتك:
                </p>
                <div class="bg-yellow-500/10 p-4 rounded-lg mb-4 border-r-4 border-yellow-500">
                    <p class="font-bold mb-2">اختر السبائك إذا:</p>
                    <ul class="list-disc list-inside space-y-1">
                        <li>تبحث عن استثمار طويل الأجل</li>
                        <li>لديك ميزانية أكبر</li>
                        <li>تريد أعلى نقاء وأقل مصنعية</li>
                    </ul>
                </div>

                <div class="bg-blue-500/10 p-4 rounded-lg mb-4 border-r-4 border-blue-500">
                    <p class="font-bold mb-2">اختر الجنيه الذهب إذا:</p>
                    <ul class="list-disc list-inside space-y-1">
                        <li>تبحث عن سيولة عالية وسهولة في البيع</li>
                        <li>ميزانيتك محدودة أو متوسطة</li>
                        <li>تفضل التقسيط والشراء التدريجي</li>
                        <li>تريد هدية أو ادخار قصير المدى</li>
                    </ul>
                </div>

                <p class="text-sm italic text-gray-400 mt-4">
                    نصيحة ذهبية: يمكنك تنويع محفظتك بين النوعين - جنيهات ذهبية للاحتياجات القريبة، وسبائك للاستثمار طويل الأجل.
                </p>
            </div>
        `
    },
    3: {
        title: "كيف تكشف الذهب المغشوش؟ طرق احترافية مجربة",
        content: `
            <div class="prose prose-invert max-w-none">
                <p class="text-lg leading-relaxed mb-4">
                    مع ارتفاع أسعار الذهب، تزداد محاولات الغش في سوق الصاغة. في هذا الدليل الشامل، نقدم لك طرقاً علمية ومجربة للتأكد من أصالة الذهب قبل الشراء، وكيف تحمي نفسك من عمليات الاحتيال.
                </p>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">1. فحص الدمغة والأختام الرسمية</h3>
                <p class="mb-4">
                    الدمغة هي العلامة الرسمية التي تضعها دار سك العملة المصرية على المشغولات الذهبية لإثبات عيارها. الدمغة الصحيحة تحتوي على:
                </p>
                <ul class="list-disc list-inside mb-4 space-y-2">
                    <li><strong>رقم العيار:</strong> 24، 21، أو 18 محفور بوضوح</li>
                    <li><strong>ختم الميزان:</strong> رمز دار سك العملة</li>
                    <li><strong>اسم أو رمز التاجر:</strong> المحل الذي باع القطعة</li>
                </ul>
                <div class="bg-red-500/10 p-4 rounded-lg mb-4 border-r-4 border-red-500">
                    <p class="font-bold text-red-400 mb-2">⚠️ تحذير:</p>
                    <p>الدمغات المزيفة موجودة! لا تعتمد على الدمغة وحدها، واستخدم طرق فحص إضافية.</p>
                </div>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">2. اختبار المغناطيس (الطريقة الأسرع)</h3>
                <p class="mb-4">
                    الذهب الأصلي معدن غير مغناطيسي، بمعنى أنه لا ينجذب للمغناطيس على الإطلاق. إذا انجذبت القطعة للمغناطيس، فهذا يعني أنها:
                </p>
                <ul class="list-disc list-inside mb-4 space-y-2">
                    <li>ليست ذهباً خالصاً</li>
                    <li>تحتوي على نسبة عالية من الحديد أو النيكل</li>
                    <li>قد تكون مطلية بالذهب فقط</li>
                </ul>
                <p class="mb-4">
                    <strong>ملاحظة:</strong> بعض السبائك (خاصة عيار 18) قد تحتوي على معادن أخرى تجعلها تنجذب قليلاً للمغناطيس القوي، لذلك استخدم مغناطيس قوي واختبارات إضافية.
                </p>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">3. اختبار الطفو والكثافة</h3>
                <p class="mb-4">
                    الذهب من أكثف المعادن. كثافة الذهب الخالص 19.3 جرام/سم³، مما يجعله يغرق فوراً في الماء. الخطوات:
                </p>
                <ol class="list-decimal list-inside mb-4 space-y-2">
                    <li>ضع القطعة في كوب ماء نظيف</li>
                    <li>الذهب الحقيقي يغرق مباشرة</li>
                    <li>المعادن المقلدة قد تطفو أو تغرق ببطء</li>
                </ol>
                <p class="mb-4">
                    للحصول على دقة أكبر، استخدم ميزان حساس وقس الوزن في الهواء ثم في الماء، واحسب الفرق لتحديد الكثافة الحقيقية.
                </p>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">4. اختبار الحمض (الطريقة الاحترافية)</h3>
                <p class="mb-4">
                    يستخدم الصاغة المحترفون حمض النيتريك لاختبار الذهب. الطريقة:
                </p>
                <ul class="list-disc list-inside mb-4 space-y-2">
                    <li>قم بخدش القطعة قليلاً على حجر اختبار أو سطح خشن</li>
                    <li>ضع قطرة صغيرة من حمض النيتريك على الخدش</li>
                    <li>إذا تغير اللون للأخضر = ليس ذهباً أو عيار منخفض جداً</li>
                    <li>إذا ظهر لون حليبي = عيار 18 أو أقل</li>
                    <li>إذا لم يتغير اللون = عيار 21 أو 24</li>
                </ul>
                <div class="bg-yellow-500/10 p-4 rounded-lg mb-4 border-r-4 border-yellow-500">
                    <p class="font-bold text-yellow-400 mb-2">💡 نصيحة:</p>
                    <p>لا تستخدم الحمض بنفسك إلا إذا كنت خبيراً، بل اطلب من صائغ موثوق إجراء الاختبار أمامك.</p>
                </div>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">5. الفحص البصري والحسي</h3>
                <p class="mb-4">
                    الذهب الأصلي له خصائص مميزة:
                </p>
                <ul class="list-disc list-inside mb-4 space-y-2">
                    <li><strong>اللون:</strong> أصفر براق ومتجانس، ليس باهتاً أو متغيراً</li>
                    <li><strong>اللمعان:</strong> يعكس الضوء بشكل طبيعي دون بريق مبالغ فيه</li>
                    <li><strong>الوزن:</strong> ثقيل بشكل ملحوظ مقارنة بحجمه</li>
                    <li><strong>الصوت:</strong> عند إسقاطه، يصدر صوتاً رناناً مميزاً</li>
                </ul>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">6. طلب الفاتورة الرسمية</h3>
                <p class="mb-4">
                    الفاتورة الضريبية الرسمية هي أقوى ضمان لك. يجب أن تحتوي على:
                </p>
                <ul class="list-disc list-inside mb-4 space-y-2">
                    <li>اسم المحل وعنوانه والرقم الضريبي</li>
                    <li>تفاصيل القطعة: الوزن، العيار، رقم الدمغة</li>
                    <li>سعر الجرام والمصنعية بشكل منفصل</li>
                    <li>إجمالي المبلغ المدفوع</li>
                </ul>
                <p class="mb-4">
                    بدون فاتورة رسمية، لن تستطيع المطالبة بحقوقك في حالة وجود مشكلة، كما ستواجه صعوبة عند البيع لاحقاً.
                </p>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">نصائح ختامية لحماية نفسك</h3>
                <div class="bg-blue-500/10 p-4 rounded-lg mb-4">
                    <ol class="list-decimal list-inside space-y-2">
                        <li>اشترِ من محلات معروفة وموثوقة</li>
                        <li>لا تتعجل في الشراء، خذ وقتك في الفحص</li>
                        <li>اصطحب خبيراً معك عند شراء قطع كبيرة</li>
                        <li>قارن الأسعار بين عدة محلات</li>
                        <li>احتفظ بالفاتورة والشهادات في مكان آمن</li>
                        <li>تجنب الشراء من الباعة الجائلين أو غير المرخصين</li>
                    </ol>
                </div>
            </div>
        `
    },
    4: {
        title: "ما هو دولار الصاغة وكيف يتم حسابه؟",
        content: `
            <div class="prose prose-invert max-w-none">
                <p class="text-lg leading-relaxed mb-4">
                    "دولار الصاغة" مصطلح يتردد كثيراً في سوق الذهب المصري، لكن قليلون يفهمون معناه الحقيقي وكيفية حسابه. في هذا المقال التفصيلي، نشرح كل ما تحتاج معرفته عن دولار الصاغة وتأثيره على أسعار الذهب المحلية.
                </p>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">ما هو دولار الصاغة؟</h3>
                <p class="mb-4">
                    دولار الصاغة هو سعر الدولار الأمريكي الذي يستخدمه تجار الذهب في مصر لحساب سعر الذهب المحلي، وهو يختلف عادة عن سعر الدولار الرسمي في البنوك. هذا الفارق ينتج عن عدة عوامل سنشرحها تفصيلاً.
                </p>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">كيف يُحسب دولار الصاغة؟</h3>
                <p class="mb-4">
                    المعادلة الأساسية بسيطة، لكن فهمها يحتاج بعض التوضيح:
                </p>
                <div class="bg-yellow-500/10 p-6 rounded-lg mb-4 font-mono text-center border border-yellow-500/30">
                    <p class="text-xl mb-2">دولار الصاغة =</p>
                    <p class="text-lg">(سعر جرام الذهب عيار 24 في مصر × 31.1) ÷ سعر الأونصة العالمي</p>
                </div>

                <h4 class="text-lg font-bold text-yellow-400 mt-4 mb-2">مثال عملي:</h4>
                <div class="bg-gray-800/50 p-4 rounded-lg mb-4">
                    <p class="mb-2"><strong>الافتراضات:</strong></p>
                    <ul class="list-disc list-inside space-y-1 mb-3">
                        <li>سعر جرام الذهب عيار 24 في مصر = 3,500 جنيه</li>
                        <li>سعر الأونصة العالمي = 2,600 دولار</li>
                    </ul>
                    <p class="mb-2"><strong>الحساب:</strong></p>
                    <p class="font-mono">دولار الصاغة = (3,500 × 31.1) ÷ 2,600</p>
                    <p class="font-mono">= 108,850 ÷ 2,600</p>
                    <p class="font-mono">= 41.87 جنيه</p>
                    <p class="mt-3 text-yellow-400">بينما سعر الدولار الرسمي قد يكون 50 جنيه مثلاً</p>
                </div>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">لماذا يختلف دولار الصاغة عن سعر البنك؟</h3>
                <p class="mb-4">
                    الفارق بين دولار الصاغة وسعر البنك ينتج عن عدة أسباب:
                </p>

                <h4 class="text-lg font-bold text-yellow-400 mt-4 mb-2">1. الرسوم والجمارك</h4>
                <p class="mb-4">
                    عند استيراد الذهب، يدفع التجار رسوماً جمركية وضرائب، بالإضافة إلى تكاليف النقل والتأمين. هذه التكاليف تُضاف إلى السعر النهائي، مما يؤدي إلى ارتفاع دولار الصاغة.
                </p>

                <h4 class="text-lg font-bold text-yellow-400 mt-4 mb-2">2. السوق الموازي</h4>
                <p class="mb-4">
                    في بعض الأحيان، يعتمد تجار الذهب على السوق الموازي للحصول على الدولار، خاصة في فترات ندرة العملة الأجنبية في البنوك الرسمية. سعر السوق الموازي عادة أعلى من السعر الرسمي.
                </p>

                <h4 class="text-lg font-bold text-yellow-400 mt-4 mb-2">3. توقعات السوق</h4>
                <p class="mb-4">
                    عندما يتوقع التجار ارتفاع سعر الدولار مستقبلاً، يقومون برفع دولار الصاغة كنوع من التحوط. هذا يفسر لماذا قد يرتفع دولار الصاغة قبل أن يرتفع السعر الرسمي فعلياً.
                </p>

                <h4 class="text-lg font-bold text-yellow-400 mt-4 mb-2">4. العرض والطلب المحلي</h4>
                <p class="mb-4">
                    في فترات الطلب المرتفع على الذهب (مثل مواسم الأعياد والزواجات)، يرتفع دولار الصاغة حتى لو لم يتغير سعر البنك، لأن التجار يستغلون الطلب الكبير.
                </p>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">متى يكون دولار الصاغة أقل من سعر البنك؟</h3>
                <p class="mb-4">
                    في حالات نادرة، قد يكون دولار الصاغة أقل من سعر البنك، وهذا يحدث عندما:
                </p>
                <ul class="list-disc list-inside mb-4 space-y-2">
                    <li>ينخفض الطلب على الذهب بشكل حاد</li>
                    <li>يتوفر الذهب بكثرة في السوق</li>
                    <li>يتوقع التجار انخفاض سعر الذهب العالمي</li>
                    <li>تحدث عمليات بيع واسعة من المستهلكين</li>
                </ul>
                <p class="mb-4">
                    في هذه الحالات، يمكن اعتبارها فرصة جيدة للشراء لأن السعر يكون أقل من المعتاد.
                </p>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">كيف تستفيد من متابعة دولار الصاغة؟</h3>
                <div class="bg-green-500/10 p-4 rounded-lg mb-4 border-r-4 border-green-500">
                    <p class="font-bold text-green-400 mb-2">💰 استراتيجيات الشراء الذكي:</p>
                    <ol class="list-decimal list-inside space-y-2">
                        <li><strong>قارن دولار الصاغة بسعر البنك:</strong> إذا كان الفارق كبيراً (+15% أو أكثر)، فقد يكون الذهب مبالغاً في سعره</li>
                        <li><strong>تابع الاتجاه:</strong> إذا كان دولار الصاغة يرتفع بسرعة، فقد يكون هناك توقعات بأزمة عملة</li>
                        <li><strong>اشترِ عندما ينخفض الفارق:</strong> كلما اقترب دولار الصاغة من سعر البنك، كان السعر أكثر عدالة</li>
                    </ol>
                </div>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">أدوات لحساب دولار الصاغة</h3>
                <p class="mb-4">
                    يمكنك حساب دولار الصاغة بسهولة باستخدام:
                </p>
                <ul class="list-disc list-inside mb-4 space-y-2">
                    <li>مواقع أسعار الذهب اللحظية (مثل موقعنا)</li>
                    <li>تطبيقات الهواتف الذكية المتخصصة</li>
                    <li>الآلات الحاسبة المالية</li>
                    <li>السؤال مباشرة في محلات الصاغة الموثوقة</li>
                </ul>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">خلاصة القول</h3>
                <p class="mb-4">
                    دولار الصاغة ليس "غشاً" أو "تلاعباً" كما يعتقد البعض، بل هو انعكاس للتكاليف الحقيقية والظروف الاقتصادية المحلية. فهم هذا المفهوم يساعدك على:
                </p>
                <ul class="list-disc list-inside mb-4 space-y-2">
                    <li>اتخاذ قرارات شراء أكثر ذكاءً</li>
                    <li>تجنب الشراء في الأوقات المبالغ فيها</li>
                    <li>فهم تحركات السوق بشكل أفضل</li>
                    <li>التفاوض مع التجار بمعلومات دقيقة</li>
                </ul>

                <p class="text-sm italic text-gray-400 mt-6">
                    تذكر: دولار الصاغة مؤشر مهم، لكنه ليس العامل الوحيد في تحديد سعر الذهب. تابع أيضاً الأونصة العالمية والأخبار الاقتصادية للحصول على صورة كاملة.
                </p>
            </div>
        `
    },
    5: {
        title: "دليلك الشامل لزكاة الذهب: الأحكام والحسابات",
        content: `
            <div class="prose prose-invert max-w-none">
                <p class="text-lg leading-relaxed mb-4">
                    زكاة الذهب من الفرائض المهمة التي يجب على كل مسلم معرفة أحكامها وطريقة حسابها. في هذا الدليل الشرعي والعملي، نوضح كل ما تحتاج معرفته عن زكاة الذهب بأسلوب بسيط ومفصل.
                </p>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">شروط وجوب الزكاة في الذهب</h3>
                <p class="mb-4">لكي تجب الزكاة على الذهب، يجب توفر الشروط التالية:</p>

                <h4 class="text-lg font-bold text-yellow-400 mt-4 mb-2">1. بلوغ النصاب</h4>
                <p class="mb-4">
                    النصاب هو 85 جراماً من الذهب الخالص (عيار 24). إذا كان لديك ذهب بعيارات مختلفة، يجب تحويله إلى ما يعادله من عيار 24 قبل الحساب.
                </p>
                <div class="bg-yellow-500/10 p-4 rounded-lg mb-4 border border-yellow-500/30">
                    <p class="font-bold mb-2">معادلة التحويل لعيار 24:</p>
                    <ul class="list-disc list-inside space-y-1">
                        <li>عيار 21: الوزن × (21 ÷ 24) = ما يعادله من عيار 24</li>
                        <li>عيار 18: الوزن × (18 ÷ 24) = ما يعادله من عيار 24</li>
                    </ul>
                </div>

                <h4 class="text-lg font-bold text-yellow-400 mt-4 mb-2">2. حولان الحول</h4>
                <p class="mb-4">
                    يجب أن يمر عام هجري كامل (354 يوماً) على امتلاكك للذهب وهو يبلغ النصاب. إذا نقص عن النصاب خلال السنة ولو ليوم واحد، يُعاد احتساب الحول من جديد.
                </p>

                <h4 class="text-lg font-bold text-yellow-400 mt-4 mb-2">3. الملكية التامة</h4>
                <p class="mb-4">
                    يجب أن تكون مالكاً للذهب ملكية تامة، فلا زكاة على الذهب المرهون أو المعار أو غير المملوك بالكامل.
                </p>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">هل تجب الزكاة على الذهب المُستعمَل (الحُلي)؟</h3>
                <p class="mb-4">
                    هذه من أكثر المسائل جدلاً بين العلماء. الخلاصة:
                </p>
                <div class="bg-blue-500/10 p-4 rounded-lg mb-4 border-r-4 border-blue-500">
                    <p class="font-bold mb-2">الرأي الأول (الجمهور):</p>
                    <p>الحلي المُعَدّة للزينة الشخصية المباحة لا زكاة فيها، بشرط:</p>
                    <ul class="list-disc list-inside mt-2 space-y-1">
                        <li>أن تكون للاستعمال الشخصي فقط</li>
                        <li>أن لا تكون للتجارة أو الادخار</li>
                        <li>أن لا تكون كمية مبالغ فيها</li>
                    </ul>
                </div>
                <div class="bg-green-500/10 p-4 rounded-lg mb-4 border-r-4 border-green-500">
                    <p class="font-bold mb-2">الرأي الثاني (الحنفية وابن حزم):</p>
                    <p>تجب الزكاة في كل ذهب بلغ النصاب، سواء كان حلياً أو سبائك، مستعملاً أو مدخراً.</p>
                </div>
                <p class="mb-4 text-sm italic">
                    💡 الأحوط: إخراج الزكاة احتياطاً، خاصة إذا كانت الكمية كبيرة أو غير مستخدمة بشكل منتظم.
                </p>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">كيف تُحسب زكاة الذهب؟</h3>
                <p class="mb-4">
                    مقدار الزكاة هو 2.5% من إجمالي الوزن، أي ربع العُشر. الطريقة:
                </p>

                <h4 class="text-lg font-bold text-yellow-400 mt-4 mb-2">الخطوة 1: احسب مجموع الذهب</h4>
                <p class="mb-4">اجمع كل الذهب لديك بنفس العيار. إذا كان لديك عيارات مختلفة، احسب كل عيار على حدة.</p>

                <h4 class="text-lg font-bold text-yellow-400 mt-4 mb-2">الخطوة 2: حوّل إلى عيار 24</h4>
                <div class="bg-gray-800/50 p-4 rounded-lg mb-4 font-mono">
                    <p>مثال: لديك 100 جرام عيار 21</p>
                    <p>التحويل: 100 × (21 ÷ 24) = 87.5 جرام عيار 24</p>
                    <p class="text-green-400 mt-2">✅ بلغ النصاب (أكثر من 85 جرام)</p>
                </div>

                <h4 class="text-lg font-bold text-yellow-400 mt-4 mb-2">الخطوة 3: احسب الزكاة</h4>
                <div class="bg-yellow-500/10 p-4 rounded-lg mb-4">
                    <p class="font-bold mb-2">الطريقة الأولى: بالجرامات</p>
                    <p class="font-mono">الزكاة = الوزن الكلي × 0.025</p>
                    <p class="mt-2">مثال: 100 جرام × 0.025 = 2.5 جرام</p>
                    
                    <p class="font-bold mt-4 mb-2">الطريقة الثانية: بالقيمة المالية</p>
                    <p class="font-mono">الزكاة = (الوزن × سعر الجرام الحالي) × 0.025</p>
                    <p class="mt-2">مثال: (100 × 3,500) × 0.025 = 8,750 جنيه</p>
                </div>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">هل تخرج الزكاة ذهباً أم نقوداً؟</h3>
                <p class="mb-4">
                    يجوز إخراج الزكاة بأي من الطريقتين:
                </p>
                <ul class="list-disc list-inside mb-4 space-y-2">
                    <li><strong>إخراج ذهب:</strong> تعطي مقدار الجرامات المطلوبة ذهباً</li>
                    <li><strong>إخراج نقود:</strong> تحسب قيمة الذهب بسعر اليوم وتدفع المبلغ (الأسهل)</li>
                </ul>
                <p class="mb-4 text-sm italic">
                    ⭐ الأفضل: إخراج النقود لأنها أنفع للفقير، إلا إذا احتاج للذهب نفسه.
                </p>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">متى تُخرج زكاة الذهب؟</h3>
                <div class="bg-blue-500/10 p-4 rounded-lg mb-4">
                    <p class="mb-2"><strong>الواجب:</strong> إخراجها فور حلول الحول (مرور السنة)</p>
                    <p class="mb-2"><strong>الجائز:</strong> تعجيلها قبل الحول لحاجة أو مصلحة</p>
                    <p class="mb-2"><strong>المحرّم:</strong> تأخيرها عن موعدها بدون عذر شرعي</p>
                </div>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">لمن تُعطى زكاة الذهب؟</h3>
                <p class="mb-4">
                    تُصرف لنفس الأصناف الثمانية المذكورة في القرآن:
                </p>
                <ol class="list-decimal list-inside mb-4 space-y-1">
                    <li>الفقراء (الذين لا يملكون قوت يومهم)</li>
                    <li>المساكين (الذين لا يسألون الناس)</li>
                    <li>العاملون على الزكاة</li>
                    <li>المؤلفة قلوبهم</li>
                    <li>في الرقاب (تحرير العبيد)</li>
                    <li>الغارمون (المدينون)</li>
                    <li>في سبيل الله</li>
                    <li>ابن السبيل (المسافر المنقطع)</li>
                </ol>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">أخطاء شائعة في زكاة الذهب</h3>
                <div class="bg-red-500/10 p-4 rounded-lg mb-4 border-r-4 border-red-500">
                    <p class="font-bold text-red-400 mb-2">❌ تجنب هذه الأخطاء:</p>
                    <ol class="list-decimal list-inside space-y-2">
                        <li>عدم احتساب الحلي المخزّن وغير المستعمل</li>
                        <li>نسيان تحويل العيارات إلى عيار 24 قبل جمعها</li>
                        <li>تأخير إخراج الزكاة بدون عذر</li>
                        <li>إعطاء الزكاة لغير المستحقين</li>
                        <li>احتساب المصنعية ضمن الوزن (المصنعية لا زكاة فيها)</li>
                    </ol>
                </div>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">نصائح عملية</h3>
                <ul class="list-disc list-inside mb-4 space-y-2">
                    <li>سجّل تاريخ شرائك للذهب لتتذكر موعد الحول</li>
                    <li>اجعل لك يوماً ثابتاً في السنة لإخراج الزكاة (مثل رمضان)</li>
                    <li>وزّن ذهبك مرة كل سنة عند صائغ موثوق</li>
                    <li>احتفظ بسجل مكتوب لكمية الذهب وتواريخه</li>
                    <li>استخدم الآلات الحاسبة الإلكترونية لتسهيل الحساب</li>
                </ul>

                <p class="text-sm italic text-gray-400 mt-6 bg-gray-800/30 p-4 rounded-lg">
                    📖 هذا المقال للتوعية العامة، ولأي استفسارات فقهية دقيقة، يُرجى الرجوع لعالم دين موثوق في منطقتك.
                </p>
            </div>
        `
    },

    6: {
        title: "الاستثمار في الذهب vs البورصة: أيهما أفضل؟",
        content: `
            <div class="prose prose-invert max-w-none">
                <p class="text-lg leading-relaxed mb-4">
                    الذهب والبورصة هما من أشهر وسائل الاستثمار، لكن أيهما أنسب لك؟ في هذا المقال المفصّل، نقارن بينهما من جميع الجوانب لمساعدتك في اتخاذ القرار الصحيح.
                </p>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">الذهب: الملاذ الآمن التقليدي</h3>
                <h4 class="text-lg font-bold text-yellow-400 mt-4 mb-2">✅ مميزات الاستثمار في الذهب</h4>
                <ul class="list-disc list-inside mb-4 space-y-2">
                    <li><strong>أمان مضمون:</strong> الذهب لا يفقد قيمته كلياً أبداً، حتى في أسوأ الأزمات</li>
                    <li><strong>حماية من التضخم:</strong> قيمة الذهب ترتفع مع ارتفاع الأسعار</li>
                    <li><strong>سيولة عالية:</strong> يمكن بيعه في أي وقت ومكان</li>
                    <li><strong>عدم الحاجة لخبرة:</strong> أي شخص يمكنه شراء الذهب والاحتفاظ به</li>
                    <li><strong>ملموس وحقيقي:</strong> أصل مادي تستطيع رؤيته ولمسه</li>
                </ul>

                <h4 class="text-lg font-bold text-yellow-400 mt-4 mb-2">❌ عيوب الاستثمار في الذهب</h4>
                <ul class="list-disc list-inside mb-4 space-y-2">
                    <li><strong>عوائد محدودة:</strong> الربح يأتي فقط من فرق السعر</li>
                    <li><strong>المصنعية:</strong> تكلفة إضافية عند الشراء (خاصة المشغولات)</li>
                    <li><strong>تكاليف التخزين:</strong> حاجة لخزنة أو بنك آمن</li>
                    <li><strong>مخاطر السرقة:</strong> الاحتفاظ المنزلي محفوف بالمخاطر</li>
                </ul>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">البورصة: فرص نمو أكبر</h3>
                <h4 class="text-lg font-bold text-yellow-400 mt-4 mb-2">✅ مميزات الاستثمار في البورصة</h4>
                <ul class="list-disc list-inside mb-4 space-y-2">
                    <li><strong>عوائد مرتفعة:</strong> إمكانية تحقيق أرباح كبيرة في وقت قصير</li>
                    <li><strong>أرباح موزعة:</strong> بعض الأسهم تدفع أرباحاً دورية للمساهمين</li>
                    <li><strong>تنويع سهل:</strong> يمكنك الاستثمار في قطاعات مختلفة</li>
                    <li><strong>سيولة عالية:</strong> بيع وشراء فوري إلكترونياً</li>
                    <li><strong>نمو مع الشركات:</strong> ربحك يزيد مع نجاح الشركة</li>
                </ul>

                <h4 class="text-lg font-bold text-yellow-400 mt-4 mb-2">❌ عيوب الاستثمار في البورصة</h4>
                <ul class="list-disc list-inside mb-4 space-y-2">
                    <li><strong>مخاطر عالية:</strong> احتمال خسارة كبيرة في وقت قصير</li>
                    <li><strong>تحتاج خبرة:</strong> فهم التحليل الفني والأساسي ضروري</li>
                    <li><strong>تقلبات يومية:</strong> الأسعار تتغير بشكل مستمر ومفاجئ</li>
                    <li><strong>عوامل خارجية:</strong> الأخبار السياسية والاقتصادية تؤثر بشدة</li>
                </ul>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">المقارنة المباشرة</h3>
                <div class="overflow-x-auto mb-6">
                    <table class="w-full border-collapse">
                        <thead>
                            <tr class="bg-yellow-500/20">
                                <th class="p-3 text-right">المعيار</th>
                                <th class="p-3">الذهب</th>
                                <th class="p-3">البورصة</th>
                            </tr>
                        </thead>
                        <tbody class="text-sm">
                            <tr class="bg-white/5">
                                <td class="p-3 font-bold">الأمان</td>
                                <td class="p-3 text-center text-green-400">عالي جداً ⭐⭐⭐⭐⭐</td>
                                <td class="p-3 text-center text-yellow-400">متوسط ⭐⭐⭐</td>
                            </tr>
                            <tr class="bg-white/5">
                                <td class="p-3 font-bold">العائد</td>
                                <td class="p-3 text-center text-yellow-400">متوسط ⭐⭐⭐</td>
                                <td class="p-3 text-center text-green-400">مرتفع ⭐⭐⭐⭐⭐</td>
                            </tr>
                            <tr class="bg-white/5">
                                <td class="p-3 font-bold">السيولة</td>
                                <td class="p-3 text-center text-green-400">عالية ⭐⭐⭐⭐</td>
                                <td class="p-3 text-center text-green-400">عالية جداً ⭐⭐⭐⭐⭐</td>
                            </tr>
                            <tr class="bg-white/5">
                                <td class="p-3 font-bold">الحاجة للخبرة</td>
                                <td class="p-3 text-center text-green-400">منخفضة ⭐⭐</td>
                                <td class="p-3 text-center text-red-400">عالية ⭐⭐⭐⭐</td>
                            </tr>
                            <tr class="bg-white/5">
                                <td class="p-3 font-bold">التقلبات</td>
                                <td class="p-3 text-center text-yellow-400">متوسطة ⭐⭐⭐</td>
                                <td class="p-3 text-center text-red-400">عالية ⭐⭐⭐⭐⭐</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">أيهما أنسب لك؟</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div class="bg-yellow-500/10 p-4 rounded-lg border-2 border-yellow-500/30">
                        <p class="font-bold text-yellow-400 mb-3">اختر الذهب إذا كنت:</p>
                        <ul class="list-disc list-inside space-y-1 text-sm">
                            <li>تبحث عن حفظ رأس المال</li>
                            <li>لا تريد المخاطرة الكبيرة</li>
                            <li>ليست لديك خبرة في الأسواق المالية</li>
                            <li>تستثمر لأكثر من 5 سنوات</li>
                            <li>تريد أصلاً ملموساً</li>
                        </ul>
                    </div>
                    
                    <div class="bg-blue-500/10 p-4 rounded-lg border-2 border-blue-500/30">
                        <p class="font-bold text-blue-400 mb-3">اختر البورصة إذا كنت:</p>
                        <ul class="list-disc list-inside space-y-1 text-sm">
                            <li>تبحث عن عوائد مرتفعة</li>
                            <li>مستعد لتحمل مخاطر أكبر</li>
                            <li>لديك معرفة بالتحليل المالي</li>
                            <li>تستطيع متابعة السوق يومياً</li>
                            <li>رأس مالك ليس كل ما تملك</li>
                        </ul>
                    </div>
                </div>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">الحل الأمثل: التنويع</h3>
                <p class="mb-4">
                    الخبراء الماليون ينصحون بعدم وضع كل أموالك في سلة واحدة. استراتيجية التنويع المثلى:
                </p>
                <div class="bg-green-500/10 p-4 rounded-lg mb-4">
                    <p class="font-bold mb-2">💡 محفظة متوازنة:</p>
                    <ul class="list-disc list-inside space-y-2">
                        <li><strong>40% ذهب:</strong> للحماية والاستقرار</li>
                        <li><strong>40% أسهم:</strong> للنمو والعوائد</li>
                        <li><strong>20% سيولة نقدية:</strong> للطوارئ والفرص</li>
                    </ul>
                    <p class="text-sm italic mt-3">*النسب تختلف حسب عمرك وأهدافك المالية</p>
                </div>
            </div>
        `
    },
    7: {
        title: "تاريخ الذهب في مصر: من الفراعنة إلى اليوم",
        content: `
            <div class="prose prose-invert max-w-none">
                <p class="text-lg leading-relaxed mb-4">
                    ارتبط اسم مصر بالذهب منذ فجر التاريخ. في هذه الرحلة الشيقة، نستعرض مسيرة الذهب المصري عبر آلاف السنين، من حضارة الفراعنة وحتى عصرنا الحديث.
                </p>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">العصر الفرعوني: أرض الذهب</h3>
                <p class="mb-4">
                    كانت مصر القديمة أغنى دول العالم بالذهب. استخرج الفراعنة الذهب من الصحراء الشرقية والنوبة، وصنعوا منه تحفاً خالدة ما زالت تبهر العالم حتى اليوم.
                </p>
                <ul class="list-disc list-inside mb-4 space-y-2">
                    <li><strong>قناع توت عنخ آمون:</strong> 11 كيلوجرام من الذهب الخالص</li>
                    <li><strong>تابوت الملك الذهبي:</strong> أكثر من 110 كيلوجرام</li>
                    <li><strong>كنوز الملكة حتشبسوت:</strong> آلاف القطع الذهبية</li>
                </ul>
                <p class="mb-4">
                    الذهب لم يكن مجرد زينة للفراعنة، بل كان رمزاً للخلود والقوة الإلهية. كانوا يعتقدون أن لحم الآلهة من ذهب.
                </p>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">العصر الإسلامي: الدينار الذهبي</h3>
                <p class="mb-4">
                    مع دخول الإسلام، أصبح الذهب أساس النظام النقدي. سُك الدينار الذهبي ليكون العملة الرسمية، وانتشرت صناعة المشغولات الذهبية الإسلامية الفريدة.
                </p>
                <p class="mb-4">
                    في عصر الفاطميين والأيوبيين والمماليك، ازدهرت تجارة الذهب وصناعته، وأصبحت القاهرة مركزاً عالمياً لتجارة المعادن الثمينة.
                </p>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">العصر الحديث: الجنيه الذهب المصري</h3>
                <p class="mb-4">
                    في عام 1834، أصدر محمد علي باشا أول جنيه ذهبي مصري حديث. كان يزن 8.5 جرام من الذهب الخالص، وأصبح العملة الرسمية للبلاد.
                </p>
                <p class="mb-4">
                    استمر الجنيه الذهبي حتى عام 1914، عندما توقف العمل بقاعدة الذهب عالمياً بسبب الحرب العالمية الأولى.
                </p>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">الذهب المصري اليوم</h3>
                <p class="mb-4">
                    اليوم، مصر واحدة من أكبر أسواق الذهب في الشرق الأوسط، بحجم تداول يتجاوز مليارات الجنيهات سنوياً. منطقة الصاغة في القاهرة تضم آلاف المحلات المتخصصة.
                </p>
                <p class="mb-4">
                    كما عادت الحكومة لإصدار الجنيهات والميداليات الذهبية التذكارية في المناسبات الوطنية الكبرى.
                </p>

                <p class="text-sm italic text-gray-400 mt-6">
                    💎 مصر والذهب: قصة حب عمرها 7000 سنة
                </p>
            </div>
        `
    },
    8: {
        title: "أخطاء شائعة عند شراء الذهب وكيف تتجنبها",
        content: `
            <div class="prose prose-invert max-w-none">
                <p class="text-lg leading-relaxed mb-4">
                    شراء الذهب قد يبدو بسيطاً، لكن هناك أخطاء شائعة قد تكلفك الكثير من المال. في هذا الدليل، نستعرض أبرز الأخطاء وكيفية تجنبها لشراء ذكي ومربح.
                </p>

                <h3 class="text-xl font-bold text-red-500 mt-6 mb-3">❌ الخطأ الأول: الشراء في وقت الذروة</h3>
                <p class="mb-4">
                    كثيرون يشترون الذهب عندما يكون السعر في قمته، خوفاً من أن يرتفع أكثر. هذا خطأ فادح!
                </p>
                <div class="bg-green-500/10 p-4 rounded-lg mb-4 border-r-4 border-green-500">
                    <p class="font-bold text-green-400 mb-2">✅ الحل:</p>
                    <ul class="list-disc list-inside space-y-1">
                        <li>اشترِ عندما ينخفض السعر، حتى لو قليلاً</li>
                        <li>وزّع مشترياتك على عدة شهور (Dollar Cost Averaging)</li>
                        <li>تابع الأخبار الاقتصادية العالمية</li>
                        <li>تجنب الشراء في المناسبات (الأسعار مرتفعة)</li>
                    </ul>
                </div>

                <h3 class="text-xl font-bold text-red-500 mt-6 mb-3">❌ الخطأ الثاني: إهمال المصنعية</h3>
                <p class="mb-4">
                    البعض يركز فقط على سعر الجرام وينسى أن المصنعية قد تصل إلى 15-20% من السعر الإجمالي، خاصة في المشغولات الدقيقة.
                </p>
                <div class="bg-green-500/10 p-4 rounded-lg mb-4 border-r-4 border-green-500">
                    <p class="font-bold text-green-400 mb-2">✅ الحل:</p>
                    <ul class="list-disc list-inside space-y-1">
                        <li>للاستثمار: اختر السبائك (مصنعية 1-2%)</li>
                        <li>للادخار: الجنيه الذهب (مصنعية 3-5%)</li>
                        <li>تجنب المشغولات المعقدة للاستثمار</li>
                        <li>قارن المصنعية بين عدة محلات</li>
                    </ul>
                </div>

                <h3 class="text-xl font-bold text-red-500 mt-6 mb-3">❌ الخطأ الثالث: عدم التأكد من العيار</h3>
                <p class="mb-4">
                    شراء ذهب دون فحص الدمغة والعيار قد يجعلك تدفع ثمن عيار 21 وأنت تحصل على عيار 18!
                </p>
                <div class="bg-green-500/10 p-4 rounded-lg mb-4 border-r-4 border-green-500">
                    <p class="font-bold text-green-400 mb-2">✅ الحل:</p>
                    <ul class="list-disc list-inside space-y-1">
                        <li>افحص الدمغة بعدسة مكبرة</li>
                        <li>اطلب شهادة من المحل</li>
                        <li>اشترِ من محلات معروفة فقط</li>
                        <li>وزّن القطعة في محل آخر للتأكد</li>
                    </ul>
                </div>

                <h3 class="text-xl font-bold text-red-500 mt-6 mb-3">❌ الخطأ الرابع: عدم طلب الفاتورة</h3>
                <p class="mb-4">
                    الفاتورة هي ضمانك الوحيد. بدونها، لن تستطيع إثبات ملكيتك أو العيار أو السعر الذي دفعته.
                </p>
                <div class="bg-green-500/10 p-4 rounded-lg mb-4 border-r-4 border-green-500">
                    <p class="font-bold text-green-400 mb-2">✅ الحل:</p>
                    <ul class="list-disc list-inside space-y-1">
                        <li>اطلب فاتورة ضريبية رسمية دائماً</li>
                        <li>تأكد من وجود كل التفاصيل عليها</li>
                        <li>احتفظ بها في مكان آمن</li>
                        <li>صوّرها وخزنها إلكترونياً</li>
                    </ul>
                </div>

                <h3 class="text-xl font-bold text-red-500 mt-6 mb-3">❌ الخطأ الخامس: البيع في وقت الحاجة</h3>
                <p class="mb-4">
                    بيع الذهب عند الحاجة الماسة للنقود يجبرك على قبول سعر منخفض.
                </p>
                <div class="bg-green-500/10 p-4 rounded-lg mb-4 border-r-4 border-green-500">
                    <p class="font-bold text-green-400 mb-2">✅ الحل:</p>
                    <ul class="list-disc list-inside space-y-1">
                        <li>احتفظ بسيولة نقدية منفصلة للطوارئ</li>
                        <li>لا تستثمر كل أموالك في الذهب</li>
                        <li>خطط لبيع الذهب في وقت مناسب</li>
                        <li>تابع الأسعار وانتظر الفرصة المناسبة</li>
                    </ul>
                </div>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">نصائح ذهبية للشراء الذكي</h3>
                <div class="bg-yellow-500/10 p-4 rounded-lg mb-4">
                    <ol class="list-decimal list-inside space-y-2">
                        <li>لا تستثمر أكثر من 30% من أموالك في الذهب</li>
                        <li>اشترِ للاستثمار طويل الأجل (5 سنوات+)</li>
                        <li>فضّل السبائك والجنيهات على المشغولات</li>
                        <li>قارن الأسعار بين 3 محلات على الأقل</li>
                        <li>تعلم قراءة الدمغة والأختام</li>
                        <li>احتفظ بالذهب في مكان آمن (خزنة بنك)</li>
                    </ol>
                </div>
            </div>
        `
    },
    9: {
        title: "الذهب الأبيض vs الأصفر: الفروقات والاختيار الأمثل",
        content: `
            <div class="prose prose-invert max-w-none">
                <p class="text-lg leading-relaxed mb-4">
                    الذهب الأبيض والذهب الأصفر كلاهما من الذهب الحقيقي، لكن الفرق بينهما كبير. في هذا الدليل الشامل، نكشف كل الحقائق لمساعدتك في اختيار الأنسب.
                </p>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">ما هو الذهب الأبيض؟</h3>
                <p class="mb-4">
                    الذهب الأبيض هو ذهب أصفر خالص (عيار 18 عادة) تم خلطه بمعادن بيضاء مثل:
                </p>
                <ul class="list-disc list-inside mb-4 space-y-2">
                    <li><strong>البلاديوم:</strong> الأغلى والأقوى</li>
                    <li><strong>النيكل:</strong> رخيص لكن قد يسبب حساسية</li>
                    <li><strong>الفضة:</strong> يضيف بياضاً طبيعياً</li>
                    <li><strong>النحاس والزنك:</strong> للصلابة</li>
                </ul>
                <p class="mb-4">
                    بعد الخلط، تُطلى القطعة بطبقة رقيقة من الروديوم (معدن نادر) لإعطائها بريقاً فضياً لامعاً.
                </p>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">المقارنة الشاملة</h3>
                <div class="overflow-x-auto mb-6">
                    <table class="w-full border-collapse text-sm">
                        <thead>
                            <tr class="bg-yellow-500/20">
                                <th class="p-3 text-right">الخاصية</th>
                                <th class="p-3">الذهب الأصفر</th>
                                <th class="p-3">الذهب الأبيض</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="bg-white/5">
                                <td class="p-3 font-bold">التركيب</td>
                                <td class="p-3">ذهب + نحاس + فضة</td>
                                <td class="p-3">ذهب + بلاديوم/نيكل + طلاء روديوم</td>
                            </tr>
                            <tr class="bg-white/5">
                                <td class="p-3 font-bold">اللون</td>
                                <td class="p-3">أصفر طبيعي ثابت</td>
                                <td class="p-3">أبيض فضي (قد يصفر مع الوقت)</td>
                            </tr>
                            <tr class="bg-white/5">
                                <td class="p-3 font-bold">الصيانة</td>
                                <td class="p-3 text-green-400">لا يحتاج (تلميع فقط)</td>
                                <td class="p-3 text-red-400">يحتاج إعادة طلاء كل 2-3 سنوات</td>
                            </tr>
                            <tr class="bg-white/5">
                                <td class="p-3 font-bold">السعر</td>
                                <td class="p-3">أقل (حسب سعر الذهب فقط)</td>
                                <td class="p-3">أعلى (+10-20% بسبب البلاديوم والطلاء)</td>
                            </tr>
                            <tr class="bg-white/5">
                                <td class="p-3 font-bold">الحساسية</td>
                                <td class="p-3 text-green-400">نادرة جداً</td>
                                <td class="p-3 text-yellow-400">محتملة (إذا يحتوي نيكل)</td>
                            </tr>
                            <tr class="bg-white/5">
                                <td class="p-3 font-bold">القيمة الاستثمارية</td>
                                <td class="p-3 text-green-400">عالية (ذهب خالص)</td>
                                <td class="p-3 text-yellow-400">أقل (بسبب المعادن المضافة)</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">أيهما أفضل للاستثمار؟</h3>
                <div class="bg-yellow-500/10 p-4 rounded-lg mb-4 border-r-4 border-yellow-500">
                    <p class="font-bold mb-2">🏆 الفائز: الذهب الأصفر</p>
                    <p class="mb-2">الأسباب:</p>
                    <ul class="list-disc list-inside space-y-1">
                        <li>قيمة أعلى عند البيع (ذهب خالص)</li>
                        <li>لا يفقد لونه أو طلاءه</li>
                        <li>مقبول عالمياً بسعر أفضل</li>
                        <li>أقل تكلفة شراء وصيانة</li>
                    </ul>
                </div>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">أيهما أجمل للزينة؟</h3>
                <p class="mb-4">
                    هذا يعتمد على الذوق الشخصي:
                </p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div class="bg-yellow-500/10 p-4 rounded-lg">
                        <p class="font-bold text-yellow-400 mb-2">اختر الذهب الأصفر إذا:</p>
                        <ul class="list-disc list-inside space-y-1 text-sm">
                            <li>تحبين الطابع الكلاسيكي التقليدي</li>
                            <li>بشرتك دافئة أو سمراء</li>
                            <li>تريدين قطعة لا تحتاج صيانة</li>
                        </ul>
                    </div>
                    <div class="bg-gray-500/10 p-4 rounded-lg">
                        <p class="font-bold text-gray-300 mb-2">اختر الذهب الأبيض إذا:</p>
                        <ul class="list-disc list-inside space-y-1 text-sm">
                            <li>تفضلين المظهر العصري الأنيق</li>
                            <li>بشرتك فاتحة أو باردة اللون</li>
                            <li>تريدين قطعة تناسب الماس واللؤلؤ</li>
                        </ul>
                    </div>
                </div>

                <h3 class="text-xl font-bold text-red-500 mt-6 mb-3">⚠️ تحذيرات مهمة</h3>
                <div class="bg-red-500/10 p-4 rounded-lg mb-4 border-r-4 border-red-500">
                    <ol class="list-decimal list-inside space-y-2">
                        <li><strong>الذهب الأبيض يصفر مع الوقت:</strong> طلاء الروديوم يزول تدريجياً</li>
                        <li><strong>إعادة الطلاء تكلف نقوداً:</strong> 200-500 جنيه كل مرة</li>
                        <li><strong>تجنب الذهب الأبيض بالنيكل:</strong> قد يسبب حساسية وحكة</li>
                        <li><strong>قيمة إعادة البيع أقل:</strong> التجار يشترونه بسعر أقل من الأصفر</li>
                    </ol>
                </div>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">نصيحة الخبراء</h3>
                <p class="mb-4">
                    إذا كنت محتاراً، اشترِ القطع الصغيرة (أقراط، سلاسل رقيقة) بالذهب الأبيض للزينة، والقطع الكبيرة (أساور، عقود) بالذهب الأصفر للاستثمار والادخار.
                </p>
            </div>
        `
    },
    10: {
        title: "كيف تؤثر الأحداث العالمية على سعر الذهب؟",
        content: `
            <div class="prose prose-invert max-w-none">
                <p class="text-lg leading-relaxed mb-4">
                    سعر الذهب لا يتحرك عشوائياً - بل يتأثر بشدة بالأحداث السياسية والاقتصادية العالمية. فهم هذه العلاقة يساعدك على توقع تحركات السوق واتخاذ قرارات استثمارية ذكية.
                </p>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">1. الحروب والأزمات السياسية</h3>
                <p class="mb-4">
                    عندما تندلع حرب أو أزمة سياسية كبرى، يهرب المستثمرون إلى الذهب كملاذ آمن. أمثلة حديثة:
                </p>
                <ul class="list-disc list-inside mb-4 space-y-2">
                    <li><strong>الحرب الروسية الأوكرانية (2022):</strong> ارتفع الذهب من 1,800$ إلى أكثر من 2,000$</li>
                    <li><strong>التوترات في الشرق الأوسط:</strong> كل صراع يدفع الأسعار للأعلى</li>
                    <li><strong>الانتخابات المصيرية:</strong> عدم اليقين السياسي يعزز الطلب على الذهب</li>
                </ul>
                <div class="bg-blue-500/10 p-4 rounded-lg mb-4">
                    <p class="font-bold text-blue-400 mb-2">💡 القاعدة:</p>
                    <p>كلما زاد الخوف والقلق العالمي، ارتفع سعر الذهب. المستثمرون يعتبرونه "تأميناً ضد الفوضى".</p>
                </div>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">2. التضخم وأسعار الفائدة</h3>
                <p class="mb-4">
                    التضخم هو العدو الأول للعملات الورقية، والصديق الأول للذهب.
                </p>
                <h4 class="text-lg font-bold text-yellow-400 mt-4 mb-2">عندما يرتفع التضخم:</h4>
                <ul class="list-disc list-inside mb-4 space-y-2">
                    <li>القوة الشرائية للنقود تنخفض</li>
                    <li>الناس يشترون الذهب لحماية ثرواتهم</li>
                    <li>سعر الذهب يرتفع كتعويض عن انخفاض قيمة العملة</li>
                </ul>

                <h4 class="text-lg font-bold text-yellow-400 mt-4 mb-2">عندما يرفع الفيدرالي الأمريكي أسعار الفائدة:</h4>
                <ul class="list-disc list-inside mb-4 space-y-2">
                    <li>الدولار يصبح أكثر جاذبية (عوائد أعلى)</li>
                    <li>المستثمرون يبيعون الذهب ويشترون السندات</li>
                    <li>سعر الذهب ينخفض مؤقتاً</li>
                </ul>

                <div class="bg-yellow-500/10 p-4 rounded-lg mb-4 border border-yellow-500/30">
                    <p class="font-mono text-center text-lg mb-2">📊 المعادلة:</p>
                    <p class="text-center">تضخم مرتفع + فائدة منخفضة = ارتفاع الذهب 📈</p>
                    <p class="text-center">تضخم منخفض + فائدة مرتفعة = انخفاض الذهب 📉</p>
                </div>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">3. قوة الدولار الأمريكي</h3>
                <p class="mb-4">
                    الذهب يُسعّر بالدولار عالمياً، لذلك هناك علاقة عكسية قوية بينهما:
                </p>
                <ul class="list-disc list-inside mb-4 space-y-2">
                    <li><strong>دولار قوي =</strong> ذهب أرخص (لأن المشترين غير الأمريكيين يدفعون أكثر)</li>
                    <li><strong>دولار ضعيف =</strong> ذهب أغلى (يصبح أرخص للمشترين الأجانب)</li>
                </ul>
                <p class="mb-4">
                    مثال: عندما ينخفض الدولار بنسبة 5%، يرتفع الذهب عادة بنسبة 3-7%.
                </p>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">4. البنوك المركزية وشراء الذهب</h3>
                <p class="mb-4">
                    البنوك المركزية (خاصة في الصين وروسيا والهند) تشتري مئات الأطنان من الذهب سنوياً لتنويع احتياطاتها.
                </p>
                <div class="bg-green-500/10 p-4 rounded-lg mb-4">
                    <p class="font-bold text-green-400 mb-2">📈 إحصائية مهمة:</p>
                    <p>في 2022-2023، اشترت البنوك المركزية العالمية أكثر من 1,000 طن ذهب - أعلى رقم منذ 50 عاماً!</p>
                </div>
                <p class="mb-4">
                    هذا الطلب الضخم يدعم الأسعار ويمنعها من الانهيار حتى في الأوقات الهادئة.
                </p>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">5. الأزمات الاقتصادية والركود</h3>
                <p class="mb-4">
                    في أوقات الركود الاقتصادي:
                </p>
                <ul class="list-disc list-inside mb-4 space-y-2">
                    <li>الأسهم تنخفض</li>
                    <li>البطالة ترتفع</li>
                    <li>الخوف من المستقبل يزداد</li>
                    <li>الناس يهرعون لشراء الذهب</li>
                </ul>
                <p class="mb-4">
                    أمثلة تاريخية:
                </p>
                <ul class="list-disc list-inside mb-4 space-y-2">
                    <li><strong>أزمة 2008 المالية:</strong> ارتفع الذهب من 800$ إلى 1,900$</li>
                    <li><strong>جائحة كورونا 2020:</strong> قفز من 1,500$ إلى 2,070$ في أشهر</li>
                </ul>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">كيف تستفيد من هذه المعلومات؟</h3>
                <div class="bg-blue-500/10 p-4 rounded-lg mb-4 border-r-4 border-blue-500">
                    <p class="font-bold mb-2">🎯 استراتيجيات ذكية:</p>
                    <ol class="list-decimal list-inside space-y-2">
                        <li><strong>تابع الأخبار العالمية:</strong> اشترك في نشرات أخبار اقتصادية موثوقة</li>
                        <li><strong>راقب قرارات الفيدرالي:</strong> تُعلن كل 6 أسابيع تقريباً</li>
                        <li><strong>اشترِ عند الأزمات:</strong> عندما يخاف الجميع، تكون الفرصة</li>
                        <li><strong>بِع عند القمم:</strong> عندما يصل السعر لمستويات تاريخية</li>
                        <li><strong>احتفظ بجزء دائماً:</strong> 10-20% من محفظتك ذهب كتأمين</li>
                    </ol>
                </div>

                <h3 class="text-xl font-bold text-yellow-500 mt-6 mb-3">جدول الأحداث وتأثيرها</h3>
                <div class="overflow-x-auto mb-6">
                    <table class="w-full border-collapse text-sm">
                        <thead>
                            <tr class="bg-yellow-500/20">
                                <th class="p-3 text-right">الحدث</th>
                                <th class="p-3">التأثير على الذهب</th>
                                <th class="p-3">درجة التأثير</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="bg-white/5">
                                <td class="p-3 font-bold">حرب أو صراع كبير</td>
                                <td class="p-3 text-green-400">ارتفاع قوي ↑↑</td>
                                <td class="p-3 text-center">⭐⭐⭐⭐⭐</td>
                            </tr>
                            <tr class="bg-white/5">
                                <td class="p-3 font-bold">رفع أسعار الفائدة</td>
                                <td class="p-3 text-red-400">انخفاض مؤقت ↓</td>
                                <td class="p-3 text-center">⭐⭐⭐⭐</td>
                            </tr>
                            <tr class="bg-white/5">
                                <td class="p-3 font-bold">تضخم مرتفع</td>
                                <td class="p-3 text-green-400">ارتفاع تدريجي ↑</td>
                                <td class="p-3 text-center">⭐⭐⭐⭐</td>
                            </tr>
                            <tr class="bg-white/5">
                                <td class="p-3 font-bold">ضعف الدولار</td>
                                <td class="p-3 text-green-400">ارتفاع ↑</td>
                                <td class="p-3 text-center">⭐⭐⭐⭐</td>
                            </tr>
                            <tr class="bg-white/5">
                                <td class="p-3 font-bold">ركود اقتصادي</td>
                                <td class="p-3 text-green-400">ارتفاع قوي ↑↑</td>
                                <td class="p-3 text-center">⭐⭐⭐⭐⭐</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <p class="text-sm italic text-gray-400 mt-6 bg-gray-800/30 p-4 rounded-lg">
                    💡 الخلاصة: الذهب ليس مجرد معدن لامع - إنه مرآة تعكس مخاوف وآمال العالم. فهم هذه الديناميكيات يحولك من مشترٍ عادي إلى مستثمر ذكي.
                </p>
            </div>
        `
    }
};

function openArticle(id) {
    const article = articlesData[id];
    document.getElementById('modalTitle').innerText = article.title;
    document.getElementById('modalContent').innerHTML = article.content;
    document.getElementById('articleModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeArticle() {
    document.getElementById('articleModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// البحث
document.getElementById('blogSearch')?.addEventListener('input', function(e) {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('.blog-card').forEach(card => {
        card.style.display = card.innerText.toLowerCase().includes(term) ? 'block' : 'none';
    });
});

function acceptCookies() {
    localStorage.setItem('cookiesAccepted', 'true');
    document.getElementById('cookie-notice').classList.add('hidden');
}

window.onload = function() {
    if (!localStorage.getItem('cookiesAccepted')) {
        document.getElementById('cookie-notice').classList.remove('hidden');
    }
}



//الذكاة دالة الحاسبة


function setupZakatCalculator() {

    const weightInput = document.getElementById('zakatWeight');
    const caratSelect = document.getElementById('zakatCarat');
    const statusDiv = document.getElementById('zakatStatus');
    const gramRes = document.getElementById('zakatGram');
    const moneyRes = document.getElementById('zakatMoney');

    function calculateZakat() {

        const weight = parseFloat(weightInput.value) || 0;
        const carat = parseInt(caratSelect.value);

        const equivalent24 = (weight * carat) / 24;
        const NISAB = 85;

        if (weight === 0) {
            statusDiv.innerText = "أدخل الوزن للحساب...";
            gramRes.innerText = "0";
            moneyRes.innerText = "0";
            return;
        }

        if (equivalent24 >= NISAB) {

            statusDiv.innerText = "✅ بلغ النصاب - تجب عليه الزكاة";

            const zakatGrams = weight * 0.025;

            let pricePerGram;
            if (carat === 24) pricePerGram = state.g24;
            else if (carat === 21) pricePerGram = state.g24 * 0.875;
            else if (carat === 18) pricePerGram = state.g24 * 0.75;

            const zakatCash = zakatGrams * pricePerGram;

            gramRes.innerText = zakatGrams.toFixed(2);

            // ✅ تم تصحيح المتغير هنا
            moneyRes.innerText =
                Math.round(zakatCash).toLocaleString() + " ج.م";

        } else {
            statusDiv.innerText = "⚠️ لم يبلغ النصاب بعد";
            gramRes.innerText = "0";
            moneyRes.innerText = "0";
        }
    }

    weightInput.addEventListener('input', calculateZakat);
    caratSelect.addEventListener('change', calculateZakat);
}
// 1. قاموس النصوص


const translations = {
    ar: {
        btn: "English",
        Currency: "العملات",
        subTitle: "أسعار الذهب الآن في مصر لحظة بلحظة",
        gold: "الذهب",
        logoName: "💰 ذهب وعملة",
        liveStatus: "مباشر",
        goldTitle: "السوق الآن",
        currTitle: "أسعار العملات مقابل الجنيه",
        unit: "ج.م",
        carat24: "عيار 24",
        carat21: "عيار 21",
        carat18: "عيار 18",
        carat12: "عيار 12",
        ounceUS: "الاونصة العالمية",
        ounceEGP: "الاونصه المصرية",
        coieGold: "الجنيه الذهب",
        silver: "سعر الفضة",
        labor: "المصنعية",
        weightG: "الوزن بالجرام",
        g_k_21: "عيار 21",
        g_k_18: "عيار 18",
        g_k_24: "عيار 24",
        transaction:"المعاملة",
        price: "السعر",
        ounceGlobal: "الأونصة العالمي",
        ounce_egp: "الأونصة المصري",
        silver_t: "جرام الفضه",
        coin_t: "الجنيه الذهب",
        g24_t: "عيار 24",
        g21_t: "عيار 21",
        g18_t: "عيار 18",
        g12_t: "عيار 12",
        txt_currency: "العملات",
        currencyTitle: "أسعار العملات مقابل الجنيه",
        txt_gold: "الذهب",
        devoling: "تطور أسعار الذهب خلال الفتره الماضيه",
        Summary: "ملخص أبرز العبارات والوحدات حسب آخر تحديث",
        lastUpdate: "آخر تحديث:",
        g_w: "أدخل الوزن",
        zakatTitle: "حاسبة زكاة الذهب",
        zakatCarat24: "عيار 24",
        zakatCarat21: "عيار 21",
        zakatCarat18: "عيار 18",
        currCalc: "حاسبة تحويل العملات",
        zakatStatus: "أدخل الوزن والعيار لحساب الزكاة",
        zakatGram: "جرام الزكاة",
        zakatMoneyLabel_1: "قيمة الزكاة بالجنيه",
        calcAmountLabel: "المبلغ",  
        fromCurrencyLabel: "من",
        fromCurrencyUSD: "دولار أمريكي (USD)",
        fromCurrencySAR: "ريال سعودي (SAR)",    
        fromCurrencyAED: "درهم إماراتي (AED)",
        fromCurrencyKWD: "دينار كويتي (KWD)",
        fromCurrencyJOD: "دينار أردني (JOD)",
        fromCurrencyQAR: "ريال قطري (QAR)",
        calcResultLabel: "النتيجة بالجنيه المصري",
        whyGoldPriceChangeTitle: "لماذا يتغيّر سعر الذهب؟",  

    },
    en: {
        btn: "العربية",
        Currency: "Currency",
        gold: "Gold",
        subTitle: "Live Prices in Egypt",
        logoName: "💰 Currency & Gold",
        goldTitle: "Live Gold Prices",
        liveStatus: "Live",
        currTitle: "Currency Rates vs EGP",
        unit: "EGP",
        carat24: "24K Gold",
        carat21: "21K Gold",
        carat18: "18K Gold",
        carat12: "12K Gold",
        ounceUS: "Ounce Price",
        ounceEGP: "Ounce EGP Price",
        coieGold: "Gold Coin Price",
        silver: "Silver Price",
        labor: "Manufacturing Cost",
        weightG: "Weight in Grams",
        g_k_21: "21K Gold",
        g_k_18: "18K Gold",
        g_k_24: "24K Gold",
        txt_currency: "Currency",
        txt_gold: "Gold",
        currencyTitle: "Currency Rates vs EGP",
        transaction:"Transaction",
        price: "Price",
        ounceGlobal: "Global Ounce",
        ounce_egp: "EGP Ounce",
        silver_t: "Silver per Gram",
        coin_t: "Gold Coin",
        g24_t: "24K Gold",
        g21_t: "21K Gold",
        g18_t: "18K Gold",
        g12_t: "12K Gold",
        currCalc: "Currency Converter",
        devoling: "Unveiling the Latest Gold Price Trends",
        Summary: "Summary according to the latest update",
        lastUpdate: "Last Update:",
        zakatTitle: "Gold Zakat Calculator",
        zakatCarat24: "24K Carat",
        zakatCarat21: "21K Carat",
        zakatCarat18: "18K Carat",
        zakatStatus: "Enter weight and carat to calculate Zakat",
        zakatGram: "Zakat in Grams",
        zakatMoneyLabel_1: "Zakat in EGP", 
        calcAmountLabel: "Amount",
        fromCurrencyLabel: "From",
        fromCurrencyUSD: "US Dollar (USD)",
        fromCurrencySAR: "Saudi Riyal (SAR)",
        fromCurrencyAED: "UAE Dirham (AED)",
        fromCurrencyKWD: "Kuwaiti Dinar (KWD)",
        fromCurrencyJOD: "Jordanian Dinar (JOD)",
        fromCurrencyQAR: "Qatari Riyal (QAR)",
        calcResultLabel: "النتيجة بالجنيه المصري",
        whyGoldPriceChangeTitle: "لماذا يتغيّر سعر الذهب؟",
    }
};


function toggleLanguage() {
    // تبديل اللغة
    state.lang = state.lang === 'ar' ? 'en' : 'ar';
    const t = translations[state.lang];

    // تغيير خصائص الـ HTML
    const htmlTag = document.documentElement;
    htmlTag.dir = state.lang === 'ar' ? 'rtl' : 'ltr';
    htmlTag.lang = state.lang;

    // عناصر الموقع اللي هتتغير نصوصها
    const elements = [
        'btn-lang','gold','Currency', 'txt_gold', 'currencyTitle','currCalc','txt_currency',
        'carat24','carat21','carat18','carat12','ounceUS','ounceEGP','coieGold','silver',
        'logoName','subTitle','goldTitle','currTitle','labor','liveStatus',
        'ounceGlobal','ounce_egp','silver_t','coin_t','g24_t','g21_t','g18_t','g12_t',
        'Summary','price','transaction','devoling','lastUpdate',
        'zakatCarat24','zakatCarat21','zakatCarat18',
        'g-w','g_k_21','g_k_18','g_k_24','zakatTitle','zakatStatus','zakatGram',
        'zakatMoneyLabel_1','calcAmountLabel','fromCurrencyLabel','fromCurrencyUSD','fromCurrencySAR','fromCurrencyAED',
        'fromCurrencyKWD','fromCurrencyJOD','fromCurrencyQAR','fromCurrencyBHD','fromCurrencyOMR','fromCurrencyLBP','fromCurrencyEGP',
        'toCurrencyLabel','toCurrencyUSD','toCurrencySAR','toCurrencyAED','toCurrencyKWD','toCurrencyJOD',
        'toCurrencyQAR','toCurrencyBHD','toCurrencyOMR','toCurencyLBP','toCurrencyEGP'
    ];

    elements.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            // لو العنصر input أو textarea غيره يكون placeholder
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = t[id] || el.placeholder;
            } else {
                el.innerText = t[id] || el.innerText;
            }
        }
    });
}



// =======================
// تشغيل التطبيق
// =======================

setupZakatCalculator();
setupCurrencyCalculator();
init();




