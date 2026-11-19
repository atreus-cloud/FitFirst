// Food search across: Katori (128 Indian dish preparations), INDB (1,014 Indian recipes), IFCT 2017 (528 core Indian foods), FitFirst quick list,
// Supabase foods table (optional), Open Food Facts (packaged foods, live) and USDA FoodData Central (live).
const fs=require('fs');
const path=require('path');
const load=f=>{try{const d=JSON.parse(fs.readFileSync(path.join(__dirname,'../../data',f),'utf8'));return Array.isArray(d)?d:[]}catch(_){return []}};
const KATORI=load('katori-foods.json');
const INDB=load('indb-foods.json');
const IFCT=load('ifct-foods.json');
const UA='FitFirst/0.5 (calorie tracker; https://github.com/atreus-cloud/fit-first-)';

const CURATED = [
 {id:'if-local-001',name:'Idli',aliases:'idly',category:'South Indian',source:'FitFirst quick list',basis:'2 medium (120 g)',grams:120,kcal:140,protein:4,carbs:29,fat:1,fiber:2,sugar:1,sodium:280},
 {id:'if-local-002',name:'Plain dosa',category:'South Indian',source:'FitFirst quick list',basis:'1 medium (100 g)',grams:100,kcal:168,protein:4,carbs:27,fat:5,fiber:1,sugar:1,sodium:310},
 {id:'if-local-003',name:'Masala dosa',category:'South Indian',source:'FitFirst quick list',basis:'1 medium (180 g)',grams:180,kcal:320,protein:6,carbs:48,fat:11,fiber:4,sugar:3,sodium:650},
 {id:'if-local-004',name:'Sambar',category:'South Indian',source:'FitFirst quick list',basis:'1 cup (200 g)',grams:200,kcal:120,protein:6,carbs:18,fat:3,fiber:5,sugar:4,sodium:600},
 {id:'if-local-005',name:'Curd rice',aliases:'thayir sadam dahi chawal',category:'South Indian',source:'FitFirst quick list',basis:'1 bowl (250 g)',grams:250,kcal:330,protein:9,carbs:54,fat:9,fiber:1,sugar:5,sodium:300},
 {id:'if-local-006',name:'Chicken biryani',category:'Indian meal',source:'FitFirst quick list',basis:'1 plate (350 g)',grams:350,kcal:600,protein:32,carbs:72,fat:22,fiber:3,sugar:4,sodium:1100},
 {id:'if-local-007',name:'Chicken 65',category:'Indian meal',source:'FitFirst quick list',basis:'100 g',grams:100,kcal:280,protein:22,carbs:12,fat:17,fiber:1,sugar:1,sodium:650},
 {id:'if-local-008',name:'Tandoori chicken',category:'Indian meal',source:'FitFirst quick list',basis:'1 leg (180 g)',grams:180,kcal:300,protein:38,carbs:4,fat:14,fiber:0,sugar:2,sodium:700},
 {id:'if-local-009',name:'Paneer',category:'Ingredient',source:'FitFirst quick list',basis:'100 g',grams:100,kcal:265,protein:18,carbs:4,fat:20,fiber:0,sugar:2,sodium:400},
 {id:'if-local-010',name:'Soya chunks, cooked',category:'Ingredient',source:'FitFirst quick list',basis:'100 g',grams:100,kcal:170,protein:26,carbs:14,fat:1,fiber:5,sugar:3,sodium:20},
 {id:'if-local-011',name:'Cooked white rice',aliases:'rice sadam chawal',category:'Ingredient',source:'FitFirst quick list',basis:'1 cup (160 g)',grams:160,kcal:205,protein:4,carbs:45,fat:.5,fiber:.6,sugar:.1,sodium:2},
 {id:'if-local-012',name:'Chapati',aliases:'roti phulka chapathi',category:'North Indian',source:'FitFirst quick list',basis:'1 medium (40 g)',grams:40,kcal:120,protein:3,carbs:22,fat:3,fiber:3,sugar:1,sodium:180},
 {id:'if-local-013',name:'Boiled egg',aliases:'egg anda',category:'Ingredient',source:'FitFirst quick list',basis:'1 large (50 g)',grams:50,kcal:78,protein:6.3,carbs:.6,fat:5.3,fiber:0,sugar:.6,sodium:62},
 {id:'if-local-014',name:'Banana',category:'Fruit',source:'FitFirst quick list',basis:'1 medium (118 g)',grams:118,kcal:105,protein:1.3,carbs:27,fat:.4,fiber:3.1,sugar:14,sodium:1},
 {id:'if-local-015',name:'Oats with milk',aliases:'oats oatmeal porridge',category:'Breakfast',source:'FitFirst quick list',basis:'1 bowl',grams:300,kcal:300,protein:13,carbs:45,fat:8,fiber:5,sugar:12,sodium:140},
 {id:'if-local-016',name:'Greek yogurt, plain',category:'Dairy',source:'FitFirst quick list',basis:'100 g',grams:100,kcal:60,protein:10,carbs:4,fat:0,fiber:0,sugar:4,sodium:36},
 {id:'if-local-017',name:'Burger',category:'Fast food',source:'FitFirst quick list',basis:'1 burger (220 g)',grams:220,kcal:520,protein:25,carbs:47,fat:26,fiber:3,sugar:8,sodium:1050},
 {id:'if-local-018',name:'Fried chicken',category:'Fast food',source:'FitFirst quick list',basis:'100 g',grams:100,kcal:290,protein:22,carbs:12,fat:18,fiber:1,sugar:1,sodium:700},
 {id:'if-local-019',name:'Soft drink',category:'Beverage',source:'FitFirst quick list',basis:'350 ml',grams:350,kcal:150,protein:0,carbs:39,fat:0,fiber:0,sugar:39,sodium:25},
 {id:'if-local-020',name:'Apple',category:'Fruit',source:'FitFirst quick list',basis:'1 medium (180 g)',grams:180,kcal:95,protein:.5,carbs:25,fat:.3,fiber:4.4,sugar:19,sodium:2},
 {id:'if-local-021',name:'Peanut butter',category:'Ingredient',source:'FitFirst quick list',basis:'1 tbsp (16 g)',grams:16,kcal:95,protein:4,carbs:3,fat:8,fiber:1,sugar:1,sodium:75},
 {id:'if-local-022',name:'Whey protein powder',aliases:'protein shake',category:'Supplement food',source:'FitFirst quick list',basis:'1 scoop (30 g)',grams:30,kcal:120,protein:24,carbs:3,fat:2,fiber:0,sugar:1,sodium:120},
 {id:'if-local-023',name:'Pongal, ven',category:'South Indian',source:'FitFirst quick list',basis:'1 bowl (250 g)',grams:250,kcal:360,protein:10,carbs:53,fat:12,fiber:4,sugar:2,sodium:550},
 {id:'if-local-024',name:'Upma',category:'South Indian',source:'FitFirst quick list',basis:'1 bowl (250 g)',grams:250,kcal:280,protein:7,carbs:42,fat:9,fiber:4,sugar:3,sodium:500},
 {id:'if-local-025',name:'Chole',aliases:'chana masala chickpea curry chole bhature',category:'North Indian',source:'FitFirst quick list',basis:'1 cup (200 g)',grams:200,kcal:280,protein:12,carbs:42,fat:8,fiber:11,sugar:6,sodium:650},
 {id:'if-local-026',name:'Dal, cooked',category:'Indian food',source:'FitFirst quick list',basis:'1 cup (200 g)',grams:200,kcal:230,protein:14,carbs:36,fat:5,fiber:10,sugar:3,sodium:400},
 {id:'if-local-027',name:'Chicken curry',category:'Indian meal',source:'FitFirst quick list',basis:'1 cup (240 g)',grams:240,kcal:320,protein:28,carbs:12,fat:18,fiber:2,sugar:4,sodium:750},
 {id:'if-local-028',name:'Paniyaram',category:'South Indian',source:'FitFirst quick list',basis:'4 pieces (160 g)',grams:160,kcal:290,protein:7,carbs:42,fat:10,fiber:3,sugar:2,sodium:480},
 {id:'if-local-029',name:'Filter coffee with milk and sugar',aliases:'kaapi coffee',category:'Beverage',source:'FitFirst quick list',basis:'1 tumbler (150 ml)',grams:150,kcal:85,protein:3,carbs:10,fat:3,fiber:0,sugar:9,sodium:45},
 {id:'if-local-031',name:'Appam',category:'South Indian',source:'FitFirst quick list',basis:'2 appam (140 g)',grams:140,kcal:280,protein:5,carbs:53,fat:5,fiber:2,sugar:4,sodium:300},
 {id:'if-local-032',name:'Puttu',category:'Kerala',source:'FitFirst quick list',basis:'1 serving (180 g)',grams:180,kcal:310,protein:6,carbs:64,fat:4,fiber:4,sugar:2,sodium:180},
 {id:'if-local-033',name:'Poori',category:'Indian bread',source:'FitFirst quick list',basis:'2 pieces (90 g)',grams:90,kcal:270,protein:6,carbs:36,fat:12,fiber:2,sugar:1,sodium:260},
 {id:'if-local-034',name:'Aloo paratha',category:'North Indian',source:'FitFirst quick list',basis:'1 paratha (150 g)',grams:150,kcal:330,protein:8,carbs:48,fat:12,fiber:5,sugar:3,sodium:550},
 {id:'if-local-035',name:'Rasam',category:'South Indian',source:'FitFirst quick list',basis:'1 cup (200 g)',grams:200,kcal:70,protein:3,carbs:12,fat:1,fiber:3,sugar:3,sodium:450},
 {id:'if-local-036',name:'Kootu',category:'South Indian',source:'FitFirst quick list',basis:'1 bowl (200 g)',grams:200,kcal:180,protein:8,carbs:22,fat:7,fiber:6,sugar:4,sodium:420},
 {id:'if-local-037',name:'Vegetable kurma',category:'South Indian',source:'FitFirst quick list',basis:'1 cup (220 g)',grams:220,kcal:240,protein:5,carbs:24,fat:14,fiber:5,sugar:6,sodium:600},
 {id:'if-local-038',name:'Chicken biryani, home-style',category:'Indian meal',source:'FitFirst quick list',basis:'1 plate (350 g)',grams:350,kcal:560,protein:30,carbs:68,fat:20,fiber:3,sugar:4,sodium:950},
 {id:'if-local-039',name:'Egg dosa',category:'South Indian',source:'FitFirst quick list',basis:'1 dosa (140 g)',grams:140,kcal:230,protein:11,carbs:28,fat:8,fiber:2,sugar:2,sodium:420},
 {id:'if-local-040',name:'Mutton curry',category:'Indian meal',source:'FitFirst quick list',basis:'1 cup (240 g)',grams:240,kcal:390,protein:28,carbs:8,fat:27,fiber:2,sugar:3,sodium:780},
 {id:'if-local-041',name:'Fish curry',category:'Indian meal',source:'FitFirst quick list',basis:'1 cup (240 g)',grams:240,kcal:260,protein:26,carbs:8,fat:14,fiber:2,sugar:3,sodium:700},
 {id:'if-local-042',name:'Vegetable pulao',category:'Indian meal',source:'FitFirst quick list',basis:'1 bowl (300 g)',grams:300,kcal:420,protein:9,carbs:66,fat:13,fiber:5,sugar:5,sodium:650},
 {id:'if-local-043',name:'Chicken biryani, restaurant',category:'Indian meal',source:'FitFirst quick list',basis:'1 plate (400 g)',grams:400,kcal:720,protein:38,carbs:85,fat:27,fiber:4,sugar:5,sodium:1300},
 {id:'if-local-044',name:'Coconut chutney',category:'South Indian',source:'FitFirst quick list',basis:'2 tbsp (40 g)',grams:40,kcal:110,protein:2,carbs:5,fat:10,fiber:2,sugar:2,sodium:220},
 {id:'if-local-045',name:'Tomato chutney',category:'South Indian',source:'FitFirst quick list',basis:'2 tbsp (40 g)',grams:40,kcal:45,protein:1,carbs:7,fat:2,fiber:1,sugar:3,sodium:240},
 {id:'if-local-046',name:'Chicken sandwich',category:'Fast food',source:'FitFirst quick list',basis:'1 sandwich (180 g)',grams:180,kcal:420,protein:28,carbs:42,fat:16,fiber:3,sugar:5,sodium:950},
 {id:'if-local-047',name:'Vegetable fried rice',category:'Indo-Chinese',source:'FitFirst quick list',basis:'1 bowl (300 g)',grams:300,kcal:480,protein:10,carbs:72,fat:16,fiber:5,sugar:6,sodium:1100},
 {id:'if-local-048',name:'Gobi manchurian',category:'Indo-Chinese',source:'FitFirst quick list',basis:'1 serving (200 g)',grams:200,kcal:340,protein:7,carbs:38,fat:17,fiber:5,sugar:10,sodium:1000},
 {id:'if-local-049',name:'Samosa',category:'Indian snack',source:'FitFirst quick list',basis:'1 medium (90 g)',grams:90,kcal:260,protein:5,carbs:32,fat:13,fiber:3,sugar:2,sodium:420},
 {id:'if-local-050',name:'Vada',aliases:'medu vada vadai',category:'South Indian',source:'FitFirst quick list',basis:'2 medu vada (100 g)',grams:100,kcal:290,protein:8,carbs:32,fat:15,fiber:5,sugar:2,sodium:480},
 {id:'if-local-030',name:'Lemon rice',category:'South Indian',source:'FitFirst quick list',basis:'1 bowl (250 g)',grams:250,kcal:380,protein:7,carbs:64,fat:12,fiber:3,sugar:2,sodium:550},
 {id:'if-local-101',name:'Maggi noodles, masala',category:'Instant noodles',source:'FitFirst quick list',basis:'1 pack cooked (70 g dry)',grams:220,kcal:313,protein:6.3,carbs:44,fat:12,aliases:'maggi maggie instant noodles'},
 {id:'if-local-102',name:'Egg maggi',category:'Instant noodles',source:'FitFirst quick list',basis:'1 pack + 1 egg',grams:280,kcal:440,protein:13,carbs:45,fat:22,aliases:'anda maggi egg noodles'},
 {id:'if-local-103',name:'Vegetable maggi',category:'Instant noodles',source:'FitFirst quick list',basis:'1 pack with veggies',grams:260,kcal:345,protein:7.5,carbs:50,fat:12.5,aliases:'veg maggi masala noodles'},
 {id:'if-local-104',name:'Cheese maggi',category:'Instant noodles',source:'FitFirst quick list',basis:'1 pack + 1 cheese slice',grams:240,kcal:380,protein:10,carbs:46,fat:17,aliases:'cheesy maggi noodles'},
 {id:'if-local-105',name:'Masala omelette (2 eggs)',category:'Eggs',source:'FitFirst quick list',basis:'1 omelette (130 g)',grams:130,kcal:210,protein:13,carbs:3,fat:16,aliases:'omelet egg omlette'},
 {id:'if-local-106',name:'Bread omelette',category:'Eggs',source:'FitFirst quick list',basis:'2 slices + 2-egg omelette',grams:190,kcal:360,protein:18,carbs:30,fat:18,aliases:'omelet bread egg sandwich'},
 {id:'if-local-107',name:'Egg bhurji',category:'Eggs',source:'FitFirst quick list',basis:'2 eggs (140 g)',grams:140,kcal:230,protein:13,carbs:4,fat:18,aliases:'anda bhurji scrambled egg podimas'},
 {id:'if-local-108',name:'Egg curry',category:'Eggs',source:'FitFirst quick list',basis:'1 cup with 2 eggs (250 g)',grams:250,kcal:300,protein:15,carbs:10,fat:22,aliases:'anda curry egg masala'},
 {id:'if-local-109',name:'Fried egg',category:'Eggs',source:'FitFirst quick list',basis:'1 egg (55 g)',grams:55,kcal:90,protein:6.3,carbs:0.4,fat:7,aliases:'half fry bullseye egg'},
 {id:'if-local-110',name:'Poha',category:'Breakfast',source:'FitFirst quick list',basis:'1 plate (200 g)',grams:200,kcal:270,protein:5,carbs:45,fat:8,aliases:'aval kanda poha avalakki'},
 {id:'if-local-111',name:'Rava dosa',category:'South Indian',source:'FitFirst quick list',basis:'1 dosa (120 g)',grams:120,kcal:230,protein:4,carbs:30,fat:10,aliases:'rava dosai'},
 {id:'if-local-112',name:'Onion uttapam',category:'South Indian',source:'FitFirst quick list',basis:'1 uttapam (180 g)',grams:180,kcal:280,protein:7,carbs:45,fat:8,aliases:'uthappam oothappam'},
 {id:'if-local-113',name:'Pesarattu',category:'South Indian',source:'FitFirst quick list',basis:'1 pesarattu (120 g)',grams:120,kcal:200,protein:9,carbs:28,fat:6,aliases:'moong dal dosa'},
 {id:'if-local-114',name:'Idiyappam',category:'South Indian',source:'FitFirst quick list',basis:'3 pieces (120 g)',grams:120,kcal:170,protein:3,carbs:38,fat:0.5,aliases:'string hoppers nool puttu sevai'},
 {id:'if-local-115',name:'Ragi mudde',category:'South Indian',source:'FitFirst quick list',basis:'1 ball (150 g)',grams:150,kcal:210,protein:5,carbs:45,fat:1,aliases:'ragi ball kali finger millet'},
 {id:'if-local-116',name:'Ragi dosa',category:'South Indian',source:'FitFirst quick list',basis:'1 dosa (100 g)',grams:100,kcal:180,protein:5,carbs:30,fat:5,aliases:'finger millet dosai'},
 {id:'if-local-117',name:'Bisi bele bath',category:'South Indian',source:'FitFirst quick list',basis:'1 bowl (250 g)',grams:250,kcal:340,protein:9,carbs:52,fat:10,aliases:'bisibelebath sambar rice'},
 {id:'if-local-118',name:'Sambar rice',category:'South Indian',source:'FitFirst quick list',basis:'1 bowl (250 g)',grams:250,kcal:300,protein:8,carbs:50,fat:7,aliases:'sambar sadam'},
 {id:'if-local-119',name:'Tamarind rice',category:'South Indian',source:'FitFirst quick list',basis:'1 bowl (250 g)',grams:250,kcal:390,protein:6,carbs:64,fat:12,aliases:'puliyogare puliyodarai pulihora'},
 {id:'if-local-120',name:'Tomato rice',category:'South Indian',source:'FitFirst quick list',basis:'1 bowl (250 g)',grams:250,kcal:360,protein:6,carbs:60,fat:10,aliases:'thakkali sadam'},
 {id:'if-local-121',name:'Jeera rice',category:'North Indian',source:'FitFirst quick list',basis:'1 cup (180 g)',grams:180,kcal:260,protein:5,carbs:46,fat:6,aliases:'cumin rice'},
 {id:'if-local-122',name:'Rajma chawal',category:'North Indian',source:'FitFirst quick list',basis:'1 plate (350 g)',grams:350,kcal:470,protein:16,carbs:80,fat:9,aliases:'rajma rice kidney beans'},
 {id:'if-local-123',name:'Rajma',category:'North Indian',source:'FitFirst quick list',basis:'1 cup (200 g)',grams:200,kcal:240,protein:12,carbs:34,fat:6,aliases:'kidney bean curry'},
 {id:'if-local-124',name:'Palak paneer',category:'North Indian',source:'FitFirst quick list',basis:'1 cup (220 g)',grams:220,kcal:300,protein:14,carbs:10,fat:23,aliases:'spinach paneer'},
 {id:'if-local-125',name:'Paneer butter masala',category:'North Indian',source:'FitFirst quick list',basis:'1 cup (220 g)',grams:220,kcal:420,protein:15,carbs:14,fat:34,aliases:'paneer makhani butter paneer'},
 {id:'if-local-126',name:'Kadai paneer',category:'North Indian',source:'FitFirst quick list',basis:'1 cup (220 g)',grams:220,kcal:340,protein:15,carbs:12,fat:26,aliases:'kadhai paneer'},
 {id:'if-local-127',name:'Butter chicken',category:'North Indian',source:'FitFirst quick list',basis:'1 cup (240 g)',grams:240,kcal:440,protein:30,carbs:12,fat:30,aliases:'murgh makhani chicken makhani'},
 {id:'if-local-128',name:'Chicken tikka',category:'North Indian',source:'FitFirst quick list',basis:'6 pieces (150 g)',grams:150,kcal:260,protein:36,carbs:4,fat:11,aliases:'tikka kebab'},
 {id:'if-local-129',name:'Dal makhani',category:'North Indian',source:'FitFirst quick list',basis:'1 cup (220 g)',grams:220,kcal:330,protein:12,carbs:30,fat:18,aliases:'daal makhani'},
 {id:'if-local-130',name:'Dal tadka',category:'Indian food',source:'FitFirst quick list',basis:'1 cup (200 g)',grams:200,kcal:210,protein:11,carbs:28,fat:6,aliases:'daal fry dal fry yellow dal'},
 {id:'if-local-131',name:'Aloo gobi',category:'North Indian',source:'FitFirst quick list',basis:'1 cup (180 g)',grams:180,kcal:170,protein:4,carbs:20,fat:9,aliases:'potato cauliflower sabzi'},
 {id:'if-local-132',name:'Bhindi fry',category:'Indian food',source:'FitFirst quick list',basis:'1 cup (150 g)',grams:150,kcal:160,protein:3,carbs:13,fat:11,aliases:'okra lady finger vendakkai'},
 {id:'if-local-133',name:'Mixed vegetable sabzi',category:'Indian food',source:'FitFirst quick list',basis:'1 cup (180 g)',grams:180,kcal:150,protein:4,carbs:16,fat:8,aliases:'veg curry poriyal thoran'},
 {id:'if-local-134',name:'Naan',category:'Indian bread',source:'FitFirst quick list',basis:'1 naan (90 g)',grams:90,kcal:260,protein:8,carbs:45,fat:5,aliases:'nan plain naan'},
 {id:'if-local-135',name:'Butter naan',category:'Indian bread',source:'FitFirst quick list',basis:'1 naan (100 g)',grams:100,kcal:310,protein:8,carbs:46,fat:10,aliases:'naan butter nan'},
 {id:'if-local-136',name:'Tandoori roti',category:'Indian bread',source:'FitFirst quick list',basis:'1 roti (60 g)',grams:60,kcal:160,protein:5,carbs:33,fat:1,aliases:'tandoor roti'},
 {id:'if-local-137',name:'Parotta',category:'Kerala',source:'FitFirst quick list',basis:'1 parotta (100 g)',grams:100,kcal:330,protein:6,carbs:45,fat:14,aliases:'porotta paratha kerala malabar'},
 {id:'if-local-138',name:'Kothu parotta',category:'South Indian',source:'FitFirst quick list',basis:'1 plate (300 g)',grams:300,kcal:620,protein:22,carbs:70,fat:28,aliases:'kothu porotta'},
 {id:'if-local-139',name:'Chicken fried rice',category:'Indo-Chinese',source:'FitFirst quick list',basis:'1 plate (300 g)',grams:300,kcal:560,protein:22,carbs:70,fat:20,aliases:'rice fried'},
 {id:'if-local-140',name:'Egg fried rice',category:'Indo-Chinese',source:'FitFirst quick list',basis:'1 plate (300 g)',grams:300,kcal:520,protein:16,carbs:72,fat:18,aliases:'rice fried'},
 {id:'if-local-141',name:'Veg hakka noodles',category:'Indo-Chinese',source:'FitFirst quick list',basis:'1 plate (300 g)',grams:300,kcal:470,protein:10,carbs:70,fat:16,aliases:'chowmein chow mein noodles'},
 {id:'if-local-142',name:'Chicken noodles',category:'Indo-Chinese',source:'FitFirst quick list',basis:'1 plate (300 g)',grams:300,kcal:520,protein:22,carbs:68,fat:18,aliases:'chowmein chicken hakka'},
 {id:'if-local-143',name:'Chilli chicken',category:'Indo-Chinese',source:'FitFirst quick list',basis:'1 serving (200 g)',grams:200,kcal:420,protein:30,carbs:18,fat:25,aliases:'chili chicken'},
 {id:'if-local-144',name:'Pav bhaji',category:'Street food',source:'FitFirst quick list',basis:'2 pav + bhaji (300 g)',grams:300,kcal:600,protein:14,carbs:80,fat:25,aliases:'pao bhaji'},
 {id:'if-local-145',name:'Vada pav',category:'Street food',source:'FitFirst quick list',basis:'1 vada pav (150 g)',grams:150,kcal:300,protein:7,carbs:42,fat:12,aliases:'wada pav'},
 {id:'if-local-146',name:'Pani puri',category:'Street food',source:'FitFirst quick list',basis:'6 pieces (120 g)',grams:120,kcal:210,protein:4,carbs:34,fat:7,aliases:'golgappa gol gappa puchka'},
 {id:'if-local-147',name:'Bhel puri',category:'Street food',source:'FitFirst quick list',basis:'1 plate (150 g)',grams:150,kcal:280,protein:6,carbs:40,fat:11,aliases:'bhelpuri'},
 {id:'if-local-148',name:'Pakora',category:'Indian snack',source:'FitFirst quick list',basis:'4 pieces (100 g)',grams:100,kcal:300,protein:6,carbs:28,fat:18,aliases:'bajji bhajji bhaji pakoda'},
 {id:'if-local-149',name:'Bonda',category:'Indian snack',source:'FitFirst quick list',basis:'2 pieces (100 g)',grams:100,kcal:290,protein:6,carbs:34,fat:14,aliases:'aloo bonda'},
 {id:'if-local-150',name:'Masala vada',category:'Indian snack',source:'FitFirst quick list',basis:'2 pieces (90 g)',grams:90,kcal:270,protein:10,carbs:26,fat:14,aliases:'paruppu vadai dal vada'},
 {id:'if-local-151',name:'Dhokla',category:'Indian snack',source:'FitFirst quick list',basis:'4 pieces (120 g)',grams:120,kcal:200,protein:7,carbs:30,fat:6,aliases:'khaman'},
 {id:'if-local-152',name:'Khichdi',category:'Indian food',source:'FitFirst quick list',basis:'1 bowl (250 g)',grams:250,kcal:300,protein:10,carbs:48,fat:8,aliases:'kichdi khichri'},
 {id:'if-local-153',name:'Curd',category:'Dairy',source:'FitFirst quick list',basis:'1 katori (150 g)',grams:150,kcal:90,protein:5,carbs:7,fat:5,aliases:'dahi yogurt yoghurt thayir'},
 {id:'if-local-154',name:'Raita',category:'Dairy',source:'FitFirst quick list',basis:'1 katori (150 g)',grams:150,kcal:90,protein:4,carbs:8,fat:4.5,aliases:'pachadi'},
 {id:'if-local-155',name:'Buttermilk',category:'Beverage',source:'FitFirst quick list',basis:'1 glass (250 ml)',grams:250,kcal:50,protein:3,carbs:5,fat:1.5,aliases:'chaas mor majjige'},
 {id:'if-local-156',name:'Sweet lassi',category:'Beverage',source:'FitFirst quick list',basis:'1 glass (250 ml)',grams:250,kcal:250,protein:8,carbs:38,fat:7,aliases:'lassi'},
 {id:'if-local-157',name:'Masala chai with sugar',category:'Beverage',source:'FitFirst quick list',basis:'1 cup (150 ml)',grams:150,kcal:90,protein:3,carbs:12,fat:3,aliases:'chai tea milk tea'},
 {id:'if-local-158',name:'Black coffee',category:'Beverage',source:'FitFirst quick list',basis:'1 cup (200 ml)',grams:200,kcal:4,protein:0.3,carbs:0,fat:0,aliases:'americano'},
 {id:'if-local-159',name:'Milk, toned',category:'Dairy',source:'FitFirst quick list',basis:'1 glass (250 ml)',grams:250,kcal:145,protein:8,carbs:12,fat:7.5,aliases:'milk doodh paal'},
 {id:'if-local-160',name:'Mango',category:'Fruit',source:'FitFirst quick list',basis:'1 medium (200 g edible)',grams:200,kcal:120,protein:1.6,carbs:30,fat:0.8,aliases:'aam'},
 {id:'if-local-161',name:'Papaya',category:'Fruit',source:'FitFirst quick list',basis:'1 cup (145 g)',grams:145,kcal:62,protein:0.7,carbs:16,fat:0.4,aliases:'papita'},
 {id:'if-local-162',name:'Guava',category:'Fruit',source:'FitFirst quick list',basis:'1 medium (100 g)',grams:100,kcal:68,protein:2.6,carbs:14,fat:1,aliases:'amrood koyya'},
 {id:'if-local-163',name:'Orange',category:'Fruit',source:'FitFirst quick list',basis:'1 medium (130 g)',grams:130,kcal:62,protein:1.2,carbs:15,fat:0.2,aliases:'santra'},
 {id:'if-local-164',name:'Grapes',category:'Fruit',source:'FitFirst quick list',basis:'1 cup (150 g)',grams:150,kcal:104,protein:1,carbs:27,fat:0.2,aliases:''},
 {id:'if-local-165',name:'Watermelon',category:'Fruit',source:'FitFirst quick list',basis:'1 cup (150 g)',grams:150,kcal:46,protein:0.9,carbs:11.5,fat:0.2,aliases:'tarbooz'},
 {id:'if-local-166',name:'Almonds',category:'Nuts',source:'FitFirst quick list',basis:'10 almonds (12 g)',grams:12,kcal:70,protein:2.5,carbs:2.5,fat:6,aliases:'badam'},
 {id:'if-local-167',name:'Peanuts, roasted',category:'Nuts',source:'FitFirst quick list',basis:'1 handful (30 g)',grams:30,kcal:170,protein:7.5,carbs:5,fat:15,aliases:'groundnut moongphali kadalai'},
 {id:'if-local-168',name:'White bread',category:'Bakery',source:'FitFirst quick list',basis:'1 slice (25 g)',grams:25,kcal:67,protein:2,carbs:12.5,fat:0.8,aliases:'bread slice'},
 {id:'if-local-169',name:'Brown bread',category:'Bakery',source:'FitFirst quick list',basis:'1 slice (28 g)',grams:28,kcal:70,protein:3,carbs:12,fat:1,aliases:'wheat bread'},
 {id:'if-local-170',name:'Bread with butter',category:'Bakery',source:'FitFirst quick list',basis:'2 slices + 10 g butter',grams:60,kcal:210,protein:4,carbs:25,fat:10,aliases:'toast bread butter'},
 {id:'if-local-171',name:'Marie biscuits',category:'Snack',source:'FitFirst quick list',basis:'4 biscuits (28 g)',grams:28,kcal:125,protein:2,carbs:21,fat:4,aliases:'biscuit cookies'},
 {id:'if-local-172',name:'Banana chips',category:'Snack',source:'FitFirst quick list',basis:'1 handful (30 g)',grams:30,kcal:160,protein:0.7,carbs:17,fat:10,aliases:'nendran chips'},
 {id:'if-local-173',name:'Murukku',category:'Snack',source:'FitFirst quick list',basis:'1 handful (30 g)',grams:30,kcal:160,protein:3,carbs:18,fat:9,aliases:'chakli'},
 {id:'if-local-174',name:'Gulab jamun',category:'Sweet',source:'FitFirst quick list',basis:'2 pieces (80 g)',grams:80,kcal:300,protein:4,carbs:44,fat:12,aliases:'gulab jamoon'},
 {id:'if-local-175',name:'Rasgulla',category:'Sweet',source:'FitFirst quick list',basis:'2 pieces (100 g)',grams:100,kcal:190,protein:4,carbs:40,fat:1.5,aliases:'rasagola'},
 {id:'if-local-176',name:'Jalebi',category:'Sweet',source:'FitFirst quick list',basis:'100 g',grams:100,kcal:380,protein:3,carbs:60,fat:15,aliases:'jilebi'},
 {id:'if-local-177',name:'Payasam',category:'Sweet',source:'FitFirst quick list',basis:'1 bowl (150 g)',grams:150,kcal:250,protein:6,carbs:38,fat:8,aliases:'kheer kheer payasam'},
 {id:'if-local-178',name:'Besan laddu',category:'Sweet',source:'FitFirst quick list',basis:'1 laddu (40 g)',grams:40,kcal:180,protein:4,carbs:20,fat:9,aliases:'ladoo laddoo'},
 {id:'if-local-179',name:'Mysore pak',category:'Sweet',source:'FitFirst quick list',basis:'1 piece (40 g)',grams:40,kcal:210,protein:2,carbs:18,fat:15,aliases:''},
 {id:'if-local-180',name:'Chicken shawarma roll',category:'Fast food',source:'FitFirst quick list',basis:'1 roll (250 g)',grams:250,kcal:500,protein:28,carbs:45,fat:22,aliases:'shawarma wrap'},
 {id:'if-local-181',name:'Pizza, cheese',category:'Fast food',source:'FitFirst quick list',basis:'1 medium slice (110 g)',grams:110,kcal:285,protein:12,carbs:36,fat:10,aliases:'margherita'},
 {id:'if-local-182',name:'French fries',category:'Fast food',source:'FitFirst quick list',basis:'1 medium (117 g)',grams:117,kcal:365,protein:4,carbs:48,fat:17,aliases:'chips fries'},
 {id:'if-local-183',name:'Grilled chicken breast',category:'Protein',source:'FitFirst quick list',basis:'100 g',grams:100,kcal:165,protein:31,carbs:0,fat:3.6,aliases:'chicken breast boiled'},
 {id:'if-local-184',name:'Fish fry',category:'Indian meal',source:'FitFirst quick list',basis:'1 piece (100 g)',grams:100,kcal:230,protein:20,carbs:6,fat:14,aliases:'meen varuval fried fish'},
 {id:'if-local-185',name:'Mutton biryani',category:'Indian meal',source:'FitFirst quick list',basis:'1 plate (350 g)',grams:350,kcal:680,protein:32,carbs:70,fat:30,aliases:'mutton biriyani'},
 {id:'if-local-186',name:'Veg biryani',category:'Indian meal',source:'FitFirst quick list',basis:'1 plate (300 g)',grams:300,kcal:450,protein:10,carbs:70,fat:14,aliases:'vegetable biriyani'},
 {id:'if-local-187',name:'Egg biryani',category:'Indian meal',source:'FitFirst quick list',basis:'1 plate (350 g)',grams:350,kcal:600,protein:22,carbs:75,fat:22,aliases:'biriyani egg'},
 {id:'if-local-188',name:'Sweet corn',category:'Snack',source:'FitFirst quick list',basis:'1 cup (150 g)',grams:150,kcal:130,protein:4.5,carbs:28,fat:1.8,aliases:'corn bhutta'},
 {id:'if-local-189',name:'Sprouts salad',category:'Salad',source:'FitFirst quick list',basis:'1 cup (100 g)',grams:100,kcal:100,protein:7,carbs:15,fat:1,aliases:'sprouts moong sprouts'},
 {id:'if-local-190',name:'Boiled chana',category:'Protein',source:'FitFirst quick list',basis:'1 cup (160 g)',grams:160,kcal:270,protein:14,carbs:45,fat:4,aliases:'chickpeas sundal kabuli'},
 {id:'if-local-191',name:'Tofu',category:'Protein',source:'FitFirst quick list',basis:'100 g',grams:100,kcal:145,protein:15,carbs:3,fat:8,aliases:'soya paneer'},
 {id:'if-local-192',name:'Ghee',category:'Fat',source:'FitFirst quick list',basis:'1 tsp (5 g)',grams:5,kcal:45,protein:0,carbs:0,fat:5,aliases:'clarified butter nei'},
 {id:'if-local-193',name:'Cooking oil',category:'Fat',source:'FitFirst quick list',basis:'1 tsp (5 g)',grams:5,kcal:45,protein:0,carbs:0,fat:5,aliases:'oil'},
 {id:'if-local-194',name:'Sugar',category:'Sweetener',source:'FitFirst quick list',basis:'1 tsp (4 g)',grams:4,kcal:16,protein:0,carbs:4,fat:0,aliases:''},
 {id:'if-local-195',name:'Kozhukattai',category:'South Indian',source:'FitFirst quick list',basis:'2 pieces (100 g)',grams:100,kcal:180,protein:3,carbs:36,fat:3,aliases:'modak kolukattai'}
];

const num=v=>{const n=Number(v);return Number.isFinite(n)?n:0};
const r1=n=>Math.round(n*10)/10;
function normalizeFood(f){return {id:String(f.id||Math.random()),name:String(f.name||'').trim(),source:f.source||'Food database',category:f.category||'Food',basis:f.basis||'per 100 g',grams:num(f.grams)||100,kcal:r1(num(f.kcal)),protein:r1(num(f.protein)),carbs:r1(num(f.carbs)),fat:r1(num(f.fat)),fiber:r1(num(f.fiber)),sugar:r1(num(f.sugar)),sodium:Math.round(num(f.sodium))};}

// token matching: every word typed must appear (handles "maggi egg", "maggie", "rava dosa")
const norm=s=>String(s||'').toLowerCase().replace(/ie\b/g,'i').replace(/[^a-z0-9 ]+/g,' ');
// common Indian spelling variants: typing any word in a group also matches the others
const VARIANTS=[['toor','tur','tuvar','tuver','arhar','pigeon pea','red gram'],['moong','mung','mug','green gram'],['urad','urd','black gram'],['masoor','masur','lentil'],
  ['chana','channa','chickpea','bengal gram'],['rajma','kidney bean'],['curd','dahi','yogurt','yoghurt'],['paneer','cottage cheese'],['roti','chapati','chapathi','phulka'],
  ['poha','aval','avalakki','flattened rice','rice flakes'],['murmura','mamra','puffed rice','rice puffed','pori'],['ragi','finger millet','nachni'],['bajra','pearl millet'],['jowar','sorghum'],
  ['sooji','suji','rava','semolina'],['maida','refined flour'],['atta','wheat flour'],['bhindi','okra','lady finger','ladies finger'],['baingan','brinjal','eggplant','aubergine'],
  ['aloo','potato'],['gobi','cauliflower'],['palak','spinach'],['methi','fenugreek'],['pyaz','onion'],['tamatar','tomato'],['matar','peas'],['anda','egg'],['murg','murgh','chicken'],
  ['gosht','mutton'],['machli','meen','fish'],['jhinga','prawn','shrimp'],['ghee','clarified butter'],['chai','tea'],['kaapi','coffee'],['biryani','biriyani'],['dosa','dosai'],['idli','idly'],['omelette','omelet','omlet']];
const VMAP=new Map();VARIANTS.forEach(g=>g.forEach(w=>VMAP.set(w,g)));
function matcher(q){
  let s=norm(q).replace(/\s+/g,' ').trim();
  // multi-word variants first (e.g. "red gram"), then single words
  const groups=[];for(const [w,g] of VMAP){if(w.includes(' ')&&(' '+s+' ').includes(' '+w+' ')){groups.push(g);s=(' '+s+' ').replace(' '+w+' ',' ').trim()}}
  s.split(' ').filter(Boolean).forEach(t=>groups.push(VMAP.has(t)?{typed:t,alts:VMAP.get(t)}:{typed:t,alts:[]}));
  // typed words match the start of a word ("biry" finds biryani); spelling variants must match whole words ("tur" ≠ turkish)
  return text=>{const h=' '+norm(text).replace(/\s+/g,' ')+' ';
    return groups.every(g=>Array.isArray(g)?g.some(t=>h.includes(' '+t+' ')):(h.includes(' '+g.typed)||g.alts.some(t=>h.includes(' '+t+' '))))};
}

function indbFood(x){
  const n=x.n,s=x.g?x.g/100:1;
  return normalizeFood({id:x.id,name:x.name,source:x.adj?`INDB (adjusted: ${x.adj})`:'INDB (Indian Nutrient Databank)',category:'Indian recipe',basis:x.g?`1 ${x.unit} (${x.g} g)`:'per 100 g',grams:x.g||100,
    kcal:n.kcal*s,protein:n.protein*s,carbs:n.carbs*s,fat:n.fat*s,fiber:n.fiber*s,sugar:n.sugar*s,sodium:n.sodium*s});
}

// "MAGGI MASALA NOODLES" -> "Maggi Masala Noodles"; drops junk like "- Maggi - Maggi"
function cleanName(raw){
  let n=String(raw||'').replace(/^[\s\-–•.]+/,'').replace(/\s+/g,' ').trim();
  const parts=n.split(/\s+-\s+/);if(parts.length>1&&new Set(parts.map(p=>p.toLowerCase())).size===1)n=parts[0];
  return n.replace(/\b([A-Z])([A-Z]+)\b/g,(m,a,b)=>a+b.toLowerCase());
}
// Open Food Facts: ask for products sold in India and worldwide in parallel; prefer India.
const NON_LATIN=/[^\u0000-ɏ‘-‟–—·]/;
function plausible(f){ // drop entries whose calories don't match their macros, or that are empty
  const calc=4*f.protein+4*f.carbs+9*f.fat;
  if(f.kcal<=0)return false;
  if(f.kcal<15&&!/zero|diet|water|tea|coffee|light|soda|sugar.?free|broth/i.test(f.name))return false; // e.g. a 4 kcal samosa
  if(calc===0)return f.kcal<=20;            // e.g. diet drinks
  return Math.abs(calc-f.kcal)/Math.max(calc,f.kcal)<=0.3||Math.abs(calc-f.kcal)<=25;
}
async function offQuery(q,india){
  const u=new URL('https://search.openfoodfacts.org/search');
  u.searchParams.set('q',india?`${q} countries_tags:"en:india"`:q);u.searchParams.set('page_size',india?'40':'30');u.searchParams.set('langs','en');
  u.searchParams.set('fields','code,product_name,brands,nutriments,countries_tags');
  const r=await fetch(u,{headers:{'User-Agent':UA},signal:AbortSignal.timeout(4500)});
  if(!r.ok)throw new Error('OFF '+r.status);
  return (await r.json()).hits||[];
}
const RAW_GROUPS=/Milk|Sugars|Nuts|Condiments|Miscellaneous/;
function ifctFood(x){
  const n=x.n;
  return normalizeFood({id:x.id,name:x.name,source:'IFCT 2017 (ICMR-NIN)',category:x.group,basis:RAW_GROUPS.test(x.group)?'per 100 g':'per 100 g (raw)',grams:100,
    kcal:n.kcal,protein:n.protein,carbs:n.carbs,fat:n.fat,fiber:n.fiber,sugar:n.sugar,sodium:n.sodium});
}

async function openFoodFacts(q){
  const m=matcher(q);
  const [ind,world]=await Promise.allSettled([offQuery(q,true),offQuery(q,false)]);
  const toFood=h=>{
    const n=h.nutriments||{},brand=String(Array.isArray(h.brands)?h.brands[0]||'':String(h.brands||'').split(',')[0]).trim();
    const name=cleanName(h.product_name);
    if(!name||name.length<3||NON_LATIN.test(name)||!num(n['energy-kcal_100g']))return null;
    if(!m(name+' '+brand))return null;      // must actually contain what the user typed
    const f=normalizeFood({id:'off-'+h.code,name:brand&&!name.toLowerCase().includes(brand.toLowerCase())?`${name} (${brand})`:name,
      source:'Open Food Facts',category:'Packaged food',basis:'per 100 g',grams:100,kcal:n['energy-kcal_100g'],protein:n.proteins_100g,carbs:n.carbohydrates_100g,fat:n.fat_100g,fiber:n.fiber_100g,sugar:n.sugars_100g,sodium:num(n.sodium_100g)*1000});
    f._vague=name.trim().split(/\s+/).length<2; // e.g. just "Maggi"
    return plausible(f)?f:null;
  };
  const seen=new Set(),uniq=list=>list.map(toFood).filter(f=>{if(!f)return false;const k=f.name.toLowerCase();if(seen.has(k))return false;seen.add(k);return true});
  const indiaFoods=ind.status==='fulfilled'?uniq(ind.value):[];
  const worldFoods=world.status==='fulfilled'?uniq(world.value):[];
  if(ind.status==='rejected'&&world.status==='rejected')throw ind.reason;
  return (indiaFoods.length>=3?indiaFoods:[...indiaFoods,...worldFoods]).slice(0,8);
}

async function usda(q){
  const m=matcher(q);
  const u=new URL('https://api.nal.usda.gov/fdc/v1/foods/search');
  u.searchParams.set('query',q);u.searchParams.set('api_key',process.env.USDA_API_KEY||'DEMO_KEY');u.searchParams.set('pageSize','10');u.searchParams.set('dataType','Foundation,SR Legacy,FNDDS');
  const r=await fetch(u,{signal:AbortSignal.timeout(5000)});if(!r.ok)throw new Error('USDA '+r.status);
  const d=await r.json();
  return (d.foods||[]).map(f=>{const N=f.foodNutrients||[];const get=names=>{const n=N.find(n=>names.includes(n.nutrientName));return n?.value||0};
    const energy=()=>{const k=N.find(n=>/^Energy/.test(n.nutrientName||'')&&String(n.unitName).toUpperCase()==='KCAL');if(k)return k.value;const j=N.find(n=>/^Energy/.test(n.nutrientName||'')&&String(n.unitName).toUpperCase()==='KJ');return j?j.value/4.184:0};
    const name=String(f.description||'').toLowerCase().replace(/^./,c=>c.toUpperCase());
    return normalizeFood({id:'usda-'+f.fdcId,name,source:'USDA FoodData Central',category:f.dataType||'USDA',basis:'per 100 g',grams:100,kcal:energy(),protein:get(['Protein']),carbs:get(['Carbohydrate, by difference','Carbohydrates']),fat:get(['Total lipid (fat)']),fiber:get(['Fiber, total dietary']),sugar:get(['Sugars, Total','Total Sugars']),sodium:get(['Sodium, Na','Sodium'])});
  }).filter(f=>f.kcal>0&&m(f.name));
}

async function supabase(q){
  if(!(process.env.SUPABASE_URL&&process.env.SUPABASE_SERVICE_ROLE_KEY))return [];
  const e=new URL('/rest/v1/foods',process.env.SUPABASE_URL);
  e.searchParams.set('select','id,name,source,category,basis,basis_grams,kcal,protein_g,carbs_g,fat_g,fiber_g,sugar_g,sodium_mg');
  e.searchParams.set('name','ilike.*'+q.replace(/[(),*]/g,'')+'*');e.searchParams.set('limit','15');
  const r=await fetch(e,{headers:{apikey:process.env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+process.env.SUPABASE_SERVICE_ROLE_KEY},signal:AbortSignal.timeout(5000)});
  if(!r.ok)throw new Error('Supabase '+r.status);
  return (await r.json()).map(x=>normalizeFood({id:x.id,name:x.name,source:x.source,category:x.category,basis:x.basis||'per 100 g',grams:x.basis_grams||100,kcal:x.kcal,protein:x.protein_g,carbs:x.carbs_g,fat:x.fat_g,fiber:x.fiber_g,sugar:x.sugar_g,sodium:x.sodium_mg}));
}

module.exports=async(req,res)=>{
  const q=String(req.query.q||'').trim().slice(0,80);
  res.setHeader('Cache-Control','public, max-age=0, s-maxage=86400, stale-while-revalidate=604800');
  if(!q)return res.status(200).json({foods:CURATED.map(normalizeFood),providers:['FitFirst quick list']});
  const m=matcher(q);
  const quick=CURATED.filter(f=>m(f.name+' '+(f.aliases||'')+' '+f.category)).map(f=>({...normalizeFood(f),aliases:f.aliases||''}));
  const indb=INDB.filter(x=>m(x.name)).map(indbFood);
  const ifct=IFCT.filter(x=>m(x.name+' '+(x.local||''))).map(x=>({...ifctFood(x),aliases:x.local||''})).slice(0,12);
  const katori=KATORI.filter(f=>m(String(f.name||'')+' '+String(f.category||''))).map(normalizeFood);
  const [sb,off,us]=await Promise.allSettled([supabase(q),openFoodFacts(q),usda(q)]);
  for(const [n,r] of [['Supabase',sb],['Open Food Facts',off],['USDA',us]])if(r.status==='rejected')console.error(n,'search failed:',r.reason?.message);
  const val=r=>r.status==='fulfilled'?r.value:[];
  const groups=[['Your Supabase foods',val(sb)],['Katori dataset (CC BY 4.0)',katori],['INDB — Indian Nutrient Databank',indb],['IFCT 2017 — Indian Food Composition Tables',ifct],['FitFirst quick list',quick],['USDA FoodData Central',val(us)],['Open Food Facts (ODbL)',val(off)]];
  // rank by how well the name matches, keep source order as tie-breaker, cap list
  // rank: 0 exact name, 1 starts with / contains the words, 2 partial; push vague or ingredient-type packaged items down
  const ql=norm(q).trim(),INGREDIENT=/\b(batter|mix|paste|powder|sauce|podi|premix|concentrate|seasoning|marinade)\b/;
  const rank=f=>{const n=norm(f.name).replace(/\s+/g,' ').trim(),words=' '+n+' ';
    const primary=norm(f.aliases||'').trim().split(' ')[0];   // first alias = the everyday name, e.g. "rice" for Cooked white rice
    let r=(n===ql||(primary&&primary===ql))?0:(n.startsWith(ql)||words.includes(' '+ql+' ')||(f.aliases&&(' '+norm(f.aliases)+' ').includes(' '+ql+' ')))?1:2;
    if(f._vague)r+=2;if(INGREDIENT.test(n)&&!INGREDIENT.test(ql))r+=2;return r};
  // within a tier prefer concise names ("Plain dosa" before "Masala dosa paneer fillings")
  const qw=new Set(ql.split(' ')),extra=f=>Math.min(5,norm(f.name).split(/\s+/).filter(w=>w&&!qw.has(w)).length);
  const all=[],ids=new Set();groups.forEach(([,list],gi)=>list.forEach((f,i)=>{if(f.name&&!ids.has(f.id)){ids.add(f.id);all.push({f,k:rank(f)*10000+extra(f)*1000+gi*100+Math.min(i,99)})}}));
  const foods=all.sort((a,b)=>a.k-b.k).slice(0,50).map(({f})=>{const {_vague,aliases,...rest}=f;return rest});
  res.status(200).json({foods,providers:groups.filter(([,l])=>l.length).map(([n])=>n)});
};
